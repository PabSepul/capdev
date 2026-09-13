(() => {
  "use strict";
  const state = globalThis.LearningState;
  const cfg = globalThis.AccountConfig;
  const ACTIVE = "capsulasdev.active-user";
  const accountPage = Boolean(document.querySelector("#account-panel"));
  const privacyContact=document.querySelector("#privacy-contact");
  if(privacyContact && cfg?.privacyContact) privacyContact.textContent=cfg.privacyContact;
  if (!cfg?.supabaseUrl || !cfg.publishableKey) {
    if (accountPage) {
      document.querySelectorAll("[data-account-status]").forEach(el => { el.textContent="Las cuentas no están disponibles. Necesitas un perfil para guardar tu avance."; });
      const send=document.querySelector("#account-send"); if (send) send.disabled=true;
    }
    return;
  }
  const uuid = () => crypto.randomUUID();
  const original = Object.fromEntries(["save","removeDraft","completar","aprobarExamen","registrarIntento","seleccionarItinerario","registrarFeedback"].map(k => [k,state[k].bind(state)]));
  let owner = state.cuenta(), queue = null, client = null, snapshot = null, busy = false, timer = null;
  let ready = false, epoch = 0, message = "Crea tu perfil para sincronizar el avance automáticamente.", subscribed = false, loggingOut = false;
  let bases = {}, syncing = false;
  let knownProfile = false, initializing = null;
  const key = suffix => "capsulasdev.user." + owner + "." + suffix;
  const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } };
  const set = (k, v) => { try { localStorage.setItem(k,JSON.stringify(v)); return true; } catch { return false; } };
  const selected = () => { try { return localStorage.getItem(ACTIVE); } catch { return null; } };
  const validScope = () => selected() === owner;
  function say(text) {
    message = text;
    document.querySelectorAll("[data-account-status]").forEach(el => { el.textContent=text; });
  }
  function changed() {
    if (!queue) return;
    const count = queue.entries().length;
    say(!queue.durable() ? "No pude conservar temporalmente los cambios pendientes. Revisa tu conexión antes de cerrar."
      : count ? ready && navigator.onLine !== false ? "Guardando tus cambios automáticamente…"
        : "Cambios guardados en este dispositivo, pendientes de verificar la conexión y sincronizar." : message);
    clearTimeout(timer);
    if (ready && count && !syncing) timer=setTimeout(() => sync(),1200);
  }
  function bindQueue() {
    bases = owner ? read(key("draft-bases"),{}) : {};
    // Solo habilita la copia local. El servidor sigue exigiendo sesión y perfil.
    knownProfile = Boolean(owner && read(key("profile-confirmed"),false));
    queue = owner ? LearningSync.create({storage:localStorage,uuid,owner,onChange:changed}) : null;
  }
  function confirmProfile() {
    knownProfile=true;
    set(key("profile-confirmed"),true);
  }
  bindQueue();
  function enqueue(op) { if (queue && validScope()) queue.enqueue(op); }
  function guard(fn) {
    return (...args) => {
      if (!validScope()) { location.reload(); return; }
      return fn(...args);
    };
  }
  function requireProfile() {
    if (owner && (ready || knownProfile) && !loggingOut && validScope()) return true;
    say("Crea tu perfil o entra para guardar el avance automáticamente.");
    return false;
  }
  state.save = guard((r,m,code) => {
    if (!requireProfile()) return;
    const before=state.session(r).drafts[m]; original.save(r,m,code);
    if (state.session(r).drafts[m] !== before && typeof code === "string")
      enqueue({kind:"draft",route:r,module:m,code,base:bases[r+":"+m] || null});
  });
  state.removeDraft = guard((r,m) => {
    if (!requireProfile()) return;
    original.removeDraft(r,m); enqueue({kind:"draft",route:r,module:m,code:null,base:bases[r+":"+m] || null});
  });
  state.completar = guard((r,m) => {
    if (!requireProfile()) return;
    const before=state.completados(r); original.completar(r,m);
    if (!before.includes(m) && state.completados(r).includes(m))
      enqueue({kind:"complete",route:r,module:m-(state.routes.find(x=>x.id===r)?.offset || 0)});
  });
  state.aprobarExamen = guard((r,m) => {
    if (!requireProfile()) return;
    const before=state.examenes(r); original.aprobarExamen(r,m);
    if (!before.includes(m) && state.examenes(r).includes(m)) enqueue({kind:"exam",route:r,module:m-1});
  });
  state.registrarIntento = guard((r,m,result) => {
    if (!requireProfile()) return;
    original.registrarIntento(r,m,result);
    const route=state.routes.find(x=>x.id===r);
    if (!route || !Number.isInteger(m) || m<0 || m>=route.count) return;
    const event=state.bitacora().eventos.at(-1);
    enqueue({kind:"attempt",route:r,module:m,v:event.v,ok:event.ok,error:event.e,ms:event.ms});
  });
  state.seleccionarItinerario = guard((id) => {
    const before=state.itinerario();
    const saved=original.seleccionarItinerario(id);
    if (saved && before!==id && queue && validScope()) enqueue({kind:"preference",itinerary:id});
    return saved;
  });
  state.registrarFeedback = guard((r,m,value,area=null) => {
    const saved=original.registrarFeedback(r,m,value,area);
    if (saved && queue && validScope()) enqueue({kind:"feedback",route:r,module:m,value,area});
    return saved;
  });
  function apply(snapshotData) {
    snapshot=snapshotData;
    state.combinarRemoto(snapshot.routes,snapshot.profile);
    const pending=queue.entries().map(x=>x.op);
    for (const d of snapshot.drafts) {
      const slot=d.route+":"+d.module;
      if (pending.some(op=>op.kind==="draft" && op.route===d.route && op.module===d.module)) continue;
      const code=state.session(d.route).drafts[d.module] ?? null;
      if (accountPage) {
        if (d.code === null) original.removeDraft(d.route,d.module); else original.save(d.route,d.module,d.code);
        bases[slot]=d.version;
      } else if (code===d.code) bases[slot]=d.version;
    }
    set(key("draft-bases"),bases);
    if (accountPage) render();
    window.dispatchEvent(new Event("pageshow"));
  }
  async function sync() {
    if (!client || !owner || !ready || busy || !validScope()) return;
    busy=true; syncing=true;
    const startedOwner=owner, startedEpoch=epoch;
    try {
      const {data:{session},error}=await client.auth.getSession();
      if (error || !session || session.user.id!==startedOwner) {
        if (startedEpoch===epoch && validScope()) ready=false;
        throw Error("Inicia sesión de nuevo para sincronizar.");
      }
      // Token capturado: un cambio de cuenta no puede enviar la cola anterior con la identidad nueva.
      const transport=supabase.createClient(cfg.supabaseUrl,cfg.publishableKey,{
        global:{headers:{Authorization:"Bearer " + session.access_token}},
        auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
      });
      const sent=queue.entries().slice(0,100);
      if (startedEpoch!==epoch || !validScope()) return;
      const response=await transport.rpc("learning_sync",{p_operations:sent.map(x=>x.op)});
      if (startedEpoch!==epoch || owner!==startedOwner || !validScope()) return;
      if (response.error) throw Error(response.error.message);
      queue.acknowledge(sent,response.data.accepted);
      apply(response.data);
      const count=queue.entries().length;
      say(!queue.durable() ? "No pude conservar temporalmente los cambios pendientes. Revisa tu conexión antes de cerrar."
        : count ? "Guardando tus cambios automáticamente…" : "Avance guardado automáticamente en tu perfil.");
    } catch (error) {
      if (startedEpoch===epoch) say("No pude guardar los últimos cambios en tu perfil. " + (navigator.onLine===false ? "Estás sin conexión." : error.message));
    } finally {
      busy=false; syncing=false;
      if (queue?.entries().length && ready && validScope()) timer=setTimeout(()=>sync(),15000);
    }
  }
  function control(selector) { return document.querySelector(selector); }
  function reviewHref(href) {
    if (!document.documentElement.dataset.review) return href;
    const url=new URL(href,location.href); url.searchParams.set("revision",document.documentElement.dataset.review); return url.href;
  }
  function renderLearningDashboard() {
    const summary=state.resumen();
    control("#account-summary").textContent=summary.modulos + " ejercicios y " + summary.examenes + " exámenes completados.";
    const paths=globalThis.LearningExperience?.paths || [];
    const path=paths.find(item=>item.id===state.itinerario());
    const goal=control("#account-goal"), title=control("#account-goal-title"), copy=control("#account-goal-copy");
    const meter=control("#account-goal-progress"), meterFill=meter.querySelector("span"), meterCopy=control("#account-goal-progress-copy");
    const nextLink=control("#account-next-step"), itinerary=control("#account-itinerary"), steps=control("#account-itinerary-steps");
    const routeList=control("#account-routes"), emptyRoutes=control("#account-empty-routes");
    routeList.replaceChildren(); steps.replaceChildren();
    if (!path) {
      title.textContent="Elige una meta para ordenar tus rutas";
      copy.textContent="Te mostraremos qué estudiar ahora y cómo se conecta con lo que viene después.";
      meter.hidden=true; meterCopy.hidden=true; itinerary.hidden=true;
      nextLink.href=reviewHref("index.html#itinerarios"); nextLink.textContent="Elegir un itinerario →";
    } else {
      const progress=path.routes.map(id=>state.progress(id));
      const completed=progress.reduce((sum,item)=>sum+item.completed,0);
      const total=progress.reduce((sum,item)=>sum+item.count,0);
      const percent=total ? Math.round(completed/total*100) : 0;
      const nextIndex=progress.findIndex(item=>!item.done);
      const next=nextIndex<0 ? null : progress[nextIndex];
      meter.hidden=false; meterCopy.hidden=false; itinerary.hidden=false;
      meter.setAttribute("aria-valuenow",String(percent)); meterFill.style.width=percent+"%";
      meterCopy.textContent=completed+" de "+total+" ejercicios · "+percent+"% del itinerario";
      control("#account-itinerary-title").textContent=path.name;
      if (next) {
        const pendingLevel=Math.floor(next.completed/4);
        const pendingExam=next.completed>0 && next.completed%4===0 && next.exams<pendingLevel;
        title.textContent=pendingExam ? "Cierra el nivel con su mini examen" : (next.started ? "Continúa con "+next.name : "Empieza con "+next.name);
        copy.textContent=pendingExam ? "Ya completaste los ejercicios del nivel "+pendingLevel+" de "+next.name+". Comprueba lo aprendido para abrir el siguiente." : "Tu próximo ejercicio es el "+(next.active+1)+" de "+next.count+" en "+next.name+".";
        nextLink.href=reviewHref(next.href); nextLink.textContent=pendingExam ? "Ir al mini examen →" : "Continuar aprendiendo →";
      } else {
        title.textContent="Completaste tu itinerario";
        copy.textContent="Terminaste todas sus rutas y mini exámenes. Puedes repetir una ruta o elegir una meta diferente.";
        nextLink.href=reviewHref("index.html#itinerarios"); nextLink.textContent="Elegir otra meta →";
      }
      progress.forEach((route,index)=>{
        const item=document.createElement("li"), link=document.createElement("a"), marker=document.createElement("span"), detail=document.createElement("span");
        const current=index===(nextIndex<0 ? progress.length-1 : nextIndex);
        item.className=route.done ? "is-done" : current ? "is-current" : "is-upcoming";
        marker.className="account-step-marker"; marker.textContent=route.done ? "✓" : String(index+1).padStart(2,"0");
        link.href=reviewHref(route.href); link.textContent=route.name;
        detail.className="account-step-detail"; detail.textContent=route.done ? "Completada" : current ? (route.started ? route.completed+" de "+route.count : "Siguiente ruta") : "Más adelante";
        item.append(marker,link,detail); steps.append(item);
      });
    }
    const pathRoutes=new Set(path?.routes || []);
    for (const route of state.routes) {
      const progress=state.progress(route.id);
      if ((!progress.started && !progress.completed) || pathRoutes.has(route.id)) continue;
      const item=document.createElement("li"), link=document.createElement("a"), bar=document.createElement("span"), fill=document.createElement("span"), value=document.createElement("span");
      link.href=reviewHref(progress.href); link.textContent=route.name;
      bar.className="account-route-progress"; fill.style.width=progress.percent+"%"; bar.append(fill);
      value.className="account-route-value"; value.textContent=progress.completed+"/"+route.count;
      item.append(link,bar,value); routeList.append(item);
    }
    emptyRoutes.hidden=routeList.children.length>0;
    goal.dataset.itinerary=path?.id || "none";
  }
  function render() {
    if (!accountPage) return;
    control("#account-login").hidden=Boolean(owner && ready);
    control("#account-data").hidden=!(owner && ready);
    if (!snapshot) return;
    control("#account-alias").value=snapshot.profile.alias;
    renderLearningDashboard();
    const conflicts=control("#account-conflicts"); conflicts.replaceChildren();
    for (const conflict of snapshot.conflicts) {
      const item=document.createElement("li"), title=document.createElement("p"), code=document.createElement("pre"), button=document.createElement("button");
      title.textContent=conflict.route + " · ejercicio " + (conflict.module+1) + " · versión de otro intento de guardado";
      code.textContent=conflict.code ?? "Borrador eliminado";
      button.textContent="Usar esta versión"; button.type="button";
      button.addEventListener("click",()=>{
        const head=snapshot.drafts.find(d=>d.route===conflict.route && d.module===conflict.module);
        enqueue({kind:"draft",route:conflict.route,module:conflict.module,code:conflict.code,base:head?.version||null,resolve:conflict.version}); sync();
      });
      item.append(title,code,button); conflicts.append(item);
    }
    control("#account-conflict-section").hidden=snapshot.conflicts.length===0;
  }
  function clearAccount(id) {
    const keys=[]; for(let i=0;i<localStorage.length;i++) { const k=localStorage.key(i); if(k.startsWith("capsulasdev.user."+id+".")) keys.push(k); }
    keys.forEach(k=>localStorage.removeItem(k));
  }
  function initialize() {
    if (!initializing) initializing=initializeOnce().finally(()=>{initializing=null;});
    return initializing;
  }
  async function initializeOnce() {
    if (loggingOut || !validScope()) return;
    if (!cfg?.supabaseUrl || !cfg.publishableKey) {
      say("Las cuentas no están disponibles. Necesitas un perfil para guardar tu avance.");
      control("#account-send")?.setAttribute("disabled",""); return;
    }
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cfg.supabaseUrl) || !cfg.publishableKey.startsWith("sb_publishable_")) {
      say("La configuración de cuentas no es válida."); return;
    }
    if (!client) client=supabase.createClient(cfg.supabaseUrl,cfg.publishableKey);
    if (!subscribed) client.auth.onAuthStateChange((event,session)=>{
      if (event==="SIGNED_OUT" || (event==="SIGNED_IN" && owner && session?.user.id!==owner)) {
        epoch++; ready=false; knownProfile=false;
        if (event==="SIGNED_OUT") localStorage.removeItem(ACTIVE);
        // Si venció la sesión, conserva la cola segregada para el próximo acceso.
        if (!loggingOut) location.reload();
      }
    });
    subscribed=true;
    const startedEpoch=epoch;
    const {data:{user},error}=await client.auth.getUser();
    if (startedEpoch!==epoch || !validScope()) return;
    if (error || !user) {
      say(owner && knownProfile ? "No pude verificar tu sesión. Los nuevos cambios se conservarán en este dispositivo hasta reconectar o volver a entrar."
        : owner ? "Tu sesión debe verificarse. Abre Mi cuenta para volver a entrar." : "Crea tu perfil o entra para guardar y sincronizar tu avance automáticamente."); return;
    }
    if (owner!==user.id) {
      localStorage.setItem(ACTIVE,user.id);
      if (!accountPage) { location.href="cuenta.html"; return; }
      owner=user.id; epoch++; state.usarCuenta(owner); bindQueue();
    }
    const profileOwner=owner, profileEpoch=epoch;
    const profile=await client.from("learning_profiles").select("alias").eq("user_id",profileOwner).maybeSingle();
    if (profileOwner!==owner || profileEpoch!==epoch || !validScope()) return;
    if (profile.error) { say("No pude cargar el perfil. " + profile.error.message); return; }
    if (!profile.data) {
      knownProfile=false; set(key("profile-confirmed"),false);
      if (!accountPage) { location.href="cuenta.html"; return; }
      control("#account-enroll").hidden=false;
      control("#account-login").hidden=true;
      say("Confirma tu mayoría de edad y el aviso de privacidad para activar el perfil."); return;
    }
    confirmProfile(); ready=true; render(); await sync();
  }
  if (accountPage) {
    control("#account-send").addEventListener("click",async()=>{
      if (!client) return;
      const email=control("#account-email"); if (!email.reportValidity()) return;
      control("#account-send").disabled=true;
      const {error}=await client.auth.signInWithOtp({email:email.value.trim(),options:{shouldCreateUser:Boolean(cfg.registrationEnabled && cfg.privacyContact)}});
      control("#account-send").disabled=false;
      say(error ? "No pude enviar el código. " + error.message : "Revisa tu correo e ingresa el código. Si no llega, revisa la carpeta de spam.");
      control("#account-verify-area").hidden=Boolean(error);
    });
    control("#account-verify").addEventListener("click",async()=>{
      const {error}=await client.auth.verifyOtp({email:control("#account-email").value.trim(),token:control("#account-code").value.trim(),type:"email"});
      if(error) say("El código no es válido o venció. Solicita uno nuevo."); else await initialize();
    });
    control("#account-enroll-submit").addEventListener("click",async()=>{
      if (!control("#account-adult").checked || !control("#account-privacy").checked) { say("Confirma ambas casillas para activar tu perfil."); return; }
      const {error}=await client.rpc("learning_enroll",{p_alias:control("#account-new-alias").value,p_adult:true,p_privacy:cfg.privacyVersion});
      if(error) {say(error.message);return;}
      confirmProfile();control("#account-enroll").hidden=true;ready=true;render();await sync();
    });
    control("#account-save-alias").addEventListener("click",async()=>{
      const {error}=await client.rpc("learning_enroll",{p_alias:control("#account-alias").value,p_adult:true,p_privacy:cfg.privacyVersion});
      if(error) say(error.message);else await sync();
    });
    control("#account-export").addEventListener("click",async()=>{
      const {data,error}=await client.rpc("learning_export");
      if(error) {say("No pude descargar los datos de la cuenta. "+error.message);return;}
      const text=JSON.stringify({...data,pending:queue.entries().map(x=>x.op)},null,2);
      const a=document.createElement("a"),url=URL.createObjectURL(new Blob([text],{type:"application/json"}));
      a.href=url;a.download="capsulasdev-cuenta-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
    control("#account-logout").addEventListener("click",async()=>{
      if(queue.entries().length && !confirm("Hay cambios pendientes. Cerrar sesión eliminará los cambios que aún no pudieron guardarse en tu perfil. Cancela para mantener la sesión abierta.")) return;
      epoch++;ready=false;loggingOut=true;const previous=owner;
      const {error}=await client.auth.signOut({scope:"local"});
      if(error) {loggingOut=false;ready=true;say(error.message);return;}
      clearAccount(previous);localStorage.removeItem(ACTIVE);location.reload();
    });
    control("#account-delete").addEventListener("click",async()=>{
      if(control("#account-delete-confirm").value!=="ELIMINAR MI CUENTA") {say("Escribe ELIMINAR MI CUENTA para confirmar.");return;}
      if(!confirm("Se eliminarán permanentemente tu cuenta, progreso y borradores guardados en la plataforma. ¿Eliminar?"))return;
      const {error}=await client.functions.invoke("delete-account",{body:{confirmation:"ELIMINAR MI CUENTA"}});
      if(error) {say("No pude eliminar la cuenta. "+error.message);return;}
      clearAccount(owner);localStorage.removeItem(ACTIVE);await client.auth.signOut({scope:"local"});location.reload();
    });
  }
  function reconnect() {
    if (loggingOut || !validScope()) return;
    const startedEpoch=epoch;
    const work = ready ? sync() : initialize();
    work.catch(()=>{
      if (startedEpoch!==epoch || loggingOut || !validScope()) return;
      say(knownProfile ? "No pude conectar las cuentas. Los cambios siguen en este dispositivo, pendientes de sincronizar."
        : "No pude conectar las cuentas. Inicia sesión de nuevo para guardar tu avance.");
    });
  }
  window.addEventListener("online",reconnect);
  window.addEventListener("storage",event=>{if(event.key===ACTIVE && !validScope()) {epoch++;ready=false;location.reload();}});
  window.addEventListener("focus",reconnect);
  setInterval(()=>{if(owner) reconnect();},30000);
  reconnect();
})();

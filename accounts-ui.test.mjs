import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
const require=createRequire(import.meta.url);
const {JSDOM}=require(path.join(process.env.CONTENT_QA_MODULES || path.join(os.tmpdir(),'capsulasdev-content-qa','node_modules'),'jsdom'));
const read=f=>fs.readFileSync(new URL(f,import.meta.url),'utf8');
const user=randomUUID();
const w=new JSDOM(read('cuenta.html'),{url:'https://capsulasdev.com/cuenta.html',runScripts:'outside-only'}).window;
w.localStorage.setItem('capsulasdev.active-user',user);
  w.eval(read('learning-state.js'));w.eval(read('learning-sync.js'));w.eval(read('learning-experience.js'));
w.AccountConfig={supabaseUrl:'https://example.supabase.co',publishableKey:'sb_publishable_test',registrationEnabled:false,privacyVersion:'2026-09-07'};
let online=true, requests=[], savedRoutes={}, holds=null;
const auth={
  onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}};},
  async getUser(){return {data:{user:{id:user}},error:null};},
  async getSession(){return {data:{session:{user:{id:user},access_token:'test-token-A'}},error:null};}
};
w.supabase={createClient(url,key,options){
  if(!options)return {auth,from(){return {select(){return {eq(){return {async maybeSingle(){return {data:{alias:'Ada'},error:null};}}}}}};}};
  return {async rpc(name,{p_operations}){
    requests.push({token:options.global.headers.Authorization,ops:structuredClone(p_operations)});
    if(holds)await holds;
    if(!online)return {error:{message:'conexión interrumpida'}};
    for(const op of p_operations){if(op.kind==='complete')savedRoutes[op.route]={completados:[op.module+(op.route==='python'?1:0)],examenes:[],intentos:{}};}
    return {data:{accepted:p_operations.map(x=>x.id),routes:savedRoutes,drafts:[],conflicts:[],profile:{alias:'Ada'}},error:null};
  }};
}};
// La cola agrupa cambios durante 1,2 s; se deja margen para runners compartidos.
const eventually=async predicate=>{for(let i=0;i<300;i++){if(predicate())return;await new Promise(resolve=>setTimeout(resolve,10));}assert.fail('No se completó el flujo asíncrono');};
w.eval(read('account.js'));
w.eval(read('learning-plan.js'));
await eventually(()=>w.document.querySelector('[data-account-status]').textContent.startsWith('Avance guardado automáticamente'));
assert.equal(w.document.querySelector('#account-data').hidden,false);
assert.match(w.document.querySelector('#account-goal-title').textContent,/Elige una meta/);
assert.match(w.document.querySelector('#account-capi-image').src,/capi-thinking\.svg\?v=20260914-capi3$/);
assert.match(w.document.querySelector('.account-onboarding-link').href,/index\.html\?onboarding=1$/);
const verifiedStorage=Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]));
online=false;
w.LearningState.completar('python',1);
w.LearningState.registrarIntento('python',0,{validaciones:[true,true,true],aprobado:true,error:false,ms:500});
w.dispatchEvent(new w.Event('online'));
await eventually(()=>w.document.querySelector('[data-account-status]').textContent.includes('No pude guardar los últimos cambios'));
const pending=()=>Object.keys(w.localStorage).filter(k=>k.includes('.outbox.'));
assert.equal(pending().length,2,'una petición fallida conserva ambos cambios');
assert.equal(w.LearningState.bitacora().eventos.length,1);
online=true;w.dispatchEvent(new w.Event('online'));
await eventually(()=>pending().length===0);
assert.equal(requests.at(-1).token,'Bearer test-token-A');
assert.deepEqual(requests.at(-1).ops.map(x=>x.kind).sort(),['attempt','complete']);
assert.equal(w.document.querySelector('#account-routes').textContent.includes('Python'),true);
w.LearningState.seleccionarItinerario('web');
w.LearningState.registrarFeedback('python',0,'claro',null);
await eventually(()=>pending().length===0);
assert.deepEqual(requests.at(-1).ops.map(x=>x.kind).sort(),['feedback','preference']);
assert.equal(w.document.querySelector('#account-itinerary-title').textContent,'Desarrollo web');
assert.equal(w.document.querySelectorAll('#account-itinerary-steps li').length,6);
assert.match(w.document.querySelector('#account-goal-title').textContent,/Empieza con HTML y CSS/);
assert.match(w.document.querySelector('#account-capi-image').src,/capi-guide\.svg\?v=20260914-capi3$/);
assert.match(w.document.querySelector('#account-capi-copy').textContent,/paso a paso/);
w.LearningState.definirPlanSemanal('steady');
await eventually(()=>pending().length===0);
assert.deepEqual(requests.at(-1).ops.map(x=>x.kind),['weekly-plan']);
assert.match(w.document.querySelector('#account-weekly-title').textContent,/7 cápsulas/);
w.LearningState.completar('html-css',0);
await eventually(()=>pending().length===0);
assert.match(w.document.querySelector('#account-goal-copy').textContent,/ejercicio es el 2 de 50/);
assert.equal(Number(w.document.querySelector('#account-goal-progress').getAttribute('aria-valuenow'))>0,true);
// Se cambia la cuenta mientras una respuesta anterior está en vuelo.
let release;holds=new Promise(resolve=>release=resolve);
w.LearningState.completar('python',2);w.dispatchEvent(new w.Event('online'));
await eventually(()=>requests.at(-1).ops.some(x=>x.module===1));
w.localStorage.setItem('capsulasdev.active-user',randomUUID());
release();await new Promise(resolve=>setTimeout(resolve,20));
assert.equal(pending().length,1,'la respuesta anterior no confirma ni mezcla la cola tras un cambio de cuenta');
w.close();

/* Sin perfil, las rutas siguen siendo explorables, pero no pueden persistir
   ejercicios, intentos ni borradores. */
const guest=new JSDOM(read('index.html'),{url:'https://capsulasdev.com/',runScripts:'outside-only'}).window;
guest.eval(read('learning-state.js'));guest.eval(read('learning-sync.js'));
guest.AccountConfig={supabaseUrl:'https://example.supabase.co',publishableKey:'sb_publishable_test',registrationEnabled:true,privacyVersion:'2026-09-07'};
guest.supabase={createClient(){return {auth:{onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}};},async getUser(){return {data:{user:null},error:null};}}};}};
guest.eval(read('account.js'));
await new Promise(resolve=>setTimeout(resolve,20));
await eventually(()=>guest.document.querySelector('[data-account-status]').textContent.includes('Crea tu perfil'));
guest.eval(read('course-logos.js'));
assert.equal(guest.document.querySelector('[data-learning-route="python"] .course-logo').alt,'Python');
assert.equal(guest.document.querySelectorAll('[data-learning-route="html-css"] .course-logo').length,2,'HTML y CSS muestra ambos logotipos');
assert.equal(guest.document.querySelector('[data-learning-route="regex"] .course-symbol').textContent,'.*');
assert.equal(guest.document.querySelector('[data-learning-route="ia"] .course-logo-custom').getAttribute('aria-label'),'Inteligencia artificial');
assert.equal(guest.document.querySelector('[data-learning-route="accesibilidad"] .course-logo-custom').getAttribute('aria-label'),'Accesibilidad web');
assert.equal(guest.document.querySelector('[data-learning-route="docker"] .course-logo').alt,'Docker');
assert.match(guest.document.querySelector('[data-learning-route="docker"] .course-logo').src,/simpleicons\.org\/docker\/2496ED$/);
assert.equal(guest.document.querySelector('[data-learning-route="mongodb"] .course-logo').alt,'MongoDB');
assert.match(guest.document.querySelector('[data-learning-route="mongodb"] .course-logo').src,/simpleicons\.org\/mongodb\/47A248$/);
guest.LearningState.completar('python',1);
guest.LearningState.registrarIntento('python',0,{validaciones:[true],aprobado:true,error:false,ms:10});
guest.LearningState.save('python',0,'print("sin perfil")');
assert.equal(guest.LearningState.progress('python').completed,0,'sin perfil no se guarda un ejercicio');
assert.equal(guest.LearningState.bitacora().eventos.length,0,'sin perfil no se registra un intento');
assert.equal(guest.LearningState.session('python').drafts[0],undefined,'sin perfil no se guarda un borrador');
guest.LearningState.seleccionarItinerario('herramientas');
guest.LearningState.registrarFeedback('python',0,'mejorar','pistas');
assert.equal(guest.LearningState.itinerario(),'herramientas','la orientación local no exige una cuenta');
assert.equal(guest.LearningState.feedback('python',0).area,'pistas','el feedback queda en el dispositivo hasta iniciar sesión');
guest.close();

// Recarga de una cuenta previamente verificada: fallar al cargar Auth o el perfil
// no debe descartar el trabajo ni exigir recargar otra vez después de reconectar.
function recoveryWindow(seed, failure='auth', profileWait=null) {
  const page=new JSDOM(read('index.html'),{url:'https://capsulasdev.com/',runScripts:'outside-only'}).window;
  for (const [k,v] of Object.entries(seed)) page.localStorage.setItem(k,v);
  page.eval(read('learning-state.js'));page.eval(read('learning-sync.js'));
  page.AccountConfig={supabaseUrl:'https://example.supabase.co',publishableKey:'sb_publishable_test'};
  const control={online:false,authCalls:0,requests:[],rows:{},profileExists:true};
  page.supabase={createClient(url,key,options){
    if(!options) return {
      auth:{onAuthStateChange(){},async getUser(){
        control.authCalls++;
        if(!control.online && failure==='auth') throw Error('sin conexión');
        return {data:{user:{id:user}},error:null};
      },async getSession(){return {data:{session:{user:{id:user},access_token:'test-token-A'}},error:null};}},
      from(){return {select:()=>({eq:()=>({maybeSingle:async()=>{
        if(profileWait) await profileWait;
        return !control.online && failure==='profile' ? {data:null,error:{message:'sin conexión'}}
          : {data:control.profileExists?{alias:'Ada'}:null,error:null};
      }})})};}
    };
    return {async rpc(name,{p_operations}){
      assert.equal(control.online,true,'no enviar antes de reconectar y verificar el perfil');
      assert.equal(options.global.headers.Authorization,'Bearer test-token-A');
      control.requests.push(...p_operations);
      for(const op of p_operations) if(op.kind==='complete') control.rows.python={completados:[1],examenes:[],intentos:{}};
      return {data:{accepted:p_operations.map(op=>op.id),routes:control.rows,drafts:[],conflicts:[],profile:{alias:'Ada'}},error:null};
    }};
  }};
  page.eval(read('account.js'));
  return {page,control};
}
const copyStorage=page=>Object.fromEntries(Object.keys(page.localStorage).map(k=>[k,page.localStorage.getItem(k)]));
for(const failure of ['auth','profile']) {
  let {page,control}=recoveryWindow(verifiedStorage,failure);
  await eventually(()=>page.document.querySelector('[data-account-status]').textContent.includes('No pude'));
  page.LearningState.save('python',0,'print("pendiente sin red")');
  page.LearningState.completar('python',1);
  page.LearningState.registrarIntento('python',0,{validaciones:[true,true,true],aprobado:true,error:false,ms:42});
  assert.equal(page.LearningState.progress('python').completed,1);
  assert.equal(page.LearningState.session('python').drafts[0],'print("pendiente sin red")');
  assert.equal(control.requests.length,0);
  const saved=copyStorage(page);page.close();
  ({page,control}=recoveryWindow(saved,failure));
  await eventually(()=>page.document.querySelector('[data-account-status]').textContent.includes('No pude'));
  assert.equal(page.LearningState.session('python').drafts[0],'print("pendiente sin red")','el borrador sobrevive a otra recarga sin red');
  control.online=true;
  page.dispatchEvent(new page.Event('online'));page.dispatchEvent(new page.Event('focus'));
  await eventually(()=>page.document.querySelector('[data-account-status]').textContent.startsWith('Avance guardado automáticamente'));
  assert.deepEqual(control.requests.map(op=>op.kind).sort(),['attempt','complete','draft']);
  assert.equal(Object.keys(page.localStorage).some(k=>k.includes('.outbox.')),false);
  assert.equal(control.authCalls,2,'online y focus comparten una sola inicialización en vuelo');
  page.close();
}
// Una identidad local que nunca activó un perfil no habilita guardado sin red.
const unconfirmed=recoveryWindow({'capsulasdev.active-user':user});
await eventually(()=>unconfirmed.control.authCalls===1);
unconfirmed.page.LearningState.save('python',0,'sin perfil');
assert.equal(unconfirmed.page.LearningState.session('python').drafts[0],undefined);
unconfirmed.page.close();
// La respuesta tardía del perfil no puede autorizar la cuenta elegida en otra pestaña.
let releaseProfile;
const profileWait=new Promise(resolve=>{releaseProfile=resolve;});
const stale=recoveryWindow(verifiedStorage,'profile',profileWait);
await eventually(()=>stale.control.authCalls===1);
const other=randomUUID();stale.page.localStorage.setItem('capsulasdev.active-user',other);
stale.control.online=true;releaseProfile();await new Promise(resolve=>setTimeout(resolve,20));
assert.equal(stale.control.requests.length,0);
assert.equal(stale.page.localStorage.getItem('capsulasdev.user.'+other+'.profile-confirmed'),null);
stale.page.close();
console.log('Interfaz de cuentas: perfil obligatorio, guardado automático, desconexión, reintento, token fijado y respuesta tardía tras cambiar de cuenta: OK');

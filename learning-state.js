/* Dueño único del avance local.

   Antes había tres archivos escribiendo las mismas claves de localStorage por su
   cuenta —learning-state.js, starter-course.js y python.js—, cada uno con su
   propio parseo. Eran 51 claves sueltas y ninguna guardaba un evento: solo el
   estado final. Con eso se puede saber que alguien terminó tres módulos, pero no
   que intentó el cuarto once veces y se fue.

   Ahora hay un solo documento con esquema y versión, y un registro de intentos
   aparte. El avance se sigue derivando igual que antes, así que nada de lo que
   ya existía cambia de significado; lo que se agrega es la trazabilidad.

   Sin red y sin cuentas: todo vive en este navegador. El identificador de
   instalación es anónimo, se genera aquí y no viaja a ninguna parte. */
(() => {
  "use strict";

  const CLAVE_PERFIL = "codigo-cero.perfil-v1";
  const CLAVE_INTENTOS = "codigo-cero.intentos-v1";
  const ESQUEMA = 1;
  const MAX_BORRADOR = 30000;
  const MAX_EVENTOS = 400;
  const ITINERARIOS = ["web", "python-datos", "herramientas"];
  const RITMOS = Object.freeze({ light: 3, steady: 7, focused: 12 });
  const RESPUESTAS_FEEDBACK = ["claro", "mejorar"];
  const AREAS_FEEDBACK = ["explicacion", "mision", "resultado", "pistas", "otro"];
  let account = null;
  try {
    const selected = localStorage.getItem("capsulasdev.active-user");
    if (/^[0-9a-f-]{36}$/.test(selected || "")) account = selected;
  } catch { /* El modo invitado sigue disponible. */ }
  const scopedKey = (key) => account ? "capsulasdev.user." + account + "." + key : key;

  const routes = [
    { id: "python", name: "Python", count: 50, offset: 1, unit: "proyectos", anchor: "proyectos" },
    { id: "html-css", name: "HTML y CSS", count: 50, offset: 0, unit: "módulos" },
    { id: "javascript", name: "JavaScript", count: 50, offset: 0, unit: "módulos" },
    { id: "sql", name: "SQL", count: 50, offset: 0, unit: "módulos" },
    { id: "git", name: "Git y GitHub", count: 50, offset: 0, unit: "módulos" },
    { id: "apis", name: "APIs", count: 16, offset: 0, unit: "módulos" },
    { id: "terminal", name: "Terminal", count: 12, offset: 0, unit: "módulos" },
    { id: "regex", name: "Expresiones regulares", count: 12, offset: 0, unit: "módulos" },
    { id: "ia", name: "Inteligencia artificial", count: 12, offset: 0, unit: "módulos" },
    { id: "datos-python", name: "Datos con Python", count: 12, offset: 0, unit: "módulos" },
    { id: "nodejs", name: "Node.js", count: 12, offset: 0, unit: "módulos" },
    { id: "typescript", name: "TypeScript", count: 12, offset: 0, unit: "módulos" },
    { id: "react", name: "React", count: 12, offset: 0, unit: "módulos" },
    { id: "json", name: "JSON", count: 12, offset: 0, unit: "módulos" },
    { id: "markdown", name: "Markdown y documentación", count: 12, offset: 0, unit: "módulos" },
    { id: "accesibilidad", name: "Accesibilidad web", count: 12, offset: 0, unit: "módulos" },
    { id: "testing", name: "Pruebas automatizadas", count: 12, offset: 0, unit: "módulos" },
    { id: "docker", name: "Docker", count: 12, offset: 0, unit: "módulos" },
    { id: "mongodb", name: "MongoDB", count: 12, offset: 0, unit: "módulos" }
  ].map((route) => ({ offset: 0, unit: "módulos", anchor: "laboratorio", ...route, path: route.id + ".html" }));

  let available = true;
  const memory = new Map();
  const pendingWrites = new Set();
  const routeFor = (id) => routes.find((route) => route.id === id);

  function read(key, fallback) {
    key = scopedKey(key);
    if (pendingWrites.has(key)) return memory.get(key) ?? fallback;
    try {
      const value = localStorage.getItem(key);
      return value === null ? (memory.get(key) ?? fallback) : JSON.parse(value);
    } catch { available = false; return memory.get(key) ?? fallback; }
  }

  function write(key, value) {
    key = scopedKey(key);
    memory.set(key, value);
    try { localStorage.setItem(key, JSON.stringify(value)); pendingWrites.delete(key); }
    catch { available = false; pendingWrites.add(key); }
  }

  /* ===================== Documento de avance ===================== */

  const enteros = (valor) => (Array.isArray(valor) ? valor.filter((n) => Number.isInteger(n)) : []);
  const ahora = () => new Date().toISOString();

  function identificador() {
    let texto = "";
    for (let i = 0; i < 8; i += 1) texto += Math.floor(Math.random() * 16).toString(16);
    return texto;
  }

  function rutaVacia() {
    return { completados: [], examenes: [], activo: null, borradores: {}, intentos: {}, feedback: {}, actualizado: 0 };
  }

  /* Limpia lo que venga de fuera: un documento importado o editado a mano no
     puede meter índices imposibles ni borradores enormes. */
  function sanearRuta(route, crudo) {
    const limpio = rutaVacia();
    if (!crudo || typeof crudo !== "object") return limpio;
    const minimo = route.offset;
    const maximo = route.count + route.offset;
    limpio.completados = [...new Set(enteros(crudo.completados).filter((n) => n >= minimo && n < maximo))].sort((a, b) => a - b);
    const niveles = Math.ceil(route.count / 4);
    limpio.examenes = [...new Set(enteros(crudo.examenes).filter((n) => n >= 1 && n <= niveles))].sort((a, b) => a - b);
    limpio.activo = Number.isInteger(crudo.activo) && crudo.activo >= 0 && crudo.activo < route.count ? crudo.activo : null;
    for (const [clave, codigo] of Object.entries(crudo.borradores && typeof crudo.borradores === "object" ? crudo.borradores : {})) {
      if (/^\d+$/.test(clave) && Number(clave) < route.count && typeof codigo === "string" && codigo.length <= MAX_BORRADOR) {
        limpio.borradores[clave] = codigo;
      }
    }
    for (const [clave, veces] of Object.entries(crudo.intentos && typeof crudo.intentos === "object" ? crudo.intentos : {})) {
      if (/^\d+$/.test(clave) && Number(clave) < route.count && Number.isInteger(veces) && veces > 0) {
        limpio.intentos[clave] = Math.min(veces, 99999);
      }
    }
    for (const [clave, respuesta] of Object.entries(crudo.feedback && typeof crudo.feedback === "object" ? crudo.feedback : {})) {
      if (!/^\d+$/.test(clave) || Number(clave) >= route.count || !respuesta || typeof respuesta !== "object") continue;
      if (!RESPUESTAS_FEEDBACK.includes(respuesta.valor)) continue;
      const area = AREAS_FEEDBACK.includes(respuesta.area) ? respuesta.area : null;
      const actualizado = Number.isFinite(respuesta.actualizado) && respuesta.actualizado > 0
        ? Math.min(respuesta.actualizado, Date.now() + 60000) : 0;
      limpio.feedback[clave] = { valor: respuesta.valor, area, actualizado };
    }
    limpio.actualizado = Number.isFinite(crudo.actualizado) && crudo.actualizado > 0 && crudo.actualizado <= Date.now() + 60000
      ? crudo.actualizado : 0;
    return limpio;
  }

  function sanearPerfil(crudo) {
    const ritmo = Object.prototype.hasOwnProperty.call(RITMOS, crudo?.planSemanal?.ritmo)
      ? crudo.planSemanal.ritmo : null;
    const objetivo = Number.isInteger(crudo?.planSemanal?.objetivo)
      ? Math.min(Math.max(crudo.planSemanal.objetivo, 1), 20) : (ritmo ? RITMOS[ritmo] : null);
    const semana = /^\d{4}-\d{2}-\d{2}$/.test(crudo?.planSemanal?.semana || "")
      ? crudo.planSemanal.semana : null;
    const base = Number.isInteger(crudo?.planSemanal?.base) && crudo.planSemanal.base >= 0
      ? Math.min(crudo.planSemanal.base, 100000) : 0;
    const perfil = {
      esquema: ESQUEMA,
      instalacion: typeof crudo?.instalacion === "string" && /^[0-9a-f]{8}$/.test(crudo.instalacion)
        ? crudo.instalacion : identificador(),
      creado: typeof crudo?.creado === "string" ? crudo.creado : ahora(),
      actualizado: typeof crudo?.actualizado === "string" ? crudo.actualizado : ahora(),
      itinerario: ITINERARIOS.includes(crudo?.itinerario) ? crudo.itinerario : null,
      planSemanal: { ritmo, objetivo, semana, base, pausada: crudo?.planSemanal?.pausada === true },
      rutas: {}
    };
    for (const route of routes) {
      perfil.rutas[route.id] = sanearRuta(route, crudo?.rutas?.[route.id]);
    }
    return perfil;
  }

  /* Migración desde las 51 claves anteriores. Se lee una vez y no se borra nada:
     si algo saliera mal, el avance viejo sigue donde estaba. */
  function migrar() {
    const crudo = { rutas: {} };
    let habia = false;
    for (const route of routes) {
      const completados = read("codigo-cero." + route.id + "-v2.completed", null);
      const examenes = read("codigo-cero." + route.id + "-v2.exams", null);
      const sesion = read("codigo-cero." + route.id + ".session-v1", null);
      if (completados === null && examenes === null && sesion === null) continue;
      habia = true;
      crudo.rutas[route.id] = {
        completados: completados || [],
        examenes: examenes || [],
        activo: sesion?.active ?? null,
        borradores: sesion?.drafts || {},
        intentos: {},
        actualizado: sesion?.updatedAt || 0
      };
    }
    return habia ? crudo : null;
  }

  let cache = null;

  function perfil() {
    if (cache) return cache;
    const guardado = read(CLAVE_PERFIL, null);
    if (guardado) { cache = sanearPerfil(guardado); return cache; }
    const heredado = account ? null : migrar();
    cache = sanearPerfil(heredado || {});
    write(CLAVE_PERFIL, cache);
    return cache;
  }

  function guardar() {
    cache.actualizado = ahora();
    write(CLAVE_PERFIL, cache);
  }

  /* El documento se lee una vez y queda en memoria. Si cambia fuera de esta
     pestaña —otra pestaña abierta en el mismo sitio— hay que volver a leerlo,
     o la portada mostraría un avance viejo. */
  function refrescar() {
    cache = null;
    return perfil();
  }

  const estadoDe = (id) => {
    const documento = perfil();
    if (!documento.rutas[id]) documento.rutas[id] = rutaVacia();
    return documento.rutas[id];
  };

  /* ===================== Registro de intentos ===================== */

  function bitacora() {
    const crudo = read(CLAVE_INTENTOS, null);
    const eventos = Array.isArray(crudo?.eventos) ? crudo.eventos : [];
    return { esquema: ESQUEMA, eventos: eventos.slice(-MAX_EVENTOS) };
  }

  /* Un evento por ejecución. No guarda el código: guarda qué validaciones
     pasaron, si hubo error y cuánto se tardó. Con eso se sabe dónde se traba
     la gente sin acumular lo que escribió. */
  function registrarIntento(id, indice, resultado) {
    const route = routeFor(id);
    if (!route || !Number.isInteger(indice) || indice < 0 || indice >= route.count) return;
    const estado = estadoDe(id);
    const clave = String(indice);
    estado.intentos[clave] = Math.min((estado.intentos[clave] || 0) + 1, 99999);
    guardar();

    const validaciones = Array.isArray(resultado?.validaciones)
      ? resultado.validaciones.slice(0, 8).map((v) => (v ? "1" : "0")).join("") : "";
    const registro = bitacora();
    registro.eventos.push({
      r: id,
      m: indice,
      v: validaciones,
      ok: Boolean(resultado?.aprobado),
      e: Boolean(resultado?.error),
      ms: Number.isFinite(resultado?.ms) && resultado.ms >= 0 ? Math.min(Math.round(resultado.ms), 3600000) : 0,
      t: Date.now()
    });
    if (registro.eventos.length > MAX_EVENTOS) registro.eventos = registro.eventos.slice(-MAX_EVENTOS);
    write(CLAVE_INTENTOS, registro);
  }

  /* Dónde se traba la gente: módulos con más intentos que los que costó
     superarlos. Es la lectura que justifica guardar eventos. */
  function atascos(minimo = 3) {
    const documento = perfil();
    const lista = [];
    for (const route of routes) {
      const estado = documento.rutas[route.id];
      if (!estado) continue;
      const completados = new Set(estado.completados.map((n) => n - route.offset));
      for (const [clave, veces] of Object.entries(estado.intentos)) {
        const indice = Number(clave);
        if (veces < minimo) continue;
        lista.push({ ruta: route.id, nombre: route.name, modulo: indice, intentos: veces, superado: completados.has(indice) });
      }
    }
    return lista.sort((a, b) => b.intentos - a.intentos);
  }

  /* ===================== Lectura y escritura del avance ===================== */

  function session(id) {
    const route = routeFor(id);
    if (!route) return { active: null, drafts: {}, updatedAt: 0 };
    const estado = estadoDe(id);
    return { active: estado.activo, drafts: { ...estado.borradores }, updatedAt: estado.actualizado };
  }

  function save(id, index, code) {
    const route = routeFor(id);
    if (!route || !Number.isInteger(index) || index < 0 || index >= route.count) return;
    const estado = estadoDe(id);
    estado.activo = index;
    estado.actualizado = Date.now();
    if (typeof code === "string" && code.length <= MAX_BORRADOR) estado.borradores[index] = code;
    guardar();
  }

  function removeDraft(id, index) {
    const estado = estadoDe(id);
    delete estado.borradores[index];
    guardar();
  }

  const completados = (id) => estadoDe(id).completados.slice();
  const examenes = (id) => estadoDe(id).examenes.slice();

  function completar(id, valor) {
    const route = routeFor(id);
    if (!route || !Number.isInteger(valor)) return;
    if (valor < route.offset || valor >= route.count + route.offset) return;
    const estado = estadoDe(id);
    if (!estado.completados.includes(valor)) {
      estado.completados.push(valor);
      estado.completados.sort((a, b) => a - b);
      estado.actualizado = Date.now();
      guardar();
    }
  }

  function aprobarExamen(id, nivel) {
    const route = routeFor(id);
    if (!route || !Number.isInteger(nivel) || nivel < 1 || nivel > Math.ceil(route.count / 4)) return;
    const estado = estadoDe(id);
    if (!estado.examenes.includes(nivel)) {
      estado.examenes.push(nivel);
      estado.examenes.sort((a, b) => a - b);
      guardar();
    }
  }

  function seleccionarItinerario(id) {
    if (id !== null && !ITINERARIOS.includes(id)) return false;
    const documento = perfil();
    if (documento.itinerario === id) return true;
    documento.itinerario = id;
    guardar();
    return true;
  }

  function inicioSemana(fecha = new Date()) {
    const local = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const desplazamiento = (local.getDay() + 6) % 7;
    local.setDate(local.getDate() - desplazamiento);
    const year = local.getFullYear();
    const month = String(local.getMonth() + 1).padStart(2, "0");
    const day = String(local.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function definirPlanSemanal(ritmo) {
    if (!Object.prototype.hasOwnProperty.call(RITMOS, ritmo)) return false;
    const documento = perfil();
    documento.planSemanal = {
      ritmo,
      objetivo: RITMOS[ritmo],
      semana: inicioSemana(),
      base: resumen(documento).modulos,
      pausada: false
    };
    guardar();
    return true;
  }

  function metaSemanal() {
    const documento = perfil();
    const plan = documento.planSemanal;
    if (!plan?.ritmo || !Object.prototype.hasOwnProperty.call(RITMOS, plan.ritmo)) return null;
    const semana = inicioSemana();
    let renovada = false;
    if (plan.semana !== semana) {
      plan.semana = semana;
      plan.base = resumen(documento).modulos;
      renovada = true;
      guardar();
    }
    const completados = Math.max(0, resumen(documento).modulos - plan.base);
    return {
      ritmo: plan.ritmo,
      objetivo: plan.objetivo,
      semana: plan.semana,
      base: plan.base,
      completados: Math.min(completados, plan.objetivo),
      restantes: Math.max(0, plan.objetivo - completados),
      porcentaje: Math.min(100, Math.round(completados / plan.objetivo * 100)),
      renovada,
      pausada: plan.pausada === true
    };
  }

  function pausarPlanSemanal(pausada = true) {
    const documento = perfil();
    if (!documento.planSemanal?.ritmo) return false;
    documento.planSemanal.pausada = Boolean(pausada);
    guardar();
    return true;
  }

  function sesionesSemana() {
    const plan = metaSemanal();
    if (!plan) return [];
    const tamanos = plan.ritmo === "light" ? [2, 1]
      : plan.ritmo === "focused" ? [3, 3, 3, 3] : [2, 2, 3];
    let acumulado = 0;
    return tamanos.map((cantidad, indice) => {
      const inicio = acumulado;
      acumulado += cantidad;
      const hechas = Math.min(cantidad, Math.max(0, plan.completados - inicio));
      return {
        numero: indice + 1,
        cantidad,
        hechas,
        completa: hechas === cantidad,
        actual: !plan.pausada && hechas < cantidad && plan.completados >= inicio,
        pendiente: plan.completados < inicio
      };
    });
  }

  function recomendacionesRepaso(limite = 3) {
    const ultimos = new Map();
    for (const evento of bitacora().eventos) {
      const clave = `${evento.r}:${evento.m}`;
      ultimos.set(clave, Math.max(ultimos.get(clave) || 0, evento.t || 0));
    }
    return atascos(2)
      .sort((a, b) => Number(a.superado) - Number(b.superado)
        || b.intentos - a.intentos
        || (ultimos.get(`${b.ruta}:${b.modulo}`) || 0) - (ultimos.get(`${a.ruta}:${a.modulo}`) || 0))
      .slice(0, Math.min(Math.max(Number(limite) || 0, 0), 6))
      .map(item => {
        const route = routeFor(item.ruta);
        return {
          ...item,
          numero: item.modulo + 1,
          href: route.path + "#" + route.anchor,
          motivo: item.superado ? "Refuérzalo: necesitó varios intentos." : "Retómalo: todavía necesita práctica."
        };
      });
  }

  function registrarFeedback(id, indice, valor, area = null) {
    const route = routeFor(id);
    if (!route || !Number.isInteger(indice) || indice < 0 || indice >= route.count) return false;
    if (!RESPUESTAS_FEEDBACK.includes(valor)) return false;
    if (area !== null && !AREAS_FEEDBACK.includes(area)) return false;
    const estado = estadoDe(id);
    estado.feedback[String(indice)] = { valor, area, actualizado: Date.now() };
    guardar();
    return true;
  }

  function feedback(id, indice) {
    const route = routeFor(id);
    if (!route || !Number.isInteger(indice) || indice < 0 || indice >= route.count) return null;
    const respuesta = estadoDe(id).feedback[String(indice)];
    return respuesta ? { ...respuesta } : null;
  }

  function progress(id) {
    const route = routeFor(id);
    if (!route) return null;
    const estado = estadoDe(id);
    const completed = new Set(estado.completados.map((i) => i - route.offset));
    const unlocked = (i) => Array.from({ length: Math.floor(i / 4) * 4 }, (_, n) => n).every((n) => completed.has(n));
    const levels = Math.ceil(route.count / 4);
    const exams = new Set(estado.examenes.filter((i) =>
      Array.from({ length: Math.min(i * 4, route.count) }, (_, n) => n).every((n) => completed.has(n))));
    let active = estado.activo;
    const first = Array.from({ length: route.count }, (_, i) => i).find((i) => !completed.has(i) && unlocked(i));
    const pendingExam = Array.from({ length: levels }, (_, n) => n + 1).find((nivel) => !exams.has(nivel));
    if (active === null || !unlocked(active)) active = first ?? ((pendingExam || 1) - 1) * 4;
    const done = completed.size === route.count && exams.size === levels;
    return { ...route, completed: completed.size, exams: exams.size, active, done,
      started: completed.size > 0 || estado.actualizado > 0,
      updatedAt: estado.actualizado, percent: Math.round(completed.size / route.count * 100),
      href: route.path + "#" + route.anchor
    };
  }

  /* ===================== Portabilidad ===================== */

  /* El esquema se declara aquí para que la importación se valide con el mismo
     motor que enseña la ruta JSON, en vez de con comprobaciones improvisadas. */
  const esquema = {
    type: "object",
    required: ["formato", "esquema", "perfil"],
    properties: {
      formato: { type: "string", enum: ["codigo-cero/avance"] },
      esquema: { type: "integer", minimum: 1, maximum: ESQUEMA },
      exportado: { type: "string" },
      perfil: {
        type: "object",
        required: ["instalacion", "rutas"],
        properties: {
          esquema: { type: "integer", minimum: 1 },
          instalacion: { type: "string", minLength: 8, maxLength: 8 },
          creado: { type: "string" },
          actualizado: { type: "string" },
          rutas: { type: "object" }
        }
      },
      intentos: {
        type: "object",
        properties: { esquema: { type: "integer" }, eventos: { type: "array" } }
      }
    }
  };

  function exportar() {
    return JSON.stringify({
      formato: "codigo-cero/avance",
      esquema: ESQUEMA,
      exportado: ahora(),
      perfil: perfil(),
      intentos: bitacora()
    }, null, 2);
  }

  function resumen(documento) {
    let modulos = 0;
    let pruebas = 0;
    let rutas = 0;
    for (const route of routes) {
      const estado = documento.rutas[route.id];
      if (!estado) continue;
      if (estado.completados.length || estado.examenes.length) rutas += 1;
      modulos += estado.completados.length;
      pruebas += estado.examenes.length;
    }
    return { rutas, modulos, examenes: pruebas };
  }

  /* Devuelve por qué falló, no solo que falló: el analizador de la ruta JSON da
     línea y columna, y el validador dice qué campo no cumple. */
  function importar(texto) {
    const lab = globalThis.JsonLab;
    let documento;
    if (lab) {
      try { documento = lab.analizar(texto); }
      catch (error) { return { ok: false, error: error.message }; }
      const fallos = lab.validar(esquema, documento);
      if (fallos.length) return { ok: false, error: "El archivo no tiene la forma esperada: " + fallos[0].mensaje + "." };
    } else {
      /* Sin el validador de la ruta JSON no hay mensajes finos, pero las mismas
         reglas mínimas tienen que aplicarse igual. */
      try { documento = JSON.parse(texto); }
      catch { return { ok: false, error: "El texto no es JSON válido." }; }
      if (!documento || typeof documento !== "object" || documento.formato !== "codigo-cero/avance") {
        return { ok: false, error: "Este archivo no es una exportación de CápsulasDev." };
      }
      if (!Number.isInteger(documento.esquema) || documento.esquema < 1) {
        return { ok: false, error: "Al archivo le falta el número de esquema." };
      }
      if (!documento.perfil || typeof documento.perfil !== "object"
        || typeof documento.perfil.instalacion !== "string"
        || !documento.perfil.rutas || typeof documento.perfil.rutas !== "object") {
        return { ok: false, error: "Al archivo le falta el perfil con sus rutas." };
      }
    }
    if (documento.esquema > ESQUEMA) {
      return { ok: false, error: "El archivo viene de una versión más nueva del sitio." };
    }
    cache = sanearPerfil(documento.perfil);
    guardar();
    const eventos = Array.isArray(documento.intentos?.eventos) ? documento.intentos.eventos : [];
    write(CLAVE_INTENTOS, { esquema: ESQUEMA, eventos: eventos.slice(-MAX_EVENTOS) });
    return { ok: true, error: null, resumen: resumen(cache) };
  }

  function borrar() {
    cache = sanearPerfil({});
    guardar();
    write(CLAVE_INTENTOS, { esquema: ESQUEMA, eventos: [] });
  }

  /* El proveedor autentica la identidad; este selector solo aísla la caché local. */
  function usarCuenta(id) {
    if (id !== null && !/^[0-9a-f-]{36}$/.test(id)) throw new Error("Identificador de cuenta inválido.");
    account = id;
    cache = null;
    return perfil();
  }

  function combinarRemoto(rutas, perfilRemoto = null) {
    const documento = perfil();
    if (ITINERARIOS.includes(perfilRemoto?.itinerary)) documento.itinerario = perfilRemoto.itinerary;
    if (Object.prototype.hasOwnProperty.call(RITMOS, perfilRemoto?.weekly_pace)) {
      documento.planSemanal = {
        ritmo: perfilRemoto.weekly_pace,
        objetivo: Number.isInteger(perfilRemoto.weekly_target) ? perfilRemoto.weekly_target : RITMOS[perfilRemoto.weekly_pace],
        semana: /^\d{4}-\d{2}-\d{2}$/.test(perfilRemoto.weekly_started_on || "") ? perfilRemoto.weekly_started_on : inicioSemana(),
        base: Number.isInteger(perfilRemoto.weekly_baseline) && perfilRemoto.weekly_baseline >= 0 ? perfilRemoto.weekly_baseline : resumen(documento).modulos,
        pausada: perfilRemoto.weekly_paused === true
      };
    }
    for (const route of routes) {
      const incoming = rutas?.[route.id];
      if (!incoming) continue;
      const local = documento.rutas[route.id];
      const remote = sanearRuta(route, incoming);
      local.completados = [...new Set([...local.completados, ...remote.completados])].sort((a,b) => a-b);
      local.examenes = [...new Set([...local.examenes, ...remote.examenes])].sort((a,b) => a-b);
      for (const [key, count] of Object.entries(remote.intentos)) local.intentos[key] = Math.max(local.intentos[key] || 0, count);
      for (const [key, respuesta] of Object.entries(remote.feedback)) {
        if (!local.feedback[key] || respuesta.actualizado >= local.feedback[key].actualizado) local.feedback[key] = respuesta;
      }
      // Los borradores se aplican solo al entrar en la cuenta, antes de abrir un editor.
    }
    guardar();
  }

  globalThis.LearningState = {
    routes,
    session, save, removeDraft, progress,
    resumeIndex: (id) => progress(id)?.active ?? 0,
    storageAvailable: () => available,
    perfil, refrescar, completados, examenes, completar, aprobarExamen,
    registrarIntento, atascos, bitacora,
    itinerarios: ITINERARIOS.slice(), itinerario: () => perfil().itinerario,
    seleccionarItinerario, definirPlanSemanal, metaSemanal, pausarPlanSemanal, sesionesSemana, recomendacionesRepaso, feedback, registrarFeedback,
    exportar, importar, borrar, esquema,
    usarCuenta, cuenta: () => account, combinarRemoto,
    resumen: () => resumen(perfil())
  };
})();

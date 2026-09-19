import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

/*
  learning-state.js es el único dueño del avance local. Esta suite cubre tres
  cosas: que el documento nuevo se comporte como el modelo anterior, que migre
  sin destruir las claves viejas, y que el registro de intentos —lo único que
  antes no existía— diga dónde se traba la gente.
*/

const read = (file) => fs.readFileSync(new URL(file, import.meta.url), 'utf8');
const source = read('learning-state.js');

function setup(values = {}, blocked = false, full = false, conValidador = false) {
  const storage = new Map(Object.entries(values));
  const context = vm.createContext({ localStorage: {
    getItem(key) { if (blocked) throw Error('blocked'); return storage.get(key) ?? null; },
    setItem(key, value) { if (blocked || full) throw Error('full'); storage.set(key, value); }
  }, JSON });
  /* En el sitio, la portada carga json-lab.js antes: la importacion se valida
     con el mismo motor que ensena la ruta JSON. Aqui se prueban los dos caminos,
     con validador y sin el, porque los dos existen. */
  if (conValidador) vm.runInContext(read('json-lab.js'), context);
  vm.runInContext(source, context);
  return { state: context.LearningState, storage, context };
}

/* Avance escrito por el camino real: completar y aprobar, no tocar claves. */
function avanzar(state, id, modulos, examenes = []) {
  for (const valor of modulos) state.completar(id, valor);
  for (const nivel of examenes) state.aprobarExamen(id, nivel);
}

const CLAVE = 'codigo-cero.perfil-v1';

/* ---------- borradores y reanudación, ruta por ruta ---------- */
for (const id of setup().state.routes.map((route) => route.id)) {
  const {state, storage} = setup();
  assert.equal(state.progress(id).started, false);
  state.save(id, 1, 'borrador <seguro>');
  assert.equal(state.session(id).drafts[1], 'borrador <seguro>');
  assert.equal(state.resumeIndex(id), 1);
  assert.equal(state.progress(id).started, true);
  const restored = setup(Object.fromEntries(storage)).state;
  assert.equal(restored.resumeIndex(id), 1);
  assert.equal(restored.session(id).drafts[1], 'borrador <seguro>');
  restored.removeDraft(id, 1);
  assert.equal(restored.session(id).drafts[1], undefined);
  assert.equal(restored.session(id).active, 1);
}

/* ---------- rutas ampliadas a cincuenta módulos ---------- */
for (const id of ['html-css', 'javascript', 'sql', 'git', 'apis']) {
  const { state } = setup();
  avanzar(state, id, Array.from({ length: 16 }, (_, i) => i), [1, 2, 3, 4]);
  assert.equal(state.progress(id).count, 50, id + ': conserva los dieciséis módulos previos');
  assert.equal(state.progress(id).done, false, id + ': la ampliación sigue pendiente');
  assert.equal(state.resumeIndex(id), 16, id + ': retoma en el módulo nuevo');
  avanzar(state, id, Array.from({ length: 34 }, (_, i) => i + 16), Array.from({ length: 9 }, (_, i) => i + 5));
  assert.equal(state.progress(id).completed, 50, id + ': completa cincuenta módulos');
  assert.equal(state.progress(id).exams, 13, id + ': completa trece exámenes');
  assert.equal(state.progress(id).done, true, id + ': cierra la ruta ampliada');
}

/* ---------- Python usa identificadores de proyecto 1–50 ---------- */
{
  const todos = Array.from({length: 50}, (_, i) => i + 1);
  const {state} = setup();
  avanzar(state, 'python', [...todos.slice(0, 12), 0, -1, 99], [1, 2, 4]);
  assert.equal(state.progress('python').count, 50, 'Python tiene 50 proyectos');
  assert.equal(state.progress('python').completed, 12);
  assert.equal(state.progress('python').exams, 2);
  assert.equal(state.resumeIndex('python'), 12);
  avanzar(state, 'python', todos, [3]);
  assert.equal(state.progress('python').completed, 50);
  assert.equal(state.progress('python').done, false, 'si quedan exámenes la ruta sigue abierta');
  assert.equal(state.resumeIndex('python'), 16, 'sin proyectos pendientes retoma el primer nivel cuyo examen falta');
  avanzar(state, 'python', [], [3, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  assert.equal(state.progress('python').exams, 13);
  assert.equal(state.progress('python').done, true);
  assert.equal(state.progress('python').percent, 100);
}

/* ---------- migración desde las 51 claves anteriores ---------- */
{
  const legado = {
    'codigo-cero.python-v2.completed': JSON.stringify([1, 2, 3, 4, 1, -1, 99, '3']),
    'codigo-cero.python-v2.exams': '[1,2,2,"3"]',
    'codigo-cero.python.session-v1': '{"active":4,"updatedAt":1757000000000,"drafts":{"4":"edad = 20"}}',
    'codigo-cero.react-v2.completed': '[0,1,2]'
  };
  const {state, storage} = setup(legado);
  assert.equal(state.progress('python').completed, 4, 'el avance anterior se conserva');
  assert.equal(state.progress('python').exams, 1, 'los exámenes anteriores se conservan');
  assert.equal(state.session('python').drafts[4], 'edad = 20', 'los borradores anteriores se conservan');
  assert.equal(state.progress('react').completed, 3);

  assert.ok(storage.has(CLAVE), 'la migración deja el documento nuevo escrito');
  assert.equal(storage.get('codigo-cero.python-v2.completed'), legado['codigo-cero.python-v2.completed'],
    'migrar no destruye lo anterior: si algo sale mal, el avance viejo sigue ahí');

  /* Una segunda carga ya no mira el legado: manda el documento. */
  const segunda = setup(Object.fromEntries(storage));
  segunda.state.completar('python', 5);
  assert.equal(segunda.state.progress('python').completed, 5);
  assert.equal(segunda.storage.get('codigo-cero.python-v2.completed'), legado['codigo-cero.python-v2.completed'],
    'el documento nuevo es el que se escribe, no las claves viejas');
}

/* ---------- datos corruptos, en el formato viejo y en el nuevo ---------- */
for (const bad of ['{', 'null', '7', '"texto"', '[]', '{"rutas":5}', '{"rutas":{"python":{"completados":"no"}}}']) {
  const s = setup({'codigo-cero.python.session-v1': bad, 'codigo-cero.python-v2.completed': bad, [CLAVE]: bad}).state;
  assert.equal(s.resumeIndex('python'), 0, 'un documento ilegible no debe romper la ruta: ' + bad);
  assert.equal(s.progress('python').completed, 0);
  assert.equal(s.perfil().instalacion.length, 8, 'siempre hay identificador de instalación');
}

/* ---------- almacenamiento bloqueado o lleno ---------- */
for (const [blocked, full] of [[true,false],[false,true]]) {
  const {state} = setup({}, blocked, full);
  state.save('sql', 0, 'nuevo');
  state.save('sql', 1, 'otro');
  assert.equal(state.session('sql').drafts[0], 'nuevo', 'escritura fallida no debe perder lo escrito en esta sesión');
  assert.equal(state.session('sql').drafts[1], 'otro');
  assert.equal(state.storageAvailable(), false);
}

const invalid = setup().state;
invalid.save('python', 99, 'no');
invalid.save('python', 0, 'x'.repeat(30001));
assert.equal(invalid.session('python').drafts[0], undefined);
assert.equal(invalid.progress('no-existe'), null);
invalid.completar('no-existe', 0);
invalid.aprobarExamen('python', 99);
assert.equal(invalid.examenes('python').length, 0, 'un nivel que no existe no se aprueba');

/* ---------- registro de intentos: lo que antes no se guardaba ---------- */
{
  const {state, storage} = setup();
  assert.equal(state.bitacora().eventos.length, 0);

  /* Tres intentos fallidos y uno bueno sobre el mismo módulo. */
  for (const validaciones of [[false,false,false],[true,false,false],[true,true,false]]) {
    state.registrarIntento('python', 3, { validaciones, aprobado: false, error: false, ms: 5000 });
  }
  state.registrarIntento('python', 3, { validaciones: [true,true,true], aprobado: true, error: false, ms: 9000 });
  state.registrarIntento('python', 0, { validaciones: [true,true,true], aprobado: true, error: false, ms: 1000 });

  const eventos = state.bitacora().eventos;
  assert.equal(eventos.length, 5);
  assert.equal(eventos[0].v, '000', 'se guarda qué validación falló, no solo que falló');
  assert.equal(eventos[3].v, '111');
  assert.equal(eventos[3].ok, true);
  assert.equal(eventos[3].r, 'python');
  assert.equal(eventos[3].m, 3);
  assert.ok(eventos[3].t > 0, 'cada evento lleva su momento');
  assert.equal(Object.prototype.hasOwnProperty.call(eventos[0], 'codigo'), false,
    'el registro no guarda el código que escribió la persona');

  /* El contador por módulo es permanente; la bitácora es una ventana. */
  const atascos = state.atascos(3);
  assert.equal(atascos.length, 1, 'solo el módulo con tres intentos o más');
  assert.equal(atascos[0].modulo, 3);
  assert.equal(atascos[0].intentos, 4);
  assert.equal(atascos[0].superado, false, 'aún no está completado');
  state.completar('python', 4);
  assert.equal(state.atascos(3)[0].superado, true, 'ahora sí, y se distingue del que abandonó');

  /* La bitácora no crece sin freno. */
  for (let i = 0; i < 500; i += 1) {
    state.registrarIntento('json', i % 12, { validaciones: [true], aprobado: false, error: true, ms: 10 });
  }
  assert.equal(state.bitacora().eventos.length, 400, 'la bitácora rota y no llena el almacenamiento');
  assert.ok(storage.get('codigo-cero.intentos-v1').length < 60000, 'el registro se mantiene pequeño');

  /* Un módulo que no existe no se registra. */
  state.registrarIntento('python', 99, { validaciones: [true], aprobado: true });
  state.registrarIntento('no-existe', 0, { validaciones: [true], aprobado: true });
  assert.equal(state.perfil().rutas.python.intentos['99'], undefined);
}

/* ---------- exportar e importar ---------- */
{
  const origen = setup();
  avanzar(origen.state, 'sql', [0, 1, 2, 3], [1]);
  origen.state.save('sql', 4, 'SELECT 1;');
  origen.state.registrarIntento('sql', 4, { validaciones: [true,false,true], aprobado: false, error: false, ms: 2000 });
  const texto = origen.state.exportar();

  const documento = JSON.parse(texto);
  assert.equal(documento.formato, 'codigo-cero/avance');
  assert.equal(documento.esquema, 1);
  assert.equal(documento.perfil.rutas.sql.completados.length, 4);
  assert.equal(documento.intentos.eventos.length, 1);

  const destino = setup();
  assert.equal(destino.state.progress('sql').completed, 0);
  const resultado = destino.state.importar(texto);
  assert.equal(resultado.ok, true, resultado.error);
  assert.equal(JSON.stringify(resultado.resumen), JSON.stringify({ rutas: 1, modulos: 4, examenes: 1 }));
  assert.equal(destino.state.progress('sql').completed, 4);
  assert.equal(destino.state.session('sql').drafts[4], 'SELECT 1;');
  assert.equal(destino.state.bitacora().eventos.length, 1, 'los intentos viajan con el avance');
  assert.equal(destino.state.perfil().instalacion, origen.state.perfil().instalacion,
    'la instalación importada conserva su identificador para no duplicar a la misma persona');

  /* Lo que no se debe aceptar. */
  for (const conValidador of [false, true]) {
    const donde = conValidador ? ' (con el validador de la ruta JSON)' : ' (sin validador)';
    for (const [entrada, razon] of [
      ['{', 'JSON roto'],
      ['', 'vacío'],
      ['[]', 'una lista en vez de un documento'],
      ['{"formato":"otra-cosa","esquema":1,"perfil":{"instalacion":"aaaaaaaa","rutas":{}}}', 'formato ajeno'],
      ['{"formato":"codigo-cero/avance","esquema":99,"perfil":{"instalacion":"aaaaaaaa","rutas":{}}}', 'esquema futuro'],
      ['{"formato":"codigo-cero/avance","esquema":1}', 'sin perfil'],
      ['{"formato":"codigo-cero/avance","perfil":{"instalacion":"aaaaaaaa","rutas":{}}}', 'sin esquema']
    ]) {
      const s = setup({}, false, false, conValidador).state;
      const r = s.importar(entrada);
      assert.equal(r.ok, false, 'debía rechazar: ' + razon + donde);
      assert.ok(r.error && r.error.length > 10, 'y explicar por qué: ' + razon + donde);
    }
    /* Y el documento bueno tiene que entrar por los dos caminos. */
    const bueno = setup({}, false, false, conValidador).state;
    assert.equal(bueno.importar(texto).ok, true, 'un documento válido entra' + donde);
    assert.equal(bueno.progress('sql').completed, 4);
  }

  /* Un documento válido con basura adentro se limpia en vez de romper. */
  const sucio = setup().state;
  const ok = sucio.importar(JSON.stringify({
    formato: 'codigo-cero/avance', esquema: 1,
    perfil: { instalacion: 'bbbbbbbb', rutas: { python: { completados: [1, 2, 999, 'x'], borradores: { '0': 'y'.repeat(40000) } }, inventada: { completados: [1] } } }
  }));
  assert.equal(ok.ok, true);
  assert.equal(sucio.progress('python').completed, 2, 'se queda con lo que es válido');
  assert.equal(sucio.session('python').drafts[0], undefined, 'un borrador enorme no entra');
  assert.equal(sucio.perfil().rutas.inventada, undefined, 'una ruta que no existe no entra');

  const vacio = setup().state;
  avanzar(vacio, 'json', [0, 1]);
  vacio.borrar();
  assert.equal(vacio.progress('json').completed, 0, 'borrar deja el avance en cero');
  assert.equal(vacio.bitacora().eventos.length, 0);
  assert.equal(vacio.perfil().instalacion.length, 8, 'y se sigue teniendo identificador');
}

/* ---------- panel de avance de la portada ---------- */
{
  class Nodo {
    constructor(etiqueta = 'div') {
      this.etiqueta = etiqueta; this.textContent = ''; this.className = ''; this.value = '';
      this.hidden = false; this.dataset = {}; this.hijos = []; this.oyentes = {}; this.mapa = new Map();
    }
    querySelector(selector) { if (!this.mapa.has(selector)) this.mapa.set(selector, new Nodo()); return this.mapa.get(selector); }
    addEventListener(tipo, fn) { (this.oyentes[tipo] ||= []).push(fn); }
    click() { for (const fn of this.oyentes.click || []) fn({ currentTarget: this }); }
    replaceChildren(...nodos) { this.hijos = nodos; }
    append(...nodos) { this.hijos.push(...nodos); }
    focus() {} select() {}
  }

  function montar(state) {
    const panel = new Nodo();
    const documento = {
      querySelector: (selector) => (selector === '#progress-panel' ? panel : panel.querySelector(selector)),
      createElement: (etiqueta) => new Nodo(etiqueta)
    };
    const contexto = vm.createContext({
      document: documento,
      LearningState: state,
      navigator: { clipboard: { writeText: async () => {} } },
      globalThis: null,
      Event: class { constructor(nombre) { this.type = nombre; } },
      dispatchEvent() {}, addEventListener() {}
    });
    contexto.globalThis = contexto;
    vm.runInContext(read('progress-panel.js'), contexto);
    return panel;
  }

  const { state } = setup({}, false, false, true);
  avanzar(state, 'sql', [0, 1], [1]);
  state.save('sql', 2, 'SELECT 1;');
  for (let i = 0; i < 3; i += 1) {
    state.registrarIntento('sql', 2, { validaciones: [true, false, false], aprobado: false, error: false, ms: 3000 });
  }

  const panel = montar(state);
  assert.match(panel.querySelector('#progress-summary').textContent, /^2 ejercicios y 1 examen en 1 ruta\.$/,
    'el resumen concuerda en singular y plural');
  assert.equal(panel.querySelector('#progress-stuck').hijos.length, 1);
  assert.match(panel.querySelector('#progress-stuck').hijos[0].textContent, /SQL · módulo 3: 3 intentos \(sin superar\)/);

  panel.querySelector('#progress-generate').click();
  const respaldo = panel.querySelector('#progress-export').value;
  assert.equal(panel.querySelector('#progress-export').hidden, false);
  assert.match(respaldo, /"formato": "codigo-cero\/avance"/);

  /* Restaurar en otro navegador. */
  const otro = setup({}, false, false, true);
  const panelOtro = montar(otro.state);
  assert.match(panelOtro.querySelector('#progress-summary').textContent, /Todavía no hay avance/);
  panelOtro.querySelector('#progress-import').value = respaldo;
  panelOtro.querySelector('#progress-apply').click();
  assert.match(panelOtro.querySelector('#progress-status').textContent, /Avance restaurado: 2 ejercicios y 1 examen/);
  assert.equal(otro.state.progress('sql').completed, 2);
  assert.equal(otro.state.session('sql').drafts[2], 'SELECT 1;');

  /* Lo que se rechaza, y con qué palabras. */
  for (const [entrada, esperado] of [
    ['', /Pega primero/],
    ['{ roto', /Línea 1/],
    ['{"formato":"otra-app","esquema":1,"perfil":{"instalacion":"aaaaaaaa","rutas":{}}}', /formato/],
    ['{"formato":"codigo-cero/avance","esquema":99,"perfil":{"instalacion":"aaaaaaaa","rutas":{}}}', /esquema/]
  ]) {
    panelOtro.querySelector('#progress-import').value = entrada;
    panelOtro.querySelector('#progress-apply').click();
    assert.match(panelOtro.querySelector('#progress-status').textContent, esperado, 'debía explicar el rechazo: ' + entrada.slice(0, 30));
    assert.equal(otro.state.progress('sql').completed, 2, 'un archivo rechazado no toca el avance');
  }

  /* Borrar exige confirmar: es irreversible y no hay copia en ningún servidor. */
  const borrar = panelOtro.querySelector('#progress-clear');
  borrar.click();
  assert.equal(otro.state.progress('sql').completed, 2, 'el primer clic solo avisa');
  assert.match(panelOtro.querySelector('#progress-status').textContent, /no se puede deshacer/);
  assert.equal(borrar.textContent, 'Confirmar borrado');
  borrar.click();
  assert.equal(otro.state.progress('sql').completed, 0, 'el segundo clic borra');
  assert.equal(otro.state.bitacora().eventos.length, 0);
}

/* ---------- catálogo de la portada ---------- */
class Element {
  constructor() { this.textContent = ''; this.style = {}; this.hidden = true; this.children = new Map(); }
  querySelector(selector) { if (!this.children.has(selector)) this.children.set(selector, new Element()); return this.children.get(selector); }
}
const home = setup();
avanzar(home.state, 'python', [1, 2, 3, 4], [1]);
home.state.save('python', 4, 'edad = 20');
const root = new Element();
const events = {};
home.context.document = root;
home.context.window = {addEventListener(name, callback) { events[name] = callback; }};
vm.runInContext(read('catalog.js'), home.context);
assert.equal(root.querySelector('#continue-learning').hidden, false);
assert.match(root.querySelector('#continue-title').textContent, /Python/);
assert.match(root.querySelector('#continue-description').textContent, /Proyecto 5 de 50/);
assert.equal(root.querySelector('#continue-link').href, 'python.html#proyectos');
const pythonCard = root.querySelector('[data-learning-route="python"]');
assert.equal(pythonCard.querySelector('[data-route-progress]').textContent, '4/50 proyectos');
assert.match(pythonCard.querySelector('[data-route-detail]').textContent, /1\/13 exámenes/);
assert.equal(pythonCard.querySelector('[data-route-fill]').style.width, '8%');

/* Otra pestaña completó la ruta: la portada tiene que releer, no mostrar lo viejo. */
const otra = setup(Object.fromEntries(home.storage)).state;
avanzar(otra, 'python', Array.from({length:50},(_,i)=>i+1), [1,2,3,4,5,6,7,8,9,10,11,12,13]);
home.storage.set(CLAVE, JSON.stringify(otra.perfil()));
events.storage();
assert.equal(root.querySelector('#continue-learning').hidden, true, 'el cambio hecho en otra pestaña se refleja');
assert.match(pythonCard.querySelector('[data-route-action]').textContent, /Repasar/);
assert.equal(typeof events.pageshow, 'function');

const routes = setup().state.routes;
assert.equal(routes.length, 19);
assert.equal(routes.reduce((sum, route) => sum + route.count, 0), 456);
assert.equal(routes.reduce((sum, route) => sum + Math.ceil(route.count / 4), 0), 117);
for (const id of ['markdown', 'accesibilidad', 'testing']) {
  const { state } = setup();
  avanzar(state, id, Array.from({length:12}, (_, i) => i), [1, 2, 3]);
  assert.equal(state.progress(id).done, true, id + ': cierre con módulos y exámenes');
  assert.equal(state.progress('json').started, false, 'el avance de otra ruta sigue independiente');
}

/* ---------- itinerarios y feedback estructurado ---------- */
{
  const { state } = setup();
  assert.equal(state.itinerario(), null);
  assert.equal(state.seleccionarItinerario('python-datos'), true);
  assert.equal(state.itinerario(), 'python-datos');
  assert.equal(state.seleccionarItinerario('inventado'), false);
  assert.equal(state.registrarFeedback('python', 0, 'mejorar', 'explicacion'), true);
  assert.deepEqual(JSON.parse(JSON.stringify(state.feedback('python', 0))).valor, 'mejorar');
  assert.equal(state.feedback('python', 0).area, 'explicacion');
  assert.equal(state.registrarFeedback('python', 99, 'claro'), false);
  assert.equal(state.registrarFeedback('python', 0, 'texto libre'), false);
  const restored = setup().state;
  assert.equal(restored.importar(state.exportar()).ok, true);
  assert.equal(restored.itinerario(), 'python-datos');
  assert.equal(restored.feedback('python', 0).area, 'explicacion');
}

/* ---------- Las rutas ampliadas conservan los dieciséis anteriores y cierran en 50 ---------- */
for (const id of ['html-css', 'javascript', 'sql']) {
  const {state} = setup();
  avanzar(state, id, Array.from({length:16}, (_, i) => i), [1, 2, 3, 4]);
  assert.equal(state.progress(id).completed, 16);
  assert.equal(state.progress(id).exams, 4);
  assert.equal(state.progress(id).done, false);
  assert.equal(state.resumeIndex(id), 16);
  avanzar(state, id, Array.from({length:34}, (_, i) => i + 16), [5, 6, 7, 8, 9, 10, 11, 12]);
  assert.equal(state.progress(id).completed, 50);
  assert.equal(state.progress(id).done, false);
  assert.equal(state.resumeIndex(id), 48, `${id}: el último examen retoma el nivel parcial 49–50`);
  avanzar(state, id, [], [13]);
  assert.equal(state.progress(id).exams, 13);
  assert.equal(state.progress(id).done, true);
}

/* ---------- meta semanal y repaso basado en intentos ---------- */
{
  const { state } = setup();
  assert.equal(state.metaSemanal(), null, 'la meta es opcional');
  assert.equal(state.definirPlanSemanal('steady'), true);
  assert.equal(state.definirPlanSemanal('imposible'), false);
  let plan = state.metaSemanal();
  assert.equal(plan.objetivo, 7);
  assert.equal(plan.completados, 0);
  state.completar('python', 1);
  state.completar('python', 2);
  plan = state.metaSemanal();
  assert.equal(plan.completados, 2, 'solo cuenta lo completado desde que empezó la semana');
  assert.equal(plan.restantes, 5);
  assert.deepEqual(Array.from(state.sesionesSemana(), item => item.cantidad), [2, 2, 3]);
  assert.equal(state.sesionesSemana()[0].completa, true);
  assert.equal(state.sesionesSemana()[1].actual, true);
  assert.equal(state.pausarPlanSemanal(true), true);
  assert.equal(state.metaSemanal().pausada, true);
  assert.equal(state.sesionesSemana().some(item => item.actual), false);
  assert.equal(state.pausarPlanSemanal(false), true);
  for (let i = 0; i < 3; i += 1) state.registrarIntento('python', 4, {validaciones:[true,false,false],aprobado:false,error:false,ms:100});
  for (let i = 0; i < 2; i += 1) state.registrarIntento('sql', 0, {validaciones:[true,true,false],aprobado:false,error:false,ms:100});
  state.completar('sql', 0);
  const repaso = state.recomendacionesRepaso(2);
  assert.equal(repaso[0].ruta, 'python', 'prioriza el bloqueo que todavía no se supera');
  assert.equal(repaso[0].numero, 5);
  assert.match(repaso[0].motivo, /Retómalo/);
  assert.equal(repaso[1].superado, true);
}

console.log(`Continuidad: ${routes.length} rutas en un documento con esquema, migración desde las claves anteriores,`
  + ` borradores, exámenes, registro de intentos, panel de respaldo, datos corruptos, cuota y catálogo: OK`);

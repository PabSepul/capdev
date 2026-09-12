import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

/*
  Rutas de Expresiones regulares e Inteligencia artificial: resuelve los 24 módulos
  a través del motor real de cada página y comprueba los dos laboratorios.
*/

const read = (name) => fs.readFileSync(new URL("./" + name, import.meta.url), "utf8");

class FakeElement {
  constructor() {
    this.attributes = {};
    this.children = [];
    this.classList = { add() {}, remove() {}, toggle() {}, contains: () => false };
    this.dataset = {};
    this.disabled = false;
    this.hidden = false;
    this.listeners = {};
    this.style = {};
    this.textContent = "";
    this.value = "";
  }

  addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name] ?? null; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  focus() {}
  scrollIntoView() {}
  click() { for (const callback of this.listeners.click || []) callback(); }
  set innerHTML(value) { this._innerHTML = value; if (value === "") this.children = []; }
  get innerHTML() { return this._innerHTML || ""; }
}

function createContext(courseId, files) {
  const elements = new Map();
  const storage = new Map();
  const document = {
    body: { dataset: { course: courseId } },
    createElement: () => new FakeElement(),
    querySelector: (selector) => {
      if (!elements.has(selector)) elements.set(selector, new FakeElement());
      return elements.get(selector);
    },
    querySelectorAll: () => []
  };
  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value)
  };
  const sandbox = { document, localStorage };
  vm.createContext(sandbox);
  for (const name of files) vm.runInContext(read(name), sandbox);
  return {
    elements,
    storage,
    run: (expression) => vm.runInContext(expression, sandbox),
    runJson: (expression) => JSON.parse(vm.runInContext("JSON.stringify(" + expression + ")", sandbox))
  };
}

const REGEX_FILES = ["starter-exams.js", "regex-lab.js", "regex-course.js", "starter-course.js"];
const IA_FILES = ["starter-exams.js", "ia-lab.js", "ia-course.js", "starter-course.js"];

const REGEX_SOLUTIONS = [
  "/codigocero/gi",
  String.raw`/\d{4}/g`,
  String.raw`/\d+ pesos/g`,
  "/^Factura/gm",
  String.raw`/(\d{4})-(\d{2})-(\d{2})/g`,
  "/(ERROR|WARN)/g",
  String.raw`/(\d{4})-(\d{2})-(\d{2})/g` + "\nreemplazo: $3/$2/$1",
  "/(?<usuario>[a-z]+)@(?<dominio>[a-z.]+)/g",
  String.raw`/^\d{4}-\d{2}-\d{2}$/gm`,
  String.raw`/^(\S+) (\w+) (.+)$/gm`,
  String.raw`/^([^:]+):(\d+)$/gm`,
  "/([a-záéíóúñ]+) ([a-záéíóúñ]+)/gi\nreemplazo: $2, $1"
];

const IA_SOLUTIONS = [
  "tokenizar La inteligencia artificial cambia la forma en que buscamos información dentro de una organización grande",
  "costo 5000 rapido\ncosto 5000 avanzado",
  "comparar quiero cancelar mi plan mensual | dar de baja el servicio contratado",
  "temperatura 0.2\ntemperatura 3",
  "prompt\nEres un tutor de matemáticas. Explica el ejercicio paso a paso.",
  "prompt\nEres un tutor de matemáticas. Explica el siguiente ejercicio usando el texto entregado, en una lista de 3 puntos.",
  "prompt\nEres un tutor de matemáticas. Explica el siguiente ejercicio usando el texto entregado, en una lista de 3 puntos. Si no está en el texto, responde que no lo sabes.",
  "prompt\nEres un clasificador de comentarios. Clasifica el siguiente comentario usando el texto entregado, en una sola palabra y máximo una línea. Si no está claro, responde sin_datos y no inventes categorías nuevas. Por ejemplo: entrada “llegó tarde” salida demora.",
  "buscar cancelar suscripción",
  "buscar dar de baja el servicio contratado\ncomparar dar de baja el servicio contratado | Cancelar la suscripción",
  "buscar cancelar suscripción\ncitar Entra a Suscripción y presiona Cancelar [doc-2]",
  "buscar recuperar contraseña acceso\ncitar Usa la opción Recuperar acceso y revisa tu correo [doc-4]\ncosto 800 rapido"
];

const RUTAS = [
  { id: "regex", archivos: REGEX_FILES, soluciones: REGEX_SOLUTIONS, global: "RegexCourse" },
  { id: "ia", archivos: IA_FILES, soluciones: IA_SOLUTIONS, global: "IaCourse" }
];

let modulos = 0;
let comprobaciones = 0;

for (const ruta of RUTAS) {
  const contexto = createContext(ruta.id, ruta.archivos);

  assert.equal(contexto.elements.get("#starter-level-tabs").children.length, 3, ruta.id + ": 3 niveles");
  assert.equal(contexto.elements.get("#starter-module-list").children.length, 4, ruta.id + ": 4 módulos por nivel");
  assert.match(contexto.elements.get("#starter-position").textContent, /de 12$/, ruta.id + ": 12 módulos");

  const fichas = contexto.runJson(
    "globalThis." + ruta.global + ".lessons.map((m) => ({ title: m.title, shortTitle: m.shortTitle, file: m.file," +
    " hints: m.hints.length, concepts: m.concepts.length, checks: m.checks.length }))"
  );
  assert.equal(fichas.length, 12);
  for (const [indice, ficha] of fichas.entries()) {
    const donde = ruta.id + ", módulo " + (indice + 1);
    assert.ok(ficha.title && ficha.shortTitle && ficha.file, donde + ": faltan datos de la ficha");
    assert.ok(ficha.shortTitle.length <= 34, donde + ": el título corto no cabe en la tarjeta");
    assert.equal(ficha.hints, 3, donde + ": deben ser 3 pistas");
    assert.equal(ficha.concepts, 3, donde + ": deben ser 3 conceptos");
    assert.equal(ficha.checks, 3, donde + ": deben ser 3 comprobaciones");
  }

  for (let indice = 0; indice < ruta.soluciones.length; indice += 1) {
    if (indice > 0) contexto.elements.get("#starter-next").click();
    const donde = ruta.id + ", módulo " + (indice + 1);

    contexto.elements.get("#starter-run").click();
    assert.equal(contexto.elements.get("#starter-complete").disabled, true, donde + ": el ejemplo inicial no debe aprobar");

    contexto.elements.get("#starter-code").value = ruta.soluciones[indice];
    contexto.elements.get("#starter-run").click();
    const fallidas = contexto.elements.get("#starter-validations").children
      .map((item, posicion) => (item.className === "validation-passed" ? null : posicion + 1))
      .filter(Boolean);
    assert.deepEqual(fallidas, [], donde + ": comprobaciones sin cumplir " + fallidas.join(", "));
    assert.equal(contexto.elements.get("#starter-complete").disabled, false, donde + " debe validar");

    modulos += 1;
    comprobaciones += contexto.elements.get("#starter-validations").children.length;
    contexto.elements.get("#starter-complete").click();
  }

  assert.equal(contexto.elements.get("#starter-completed").textContent, "12 completados", ruta.id + ": progreso completo");

  const examenes = contexto.runJson('globalThis.StarterExams.LEVEL_EXAMS["' + ruta.id + '"]');
  assert.equal(examenes.length, 3, ruta.id + ": 3 exámenes");
  for (const examen of examenes) {
    assert.equal(examen.questions.length, 5);
    for (const pregunta of examen.questions) {
      assert.equal(pregunta.options.length, 4);
      assert.equal(new Set(pregunta.options).size, 4, ruta.id + ": alternativas repetidas");
      assert.ok(Number.isInteger(pregunta.answer) && pregunta.answer >= 0 && pregunta.answer < 4);
      assert.ok(pregunta.explanation.length > 20);
    }
  }
  const aprobado = contexto.runJson(
    'globalThis.StarterExams.gradeExam("' + ruta.id + '", 1, new Map(globalThis.StarterExams.LEVEL_EXAMS["' + ruta.id + '"][0].questions.map((q, i) => [i, q.answer])))'
  );
  assert.equal(aprobado.passed, true, ruta.id + ": responder bien debe aprobar");
}

/* El laboratorio de patrones ejecuta el motor real y se protege del retroceso catastrófico */

const regex = createContext("regex", REGEX_FILES);
const correr = (patron, texto) => regex.runJson(
  "globalThis.RegexLab.run(" + JSON.stringify(patron) + ", " + JSON.stringify({ texto }) + ")"
);

const encontrado = correr(String.raw`/\d+/g`, "hay 3 gatos y 12 perros");
assert.equal(encontrado.error, null);
assert.deepEqual(encontrado.matches.map((m) => m.valor), ["3", "12"], "usa el motor real del navegador");

const conGrupos = correr(String.raw`/(\w+)@(\w+)/`, "ana@correo");
assert.deepEqual(conGrupos.matches[0].grupos, ["ana", "correo"], "entrega los grupos capturados");

const rechazos = [
  [String.raw`/(a+)+b/`, /retroceso|tardar/i],
  ["hola", /entre barras/i],
  ["/abierto", /barra que cierra/i],
  ["/valido/z", /bandera/i],
  [String.raw`/(/`, /no es válido/i]
];
for (const [patron, esperado] of rechazos) {
  const resultado = correr(patron, "texto de prueba");
  assert.ok(resultado.error, "debía rechazarse: " + patron);
  assert.match(resultado.text, esperado, patron + " → mensaje inesperado: " + resultado.text);
}

const reemplazado = correr(String.raw`/(\d)(\d)/g` + "\nreemplazo: $2$1", "12 34");
assert.equal(reemplazado.resultado, "21 43", "aplica la sustitución con los grupos");

/* El laboratorio de IA calcula, no simula */

const ia = createContext("ia", IA_FILES);
const ejecutar = (texto) => ia.runJson("globalThis.IaLab.run(" + JSON.stringify(texto) + ")");

const costo = ejecutar("costo 2000 avanzado");
assert.equal(costo.acciones[0].total, 24, "2000 tokens a 12 CLP por mil son 24 CLP");

const iguales = ejecutar("comparar cancelar suscripción | cancelar suscripción");
assert.equal(iguales.acciones[0].puntaje, 1, "dos textos idénticos dan similitud 1");

const distintos = ejecutar("comparar certificado del curso | tarjeta de crédito");
assert.equal(distintos.acciones[0].puntaje, 0, "sin palabras en común la similitud es 0");

const temperaturas = ejecutar("temperatura 0.1\ntemperatura 5");
const [frio, calor] = temperaturas.acciones;
assert.ok(frio.distribucion[0].probabilidad > calor.distribucion[0].probabilidad, "más temperatura aplana la distribución");
for (const item of temperaturas.acciones) {
  const suma = item.distribucion.reduce((total, dato) => total + dato.probabilidad, 0);
  assert.ok(Math.abs(suma - 100) < 0.5, "las probabilidades deben sumar 100 %");
}

const inventado = ejecutar("buscar cancelar\ncitar Llama al call center [doc-42]");
assert.deepEqual(inventado.acciones[1].inventados, ["doc-42"], "detecta un identificador que no existe");

const sinBuscar = ejecutar("citar cualquier cosa [doc-1]");
assert.ok(sinBuscar.error, "citar sin buscar antes debe explicarse");

const desconocido = ejecutar("resumir el texto");
assert.match(desconocido.text, /No conozco el comando/, "un comando inexistente no puede inventar salida");

const declara = ejecutar("prompt\nResume esto.");
assert.match(declara.text, /no ejecuta ningún modelo de lenguaje/, "el laboratorio declara que no genera texto");

const fuentes = ["regex-lab.js", "ia-lab.js", "regex-course.js", "ia-course.js"].map(read).join("\n");
assert.equal(/\beval\s*\(|new Function/.test(fuentes), false, "los laboratorios no pueden usar eval ni Function");
assert.equal(/fetch\s*\(|XMLHttpRequest/.test(fuentes), false, "no pueden salir a la red");

console.log(`Regex e IA: 2 rutas, ${modulos} módulos resueltos, ${comprobaciones} validaciones, 6 exámenes y 30 preguntas: OK`);

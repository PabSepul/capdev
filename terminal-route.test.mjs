import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

/* El avance vive en un documento con esquema, no en una clave por ruta.
   Estas aserciones hablaban de lo guardado, y ahí es donde se comprueba. */
const guardado = (storage, id) =>
  (JSON.parse(storage.get("codigo-cero.perfil-v1") || "{}").rutas || {})[id] || { completados: [], examenes: [] };


/*
  Ruta Terminal: resuelve los 12 módulos con las soluciones que declara el propio
  curso, y comprueba el shell simulado, los desbloqueos y los tres exámenes.
*/

const read = (name) => fs.readFileSync(new URL("./" + name, import.meta.url), "utf8");
const FILES = ["learning-state.js", "starter-exams.js", "terminal-lab.js", "terminal-course.js", "starter-course.js"];

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

function createContext() {
  const elements = new Map();
  const storage = new Map();
  const document = {
    body: { dataset: { course: "terminal" } },
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
  for (const name of FILES) vm.runInContext(read(name), sandbox);
  return {
    elements,
    storage,
    run: (expression) => vm.runInContext(expression, sandbox),
    runJson: (expression) => JSON.parse(vm.runInContext("JSON.stringify(" + expression + ")", sandbox))
  };
}

const contexto = createContext();

/* 1. Estructura del curso */

const fichas = contexto.runJson(
  "globalThis.TerminalCourse.lessons.map((m) => ({ title: m.title, shortTitle: m.shortTitle, file: m.file," +
  " hints: m.hints.length, concepts: m.concepts.length, checks: m.checks.length, tieneSolucion: Boolean(m.solution) }))"
);
assert.equal(fichas.length, 12, "la ruta tiene 12 módulos");
assert.equal(contexto.elements.get("#starter-level-tabs").children.length, 3, "3 niveles");
assert.equal(contexto.elements.get("#starter-module-list").children.length, 4, "4 módulos por nivel");
assert.match(contexto.elements.get("#starter-position").textContent, /de 12$/);

for (const [indice, ficha] of fichas.entries()) {
  const donde = "módulo " + (indice + 1);
  assert.ok(ficha.title && ficha.shortTitle && ficha.file, donde + ": faltan datos de la ficha");
  assert.ok(ficha.shortTitle.length <= 34, donde + ": el título corto no cabe en la tarjeta (" + ficha.shortTitle.length + ")");
  assert.equal(ficha.hints, 3, donde + ": deben ser 3 pistas");
  assert.equal(ficha.concepts, 3, donde + ": deben ser 3 conceptos");
  assert.equal(ficha.checks, 3, donde + ": deben ser 3 comprobaciones");
  assert.ok(ficha.tieneSolucion, donde + ": falta la solución de referencia");
}

/* 2. Los doce módulos se resuelven con la solución que declara el curso */

const soluciones = contexto.runJson("globalThis.TerminalCourse.lessons.map((m) => m.solution)");
let comprobaciones = 0;

for (let indice = 0; indice < soluciones.length; indice += 1) {
  if (indice > 0) contexto.elements.get("#starter-next").click();
  const donde = "módulo " + (indice + 1);

  contexto.elements.get("#starter-run").click();
  assert.equal(contexto.elements.get("#starter-complete").disabled, true, donde + ": el ejemplo inicial no debe aprobar");

  contexto.elements.get("#starter-code").value = soluciones[indice];
  contexto.elements.get("#starter-run").click();
  const fallidas = contexto.elements.get("#starter-validations").children
    .map((item, posicion) => (item.className === "validation-passed" ? null : posicion + 1))
    .filter(Boolean);
  assert.deepEqual(fallidas, [], donde + ": comprobaciones sin cumplir " + fallidas.join(", "));
  assert.equal(contexto.elements.get("#starter-complete").disabled, false, donde + " debe validar");
  assert.equal(contexto.elements.get("#starter-success").hidden, false, donde + " debe mostrar éxito");

  comprobaciones += contexto.elements.get("#starter-validations").children.length;
  contexto.elements.get("#starter-complete").click();
}

assert.equal(contexto.elements.get("#starter-completed").textContent, "12 completados");
assert.equal(contexto.elements.get("#starter-next").disabled, true, "termina en el último módulo");
assert.deepEqual(guardado(contexto.storage, "terminal").completados, [...Array(12).keys()]);

/* 3. Exámenes */

const examenes = contexto.runJson('globalThis.StarterExams.LEVEL_EXAMS.terminal');
assert.equal(examenes.length, 3, "3 exámenes");
for (const examen of examenes) {
  assert.equal(examen.questions.length, 5, "5 preguntas por examen");
  assert.equal(examen.passing, 4);
  for (const pregunta of examen.questions) {
    assert.equal(pregunta.options.length, 4);
    assert.equal(new Set(pregunta.options).size, 4, "alternativas repetidas");
    assert.ok(Number.isInteger(pregunta.answer) && pregunta.answer >= 0 && pregunta.answer < 4);
    assert.ok(pregunta.explanation.length > 20);
  }
}
const aprobado = contexto.runJson(
  'globalThis.StarterExams.gradeExam("terminal", 1, new Map(globalThis.StarterExams.LEVEL_EXAMS.terminal[0].questions.map((q, i) => [i, q.answer])))'
);
assert.equal(aprobado.passed, true, "responder bien debe aprobar");
const reprobado = contexto.runJson(
  'globalThis.StarterExams.gradeExam("terminal", 1, new Map(globalThis.StarterExams.LEVEL_EXAMS.terminal[0].questions.map((q, i) => [i, i < 2 ? (q.answer + 1) % 4 : q.answer])))'
);
assert.equal(reprobado.passed, false, "3 de 5 no aprueba");

/* 4. El shell simulado se comporta como corresponde */

const lab = createContext();
const casos = [
  ["pwd", "/proyecto"],
  ["ls", "README.md"],
  ["cd docs\npwd", "/proyecto/docs"],
  ['echo "hola" > a.txt\ncat a.txt', "hola"],
  ['echo "uno" > a.txt\necho "dos" >> a.txt\ncat a.txt', "uno\ndos"],
  ["cat datos/cursos.txt | wc -l", "4"],
  ['grep "Pendiente" docs/notas.txt', "Pendiente: leer"]
];
for (const [comando, esperado] of casos) {
  const resultado = lab.runJson("globalThis.TerminalLab.run(" + JSON.stringify(comando) + ")");
  assert.equal(resultado.error, null, "no debía fallar: " + comando);
  assert.ok(resultado.text.includes(esperado), comando + " → esperaba " + JSON.stringify(esperado) + " en:\n" + resultado.text);
}

const rechazos = [
  ["sudo rm -rf /", /no disponible/i],
  ["cat /etc/passwd", /No existe el archivo/i],
  ["ls | rm a.txt", /lectura o salida/i],
  ["echo hola > /noexiste/a.txt", /No existe la carpeta de destino/i],
  ["rm -rf", /no hay borrado recursivo/i],
  ["rm docs README.md", /se espera 1 argumento/i],
  ["cd inexistente", /No existe la carpeta/i],
  ['echo "$HOME"', /no admite variables/i]
];
for (const [comando, patron] of rechazos) {
  const resultado = lab.runJson("globalThis.TerminalLab.run(" + JSON.stringify(comando) + ")");
  assert.ok(resultado.error, "debía rechazarse: " + comando);
  assert.match(resultado.text, patron, comando + " → mensaje inesperado: " + resultado.text);
}

const antes = lab.runJson('globalThis.TerminalLab.run("rm README.md\\nls")');
const despues = lab.runJson('globalThis.TerminalLab.run("ls")');
assert.equal(antes.error, null);
assert.ok(despues.text.includes("README.md"), "cada intento parte del mismo estado inicial");

const fuentes = ["terminal-lab.js", "terminal-course.js"].map(read).join("\n");
assert.equal(/\beval\s*\(|new Function/.test(fuentes), false, "el laboratorio no puede usar eval ni Function");
assert.equal(/require\s*\(|child_process|fetch\s*\(/.test(fuentes), false, "el laboratorio no puede tocar el sistema ni la red");

console.log(`Terminal: 12 módulos resueltos, ${comprobaciones} validaciones, 3 exámenes, 15 preguntas y 14 casos del shell: OK`);

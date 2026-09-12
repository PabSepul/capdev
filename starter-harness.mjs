/* Arnés compartido por las pruebas de ruta. No se publica en el sitio: monta un
   DOM falso y ejecuta starter-course.js tal como lo haría la página, de modo que
   cada módulo se resuelve por el mismo camino que recorre una persona. */
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

export const read = (name) => fs.readFileSync(new URL("./" + name, import.meta.url), "utf8");

export class FakeElement {
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

export function createContext(courseId, files, globals = {}) {
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
  const sandbox = { ...globals, document, localStorage };
  vm.createContext(sandbox);
  /* learning-state.js es el dueño del avance y toda página lo carga antes que el
     controlador: sin él, completar un módulo no guardaría nada. */
  for (const name of ["learning-state.js", ...files]) vm.runInContext(read(name), sandbox);
  return {
    elements,
    storage,
    run: (expression) => vm.runInContext(expression, sandbox),
    runJson: (expression) => JSON.parse(vm.runInContext("JSON.stringify(" + expression + ")", sandbox))
  };
}

/* Resuelve una ruta completa por el camino real: comprueba que el código inicial
   NO apruebe, escribe la solución de referencia y exige las tres validaciones. */
export function solveRoute({ id, files, solutions, globalName, levels = 3, modules = 12, globals = {} }) {
  const context = createContext(id, files, globals);
  assert.equal(context.elements.get("#starter-level-tabs").children.length, levels, id + ": " + levels + " niveles");
  assert.equal(context.elements.get("#starter-module-list").children.length, modules / levels, id + ": módulos por nivel");
  assert.match(context.elements.get("#starter-position").textContent, new RegExp("de " + modules + "$"), id + ": " + modules + " módulos");

  const fichas = context.runJson(
    "globalThis." + globalName + ".lessons.map((m) => ({ title: m.title, shortTitle: m.shortTitle, file: m.file," +
    " intro: m.intro, goal: m.goal, starter: m.starter, hints: m.hints.length, concepts: m.concepts.length, checks: m.checks.length }))"
  );
  assert.equal(fichas.length, modules, id + ": " + modules + " módulos definidos");
  const titulos = new Set();
  for (const [indice, ficha] of fichas.entries()) {
    const donde = id + ", módulo " + (indice + 1);
    assert.ok(ficha.title && ficha.shortTitle && ficha.file, donde + ": faltan datos de la ficha");
    assert.ok(ficha.shortTitle.length <= 34, donde + ": el título corto no cabe en la tarjeta");
    assert.ok(ficha.intro.length >= 40, donde + ": la introducción es demasiado corta");
    assert.ok(ficha.goal.length >= 30, donde + ": la misión debe decir qué se espera");
    assert.ok(typeof ficha.starter === "string" && ficha.starter.length > 0, donde + ": falta el código inicial");
    assert.equal(ficha.hints, 3, donde + ": deben ser 3 pistas");
    assert.equal(ficha.concepts, 3, donde + ": deben ser 3 conceptos");
    assert.equal(ficha.checks, 3, donde + ": deben ser 3 comprobaciones");
    assert.equal(titulos.has(ficha.title), false, donde + ": el título se repite");
    titulos.add(ficha.title);
  }

  let comprobaciones = 0;
  for (let indice = 0; indice < solutions.length; indice += 1) {
    if (indice > 0) context.elements.get("#starter-next").click();
    const donde = id + ", módulo " + (indice + 1);

    context.elements.get("#starter-run").click();
    assert.equal(context.elements.get("#starter-complete").disabled, true, donde + ": el código inicial no debe aprobar");

    context.elements.get("#starter-code").value = solutions[indice];
    context.elements.get("#starter-run").click();
    const fallidas = context.elements.get("#starter-validations").children
      .map((item, posicion) => (item.className === "validation-passed" ? null : posicion + 1))
      .filter(Boolean);
    assert.deepEqual(fallidas, [], donde + ": comprobaciones sin cumplir " + fallidas.join(", ")
      + "\nsalida:\n" + context.elements.get("#starter-output").textContent);
    assert.equal(context.elements.get("#starter-complete").disabled, false, donde + " debe validar");

    comprobaciones += context.elements.get("#starter-validations").children.length;
    context.elements.get("#starter-complete").click();
  }

  assert.equal(context.elements.get("#starter-completed").textContent, modules + " completados", id + ": progreso completo");
  return { context, comprobaciones };
}

export function checkExams(context, id, levels = 3) {
  const examenes = context.runJson('globalThis.StarterExams.LEVEL_EXAMS["' + id + '"]');
  assert.equal(examenes.length, levels, id + ": " + levels + " exámenes");
  let preguntas = 0;
  for (const examen of examenes) {
    assert.equal(examen.questions.length, 5, id + ": cada examen tiene 5 preguntas");
    assert.equal(examen.passing, 4, id + ": se aprueba con 4 aciertos");
    for (const pregunta of examen.questions) {
      assert.equal(pregunta.options.length, 4, id + ": cada pregunta ofrece 4 alternativas");
      assert.equal(new Set(pregunta.options).size, 4, id + ": las alternativas no se repiten");
      assert.ok(Number.isInteger(pregunta.answer) && pregunta.answer >= 0 && pregunta.answer < 4,
        id + ": la respuesta correcta debe existir");
      assert.ok(pregunta.explanation && pregunta.explanation.length >= 20,
        id + ": cada pregunta necesita una explicación");
      preguntas += 1;
    }
  }
  return preguntas;
}

/* Los laboratorios no pueden ejecutar código arbitrario ni salir a la red. */
export function checkSafety(files) {
  const fuentes = files.map(read).join("\n");
  assert.equal(/\beval\s*\(|\bnew Function\b/.test(fuentes), false, "no se puede usar eval ni Function");
  assert.equal(/fetch\s*\(|XMLHttpRequest/.test(fuentes), false, "no se puede salir a la red");
}

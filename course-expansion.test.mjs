import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

/* El avance vive en un documento con esquema, no en una clave por ruta.
   Estas aserciones hablaban de lo guardado, y ahí es donde se comprueba. */
const guardado = (storage, id) =>
  (JSON.parse(storage.get("codigo-cero.perfil-v1") || "{}").rutas || {})[id] || { completados: [], examenes: [] };


const read = name => fs.readFileSync(new URL(name, import.meta.url), "utf8");
class Element {
  constructor() {
    this.children = []; this.listeners = {}; this.attributes = {}; this.dataset = {}; this.style = {};
    this.classList = { add() {}, remove() {}, toggle() {} }; this.value = ""; this.textContent = "";
  }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  fire(type) { for (const fn of this.listeners[type] || []) fn(); }
  click() { if (!this.disabled) this.fire("click"); }
  setAttribute(key, value) { this.attributes[key] = value; }
  getAttribute(key) { return this.attributes[key]; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  focus() {} scrollIntoView() {} select() {}
}
const routeIds = ["html-css", "javascript", "sql", "git", "apis"];
function setup(id, storage = new Map()) {
  const elements = new Map();
  const get = key => { if (!elements.has(key)) elements.set(key, new Element()); return elements.get(key); };
  const context = vm.createContext({
    document: { body: { dataset: { course: id } }, getElementById: get, querySelector: get, querySelectorAll: () => [], createElement: () => new Element() },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    navigator: { clipboard: { writeText() {} } },
  });
  // La integración de cuentas se cubre con DOM real en accounts-ui.test.mjs.
  const uiScripts = ["site.js", "review-preview.js", "account-config.js",
    "vendor/supabase-2.116.0.js", "learning-sync.js", "account.js"];
  const scripts = [...read(id + ".html").matchAll(/<script src="([^"?]+)/g)].map(m => m[1]).filter(name => !uiScripts.includes(name));
  for (const name of scripts) {
    if (name === "starter-course.js") vm.runInContext("const originalApply = CourseExpansion.apply; CourseExpansion.apply = courses => { originalApply(courses); globalThis.TestCourses = courses; };", context);
    vm.runInContext(read(name), context, { filename: name });
  }
  return { context, get, storage };
}
const execute = (ctx, id, lesson, code) => id === "html-css" ? { code } : id === "javascript" ? ctx.StarterRuntime.runJavaScript(code) : id === "sql" ? ctx.StarterRuntime.runSql(code) : id === "git" ? ctx.GitLab.run(code, lesson.scenario) : ctx.ApiLab.run(code);
let modules = 0;
for (const id of routeIds) {
  const expandedToFifty = ["html-css", "javascript", "sql", "git"].includes(id);
  const fresh = setup(id);
  assert.equal(fresh.get("#starter-level-tabs").children.length, expandedToFifty ? 13 : 4);
  if (expandedToFifty) assert.match(fresh.get("#starter-level-tabs").children[9].innerHTML, /^<span>10<\/span>/, "los niveles 10–13 no anteponen un cero extra");
  assert.equal(fresh.get("#starter-level-tabs").children[3].disabled, true, "el nivel nuevo empieza cerrado");
  const completeKey = `codigo-cero.${id}-v2.completed`;
  const examsKey = `codigo-cero.${id}-v2.exams`;
  const storage = new Map([[completeKey, JSON.stringify(Array.from({ length: 12 }, (_, i) => i))], [examsKey, "[1,2,3]"]]);
  const app = setup(id, storage);
  const { context: ctx, get } = app;
  const course = ctx.TestCourses[id];
  assert.equal(course.levels.length, expandedToFifty ? 13 : 4);
  if (id === "html-css") {
    const htmlModules = course.levels.flatMap(level => level.modules);
    assert.equal(htmlModules.length, 50);
    for (const module of htmlModules) {
      assert.ok(module.example.includes("<"), module.title + ": ejemplo HTML completo");
      assert.equal(module.hints.length, 3, module.title + ": tres pistas graduales");
      for (const field of ["prerequisites", "prediction", "answer", "reflection", "extension"])
        assert.ok(module.lesson[field].length > 20, module.title + ": falta " + field);
      assert.ok(module.lesson.walkthrough.length >= 2 && module.lesson.walkthrough.length <= 4, module.title + ": pasos del ejemplo");
      assert.equal(module.lesson.feedback.length, module.checks.length, module.title + ": ayuda por comprobación");
    }
    assert.equal(get("#starter-lesson-support").hidden, false);
    assert.equal(get("#starter-example-steps").children.length, 3);
    assert.match(get("#starter-prerequisites").textContent, /HTML|Ninguno|etiquetas|Selectores|Contenedores|Formularios|Agrupación|Botones|Secciones/i);
    get("#starter-run").click();
    assert.equal(get("#starter-coaching").hidden, false, "un inicio incompleto muestra orientación");
    assert.ok(get("#starter-coaching").textContent.length > 30);
  }
  if (id === "javascript") {
    const javascriptModules = course.levels.flatMap(level => level.modules);
    assert.equal(javascriptModules.length, 50);
    for (const module of javascriptModules) {
      assert.equal(module.hints.length, 3, module.title + ": tres pistas graduales");
      for (const field of ["prerequisites", "prediction", "answer", "reflection", "extension"])
        assert.ok(module.lesson[field].length > 20, module.title + ": falta " + field);
      assert.ok(module.lesson.walkthrough.length >= 2 && module.lesson.walkthrough.length <= 4, module.title + ": pasos del ejemplo");
      assert.equal(module.lesson.feedback.length, module.checks.length, module.title + ": ayuda por comprobación");
      const example = ctx.StarterRuntime.runJavaScript(module.example);
      assert.equal(example.error, null, module.title + ": el ejemplo debe ejecutarse: " + example.error);
      assert.ok(example.output.length > 0, module.title + ": el ejemplo debe mostrar un resultado");
      const native = [];
      vm.runInNewContext(module.example, { console: { log: value => native.push(String(value)) } });
      assert.equal(example.text, native.join("\n"), module.title + ": el ejemplo coincide con JavaScript nativo");
    }
    assert.equal(get("#starter-lesson-support").hidden, false);
    assert.equal(get("#starter-example-steps").children.length, 3);
    assert.equal(get("#starter-prediction-answer").open, false);
    get("#starter-run").click();
    assert.equal(get("#starter-coaching").hidden, false, "un inicio incompleto muestra orientación");
    assert.ok(get("#starter-coaching").textContent.length > 30);
  }
  if (["sql", "git", "apis"].includes(id)) {
    const standardizedModules = course.levels.flatMap(level => level.modules);
    assert.equal(standardizedModules.length, expandedToFifty ? 50 : 16);
    for (const module of standardizedModules) {
      assert.equal(module.hints.length, 3, module.title + ": tres pistas graduales");
      for (const field of ["prerequisites", "prediction", "answer", "reflection", "extension"])
        assert.ok(module.lesson[field].length > 20, module.title + ": falta " + field);
      assert.equal(module.lesson.walkthrough.length, 3, module.title + ": tres pasos explicados");
      assert.equal(module.lesson.feedback.length, module.checks.length, module.title + ": ayuda por comprobación");
    }
  }
  assert.equal(ctx.LearningState.progress(id).count, expandedToFifty ? 50 : 16);
  assert.equal(ctx.LearningState.progress(id).completed, 12);
  assert.equal(ctx.LearningState.progress(id).exams, 3);
  assert.equal(ctx.LearningState.progress(id).done, false, "el avance previo se conserva y hay contenido nuevo");
  assert.equal(get("#starter-level-tabs").children[3].disabled, false);
  assert.equal(get("#starter-finish").hidden, true);
  // Entrar a la ampliación no modifica los tres niveles ni exámenes ya completados.
  get("#starter-level-tabs").children[3].click();
  for (let i = 0; i < 4; i++) {
    const lesson = course.levels[3].modules[i];
    assert.equal(lesson.hints.length, 3);
    assert.equal(lesson.checks.length, 3);
    for (const key of ["intro", "explanation", "goal", "solution"]) assert.ok(lesson[key].length > 20, lesson.title + ": " + key);
    const expected = execute(ctx, id, lesson, lesson.solution);
    assert.ok(!expected.error, lesson.title + ": " + expected.error);
    assert.ok(lesson.checks.every(c => c.test(lesson.solution, expected)), lesson.title + ": solución no aprueba " + JSON.stringify(expected));
    assert.ok(!lesson.checks.every(c => c.test(lesson.starter, execute(ctx, id, lesson, lesson.starter))), lesson.title + ": el inicio no debe aprobar");
    get("#starter-module-list").children[i].click();
    get("#starter-code").value = lesson.solution;
    get("#starter-code").fire("input");
    get("#starter-run").click();
    assert.equal(get("#starter-complete").disabled, false, lesson.title);
    get("#starter-complete").click();
    if (id === "javascript") {
      const native = [];
      vm.runInNewContext(lesson.solution, { console: { log: value => native.push(String(value)) } });
      assert.equal(expected.text, native.join("\n"), "la solución coincide con JavaScript nativo");
    }
    if (id === "sql") {
      assert.equal(ctx.StarterRuntime.runSql(lesson.worked).error, null);
      assert.ok(get("#sql-lesson-guide").children.length > 0, "guía SQL integrada");
    }
    modules++;
  }
  assert.equal(guardado(storage, id).completados.length, 16);
  assert.equal(get("#starter-finish").hidden, true, "falta aprobar el examen nuevo");
  const exam = ctx.StarterExams.LEVEL_EXAMS[id][3];
  assert.equal(exam.questions.length, 5);
  for (const question of exam.questions) { assert.equal(question.options.length, 4); assert.ok(question.explanation); }
  const answers = exam.questions.map(q => q.answer);
  assert.equal(ctx.StarterExams.gradeExam(id, 4, answers).correct, 5);
  assert.equal(ctx.StarterExams.gradeExam(id, 4, answers.map((a, i) => i < 2 ? (a + 1) % 4 : a)).passed, false);
  get("#checkpoint-exam").click();
  get("#exam-submit").click();
  assert.match(get("#exam-result").textContent, /Responde/);
  exam.questions.forEach((q, i) => get("#exam-questions").children[i].children[1].children[q.answer].click());
  get("#exam-submit").click();
  assert.equal(get("#starter-finish").hidden, expandedToFifty);
  assert.deepEqual(guardado(storage, id).examenes, [1, 2, 3, 4]);
  const reload = setup(id, storage);
  assert.equal(reload.context.LearningState.progress(id).done, !expandedToFifty);
  assert.equal(reload.get("#starter-finish").hidden, expandedToFifty);
  assert.equal(reload.get("#starter-code").value, course.levels[3].modules[3].solution);
}

// Los mini cursos guiados dejaron de existir: React y TypeScript son rutas
// completas y se prueban en route-react.test.mjs y route-typescript.test.mjs.

// Los paneles de HTML/CSS deben usar las variables del tema de la experiencia.
// Un nombre inexistente activa el color de respaldo claro y rompe el contraste oscuro.
const learningCss = read("course-learning.css");
for (const token of ["--ink", "--ink-soft", "--line", "--surface-muted"])
  assert.ok(learningCss.includes(`var(${token}`), `falta integrar ${token} en el tema`);
for (const obsolete of ["--text", "--muted", "--border", "--accent"])
  assert.equal(learningCss.includes(`var(${obsolete}`), false, `${obsolete} no pertenece al tema de las rutas`);
for (const sharedRule of ["font-size: .84rem", "font-size: .83rem", "font-size: .8rem", "line-height: 1.8", "padding: 18px", "border-radius: 10px"])
  assert.ok(learningCss.includes(sharedRule), `HTML/CSS debe conservar la escala de Python: ${sharedRule}`);

console.log(`Ampliación: ${modules} módulos y 5 exámenes; progreso anterior, desbloqueos, cierre, recarga, laboratorios y tema: OK`);

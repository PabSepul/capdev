import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = (file) => fs.readFileSync(new URL(`./${file}`, import.meta.url), "utf8");
const html = read("sql.html");
const guideSource = read("sql-guide.js");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);

class Element {
  constructor(tagName = "div") {
    this.tagName = tagName;
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.classList = { add() {}, toggle() {} };
    this.style = {};
    this.hidden = false;
    this.disabled = false;
    this.value = "";
    this.textContent = "";
    this.className = "";
  }
  setAttribute(key, value) { this.attributes[key] = value; }
  addEventListener(type, handler) { (this.listeners[type] ||= []).push(handler); }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  click() { for (const handler of this.listeners.click || []) handler(); }
  focus() {}
  scrollIntoView() {}
}

const elements = new Map(ids.map((id) => [id, new Element()]));
const document = {
  body: { dataset: { course: "sql" } },
  querySelector: (selector) => elements.get(selector.slice(1)) || null,
  createElement: (tag) => new Element(tag)
};
const storage = new Map();
const sandbox = { document, localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) } };
vm.createContext(sandbox);
for (const file of ["starter-runtime.js", "sql-course.js", "sql-guide.js", "starter-exams.js", "starter-course.js"]) vm.runInContext(read(file), sandbox);
const course = sandbox.SQLCourse;
const runtime = sandbox.StarterRuntime;
const el = (id) => elements.get(id);
const text = (node) => node.textContent + node.children.map(text).join(" ");
const tableRows = (id) => el(id).children[0].children.find((child) => child.tagName === "tbody").children;
const originalTables = JSON.stringify(runtime.tables);

for (const match of guideSource.matchAll(/element\("([^"]+)"\)/g)) assert.ok(ids.includes(match[1]), `Falta #${match[1]} en el HTML real`);
for (const section of ["antes-de-empezar", "datos", "modulos", "laboratorio", "guia-rapida", "practica-extra"]) assert.ok(ids.includes(section));
assert.ok(html.indexOf('src="sql-course.js') < html.indexOf('src="sql-guide.js'));
assert.ok(html.indexOf('src="sql-guide.js') < html.indexOf('src="starter-course.js'));

assert.equal(tableRows("sql-data-table").length, 7);
assert.match(text(el("sql-data-schema")), /inscritos.*muestra/);
el("sql-data-estudiantes").click();
assert.equal(tableRows("sql-data-table").length, 8);
assert.equal(el("sql-data-estudiantes").attributes["aria-pressed"], "true");
assert.match(text(el("sql-data-schema")), /curso_id/);
el("sql-data-cursos").click();
assert.equal(el("sql-data-count").textContent, "7 filas · 6 columnas");

assert.equal(course.lessons.length, 12);
for (let index = 0; index < course.lessons.length; index += 1) {
  const lesson = course.lessons[index];
  assert.ok(lesson.paragraphs.length >= 2);
  assert.ok(lesson.steps.length >= 3);
  assert.equal(lesson.mistakes.length, 2);
  assert.equal(lesson.hints.length, 3);
  assert.ok(lesson.question && lesson.answer);
  const worked = runtime.runSql(lesson.worked);
  assert.equal(worked.error, null, `Ejemplo resuelto del módulo ${index + 1}`);
  assert.notEqual(lesson.worked, lesson.solution, "el ejemplo debe transferirse, no copiar la solución exacta");
  assert.equal(lesson.expected.error, null);

  if (index > 0) el("starter-next").click();
  assert.equal(el("starter-position").textContent, `Módulo ${index + 1} de 12`);
  assert.match(text(el("sql-lesson-guide")), /Desarmemos un ejemplo/);
  assert.ok(text(el("sql-lesson-review")).includes(lesson.question));
  assert.equal(tableRows("sql-expected-table").length, lesson.expected.rows.length);
  el("starter-run").click();
  assert.equal(el("starter-complete").disabled, true, "la consulta inicial no resuelve la misión");
  el("starter-code").value = lesson.solution;
  el("starter-run").click();
  assert.equal(el("starter-complete").disabled, false);
  assert.equal(el("starter-output").hidden, true, "la salida válida utiliza una tabla real, no ASCII");
  assert.equal(el("sql-result-table").hidden, false);
  assert.equal(tableRows("sql-result-table").length, lesson.expected.rows.length);
  el("starter-complete").click();

  const incorrect = JSON.parse(JSON.stringify(lesson.expected));
  incorrect.rows[0][incorrect.columns[0]] = "dato que no corresponde";
  assert.equal(course.matchesResult(incorrect, lesson.expected, lesson.orderBy), false, "tener la misma cantidad de filas no alcanza");
}
assert.equal(el("starter-completed").textContent, "12 completados");
assert.equal(el("starter-finish").hidden, true, "se mantienen los exámenes como requisito de cierre");

const grouped = JSON.parse(JSON.stringify(course.lessons[10].expected));
[grouped.rows[2], grouped.rows[3]] = [grouped.rows[3], grouped.rows[2]];
assert.equal(course.matchesResult(grouped, course.lessons[10].expected, "total"), true, "los empates admiten distinto orden");
const descending = JSON.parse(JSON.stringify(course.lessons[6].expected));
descending.rows.reverse();
assert.equal(course.matchesResult(descending, course.lessons[6].expected, "inscritos"), false);

el("starter-code").value = "DELETE FROM cursos;";
el("starter-run").click();
assert.equal(el("sql-result-table").hidden, true);
assert.equal(el("starter-output").hidden, false);
assert.match(el("sql-result-status").className, /is-error/);
el("starter-code").value = "SELECT nombre FROM cursos WHERE nivel = 'No existe';";
el("starter-run").click();
assert.equal(el("sql-result-table").hidden, false);
assert.equal(el("starter-output").hidden, true);
assert.match(el("sql-result-status").textContent, /0 filas/);
assert.match(text(el("sql-result-table")), /No hay filas/);

const moduleDraft = el("starter-code").value;
const moduleStorage = JSON.stringify([...storage]);
for (let index = 0; index < course.practices.length; index += 1) {
  el("sql-practice-picker").children[index].click();
  el("sql-extra-run").click();
  assert.doesNotMatch(el("sql-extra-status").textContent, /Desafío resuelto/);
  assert.ok(course.practices[index].concept.length > 100);
  el("sql-extra-code").value = course.practices[index].solution;
  el("sql-extra-run").click();
  assert.match(el("sql-extra-status").textContent, /Desafío resuelto/);
}
assert.equal(el("starter-code").value, moduleDraft, "la práctica adicional no pisa el editor del módulo");
assert.equal(JSON.stringify([...storage]), moduleStorage, "la práctica adicional no modifica módulos ni exámenes");
el("sql-extra-code").value = "SELECT nombre FROM cursos;";
el("sql-practice-picker").children[0].click();
el("sql-practice-picker").children[2].click();
assert.equal(el("sql-extra-code").value, "SELECT nombre FROM cursos;", "se conservan los borradores al cambiar de desafío");
el("sql-extra-reset").click();
assert.equal(el("sql-extra-code").value, course.practices[2].starter);

const injected = runtime.runSql("SELECT '<img src=x onerror=alert(1)>' AS ejemplo FROM cursos LIMIT 1;");
sandbox.SQLGuide.renderResult(injected);
assert.equal(tableRows("sql-result-table")[0].children[0].textContent, "<img src=x onerror=alert(1)>");
assert.equal(tableRows("sql-result-table")[0].children[0].children.length, 0, "los valores se dibujan como texto, no como HTML");
assert.equal(JSON.stringify(runtime.tables), originalTables, "ninguna consulta modifica los datos originales");
console.log("SQL didáctico: 12 lecciones, 12 ejemplos ejecutables, 3 desafíos, tablas, errores, aislamiento y progreso: OK");

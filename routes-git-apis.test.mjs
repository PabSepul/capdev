import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

/*
  Rutas de Git y APIs: resuelve los 24 módulos con soluciones de referencia sobre
  los laboratorios simulados, y comprueba desbloqueos, exámenes y cierre de ruta.
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

const GIT_FILES = ["starter-exams.js", "git-lab.js", "git-course.js", "starter-course.js"];
const API_FILES = ["starter-exams.js", "api-lab.js", "apis-course.js", "starter-course.js"];
const TOKEN = "clave-demo-2026";

const GIT_SOLUTIONS = [
  "git init\ngit status",
  "git add index.html\ngit add estilos.css\ngit status",
  'git add .\ngit commit -m "Agrega la portada del portafolio"\ngit status',
  'git status\ngit add estilos.css\ngit commit -m "Ajusta el color del titulo"\ngit log --oneline',
  "git diff\ngit restore index.html\ngit status",
  'git restore --staged borrador.txt\ngit status\ngit commit -m "Actualiza el texto de la portada"',
  'git status\ngit add .\ngit commit -m "Ignora los archivos con claves"',
  "git log --oneline\ngit status",
  "git switch -c nueva-portada\ngit branch",
  'git status\ngit add index.html\ngit commit -m "Rediseña la portada"\ngit switch main',
  "git branch\ngit merge nueva-portada\ngit log --oneline",
  "git remote add origin https://github.com/tu-usuario/mi-portafolio.git\ngit push -u origin main\ngit remote -v"
];

const API_SOLUTIONS = [
  "GET /cursos",
  "GET /cursos/3",
  "GET /cursos?categoria=Web&nivel=Inicial",
  "GET /cursos/1\n\nGET /cursos/99",
  'POST /cursos\nAuthorization: Bearer ' + TOKEN + '\nContent-Type: application/json\n\n{"nombre": "Go", "nivel": "Inicial", "duracion": 7}',
  'POST /cursos\nAuthorization: Bearer ' + TOKEN + '\nContent-Type: application/json\n\n{"nombre": "Kotlin"}\n\nPOST /cursos\nAuthorization: Bearer ' + TOKEN + '\nContent-Type: application/json\n\n{"nombre": "Kotlin", "nivel": "Siguiente"}',
  'PATCH /cursos/4\nAuthorization: Bearer ' + TOKEN + '\nContent-Type: application/json\n\n{"duracion": 6}\n\nGET /cursos/4',
  "DELETE /cursos/5\nAuthorization: Bearer " + TOKEN + "\n\nGET /cursos/5",
  'POST /cursos\nContent-Type: application/json\n\n{"nombre": "Ruby", "nivel": "Siguiente"}\n\nPOST /cursos\nAuthorization: Bearer ' + TOKEN + '\nContent-Type: application/json\n\n{"nombre": "Ruby", "nivel": "Siguiente"}',
  "GET /cursos?pagina=2&tamano=3",
  "GET /cursos?categoria=Web&orden=-inscritos",
  'POST /cursos\nAuthorization: Bearer ' + TOKEN + '\nContent-Type: application/json\n\n{"nombre": "Rust", "nivel": "Inicial", "duracion": 10}\n\nPATCH /cursos/8\nAuthorization: Bearer ' + TOKEN + '\nContent-Type: application/json\n\n{"duracion": 11}\n\nGET /cursos/8\n\nDELETE /cursos/8\nAuthorization: Bearer ' + TOKEN
];

const RUTAS = [
  { id: "git", nombre: "Git y GitHub", archivos: GIT_FILES, soluciones: GIT_SOLUTIONS, global: "GitCourse" },
  { id: "apis", nombre: "APIs", archivos: API_FILES, soluciones: API_SOLUTIONS, global: "ApisCourse" }
];

let modulos = 0;
let comprobaciones = 0;

for (const ruta of RUTAS) {
  const contexto = createContext(ruta.id, ruta.archivos);

  /* Estructura */
  assert.equal(contexto.elements.get("#starter-level-tabs").children.length, 3, `${ruta.id}: 3 niveles`);
  assert.equal(contexto.elements.get("#starter-module-list").children.length, 4, `${ruta.id}: 4 módulos por nivel`);
  assert.match(contexto.elements.get("#starter-position").textContent, /de 12$/, `${ruta.id}: 12 módulos`);

  const fichas = contexto.runJson(`globalThis.${ruta.global}.lessons.map((m) => ({ title: m.title, shortTitle: m.shortTitle, file: m.file, hints: m.hints.length, concepts: m.concepts.length, checks: m.checks.length }))`);
  assert.equal(fichas.length, 12);
  for (const [indice, ficha] of fichas.entries()) {
    const donde = `${ruta.id}, módulo ${indice + 1}`;
    assert.ok(ficha.title && ficha.shortTitle && ficha.file, `${donde}: faltan datos de la ficha`);
    assert.equal(ficha.hints, 3, `${donde}: deben ser 3 pistas`);
    assert.equal(ficha.concepts, 3, `${donde}: deben ser 3 conceptos`);
    assert.equal(ficha.checks, 3, `${donde}: deben ser 3 comprobaciones`);
  }

  /* Resolución de los doce módulos */
  for (let indice = 0; indice < ruta.soluciones.length; indice += 1) {
    if (indice > 0) contexto.elements.get("#starter-next").click();
    const donde = `${ruta.id}, módulo ${indice + 1}`;

    contexto.elements.get("#starter-run").click();
    assert.equal(contexto.elements.get("#starter-complete").disabled, true, `${donde}: el ejemplo inicial no debe aprobar`);

    contexto.elements.get("#starter-code").value = ruta.soluciones[indice];
    contexto.elements.get("#starter-run").click();
    const fallidas = contexto.elements.get("#starter-validations").children
      .map((item, posicion) => (item.className === "validation-passed" ? null : posicion + 1))
      .filter(Boolean);
    assert.deepEqual(fallidas, [], `${donde}: comprobaciones sin cumplir ${fallidas.join(", ")}`);
    assert.equal(contexto.elements.get("#starter-complete").disabled, false, `${donde} debe validar`);
    assert.equal(contexto.elements.get("#starter-success").hidden, false, `${donde} debe mostrar éxito`);

    modulos += 1;
    comprobaciones += contexto.elements.get("#starter-validations").children.length;
    contexto.elements.get("#starter-complete").click();
  }

  assert.equal(contexto.elements.get("#starter-completed").textContent, "12 completados", `${ruta.id}: progreso completo`);
  assert.equal(contexto.elements.get("#starter-next").disabled, true, `${ruta.id}: termina en el último módulo`);

  /* Exámenes */
  const examenes = contexto.runJson(`globalThis.StarterExams.LEVEL_EXAMS["${ruta.id}"]`);
  assert.equal(examenes.length, 3, `${ruta.id}: 3 exámenes`);
  for (const examen of examenes) {
    assert.equal(examen.questions.length, 5, `${ruta.id}: 5 preguntas por examen`);
    for (const pregunta of examen.questions) {
      assert.equal(pregunta.options.length, 4);
      assert.equal(new Set(pregunta.options).size, 4, `${ruta.id}: alternativas repetidas`);
      assert.ok(Number.isInteger(pregunta.answer) && pregunta.answer >= 0 && pregunta.answer < 4);
      assert.ok(pregunta.explanation.length > 20);
    }
  }
  const aprobado = contexto.runJson(
    `globalThis.StarterExams.gradeExam("${ruta.id}", 1, new Map(globalThis.StarterExams.LEVEL_EXAMS["${ruta.id}"][0].questions.map((q, i) => [i, q.answer])))`
  );
  assert.equal(aprobado.passed, true, `${ruta.id}: responder bien debe aprobar`);
  const reprobado = contexto.runJson(
    `globalThis.StarterExams.gradeExam("${ruta.id}", 1, new Map(globalThis.StarterExams.LEVEL_EXAMS["${ruta.id}"][0].questions.map((q, i) => [i, i < 2 ? (q.answer + 1) % 4 : q.answer])))`
  );
  assert.equal(reprobado.passed, false, `${ruta.id}: 3 de 5 no aprueba`);
}

/* El laboratorio de Git mantiene un repositorio coherente */
const git = createContext("git", GIT_FILES);
const sinRepo = git.runJson('globalThis.GitLab.run("git status", { files: { "a.txt": { content: "x" } } })');
assert.ok(sinRepo.error, "sin git init los comandos deben fallar");
assert.match(sinRepo.text, /no es un repositorio git/);

const inventado = git.runJson('globalThis.GitLab.run("git deploy", { initialized: true, branches: { main: null } })');
assert.match(inventado.text, /no es un comando de git en este laboratorio/, "un comando inexistente no puede inventar salida");

const ignorado = git.runJson('globalThis.GitLab.run("git add claves.env", { initialized: true, branches: { main: null }, ignored: ["*.env"], files: { "claves.env": { content: "x" } } })');
assert.match(ignorado.text, /ignoradas/, "no se puede agregar un archivo ignorado");

const sinPreparar = git.runJson('globalThis.GitLab.run("git commit -m \\"nada\\"", { initialized: true, branches: { main: null }, files: { "a.txt": { content: "x" } } })');
assert.match(sinPreparar.text, /no hay nada agregado al commit/, "no se puede confirmar sin preparar");

/* El laboratorio de APIs responde con códigos reales */
const api = createContext("apis", API_FILES);
const casos = [
  ["GET /cursos", 200],
  ["GET /cursos/99", 404],
  ["GET /inexistente", 404],
  ["PUT /cursos", 405],
  ['POST /cursos\nContent-Type: application/json\n\n{"nombre": "X", "nivel": "Inicial"}', 401],
  ['POST /cursos\nAuthorization: Bearer no-sirve\nContent-Type: application/json\n\n{"nombre": "X", "nivel": "Inicial"}', 401],
  ['POST /cursos\nAuthorization: Bearer ' + TOKEN + '\nContent-Type: application/json\n\n{"nombre": "X"}', 400],
  ['POST /cursos\nAuthorization: Bearer ' + TOKEN + '\nContent-Type: application/json\n\n{no es json}', 400],
  ["GET /cursos?desconocido=1", 400],
  ["DELETE /cursos/1\nAuthorization: Bearer " + TOKEN, 204]
];
for (const [peticion, esperado] of casos) {
  const respuesta = api.runJson("globalThis.ApiLab.run(" + JSON.stringify(peticion) + ")");
  assert.equal(respuesta.respuestas[0].status, esperado, "esperaba " + esperado + " para: " + peticion.split("\n")[0]);
}

const textoSuelto = api.runJson('globalThis.ApiLab.run("dame los cursos")');
assert.ok(textoSuelto.error, "un texto sin método debe explicarse, no ejecutarse");

const aislado = api.runJson('globalThis.ApiLab.run("DELETE /cursos/1\\nAuthorization: Bearer ' + TOKEN + '")');
const despues = api.runJson('globalThis.ApiLab.run("GET /cursos/1")');
assert.equal(aislado.respuestas[0].status, 204);
assert.equal(despues.respuestas[0].status, 200, "cada ejecución parte de los mismos datos");

const fuentes = ["git-lab.js", "api-lab.js", "git-course.js", "apis-course.js"].map(read).join("\n");
assert.equal(/\beval\s*\(|new Function/.test(fuentes), false, "los laboratorios no pueden usar eval ni Function");
assert.equal(/fetch\s*\(|XMLHttpRequest/.test(fuentes), false, "el laboratorio de APIs no puede salir a la red");

console.log(`Git y APIs: 2 rutas, ${modulos} módulos resueltos, ${comprobaciones} validaciones, 6 exámenes y 30 preguntas: OK`);

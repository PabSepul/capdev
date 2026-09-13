import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const courseSource = fs.readFileSync(new URL("./starter-course.js", import.meta.url), "utf8");
/* El avance ya no vive en una clave por ruta sino en un documento con esquema.
   Se comprueba lo guardado, que es de lo que hablaban estas aserciones. */
const sembrar = (storage, id, avance) => {
  const documento = JSON.parse(storage.get("codigo-cero.perfil-v1") || '{"esquema":1,"instalacion":"00000000","rutas":{}}');
  documento.rutas = documento.rutas || {};
  documento.rutas[id] = { ...(documento.rutas[id] || {}), ...avance };
  storage.set("codigo-cero.perfil-v1", JSON.stringify(documento));
};
const guardado = (storage, id) =>
  (JSON.parse(storage.get("codigo-cero.perfil-v1") || "{}").rutas || {})[id] || { completados: [], examenes: [] };


/* Devuelve los scripts que carga esa ruta, en orden, saltando los que solo
   afectan a la página y no al curso. */
function scriptsDeLaPagina(courseName) {
  const pagina = fs.readFileSync(new URL("./" + courseName + ".html", import.meta.url), "utf8");
  const scripts = [...pagina.matchAll(/<script src="([^"?]+)/g)].map((m) => m[1]);
  /* course-expansion.js queda fuera a propósito: esta suite cubre el contenido
     base de tres niveles y course-expansion.test.mjs cubre el cuarto. */
  // Esta suite prueba el controlador educativo con almacenamiento aislado.
  // Autenticación, cola y reconexión se ejecutan con DOM real en accounts-ui.
  const fuera = new Set(["site.js", "review-preview.js", "course-expansion.js",
    "account-config.js", "vendor/supabase-2.116.0.js", "learning-sync.js", "account.js"]);
  const usados = scripts.filter((nombre) => !fuera.has(nombre));
  assert.ok(usados.includes("starter-course.js"), courseName + ": la página debe cargar el controlador");
  assert.equal(usados[usados.length - 1], "starter-course.js",
    courseName + ": el controlador tiene que cargarse al final");
  return usados;
}

class FakeElement {
  constructor() {
    this.attributes = {};
    this.children = [];
    this.classList = { add() {}, toggle() {} };
    this.disabled = false;
    this.hidden = false;
    this.listeners = {};
    this.style = {};
    this.textContent = "";
    this.value = "";
  }

  addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
  append(child) { this.children.push(child); }
  click() { for (const callback of this.listeners.click || []) callback(); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(name, value) { this.attributes[name] = value; }
  focus() { this.focused = true; }
  scrollIntoView() {}
  set innerHTML(value) { this._innerHTML = value; }
  get innerHTML() { return this._innerHTML || ""; }
}

function createCourseContext(courseName, storage = new Map(), blockStorage = false) {
  const elements = new Map();
  const document = {
    body: { dataset: { course: courseName } },
    createElement: () => new FakeElement(),
    querySelectorAll: () => [],
    querySelector: (selector) => {
      if (!elements.has(selector)) elements.set(selector, new FakeElement());
      return elements.get(selector);
    }
  };
  const localStorage = {
    getItem: (key) => { if (blockStorage) throw new Error("Storage bloqueado"); return storage.get(key) ?? null; },
    setItem: (key, value) => { if (blockStorage) throw new Error("Storage bloqueado"); storage.set(key, value); }
  };
  const sandbox = { document, localStorage };
  vm.createContext(sandbox);
  /* Los scripts salen de la página real, en su orden real. Una lista escrita a
     mano aquí se desincroniza en cuanto una página gana o pierde un archivo, y
     el fallo aparece como un error críptico en vez de como lo que es. */
  for (const nombre of scriptsDeLaPagina(courseName)) {
    vm.runInContext(fs.readFileSync(new URL("./" + nombre, import.meta.url), "utf8"), sandbox, { filename: nombre });
  }
  return { elements, sandbox, storage };
}

const SOLUTIONS = {
  "html-css": [
    "<h1>Mi primera página</h1>\n<p>Quiero aprender cada día.</p>",
    "<h2>Mis pasos</h2>\n<ul><li>Leer</li><li>Practicar</li><li>Repetir</li></ul>\n<a href=\"https://developer.mozilla.org\">Documentación</a>",
    "<figure><img src=\"foto.png\" alt=\"Equipo trabajando frente a un computador\"><figcaption>Nuestro equipo</figcaption></figure>",
    "<header><h1>Mi sitio</h1></header>\n<main><h2>Contenido</h2><p>Texto principal.</p></main>\n<footer>Hecho para aprender</footer>",
    "<style>.mensaje { color: blue; padding: 16px; }</style>\n<p class=\"mensaje\">Hola</p>",
    "<style>body { font-family: system-ui, sans-serif; font-size: 18px; } p { line-height: 1.6; }</style>\n<p>Un párrafo cómodo.</p>",
    "<style>.caja { padding: 24px; margin: 16px; border: 2px solid #1c69d4; border-radius: 8px; }</style>\n<div class=\"caja\">Una caja</div>",
    "<style>.accion { transition: background .2s ease; } .accion:hover { background: #14509f; }</style>\n<button class=\"accion\" type=\"button\">Comenzar</button>",
    "<style>.fila { display: flex; gap: 16px; justify-content: space-between; }</style>\n<div class=\"fila\"><div>Uno</div><div>Dos</div><div>Tres</div></div>",
    "<style>.grilla { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }</style>\n<div class=\"grilla\"><article>A</article><article>B</article><article>C</article></div>",
    "<style>.grilla { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; } @media (max-width: 600px) { .grilla { grid-template-columns: 1fr; } }</style>\n<div class=\"grilla\"><article>A</article></div>",
    "<style>.curso { border: 1px solid #d7dee8; border-radius: 12px; padding: 24px; } .curso:hover { border-color: #1c69d4; } @media (max-width: 600px) { .curso { padding: 16px; } }</style>\n<article class=\"curso\"><h2>Ruta de SQL</h2><p>Consulta datos reales.</p><button type=\"button\">Comenzar</button></article>"
  ],
  javascript: [
    "const lenguaje = \"JavaScript\";\nconsole.log(lenguaje);",
    "const precio = 4500;\nconst cantidad = 3;\nconst total = precio * cantidad;\nconsole.log(total);",
    "const nombre = \"ada\";\nconst modulos = 3;\nconsole.log(`Hola, ${nombre.toUpperCase()}: llevas ${modulos} módulos`);",
    "const horas = 12;\nconst meta = 10;\nconst cumplio = horas >= meta;\nconsole.log(cumplio);",
    "const edad = 18;\nif (edad >= 18) { console.log(\"Puede entrar\"); } else { console.log(\"Aún no\"); }",
    "const nota = 5;\nif (nota >= 6) { console.log(\"Excelente\"); } else if (nota >= 4) { console.log(\"Aprobado\"); } else { console.log(\"A reforzar\"); }",
    "const cursos = [\"Python\", \"HTML y CSS\", \"JavaScript\"];\ncursos.push(\"SQL\");\nconsole.log(cursos.length);\nconsole.log(cursos[0]);",
    "const horas = [12, 6, 8, 5, 14];\nlet total = 0;\nfor (const hora of horas) { total += hora; }\nconsole.log(total);",
    "function doblar(numero) { return numero * 2; }\nconsole.log(doblar(6));",
    "const descuento = (precio, porcentaje = 10) => precio - (precio * porcentaje) / 100;\nconsole.log(descuento(1000));\nconsole.log(descuento(1000, 50));",
    "const cursos = [\n  { nombre: \"Python\", horas: 12 },\n  { nombre: \"SQL\", horas: 5 },\n  { nombre: \"APIs\", horas: 9 }\n];\nconst largos = cursos.filter((curso) => curso.horas >= 9);\nconsole.log(largos.map((curso) => curso.nombre).join(\", \"));\nconsole.log(cursos.reduce((total, curso) => total + curso.horas, 0));",
    "const carrito = [\n  { producto: \"Teclado\", precio: 25990, cantidad: 1 },\n  { producto: \"Mouse\", precio: 12990, cantidad: 2 }\n];\nfunction total(items) {\n  return items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);\n}\nconst unidades = carrito.reduce((suma, item) => suma + item.cantidad, 0);\nconsole.log(`Carrito: ${unidades} productos · Total: $${total(carrito)}`);"
  ],
  sql: [
    "SELECT nombre, nivel FROM cursos;",
    "SELECT DISTINCT categoria FROM cursos;",
    "SELECT nombre, duracion FROM cursos WHERE nivel = 'Inicial';",
    "SELECT nombre, duracion FROM cursos WHERE nivel = 'Inicial' AND duracion > 6;",
    "SELECT nombre, categoria FROM cursos WHERE nombre LIKE '%Python%';",
    "SELECT nombre, duracion FROM cursos WHERE duracion BETWEEN 5 AND 9;",
    "SELECT nombre, inscritos FROM cursos ORDER BY inscritos DESC;",
    "SELECT nombre, duracion FROM cursos ORDER BY duracion DESC LIMIT 3;",
    "SELECT COUNT(*) AS total FROM cursos WHERE nivel = 'Inicial';",
    "SELECT AVG(duracion) AS promedio, SUM(duracion) AS total FROM cursos;",
    "SELECT categoria, COUNT(*) AS total FROM cursos GROUP BY categoria ORDER BY total DESC;",
    "SELECT e.nombre AS estudiante, c.nombre AS curso FROM estudiantes e JOIN cursos c ON e.curso_id = c.id ORDER BY estudiante;"
  ]
};

let moduleCount = 0;
let checkCount = 0;

for (const [courseName, solutions] of Object.entries(SOLUTIONS)) {
  const { elements } = createCourseContext(courseName);

  /* Si el controlador no encontró su curso, se detiene sin tocar nada y todo lo
     que sigue falla con un error de propiedad indefinida. Conviene decir qué pasó. */
  assert.ok(elements.has("#starter-level-tabs"),
    `${courseName}: el controlador no encontró su curso. Revisa que la página cargue el archivo que lo define.`);
  assert.equal(elements.get("#starter-level-tabs").children.length, 3, `${courseName} debe mostrar 3 niveles`);
  assert.equal(elements.get("#starter-module-list").children.length, 4, `${courseName} debe mostrar 4 módulos por nivel`);
  assert.match(elements.get("#starter-position").textContent, /de 12$/, `${courseName} debe tener 12 módulos`);

  for (let index = 0; index < solutions.length; index += 1) {
    if (index > 0) elements.get("#starter-next").click();
    const label = `${courseName}, módulo ${index + 1}`;

    elements.get("#starter-code").value = elements.get("#starter-code").value;
    elements.get("#starter-run").click();
    assert.equal(elements.get("#starter-complete").disabled, true, `${label}: el código inicial no debe validar`);

    elements.get("#starter-code").value = solutions[index];
    elements.get("#starter-run").click();
    const failed = elements.get("#starter-validations").children
      .map((item, position) => (item.className === "validation-passed" ? null : position + 1))
      .filter(Boolean);
    assert.deepEqual(failed, [], `${label}: validaciones sin cumplir ${failed.join(", ")}`);
    assert.equal(elements.get("#starter-complete").disabled, false, `${label} debe validar`);
    assert.equal(elements.get("#starter-success").hidden, false, `${label} debe mostrar éxito`);

    moduleCount += 1;
    checkCount += elements.get("#starter-validations").children.length;
    elements.get("#starter-complete").click();
  }

  assert.equal(elements.get("#starter-completed").textContent, "12 completados", `${courseName} debe registrar el avance`);
  assert.equal(elements.get("#starter-next").disabled, true, `${courseName} debe terminar en el último módulo`);
}

const { elements: javascriptElements } = createCourseContext("javascript");
javascriptElements.get("#starter-code").value = "console.log(1 + 1);\nconsole.log(\"listo\");";
javascriptElements.get("#starter-run").click();
assert.equal(javascriptElements.get("#starter-output").textContent, "2\nlisto");

javascriptElements.get("#starter-code").value = "while (true) { }";
javascriptElements.get("#starter-run").click();
assert.match(javascriptElements.get("#starter-output").textContent, /ciclo nunca termina/);

javascriptElements.get("#starter-code").value = "const a = 1;\na = 2;";
javascriptElements.get("#starter-run").click();
assert.match(javascriptElements.get("#starter-output").textContent, /const/);

const { elements: sqlElements } = createCourseContext("sql");
sqlElements.get("#starter-code").value = "DELETE FROM cursos;";
sqlElements.get("#starter-run").click();
assert.match(sqlElements.get("#starter-output").textContent, /SELECT|consulta/i);

sqlElements.get("#starter-code").value = "SELECT nombre FROM cursos WHERE nivel = 'Inexistente';";
sqlElements.get("#starter-run").click();
assert.match(sqlElements.get("#starter-output").textContent, /0 filas/);

sqlElements.get("#starter-code").value = "SELECT nombre FROM estudiantes JOIN cursos ON estudiantes.curso_id = cursos.id;";
sqlElements.get("#starter-run").click();
assert.match(sqlElements.get("#starter-output").textContent, /existe en las dos tablas/);

const standardizedRoutes = ["sql", "git", "apis", "terminal", "regex", "ia", "datos-python", "nodejs",
  "typescript", "react", "json", "markdown", "accesibilidad", "testing", "docker", "mongodb"];
for (const route of standardizedRoutes) {
  const page = fs.readFileSync(new URL(`./${route}.html`, import.meta.url), "utf8");
  assert.match(page, /course-learning\.css\?v=20260910-htmlcss3/, `${route}: carga el estilo pedagógico compartido`);
  if (route !== "sql") {
    for (const id of ["starter-lesson-support", "starter-prerequisites", "starter-example-steps",
      "starter-prediction", "starter-prediction-answer", "starter-lesson-extra", "starter-reflection", "starter-extension"])
      assert.match(page, new RegExp(`id="${id}"`), `${route}: falta ${id}`);
  }
  const storage = new Map();
  sembrar(storage, route, { completados: Array.from({ length: 20 }, (_, index) => index) });
  const { elements } = createCourseContext(route, storage);
  const total = Number(elements.get("#starter-position").textContent.match(/de (\d+)$/)?.[1]);
  assert.ok(total >= 12, `${route}: conserva todos sus módulos`);
  for (let moduleIndex = 0; moduleIndex < total; moduleIndex += 1) {
    assert.equal(elements.get("#starter-lesson-support").hidden, route === "sql", `${route} ${moduleIndex + 1}: visibilidad del apoyo`);
    assert.equal(elements.get("#starter-lesson-extra").hidden, route === "sql", `${route} ${moduleIndex + 1}: visibilidad del reto`);
    assert.equal(elements.get("#starter-example-steps").children.length, 3, `${route} ${moduleIndex + 1}: tres pasos explicados`);
    for (const selector of ["#starter-prerequisites", "#starter-prediction", "#starter-prediction-explanation",
      "#starter-reflection", "#starter-extension"])
      assert.ok(elements.get(selector).textContent.length > 20, `${route} ${moduleIndex + 1}: contenido de ${selector}`);
    elements.get("#starter-run").click();
    assert.equal(elements.get("#starter-coaching").hidden, false, `${route} ${moduleIndex + 1}: orienta el primer criterio pendiente`);
    assert.ok(elements.get("#starter-coaching").textContent.length > 30, `${route} ${moduleIndex + 1}: orientación concreta`);
    if (moduleIndex < total - 1) elements.get("#starter-next").click();
  }
}

console.log(`3 rutas, ${moduleCount} módulos y ${checkCount} validaciones; 16 rutas con apoyo pedagógico: OK`);

function chooseAnswers(context, exam, correctCount = 5) {
  exam.questions.forEach((question, index) => {
    const option = index < correctCount ? question.answer : (question.answer + 1) % 4;
    const item = context.elements.get("#exam-questions").children[index];
    const buttons = item.children[1].children;
    buttons[option].click();
    assert.equal(buttons[option].attributes["aria-pressed"], "true", "la opción elegida queda anunciada");
    assert.equal(context.elements.get("#exam-questions").children[index], item, "elegir no reemplaza el control ni pierde el foco");
  });
}

function solveModule(context, courseName, index) {
  const elements = context.elements;
  elements.get("#starter-code").value = SOLUTIONS[courseName][index];
  elements.get("#starter-run").click();
  assert.equal(elements.get("#starter-complete").disabled, false);
  elements.get("#starter-complete").click();
}

let examCount = 0;
let questionCount = 0;
const sharedStorage = new Map();

for (const courseName of Object.keys(SOLUTIONS)) {
  const context = createCourseContext(courseName);
  const elements = context.elements;
  const bank = context.sandbox.StarterExams.LEVEL_EXAMS[courseName];
  const completeKey = `codigo-cero.${courseName}-v2.completed`;
  const examsKey = `codigo-cero.${courseName}-v2.exams`;
  assert.equal(bank.length, 3);

  // Las nueve evaluaciones tienen cinco preguntas y un umbral real de cuatro aciertos.
  bank.forEach((exam, index) => {
    assert.equal(exam.levelId, index + 1);
    assert.equal(exam.questions.length, 5);
    assert.equal(exam.passing, 4);
    for (const question of exam.questions) {
      assert.equal(question.options.length, 4);
      assert.equal(new Set(question.options).size, 4);
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4);
      assert.ok(question.explanation.length > 20);
    }
    for (const correctCount of [0, 3, 4, 5]) {
      const answers = exam.questions.map((question, position) => position < correctCount ? question.answer : (question.answer + 1) % 4);
      const grade = context.sandbox.StarterExams.gradeExam(courseName, exam.levelId, answers);
      assert.equal(grade.correct, correctCount);
      assert.equal(grade.passed, correctCount >= 4);
    }
    assert.equal(context.sandbox.StarterExams.gradeExam(courseName, exam.levelId, undefined).passed, false);
    examCount += 1;
    questionCount += exam.questions.length;
  });
  assert.equal(context.sandbox.StarterExams.gradeExam(courseName, 99, []), null);

  // Las guardas funcionan incluso al invocar el listener de un botón deshabilitado.
  assert.deepEqual(elements.get("#starter-level-tabs").children.map((button) => button.disabled), [false, true, true]);
  elements.get("#starter-level-tabs").children[1].click();
  assert.equal(elements.get("#starter-position").textContent, "Módulo 1 de 12");
  elements.get("#starter-complete").click();
  assert.equal(elements.get("#starter-completed").textContent, "0 completados");
  elements.get("#starter-previous").click();
  assert.equal(elements.get("#starter-position").textContent, "Módulo 1 de 12");
  elements.get("#checkpoint-exam").click();
  assert.equal(elements.get("#level-exam").hidden, true);
  elements.get("#starter-module-list").children[3].click();
  assert.equal(elements.get("#starter-next").disabled, true);
  elements.get("#starter-next").click();
  assert.equal(elements.get("#starter-position").textContent, "Módulo 4 de 12");

  for (let index = 0; index < 4; index += 1) {
    elements.get("#starter-module-list").children[index].click();
    solveModule(context, courseName, index);
    assert.equal(elements.get("#level-checkpoint").hidden, index < 3);
    assert.equal(elements.get("#starter-level-tabs").children[1].disabled, index < 3);
  }
  assert.deepEqual(elements.get("#starter-level-tabs").children.map((button) => button.disabled), [false, false, true]);
  assert.equal(elements.get("#starter-next").disabled, false, "el siguiente nivel abre sin exigir todavía el examen");
  assert.equal(elements.get("#checkpoint-next").hidden, false);

  elements.get("#checkpoint-exam").click();
  assert.equal(elements.get("#level-exam").hidden, false);
  assert.equal(elements.get("#exam-questions").children.length, 5);
  elements.get("#exam-submit").click();
  assert.match(elements.get("#exam-result").textContent, /Responde las 5 preguntas/);
  assert.equal(context.storage.has(examsKey), false);
  chooseAnswers(context, bank[0], 3);
  elements.get("#exam-submit").click();
  assert.match(elements.get("#exam-result").textContent, /necesitas 4/);
  assert.equal(guardado(context.storage, courseName).examenes.length, 0);
  assert.equal(elements.get("#exam-questions").children[0].children.length, 3, "se muestra explicación por pregunta");
  assert.ok(elements.get("#exam-questions").children.every((item) => item.children[1].children.every((button) => button.disabled)));

  elements.get("#exam-retry").click();
  assert.ok(elements.get("#exam-questions").children.every((item) => item.children[1].children.every((button) => button.attributes["aria-pressed"] === "false")));
  chooseAnswers(context, bank[0], 4);
  elements.get("#exam-submit").click();
  assert.match(elements.get("#exam-result").textContent, /Aprobado con 4 de 5/);
  assert.deepEqual(guardado(context.storage, courseName).examenes, [1]);
  assert.equal(elements.get("#starter-exam-progress").textContent, "Mini exámenes: 1 de 3 aprobados");
  elements.get("#exam-retry").click();
  chooseAnswers(context, bank[0], 0);
  elements.get("#exam-submit").click();
  assert.deepEqual(guardado(context.storage, courseName).examenes, [1], "reprobar un repaso no borra la aprobación");
  assert.match(elements.get("#exam-result").textContent, /aprobación anterior se conserva/);
  elements.get("#exam-close").click();
  assert.equal(elements.get("#level-exam").hidden, true);
  assert.equal(elements.get("#checkpoint-exam").focused, true);
  elements.get("#checkpoint-exam").click();
  elements.get("#checkpoint-next").click();
  assert.equal(elements.get("#starter-position").textContent, "Módulo 5 de 12");
  assert.equal(elements.get("#level-exam").hidden, true, "cambiar de nivel cierra el examen anterior");
  assert.equal(elements.get("#level-checkpoint").hidden, true);

  // No se obliga a repetir módulos ya terminados antes de introducir los exámenes.
  /* Sembrar avance previo va al documento: la clave vieja solo se lee cuando
     todavia no existe, que es el caso de una migracion. */
  sembrar(sharedStorage, courseName, { completados: Array.from({ length: 12 }, (_, index) => index) });
  const legacy = createCourseContext(courseName, sharedStorage);
  assert.equal(legacy.elements.get("#starter-completed").textContent, "12 completados");
  assert.equal(legacy.elements.get("#starter-finish").hidden, true, "doce módulos sin exámenes no cierran la ruta");
  assert.ok(legacy.elements.get("#starter-level-tabs").children.every((button) => !button.disabled));
  for (let level = 0; level < 3; level += 1) {
    legacy.elements.get("#starter-level-tabs").children[level].click();
    legacy.elements.get("#checkpoint-exam").click();
    chooseAnswers(legacy, bank[level]);
    legacy.elements.get("#exam-submit").click();
    assert.equal(legacy.elements.get("#starter-finish").hidden, level < 2);
  }
  assert.equal(legacy.elements.get("#checkpoint-next").hidden, true);
  assert.match(legacy.elements.get("#exam-result").textContent, /Completaste la ruta/);
  const reload = createCourseContext(courseName, sharedStorage);
  assert.equal(reload.elements.get("#starter-finish").hidden, false, "módulos y exámenes sobreviven a recargar");
  assert.equal(reload.elements.get("#starter-exam-progress").textContent, "Mini exámenes: 3 de 3 aprobados");

  const sparse = createCourseContext(courseName, new Map([[completeKey, "[4,5,6,7,8,9,10,11]"]]));
  assert.equal(sparse.elements.get("#starter-completed").textContent, "8 completados");
  assert.deepEqual(sparse.elements.get("#starter-level-tabs").children.map((button) => button.disabled), [false, true, true]);
  solveModule(sparse, courseName, 0);
  assert.equal(guardado(sparse.storage, courseName).completados.length, 9, "los avances no consecutivos se conservan");
  const corrupt = createCourseContext(courseName, new Map([[completeKey, '[0,"1",-1,0.5,12,null]'], [examsKey, '{'] ]));
  assert.equal(corrupt.elements.get("#starter-completed").textContent, "1 completados");
  assert.equal(corrupt.elements.get("#starter-exam-progress").textContent, "Mini exámenes: 0 de 3 aprobados");

  const noStorage = createCourseContext(courseName, new Map(), true);
  for (let index = 0; index < 4; index += 1) {
    noStorage.elements.get("#starter-module-list").children[index].click();
    solveModule(noStorage, courseName, index);
  }
  noStorage.elements.get("#checkpoint-exam").click();
  chooseAnswers(noStorage, bank[0]);
  noStorage.elements.get("#exam-submit").click();
  assert.equal(noStorage.elements.get("#starter-exam-progress").textContent, "Mini exámenes: 1 de 3 aprobados");

  const stale = createCourseContext(courseName);
  stale.elements.get("#starter-code").value = SOLUTIONS[courseName][0];
  stale.elements.get("#starter-run").click();
  stale.elements.get("#starter-code").value = "";
  stale.elements.get("#starter-complete").click();
  assert.equal(stale.elements.get("#starter-completed").textContent, "0 completados", "no se completa con una validación de código distinto");
  for (const handler of stale.elements.get("#starter-code").listeners.input) handler();
  assert.equal(stale.elements.get("#starter-complete").disabled, true);
}
/* Antes esto se comprobaba contando claves: dos por ruta. Ahora hay un solo
   documento, así que el aislamiento se comprueba donde de verdad ocurre. */
const documentoFinal = JSON.parse(sharedStorage.get("codigo-cero.perfil-v1"));
for (const nombre of Object.keys(SOLUTIONS)) {
  const ruta = documentoFinal.rutas[nombre];
  assert.ok(ruta, nombre + ": la ruta debe estar en el documento");
  assert.equal(ruta.completados.length, 12, nombre + ": conserva sus doce módulos base");
  assert.deepEqual(ruta.examenes, [1, 2, 3], nombre + ": conserva sus tres exámenes");
}
assert.equal(Object.keys(documentoFinal.rutas).length, 19, "las rutas no tocadas siguen presentes y vacías");
assert.equal(documentoFinal.rutas.python.completados.length, 0, "avanzar en una ruta no toca otra");
console.log(`HTML/CSS, JavaScript y SQL: ${examCount} mini exámenes, ${questionCount} preguntas; desbloqueo, reintentos, persistencia y cierre: OK`);

// Verifica también el marcado real: un doble de DOM por sí solo no detecta IDs o scripts faltantes.
const assetVersions = new Map();
/* Se recorren todas las páginas del sitio, no una lista escrita a mano: una página nueva
   que olvide una etiqueta o pida otra versión de un archivo compartido debe hacer fallar esto. */
const inicio = fs.readFileSync(new URL("./index.html", import.meta.url), "utf8");
const pages = fs.readdirSync(new URL("./", import.meta.url)).filter((name) => name.endsWith(".html")).sort();
assert.ok(pages.length >= 14, `se esperaban al menos 14 páginas, hay ${pages.length}`);
for (const page of pages) {
  const html = fs.readFileSync(new URL(`./${page}`, import.meta.url), "utf8");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${page}: no debe repetir IDs`);
  const canonical = page === "index.html" ? "https://capsulasdev.com/" : `https://capsulasdev.com/${page}`;
  for (const [property, expected] of [["og:type", null], ["og:locale", "es_CL"], ["og:url", canonical]]) {
    const found = html.match(new RegExp(`<meta property="${property}" content="([^"]*)"`));
    assert.ok(found, `${page}: falta la etiqueta ${property}`);
    if (expected !== null) assert.equal(found[1], expected, `${page}: ${property} incorrecto`);
  }
  /* Toda ruta tiene que estar enlazada desde la portada: una página publicada
     a la que no se llega es una página que nadie va a encontrar. */
  if (page !== "index.html" && page !== "404.html") {
    assert.ok(inicio.includes('href="' + page + '"'), page + ": la portada no enlaza esta ruta");
  }

  /* El script de arranque aplica el tema guardado antes de pintar. */
  const arranque = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(arranque, page + ": falta el script de arranque");
  const clases = [];
  const raiz = {
    classList: {
      add: (nombre) => clases.push(nombre),
      remove: (nombre) => { const i = clases.indexOf(nombre); if (i >= 0) clases.splice(i, 1); }
    },
    dataset: {}
  };
  vm.runInNewContext(arranque[1], {
    document: { documentElement: raiz, head: { append() {} }, createElement: () => ({}) },
    window: { location: { hostname: "localhost", search: "" }, matchMedia: () => ({ matches: false }) },
    URLSearchParams,
    localStorage: { getItem: () => "dark" }
  });
  assert.equal(raiz.dataset.theme, "dark", page + ": el arranque debe aplicar el tema guardado");
  assert.equal(clases.includes("is-maintenance"), false, page + ": en local no corresponde el mantenimiento");

  /* review-preview.js arma el título de la pestaña en modo revisión a partir de og:title. */
  for (const property of ["og:title", "og:description"]) {
    const found = html.match(new RegExp(`<meta property="${property}" content="([^"]*)"`));
    assert.ok(found, `${page}: falta la etiqueta ${property}`);
    assert.ok(found[1].length >= 20 && found[1].length <= 160, `${page}: ${property} debe medir entre 20 y 160 caracteres`);
  }
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const ref = match[1];
    if (/^(https?:|mailto:|data:|#)/.test(ref)) continue;
    const file = ref.split(/[?#]/)[0];
    assert.ok(fs.existsSync(new URL(`./${file}`, import.meta.url)), `${page}: falta ${file}`);
    if (!/\.(js|css)$/.test(file)) continue;
    if (assetVersions.has(file)) assert.equal(assetVersions.get(file), ref, `${file}: versión consistente entre páginas`);
    assetVersions.set(file, ref);
  }
  if (!html.includes('data-course="')) continue;
  const optionalLearningSupport = new Set([
    "starter-lesson-support", "starter-prerequisites", "starter-walkthrough", "starter-example-steps",
    "starter-prediction", "starter-prediction-answer", "starter-prediction-explanation", "starter-lesson-extra",
    "starter-reflection", "starter-extension", "starter-coaching"
  ]);
  for (const match of courseSource.matchAll(/document\.querySelector\("#([^"]+)"\)/g)) {
    if (optionalLearningSupport.has(match[1])) continue;
    assert.ok(ids.includes(match[1]), `${page}: falta #${match[1]}`);
  }
  assert.ok(html.indexOf('src="starter-exams.js') < html.indexOf('src="starter-course.js'), "las preguntas cargan antes del controlador");
  assert.match(html, /id="starter-preview"[^>]*sandbox=""/);
  assert.match(html, /publicHosts\.includes\(window\.location\.hostname\)/);
}
assert.match(assetVersions.get("account.js"), /\?v=20260912-/, "account.js: renovar la URL tras agregar preferencias y feedback");
for (const file of ["account-config.js", "account.css", "catalog.js", "styles.css"]) {
  assert.match(assetVersions.get(file), /\?v=20260909-/, `${file}: conserva la versión de su último cambio`);
}
/* Toda vista previa se arma con srcdoc desde starter-course.js. El sandbox vacío ya
   impide ejecutar scripts; la CSP es la segunda barrera y tiene que estar en todas,
   no solo en las que se escribieron al final. */
const controlador = fs.readFileSync(new URL("./starter-course.js", import.meta.url), "utf8");
const previas = [...controlador.matchAll(/preview\.srcdoc = `([^`]*)`/g)].map((m) => m[1]);
assert.ok(previas.length >= 3, `se esperaban al menos 3 vistas previas, hay ${previas.length}`);
for (const [indice, plantilla] of previas.entries()) {
  const donde = "vista previa " + (indice + 1);
  const csp = plantilla.match(/content="(default-src[^"]*)"/);
  assert.ok(csp, donde + ": falta la Content-Security-Policy en el srcdoc");
  assert.match(csp[1], /default-src 'none'/, donde + ": la política debe partir negando todo");
  assert.match(csp[1], /form-action 'none'/, donde + ": la política debe impedir enviar formularios");
  assert.match(csp[1], /base-uri 'none'/, donde + ": la política debe impedir cambiar la base de las URL");
  assert.equal(/script-src|'unsafe-eval'/.test(csp[1]), false, donde + ": no se pueden permitir scripts");
  /* Si se permiten imágenes, solo incrustadas: una URL externa haría una petición
     de red desde la vista previa con lo que escriba la persona. */
  const imagenes = csp[1].match(/img-src ([^;"]*)/);
  if (imagenes) assert.equal(imagenes[1].trim(), "data:", donde + ": las imágenes solo pueden ser data:");
}

const css = fs.readFileSync(new URL("./styles.css", import.meta.url), "utf8");
assert.match(css, /\.code-input\.starter-code-input\s*\{[^}]*display:\s*block;[^}]*grid-template-columns:\s*none;/, "se conserva el arreglo de ancho de los editores");
console.log(`${pages.length} páginas: IDs, archivos, versiones, Open Graph, orden de carga y editor: OK`);

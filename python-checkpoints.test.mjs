import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";

/* El avance vive en un documento con esquema, no en una clave por ruta.
   Estas aserciones hablaban de lo guardado, y ahí es donde se comprueba. */
const guardado = (storage, id) =>
  (JSON.parse(storage.get("codigo-cero.perfil-v1") || "{}").rutas || {})[id] || { completados: [], examenes: [] };


/*
  La ruta de Python se ejecuta con el intérprete real de python-runtime.js.
  Esta prueba resuelve los veinte proyectos, comprueba sus validaciones y
  verifica los puntos de control, los cinco exámenes y el cierre de la ruta.
*/

const stateSource = fs.readFileSync(new URL("./learning-state.js", import.meta.url), "utf8");
const runtimeSource = fs.readFileSync(new URL("./python-runtime.js", import.meta.url), "utf8");
const courseSource = fs.readFileSync(new URL("./python.js", import.meta.url), "utf8");

class FakeElement {
  constructor(tag = "div") {
    this.tag = tag;
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
  const document = {
    createElement: (tag) => new FakeElement(tag),
    querySelector: (selector) => {
      if (!elements.has(selector)) elements.set(selector, new FakeElement(selector));
      return elements.get(selector);
    },
    querySelectorAll: () => []
  };
  const storage = new Map();
  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value)
  };
  const sandbox = { document, localStorage };
  vm.createContext(sandbox);
  /* python.html carga learning-state.js antes que python.js: es el dueno del avance. */
  vm.runInContext(stateSource, sandbox);
  vm.runInContext(runtimeSource, sandbox);
  vm.runInContext(courseSource, sandbox);
  return {
    elements,
    storage,
    sandbox,
    run: (expression) => vm.runInContext(expression, sandbox),
    runJson: (expression) => JSON.parse(vm.runInContext("JSON.stringify(" + expression + ")", sandbox))
  };
}

/* Soluciones de referencia: son programas Python completos, no plantillas. */
const SOLUTIONS = {
  1: 'print("Mi primer programa en Python")',
  2: 'nombre = "Pablo"\nedad = 30\nprint(f"Soy {nombre} y tengo {edad} años")',
  3: 'cuenta = 20000\nporcentaje = 10\npropina = cuenta * porcentaje / 100\ntotal = cuenta + propina\nprint(f"Propina: {propina}")\nprint(f"Total: {total}")',
  4: 'minutos = 135\nhoras = minutos // 60\nresto = minutos % 60\nprint(f"{horas} h y {resto} min")',
  5: 'edad = 20\nif edad >= 18:\n    print(f"Tienes {edad} años: mayor de edad")\nelse:\n    print("Menor de edad")',
  6: 'temperatura = 30\nif temperatura < 10:\n    print("Hace frío")\nelif temperatura < 25:\n    print("Clima agradable")\nelse:\n    print("Hace calor")',
  7: 'for numero in range(1, 6):\n    print(f"Vuelta {numero}")',
  8: 'tareas = ["Leer la lección", "Practicar", "Repasar"]\nfor tarea in tareas:\n    print("-", tarea)\nprint(f"Total: {len(tareas)} tareas")',
  9: 'compras = ["pan", "leche"]\ncompras.append("huevos")\ncompras.remove("leche")\nprint(compras)\nprint(len(compras))',
  10: 'precios = [1200, 890, 2300, 450]\nordenados = sorted(precios)\npromedio = sum(precios) / len(precios)\nprint(ordenados)\nprint(min(precios), max(precios))\nprint(f"Promedio: {promedio:.2f}")',
  11: 'curso = {"nombre": "Python", "horas": 12}\ncurso["nivel"] = "inicial"\nprint(curso)\nprint(curso.get("profesor", "sin datos"))',
  12: 'stock = {"teclado": 3, "mouse": 0, "monitor": 5}\ntotal = 0\nfor producto, cantidad in stock.items():\n    if cantidad == 0:\n        print(producto, "agotado")\n    else:\n        print(producto, cantidad)\n    total += cantidad\nprint(f"Total: {total} unidades")',
  13: 'def saludar(nombre):\n    return f"Hola, {nombre}"\n\nprint(saludar("Ada"))\nprint(saludar("Grace"))',
  14: 'def precio_final(precio, descuento=10):\n    return precio - precio * descuento / 100\n\nprint(precio_final(1000))\nprint(precio_final(1000, 50))',
  15: 'def promedio(notas):\n    return sum(notas) / len(notas)\n\nprint(f"{promedio([4, 5, 6, 7]):.2f}")\nprint(f"{promedio([6, 7]):.2f}")',
  16: 'frase = "aprender python abre puertas"\n\ndef contar_palabras(texto):\n    return len(texto.split())\n\nprint(contar_palabras(frase))\nprint(frase.upper())',
  17: 'numeros = [12, 7, 30, 4, 18]\ngrandes = [n for n in numeros if n > 10]\nprint(grandes)\nprint(len(grandes))',
  18: 'datos = ["12", "hola", "30"]\ntotal = 0\n\nfor dato in datos:\n    try:\n        total += int(dato)\n    except ValueError:\n        print("Dato inválido:", dato)\n\nprint(total)',
  19: 'ventas = {"lunes": 120, "martes": 340, "miercoles": 90}\n\ndef mejor_dia(datos):\n    dia = ""\n    monto = 0\n    for clave, valor in datos.items():\n        if valor > monto:\n            monto = valor\n            dia = clave\n    return f"El mejor día fue {dia} con {monto}"\n\nprint(mejor_dia(ventas))\nprint(sum(ventas.values()))',
  20: 'tareas = [\n    {"nombre": "Leer la guía", "hecha": True},\n    {"nombre": "Practicar", "hecha": False},\n    {"nombre": "Repasar", "hecha": False}\n]\n\ndef resumen(items):\n    hechas = 0\n    for tarea in items:\n        if tarea["hecha"]:\n            hechas += 1\n    porcentaje = int(hechas / len(items) * 100)\n    print(f"Completadas {hechas} de {len(items)} ({porcentaje}%)")\n    for tarea in items:\n        if not tarea["hecha"]:\n            print("-", tarea["nombre"])\n\nresumen(tareas)'
};

/* Variantes libres: el laboratorio ya no exige copiar la estructura del ejemplo. */
const FREE_VARIANTS = {
  3: 'cuenta = 20000\nporcentaje = 10\npropina = cuenta * (porcentaje / 100)\ntotal = propina + cuenta\nprint("Propina:", propina)\nprint("Total:", total)',
  8: 'tareas = ["Estudiar", "Ejercitar", "Descansar", "Dormir"]\nfor indice in range(len(tareas)):\n    print("-", tareas[indice])\nprint("Son", len(tareas), "tareas")',
  12: 'stock = {"teclado": 3, "mouse": 0, "monitor": 5}\nunidades = sum(stock.values())\nfor producto, cantidad in stock.items():\n    estado = "agotado" if cantidad == 0 else cantidad\n    print(producto, estado)\nprint(unidades)',
  20: 'tareas = [\n    {"nombre": "Leer la guía", "hecha": True},\n    {"nombre": "Practicar", "hecha": False},\n    {"nombre": "Repasar", "hecha": False}\n]\n\ndef resumen(items):\n    hechas = len([t for t in items if t["hecha"]])\n    print(f"Completadas {hechas} de {len(items)} ({int(hechas / len(items) * 100)}%)")\n    pendientes = [t["nombre"] for t in items if not t["hecha"]]\n    for nombre in pendientes:\n        print("-", nombre)\n\nresumen(tareas)'
};

/* 1. Estructura del curso. */

const data = createContext();
const levels = data.runJson("COURSE_LEVELS.map((level) => ({ id: level.id, stage: level.stage, title: level.completionTitle, projects: level.projects.map((p) => p.id) }))");
const exams = data.runJson("LEVEL_EXAMS");

assert.equal(levels.length, 5, "Python debe tener 5 niveles");
assert.deepEqual(levels.map((level) => level.projects.length), [4, 4, 4, 4, 4], "cada nivel tiene 4 proyectos");
assert.deepEqual(
  levels.flatMap((level) => level.projects),
  Array.from({ length: 20 }, (_, index) => index + 1),
  "los proyectos van del 1 al 20 sin saltos"
);
assert.equal(new Set(levels.map((level) => level.stage)).size, 5, "cada nivel tiene una etapa distinta");
for (const level of levels) {
  assert.match(level.title, /^Finalizaste .+ de Python\.$/, `nivel ${level.id} necesita mensaje de cierre`);
}

assert.equal(exams.length, 5, "debe existir un examen por nivel");
assert.deepEqual(exams.map((exam) => exam.levelId), [1, 2, 3, 4, 5]);
for (const exam of exams) {
  assert.equal(exam.questions.length, 5, `el examen ${exam.levelId} debe tener 5 preguntas`);
  assert.ok(exam.passing > 0 && exam.passing <= exam.questions.length, `umbral inválido en el examen ${exam.levelId}`);
  for (const [index, question] of exam.questions.entries()) {
    const position = `examen ${exam.levelId}, pregunta ${index + 1}`;
    assert.equal(question.options.length, 4, `${position} debe ofrecer 4 alternativas`);
    assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, `${position}: respuesta fuera de rango`);
    assert.equal(new Set(question.options).size, 4, `${position} repite alternativas`);
    assert.ok(question.explanation.length > 20, `${position} necesita explicación`);
  }
}

/* 2. Cada proyecto se resuelve con Python real y sus tres validaciones pasan. */

const lab = createContext();
const projects = lab.runJson("allProjects().map((p) => ({ id: p.id, checks: p.checks, starter: p.starter, file: p.file }))");
assert.equal(projects.length, 20);

function validar(context, projectId, code) {
  context.sandbox.__code = code;
  return context.runJson(
    "(() => {" +
    "  const project = allProjects().find((p) => p.id === " + projectId + ");" +
    "  try {" +
    "    const result = runPython(__code);" +
    "    return { error: null, output: result.output, checks: project.validate(result, __code).map(Boolean) };" +
    "  } catch (error) {" +
    "    return { error: error.message, output: [], checks: project.checks.map(() => false) };" +
    "  }" +
    "})()"
  );
}

let validaciones = 0;
for (const project of projects) {
  const solution = SOLUTIONS[project.id];
  assert.ok(solution, `falta la solución de referencia del proyecto ${project.id}`);
  assert.equal(project.checks.length, 3, `el proyecto ${project.id} debe declarar 3 comprobaciones`);
  assert.match(project.file, /^proyecto_\d\d\.py$/);

  const resuelto = validar(lab, project.id, solution);
  assert.equal(resuelto.error, null, `la solución del proyecto ${project.id} no debe fallar: ${resuelto.error}`);
  const fallidas = resuelto.checks.map((ok, index) => (ok ? null : index + 1)).filter(Boolean);
  assert.deepEqual(fallidas, [], `proyecto ${project.id}: comprobaciones sin cumplir ${fallidas.join(", ")}`);
  validaciones += resuelto.checks.length;

  if (project.id >= 3) {
    const inicial = validar(lab, project.id, project.starter);
    assert.ok(
      inicial.error || inicial.checks.some((ok) => !ok),
      `el código inicial del proyecto ${project.id} no debería aprobar la misión`
    );
  }
}

for (const [id, variante] of Object.entries(FREE_VARIANTS)) {
  const resultado = validar(lab, Number(id), variante);
  assert.equal(resultado.error, null, `la variante libre del proyecto ${id} no debe fallar: ${resultado.error}`);
  assert.deepEqual(
    resultado.checks,
    [true, true, true],
    `el proyecto ${id} debe aceptar una solución escrita de otra forma`
  );
}

/* 3. El laboratorio ejecuta de verdad y explica los errores. */

const errado = validar(lab, 4, 'minutos = 135\nhoras = minutos // cero');
assert.ok(errado.error, "un programa con un nombre inexistente debe fallar");
assert.match(errado.error, /cero/, "el error debe nombrar el problema");
assert.deepEqual(errado.checks, [false, false, false]);

const sinSalida = validar(lab, 1, 'mensaje = "hola"');
assert.ok(sinSalida.error, "sin print() no hay salida que comprobar");

assert.equal(/\beval\s*\(|new Function|Function\s*\(\s*["'`]/.test(courseSource), false, "python.js no puede usar eval ni Function");
assert.equal(/assertGuidedPython|simulador guiado/i.test(courseSource), false, "ya no quedan modelos guiados");

/* El botón real registra cada intento, también los fallidos, sin guardar código. */
const telemetry = createContext();
telemetry.run("globalThis.__now = Date.now(); Date.now = () => __now; activateProject(3);");
assert.equal(telemetry.run("LearningState.bitacora().eventos.length"), 0, "abrir un proyecto no cuenta como intento");
for (const code of ['print("incorrecto")', SOLUTIONS[3], 'print(']) {
  telemetry.sandbox.__code = code;
  telemetry.run("__now += 1500; projectCode.value = __code;");
  telemetry.elements.get("#run-course-project").click();
}
const attempts = telemetry.runJson("LearningState.bitacora().eventos");
assert.equal(attempts.length, 3, "cada clic debe registrar exactamente un intento");
assert.deepEqual(attempts.map(({ r, m, ok, e, ms }) => ({ r, m, ok, e, ms })), [
  { r: "python", m: 2, ok: false, e: false, ms: 1500 },
  { r: "python", m: 2, ok: true, e: false, ms: 3000 },
  { r: "python", m: 2, ok: false, e: true, ms: 4500 }
]);
assert.match(attempts[0].v, /^[01]{3}$/);
assert.notEqual(attempts[0].v, "111");
assert.equal(attempts[1].v, "111");
assert.equal(attempts[2].v, "000");
assert.deepEqual(Object.keys(attempts[0]).sort(), ["e", "m", "ms", "ok", "r", "t", "v"]);
assert.equal(guardado(telemetry.storage, "python").intentos["2"], 3, "el contador queda persistido con índice desde cero");
assert.equal(JSON.parse(telemetry.storage.get("codigo-cero.intentos-v1")).eventos.length, 3);
telemetry.run("__now += 10000; activateProject(4); __now += 500; projectCode.value = 'print(1)';");
telemetry.elements.get("#run-course-project").click();
assert.equal(telemetry.run("LearningState.bitacora().eventos[3].m"), 3);
assert.equal(telemetry.run("LearningState.bitacora().eventos[3].ms"), 500, "cambiar de proyecto inicia otro intervalo");
telemetry.elements.get("#hero-run").click();
assert.equal(telemetry.run("LearningState.bitacora().eventos.length"), 4, "el ejemplo de portada no cuenta como intento de proyecto");

/* 4. Los niveles se desbloquean al terminar el nivel anterior. */

const gate = createContext();
assert.equal(gate.run("TOTAL_PROJECTS"), 20);
assert.equal(gate.run("isLevelUnlocked(1)"), true);
for (const level of [2, 3, 4, 5]) {
  assert.equal(gate.run("isLevelUnlocked(" + level + ")"), false, `el nivel ${level} comienza bloqueado`);
}
assert.equal(gate.elements.get("#level-checkpoint").hidden, true, "el punto de control comienza oculto");

gate.run("[1, 2, 3].forEach((id) => completedProjects.add(id)); renderLevelTabs(); renderProject();");
assert.equal(gate.run("isLevelUnlocked(2)"), false, "3 de 4 proyectos no desbloquean el nivel siguiente");

gate.run("completedProjects.add(4); renderLevelTabs(); renderProject();");
assert.equal(gate.run("isLevelUnlocked(2)"), true, "terminar los 4 proyectos desbloquea el nivel 2");
assert.equal(gate.run("isExamUnlocked(1)"), true);
assert.equal(gate.run("isLevelUnlocked(3)"), false);
assert.equal(gate.elements.get("#level-checkpoint").hidden, false);
assert.equal(gate.elements.get("#checkpoint-title").textContent, "Finalizaste los conceptos básicos de Python.");
assert.match(gate.elements.get("#checkpoint-kicker").textContent, /^Punto de control · Conceptos básicos$/);

gate.run("[5, 6, 7, 8].forEach((id) => completedProjects.add(id)); renderLevelTabs(); renderProject();");
assert.equal(gate.run("isLevelUnlocked(3)"), true, "el nivel 3 se abre al cerrar el nivel 2");
assert.equal(gate.run("isLevelUnlocked(4)"), false);
gate.run("[9, 10, 11, 12, 13, 14, 15, 16].forEach((id) => completedProjects.add(id)); renderLevelTabs(); renderProject();");
assert.equal(gate.run("isLevelUnlocked(5)"), true, "el nivel 5 se abre al cerrar el nivel 4");

/* 5. La navegación no cruza hacia un nivel bloqueado. */

const walk = createContext();
walk.run("activateProject(5);");
assert.equal(walk.run("activeProjectId"), 1, "no se salta a un proyecto de un nivel bloqueado");
walk.run("activateProject(3);");
assert.equal(walk.run("activeProjectId"), 3);
walk.run("activateProject(4);");
assert.equal(walk.elements.get("#course-next").disabled, true, "el botón siguiente se bloquea al final del nivel");
walk.run("activateLevel(4);");
assert.equal(walk.run("activeLevelId"), 1, "no se activa un nivel bloqueado");

/* 6. Examen: incompleto, reprobado, reintentado y aprobado. */

const exam = createContext();
exam.run("[1, 2, 3, 4].forEach((id) => completedProjects.add(id)); renderLevelTabs(); renderProject();");
exam.run("openExam(1);");
assert.equal(exam.elements.get("#level-exam").hidden, false);
assert.equal(exam.elements.get("#exam-questions").children.length, 5);

exam.run("submitExam();");
assert.match(exam.elements.get("#exam-result").textContent, /Responde las 5 preguntas/);
assert.equal(exam.run("approvedExams.has(1)"), false);

exam.run("LEVEL_EXAMS[0].questions.forEach((question, index) => examAnswers.set(index, (question.answer + 1) % 4)); submitExam();");
assert.equal(exam.run("approvedExams.has(1)"), false, "cinco respuestas erróneas no aprueban");
assert.match(exam.elements.get("#exam-result").textContent, /necesitas 4/i);

exam.run("retryExam();");
assert.equal(exam.run("examAnswers.size"), 0);

exam.run("LEVEL_EXAMS[0].questions.forEach((question, index) => examAnswers.set(index, question.answer)); submitExam();");
assert.equal(exam.run("approvedExams.has(1)"), true);
assert.match(exam.elements.get("#exam-result").textContent, /Aprobado con 5 de 5/);
assert.deepEqual(guardado(exam.storage, "python").examenes, [1]);

/* 7. Umbral de aprobación. */

const grade = createContext();
const casi = grade.runJson(
  "gradeExam(3, new Map(LEVEL_EXAMS[2].questions.map((q, i) => [i, i === 0 ? (q.answer + 1) % 4 : q.answer])))"
);
assert.equal(casi.correct, 4);
assert.equal(casi.passed, true, "4 de 5 aprueba");

const insuficiente = grade.runJson(
  "gradeExam(5, new Map(LEVEL_EXAMS[4].questions.map((q, i) => [i, i < 2 ? (q.answer + 1) % 4 : q.answer])))"
);
assert.equal(insuficiente.correct, 3);
assert.equal(insuficiente.passed, false, "3 de 5 no aprueba");

/* 8. La ruta se cierra con los 20 proyectos y los 5 exámenes. */

const finish = createContext();
finish.run("for (let id = 1; id <= 20; id += 1) completedProjects.add(id); renderProgress();");
assert.equal(finish.elements.get("#route-progress-text").textContent, "20 de 20");
assert.equal(finish.elements.get("#course-finish").hidden, true, "sin exámenes la ruta no se cierra");

finish.run("[1, 2, 3, 4].forEach((id) => approvedExams.add(id)); renderProgress();");
assert.equal(finish.elements.get("#course-finish").hidden, true, "faltando un examen la ruta no se cierra");

finish.run("approvedExams.add(5); renderProgress();");
assert.equal(finish.elements.get("#course-finish").hidden, false, "con todo aprobado la ruta se cierra");

/* 9. Las soluciones de referencia son Python válido de verdad. */

let contrastadas = 0;
try {
  const file = path.join(os.tmpdir(), "codigo-cero-proyecto.py");
  for (const [id, solution] of Object.entries(SOLUTIONS)) {
    fs.writeFileSync(file, solution, "utf8");
    const real = execFileSync("python", [file], {
      encoding: "utf8",
      env: { ...process.env, PYTHONIOENCODING: "utf-8" }
    }).replace(/\r\n/g, "\n").replace(/\n$/, "");
    const propia = lab.runJson("globalThis.PythonRuntime.run(" + JSON.stringify(solution) + ")").text;
    assert.equal(propia, real, `el proyecto ${id} da distinto que CPython`);
    contrastadas += 1;
  }
} catch (error) {
  if (error instanceof assert.AssertionError) throw error;
  contrastadas = -1;
}

const detalle = contrastadas >= 0
  ? contrastadas + " soluciones contrastadas con CPython"
  : "CPython no disponible en este equipo";
console.log(`Python: 5 niveles, 20 proyectos resueltos, ${validaciones} validaciones, 5 exámenes y 25 preguntas (${detalle})`);

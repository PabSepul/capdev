import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { solveRoute, checkExams, checkSafety } from "./starter-harness.mjs";
const require = createRequire(import.meta.url);
let JSDOM;
try { ({ JSDOM } = require("jsdom")); }
catch { ({ JSDOM } = require(path.join(process.env.CONTENT_QA_MODULES || path.join(os.tmpdir(), "capsulasdev-content-qa", "node_modules"), "jsdom"))); }
const window = new JSDOM("").window;
const solutions = [
  '<html lang="es-CL"><head><title>Inscripción al curso</title></head><body><h1>Inscripción</h1></body></html>',
  '<h1>Curso de Git</h1><h2>Requisitos</h2><p>Una terminal.</p><h2>Programa</h2>',
  '<a href="#contenido">Saltar al contenido</a><nav aria-label="Principal"><a href="#contenido">Curso</a></nav><main id="contenido"><h1>Curso</h1></main>',
  '<figure><img id="diagrama" src="flujo.png" alt="La solicitud pasa del navegador a la API"><figcaption>Recorrido de los datos.</figcaption></figure><p>La API devuelve datos para mostrar el curso.</p>',
  '<h1>Bienvenida</h1><img id="adorno" src="adorno.png" alt=""><p>Elige el curso que quieres estudiar.</p>',
  '<label for="correo">Correo electrónico</label><input id="correo" name="correo" type="email"><button>Enviar</button>',
  '<button type="button">Guardar borrador</button>',
  '<h1>Continúa aprendiendo</h1><a href="git.html">Abrir la ruta de Git</a><a href="sql.html">Abrir la ruta de SQL</a>',
  '<fieldset><legend>Modalidad</legend><label><input type="radio" name="modalidad" value="remota">Remota</label><label><input type="radio" name="modalidad" value="presencial">Presencial</label></fieldset>',
  '<table><caption>Duración de cursos</caption><tr><th scope="col">Curso</th><th scope="col">Horas</th></tr><tr><td>Git</td><td>4</td></tr></table>',
  '<p id="muestra" style="color:#333333;background-color:#ffffff">Texto del curso</p>',
  '<form><label for="correo">Correo</label><input id="correo" type="email" name="correo" aria-invalid="true" aria-describedby="error-correo"><p id="error-correo">Escribe un correo con @.</p><button>Inscribirme</button><p role="status">Revisa el correo.</p></form>'
];
const { context } = solveRoute({ id: "accesibilidad", globalName: "AccessibilityCourse", solutions,
  files: ["starter-exams.js", "course-kit.js", "accessibility-lab.js", "accessibility-course.js", "starter-course.js"],
  globals: { DOMParser: window.DOMParser } });
checkExams(context, "accesibilidad");
checkSafety(["accessibility-lab.js", "accessibility-course.js"]);
const run = (s) => context.runJson("AccessibilityLab.run(" + JSON.stringify(s) + ")");
assert.equal(run('<label for="otro">Correo</label><input id="correo">').facts.labels, false);
assert.equal(run('<label>Correo<input></label>').facts.labels, true, "asociación implícita válida");
assert.equal(run('<label hidden for="correo">Correo</label><input id="correo">').facts.labels, false);
assert.equal(run('<!-- <h1>Título</h1> -->').facts.heading, false);
assert.equal(run('<h1 hidden>Título</h1>').facts.heading, false);
assert.equal(run('<h1>Título</h1><h3>Salto</h3>').facts.hierarchy, false);
assert.equal(run('<button tabindex="2">Guardar</button>').facts.tabOrder, false);
assert.equal(run('<button tabindex="-1">Guardar</button>').facts.button, false, "el botón de práctica debe alcanzarse con Tab");
assert.equal(run('<fieldset><legend>Modalidad</legend><input type="radio" name="m"><input type="radio" name="m"></fieldset>').facts.radioNames, false, "las opciones necesitan valores distintos");
assert.equal(run('<img id="adorno">').facts.decorative, false);
assert.equal(run('<input aria-invalid="true" aria-describedby="ausente">').facts.feedback, false);
assert.equal(run('<p id="muestra" style="color:#777;background-color:#fff">Casi</p>').facts.contrast, false, "4,478 no se redondea a 4,5");
assert.equal(context.run("AccessibilityLab.contrast('#000','#fff')"), 21);
assert.equal(context.run("AccessibilityLab.contrast('#fff','#fff')"), 1);
assert.equal(context.run("AccessibilityLab.contrast('transparent','#fff')"), null);
const sanitized = run('<script>alert(1)</script><iframe src="https://example.com"></iframe><img src="https://example.com/a" onerror="alert(1)"><a href="javascript:alert(1)">X</a>');
assert.doesNotMatch(sanitized.html, /<script|<iframe|onerror|src=|javascript:/i);
assert.match(context.elements.get("#starter-preview").srcdoc, /form-action 'none'/);
window.close();
console.log("Accesibilidad: 12 módulos, 36 validaciones, 3 exámenes; DOM real, asociaciones, contraste y aislamiento: OK");

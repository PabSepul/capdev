import assert from "node:assert/strict";
import { solveRoute, checkExams, checkSafety } from "./starter-harness.mjs";

const solutions = [
  "# Agenda\n\nUna aplicación para organizar las tareas de la semana.\n",
  "# Agenda\n\n## Instalación\n\nPrepara el entorno.\n\n## Uso\n\nAbre el programa.\n",
  "Guarda **los cambios** antes de *continuar*.\n",
  "## Requisitos\n\n- Editor\n- Terminal\n- Git\n",
  "## Inicio rápido\n\n1. Abre el editor.\n2. Abre el proyecto.\n3. Ejecuta el programa.\n",
  "[Referencia CommonMark](https://commonmark.org/help/) y [Guía de accesibilidad](https://www.w3.org/WAI/tutorials/).\n",
  "Abre `README.md` y ejecuta `node app.js`.\n",
  '```javascript\nconsole.log("Hola");\n```\n\nLa salida esperada es Hola.\n',
  "> Nota: el ejemplo no utiliza red.\n\nContinúa con el archivo local.\n",
  "![El navegador consulta la API y recibe los datos](flujo.png)\n\nEl flujo conecta la solicitud del navegador con la respuesta de la API.\n",
  "# Agenda\n\n## Requisitos\n\n- Node.js\n\n## Instalación\n\n```sh\nnpm install\n```\n\n## Uso\n\n```sh\nnode app.js\n```\n",
  "# El comando termina con error\n\n## Resumen\n\nNo aparece el saludo.\n\n## Reproducción\n\n1. Abre el proyecto.\n2. Abre una terminal.\n3. Ejecuta el programa.\n\n## Esperado\n\nUn saludo.\n\n## Actual\n\n```text\nArchivo no encontrado\n```\n"
];
const files = ["starter-exams.js", "vendor/commonmark-0.31.2.min.js", "course-kit.js", "markdown-lab.js", "markdown-course.js", "starter-course.js"];
const { context } = solveRoute({ id: "markdown", files, solutions, globalName: "MarkdownCourse" });
checkExams(context, "markdown");
checkSafety(["course-kit.js", "markdown-lab.js", "markdown-course.js"]);
const run = (s) => context.runJson("MarkdownLab.run(" + JSON.stringify(s) + ")");
assert.equal(run("# Título\n").html, "<h1>Título</h1>\n");
assert.equal(run("*uno* y **dos**\n").html, "<p><em>uno</em> y <strong>dos</strong></p>\n");
assert.equal(run("1. Uno\n2. Dos\n").html, "<ol>\n<li>Uno</li>\n<li>Dos</li>\n</ol>\n");
assert.equal(run("```js\n<a>\n```\n").html, '<pre><code class="language-js">&lt;a&gt;\n</code></pre>\n');
assert.equal(run("#Sin espacio\n").nodes.some((n) => n.type === "heading"), false);
assert.equal(run("```\n# No es título\n```\n").nodes.some((n) => n.type === "heading"), false);
assert.equal(run("<!-- # Tampoco es título -->").nodes.some((n) => n.type === "heading"), false);
assert.doesNotMatch(run('<script>alert(1)</script>\n\n[x](javascript:alert%281%29)').html, /<script|href="javascript:/i);
assert.ok(run("x".repeat(30001)).error);
assert.match(context.elements.get("#starter-preview").srcdoc, /default-src 'none'/);
console.log("Markdown: 12 módulos, 36 validaciones, 3 exámenes; renderizado CommonMark, estructura y HTML inactivo: OK");

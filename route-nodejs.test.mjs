import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { solveRoute, checkExams, checkSafety, read } from "./starter-harness.mjs";

/*
  Ruta Node.js. Dos comprobaciones distintas:

  1. Los doce módulos se resuelven por el camino real de la página.
  2. Las mismas soluciones se ejecutan con el Node.js de verdad de esta máquina,
     escribiendo los archivos del proyecto en una carpeta temporal y, cuando el
     módulo levanta un servidor, pidiéndole las mismas rutas con fetch. Si el
     laboratorio se separa de Node, la prueba falla.
*/

const FILES = ["starter-exams.js", "starter-runtime.js", "node-lab.js", "nodejs-course.js", "starter-course.js"];

const SOLUTIONS = [
  `const minutos = Number(process.argv[2]);
const horas = minutos / 60;
console.log(horas);`,

  `const fs = require("node:fs");
const texto = fs.readFileSync("notas.txt", "utf8");
const lineas = texto.trim().split("\\n");
console.log(lineas.length);
console.log(lineas[0]);`,

  `const fs = require("node:fs");
const texto = fs.readFileSync("notas.txt", "utf8");
const lineas = texto.trim().split("\\n");
fs.writeFileSync("resumen.txt", "Tareas: " + lineas.length + "\\n");
console.log(fs.readFileSync("resumen.txt", "utf8").trim());`,

  `const fs = require("node:fs");
const cursos = JSON.parse(fs.readFileSync("cursos.json", "utf8"));
let total = 0;
for (const curso of cursos) {
  total = total + curso.horas;
}
console.log(cursos.length);
console.log(total);`,

  `const mayusculas = require("./formato.js");
console.log(mayusculas("hola node"));`,

  `const calculos = require("./calculos.js");
const horas = [12, 5, 4];
console.log(calculos.sumar(horas));
console.log(calculos.promedio(horas));`,

  `const path = require("node:path");
const ruta = path.join("datos", "informes", "marzo.csv");
console.log(ruta);
console.log(path.basename(ruta));
console.log(path.extname(ruta));`,

  `const fs = require("node:fs");
const path = require("node:path");
const nombres = fs.readdirSync(".");
const scripts = nombres.filter(function (nombre) { return path.extname(nombre) === ".js"; });
console.log(nombres.length);
console.log(scripts.join(", "));`,

  `const http = require("node:http");
const servidor = http.createServer(function (req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hola desde Node");
});
servidor.listen(3000, function () {
  console.log("Escuchando en 3000");
});`,

  `const http = require("node:http");
const servidor = http.createServer(function (req, res) {
  res.setHeader("Content-Type", "text/plain");
  if (req.url === "/") {
    res.statusCode = 200;
    res.end("Inicio");
    return;
  }
  if (req.url === "/cursos") {
    res.statusCode = 200;
    res.end("Listado de cursos");
    return;
  }
  res.statusCode = 404;
  res.end("No encontrado");
});
servidor.listen(3000);`,

  `const http = require("node:http");
const fs = require("node:fs");

const servidor = http.createServer(function (req, res) {
  const cursos = JSON.parse(fs.readFileSync("cursos.json", "utf8"));
  const activos = cursos.filter(function (curso) { return curso.activo; });
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(activos));
});
servidor.listen(3000);`,

  `const http = require("node:http");
const fs = require("node:fs");

function leerCursos() {
  return JSON.parse(fs.readFileSync("cursos.json", "utf8"));
}

const servidor = http.createServer(function (req, res) {
  res.setHeader("Content-Type", "application/json");
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Método no permitido" }));
    return;
  }
  if (req.url === "/cursos") {
    res.statusCode = 200;
    res.end(JSON.stringify(leerCursos()));
    return;
  }
  if (req.url.indexOf("/cursos/") === 0) {
    const id = Number(req.url.split("/")[2]);
    const encontrado = leerCursos().find(function (curso) { return curso.id === id; });
    if (encontrado === undefined) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Curso no encontrado" }));
      return;
    }
    res.statusCode = 200;
    res.end(JSON.stringify(encontrado));
    return;
  }
  res.statusCode = 404;
  res.end(JSON.stringify({ error: "Ruta no encontrada" }));
});
servidor.listen(3000);`
];

const { context, comprobaciones } = solveRoute({
  id: "nodejs",
  files: FILES,
  solutions: SOLUTIONS,
  globalName: "NodeCourse"
});

const preguntas = checkExams(context, "nodejs");
checkSafety(["node-lab.js", "nodejs-course.js"]);

/* El laboratorio no puede prometer lo que no ejecuta. */
const lab = read("node-lab.js");
assert.match(lab, /no instala paquetes con npm/, "pedir un paquete de npm debe explicarse");
const pagina = read("nodejs.html");
assert.match(pagina, /No hay npm, no hay red/, "la página declara el alcance del laboratorio");
assert.ok(pagina.indexOf('src="starter-runtime.js') < pagina.indexOf('src="node-lab.js'),
  "el intérprete se carga antes que el laboratorio");
assert.ok(pagina.indexOf('src="node-lab.js') < pagina.indexOf('src="nodejs-course.js'),
  "el laboratorio se carga antes que el curso");

/* Lo que el laboratorio no puede hacer tiene que decirlo con sus palabras. Un
   error marcado como no amistoso lo reemplaza el intérprete por un aviso
   genérico de sintaxis, que es exactamente lo que no sirve para aprender. */
const ERRORES = [
  ['const express = require("express");', /no instala paquetes con npm/],
  ['const fs = require("node:fs");\nfs.readFileSync("no-existe.txt", "utf8");', /No existe el archivo no-existe\.txt/],
  ['const fs = require("node:fs");\nfs.readFileSync("notas.txt");', /Indica la codificación/],
  ['JSON.parse("{no}");', /no es JSON válido/],
  ['const http = require("node:http");\nhttp.createServer(function (req, res) {}).listen(3000);', /quedó sin respuesta/],
  ['require("./nada.js");', /No existe el módulo nada\.js/],
  ["process.exit(0);", /process\.exit\(\) no está disponible/]
];
for (const [programa, esperado] of ERRORES) {
  const salida = context.runJson("globalThis.NodeLab.run(" + JSON.stringify(programa) + ", {})");
  assert.ok(salida.error, "este programa debía fallar:\n" + programa);
  assert.match(salida.error, esperado, "el aviso no explica el problema: " + salida.error);
  assert.match(salida.text, esperado, "el aviso tiene que llegar a la pantalla");
}

/* Los escenarios de los módulos con servidor tienen que pedir algo. */
const escenarios = context.runJson("globalThis.NodeCourse.lessons.map((m) => m.scenario || null)");
for (const [indice, escenario] of escenarios.entries()) {
  if (indice < 8) continue;
  assert.ok(escenario && Array.isArray(escenario.requests) && escenario.requests.length > 0,
    "módulo " + (indice + 1) + ": un módulo de servidor necesita peticiones que probar");
}

/* ------------------- contraste con el Node.js real de esta máquina ------------------- */

const archivosBase = context.runJson("globalThis.NodeLab.archivos");
let contrastadas = 0;
try {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), "codigo-cero-node-"));
  for (const [indice, solucion] of SOLUTIONS.entries()) {
    const escenario = escenarios[indice] || {};
    const carpeta = path.join(raiz, "m" + (indice + 1));
    fs.mkdirSync(carpeta);
    for (const [ruta, contenido] of Object.entries(archivosBase)) {
      fs.writeFileSync(path.join(carpeta, ruta.replace("/proyecto/", "")), contenido, "utf8");
    }
    /* El laboratorio usa siempre separadores POSIX; en Windows, Node real usa "\\". */
    const paraNode = solucion.replace(/require\("node:path"\)/g, 'require("node:path").posix');
    const propio = context.runJson("globalThis.NodeLab.run(" + JSON.stringify(solucion) + ", "
      + JSON.stringify(escenario) + ")");

    if (!escenario.requests) {
      fs.writeFileSync(path.join(carpeta, "app.cjs"), paraNode, "utf8");
      const real = execFileSync(process.execPath, ["app.cjs", ...(escenario.argv || [])],
        { cwd: carpeta, encoding: "utf8", timeout: 15000 }).replace(/\r\n/g, "\n").trimEnd();
      assert.equal(propio.output.join("\n").trimEnd(), real,
        "módulo " + (indice + 1) + ": el laboratorio se separó de Node.js real");
      contrastadas += 1;
      continue;
    }

    fs.writeFileSync(path.join(carpeta, "app.cjs"),
      paraNode.replace(/listen\(\d+/, "listen(0") + "\nmodule.exports = servidor;", "utf8");
    fs.writeFileSync(path.join(carpeta, "conductor.cjs"), `
const peticiones = ${JSON.stringify(escenario.requests)};
const { once } = require("node:events");
const servidor = require("./app.cjs");
(async () => {
  if (!servidor.listening) await once(servidor, "listening");
  try {
  const salida = [];
  for (const p of peticiones) {
    const r = await fetch("http://127.0.0.1:" + servidor.address().port + p.url,
      { method: p.method, headers: { Connection: "close" } });
    salida.push({ method: p.method, url: p.url, status: r.status, type: r.headers.get("content-type"), body: await r.text() });
  }
  console.log("@@" + JSON.stringify(salida));
  } finally {
    await new Promise((resolve, reject) => servidor.close((error) => error ? reject(error) : resolve()));
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
`, "utf8");
    const bruto = execFileSync(process.execPath, ["conductor.cjs"], { cwd: carpeta, encoding: "utf8", timeout: 20000 });
    const reales = JSON.parse(bruto.split("@@")[1]);
    const mias = propio.respuestas.map((r) => ({
      method: r.method, url: r.url, status: r.status,
      type: r.headers["content-type"] || null, body: r.body
    }));
    assert.deepEqual(mias, reales, "módulo " + (indice + 1) + ": las respuestas HTTP no coinciden con Node.js real");
    contrastadas += 1;
  }
} catch (error) {
  if (error instanceof assert.AssertionError) throw error;
  throw new Error("No se pudo completar el contraste con Node real tras " + contrastadas
    + " soluciones. La comparación es obligatoria.", { cause: error });
}

assert.equal(contrastadas, SOLUTIONS.length, "todas las soluciones deben contrastarse con Node real");
const detalle = contrastadas + " soluciones contrastadas con Node " + process.version;
console.log(`Node.js: 12 módulos resueltos, ${comprobaciones} validaciones, 3 exámenes y ${preguntas} preguntas (${detalle})`);

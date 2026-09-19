import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let JSDOM;
try { ({ JSDOM } = require("jsdom")); }
catch { ({ JSDOM } = require(path.join(process.env.CONTENT_QA_MODULES || path.join(os.tmpdir(), "capsulasdev-content-qa", "node_modules"), "jsdom"))); }
const domWindow = new JSDOM("").window;
const read = file => fs.readFileSync(new URL(file, import.meta.url), "utf8");

const routes = [
  { id: "terminal", global: "TerminalCourse", files: ["starter-exams.js", "terminal-lab.js", "terminal-course.js"], run: "TerminalLab.run(m.solution,m.scenario)" },
  { id: "regex", global: "RegexCourse", files: ["starter-exams.js", "regex-lab.js", "regex-course.js"], run: "RegexLab.run(m.solution,m.scenario)" },
  { id: "ia", global: "IaCourse", files: ["starter-exams.js", "ia-lab.js", "ia-course.js"], run: "IaLab.run(m.solution)" },
  { id: "datos-python", global: "DatosPythonCourse", files: ["starter-exams.js", "python-runtime.js", "datos-python-course.js"], run: "PythonRuntime.run(m.solution)" },
  { id: "nodejs", global: "NodeCourse", files: ["starter-exams.js", "starter-runtime.js", "node-lab.js", "nodejs-course.js"], run: "NodeLab.run(m.solution,m.scenario)" },
  { id: "typescript", global: "TypeScriptCourse", files: ["starter-exams.js", "starter-runtime.js", "ts-lab.js", "typescript-course.js"], run: "TsLab.run(m.solution)" },
  { id: "react", global: "ReactCourse", files: ["starter-exams.js", "starter-runtime.js", "react-lab.js", "react-course.js"], run: "ReactLab.run(m.solution,m.scenario)" },
  { id: "json", global: "JsonCourse", files: ["starter-exams.js", "json-lab.js", "json-course.js"], run: "JsonLab.run(m.solution,m.scenario)" },
  { id: "markdown", global: "MarkdownCourse", files: ["starter-exams.js", "vendor/commonmark-0.31.2.min.js", "course-kit.js", "markdown-lab.js", "markdown-course.js"], run: "MarkdownLab.run(m.solution)" },
  { id: "accesibilidad", global: "AccessibilityCourse", files: ["starter-exams.js", "course-kit.js", "accessibility-lab.js", "accessibility-course.js"], run: "AccessibilityLab.run(m.solution,m.scenario)" },
  { id: "testing", global: "TestingCourse", files: ["starter-exams.js", "starter-runtime.js", "course-kit.js", "testing-lab.js", "testing-course.js"], run: "TestingLab.run(m.solution,m.scenario)" },
  { id: "docker", global: "DockerCourse", files: ["starter-exams.js", "course-kit.js", "new-tech-labs.js", "new-tech-courses.js"], run: "DockerLab.run(m.solution,m.scenario)" },
  { id: "mongodb", global: "MongoCourse", files: ["starter-exams.js", "course-kit.js", "new-tech-labs.js", "new-tech-courses.js"], run: "MongoLab.run(m.solution)" }
];

let modules = 0;
let checks = 0;
for (const route of routes) {
  const sandbox = { console, DOMParser: domWindow.DOMParser };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  for (const file of [...route.files, "remaining-fifty-courses.js"])
    vm.runInContext(read(file), sandbox, { filename: file });

  const course = sandbox[route.global];
  assert.equal(course.lessons.length, 50, `${route.id}: 50 módulos`);
  assert.equal(course.levels.length, 13, `${route.id}: 13 niveles`);
  assert.deepEqual(Array.from(course.levels, level => level.modules.length), [4,4,4,4,4,4,4,4,4,4,4,4,2], `${route.id}: distribución por nivel`);
  assert.equal(sandbox.StarterExams.LEVEL_EXAMS[route.id].length, 13, `${route.id}: 13 exámenes`);
  const added = course.lessons.slice(12);
  const titles = new Set();
  for (const [index, module] of added.entries()) {
    const where = `${route.id}, módulo ${index + 13}`;
    for (const field of ["title", "shortTitle", "intro", "example", "explanation", "goal", "starter", "solution"])
      assert.ok(module[field], `${where}: falta ${field}`);
    assert.ok(module.intro.length >= 80, `${where}: introducción insuficiente`);
    assert.ok(module.goal.length >= 60, `${where}: misión insuficiente`);
    assert.equal(module.shortTitle.length <= 34, true, `${where}: título corto demasiado largo`);
    assert.equal(module.hints.length, 3, `${where}: tres pistas`);
    assert.equal(module.concepts.length, 3, `${where}: tres conceptos`);
    assert.equal(module.checks.length, 3, `${where}: tres comprobaciones`);
    assert.equal(titles.has(module.title), false, `${where}: título repetido`);
    titles.add(module.title);
  }

  const report = vm.runInContext(`globalThis.${route.global}.lessons.slice(12).map(m=>{const r=${route.run};return {error:r.error||null,pass:m.checks.map(c=>Boolean(c.test(m.solution,r))),starter:m.checks[0].test(m.starter,r)}})`, sandbox);
  for (const [index, item] of report.entries()) {
    assert.equal(item.error, null, `${route.id}, módulo ${index + 13}: la solución debe ejecutarse`);
    assert.deepEqual(Array.from(item.pass), [true,true,true], `${route.id}, módulo ${index + 13}: la referencia debe aprobar`);
    assert.equal(item.starter, false, `${route.id}, módulo ${index + 13}: el inicio requiere intervención`);
  }
  modules += added.length;
  checks += added.length * 3;
}

console.log(`Rutas 13–50: ${routes.length} cursos, ${modules} módulos nuevos, ${checks} validaciones y 130 exámenes nuevos: OK`);

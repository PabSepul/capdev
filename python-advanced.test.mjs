import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { ADVANCED_SOLUTIONS } from "./python-advanced-fixtures.mjs";

const require = createRequire(import.meta.url);
const modules = process.env.CONTENT_QA_MODULES || path.join(os.tmpdir(), "capsulasdev-content-qa", "node_modules");
const { JSDOM } = require(path.join(modules, "jsdom"));
const read = file => fs.readFileSync(new URL(file, import.meta.url), "utf8");
const window = new JSDOM(read("python.html"), { url: "http://localhost/python.html", runScripts: "outside-only" }).window;
for (const file of ["learning-state.js", "python-runtime.js", "python-advanced-course.js", "python.js"]) window.eval(read(file));

const levels = JSON.parse(JSON.stringify(window.PythonAdvancedCourse.levels.map(level => ({ id: level.id, projects: level.projects.map(project => project.id) }))));
assert.deepEqual(levels.map(level => level.id), [6, 7, 8, 9, 10]);
assert.deepEqual(levels.map(level => level.projects.length), [4, 4, 4, 4, 4]);
assert.deepEqual(levels.flatMap(level => level.projects), Array.from({ length: 20 }, (_, index) => index + 21));

const exams = JSON.parse(JSON.stringify(window.PythonAdvancedCourse.exams));
assert.deepEqual(exams.map(exam => exam.levelId), [6, 7, 8, 9, 10]);
for (const exam of exams) {
  assert.equal(exam.questions.length, 5, `nivel ${exam.levelId}: cinco preguntas`);
  assert.equal(exam.passing, 4);
  for (const question of exam.questions) {
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.ok(question.explanation.length > 20);
  }
}

const projects = window.PythonAdvancedCourse.levels.flatMap(level => level.projects);
let validations = 0;
for (const project of projects) {
  for (const field of ["title", "shortTitle", "summary", "prerequisites", "example", "explanation", "goal", "starter", "success"]) {
    assert.ok(typeof project[field] === "string" && project[field].length > 0, `proyecto ${project.id}: falta ${field}`);
  }
  assert.equal(project.concepts.length, 3, `proyecto ${project.id}: tres conceptos`);
  assert.equal(project.hints.length, 3, `proyecto ${project.id}: tres pistas`);
  assert.equal(project.checks.length, 3, `proyecto ${project.id}: tres comprobaciones`);
  assert.equal(project.lesson.feedback.length, 3, `proyecto ${project.id}: orientación por criterio`);
  assert.ok(project.lesson.walkthrough.length >= 2 && project.lesson.walkthrough.length <= 4);
  for (const field of ["prediction", "answer", "reflection", "extension"]) assert.ok(project.lesson[field].length > 20);

  const example = window.PythonRuntime.run(project.example);
  assert.equal(example.error, null, `ejemplo ${project.id}: ${example.error}`);
  assert.ok(example.output.length > 0, `ejemplo ${project.id}: debe producir una salida observable`);

  const starter = window.PythonRuntime.run(project.starter);
  assert.equal(starter.error, null, `inicio ${project.id}: ${starter.error}`);
  assert.equal(project.validate(starter, project.starter).every(Boolean), false, `inicio ${project.id}: no debe aprobar`);

  const solution = ADVANCED_SOLUTIONS[project.id];
  assert.ok(solution, `proyecto ${project.id}: falta solución de referencia`);
  const solved = window.PythonRuntime.run(solution);
  assert.equal(solved.error, null, `solución ${project.id}: ${solved.error}`);
  assert.deepEqual(Array.from(project.validate(solved, solution), Boolean), [true, true, true], `proyecto ${project.id}: solución rechazada`);
  validations += 3;
}

assert.match(read("python.js"), /python-prerequisites[\s\S]*Antes de empezar:/, "el controlador muestra los prerrequisitos avanzados");

let contrasted = 0;
try {
  const file = path.join(os.tmpdir(), "capsulasdev-python-avanzado.py");
  for (const [id, solution] of Object.entries(ADVANCED_SOLUTIONS)) {
    fs.writeFileSync(file, solution, "utf8");
    const real = execFileSync("python", [file], { encoding: "utf8", env: { ...process.env, PYTHONIOENCODING: "utf-8" } })
      .replace(/\r\n/g, "\n").replace(/\n$/, "");
    const own = window.PythonRuntime.run(solution);
    assert.equal(own.error, null, `intérprete educativo ${id}: ${own.error}`);
    assert.equal(own.text, real, `proyecto ${id}: salida distinta de CPython`);
    contrasted += 1;
  }
} catch (error) {
  if (error instanceof assert.AssertionError) throw error;
  contrasted = -1;
}

window.close();
console.log(`Python avanzado: 5 niveles, 20 proyectos, ${validations} validaciones y 5 exámenes (${contrasted < 0 ? "CPython no disponible" : contrasted + " soluciones contrastadas con CPython"})`);

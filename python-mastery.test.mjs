import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { MASTERY_SOLUTIONS } from "./python-mastery-fixtures.mjs";

const require = createRequire(import.meta.url);
const modules = process.env.CONTENT_QA_MODULES || path.join(os.tmpdir(), "capsulasdev-content-qa", "node_modules");
const { JSDOM } = require(path.join(modules, "jsdom"));
const read = file => fs.readFileSync(new URL(file, import.meta.url), "utf8");
const window = new JSDOM(read("python.html"), { url: "http://localhost/python.html", runScripts: "outside-only" }).window;
for (const file of ["learning-state.js", "python-runtime.js", "python-advanced-course.js", "python-mastery-course.js", "python.js"]) window.eval(read(file));

const levels = window.PythonMasteryCourse.levels;
assert.deepEqual(Array.from(levels, level => level.id), [11, 12, 13]);
assert.deepEqual(Array.from(levels, level => level.projects.length), [4, 4, 2]);
assert.deepEqual(Array.from(levels.flatMap(level => level.projects), project => project.id), Array.from({ length: 10 }, (_, index) => index + 41));

for (const exam of window.PythonMasteryCourse.exams) {
  assert.equal(exam.questions.length, 5, `nivel ${exam.levelId}: cinco preguntas`);
  assert.equal(exam.passing, 4);
  for (const question of exam.questions) {
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.ok(question.explanation.length > 20);
  }
}

let validations = 0;
for (const project of levels.flatMap(level => level.projects)) {
  for (const field of ["title", "shortTitle", "summary", "prerequisites", "example", "explanation", "goal", "starter", "success"]) {
    assert.ok(typeof project[field] === "string" && project[field].length > 0, `proyecto ${project.id}: falta ${field}`);
  }
  assert.equal(project.concepts.length, 3, `proyecto ${project.id}: tres conceptos`);
  assert.equal(project.hints.length, 3, `proyecto ${project.id}: tres pistas`);
  assert.equal(project.checks.length, 3, `proyecto ${project.id}: tres comprobaciones`);
  assert.equal(project.lesson.feedback.length, 3, `proyecto ${project.id}: feedback por criterio`);
  assert.equal(project.lesson.walkthrough.length, 3, `proyecto ${project.id}: tres pasos`);
  for (const field of ["prediction", "answer", "reflection", "extension"]) assert.ok(project.lesson[field].length > 20);

  const example = window.PythonRuntime.run(project.example);
  assert.equal(example.error, null, `ejemplo ${project.id}: ${example.error}`);
  assert.ok(example.output.length > 0, `ejemplo ${project.id}: salida observable`);

  const starter = window.PythonRuntime.run(project.starter);
  assert.equal(starter.error, null, `inicio ${project.id}: ${starter.error}`);
  assert.equal(project.validate(starter, project.starter).every(Boolean), false, `inicio ${project.id}: no debe aprobar`);

  const solution = MASTERY_SOLUTIONS[project.id];
  assert.ok(solution, `proyecto ${project.id}: falta solución de referencia`);
  const solved = window.PythonRuntime.run(solution);
  assert.equal(solved.error, null, `solución ${project.id}: ${solved.error}`);
  assert.deepEqual(Array.from(project.validate(solved, solution), Boolean), [true, true, true], `proyecto ${project.id}: solución rechazada`);
  validations += 3;
}

assert.equal(window.document.querySelectorAll("[data-level-target]").length, 13);
assert.match(read("python.html"), /13 niveles · 50 proyectos/);

let contrasted = 0;
try {
  const file = path.join(os.tmpdir(), "capsulasdev-python-maestria.py");
  for (const [id, solution] of Object.entries(MASTERY_SOLUTIONS)) {
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
console.log(`Python 41–50: 3 niveles, 10 proyectos, ${validations} validaciones y 3 exámenes (${contrasted < 0 ? "CPython no disponible" : contrasted + " soluciones contrastadas con CPython"})`);

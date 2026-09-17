import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { HTML_CSS_FIFTY_SOLUTIONS } from "./html-css-fifty-fixtures.mjs";

const read = file => fs.readFileSync(new URL(file, import.meta.url), "utf8");
const sandbox = {};
vm.createContext(sandbox);
for (const file of [
  "base-courses.js", "starter-exams.js", "learning-guidance.js",
  "course-expansion.js", "html-css-learning.js", "html-css-fifty-course.js"
]) vm.runInContext(read(file), sandbox, { filename: file });

const course = sandbox.HtmlCssCourse;
assert.equal(course.levels.length, 13, "HTML/CSS debe tener trece niveles");
assert.deepEqual(Array.from(course.levels, level => level.modules.length), [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2]);
assert.equal(course.levels.flatMap(level => level.modules).length, 50);
assert.equal(sandbox.StarterExams.LEVEL_EXAMS["html-css"].length, 13);

const modules = course.levels.slice(4).flatMap(level => level.modules);
assert.deepEqual(Array.from(modules, item => item.id), Array.from({ length: 34 }, (_, index) => index + 17));

let validations = 0;
for (const item of modules) {
  for (const field of ["title", "shortTitle", "intro", "example", "explanation", "goal", "starter", "success"]) {
    assert.ok(typeof item[field] === "string" && item[field].length > 0, `módulo ${item.id}: falta ${field}`);
  }
  assert.equal(item.concepts.length, 3, `módulo ${item.id}: tres conceptos`);
  assert.equal(item.hints.length, 3, `módulo ${item.id}: tres pistas`);
  assert.equal(item.checks.length, 3, `módulo ${item.id}: tres comprobaciones`);
  assert.equal(item.lesson.feedback.length, 3, `módulo ${item.id}: orientación por criterio`);
  assert.equal(item.lesson.walkthrough.length, 3, `módulo ${item.id}: tres pasos`);
  for (const field of ["prerequisites", "prediction", "answer", "reflection", "extension"]) {
    assert.ok(typeof item.lesson[field] === "string" && item.lesson[field].length > 20, `módulo ${item.id}: falta ${field}`);
  }
  assert.match(item.example, /<[^>]+>/, `módulo ${item.id}: ejemplo ejecutable`);
  assert.equal(item.checks.every(entry => entry.test(item.starter, {})), false, `módulo ${item.id}: el inicio exige intervenir`);
  const solution = HTML_CSS_FIFTY_SOLUTIONS[item.id];
  assert.ok(solution, `módulo ${item.id}: falta solución de referencia`);
  assert.deepEqual(Array.from(item.checks, entry => Boolean(entry.test(solution, {}))), [true, true, true], `módulo ${item.id}: solución rechazada`);
  validations += item.checks.length;
}

for (const exam of sandbox.StarterExams.LEVEL_EXAMS["html-css"].slice(4)) {
  assert.equal(exam.questions.length, 5, `nivel ${exam.levelId}: cinco preguntas`);
  assert.equal(exam.passing, 4);
  for (const question of exam.questions) {
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.ok(question.explanation.length > 20);
  }
}

console.log(`HTML/CSS 17–50: 9 niveles, 34 módulos, ${validations} validaciones y 9 exámenes: OK`);

import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = file => fs.readFileSync(new URL(file, import.meta.url), "utf8");
const context = vm.createContext({});
for (const file of ["starter-exams.js", "course-kit.js", "new-tech-labs.js", "new-tech-courses.js"])
  vm.runInContext(read(file), context, { filename: file });

for (const [id, course, lab] of [
  ["docker", context.DockerCourse, context.DockerLab],
  ["mongodb", context.MongoCourse, context.MongoLab]
]) {
  assert.equal(course.levels.length, 3, id + ": tres niveles");
  assert.equal(course.lessons.length, 12, id + ": doce módulos");
  course.lessons.forEach((lesson, index) => {
    assert.equal(lesson.hints.length, 3, `${id} ${index + 1}: tres pistas`);
    assert.equal(lesson.checks.length, 3, `${id} ${index + 1}: tres comprobaciones`);
    for (const field of ["intro", "example", "explanation", "goal", "solution"])
      assert.ok(lesson[field].length > 15, `${id} ${index + 1}: contenido de ${field}`);
    assert.ok(lesson.starter.length > 5, `${id} ${index + 1}: código inicial`);
    const example = lab.run(lesson.example, lesson.scenario);
    assert.equal(example.error, null, `${id} ${index + 1}: ejemplo ejecutable: ${example.error}`);
    const solved = lab.run(lesson.solution, lesson.scenario);
    assert.equal(solved.error, null, `${id} ${index + 1}: solución ejecutable: ${solved.error}`);
    assert.ok(lesson.checks.every(check => check.test(lesson.solution, solved)), `${id} ${index + 1}: la solución cumple`);
    const initial = lab.run(lesson.starter, lesson.scenario);
    assert.ok(initial.error || !lesson.checks.every(check => check.test(lesson.starter, initial)), `${id} ${index + 1}: el inicio requiere trabajo`);
  });
  const exams = context.StarterExams.LEVEL_EXAMS[id];
  assert.equal(exams.length, 3, id + ": tres mini exámenes");
  exams.forEach((exam, index) => {
    assert.equal(exam.levelId, index + 1);
    assert.equal(exam.questions.length, 5);
    assert.equal(exam.passing, 4);
    exam.questions.forEach(question => {
      assert.equal(question.options.length, 4);
      assert.ok(question.explanation.length > 20);
    });
  });
}

assert.equal(context.MongoLab.run('db.cursos.find({"horas":{"$gte":10}})').output.length, 2);
assert.equal(context.MongoLab.run('db.cursos.find({}).sort({"horas":-1}).limit(2)').output.map(item => item.horas).join(","), "12,10");
assert.match(context.DockerLab.run("rm -rf /", { mode: "cli" }).error, /docker/);
assert.match(context.DockerLab.run("COPY . .", { mode: "dockerfile" }).error, /FROM/);

console.log("Docker y MongoDB: 24 módulos, 72 comprobaciones, 6 exámenes y límites de simulación: OK");

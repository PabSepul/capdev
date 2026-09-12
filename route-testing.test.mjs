import assert from "node:assert/strict";
import vm from "node:vm";
import { solveRoute, checkExams, checkSafety } from "./starter-harness.mjs";
const solutions = [
  'test("suma", function () { equal(sumar(2, 3), 5); });',
  'test("saluda con espacio", function () { equal(saludar("Ana"), "Hola, Ana"); });',
  'test("par", function () { equal(esPar(4), true); }); test("impar", function () { equal(esPar(3), false); });',
  'test("debajo", function () { equal(esMayor(17), false); }); test("límite", function () { equal(esMayor(18), true); });',
  'test("con datos", function () { equal(total([2, 3]), 5); }); test("vacío", function () { equal(total([]), 0); });',
  'test("filtra inactivos", function () { deepEqual(activos([{nombre:"Git",activo:true},{nombre:"SQL",activo:false}]), [{nombre:"Git",activo:true}]); });',
  'test("copia sin mutar", function () { const original = [1]; deepEqual(agregar(original, 2), [1, 2]); deepEqual(original, [1]); });',
  'test("espacios", function () { equal(normalizar(" ana "), "ana"); }); test("mayúsculas", function () { equal(normalizar("ANA"), "ana"); });',
  'test("dos unidades", function () { equal(precio(2), 25); }); test("tres unidades", function () { equal(precio(3), 30); });',
  'test("encuentra segundo", function () { deepEqual(buscar([{id:1},{id:2}], 2), {id:2}); }); test("ausente", function () { equal(buscar([{id:1},{id:2}], 99), null); });',
  'test("con datos", function () { deepEqual(resumen([{horas:4},{horas:6}]), {cantidad:2,horas:10}); }); test("vacío", function () { deepEqual(resumen([]), {cantidad:0,horas:0}); });',
  'test("vacío", function () { equal(carrito([]), 0); }); test("sin descuento", function () { equal(carrito([10, 20]), 30); }); test("umbral", function () { equal(carrito([40, 60]), 90); }); test("sobre umbral", function () { equal(carrito([100, 100]), 180); });'
];
const { context } = solveRoute({ id: "testing", files: ["starter-exams.js", "starter-runtime.js", "course-kit.js", "testing-lab.js", "testing-course.js", "starter-course.js"], solutions, globalName: "TestingCourse" });
checkExams(context, "testing");
checkSafety(["testing-lab.js", "testing-course.js"]);
const execute = (code, impl = "") => context.runJson("TestingLab.execute(" + JSON.stringify(code) + "," + JSON.stringify(impl) + ")");
assert.equal(execute('test("vacía", function () {});').passed, false);
assert.equal(execute('test("constante", function () { equal(1, 1); });').passed, true);
assert.ok(execute("while (true) {}").error, "los ciclos infinitos tienen límite");
assert.ok(execute("equal(1, 1);").error, "las aserciones requieren una prueba");
assert.equal(execute('test("estructura", function () { deepEqual({b:2,a:1}, {a:1,b:2}); });').passed, true);
assert.equal(execute('test("tipo", function () { equal(1, "1"); });').passed, false);
assert.equal(execute('test("veracidad", function () { ok(3 > 2); });').passed, true);
const scenarios = context.runJson("TestingCourse.lessons.map((m) => m.scenario)");
const trivial = context.runJson('TestingLab.run(\'test("sin cobertura", function () { equal(1,1); });\', TestingCourse.lessons[0].scenario)');
assert.equal(trivial.mutants[0].detected, false, "una prueba constante no mata la variante");
const empty = context.runJson('TestingLab.run(\'test("vacía", function () {});\', TestingCourse.lessons[0].scenario)');
assert.equal(empty.mutants[0].detected, false, "una prueba vacía no detecta una regresión");
let comparisons = 0;
for (const [i, scenario] of scenarios.entries()) {
  for (const implementation of [scenario.reference, ...scenario.mutants.map((m) => m.code)]) {
    const native = [];
    vm.runInNewContext(implementation + "\n" + solutions[i], {
      test(name, callback) { try { callback(); native.push(true); } catch { native.push(false); } },
      equal: assert.strictEqual, deepEqual: assert.deepStrictEqual, ok: assert.ok
    }, { timeout: 1500 });
    assert.deepEqual(execute(solutions[i], implementation).tests.map((t) => t.passed), native, "módulo " + (i + 1) + ": mismo veredicto que JavaScript y node:assert");
    comparisons += 1;
  }
}
console.log(`Testing: 12 módulos, 36 validaciones, 3 exámenes; ${comparisons} ejecuciones contrastadas con JavaScript y node:assert: OK`);

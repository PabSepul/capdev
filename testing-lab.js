/* Aserciones síncronas sobre el intérprete educativo; no ejecuta código nativo. */
(() => {
  "use strict";
  function equalValue(a, b, seen = new Map()) {
    if (Object.is(a, b)) return true;
    if (!a || !b || typeof a !== "object" || typeof b !== "object" || Array.isArray(a) !== Array.isArray(b)) return false;
    if (seen.has(a)) return seen.get(a) === b;
    seen.set(a, b);
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every((k) => Object.hasOwn(b, k) && equalValue(a[k], b[k], seen));
  }
  function execute(code, implementation) {
    const tests = [];
    let active = null;
    const result = globalThis.StarterRuntime.runJavaScript(implementation + "\n" + code, {
      globals(api) {
        const assertion = (pass, message) => {
          if (!active) api.fail("Escribe las aserciones dentro de test(nombre, función).");
          active.assertions += 1;
          if (active.assertions > 100) api.fail("Usa hasta 100 aserciones por prueba.");
          if (!pass) { active.failed = true; api.fail(message); }
        };
        return {
          test(name, callback) {
            if (active) api.fail("No anides test dentro de otro test.");
            if (tests.length >= 40) api.fail("Usa hasta 40 pruebas por ejecución.");
            if (typeof name !== "string" || !name.trim() || !api.isCallable(callback)) api.fail("test necesita un nombre y una función.");
            const item = { name, assertions: 0, passed: false, message: "" };
            active = item;
            try {
              api.call(callback, []);
              item.passed = item.assertions > 0 && !item.failed;
              if (!item.passed) item.message = "La prueba debe ejecutar al menos una aserción correcta.";
            } catch (error) { item.message = error.message; }
            finally { active = null; }
            tests.push(item);
          },
          equal(actual, expected) { assertion(Object.is(actual, expected), "Esperado: " + api.format(expected) + "; recibido: " + api.format(actual)); },
          deepEqual(actual, expected) { assertion(equalValue(actual, expected), "Las estructuras no coinciden: " + api.format(actual) + " frente a " + api.format(expected)); },
          ok(value) { assertion(Boolean(value), "Se esperaba una condición verdadera."); }
        };
      }
    });
    return { tests, error: result.error, passed: !result.error && tests.length > 0 && tests.every((t) => t.passed),
      assertions: tests.reduce((n, t) => n + t.assertions, 0) };
  }
  function run(code, scenario) {
    if (code.length > 15000) return { error: "Usa hasta 15.000 caracteres.", text: "Usa hasta 15.000 caracteres." };
    const reference = execute(code, scenario.reference);
    const mutants = scenario.mutants.map((m) => {
      const result = execute(code, m.code);
      return { name: m.name, detected: reference.passed && !result.error && result.tests.some((t) => !t.passed && t.assertions > 0), result };
    });
    return { reference, mutants, error: reference.error,
      text: ["Implementación correcta:", ...reference.tests.map((t) => (t.passed ? "✓ " : "✗ ") + t.name + (t.message ? ": " + t.message : "")),
        ...(reference.error ? ["Error: " + reference.error] : []),
        ...(reference.tests.length ? [] : ["Aún no hay pruebas. Usa test(nombre, función)."]),
        "\nVersiones con errores:", ...mutants.map((m) => (m.detected ? "✓ Detectado: " : "✗ Sin detectar: ") + m.name),
        "\nLaboratorio síncrono: test, equal, deepEqual y ok. No incluye Jest, node:test, temporizadores, red ni pruebas de navegador. Detectar estas variantes no demuestra ausencia de otros errores."].join("\n") };
  }
  globalThis.TestingLab = { run, execute, equalValue };
})();

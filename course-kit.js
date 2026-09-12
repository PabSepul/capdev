/* Forma común de las rutas nuevas; el contenido y las comprobaciones viven en cada curso. */
(() => {
  "use strict";
  globalThis.CourseKit = {
    define({ id, globalName, name, kind, file, levels, lessons, questions }) {
      const modules = lessons.map((m, i) => ({ duration: "15 min", file,
        kicker: "Módulo " + String(i + 1).padStart(2, "0") + " · " + levels[Math.floor(i / 4)],
        difficulty: i < 4 ? "Inicio" : i < 8 ? "Práctica" : "Integración",
        success: "Cumpliste los objetivos. Cambia un caso y vuelve a ejecutar para comprobar lo que aprendiste.", ...m }));
      globalThis[globalName] = { name, kind, storageKey: "codigo-cero." + id + "-v2.completed",
        examsKey: "codigo-cero." + id + "-v2.exams", stages: levels, lessons: modules,
        levels: levels.map((title, i) => ({ title, description: title, modules: modules.slice(i * 4, i * 4 + 4) })) };
      globalThis.StarterExams.LEVEL_EXAMS[id] = questions.map((bank, i) => ({ levelId: i + 1,
        title: "Mini examen: " + levels[i], passing: 4,
        intro: "Responde cinco preguntas. Apruebas con cuatro aciertos; puedes volver a intentarlo.",
        questions: bank.map(([question, options, answer, explanation]) => ({ question, options, answer, explanation })) }));
    }
  };
})();

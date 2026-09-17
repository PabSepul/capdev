(() => {
  "use strict";

  const runtime = globalThis.StarterRuntime;


  const COURSES = {
    "html-css": globalThis.HtmlCssCourse,
    javascript: globalThis.JavaScriptCourse,
    sql: globalThis.SQLCourse,
    git: globalThis.GitCourse,
    apis: globalThis.ApisCourse,
    terminal: globalThis.TerminalCourse,
    regex: globalThis.RegexCourse,
    ia: globalThis.IaCourse,
    "datos-python": globalThis.DatosPythonCourse,
    nodejs: globalThis.NodeCourse,
    typescript: globalThis.TypeScriptCourse,
    react: globalThis.ReactCourse,
    json: globalThis.JsonCourse,
    markdown: globalThis.MarkdownCourse,
    accesibilidad: globalThis.AccessibilityCourse,
    testing: globalThis.TestingCourse,
    docker: globalThis.DockerCourse,
    mongodb: globalThis.MongoCourse
  };

  const standardProfiles = {
    sql: {
      prediction: module => module.question || `Antes de ejecutar «${module.shortTitle}», ¿qué columnas y filas debería devolver la consulta?`,
      reflection: module => `Cambia un filtro o valor del ejemplo y anticipa cómo variarán las filas. Explica qué cláusula produce ese cambio.`,
      extension: module => `Después de completar, formula otra pregunta sobre las mismas tablas y comprueba columnas, filas y orden del resultado.`
    },
    git: {
      prediction: module => `Antes de ejecutar los comandos de «${module.shortTitle}», ¿qué parte del estado del repositorio debería cambiar y cuál debería conservarse?`,
      reflection: module => `Explica con tus palabras qué estado anterior y posterior demuestra la misión «${module.title}». ¿Qué comando te permite comprobarlo?`,
      extension: module => `Después de completar la misión, cambia el nombre de un archivo o mensaje y repite la secuencia comprobando cada estado con el simulador.`
    },
    apis: {
      prediction: module => `Observa la petición del ejemplo de «${module.shortTitle}». ¿Qué método, ruta y estado HTTP esperas encontrar en la respuesta?`,
      reflection: module => `Cambia un dato de la petición y anticipa qué debería variar en la respuesta. Explica qué parte pertenece a la solicitud y cuál a la respuesta.`,
      extension: module => `Después de completar, prueba otra petición admitida por el laboratorio y compara método, ruta, estado y cuerpo.`
    },
    terminal: {
      prediction: module => `Antes de ejecutar «${module.shortTitle}», ¿qué salida o cambio esperas ver en la carpeta virtual y qué archivo debería permanecer intacto?`,
      reflection: module => `Describe el estado de la carpeta antes y después de la misión «${module.title}». ¿Qué comando usarías para verificarlo?`,
      extension: module => `Repite la tarea con otro nombre dentro de la carpeta virtual y comprueba el resultado antes de continuar.`
    },
    regex: {
      prediction: module => `Antes de probar el patrón de «${module.shortTitle}», ¿qué fragmentos del texto deberían coincidir y cuál debería quedar fuera?`,
      reflection: module => `Cambia un caso del texto de prueba y predice si seguirá coincidiendo. Explica qué parte exacta del patrón decide el resultado.`,
      extension: module => `Añade al texto un caso que deba coincidir y otro que no. Ajusta el patrón solo después de anticipar ambos resultados.`
    },
    ia: {
      prediction: module => `Antes de ejecutar el ejercicio de «${module.shortTitle}», ¿qué información concreta debería producir el laboratorio y qué parte aún necesitará criterio humano?`,
      reflection: module => `Cambia una condición de la tarea y explica qué resultado debería variar. Señala también una conclusión que no conviene aceptar sin revisión.`,
      extension: module => `Prueba una instrucción más precisa con los mismos datos y compara si el resultado resulta más claro y verificable.`
    },
    "datos-python": {
      prediction: module => `Sigue los datos del ejemplo de «${module.shortTitle}». ¿Qué colección o valor debería obtenerse al terminar y por qué?`,
      reflection: module => `Cambia un dato de entrada y anticipa cómo se transforma el resultado. Identifica la instrucción responsable del cambio.`,
      extension: module => `Añade un registro pequeño a los datos y comprueba que el reporte siga conservando la estructura esperada.`
    },
    nodejs: {
      prediction: module => `Antes de ejecutar «${module.shortTitle}», ¿qué salida o cambio de estado debería producir el programa representado por el laboratorio?`,
      reflection: module => `Cambia un valor de entrada y explica qué parte del resultado debería modificarse y qué parte debería mantenerse.`,
      extension: module => `Repite el ejercicio con un segundo dato y organiza la salida para que otra persona pueda comprobarla con facilidad.`
    },
    typescript: {
      prediction: module => `Antes de comprobar «${module.shortTitle}», ¿qué dato acepta el tipo y cuál debería producir un diagnóstico?`,
      reflection: module => `Cambia una propiedad o argumento y anticipa si TypeScript debería aceptarlo. Explica la regla del tipo que decide el resultado.`,
      extension: module => `Añade un caso válido y otro inválido para comprobar qué errores puede detectar el análisis antes de ejecutar.`
    },
    react: {
      prediction: module => `Observa los datos del componente de «${module.shortTitle}». ¿Qué contenido debería aparecer en la interfaz al renderizarlo?`,
      reflection: module => `Cambia una prop o un dato y anticipa qué parte de la interfaz se actualizará. Relaciona ese cambio con el JSX.`,
      extension: module => `Después de completar, renderiza un segundo dato con la misma estructura sin duplicar el componente.`
    },
    json: {
      prediction: module => `Antes de analizar el ejemplo de «${module.shortTitle}», ¿qué propiedades, valores y tipos esperas obtener?`,
      reflection: module => `Cambia un valor sin alterar la estructura y predice el resultado. Luego explica por qué JSON y un objeto de JavaScript no son lo mismo.`,
      extension: module => `Añade una propiedad válida y vuelve a comprobar el documento sin cambiar los requisitos de la misión principal.`
    },
    markdown: {
      prediction: module => `Antes de abrir la vista previa de «${module.shortTitle}», ¿qué estructura debería reconocer el renderizador?`,
      reflection: module => `Cambia un marcador y anticipa cómo variará el documento renderizado. Explica qué significado aporta esa sintaxis.`,
      extension: module => `Añade una sección breve que reutilice la misma sintaxis y comprueba que la jerarquía del documento siga siendo clara.`
    },
    accesibilidad: {
      prediction: module => `Antes de revisar «${module.shortTitle}», ¿qué información u operación debería estar disponible para una persona que no dependa de la presentación visual?`,
      reflection: module => `Cambia una etiqueta o relación y anticipa qué comprobación fallará. Explica qué barrera podría causar en una página real.`,
      extension: module => `Prueba la vista previa con teclado y revisa el nombre de los controles. Anota también un aspecto que requiera evaluación humana.`
    },
    testing: {
      prediction: module => `Antes de ejecutar las pruebas de «${module.shortTitle}», ¿qué caso debería pasar y qué variante defectuosa debería fallar?`,
      reflection: module => `Cambia una entrada y predice qué prueba detectará la diferencia. Explica qué requisito representa esa comprobación.`,
      extension: module => `Añade un caso límite pequeño que falle con una implementación defectuosa y pase con la solución correcta.`
    },
    docker: {
      prediction: module => `Antes de simular «${module.shortTitle}», ¿qué objeto o estado de Docker debería aparecer y qué parte del equipo real permanecerá intacta?`,
      reflection: module => `Cambia un nombre o una opción y anticipa el nuevo estado. Explica la diferencia entre describirlo y ejecutarlo con Docker real.`,
      extension: module => `Repite la misión con otro nombre y escribe el comando que usarías para comprobar el resultado en Docker real.`
    },
    mongodb: {
      prediction: module => `Antes de ejecutar «${module.shortTitle}», ¿cuántos documentos debería devolver o modificar la operación y qué propiedades lo determinan?`,
      reflection: module => `Cambia un valor del filtro y anticipa qué documentos participarán. Explica por qué la operación sigue respondiendo una pregunta distinta.`,
      extension: module => `Prueba otro filtro sobre los mismos cuatro documentos y compara el resultado sin cambiar la solución principal.`
    }
  };

  const firstSentence = text => String(text || "").match(/^[\s\S]*?[.!?](?:\s|$)/)?.[0]?.trim() || String(text || "").trim();

  function applyStandardLearning(courses) {
    for (const [id, profile] of Object.entries(standardProfiles)) {
      const course = courses[id];
      if (!course) continue;
      const modules = course.levels.flatMap(level => level.modules);
      modules.forEach((module, index) => {
        const previous = modules[index - 1];
        const next = modules[index + 1];
        const concepts = (module.concepts || []).filter(Boolean);
        const detailedSteps = (module.steps || []).map(step => Array.isArray(step) ? step[1] : step).filter(Boolean);
        const walkthrough = (detailedSteps.length ? detailedSteps : concepts).slice(0, 3).map((step, position) => {
          const copy = String(step).replace(/^(primero|después|al terminar),?\s*/i, "").replace(/^./, letter => letter.toLowerCase());
          return `${["Primero", "Después", "Al terminar"][position]}, ${copy}`;
        });
        while (walkthrough.length < 3) {
          walkthrough.push(walkthrough.length === 0
            ? `Primero, observa los datos y la instrucción principal del ejemplo de ${module.shortTitle}.`
            : walkthrough.length === 1
              ? `Después, relaciona esa instrucción con el resultado que muestra el laboratorio.`
              : `Al terminar, compara el resultado con la misión antes de modificar tu código.`);
        }
        const explanation = [firstSentence(module.explanation), concepts.at(-1)].filter(Boolean).join(" ");
        module.lesson = {
          prerequisites: previous ? `Haber completado el módulo anterior: ${previous.title}.` : "Ninguno: este es el punto de partida de la ruta.",
          walkthrough,
          prediction: module.question || profile.prediction(module),
          answer: module.answer || `${explanation} Ejecuta el ejemplo y comprueba ese efecto antes de comenzar la misión.`,
          reflection: profile.reflection(module),
          extension: profile.extension(module),
          feedback: module.checks.map((check, checkIndex) => `Revisa «${check.label}». ${module.hints?.[Math.min(checkIndex, 2)] || "Compara tu resultado con la misión y vuelve a ejecutar."}`),
          showSupport: id !== "sql",
          showExtra: id !== "sql"
        };
        const connection = next
          ? `En el siguiente módulo usarás esta base para ${next.title.toLowerCase()}.`
          : `Ya puedes repasar el nivel y rendir su mini examen con ejemplos propios.`;
        module.success = `${module.success || "Cumpliste las comprobaciones de la misión."} ${connection}`;
      });
      course.levels.forEach((level, levelIndex) => {
        level.completionTitle = `Completaste ${level.title.toLowerCase()} de ${course.name}.`;
        level.completionCopy = levelIndex < course.levels.length - 1
          ? `Terminaste los cuatro módulos y conectaste sus conceptos. Rinde el mini examen; el siguiente nivel ya está disponible.`
          : `Terminaste todos los módulos de la ruta. Rinde este mini examen y repasa los ejemplos que todavía no puedas explicar con tus palabras.`;
      });
    }
  }

  const courseId = document.body.dataset.course;
  globalThis.CourseExpansion?.apply(COURSES);
  globalThis.HtmlCssLearning?.apply(COURSES["html-css"]);
  globalThis.JavaScriptLearning?.apply(COURSES.javascript);
  applyStandardLearning(COURSES);
  const course = COURSES[courseId];
  if (!course) return;

  if (!document.querySelector("#starter-coaching")) {
    const coaching = document.createElement("p");
    coaching.id = "starter-coaching";
    coaching.className = "course-feedback";
    coaching.hidden = true;
    document.querySelector(".validation-panel")?.append(coaching);
  }

  const exams = globalThis.StarterExams.LEVEL_EXAMS[courseId];
  const stages = course.stages || ["Conceptos básicos", "Aplicación de fundamentos", "Integración de fundamentos"];

  const modules = [];
  const levelStart = [];
  course.levels.forEach((level, levelIndex) => {
    level.stage ||= stages[levelIndex];
    level.completionTitle ||= `Finalizaste ${level.title.toLowerCase()} de ${course.name}.`;
    level.completionCopy ||= `Completaste los cuatro módulos de este nivel. Rinde el mini examen para comprobar lo aprendido. ${levelIndex < course.levels.length - 1 ? "El siguiente nivel ya está disponible." : `Aprueba los ${course.levels.length} mini exámenes para cerrar la ruta.`}`;
    level.approvedCopy ||= "Mini examen aprobado. Puedes repetirlo para repasar sin perder tu aprobación anterior.";
    levelStart.push(modules.length);
    level.modules.forEach((module) => {
      module.levelIndex = levelIndex;
      modules.push(module);
    });
  });

  const elements = {
    levelTabs: document.querySelector("#starter-level-tabs"),
    list: document.querySelector("#starter-module-list"),
    position: document.querySelector("#starter-position"),
    progressFill: document.querySelector("#starter-progress-fill"),
    completed: document.querySelector("#starter-completed"),
    kicker: document.querySelector("#starter-kicker"),
    title: document.querySelector("#starter-module-title"),
    intro: document.querySelector("#starter-intro"),
    example: document.querySelector("#starter-example"),
    explanation: document.querySelector("#starter-explanation"),
    concepts: document.querySelector("#starter-concepts"),
    lessonSupport: document.querySelector("#starter-lesson-support"),
    prerequisites: document.querySelector("#starter-prerequisites"),
    walkthrough: document.querySelector("#starter-walkthrough"),
    exampleSteps: document.querySelector("#starter-example-steps"),
    prediction: document.querySelector("#starter-prediction"),
    predictionAnswer: document.querySelector("#starter-prediction-answer"),
    predictionExplanation: document.querySelector("#starter-prediction-explanation"),
    lessonExtra: document.querySelector("#starter-lesson-extra"),
    reflection: document.querySelector("#starter-reflection"),
    extension: document.querySelector("#starter-extension"),
    goal: document.querySelector("#starter-goal"),
    hintButton: document.querySelector("#starter-show-hint"),
    hints: document.querySelector("#starter-hints"),
    labTitle: document.querySelector("#starter-lab-title"),
    difficulty: document.querySelector("#starter-difficulty"),
    file: document.querySelector("#starter-file"),
    code: document.querySelector("#starter-code"),
    run: document.querySelector("#starter-run"),
    reset: document.querySelector("#starter-reset"),
    preview: document.querySelector("#starter-preview"),
    output: document.querySelector("#starter-output"),
    validations: document.querySelector("#starter-validations"),
    coaching: document.querySelector("#starter-coaching"),
    success: document.querySelector("#starter-success"),
    successCopy: document.querySelector("#starter-success-copy"),
    complete: document.querySelector("#starter-complete"),
    previous: document.querySelector("#starter-previous"),
    next: document.querySelector("#starter-next"),
    navigationPosition: document.querySelector("#starter-navigation-position"),
    examProgress: document.querySelector("#starter-exam-progress"),
    finish: document.querySelector("#starter-finish"),
    finishTitle: document.querySelector("#starter-finish-title"),
    checkpoint: document.querySelector("#level-checkpoint"),
    checkpointKicker: document.querySelector("#checkpoint-kicker"),
    checkpointTitle: document.querySelector("#checkpoint-title"),
    checkpointCopy: document.querySelector("#checkpoint-copy"),
    checkpointExam: document.querySelector("#checkpoint-exam"),
    checkpointNext: document.querySelector("#checkpoint-next"),
    exam: document.querySelector("#level-exam"),
    examKicker: document.querySelector("#exam-kicker"),
    examTitle: document.querySelector("#exam-title"),
    examIntro: document.querySelector("#exam-intro"),
    examQuestions: document.querySelector("#exam-questions"),
    examSubmit: document.querySelector("#exam-submit"),
    examRetry: document.querySelector("#exam-retry"),
    examClose: document.querySelector("#exam-close"),
    examResult: document.querySelector("#exam-result")
  };

  let activeIndex = 0;
  let activeLevel = 0;
  let shownHints = 0;
  const learning = globalThis.LearningState;
  const completed = loadCompleted();
  const approvedExams = loadApprovedExams();
  let examLevel = 0;
  let examAnswers = new Map();
  let examReviewed = false;
  let validatedCode = null;
  const drafts = new Map(Object.entries(learning?.session(courseId).drafts || {}).map(([index, code]) => [Number(index), code]));
  let hasActiveModule = false;
  let moduleOpenedAt = Date.now();

  /* El avance lo guarda learning-state.js, que es el único dueño del dato.
     Antes cada controlador escribía su propia clave y nadie registraba lo que
     pasaba antes de completar un módulo. */
  function loadCompleted() {
    const guardados = learning?.completados(courseId) || [];
    return new Set(guardados.filter((index) => Number.isInteger(index) && index >= 0 && index < modules.length));
  }

  function saveCompleted() {
    for (const index of completed) learning?.completar(courseId, index);
  }

  function setChildren(element, values, builder) {
    if (!element) return;
    element.replaceChildren(...values.map(builder));
  }

  function completedInLevel(levelIndex) {
    const start = levelStart[levelIndex];
    const end = start + course.levels[levelIndex].modules.length;
    let total = 0;
    for (const index of completed) if (index >= start && index < end) total += 1;
    return total;
  }

  function levelModulesDone(index) {
    const level = course.levels[index];
    return Boolean(level) && completedInLevel(index) === level.modules.length;
  }

  function isLevelUnlocked(index) {
    return Number.isInteger(index) && index >= 0 && index < course.levels.length
      && course.levels.slice(0, index).every((_, previous) => levelModulesDone(previous));
  }

  function isExamUnlocked(index) {
    return isLevelUnlocked(index) && levelModulesDone(index);
  }

  function loadApprovedExams() {
    const saved = learning?.examenes(courseId) || [];
    return new Set(saved.filter((id) => Number.isInteger(id) && isExamUnlocked(id - 1)));
  }

  function levelStatusLabel(index) {
    if (!isLevelUnlocked(index)) return "Bloqueado · Completa los niveles anteriores";
    if (approvedExams.has(index + 1)) return "Examen aprobado ✓";
    if (levelModulesDone(index)) return "Mini examen disponible";
    return `${completedInLevel(index)} de ${course.levels[index].modules.length} módulos`;
  }

  function selectLevel(index) {
    if (!isLevelUnlocked(index)) return;
    const start = levelStart[index];
    const unfinished = course.levels[index].modules.findIndex((_, offset) => !completed.has(start + offset));
    selectModule(start + Math.max(0, unfinished));
  }

  function renderLevels() {
    setChildren(elements.levelTabs, course.levels, (level, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "level-tab";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(index === activeLevel));
      button.id = "starter-level-" + index;
      button.tabIndex = index === activeLevel ? 0 : -1;
      button.setAttribute("aria-controls", "starter-workspace");
      button.disabled = !isLevelUnlocked(index);
      button.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><strong>${level.title}</strong><small>${levelStatusLabel(index)}</small>`;
      button.addEventListener("click", () => selectLevel(index));
      return button;
    });
  }

  function renderList() {
    const level = course.levels[activeLevel];
    const start = levelStart[activeLevel];
    setChildren(elements.list, level.modules, (module, index) => {
      const globalIndex = start + index;
      const button = document.createElement("button");
      button.type = "button";
      button.role = "tab";
      button.setAttribute("aria-selected", String(globalIndex === activeIndex));
      button.id = "starter-module-" + globalIndex;
      button.tabIndex = globalIndex === activeIndex ? 0 : -1;
      button.setAttribute("aria-controls", "starter-workspace");
      button.innerHTML = `<span>${String(globalIndex + 1).padStart(2, "0")}</span><strong>${module.shortTitle}</strong><small>${completed.has(globalIndex) ? "Completado" : module.duration}</small>`;
      button.addEventListener("click", () => selectModule(globalIndex));
      return button;
    });
  }

  function renderProgress() {
    const total = modules.length;
    elements.position.textContent = `Módulo ${activeIndex + 1} de ${total}`;
    elements.navigationPosition.textContent = `Módulo ${activeIndex + 1} de ${total}`;
    elements.completed.textContent = `${completed.size} completados`;
    elements.progressFill.style.width = `${(completed.size / total) * 100}%`;
    elements.examProgress.textContent = `Mini exámenes: ${approvedExams.size} de ${course.levels.length} aprobados`;
    elements.finish.hidden = completed.size !== total || approvedExams.size !== course.levels.length;
    elements.finishTitle.textContent = `Ruta ${course.name} completada`;
    elements.previous.disabled = activeIndex === 0;
    elements.next.disabled = activeIndex === total - 1 || !isLevelUnlocked(modules[activeIndex + 1].levelIndex);
  }

  function renderCheckpoint() {
    const level = course.levels[activeLevel];
    elements.checkpoint.hidden = !isExamUnlocked(activeLevel);
    if (elements.checkpoint.hidden) return;
    const approved = approvedExams.has(activeLevel + 1);
    elements.checkpointKicker.textContent = `Punto de control · ${level.stage}`;
    elements.checkpointTitle.textContent = level.completionTitle;
    elements.checkpointCopy.textContent = approved ? level.approvedCopy : level.completionCopy;
    elements.checkpointExam.textContent = approved ? "Repetir el mini examen" : "Rendir el mini examen";
    const next = course.levels[activeLevel + 1];
    elements.checkpointNext.hidden = !next;
    if (next) elements.checkpointNext.textContent = `Continuar: ${next.title}`;
  }

  function renderExam() {
    const exam = exams[examLevel];
    elements.examKicker.textContent = `Mini examen · ${course.levels[examLevel].stage}`;
    elements.examTitle.textContent = exam.title;
    elements.examIntro.textContent = exam.intro;
    setChildren(elements.examQuestions, exam.questions, (question, index) => {
      const chosen = examAnswers.get(index);
      const item = document.createElement("li");
      item.className = "exam-question" + (examReviewed ? (chosen === question.answer ? " is-correct" : " is-wrong") : "");
      const statement = document.createElement("p");
      statement.className = "exam-statement";
      statement.id = `exam-question-${index}`;
      statement.textContent = `${index + 1}. ${question.question}`;
      item.append(statement);
      const options = document.createElement("div");
      options.className = "exam-options";
      options.setAttribute("role", "group");
      options.setAttribute("aria-labelledby", statement.id);
      const buttons = question.options.map((option, optionIndex) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "exam-option" + (chosen === optionIndex ? " is-selected" : "")
          + (examReviewed && optionIndex === question.answer ? " is-answer" : "");
        button.setAttribute("aria-pressed", String(chosen === optionIndex));
        button.disabled = examReviewed;
        const letter = document.createElement("span");
        letter.textContent = ["A", "B", "C", "D"][optionIndex];
        const copy = document.createElement("small");
        copy.textContent = option;
        button.append(letter);
        button.append(copy);
        button.addEventListener("click", () => {
          if (examReviewed) return;
          examAnswers.set(index, optionIndex);
          buttons.forEach((other, position) => {
            other.classList.toggle("is-selected", position === optionIndex);
            other.setAttribute("aria-pressed", String(position === optionIndex));
          });
        });
        options.append(button);
        return button;
      });
      item.append(options);
      if (examReviewed) {
        const feedback = document.createElement("p");
        feedback.className = "exam-feedback";
        feedback.textContent = (chosen === question.answer ? "Correcto. " : "Para repasar: ") + question.explanation;
        item.append(feedback);
      }
      return item;
    });
    elements.examSubmit.hidden = examReviewed;
    elements.examRetry.hidden = !examReviewed;
  }

  function openExam(index) {
    if (!isExamUnlocked(index)) return;
    examLevel = index;
    examAnswers = new Map();
    examReviewed = false;
    elements.examResult.textContent = "";
    elements.examResult.className = "exam-result";
    globalThis.LearningExperience?.showExamResult();
    elements.exam.hidden = false;
    renderExam();
    elements.examTitle.focus?.({ preventScroll: true });
    elements.exam.scrollIntoView?.({ block: "start" });
  }

  function closeExam(returnFocus = false) {
    elements.exam.hidden = true;
    if (returnFocus) elements.checkpointExam.focus?.();
  }

  function submitExam() {
    if (elements.exam.hidden || examReviewed || !isExamUnlocked(examLevel)) return;
    const exam = exams[examLevel];
    if (examAnswers.size !== exam.questions.length) {
      elements.examResult.textContent = `Responde las ${exam.questions.length} preguntas antes de revisar.`;
      elements.examResult.className = "exam-result is-pending";
      globalThis.LearningExperience?.showExamResult({ pending: true });
      return;
    }
    const result = globalThis.StarterExams.gradeExam(courseId, exam.levelId, examAnswers);
    examReviewed = true;
    renderExam();
    if (result.passed) {
      approvedExams.add(exam.levelId);
      learning?.aprobarExamen(courseId, exam.levelId);
      const remaining = course.levels.length - approvedExams.size;
      elements.examResult.textContent = `Aprobado con ${result.correct} de ${result.total} respuestas correctas. `
        + (completed.size === modules.length && remaining === 0 ? `¡Completaste la ruta de ${course.name}!` : `Mini exámenes aprobados: ${approvedExams.size} de ${course.levels.length}. Puedes continuar o repasar los otros niveles.`);
      elements.examResult.className = "exam-result is-passed";
    } else {
      elements.examResult.textContent = `Obtuviste ${result.correct} de ${result.total} y necesitas ${result.passing} para aprobar. Revisa las explicaciones y vuelve a intentarlo.`
        + (approvedExams.has(exam.levelId) ? " Tu aprobación anterior se conserva." : "");
      elements.examResult.className = "exam-result is-failed";
    }
    globalThis.LearningExperience?.showExamResult(result);
    renderLevels();
    renderProgress();
    renderCheckpoint();
    elements.examResult.focus?.();
  }

  function retryExam() {
    openExam(examLevel);
  }

  function renderValidations(results = null, executionError = false) {
    const module = modules[activeIndex];
    setChildren(elements.validations, module.checks, (check, index) => {
      const item = document.createElement("li");
      const passed = results?.[index] === true;
      const failed = results?.[index] === false;
      item.className = passed ? "validation-passed" : failed ? "validation-failed" : "";
      item.innerHTML = `<span>${passed ? "✓" : failed ? "×" : "·"}</span><span>${check.label}</span>`;
      return item;
    });
    if (elements.coaching) {
      const failed = results?.findIndex(passed => !passed) ?? -1;
      elements.coaching.hidden = !module.lesson || failed < 0;
      elements.coaching.textContent = elements.coaching.hidden ? "" : executionError
        ? "La vista no pudo completar las comprobaciones. Revisa que las etiquetas, llaves, dos puntos y comillas estén cerrados antes de volver a probar."
        : module.lesson.feedback[failed];
    }
  }

  function renderLessonSupport(module) {
    if (!elements.lessonSupport || !elements.lessonExtra) return;
    const lesson = module.lesson;
    elements.lessonSupport.hidden = !lesson || lesson.showSupport === false;
    elements.lessonExtra.hidden = !lesson || lesson.showExtra === false;
    elements.lessonExtra.open = false;
    if (elements.predictionAnswer) elements.predictionAnswer.open = false;
    if (elements.walkthrough) elements.walkthrough.open = activeIndex === 0;
    if (!lesson) return;
    elements.prerequisites.textContent = lesson.prerequisites;
    setChildren(elements.exampleSteps, lesson.walkthrough, text => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    });
    elements.prediction.textContent = lesson.prediction;
    elements.predictionExplanation.textContent = lesson.answer;
    elements.reflection.textContent = lesson.reflection;
    elements.extension.textContent = lesson.extension;
  }

  function selectModule(index) {
    if (!Number.isInteger(index) || !modules[index] || !isLevelUnlocked(modules[index].levelIndex)) return;
    if (hasActiveModule) {
      drafts.set(activeIndex, elements.code.value);
      learning?.save(courseId, activeIndex, elements.code.value);
    }
    closeExam();
    validatedCode = null;
    activeIndex = index;
    moduleOpenedAt = Date.now();
    activeLevel = modules[index].levelIndex;
    shownHints = 0;
    const module = modules[index];
    elements.kicker.textContent = module.kicker;
    elements.title.textContent = module.title;
    elements.intro.textContent = module.intro;
    elements.example.textContent = module.example;
    elements.explanation.textContent = module.explanation;
    setChildren(elements.concepts, module.concepts, (concept) => {
      const item = document.createElement("li");
      item.textContent = concept;
      return item;
    });
    renderLessonSupport(module);
    elements.goal.textContent = module.goal;
    elements.labTitle.textContent = module.title;
    if (elements.difficulty) elements.difficulty.textContent = `${module.difficulty} · ${module.duration}`;
    elements.file.textContent = module.file;
    elements.code.value = drafts.get(index) ?? module.starter;
    hasActiveModule = true;
    learning?.save(courseId, index, elements.code.value);
    elements.hints.replaceChildren();
    elements.hintButton.disabled = false;
    elements.hintButton.textContent = "Ver pista 1";
    elements.success.hidden = true;
    if (elements.successCopy) elements.successCopy.textContent = module.success;
    elements.complete.disabled = true;
    elements.complete.classList.toggle("is-complete", completed.has(index));
    elements.complete.textContent = completed.has(index) ? "Módulo completado" : "Completar módulo";
    elements.previous.disabled = index === 0;
    elements.next.disabled = index === modules.length - 1 || !isLevelUnlocked(modules[index + 1]?.levelIndex);
    renderLevels();
    renderList();
    renderProgress();
    renderCheckpoint();
    renderValidations();
    if (course.kind === "sql") globalThis.SQLGuide?.renderLesson(index);
    globalThis.LearningGuidance?.render(courseId, index);
    globalThis.LearningExperience?.setModule(courseId, index, { title: module.shortTitle || module.title });
    runModule(false);
  }

  function describeJavaScript(result) {
    if (result.error && result.text) return `${result.text}\n\n⚠ ${result.error}`;
    if (result.error) return `⚠ ${result.error}`;
    return result.text || "Sin salida. Usa console.log(...) para mostrar un valor.";
  }

  function describePython(result) {
    if (result.error && result.text) return `${result.text}\n\n⚠ ${result.error}`;
    if (result.error) return `⚠ ${result.error}`;
    return result.text || "Sin salida. Usa print(...) para mostrar un valor.";
  }

  function runModule(showValidation = true) {
    const module = modules[activeIndex];
    const code = elements.code.value;
    let result;

    if (course.kind === "html") {
      result = { code };
      elements.preview.hidden = false;
      elements.output.hidden = true;
      elements.preview.srcdoc = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; form-action 'none'; base-uri 'none'"><style>body{font-family:system-ui,sans-serif;padding:24px;color:#20252b}h1,h2,h3{line-height:1.15}p{line-height:1.6}button{padding:10px 14px}img{max-width:100%}figure{margin:0}</style></head><body>${code}</body></html>`;
    } else if (course.kind === "javascript") {
      result = runtime.runJavaScript(code);
      elements.preview.hidden = true;
      elements.output.hidden = false;
      elements.output.textContent = describeJavaScript(result);
    } else if (course.kind === "git") {
      result = globalThis.GitLab.run(code, module.scenario);
      elements.preview.hidden = true;
      elements.output.hidden = false;
      elements.output.textContent = result.text;
    } else if (course.kind === "regex") {
      result = globalThis.RegexLab.run(code, module.scenario);
      elements.preview.hidden = true;
      elements.output.hidden = false;
      elements.output.textContent = result.text;
    } else if (course.kind === "ia") {
      result = globalThis.IaLab.run(code);
      elements.preview.hidden = true;
      elements.output.hidden = false;
      elements.output.textContent = result.text;
    } else if (course.kind === "python") {
      result = globalThis.PythonRuntime.run(code);
      elements.preview.hidden = true;
      elements.output.hidden = false;
      elements.output.textContent = describePython(result);
    } else if (course.kind === "node") {
      result = globalThis.NodeLab.run(code, module.scenario);
      elements.preview.hidden = true;
      elements.output.hidden = false;
      elements.output.textContent = result.text;
    } else if (course.kind === "typescript") {
      result = globalThis.TsLab.run(code);
      elements.preview.hidden = true;
      elements.output.hidden = false;
      elements.output.textContent = result.text;
    } else if (course.kind === "json") {
      result = globalThis.JsonLab.run(code, module.scenario);
      elements.preview.hidden = true;
      elements.output.hidden = false;
      elements.output.textContent = result.text;
    } else if (course.kind === "markdown" || course.kind === "accessibility") {
      const lab = course.kind === "markdown" ? globalThis.MarkdownLab : globalThis.AccessibilityLab;
      result = lab.run(code, module.scenario);
      elements.preview.hidden = !result.html;
      elements.output.hidden = false;
      elements.preview.srcdoc = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'"><style>body{font-family:system-ui,sans-serif;padding:20px;color:#20252b;background:white;overflow-wrap:anywhere}pre{white-space:pre-wrap;background:#f0f3f7;padding:12px}code{overflow-wrap:anywhere}table{border-collapse:collapse}td,th{padding:8px;border:1px solid #777}label{display:inline-block;margin:8px}button,input{font:inherit}blockquote{border-left:3px solid #687;padding-left:16px}:focus-visible{outline:3px solid #1c69d4;outline-offset:3px}</style></head><body>${result.html || ""}</body></html>`;
      elements.output.textContent = result.text;
    } else if (course.kind === "testing") {
      result = globalThis.TestingLab.run(code, module.scenario);
      elements.preview.hidden = true;
      elements.output.hidden = false;
      elements.output.textContent = result.text;
    } else if (course.kind === "react") {
      result = globalThis.ReactLab.run(code, module.scenario);
      /* La interfaz se ve en el marco y la secuencia de renders se lee debajo.
         El marco sigue sin permitir scripts: solo muestra el html resultante. */
      elements.preview.hidden = !result.html;
      elements.output.hidden = false;
      if (result.html) {
        elements.preview.srcdoc = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; form-action 'none'; base-uri 'none'"><style>body{font-family:system-ui,sans-serif;padding:16px;color:#20252b;margin:0}h1,h2,h3{line-height:1.15;margin:0 0 8px}p{line-height:1.6;margin:0 0 8px}ul{margin:0 0 8px;padding-left:20px}button{padding:8px 12px;margin-right:6px}</style></head><body>${result.html}</body></html>`;
      }
      elements.output.textContent = result.text;
    } else if (course.kind === "terminal") {
      result = globalThis.TerminalLab.run(code, module.scenario);
      elements.preview.hidden = true;
      elements.output.hidden = false;
      elements.output.textContent = result.text;
    } else if (course.kind === "docker" || course.kind === "mongodb") {
      const lab = course.kind === "docker" ? globalThis.DockerLab : globalThis.MongoLab;
      result = lab.run(code, module.scenario);
      elements.preview.hidden = true;
      elements.output.hidden = false;
      elements.output.textContent = result.text;
    } else if (course.kind === "api") {
      result = globalThis.ApiLab.run(code);
      elements.preview.hidden = true;
      elements.output.hidden = false;
      elements.output.textContent = result.text;
    } else {
      result = runtime.runSql(code);
      elements.preview.hidden = true;
      elements.output.hidden = false;
      elements.output.textContent = result.text;
      globalThis.SQLGuide?.renderResult(result);
    }

    if (!showValidation) return;
    const results = module.checks.map((check) => {
      try { return Boolean(check.test(code, result)); } catch { return false; }
    });
    const passed = !result.error && results.every(Boolean);
    validatedCode = passed ? code : null;
    renderValidations(results, Boolean(result.error));
    elements.success.hidden = !passed;
    elements.complete.disabled = !passed;
    /* Queda registro de cada ejecución: qué validaciones pasaron, si hubo error y
       cuánto se tardó. No se guarda el código. Sin esto solo se sabría quién
       terminó un módulo, nunca quién se quedó atascado en él. */
    learning?.registrarIntento(courseId, activeIndex, {
      validaciones: results,
      aprobado: passed,
      error: Boolean(result.error),
      ms: Date.now() - moduleOpenedAt
    });
    globalThis.LearningExperience?.showFeedback({ passed, error: Boolean(result.error) });
  }

  elements.run.addEventListener("click", () => runModule(true));
  elements.reset.addEventListener("click", () => {
    drafts.delete(activeIndex);
    learning?.removeDraft(courseId, activeIndex);
    hasActiveModule = false;
    selectModule(activeIndex);
    elements.code.focus?.();
  });
  elements.code.addEventListener("input", () => {
    validatedCode = null;
    elements.complete.disabled = true;
    elements.success.hidden = true;
    drafts.set(activeIndex, elements.code.value);
    learning?.save(courseId, activeIndex, elements.code.value);
    renderValidations();
  });
  elements.hintButton.addEventListener("click", () => {
    const hints = modules[activeIndex].hints;
    if (shownHints >= hints.length) return;
    const item = document.createElement("li");
    item.textContent = hints[shownHints];
    elements.hints.append(item);
    shownHints += 1;
    elements.hintButton.textContent = shownHints < hints.length ? `Ver pista ${shownHints + 1}` : "Todas las pistas visibles";
    elements.hintButton.disabled = shownHints >= hints.length;
  });
  elements.complete.addEventListener("click", () => {
    if (elements.complete.disabled || validatedCode !== elements.code.value) return;
    completed.add(activeIndex);
    saveCompleted();
    elements.complete.classList.add("is-complete");
    elements.complete.textContent = "Módulo completado";
    renderLevels();
    renderList();
    renderProgress();
    renderCheckpoint();
    elements.next.disabled = activeIndex === modules.length - 1 || !isLevelUnlocked(modules[activeIndex + 1]?.levelIndex);
  });
  elements.previous.addEventListener("click", () => selectModule(activeIndex - 1));
  elements.next.addEventListener("click", () => selectModule(activeIndex + 1));
  elements.checkpointExam.addEventListener("click", () => openExam(activeLevel));
  elements.checkpointNext.addEventListener("click", () => selectLevel(activeLevel + 1));
  elements.examSubmit.addEventListener("click", submitExam);
  elements.examRetry.addEventListener("click", retryExam);
  elements.examClose.addEventListener("click", () => closeExam(true));

  // Mantiene las pestañas utilizables sin ratón y devuelve el foco al control
  // reconstruido después de cambiar el nivel o el módulo.
  [elements.levelTabs, elements.list].forEach((root) => {
    root?.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      const buttons = [...root.querySelectorAll("button:not(:disabled)")];
      const index = buttons.indexOf(event.target);
      if (index < 0 || !buttons.length) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].click();
      root.querySelectorAll("button:not(:disabled)")[next]?.focus();
    });
  });

  const resumeIndex = learning?.resumeIndex(courseId) ?? 0;
  selectModule(isLevelUnlocked(modules[resumeIndex]?.levelIndex) ? resumeIndex : 0);
})();

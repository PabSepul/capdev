(() => {
  "use strict";
  const course = globalThis.SQLCourse;
  const runtime = globalThis.StarterRuntime;
  if (!course || document.body.dataset.course !== "sql") return;

  const element = (id) => document.querySelector(`#${id}`);
  const make = (tag, className = "", text = "") => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  function renderTable(target, result, caption) {
    target.replaceChildren();
    if (result.error) {
      target.append(make("p", "sql-table-error", result.error));
      return;
    }
    const table = make("table", "sql-data-table");
    table.append(make("caption", "", caption));
    const head = make("thead");
    const heading = make("tr");
    for (const column of result.columns) {
      const cell = make("th", "", column);
      cell.setAttribute("scope", "col");
      heading.append(cell);
    }
    head.append(heading);
    table.append(head);
    const body = make("tbody");
    for (const record of result.rows) {
      const row = make("tr");
      for (const column of result.columns) row.append(make("td", "", record[column] == null ? "NULL" : String(record[column])));
      body.append(row);
    }
    if (result.rows.length === 0) {
      const row = make("tr");
      const cell = make("td", "", "No hay filas que cumplan esta condición. La consulta puede ser válida aunque el resultado esté vacío.");
      cell.setAttribute("colspan", String(Math.max(1, result.columns.length)));
      row.append(cell);
      body.append(row);
    }
    table.append(body);
    target.append(table);
  }

  const schemas = {
    cursos: [
      ["id · número", "Identificador del curso. Permite reconocerlo y relacionarlo con los estudiantes."],
      ["nombre · texto", "Nombre del curso, por ejemplo Python. Es un dato, no un comando SQL."],
      ["nivel · texto", "Inicial, Siguiente o Avanzado. Describe la dificultad de los cursos de práctica, no tu avance en esta ruta."],
      ["categoria · texto", "Tema general: Lenguajes, Web, Datos o Herramientas."],
      ["duracion · número (horas)", "Tiempo estimado del curso. Se compara con números sin comillas, por ejemplo duracion > 6."],
      ["inscritos · número (personas)", "Inscripciones ficticias del catálogo. No equivale a contar los ocho registros de la tabla estudiantes, que solo es una muestra."]
    ],
    estudiantes: [
      ["id · número", "Identificador de la persona. No es el identificador del curso que estudia."],
      ["nombre · texto", "Nombre de la persona. Al unir tablas usamos e.nombre para no confundirlo con c.nombre."],
      ["ciudad · texto", "Ciudad que usaremos para filtrar en la práctica adicional."],
      ["curso_id · número", "Referencia al id de cursos. Ada y Grace tienen curso_id = 1: ambas estudian Python."],
      ["horas · número (horas)", "Tiempo de práctica registrado por cada persona. Es distinto de duracion, que describe el curso."]
    ]
  };

  function showDataset(name) {
    const records = runtime.tables[name];
    renderTable(element("sql-data-table"), { columns: Object.keys(records[0]), rows: records }, `Tabla original: ${name}`);
    element("sql-data-count").textContent = `${records.length} filas · ${Object.keys(records[0]).length} columnas`;
    element("sql-data-schema").replaceChildren();
    for (const [field, description] of schemas[name]) {
      element("sql-data-schema").append(make("dt", "", field));
      element("sql-data-schema").append(make("dd", "", description));
    }
    for (const key of Object.keys(schemas)) element(`sql-data-${key}`).setAttribute("aria-pressed", String(key === name));
  }
  for (const name of Object.keys(schemas)) element(`sql-data-${name}`).addEventListener("click", () => showDataset(name));

  function renderLesson(index) {
    const lesson = course.lessons[index];
    const guide = element("sql-lesson-guide");
    guide.replaceChildren();
    for (const paragraph of lesson.paragraphs.slice(1)) guide.append(make("p", "sql-lesson-paragraph", paragraph));
    guide.append(make("h3", "sql-subheading", "Desarmemos un ejemplo, paso a paso"));
    const steps = make("ol", "sql-query-steps");
    for (const [fragment, explanation] of lesson.steps) {
      const item = make("li");
      item.append(make("code", "", fragment));
      item.append(make("p", "", explanation));
      steps.append(item);
    }
    guide.append(steps);

    const example = make("details", "sql-details");
    example.append(make("summary", "", "Ver el ejemplo completo y su resultado"));
    example.append(make("p", "", lesson.workedCopy));
    example.append(make("pre", "sql-code-example", lesson.worked));
    const output = make("div", "sql-table-scroll");
    output.setAttribute("tabindex", "0");
    output.setAttribute("role", "region");
    output.setAttribute("aria-label", "Resultado del ejemplo resuelto");
    renderTable(output, runtime.runSql(lesson.worked), "Resultado del ejemplo — no es la solución de tu misión");
    example.append(output);
    guide.append(example);

    element("sql-expected-copy").textContent = lesson.expectedCopy + ". " + (lesson.orderBy ? "Compara también el orden de las filas." : "No se exige un orden específico de las filas en este ejercicio.");
    renderTable(element("sql-expected-table"), lesson.expected, "Datos esperados para tu misión");
    const review = element("sql-lesson-review");
    review.replaceChildren();
    const mistakes = make("details", "sql-details");
    mistakes.append(make("summary", "", "Errores frecuentes en este módulo"));
    for (const [symptom, explanation] of lesson.mistakes) {
      mistakes.append(make("h4", "", symptom));
      mistakes.append(make("p", "", explanation));
    }
    review.append(mistakes);
    const reflection = make("details", "sql-details sql-reflection");
    reflection.append(make("summary", "", "Para comprobar que entendiste: " + lesson.question));
    reflection.append(make("p", "", lesson.answer));
    review.append(reflection);
  }

  function renderResult(result) {
    const table = element("sql-result-table");
    const status = element("sql-result-status");
    table.hidden = Boolean(result.error);
    element("starter-output").hidden = !result.error;
    if (result.error) {
      table.replaceChildren();
      status.className = "sql-result-status is-error";
      status.textContent = "La consulta no pudo ejecutarse. Revisa el mensaje, los nombres de las columnas y la guía de errores. Tus datos originales no cambiaron.";
    } else {
      renderTable(table, result, "Última consulta ejecutada");
      status.className = "sql-result-status";
      status.textContent = `${result.rows.length} ${result.rows.length === 1 ? "fila" : "filas"} · ${result.columns.length} ${result.columns.length === 1 ? "columna" : "columnas"}. `
        + (result.rows.length ? "Compara el resultado con la misión antes de completar." : "No hubo coincidencias. Revisa el filtro; un resultado vacío no es un error de sintaxis.");
    }
  }

  let activePractice = -1;
  const drafts = course.practices.map((practice) => practice.starter);
  const picker = element("sql-practice-picker");
  const practiceButtons = course.practices.map((practice, index) => {
    const button = make("button", "", `${index + 1}. ${practice.title}`);
    button.type = "button";
    button.addEventListener("click", () => selectPractice(index));
    picker.append(button);
    return button;
  });

  function selectPractice(index) {
    if (activePractice >= 0) drafts[activePractice] = element("sql-extra-code").value;
    activePractice = index;
    const practice = course.practices[index];
    element("sql-extra-title").textContent = practice.title;
    element("sql-extra-concept").textContent = practice.concept;
    element("sql-extra-goal").textContent = practice.goal;
    element("sql-extra-hint").textContent = practice.hint;
    element("sql-extra-solution").textContent = practice.solution;
    element("sql-extra-solution-details").open = false;
    element("sql-extra-code").value = drafts[index];
    element("sql-extra-result").replaceChildren();
    element("sql-extra-status").textContent = "Escribe tu propuesta y pulsa Ejecutar y comprobar. Esta práctica no guarda puntuaciones.";
    element("sql-extra-status").className = "sql-result-status";
    practiceButtons.forEach((button, position) => button.setAttribute("aria-pressed", String(position === index)));
  }

  element("sql-extra-run").addEventListener("click", () => {
    const practice = course.practices[activePractice];
    const result = runtime.runSql(element("sql-extra-code").value);
    const expected = runtime.runSql(practice.solution);
    renderTable(element("sql-extra-result"), result, "Resultado de la práctica adicional");
    const sortField = activePractice === 0 ? "duracion" : activePractice === 1 ? "nombre" : null;
    const ordered = !sortField || result.rows.every((row, index) => row[sortField] === expected.rows[index]?.[sortField]);
    const passed = course.matchesResult(result, expected) && ordered;
    element("sql-extra-status").className = "sql-result-status" + (result.error ? " is-error" : passed ? " is-success" : "");
    element("sql-extra-status").textContent = result.error ? "Revisa el mensaje de error debajo. La consulta no modificó los datos."
      : passed ? "¡Desafío resuelto! Los datos y el orden cumplen la pregunta. Intenta explicar qué hace cada parte."
        : "La consulta se ejecutó, pero todavía no responde toda la pregunta. Revisa columnas, filas y orden; tienes una pista y una solución explicada.";
  });
  element("sql-extra-reset").addEventListener("click", () => {
    element("sql-extra-code").value = course.practices[activePractice].starter;
    selectPractice(activePractice);
  });

  showDataset("cursos");
  selectPractice(0);
  globalThis.SQLGuide = { renderLesson, renderResult };
})();

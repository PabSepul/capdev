/* Nivel cuatro. Se añade al final para conservar los índices y el progreso v2. */
(() => {
  "use strict";
  const extensions = {};
  const check = (label, test) => ({ label, test });
  function lesson(title, shortTitle, intro, explanation, concepts, goal, starter, solution, hints, checks, extra = {}) {
    return { title, shortTitle, intro, explanation, concepts, goal, starter, solution, hints, checks,
      duration: "18 min", difficulty: "Práctica aplicada", example: solution,
      success: "Resolviste la misión. Explica qué cambiaste y por qué antes de continuar.", ...extra };
  }
  const out = (expected) => (_, result) => !result.error && result.output.join("\n") === expected;
  const variable = (name, expected) => (_, result) => JSON.stringify(result.environment?.[name]) === JSON.stringify(expected);
  extensions.javascript = { title: "Transformar datos", description: "Limpieza, búsquedas y reportes reutilizables", modules: [
    lesson("Limpia las etiquetas de un catálogo", "Normalizar textos",
      "Un formulario entrega etiquetas con espacios y mayúsculas. Antes de compararlas, necesitamos una representación consistente.",
      "trim() elimina espacios de los extremos y toLowerCase() convierte a minúsculas. Ambos devuelven otro texto. map() construye un arreglo nuevo: conserva los datos originales para poder revisar de dónde vino cada valor.",
      ["Normalizar no significa borrar espacios internos.", "Las cadenas no se modifican al llamar a sus métodos.", "map transforma cada elemento y devuelve otro arreglo."],
      "Crea limpias con html, css y javascript; conserva etiquetas sin cambios y muestra las etiquetas limpias separadas por coma y espacio.",
      'const etiquetas = [" HTML ", "CSS", " JavaScript "];\nconsole.log(etiquetas.join(", "));',
      'const etiquetas = [" HTML ", "CSS", " JavaScript "];\nconst limpias = etiquetas.map(etiqueta => etiqueta.trim().toLowerCase());\nconsole.log(limpias.join(", "));',
      ["Aplica trim() antes de comparar cada etiqueta.", "Encadena toLowerCase() al texto sin espacios exteriores.", 'Guarda el resultado de map en limpias y usa limpias.join(", ").'],
      [check("Normaliza las tres etiquetas", variable("limpias", ["html", "css", "javascript"])), check("Conserva los datos de entrada", variable("etiquetas", [" HTML ", "CSS", " JavaScript "])), check("Muestra html, css, javascript", out("html, css, javascript"))]),
    lesson("Busca un curso sin perder el resto", "Buscar por id",
      "Los títulos pueden cambiar. Un identificador permite encontrar un curso concreto dentro del catálogo.",
      "Una función recibe la lista y el id buscado. Recorre los objetos y devuelve el nombre cuando encuentra una coincidencia; si termina el recorrido, devuelve un mensaje explícito. El return de ausencia va después del ciclo, para no abandonar la búsqueda en el primer elemento.",
      ["Los parámetros permiten reutilizar una búsqueda.", "return termina la función.", "La ausencia de un dato también necesita una respuesta."],
      'Define buscarNombre(cursos, id). Para los ids 2, 1 y 99 debe devolver SQL, HTML y No encontrado, respectivamente. Muestra esos tres resultados.',
      'const cursos = [{ id: 1, nombre: "HTML" }, { id: 2, nombre: "SQL" }];\nfunction buscarNombre(lista, id) {\n  return "No encontrado";\n}\nconsole.log(buscarNombre(cursos, 2));',
      'const cursos = [{ id: 1, nombre: "HTML" }, { id: 2, nombre: "SQL" }];\nfunction buscarNombre(lista, id) {\n  for (const curso of lista) {\n    if (curso.id === id) return curso.nombre;\n  }\n  return "No encontrado";\n}\nconsole.log(buscarNombre(cursos, 2));\nconsole.log(buscarNombre(cursos, 1));\nconsole.log(buscarNombre(cursos, 99));',
      ["Recorre lista con for...of y compara curso.id con id.", "Devuelve curso.nombre solamente dentro de la condición.", 'Después del ciclo devuelve "No encontrado" y prueba también un id inexistente.'],
      [check("Define una búsqueda reutilizable", (code) => /function\s+buscarNombre\s*\(/.test(code)), check("Conserva los dos cursos", variable("cursos", [{ id: 1, nombre: "HTML" }, { id: 2, nombre: "SQL" }])), check("Resuelve búsquedas y ausencia", out("SQL\nHTML\nNo encontrado"))]),
    lesson("Resume una semana de estudio", "Acumular resultados",
      "Una semana tiene días con distinta dedicación. Queremos conocer el total y cuántos días hubo práctica.",
      "Un acumulador guarda una suma parcial. Otro contador aumenta solo cuando las horas son mayores que cero. Separar ambas responsabilidades evita confundir horas totales con cantidad de días activos.",
      ["Inicializa contadores en cero.", "Un ciclo puede actualizar más de un indicador.", "Cero horas es un dato válido, pero no cuenta como día activo."],
      "Con horas = [2, 0, 3, 1, 0], calcula total = 6 y activos = 3. Imprime primero el total y después los días activos.",
      'const horas = [2, 0, 3, 1, 0];\nlet total = 0;\nlet activos = 0;\nconsole.log(total);\nconsole.log(activos);',
      'const horas = [2, 0, 3, 1, 0];\nlet total = 0;\nlet activos = 0;\nfor (const valor of horas) {\n  total += valor;\n  if (valor > 0) activos += 1;\n}\nconsole.log(total);\nconsole.log(activos);',
      ["Suma cada valor a total, incluso si vale cero.", "Incrementa activos dentro de if (valor > 0).", "Al terminar el ciclo imprime total y activos, en ese orden."],
      [check("Suma seis horas", variable("total", 6)), check("Cuenta tres días activos", variable("activos", 3)), check("Muestra ambos indicadores", out("6\n3"))]),
    lesson("Construye un reporte de cursos breves", "Reporte integrado",
      "Ya puedes transformar, filtrar y resumir. Ahora combinarás esas operaciones para recomendar cursos de hasta seis horas.",
      "filter conserva los objetos que cumplen una condición; map extrae sus nombres. Calcula la suma sobre los cursos seleccionados, no sobre todo el catálogo. Mantén el arreglo original para que otras partes del programa puedan usarlo.",
      ["Filtra antes de resumir.", "<= incluye el límite indicado.", "Cada etapa tiene una entrada y una salida identificable."],
      "Desde el catálogo dado crea breves con HTML y SQL, calcula total = 11 y muestra HTML, SQL seguido de 11 en otra línea.",
      'const cursos = [{ nombre: "HTML", horas: 6 }, { nombre: "SQL", horas: 5 }, { nombre: "JavaScript", horas: 8 }];\nconsole.log(cursos.length);',
      'const cursos = [{ nombre: "HTML", horas: 6 }, { nombre: "SQL", horas: 5 }, { nombre: "JavaScript", horas: 8 }];\nconst breves = cursos.filter(curso => curso.horas <= 6);\nlet total = 0;\nfor (const curso of breves) total += curso.horas;\nconsole.log(breves.map(curso => curso.nombre).join(", "));\nconsole.log(total);',
      ["Selecciona con curso.horas <= 6.", "Acumula las horas de breves y transforma sus nombres con map.", 'Usa join(", ") para la primera línea e imprime total en la segunda.'],
      [check("Selecciona exactamente los dos cursos breves", variable("breves", [{ nombre: "HTML", horas: 6 }, { nombre: "SQL", horas: 5 }])), check("Suma once horas", variable("total", 11)), check("Entrega el reporte esperado", out("HTML, SQL\n11"))])
  ] };

  const htmlCheck = (label, pattern) => check(label, (code) => pattern.test(String(code).replace(/<!--[\s\S]*?-->/g, "")));
  extensions["html-css"] = { title: "Interfaces utilizables", description: "Formularios, tablas, foco y contenido desplegable", modules: [
    lesson("Un formulario que se entiende", "Etiquetas y entradas",
      "Un campo necesita un nombre visible. El placeholder desaparece al escribir y no sustituye una etiqueta.",
      "label conecta el texto con un input mediante for e id. type=email aporta comprobación de formato; required evita el envío vacío. En esta vista aislada practicamos la estructura: no se envía información a un servidor.",
      ["for debe coincidir con el id del control.", "name identifica el dato de un formulario.", "Un botón de envío necesita texto comprensible."],
      "Crea un formulario con etiqueta Correo vinculada al input correo, de tipo email, con name y required. Añade un botón submit que diga Inscribirme.",
      '<form>\n  <input placeholder="Correo">\n  <button>Enviar</button>\n</form>',
      '<form>\n  <label for="correo">Correo</label>\n  <input id="correo" name="correo" type="email" required>\n  <button type="submit">Inscribirme</button>\n</form>',
      ['Añade <label for="correo">Correo</label>.', 'Usa id="correo", name="correo", type="email" y required en el mismo input.', 'Dentro del form usa <button type="submit">Inscribirme</button>.'],
      [htmlCheck("Vincula la etiqueta Correo con su input", /<label\b[^>]*for=["']correo["'][^>]*>\s*Correo\s*<\/label>[\s\S]*<input\b(?=[^>]*id=["']correo["'])[^>]*>/i), htmlCheck("Configura un correo obligatorio con nombre", /<input\b(?=[^>]*id=["']correo["'])(?=[^>]*name=["']correo["'])(?=[^>]*type=["']email["'])(?=[^>]*\brequired\b)[^>]*>/i), htmlCheck("Incluye el envío dentro de un formulario", /<form\b[^>]*>[\s\S]*<button\b[^>]*type=["']submit["'][^>]*>\s*Inscribirme\s*<\/button>[\s\S]*<\/form>/i)]),
    lesson("Presenta datos como una tabla", "Tablas semánticas",
      "Un horario relaciona cursos con horas. Una tabla expresa esa relación mejor que espacios insertados manualmente.",
      "caption nombra el conjunto. thead contiene los encabezados y tbody los registros. th con scope=col indica qué columna describe cada encabezado; td contiene los valores de cada fila.",
      ["Las tablas son para datos relacionados.", "Cada fila usa tr.", "Un encabezado de columna ayuda a interpretar sus celdas."],
      "Crea una tabla con caption Plan de estudio, encabezados Curso y Horas con scope=col, y una fila HTML / 6 dentro de tbody.",
      '<table>\n  <tr><td>Curso</td><td>Horas</td></tr>\n  <tr><td>HTML</td><td>6</td></tr>\n</table>',
      '<table>\n  <caption>Plan de estudio</caption>\n  <thead><tr><th scope="col">Curso</th><th scope="col">Horas</th></tr></thead>\n  <tbody><tr><td>HTML</td><td>6</td></tr></tbody>\n</table>',
      ["Coloca caption directamente dentro de table.", 'Cambia los encabezados a th scope="col" y agrúpalos en thead.', "Conserva HTML y 6 en una fila de tbody."],
      [htmlCheck("Nombra la tabla", /<table\b[^>]*>[\s\S]*<caption>\s*Plan de estudio\s*<\/caption>/i), htmlCheck("Identifica las dos columnas", /<thead>[\s\S]*<th\b[^>]*scope=["']col["'][^>]*>Curso<\/th>\s*<th\b[^>]*scope=["']col["'][^>]*>Horas<\/th>[\s\S]*<\/thead>/i), htmlCheck("Agrupa los datos en tbody", /<tbody>\s*<tr>\s*<td>HTML<\/td>\s*<td>6<\/td>\s*<\/tr>\s*<\/tbody>/i)]),
    lesson("Haz visible el foco del teclado", "Foco y acciones",
      "Quien usa Tab necesita saber qué control está activo. Un cambio al pasar el ratón no cubre la navegación con teclado.",
      ":focus-visible permite destacar el foco cuando el navegador considera que debe mostrarse, como al navegar con teclado. outline no cambia el tamaño de la caja. Usa un botón nativo para una acción; un div con apariencia de botón no aporta el mismo comportamiento.",
      ["Los botones nativos reciben foco.", "outline-offset separa el indicador del borde.", "Comprueba el foco con Tab en la vista previa."],
      'Crea un botón type=button con clase accion y texto Practicar. En .accion:focus-visible define outline: 3px solid #1c69d4 y outline-offset: 4px.',
      '<style>\n.accion { padding: 12px 18px; }\n</style>\n<button class="accion" type="button">Practicar</button>',
      '<style>\n.accion { padding: 12px 18px; }\n.accion:focus-visible { outline: 3px solid #1c69d4; outline-offset: 4px; }\n</style>\n<button class="accion" type="button">Practicar</button>',
      ["Añade una regla para .accion:focus-visible.", "outline necesita grosor, estilo y color.", "Usa outline-offset: 4px y prueba Tab; no quites el indicador de foco."],
      [htmlCheck("Usa un botón nativo con texto", /<button\b(?=[^>]*class=["']accion["'])(?=[^>]*type=["']button["'])[^>]*>Practicar<\/button>/i), htmlCheck("Define un contorno visible", /\.accion:focus-visible\s*\{[^}]*outline\s*:\s*3px\s+solid\s+#1c69d4\s*;?/i), htmlCheck("Separa el contorno del botón", /\.accion:focus-visible\s*\{[^}]*outline-offset\s*:\s*4px/i)]),
    lesson("Organiza preguntas frecuentes", "Desplegables nativos",
      "Algunas explicaciones se consultan solo cuando hacen falta. details ofrece un desplegable con interacción nativa.",
      "summary es el título que abre y cierra el contenido. Colócalo primero dentro de details y escribe después la respuesta. Puedes añadir estilos al contenedor sin reemplazar la interacción que ya ofrece el navegador.",
      ["summary debe describir la información oculta.", "details puede abrirse con teclado.", "El contenido sigue formando parte del documento."],
      "Dentro de section incluye h2 Preguntas frecuentes y details con summary ¿Necesito experiencia?, seguido de un párrafo que diga Puedes empezar desde cero. Estiliza details con padding: 16px y border: 1px solid #777.",
      '<section>\n  <h2>Preguntas frecuentes</h2>\n  <p>Puedes empezar desde cero.</p>\n</section>',
      '<style>details { padding: 16px; border: 1px solid #777; }</style>\n<section>\n  <h2>Preguntas frecuentes</h2>\n  <details><summary>¿Necesito experiencia?</summary><p>Puedes empezar desde cero.</p></details>\n</section>',
      ["Coloca la pregunta en summary dentro de details.", "El párrafo de respuesta va después de summary, dentro del mismo details.", "Añade padding y border en una regla details y prueba abrirlo con teclado."],
      [htmlCheck("Agrupa la sección con su título", /<section\b[^>]*>\s*<h2>Preguntas frecuentes<\/h2>[\s\S]*<\/section>/i), htmlCheck("Construye pregunta y respuesta desplegables", /<details>\s*<summary>¿Necesito experiencia\?<\/summary>\s*<p>Puedes empezar desde cero\.<\/p>\s*<\/details>/i), check("Añade espacio y borde al desplegable", (code) => /details\s*\{[^}]*padding\s*:\s*16px/i.test(code) && /details\s*\{[^}]*border\s*:\s*1px\s+solid\s+#777/i.test(code))])
  ] };

  const sqlSpecs = [
    { title: "Cuenta cursos por nivel", short: "GROUP BY", goal: "Devuelve nivel y COUNT(*) AS cantidad, una fila por nivel, ordenada por nivel ascendente.",
      intro: "Un conteo general oculta cómo se distribuye el catálogo. Agrupar permite responder cuántos cursos hay en cada nivel.",
      explanation: "GROUP BY reúne filas con el mismo valor. COUNT(*) cuenta las filas de cada grupo. La columna nivel debe aparecer en GROUP BY porque no es un resumen; ORDER BY organiza las filas ya agrupadas.",
      solution: "SELECT nivel, COUNT(*) AS cantidad FROM cursos GROUP BY nivel ORDER BY nivel;",
      worked: "SELECT categoria, COUNT(*) AS cantidad FROM cursos GROUP BY categoria ORDER BY categoria;",
      steps: [["GROUP BY categoria", "Forma un grupo por categoría."], ["COUNT(*) AS cantidad", "Cuenta cursos dentro de cada grupo."], ["ORDER BY categoria", "Presenta los grupos en orden alfabético."]],
      hints: ["Selecciona nivel y COUNT(*) AS cantidad.", "Agrupa con GROUP BY nivel.", "Después de GROUP BY añade ORDER BY nivel."],
      question: "¿COUNT(*) sin GROUP BY responde lo mismo?", answer: "No: devuelve una fila con el total del catálogo, no una fila por nivel.",
      mistake: "Seleccionar nombre junto a nivel sin agruparlo deja un nombre ambiguo: un nivel contiene varios cursos." },
    { title: "Compara la duración de las categorías", short: "Promedios por grupo", goal: "Devuelve categoria y AVG(duracion) AS promedio, agrupado y ordenado por categoria ascendente.",
      intro: "Para comparar categorías, la duración total puede engañar si una tiene muchos más cursos. Un promedio describe la duración por curso.",
      explanation: "AVG divide la suma de las duraciones por la cantidad de valores considerados en cada grupo. Mantén la unidad: el resultado sigue expresado en horas. Un promedio puede ser decimal aunque todos los cursos duren horas enteras.",
      solution: "SELECT categoria, AVG(duracion) AS promedio FROM cursos GROUP BY categoria ORDER BY categoria;",
      worked: "SELECT nivel, AVG(duracion) AS promedio FROM cursos GROUP BY nivel ORDER BY nivel;",
      steps: [["GROUP BY nivel", "Compara grupos del mismo nivel."], ["AVG(duracion)", "Calcula un promedio independiente para cada grupo."], ["AS promedio", "Nombra el indicador sin modificar los datos."]],
      hints: ["AVG debe recibir duracion, no inscritos.", "Selecciona categoria y agrupa por esa misma columna.", "Usa AS promedio y ORDER BY categoria para el reporte final."],
      question: "¿Promediar los promedios de categorías da siempre el promedio general?", answer: "No. Si los grupos tienen distintos tamaños, habría que ponderarlos por su cantidad de cursos.",
      mistake: "SUM(duracion) calcula horas acumuladas; no sustituye a AVG(duracion)." },
    { title: "Filtra antes de resumir", short: "WHERE y agrupación", goal: "Para los cursos de nivel Inicial, devuelve categoria y SUM(inscritos) AS total, agrupado y ordenado por categoria ascendente.",
      intro: "El equipo necesita un reporte de inscripciones iniciales. Los cursos de otros niveles deben quedar fuera antes de sumar.",
      explanation: "WHERE filtra filas de entrada. GROUP BY forma grupos solamente con las filas que quedaron y SUM calcula su total. Cambiar el orden lógico de esas tareas cambia la pregunta que responde el reporte.",
      solution: "SELECT categoria, SUM(inscritos) AS total FROM cursos WHERE nivel = 'Inicial' GROUP BY categoria ORDER BY categoria;",
      worked: "SELECT nivel, SUM(inscritos) AS total FROM cursos WHERE duracion <= 8 GROUP BY nivel ORDER BY nivel;",
      steps: [["WHERE duracion <= 8", "Conserva cursos de hasta ocho horas."], ["GROUP BY nivel", "Agrupa solo los cursos conservados."], ["SUM(inscritos) AS total", "Suma sus inscripciones."]],
      hints: ["WHERE nivel = 'Inicial' va después de FROM cursos.", "Suma inscritos y utiliza el alias total.", "Agrupa y ordena por categoria."],
      question: "¿Una categoría sin cursos Iniciales aparece con total cero?", answer: "No: al no quedar filas de esa categoría, esta consulta no forma un grupo para ella.",
      mistake: "Filtrar duracion en vez de nivel puede devolver un reporte razonable que responde otra pregunta." },
    { title: "Relaciona estudiantes con sus cursos", short: "JOIN con filtro", goal: "Devuelve estudiantes.nombre AS estudiante y cursos.nombre AS curso de estudiantes de Santiago, ordenados por estudiante ascendente.",
      intro: "El id de un curso sirve para relacionar tablas, pero un reporte para personas debe mostrar nombres comprensibles.",
      explanation: "JOIN conecta estudiantes.curso_id con cursos.id. Como ambas tablas tienen nombre, califica cada columna con su tabla. Los alias estudiante y curso evitan encabezados repetidos. WHERE filtra la ciudad de la tabla de estudiantes.",
      solution: "SELECT estudiantes.nombre AS estudiante, cursos.nombre AS curso FROM estudiantes JOIN cursos ON estudiantes.curso_id = cursos.id WHERE estudiantes.ciudad = 'Santiago' ORDER BY estudiante;",
      worked: "SELECT estudiantes.nombre AS estudiante, cursos.nombre AS curso FROM estudiantes JOIN cursos ON estudiantes.curso_id = cursos.id WHERE estudiantes.ciudad = 'Valparaíso' ORDER BY estudiante;",
      steps: [["JOIN cursos ON estudiantes.curso_id = cursos.id", "Relaciona cada estudiante con su curso."], ["WHERE estudiantes.ciudad = 'Valparaíso'", "Conserva estudiantes de esa ciudad."], ["AS estudiante / AS curso", "Distingue las dos columnas de nombres."]],
      hints: ["Une curso_id con cursos.id, no con el id del estudiante.", "Filtra estudiantes.ciudad = 'Santiago'.", "Da los alias estudiante y curso y ordena por estudiante."],
      question: "¿Por qué no relacionamos estudiantes.id con cursos.id?", answer: "Porque identifican entidades distintas. La columna curso_id es la referencia al curso de cada estudiante.",
      mistake: "Usar nombre sin indicar la tabla deja una columna ambigua cuando ambas tablas la tienen." }
  ];

  const scenario = (extra = {}) => ({ initialized: true, head: "main", branches: { main: "base001" },
    commits: [{ id: "base001", message: "Base del proyecto", parent: null, files: { "README.md": "# Proyecto", "index.html": "<h1>Inicio</h1>" } }],
    files: { "README.md": { content: "# Proyecto\nGuía de instalación", committed: "# Proyecto" }, "index.html": { content: "<h1>Inicio</h1>", committed: "<h1>Inicio</h1>" } }, ...extra });
  const clean = (_, result) => Object.values(result.state.files).every(f => !f.staged && f.content === f.committed);
  const pushed = (branch) => (_, result) => Boolean(result.state.pushed.origin?.[branch]) && result.state.pushed.origin[branch] === result.state.branches[branch];
  extensions.git = { title: "Preparar una colaboración", description: "Revisión, ramas publicadas y flujo de pull request", modules: [
    lesson("Revisa exactamente lo que vas a confirmar", "Diff preparado",
      "Antes de guardar una versión, revisa el contenido que realmente entrará en el commit. El directorio de trabajo y el área de preparación son estados distintos.",
      "git diff muestra diferencias del directorio de trabajo respecto del área de preparación. git diff --staged compara lo preparado con el último commit. Tras git add, un diff normal puede quedar vacío aunque aún haya cambios por confirmar.",
      ["add prepara una instantánea del archivo.", "--staged permite revisar esa instantánea.", "Un mensaje de commit describe el cambio realizado."],
      'Prepara README.md, revisa git diff --staged y confirma con el mensaje "Documenta la instalación". El repositorio debe terminar limpio.',
      'git status', 'git add README.md\ngit diff --staged\ngit commit -m "Documenta la instalación"\ngit status',
      ["Usa git add README.md para preparar solo la documentación.", "Ejecuta git diff --staged antes del commit.", 'Confirma con git commit -m "Documenta la instalación" y revisa status.'],
      [check("Revisa el cambio preparado", (_, r) => r.output.includes("+Guía de instalación")), check("Guarda el commit solicitado", (_, r) => r.state.commits.some(c => c.message === "Documenta la instalación" && c.files["README.md"].includes("Guía de instalación"))), check("Termina sin cambios pendientes", clean)], { scenario: scenario() }),
    lesson("Publica una rama para revisión", "Rama remota",
      "Una mejora puede revisarse sin incorporarla todavía a main. Primero crea una rama y publica sus commits.",
      "switch -c abre una rama desde el commit actual. Después de confirmar, push -u origin nombre publica esa rama. En GitHub real, este es el paso previo a abrir un pull request; el laboratorio simula el remoto y no crea una solicitud en GitHub.",
      ["main conserva el punto de partida.", "Una rama permite agrupar una propuesta.", "Publicar una rama no equivale a fusionarla."],
      'Crea docs-instalacion, confirma README.md con el mensaje "Explica la instalación" y publica esa rama en origin. Mantén main en base001.',
      'git status', 'git switch -c docs-instalacion\ngit add README.md\ngit commit -m "Explica la instalación"\ngit push -u origin docs-instalacion',
      ["Crea la rama antes de confirmar el cambio.", 'Confirma README.md con el mensaje "Explica la instalación".', "Publica docs-instalacion, no main: git push -u origin docs-instalacion."],
      [check("Trabaja en docs-instalacion con la documentación", (_, r) => r.state.head === "docs-instalacion" && r.state.commits.some(c => c.id === r.state.branches["docs-instalacion"] && c.files["README.md"].includes("Guía de instalación"))), check("Conserva main", (_, r) => r.state.branches.main === "base001"), check("Publica la rama actual", pushed("docs-instalacion"))], { scenario: scenario({ remotes: { origin: "https://github.com/ejemplo/capsulas-dev.git" } }) }),
    lesson("Integra una propuesta revisada", "Base y comparación",
      "En GitHub, un pull request propone incorporar una rama de comparación a una rama base. Comprueba siempre la dirección antes de integrar.",
      "En esta misión la revisión ya fue aprobada: main es la base y docs-instalacion contiene la propuesta. Simularemos la integración con git merge local y después publicaremos main. Los comentarios y la aprobación de GitHub son pasos humanos; no son comandos del laboratorio.",
      ["La base recibe los cambios.", "La comparación contiene los commits propuestos.", "Un fast-forward es posible si la base no avanzó por separado."],
      "Integra docs-instalacion en main, revisa el historial y publica main. Su commit final debe ser docs002 y README debe incluir la guía.",
      'git branch', 'git switch main\ngit merge docs-instalacion\ngit log --oneline\ngit push origin main',
      ["Comprueba que main sea la rama activa.", "Ejecuta git merge docs-instalacion y revisa git log --oneline.", "Publica el resultado con git push origin main."],
      [check("Integra en main el commit revisado", (_, r) => r.state.head === "main" && r.state.branches.main === "docs002"), check("Conserva la guía en el archivo", (_, r) => r.state.files["README.md"].content === "# Proyecto\nGuía de instalación"), check("Actualiza main en el remoto", pushed("main"))], { scenario: scenario({
        branches: { main: "base001", "docs-instalacion": "docs002" },
        commits: [...scenario().commits, { id: "docs002", message: "Explica la instalación", parent: "base001", files: { "README.md": "# Proyecto\nGuía de instalación", "index.html": "<h1>Inicio</h1>" } }],
        files: { "README.md": { content: "# Proyecto", committed: "# Proyecto" }, "index.html": { content: "<h1>Inicio</h1>", committed: "<h1>Inicio</h1>" } },
        remotes: { origin: "https://github.com/ejemplo/capsulas-dev.git" }
      }) }),
    lesson("Entrega una mejora sin publicar un borrador", "Entrega controlada",
      "La carpeta incluye documentación útil y un borrador privado sin seguimiento. Una entrega cuidadosa incluye solo lo necesario.",
      "Preparar por nombre evita incluir archivos accidentales con add . Un archivo sin seguimiento puede quedarse localmente: no se publica si nunca forma parte de un commit. En un proyecto real añade reglas de .gitignore y revisa que los datos sensibles nunca hayan entrado en el historial.",
      ["El remoto recibe commits, no toda la carpeta.", "Revisa qué archivos entran en cada commit.", "Un borrador sin seguimiento no impide publicar una rama."],
      'Crea entrega-docs, confirma solo README.md con "Prepara documentación", y publica entrega-docs. borrador.txt debe quedar sin seguimiento y main intacta.',
      'git status', 'git switch -c entrega-docs\ngit add README.md\ngit diff --staged\ngit commit -m "Prepara documentación"\ngit push -u origin entrega-docs\ngit status',
      ["Crea entrega-docs desde main.", "Usa git add README.md; no prepares borrador.txt.", "Publica entrega-docs y revisa que el borrador no aparezca en el commit."],
      [check("Publica entrega-docs", pushed("entrega-docs")), check("Entrega la documentación y conserva main", (_, r) => r.state.branches.main === "base001" && r.state.commits.some(c => c.id === r.state.branches["entrega-docs"] && c.files["README.md"].includes("Guía de instalación"))), check("El borrador no entra en ningún commit", (_, r) => r.state.files["borrador.txt"]?.committed === null && !r.state.files["borrador.txt"]?.staged && r.state.commits.every(c => !("borrador.txt" in c.files)))], { scenario: scenario({
        files: { ...scenario().files, "borrador.txt": { content: "Notas sin revisar", committed: null } }, remotes: { origin: "https://github.com/ejemplo/capsulas-dev.git" }
      }) })
  ] };

  const auth = "Authorization: Bearer clave-demo-2026";
  const request = (method, path, body) => method + " " + path + "\n" + auth + (body ? "\nContent-Type: application/json\n\n" + JSON.stringify(body) : "");
  const response = (r, method, url, status) => r.respuestas.find(x => x.metodo === method && x.url === url && x.status === status);
  extensions.apis = { title: "Consultas y flujos fiables", description: "Búsqueda, páginas, errores y recursos relacionados", modules: [
    lesson("Combina búsqueda con orden", "Buscar y ordenar",
      "La API permite buscar una parte del nombre con q. Los filtros del recurso pueden combinarse con esa búsqueda para hacer una petición más precisa.",
      "El primer parámetro empieza con ? y los siguientes se separan con &. q busca dentro del nombre sin distinguir mayúsculas. orden=-duracion ordena de mayor a menor. Estos parámetros son el contrato de esta API de práctica: otras APIs pueden usar nombres distintos.",
      ["Los filtros de esta API se combinan.", "El signo menos indica orden descendente.", "La respuesta incluye total y datos."],
      "Consulta /cursos con q=python y orden=-duracion. Debes recibir Datos con Python antes de Python, y total igual a 2.",
      'GET /cursos?q=python', 'GET /cursos?q=python&orden=-duracion',
      ["q=python encuentra dos cursos.", "Añade &orden=-duracion a la misma URL.", "Comprueba total y el orden de los ids: 7, 1."],
      [check("Recibe una consulta correcta", (_, r) => r.respuestas.some(x => x.metodo === "GET" && x.status === 200 && x.cuerpo?.total === 2)), check("Ordena los dos cursos por duración", (_, r) => r.respuestas.some(x => JSON.stringify(x.cuerpo?.datos?.map(c => c.id)) === "[7,1]")), check("No modifica el catálogo", (_, r) => r.datos.cursos.length === 7)]),
    lesson("Recorre dos páginas sin duplicar filas", "Paginación estable",
      "Una API puede limitar la cantidad de registros por respuesta. Para recorrer varias páginas necesitas mantener el mismo orden.",
      "pagina comienza en 1 y tamano indica cuántos elementos pedir. Usa orden=id en ambas peticiones para que la partición sea consistente. En sistemas reales los datos pueden cambiar entre consultas; aquí se mantienen estables durante el intento.",
      ["Cambiar de página no cambia el total general.", "Con siete cursos y tamaño tres hay tres páginas.", "El mismo orden evita comparar particiones incompatibles."],
      "Pide las páginas 1 y 2 de /cursos con tamano=3 y orden=id. La primera debe tener ids 1,2,3 y la segunda 4,5,6; ambas deben indicar total 7 y paginas 3.",
      'GET /cursos?pagina=1&tamano=3&orden=id', 'GET /cursos?pagina=1&tamano=3&orden=id\n\nGET /cursos?pagina=2&tamano=3&orden=id',
      ["Copia la petición y cambia solamente pagina a 2.", "Mantén tamano=3 y orden=id en las dos consultas.", "Comprueba ids, total y paginas en ambas respuestas."],
      [check("Primera página con ids 1,2,3", (_, r) => r.respuestas.some(x => x.cuerpo?.pagina === 1 && JSON.stringify(x.cuerpo?.datos?.map(c => c.id)) === "[1,2,3]")), check("Segunda página con ids 4,5,6", (_, r) => r.respuestas.some(x => x.cuerpo?.pagina === 2 && JSON.stringify(x.cuerpo?.datos?.map(c => c.id)) === "[4,5,6]")), check("Mantiene metadatos coherentes en ambas páginas", (_, r) => r.respuestas.filter(x => x.status === 200 && x.cuerpo?.total === 7 && x.cuerpo?.paginas === 3 && x.cuerpo?.tamano === 3).length >= 2)]),
    lesson("Corrige una petición rechazada", "Content-Type y JSON",
      "Un token válido no garantiza que el servidor comprenda el cuerpo. El tipo de contenido indica cómo interpretar los datos enviados.",
      "415 significa que el formato declarado no está admitido por este servidor. Reenvía el mismo contenido con Content-Type: application/json. Un intento rechazado no crea un recurso y no consume un identificador en este laboratorio.",
      ["Authorization identifica el permiso.", "Content-Type describe el cuerpo enviado.", "Un error debe revisarse antes de continuar el flujo."],
      "Envía un POST /cursos de Go, Inicial, 7 horas, primero con Content-Type: text/plain y luego con application/json. Debes obtener 415 y 201; consulta /cursos/8 para verificar una sola creación.",
      'POST /cursos\n' + auth + '\nContent-Type: text/plain\n\n{"nombre":"Go","nivel":"Inicial","duracion":7}',
      'POST /cursos\n' + auth + '\nContent-Type: text/plain\n\n{"nombre":"Go","nivel":"Inicial","duracion":7}\n\n' + request("POST", "/cursos", { nombre: "Go", nivel: "Inicial", duracion: 7 }) + '\n\nGET /cursos/8',
      ["Ejecuta primero el POST con text/plain para observar el rechazo.", "Añade otro POST idéntico con application/json.", "Termina con GET /cursos/8; debe existir exactamente un curso nuevo."],
      [check("Rechaza el formato y luego crea", (_, r) => r.respuestas[0]?.status === 415 && r.respuestas[1]?.status === 201 && r.respuestas[1]?.cuerpo?.nombre === "Go"), check("Consulta el recurso creado", (_, r) => response(r, "GET", "/cursos/8", 200)?.cuerpo?.nombre === "Go"), check("Crea solo un Go con los datos pedidos", (_, r) => r.datos.cursos.length === 8 && r.datos.cursos[7]?.nivel === "Inicial" && r.datos.cursos[7]?.duracion === 7)]),
    lesson("Gestiona una inscripción de principio a fin", "Recurso relacionado",
      "Un estudiante tiene un id propio y un curso_id que señala su curso. Distinguir ambos evita modificar el recurso equivocado.",
      "Crea una inscripción de práctica, corrige su ciudad y consulta el mismo id antes de eliminarlo. Tras DELETE, un GET debe responder 404. Este laboratorio no garantiza integridad referencial: comprueba por tu cuenta que el curso elegido exista.",
      ["id identifica al estudiante; curso_id referencia al curso.", "Las respuestas deben corresponder al mismo recurso.", "DELETE 204 no lleva un cuerpo JSON."],
      "Consulta /cursos/3. Crea a Elena en Santiago con curso_id 3; cambia su ciudad a Temuco, verifica /estudiantes/5, elimínala y confirma un 404. Conserva los cuatro estudiantes iniciales.",
      'GET /cursos/3', 'GET /cursos/3\n\n' + request("POST", "/estudiantes", { nombre: "Elena", ciudad: "Santiago", curso_id: 3 }) + '\n\n' + request("PATCH", "/estudiantes/5", { ciudad: "Temuco" }) + '\n\nGET /estudiantes/5\n\n' + request("DELETE", "/estudiantes/5") + '\n\nGET /estudiantes/5',
      ["Después de comprobar el curso, el POST devuelve el id 5 para Elena.", "Usa PATCH y GET sobre /estudiantes/5, con ciudad Temuco.", "Elimina ese mismo id y verifica el 404 con un último GET."],
      [check("Comprueba el curso y crea a Elena", (_, r) => Boolean(response(r, "GET", "/cursos/3", 200)) && r.respuestas.some(x => x.metodo === "POST" && x.url === "/estudiantes" && x.status === 201 && x.cuerpo?.nombre === "Elena" && x.cuerpo?.ciudad === "Santiago" && x.cuerpo?.curso_id === 3)), check("Actualiza y consulta a Elena en Temuco", (_, r) => response(r, "PATCH", "/estudiantes/5", 200)?.cuerpo?.ciudad === "Temuco" && response(r, "GET", "/estudiantes/5", 200)?.cuerpo?.ciudad === "Temuco"), check("Elimina solo a Elena y confirma su ausencia", (_, r) => { const d = r.respuestas.findIndex(x => x.metodo === "DELETE" && x.url === "/estudiantes/5" && x.status === 204); return d >= 0 && r.respuestas.slice(d + 1).some(x => x.metodo === "GET" && x.url === "/estudiantes/5" && x.status === 404) && JSON.stringify(r.datos.estudiantes) === JSON.stringify(globalThis.ApiLab.datosIniciales().estudiantes); })])
  ] };

  function buildSql(course) {
    return { title: "Reportes aplicados", description: "Agrupaciones, indicadores y relaciones con filtros", modules: sqlSpecs.map(s => {
      const expected = globalThis.StarterRuntime.runSql(s.solution);
      if (expected.error) throw new Error(s.title + ": " + expected.error);
      const sort = s.short === "JOIN con filtro" ? "estudiante" : s.short === "GROUP BY" ? "nivel" : "categoria";
      return lesson(s.title, s.short, s.intro, s.explanation,
        [s.explanation, "La consulta solo lee las tablas de práctica.", "Comprueba columnas, filas y orden."], s.goal,
        "SELECT * FROM " + (sort === "estudiante" ? "estudiantes" : "cursos") + ";", s.solution, s.hints,
        [check("Ejecuta una consulta válida", (_, r) => !r.error), check("Devuelve las columnas y los valores esperados", (_, r) => course.matchesResult(r, expected)), check("Presenta el orden solicitado", (_, r) => !r.error && r.rows.length === expected.rows.length && r.rows.every((row, i) => row[sort] === expected.rows[i][sort]))],
        { paragraphs: [s.explanation, s.mistake], steps: s.steps, worked: s.worked, workedCopy: "Observa el mismo concepto aplicado a otra selección de datos.", expected, expectedCopy: s.goal, orderBy: sort,
          mistakes: [["Una consulta válida puede responder otra pregunta", s.mistake]], question: s.question, answer: s.answer });
    }) };
  }

  const examSpecs = {
    "html-css": [
      ["¿Qué conecta un label con su input?", ["El mismo color", "for e id coincidentes", "El placeholder", "El tamaño de fuente"], 1, "for referencia el id del control; el texto de label permanece visible al escribir."],
      ["¿Qué aporta scope=col en un th?", ["Oculta la columna", "Ordena los datos", "Indica que es encabezado de columna", "Cambia el ancho"], 2, "scope expresa la relación del encabezado con sus celdas."],
      ["¿Qué compruebas al navegar con Tab?", ["Que el foco sea visible", "Que haya animaciones", "Que el ratón cambie", "Que todo sea azul"], 0, "El indicador permite saber qué control recibirá la siguiente acción."],
      ["¿Dónde va summary?", ["Dentro de input", "Fuera de la página", "En un comentario", "Como primer elemento de details"], 3, "summary proporciona el título interactivo del desplegable."],
      ["¿Qué hace required en un input email?", ["Envía correos", "Impide un envío vacío en la validación nativa", "Crea una cuenta", "Cifra la dirección"], 1, "required y type=email ayudan al formulario; la validación del servidor sigue siendo otra responsabilidad."]
    ],
    javascript: [
      ["¿Qué devuelve trim()?", ["El texto sin espacios en los extremos", "Un arreglo", "El texto sin espacios internos", "Un número"], 0, "trim crea otro texto y conserva sus espacios interiores."],
      ["¿Dónde debe ir el return de ausencia en una búsqueda con ciclo?", ["Antes del ciclo", "Siempre en la primera vuelta", "Después de terminar de buscar", "Fuera de la función"], 2, "Si devuelves ausencia demasiado pronto, no examinas el resto de la lista."],
      ["¿Con qué valor comienza normalmente una suma acumulada?", ["Uno", "Cero", "El último dato", "Una cadena vacía"], 1, "Cero es el valor neutro de la suma."],
      ["¿Qué incluye horas <= 6?", ["Solo seis", "Solo mayores que seis", "Todos los cursos", "Seis y los valores menores"], 3, "El signo igual incluye el límite."],
      ["¿Qué arreglo debes sumar para reportar cursos filtrados?", ["El catálogo sin filtrar", "El resultado del filtro", "Solo sus nombres", "Ninguno"], 1, "El indicador debe calcularse sobre el conjunto que responde la misión."]
    ],
    sql: [
      ["¿Qué hace GROUP BY nivel?", ["Borra niveles repetidos", "Ordena siempre", "Forma grupos con el mismo nivel", "Añade una tabla"], 2, "Las funciones de resumen se calculan dentro de cada grupo."],
      ["¿Qué mide AVG(duracion)?", ["Duración media", "Cantidad de cursos", "Total de inscritos", "Duración máxima"], 0, "El promedio conserva la unidad de la columna: horas."],
      ["¿Cuándo actúa WHERE respecto de GROUP BY?", ["Después de imprimir", "Después de promediar siempre", "No pueden combinarse", "Filtra las filas antes de agrupar"], 3, "Los grupos se forman con las filas que sobrevivieron a WHERE."],
      ["¿Qué relación conecta cada estudiante con su curso?", ["estudiantes.id = cursos.id", "estudiantes.curso_id = cursos.id", "Sus nombres iguales", "Su ciudad y categoría"], 1, "curso_id es la referencia al curso, no el identificador del estudiante."],
      ["¿Por qué usar estudiantes.nombre AS estudiante?", ["Para modificar el dato", "Para crear una cuenta", "Para identificar la tabla y nombrar la salida", "Para agrupar automáticamente"], 2, "La calificación evita ambigüedad; el alias nombra la columna del resultado."]
    ],
    git: [
      ["¿Qué compara git diff --staged?", ["Lo preparado con el último commit", "Dos remotos", "Solo ramas publicadas", "Archivos ignorados"], 0, "Revisa la instantánea que entraría en el próximo commit."],
      ["¿Publicar una rama integra automáticamente main?", ["Siempre", "Solo con -u", "Sí, si se llama docs", "No; la integración es otro paso"], 3, "push publica referencias; merge integra historias."],
      ["En un pull request, ¿qué rama recibe la propuesta?", ["La comparación", "La base", "Todas", "Ninguna"], 1, "Comprueba que la base sea la rama donde quieres incorporar los commits."],
      ["¿Qué hace un archivo sin seguimiento que nunca se confirma?", ["Se sube con push", "Se borra al publicar", "Permanece fuera de los commits publicados", "Se cifra"], 2, "Git publica commits y sus archivos, no todo el directorio de trabajo."],
      ["¿Este laboratorio crea un pull request real?", ["Sí, al hacer merge", "No; explica el flujo y simula Git local y remoto", "Sí, con status", "Sí, si existe origin"], 1, "Abrir y revisar el pull request ocurre en GitHub real; el simulador no se conecta."]
    ],
    apis: [
      ["¿Cómo añades otro parámetro tras ?q=python?", ["Con otro ?", "Con una coma", "Con &", "Con un espacio"], 2, "Los pares de parámetros se separan con &."],
      ["¿Por qué conservar orden=id al cambiar de página?", ["Para particionar con un criterio consistente", "Para autenticar", "Para borrar duplicados en el servidor", "Para cambiar el total"], 0, "Las dos páginas deben recorrer el mismo orden de resultados."],
      ["¿Qué indica 415 en esta API?", ["Token correcto", "Recurso creado", "Ruta vacía", "Tipo de contenido no admitido"], 3, "Revisa Content-Type y que el cuerpo corresponda al formato esperado."],
      ["¿Qué distingue id de curso_id en un estudiante?", ["Son siempre iguales", "Uno identifica al estudiante y el otro referencia al curso", "Ambos son nombres", "No tienen función"], 1, "Usar el identificador de otra entidad puede modificar un recurso equivocado."],
      ["Tras eliminar un estudiante, ¿qué confirma su ausencia?", ["GET del mismo id devuelve 404", "GET de cualquier curso", "POST de otro estudiante", "Un token distinto"], 0, "La verificación debe consultar el recurso que acabas de eliminar."]
    ]
  };
  function apply(courses) {
    const examples = {
      javascript: ['const texto = " React ";\nconsole.log(texto.trim().toLowerCase());', 'function buscarId(lista, id) {\n  for (const item of lista) {\n    if (item.id === id) return item.nombre;\n  }\n  return "No encontrado";\n}', 'const valores = [1, 0, 2];\nlet suma = 0;\nfor (const valor of valores) suma += valor;\nconsole.log(suma);', 'const notas = [3, 5, 7];\nconst aprobadas = notas.filter(nota => nota >= 4);\nconsole.log(aprobadas.join(", "));'],
      "html-css": ['<label for="nombre">Nombre</label>\n<input id="nombre" name="nombre" required>', '<table>\n<caption>Agenda</caption>\n<thead><tr><th scope="col">Día</th></tr></thead>\n<tbody><tr><td>Lunes</td></tr></tbody>\n</table>', '<style>\n.enlace:focus-visible { outline: 2px solid blue; outline-offset: 3px; }\n</style>\n<a class="enlace" href="#ayuda">Ver ayuda</a>', '<details><summary>¿Cómo practico?</summary><p>Lee el ejemplo y modifica una parte.</p></details>'],
      git: ['git diff\ngit add README.md\ngit diff --staged', 'git switch -c mejora\ngit add README.md\ngit commit -m "Aclara el uso"\ngit push -u origin mejora', 'git switch main\ngit merge mejora\ngit push origin main', 'git status\ngit add README.md\ngit diff --staged'],
      apis: ['GET /cursos?q=sql&orden=duracion', 'GET /cursos?pagina=1&tamano=2&orden=id\n\nGET /cursos?pagina=2&tamano=2&orden=id', 'Content-Type: application/json\n\n{"nombre":"Kotlin","nivel":"Siguiente"}', 'GET /estudiantes/1\n\nGET /cursos/1']
    };
    for (const id of ["html-css", "javascript", "sql", "git", "apis"]) {
      const course = courses[id];
      if (!course || course.levels.length !== 3) continue;
      const level = id === "sql" ? buildSql(course) : extensions[id];
      level.modules.forEach((m, i) => { m.kicker = "Módulo " + (13 + i) + " · " + level.title; m.example = id === "sql" ? m.worked : examples[id][i]; m.file = id === "html-css" ? "index.html" : id === "javascript" ? "practica.js" : id === "sql" ? "consulta-" + (13 + i) + ".sql" : id === "git" ? "Terminal · colaboración simulada" : "peticion.http"; });
      course.levels.push(level);
      course.levels[2].modules[3].success = "Terminaste la integración del tercer nivel. Ya puedes continuar con las cuatro prácticas del nivel siguiente.";
      course.stages = [...(course.stages || ["Conceptos básicos", "Aplicación de fundamentos", "Integración de fundamentos"]), level.title];
      if (id === "sql") course.lessons.push(...level.modules);
      const bank = globalThis.StarterExams.LEVEL_EXAMS[id];
      if (!bank.some(e => e.levelId === 4)) bank.push({ levelId: 4, title: "Mini examen: " + level.title, passing: 4,
        intro: "Repasa las decisiones de este nivel. Necesitas cuatro aciertos de cinco; puedes repetir el examen.",
        questions: examSpecs[id].map(([question, options, answer, explanation]) => ({ question, options, answer, explanation })) });
      if (globalThis.LearningGuidance?.guides[id]) globalThis.LearningGuidance.guides[id].push(...level.modules.map(m => [m.goal, m.explanation]));
    }
  }
  globalThis.CourseExpansion = { apply };
})();

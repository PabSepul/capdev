(() => {
  "use strict";

  const specs = [
    [17,"Nombra columnas para un reporte","Alias con AS","Presentar","SELECT nombre AS curso, duracion AS horas FROM cursos ORDER BY horas DESC;","SELECT categoria AS area, COUNT(*) AS cantidad FROM cursos GROUP BY categoria ORDER BY cantidad DESC;","Devuelve curso y horas para los siete cursos, ordenados desde la mayor duración.",/nombre\s+as\s+curso[\s\S]*duracion\s+as\s+horas/i],
    [18,"Resuelve empates con dos órdenes","Orden múltiple","Ordenar","SELECT nivel, nombre, duracion FROM cursos ORDER BY nivel ASC, duracion DESC;","SELECT categoria, nombre, inscritos FROM cursos ORDER BY categoria ASC, inscritos DESC;","Ordena por nivel ascendente y, dentro de cada nivel, por duración descendente.",/order\s+by\s+nivel\s+asc\s*,\s*duracion\s+desc/i],
    [19,"Excluye filas con NOT","NOT","Filtrar","SELECT nombre, nivel FROM cursos WHERE NOT nivel = 'Inicial' ORDER BY nombre;","SELECT nombre, categoria FROM cursos WHERE NOT categoria = 'Web' ORDER BY nombre;","Muestra los cursos cuyo nivel no sea Inicial, ordenados por nombre.",/where\s+not\s+nivel\s*=\s*'Inicial'/i],
    [20,"Elige alternativas con IN","IN","Filtrar","SELECT nombre, categoria FROM cursos WHERE categoria IN ('Web', 'Datos') ORDER BY nombre;","SELECT nombre, ciudad FROM estudiantes WHERE ciudad IN ('Santiago', 'Concepción') ORDER BY nombre;","Muestra cursos de las categorías Web o Datos, ordenados por nombre.",/categoria\s+in\s*\(\s*'Web'\s*,\s*'Datos'\s*\)/i],

    [21,"Distingue prefijo y sufijo","LIKE dirigido","Texto","SELECT nombre FROM cursos WHERE nombre LIKE 'Datos%' ORDER BY nombre;","SELECT nombre FROM cursos WHERE nombre LIKE '%Python' ORDER BY nombre;","Encuentra los nombres de cursos que comienzan con Datos.",/like\s*'Datos%'/i],
    [22,"Busca una posición con guion bajo","Comodín _","Texto","SELECT nombre FROM estudiantes WHERE nombre LIKE 'A_a';","SELECT nombre FROM estudiantes WHERE nombre LIKE '_race';","Encuentra a Ada usando _ para representar exactamente un carácter.",/like\s*'A_a'/i],
    [23,"Combina intervalo y categoría","BETWEEN con AND","Filtrar","SELECT nombre, duracion FROM cursos WHERE duracion BETWEEN 6 AND 10 AND categoria = 'Web' ORDER BY duracion;","SELECT nombre, duracion FROM cursos WHERE duracion BETWEEN 5 AND 12 AND nivel = 'Inicial' ORDER BY duracion;","Muestra cursos Web entre 6 y 10 horas, incluidos los límites, ordenados por duración.",/between\s+6\s+and\s+10\s+and\s+categoria/i],
    [24,"Agrupa condiciones con paréntesis","AND, OR y paréntesis","Decidir","SELECT nombre, nivel, duracion FROM cursos WHERE (nivel = 'Inicial' OR nivel = 'Siguiente') AND duracion <= 6 ORDER BY nombre;","SELECT nombre, categoria, duracion FROM cursos WHERE (categoria = 'Datos' OR categoria = 'Web') AND duracion >= 8 ORDER BY nombre;","Incluye cursos Iniciales o Siguientes de hasta seis horas. Usa paréntesis para expresar la prioridad.",/where\s*\(\s*nivel[\s\S]*or[\s\S]*\)\s*and\s*duracion\s*<=\s*6/i],

    [25,"Cuenta un conjunto filtrado","COUNT con WHERE","Resumir","SELECT COUNT(*) AS cantidad FROM cursos WHERE nivel = 'Inicial';","SELECT COUNT(*) AS cantidad FROM estudiantes WHERE ciudad = 'Santiago';","Cuenta los cursos de nivel Inicial y llama cantidad al resultado.",/count\s*\(\s*\*\s*\)\s+as\s+cantidad[\s\S]*where\s+nivel/i],
    [26,"Compara los extremos de una selección","MIN y MAX filtrados","Resumir","SELECT MIN(duracion) AS minima, MAX(duracion) AS maxima FROM cursos WHERE categoria = 'Web';","SELECT MIN(horas) AS minima, MAX(horas) AS maxima FROM estudiantes WHERE ciudad = 'Santiago';","Obtén la duración mínima y máxima de los cursos Web.",/min\s*\(\s*duracion\s*\)[\s\S]*max\s*\(\s*duracion\s*\)[\s\S]*where\s+categoria/i],
    [27,"Construye una ficha de indicadores","Varias funciones","Resumir","SELECT COUNT(*) AS cursos, SUM(inscritos) AS personas, AVG(duracion) AS promedio FROM cursos;","SELECT COUNT(*) AS estudiantes, SUM(horas) AS horas, AVG(horas) AS promedio FROM estudiantes;","Resume todo el catálogo con cantidad de cursos, total de inscritos y duración promedio.",/count\s*\([\s\S]*sum\s*\([\s\S]*avg\s*\(/i],
    [28,"Compara promedios por nivel","AVG y GROUP BY","Agrupar","SELECT nivel, AVG(duracion) AS promedio FROM cursos GROUP BY nivel ORDER BY nivel;","SELECT ciudad, AVG(horas) AS promedio FROM estudiantes GROUP BY ciudad ORDER BY ciudad;","Calcula la duración promedio de cada nivel y ordena las filas por nivel.",/avg\s*\(\s*duracion\s*\)[\s\S]*group\s+by\s+nivel/i],

    [29,"Cuenta cursos por categoría","COUNT por grupo","Agrupar","SELECT categoria, COUNT(*) AS cantidad FROM cursos GROUP BY categoria ORDER BY cantidad DESC, categoria ASC;","SELECT ciudad, COUNT(*) AS cantidad FROM estudiantes GROUP BY ciudad ORDER BY cantidad DESC, ciudad ASC;","Cuenta cursos por categoría y muestra primero las categorías con más cursos.",/group\s+by\s+categoria[\s\S]*order\s+by\s+cantidad\s+desc/i],
    [30,"Suma inscripciones por categoría","SUM por grupo","Agrupar","SELECT categoria, SUM(inscritos) AS inscritos FROM cursos GROUP BY categoria ORDER BY inscritos DESC;","SELECT nivel, SUM(inscritos) AS inscritos FROM cursos GROUP BY nivel ORDER BY inscritos DESC;","Suma las inscripciones de cada categoría y ordénalas de mayor a menor.",/sum\s*\(\s*inscritos\s*\)\s+as\s+inscritos[\s\S]*group\s+by\s+categoria/i],
    [31,"Mide el rango de cada categoría","MIN y MAX por grupo","Agrupar","SELECT categoria, MIN(duracion) AS minima, MAX(duracion) AS maxima FROM cursos GROUP BY categoria ORDER BY categoria;","SELECT ciudad, MIN(horas) AS minima, MAX(horas) AS maxima FROM estudiantes GROUP BY ciudad ORDER BY ciudad;","Devuelve la duración mínima y máxima por categoría.",/min\s*\(\s*duracion\s*\)[\s\S]*max\s*\(\s*duracion\s*\)[\s\S]*group\s+by\s+categoria/i],
    [32,"Filtra antes de formar grupos","WHERE antes de GROUP BY","Agrupar","SELECT categoria, COUNT(*) AS cantidad FROM cursos WHERE duracion >= 8 GROUP BY categoria ORDER BY categoria;","SELECT ciudad, SUM(horas) AS horas FROM estudiantes WHERE horas >= 12 GROUP BY ciudad ORDER BY ciudad;","Cuenta por categoría solo los cursos de ocho horas o más.",/where\s+duracion\s*>=\s*8[\s\S]*group\s+by\s+categoria/i],

    [33,"Relaciona con alias breves","JOIN con alias","Relacionar","SELECT e.nombre AS estudiante, c.nombre AS curso FROM estudiantes e JOIN cursos c ON e.curso_id = c.id ORDER BY estudiante;","SELECT e.nombre AS estudiante, c.categoria AS categoria FROM estudiantes e JOIN cursos c ON e.curso_id = c.id ORDER BY estudiante;","Relaciona cada estudiante con el nombre de su curso y ordena por estudiante.",/from\s+estudiantes\s+e\s+join\s+cursos\s+c\s+on\s+e\.curso_id\s*=\s*c\.id/i],
    [34,"Filtra una relación por ciudad","JOIN y WHERE","Relacionar","SELECT e.nombre AS estudiante, c.nombre AS curso FROM estudiantes e JOIN cursos c ON e.curso_id = c.id WHERE e.ciudad = 'Santiago' ORDER BY estudiante;","SELECT e.nombre AS estudiante, c.nombre AS curso FROM estudiantes e JOIN cursos c ON e.curso_id = c.id WHERE e.ciudad = 'Valparaíso' ORDER BY estudiante;","Muestra estudiante y curso de quienes viven en Santiago.",/join\s+cursos[\s\S]*where\s+e\.ciudad\s*=\s*'Santiago'/i],
    [35,"Filtra una relación por curso","JOIN y dato relacionado","Relacionar","SELECT e.nombre AS estudiante, c.nombre AS curso FROM estudiantes e JOIN cursos c ON e.curso_id = c.id WHERE c.nombre = 'Python' ORDER BY estudiante;","SELECT e.nombre AS estudiante, c.nombre AS curso FROM estudiantes e JOIN cursos c ON e.curso_id = c.id WHERE c.categoria = 'Web' ORDER BY estudiante;","Muestra las personas inscritas en Python y el nombre del curso.",/join\s+cursos[\s\S]*where\s+c\.nombre\s*=\s*'Python'/i],
    [36,"Ordena una relación con desempate","JOIN y orden múltiple","Relacionar","SELECT c.nombre AS curso, e.nombre AS estudiante FROM estudiantes e JOIN cursos c ON e.curso_id = c.id ORDER BY curso ASC, estudiante ASC;","SELECT e.ciudad AS ciudad, e.nombre AS estudiante, c.nombre AS curso FROM estudiantes e JOIN cursos c ON e.curso_id = c.id ORDER BY ciudad, estudiante;","Ordena las parejas primero por curso y después por estudiante.",/order\s+by\s+curso\s+asc\s*,\s*estudiante\s+asc/i],

    [37,"Añade contexto de categoría","Tres columnas relacionadas","Reportar","SELECT e.nombre AS estudiante, c.nombre AS curso, c.categoria AS categoria FROM estudiantes e JOIN cursos c ON e.curso_id = c.id ORDER BY estudiante;","SELECT e.nombre AS estudiante, e.ciudad AS ciudad, c.nivel AS nivel FROM estudiantes e JOIN cursos c ON e.curso_id = c.id ORDER BY estudiante;","Devuelve estudiante, curso y categoría para cada inscripción.",/c\.categoria\s+as\s+categoria[\s\S]*join\s+cursos/i],
    [38,"Selecciona dedicación alta","JOIN con filtro numérico","Reportar","SELECT e.nombre AS estudiante, e.horas AS horas, c.nombre AS curso FROM estudiantes e JOIN cursos c ON e.curso_id = c.id WHERE e.horas >= 18 ORDER BY horas DESC;","SELECT e.nombre AS estudiante, e.horas AS horas, c.nombre AS curso FROM estudiantes e JOIN cursos c ON e.curso_id = c.id WHERE e.horas <= 12 ORDER BY horas DESC;","Muestra estudiantes con 18 horas o más, su curso y sus horas, de mayor a menor.",/where\s+e\.horas\s*>=\s*18[\s\S]*order\s+by\s+horas\s+desc/i],
    [39,"Cuenta estudiantes por curso","JOIN, COUNT y GROUP BY","Reportar","SELECT c.nombre AS curso, COUNT(*) AS estudiantes FROM estudiantes e JOIN cursos c ON e.curso_id = c.id GROUP BY c.nombre ORDER BY estudiantes DESC, curso ASC;","SELECT c.categoria AS categoria, COUNT(*) AS estudiantes FROM estudiantes e JOIN cursos c ON e.curso_id = c.id GROUP BY c.categoria ORDER BY estudiantes DESC;","Cuenta las inscripciones existentes por curso y ordénalas por cantidad.",/count\s*\(\s*\*\s*\)[\s\S]*join\s+cursos[\s\S]*group\s+by\s+c\.nombre/i],
    [40,"Resume dedicación por ciudad","GROUP BY sobre estudiantes","Reportar","SELECT ciudad, COUNT(*) AS estudiantes, SUM(horas) AS horas FROM estudiantes GROUP BY ciudad ORDER BY horas DESC;","SELECT ciudad, AVG(horas) AS promedio FROM estudiantes GROUP BY ciudad ORDER BY promedio DESC;","Cuenta estudiantes y suma horas por ciudad; ordena por horas descendentes.",/count\s*\([\s\S]*sum\s*\(\s*horas\s*\)[\s\S]*group\s+by\s+ciudad/i],

    [41,"Calcula el promedio por curso","JOIN, AVG y GROUP BY","Analizar","SELECT c.nombre AS curso, AVG(e.horas) AS promedio FROM estudiantes e JOIN cursos c ON e.curso_id = c.id GROUP BY c.nombre ORDER BY promedio DESC;","SELECT c.categoria AS categoria, AVG(e.horas) AS promedio FROM estudiantes e JOIN cursos c ON e.curso_id = c.id GROUP BY c.categoria ORDER BY promedio DESC;","Calcula las horas promedio de estudiantes por curso.",/avg\s*\(\s*e\.horas\s*\)[\s\S]*group\s+by\s+c\.nombre/i],
    [42,"Compara extremos por curso","JOIN, MIN y MAX","Analizar","SELECT c.nombre AS curso, MIN(e.horas) AS minima, MAX(e.horas) AS maxima FROM estudiantes e JOIN cursos c ON e.curso_id = c.id GROUP BY c.nombre ORDER BY curso;","SELECT c.categoria AS categoria, MIN(e.horas) AS minima, MAX(e.horas) AS maxima FROM estudiantes e JOIN cursos c ON e.curso_id = c.id GROUP BY c.categoria ORDER BY categoria;","Muestra el mínimo y máximo de horas de estudiantes por curso.",/min\s*\(\s*e\.horas\s*\)[\s\S]*max\s*\(\s*e\.horas\s*\)[\s\S]*group\s+by\s+c\.nombre/i],
    [43,"Filtra antes de resumir una relación","WHERE, JOIN y GROUP BY","Analizar","SELECT c.categoria AS categoria, COUNT(*) AS estudiantes FROM estudiantes e JOIN cursos c ON e.curso_id = c.id WHERE e.horas >= 12 GROUP BY c.categoria ORDER BY estudiantes DESC;","SELECT c.nivel AS nivel, SUM(e.horas) AS horas FROM estudiantes e JOIN cursos c ON e.curso_id = c.id WHERE e.ciudad = 'Santiago' GROUP BY c.nivel ORDER BY nivel;","Cuenta por categoría solo estudiantes con doce horas o más.",/where\s+e\.horas\s*>=\s*12[\s\S]*group\s+by\s+c\.categoria/i],
    [44,"Agrupa por dos dimensiones","GROUP BY compuesto","Analizar","SELECT c.nivel AS nivel, e.ciudad AS ciudad, COUNT(*) AS estudiantes FROM estudiantes e JOIN cursos c ON e.curso_id = c.id GROUP BY c.nivel, e.ciudad ORDER BY nivel, ciudad;","SELECT c.categoria AS categoria, e.ciudad AS ciudad, SUM(e.horas) AS horas FROM estudiantes e JOIN cursos c ON e.curso_id = c.id GROUP BY c.categoria, e.ciudad ORDER BY categoria, ciudad;","Cuenta estudiantes por combinación de nivel y ciudad.",/group\s+by\s+c\.nivel\s*,\s*e\.ciudad/i],

    [45,"Entrega un resumen de cursos iniciales","Reporte filtrado","Proyecto","SELECT categoria, COUNT(*) AS cursos, SUM(inscritos) AS inscritos, AVG(duracion) AS promedio FROM cursos WHERE nivel = 'Inicial' GROUP BY categoria ORDER BY inscritos DESC;","SELECT categoria, COUNT(*) AS cursos, MIN(duracion) AS minima, MAX(duracion) AS maxima FROM cursos WHERE nivel = 'Inicial' GROUP BY categoria ORDER BY categoria;","Resume por categoría los cursos Iniciales con cantidad, inscritos y duración promedio.",/where\s+nivel\s*=\s*'Inicial'[\s\S]*group\s+by\s+categoria/i],
    [46,"Analiza estudiantes de rutas web","JOIN con reglas combinadas","Proyecto","SELECT e.nombre AS estudiante, c.nombre AS curso, e.horas AS horas FROM estudiantes e JOIN cursos c ON e.curso_id = c.id WHERE c.categoria = 'Web' AND e.horas >= 9 ORDER BY horas DESC;","SELECT e.nombre AS estudiante, c.nombre AS curso FROM estudiantes e JOIN cursos c ON e.curso_id = c.id WHERE c.nivel = 'Inicial' AND e.ciudad = 'Santiago' ORDER BY estudiante;","Muestra estudiantes de cursos Web con nueve horas o más, de mayor a menor dedicación.",/where\s+c\.categoria\s*=\s*'Web'\s+and\s+e\.horas\s*>=\s*9/i],
    [47,"Compara demanda y dedicación","Indicadores relacionados","Proyecto","SELECT c.categoria AS categoria, SUM(c.inscritos) AS catalogo, AVG(e.horas) AS dedicacion FROM estudiantes e JOIN cursos c ON e.curso_id = c.id GROUP BY c.categoria ORDER BY catalogo DESC;","SELECT c.nivel AS nivel, SUM(c.inscritos) AS catalogo, AVG(e.horas) AS dedicacion FROM estudiantes e JOIN cursos c ON e.curso_id = c.id GROUP BY c.nivel ORDER BY nivel;","Por categoría, muestra la suma de inscritos del catálogo relacionado y el promedio de horas de estudiantes.",/sum\s*\(\s*c\.inscritos\s*\)[\s\S]*avg\s*\(\s*e\.horas\s*\)[\s\S]*group\s+by\s+c\.categoria/i],
    [48,"Audita las referencias disponibles","Relación verificable","Proyecto","SELECT e.curso_id AS curso_id, c.nombre AS curso, COUNT(*) AS estudiantes FROM estudiantes e JOIN cursos c ON e.curso_id = c.id GROUP BY e.curso_id, c.nombre ORDER BY curso_id;","SELECT c.categoria AS categoria, COUNT(*) AS estudiantes FROM estudiantes e JOIN cursos c ON e.curso_id = c.id GROUP BY c.categoria ORDER BY categoria;","Lista cada curso referenciado por estudiantes con su id, nombre y cantidad de relaciones.",/e\.curso_id\s+as\s+curso_id[\s\S]*group\s+by\s+e\.curso_id\s*,\s*c\.nombre/i],

    [49,"Construye un panel del catálogo","Proyecto de catálogo","Proyecto final","SELECT nivel, COUNT(*) AS cursos, SUM(inscritos) AS inscritos, AVG(duracion) AS duracion FROM cursos GROUP BY nivel ORDER BY inscritos DESC;","SELECT categoria, COUNT(*) AS cursos, SUM(inscritos) AS inscritos, AVG(duracion) AS duracion FROM cursos GROUP BY categoria ORDER BY inscritos DESC;","Construye un panel por nivel con cantidad de cursos, inscritos y duración promedio, ordenado por inscritos.",/select\s+nivel[\s\S]*count\s*\([\s\S]*sum\s*\([\s\S]*avg\s*\([\s\S]*group\s+by\s+nivel/i],
    [50,"Entrega un informe de aprendizaje","Proyecto integrador 50","Proyecto final","SELECT c.nombre AS curso, COUNT(*) AS estudiantes, SUM(e.horas) AS horas, AVG(e.horas) AS promedio FROM estudiantes e JOIN cursos c ON e.curso_id = c.id GROUP BY c.nombre ORDER BY horas DESC, curso ASC;","SELECT c.categoria AS categoria, COUNT(*) AS estudiantes, SUM(e.horas) AS horas, AVG(e.horas) AS promedio FROM estudiantes e JOIN cursos c ON e.curso_id = c.id GROUP BY c.categoria ORDER BY horas DESC;","Entrega un informe por curso con estudiantes, horas totales y promedio, ordenado por horas y nombre.",/count\s*\([\s\S]*sum\s*\(\s*e\.horas\s*\)[\s\S]*avg\s*\(\s*e\.horas\s*\)[\s\S]*group\s+by\s+c\.nombre/i]
  ];

  const levelMeta = [
    ["Consultas precisas","Alias, orden y exclusiones"], ["Patrones y lógica","Búsquedas y condiciones compuestas"],
    ["Indicadores fiables","Resúmenes filtrados y promedios"], ["Reportes agrupados","Conteos, sumas y rangos por grupo"],
    ["Relaciones entre tablas","JOIN, filtros y orden"], ["Reportes relacionados","Contexto, conteos y dedicación"],
    ["Análisis multidimensional","Indicadores y grupos compuestos"], ["Casos de análisis","Reportes completos con reglas"],
    ["Proyecto profesional integrado","Paneles del catálogo y aprendizaje"]
  ];

  const check = (label, test) => ({ label, test });
  function makeModule(spec, index, course) {
    const [id,title,shortTitle,topic,solution,worked,goal,syntax] = spec;
    const expected = globalThis.StarterRuntime.runSql(solution);
    const workedResult = globalThis.StarterRuntime.runSql(worked);
    if (expected.error || workedResult.error) throw new Error(`SQL, módulo ${id}: ${expected.error || workedResult.error}`);
    const next = specs[index + 1];
    const mainIdea = shortTitle.toLowerCase();
    return {
      id, kicker: `Módulo ${String(id).padStart(2,"0")} · ${topic}`, title, shortTitle,
      duration: id >= 49 ? "32 min" : "20 min", difficulty: id >= 49 ? "Proyecto final" : "Avanzado",
      intro: `Usarás ${mainIdea} para convertir una pregunta concreta sobre la academia en un resultado que otra persona pueda revisar.`,
      example: worked,
      explanation: `Esta consulta combina ${mainIdea} con las cláusulas ya conocidas. Lee primero FROM y JOIN, después WHERE y GROUP BY, y termina comprobando SELECT, ORDER BY y LIMIT cuando aparezcan.`,
      paragraphs: [
        `Esta práctica profundiza en ${mainIdea}. Cada cláusula responde una parte distinta de la pregunta; cambiarla puede producir una tabla válida que significa otra cosa.`,
        "Compara siempre los encabezados, la cantidad de filas y el orden con la misión. El laboratorio trabaja sobre cursos y estudiantes ficticios y solo ejecuta consultas SELECT.",
        "Si la consulta falla, revisa nombres de columnas, comillas, comas, alias y el orden de las cláusulas antes de cambiar la lógica."
      ],
      concepts: [`${shortTitle} responde una parte explícita de la pregunta.`, "El resultado debe conservar columnas y filas verificables.", "SELECT consulta los datos sin modificarlos."],
      goal, file: `consulta-${String(id).padStart(2,"0")}.sql`,
      starter: "SELECT *\nFROM cursos;", solution,
      hints: [
        `Identifica en la misión dónde necesitas ${mainIdea}.`,
        "Escribe primero FROM y JOIN si corresponde; agrega después WHERE y GROUP BY.",
        `Compara con esta estructura y adapta sus nombres: ${solution}`
      ],
      checks: [
        check(`Usa ${shortTitle} como pide la misión`, code => syntax.test(String(code))),
        check(`Devuelve ${expected.rows.length} filas y las columnas esperadas`, (_, result) => !result.error && result.rows.length === expected.rows.length && result.columns.length === expected.columns.length && expected.columns.every(column => result.columns.includes(column))),
        check("Obtiene los valores y el orden de referencia", (_, result) => !result.error && result.text === expected.text)
      ],
      success: next ? `Construiste un reporte verificable. El siguiente módulo aplicará esta base en «${next[1]}».` : "Completaste cincuenta módulos de SQL con un informe integrado y verificable.",
      steps: [
        ["Origen", "Lee FROM y JOIN para saber qué filas pueden participar."],
        ["Reglas", "Sigue WHERE y GROUP BY para entender qué se filtra y qué representa cada fila."],
        ["Salida", "Comprueba SELECT y ORDER BY contra los encabezados y el orden visibles."]
      ],
      worked, workedCopy: `Ejemplo completo de ${mainIdea}. Antes de ejecutarlo, predice sus columnas y el número posible de filas.`,
      expected, expectedCopy: goal,
      mistakes: [
        ["La consulta ejecuta, pero responde otra pregunta", "Compara cada filtro, agrupación y dirección de orden con las palabras exactas de la misión."],
        ["Aparece una columna ambigua o inexistente", "Usa el diccionario visible y califica con el alias de tabla cuando cursos y estudiantes comparten un nombre."]
      ],
      question: `Antes de ejecutar «${shortTitle}», ¿qué representa una fila del resultado y qué cláusula decide esa unidad?`,
      answer: `Una fila representa la selección o el grupo definido por la consulta. En este ejemplo, ${mainIdea} ayuda a determinar qué datos se presentan y cómo se comprueban.`,
      lesson: {
        prerequisites: index === 0 ? "Haber completado los dieciséis módulos iniciales de SQL." : `Haber completado el módulo anterior: ${specs[index - 1][1]}.`,
        walkthrough: ["Ubica primero las tablas y su relación.", "Sigue los filtros y agrupaciones en orden lógico.", "Contrasta encabezados, filas, valores y orden con la predicción."],
        prediction: `¿Qué columnas y cuántas filas esperas al ejecutar el ejemplo de «${shortTitle}»?`,
        answer: `El ejemplo devuelve ${workedResult.rows.length} filas y las columnas ${workedResult.columns.join(", ")}. La combinación de cláusulas produce esa forma.`,
        reflection: "Cambia un límite o filtro del ejemplo y anticipa qué filas deberían entrar o salir antes de ejecutar.",
        extension: "Añade un segundo criterio de orden o adapta el filtro a otra categoría sin cambiar el significado principal del reporte.",
        feedback: ["Revisa la cláusula principal y su posición.", "Compara los encabezados y la cantidad de filas.", "Revisa valores, alias y dirección del orden."]
      }
    };
  }

  const levels = [];
  const exams = [];
  function build(course) {
    if (levels.length) return;
    for (let levelIndex = 0; levelIndex < levelMeta.length; levelIndex += 1) {
      const start = levelIndex * 4;
      const part = specs.slice(start, start + (levelIndex === 8 ? 2 : 4));
      const modules = part.map((spec, localIndex) => makeModule(spec, start + localIndex, course));
      const [title,description] = levelMeta[levelIndex];
      levels.push({ title, description, modules,
        completionTitle: `Finalizaste ${title.toLowerCase()} de SQL.`,
        completionCopy: levelIndex < 8 ? `Completaste ${modules.length} módulos conectados. Rinde el mini examen y continúa cuando estés listo.` : "Completaste los dos proyectos integradores. Rinde el examen final y repasa cualquier reporte que todavía no puedas explicar.",
        approvedCopy: levelIndex < 8 ? `Aprobaste ${title.toLowerCase()}.` : "Aprobaste el nivel final y completaste cincuenta módulos de SQL."
      });
      const questions = Array.from({length:5}, (_, questionIndex) => {
        if (questionIndex === 4) return { question: `¿Cómo compruebas un reporte de ${title.toLowerCase()}?`, options: ["Columnas, filas, valores y orden","Solo que no muestre error","La cantidad de palabras SQL","Cambiar filtros al azar"], answer: 0, explanation: "Una consulta válida aún puede responder otra pregunta; la forma y el contenido del resultado aportan la evidencia." };
        const module = modules[questionIndex % modules.length];
        const correct = module.concepts[0];
        const options = [correct,"La consulta modifica las tablas originales","El orden de las cláusulas es indiferente","Una fila siempre representa un curso"];
        const shift = questionIndex % 4;
        const rotated = options.slice(shift).concat(options.slice(0,shift));
        return { question: `¿Qué idea corresponde a «${module.shortTitle}»?`, options: rotated, answer: rotated.indexOf(correct), explanation: `${correct} ${module.explanation}` };
      });
      exams.push({ levelId: levelIndex + 5, title: `Mini examen: ${title}`, passing: 4, intro: `Repasa ${title.toLowerCase()}. Necesitas cuatro respuestas correctas de cinco.`, questions });
    }
  }

  function apply() {
    const course = globalThis.SQLCourse;
    if (!course) return;
    if (course.levels.length === 3) globalThis.CourseExpansion?.apply({ sql: course });
    if (course.levels.length !== 4) return;
    build(course);
    course.levels.push(...levels);
    course.lessons.push(...levels.flatMap(level => level.modules));
    course.stages = [...course.stages, ...levels.map(level => level.title)];
    const bank = globalThis.StarterExams?.LEVEL_EXAMS?.sql;
    if (bank) for (const exam of exams) if (!bank.some(item => item.levelId === exam.levelId)) bank.push(exam);
  }

  apply();
  globalThis.SqlFiftyCourse = Object.freeze({ levels, exams, apply });
})();

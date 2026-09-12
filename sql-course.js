(() => {
  "use strict";

  const runtime = globalThis.StarterRuntime;

  // Se mantienen los índices 0–11 y las claves v2 para conservar módulos y exámenes aprobados.
  const lessons = [
    {
      title: "De una tabla a tu primera consulta", shortTitle: "SELECT y FROM", duration: "15 min",
      intro: "La academia tiene siete cursos. Antes de filtrar o calcular, vamos a pedir solamente sus nombres y niveles.",
      example: "SELECT columna_1, columna_2\nFROM tabla;",
      paragraphs: [
        "Una fila representa un curso completo; una columna representa una característica que todos los cursos comparten. Pedir dos columnas no significa pedir dos cursos: veremos esas dos características de cada una de las siete filas.",
        "SELECT indica qué columnas quieres ver y FROM dónde buscarlas. Separa los nombres de columnas con comas, pero no pongas una coma justo antes de FROM. El punto y coma cierra la consulta. Los saltos de línea ayudan a leer; no cambian el resultado.",
        "Escribimos SELECT y FROM en mayúsculas por legibilidad. nombre, nivel y cursos son nombres que ya existen en nuestra base, no palabras que puedas inventar. SELECT * FROM cursos muestra todas las columnas y sirve para explorar antes de elegir."
      ],
      concepts: ["Tabla: cursos. Cada fila es un curso.", "Columnas solicitadas: nombre y nivel.", "SELECT lee; no modifica la tabla original."],
      steps: [
        ["FROM cursos", "El origen es la tabla cursos: contiene siete filas, una por curso."],
        ["SELECT nombre, duracion", "De cada fila elegimos dos datos: cómo se llama el curso y cuántas horas dura."],
        [";", "Cerramos la consulta. Al ejecutarla aparecen siete filas, pero solo las dos columnas solicitadas."]
      ],
      worked: "SELECT nombre, duracion\nFROM cursos;",
      workedCopy: "Este ejemplo pide nombre y duración. Observa que quitar columnas no quita cursos.",
      goal: "Ahora muestra nombre y nivel de los siete cursos. Usa el ejemplo como guía, pero cambia la segunda columna.",
      starter: "SELECT nombre\nFROM cursos;",
      solution: "SELECT nombre, nivel FROM cursos;", syntax: /\bselect\b[\s\S]*\bfrom\s+cursos\b/i,
      syntaxLabel: "Selecciona datos de cursos con SELECT y FROM", expectedCopy: "7 filas: el nombre y el nivel de cada curso",
      hints: ["Observa los encabezados de cursos: nombre y nivel son dos columnas diferentes.", "Después de SELECT puedes pedir varias columnas separadas por coma.", "Cambia la primera línea por SELECT nombre, nivel. Conserva FROM cursos; debajo."],
      mistakes: [["SELECT nombre nivel", "Falta una coma. El laboratorio puede interpretar nivel como un alias de nombre; no sería una segunda columna."], ["FROM curso", "La tabla se llama cursos, en plural. Copia los nombres del diccionario de datos."]],
      question: "Si SELECT pide dos columnas, ¿cuántas filas debería devolver aquí?", answer: "Siete: una por curso. Elegir columnas cambia el ancho del resultado, no cuántos registros hay.",
      success: "Distingues filas de columnas y puedes construir una consulta completa."
    },
    {
      title: "Descubre categorías sin repeticiones", shortTitle: "DISTINCT", duration: "15 min",
      intro: "Hay siete cursos, pero varias categorías se repiten. Queremos conocer las categorías disponibles, no enumerar todos los cursos.",
      example: "SELECT DISTINCT columna\nFROM tabla;",
      paragraphs: [
        "Sin DISTINCT obtienes un valor por cada fila. Si tres cursos pertenecen a Web, Web aparece tres veces. DISTINCT deja una sola copia de cada combinación de valores seleccionados en el resultado.",
        "No borra duplicados de la tabla original. Si seleccionas categoria sola, comparas categorías. Si seleccionas categoria y nombre, comparas parejas: como cada nombre es distinto, las categorías pueden volver a repetirse."
      ],
      concepts: ["DISTINCT va después de SELECT.", "Elimina repeticiones del resultado, no de los datos guardados.", "La comparación usa todas las columnas seleccionadas."],
      steps: [["FROM cursos", "Partimos de los siete cursos."], ["SELECT nivel", "Leemos el nivel de cada curso: Inicial se repite cuatro veces."], ["DISTINCT", "Dejamos Inicial, Siguiente y Avanzado una sola vez cada uno."]],
      worked: "SELECT DISTINCT nivel\nFROM cursos;", workedCopy: "Aquí reducimos los siete niveles registrados a los tres valores diferentes que existen.",
      goal: "Consulta solamente categoria y muestra sus cuatro valores diferentes, sin repeticiones.",
      starter: "SELECT categoria\nFROM cursos;", solution: "SELECT DISTINCT categoria FROM cursos;",
      syntax: /\bselect\s+distinct\b/i, syntaxLabel: "Usa SELECT DISTINCT", expectedCopy: "4 categorías diferentes; ninguna repetida",
      hints: ["Ejecuta el inicio y observa cuántas veces aparece Web.", "La palabra DISTINCT se coloca justo después de SELECT.", "Usa SELECT DISTINCT categoria y conserva FROM cursos;. No agregues nombre."],
      mistakes: [["SELECT DISTINCT nombre, categoria", "Cada curso tiene un nombre diferente, así que las parejas no se repiten. Selecciona solo categoria para responder esta misión."], ["Pensar que desaparecieron cursos", "La tabla cursos sigue teniendo siete filas. Solo simplificamos la tabla de resultados."]],
      question: "¿Por qué DISTINCT nivel devuelve tres filas y no siete?", answer: "Porque solo existen tres niveles distintos, aunque varios cursos compartan uno de ellos.",
      success: "Puedes distinguir cantidad de registros de cantidad de valores diferentes."
    },
    {
      title: "Elige filas con una condición", shortTitle: "WHERE", duration: "16 min",
      intro: "Una persona quiere comenzar desde cero. Necesitamos mostrarle únicamente los cursos cuyo nivel es Inicial.",
      example: "SELECT columnas\nFROM tabla\nWHERE columna = 'texto';",
      paragraphs: [
        "WHERE evalúa una condición en cada fila. Si se cumple, la fila sigue en el resultado; si no, queda fuera. Aquí nivel = 'Inicial' conserva Python, HTML y CSS, JavaScript y SQL, y descarta los otros tres cursos.",
        "Las comillas simples indican un valor de texto: 'Inicial'. nivel no lleva comillas porque es el nombre de una columna. Puedes filtrar por una columna sin mostrarla: decidimos usando nivel, pero enseñamos nombre y duracion."
      ],
      concepts: ["SELECT elige columnas; WHERE elige filas.", "Los textos van entre comillas simples.", "Un resultado vacío no significa necesariamente un error."],
      steps: [["FROM cursos", "La búsqueda empieza en los siete cursos."], ["WHERE categoria = 'Web'", "Conservamos HTML y CSS, JavaScript y APIs porque su categoría coincide."], ["SELECT nombre, duracion", "De esas tres filas mostramos nombre y duración; la categoría no necesita verse."]],
      worked: "SELECT nombre, duracion\nFROM cursos\nWHERE categoria = 'Web';", workedCopy: "El ejemplo filtra por categoría. Tu ejercicio hará lo mismo, pero usando el nivel.",
      goal: "Muestra nombre y duracion de los cuatro cursos con nivel igual a 'Inicial'.",
      starter: "SELECT nombre, duracion\nFROM cursos;", solution: "SELECT nombre, duracion FROM cursos WHERE nivel = 'Inicial';",
      syntax: /\bwhere\s+nivel\s*=\s*'Inicial'/i, syntaxLabel: "Filtra nivel = 'Inicial' con WHERE", expectedCopy: "4 cursos iniciales con sus duraciones",
      hints: ["La columna que decide si una fila pasa es nivel.", "Agrega WHERE nivel = 'Inicial' antes del punto y coma.", "La consulta empieza con SELECT nombre, duracion y FROM cursos. La condición va después."],
      mistakes: [["WHERE nivel = Inicial", "Sin comillas, Inicial se interpreta como el nombre de otra columna. El valor de texto debe ser 'Inicial'."], ["Una tabla vacía", "Comprueba el texto y la condición: una consulta válida puede no encontrar ninguna coincidencia."]],
      question: "¿Necesitas incluir nivel en SELECT para poder filtrar por nivel?", answer: "No. WHERE puede consultar esa columna aunque SELECT muestre solo nombre y duracion.",
      success: "Ya puedes responder una pregunta seleccionando solo las filas relevantes."
    },
    {
      title: "Combina condiciones sin confundir AND y OR", shortTitle: "Comparar y combinar", duration: "20 min",
      intro: "Ahora la persona busca un curso inicial que dure más de seis horas. Una sola condición ya no alcanza.",
      example: "WHERE nivel = 'Inicial'\n  AND duracion > 6",
      paragraphs: [
        "AND exige que se cumplan las dos condiciones. Python pasa porque es Inicial y dura 12 horas; HTML y CSS no pasa porque dura exactamente 6. El símbolo > significa más de, no más de o igual a. Para incluir la igualdad utilizarías >=.",
        "OR permite que se cumpla al menos una condición. Con AND acotas una selección; con OR puedes reunir alternativas. Si mezclas conectores, usa paréntesis para mostrar qué condiciones van juntas. Los números como 6 no necesitan comillas."
      ],
      concepts: ["> excluye el límite; >= lo incluye.", "AND exige ambas condiciones; OR admite al menos una.", "Los paréntesis hacen explícita la agrupación."],
      steps: [["nivel = 'Inicial'", "Cuatro cursos cumplen esta primera condición."], ["duracion <= 6", "De esos cuatro, HTML y CSS (6) y SQL (5) también cumplen el límite del ejemplo."], ["AND", "Solo conservamos las filas que cumplieron las dos pruebas."]],
      worked: "SELECT nombre, duracion\nFROM cursos\nWHERE nivel = 'Inicial'\n  AND duracion <= 6;", workedCopy: "El ejemplo busca los iniciales cortos. Tu misión busca los que superan ese límite.",
      goal: "Muestra nombre y duracion de los cursos iniciales que duren más de 6 horas: Python y JavaScript.",
      starter: "SELECT nombre, duracion\nFROM cursos\nWHERE nivel = 'Inicial';", solution: "SELECT nombre, duracion FROM cursos WHERE nivel = 'Inicial' AND duracion > 6;",
      syntax: /\bwhere\b[\s\S]*\band\b/i, syntaxLabel: "Combina dos condiciones con AND", expectedCopy: "Python: 12 horas; JavaScript: 8 horas",
      hints: ["La condición de nivel ya está escrita. No la reemplaces: añade otra.", "Más de seis se escribe duracion > 6. El valor 6 debe quedar fuera.", "Une ambas con AND: nivel = 'Inicial' AND duracion > 6."],
      mistakes: [["AND duracion >= 6", "Incluye HTML y CSS, que dura exactamente seis horas. La misión pide más de seis."], ["nivel = 'Inicial' OR duracion > 6", "Aceptaría cualquier curso inicial o largo, incluso cursos avanzados. Necesitamos cumplir ambas reglas."]],
      question: "¿Por qué APIs, que dura nueve horas, no aparece en la misión?", answer: "Porque su nivel es Siguiente. Cumple la duración, pero no cumple las dos condiciones de AND.",
      success: "Terminaste el primer nivel: ya eliges datos y construyes filtros precisos."
    },
    {
      title: "Busca palabras dentro de un nombre", shortTitle: "LIKE y comodines", duration: "16 min",
      intro: "Quieres encontrar los cursos relacionados con Python, incluso si su nombre incluye otras palabras.",
      example: "WHERE nombre LIKE '%palabra%'",
      paragraphs: [
        "= compara con un valor completo, pero LIKE permite describir un patrón. El signo % representa cero o más caracteres. '%Python%' encuentra tanto Python como Datos con Python porque permite texto antes y después.",
        "La posición importa: 'Python%' busca nombres que empiezan con Python y '%Python' nombres que terminan así. El patrón completo va entre comillas simples. El comportamiento respecto a mayúsculas puede variar entre motores; aquí se compara sin distinguirlas."
      ],
      concepts: ["LIKE usa un patrón, no una igualdad exacta.", "% admite cualquier cantidad de caracteres, incluso ninguno.", "La posición de % decide dónde puede estar el texto."],
      steps: [["nombre LIKE '%Script%'", "Buscamos Script en cualquier parte del nombre."], ["% antes y después", "Permitimos caracteres alrededor, como Java antes de Script."], ["SELECT nombre, categoria", "Mostramos la coincidencia y la categoría a la que pertenece."]],
      worked: "SELECT nombre, categoria\nFROM cursos\nWHERE nombre LIKE '%Script%';", workedCopy: "El ejemplo encuentra JavaScript sin escribir su nombre completo.",
      goal: "Muestra nombre y categoria de los dos cursos cuyo nombre contiene Python, esté donde esté esa palabra.",
      starter: "SELECT nombre, categoria\nFROM cursos;", solution: "SELECT nombre, categoria FROM cursos WHERE nombre LIKE '%Python%';",
      syntax: /\blike\s*'[^']*%[^']*'/i, syntaxLabel: "Busca con LIKE y comodines", expectedCopy: "Python y Datos con Python, junto a sus categorías",
      hints: ["Busca en la columna nombre, no en categoria.", "Necesitas permitir caracteres antes y después de Python.", "Agrega WHERE nombre LIKE '%Python%' antes del punto y coma."],
      mistakes: [["nombre = '%Python%'", "= busca literalmente los signos %. Para interpretar esos signos como comodines necesitas LIKE."], ["LIKE 'Python%'", "Solo encuentra nombres que empiezan con Python. Datos con Python quedaría fuera."]],
      question: "¿Puede % representar cero caracteres?", answer: "Sí. Por eso '%Python%' también encuentra el nombre exacto Python.",
      success: "Puedes buscar coincidencias sin conocer el texto completo."
    },
    {
      title: "Expresa un intervalo con BETWEEN", shortTitle: "Rangos", duration: "16 min",
      intro: "Tienes entre cinco y nueve horas para estudiar. Busquemos los cursos cuya duración cabe en ese intervalo.",
      example: "WHERE duracion BETWEEN 5 AND 9",
      paragraphs: [
        "BETWEEN pregunta si un valor está dentro de un intervalo cerrado. Incluye ambos extremos: 5 y 9 también cumplen. Es una forma breve de escribir duracion >= 5 AND duracion <= 9.",
        "El AND de BETWEEN une el límite inferior y el superior: forma parte de esta expresión. No confundas un intervalo con una lista de alternativas; para valores específicos como 5, 9 y 14 puedes usar IN (5, 9, 14), que practicarás en la sección adicional."
      ],
      concepts: ["BETWEEN incluye el límite inferior y el superior.", "Escribe primero el límite menor.", "IN expresa alternativas concretas; BETWEEN un intervalo."],
      steps: [["BETWEEN 9 AND 14", "El ejemplo incluye duraciones desde nueve hasta catorce."], ["9, 12 y 14", "APIs, Python y Datos con Python caen en ese intervalo."], ["No incluye 8", "JavaScript está por debajo del límite inferior y no aparece."]],
      worked: "SELECT nombre, duracion\nFROM cursos\nWHERE duracion BETWEEN 9 AND 14;", workedCopy: "Observa que los cursos de exactamente nueve y catorce horas sí aparecen.",
      goal: "Muestra nombre y duracion de los cuatro cursos que duran entre 5 y 9 horas, incluyendo ambos límites.",
      starter: "SELECT nombre, duracion\nFROM cursos;", solution: "SELECT nombre, duracion FROM cursos WHERE duracion BETWEEN 5 AND 9;",
      syntax: /\bbetween\s+5\s+and\s+9/i, syntaxLabel: "Usa BETWEEN 5 AND 9", expectedCopy: "HTML y CSS, JavaScript, SQL y APIs; todas sus duraciones están entre 5 y 9",
      hints: ["El filtro usa la columna duracion y valores numéricos sin comillas.", "El límite menor es 5 y el mayor es 9.", "Escribe WHERE duracion BETWEEN 5 AND 9. No excluyas SQL ni APIs: ambos extremos se incluyen."],
      mistakes: [["BETWEEN 9 AND 5", "Los límites están invertidos. Empieza por el menor."], ["duracion > 5 AND duracion < 9", "Los signos estrictos excluyen los extremos. BETWEEN incluye también 5 y 9."]],
      question: "¿SQL, que dura cinco horas, pasa este filtro?", answer: "Sí. Cinco es el límite inferior y BETWEEN lo incluye.",
      success: "Ya puedes traducir un intervalo de tiempo a una condición precisa."
    },
    {
      title: "Ordena para responder quién tiene más", shortTitle: "ORDER BY", duration: "15 min",
      intro: "La academia quiere ver sus cursos del más popular al menos popular. El dato que representa popularidad es inscritos.",
      example: "ORDER BY columna DESC;",
      paragraphs: [
        "ORDER BY reordena las filas que ya seleccionaste. No agrega ni elimina cursos. ASC ordena los números de menor a mayor; DESC, de mayor a menor. Para ver el curso con más inscritos primero, usamos DESC.",
        "Sin ORDER BY, SQL no garantiza un orden. No interpretes la posición habitual de una fila como una regla de la base de datos. Si hay empates y necesitas un orden exacto, añade una segunda columna: ORDER BY inscritos DESC, nombre ASC."
      ],
      concepts: ["ASC: menor a mayor. DESC: mayor a menor.", "Ordenar no equivale a filtrar.", "La columna de orden depende de la pregunta."],
      steps: [["SELECT nombre, duracion", "El ejemplo muestra los cursos con su duración."], ["ORDER BY duracion ASC", "Ordenamos de menor a mayor número de horas."], ["Primera fila: Git, 4", "La primera fila responde cuál es el curso más corto."]],
      worked: "SELECT nombre, duracion\nFROM cursos\nORDER BY duracion ASC;", workedCopy: "Este ejemplo ordena por tiempo. Tu misión ordenará por número de inscripciones.",
      goal: "Muestra nombre e inscritos de los siete cursos, desde el de más inscritos hasta el de menos inscritos.",
      starter: "SELECT nombre, inscritos\nFROM cursos;", solution: "SELECT nombre, inscritos FROM cursos ORDER BY inscritos DESC;",
      syntax: /\border\s+by\s+inscritos\s+desc/i, syntaxLabel: "Ordena por inscritos DESC", orderBy: "inscritos", expectedCopy: "7 filas ordenadas: HTML y CSS (410) primero y Datos con Python (64) al final",
      hints: ["El campo de popularidad es inscritos, no duracion.", "Necesitas ORDER BY inscritos después de FROM cursos.", "Agrega DESC para que el valor mayor quede primero."],
      mistakes: [["ORDER BY inscritos ASC", "Muestra primero el curso con menos inscritos. Invierte la dirección con DESC."], ["WHERE inscritos DESC", "WHERE decide qué filas pasan; no las ordena. Esa tarea corresponde a ORDER BY."]],
      question: "¿Ordenar por inscritos modifica los números de la tabla original?", answer: "No. Solo cambia la presentación de las filas devueltas por esta consulta.",
      success: "Puedes elegir el orden que responde a una pregunta concreta."
    },
    {
      title: "Construye un top con ORDER BY y LIMIT", shortTitle: "Top de resultados", duration: "15 min",
      intro: "Ahora solo necesitas los tres cursos más largos. Primero decides qué significa primero y luego recortas el resultado.",
      example: "ORDER BY duracion DESC\nLIMIT 3;",
      paragraphs: [
        "LIMIT establece cuántas filas como máximo quieres recibir. Por sí solo no expresa cuáles son las mejores o más largas; esa decisión la toma ORDER BY. Un top de duración requiere ordenar por duracion antes de limitar.",
        "En este laboratorio LIMIT va al final. Con siete cursos y LIMIT 3 verás tres; si el filtro dejara solo dos, verías dos. La sintaxis para limitar filas puede variar en otras bases de datos. Aquí practicamos LIMIT."
      ],
      concepts: ["ORDER BY establece un criterio.", "LIMIT toma las primeras filas de ese resultado.", "Sin orden explícito, un límite no define un ranking fiable."],
      steps: [["ORDER BY inscritos DESC", "El ejemplo empieza por el curso con más inscritos."], ["LIMIT 2", "Conserva solo los dos primeros después de ordenar."], ["HTML y CSS; Python", "Son los dos cursos con más inscripciones, no necesariamente los más largos."]],
      worked: "SELECT nombre, inscritos\nFROM cursos\nORDER BY inscritos DESC\nLIMIT 2;", workedCopy: "Combinamos un criterio y una cantidad. Cambiar cualquiera de los dos cambia la pregunta.",
      goal: "Muestra nombre y duracion de los tres cursos más largos, ordenados de mayor a menor duración.",
      starter: "SELECT nombre, duracion\nFROM cursos\nORDER BY duracion DESC;", solution: "SELECT nombre, duracion FROM cursos ORDER BY duracion DESC LIMIT 3;",
      syntax: /\blimit\s+3\b/i, syntaxLabel: "Limita el resultado a 3 filas", orderBy: "duracion", expectedCopy: "Datos con Python (14), Python (12) y APIs (9), en ese orden",
      hints: ["El código inicial ya ordena de mayor a menor duración.", "Añade el límite después de ORDER BY y antes del punto y coma final.", "La última línea debe ser LIMIT 3;. Deben quedar 14, 12 y 9 horas."],
      mistakes: [["SELECT ... FROM cursos LIMIT 3", "Toma tres filas, pero no garantiza que sean las más largas. Falta el orden."], ["ORDER BY duracion ASC LIMIT 3", "Obtiene las tres duraciones más cortas, la pregunta opuesta."]],
      question: "¿Qué pasaría si cambiaras LIMIT 3 por LIMIT 1?", answer: "Conservarías solo Datos con Python, el curso de mayor duración según ese orden.",
      success: "Terminaste el segundo nivel y ya puedes construir búsquedas y rankings."
    },
    {
      title: "De una lista de filas a un único conteo", shortTitle: "COUNT y alias", duration: "18 min",
      intro: "Hasta ahora mostrábamos cursos. La nueva pregunta es cuántos cursos iniciales ofrece la academia, sin listar sus nombres.",
      example: "SELECT COUNT(*) AS total\nFROM cursos;",
      paragraphs: [
        "COUNT(*) es una función de resumen: cuenta las filas y devuelve un número. El asterisco dentro de COUNT(*) significa contar filas; no es lo mismo que SELECT *, que muestra todas las columnas.",
        "WHERE se aplica antes de contar. Si deja cuatro cursos iniciales, COUNT(*) devuelve 4. AS total pone un nombre legible a la columna calculada. El resultado tiene una fila cuyo valor es 4, no cuatro filas."
      ],
      concepts: ["COUNT(*) cuenta las filas seleccionadas.", "AS cambia el nombre de una columna del resultado.", "Filtrar antes de contar cambia el número final."],
      steps: [["WHERE categoria = 'Web'", "El filtro deja HTML y CSS, JavaScript y APIs."], ["COUNT(*)", "Contamos esas tres filas y las resumimos en el número 3."], ["AS total", "Mostramos ese número en una columna llamada total."]],
      worked: "SELECT COUNT(*) AS total\nFROM cursos\nWHERE categoria = 'Web';", workedCopy: "Tres cursos se convierten en una fila de resumen: total = 3.",
      goal: "Cuenta los cursos de nivel Inicial. Devuelve una sola columna llamada total cuyo valor sea 4.",
      starter: "SELECT nombre\nFROM cursos\nWHERE nivel = 'Inicial';", solution: "SELECT COUNT(*) AS total FROM cursos WHERE nivel = 'Inicial';",
      syntax: /\bcount\s*\(\s*\*\s*\)/i, syntaxLabel: "Cuenta filas con COUNT(*)", expectedCopy: "1 fila de resumen: total = 4",
      hints: ["El filtro ya selecciona los cuatro cursos correctos.", "Sustituye nombre por COUNT(*) para contarlos en vez de listarlos.", "Añade AS total después de COUNT(*) para nombrar la columna."],
      mistakes: [["SELECT *", "Muestra todas las columnas, pero no cuenta filas. Necesitas COUNT(*)."], ["SELECT nombre, COUNT(*)", "Estás mezclando un nombre individual con un conteo general. Por ahora pide solo el conteo; agruparemos más adelante."]],
      question: "Si total vale 4, ¿por qué el resultado tiene solo una fila?", answer: "Porque la fila contiene un resumen de cuatro registros. No representa un curso individual.",
      success: "Entiendes la diferencia entre mostrar registros y obtener una medida resumida."
    },
    {
      title: "Suma y calcula un promedio con sentido", shortTitle: "SUM y AVG", duration: "20 min",
      intro: "La academia quiere conocer el tiempo total que suman sus cursos y cuánto dura un curso en promedio.",
      example: "SELECT AVG(duracion) AS promedio,\n       SUM(duracion) AS total\nFROM cursos;",
      paragraphs: [
        "SUM(duracion) suma 12 + 6 + 8 + 5 + 4 + 9 + 14: el total es 58 horas. AVG(duracion) divide esa suma por las siete duraciones: 58 / 7 ≈ 8.2857. Este laboratorio presenta el promedio redondeado a dos decimales: 8.29.",
        "Son dos preguntas distintas, por eso seleccionamos dos expresiones separadas por coma. Los alias promedio y total indican qué significa cada número. Ninguna función cambia las duraciones originales. MIN y MAX, disponibles en la práctica adicional, encuentran el valor menor y el mayor."
      ],
      concepts: ["SUM suma valores numéricos; COUNT cuenta filas.", "AVG calcula el promedio aritmético.", "El alias aclara el significado del valor calculado."],
      steps: [["WHERE nivel = 'Inicial'", "El ejemplo usa solo las duraciones 12, 6, 8 y 5."], ["SUM(duracion)", "Sumamos 31 horas entre esos cuatro cursos."], ["AVG(duracion)", "Dividimos 31 entre 4: el promedio de los cursos iniciales es 7.75."]],
      worked: "SELECT AVG(duracion) AS promedio,\n       SUM(duracion) AS total\nFROM cursos\nWHERE nivel = 'Inicial';", workedCopy: "El ejemplo resume solo un subconjunto. Tu misión debe considerar la tabla completa.",
      goal: "Para los siete cursos, muestra AVG(duracion) como promedio y SUM(duracion) como total. No apliques filtros.",
      starter: "SELECT duracion\nFROM cursos;", solution: "SELECT AVG(duracion) AS promedio, SUM(duracion) AS total FROM cursos;",
      syntax: /^(?=[\s\S]*\bavg\s*\(\s*duracion\s*\))(?=[\s\S]*\bsum\s*\(\s*duracion\s*\))/i, syntaxLabel: "Calcula AVG y SUM sobre duracion", expectedCopy: "1 fila: promedio = 8.29 horas y total = 58 horas",
      hints: ["Necesitas dos expresiones en SELECT, no una fila por duración.", "Escribe AVG(duracion) AS promedio y SUM(duracion) AS total, separadas por coma.", "Mantén FROM cursos sin WHERE para incluir los siete cursos."],
      mistakes: [["COUNT(duracion)", "Cuenta valores, pero no suma sus horas. Para la suma utiliza SUM."], ["Dejar WHERE nivel = 'Inicial'", "El ejemplo usa ese filtro, pero la misión pide todos los cursos. El filtro cambiaría tanto el total como el promedio."]],
      question: "¿En qué unidad está el promedio: cursos, personas u horas?", answer: "En horas, porque la columna duracion se mide en horas. Conocer la unidad evita interpretar mal un número.",
      success: "Puedes calcular un indicador y explicar qué representa."
    },
    {
      title: "Construye un resumen para cada categoría", shortTitle: "GROUP BY", duration: "22 min",
      intro: "Un conteo total no muestra cómo se reparten los cursos. Vamos a obtener un conteo diferente para cada categoría.",
      example: "SELECT categoria, COUNT(*) AS total\nFROM cursos\nGROUP BY categoria;",
      paragraphs: [
        "GROUP BY reúne en un mismo grupo las filas que comparten un valor. Después, COUNT(*) se calcula por separado dentro de cada grupo. Web agrupa tres cursos; Datos agrupa dos; Lenguajes y Herramientas agrupan uno cada una.",
        "Cada fila del resultado representa una categoría, ya no un curso. Por eso puedes mostrar categoria junto con COUNT(*), pero no el nombre de un curso individual sin decidir cómo agruparlo. Al final, ORDER BY total DESC ordena el reporte usando el alias del conteo."
      ],
      concepts: ["GROUP BY forma grupos de filas.", "Las funciones de resumen se aplican a cada grupo.", "La columna no resumida que seleccionas debe formar parte de la agrupación en estas consultas."],
      steps: [["GROUP BY nivel", "El ejemplo crea tres grupos: Inicial, Siguiente y Avanzado."], ["COUNT(*) AS total", "Contamos 4, 2 y 1 cursos dentro de esos grupos."], ["ORDER BY total DESC", "Presentamos primero el grupo con más cursos."]],
      worked: "SELECT nivel, COUNT(*) AS total\nFROM cursos\nGROUP BY nivel\nORDER BY total DESC;", workedCopy: "Aquí cada fila resume un nivel. En tu ejercicio, la unidad del reporte será una categoría.",
      goal: "Cuenta los cursos por categoria, llama total al conteo y ordena de mayor a menor. Si dos categorías empatan, cualquiera de sus órdenes es válido.",
      starter: "SELECT categoria\nFROM cursos;", solution: "SELECT categoria, COUNT(*) AS total FROM cursos GROUP BY categoria ORDER BY total DESC;",
      syntax: /\bgroup\s+by\s+categoria\b/i, syntaxLabel: "Agrupa por categoria", orderBy: "total", expectedCopy: "Web: 3; Datos: 2; Lenguajes: 1; Herramientas: 1 (los empates pueden intercambiarse)",
      hints: ["Selecciona categoria y COUNT(*) AS total.", "Añade GROUP BY categoria después de FROM cursos.", "Termina con ORDER BY total DESC. El resultado debe tener cuatro filas de categorías, no siete cursos."],
      mistakes: [["SELECT nombre, COUNT(*) ... GROUP BY categoria", "Un grupo Web contiene tres nombres. No hay uno solo que mostrar: selecciona la categoría que identifica el grupo."], ["WHERE total > 1", "total es un alias calculado más tarde. HAVING se usa para filtrar grupos en SQL, pero todavía no está soportado en este laboratorio."]],
      question: "¿Qué representa ahora una fila del resultado?", answer: "Una categoría completa con la cantidad de cursos que pertenecen a ella, no un curso individual.",
      success: "Puedes explicar cómo se pasa de registros individuales a un reporte agrupado."
    },
    {
      title: "Relaciona estudiantes y cursos paso a paso", shortTitle: "JOIN · Proyecto final", duration: "25 min",
      intro: "La tabla estudiantes guarda curso_id, no el nombre del curso. Usaremos esa referencia para encontrar el nombre en la tabla cursos.",
      example: "FROM estudiantes e\nJOIN cursos c ON e.curso_id = c.id",
      paragraphs: [
        "Ada tiene curso_id = 1. En cursos, el registro con id = 1 se llama Python. La condición ON e.curso_id = c.id expresa exactamente esa búsqueda. Al unir, el resultado puede mostrar tanto el nombre de Ada como el de Python en una misma fila.",
        "e y c son alias cortos de las tablas: e.nombre significa nombre del estudiante y c.nombre significa nombre del curso. AS estudiante y AS curso son otra cosa: nombran las columnas que verá quien lee el resultado. Así evitamos dos encabezados llamados nombre.",
        "JOIN aquí es una unión interna: solo conserva parejas que coinciden con ON. En nuestra práctica cada estudiante tiene un curso válido, así que salen ocho filas. No siempre habrá una fila por registro en una unión: depende de cuántas coincidencias existan."
      ],
      concepts: ["curso_id del estudiante apunta al id del curso.", "ON explica qué valores deben coincidir.", "Alias de tabla (e, c) y alias de columna (AS ...) cumplen tareas distintas."],
      steps: [["FROM estudiantes e", "Tomamos los registros de estudiantes y llamamos e a esa tabla dentro de la consulta."], ["JOIN cursos c ON e.curso_id = c.id", "Para Ada, buscamos el curso cuyo id es 1: Python. Repetimos para cada estudiante."], ["SELECT e.nombre AS estudiante, c.nombre AS curso", "De cada pareja mostramos los dos nombres con encabezados diferentes."], ["WHERE e.nombre = 'Ada'", "Solo el ejemplo limita la salida a Ada. En la misión debes mostrar a las ocho personas."]],
      worked: "SELECT e.nombre AS estudiante,\n       c.nombre AS curso\nFROM estudiantes e\nJOIN cursos c ON e.curso_id = c.id\nWHERE e.nombre = 'Ada';", workedCopy: "Sigue una sola relación antes de pensar en las ocho: Ada → curso_id 1 → Python.",
      goal: "Une las dos tablas y devuelve las ocho parejas correctas, con columnas llamadas estudiante y curso. Puedes ordenarlas por estudiante si quieres.",
      starter: "SELECT nombre, curso_id\nFROM estudiantes;", solution: "SELECT e.nombre AS estudiante, c.nombre AS curso FROM estudiantes e JOIN cursos c ON e.curso_id = c.id ORDER BY estudiante;",
      syntax: /\bjoin\s+cursos\b[\s\S]*\bon\b/i, syntaxLabel: "Relaciona cursos mediante JOIN y ON", expectedCopy: "8 parejas estudiante–curso; Ada y Grace estudian Python",
      hints: ["Usa FROM estudiantes e JOIN cursos c para poder distinguir las columnas de cada tabla.", "La relación correcta es ON e.curso_id = c.id, no e.id = c.id.", "Selecciona e.nombre AS estudiante, c.nombre AS curso y no filtres por Ada: necesitamos las ocho personas."],
      mistakes: [["SELECT nombre ... JOIN cursos", "Las dos tablas tienen nombre. Aclara el origen con e.nombre o c.nombre."], ["ON e.id = c.id", "Relaciona el identificador de una persona con el de un curso, que no es la referencia guardada. Usa e.curso_id."]],
      question: "¿Por qué Ada y Grace pueden aparecer con el mismo curso?", answer: "Son dos registros de estudiantes distintos, pero ambos tienen curso_id = 1 y coinciden con Python. Una fila de cursos puede relacionarse con varias personas.",
      success: "Terminaste los doce módulos: puedes construir y explicar un reporte que cruza dos tablas."
    }
  ];

  function matchesResult(actual, expected, orderBy = null) {
    if (!actual || actual.error || !expected || expected.error) return false;
    if (actual.columns.length !== expected.columns.length || !expected.columns.every((column) => actual.columns.includes(column))) return false;
    if (actual.rows.length !== expected.rows.length) return false;
    const key = (row) => JSON.stringify(expected.columns.map((column) => row[column]));
    const left = actual.rows.map(key).sort();
    const right = expected.rows.map(key).sort();
    if (!left.every((value, index) => value === right[index])) return false;
    return !orderBy || actual.rows.every((row, index) => index === 0 || actual.rows[index - 1][orderBy] >= row[orderBy]);
  }

  lessons.forEach((lesson, index) => {
    lesson.expected = runtime.runSql(lesson.solution);
    if (lesson.expected.error) throw new Error(`SQL, módulo ${index + 1}: ${lesson.expected.error}`);
    lesson.kicker = `Módulo ${String(index + 1).padStart(2, "0")} · SQL paso a paso`;
    lesson.difficulty = index < 4 ? "Fundamentos" : index < 8 ? "Práctica" : "Integración";
    lesson.explanation = lesson.paragraphs[0];
    lesson.file = `consulta-${String(index + 1).padStart(2, "0")}.sql`;
    lesson.checks = [
      { label: lesson.syntaxLabel, test: (code) => lesson.syntax.test(code) },
      { label: `Devuelve las columnas: ${lesson.expected.columns.join(", ")}`, test: (_, result) => !result.error && result.columns.length === lesson.expected.columns.length && lesson.expected.columns.every((column) => result.columns.includes(column)) },
      { label: lesson.expectedCopy, test: (_, result) => matchesResult(result, lesson.expected, lesson.orderBy) }
    ];
  });

  const practices = [
    { title: "Cursos para una tarde", concept: "Combina una comparación con un orden ascendente. <= 6 incluye los cursos que duran seis horas o menos; ASC pone primero el más corto.", goal: "Muestra id, nombre y duracion de los cursos de hasta seis horas, ordenados de menor a mayor duración.", starter: "SELECT id, nombre, duracion\nFROM cursos;", solution: "SELECT id, nombre, duracion FROM cursos WHERE duracion <= 6 ORDER BY duracion ASC;", hint: "WHERE duracion <= 6 filtra; ORDER BY duracion ASC ordena. Son dos tareas distintas." },
    { title: "Dos ciudades, una consulta", concept: "IN comprueba si un valor pertenece a una lista. ciudad IN ('Santiago', 'Valparaíso') equivale a comparar con Santiago OR con Valparaíso. Cada texto va entre comillas y las opciones se separan por coma.", goal: "Muestra nombre y ciudad de los estudiantes de Santiago o Valparaíso, ordenados por nombre.", starter: "SELECT nombre, ciudad\nFROM estudiantes;", solution: "SELECT nombre, ciudad FROM estudiantes WHERE ciudad IN ('Santiago', 'Valparaíso') ORDER BY nombre;", hint: "Usa WHERE ciudad IN ('Santiago', 'Valparaíso') y termina con ORDER BY nombre." },
    { title: "El tiempo más corto y el más largo", concept: "MIN y MAX buscan los extremos de una columna, no suman sus valores. Puedes seleccionar ambas funciones separadas por una coma para obtener dos indicadores en una sola fila.", goal: "Calcula MIN(duracion) como minimo y MAX(duracion) como maximo para todos los cursos.", starter: "SELECT duracion\nFROM cursos;", solution: "SELECT MIN(duracion) AS minimo, MAX(duracion) AS maximo FROM cursos;", hint: "Necesitas una sola fila con dos columnas: minimo = 4 y maximo = 14." }
  ];

  globalThis.SQLCourse = {
    name: "SQL", storageKey: "codigo-cero.sql-v2.completed", examsKey: "codigo-cero.sql-v2.exams", kind: "sql",
    stages: ["Primeras consultas", "Búsquedas y rankings", "Reportes y relaciones"],
    levels: [
      { title: "Leer y seleccionar", description: "Comprender la tabla antes de filtrar", modules: lessons.slice(0, 4) },
      { title: "Buscar y ordenar", description: "Patrones, intervalos y rankings", modules: lessons.slice(4, 8) },
      { title: "Resumir y relacionar", description: "Conteos, indicadores y uniones", modules: lessons.slice(8, 12) }
    ], lessons, practices, matchesResult
  };
})();

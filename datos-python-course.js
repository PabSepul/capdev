/* Ruta Datos con Python: doce módulos que se ejecutan con el intérprete real de
   python-runtime.js. No hay pandas ni archivos del disco: los datos llegan como
   texto dentro del propio ejercicio, que es como empieza casi todo trabajo real. */
(() => {
  "use strict";
  const check = (label, test) => ({ label, test });

  /* Comprobaciones sobre la salida real del programa, no sobre el texto escrito. */
  const salidaExacta = (...esperado) => (_, r) =>
    r.output.length === esperado.length && esperado.every((linea, i) => r.output[i] === linea);
  const imprime = (texto) => (_, r) => r.output.includes(texto);
  const usa = (expresion) => (code) => expresion.test(code);

  function lesson(spec) {
    return {
      duration: "16 min",
      file: "analisis.py",
      success: "Resultado correcto. Antes de avanzar, cambia un dato de entrada y comprueba que el programa sigue respondiendo bien.",
      ...spec
    };
  }

  const lessons = [
    lesson({
      kicker: "Módulo 01 · Filas",
      title: "De un texto a una lista de filas",
      shortTitle: "Texto a filas",
      difficulty: "Inicio",
      intro: "Los datos casi nunca llegan ordenados: llegan como texto. Un archivo CSV descargado, una respuesta de una API o un copiado desde una planilla son, para tu programa, una sola cadena larga.",
      example: 'texto.split("\\n")',
      explanation: "split parte un texto donde encuentra el separador que le indicas y devuelve una lista. Con el salto de línea obtienes las filas; aplicando split otra vez sobre cada fila, con la coma, obtienes sus columnas. El texto original no cambia: split devuelve algo nuevo.",
      concepts: [
        "\\n es un solo carácter: el salto de línea.",
        "split siempre devuelve una lista, aunque encuentre un solo trozo.",
        "Separar dos veces convierte un texto plano en filas y columnas."
      ],
      goal: "Recorre las tres líneas del texto y muestra cada una convertida en una lista de dos elementos.",
      hints: [
        'texto.split("\\n") te entrega las tres líneas.',
        "Recórrelas con un for.",
        'Dentro del ciclo, imprime linea.split(",").'
      ],
      starter: 'texto = "Python,12\\nSQL,7\\nGit,4"\n\n# 1. Separa el texto en líneas\n# 2. Recorre las líneas con un for\n# 3. Muestra cada línea separada por la coma\n',
      checks: [
        check("Muestra las tres filas como listas", salidaExacta("['Python', '12']", "['SQL', '7']", "['Git', '4']")),
        check("Separa el texto en líneas", usa(/\.split\(\s*(["'])\\n\1\s*\)/)),
        check("Separa cada fila por la coma", usa(/\.split\(\s*(["']),\1\s*\)/))
      ]
    }),
    lesson({
      kicker: "Módulo 02 · Registros",
      title: "Ponle nombre a cada columna",
      shortTitle: "Filas a diccionarios",
      difficulty: "Inicio",
      intro: "Una fila como [\"Python\", \"12\"] obliga a recordar que la posición 1 son los alumnos. En cuanto la tabla tiene ocho columnas, eso deja de funcionar. Un diccionario guarda el nombre junto al valor.",
      example: "dict(zip(cabecera, fila))",
      explanation: "zip empareja dos listas elemento a elemento y dict convierte esos pares en un diccionario. Así fila[1] se transforma en fila[\"alumnos\"], que se lee solo. Si la cabecera y la fila tienen distinto largo, zip se detiene en la más corta.",
      concepts: [
        "zip empareja por posición: primero con primero.",
        "dict(pares) construye un diccionario a partir de esos pares.",
        "Una lista de diccionarios es la forma más común de representar una tabla."
      ],
      goal: "Convierte las tres filas en diccionarios usando la cabecera y muestra uno por línea.",
      hints: [
        "zip(cabecera, fila) empareja el nombre de cada columna con su valor.",
        "dict(...) convierte esos pares en un diccionario.",
        "Puedes construir la lista completa con [dict(zip(cabecera, fila)) for fila in filas]."
      ],
      starter: 'cabecera = ["curso", "alumnos"]\nfilas = [["Python", "12"], ["SQL", "7"], ["Git", "4"]]\n\n# Convierte cada fila en un diccionario y muéstralo\n',
      checks: [
        check("Muestra los tres registros con sus nombres", salidaExacta(
          "{'curso': 'Python', 'alumnos': '12'}",
          "{'curso': 'SQL', 'alumnos': '7'}",
          "{'curso': 'Git', 'alumnos': '4'}")),
        check("Empareja la cabecera con cada fila usando zip", usa(/\bzip\s*\(/)),
        check("Construye diccionarios con dict", usa(/\bdict\s*\(/))
      ]
    }),
    lesson({
      kicker: "Módulo 03 · Tipos",
      title: "Un número guardado como texto no suma",
      shortTitle: "Convertir tipos",
      difficulty: "Inicio",
      intro: 'Todo lo que viene de un archivo llega como texto. "12" y 12 se ven iguales en pantalla y se comportan de forma completamente distinta: "12" + "7" da "127".',
      example: 'registro["alumnos"] = int(registro["alumnos"])',
      explanation: "int convierte un texto que representa un entero en un número entero, y float hace lo mismo con los decimales. Conviene convertir una sola vez, al cargar los datos, y no en cada cálculo: así el resto del programa trabaja con números de verdad.",
      concepts: [
        "int(\"12\") entrega 12; \"12\" y 12 no son el mismo valor.",
        "Sumar textos los concatena en lugar de sumarlos.",
        "Convertir al cargar evita repetir la conversión en cada cálculo."
      ],
      goal: "Convierte el campo alumnos de cada registro a entero, muestra la lista ya convertida y luego la suma total, 19.",
      hints: [
        "Recorre los registros con un for.",
        'Asigna el valor convertido de vuelta: registro["alumnos"] = int(registro["alumnos"]).',
        'Para el total usa sum([r["alumnos"] for r in registros]).'
      ],
      starter: 'registros = [{"curso": "Python", "alumnos": "12"}, {"curso": "SQL", "alumnos": "7"}]\n\n# 1. Convierte alumnos a entero en cada registro\n# 2. Muestra la lista completa\n# 3. Muestra la suma de alumnos\n',
      checks: [
        check("Muestra la lista con los alumnos ya numéricos", imprime("[{'curso': 'Python', 'alumnos': 12}, {'curso': 'SQL', 'alumnos': 7}]")),
        check("La suma total es 19", imprime("19")),
        check("Los valores quedaron guardados como números", (_, r) => {
          const registros = r.environment.registros;
          return Array.isArray(registros) && registros.length === 2
            && registros.every((fila) => typeof fila.alumnos === "number");
        })
      ]
    }),
    lesson({
      kicker: "Módulo 04 · Limpieza",
      title: "Descarta lo que no se puede leer",
      shortTitle: "Datos sucios",
      difficulty: "Fundamentos",
      intro: "Los datos reales vienen con espacios de más, líneas vacías y valores imposibles. Un programa que revienta con la primera fila mala no sirve; tampoco sirve uno que la acepta en silencio y arruina el total.",
      example: "try:\n    alumnos = int(dato)\nexcept ValueError:\n    continue",
      explanation: "strip quita los espacios de los extremos. try/except intenta una operación y, si falla con el error indicado, ejecuta el plan alternativo en vez de detener el programa. continue salta a la siguiente vuelta del ciclo. Descartar una fila es una decisión: por eso se avisa en pantalla.",
      concepts: [
        "strip limpia los extremos, no el interior del texto.",
        "int(\"nueve\") lanza ValueError: es un error previsible.",
        "Descartar en silencio esconde un problema; avisar lo deja a la vista."
      ],
      goal: "Descarta la línea vacía, avisa con «Descarto:» por cada fila cuyo número no se pueda leer y muestra al final la lista con los dos registros válidos.",
      hints: [
        'Salta las líneas vacías comparando linea.strip() con "".',
        "Envuelve la conversión en try / except ValueError.",
        'Dentro del except imprime "Descarto:" con el nombre del curso y usa continue.'
      ],
      starter: 'lineas = ["Python, 12", "SQL, ", "  Git , 4", "", "Datos, nueve"]\n\nlimpios = []\nfor linea in lineas:\n    # 1. Salta las líneas vacías\n    # 2. Separa el curso y el número\n    # 3. Convierte el número; si no se puede, avisa y descarta\n    pass\n\nprint(limpios)\n',
      checks: [
        check("Avisa de las dos filas ilegibles", (_, r) =>
          r.output.filter((linea) => linea.startsWith("Descarto:")).length === 2),
        check("Conserva solo Python y Git", imprime("[{'curso': 'Python', 'alumnos': 12}, {'curso': 'Git', 'alumnos': 4}]")),
        check("Controla el error en vez de dejar caer el programa", usa(/except\s+ValueError\s*:/))
      ]
    }),
    lesson({
      kicker: "Módulo 05 · Filtros",
      title: "Quédate solo con las filas que importan",
      shortTitle: "Filtrar filas",
      difficulty: "Fundamentos",
      intro: "Casi ninguna pregunta se responde con todos los datos. «¿Cuánto vendimos en el norte?» necesita, primero, quedarse con las filas del norte.",
      example: '[r for r in registros if r["region"] == "Norte"]',
      explanation: "Una comprensión de lista construye una lista nueva recorriendo otra y conservando lo que cumple la condición. Es la misma idea que un for con un if y un append, escrita en una línea. La lista original queda intacta, así que puedes hacer varios filtros distintos sobre los mismos datos.",
      concepts: [
        "La condición va al final, después del if.",
        "== compara; = asigna. Confundirlos es un error frecuente.",
        "Filtrar no modifica los datos originales."
      ],
      goal: "Muestra el curso y los alumnos de cada fila de la región Norte, y termina imprimiendo cuántas filas quedaron: 2.",
      hints: [
        'La condición es r["region"] == "Norte".',
        "Guarda el resultado en una variable para poder recorrerlo y contarlo.",
        "len(norte) entrega la cantidad de filas que pasaron el filtro."
      ],
      starter: 'registros = [\n    {"curso": "Python", "alumnos": 12, "region": "Norte"},\n    {"curso": "SQL", "alumnos": 7, "region": "Centro"},\n    {"curso": "Git", "alumnos": 4, "region": "Norte"},\n]\n\n# 1. Quédate con las filas de la región Norte\n# 2. Muestra el curso y los alumnos de cada una\n# 3. Muestra cuántas filas quedaron\n',
      checks: [
        check("Muestra las dos filas del norte y su cantidad", salidaExacta("Python 12", "Git 4", "2")),
        check("Filtra por la región, sin escribir los cursos a mano", usa(/["']Norte["']/)),
        check("Cuenta el resultado con len", usa(/\blen\s*\(/))
      ]
    }),
    lesson({
      kicker: "Módulo 06 · Resumen",
      title: "Cuenta, suma y promedia",
      shortTitle: "Contar y promediar",
      difficulty: "Fundamentos",
      intro: "Tres números resumen casi cualquier conjunto: cuántos hay, cuánto suman y cuál es el promedio. El promedio es el que más engaña, porque oculta los extremos.",
      example: "promedio = sum(notas) / len(notas)",
      explanation: "sum suma los elementos, len los cuenta y la división entre ambos da el promedio. En Python la división con / siempre entrega un decimal, incluso cuando el resultado es exacto. round redondea a la cantidad de decimales que pidas; el formato .1f hace lo mismo solo al mostrarlo, sin cambiar el valor guardado.",
      concepts: [
        "7 / 2 entrega 3.5, y 4 / 2 entrega 2.0: siempre decimal.",
        "round cambia el valor; un formato solo cambia cómo se ve.",
        "Un promedio sin la cantidad de datos dice muy poco."
      ],
      goal: "Muestra la cantidad de notas (4), el promedio redondeado a dos decimales (5.75) y la línea «Promedio: 5.8» con un decimal.",
      hints: [
        "len(notas) entrega la cantidad.",
        "round(promedio, 2) redondea el valor a dos decimales.",
        'Para la última línea usa f"Promedio: {promedio:.1f}".'
      ],
      starter: "notas = [6.5, 4.0, 5.5, 7.0]\n\n# 1. Muestra cuántas notas hay\n# 2. Muestra el promedio redondeado a dos decimales\n# 3. Muestra 'Promedio: ' y el promedio con un decimal\n",
      checks: [
        check("Muestra cantidad, promedio y línea final", salidaExacta("4", "5.75", "Promedio: 5.8")),
        check("Calcula el promedio en vez de escribirlo", usa(/\bsum\s*\(/)),
        check("Usa un formato con un decimal", usa(/:\s*\.1f/))
      ]
    }),
    lesson({
      kicker: "Módulo 07 · Grupos",
      title: "Junta las filas por categoría",
      shortTitle: "Agrupar por clave",
      difficulty: "Práctica",
      intro: "«¿Cuánto suma cada área?» es la pregunta que más se repite en el trabajo con datos. Agrupar consiste en usar el valor de una columna como clave y acumular ahí las filas que le corresponden.",
      example: 'grupos.setdefault(area, []).append(valor)',
      explanation: "setdefault devuelve el valor de la clave y, si la clave no existe todavía, la crea con el valor inicial que le indicas. Así evitas preguntar «¿ya existe este grupo?» en cada vuelta. Recorrer con sorted(grupos) entrega las claves ordenadas, lo que hace el resultado reproducible.",
      concepts: [
        "La clave del diccionario es la categoría por la que agrupas.",
        "setdefault crea la lista vacía solo la primera vez.",
        "sorted sobre un diccionario recorre sus claves ordenadas."
      ],
      goal: "Agrupa los alumnos por área y muestra cada área con su total, ordenadas alfabéticamente: «datos 19» y luego «web 9».",
      hints: [
        "Crea un diccionario vacío antes del ciclo.",
        'grupos.setdefault(r["area"], []).append(r["alumnos"]) acumula sin preguntar.',
        "Recorre con for area in sorted(grupos) y muestra sum(grupos[area])."
      ],
      starter: 'registros = [\n    {"curso": "Python", "area": "datos", "alumnos": 12},\n    {"curso": "SQL", "area": "datos", "alumnos": 7},\n    {"curso": "CSS", "area": "web", "alumnos": 9},\n]\n\n# 1. Agrupa los alumnos por área\n# 2. Muestra cada área con su total, en orden alfabético\n',
      checks: [
        check("Muestra los dos grupos con su total", salidaExacta("datos 19", "web 9")),
        check("Agrupa en un diccionario en vez de contar a mano", (_, r) => {
          const grupos = Object.values(r.environment).find((valor) =>
            valor && typeof valor === "object" && !Array.isArray(valor)
            && Object.keys(valor).length === 2 && "datos" in valor && "web" in valor);
          return Boolean(grupos);
        }),
        check("Recorre las áreas en orden", usa(/\bsorted\s*\(/))
      ]
    }),
    lesson({
      kicker: "Módulo 08 · Extremos",
      title: "El mayor y el menor según un criterio",
      shortTitle: "Máximo y mínimo",
      difficulty: "Práctica",
      intro: "max sobre una lista de diccionarios no sabe qué comparar. Hay que decirle cuál campo mirar, y eso se hace entregándole una función.",
      example: 'max(registros, key=lambda r: r["alumnos"])',
      explanation: "lambda define una función corta en una sola línea: recibe una fila y devuelve el valor por el que quieres comparar. max y min la aplican a cada elemento y devuelven la fila completa, no solo el número, que es justamente lo que necesitas para saber a qué curso corresponde.",
      concepts: [
        "lambda r: r[\"alumnos\"] es una función que extrae un campo.",
        "max con key devuelve el elemento completo, no el valor comparado.",
        "Sin key, max intentaría comparar los diccionarios entre sí y fallaría."
      ],
      goal: "Muestra el curso con más alumnos y luego el que tiene menos: «Git 19» y «SQL 7».",
      hints: [
        "key recibe una función que dice qué valor comparar.",
        'lambda r: r["alumnos"] entrega el número de cada fila.',
        "El resultado es la fila completa: léele el curso y los alumnos."
      ],
      starter: 'registros = [\n    {"curso": "Python", "alumnos": 12},\n    {"curso": "SQL", "alumnos": 7},\n    {"curso": "Git", "alumnos": 19},\n]\n\n# 1. Encuentra la fila con más alumnos y muéstrala\n# 2. Encuentra la fila con menos alumnos y muéstrala\n',
      checks: [
        check("Muestra primero el mayor y luego el menor", salidaExacta("Git 19", "SQL 7")),
        check("Usa max con un criterio", usa(/\bmax\s*\([^)]*key\s*=/)),
        check("Usa min con un criterio", usa(/\bmin\s*\([^)]*key\s*=/))
      ]
    }),
    lesson({
      kicker: "Módulo 09 · Orden",
      title: "Ordena por dos criterios a la vez",
      shortTitle: "Ordenar con criterio",
      difficulty: "Práctica",
      intro: "Dos cursos con doce alumnos cada uno. ¿Cuál va primero? Si no lo decides tú, el orden queda al azar del recorrido, y un informe que cambia de orden sin motivo genera desconfianza.",
      example: 'sorted(registros, key=lambda r: (-r["alumnos"], r["curso"]))',
      explanation: "Cuando la función key devuelve una tupla, Python compara el primer elemento y solo pasa al segundo si hay empate. El signo menos delante de un número invierte su orden sin afectar al resto de los criterios, que es más preciso que usar reverse=True sobre toda la comparación.",
      concepts: [
        "Una tupla como criterio define un orden principal y un desempate.",
        "-r[\"alumnos\"] ordena de mayor a menor solo ese campo.",
        "reverse=True invertiría también el desempate alfabético."
      ],
      goal: "Ordena de más a menos alumnos y desempata alfabéticamente por curso. El resultado debe ser Python 12, SQL 12 y Git 7.",
      hints: [
        "El criterio principal es la cantidad de alumnos, de mayor a menor.",
        'Devuelve una tupla desde la lambda: (-r["alumnos"], r["curso"]).',
        "Python y SQL empatan en 12, así que decide el orden alfabético."
      ],
      starter: 'registros = [\n    {"curso": "Git", "alumnos": 7},\n    {"curso": "SQL", "alumnos": 12},\n    {"curso": "Python", "alumnos": 12},\n]\n\n# Ordena de más a menos alumnos, desempatando por nombre de curso\n',
      checks: [
        check("Respeta el orden y el desempate", salidaExacta("Python 12", "SQL 12", "Git 7")),
        check("Ordena con sorted y un criterio propio", usa(/\bsorted\s*\([^)]*key\s*=/)),
        check("El criterio combina dos campos", usa(/key\s*=\s*lambda[^:]*:\s*\(/))
      ]
    }),
    lesson({
      kicker: "Módulo 10 · Formato",
      title: "Una tabla que se puede leer",
      shortTitle: "Tabla alineada",
      difficulty: "Avanzado",
      intro: "Los mismos números, mal alineados, obligan a leer dos veces. Alinear los textos a la izquierda y las cifras a la derecha es una convención tipográfica antigua y sigue siendo la más legible.",
      example: 'f"{curso:<10}{alumnos:>8}"',
      explanation: "Dentro de una f-string, los dos puntos abren el formato: < alinea a la izquierda, > a la derecha y ^ centra; el número que sigue es el ancho de la columna. La coma agrega el separador de miles. El valor guardado no cambia: solo cambia cómo se escribe en pantalla.",
      concepts: [
        "< izquierda, > derecha, ^ centrado; el número es el ancho.",
        "El separador de miles se pide con una coma en el formato.",
        "Las columnas cuadran cuando todas las filas usan el mismo ancho."
      ],
      goal: "Muestra una cabecera y dos filas alineadas: el curso a la izquierda en 10 caracteres, los alumnos a la derecha en 8 y el ingreso a la derecha en 12 con separador de miles.",
      hints: [
        'La cabecera usa los mismos anchos: f"{\'Curso\':<10}{\'Alumnos\':>8}{\'Ingreso\':>12}".',
        "Para alinear a la derecha en ocho caracteres se escribe :>8.",
        "El separador de miles se agrega con :>12, en el ingreso."
      ],
      starter: 'registros = [\n    {"curso": "Python", "alumnos": 12, "ingreso": 540000},\n    {"curso": "SQL", "alumnos": 7, "ingreso": 210000},\n]\n\n# 1. Muestra la cabecera Curso / Alumnos / Ingreso\n# 2. Muestra una fila por registro con las mismas columnas\n',
      checks: [
        check("Las tres líneas quedan alineadas", salidaExacta(
          "Curso      Alumnos     Ingreso",
          "Python          12     540,000",
          "SQL              7     210,000")),
        check("Alinea el nombre a la izquierda", usa(/:<10/)),
        check("Muestra el ingreso con separador de miles", usa(/:>12,/))
      ]
    }),
    lesson({
      kicker: "Módulo 11 · Conjuntos",
      title: "Valores únicos y los que faltan",
      shortTitle: "Únicos y faltantes",
      difficulty: "Avanzado",
      intro: "Una lista de inscritos con repetidos y una lista de aprobados. La pregunta útil no es cuántos hay, sino quién está en la primera y no en la segunda.",
      example: "faltan = set(inscritos).difference(set(aprobados))",
      explanation: "Un conjunto guarda cada valor una sola vez y responde muy rápido a «¿está esto adentro?». difference entrega lo que está en el primero y no en el segundo; intersection, lo que está en ambos. Un conjunto no tiene un orden garantizado, así que se ordena con sorted antes de mostrarlo.",
      concepts: [
        "set elimina los repetidos sin recorrer la lista a mano.",
        "difference responde «quién falta»; intersection, «quién está en ambos».",
        "Un conjunto no tiene orden: usa sorted antes de mostrarlo."
      ],
      goal: "Muestra cuántos inscritos únicos hay (3), la lista ordenada de esos únicos y la lista ordenada de quienes no aprobaron.",
      hints: [
        "set(inscritos) deja un valor por persona.",
        "len sobre el conjunto entrega la cantidad de únicos.",
        "difference con el conjunto de aprobados deja a quienes faltan."
      ],
      starter: 'inscritos = ["ana", "beto", "ana", "carla"]\naprobados = ["ana", "carla"]\n\n# 1. Muestra cuántas personas distintas se inscribieron\n# 2. Muestra esas personas ordenadas\n# 3. Muestra quiénes no aparecen entre los aprobados\n',
      checks: [
        check("Muestra el total, los únicos y los que faltan", salidaExacta("3", "['ana', 'beto', 'carla']", "['beto']")),
        check("Usa un conjunto para quitar repetidos", usa(/\bset\s*\(/)),
        check("Ordena antes de mostrar el conjunto", usa(/\bsorted\s*\(/))
      ]
    }),
    lesson({
      kicker: "Módulo 12 · Informe",
      title: "El informe completo, de principio a fin",
      shortTitle: "Informe completo",
      difficulty: "Proyecto",
      duration: "25 min",
      intro: "Último módulo: el texto crudo entra por arriba y sale una tabla ordenada por abajo. Es el recorrido entero que hiciste en once pasos, ahora en un solo programa.",
      example: "cargar → agrupar → resumir → ordenar → mostrar",
      explanation: "Un análisis se arma por etapas y cada una deja los datos listos para la siguiente: separar el texto, nombrar las columnas, convertir los tipos, agrupar por curso, calcular total y promedio, ordenar por total y recién entonces dar formato. Mezclar las etapas es lo que vuelve un script imposible de corregir.",
      concepts: [
        "La primera línea del texto es la cabecera, no un dato.",
        "Cada etapa entrega una estructura lista para la siguiente.",
        "El formato se aplica al final, nunca durante el cálculo."
      ],
      goal: "Construye la tabla con la cabecera «Curso Total Promedio» y una fila por curso, ordenadas de mayor a menor total: Python 21 y 10.5, SQL 7 y 7.0, Git 4 y 4.0.",
      hints: [
        "lineas[0] es la cabecera y lineas[1:] son los datos.",
        "Agrupa los alumnos por curso y luego calcula total y promedio de cada grupo.",
        'Las columnas son f"{curso:<8}{total:>7}{promedio:>10.1f}".'
      ],
      starter: 'texto = "curso,region,alumnos\\nPython,Norte,12\\nSQL,Centro,7\\nPython,Centro,9\\nGit,Norte,4"\n\n# 1. Separa la cabecera de los datos\n# 2. Convierte cada línea en un diccionario con alumnos numérico\n# 3. Agrupa por curso y calcula total y promedio\n# 4. Ordena de mayor a menor total y muestra la tabla\n',
      success: "Ruta terminada: sabes llevar un texto crudo hasta un informe ordenado y legible.",
      checks: [
        check("La tabla completa es correcta", salidaExacta(
          "Curso     Total  Promedio",
          "Python       21      10.5",
          "SQL           7       7.0",
          "Git           4       4.0")),
        check("Convierte los alumnos a número", usa(/\bint\s*\(/)),
        check("Ordena el resumen por total", usa(/\bsorted\s*\([^)]*key\s*=/))
      ]
    })
  ];

  const titles = ["Los datos en bruto", "Las preguntas", "El informe"];
  const descriptions = [
    "Del texto plano a registros confiables",
    "Filtrar, agrupar y resumir",
    "Ordenar, presentar y verificar"
  ];

  globalThis.DatosPythonCourse = {
    name: "Datos con Python",
    kind: "python",
    storageKey: "codigo-cero.datos-python-v2.completed",
    examsKey: "codigo-cero.datos-python-v2.exams",
    stages: titles,
    levels: titles.map((title, i) => ({ title, description: descriptions[i], modules: lessons.slice(i * 4, i * 4 + 4) })),
    lessons
  };

  const questions = [
    [
      ["¿Qué devuelve texto.split(\",\")?", ["Un número", "Una lista con los trozos", "El mismo texto", "Un diccionario"], 1, "split siempre devuelve una lista, aunque encuentre un solo trozo."],
      ["¿Qué hace zip(cabecera, fila)?", ["Comprime los datos", "Empareja los elementos por posición", "Ordena la fila", "Cuenta las columnas"], 1, "zip une el primero con el primero, el segundo con el segundo, y se detiene en la lista más corta."],
      ["¿Cuánto vale \"12\" + \"7\"?", ["19", "\"127\"", "Un error", "127"], 1, "Sumar dos textos los concatena; para sumar hay que convertirlos con int primero."],
      ["¿Para qué sirve strip()?", ["Borra el texto", "Quita los espacios de los extremos", "Separa por comas", "Convierte a número"], 1, "strip limpia el inicio y el final; los espacios interiores no se tocan."],
      ["Si una fila trae un número ilegible, ¿qué conviene hacer?", ["Detener todo el programa", "Guardarla como cero en silencio", "Descartarla dejando constancia", "Ignorar el problema"], 2, "Convertirla en cero altera los totales sin que nadie se entere; descartarla y avisar deja el problema a la vista."]
    ],
    [
      ["¿Qué construye [r for r in filas if r[\"region\"] == \"Norte\"]?", ["Modifica filas", "Una lista nueva con las que cumplen", "Un diccionario", "El total del norte"], 1, "Una comprensión de lista crea una lista nueva y deja la original intacta."],
      ["¿Cuánto vale 4 / 2 en Python?", ["2", "2.0", "\"2\"", "Un error"], 1, "La división con / entrega siempre un decimal; // sería la división entera."],
      ["¿Qué diferencia hay entre round(x, 1) y el formato :.1f?", ["Ninguna", "round cambia el valor y el formato solo cómo se ve", "El formato cambia el valor", "round solo sirve con enteros"], 1, "El formato afecta la presentación; el valor guardado sigue igual."],
      ["¿Qué hace grupos.setdefault(area, [])?", ["Borra la clave", "Devuelve la lista de esa área y la crea si falta", "Ordena el diccionario", "Suma los valores"], 1, "Evita tener que preguntar si la clave ya existe en cada vuelta del ciclo."],
      ["¿Por qué max(registros) sin key falla?", ["Porque la lista es muy larga", "Porque no sabe qué campo comparar entre diccionarios", "Porque falta un import", "Porque los datos son texto"], 1, "key indica qué valor extraer de cada elemento para poder compararlos."]
    ],
    [
      ["¿Qué hace key=lambda r: (-r[\"total\"], r[\"curso\"])?", ["Ordena solo por curso", "Ordena por total de mayor a menor y desempata por curso", "Invierte toda la lista", "Elimina los empates"], 1, "Con una tupla, Python compara el segundo criterio solo cuando el primero empata."],
      ["En f\"{nombre:<10}\", ¿qué indica el 10?", ["Diez decimales", "El ancho de la columna", "Diez filas", "El máximo de caracteres del dato"], 1, "El ancho reserva ese espacio; si el texto es más corto se rellena, y si es más largo no se recorta."],
      ["¿Qué hace un conjunto con los valores repetidos?", ["Los cuenta", "Guarda solo uno", "Los ordena", "Los rechaza con un error"], 1, "Un conjunto guarda cada valor una sola vez, que es la forma directa de quitar duplicados."],
      ["¿Por qué se usa sorted antes de mostrar un conjunto?", ["Para que sea más rápido", "Porque un conjunto no garantiza un orden", "Para quitar repetidos", "Para convertirlo en texto"], 1, "Sin ordenar, la salida podría cambiar entre ejecuciones y el informe dejaría de ser reproducible."],
      ["¿En qué momento conviene dar formato a los números?", ["Al cargar los datos", "En cada cálculo intermedio", "Al final, solo para mostrar", "Nunca"], 2, "Si formateas antes, vuelves texto lo que todavía necesitas sumar o comparar."]
    ]
  ];

  globalThis.StarterExams.LEVEL_EXAMS["datos-python"] = questions.map((bank, i) => ({
    levelId: i + 1,
    title: "Mini examen: " + titles[i],
    passing: 4,
    intro: "Responde las cinco preguntas. Apruebas con cuatro aciertos y puedes repetir el repaso.",
    questions: bank.map(([question, options, answer, explanation]) => ({ question, options, answer, explanation }))
  }));
})();

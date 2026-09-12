/* Ruta TypeScript: doce módulos sobre ts-lab.js. Cada módulo se aprueba de dos
   maneras a la vez: el verificador de tipos no debe encontrar errores y el
   programa debe producir la salida que pide la misión. Las doce soluciones se
   contrastan con TypeScript 5.9.3 real en route-typescript.test.mjs. */
(() => {
  "use strict";
  const check = (label, test) => ({ label, test });

  const salidaExacta = (...esperado) => (_, r) =>
    r.errores.length === 0 && r.output.length === esperado.length
    && esperado.every((linea, i) => r.output[i] === linea);
  const imprime = (texto) => (_, r) => r.errores.length === 0 && r.output.includes(texto);
  const sinErrores = () => (_, r) => r.errores.length === 0 && !r.error;
  const usa = (expresion) => (code) => expresion.test(code);
  const ambos = (primera, segunda) => (code, r) => primera(code, r) && segunda(code, r);

  function lesson(spec) {
    return {
      duration: "16 min",
      file: "programa.ts",
      success: "Compila y funciona. El JavaScript que se ejecutó es tu mismo código sin las anotaciones.",
      ...spec
    };
  }

  const lessons = [
    lesson({
      kicker: "Módulo 01 · Anotaciones",
      title: "Dile al compilador qué guarda cada variable",
      shortTitle: "Anotar variables",
      difficulty: "Inicio",
      intro: "En JavaScript una variable acepta cualquier cosa, y el error aparece cuando el programa ya está corriendo. TypeScript te deja declarar qué esperas, y avisa antes.",
      example: 'let nombre: string = "Ana";',
      explanation: "Los dos puntos después del nombre introducen el tipo. Los tres tipos básicos son string para texto, number para cualquier número —enteros y decimales, sin distinción— y boolean para verdadero o falso. Si intentas guardar otra cosa, el compilador se niega y el JavaScript ni siquiera se genera.",
      concepts: [
        "La anotación va después del nombre, con dos puntos.",
        "number cubre enteros y decimales: no hay int ni float.",
        "El error aparece al compilar, no al ejecutar."
      ],
      goal: "Declara nombre como string con «Ana», edad como number con 28 y activa como boolean con true, y muéstralos en una sola línea.",
      hints: [
        'La forma es let nombre: string = "Ana";',
        "Para el número no se usan comillas: 28, no \"28\".",
        "console.log acepta varios valores separados por coma."
      ],
      starter: '// Anota cada variable con su tipo\nlet nombre = "Ana";\nlet edad = 28;\nlet activa = true;\n\nconsole.log(nombre, edad, activa);\n',
      checks: [
        check("Muestra los tres valores", salidaExacta("Ana 28 true")),
        check("Anota el texto como string", usa(/nombre\s*:\s*string/)),
        check("Anota el número y el booleano", (code) => /edad\s*:\s*number/.test(code) && /activa\s*:\s*boolean/.test(code))
      ]
    }),
    lesson({
      kicker: "Módulo 02 · Funciones",
      title: "Una firma que documenta y verifica",
      shortTitle: "Tipar una función",
      difficulty: "Inicio",
      intro: "Una función sin tipos obliga a leer su cuerpo para saber qué acepta. Con tipos, la primera línea ya lo dice, y además el compilador lo hace cumplir.",
      example: "function sumar(a: number, b: number): number {",
      explanation: "Cada parámetro lleva su tipo y, después del paréntesis de cierre, se declara qué devuelve la función. Si el return no coincide con lo prometido, hay error; si quien la llama envía un texto donde va un número, también. La firma se convierte en un contrato que se revisa en los dos sentidos.",
      concepts: [
        "El tipo del retorno va después de los paréntesis.",
        "Se comprueba la función por dentro y sus llamadas por fuera.",
        "Una firma bien escrita ahorra leer el cuerpo."
      ],
      goal: "Tipa la función sumar para que reciba dos number y devuelva un number, y muestra el resultado de sumar 12 y 5.",
      hints: [
        "Cada parámetro necesita su propia anotación: a: number, b: number.",
        "El tipo del retorno va entre el paréntesis de cierre y la llave.",
        "El resultado que debe aparecer es 17."
      ],
      starter: '// Completa la firma con los tipos\nfunction sumar(a, b) {\n  return a + b;\n}\n\nconsole.log(sumar(12, 5));\n',
      checks: [
        check("Muestra 17", salidaExacta("17")),
        check("Tipa los dos parámetros", usa(/sumar\s*\(\s*a\s*:\s*number\s*,\s*b\s*:\s*number\s*\)/)),
        check("Declara qué devuelve", usa(/\)\s*:\s*number\s*\{/))
      ]
    }),
    lesson({
      kicker: "Módulo 03 · Arreglos",
      title: "Una lista con un solo tipo adentro",
      shortTitle: "Arreglos tipados",
      difficulty: "Inicio",
      intro: "Una lista donde conviven textos y números es una fuente inagotable de errores. Declarar qué guarda un arreglo evita que se cuele algo distinto.",
      example: "const horas: number[] = [12, 5, 4];",
      explanation: "Los corchetes después del tipo significan «lista de». number[] es una lista de números y string[] una de textos. El compilador revisa cada elemento al crearla y también cada push posterior. Al recorrerla con for ... of, la variable del ciclo ya tiene el tipo del elemento sin que lo anotes.",
      concepts: [
        "number[] se lee «arreglo de números».",
        "La revisión alcanza a los elementos nuevos, no solo a los iniciales.",
        "En for ... of, el elemento hereda el tipo del arreglo."
      ],
      goal: "Anota los dos arreglos, suma las horas recorriéndolas y muestra la cantidad de cursos y el total: «3 21».",
      hints: [
        "El tipo de horas es number[] y el de cursos es string[].",
        "Declara total como number antes del ciclo.",
        "console.log(cursos.length, total) muestra ambos valores."
      ],
      starter: '// Anota los arreglos con su tipo\nconst horas = [12, 5, 4];\nconst cursos = ["Python", "SQL", "Git"];\n\nlet total = 0;\nfor (const hora of horas) {\n  total = total + hora;\n}\n\nconsole.log(cursos.length, total);\n',
      checks: [
        check("Muestra 3 y 21", salidaExacta("3 21")),
        check("Anota el arreglo de números", usa(/horas\s*:\s*number\s*\[\s*\]/)),
        check("Anota el arreglo de textos", usa(/cursos\s*:\s*string\s*\[\s*\]/))
      ]
    }),
    lesson({
      kicker: "Módulo 04 · Inferencia",
      title: "Cuándo no hace falta anotar nada",
      shortTitle: "Inferencia y const",
      difficulty: "Fundamentos",
      intro: "TypeScript deduce el tipo del valor inicial. Anotar lo que ya es evidente añade ruido; lo valioso es anotar lo que el compilador no puede adivinar.",
      example: 'const nivel = "inicial";  // tipo "inicial"',
      explanation: "Con let, el tipo se ensancha al general: let contador = 0 es number, y puedes reasignarlo a cualquier número. Con const el valor no va a cambiar, así que el tipo se queda en el literal exacto: const nivel = \"inicial\" tiene tipo \"inicial\", no string. Esa diferencia es la que hace funcionar las uniones de literales que verás más adelante.",
      concepts: [
        "let ensancha al tipo general; const conserva el literal.",
        "Anotar lo obvio no agrega seguridad, solo texto.",
        "Un literal siempre encaja donde se espera su tipo general."
      ],
      goal: "Sin anotar nivel ni contador, incrementa el contador y guarda nivel en una variable anotada como string. Muestra «inicial 1».",
      hints: [
        "Deja const nivel y let contador sin anotación: se deducen solos.",
        "contador = contador + 1 funciona porque let dedujo number.",
        'El literal "inicial" encaja donde se espera string.'
      ],
      starter: 'const nivel = "inicial";\nlet contador = 0;\n\n// 1. Incrementa el contador en uno\n// 2. Guarda nivel en una constante anotada como string\n// 3. Muestra ambos valores\n',
      checks: [
        check("Muestra «inicial 1»", salidaExacta("inicial 1")),
        check("Declara una variable anotada como string", usa(/:\s*string\s*=/)),
        check("No anota nivel ni contador", (code) =>
          !/nivel\s*:\s*\w/.test(code) && !/contador\s*:\s*\w/.test(code))
      ]
    }),
    lesson({
      kicker: "Módulo 05 · Objetos",
      title: "Dale nombre a la forma de tus datos",
      shortTitle: "type con objeto",
      difficulty: "Fundamentos",
      intro: "Los datos reales son objetos con varios campos. Describir esa forma una vez y reutilizar el nombre es lo que convierte a TypeScript en algo más que anotaciones sueltas.",
      example: "type Curso = { nombre: string; horas: number };",
      explanation: "type crea un alias: un nombre para una forma. A partir de ahí, cualquier valor anotado como Curso tiene que traer exactamente esos campos, con esos tipos. Falta uno y hay error; sobra uno escrito ahí mismo y también, porque casi siempre es un nombre mal escrito.",
      concepts: [
        "Un alias describe una forma, no crea una clase.",
        "Faltar una propiedad obligatoria es un error.",
        "Una propiedad de más en un objeto literal también lo es."
      ],
      goal: "Define el tipo Curso con nombre y horas, crea python con «Python» y 12, y muestra ambos campos: «Python 12».",
      hints: [
        "La forma es type Curso = { nombre: string; horas: number };",
        "Anota la constante con const python: Curso = { ... }.",
        "Accede a los campos con python.nombre y python.horas."
      ],
      starter: '// 1. Define el tipo Curso con nombre (string) y horas (number)\n\nconst python = { nombre: "Python", horas: 12 };\n\nconsole.log(python.nombre, python.horas);\n',
      checks: [
        check("Muestra «Python 12»", salidaExacta("Python 12")),
        check("Define el tipo Curso", usa(/type\s+Curso\s*=/)),
        check("Anota la constante con ese tipo", usa(/python\s*:\s*Curso/))
      ]
    }),
    lesson({
      kicker: "Módulo 06 · Opcionales",
      title: "Un dato que puede no venir",
      shortTitle: "Propiedad opcional",
      difficulty: "Fundamentos",
      intro: "No todos los registros están completos. Un correo que a veces falta no es un error del programa: es la realidad, y el tipo tiene que decirlo.",
      example: "correo?: string;",
      explanation: "El signo de interrogación antes de los dos puntos marca la propiedad como opcional: el objeto puede traerla o no. A cambio, al leerla el tipo pasa a ser string | undefined, y el compilador exige comprobarla antes de usar sus métodos. interface hace lo mismo que type para describir un objeto; usa la que prefieras y sé consistente.",
      concepts: [
        "El ? va antes de los dos puntos, no después.",
        "Al leer un opcional, el tipo incluye undefined.",
        "interface y type describen igual un objeto."
      ],
      goal: "Define la interfaz Alumno con nombre obligatorio y correo opcional, crea a Ana con correo y a Beto sin él, y muestra los dos nombres: «Ana Beto».",
      hints: [
        "interface Alumno { nombre: string; correo?: string; }",
        "Beto es válido sin correo justamente porque es opcional.",
        "Muestra ana.nombre y beto.nombre en una sola línea."
      ],
      starter: '// 1. Define la interfaz Alumno: nombre obligatorio, correo opcional\n\nconst ana = { nombre: "Ana", correo: "ana@ejemplo.cl" };\nconst beto = { nombre: "Beto" };\n\nconsole.log(ana.nombre, beto.nombre);\n',
      checks: [
        check("Muestra «Ana Beto»", salidaExacta("Ana Beto")),
        check("Marca el correo como opcional", usa(/correo\s*\?\s*:/)),
        check("Anota ambos con el tipo Alumno", (code) =>
          /ana\s*:\s*Alumno/.test(code) && /beto\s*:\s*Alumno/.test(code))
      ]
    }),
    lesson({
      kicker: "Módulo 07 · Uniones",
      title: "Solo estos valores, ninguno más",
      shortTitle: "Uniones literales",
      difficulty: "Práctica",
      intro: "Un campo «nivel» declarado como string acepta «avanzado», «Avanzado» y «avnazado». Los tres compilan y solo uno es correcto. Una unión de literales cierra esa puerta.",
      example: 'type Nivel = "inicial" | "intermedio" | "avanzado";',
      explanation: "La barra vertical separa las alternativas posibles. El tipo resultante acepta exactamente esos valores y ningún otro: un error de tipeo deja de compilar. Es la forma más barata de convertir una convención que vivía en la cabeza del equipo en una regla que la máquina revisa.",
      concepts: [
        "Cada alternativa es un valor concreto, no un tipo general.",
        "Un valor fuera de la lista no compila.",
        "Una unión documenta las opciones sin comentarios."
      ],
      goal: "Define Nivel con los tres valores, guarda «intermedio» en actual y escribe precio, que devuelve 20000, 35000 o 50000 según el nivel. Muestra «intermedio 35000».",
      hints: [
        'type Nivel = "inicial" | "intermedio" | "avanzado";',
        "El parámetro de precio se anota con Nivel y devuelve number.",
        "Compara con === dentro de la función y devuelve el monto."
      ],
      starter: '// 1. Define el tipo Nivel con los tres valores posibles\n\nconst actual = "intermedio";\n\nfunction precio(nivel) {\n  // 2. Devuelve 20000, 35000 o 50000 según el nivel\n}\n\nconsole.log(actual, precio(actual));\n',
      checks: [
        check("Muestra «intermedio 35000»", salidaExacta("intermedio 35000")),
        check("Define la unión de los tres niveles", usa(/type\s+Nivel\s*=\s*["'][^"']+["']\s*\|/)),
        check("Usa el tipo en la función", usa(/nivel\s*:\s*Nivel/))
      ]
    }),
    lesson({
      kicker: "Módulo 08 · Estrechar",
      title: "Comprueba y el tipo se ajusta solo",
      shortTitle: "Estrechar un tipo",
      difficulty: "Práctica",
      intro: "Si un valor puede ser texto o número, no puedes llamar toUpperCase sin más. Pero en cuanto compruebas cuál es, el compilador te sigue: dentro del if ya sabe con qué está tratando.",
      example: 'if (typeof valor === "number") { ... }',
      explanation: "Se llama estrechamiento: el tipo de una variable se hace más preciso dentro de la rama donde ya comprobaste algo. typeof sirve para distinguir tipos básicos, y una comparación con === sirve para uniones de literales. Si la rama termina en return, el resto de la función también queda estrechado.",
      concepts: [
        "typeof devuelve un texto: \"string\", \"number\", \"boolean\".",
        "Dentro del if, la variable tiene el tipo comprobado.",
        "Un return temprano estrecha también lo que viene después."
      ],
      goal: "Escribe describir para un valor string | number: si es número, devuelve «Número: » con dos decimales; si no, «Texto: » en mayúsculas. Muestra el resultado para 3.14159 y para «hola».",
      hints: [
        "El parámetro se anota como string | number.",
        'Comprueba con typeof valor === "number" y devuelve dentro del if.',
        "Después del if, el compilador ya sabe que solo queda string."
      ],
      starter: 'function describir(valor) {\n  // 1. Si es número, devuelve "Número: " y el valor con 2 decimales\n  // 2. Si no, devuelve "Texto: " y el valor en mayúsculas\n}\n\nconsole.log(describir(3.14159));\nconsole.log(describir("hola"));\n',
      checks: [
        check("Muestra las dos descripciones", salidaExacta("Número: 3.14", "Texto: HOLA")),
        check("Acepta las dos formas del dato", usa(/valor\s*:\s*(string\s*\|\s*number|number\s*\|\s*string)/)),
        check("Distingue el caso con typeof", usa(/typeof\s+valor\s*===/))
      ]
    }),
    lesson({
      kicker: "Módulo 09 · Contratos",
      title: "Una función que recibe un objeto completo",
      shortTitle: "Objeto como parámetro",
      difficulty: "Práctica",
      intro: "Pasar cinco parámetros sueltos invita a confundir el orden. Pasar un objeto con forma declarada hace que el compilador revise el nombre de cada campo por ti.",
      example: "function resumir(curso: Curso): string {",
      explanation: "Cuando el parámetro tiene un tipo con nombre, quien llama a la función sabe exactamente qué construir y el compilador revisa que no falte nada ni sobre nada. Dentro de la función, cada propiedad ya viene tipada: si escribes curso.hora en vez de curso.horas, el error aparece al compilar y no en producción.",
      concepts: [
        "Un objeto tipado evita confundir el orden de los parámetros.",
        "Los nombres de las propiedades se revisan al escribirlos.",
        "El objeto se puede construir en la misma llamada."
      ],
      goal: "Con el tipo Curso, escribe resumir para que devuelva «SQL dura 5 horas» y llámala construyendo el objeto en la propia llamada.",
      hints: [
        "El parámetro se anota con curso: Curso y devuelve string.",
        "Arma el texto con curso.nombre y curso.horas.",
        'La llamada es resumir({ nombre: "SQL", horas: 5 }).'
      ],
      starter: 'type Curso = {\n  nombre: string;\n  horas: number;\n};\n\n// 1. Escribe resumir(curso: Curso): string\n// 2. Devuelve "SQL dura 5 horas"\n\n// 3. Llámala con el objeto escrito en la propia llamada\n',
      checks: [
        check("Muestra el resumen exacto", salidaExacta("SQL dura 5 horas")),
        check("El parámetro usa el tipo Curso", usa(/curso\s*:\s*Curso/)),
        check("Declara que devuelve un texto", usa(/\)\s*:\s*string/))
      ]
    }),
    lesson({
      kicker: "Módulo 10 · Colecciones",
      title: "Filtrar y transformar sin perder el tipo",
      shortTitle: "map y filter tipados",
      difficulty: "Avanzado",
      intro: "filter devuelve una lista del mismo tipo; map devuelve una lista de lo que retorne tu función. El compilador sigue esa cadena y avisa si te equivocas al final.",
      example: "cursos.filter((curso: Curso) => curso.activo)",
      explanation: "Al recorrer un Curso[], el parámetro de la función recibe un Curso aunque no lo anotes: eso es tipado contextual. filter conserva el tipo del elemento y map lo cambia por el del valor que devuelvas. Si anotas el resultado como string[] pero tu map devuelve números, el error salta en la anotación, que es donde estaba la intención equivocada.",
      concepts: [
        "El parámetro de map y filter se deduce del arreglo.",
        "filter conserva el tipo; map lo cambia por el que devuelves.",
        "Anotar el resultado hace visible el error en el punto correcto."
      ],
      goal: "Quédate con los cursos activos y arma la lista de sus nombres, anotando ambos resultados. Muestra «Python, SQL».",
      hints: [
        "El resultado de filter se anota como Curso[].",
        "El de map, que devuelve el nombre, se anota como string[].",
        'join(", ") arma la línea final.'
      ],
      starter: 'type Curso = {\n  nombre: string;\n  horas: number;\n  activo: boolean;\n};\n\nconst cursos: Curso[] = [\n  { nombre: "Python", horas: 12, activo: true },\n  { nombre: "SQL", horas: 5, activo: true },\n  { nombre: "Git", horas: 4, activo: false }\n];\n\n// 1. Filtra los activos, anotando el resultado\n// 2. Obtén sus nombres, anotando el resultado\n// 3. Muéstralos separados por coma y espacio\n',
      checks: [
        check("Muestra «Python, SQL»", salidaExacta("Python, SQL")),
        check("Anota el resultado del filtro", usa(/:\s*Curso\s*\[\s*\]\s*=\s*cursos\.filter/)),
        check("Anota la lista de nombres", usa(/:\s*string\s*\[\s*\]\s*=\s*\w+\.map/))
      ]
    }),
    lesson({
      kicker: "Módulo 11 · Genéricos",
      title: "Una función que sirve para cualquier tipo",
      shortTitle: "Genéricos",
      difficulty: "Avanzado",
      intro: "Escribir primerString y primerNumber por separado es repetir el mismo código dos veces. Un genérico lo escribe una vez sin renunciar a los tipos.",
      example: "function primero<T>(lista: T[]): T {",
      explanation: "La T entre ángulos es un tipo que se decide en cada llamada. Si le pasas un string[], T es string y el resultado también; con un number[], T es number. No es lo mismo que devolver un valor sin tipo: el compilador sigue sabiendo qué recibió y qué devuelve en cada uso concreto.",
      concepts: [
        "T se deduce del argumento en cada llamada.",
        "Un genérico conserva la relación entre lo que entra y lo que sale.",
        "La letra es una convención: podría llamarse Elemento."
      ],
      goal: "Escribe primero, que devuelve el primer elemento de cualquier lista, y úsala con textos y con números guardando cada resultado en una constante anotada. Muestra «a 10».",
      hints: [
        "La firma es function primero<T>(lista: T[]): T.",
        "El cuerpo es simplemente return lista[0];",
        "Anota los resultados como string y number para comprobar que T funciona."
      ],
      starter: '// 1. Escribe una función genérica que devuelva el primer elemento\n\n// 2. Úsala con ["a", "b"] guardando el resultado en un string\n// 3. Úsala con [10, 20] guardando el resultado en un number\n\n// 4. Muestra ambos valores\n',
      checks: [
        check("Muestra «a 10»", salidaExacta("a 10")),
        check("Declara la función con un tipo genérico", usa(/function\s+\w+\s*<\s*\w+\s*>/)),
        check("Guarda los resultados con tipos distintos", ambos(usa(/:\s*string\s*=/), usa(/:\s*number\s*=/)))
      ]
    }),
    lesson({
      kicker: "Módulo 12 · Proyecto",
      title: "Un catálogo con todo lo aprendido",
      shortTitle: "Catálogo tipado",
      difficulty: "Proyecto",
      duration: "25 min",
      intro: "Último módulo: una interfaz con un campo opcional, una unión de literales, una lista tipada, una función que arma la ficha y un filtro. Todo lo anterior, junto.",
      example: "interface Curso { nombre: string; nivel: Nivel; profesor?: string }",
      explanation: "El campo profesor es opcional, así que dentro de ficha hay que comprobarlo antes de usarlo: esa comprobación es la que convierte string | undefined en string. El filtro por nivel funciona porque nivel no es un string cualquiera sino una unión cerrada. Ninguna de estas piezas es complicada; lo valioso es que juntas describen los datos con precisión.",
      concepts: [
        "Un opcional obliga a decidir qué pasa cuando falta.",
        "Comparar con undefined estrecha el tipo a partir de ahí.",
        "Las piezas se combinan sin ceremonia adicional."
      ],
      goal: "Escribe ficha, que devuelve «nombre (nivel, horas h) · profesor» usando «sin profesor» cuando no lo hay, y muestra solo los cursos de nivel inicial: Python con Ana y SQL sin profesor.",
      hints: [
        "Comprueba con curso.profesor === undefined antes de usarlo.",
        'El formato exacto es nombre + " (" + nivel + ", " + horas + " h) · " + quien.',
        'Filtra con curso.nivel === "inicial" y recorre el resultado.'
      ],
      starter: 'type Nivel = "inicial" | "avanzado";\n\ninterface Curso {\n  nombre: string;\n  horas: number;\n  nivel: Nivel;\n  profesor?: string;\n}\n\nconst catalogo: Curso[] = [\n  { nombre: "Python", horas: 12, nivel: "inicial", profesor: "Ana" },\n  { nombre: "SQL", horas: 5, nivel: "inicial" },\n  { nombre: "Arquitectura", horas: 20, nivel: "avanzado", profesor: "Beto" }\n];\n\n// 1. Escribe ficha(curso: Curso): string\n// 2. Usa "sin profesor" cuando el campo falte\n// 3. Filtra los de nivel inicial y muestra la ficha de cada uno\n',
      success: "Ruta terminada: sabes describir datos con precisión y dejar que el compilador revise el resto.",
      checks: [
        check("Muestra las dos fichas iniciales", salidaExacta(
          "Python (inicial, 12 h) · Ana",
          "SQL (inicial, 5 h) · sin profesor")),
        check("Comprueba el profesor antes de usarlo", ambos(sinErrores(), usa(/profesor\s*(===|!==)\s*undefined/))),
        check("Filtra por nivel", usa(/\.filter\s*\(/))
      ]
    })
  ];

  const titles = ["Los tipos básicos", "La forma de los datos", "Contratos que aguantan"];
  const descriptions = [
    "Anotar variables, funciones y listas",
    "Objetos, opcionales y uniones",
    "Parámetros, colecciones y genéricos"
  ];

  globalThis.TypeScriptCourse = {
    name: "TypeScript",
    kind: "typescript",
    storageKey: "codigo-cero.typescript-v2.completed",
    examsKey: "codigo-cero.typescript-v2.exams",
    stages: titles,
    levels: titles.map((title, i) => ({ title, description: descriptions[i], modules: lessons.slice(i * 4, i * 4 + 4) })),
    lessons
  };

  const questions = [
    [
      ["¿Dónde va la anotación de tipo de una variable?", ["Antes del nombre", "Después del nombre, con dos puntos", "Al final de la línea", "En un comentario"], 1, "La forma es let nombre: string = \"Ana\"."],
      ["¿Qué cubre el tipo number?", ["Solo enteros", "Solo decimales", "Enteros y decimales", "Números escritos como texto"], 2, "TypeScript no distingue int de float: todo número es number."],
      ["¿Cuándo aparece un error de tipos?", ["Al ejecutar el programa", "Al compilar, antes de ejecutar", "Solo en producción", "Nunca, son advertencias"], 1, "Ese es el punto: el error se ve antes de que el programa corra."],
      ["¿Qué significa string[]?", ["Un texto con corchetes", "Un arreglo de textos", "Un texto opcional", "Una unión de textos"], 1, "Los corchetes después del tipo se leen «arreglo de»."],
      ["¿Qué diferencia hay entre let x = 3 y const x = 3?", ["Ninguna", "let deduce number y const deduce el literal 3", "const deduce string", "let no deduce nada"], 1, "Como const no puede cambiar, el tipo se queda en el valor exacto."]
    ],
    [
      ["¿Para qué sirve type Curso = { ... }?", ["Crea una clase", "Da nombre a una forma de objeto", "Crea un objeto", "Importa un módulo"], 1, "Es un alias: un nombre para una forma, sin generar código."],
      ["Si un objeto anotado con Curso no trae una propiedad obligatoria…", ["Se rellena con null", "Hay un error de compilación", "Se ignora", "Se crea vacía"], 1, "El tipo exige todas las propiedades que no estén marcadas como opcionales."],
      ["¿Qué hace el signo ? en correo?: string;", ["Vuelve la propiedad opcional", "Indica que es un booleano", "Marca un error", "Hace la propiedad de solo lectura"], 0, "Al leerla, su tipo pasa a ser string | undefined."],
      ["¿Qué acepta el tipo \"inicial\" | \"avanzado\"?", ["Cualquier texto", "Solo esos dos valores", "Solo el primero", "Textos y números"], 1, "Una unión de literales cierra la lista de valores posibles."],
      ["¿Qué diferencia hay entre interface y type para un objeto?", ["interface es más rápida", "Para describir un objeto, ninguna importante", "type no acepta objetos", "interface no acepta opcionales"], 1, "Ambas describen la misma forma; conviene elegir una y ser consistente."]
    ],
    [
      ["¿Qué es el estrechamiento?", ["Acortar el código", "Que el tipo se vuelva más preciso tras una comprobación", "Convertir un tipo en otro", "Quitar las anotaciones"], 1, "Dentro del if, el compilador ya sabe con cuál de los casos está tratando."],
      ["¿Qué devuelve typeof 42?", ["\"int\"", "\"number\"", "42", "\"entero\""], 1, "typeof entrega un texto con el nombre del tipo básico."],
      ["Si cursos es Curso[], ¿qué tipo recibe el parámetro de cursos.map(c => ...)?", ["any", "Curso", "string", "Hay que anotarlo siempre"], 1, "Se llama tipado contextual: el tipo viene del arreglo."],
      ["¿Qué devuelve filter sobre un Curso[]?", ["Un booleano", "Otro Curso[]", "Un string[]", "Un solo Curso"], 1, "filter conserva el tipo del elemento; map es el que lo cambia."],
      ["En function primero<T>(lista: T[]): T, ¿qué es T?", ["Un tipo fijo", "Un tipo que se decide en cada llamada", "Siempre string", "Un valor cualquiera sin tipo"], 1, "El genérico conserva la relación entre lo que entra y lo que sale."]
    ]
  ];

  globalThis.StarterExams.LEVEL_EXAMS.typescript = questions.map((bank, i) => ({
    levelId: i + 1,
    title: "Mini examen: " + titles[i],
    passing: 4,
    intro: "Responde las cinco preguntas. Apruebas con cuatro aciertos y puedes repetir el repaso.",
    questions: bank.map(([question, options, answer, explanation]) => ({ question, options, answer, explanation }))
  }));
})();

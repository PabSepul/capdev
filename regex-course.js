/*
  Ruta de expresiones regulares: 3 niveles de 4 módulos sobre regex-lab.js.
  Cada módulo trae su propio texto de prueba en scenario.texto.
*/
(() => {
  "use strict";

  const usa = (code, patron) => patron.test(String(code).replace(/^\s*#.*$/gm, ""));
  const valores = (result) => result.matches.map((m) => m.valor);
  const iguales = (result, esperado) => {
    const encontrados = valores(result);
    return encontrados.length === esperado.length && encontrados.every((v, i) => v === esperado[i]);
  };

  const CONTACTOS = "Escríbenos a soporte@codigocero.cl o a ventas@codigocero.cl.\nTambién puedes llamar al +56 9 8765 4321 entre semana.";
  const FACTURA = "Factura 2024-03-15 por 12900 pesos.\nFactura 2024-04-02 por 8500 pesos.\nFactura 2025-01-20 por 15750 pesos.";
  const REGISTRO = "2026-09-01 INFO inicio del servicio\n2026-09-01 ERROR no se pudo leer config.json\n2026-09-02 WARN memoria al 85%\n2026-09-02 ERROR tiempo de espera agotado";
  const INVENTARIO = "teclado:3\nmouse:0\nmonitor:12\ncable:7";
  const NOMBRES = "ana perez, LUIS SOTO, María Díaz, jose ramirez";
  const PEDIDOS = "Pedido 2024 confirmado.\nPedido 2025 pendiente.\nOrden 8899 lista.\nCódigo de retiro: 4321.\nSucursal 77, caja 5.";

  const lesson = (datos) => ({
    duration: "14 min",
    file: "patron.regex · texto de prueba",
    success: "Patrón resuelto. Fíjate en qué coincide y en qué queda fuera antes de avanzar.",
    ...datos
  });

  const lessons = [
    lesson({
      title: "Encuentra un texto literal",
      shortTitle: "Coincidencia literal",
      difficulty: "Inicio",
      intro: "Una expresión regular describe un patrón de búsqueda. El patrón más simple es el texto exacto que quieres encontrar.",
      example: "/correo/g",
      explanation: "El patrón va entre barras y las banderas después de la última. La bandera g busca todas las coincidencias, no solo la primera; i deja de distinguir mayúsculas de minúsculas. Este laboratorio usa el motor del navegador, el mismo sabor que JavaScript.",
      concepts: [
        "El patrón se escribe entre barras: /texto/.",
        "g devuelve todas las coincidencias.",
        "i ignora la diferencia entre mayúsculas y minúsculas."
      ],
      goal: "Encuentra las dos apariciones de codigocero sin distinguir mayúsculas. Deben ser exactamente 2.",
      hints: [
        "Escribe la palabra tal cual entre barras.",
        "Agrega la bandera g para que no se detenga en la primera.",
        "Agrega también i por si el texto la escribiera distinto: /codigocero/gi."
      ],
      starter: "/soporte/",
      scenario: { texto: CONTACTOS },
      checks: [
        { label: "Usas la bandera g", test: (code, result) => result.flags.includes("g") },
        { label: "Buscas la palabra codigocero", test: (code, result) => /codigocero/i.test(result.pattern) },
        { label: "Encuentra exactamente 2 coincidencias", test: (code, result) => result.matches.length === 2 }
      ]
    }),
    lesson({
      title: "Describe tipos de carácter",
      shortTitle: "Clases y \\d",
      difficulty: "Inicio",
      intro: "Casi nunca buscas un texto exacto: buscas “un número”, “una letra” o “un espacio”. Para eso existen las clases de caracteres.",
      example: "/\\d/g",
      explanation: "\\d representa un dígito, \\w una letra, número o guion bajo, y \\s un espacio. Entre corchetes puedes armar tu propia clase: [aeiou] coincide con cualquier vocal. Cada clase representa un solo carácter.",
      concepts: [
        "\\d es un dígito; \\w una letra, dígito o guion bajo.",
        "[aeiou] define tu propia lista de caracteres.",
        "Una clase coincide con un carácter, no con una palabra."
      ],
      goal: "Encuentra los cuatro números de exactamente cuatro cifras del texto.",
      hints: [
        "\\d representa un dígito.",
        "Necesitas cuatro seguidos: \\d\\d\\d\\d.",
        "Recuerda la bandera g para encontrarlos todos."
      ],
      starter: "/\\d/g",
      scenario: { texto: PEDIDOS },
      checks: [
        { label: "Usas la clase \\d", test: (code, result) => result.pattern.includes("\\d") },
        { label: "Buscas grupos de cuatro dígitos", test: (code, result) => result.matches.every((m) => m.valor.length === 4) },
        { label: "Encuentra los 4 números", test: (code, result) => result.matches.length === 4 }
      ]
    }),
    lesson({
      title: "Repite con cuantificadores",
      shortTitle: "Cuantificadores",
      difficulty: "Fundamentos",
      intro: "Escribir \\d\\d\\d\\d funciona, pero no escala. Los cuantificadores indican cuántas veces se repite lo anterior.",
      example: "/\\d{4}/g",
      explanation: "+ significa una o más veces, * cero o más, ? cero o una, y {n} exactamente n. También existe {n,m} para un rango. El cuantificador siempre se aplica a lo que está inmediatamente antes.",
      concepts: [
        "{4} repite exactamente cuatro veces.",
        "+ pide al menos una repetición.",
        "El cuantificador afecta solo al elemento anterior."
      ],
      goal: "Encuentra los tres montos del texto (12900, 8500 y 15750) usando un cuantificador, sin capturar los años.",
      hints: [
        "Los montos tienen 4 o 5 dígitos y van antes de la palabra pesos.",
        "Los años van pegados a un guion; los montos van seguidos de la palabra pesos.",
        "Si también aparecen los años, apóyate en el texto que los rodea: \\d+ pesos."
      ],
      starter: "/\\d{4}/g",
      scenario: { texto: FACTURA },
      checks: [
        { label: "Usas un cuantificador", test: (code, result) => /[+*?]|\{\d/.test(result.pattern) },
        { label: "Encuentra los tres montos", test: (code, result) => result.matches.length === 3 },
        { label: "Los montos son 12900, 8500 y 15750", test: (code, result) => ["12900", "8500", "15750"].every((monto, i) => result.matches[i]?.valor.includes(monto)) }
      ]
    }),
    lesson({
      title: "Fija dónde empieza y termina",
      shortTitle: "Anclas y límites",
      difficulty: "Fundamentos",
      intro: "A veces importa la posición: una palabra al inicio de la línea, o una palabra completa y no un fragmento de otra.",
      example: "/^Factura/gm",
      explanation: "^ marca el inicio y $ el final. Con la bandera m se aplican a cada línea en vez de a todo el texto. \\b marca un límite de palabra: /\\bcable\\b/ no coincide dentro de cableado.",
      concepts: [
        "^ y $ marcan inicio y final.",
        "La bandera m los aplica línea por línea.",
        "\\b evita coincidencias dentro de otra palabra."
      ],
      goal: "Encuentra las tres líneas que empiezan con Factura, una por línea.",
      hints: [
        "Empieza el patrón con ^.",
        "Agrega la bandera m para que ^ funcione en cada línea.",
        "Con /^Factura/gm deben aparecer tres coincidencias."
      ],
      starter: "/Factura/",
      scenario: { texto: FACTURA },
      checks: [
        { label: "Anclas el patrón al inicio de línea", test: (code, result) => result.pattern.startsWith("^") },
        { label: "Usas las banderas g y m", test: (code, result) => result.flags.includes("g") && result.flags.includes("m") },
        { label: "Encuentra las tres líneas", test: (code, result) => result.matches.length === 3 }
      ]
    }),
    lesson({
      title: "Captura partes del resultado",
      shortTitle: "Grupos",
      difficulty: "Práctica",
      intro: "Encontrar la fecha completa es útil; separar año, mes y día lo es más. Los paréntesis capturan trozos del resultado.",
      example: "/(\\d{4})-(\\d{2})-(\\d{2})/",
      explanation: "Cada par de paréntesis crea un grupo numerado: $1, $2, $3, en el orden en que se abren. La coincidencia completa sigue siendo el texto entero; los grupos son las piezas que puedes reutilizar después.",
      concepts: [
        "Los paréntesis capturan una parte del patrón.",
        "Los grupos se numeran de izquierda a derecha.",
        "La coincidencia completa y los grupos conviven."
      ],
      goal: "Captura año, mes y día de las tres fechas en tres grupos distintos.",
      hints: [
        "Rodea cada bloque de dígitos con paréntesis.",
        "El patrón queda /(\\d{4})-(\\d{2})-(\\d{2})/.",
        "No olvides la bandera g para las tres fechas."
      ],
      starter: "/\\d{4}-\\d{2}-\\d{2}/g",
      scenario: { texto: FACTURA },
      checks: [
        { label: "Encuentra las tres fechas", test: (code, result) => result.matches.length === 3 },
        { label: "Cada coincidencia tiene tres grupos", test: (code, result) => result.matches.every((m) => m.grupos.length === 3) },
        { label: "El primer grupo es el año 2024", test: (code, result) => result.matches[0]?.grupos[0] === "2024" && result.matches[0]?.grupos[1] === "03" }
      ]
    }),
    lesson({
      title: "Elige entre varias opciones",
      shortTitle: "Alternancia",
      difficulty: "Práctica",
      intro: "Un registro mezcla niveles de mensaje. Puedes pedirle al patrón que acepte cualquiera de varias palabras.",
      example: "/(ERROR|WARN)/g",
      explanation: "La barra vertical significa “o”. Conviene encerrarla en un grupo para delimitar hasta dónde llega la alternativa. Si no necesitas capturar, (?:...) agrupa sin ocupar un número de grupo.",
      concepts: [
        "| separa alternativas.",
        "El grupo delimita el alcance de la alternancia.",
        "(?:...) agrupa sin capturar."
      ],
      goal: "Encuentra las tres líneas de nivel ERROR o WARN del registro, sin incluir las de INFO.",
      hints: [
        "Las alternativas son ERROR y WARN.",
        "Enciérralas en un grupo: (ERROR|WARN).",
        "Deben quedar tres coincidencias y ninguna INFO."
      ],
      starter: "/ERROR/g",
      scenario: { texto: REGISTRO },
      checks: [
        { label: "Usas la alternancia con |", test: (code, result) => result.pattern.includes("|") },
        { label: "Encuentra tres coincidencias", test: (code, result) => result.matches.length === 3 },
        { label: "No incluye ninguna línea INFO", test: (code, result) => result.matches.every((m) => !m.valor.includes("INFO")) }
      ]
    }),
    lesson({
      title: "Reescribe con los grupos capturados",
      shortTitle: "Reemplazo",
      difficulty: "Práctica",
      intro: "Los grupos no solo extraen: permiten reordenar el texto. Con ellos puedes cambiar un formato de fecha en una sola operación.",
      example: "reemplazo: $3/$2/$1",
      explanation: "En la línea de reemplazo, $1 se sustituye por el primer grupo, $2 por el segundo y así sucesivamente. El texto original no cambia: el laboratorio muestra el resultado de aplicar la sustitución.",
      concepts: [
        "El reemplazo va en una segunda línea del editor.",
        "$1, $2 y $3 reutilizan lo capturado.",
        "Reemplazar produce un texto nuevo."
      ],
      goal: "Convierte las fechas del formato 2024-03-15 al formato 15/03/2024 usando los tres grupos.",
      hints: [
        "Primero captura año, mes y día como en el módulo anterior.",
        "En la segunda línea escribe: reemplazo: $3/$2/$1",
        "El resultado debe empezar con Factura 15/03/2024."
      ],
      starter: "/(\\d{4})-(\\d{2})-(\\d{2})/g",
      scenario: { texto: FACTURA },
      checks: [
        { label: "Escribes una línea de reemplazo", test: (code, result) => result.reemplazo !== null },
        { label: "Reutilizas los tres grupos", test: (code, result) => ["$1", "$2", "$3"].every((g) => String(result.reemplazo).includes(g)) },
        { label: "Las fechas quedan como 15/03/2024", test: (code, result) => String(result.resultado).includes("15/03/2024") && String(result.resultado).includes("20/01/2025") }
      ]
    }),
    lesson({
      title: "Ponle nombre a cada grupo",
      shortTitle: "Grupos con nombre",
      difficulty: "Práctica",
      intro: "Cuando un patrón crece, recordar qué era $3 se vuelve difícil. Los grupos con nombre documentan el patrón.",
      example: "/(?<usuario>[a-z]+)@(?<dominio>[a-z.]+)/g",
      explanation: "Se escribe ?<nombre> justo después del paréntesis que abre. El grupo sigue teniendo su número, pero además puedes leerlo por su nombre, y quien mantenga el patrón entiende qué guarda cada parte.",
      concepts: [
        "?<nombre> etiqueta un grupo.",
        "El nombre no reemplaza al número: convive con él.",
        "Un patrón con nombres se lee sin descifrarlo."
      ],
      goal: "Extrae los dos correos separando usuario y dominio en grupos llamados usuario y dominio.",
      hints: [
        "La parte antes de la arroba son letras: [a-z]+.",
        "Escribe (?<usuario>[a-z]+) para nombrar el primer grupo.",
        "Haz lo mismo con (?<dominio>[a-z.]+) después de la arroba."
      ],
      starter: "/[a-z]+@[a-z.]+/g",
      scenario: { texto: CONTACTOS },
      checks: [
        { label: "Usas grupos con nombre", test: (code, result) => result.pattern.includes("?<") },
        { label: "Los nombres son usuario y dominio", test: (code, result) => result.matches.every((m) => "usuario" in m.nombrados && "dominio" in m.nombrados) },
        { label: "Separa los dos correos", test: (code, result) => result.matches.length === 2 && result.matches[0].nombrados.usuario === "soporte" && result.matches[1].nombrados.usuario === "ventas" }
      ]
    }),
    lesson({
      title: "Valida un formato completo",
      shortTitle: "Validar formato",
      difficulty: "Integración",
      intro: "Buscar dentro de un texto y validar un dato completo son cosas distintas. Validar exige que todo el valor calce, de principio a fin.",
      example: "/^\\d{4}-\\d{2}-\\d{2}$/",
      explanation: "Sin anclas, /\\d{4}/ encuentra un año dentro de cualquier texto más largo. Con ^ al inicio y $ al final exiges que la línea completa sea la fecha, nada más. Es la diferencia entre buscar y validar.",
      concepts: [
        "Validar exige anclar los dos extremos.",
        "La bandera m aplica las anclas a cada línea.",
        "Un patrón sin anclas acepta texto de sobra."
      ],
      goal: "De las cuatro líneas, encuentra solo las dos que son exactamente una fecha, sin texto adicional.",
      hints: [
        "Ancla el patrón con ^ al comienzo y $ al final.",
        "Usa las banderas g y m para revisar línea por línea.",
        "Deben quedar solo 2026-09-01 y 2026-09-02."
      ],
      starter: "/\\d{4}-\\d{2}-\\d{2}/gm",
      scenario: { texto: "2026-09-01\nfecha: 2026-09-05\n2026-09-02\n2026-9-3" },
      checks: [
        { label: "Anclas el inicio y el final", test: (code, result) => result.pattern.startsWith("^") && result.pattern.endsWith("$") },
        { label: "Revisas línea por línea con m", test: (code, result) => result.flags.includes("m") && result.flags.includes("g") },
        { label: "Solo pasan las dos fechas completas", test: (code, result) => iguales(result, ["2026-09-01", "2026-09-02"]) }
      ]
    }),
    lesson({
      title: "Extrae datos de un registro",
      shortTitle: "Leer un log",
      difficulty: "Integración",
      intro: "Un archivo de registro es texto plano con estructura. Una expresión regular convierte esa estructura en datos utilizables.",
      example: "/^(\\S+) (\\w+) (.+)$/gm",
      explanation: "\\S es cualquier carácter que no sea espacio y . cualquier carácter salvo el salto de línea. Combinando clases, cuantificadores y anclas puedes separar fecha, nivel y mensaje de cada línea en tres grupos.",
      concepts: [
        "\\S+ toma una palabra sin espacios.",
        ".+ toma el resto de la línea.",
        "Tres grupos convierten una línea en tres campos."
      ],
      goal: "Separa las cuatro líneas del registro en tres grupos: fecha, nivel y mensaje.",
      hints: [
        "La fecha no tiene espacios: \\S+ o \\d{4}-\\d{2}-\\d{2}.",
        "El nivel son letras: \\w+.",
        "El mensaje es todo lo que queda: .+ hasta el final de la línea."
      ],
      starter: "/^\\S+/gm",
      scenario: { texto: REGISTRO },
      checks: [
        { label: "Procesa las cuatro líneas", test: (code, result) => result.matches.length === 4 },
        { label: "Cada línea entrega tres grupos", test: (code, result) => result.matches.every((m) => m.grupos.length === 3) },
        { label: "El segundo grupo es el nivel", test: (code, result) => ["INFO", "ERROR", "WARN", "ERROR"].every((nivel, i) => result.matches[i]?.grupos[1] === nivel) }
      ]
    }),
    lesson({
      title: "Excluye y acota lo que tomas",
      shortTitle: "Negación y pereza",
      difficulty: "Integración",
      intro: "Por defecto los cuantificadores son ávidos: toman todo lo que pueden. A veces necesitas justo lo contrario.",
      example: "/[^:]+/g",
      explanation: "Dentro de los corchetes, ^ al inicio invierte la clase: [^:] es cualquier carácter que no sea dos puntos. Agregar ? a un cuantificador lo vuelve perezoso: +? toma lo mínimo necesario en vez de lo máximo.",
      concepts: [
        "[^x] excluye ese carácter.",
        "+? deja de crecer apenas puede.",
        "Ávido y perezoso pueden dar resultados muy distintos."
      ],
      goal: "Del inventario, captura el nombre del producto y su cantidad en dos grupos, sin incluir los dos puntos.",
      hints: [
        "El nombre es todo lo que no sea dos puntos: [^:]+.",
        "La cantidad son dígitos: \\d+.",
        "Ancla cada línea con ^ y $ y usa las banderas g y m."
      ],
      starter: "/.+/gm",
      scenario: { texto: INVENTARIO },
      checks: [
        { label: "Usas una clase negada", test: (code, result) => /\[\^/.test(result.pattern) },
        { label: "Captura los cuatro productos", test: (code, result) => result.matches.length === 4 && result.matches.every((m) => m.grupos.length === 2) },
        { label: "Separa nombre y cantidad", test: (code, result) => result.matches[0]?.grupos[0] === "teclado" && result.matches[0]?.grupos[1] === "3" && result.matches[2]?.grupos[1] === "12" }
      ]
    }),
    lesson({
      title: "Proyecto final: normaliza una lista",
      shortTitle: "Proyecto final",
      difficulty: "Proyecto",
      intro: "Los datos reales llegan sucios: mayúsculas inconsistentes, separadores distintos y espacios de más. Un patrón bien pensado los ordena de una vez.",
      example: "reemplazo: $2 $1",
      explanation: "Combina todo lo aprendido: clases para describir las piezas, grupos para capturarlas, anclas para delimitar y una sustitución para reordenar. El objetivo es que la salida quede lista para usar.",
      concepts: [
        "Captura primero, reordena después.",
        "La bandera i evita duplicar el patrón por las mayúsculas.",
        "Un patrón claro se puede volver a leer dentro de seis meses."
      ],
      goal: "Convierte cada “nombre apellido” de la lista en “apellido, nombre”, sin distinguir mayúsculas.",
      hints: [
        "Cada persona son dos palabras de letras: ([a-záéíóúñ]+).",
        "Agrega la bandera i para aceptar LUIS SOTO y María Díaz.",
        "En el reemplazo escribe: reemplazo: $2, $1"
      ],
      starter: "/[a-z]+ [a-z]+/gi",
      scenario: { texto: NOMBRES },
      checks: [
        { label: "Captura nombre y apellido en dos grupos", test: (code, result) => result.matches.length === 4 && result.matches.every((m) => m.grupos.length === 2) },
        { label: "Acepta mayúsculas y minúsculas", test: (code, result) => result.flags.includes("i") && result.flags.includes("g") },
        { label: "El resultado invierte los cuatro nombres", test: (code, result) => {
          const salida = String(result.resultado || "");
          return salida.includes("perez, ana") && salida.includes("SOTO, LUIS") && salida.includes("Díaz, María") && salida.includes("ramirez, jose");
        } }
      ]
    })
  ];

  lessons.forEach((leccion, indice) => {
    leccion.kicker = "Módulo " + String(indice + 1).padStart(2, "0") + " · Regex";
  });

  globalThis.RegexCourse = {
    name: "Expresiones regulares",
    storageKey: "codigo-cero.regex-v2.completed",
    examsKey: "codigo-cero.regex-v2.exams",
    kind: "regex",
    stages: ["Buscar en el texto", "Capturar y reescribir", "Casos reales"],
    levels: [
      { title: "La búsqueda", description: "Literales, clases, cuantificadores y anclas", modules: lessons.slice(0, 4) },
      { title: "La captura", description: "Grupos, alternancia, reemplazo y nombres", modules: lessons.slice(4, 8) },
      { title: "Los casos reales", description: "Validar, extraer, acotar y normalizar", modules: lessons.slice(8, 12) }
    ],
    lessons
  };
})();

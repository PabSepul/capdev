/* Ruta JSON: doce módulos sobre json-lab.js. Los ocho primeros piden escribir o
   arreglar un documento y se comprueban sobre el valor realmente analizado; los
   cuatro últimos piden escribir un esquema, que el laboratorio pone a prueba
   contra ejemplos que deben pasar y ejemplos que deben fallar. */
(() => {
  "use strict";
  const check = (label, test) => ({ label, test });

  const mismo = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const valorEs = (esperado) => (_, r) => !r.error && mismo(r.valor, esperado);
  const tipoEs = (esperado) => (_, r) => !r.error && r.tipo === esperado;
  const campoEs = (ruta, esperado) => (_, r) => {
    if (r.error) return false;
    let actual = r.valor;
    for (const paso of ruta) {
      if (actual === null || actual === undefined) return false;
      actual = actual[paso];
    }
    return mismo(actual, esperado);
  };
  const declaraObjetoObligatorio = () => (code) =>
    /"type"\s*:\s*"object"/.test(code) && /"required"/.test(code);
  const aceptaTodos = () => (_, r) =>
    !r.error && r.resultados.filter((caso) => caso.debePasar).every((caso) => caso.paso);
  const rechazaTodos = () => (_, r) =>
    !r.error && r.resultados.filter((caso) => !caso.debePasar).every((caso) => !caso.paso);
  const usa = (expresion) => (code) => expresion.test(code);

  function lesson(spec) {
    return {
      duration: "14 min",
      file: "datos.json",
      success: "Documento correcto. Cambia un valor y vuelve a ejecutar para ver cómo cambia la estructura.",
      ...spec
    };
  }

  const CURSO_9 = {
    modo: "esquema",
    validos: [
      { nombre: "un curso con nombre", dato: { nombre: "Python" } },
      { nombre: "un curso con nombre y más campos", dato: { nombre: "SQL", horas: 5 } }
    ],
    invalidos: [
      { nombre: "un objeto sin nombre", dato: { horas: 5 } },
      { nombre: "una lista en vez de un objeto", dato: ["Python"] }
    ]
  };

  const CURSO_10 = {
    modo: "esquema",
    validos: [
      { nombre: "curso completo", dato: { nombre: "Python", horas: 12, activo: true } },
      { nombre: "curso sin el campo opcional", dato: { nombre: "SQL", horas: 5 } }
    ],
    invalidos: [
      { nombre: "horas como texto", dato: { nombre: "Python", horas: "12" } },
      { nombre: "nombre numérico", dato: { nombre: 7, horas: 12 } },
      { nombre: "sin horas", dato: { nombre: "Git" } }
    ]
  };

  const CURSO_11 = {
    modo: "esquema",
    validos: [
      { nombre: "dos etiquetas y nivel válido", dato: { nivel: "inicial", etiquetas: ["web", "datos"] } },
      { nombre: "una etiqueta y nivel avanzado", dato: { nivel: "avanzado", etiquetas: ["ia"] } }
    ],
    invalidos: [
      { nombre: "nivel que no existe", dato: { nivel: "experto", etiquetas: ["web"] } },
      { nombre: "etiquetas vacías", dato: { nivel: "inicial", etiquetas: [] } },
      { nombre: "una etiqueta numérica", dato: { nivel: "inicial", etiquetas: [7] } }
    ]
  };

  const PEDIDO_12 = {
    modo: "esquema",
    validos: [
      { nombre: "pedido correcto", dato: { id: 1001, cliente: "Ana", total: 45000, estado: "pagado", items: ["curso"] } },
      { nombre: "pedido pendiente con dos items", dato: { id: 1002, cliente: "Beto", total: 0, estado: "pendiente", items: ["a", "b"] } }
    ],
    invalidos: [
      { nombre: "falta el cliente", dato: { id: 1003, total: 100, estado: "pagado", items: ["x"] } },
      { nombre: "estado inventado", dato: { id: 1004, cliente: "Ana", total: 100, estado: "listo", items: ["x"] } },
      { nombre: "total negativo", dato: { id: 1005, cliente: "Ana", total: -5, estado: "pagado", items: ["x"] } },
      { nombre: "sin items", dato: { id: 1006, cliente: "Ana", total: 100, estado: "pagado", items: [] } },
      { nombre: "campo de más", dato: { id: 1007, cliente: "Ana", total: 100, estado: "pagado", items: ["x"], color: "azul" } }
    ]
  };

  const lessons = [
    lesson({
      kicker: "Módulo 01 · El formato",
      title: "Un objeto con campos y valores",
      shortTitle: "Primer objeto",
      difficulty: "Inicio",
      intro: "JSON es el formato en que viajan los datos entre programas: entre una API y una página, entre dos servicios, o entre tu programa y un archivo. Es texto, y su gramática es muy corta.",
      example: '{ "nombre": "Ana", "edad": 28 }',
      explanation: "Un objeto va entre llaves y contiene pares de campo y valor separados por dos puntos. El nombre del campo siempre va entre comillas dobles, sin excepción; un texto también. Un número, en cambio, va sin comillas: 28 y \"28\" son valores distintos y esa diferencia importa después.",
      concepts: [
        "Las llaves abren y cierran un objeto.",
        "El nombre del campo siempre va entre comillas dobles.",
        "Un número sin comillas es un número; con comillas es texto."
      ],
      goal: "Escribe un objeto con el campo nombre valiendo «Ana» y el campo edad valiendo el número 28.",
      hints: [
        "Empieza con { y termina con }.",
        'El primer par es "nombre": "Ana".',
        "La edad va sin comillas, porque es un número."
      ],
      starter: '{\n  \n}\n',
      checks: [
        check("El documento tiene los dos campos", valorEs({ nombre: "Ana", edad: 28 })),
        check("La raíz es un objeto", tipoEs("object")),
        check("La edad es un número, no un texto", (_, r) => !r.error && typeof r.valor.edad === "number")
      ]
    }),
    lesson({
      kicker: "Módulo 02 · Tipos",
      title: "Los valores que JSON conoce",
      shortTitle: "Tipos de valor",
      difficulty: "Inicio",
      intro: "JSON tiene exactamente seis tipos de valor y ninguno más. Saber cuáles son evita la mitad de los errores al escribirlo.",
      example: '{ "activo": true, "profesor": null }',
      explanation: "Los tipos son texto, número, booleano, null, objeto y lista. true y false van en minúscula y sin comillas. null significa «este campo existe y su valor es nada»; no es lo mismo que la palabra \"null\" entre comillas, ni que no poner el campo. No hay fechas, ni infinito, ni comentarios.",
      concepts: [
        "true y false se escriben en minúscula y sin comillas.",
        "null es un valor, no un texto.",
        "No existen las fechas: se representan como texto."
      ],
      goal: "Escribe un objeto con curso «Python», horas 12, activo verdadero y profesor sin valor.",
      hints: [
        "El campo activo lleva true, sin comillas.",
        "El campo profesor lleva null, sin comillas.",
        "Las horas son un número entero."
      ],
      starter: '{\n  "curso": "Python"\n}\n',
      checks: [
        check("Están los cuatro campos con su valor", valorEs({ curso: "Python", horas: 12, activo: true, profesor: null })),
        check("activo es un booleano de verdad", (_, r) => !r.error && r.valor.activo === true),
        check("profesor es null, no el texto “null”", (_, r) => !r.error && r.valor.profesor === null)
      ]
    }),
    lesson({
      kicker: "Módulo 03 · Estructura",
      title: "Listas y objetos dentro de un objeto",
      shortTitle: "Anidar valores",
      difficulty: "Inicio",
      intro: "El valor de un campo puede ser, a su vez, una lista o un objeto entero. Ahí es donde JSON deja de ser una tabla plana y empieza a describir datos reales.",
      example: '{ "temas": ["variables", "ciclos"] }',
      explanation: "Una lista va entre corchetes, con sus elementos separados por comas. Un objeto anidado va entre llaves, igual que el de arriba. No hay límite práctico de anidamiento, pero cada nivel que agregas es un nivel más que alguien tendrá que recorrer para leer el dato.",
      concepts: [
        "Los corchetes son para listas; las llaves, para objetos.",
        "El último elemento no lleva coma detrás.",
        "Anidar de más hace los datos difíciles de recorrer."
      ],
      goal: "Escribe un curso con su nombre, una lista de tres temas —variables, ciclos y funciones— y un objeto autor con nombre y correo.",
      hints: [
        'La lista se escribe "temas": ["variables", "ciclos", "funciones"].',
        'El autor es un objeto: "autor": { "nombre": ..., "correo": ... }.',
        "Cuidado con la coma sobrante después del último elemento."
      ],
      starter: '{\n  "curso": "Python"\n}\n',
      checks: [
        check("El curso trae sus tres temas", campoEs(["temas"], ["variables", "ciclos", "funciones"])),
        check("El autor es un objeto con nombre y correo", (_, r) => {
          if (r.error || !r.valor.autor || typeof r.valor.autor !== "object") return false;
          return typeof r.valor.autor.nombre === "string" && typeof r.valor.autor.correo === "string";
        }),
        check("Conserva el nombre del curso", campoEs(["curso"], "Python"))
      ]
    }),
    lesson({
      kicker: "Módulo 04 · Errores",
      title: "Arregla un documento que no compila",
      shortTitle: "Arreglar JSON",
      difficulty: "Fundamentos",
      intro: "La mayoría de los problemas con JSON son tres: comillas simples, una coma de más al final y un nombre de campo sin comillas. Reconocerlos de un vistazo ahorra mucho tiempo.",
      example: '{ "a": 1, }   ← la coma sobra',
      explanation: "JSON es más estricto que JavaScript a propósito: al no permitir comas finales ni comillas simples, cualquier programa en cualquier lenguaje lo lee igual. El laboratorio te dice la línea, la columna y qué esperaba encontrar; leer ese mensaje antes de adivinar es la costumbre que conviene tomar.",
      concepts: [
        "JSON no admite comillas simples en ningún lugar.",
        "Una coma antes de } o de ] siempre sobra.",
        "El mensaje de error trae la línea y la columna exactas."
      ],
      goal: "Arregla el documento para que quede con nombre «SQL», horas 5 y activo falso.",
      hints: [
        "Los nombres de campo van entre comillas dobles.",
        "Revisa la coma que quedó antes de la llave de cierre.",
        "false va en minúscula y sin comillas."
      ],
      starter: "{\n  'nombre': 'SQL',\n  horas: 5,\n  \"activo\": False,\n}\n",
      checks: [
        check("El documento ya se puede leer", (_, r) => !r.error),
        check("Los valores son los pedidos", valorEs({ nombre: "SQL", horas: 5, activo: false })),
        check("No quedaron comillas simples", (code) => !/'/.test(code))
      ]
    }),
    lesson({
      kicker: "Módulo 05 · Registros",
      title: "Una lista de objetos con la misma forma",
      shortTitle: "Lista de registros",
      difficulty: "Fundamentos",
      intro: "Casi todos los datos que llegan de una API tienen esta forma: una lista donde cada elemento es un objeto con los mismos campos. Es una tabla escrita en texto.",
      example: '[{ "id": 1, "nombre": "Python" }, ...]',
      explanation: "Que todos los elementos compartan la misma forma no lo exige el formato: lo exige quien va a leerlos. Un registro al que le falta un campo obliga a comprobarlo en cada vuelta del ciclo. Mantener la forma constante es lo que hace la lista fácil de recorrer.",
      concepts: [
        "La raíz del documento puede ser una lista, no solo un objeto.",
        "El formato no obliga a que los registros sean iguales; quien los lee, sí.",
        "Un identificador por registro permite referirse a uno en concreto."
      ],
      goal: "Escribe una lista con tres cursos, cada uno con id, nombre y horas: Python 12, SQL 5 y Git 4.",
      hints: [
        "El documento completo va entre corchetes.",
        "Cada curso es un objeto entre llaves, separado por coma.",
        "Los identificadores son 1, 2 y 3."
      ],
      starter: '[\n  \n]\n',
      checks: [
        check("La lista trae los tres cursos", valorEs([
          { id: 1, nombre: "Python", horas: 12 },
          { id: 2, nombre: "SQL", horas: 5 },
          { id: 3, nombre: "Git", horas: 4 }
        ])),
        check("La raíz es una lista", tipoEs("array")),
        check("Los tres registros tienen los mismos campos", (_, r) => {
          if (r.error || !Array.isArray(r.valor)) return false;
          const forma = (o) => Object.keys(o).sort().join(",");
          return r.valor.length === 3 && r.valor.every((o) => forma(o) === "horas,id,nombre");
        })
      ]
    }),
    lesson({
      kicker: "Módulo 06 · Ausencias",
      title: "Sin dato no es lo mismo que sin campo",
      shortTitle: "null y ausencia",
      difficulty: "Fundamentos",
      intro: "Tres personas: una tiene teléfono, otra declaró que no tiene, y de la tercera nadie preguntó. Son tres situaciones distintas y el documento tiene que distinguirlas.",
      example: '{ "telefono": null }  ≠  { }',
      explanation: "null dice «este dato existe como pregunta y la respuesta es nada». Omitir el campo dice «aquí no hay información sobre esto». Un programa que trate ambos casos igual va a perder información: el primero se puede mostrar como «sin teléfono» y el segundo como «no consultado». Decidirlo al diseñar los datos evita discusiones después.",
      concepts: [
        "null es una respuesta; la ausencia del campo es una falta de respuesta.",
        "Quien lee tiene que comprobar las dos cosas por separado.",
        "Elegir una de las dos y ser consistente vale más que mezclarlas."
      ],
      goal: "Escribe una lista con Ana y su teléfono +56911111111, Beto con teléfono null, y Carla sin el campo teléfono.",
      hints: [
        "Ana lleva su número como texto entre comillas.",
        "Beto lleva null, sin comillas.",
        "Carla solo lleva el campo nombre."
      ],
      starter: '[\n  { "nombre": "Ana" },\n  { "nombre": "Beto" },\n  { "nombre": "Carla" }\n]\n',
      checks: [
        check("Los tres casos quedan distintos", valorEs([
          { nombre: "Ana", telefono: "+56911111111" },
          { nombre: "Beto", telefono: null },
          { nombre: "Carla" }
        ])),
        check("Beto tiene el campo con valor null", (_, r) =>
          !r.error && Object.prototype.hasOwnProperty.call(r.valor[1], "telefono") && r.valor[1].telefono === null),
        check("Carla no tiene el campo", (_, r) =>
          !r.error && !Object.prototype.hasOwnProperty.call(r.valor[2], "telefono"))
      ]
    }),
    lesson({
      kicker: "Módulo 07 · Tipos correctos",
      title: "Cuándo un número tiene que ser texto",
      shortTitle: "Número o texto",
      difficulty: "Práctica",
      intro: "Un código de producto que empieza con cero y un precio son los dos «números», pero solo uno se puede sumar. Elegir mal el tipo rompe los datos de formas difíciles de rastrear.",
      example: '{ "codigo": "0074", "precio": 45000 }',
      explanation: "Si un valor se va a sumar, promediar o comparar por tamaño, es un número. Si es un identificador —un código, un RUT, un número de teléfono— es texto, aunque solo tenga dígitos: los ceros de la izquierda se pierden al guardarlo como número y JSON ni siquiera permite escribirlos. La pregunta útil no es «¿parece un número?» sino «¿tiene sentido sumarlo?».",
      concepts: [
        "Si se suma o se compara por tamaño, es número.",
        "Un identificador es texto aunque solo tenga dígitos.",
        "JSON no admite un cero a la izquierda en un número."
      ],
      goal: "Escribe un producto con código «0074» como texto, precio 45000, descuento 0.15 y unidades 3.",
      hints: [
        "El código conserva su cero inicial solo si va entre comillas.",
        "El descuento es un decimal: se escribe con punto, 0.15.",
        "Precio y unidades son números que sí se van a sumar."
      ],
      starter: '{\n  "codigo": 74,\n  "precio": "45000"\n}\n',
      checks: [
        check("Los cuatro campos tienen su valor", valorEs({ codigo: "0074", precio: 45000, descuento: 0.15, unidades: 3 })),
        check("El código conserva su cero inicial como texto", (_, r) => !r.error && r.valor.codigo === "0074"),
        check("Precio y unidades son números", (_, r) =>
          !r.error && typeof r.valor.precio === "number" && typeof r.valor.unidades === "number")
      ]
    }),
    lesson({
      kicker: "Módulo 08 · Documentos reales",
      title: "Un pedido completo",
      shortTitle: "Documento anidado",
      difficulty: "Práctica",
      intro: "Los documentos de verdad combinan todo: un objeto arriba, otro adentro, una lista de líneas y un total. Este es el aspecto de lo que devuelve una API.",
      example: '{ "cliente": { … }, "items": [ … ] }',
      explanation: "El cliente es un objeto porque tiene varios datos que van juntos. Los items son una lista porque hay una cantidad variable. El total es un número calculado a partir de los items: guardarlo es cómodo para quien lee, pero implica que alguien tiene que mantenerlo consistente cuando los items cambien.",
      concepts: [
        "Un objeto agrupa datos que van juntos; una lista, una cantidad variable.",
        "Un valor calculado y guardado hay que mantenerlo al día.",
        "La forma del documento es una decisión de diseño, no un detalle."
      ],
      goal: "Escribe el pedido 1001 de Ana (con su correo), con dos items —Python a 45000 y SQL a 30000— y el total 75000.",
      hints: [
        'El cliente es "cliente": { "nombre": ..., "correo": ... }.',
        "Cada item es un objeto con curso y precio, dentro de una lista.",
        "El total es la suma de los dos precios."
      ],
      starter: '{\n  "id": 1001\n}\n',
      checks: [
        check("El pedido completo es correcto", valorEs({
          id: 1001,
          cliente: { nombre: "Ana", correo: "ana@ejemplo.cl" },
          items: [{ curso: "Python", precio: 45000 }, { curso: "SQL", precio: 30000 }],
          total: 75000
        })),
        check("El cliente va como objeto anidado", (_, r) =>
          !r.error && r.valor.cliente !== null && typeof r.valor.cliente === "object" && !Array.isArray(r.valor.cliente)),
        check("El total coincide con la suma de los items", (_, r) =>
          !r.error && Array.isArray(r.valor.items)
          && r.valor.items.reduce((suma, item) => suma + item.precio, 0) === r.valor.total)
      ]
    }),
    lesson({
      kicker: "Módulo 09 · Contratos",
      title: "Escribe la regla, no el dato",
      shortTitle: "Primer esquema",
      difficulty: "Práctica",
      intro: "Hasta aquí escribiste documentos. Ahora vas a escribir la regla que decide si un documento sirve: un esquema. Es JSON que describe cómo tiene que ser otro JSON.",
      example: '{ "type": "object", "required": ["nombre"] }',
      explanation: "type dice qué clase de valor se espera en la raíz, y required enumera los campos que no pueden faltar. El laboratorio prueba tu esquema contra ejemplos que deben aceptarse y ejemplos que deben rechazarse: un contrato que acepta todo no sirve, y uno que rechaza todo tampoco. Sirve el que distingue.",
      concepts: [
        "Un esquema es un documento JSON que describe otro.",
        "required enumera los campos obligatorios.",
        "Un contrato se juzga por lo que rechaza, no solo por lo que acepta."
      ],
      goal: "Escribe un esquema que exija un objeto con el campo nombre: debe aceptar los dos primeros ejemplos y rechazar los dos últimos.",
      hints: [
        'El tipo de la raíz es "object".',
        'required es una lista: ["nombre"].',
        "Un esquema sin type acepta también la lista, y ahí falla el último caso."
      ],
      starter: '{\n  \n}\n',
      scenario: CURSO_9,
      checks: [
        check("Acepta los dos ejemplos válidos", aceptaTodos()),
        check("Rechaza los dos ejemplos inválidos", rechazaTodos()),
        check("Declara el tipo y el campo obligatorio", declaraObjetoObligatorio())
      ]
    }),
    lesson({
      kicker: "Módulo 10 · Tipos por campo",
      title: "Cada campo con su tipo",
      shortTitle: "properties",
      difficulty: "Avanzado",
      intro: "Exigir que un campo exista es la mitad del contrato. La otra mitad es exigir que traiga el tipo correcto: unas horas escritas como texto rompen cualquier suma.",
      example: '"properties": { "horas": { "type": "number" } }',
      explanation: "properties asocia cada campo con su propio esquema, y ese esquema se aplica solo si el campo está presente. Por eso un campo que aparece en properties pero no en required es opcional: si viene, tiene que cumplir; si no viene, no pasa nada. Separar «tiene que estar» de «tiene que ser así» es lo que hace útil el contrato.",
      concepts: [
        "properties describe el tipo de cada campo por separado.",
        "Estar en properties no vuelve obligatorio a un campo.",
        "required y properties se combinan: uno exige, el otro describe."
      ],
      goal: "Exige nombre como texto y horas como número, ambos obligatorios, y describe activo como booleano opcional.",
      hints: [
        'Cada campo se describe con { "type": ... } dentro de properties.',
        'required lleva ["nombre", "horas"], pero no activo.',
        "El ejemplo con horas como texto tiene que quedar rechazado."
      ],
      starter: '{\n  "type": "object",\n  "required": [],\n  "properties": {\n    \n  }\n}\n',
      scenario: CURSO_10,
      checks: [
        check("Acepta los dos ejemplos válidos", aceptaTodos()),
        check("Rechaza los tres ejemplos inválidos", rechazaTodos()),
        check("Describe los campos con properties", usa(/"properties"/))
      ]
    }),
    lesson({
      kicker: "Módulo 11 · Listas y valores",
      title: "Restringe lo que puede venir adentro",
      shortTitle: "items y enum",
      difficulty: "Avanzado",
      intro: "Una lista de etiquetas donde se cuela un número, o un nivel que dice «experto» cuando solo existen dos niveles: dos errores que un contrato puede atrapar antes de que lleguen a la base de datos.",
      example: '"items": { "type": "string" }, "minItems": 1',
      explanation: "items describe cómo tiene que ser cada elemento de una lista, y minItems exige una cantidad mínima. enum enumera los únicos valores permitidos para un campo, que es la forma más directa de convertir una convención del equipo en una regla verificable. Los tres se combinan con lo que ya sabes.",
      concepts: [
        "items se aplica a cada elemento de la lista.",
        "minItems evita que llegue una lista vacía.",
        "enum cierra la lista de valores posibles de un campo."
      ],
      goal: "Exige nivel dentro de inicial o avanzado, y etiquetas como una lista de al menos un texto.",
      hints: [
        'enum es una lista: ["inicial", "avanzado"].',
        'Las etiquetas son { "type": "array", "items": { "type": "string" } }.',
        "Agrega minItems para rechazar la lista vacía."
      ],
      starter: '{\n  "type": "object",\n  "required": ["nivel", "etiquetas"],\n  "properties": {\n    \n  }\n}\n',
      scenario: CURSO_11,
      checks: [
        check("Acepta los dos ejemplos válidos", aceptaTodos()),
        check("Rechaza los tres ejemplos inválidos", rechazaTodos()),
        check("Restringe los valores y el contenido de la lista", (code) =>
          /"enum"/.test(code) && /"items"/.test(code))
      ]
    }),
    lesson({
      kicker: "Módulo 12 · Proyecto",
      title: "El contrato de un pedido",
      shortTitle: "Contrato completo",
      difficulty: "Proyecto",
      duration: "22 min",
      intro: "Último módulo: siete ejemplos, dos que deben pasar y cinco que deben fallar, cada uno por un motivo distinto. El contrato tiene que distinguirlos todos.",
      example: '"additionalProperties": false',
      explanation: "additionalProperties en false cierra el objeto: cualquier campo que no esté descrito se rechaza. Es la diferencia entre «al menos esto» y «exactamente esto», y conviene decidirlo a conciencia, porque cerrar el contrato hace más difícil agregar campos después. minimum acota un número por abajo y minLength exige que un texto no llegue vacío.",
      concepts: [
        "additionalProperties: false rechaza cualquier campo no descrito.",
        "Cerrar el contrato protege hoy y estorba mañana: es una decisión.",
        "Cada regla del esquema atrapa un error concreto."
      ],
      goal: "Escribe el contrato del pedido: id entero, cliente no vacío, total no negativo, estado dentro de pendiente, pagado o anulado, y al menos un item de texto. Sin campos de más.",
      hints: [
        'El id es "integer" y el total lleva "minimum": 0.',
        'El cliente lleva "minLength": 1 para rechazar un texto vacío.',
        "additionalProperties en false es lo que atrapa el campo de más."
      ],
      starter: '{\n  "type": "object",\n  "required": [],\n  "properties": {\n    \n  }\n}\n',
      scenario: PEDIDO_12,
      success: "Ruta terminada: sabes leer, escribir y sobre todo verificar datos antes de confiar en ellos.",
      checks: [
        check("Acepta los dos pedidos correctos", aceptaTodos()),
        check("Rechaza los cinco pedidos con problemas", rechazaTodos()),
        check("Cierra el contrato y acota los valores", (code) =>
          /"additionalProperties"\s*:\s*false/.test(code) && /"minimum"/.test(code))
      ]
    })
  ];

  const titles = ["El formato", "Los datos reales", "El contrato"];
  const descriptions = [
    "Objetos, tipos, anidamiento y errores",
    "Registros, ausencias y tipos correctos",
    "Esquemas que aceptan y rechazan"
  ];

  globalThis.JsonCourse = {
    name: "JSON",
    kind: "json",
    storageKey: "codigo-cero.json-v2.completed",
    examsKey: "codigo-cero.json-v2.exams",
    stages: titles,
    levels: titles.map((title, i) => ({ title, description: descriptions[i], modules: lessons.slice(i * 4, i * 4 + 4) })),
    lessons
  };

  const questions = [
    [
      ["¿Cómo se escribe el nombre de un campo en JSON?", ["Sin comillas", "Entre comillas simples", "Entre comillas dobles", "Con dos puntos delante"], 2, "No hay excepciones: siempre comillas dobles."],
      ["¿Qué diferencia hay entre 28 y \"28\"?", ["Ninguna", "El primero es un número y el segundo un texto", "El segundo es más rápido", "El primero no es válido"], 1, "Solo el número se puede sumar o comparar por tamaño."],
      ["¿Cuáles son los valores booleanos en JSON?", ["True y False", "true y false", "\"true\" y \"false\"", "1 y 0"], 1, "En minúscula y sin comillas."],
      ["¿Qué significa null?", ["Que el campo no existe", "Que el valor del campo es nada", "Cero", "Un texto vacío"], 1, "Es un valor: distinto de omitir el campo y distinto de \"\"."],
      ["¿Qué delimita una lista?", ["Llaves", "Corchetes", "Paréntesis", "Comillas"], 1, "Las llaves son para objetos; los corchetes, para listas."]
    ],
    [
      ["¿Por qué JSON no admite una coma antes de }?", ["Por rendimiento", "Porque su gramática es estricta a propósito", "Porque la coma es opcional", "Por compatibilidad con XML"], 1, "Al ser estricto, cualquier lenguaje lo lee igual."],
      ["¿Puede la raíz de un documento ser una lista?", ["No, siempre es un objeto", "Sí", "Solo si tiene un elemento", "Solo en APIs"], 1, "Un documento contiene un valor, y ese valor puede ser una lista."],
      ["¿Cuál es la diferencia entre un campo en null y un campo ausente?", ["Ninguna", "null es una respuesta; la ausencia es falta de respuesta", "null ocupa más espacio", "El ausente vale cero"], 1, "Tratarlos igual pierde información que puede importar."],
      ["Un código de producto que empieza con cero, ¿qué tipo debe tener?", ["Número", "Texto", "Booleano", "null"], 1, "Como número perdería el cero inicial, y JSON ni siquiera permite escribirlo."],
      ["¿Qué pregunta ayuda a elegir entre número y texto?", ["¿Es corto?", "¿Tiene sentido sumarlo?", "¿Viene de una API?", "¿Cabe en la pantalla?"], 1, "Los identificadores no se suman, aunque estén hechos de dígitos."]
    ],
    [
      ["¿Qué es un esquema?", ["Un documento de ejemplo", "Un JSON que describe cómo debe ser otro JSON", "Una base de datos", "Un comentario"], 1, "Se escribe en el mismo formato que los datos que valida."],
      ["¿Qué hace required?", ["Describe el tipo de un campo", "Enumera los campos que no pueden faltar", "Ordena los campos", "Rechaza campos de más"], 1, "El tipo lo describe properties; la obligatoriedad, required."],
      ["Si un campo está en properties pero no en required…", ["Es obligatorio", "Es opcional, pero si viene tiene que cumplir su tipo", "Se ignora", "Da error"], 1, "Separar «tiene que estar» de «tiene que ser así» es lo útil del contrato."],
      ["¿Para qué sirve enum?", ["Para contar", "Para enumerar los únicos valores permitidos", "Para ordenar", "Para dar un valor por defecto"], 1, "Convierte una convención del equipo en una regla verificable."],
      ["¿Qué implica additionalProperties en false?", ["Que el objeto puede estar vacío", "Que cualquier campo no descrito se rechaza", "Que todos los campos son obligatorios", "Que no se admiten listas"], 1, "Protege hoy y estorba al agregar campos mañana: es una decisión, no un default obvio."]
    ]
  ];

  globalThis.StarterExams.LEVEL_EXAMS.json = questions.map((bank, i) => ({
    levelId: i + 1,
    title: "Mini examen: " + titles[i],
    passing: 4,
    intro: "Responde las cinco preguntas. Apruebas con cuatro aciertos y puedes repetir el repaso.",
    questions: bank.map(([question, options, answer, explanation]) => ({ question, options, answer, explanation }))
  }));
})();

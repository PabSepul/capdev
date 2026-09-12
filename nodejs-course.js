/* Ruta Node.js: doce módulos sobre node-lab.js. El JavaScript se ejecuta de
   verdad con el intérprete del sitio; lo simulado es el entorno de Node —los
   archivos, los módulos y el servidor—, y cada solución de referencia se
   contrasta con Node.js real en route-nodejs.test.mjs. */
(() => {
  "use strict";
  const check = (label, test) => ({ label, test });

  const salidaExacta = (...esperado) => (_, r) =>
    r.output.length === esperado.length && esperado.every((linea, i) => r.output[i] === linea);
  const imprime = (texto) => (_, r) => r.output.includes(texto);
  const archivo = (nombre, contenido) => (_, r) => r.files["/proyecto/" + nombre] === contenido;
  const responde = (indice, status, cuerpo) => (_, r) => {
    const respuesta = r.respuestas[indice];
    if (!respuesta || respuesta.status !== status) return false;
    return cuerpo === undefined || respuesta.body === cuerpo;
  };
  const tipoRespuesta = (indice, tipo) => (_, r) =>
    Boolean(r.respuestas[indice]) && r.respuestas[indice].headers["content-type"] === tipo;
  const usa = (expresion) => (code) => expresion.test(code);
  const ambos = (primera, segunda) => (code, r) => primera(code, r) && segunda(code, r);

  function lesson(spec) {
    return {
      duration: "16 min",
      file: "app.cjs",
      success: "Funciona. Este mismo archivo, ejecutado con node app.cjs en tu computador, daría el mismo resultado.",
      ...spec
    };
  }

  const lessons = [
    lesson({
      kicker: "Módulo 01 · Argumentos",
      title: "Un programa que recibe datos al arrancar",
      shortTitle: "process.argv",
      difficulty: "Inicio",
      intro: "Node ejecuta JavaScript fuera del navegador: no hay página, no hay botones, hay una orden escrita en la terminal. Lo que escribes después del nombre del archivo llega a tu programa.",
      example: "node app.cjs 90",
      explanation: "process.argv es una lista. La posición 0 es el ejecutable de Node, la 1 es tu archivo y desde la 2 vienen tus datos. Todo llega como texto, así que hay que convertirlo antes de calcular: sin Number, dividir un texto entre 60 puede darte resultados que no esperas.",
      concepts: [
        "process.argv[2] es el primer dato que tú entregas.",
        "Los argumentos siempre llegan como texto.",
        "Number convierte ese texto en un número utilizable."
      ],
      goal: "Convierte los 90 minutos que llegan como argumento en horas y muestra 1.5.",
      hints: [
        "El dato está en process.argv[2].",
        "Number(process.argv[2]) lo transforma en número.",
        "Una hora tiene 60 minutos: divide, no multipliques."
      ],
      starter: 'console.log(process.argv);\n\n// 1. Toma el primer argumento que entregó la persona\n// 2. Conviértelo a número\n// 3. Muestra cuántas horas son\n',
      scenario: { argv: ["90"] },
      checks: [
        check("Muestra 1.5 y nada más", salidaExacta("1.5")),
        check("Lee el argumento en vez de escribir el número", usa(/process\.argv\s*\[\s*2\s*\]/)),
        check("Convierte el texto a número", usa(/\bNumber\s*\(/))
      ]
    }),
    lesson({
      kicker: "Módulo 02 · Lectura",
      title: "Abre un archivo de texto",
      shortTitle: "fs.readFileSync",
      difficulty: "Inicio",
      intro: "Un programa de Node puede leer los archivos de su carpeta. Eso es lo primero que no puede hacer el JavaScript del navegador, y es la razón por la que Node existe.",
      example: 'fs.readFileSync("notas.txt", "utf8")',
      explanation: "require carga un módulo integrado; node:fs es el de archivos y no se instala con npm. readFileSync devuelve el contenido completo. La codificación \"utf8\" es obligatoria si quieres texto: sin ella Node entrega un Buffer, que son bytes en bruto. trim quita el salto de línea final, que si no cuenta como una línea vacía de más.",
      concepts: [
        "require(\"node:fs\") carga el módulo de archivos.",
        "Sin \"utf8\" recibes bytes, no texto.",
        "El salto de línea final crea una línea vacía si no lo quitas."
      ],
      goal: "Muestra cuántas tareas hay en notas.txt (3) y luego la primera de ellas.",
      hints: [
        'Carga el módulo con const fs = require("node:fs").',
        'Lee el archivo con fs.readFileSync("notas.txt", "utf8").',
        'Usa .trim() antes de separar con .split("\\n") para no contar una línea vacía.'
      ],
      starter: '// notas.txt está en la carpeta del proyecto\n\n// 1. Carga el módulo de archivos\n// 2. Lee notas.txt como texto\n// 3. Muestra cuántas líneas tiene y cuál es la primera\n',
      checks: [
        check("Muestra 3 y la primera tarea", salidaExacta("3", "Revisar el informe")),
        check("Lee el archivo con el módulo de Node", usa(/require\(\s*["']node:fs["']\s*\)/)),
        check("Pide el contenido como texto", usa(/["']utf-?8["']/))
      ]
    }),
    lesson({
      kicker: "Módulo 03 · Escritura",
      title: "Deja un archivo nuevo en la carpeta",
      shortTitle: "fs.writeFileSync",
      difficulty: "Inicio",
      intro: "Leer sirve para mirar; escribir sirve para dejar resultados. Un script que genera un resumen y lo guarda es, literalmente, la mitad de las herramientas internas de cualquier equipo.",
      example: 'fs.writeFileSync("resumen.txt", "Tareas: 3\\n")',
      explanation: "writeFileSync crea el archivo o reemplaza su contenido completo, sin avisar. Para agregar al final está appendFileSync. Solo escribe texto: un número o un objeto hay que convertirlos antes. Fíjate en el salto de línea final, que es la convención en archivos de texto.",
      concepts: [
        "writeFileSync reemplaza todo el contenido anterior.",
        "appendFileSync agrega al final en vez de reemplazar.",
        "Solo se escribe texto: convierte los números antes de guardarlos."
      ],
      goal: "Cuenta las tareas de notas.txt y guarda en resumen.txt la línea «Tareas: 3» con su salto de línea. Muestra después el contenido guardado.",
      hints: [
        "Reutiliza la lectura del módulo anterior para contar las líneas.",
        'El contenido a guardar es "Tareas: " + cantidad + "\\n".',
        "Vuelve a leer resumen.txt para comprobar lo que quedó escrito."
      ],
      starter: 'const fs = require("node:fs");\n\n// 1. Cuenta las tareas de notas.txt\n// 2. Guarda "Tareas: 3" en resumen.txt, con salto de línea al final\n// 3. Muestra lo que quedó guardado\n',
      checks: [
        check("resumen.txt contiene la línea exacta", archivo("resumen.txt", "Tareas: 3\n")),
        check("Muestra el contenido guardado", imprime("Tareas: 3")),
        check("No modifica notas.txt", (_, r) => r.escritos.indexOf("/proyecto/notas.txt") === -1)
      ]
    }),
    lesson({
      kicker: "Módulo 04 · JSON",
      title: "Datos estructurados, no solo texto",
      shortTitle: "JSON.parse",
      difficulty: "Fundamentos",
      intro: "JSON es el formato en que viajan casi todos los datos entre programas. En el disco es texto; para recorrerlo con un for tiene que volver a ser una lista de objetos.",
      example: "JSON.parse(fs.readFileSync(ruta, \"utf8\"))",
      explanation: "JSON.parse convierte el texto en valores de JavaScript, y JSON.stringify hace el camino inverso cuando quieras guardarlo. Un archivo JSON mal formado —una coma de más, una comilla simple— hace fallar el parse: por eso conviene revisar el error antes de culpar al código que viene después.",
      concepts: [
        "En el disco, un JSON es texto; en memoria, objetos y listas.",
        "JSON.parse falla si el texto está mal formado.",
        "JSON.stringify es el camino de vuelta, para guardar."
      ],
      goal: "Lee cursos.json y muestra cuántos cursos hay (3) y la suma total de horas (21).",
      hints: [
        "Primero lee el archivo como texto, igual que antes.",
        "JSON.parse lo convierte en una lista de objetos.",
        "Recorre la lista sumando la propiedad horas de cada curso."
      ],
      starter: 'const fs = require("node:fs");\n\n// 1. Lee cursos.json y conviértelo con JSON.parse\n// 2. Muestra cuántos cursos hay\n// 3. Muestra la suma de todas las horas\n',
      checks: [
        check("Muestra 3 cursos y 21 horas", salidaExacta("3", "21")),
        check("Interpreta el archivo como JSON", usa(/JSON\.parse\s*\(/)),
        check("Suma recorriendo los datos, sin escribir 21", usa(/\bhoras\b/))
      ]
    }),
    lesson({
      kicker: "Módulo 05 · Módulos",
      title: "Usa código que vive en otro archivo",
      shortTitle: "require propio",
      difficulty: "Fundamentos",
      intro: "Un archivo de dos mil líneas es imposible de mantener. Node deja repartir el código en archivos que se piden entre sí, y ese es el mecanismo sobre el que se construye todo lo demás.",
      example: 'const mayusculas = require("./formato.js");',
      explanation: "En CommonJS, cada archivo decide qué entrega asignándolo a module.exports; lo que no esté ahí es privado. Al pedirlo con require se ejecuta una sola vez y el resultado queda en caché: pedirlo diez veces no lo ejecuta diez veces. El ./ del inicio es lo que distingue un archivo tuyo de un paquete instalado.",
      concepts: [
        "module.exports define qué entrega el archivo.",
        "El ./ indica que es un archivo tuyo, no un paquete.",
        "Un módulo se ejecuta una sola vez, aunque lo pidas varias."
      ],
      goal: "Usa la función que exporta formato.js para mostrar «HOLA NODE».",
      hints: [
        'formato.js exporta una función directamente: require("./formato.js") te la entrega.',
        "Guárdala en una variable y llámala como cualquier función.",
        'El texto que debes transformar es "hola node".'
      ],
      starter: '// formato.js ya existe en la carpeta y exporta una función.\n// Ábrelo mentalmente: termina con module.exports = mayusculas;\n\n// 1. Pide ese módulo\n// 2. Úsalo con el texto "hola node"\n',
      checks: [
        check("Muestra HOLA NODE", salidaExacta("HOLA NODE")),
        check("Pide el módulo local con ./", usa(/require\(\s*["']\.\/formato(\.js)?["']\s*\)/)),
        check("Usa la función en vez de escribir el texto en mayúsculas", usa(/["']hola node["']/i))
      ]
    }),
    lesson({
      kicker: "Módulo 06 · Exportar",
      title: "Un módulo con varias funciones",
      shortTitle: "module.exports objeto",
      difficulty: "Fundamentos",
      intro: "Un archivo rara vez ofrece una sola cosa. Cuando exporta un objeto, quien lo usa elige qué parte necesita y el resto queda disponible sin estorbar.",
      example: "module.exports = { sumar: sumar, promedio: promedio };",
      explanation: "Exportar un objeto con varias funciones es la forma habitual de armar una biblioteca pequeña. Dentro del módulo, las funciones pueden llamarse entre sí libremente; hacia afuera solo se ve lo que pusiste en module.exports. Eso te permite cambiar lo de adentro sin romper a quien lo usa.",
      concepts: [
        "Un objeto exportado agrupa varias funciones relacionadas.",
        "Lo que no exportas queda privado dentro del archivo.",
        "Quien usa el módulo depende de los nombres, no del contenido."
      ],
      goal: "Con las funciones de calculos.js, muestra la suma de [12, 5, 4] y luego su promedio: 21 y 7.",
      hints: [
        'require("./calculos.js") entrega un objeto con dos funciones.',
        "Accede a ellas con calculos.sumar y calculos.promedio.",
        "El promedio de 12, 5 y 4 es exactamente 7."
      ],
      starter: '// calculos.js exporta { sumar, promedio }.\n\nconst horas = [12, 5, 4];\n\n// 1. Pide el módulo\n// 2. Muestra la suma\n// 3. Muestra el promedio\n',
      checks: [
        check("Muestra 21 y luego 7", salidaExacta("21", "7")),
        check("Pide el módulo de cálculos", usa(/require\(\s*["']\.\/calculos(\.js)?["']\s*\)/)),
        check("Usa las dos funciones exportadas", ambos(usa(/\.sumar\s*\(/), usa(/\.promedio\s*\(/)))
      ]
    }),
    lesson({
      kicker: "Módulo 07 · Rutas",
      title: "Arma rutas sin pegar textos a mano",
      shortTitle: "node:path",
      difficulty: "Práctica",
      intro: "Unir rutas con + parece funcionar hasta que aparece una barra de más, o falta una. El módulo path existe justamente para no tener que pensar en eso.",
      example: 'path.join("datos", "informes", "marzo.csv")',
      explanation: "join une los trozos con un solo separador entre cada uno. basename entrega el último tramo y extname la extensión, con el punto incluido. En este laboratorio el separador es siempre / , el estilo de Linux y macOS; en Windows, Node real usaría \\ , y por eso conviene usar path en vez de escribir el separador tú.",
      concepts: [
        "join evita las barras duplicadas o ausentes.",
        "extname devuelve la extensión con el punto: \".csv\".",
        "El separador depende del sistema: por eso no se escribe a mano."
      ],
      goal: "Arma la ruta de marzo.csv dentro de datos/informes y muestra la ruta completa, su nombre de archivo y su extensión.",
      hints: [
        'path.join("datos", "informes", "marzo.csv") arma la ruta.',
        "basename entrega solo el nombre del archivo.",
        "extname entrega la extensión, incluyendo el punto."
      ],
      starter: 'const path = require("node:path");\n\n// 1. Arma la ruta datos/informes/marzo.csv\n// 2. Muestra la ruta completa\n// 3. Muestra el nombre del archivo y su extensión\n',
      checks: [
        check("Muestra ruta, nombre y extensión", salidaExacta("datos/informes/marzo.csv", "marzo.csv", ".csv")),
        check("Arma la ruta con join", usa(/\.join\s*\(/)),
        check("Obtiene nombre y extensión con path", (code) => /\.basename\s*\(/.test(code) && /\.extname\s*\(/.test(code))
      ]
    }),
    lesson({
      kicker: "Módulo 08 · Carpetas",
      title: "Recorre la carpeta y filtra",
      shortTitle: "fs.readdirSync",
      difficulty: "Práctica",
      intro: "Un script útil no suele conocer de antemano los archivos que va a procesar: los descubre. Listar una carpeta y quedarse con los que interesan es el patrón completo.",
      example: 'fs.readdirSync(".")',
      explanation: "readdirSync devuelve los nombres de la carpeta, incluido el archivo que se está ejecutando: tu propio programa también es un archivo ahí. Combinado con filter y extname puedes quedarte con un tipo concreto. Fíjate en que app.cjs no termina en .js, así que el filtro lo deja fuera.",
      concepts: [
        "El programa en ejecución también aparece en el listado.",
        "filter conserva los elementos que cumplen la condición.",
        "Comparar la extensión es más fiable que buscar un texto dentro del nombre."
      ],
      goal: "Muestra cuántos archivos hay en la carpeta (5) y luego, separados por coma y espacio, solo los que terminan en .js: «calculos.js, formato.js».",
      hints: [
        'fs.readdirSync(".") entrega la lista completa de nombres.',
        "Filtra con una función que compare path.extname(nombre) con \".js\".",
        'join(", ") arma la línea final a partir del arreglo filtrado.'
      ],
      starter: 'const fs = require("node:fs");\nconst path = require("node:path");\n\n// 1. Lista los archivos de la carpeta actual\n// 2. Muestra cuántos son\n// 3. Muestra solo los .js separados por ", "\n',
      checks: [
        check("Muestra el total y los dos archivos .js", salidaExacta("5", "calculos.js, formato.js")),
        check("Lista la carpeta en vez de escribir los nombres", usa(/readdirSync\s*\(/)),
        check("Filtra el listado", usa(/\.filter\s*\(/))
      ]
    }),
    lesson({
      kicker: "Módulo 09 · Servidor",
      title: "Tu primer servidor responde",
      shortTitle: "http.createServer",
      difficulty: "Práctica",
      intro: "Un servidor web es un programa que espera peticiones y devuelve respuestas. En Node cabe en cinco líneas, y entenderlas es entender cómo funciona la mitad de internet.",
      example: "http.createServer(function (req, res) { ... })",
      explanation: "createServer recibe una función que se ejecutará una vez por cada petición que llegue, con dos objetos: req describe lo que pidieron y res es donde escribes la respuesta. listen deja el programa esperando en un puerto. Aquí las peticiones son simuladas, pero la función que se ejecuta es exactamente la que escribiste.",
      concepts: [
        "La función del servidor se ejecuta una vez por petición.",
        "res.statusCode define el código; 200 significa que salió bien.",
        "res.end envía la respuesta y cierra: sin él, quien pidió se queda esperando."
      ],
      goal: "Levanta un servidor en el puerto 3000 que responda 200 con el texto «Hola desde Node», y avisa por consola que está escuchando.",
      hints: [
        'Carga el módulo con require("node:http").',
        "Dentro de la función, escribe el estado, el tipo de contenido y termina con res.end.",
        "listen recibe el puerto y, si quieres, una función que se ejecuta al arrancar."
      ],
      starter: 'const http = require("node:http");\n\n// 1. Crea un servidor que responda "Hola desde Node"\n// 2. Devuelve el código 200 y el tipo text/plain\n// 3. Escúchalo en el puerto 3000 y avisa por consola\n',
      scenario: { requests: [{ method: "GET", url: "/" }] },
      checks: [
        check("Responde 200 con el texto pedido", responde(0, 200, "Hola desde Node")),
        check("Declara el tipo de contenido", tipoRespuesta(0, "text/plain")),
        check("Escucha en el puerto 3000", (_, r) => r.puerto === 3000)
      ]
    }),
    lesson({
      kicker: "Módulo 10 · Rutas HTTP",
      title: "Responde distinto según lo que pidan",
      shortTitle: "req.url",
      difficulty: "Avanzado",
      intro: "Un servidor que responde lo mismo a todo no sirve de mucho. La dirección pedida llega en req.url, y a partir de ahí decides.",
      example: 'if (req.url === "/cursos") { ... }',
      explanation: "Comparar req.url y terminar cada rama con return es la forma más simple de enrutar, y también la más clara para empezar. Lo que no coincide con ninguna ruta conocida debe responder 404: significa «esto no existe aquí», y es información útil para quien consume tu servicio. Sin el return, el código seguiría hasta el final y llamaría a end dos veces.",
      concepts: [
        "req.url trae la dirección pedida, empezando por /.",
        "404 no es un error del servidor: es «no existe esa dirección».",
        "El return después de end evita responder dos veces."
      ],
      goal: "Responde 200 «Inicio» en /, 200 «Listado de cursos» en /cursos y 404 «No encontrado» en cualquier otra dirección.",
      hints: [
        "Compara req.url con cada ruta conocida.",
        "Después de cada res.end, agrega return para no seguir ejecutando.",
        "La última respuesta, sin if, es la del 404."
      ],
      starter: 'const http = require("node:http");\n\nconst servidor = http.createServer(function (req, res) {\n  res.setHeader("Content-Type", "text/plain");\n  // 1. Responde "Inicio" en la raíz\n  // 2. Responde "Listado de cursos" en /cursos\n  // 3. Responde 404 "No encontrado" en el resto\n});\n\nservidor.listen(3000);\n',
      scenario: { requests: [{ method: "GET", url: "/" }, { method: "GET", url: "/cursos" }, { method: "GET", url: "/otra" }] },
      checks: [
        check("La raíz responde 200 con Inicio", responde(0, 200, "Inicio")),
        check("/cursos responde 200 con el listado", responde(1, 200, "Listado de cursos")),
        check("Una ruta desconocida responde 404", responde(2, 404, "No encontrado"))
      ]
    }),
    lesson({
      kicker: "Módulo 11 · JSON por HTTP",
      title: "Devuelve datos, no una página",
      shortTitle: "Respuesta JSON",
      difficulty: "Avanzado",
      intro: "Cuando un servidor habla con otro programa en vez de con una persona, no devuelve texto para leer: devuelve datos para procesar. Ese es todo el concepto de una API.",
      example: 'res.setHeader("Content-Type", "application/json")',
      explanation: "La cabecera Content-Type le dice a quien recibe cómo interpretar el cuerpo; si dices que es JSON, tiene que serlo. JSON.stringify convierte tu lista en el texto que viaja. Filtrar antes de responder es una decisión del servidor: quien consume recibe solo lo que corresponde y no tiene que limpiar nada.",
      concepts: [
        "Content-Type: application/json anuncia el formato del cuerpo.",
        "El cuerpo siempre viaja como texto, aunque represente objetos.",
        "Filtrar en el servidor evita enviar datos que nadie va a usar."
      ],
      goal: "Responde en /cursos con 200, tipo application/json y solamente los cursos activos: Python y SQL.",
      hints: [
        "Lee cursos.json dentro de la función del servidor.",
        "filter con la propiedad activo deja fuera el curso inactivo.",
        "El cuerpo se envía con res.end(JSON.stringify(...))."
      ],
      starter: 'const http = require("node:http");\nconst fs = require("node:fs");\n\nconst servidor = http.createServer(function (req, res) {\n  // 1. Lee cursos.json\n  // 2. Quédate solo con los activos\n  // 3. Responde 200 con el tipo application/json\n});\n\nservidor.listen(3000);\n',
      scenario: { requests: [{ method: "GET", url: "/cursos" }] },
      checks: [
        check("Responde 200 con los dos cursos activos", responde(0, 200,
          '[{"id":1,"nombre":"Python","horas":12,"activo":true},{"id":2,"nombre":"SQL","horas":5,"activo":true}]')),
        check("Anuncia que el cuerpo es JSON", tipoRespuesta(0, "application/json")),
        check("Filtra los datos leídos del archivo", (code) => /\.filter\s*\(/.test(code) && /JSON\.parse\s*\(/.test(code))
      ]
    }),
    lesson({
      kicker: "Módulo 12 · API",
      title: "Una API pequeña pero completa",
      shortTitle: "API con 404 y 405",
      difficulty: "Proyecto",
      duration: "25 min",
      intro: "Último módulo: un servicio que entrega la lista, entrega un elemento por su identificador, y responde con claridad cuando lo pedido no existe o cuando el método no corresponde.",
      example: "GET /cursos · GET /cursos/2 · 404 · 405",
      explanation: "Una API se juzga tanto por sus respuestas correctas como por sus rechazos. 404 dice «eso no existe», 405 dice «esa dirección existe, pero no con ese método». Revisar el método antes que la ruta evita repetir la comprobación en cada rama, y responder siempre en el mismo formato le facilita la vida a quien consume el servicio.",
      concepts: [
        "405 distingue «no existe» de «no se puede hacer así».",
        "Comprobar el método primero evita repetirlo en cada ruta.",
        "El formato de los errores también es parte del contrato."
      ],
      goal: "Responde 200 con la lista en /cursos, 200 con un curso en /cursos/2, 404 con {\"error\":\"Ruta no encontrada\"} en direcciones desconocidas y 405 con {\"error\":\"Método no permitido\"} ante un DELETE.",
      hints: [
        "Comprueba req.method antes de mirar la ruta y responde 405 si no es GET.",
        'Para /cursos/2, separa la url con split("/") y toma la posición 2 como número.',
        "find devuelve undefined cuando no encuentra nada: ese es el caso del 404."
      ],
      starter: 'const http = require("node:http");\nconst fs = require("node:fs");\n\nfunction leerCursos() {\n  return JSON.parse(fs.readFileSync("cursos.json", "utf8"));\n}\n\nconst servidor = http.createServer(function (req, res) {\n  res.setHeader("Content-Type", "application/json");\n  // 1. Rechaza con 405 cualquier método que no sea GET\n  // 2. Responde la lista completa en /cursos\n  // 3. Responde un curso en /cursos/:id, o 404 si no existe\n  // 4. Responde 404 en cualquier otra dirección\n});\n\nservidor.listen(3000);\n',
      scenario: {
        requests: [
          { method: "GET", url: "/cursos" },
          { method: "GET", url: "/cursos/2" },
          { method: "GET", url: "/nada" },
          { method: "DELETE", url: "/cursos" }
        ]
      },
      success: "Ruta terminada: sabes leer archivos, repartir el código en módulos y servir datos por HTTP con Node.",
      checks: [
        check("Entrega la lista y el curso 2", ambos(
          responde(0, 200, '[{"id":1,"nombre":"Python","horas":12,"activo":true},{"id":2,"nombre":"SQL","horas":5,"activo":true},{"id":3,"nombre":"Git","horas":4,"activo":false}]'),
          responde(1, 200, '{"id":2,"nombre":"SQL","horas":5,"activo":true}'))),
        check("Una dirección desconocida responde 404", responde(2, 404, '{"error":"Ruta no encontrada"}')),
        check("Un método no permitido responde 405", responde(3, 405, '{"error":"Método no permitido"}'))
      ]
    })
  ];

  const titles = ["El programa en tu computador", "El código en piezas", "El servidor"];
  const descriptions = [
    "Argumentos, archivos y datos en JSON",
    "Módulos propios, rutas y carpetas",
    "Peticiones, respuestas y una API"
  ];

  globalThis.NodeCourse = {
    name: "Node.js",
    kind: "node",
    storageKey: "codigo-cero.nodejs-v2.completed",
    examsKey: "codigo-cero.nodejs-v2.exams",
    stages: titles,
    levels: titles.map((title, i) => ({ title, description: descriptions[i], modules: lessons.slice(i * 4, i * 4 + 4) })),
    lessons
  };

  const questions = [
    [
      ["¿Qué hay en process.argv[2]?", ["La ruta de Node", "El nombre del archivo", "El primer dato que entregaste", "El resultado"], 2, "Las posiciones 0 y 1 son el ejecutable y el archivo; tus datos empiezan en la 2."],
      ["¿Por qué se convierte el argumento con Number?", ["Para acortarlo", "Porque llega como texto", "Para redondearlo", "Porque Node lo exige siempre"], 1, "Todos los argumentos llegan como texto, aunque se vean como números."],
      ["¿Qué pasa si lees un archivo sin indicar \"utf8\"?", ["Falla siempre", "Recibes un Buffer de bytes en vez de texto", "Recibes una lista", "Se borra el archivo"], 1, "Sin codificación Node entrega bytes en bruto, que no se pueden separar como texto."],
      ["¿Qué hace writeFileSync sobre un archivo que ya existe?", ["Agrega al final", "Falla", "Reemplaza todo su contenido", "Crea una copia"], 2, "Para agregar en vez de reemplazar existe appendFileSync."],
      ["¿Para qué sirve JSON.parse?", ["Para guardar un archivo", "Para convertir texto JSON en objetos y listas", "Para validar el archivo", "Para ordenar los datos"], 1, "En el disco el JSON es texto; parse lo devuelve como valores de JavaScript."]
    ],
    [
      ["¿Qué determina lo que entrega un módulo?", ["Todas sus funciones", "Lo que se asigna a module.exports", "La primera función", "El nombre del archivo"], 1, "Lo que no esté en module.exports queda privado dentro del archivo."],
      ["¿Qué indica el ./ en require(\"./calculos.js\")?", ["Que es un paquete de npm", "Que es un archivo de tu propio proyecto", "Que está oculto", "Que se ejecuta después"], 1, "Sin el ./, Node buscaría un paquete instalado en node_modules."],
      ["Si pides el mismo módulo tres veces, ¿cuántas se ejecuta?", ["Tres", "Una: el resultado queda en caché", "Ninguna", "Depende del tamaño"], 1, "Node guarda el resultado la primera vez y devuelve el mismo en las siguientes."],
      ["¿Por qué usar path.join en vez de unir con +?", ["Es más corto", "Maneja los separadores según el sistema", "Ordena las carpetas", "Comprueba que el archivo exista"], 1, "Evita las barras duplicadas o ausentes, y en Windows usa el separador que corresponde."],
      ["¿Qué incluye fs.readdirSync(\".\") en su listado?", ["Solo los .js", "Solo los archivos que creaste", "También el archivo que se está ejecutando", "Solo las carpetas"], 2, "El programa en ejecución es un archivo más dentro de esa carpeta."]
    ],
    [
      ["¿Cuántas veces se ejecuta la función de createServer?", ["Una al arrancar", "Una por cada petición que llega", "Una por segundo", "Solo si hay un error"], 1, "Cada petición entrante ejecuta esa función con su propio par req/res."],
      ["¿Qué pasa si no llamas a res.end()?", ["Se responde vacío", "Quien pidió queda esperando sin respuesta", "Node responde 500 solo", "Se repite la petición"], 1, "end es lo que cierra la respuesta y la envía."],
      ["¿Qué significa responder 404?", ["El servidor falló", "La dirección pedida no existe", "Falta autorización", "El método no se permite"], 1, "Es información sobre lo pedido, no un fallo del servidor."],
      ["¿Cuándo corresponde un 405 en vez de un 404?", ["Cuando el dato no existe", "Cuando la dirección existe pero no admite ese método", "Cuando falta el Content-Type", "Cuando el cuerpo está vacío"], 1, "404 dice que no existe; 405 dice que existe pero no se puede hacer así."],
      ["¿Para qué sirve la cabecera Content-Type?", ["Para acelerar la respuesta", "Para indicar cómo interpretar el cuerpo", "Para autenticar", "Para comprimir"], 1, "Si anuncias application/json, el cuerpo tiene que ser JSON válido."]
    ]
  ];

  globalThis.StarterExams.LEVEL_EXAMS.nodejs = questions.map((bank, i) => ({
    levelId: i + 1,
    title: "Mini examen: " + titles[i],
    passing: 4,
    intro: "Responde las cinco preguntas. Apruebas con cuatro aciertos y puedes repetir el repaso.",
    questions: bank.map(([question, options, answer, explanation]) => ({ question, options, answer, explanation }))
  }));
})();

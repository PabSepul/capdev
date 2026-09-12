/* Contenido de las rutas HTML/CSS y JavaScript. Vive aparte del controlador
   porque son 42 KB que solo necesitan sus dos páginas: antes viajaba en
   starter-course.js a las diecisiete. Se carga antes que el controlador. */
(() => {
  "use strict";

  const IMAGE_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='100'%3E%3Crect width='160' height='100' fill='%231c69d4'/%3E%3C/svg%3E";

  globalThis.HtmlCssCourse = {
    name: "HTML y CSS",
    storageKey: "codigo-cero.html-css-v2.completed",
    examsKey: "codigo-cero.html-css-v2.exams",
    kind: "html",
    levels: [
      {
        title: "Estructura",
        description: "Contenido, etiquetas y significado",
        modules: [
          {
            kicker: "Módulo 01 · Estructura",
            title: "Dale contenido a una página",
            shortTitle: "Estructura HTML",
            duration: "8 min",
            difficulty: "Inicio",
            intro: "HTML describe qué contenido existe: un título, un párrafo, una imagen o un botón.",
            example: "<h1>Hola, web</h1>",
            explanation: "Las etiquetas rodean el contenido y le entregan significado al navegador. La etiqueta h1 representa el título principal y p representa un párrafo.",
            concepts: ["Las etiquetas se abren y se cierran.", "h1 define el título principal.", "p agrupa un texto breve."],
            goal: "Crea un título que diga “Mi primera página” y un párrafo que incluya la palabra “aprender”.",
            hints: ["Comienza con una etiqueta <h1> y ciérrala con </h1>.", "Después del título agrega <p>...</p>.", "Asegúrate de escribir exactamente “Mi primera página” dentro del h1."],
            file: "index.html",
            starter: "<h1>Hola, web</h1>\n<p>Estoy comenzando.</p>",
            success: "Ya sabes describir contenido con etiquetas.",
            checks: [
              { label: "Incluye un título h1", test: (code) => /<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(code) },
              { label: "El título dice “Mi primera página”", test: (code) => /<h1\b[^>]*>\s*Mi primera página\s*<\/h1>/i.test(code) },
              { label: "Incluye un párrafo con la palabra “aprender”", test: (code) => /<p\b[^>]*>[\s\S]*aprender[\s\S]*<\/p>/i.test(code) }
            ]
          },
          {
            kicker: "Módulo 02 · Listas",
            title: "Ordena pasos y enlaza recursos",
            shortTitle: "Listas y enlaces",
            duration: "10 min",
            difficulty: "Inicio",
            intro: "Una lista agrupa elementos relacionados y un enlace conecta tu página con cualquier otra dirección.",
            example: "<ul><li>Paso uno</li></ul>",
            explanation: "ul crea una lista sin numerar y cada li es un elemento. La etiqueta a necesita el atributo href con la dirección de destino.",
            concepts: ["ul contiene varios li.", "a href define un enlace.", "El texto del enlace debe explicar hacia dónde lleva."],
            goal: "Escribe una lista con tres pasos para aprender y agrega un enlace a https://developer.mozilla.org.",
            hints: ["Abre <ul> y escribe tres <li> dentro.", "Cierra la lista con </ul>.", "El enlace se ve así: <a href=\"https://developer.mozilla.org\">Documentación</a>."],
            file: "pasos.html",
            starter: "<h2>Mis pasos</h2>\n<ul>\n  <li>Leer la lección</li>\n</ul>",
            success: "Tu página ya organiza información y se conecta con la web.",
            checks: [
              { label: "Usa una lista ul", test: (code) => /<ul\b[^>]*>[\s\S]*<\/ul>/i.test(code) },
              { label: "La lista tiene tres elementos li", test: (code) => (code.match(/<li\b/gi) || []).length >= 3 },
              { label: "Incluye un enlace hacia developer.mozilla.org", test: (code) => /<a\b[^>]*href\s*=\s*["'][^"']*developer\.mozilla\.org[^"']*["'][^>]*>[\s\S]*?<\/a>/i.test(code) }
            ]
          },
          {
            kicker: "Módulo 03 · Imágenes",
            title: "Muestra una imagen accesible",
            shortTitle: "Imágenes",
            duration: "10 min",
            difficulty: "Inicio",
            intro: "Una imagen aporta contexto, pero solo es útil para todas las personas cuando describes lo que muestra.",
            example: "<img src=\"foto.png\" alt=\"Equipo trabajando\">",
            explanation: "src indica dónde está el archivo y alt describe la imagen para quienes usan lectores de pantalla o cuando la imagen no carga.",
            concepts: ["img no necesita etiqueta de cierre.", "alt describe el contenido de la imagen.", "figure y figcaption agregan una leyenda visible."],
            goal: "Muestra la imagen dentro de un figure, escribe un alt descriptivo y agrega una leyenda con figcaption.",
            hints: ["Envuelve la imagen con <figure> ... </figure>.", "Agrega alt=\"...\" describiendo lo que se ve.", "Después de la imagen escribe <figcaption>Tu leyenda</figcaption>."],
            file: "imagen.html",
            starter: "<img src=\"" + IMAGE_PLACEHOLDER + "\" alt=\"\">",
            success: "Tus imágenes ahora comunican también sin verse.",
            checks: [
              { label: "Incluye una imagen con src", test: (code) => /<img\b[^>]*src\s*=\s*["'][^"']+["']/i.test(code) },
              { label: "El alt describe la imagen", test: (code) => /<img\b[^>]*alt\s*=\s*["']\s*[^"'\s][^"']{3,}["']/i.test(code) },
              { label: "Usa figure con figcaption", test: (code) => /<figure\b[\s\S]*<figcaption\b[\s\S]*<\/figcaption>[\s\S]*<\/figure>/i.test(code) }
            ]
          },
          {
            kicker: "Módulo 04 · Semántica",
            title: "Divide la página en secciones",
            shortTitle: "Semántica",
            duration: "12 min",
            difficulty: "Fundamentos",
            intro: "Las etiquetas semánticas explican la función de cada zona: encabezado, contenido principal y pie de página.",
            example: "<header>...</header><main>...</main>",
            explanation: "Los navegadores, los buscadores y los lectores de pantalla usan estas etiquetas para orientarse dentro del documento.",
            concepts: ["header agrupa la introducción.", "main contiene el contenido central.", "footer cierra la página."],
            goal: "Arma una página con header, main y footer; dentro de main incluye un h2 y un párrafo.",
            hints: ["Comienza con <header> y un título dentro.", "El contenido central va dentro de <main>.", "Cierra con <footer>Texto final</footer>."],
            file: "estructura.html",
            starter: "<header>\n  <h1>Mi sitio</h1>\n</header>",
            success: "Tu documento ya tiene una estructura que cualquiera puede recorrer.",
            checks: [
              { label: "Incluye header y footer", test: (code) => /<header\b[\s\S]*<\/header>/i.test(code) && /<footer\b[\s\S]*<\/footer>/i.test(code) },
              { label: "El contenido central usa main", test: (code) => /<main\b[\s\S]*<\/main>/i.test(code) },
              { label: "Dentro de main hay un h2 y un párrafo", test: (code) => /<main\b[^>]*>[\s\S]*<h2\b[\s\S]*<\/h2>[\s\S]*<p\b[\s\S]*<\/p>[\s\S]*<\/main>/i.test(code) }
            ]
          }
        ]
      },
      {
        title: "Estilos",
        description: "Color, tipografía y modelo de caja",
        modules: [
          {
            kicker: "Módulo 05 · Estilo",
            title: "Cambia la apariencia con CSS",
            shortTitle: "Primeros estilos",
            duration: "10 min",
            difficulty: "Fundamentos",
            intro: "CSS selecciona elementos de HTML y define cómo se ven: colores, espacios, tamaños y mucho más.",
            example: ".mensaje { color: #1c69d4; }",
            explanation: "Un selector como .mensaje encuentra el elemento que posee esa clase. Dentro de las llaves escribimos propiedades y valores separados por dos puntos.",
            concepts: ["class conecta una etiqueta con un selector.", "color cambia el texto.", "padding agrega espacio interior."],
            goal: "Crea un párrafo con la clase “mensaje” y define un color de texto junto con al menos 16px de espacio interior.",
            hints: ["Agrega class=\"mensaje\" a la etiqueta p.", "Dentro de <style> escribe el selector .mensaje { ... }.", "Usa color: blue o un color hexadecimal y padding: 16px."],
            file: "estilos.html",
            starter: "<style>\n  .mensaje {\n    color: #262626;\n  }\n</style>\n\n<p class=\"mensaje\">Estoy aprendiendo CSS.</p>",
            success: "Ya puedes conectar una clase con una regla de estilo.",
            checks: [
              { label: "Existe un elemento con la clase “mensaje”", test: (code) => /class\s*=\s*["'][^"']*\bmensaje\b[^"']*["']/i.test(code) },
              { label: "El selector .mensaje define un color", test: (code) => /\.mensaje\s*\{[^}]*\bcolor\s*:\s*[^;}{]+/is.test(code) },
              { label: "El selector .mensaje agrega al menos 16px de padding", test: (code) => /\.mensaje\s*\{[^}]*\bpadding\s*:\s*(?:1[6-9]|[2-9]\d|\d{3,})px\b/is.test(code) }
            ]
          },
          {
            kicker: "Módulo 06 · Tipografía",
            title: "Haz que el texto se lea bien",
            shortTitle: "Tipografía",
            duration: "12 min",
            difficulty: "Fundamentos",
            intro: "La lectura mejora con una tipografía clara, un tamaño cómodo y suficiente aire entre las líneas.",
            example: "body { font-size: 18px; line-height: 1.6; }",
            explanation: "font-family propone una lista de fuentes, font-size define el tamaño y line-height controla la separación vertical entre líneas.",
            concepts: ["font-family acepta varias alternativas.", "font-size de 16px o más facilita la lectura.", "line-height cercano a 1.6 evita textos apretados."],
            goal: "Aplica a body una tipografía del sistema con tamaño de al menos 18px, y dale a los párrafos un line-height de 1.6 o más.",
            hints: ["Escribe body { font-family: system-ui, sans-serif; }.", "Agrega font-size: 18px dentro de body.", "En el selector p usa line-height: 1.6."],
            file: "tipografia.html",
            starter: "<style>\n  body {\n    font-family: serif;\n  }\n</style>\n\n<h2>Guía de lectura</h2>\n<p>Un párrafo cómodo respira entre sus líneas y no cansa la vista.</p>",
            success: "Tu texto ahora es más fácil de leer en cualquier pantalla.",
            checks: [
              { label: "body define una font-family", test: (code) => /\bbody\s*\{[^}]*\bfont-family\s*:/is.test(code) },
              { label: "El tamaño de letra es de 18px o más", test: (code) => /\bfont-size\s*:\s*(?:1[89]|[2-9]\d|\d{3,})px\b/i.test(code) },
              { label: "Los párrafos usan line-height de 1.6 o más", test: (code) => /\bp\s*\{[^}]*\bline-height\s*:\s*(?:1\.[6-9]|[2-9])/is.test(code) }
            ]
          },
          {
            kicker: "Módulo 07 · Caja",
            title: "Controla el espacio de un bloque",
            shortTitle: "Modelo de caja",
            duration: "12 min",
            difficulty: "Fundamentos",
            intro: "Cada elemento es una caja con contenido, espacio interior, borde y espacio exterior.",
            example: ".caja { padding: 24px; margin: 16px; }",
            explanation: "padding separa el contenido del borde, margin separa la caja de sus vecinas y border-radius suaviza las esquinas.",
            concepts: ["padding es espacio interior.", "margin es espacio exterior.", "border-radius redondea las esquinas."],
            goal: "Dale a .caja al menos 24px de padding, 16px de margin, un borde visible y esquinas de al menos 8px.",
            hints: ["Escribe padding: 24px; dentro de .caja.", "Agrega margin: 16px; en la misma regla.", "Usa border: 2px solid #1c69d4; y border-radius: 8px;."],
            file: "caja.html",
            starter: "<style>\n  .caja {\n    background: #eef3fb;\n  }\n</style>\n\n<div class=\"caja\">\n  <h3>Una caja</h3>\n  <p>El espacio también comunica.</p>\n</div>",
            success: "Ya controlas el espacio interior y exterior de un bloque.",
            checks: [
              { label: ".caja usa 24px de padding", test: (code) => /\.caja\s*\{[^}]*\bpadding\s*:\s*(?:2[4-9]|[3-9]\d|\d{3,})px\b/is.test(code) },
              { label: ".caja separa con margin", test: (code) => /\.caja\s*\{[^}]*\bmargin\s*:\s*(?:1[6-9]|[2-9]\d|\d{3,})px\b/is.test(code) },
              { label: ".caja tiene borde y esquinas redondeadas", test: (code) => /\.caja\s*\{[^}]*\bborder\s*:/is.test(code) && /\.caja\s*\{[^}]*\bborder-radius\s*:\s*(?:[8-9]|[1-9]\d+)px\b/is.test(code) }
            ]
          },
          {
            kicker: "Módulo 08 · Estados",
            title: "Responde al cursor",
            shortTitle: "Estados",
            duration: "12 min",
            difficulty: "Práctica",
            intro: "Una interfaz se siente viva cuando responde a lo que hace la persona que la usa.",
            example: ".accion:hover { background: #14509f; }",
            explanation: "La pseudoclase :hover aplica estilos mientras el cursor está encima. transition suaviza el cambio entre los dos estados.",
            concepts: [":hover describe un estado temporal.", "cursor: pointer indica que algo es clicable.", "transition suaviza el cambio."],
            goal: "Crea un botón con clase “accion” que cambie de color de fondo al pasar el cursor y use una transición.",
            hints: ["Agrega class=\"accion\" al elemento button.", "Escribe la regla .accion:hover { background: ...; }.", "En .accion agrega transition: background .2s ease;."],
            file: "boton.html",
            starter: "<style>\n  .accion {\n    padding: 12px 18px;\n    border: 0;\n    background: #1c69d4;\n    color: #ffffff;\n  }\n</style>\n\n<button class=\"accion\" type=\"button\">Comenzar</button>",
            success: "Tu botón ahora reacciona a la persona que lo usa.",
            checks: [
              { label: "Existe un botón con la clase “accion”", test: (code) => /<button\b[^>]*class\s*=\s*["'][^"']*\baccion\b[^"']*["']/i.test(code) },
              { label: "Hay una regla .accion:hover", test: (code) => /\.accion\s*:\s*hover\s*\{[^}]*\}/is.test(code) },
              { label: "El cambio usa transition", test: (code) => /\btransition\s*:\s*[^;}{]+/i.test(code) }
            ]
          }
        ]
      },
      {
        title: "Composición",
        description: "Layout, adaptación y proyecto final",
        modules: [
          {
            kicker: "Módulo 09 · Flexbox",
            title: "Alinea elementos en una fila",
            shortTitle: "Flexbox",
            duration: "14 min",
            difficulty: "Práctica",
            intro: "Flexbox distribuye elementos en una dirección y reparte el espacio disponible entre ellos.",
            example: ".fila { display: flex; gap: 16px; }",
            explanation: "Al declarar display: flex, los hijos se ordenan en una fila. gap agrega separación y justify-content decide cómo se reparte el espacio sobrante.",
            concepts: ["display: flex activa el contexto flexible.", "gap separa sin usar margin.", "justify-content reparte el espacio libre."],
            goal: "Convierte .fila en un contenedor flexible con al menos 16px de gap y reparte el espacio con justify-content.",
            hints: ["Agrega display: flex; dentro de .fila.", "Escribe gap: 16px; en la misma regla.", "Usa justify-content: space-between; para separar las tarjetas."],
            file: "flex.html",
            starter: "<style>\n  .fila {\n    padding: 12px;\n    background: #eef3fb;\n  }\n\n  .fila div {\n    padding: 16px;\n    background: #ffffff;\n  }\n</style>\n\n<div class=\"fila\">\n  <div>Uno</div>\n  <div>Dos</div>\n  <div>Tres</div>\n</div>",
            success: "Ya puedes alinear elementos sin trucos ni tablas.",
            checks: [
              { label: ".fila usa display: flex", test: (code) => /\.fila\s*\{[^}]*\bdisplay\s*:\s*flex\b/is.test(code) },
              { label: "Hay un gap de al menos 16px", test: (code) => /\.fila\s*\{[^}]*\bgap\s*:\s*(?:1[6-9]|[2-9]\d|\d{3,})px\b/is.test(code) },
              { label: "El espacio se reparte con justify-content", test: (code) => /\.fila\s*\{[^}]*\bjustify-content\s*:\s*[a-z-]+/is.test(code) }
            ]
          },
          {
            kicker: "Módulo 10 · Grid",
            title: "Arma una grilla de columnas",
            shortTitle: "Grid",
            duration: "14 min",
            difficulty: "Práctica",
            intro: "Grid organiza el contenido en filas y columnas definidas por ti.",
            example: ".grilla { grid-template-columns: repeat(3, 1fr); }",
            explanation: "La unidad fr reparte el espacio disponible en partes iguales. repeat(3, 1fr) crea tres columnas del mismo ancho.",
            concepts: ["display: grid activa la grilla.", "grid-template-columns define las columnas.", "1fr equivale a una parte del espacio libre."],
            goal: "Convierte .grilla en una grilla de tres columnas iguales con al menos 16px de separación.",
            hints: ["Agrega display: grid; dentro de .grilla.", "Escribe grid-template-columns: repeat(3, 1fr);.", "Agrega gap: 16px; para separar las celdas."],
            file: "grid.html",
            starter: "<style>\n  .grilla {\n    padding: 12px;\n    background: #eef3fb;\n  }\n\n  .grilla article {\n    padding: 18px;\n    background: #ffffff;\n  }\n</style>\n\n<div class=\"grilla\">\n  <article>Python</article>\n  <article>HTML</article>\n  <article>SQL</article>\n</div>",
            success: "Ya sabes construir una grilla previsible en dos dimensiones.",
            checks: [
              { label: ".grilla usa display: grid", test: (code) => /\.grilla\s*\{[^}]*\bdisplay\s*:\s*grid\b/is.test(code) },
              { label: "Define tres columnas", test: (code) => /\bgrid-template-columns\s*:\s*(?:repeat\s*\(\s*3\s*,|(?:[^;}{]*\bfr\b){3})/is.test(code) },
              { label: "Separa las celdas con gap", test: (code) => /\.grilla\s*\{[^}]*\bgap\s*:\s*(?:1[6-9]|[2-9]\d|\d{3,})px\b/is.test(code) }
            ]
          },
          {
            kicker: "Módulo 11 · Responsive",
            title: "Adapta el diseño al móvil",
            shortTitle: "Responsive",
            duration: "16 min",
            difficulty: "Práctica",
            intro: "Una media query aplica reglas distintas según el ancho disponible en la pantalla.",
            example: "@media (max-width: 600px) { ... }",
            explanation: "Primero defines el diseño de escritorio y luego, dentro de la media query, ajustas lo que debe cambiar en pantallas pequeñas.",
            concepts: ["@media agrupa reglas condicionales.", "max-width se cumple hasta ese ancho.", "Una sola columna suele funcionar mejor en móvil."],
            goal: "Mantén la grilla de tres columnas y agrega una media query que la convierta en una sola columna hasta 600px.",
            hints: ["Conserva grid-template-columns: repeat(3, 1fr); en .grilla.", "Escribe @media (max-width: 600px) { ... } al final del estilo.", "Dentro de la media query usa .grilla { grid-template-columns: 1fr; }."],
            file: "responsive.html",
            starter: "<style>\n  .grilla {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    gap: 16px;\n  }\n\n  .grilla article {\n    padding: 18px;\n    background: #eef3fb;\n  }\n</style>\n\n<div class=\"grilla\">\n  <article>Python</article>\n  <article>HTML</article>\n  <article>SQL</article>\n</div>",
            success: "Tu diseño ya responde al tamaño de la pantalla.",
            checks: [
              { label: "Conserva la grilla de tres columnas", test: (code) => /\bgrid-template-columns\s*:\s*repeat\s*\(\s*3\s*,/is.test(code) },
              { label: "Incluye una media query hasta 600px", test: (code) => /@media[^{]*\(\s*max-width\s*:\s*600px\s*\)/i.test(code) },
              { label: "En móvil la grilla queda en una columna", test: (code) => /@media[\s\S]*\{[\s\S]*grid-template-columns\s*:\s*1fr\s*;/i.test(code) }
            ]
          },
          {
            kicker: "Módulo 12 · Proyecto final",
            title: "Publica una tarjeta de curso",
            shortTitle: "Proyecto final",
            duration: "20 min",
            difficulty: "Proyecto",
            intro: "Reúne todo lo aprendido en un componente real: estructura semántica, estilo propio, estado y adaptación.",
            example: "<article class=\"curso\">...</article>",
            explanation: "Un componente terminado combina significado, jerarquía visual, respuesta al cursor y comportamiento responsive.",
            concepts: ["article agrupa contenido independiente.", ":hover comunica interacción.", "@media adapta el componente al móvil."],
            goal: "Crea una tarjeta con clase “curso” que tenga título, descripción y botón; dale borde, padding, un estado :hover y una media query.",
            hints: ["Estructura: <article class=\"curso\"><h2>...</h2><p>...</p><button>...</button></article>.", "En .curso define border, border-radius y padding de al menos 20px.", "Agrega .curso:hover y una @media (max-width: 600px) que ajuste el padding o el ancho."],
            file: "tarjeta.html",
            starter: "<style>\n  .curso {\n    max-width: 320px;\n    background: #ffffff;\n  }\n</style>\n\n<article class=\"curso\">\n  <h2>Ruta de SQL</h2>\n  <p>Consulta datos reales en cinco horas.</p>\n  <button type=\"button\">Comenzar</button>\n</article>",
            success: "Terminaste un componente con estructura, estilos y adaptación. Comprueba también su lectura y navegación con teclado.",
            checks: [
              { label: "La tarjeta usa article con título, texto y botón", test: (code) => /<article\b[^>]*class\s*=\s*["'][^"']*\bcurso\b/i.test(code) && /<h2\b/i.test(code) && /<p\b/i.test(code) && /<button\b/i.test(code) },
              { label: ".curso tiene borde y al menos 20px de padding", test: (code) => /\.curso\s*\{[^}]*\bborder\s*:/is.test(code) && /\.curso\s*\{[^}]*\bpadding\s*:\s*(?:2\d|[3-9]\d|\d{3,})px\b/is.test(code) },
              { label: "Incluye un estado :hover y una media query", test: (code) => /\.curso\s*:\s*hover\s*\{/is.test(code) && /@media[^{]*max-width/i.test(code) }
            ]
          }
        ]
      }
    ]
  };

  globalThis.JavaScriptCourse = {
    name: "JavaScript",
    storageKey: "codigo-cero.javascript-v2.completed",
    examsKey: "codigo-cero.javascript-v2.exams",
    kind: "javascript",
    levels: [
      {
        title: "Datos",
        description: "Variables, números, texto y lógica",
        modules: [
          {
            kicker: "Módulo 01 · Variables",
            title: "Guarda y muestra un dato",
            shortTitle: "Variables",
            duration: "8 min",
            difficulty: "Inicio",
            intro: "Una variable asocia un nombre con un valor para que puedas reutilizarlo y transformarlo.",
            example: "const nombre = \"Ada\";",
            explanation: "const crea una referencia que no será reasignada. console.log muestra un valor y permite comprobar lo que está haciendo el programa.",
            concepts: ["const declara una variable.", "Los textos van entre comillas.", "console.log muestra un resultado."],
            goal: "Crea la variable lenguaje con el valor “JavaScript” y muéstrala usando console.log.",
            hints: ["Escribe const lenguaje = \"JavaScript\";.", "En otra línea llama a console.log(...).", "Pasa lenguaje a console.log sin comillas."],
            file: "variables.js",
            starter: "const lenguaje = \"JS\";\nconsole.log(lenguaje);",
            success: "Ya sabes guardar un dato y comprobar su valor.",
            checks: [
              { label: "Declara la variable lenguaje", test: (code) => /\bconst\s+lenguaje\s*=/.test(code) },
              { label: "Guarda el texto “JavaScript”", test: (code, result) => result.environment.lenguaje === "JavaScript" },
              { label: "La consola muestra JavaScript", test: (code, result) => result.output.includes("JavaScript") }
            ]
          },
          {
            kicker: "Módulo 02 · Números",
            title: "Calcula el total de una compra",
            shortTitle: "Números",
            duration: "10 min",
            difficulty: "Inicio",
            intro: "JavaScript opera con números usando los mismos símbolos de la aritmética.",
            example: "const total = precio * cantidad;",
            explanation: "Una expresión combina valores y operadores. El resultado puede guardarse en otra variable para reutilizarlo.",
            concepts: ["* multiplica dos números.", "Una variable puede guardar el resultado de un cálculo.", "El orden de las operaciones sigue las reglas de siempre."],
            goal: "Cambia la cantidad a 3 y muestra el total de la compra.",
            hints: ["Modifica el valor de cantidad.", "Conserva la multiplicación precio * cantidad.", "El resultado esperado es 13500."],
            file: "compra.js",
            starter: "const precio = 4500;\nconst cantidad = 1;\nconst total = precio * cantidad;\n\nconsole.log(total);",
            success: "Ya puedes describir un cálculo y comprobar su resultado.",
            checks: [
              { label: "La cantidad es 3", test: (code, result) => result.environment.cantidad === 3 },
              { label: "El total se calcula con una multiplicación", test: (code) => /\*/.test(code) },
              { label: "La consola muestra 13500", test: (code, result) => result.output.includes("13500") }
            ]
          },
          {
            kicker: "Módulo 03 · Texto",
            title: "Arma un mensaje con plantillas",
            shortTitle: "Plantillas",
            duration: "12 min",
            difficulty: "Fundamentos",
            intro: "Una plantilla combina texto fijo con valores calculados sin sumar cadenas a mano.",
            example: "console.log(`Hola, ${nombre}`);",
            explanation: "Las plantillas usan acentos graves y ${} para insertar valores. Los textos también tienen métodos, como toUpperCase().",
            concepts: ["Los acentos graves delimitan una plantilla.", "${} inserta el valor de una expresión.", "toUpperCase() devuelve el texto en mayúsculas."],
            goal: "Muestra exactamente: Hola, ADA: llevas 3 módulos.",
            hints: ["Usa una plantilla con acentos graves.", "Inserta ${nombre.toUpperCase()} dentro del texto.", "Inserta también ${modulos} antes de la palabra módulos."],
            file: "mensaje.js",
            starter: "const nombre = \"ada\";\nconst modulos = 3;\n\nconsole.log(\"Hola\");",
            success: "Ya puedes construir mensajes dinámicos y legibles.",
            checks: [
              { label: "Usa una plantilla con ${}", test: (code) => /`[^`]*\$\{[^}]+\}/.test(code) },
              { label: "Convierte el nombre a mayúsculas", test: (code) => /toUpperCase\s*\(\s*\)/.test(code) },
              { label: "La consola muestra el mensaje completo", test: (code, result) => result.output.includes("Hola, ADA: llevas 3 módulos") }
            ]
          },
          {
            kicker: "Módulo 04 · Lógica",
            title: "Responde con verdadero o falso",
            shortTitle: "Booleanos",
            duration: "10 min",
            difficulty: "Fundamentos",
            intro: "Una comparación siempre devuelve true o false, y ese resultado puede guardarse como cualquier otro valor.",
            example: "const cumplio = horas >= meta;",
            explanation: "Los operadores de comparación producen un booleano. Guardarlo en una variable con buen nombre hace el código más claro.",
            concepts: [">= compara dos números.", "true y false son valores completos.", "Una variable booleana documenta una decisión."],
            goal: "Crea la variable cumplio, que indique si las horas alcanzaron la meta, y muéstrala.",
            hints: ["Escribe const cumplio = horas >= meta;.", "No uses comillas: cumplio no es texto.", "Muestra el resultado con console.log(cumplio);."],
            file: "meta.js",
            starter: "const horas = 12;\nconst meta = 10;\n\nconsole.log(horas);",
            success: "Ya sabes guardar el resultado de una comparación.",
            checks: [
              { label: "Existe la variable cumplio", test: (code, result) => Object.prototype.hasOwnProperty.call(result.environment, "cumplio") },
              { label: "Su valor viene de una comparación", test: (code, result) => result.environment.cumplio === true && /cumplio\s*=\s*[^;]*(?:>=|<=|===|!==|>|<)/.test(code) },
              { label: "La consola muestra true", test: (code, result) => result.output.includes("true") }
            ]
          }
        ]
      },
      {
        title: "Decisiones y colecciones",
        description: "Condiciones, listas y ciclos",
        modules: [
          {
            kicker: "Módulo 05 · Decisiones",
            title: "Haz que el programa decida",
            shortTitle: "Condiciones",
            duration: "12 min",
            difficulty: "Fundamentos",
            intro: "Una condición permite ejecutar una respuesta cuando algo es verdadero y otra cuando es falso.",
            example: "if (edad >= 18) { ... } else { ... }",
            explanation: "if evalúa una comparación. Si no se cumple, else ofrece un camino alternativo para que el programa siempre tenga una respuesta.",
            concepts: [">= significa mayor o igual.", "if ejecuta el primer camino verdadero.", "else cubre el caso contrario."],
            goal: "Usa edad = 18 y muestra “Puede entrar” si es mayor o igual a 18; en caso contrario muestra “Aún no”.",
            hints: ["Cambia el valor de edad a 18.", "La condición es if (edad >= 18).", "Conserva un console.log distinto dentro de if y else."],
            file: "decisiones.js",
            starter: "const edad = 16;\n\nif (edad >= 18) {\n  console.log(\"Puede entrar\");\n} else {\n  console.log(\"Aún no\");\n}",
            success: "Tu programa ya elige entre dos caminos.",
            checks: [
              { label: "La variable edad contiene 18", test: (code, result) => result.environment.edad === 18 },
              { label: "Compara edad con 18 y ofrece un camino alternativo", test: (code) => /if\s*\(\s*edad\s*>=\s*18\s*\)/.test(code) && /\belse\b/.test(code) },
              { label: "La consola muestra “Puede entrar”", test: (code, result) => result.output.includes("Puede entrar") }
            ]
          },
          {
            kicker: "Módulo 06 · Clasificar",
            title: "Elige entre varios caminos",
            shortTitle: "else if",
            duration: "12 min",
            difficulty: "Fundamentos",
            intro: "Cuando hay más de dos respuestas posibles, else if encadena condiciones en orden.",
            example: "else if (nota >= 4) { ... }",
            explanation: "Las condiciones se revisan de arriba hacia abajo y solo se ejecuta la primera que se cumple, así que el orden importa.",
            concepts: ["else if agrega un camino intermedio.", "El orden de las condiciones cambia el resultado.", "El else final cubre todo lo demás."],
            goal: "Clasifica la nota 5: 6 o más “Excelente”, 4 o más “Aprobado”, y en cualquier otro caso “A reforzar”.",
            hints: ["Conserva el primer if con nota >= 6.", "Agrega else if (nota >= 4) con el mensaje “Aprobado”.", "Cierra con un else que muestre “A reforzar”."],
            file: "notas.js",
            starter: "const nota = 5;\n\nif (nota >= 6) {\n  console.log(\"Excelente\");\n}",
            success: "Ya sabes encadenar decisiones en el orden correcto.",
            checks: [
              { label: "Usa else if", test: (code) => /\belse\s+if\s*\(/.test(code) },
              { label: "Incluye los tres mensajes", test: (code) => /Excelente/.test(code) && /Aprobado/.test(code) && /A reforzar/.test(code) },
              { label: "Con nota 5 la consola muestra “Aprobado”", test: (code, result) => result.output.length === 1 && result.output[0] === "Aprobado" }
            ]
          },
          {
            kicker: "Módulo 07 · Listas",
            title: "Trabaja con una lista de cursos",
            shortTitle: "Arreglos",
            duration: "12 min",
            difficulty: "Práctica",
            intro: "Un arreglo guarda varios valores en orden y cada uno tiene una posición.",
            example: "cursos.push(\"SQL\");",
            explanation: "push agrega un elemento al final, length indica cuántos hay y los corchetes permiten leer una posición concreta empezando en cero.",
            concepts: ["push agrega al final.", "length cuenta los elementos.", "La primera posición es cero."],
            goal: "Agrega “SQL” al final, muestra cuántos cursos hay y cuál es el primero.",
            hints: ["Llama a cursos.push(\"SQL\");.", "Muestra cursos.length para contar.", "El primer curso es cursos[0]."],
            file: "cursos.js",
            starter: "const cursos = [\"Python\", \"HTML y CSS\", \"JavaScript\"];\n\nconsole.log(cursos.length);",
            success: "Ya puedes crear, ampliar y leer una lista.",
            checks: [
              { label: "Agrega SQL con push", test: (code, result) => /\.push\s*\(/.test(code) && Array.isArray(result.environment.cursos) && result.environment.cursos.includes("SQL") },
              { label: "Muestra que ahora hay 4 cursos", test: (code, result) => result.output.includes("4") },
              { label: "Muestra el primer curso", test: (code, result) => result.output.includes("Python") }
            ]
          },
          {
            kicker: "Módulo 08 · Ciclos",
            title: "Suma todas las horas",
            shortTitle: "Ciclos",
            duration: "14 min",
            difficulty: "Práctica",
            intro: "Un ciclo repite instrucciones sobre cada elemento sin escribirlas una y otra vez.",
            example: "for (const hora of horas) { ... }",
            explanation: "Un acumulador empieza en cero y crece dentro del ciclo. Al terminar contiene el resultado de toda la colección.",
            concepts: ["for...of recorre cada elemento.", "let permite modificar una variable.", "+= suma sobre el valor anterior."],
            goal: "Recorre la lista, acumula las horas en total y muestra el resultado.",
            hints: ["Escribe for (const hora of horas) { ... }.", "Dentro del ciclo usa total += hora;.", "El resultado esperado es 45."],
            file: "horas.js",
            starter: "const horas = [12, 6, 8, 5, 14];\nlet total = 0;\n\nconsole.log(total);",
            success: "Ya sabes recorrer una colección y acumular un resultado.",
            checks: [
              { label: "Usa un ciclo for", test: (code) => /\bfor\s*\(/.test(code) },
              { label: "El acumulador llega a 45", test: (code, result) => result.environment.total === 45 },
              { label: "La consola muestra 45", test: (code, result) => result.output.includes("45") }
            ]
          }
        ]
      },
      {
        title: "Funciones y proyecto",
        description: "Reutilizar, transformar y construir",
        modules: [
          {
            kicker: "Módulo 09 · Funciones",
            title: "Reutiliza una operación",
            shortTitle: "Funciones",
            duration: "12 min",
            difficulty: "Práctica",
            intro: "Una función agrupa instrucciones y puede recibir un dato para devolver un nuevo resultado.",
            example: "function doblar(numero) { return numero * 2; }",
            explanation: "El parámetro numero recibe el valor de cada llamada. return entrega el resultado de la operación al resto del programa.",
            concepts: ["function define una tarea reutilizable.", "Un parámetro recibe el dato de entrada.", "return entrega el resultado."],
            goal: "Completa la función doblar para que retorne el número multiplicado por 2 y prueba doblar(6).",
            hints: ["Conserva el parámetro numero.", "Dentro de la función escribe return numero * 2;.", "Muestra console.log(doblar(6));."],
            file: "funciones.js",
            starter: "function doblar(numero) {\n  return numero;\n}\n\nconsole.log(doblar(6));",
            success: "Ya puedes encapsular una operación y reutilizarla.",
            checks: [
              { label: "Define la función doblar con un parámetro", test: (code) => /function\s+doblar\s*\(\s*\w+\s*\)/.test(code) },
              { label: "Retorna el parámetro multiplicado por 2", test: (code) => /return\s+[^;]*\*\s*2/.test(code) },
              { label: "doblar(6) muestra 12", test: (code, result) => result.output.includes("12") }
            ]
          },
          {
            kicker: "Módulo 10 · Flechas",
            title: "Escribe funciones más breves",
            shortTitle: "Funciones flecha",
            duration: "14 min",
            difficulty: "Práctica",
            intro: "Una función flecha expresa la misma idea con menos ceremonia y admite valores por defecto.",
            example: "const doble = (n) => n * 2;",
            explanation: "Cuando el cuerpo es una sola expresión, el resultado se devuelve automáticamente. Un parámetro con valor por defecto se usa si no envías ese dato.",
            concepts: ["Una función flecha se escribe con =>.", "Una expresión sin llaves se retorna; con llaves necesitas return.", "Un parámetro puede traer un valor por defecto."],
            goal: "Convierte descuento en función flecha con 10 % por defecto y muestra descuento(1000) y descuento(1000, 50).",
            hints: ["Escribe const descuento = (precio, porcentaje = 10) => ...;.", "El cuerpo es precio - (precio * porcentaje) / 100.", "Los resultados esperados son 900 y 500."],
            file: "descuento.js",
            starter: "function descuento(precio, porcentaje) {\n  return precio - (precio * porcentaje) / 100;\n}\n\nconsole.log(descuento(1000, 10));",
            success: "Ya escribes funciones breves con valores por defecto.",
            checks: [
              { label: "Usa una función flecha", test: (code) => /=>/.test(code) },
              { label: "El porcentaje tiene 10 por defecto", test: (code) => /porcentaje\s*=\s*10/.test(code) },
              { label: "Muestra 900 y 500", test: (code, result) => result.output.includes("900") && result.output.includes("500") }
            ]
          },
          {
            kicker: "Módulo 11 · Transformar",
            title: "Filtra, transforma y resume",
            shortTitle: "map y filter",
            duration: "16 min",
            difficulty: "Práctica",
            intro: "Los arreglos ofrecen métodos que describen la intención: elegir, transformar o resumir.",
            example: "cursos.filter((curso) => curso.horas >= 9)",
            explanation: "filter conserva los elementos que cumplen una condición, map crea un arreglo nuevo con otra forma y reduce combina todo en un único valor.",
            concepts: ["filter selecciona sin modificar el original.", "map transforma cada elemento.", "reduce acumula hacia un solo resultado."],
            goal: "Muestra los nombres de los cursos de 9 horas o más separados por coma y, en otra línea, el total de horas.",
            hints: ["Usa cursos.filter((curso) => curso.horas >= 9).", "Encadena .map((curso) => curso.nombre).join(\", \").", "El total sale de cursos.reduce((total, curso) => total + curso.horas, 0)."],
            file: "resumen.js",
            starter: "const cursos = [\n  { nombre: \"Python\", horas: 12 },\n  { nombre: \"SQL\", horas: 5 },\n  { nombre: \"APIs\", horas: 9 }\n];\n\nconsole.log(cursos.length);",
            success: "Ya describes transformaciones completas en pocas líneas.",
            checks: [
              { label: "Selecciona los cursos con filter", test: (code) => /\.filter\s*\(/.test(code) },
              { label: "Transforma con map y resume con reduce", test: (code) => /\.map\s*\(/.test(code) && /\.reduce\s*\(/.test(code) },
              { label: "Muestra “Python, APIs” y el total 26", test: (code, result) => result.output.includes("Python, APIs") && result.output.includes("26") }
            ]
          },
          {
            kicker: "Módulo 12 · Proyecto final",
            title: "Resume un carrito de compras",
            shortTitle: "Proyecto final",
            duration: "20 min",
            difficulty: "Proyecto",
            intro: "Reúne objetos, funciones, acumuladores y plantillas en un pequeño programa completo.",
            example: "const total = (carrito) => ...;",
            explanation: "Cada producto es un objeto con precio y cantidad. Una función calcula el total y una plantilla arma el mensaje final para la persona usuaria.",
            concepts: ["Un objeto agrupa datos con nombre.", "Una función concentra el cálculo.", "Una plantilla comunica el resultado."],
            goal: "Muestra exactamente: Carrito: 3 productos · Total: $51970.",
            hints: ["Calcula las unidades sumando cantidad de cada producto.", "El total suma precio * cantidad de cada producto.", "Arma el mensaje con una plantilla y ${} para cada valor."],
            file: "carrito.js",
            starter: "const carrito = [\n  { producto: \"Teclado\", precio: 25990, cantidad: 1 },\n  { producto: \"Mouse\", precio: 12990, cantidad: 2 }\n];\n\nconsole.log(carrito.length);",
            success: "Terminaste un programa completo: datos, cálculo y mensaje.",
            checks: [
              { label: "Define una función para el cálculo", test: (code) => /function\s+\w+\s*\(/.test(code) || /(?:const|let)\s+\w+\s*=\s*\([^)]*\)\s*=>/.test(code) },
              { label: "Recorre el carrito con reduce o un ciclo", test: (code) => /\.reduce\s*\(/.test(code) || /\bfor\s*\(/.test(code) },
              { label: "Muestra el resumen exacto del carrito", test: (code, result) => result.output.includes("Carrito: 3 productos · Total: $51970") }
            ]
          }
        ]
      }
    ]
  };
})();

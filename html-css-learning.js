/* Apoyos pedagógicos de la ruta HTML/CSS. Se aplican después de añadir el
   cuarto nivel, sin cambiar índices, validadores ni claves de progreso. */
(() => {
  "use strict";

  const guide = (prerequisites, example, walkthrough, prediction, answer, reflection, extension, hints, feedback, success) => ({
    prerequisites, example, walkthrough, prediction, answer, reflection, extension, hints, feedback, success
  });

  const lessons = [
    guide("Ninguno: este es el punto de partida.",
      "<h1>Plan del sábado</h1>\n<p>Nos reuniremos a las 10:00.</p>",
      ["h1 abre y cierra el título principal de la página.", "p agrupa la información que desarrolla ese título.", "El navegador muestra ambos textos en líneas separadas porque son elementos de bloque."],
      "Si cambias h1 por p, ¿el texto conserva el mismo significado y tamaño?",
      "El texto sigue visible, pero deja de ser el título principal y toma la apariencia de un párrafo.",
      "Cambia la frase del párrafo y comprueba que la estructura sigue siendo título más explicación.",
      "Después de completar, añade un segundo párrafo con la hora de regreso.",
      ["Compara la misión con las dos etiquetas del ejemplo: ¿qué texto corresponde al título y cuál a la explicación?", "Usa h1 para el título principal y p para el texto que lo acompaña.", "Escribe <h1>Mi primera página</h1> y añade debajo un p que contenga la palabra aprender."],
      ["Añade un elemento h1 con apertura, contenido y cierre.", "El texto dentro de h1 debe ser exactamente Mi primera página.", "Añade un párrafo y asegúrate de que su contenido incluya la palabra aprender."],
      "Creaste una página con título y explicación. En el siguiente módulo organizarás varios pasos y añadirás un recurso."),

    guide("Etiquetas con apertura y cierre; título y párrafo.",
      "<h2>Antes de salir</h2>\n<ul>\n  <li>Elegir el lugar</li>\n  <li>Confirmar la hora</li>\n</ul>\n<a href=\"https://developer.mozilla.org\">Consultar HTML</a>",
      ["ul reúne elementos relacionados sin indicar un orden obligatorio.", "Cada li representa un elemento independiente dentro de la lista.", "a convierte su texto en un enlace y href guarda la dirección de destino."],
      "Si quitas href del enlace, ¿el texto sigue llevando a MDN?",
      "No. El texto permanece, pero sin href deja de tener un destino navegable.",
      "Añade temporalmente un cuarto elemento y observa que ul lo incorpora sin cambiar la estructura.",
      "Después de completar, mejora el texto del enlace para explicar qué se encontrará al abrirlo.",
      ["Cuenta cuántos pasos pide la misión y revisa qué debe aparecer después de la lista.", "ul contiene varios li; el destino de a se escribe en href.", "Completa tres li y añade <a href=\"https://developer.mozilla.org\">Documentación de HTML</a>."],
      ["La lista debe estar contenida entre <ul> y </ul>.", "Dentro de la lista deben existir al menos tres elementos li.", "Añade un enlace a developer.mozilla.org y escribe un texto comprensible entre sus etiquetas."],
      "Organizaste información y enlazaste una referencia. Ahora aprenderás a presentar una imagen con contexto accesible."),

    guide("Atributos HTML como href y agrupación de contenido.",
      "<figure>\n  <img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='100'%3E%3Crect width='160' height='100' fill='%231c69d4'/%3E%3C/svg%3E\" alt=\"Mapa azul del paseo\">\n  <figcaption>Ruta acordada por el grupo</figcaption>\n</figure>",
      ["figure reúne una imagen con el contenido que la explica.", "src indica el recurso visual y alt comunica su significado cuando no se ve.", "figcaption añade una leyenda visible para todas las personas."],
      "Si la imagen no carga, ¿qué texto ayuda a entender qué debía mostrar?",
      "El atributo alt. La leyenda también aporta contexto, pero alt reemplaza específicamente el contenido visual.",
      "Cambia el texto de alt y decide si describe la imagen, su función o solo repite la leyenda.",
      "Después de completar, añade width y height para reservar el espacio de la imagen.",
      ["Piensa en las tres piezas que necesita la imagen: agrupación, descripción alternativa y leyenda visible.", "figure contiene img y figcaption; alt pertenece a img.", "Envuelve la imagen inicial en figure, completa un alt descriptivo y añade figcaption después de img."],
      ["Conserva una imagen con un atributo src que no esté vacío.", "Escribe un alt descriptivo de al menos cuatro caracteres, sin dejarlo vacío.", "Coloca img y una leyenda figcaption dentro del mismo figure."],
      "Presentaste una imagen con descripción y leyenda. En el cierre del nivel organizarás una página completa por secciones."),

    guide("Títulos, párrafos y agrupación con etiquetas.",
      "<header><h1>Salida del equipo</h1></header>\n<main><h2>Itinerario</h2><p>Primero visitaremos el museo.</p></main>\n<footer>Plan actualizado el viernes</footer>",
      ["header presenta la página y puede contener su título principal.", "main identifica el contenido central y solo debería aparecer una vez.", "footer reúne la información de cierre del documento."],
      "¿Un lector de pantalla puede encontrar el contenido principal aunque el texto no cambie?",
      "Sí. La etiqueta main crea una región con significado que facilita saltar al contenido central.",
      "Intercambia temporalmente main por div y explica qué información semántica se pierde.",
      "Después de completar, añade una sección dentro de main para agrupar un segundo tema.",
      ["Dibuja primero tres zonas: apertura, contenido central y cierre. Luego revisa qué falta en el inicio.", "header, main y footer describen la función de cada zona; main debe contener h2 y p.", "Conserva el header inicial, añade <main><h2>...</h2><p>...</p></main> y termina con footer."],
      ["La página necesita tanto header como footer, cada uno correctamente cerrado.", "Añade una región main para el contenido central.", "Dentro de main coloca primero un h2 y después un párrafo."],
      "Estructuraste un documento completo. El nivel siguiente usará CSS para cambiar su presentación sin perder ese significado."),

    guide("Clases HTML y estructura básica de una página.",
      "<style>\n.aviso { color: #184f90; padding: 20px; }\n</style>\n<p class=\"aviso\">La salida comienza a las diez.</p>",
      ["class asigna el nombre aviso al párrafo.", "El selector .aviso encuentra los elementos con esa clase.", "color cambia el texto y padding crea espacio entre el contenido y los bordes de su caja."],
      "Si cambias class=\"aviso\" por class=\"nota\", ¿se mantienen esos estilos?",
      "No. El selector .aviso deja de coincidir con el párrafo, salvo que también cambies el selector a .nota.",
      "Prueba otro color y 24px de padding; identifica qué cambio corresponde a cada propiedad.",
      "Después de completar, añade un color de fondo suave a .mensaje.",
      ["Busca el vínculo entre el nombre de la clase del párrafo y el selector dentro de style.", "Una clase se escribe sin punto en HTML y con punto al usarla como selector CSS.", "Usa class=\"mensaje\" y, en .mensaje, añade color y padding: 16px o más."],
      ["El HTML debe incluir un elemento cuya lista de clases contenga mensaje.", "Dentro de una regla .mensaje define una propiedad color.", "En esa misma regla añade un padding de al menos 16px."],
      "Conectaste HTML con una regla CSS. A continuación ajustarás la tipografía para facilitar la lectura."),

    guide("Selectores CSS, propiedades y valores.",
      "<style>\nbody { font-family: system-ui, sans-serif; font-size: 18px; }\np { line-height: 1.7; }\n</style>\n<h2>Punto de encuentro</h2>\n<p>Lee las indicaciones con calma antes de salir.</p>",
      ["body aplica la familia y el tamaño a todo el documento por herencia.", "system-ui pide la tipografía habitual del dispositivo y sans-serif funciona como alternativa.", "line-height amplía el espacio vertical entre las líneas de cada párrafo."],
      "¿line-height: 1.7 significa 1.7 píxeles de separación?",
      "No. Sin unidad, multiplica el tamaño de letra del elemento; con 18px produce una altura de línea de 30.6px.",
      "Cambia el ancho de la vista previa y observa que el interlineado se conserva cuando el párrafo ocupa más líneas.",
      "Después de completar, limita el ancho del párrafo con max-width: 60ch para hacer más cómoda una lectura larga.",
      ["Revisa por separado la regla general del documento y la regla específica para párrafos.", "body puede heredar font-family y font-size; p controla line-height.", "En body usa una font-family y font-size: 18px; en p agrega line-height: 1.6 o más."],
      ["La regla body debe declarar font-family.", "Añade un font-size de 18px o más.", "Crea una regla p con line-height de 1.6 o más."],
      "Mejoraste la legibilidad del texto. Ahora controlarás los espacios y bordes de una caja."),

    guide("Reglas CSS y medidas en píxeles.",
      "<style>\n.tarjeta { padding: 24px; margin: 16px; border: 2px solid #1c69d4; border-radius: 12px; }\n</style>\n<section class=\"tarjeta\"><h3>Museo</h3><p>Entrada a las 11:00.</p></section>",
      ["padding separa el contenido del borde por dentro.", "border dibuja el límite de la caja y border-radius redondea sus esquinas.", "margin separa toda la caja de los elementos vecinos."],
      "¿Qué propiedad usarías para alejar el texto del borde sin mover la caja completa?",
      "padding, porque crea espacio interior. margin actúa por fuera del borde.",
      "Cambia solo margin a 32px y explica qué distancia aumenta en la vista previa.",
      "Después de completar, añade box-sizing: border-box y averigua cómo afecta al ancho total de la caja.",
      ["Identifica qué espacio está dentro del borde y cuál separa la caja de sus vecinas.", "padding es interior, margin es exterior; border y border-radius definen el contorno.", "En .caja añade padding: 24px, margin: 16px, un border visible y border-radius: 8px o más."],
      ["La regla .caja necesita al menos 24px de padding.", "Añade al menos 16px de margin a .caja.", "En .caja declara un borde y un border-radius de 8px o más."],
      "Construiste una caja con espacios claros. En el próximo módulo comunicarás el estado interactivo de un botón."),

    guide("Clases CSS, color de fondo y propiedades de una caja.",
      "<style>\n.accion { background: #1c69d4; color: white; transition: background .2s ease; }\n.accion:hover { background: #124a94; }\n</style>\n<button class=\"accion\" type=\"button\">Confirmar salida</button>",
      ["El botón comienza con el fondo definido en .accion.", "transition indica que los cambios de background deben durar .2 segundos.", ":hover reemplaza el fondo mientras el cursor permanece sobre el botón."],
      "¿La transición funciona si existe :hover pero se elimina transition?",
      "El color sí cambia, pero lo hace de inmediato. transition es la que crea el paso gradual entre estados.",
      "Prueba una duración de 1s y decide si la respuesta todavía se siente inmediata.",
      "Después de completar, añade .accion:focus-visible con un outline claro para quien navega con teclado.",
      ["Compara el estado normal con el estado que debe verse al poner el cursor encima.", ":hover define el segundo estado y transition anima el cambio desde la regla principal.", "Conserva el botón accion, añade .accion:hover con otro background y transition: background .2s ease en .accion."],
      ["El documento necesita un button cuya clase incluya accion.", "Añade una regla .accion:hover con al menos una propiedad.", "Declara transition para que el cambio entre estados sea gradual."],
      "Creaste una respuesta visual al cursor. En el nivel siguiente distribuirás varios elementos con Flexbox y Grid."),

    guide("Selectores de clase, cajas y separación con padding.",
      "<style>\n.ruta { display: flex; gap: 16px; justify-content: space-between; }\n.ruta span { padding: 12px; background: #eef3fb; }\n</style>\n<div class=\"ruta\"><span>Museo</span><span>Parque</span><span>Café</span></div>",
      ["display: flex convierte los hijos directos en elementos flexibles de una fila.", "gap mantiene una separación uniforme entre ellos.", "justify-content: space-between coloca el espacio sobrante entre los elementos."],
      "Si añades un cuarto span, ¿necesitas crear otra regla para ponerlo en la fila?",
      "No. Todo hijo directo de .ruta participa automáticamente en el mismo contenedor flexible.",
      "Cambia justify-content a center y compara dónde queda el espacio sobrante.",
      "Después de completar, prueba align-items: center con elementos de distinta altura.",
      ["Mira la regla del elemento que contiene Uno, Dos y Tres, no las reglas de cada tarjeta.", "Flexbox se activa en el padre; gap y justify-content también pertenecen a ese contenedor.", "Dentro de .fila añade display: flex, gap: 16px y justify-content: space-between."],
      ["Activa Flexbox con display: flex dentro de .fila.", "En la misma regla añade un gap de al menos 16px.", "Declara justify-content con una forma de repartir el espacio disponible."],
      "Distribuiste elementos en una dirección. A continuación crearás una composición de filas y columnas con Grid."),

    guide("Contenedores, elementos hijos y la medida gap.",
      "<style>\n.opciones { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }\n.opciones article { padding: 16px; background: #eef3fb; }\n</style>\n<div class=\"opciones\"><article>Tren</article><article>Bus</article><article>Bicicleta</article></div>",
      ["display: grid activa un sistema bidimensional en el contenedor.", "repeat(3, 1fr) crea tres columnas que reciben la misma fracción del espacio.", "gap separa filas y columnas sin añadir márgenes a cada hijo."],
      "Si el contenedor mide 900px y no consideramos el gap, ¿cuánto ocupa cada columna?",
      "Aproximadamente 300px. En la práctica, primero se descuenta el espacio de los gaps y el resto se reparte en tres fracciones.",
      "Cambia repeat(3, 1fr) por repeat(2, 1fr) y observa dónde aparece el tercer elemento.",
      "Después de completar, añade un cuarto article y comprueba cómo Grid crea otra fila.",
      ["Trabaja en la regla del contenedor .grilla y cuenta cuántas columnas iguales pide la misión.", "Grid se activa con display: grid; repeat evita escribir 1fr tres veces.", "Añade display: grid, grid-template-columns: repeat(3, 1fr) y gap: 16px en .grilla."],
      ["La regla .grilla debe activar display: grid.", "Define exactamente tres columnas con repeat(3, 1fr) o tres fracciones equivalentes.", "Añade un gap de al menos 16px en .grilla."],
      "Creaste una grilla de columnas iguales. El siguiente módulo cambiará esa composición cuando falte espacio."),

    guide("Grid con tres columnas y reglas CSS.",
      "<style>\n.lugares { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }\n@media (max-width: 600px) { .lugares { grid-template-columns: 1fr; } }\n</style>\n<div class=\"lugares\"><span>Museo</span><span>Parque</span><span>Café</span></div>",
      ["La primera regla define tres columnas como diseño habitual.", "La condición max-width: 600px se cumple cuando la vista tiene 600px o menos.", "Dentro de la media query, la segunda regla reemplaza únicamente las columnas y conserva el resto."],
      "A 600px exactos, ¿se usa una o tres columnas?",
      "Una columna, porque max-width incluye el valor límite de 600px.",
      "Reduce el navegador por debajo de 600px y luego vuelve a ampliarlo para observar el cambio de regla.",
      "Después de completar, prueba un segundo ajuste móvil, como reducir el gap, sin cambiar las tres comprobaciones principales.",
      ["Conserva primero el diseño de escritorio y piensa qué única propiedad debe cambiar cuando el ancho sea pequeño.", "@media agrupa reglas condicionales; la regla interior vuelve a declarar grid-template-columns.", "Al final de style añade @media (max-width: 600px) { .grilla { grid-template-columns: 1fr; } }."],
      ["Mantén la configuración de tres columnas fuera de la media query.", "Añade una media query cuya condición use max-width: 600px.", "Dentro de esa condición cambia la grilla a grid-template-columns: 1fr."],
      "Adaptaste una composición al ancho disponible. Ahora integrarás estructura, caja, estado y respuesta móvil en una tarjeta."),

    guide("HTML semántico, modelo de caja, estados y media queries.",
      "<style>\n.plan { border: 1px solid #9aa8ba; border-radius: 12px; padding: 24px; }\n.plan:hover { border-color: #1c69d4; }\n@media (max-width: 600px) { .plan { padding: 16px; } }\n</style>\n<article class=\"plan\"><h2>Salida cultural</h2><p>Dos lugares en una tarde.</p><button type=\"button\">Ver plan</button></article>",
      ["article reúne un contenido que se entiende de forma independiente.", ".plan crea su borde, espacio interior y esquinas redondeadas.", ":hover comunica respuesta visual y @media reduce el espacio cuando la pantalla es estrecha."],
      "¿La tarjeta pierde el borde al entrar en la media query?",
      "No. Solo cambia padding; las demás propiedades de .plan siguen vigentes por la cascada.",
      "Cambia el ancho de la página y explica qué propiedad se reemplaza y cuáles se conservan.",
      "Después de completar, añade un estado :focus-visible al botón y recórrelo con la tecla Tab.",
      ["Divide la misión en estructura de article, caja CSS y dos estados según interacción o ancho.", "La misma clase curso conecta el article con .curso, .curso:hover y la regla dentro de @media.", "Usa article.curso con h2, p y button; añade border, padding de 20px o más, .curso:hover y una media query."],
      ["El article con clase curso debe contener título h2, párrafo y botón.", "La regla .curso necesita un borde y padding de al menos 20px.", "Añade tanto .curso:hover como una media query basada en max-width."],
      "Integraste una tarjeta adaptable. En el nivel final mejorarás formularios, datos y controles para que más personas puedan usarlos."),

    guide("Formularios básicos y atributos HTML.",
      "<form>\n  <label for=\"nombre\">Nombre</label>\n  <input id=\"nombre\" name=\"nombre\" required>\n  <button type=\"submit\">Confirmar asistencia</button>\n</form>",
      ["for=\"nombre\" enlaza la etiqueta con el control cuyo id es nombre.", "name identifica el dato que representaría el input al enviar el formulario.", "required marca el campo como obligatorio y el botón submit intenta enviar el formulario."],
      "Si for dice nombre pero el id cambia a persona, ¿la etiqueta sigue vinculada?",
      "No. Ambos valores deben coincidir exactamente para que activar la etiqueta lleve el foco al control.",
      "Activa la etiqueta en la vista previa y comprueba que el foco llega al input asociado.",
      "Después de completar, añade autocomplete=\"email\" al campo para ayudar a rellenarlo.",
      ["Revisa qué texto debe permanecer visible aunque el campo ya tenga contenido.", "label usa for y el input usa el mismo id; type, name y required describen el dato.", "Añade label for=\"correo\", completa el input con id, name, type=\"email\" y required, y usa un botón submit Inscribirme."],
      ["Vincula la etiqueta Correo con el input mediante for=\"correo\" e id=\"correo\".", "El mismo input debe tener name=\"correo\", type=\"email\" y required.", "Dentro del form incluye un botón type=\"submit\" cuyo texto sea Inscribirme."],
      "Construiste un formulario comprensible. A continuación estructurarás datos relacionados para que encabezados y valores conserven su conexión."),

    guide("Agrupación semántica y jerarquía de títulos.",
      "<table>\n  <caption>Horario de la salida</caption>\n  <thead><tr><th scope=\"col\">Lugar</th><th scope=\"col\">Hora</th></tr></thead>\n  <tbody><tr><td>Museo</td><td>11:00</td></tr></tbody>\n</table>",
      ["caption nombra el conjunto completo de datos.", "thead reúne la fila de encabezados y cada th con scope=col describe una columna.", "tbody contiene los registros; cada td queda asociado por posición con su encabezado."],
      "¿Sería correcto usar espacios en un párrafo para alinear Lugar y Hora?",
      "No. Esa alineación se rompe con otros tamaños y no expresa relaciones. Una tabla conserva la estructura entre encabezados y celdas.",
      "Añade temporalmente otra fila a tbody y comprueba que usa las mismas dos columnas.",
      "Después de completar, añade una segunda fila CSS / 8 sin modificar los encabezados.",
      ["Separa el nombre de la tabla, los encabezados y los datos en tres zonas.", "caption, thead y tbody cumplen esas funciones; th necesita scope=\"col\".", "Dentro de table añade caption Plan de estudio, thead con Curso y Horas, y tbody con la fila HTML / 6."],
      ["Añade caption con el texto exacto Plan de estudio dentro de table.", "Crea en thead los encabezados Curso y Horas como th con scope=\"col\".", "Agrupa la fila de datos HTML y 6 dentro de tbody."],
      "Relacionaste encabezados con datos. En el siguiente módulo harás visible qué acción tiene el foco del teclado."),

    guide("Botones nativos, selectores de clase y estados CSS.",
      "<style>\n.confirmar { padding: 12px 18px; }\n.confirmar:focus-visible { outline: 3px solid #1c69d4; outline-offset: 4px; }\n</style>\n<button class=\"confirmar\" type=\"button\">Confirmar</button>",
      ["El button nativo entra en el orden del teclado sin trabajo adicional.", ":focus-visible se activa cuando el navegador debe mostrar una señal clara de foco.", "outline dibuja el indicador sin cambiar la caja y outline-offset lo separa del borde."],
      "¿outline-offset: 4px hace que el botón sea cuatro píxeles más grande?",
      "No. Desplaza visualmente el contorno hacia afuera, pero no altera el tamaño ni la distribución del botón.",
      "Pulsa Tab dentro de la vista previa y comprueba que puedes identificar el botón activo sin usar el cursor.",
      "Después de completar, añade un estado :hover diferente sin retirar el indicador de foco.",
      ["Usa el teclado para pensar qué señal falta cuando el botón recibe la atención.", "El estado :focus-visible pertenece al selector .accion; outline y outline-offset forman el indicador.", "Añade .accion:focus-visible con outline: 3px solid #1c69d4 y outline-offset: 4px; conserva el button type=\"button\"."],
      ["Usa un button nativo con clase accion, type=\"button\" y texto Practicar.", "En .accion:focus-visible define exactamente el contorno solicitado.", "En esa misma regla separa el contorno con outline-offset: 4px."],
      "Añadiste una señal de foco visible. En el último módulo organizarás contenido opcional con un control nativo de teclado."),

    guide("Secciones, títulos y controles operables con teclado.",
      "<style>details { padding: 16px; border: 1px solid #777; }</style>\n<section>\n  <h2>Detalles de la salida</h2>\n  <details><summary>¿Qué debo llevar?</summary><p>Agua y una chaqueta.</p></details>\n</section>",
      ["section agrupa la pregunta dentro de un tema identificado por h2.", "summary es el control visible que abre o cierra details.", "El párrafo permanece dentro de details y el navegador gestiona la interacción con ratón y teclado."],
      "Si colocas el párrafo después de cerrar details, ¿se oculta al cerrar el desplegable?",
      "No. Solo se muestra y oculta el contenido que permanece dentro de details después de summary.",
      "Abre y cierra el ejemplo con clic y teclado; identifica qué parte controla el estado.",
      "Después de completar, añade un segundo details con otra pregunta y comprueba que funciona de manera independiente.",
      ["Ubica primero la pregunta que siempre se verá y la respuesta que debe poder ocultarse.", "summary va primero dentro de details; el párrafo de respuesta va después, dentro del mismo contenedor.", "Dentro de section conserva h2, añade details con la pregunta y respuesta exactas, y define padding: 16px y border: 1px solid #777."],
      ["La section debe comenzar con el título Preguntas frecuentes.", "Dentro crea details con summary ¿Necesito experiencia? y el párrafo Puedes empezar desde cero.", "Añade a details una regla con padding de 16px y el borde solicitado."],
      "Construiste una interfaz estructurada, adaptable y operable con controles nativos. Ya puedes volver a cualquier módulo para combinar estas técnicas en una página propia.")
  ];

  const levelCopy = [
    ["Finalizaste la estructura esencial de HTML.", "Ya puedes jerarquizar texto, organizar listas, describir imágenes y dividir una página en regiones con significado. Antes del mini examen, explica qué información aporta cada etiqueta. En el siguiente nivel separarás el contenido de su presentación con CSS."],
    ["Finalizaste los fundamentos visuales de CSS.", "Ya puedes conectar clases con reglas, mejorar la lectura, controlar cajas y mostrar estados. Antes del mini examen, distingue qué propiedades cambian contenido, espacio y respuesta. El próximo nivel organizará varios elementos en la pantalla."],
    ["Finalizaste la composición adaptable.", "Ya puedes distribuir elementos con Flexbox y Grid, ajustar el diseño al ancho disponible e integrar una tarjeta. Antes del mini examen, cambia el ancho y explica qué reglas se mantienen. En el último nivel mejorarás la comprensión y el uso con teclado."],
    ["Finalizaste las interfaces utilizables de HTML y CSS.", "Ya puedes etiquetar formularios, estructurar tablas, mostrar el foco y crear contenido desplegable. Antes del mini examen, recorre los controles con Tab y explica cómo el HTML conserva su significado sin depender de la apariencia."]
  ];

  function apply(course) {
    if (!course?.levels) return;
    const modules = course.levels.flatMap(level => level.modules);
    if (modules.length !== lessons.length) return;
    modules.forEach((module, index) => {
      const content = lessons[index];
      module.example = content.example;
      module.hints = content.hints;
      module.success = content.success;
      module.lesson = {
        prerequisites: content.prerequisites,
        walkthrough: content.walkthrough,
        prediction: content.prediction,
        answer: content.answer,
        reflection: content.reflection,
        extension: content.extension,
        feedback: content.feedback
      };
    });
    course.levels.forEach((level, index) => {
      level.completionTitle = levelCopy[index][0];
      level.completionCopy = levelCopy[index][1];
      level.approvedCopy = `Aprobaste el mini examen de ${level.title.toLowerCase()}. Puedes repetirlo cuando quieras para repasar.`;
    });
  }

  globalThis.HtmlCssLearning = { apply, lessons };
})();

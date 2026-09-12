/* Fundamentos basados en los tutoriales WAI; comprobaciones parciales, no certificación. */
(() => {
  "use strict";
  const labels = {
    language: "El documento declara español", title: "La pestaña tiene un título descriptivo", heading: "Hay un título principal visible",
    hierarchy: "Los encabezados siguen una jerarquía", sections: "Hay al menos dos secciones de nivel dos",
    main: "Existe un contenido principal", navigation: "La navegación tiene un nombre", skip: "El salto apunta al contenido principal",
    informative: "El diagrama tiene una alternativa descriptiva", imageContext: "La figura incluye un pie explicativo",
    surroundingText: "El contexto también se explica en un párrafo", decorative: "El adorno tiene alt vacío",
    labels: "Los campos tienen etiquetas visibles asociadas", email: "El correo tiene tipo y nombre", button: "Hay un botón nativo con nombre",
    nativeControls: "Las acciones usan controles nativos", tabOrder: "No se fuerza un orden positivo de tabulación",
    descriptiveLinks: "Los enlaces tienen nombres descriptivos", linkTargets: "Los enlaces tienen destinos utilizables",
    group: "Las opciones están en un grupo con leyenda", radioNames: "Las opciones comparten nombre y tienen valores distintos",
    caption: "La tabla tiene un título", headers: "Las columnas tienen encabezados con scope", cells: "Hay celdas de datos",
    colors: "La muestra declara ambos colores sólidos", contrast: "El contraste para texto normal llega a 4,5:1", sample: "La muestra contiene texto",
    feedback: "Un campo inválido apunta a su explicación", status: "Existe una región para comunicar el resultado"
  };
  function lesson(spec, rules) {
    return { ...spec, scenario: { rules, labels }, checks: rules.map((key) => ({ label: labels[key], test: (_, r) => !r.error && r.facts[key] })) };
  }
  const lessons = [
    lesson({
      title: "Dar identidad e idioma a la página", shortTitle: "Idioma y título",
      intro: "Una persona puede orientarse por el título de la pestaña antes de leer la página. El idioma declarado también ayuda a las herramientas de voz a pronunciar el contenido.",
      example: '<html lang="es"><head><title>Inscripción al curso</title></head><body><h1>Inscripción</h1></body></html>',
      explanation: "lang describe el idioma del documento. title identifica la página en pestañas e historial, mientras h1 nombra el contenido visible. Son piezas distintas: poner un h1 no reemplaza el título de la pestaña.",
      concepts: ["lang declara el idioma principal.", "title pertenece a head y nombra la pestaña.", "h1 encabeza el contenido visible."],
      goal: "Crea un documento en español, con un title descriptivo de al menos ocho caracteres y un h1 visible.",
      starter: '<html><head><title>Web</title></head><body><p>Inscripción</p></body></html>',
      hints: ['Agrega lang="es" al elemento html.', "Usa un título concreto como Inscripción al curso.", "Convierte el nombre visible en un h1." ]
    }, ["language", "title", "heading"]),
    lesson({
      title: "Encabezados que describen la estructura", shortTitle: "Jerarquía de encabezados",
      intro: "Los encabezados permiten recorrer una página por sus temas. Elegirlos por el tamaño de la letra puede producir saltos que ocultan la relación entre las secciones.",
      example: "<h1>Curso de Git</h1>\n<h2>Requisitos</h2>\n<h2>Programa</h2>",
      explanation: "Empieza con el título principal y usa h2 para sus secciones. Un h3 subdivide una sección h2. Este ejercicio comprueba el orden de los niveles; decidir si los nombres realmente explican el contenido requiere leerlos.",
      concepts: ["Los encabezados expresan relaciones entre temas.", "El CSS puede cambiar su tamaño sin cambiar su nivel.", "Una secuencia ordenada no garantiza títulos comprensibles."],
      goal: "Reorganiza la página con un h1 y al menos dos secciones h2, sin saltar niveles de encabezado.",
      starter: "<h1>Curso de Git</h1>\n<h4>Requisitos</h4>\n<h4>Programa</h4>",
      hints: ["Conserva un solo h1 para el título principal.", "Cambia Requisitos a h2.", "Programa es otra sección del mismo nivel: usa h2."]
    }, ["heading", "hierarchy", "sections"]),
    lesson({
      title: "Llegar al contenido sin repetir la navegación", shortTitle: "Regiones y salto",
      intro: "Quien recorre una página con teclado no debería atravesar el mismo menú antes de cada lectura. Las regiones y un enlace de salto ofrecen caminos directos.",
      example: '<a href="#contenido">Saltar al contenido</a>\n<main id="contenido">Contenido principal</main>',
      explanation: "main identifica el contenido principal y nav agrupa enlaces de navegación. El enlace de salto apunta a un id real. La comprobación verifica la relación; en la vista previa debes probar Tab y Enter para observar dónde queda el foco.",
      concepts: ["main identifica el contenido principal.", "Una navegación puede tener un nombre con aria-label.", "El destino del salto debe existir en la página."],
      goal: "Agrega una navegación nombrada, un main con id contenido y un enlace que permita saltar a ese contenido.",
      starter: '<nav><a href="#contenido">Curso</a></nav>\n<div>Programa del curso</div>',
      hints: ['Pon aria-label="Principal" en nav.', 'Convierte el contenido en main con id="contenido".', 'Antes del menú, agrega un enlace con href="#contenido" y nombre claro.']
    }, ["main", "navigation", "skip"]),
    lesson({
      title: "Comunicar lo que aporta un diagrama", shortTitle: "Imagen informativa",
      intro: "Un diagrama aporta información que no debe perderse al ocultar la imagen. La alternativa textual debe expresar lo que importa en esta página, no solo decir que existe una imagen.",
      example: '<figure><img id="diagrama" src="flujo.png" alt="La solicitud pasa del navegador a la API y vuelve como JSON"><figcaption>Recorrido de una solicitud.</figcaption></figure>',
      explanation: "alt ofrece una alternativa para la imagen y figcaption agrega un pie visible. No son intercambiables. El laboratorio comprueba que estén presentes; solo una persona puede juzgar si la alternativa comunica el significado correcto. La vista previa no descarga imágenes.",
      concepts: ["La alternativa depende del propósito de la imagen.", "Un pie visible no reemplaza automáticamente alt.", "La calidad del texto necesita revisión humana."],
      goal: "Completa la imagen diagrama con un alt descriptivo, colócala en una figure con figcaption y explica el flujo en un párrafo.",
      starter: '<img id="diagrama" src="flujo.png" alt="imagen">',
      hints: ["Describe el recorrido de los datos en al menos doce caracteres.", "Envuelve la imagen en figure y agrega figcaption.", "Agrega un párrafo que explique el proceso sin depender de la imagen."]
    }, ["informative", "imageContext", "surroundingText"]),
    lesson({
      title: "Evitar ruido con imágenes decorativas", shortTitle: "Imagen decorativa",
      intro: "Un adorno que no comunica información puede interrumpir la lectura si se anuncia como contenido. La decisión depende del uso de la imagen, no de su formato.",
      example: '<img id="adorno" src="separador.png" alt="">',
      explanation: "En una imagen puramente decorativa, alt vacío indica que no hay información que sustituir. Omitir el atributo es distinto: algunas herramientas pueden anunciar el nombre del archivo. No uses alt vacío si la imagen contiene información necesaria.",
      concepts: ["alt vacío y alt ausente son distintos.", "Un adorno no debe duplicar el texto cercano.", "La misma imagen puede ser informativa en otro contexto."],
      goal: "Marca la imagen adorno como decorativa y conserva un h1 y un párrafo que comuniquen todo el contenido.",
      starter: '<h1>Bienvenida</h1>\n<img id="adorno" src="separador.png">\n<p>Elige tu siguiente curso.</p>',
      hints: ['Agrega alt="" al adorno.', "No elimines el título visible.", "Asegúrate de que el párrafo siga explicando qué puede hacer la persona."]
    }, ["decorative", "heading", "surroundingText"]),
    lesson({
      title: "Etiquetas que acompañan a cada campo", shortTitle: "Formularios etiquetados",
      intro: "Un placeholder desaparece al escribir y no sustituye una etiqueta. Un campo con una etiqueta visible asociada conserva su propósito durante toda la interacción.",
      example: '<label for="correo">Correo electrónico</label>\n<input id="correo" name="correo" type="email">',
      explanation: "for debe coincidir con el id del campo. También puedes envolver el campo dentro de label. type email aporta comportamiento nativo y name identifica el dato al enviar un formulario; ninguno reemplaza la etiqueta.",
      concepts: ["La etiqueta debe estar asociada al campo.", "El placeholder es una ayuda, no el nombre del campo.", "Un botón de envío necesita texto visible o un nombre accesible."],
      goal: "Repara el campo de correo con una etiqueta asociada, name correo, type email y un botón nativo con nombre.",
      starter: '<input placeholder="Correo">\n<button>Enviar</button>',
      hints: ['Asigna id="correo" al campo.', 'Agrega label con for="correo" y texto visible.', 'Declara name="correo" y type="email".']
    }, ["labels", "email", "button"]),
    lesson({
      title: "Usar el teclado sin inventar controles", shortTitle: "Botones y teclado",
      intro: "Un div que parece botón no trae por sí mismo el comportamiento de un botón. Los controles nativos incluyen semántica y manejo de teclado que tendrías que reconstruir.",
      example: '<button type="button">Guardar borrador</button>',
      explanation: "Usa button para una acción y a con href para un destino. Los valores positivos de tabindex fuerzan un orden difícil de mantener. Conserva el orden del documento y el indicador de foco; esta comprobación no mide su visibilidad con estilos externos.",
      concepts: ["Un botón nativo responde al teclado.", "Un enlace navega; un botón realiza una acción.", "Evita forzar un orden con tabindex positivo."],
      goal: "Sustituye el control simulado por un botón nativo con nombre y elimina el orden positivo de tabulación.",
      starter: '<div role="button" tabindex="5">Guardar borrador</div>',
      hints: ["Cambia div por button.", "El botón ya tiene semántica: retira role=button.", "Retira tabindex=5 y prueba Tab en la vista previa."]
    }, ["button", "nativeControls", "tabOrder"]),
    lesson({
      title: "Reconocer el destino de los enlaces", shortTitle: "Nombres de enlaces",
      intro: "Una lista de enlaces que solo dice aquí pierde todo su contexto. Nombrar el recurso ayuda a decidir si vale la pena abrirlo.",
      example: '<a href="git.html">Abrir la ruta de Git</a>',
      explanation: "El nombre debe explicar el destino o propósito del enlace. En este ejercicio buscamos nombres visibles descriptivos. La comprobación de longitud es una ayuda limitada: un texto largo también puede ser confuso. Los destinos externos se desactivan en la vista previa de práctica.",
      concepts: ["El enlace necesita un destino real.", "Su nombre debería tener sentido fuera de la frase.", "Las comprobaciones de texto no juzgan toda su calidad."],
      goal: "Escribe un h1 y dos enlaces a rutas del proyecto con nombres descriptivos de al menos ocho caracteres.",
      starter: '<h1>Continúa aprendiendo</h1>\n<a href="git.html">Aquí</a>\n<a href="sql.html">Ver más</a>',
      hints: ["Conserva los destinos git.html y sql.html.", "Sustituye Aquí por Abrir la ruta de Git.", "Nombra también el curso de SQL en el segundo enlace."]
    }, ["heading", "descriptiveLinks", "linkTargets"]),
    lesson({
      title: "Agrupar opciones con una pregunta común", shortTitle: "Grupos de opciones",
      intro: "Dos botones de opción pueden tener etiquetas correctas y aun así carecer de una pregunta que explique qué estás eligiendo. El grupo aporta ese contexto compartido.",
      example: '<fieldset><legend>Modalidad</legend><label><input type="radio" name="modalidad" value="remota">Remota</label></fieldset>',
      explanation: "fieldset agrupa controles relacionados y legend da nombre al grupo. Los radios que representan una elección comparten name y tienen valores distintos. Las etiquetas individuales siguen siendo necesarias.",
      concepts: ["legend explica la pregunta común.", "El mismo name agrupa la elección de radios.", "Cada opción también necesita su propia etiqueta."],
      goal: "Agrupa dos radios de modalidad en un fieldset con legend, etiquetas asociadas, un mismo name y valores distintos.",
      starter: '<input type="radio" name="remota"> Remota\n<input type="radio" name="presencial"> Presencial',
      hints: ["Envuelve las opciones en fieldset y agrega legend Modalidad.", "Envuelve cada radio y su texto en label.", 'Usa name="modalidad" en ambos y valores distintos.']
    }, ["group", "radioNames", "labels"]),
    lesson({
      title: "Dar contexto a los datos de una tabla", shortTitle: "Tablas comprensibles",
      intro: "Al recorrer una tabla, cada valor necesita la referencia de su columna o fila. El formato visual por sí solo no expresa esas relaciones.",
      example: '<table><caption>Duración de cursos</caption><tr><th scope="col">Curso</th><th scope="col">Horas</th></tr><tr><td>Git</td><td>4</td></tr></table>',
      explanation: "caption identifica la tabla. th declara encabezados y scope col relaciona cada uno con su columna en una tabla sencilla. Las tablas complejas requieren asociaciones adicionales; esta introducción trabaja solo con una fila de encabezados.",
      concepts: ["caption da nombre al conjunto de datos.", "th distingue encabezados de valores.", "scope expresa la relación en tablas sencillas."],
      goal: "Repara la tabla con un caption, dos encabezados th con scope col y una fila de datos.",
      starter: '<table><tr><td>Curso</td><td>Horas</td></tr><tr><td>Git</td><td>4</td></tr></table>',
      hints: ["Agrega caption Duración de cursos.", "Convierte Curso y Horas en th.", 'Declara scope="col" en ambos encabezados.']
    }, ["caption", "headers", "cells"]),
    lesson({
      title: "Calcular el contraste de texto normal", shortTitle: "Contraste de colores",
      intro: "Un texto puede ser difícil de leer aunque sus colores parezcan distintos. La relación de luminancias permite comparar el texto y su fondo de forma reproducible.",
      example: '<p id="muestra" style="color:#222222;background-color:#ffffff">Texto del curso</p>',
      explanation: "Para este ejercicio de texto normal buscamos al menos 4,5:1. Declara color y background-color sólidos directamente en la muestra. Se calcula la luminancia relativa y no se redondea para decidir la aprobación. No se evalúan imágenes de fondo, transparencia, CSS externo ni otros requisitos de accesibilidad.",
      concepts: ["El contraste compara texto y fondo.", "El texto normal usa aquí el umbral de 4,5:1.", "La apariencia final exige revisar más que esta pareja de colores."],
      goal: "Cambia los colores sólidos de la muestra para alcanzar al menos 4,5:1 y conserva un texto visible.",
      starter: '<p id="muestra" style="color:#aaaaaa;background-color:#ffffff">Texto del curso</p>',
      hints: ["Conserva el fondo blanco.", "Prueba un gris más oscuro, como #333333.", "Ejecuta y lee la relación calculada, no solo la apariencia."]
    }, ["colors", "contrast", "sample"]),
    lesson({
      title: "Explicar un error y dónde corregirlo", shortTitle: "Formulario con feedback",
      intro: "Pintar un campo de rojo no explica el problema ni cómo resolverlo. Un mensaje asociado y una región de estado permiten comunicar más que un cambio visual.",
      example: '<input id="correo" aria-invalid="true" aria-describedby="error-correo">\n<p id="error-correo">Escribe un correo con @.</p>\n<p role="status">Revisa el correo antes de continuar.</p>',
      explanation: "aria-invalid identifica el estado inválido y aria-describedby apunta a una explicación existente. Una región role status puede comunicar actualizaciones sin mover el foco cuando la aplicación cambia su contenido. Este HTML es estático: valida asociaciones, pero no demuestra que un lector anuncie cambios dinámicos.",
      concepts: ["El error debe decir qué corregir.", "aria-describedby enlaza el campo con la explicación.", "Los anuncios dinámicos se prueban con una aplicación y tecnologías de asistencia."],
      goal: "Completa el formulario con etiquetas asociadas, un campo inválido enlazado a su error visible y una región role status.",
      starter: '<form><input id="correo" type="email" name="correo"><p>Correo incorrecto</p><button>Inscribirme</button></form>',
      hints: ['Agrega label con for="correo".', 'Pon id="error-correo" al mensaje y enlázalo con aria-describedby; agrega aria-invalid="true".', 'Agrega un párrafo role="status" para el resumen del resultado.']
    }, ["labels", "feedback", "status"])
  ];
  const questions = [
    [
      ["¿Qué declara lang?", ["El idioma principal", "El tamaño", "El propietario", "El nivel del curso"], 0, "El idioma ayuda a interpretar y pronunciar el contenido del documento."],
      ["¿Un h1 reemplaza el title de la pestaña?", ["Sí", "Solo en móvil", "No, cumplen funciones distintas", "Solo si es corto"], 2, "title identifica la pestaña y h1 encabeza el contenido visible."],
      ["¿Qué nivel subdivide una sección h2?", ["h1", "h3", "h6 siempre", "Ninguno"], 1, "h3 expresa una subsección de h2 dentro de una jerarquía lógica."],
      ["¿Qué necesita un enlace de salto?", ["Una animación", "Un icono", "Un archivo externo", "Un destino existente en el contenido"], 3, "El href debe referirse al id real del contenido que se quiere alcanzar."],
      ["¿Puede un comprobador juzgar todo el significado de un alt?", ["Sí, contando letras", "No, requiere revisar el contexto", "Sí, si es largo", "Sí, con mayúsculas"], 1, "La presencia del atributo no demuestra que comunique la información adecuada."]
    ],
    [
      ["¿Cómo se marca una imagen puramente decorativa?", ["Sin alt", "Con alt imagen", "Con alt vacío", "Con un title secreto"], 2, "alt vacío indica que el adorno no aporta información que deba anunciarse."],
      ["¿Un placeholder sustituye una etiqueta?", ["No", "Sí, siempre", "Solo si es largo", "Solo en escritorio"], 0, "La etiqueta identifica el campo y permanece durante la interacción."],
      ["¿Qué aporta button frente a un div visual?", ["Una conexión", "Un color obligatorio", "Una imagen", "Semántica y comportamiento de teclado nativos"], 3, "El control nativo incorpora comportamiento que un div no trae por sí mismo."],
      ["¿Por qué evitar tabindex positivo?", ["Porque elimina el texto", "Porque fuerza un orden difícil de mantener", "Porque impide CSS", "Porque requiere red"], 1, "El orden natural del documento suele ser más predecible y mantenible."],
      ["¿Cuál es el nombre más claro de un enlace?", ["Aquí", "Ver", "Programa del curso de SQL", "Clic"], 2, "Nombrar el recurso permite reconocer el destino fuera de la frase."]
    ],
    [
      ["¿Qué da nombre a un grupo fieldset?", ["legend", "strong", "caption", "footer"], 0, "legend expresa la pregunta o el contexto de los controles agrupados."],
      ["¿Para qué sirve scope col en th?", ["Para colorear", "Para asociar el encabezado con su columna", "Para ordenar filas", "Para ocultar datos"], 1, "En tablas sencillas, scope declara la relación del encabezado con las celdas."],
      ["¿Qué relación exige este ejercicio para texto normal?", ["1:1", "2:1", "3:1", "Al menos 4,5:1"], 3, "El cálculo se compara con 4,5 sin redondear para decidir si alcanza el umbral."],
      ["¿Qué hace aria-describedby?", ["Cambia el color", "Envía el formulario", "Relaciona el campo con una descripción existente", "Valida el correo"], 2, "El atributo apunta por id al texto que explica o amplía la información del campo."],
      ["¿Pasar esta ruta certifica una página completa?", ["Sí", "No, faltan revisión manual y pruebas reales", "Solo si tiene 12 elementos", "Solo con fondo blanco"], 1, "Las comprobaciones son parciales y no sustituyen teclado, lector de pantalla y contexto."]
    ]
  ];
  globalThis.CourseKit.define({ id: "accesibilidad", globalName: "AccessibilityCourse", name: "Accesibilidad web", kind: "accessibility", file: "pagina.html",
    levels: ["Orientación y contenido", "Interacción comprensible", "Datos, contraste y errores"], lessons, questions });
})();

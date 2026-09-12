/* Sintaxis CommonMark y documentos que otra persona pueda usar. */
(() => {
  "use strict";
  const nodes = (r, type) => r.nodes.filter((n) => n.type === type);
  const count = (type, min = 1) => (_, r) => nodes(r, type).length >= min;
  const heading = (level, min = 1) => (_, r) => nodes(r, "heading").filter((n) => n.level === level).length >= min;
  const named = (names) => (_, r) => names.every((name) => r.nodes.some((n) => n.type === "text" && n.parent === "heading" && n.literal === name));
  const check = (label, test) => ({ label, test });
  const lessons = [
    {
      title: "Un título y una explicación", shortTitle: "Título y párrafo",
      intro: "Una documentación útil empieza por decir qué hace el proyecto. Markdown permite escribir esa explicación con texto sencillo y convertirlo en una página legible.",
      example: "# Mi proyecto\n\nUna herramienta para organizar tareas.",
      explanation: "Un numeral seguido de un espacio crea un encabezado de nivel uno. Una línea en blanco separa el título del párrafo. El tamaño visual lo decide quien renderiza; el nivel expresa la estructura del documento.",
      concepts: ["El espacio después de # forma parte de la sintaxis.", "Una línea en blanco separa bloques.", "El título identifica el documento; el párrafo explica su propósito."],
      goal: "Escribe un título de nivel uno y un párrafo que explique para qué sirve tu proyecto.",
      starter: "Mi proyecto\n", hints: ["Agrega # y un espacio antes del título.", "Deja una línea vacía después del título.", "Escribe debajo una explicación completa, no otro encabezado."],
      checks: [check("Existe un título principal", heading(1)), check("Existe un párrafo", count("paragraph")), check("La explicación contiene texto", (_, r) => r.nodes.some((n) => n.parent === "paragraph" && n.literal.length >= 20))]
    },
    {
      title: "Organizar el recorrido de lectura", shortTitle: "Secciones",
      intro: "Un README crece rápido. Dividirlo en secciones permite buscar la instalación sin tener que leer la historia completa del proyecto.",
      example: "## Instalación\n\nPasos para empezar.",
      explanation: "Los niveles dos y tres agrupan temas dentro del título principal. No elijas un nivel solo porque se ve más pequeño: conserva una jerarquía que también pueda recorrerse con herramientas de asistencia.",
      concepts: ["# identifica el documento.", "## abre una sección principal.", "### subdivide la sección anterior."],
      goal: "Crea un título principal y dos secciones de nivel dos llamadas Instalación y Uso, cada una con un párrafo.",
      starter: "# Mi proyecto\n", hints: ["Agrega ## Instalación debajo del título.", "Explica la instalación en un párrafo.", "Repite la estructura con ## Uso y otro párrafo."],
      checks: [check("Conserva el título principal", heading(1)), check("Están Instalación y Uso", named(["Instalación", "Uso"])), check("Hay dos secciones y explicaciones", (c, r) => heading(2, 2)(c, r) && count("paragraph", 2)(c, r))]
    },
    {
      title: "Destacar sin convertir todo en un aviso", shortTitle: "Énfasis",
      intro: "El énfasis guía la lectura hacia una palabra importante. Si cada frase está en negrita, esa señal pierde su utilidad.",
      example: "Guarda **los cambios** antes de *continuar*.",
      explanation: "Dos asteriscos delimitan énfasis fuerte y uno delimita énfasis simple. Los delimitadores deben rodear texto y cerrar correctamente. Dentro de un bloque de código se mostrarían literalmente.",
      concepts: ["**texto** produce énfasis fuerte.", "*texto* produce énfasis simple.", "La vista previa permite distinguir marcado de texto literal."],
      goal: "Escribe un párrafo con una advertencia en negrita y una palabra en cursiva usando Markdown.",
      starter: "Guarda los cambios antes de continuar.\n", hints: ["Rodea una frase con dos asteriscos a cada lado.", "Rodea otra palabra con un asterisco a cada lado.", "No pongas todo dentro de un bloque de código."],
      checks: [check("Se renderiza énfasis fuerte", count("strong")), check("Se renderiza énfasis simple", count("emph")), check("El contenido es un párrafo", count("paragraph"))]
    },
    {
      title: "Describir los requisitos de entrada", shortTitle: "Lista de requisitos",
      intro: "Antes de instalar algo necesitas saber qué hace falta. Una lista de requisitos permite revisar cada condición de forma independiente.",
      example: "- Un editor\n- Una terminal\n- Git instalado",
      explanation: "Un guion y un espacio al comienzo de la línea crean un elemento. Esta lista no expresa orden. Si cambiar la posición altera el resultado de un procedimiento, corresponde una lista numerada.",
      concepts: ["La lista con viñetas agrupa elementos sin orden.", "Cada requisito ocupa un elemento.", "Una lista real se reconoce en el árbol renderizado."],
      goal: "Crea la sección Requisitos y una lista de al menos tres herramientas necesarias para empezar.",
      starter: "## Requisitos\n\nEditor, terminal, Git.\n", hints: ["Separa las herramientas en líneas.", "Comienza cada línea con - y un espacio.", "Conserva el encabezado Requisitos."],
      checks: [check("Existe Requisitos", named(["Requisitos"])), check("La lista usa viñetas", (_, r) => nodes(r, "list").some((n) => n.listType === "bullet")), check("Hay tres elementos", count("item", 3))]
    },
    {
      title: "Escribir instrucciones en orden", shortTitle: "Pasos numerados",
      intro: "Un procedimiento reproducible indica qué hacer primero y qué resultado permite continuar. Los pasos numerados ayudan a seguir ese orden.",
      example: "1. Abre la terminal.\n2. Entra al proyecto.\n3. Ejecuta el programa.",
      explanation: "Markdown reconoce una lista numerada por el número seguido de punto y espacio. El renderizador organiza la numeración; las instrucciones deben seguir siendo concretas aunque cambie su presentación.",
      concepts: ["La numeración comunica una secuencia.", "Un paso debe contener una acción concreta.", "El encabezado explica qué logra el procedimiento."],
      goal: "Crea la sección Inicio rápido y una secuencia de al menos tres pasos para ejecutar un proyecto.",
      starter: "## Inicio rápido\n\n- Abrir el proyecto\n", hints: ["Cambia la viñeta por 1. seguido de un espacio.", "Agrega un segundo y un tercer paso.", "Verifica que la vista previa muestre números."],
      checks: [check("Existe Inicio rápido", named(["Inicio rápido"])), check("La lista tiene orden", (_, r) => nodes(r, "list").some((n) => n.listType === "ordered")), check("Incluye tres pasos", count("item", 3))]
    },
    {
      title: "Enlaces que explican su destino", shortTitle: "Enlaces útiles",
      intro: "Una documentación puede enlazar fuentes externas sin obligar a adivinar el destino. El texto del enlace debe tener sentido fuera de la frase.",
      example: "[Referencia de CommonMark](https://commonmark.org/help/)",
      explanation: "El texto visible va entre corchetes y la dirección entre paréntesis. Un texto como Referencia de CommonMark explica más que aquí. Comprueba siempre que la fuente realmente respalde lo que documentas.",
      concepts: ["Los corchetes contienen el nombre visible.", "Los paréntesis contienen el destino.", "Nombrar el recurso facilita reconocer el enlace."],
      goal: "Escribe dos enlaces HTTPS a documentación, cada uno con un nombre descriptivo de al menos ocho caracteres.",
      starter: "Documentación: https://commonmark.org/help/\n", hints: ["Envuelve el nombre del recurso entre corchetes.", "Agrega la URL entre paréntesis inmediatamente después.", "Incluye un segundo recurso con otro nombre descriptivo."],
      checks: [check("Hay dos enlaces", count("link", 2)), check("Los destinos usan HTTPS", (_, r) => nodes(r, "link").length >= 2 && nodes(r, "link").every((n) => n.destination.startsWith("https://"))), check("Los nombres son descriptivos", (_, r) => r.nodes.filter((n) => n.type === "text" && n.parent === "link" && n.literal.length >= 8).length >= 2)]
    },
    {
      title: "Separar instrucciones de código", shortTitle: "Código en línea",
      intro: "Los nombres de archivos y comandos deben distinguirse de la explicación. El código en línea conserva esos caracteres como texto literal.",
      example: "Abre `README.md` y ejecuta `node app.js`.",
      explanation: "Un acento grave a cada lado marca código en línea. Los asteriscos dentro se muestran literalmente. Usa esta forma para una referencia corta; un programa de varias líneas necesita un bloque.",
      concepts: ["Los acentos graves delimitan código.", "Dentro no se aplica énfasis Markdown.", "El párrafo conserva la explicación alrededor."],
      goal: "Escribe un párrafo que mencione README.md y node app.js como dos fragmentos de código en línea.",
      starter: "Abre README.md y ejecuta node app.js.\n", hints: ["Rodea README.md con acentos graves.", "Haz lo mismo con node app.js.", "Conserva las palabras que explican qué hacer."],
      checks: [check("Hay dos fragmentos en línea", count("code", 2)), check("El archivo está marcado como código", (_, r) => nodes(r, "code").some((n) => n.literal === "README.md")), check("El comando está marcado como código", (_, r) => nodes(r, "code").some((n) => n.literal === "node app.js"))]
    },
    {
      title: "Mostrar un ejemplo que se pueda copiar", shortTitle: "Bloques de código",
      intro: "Un ejemplo completo reduce las dudas sobre comillas y saltos de línea. La documentación debe distinguir el programa de la salida esperada.",
      example: '```javascript\nconsole.log("Hola");\n```',
      explanation: "Tres acentos graves abren un bloque y otros tres lo cierran. La etiqueta javascript comunica el lenguaje; no ejecuta el programa ni garantiza resaltado. Esta vista previa conserva el código como texto.",
      concepts: ["Los bloques conservan los saltos de línea.", "La etiqueta identifica el lenguaje.", "Mostrar código no equivale a ejecutarlo."],
      goal: 'Incluye un bloque javascript con console.log("Hola"); y un párrafo que indique que la salida esperada es Hola.',
      starter: 'console.log("Hola");\n', hints: ["Agrega una línea con tres acentos graves y javascript.", "Cierra el bloque después del programa.", "Explica la salida fuera del bloque."],
      checks: [check("El bloque identifica JavaScript", (_, r) => nodes(r, "code_block").some((n) => n.info === "javascript")), check("El bloque conserva el programa", (_, r) => nodes(r, "code_block").some((n) => n.literal.includes('console.log("Hola");'))), check("La salida se explica en un párrafo", count("paragraph"))]
    },
    {
      title: "Separar una nota del procedimiento", shortTitle: "Notas y citas",
      intro: "Una nota puede explicar una limitación sin interrumpir la secuencia principal. Las citas en bloque permiten distinguir ese texto del resto.",
      example: "> Nota: este ejemplo funciona sin conexión.",
      explanation: "El signo mayor que introduce una cita en bloque. Aquí lo usamos para una nota editorial. Si citas palabras de otra persona, añade atribución y un enlace a la fuente; la sintaxis no convierte un texto en una fuente fiable.",
      concepts: ["> abre una cita en bloque.", "Una línea vacía separa la nota del párrafo siguiente.", "Una cita ajena necesita atribución."],
      goal: "Crea una nota en bloque sobre una limitación y un párrafo independiente que explique cómo continuar.",
      starter: "Nota: el ejemplo no usa red.\n", hints: ["Coloca > y un espacio delante de la nota.", "Deja una línea vacía.", "Escribe un párrafo sin > para continuar el documento."],
      checks: [check("Hay una cita en bloque", count("block_quote")), check("Contiene un párrafo", (_, r) => r.nodes.some((n) => n.type === "paragraph" && n.parent === "block_quote")), check("Hay texto fuera de la nota", (_, r) => r.nodes.some((n) => n.type === "paragraph" && n.parent === "document"))]
    },
    {
      title: "Explicar una imagen sin depender de ella", shortTitle: "Texto alternativo",
      intro: "Una imagen de documentación puede faltar o no ser visible para quien lee. El texto alternativo debe comunicar la información relevante en ese contexto.",
      example: "![Flujo: entrada, proceso y salida](flujo.png)",
      explanation: "La sintaxis es parecida a un enlace, pero comienza con !. El texto entre corchetes se convierte en alt. En este laboratorio no descargamos imágenes: puedes inspeccionar el texto alternativo y el destino, sin depender de una URL externa.",
      concepts: ["! distingue la imagen del enlace.", "El texto alternativo comunica el contenido relevante.", "La explicación en texto debe seguir siendo útil sin la imagen."],
      goal: "Incluye una imagen con destino flujo.png, texto alternativo descriptivo y un párrafo que explique el flujo.",
      starter: "![imagen](flujo.png)\n", hints: ["Sustituye imagen por una descripción de al menos doce caracteres.", "Conserva flujo.png como destino.", "Agrega debajo un párrafo que explique el flujo."],
      checks: [check("La imagen apunta a flujo.png", (_, r) => nodes(r, "image").some((n) => n.destination === "flujo.png")), check("Hay una alternativa descriptiva", (_, r) => r.nodes.some((n) => n.type === "text" && n.parent === "image" && n.literal.length >= 12)), check("Existe una explicación fuera de la imagen", (_, r) => r.nodes.some((n) => n.type === "text" && n.parent === "paragraph" && n.literal.length >= 20))]
    },
    {
      title: "Un README para la primera ejecución", shortTitle: "README ejecutable",
      intro: "Quien llega al repositorio necesita saber qué instalar, qué ejecutar y qué debería ver. Un README útil responde esas preguntas sin conocimiento previo del equipo.",
      example: "## Requisitos\n\n- Node.js\n\n## Instalación\n\n## Uso",
      explanation: "Separa los requisitos de los pasos de instalación y del primer uso. Escribe los comandos en bloques y acompáñalos con resultados esperados. Este ejercicio valida estructura; aún debes probar los comandos en un entorno real.",
      concepts: ["Los requisitos se declaran antes de empezar.", "Instalación y uso responden preguntas distintas.", "Los comandos documentados deben probarse fuera de la vista previa."],
      goal: "Crea un README con título, secciones Requisitos, Instalación y Uso, una lista y dos bloques de comandos.",
      starter: "# Mi proyecto\n\nPendiente de documentar.\n", hints: ["Agrega las tres secciones con ##.", "Lista las herramientas necesarias en Requisitos.", "Pon un bloque de comandos en Instalación y otro en Uso."],
      checks: [check("Están las tres secciones", named(["Requisitos", "Instalación", "Uso"])), check("Incluye título y requisitos", (c, r) => heading(1)(c, r) && count("item")(c, r)), check("Incluye dos bloques de comandos", count("code_block", 2))]
    },
    {
      title: "Un reporte que permite reproducir un error", shortTitle: "Reporte de error",
      intro: "Decir no funciona obliga a otra persona a reconstruir el problema. Un reporte reproducible conserva el contexto, los pasos y la diferencia entre lo esperado y lo observado.",
      example: "## Reproducción\n\n1. Abre el proyecto.\n2. Ejecuta el comando.",
      explanation: "Organiza el reporte en Resumen, Reproducción, Esperado y Actual. Copia el error como código literal, pero elimina contraseñas y datos personales. La estructura facilita investigar; no sustituye una reproducción mínima comprobada.",
      concepts: ["Los pasos deben poder repetirse.", "Esperado y Actual muestran la diferencia.", "Un registro no debe publicar secretos."],
      goal: "Escribe un reporte con título, las cuatro secciones pedidas, tres pasos numerados y el mensaje observado en un bloque de código.",
      starter: "# Algo no funciona\n", hints: ["Agrega Resumen, Reproducción, Esperado y Actual con ##.", "Enumera tres acciones bajo Reproducción.", "Pon el mensaje literal en un bloque bajo Actual."],
      checks: [check("Están las cuatro secciones", named(["Resumen", "Reproducción", "Esperado", "Actual"])), check("Incluye una reproducción ordenada", (_, r) => nodes(r, "list").some((n) => n.listType === "ordered") && nodes(r, "item").length >= 3), check("Incluye título y mensaje literal", (c, r) => heading(1)(c, r) && count("code_block")(c, r))]
    }
  ];
  const questions = [
    [
      ["¿Qué expresa el nivel de un encabezado?", ["Su color", "La estructura del documento", "La fecha", "La prioridad del servidor"], 1, "Los niveles organizan temas y subtemas, independientemente del tamaño visual."],
      ["¿Qué crea # seguido de un espacio?", ["Un encabezado de nivel uno", "Una imagen", "Un comentario", "Una lista"], 0, "El numeral seguido de espacio introduce el título principal."],
      ["¿Cómo se marca énfasis fuerte?", ["Con comillas", "Con corchetes", "Con ** a ambos lados", "Con paréntesis"], 2, "Dos asteriscos a cada lado delimitan el énfasis fuerte."],
      ["¿Cuándo conviene una lista con viñetas?", ["Cuando el orden es obligatorio", "Para ejecutar código", "Para ocultar texto", "Cuando los elementos no tienen un orden obligatorio"], 3, "Los requisitos independientes no necesitan una secuencia numérica."],
      ["¿Qué separa dos párrafos?", ["Una línea en blanco", "Un color", "Una URL", "Un punto y coma"], 0, "La línea en blanco separa bloques de texto en Markdown."]
    ],
    [
      ["¿Cuál es un texto de enlace más útil?", ["Aquí", "Haz clic", "Guía de instalación de Git", "Más"], 2, "El nombre del recurso comunica el destino incluso fuera de contexto."],
      ["¿Qué encierran los paréntesis de un enlace?", ["El autor", "La dirección de destino", "La contraseña", "El tamaño"], 1, "Los corchetes contienen el texto y los paréntesis el destino."],
      ["¿Qué delimita código en línea?", ["Acentos graves", "Numerales", "Guiones", "Comillas dobles"], 0, "Los acentos graves mantienen ese fragmento como código literal."],
      ["¿La etiqueta javascript de un bloque ejecuta el código?", ["Siempre", "Solo con conexión", "Solo en GitHub", "No, identifica el lenguaje"], 3, "La etiqueta describe el bloque; renderizarlo no lo ejecuta."],
      ["¿Cuándo usar una lista numerada?", ["Para decorar", "Cuando los pasos deben seguir un orden", "Para enlaces secretos", "Para texto alternativo"], 1, "La numeración comunica una secuencia de acciones reproducibles."]
    ],
    [
      ["¿Qué debe comunicar el texto alternativo?", ["El nombre de quien diseñó", "La información relevante de la imagen", "Siempre la palabra imagen", "El tamaño del archivo"], 1, "La alternativa depende del propósito de la imagen en ese contexto."],
      ["¿Qué necesita una cita ajena?", ["Un fondo azul", "Solo el signo >", "Atribución y fuente", "Una captura"], 2, "La sintaxis separa el bloque, pero la atribución identifica la fuente."],
      ["¿Qué debe preceder a la instalación?", ["Los requisitos necesarios", "Una lista de errores futuros", "Una contraseña real", "El historial completo"], 0, "Los requisitos permiten comprobar si el entorno está preparado."],
      ["¿Qué diferencia hace investigable un reporte?", ["Color y tamaño", "Autor y avatar", "Día y mes", "Resultado esperado y resultado actual"], 3, "Esa diferencia describe el comportamiento que se necesita corregir."],
      ["¿Qué sigue pendiente aunque el README se renderice bien?", ["Borrar los párrafos", "Probar los comandos documentados", "Agregar más negrita", "Eliminar requisitos"], 1, "La estructura correcta no garantiza que las instrucciones funcionen."]
    ]
  ];
  globalThis.CourseKit.define({ id: "markdown", globalName: "MarkdownCourse", name: "Markdown y documentación", kind: "markdown", file: "README.md",
    levels: ["Estructura y lectura", "Instrucciones y ejemplos", "Documentación útil"], lessons, questions });
})();

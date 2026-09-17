(() => {
  "use strict";

  const has = (pattern) => (code) => pattern.test(String(code));
  const count = (pattern, minimum) => (code) => (String(code).match(pattern) || []).length >= minimum;
  const both = (...tests) => (code) => tests.every(test => test(code));
  const check = (label, test) => ({ label, test });

  function module(spec) {
    const result = {
      id: spec.id,
      kicker: `Módulo ${String(spec.id).padStart(2, "0")} · ${spec.topic}`,
      title: spec.title,
      shortTitle: spec.shortTitle,
      duration: spec.duration || "18 min",
      difficulty: spec.difficulty || "Avanzado",
      intro: spec.intro,
      example: spec.example,
      explanation: spec.explanation,
      concepts: spec.concepts,
      goal: spec.goal,
      hints: spec.hints,
      file: spec.file || "index.html",
      starter: spec.starter,
      checks: spec.checks,
      success: spec.success || "Aplicaste la técnica con una estructura que puedes revisar visualmente.",
      lesson: {
        prerequisites: spec.prerequisites,
        walkthrough: spec.steps,
        prediction: spec.prediction,
        answer: spec.answer,
        reflection: spec.reflection,
        extension: spec.extension,
        feedback: spec.checks.map((item, index) => `Revisa «${item.label}». ${spec.hints[Math.min(index, 2)]}`)
      }
    };
    return result;
  }

  const levels = [
    {
      title: "Contenido semántico avanzado",
      description: "Fechas, navegación, citas y fragmentos técnicos",
      modules: [
        module({
          id: 17, topic: "Contenido", title: "Publica una actividad con fecha", shortTitle: "article y time",
          prerequisites: "Haber completado las etiquetas semánticas y la jerarquía de títulos.",
          intro: "Un artículo independiente y una fecha legible por máquinas permiten reutilizar la misma actividad en listados, buscadores y calendarios.",
          example: '<article>\n  <h2>Taller de fotografía</h2>\n  <p><time datetime="2026-10-03T11:00">3 de octubre, 11:00</time></p>\n  <p>Recorrido práctico por el parque.</p>\n</article>',
          explanation: "article encierra contenido que se entiende por sí mismo. time mantiene un texto humano y agrega en datetime un valor normalizado que otras herramientas pueden interpretar.",
          concepts: ["article crea una unidad independiente", "time representa una fecha u hora", "datetime usa una forma normalizada"],
          goal: "Crea un article sobre Clínica de HTML con h2, descripción y time. El texto visible debe decir 12 de octubre, 18:30 y datetime debe ser 2026-10-12T18:30.",
          starter: '<section>\n  <h2>Clínica de HTML</h2>\n  <p>Revisaremos una página entre todos.</p>\n  <p>12 de octubre, 18:30</p>\n</section>',
          hints: ["La actividad completa debe vivir dentro de article.", "Rodea la fecha visible con time.", "Añade datetime=\"2026-10-12T18:30\" sin cambiar el texto que leerá la persona."],
          checks: [
            check("Usas article con un h2", has(/<article\b[^>]*>[\s\S]*<h2\b[^>]*>\s*Clínica de HTML\s*<\/h2>[\s\S]*<\/article>/i)),
            check("La fecha visible está dentro de time", has(/<time\b[^>]*>\s*12 de octubre, 18:30\s*<\/time>/i)),
            check("datetime contiene la fecha normalizada", has(/<time\b[^>]*datetime\s*=\s*["']2026-10-12T18:30["']/i))
          ],
          steps: ["article abre una unidad que puede aparecer fuera de esta página.", "h2 nombra la actividad y los párrafos aportan su contexto.", "time muestra una fecha natural mientras datetime conserva el valor normalizado."],
          prediction: "¿Cambiará el texto visible si agregas datetime al elemento time?",
          answer: "No. datetime agrega significado para herramientas; la persona sigue leyendo el contenido escrito entre las etiquetas.",
          reflection: "Cambia solo el texto visible a una forma más breve y comprueba que datetime permanece igual.",
          extension: "Añade una segunda actividad como otro article y conserva una fecha propia en cada una."
        }),
        module({
          id: 18, topic: "Navegación", title: "Orienta con migas de pan", shortTitle: "Breadcrumb semántico",
          prerequisites: "Reutiliza nav, listas y enlaces con textos descriptivos.",
          intro: "Una ruta de navegación explica dónde está la página y permite volver a niveles anteriores sin depender de la memoria.",
          example: '<nav aria-label="Migas de pan">\n  <ol>\n    <li><a href="/">Inicio</a></li>\n    <li><a href="/cursos">Cursos</a></li>\n    <li aria-current="page">HTML</li>\n  </ol>\n</nav>',
          explanation: "nav delimita la navegación, aria-label distingue su propósito y aria-current marca el elemento que representa la página actual sin convertirlo en un enlace innecesario.",
          concepts: ["nav nombra una zona de navegación", "ol conserva el orden jerárquico", "aria-current identifica la ubicación actual"],
          goal: "Crea migas Inicio, Rutas y HTML y CSS dentro de nav con aria-label Migas de pan. Los dos primeros son enlaces y el último usa aria-current=\"page\".",
          starter: '<div>\n  <a href="index.html">Inicio</a> /\n  <span>HTML y CSS</span>\n</div>',
          hints: ["Usa nav con una lista ol.", "Crea tres li y enlaza solo Inicio y Rutas.", "En el último li agrega aria-current=\"page\"."],
          checks: [
            check("La navegación tiene un nombre accesible", has(/<nav\b[^>]*aria-label\s*=\s*["']Migas de pan["'][^>]*>/i)),
            check("La lista ordenada contiene tres pasos", both(has(/<ol\b[\s\S]*<\/ol>/i), count(/<li\b/gi, 3))),
            check("HTML y CSS marca la página actual", has(/<li\b[^>]*aria-current\s*=\s*["']page["'][^>]*>\s*HTML y CSS\s*<\/li>/i))
          ],
          steps: ["nav anuncia que el bloque contiene navegación.", "ol organiza Inicio, Cursos y HTML según su profundidad.", "aria-current evita que la ubicación actual parezca otro destino."],
          prediction: "¿Conviene que el último elemento vuelva a enlazar la misma página?",
          answer: "No es necesario. Marcarlo como página actual informa la ubicación sin ofrecer una acción redundante.",
          reflection: "Lee la lista de izquierda a derecha y explica qué nivel representa cada elemento.",
          extension: "Agrega separadores solo con CSS para que no formen parte del nombre de cada enlace."
        }),
        module({
          id: 19, topic: "Citas", title: "Atribuye una cita correctamente", shortTitle: "blockquote y cite",
          prerequisites: "Reutiliza párrafos, enlaces y agrupación semántica.",
          intro: "Una cita necesita distinguir las palabras citadas de su fuente. La estructura correcta mantiene esa relación incluso sin estilos.",
          example: '<figure>\n  <blockquote cite="https://example.com/guia">\n    <p>Aprender mejora cuando practicas.</p>\n  </blockquote>\n  <figcaption>— <cite>Guía de estudio</cite></figcaption>\n</figure>',
          explanation: "blockquote contiene una cita extensa y cite puede señalar la obra. figure y figcaption agrupan la cita con su atribución visible.",
          concepts: ["blockquote separa una cita extensa", "cite nombra una obra o fuente", "figcaption presenta la atribución"],
          goal: "Crea una figure con blockquote que diga La práctica convierte ideas en habilidades y cite=\"https://example.com/aprender\". Atribuye la cita en figcaption con cite que diga Manual de aprendizaje.",
          starter: '<p>“La práctica convierte ideas en habilidades”.</p>\n<p>Manual de aprendizaje</p>',
          hints: ["Agrupa cita y fuente dentro de figure.", "El texto citado va en blockquote, idealmente dentro de p.", "Usa figcaption y cite para Manual de aprendizaje; agrega el atributo cite a blockquote."],
          checks: [
            check("figure agrupa la cita y su atribución", has(/<figure\b[\s\S]*<blockquote\b[\s\S]*<figcaption\b[\s\S]*<\/figure>/i)),
            check("blockquote conserva el texto y la URL de fuente", has(/<blockquote\b[^>]*cite\s*=\s*["']https:\/\/example\.com\/aprender["'][^>]*>[\s\S]*La práctica convierte ideas en habilidades[\s\S]*<\/blockquote>/i)),
            check("cite nombra Manual de aprendizaje", has(/<cite\b[^>]*>\s*Manual de aprendizaje\s*<\/cite>/i))
          ],
          steps: ["figure reúne una pieza de contenido con su leyenda.", "blockquote conserva la cita y cite enlaza su procedencia en los datos.", "figcaption muestra la atribución y cite nombra la obra."],
          prediction: "¿El atributo cite muestra automáticamente un enlace visible?",
          answer: "No. Aporta metadatos; si quieres un enlace visible debes escribirlo dentro de la atribución.",
          reflection: "Quita temporalmente los estilos del navegador y comprueba que la fuente sigue unida a la cita.",
          extension: "Convierte el nombre de la obra en un enlace visible sin retirar el elemento cite."
        }),
        module({
          id: 20, topic: "Contenido técnico", title: "Documenta comandos y teclas", shortTitle: "pre, code y kbd",
          prerequisites: "Reutiliza jerarquía, párrafos y caracteres escapados en HTML.",
          intro: "La documentación técnica debe distinguir un bloque de código, un término en línea y una tecla que la persona debe pulsar.",
          example: '<h2>Ejecutar el proyecto</h2>\n<p>Abre una terminal con <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd>.</p>\n<pre><code>python app.py\n</code></pre>',
          explanation: "pre conserva espacios y saltos, code identifica código y kbd representa una entrada del teclado. Combinarlos comunica forma y significado.",
          concepts: ["pre conserva el formato", "code identifica instrucciones", "kbd representa teclas o entradas"],
          goal: "Escribe un h2 Ejecutar pruebas, una instrucción que use kbd para Ctrl y Enter, y un bloque pre > code con python -m unittest.",
          starter: '<h2>Ejecutar pruebas</h2>\n<p>Presiona Ctrl y Enter.</p>\n<p>python -m unittest</p>',
          hints: ["Rodea cada tecla con kbd.", "Usa pre para conservar la línea del comando.", "Dentro de pre coloca code con el texto exacto python -m unittest."],
          checks: [
            check("El documento conserva el título solicitado", has(/<h2\b[^>]*>\s*Ejecutar pruebas\s*<\/h2>/i)),
            check("Ctrl y Enter se representan con kbd", both(has(/<kbd\b[^>]*>\s*Ctrl\s*<\/kbd>/i), has(/<kbd\b[^>]*>\s*Enter\s*<\/kbd>/i))),
            check("El comando vive dentro de pre y code", has(/<pre\b[^>]*>\s*<code\b[^>]*>\s*python -m unittest\s*<\/code>\s*<\/pre>/i))
          ],
          steps: ["h2 anuncia la tarea documentada.", "kbd diferencia las teclas de las palabras de la oración.", "pre conserva el bloque y code afirma que su contenido es una instrucción."],
          prediction: "¿Qué elemento conserva los saltos y espacios: code o pre?",
          answer: "pre conserva el formato; code aporta el significado de código, por eso suelen anidarse.",
          reflection: "Añade una segunda línea al bloque y comprueba que aparece debajo sin usar br.",
          extension: "Agrega una explicación con un fragmento code en línea para nombrar unittest."
        })
      ]
    },
    {
      title: "Formularios robustos",
      description: "Grupos, tipos, restricciones y resultados",
      modules: [
        module({
          id: 21, topic: "Formularios", title: "Agrupa opciones relacionadas", shortTitle: "fieldset y legend",
          prerequisites: "Haber creado formularios con label, input y button.",
          intro: "Cuando varias opciones responden una misma pregunta, fieldset y legend comunican el grupo y su propósito.",
          example: '<fieldset>\n  <legend>Modalidad preferida</legend>\n  <label><input type="radio" name="modalidad" value="online"> En línea</label>\n  <label><input type="radio" name="modalidad" value="presencial"> Presencial</label>\n</fieldset>',
          explanation: "fieldset agrupa controles y legend actúa como su pregunta. Los radio con el mismo name forman una única elección.",
          concepts: ["fieldset agrupa controles", "legend nombra el grupo", "name une botones de radio"],
          goal: "Crea un fieldset con legend Ritmo de estudio y tres radio con name=\"ritmo\", valores suave, constante e intensivo. Cada opción debe tener texto visible.",
          starter: '<form>\n  <p>Ritmo de estudio</p>\n  <input type="radio"> Suave\n</form>',
          hints: ["Rodea las opciones con fieldset y usa legend para la pregunta.", "Todos los radio necesitan el mismo name ritmo.", "Crea tres valores distintos: suave, constante e intensivo."],
          checks: [
            check("fieldset contiene la leyenda", has(/<fieldset\b[\s\S]*<legend\b[^>]*>\s*Ritmo de estudio\s*<\/legend>[\s\S]*<\/fieldset>/i)),
            check("Existen tres botones de radio", count(/<input\b[^>]*type\s*=\s*["']radio["']/gi, 3)),
            check("Los tres radio comparten name ritmo y valores distintos", both(count(/<input\b[^>]*name\s*=\s*["']ritmo["']/gi, 3), has(/value\s*=\s*["']suave["']/i), has(/value\s*=\s*["']constante["']/i), has(/value\s*=\s*["']intensivo["']/i)))
          ],
          steps: ["fieldset abre el límite lógico de la pregunta.", "legend presenta Modalidad preferida como nombre común.", "Los dos radio comparten name y el navegador permite seleccionar solo uno."],
          prediction: "¿Qué ocurre si cada radio usa un name distinto?",
          answer: "Se podrán marcar varios a la vez porque el navegador los tratará como grupos independientes.",
          reflection: "Selecciona cada opción y confirma que la anterior se desmarca.",
          extension: "Añade una breve ayuda con aria-describedby para explicar cuánto tiempo implica cada ritmo."
        }),
        module({
          id: 22, topic: "Entradas", title: "Ayuda al navegador a completar datos", shortTitle: "Tipos y autocomplete",
          prerequisites: "Reutiliza label, id, name, required y tipos de input.",
          intro: "El tipo correcto y autocomplete permiten teclados adecuados, validación básica y sugerencias que reducen errores al completar formularios.",
          example: '<label for="correo">Correo</label>\n<input id="correo" name="correo" type="email" autocomplete="email" required>',
          explanation: "type describe el dato y autocomplete usa un token conocido por el navegador. Ambos complementan una etiqueta visible y un name estable.",
          concepts: ["type adapta entrada y validación", "autocomplete describe el dato personal", "label mantiene un nombre visible"],
          goal: "Crea campos Nombre y Correo. Usa type=text con autocomplete=name y type=email con autocomplete=email. Ambos deben tener label asociado, name y required.",
          starter: '<form>\n  <input placeholder="Nombre">\n  <input placeholder="Correo">\n  <button>Continuar</button>\n</form>',
          hints: ["Agrega un label con for y un id coincidente a cada input.", "Usa autocomplete name y email según el campo.", "Incluye name, required y type explícito en ambos controles."],
          checks: [
            check("Nombre tiene etiqueta y configuración completa", both(has(/<label\b[^>]*for\s*=\s*["']nombre["'][^>]*>\s*Nombre\s*<\/label>/i), has(/<input\b(?=[^>]*id\s*=\s*["']nombre["'])(?=[^>]*name\s*=\s*["']nombre["'])(?=[^>]*type\s*=\s*["']text["'])(?=[^>]*autocomplete\s*=\s*["']name["'])(?=[^>]*\brequired\b)[^>]*>/i))),
            check("Correo tiene etiqueta asociada", has(/<label\b[^>]*for\s*=\s*["']correo["'][^>]*>\s*Correo\s*<\/label>/i)),
            check("Correo usa email, autocomplete y required", has(/<input\b(?=[^>]*id\s*=\s*["']correo["'])(?=[^>]*name\s*=\s*["']correo["'])(?=[^>]*type\s*=\s*["']email["'])(?=[^>]*autocomplete\s*=\s*["']email["'])(?=[^>]*\brequired\b)[^>]*>/i))
          ],
          steps: ["label y for conectan el texto Correo con el control.", "type=email permite al navegador reconocer el formato esperado.", "autocomplete=email ofrece datos guardados compatibles sin reemplazar required."],
          prediction: "¿placeholder sustituye correctamente a label?",
          answer: "No. Desaparece al escribir y no siempre funciona como nombre accesible consistente; label debe permanecer visible.",
          reflection: "Activa las etiquetas y comprueba que el foco llega al campo correcto.",
          extension: "Agrega un campo de teléfono con type=tel y autocomplete=tel."
        }),
        module({
          id: 23, topic: "Validación", title: "Expresa restricciones en HTML", shortTitle: "Validación nativa",
          prerequisites: "Reutiliza tipos de input, atributos y mensajes de ayuda.",
          intro: "Las restricciones nativas detienen valores claramente incompletos antes del envío y documentan parte del contrato directamente en el HTML.",
          example: '<label for="usuario">Usuario</label>\n<input id="usuario" name="usuario" minlength="4" maxlength="16" pattern="[a-z0-9]+" required>\n<small id="ayuda">Usa letras minúsculas y números.</small>',
          explanation: "minlength y maxlength limitan longitud, pattern describe la forma y required impide el vacío. El texto de ayuda debe explicar la regla antes de que falle.",
          concepts: ["minlength define un mínimo", "pattern expresa una forma permitida", "La ayuda visible anticipa la regla"],
          goal: "Crea un campo usuario asociado a label, required, minlength=4, maxlength=12 y pattern=\"[a-z0-9]+\". Conecta aria-describedby=\"ayuda-usuario\" con un small que explique Letras minúsculas y números.",
          starter: '<label>Usuario</label>\n<input id="usuario">',
          hints: ["Relaciona label for con id usuario.", "Agrega required, minlength, maxlength y pattern al mismo input.", "Crea small id=\"ayuda-usuario\" y referencia ese id desde aria-describedby."],
          checks: [
            check("La etiqueta está asociada con usuario", has(/<label\b[^>]*for\s*=\s*["']usuario["'][^>]*>\s*Usuario\s*<\/label>/i)),
            check("El input contiene las cuatro restricciones", has(/<input\b(?=[^>]*id\s*=\s*["']usuario["'])(?=[^>]*\brequired\b)(?=[^>]*minlength\s*=\s*["']4["'])(?=[^>]*maxlength\s*=\s*["']12["'])(?=[^>]*pattern\s*=\s*["']\[a-z0-9\]\+["'])[^>]*>/i)),
            check("La ayuda visible está conectada", both(has(/aria-describedby\s*=\s*["']ayuda-usuario["']/i), has(/<small\b[^>]*id\s*=\s*["']ayuda-usuario["'][^>]*>[\s\S]*Letras minúsculas y números[\s\S]*<\/small>/i)))
          ],
          steps: ["La etiqueta nombra el campo antes de escribir.", "Los atributos limitan longitud y caracteres aceptados.", "aria-describedby une la explicación visible con el control."],
          prediction: "¿pattern evita que alguien modifique la petición fuera del navegador?",
          answer: "No. Ayuda en la interfaz, pero un servidor real debe validar nuevamente cualquier dato recibido.",
          reflection: "Prueba abc, abcd y ABCD y compara qué restricción interviene.",
          extension: "Añade title con una explicación breve sin retirar el texto de ayuda visible."
        }),
        module({
          id: 24, topic: "Resultados", title: "Muestra medidas con elementos nativos", shortTitle: "output, progress y meter",
          prerequisites: "Reutiliza etiquetas, atributos numéricos y texto alternativo visible.",
          intro: "HTML incluye elementos que representan resultados, avance y medidas dentro de un rango sin construir barras genéricas desde cero.",
          example: '<label for="avance">Ruta completada</label>\n<progress id="avance" value="7" max="10">7 de 10</progress>\n<p>Confianza: <meter min="0" max="100" value="75">75%</meter></p>\n<output name="estado">En progreso</output>',
          explanation: "progress indica una tarea que avanza, meter representa un valor dentro de un rango conocido y output identifica un resultado calculado o actualizado.",
          concepts: ["progress representa avance", "meter compara una medida con un rango", "output identifica un resultado"],
          goal: "Muestra Progreso del curso con progress value=8 max=12, una Confianza con meter min=0 max=100 value=80 y un output name=\"estado\" que diga Buen avance.",
          starter: '<p>Progreso del curso: 8 de 12</p>\n<p>Confianza: 80%</p>\n<p>Buen avance</p>',
          hints: ["Usa progress solo para el avance de una tarea.", "Usa meter para el valor dentro del rango de confianza.", "Representa Buen avance con output y name estado."],
          checks: [
            check("progress usa 8 de 12", has(/<progress\b(?=[^>]*value\s*=\s*["']?8["']?)(?=[^>]*max\s*=\s*["']?12["']?)[^>]*>/i)),
            check("meter usa el rango 0–100 y valor 80", has(/<meter\b(?=[^>]*min\s*=\s*["']?0["']?)(?=[^>]*max\s*=\s*["']?100["']?)(?=[^>]*value\s*=\s*["']?80["']?)[^>]*>/i)),
            check("output informa Buen avance", has(/<output\b[^>]*name\s*=\s*["']estado["'][^>]*>\s*Buen avance\s*<\/output>/i))
          ],
          steps: ["progress compara 7 con un máximo de 10 como avance pendiente.", "meter ubica 75 dentro de un rango de 0 a 100.", "output presenta En progreso como resultado con significado propio."],
          prediction: "¿Usarías meter para indicar que faltan tres descargas?",
          answer: "No si la tarea está avanzando; progress expresa mejor un proceso incompleto y meter una medida estable dentro de un rango.",
          reflection: "Cambia los valores y explica cuál comunica tarea y cuál comunica medida.",
          extension: "Añade textos dentro de progress y meter que sigan siendo útiles si el navegador no dibuja sus controles."
        })
      ]
    },
    {
      title: "Sistema visual con CSS",
      description: "Variables, clases, escalas fluidas y pseudoelementos",
      modules: [
        module({
          id: 25, topic: "CSS", title: "Centraliza colores con variables", shortTitle: "Custom properties",
          prerequisites: "Reutiliza selectores, propiedades, clases y la cascada.",
          intro: "Las variables CSS guardan decisiones visuales con nombres. Cambiar una definición actualiza todos los componentes que la consumen.",
          example: '<style>\n:root { --color-principal: #185c45; --espacio: 16px; }\n.tarjeta { color: var(--color-principal); padding: var(--espacio); }\n</style>\n<article class="tarjeta">Ruta recomendada</article>',
          explanation: ":root define valores disponibles en el documento y var() los recupera. Un nombre semántico expresa la función del color en lugar de repetir un hexadecimal.",
          concepts: [":root comparte variables", "--nombre define una custom property", "var() consume el valor"],
          goal: "Define --fondo: #eef7e8, --texto: #17352a y --radio: 12px en :root. Usa las tres variables en .aviso para background, color y border-radius.",
          starter: '<style>\n.aviso {\n  background: #ffffff;\n  color: #222222;\n}\n</style>\n<p class="aviso">Próxima sesión: martes.</p>',
          hints: ["Crea una regla :root antes del componente.", "Cada variable comienza con dos guiones.", "En .aviso usa var(--fondo), var(--texto) y var(--radio)."],
          checks: [
            check(":root define las tres variables", has(/:root\s*\{(?=[^}]*--fondo\s*:\s*#eef7e8)(?=[^}]*--texto\s*:\s*#17352a)(?=[^}]*--radio\s*:\s*12px)[^}]*\}/is)),
            check(".aviso usa las variables de color", has(/\.aviso\s*\{(?=[^}]*background\s*:\s*var\(\s*--fondo\s*\))(?=[^}]*color\s*:\s*var\(\s*--texto\s*\))[^}]*\}/is)),
            check(".aviso usa la variable de radio", has(/\.aviso\s*\{[^}]*border-radius\s*:\s*var\(\s*--radio\s*\)/is))
          ],
          steps: [":root asigna nombres a color y espacio.", ".tarjeta solicita esos valores con var().", "El navegador resuelve cada variable en el lugar donde se usa."],
          prediction: "¿Cuántas reglas debes cambiar para modificar el color principal de todos los componentes?",
          answer: "Una definición en :root, siempre que los componentes consuman esa variable.",
          reflection: "Cambia temporalmente --fondo y observa qué propiedad del componente responde.",
          extension: "Agrega una variable --espacio y úsala para padding."
        }),
        module({
          id: 26, topic: "Cascada", title: "Compone variantes sin duplicar estilos", shortTitle: "Clases de componente",
          prerequisites: "Reutiliza clases y comprende que una etiqueta puede tener varias.",
          intro: "Una clase base comparte estructura y una clase de variante cambia solo lo necesario. Así evitas copiar bloques completos para cada botón.",
          example: '<style>\n.boton { padding: 10px 16px; border: 2px solid currentColor; }\n.boton--principal { background: #185c45; color: white; }\n.boton--secundario { background: transparent; color: #185c45; }\n</style>\n<button class="boton boton--principal">Guardar</button>',
          explanation: "La clase boton aporta la forma común. Las variantes se combinan en el mismo elemento y declaran únicamente color o fondo.",
          concepts: ["Una clase base comparte estructura", "Una variante modifica pocas propiedades", "Varias clases se combinan en un elemento"],
          goal: "Crea .boton con padding y border-radius. Crea .boton--principal con fondo #185c45 y color white, y .boton--secundario con fondo transparent y color #185c45. Muestra dos button que combinen la base con cada variante.",
          starter: '<style>\n.guardar { padding: 12px; background: green; }\n.cancelar { padding: 12px; background: white; }\n</style>\n<button class="guardar">Guardar</button>\n<button class="cancelar">Cancelar</button>',
          hints: ["Mueve las propiedades comunes a .boton.", "Crea dos clases cuyo nombre comience con boton--.", "Cada button necesita dos clases separadas por un espacio."],
          checks: [
            check(".boton contiene padding y border-radius", has(/\.boton\s*\{(?=[^}]*padding\s*:)(?=[^}]*border-radius\s*:)[^}]*\}/is)),
            check("Las dos variantes definen sus colores", both(has(/\.boton--principal\s*\{(?=[^}]*background\s*:\s*#185c45)(?=[^}]*color\s*:\s*(?:white|#fff(?:fff)?))[^}]*\}/is), has(/\.boton--secundario\s*\{(?=[^}]*background\s*:\s*transparent)(?=[^}]*color\s*:\s*#185c45)[^}]*\}/is))),
            check("Dos botones combinan base y variante", both(has(/<button\b[^>]*class\s*=\s*["'][^"']*\bboton\b[^"']*\bboton--principal\b[^"']*["']/i), has(/<button\b[^>]*class\s*=\s*["'][^"']*\bboton\b[^"']*\bboton--secundario\b[^"']*["']/i)))
          ],
          steps: [".boton concentra tamaño y borde comunes.", ".boton--principal añade el tratamiento de la acción destacada.", "El atributo class combina ambas decisiones en el mismo botón."],
          prediction: "¿Qué ocurre con padding si cambias solo la clase de variante?",
          answer: "Se conserva porque sigue llegando desde .boton; la variante cambia únicamente sus propiedades propias.",
          reflection: "Intercambia las variantes entre ambos botones y observa qué permanece igual.",
          extension: "Añade una variante boton--peligro sin duplicar padding ni border-radius."
        }),
        module({
          id: 27, topic: "Escalas", title: "Crea una tipografía fluida", shortTitle: "clamp()",
          prerequisites: "Reutiliza font-size, unidades rem y media queries.",
          intro: "clamp() permite que un tamaño crezca con la pantalla sin bajar de un mínimo ni superar un máximo.",
          example: '<style>\nh1 { font-size: clamp(2rem, 5vw, 4rem); line-height: 1.05; }\n.intro { font-size: clamp(1rem, 2vw, 1.25rem); }\n</style>\n<h1>Aprende a tu ritmo</h1>\n<p class="intro">Una cápsula cada vez.</p>',
          explanation: "clamp(mínimo, preferido, máximo) limita un valor fluido. vw responde al ancho y rem mantiene extremos relacionados con el tamaño base.",
          concepts: ["clamp limita un valor fluido", "vw responde al ancho de pantalla", "rem conserva una escala legible"],
          goal: "Aplica a .titulo font-size: clamp(2rem, 6vw, 4.5rem) y line-height: 1.05. Aplica a .bajada font-size: clamp(1rem, 2vw, 1.25rem). Crea h1.titulo y p.bajada.",
          starter: '<style>\n.titulo { font-size: 32px; }\n.bajada { font-size: 16px; }\n</style>\n<h1>Tu próxima ruta</h1>\n<p>Aprende con proyectos pequeños.</p>',
          hints: ["Agrega las clases titulo y bajada al HTML.", "Copia los tres valores de clamp en el orden mínimo, fluido y máximo.", "Mantén line-height: 1.05 dentro de .titulo."],
          checks: [
            check("El HTML usa titulo y bajada", both(has(/<h1\b[^>]*class\s*=\s*["'][^"']*\btitulo\b/i), has(/<p\b[^>]*class\s*=\s*["'][^"']*\bbajada\b/i))),
            check(".titulo usa clamp y line-height", has(/\.titulo\s*\{(?=[^}]*font-size\s*:\s*clamp\(\s*2rem\s*,\s*6vw\s*,\s*4\.5rem\s*\))(?=[^}]*line-height\s*:\s*1\.05)[^}]*\}/is)),
            check(".bajada usa su escala fluida", has(/\.bajada\s*\{[^}]*font-size\s*:\s*clamp\(\s*1rem\s*,\s*2vw\s*,\s*1\.25rem\s*\)/is))
          ],
          steps: ["El primer valor protege el mínimo legible.", "5vw permite crecer en anchos intermedios.", "El último valor detiene el crecimiento antes de que el título domine toda la pantalla."],
          prediction: "¿Puede el h1 bajar de 2rem en una pantalla estrecha?",
          answer: "No. clamp nunca entrega menos que su primer argumento.",
          reflection: "Cambia el valor central y observa solo los anchos donde el tamaño todavía no alcanzó sus límites.",
          extension: "Crea una variable CSS para la escala del título y reutilízala en otra página."
        }),
        module({
          id: 28, topic: "Detalles", title: "Añade detalles sin contenido extra", shortTitle: "Pseudoelementos",
          prerequisites: "Reutiliza selectores de clase, position y atributos data.",
          intro: "Los pseudoelementos pueden dibujar adornos o etiquetas auxiliares que no forman parte del contenido esencial.",
          example: '<style>\n.etiqueta::before { content: "★ "; color: #185c45; }\n.enlace::after { content: " ↗"; }\n</style>\n<span class="etiqueta">Recomendado</span>\n<a class="enlace" href="#ruta">Ver ruta</a>',
          explanation: "::before y ::after crean cajas estilables alrededor del contenido. Deben reservarse para decoración o información redundante, porque su texto no sustituye contenido esencial.",
          concepts: ["::before crea una caja inicial", "::after crea una caja final", "content define lo generado"],
          goal: "Crea un enlace class=\"externo\" con texto Documentación. Usa .externo::after con content: \" ↗\". Crea .destacado::before con content: \"★ \" y úsala en un span que diga Recomendado.",
          starter: '<a href="https://developer.mozilla.org">Documentación ↗</a>\n<span>★ Recomendado</span>',
          hints: ["Retira los símbolos escritos directamente del HTML.", "Agrega las clases externo y destacado a sus elementos.", "Define content dentro de ::after y ::before."],
          checks: [
            check("El enlace externo conserva texto y clase", has(/<a\b[^>]*class\s*=\s*["'][^"']*\bexterno\b[^"']*["'][^>]*>\s*Documentación\s*<\/a>/i)),
            check(".externo::after genera la flecha", has(/\.externo\s*::after\s*\{[^}]*content\s*:\s*["'][^"']*↗[^"']*["']/is)),
            check(".destacado::before genera la estrella", both(has(/<span\b[^>]*class\s*=\s*["'][^"']*\bdestacado\b[^"']*["'][^>]*>\s*Recomendado\s*<\/span>/i), has(/\.destacado\s*::before\s*\{[^}]*content\s*:\s*["'][^"']*★[^"']*["']/is)))
          ],
          steps: ["El HTML conserva palabras comprensibles sin los adornos.", "::before inserta la estrella antes de Recomendado.", "::after añade la flecha después del enlace sin cambiar su nombre principal."],
          prediction: "¿El enlace sigue siendo comprensible si el CSS no carga?",
          answer: "Sí, porque Documentación permanece en el HTML y la flecha solo complementa visualmente.",
          reflection: "Desactiva temporalmente las reglas y comprueba qué información esencial permanece.",
          extension: "Usa currentColor para que los símbolos hereden el color del componente."
        })
      ]
    },
    {
      title: "Diseño adaptable moderno",
      description: "Mobile first, contenedores, grillas fluidas e imágenes",
      modules: [
        module({
          id: 29, topic: "Responsive", title: "Construye desde móvil hacia arriba", shortTitle: "Mobile first",
          prerequisites: "Haber usado media queries con max-width y Grid.",
          intro: "Mobile first define primero la composición que funciona con poco espacio y añade columnas solo cuando existe ancho suficiente.",
          example: '<style>\n.lista { display: grid; gap: 16px; grid-template-columns: 1fr; }\n@media (min-width: 700px) { .lista { grid-template-columns: repeat(3, 1fr); } }\n</style>',
          explanation: "La regla base sirve a móviles. La media query min-width agrega complejidad desde 700px sin tener que deshacer una composición de escritorio.",
          concepts: ["La regla base atiende pantallas estrechas", "min-width añade capacidad", "La mejora conserva el contenido"],
          goal: "Crea .cursos como grid de una columna y gap 16px. Desde min-width: 720px cambia a repeat(3, 1fr). Incluye tres article dentro de un contenedor class=\"cursos\".",
          starter: '<style>\n.cursos { display: grid; grid-template-columns: repeat(3, 1fr); }\n</style>\n<div class="cursos"><article>HTML</article><article>CSS</article></div>',
          hints: ["La regla fuera de @media debe tener una sola columna.", "Agrega un tercer article y gap: 16px.", "Usa @media (min-width: 720px) para activar tres columnas."],
          checks: [
            check("La regla base usa una columna y gap", has(/\.cursos\s*\{(?=[^}]*display\s*:\s*grid)(?=[^}]*grid-template-columns\s*:\s*1fr)(?=[^}]*gap\s*:\s*16px)[^}]*\}/is)),
            check("La mejora comienza en 720px", has(/@media\s*\(\s*min-width\s*:\s*720px\s*\)\s*\{[\s\S]*\.cursos\s*\{[^}]*grid-template-columns\s*:\s*repeat\(\s*3\s*,\s*1fr\s*\)/i)),
            check("El contenedor incluye tres article", both(has(/class\s*=\s*["'][^"']*\bcursos\b/i), count(/<article\b/gi, 3)))
          ],
          steps: ["La grilla comienza con una columna que cabe en móvil.", "gap separa sus elementos en cualquier ancho.", "La consulta min-width reemplaza solo las columnas cuando hay espacio."],
          prediction: "¿Cuántas columnas habrá exactamente a 720px?",
          answer: "Tres, porque min-width incluye el valor límite.",
          reflection: "Cambia el límite a 900px y observa durante qué tramo se conserva una columna.",
          extension: "Añade un punto intermedio de dos columnas desde 520px."
        }),
        module({
          id: 30, topic: "Contenedores", title: "Limita líneas sin fijar la pantalla", shortTitle: "Contenedor fluido",
          prerequisites: "Reutiliza width, max-width, margin y padding.",
          intro: "Un contenedor fluido ocupa el ancho disponible, conserva aire lateral y detiene su crecimiento antes de producir líneas incómodas.",
          example: '<style>\n.contenedor { width: min(100% - 32px, 1120px); margin-inline: auto; }\n</style>\n<main class="contenedor">Contenido centrado</main>',
          explanation: "min() elige el valor menor entre el ancho disponible con márgenes y el máximo deseado. margin-inline funciona en ambos sentidos de escritura.",
          concepts: ["min() compara dos tamaños", "margin-inline centra horizontalmente", "max-width limita el crecimiento"],
          goal: "Crea .contenedor con width: min(100% - 32px, 1100px) y margin-inline: auto. Aplica la clase a main y agrega un h1 y un párrafo.",
          starter: '<style>\nmain { width: 1100px; }\n</style>\n<main><h1>Panel de aprendizaje</h1></main>',
          hints: ["Usa una clase contenedor en lugar de seleccionar todo main.", "Copia width: min(100% - 32px, 1100px).", "Agrega margin-inline: auto y un párrafo dentro de main."],
          checks: [
            check("main usa la clase contenedor", has(/<main\b[^>]*class\s*=\s*["'][^"']*\bcontenedor\b/i)),
            check("El ancho es fluido y limitado", has(/\.contenedor\s*\{[^}]*width\s*:\s*min\(\s*100%\s*-\s*32px\s*,\s*1100px\s*\)/is)),
            check("El contenedor se centra y contiene título y párrafo", both(has(/\.contenedor\s*\{[^}]*margin-inline\s*:\s*auto/is), has(/<main\b[\s\S]*<h1\b[\s\S]*<p\b[\s\S]*<\/main>/i)))
          ],
          steps: ["100% - 32px reserva aire en una pantalla estrecha.", "1120px detiene el crecimiento en una pantalla amplia.", "margin-inline auto reparte el espacio exterior y centra el bloque."],
          prediction: "¿Qué ancho gana en una pantalla de 800px?",
          answer: "768px, porque 100% - 32px es menor que el límite de 1100px.",
          reflection: "Cambia el límite y observa que los márgenes móviles continúan funcionando.",
          extension: "Define el espacio lateral como una variable CSS."
        }),
        module({
          id: 31, topic: "Grid", title: "Deja que Grid decida las columnas", shortTitle: "auto-fit y minmax",
          prerequisites: "Reutiliza display grid, repeat(), fr y gap.",
          intro: "auto-fit con minmax crea tantas columnas como caben y las apila sin depender de varios puntos de quiebre manuales.",
          example: '<style>\n.catalogo { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }\n</style>',
          explanation: "minmax impide que una tarjeta baje de 220px y permite que crezca hasta una fracción. auto-fit ajusta la cantidad de columnas disponibles.",
          concepts: ["auto-fit calcula la cantidad", "minmax define límites", "1fr reparte el espacio sobrante"],
          goal: "Crea .catalogo con grid, repeat(auto-fit, minmax(240px, 1fr)) y gap 24px. Incluye cuatro article con class=\"curso\".",
          starter: '<style>\n.catalogo { display: flex; }\n</style>\n<div class="catalogo"><article>HTML</article><article>CSS</article></div>',
          hints: ["Cambia el contenedor a display: grid.", "Usa exactamente repeat(auto-fit, minmax(240px, 1fr)).", "Agrega gap 24px y completa cuatro article.curso."],
          checks: [
            check(".catalogo activa Grid", has(/\.catalogo\s*\{[^}]*display\s*:\s*grid/is)),
            check("Las columnas usan auto-fit y minmax", has(/grid-template-columns\s*:\s*repeat\(\s*auto-fit\s*,\s*minmax\(\s*240px\s*,\s*1fr\s*\)\s*\)/i)),
            check("Hay gap y cuatro tarjetas curso", both(has(/\.catalogo\s*\{[^}]*gap\s*:\s*24px/is), count(/<article\b[^>]*class\s*=\s*["'][^"']*\bcurso\b/gi, 4)))
          ],
          steps: ["minmax protege un ancho mínimo de 220px.", "auto-fit prueba cuántas columnas caben.", "1fr expande las columnas elegidas para ocupar el espacio libre."],
          prediction: "¿Qué ocurre cuando ya no caben dos columnas de 240px más el gap?",
          answer: "Grid reduce la composición a una columna y cada tarjeta puede crecer hasta 1fr.",
          reflection: "Amplía y estrecha la vista para contar cuántas columnas aparecen sin media query.",
          extension: "Combina el catálogo con el contenedor fluido del módulo anterior."
        }),
        module({
          id: 32, topic: "Imágenes", title: "Entrega imágenes adaptables", shortTitle: "picture y srcset",
          prerequisites: "Haber usado img, alt, figure y media queries.",
          intro: "picture permite ofrecer fuentes distintas según el ancho o formato, mientras img mantiene la alternativa final y su descripción.",
          example: '<picture>\n  <source media="(min-width: 800px)" srcset="portada-grande.webp">\n  <img src="portada-pequena.webp" alt="Personas estudiando en una mesa">\n</picture>',
          explanation: "El navegador evalúa source y, si no coincide o no puede usarlo, recurre a img. alt permanece en img porque describe el contenido en todas las variantes.",
          concepts: ["picture coordina fuentes", "source aporta una condición", "img mantiene fallback y alt"],
          goal: "Crea picture con source media=\"(min-width: 800px)\" srcset=\"aula-grande.webp\" e img src=\"aula-pequena.webp\" alt=\"Personas aprendiendo desarrollo web\" width=\"640\" height=\"360\".",
          starter: '<img src="aula-grande.webp" alt="Aula">',
          hints: ["Envuelve la imagen final con picture.", "Coloca source antes de img y agrega media y srcset.", "Completa el alt y reserva dimensiones 640 por 360 en img."],
          checks: [
            check("picture contiene source antes de img", has(/<picture\b[^>]*>[\s\S]*<source\b[\s\S]*<img\b[\s\S]*<\/picture>/i)),
            check("source define condición y recurso grande", has(/<source\b(?=[^>]*media\s*=\s*["']\(min-width: 800px\)["'])(?=[^>]*srcset\s*=\s*["']aula-grande\.webp["'])[^>]*>/i)),
            check("img conserva fallback, alt y dimensiones", has(/<img\b(?=[^>]*src\s*=\s*["']aula-pequena\.webp["'])(?=[^>]*alt\s*=\s*["']Personas aprendiendo desarrollo web["'])(?=[^>]*width\s*=\s*["']640["'])(?=[^>]*height\s*=\s*["']360["'])[^>]*>/i))
          ],
          steps: ["picture abre el conjunto de alternativas.", "source se ofrece solo desde 800px.", "img funciona como fallback y conserva descripción y dimensiones."],
          prediction: "¿Dónde debe escribirse alt: en source o en img?",
          answer: "En img, que representa el contenido compartido por todas las fuentes.",
          reflection: "Cambia la condición de source y explica qué recurso escogería cada ancho.",
          extension: "Añade un source WebP y conserva un img JPEG como alternativa de formato."
        })
      ]
    },
    {
      title: "Componentes de interfaz",
      description: "Tarjetas, navegación, avisos y diálogos",
      modules: [
        module({
          id: 33, topic: "Componentes", title: "Construye una tarjeta reutilizable", shortTitle: "Tarjeta de curso",
          prerequisites: "Integra article, clases, variables, Grid y botones o enlaces.",
          intro: "Una tarjeta útil conserva la misma estructura, separa contenido de acciones y admite repetir el componente con otros datos.",
          example: '<article class="tarjeta-curso">\n  <span class="tarjeta-curso__etiqueta">Inicial</span>\n  <h2>HTML y CSS</h2>\n  <p>Construye interfaces claras.</p>\n  <a href="#html">Abrir ruta</a>\n</article>',
          explanation: "article crea una unidad independiente y los nombres de clase describen partes del componente. El enlace expresa la acción real de navegación.",
          concepts: ["article delimita el componente", "Las clases nombran sus partes", "El enlace describe el destino"],
          goal: "Crea article.tarjeta-curso con etiqueta Intermedio, h2 CSS adaptable, párrafo y enlace Ver curso. Estila la tarjeta con padding 24px, border y border-radius 16px; separa contenido con display grid y gap 12px.",
          starter: '<div>\n  <b>Intermedio</b>\n  <h2>CSS adaptable</h2>\n  <a href="#">Ver</a>\n</div>',
          hints: ["Cambia el contenedor a article con clase tarjeta-curso.", "Completa etiqueta, párrafo y texto del enlace.", "En .tarjeta-curso combina grid, gap, padding, border y border-radius."],
          checks: [
            check("La tarjeta tiene contenido y acción completos", has(/<article\b[^>]*class\s*=\s*["'][^"']*\btarjeta-curso\b[\s\S]*Intermedio[\s\S]*<h2\b[^>]*>\s*CSS adaptable\s*<\/h2>[\s\S]*<p\b[\s\S]*<a\b[^>]*>\s*Ver curso\s*<\/a>[\s\S]*<\/article>/i)),
            check("La tarjeta usa Grid y separación", has(/\.tarjeta-curso\s*\{(?=[^}]*display\s*:\s*grid)(?=[^}]*gap\s*:\s*12px)(?=[^}]*padding\s*:\s*24px)[^}]*\}/is)),
            check("La tarjeta define borde y radio", has(/\.tarjeta-curso\s*\{(?=[^}]*border\s*:)(?=[^}]*border-radius\s*:\s*16px)[^}]*\}/is))
          ],
          steps: ["article reúne nivel, título, descripción y acción.", "La clase del componente controla su caja completa.", "Grid y gap separan las partes sin márgenes particulares."],
          prediction: "¿Puedes duplicar el article y cambiar solo los textos?",
          answer: "Sí. La estructura y las clases se reutilizan; cada copia puede contener otros datos.",
          reflection: "Duplica temporalmente la tarjeta y comprueba que ambas conservan el mismo ritmo visual.",
          extension: "Coloca varias tarjetas dentro del catálogo auto-fit del módulo 31."
        }),
        module({
          id: 34, topic: "Navegación", title: "Crea una navegación que envuelve", shortTitle: "Navegación flexible",
          prerequisites: "Reutiliza nav, aria-label, listas, Flexbox y aria-current.",
          intro: "Una navegación adaptable debe mantener destinos claros, indicar la página actual y pasar a otra línea cuando falta espacio.",
          example: '<nav aria-label="Principal">\n  <ul class="menu">\n    <li><a aria-current="page" href="/">Inicio</a></li>\n    <li><a href="/rutas">Rutas</a></li>\n  </ul>\n</nav>\n<style>.menu { display: flex; flex-wrap: wrap; gap: 12px; }</style>',
          explanation: "La lista conserva relaciones entre destinos. flex-wrap evita desbordamiento y aria-current hace visible también para tecnologías de apoyo qué enlace representa la página actual.",
          concepts: ["La lista agrupa destinos", "flex-wrap permite nuevas filas", "aria-current comunica estado"],
          goal: "Crea nav aria-label=\"Principal\" con ul.menu y enlaces Inicio, Rutas, Mi cuenta. Marca Rutas con aria-current=\"page\". Estila .menu con flex, flex-wrap: wrap, gap 16px y list-style: none.",
          starter: '<div>Inicio | Rutas | Mi cuenta</div>',
          hints: ["Convierte cada destino en a dentro de li y ul.", "Marca solo Rutas como página actual.", "En .menu agrega las cuatro propiedades solicitadas."],
          checks: [
            check("nav Principal contiene una lista de tres enlaces", both(has(/<nav\b[^>]*aria-label\s*=\s*["']Principal["']/i), has(/<ul\b[^>]*class\s*=\s*["'][^"']*\bmenu\b/i), count(/<a\b/gi, 3))),
            check("Rutas marca la página actual", has(/<a\b[^>]*aria-current\s*=\s*["']page["'][^>]*>\s*Rutas\s*<\/a>/i)),
            check("El menú envuelve y conserva separación", has(/\.menu\s*\{(?=[^}]*display\s*:\s*flex)(?=[^}]*flex-wrap\s*:\s*wrap)(?=[^}]*gap\s*:\s*16px)(?=[^}]*list-style\s*:\s*none)[^}]*\}/is))
          ],
          steps: ["nav y aria-label nombran la zona.", "ul reúne los destinos como un conjunto relacionado.", "Flexbox reparte enlaces y flex-wrap permite una segunda línea."],
          prediction: "¿Qué propiedad evita que los enlaces salgan del contenedor estrecho?",
          answer: "flex-wrap: wrap permite que los elementos continúen en otra fila.",
          reflection: "Estrecha la vista previa y observa en qué momento cambia la cantidad de filas.",
          extension: "Añade un estilo visible para [aria-current=\"page\"]."
        }),
        module({
          id: 35, topic: "Mensajes", title: "Presenta un aviso comprensible", shortTitle: "Aviso con estado",
          prerequisites: "Reutiliza roles, títulos, párrafos y variables CSS.",
          intro: "Un aviso necesita texto claro, una estructura que pueda anunciarse y estilos que no dependan solo del color.",
          example: '<section class="aviso" role="status" aria-labelledby="aviso-titulo">\n  <h2 id="aviso-titulo">Cambios guardados</h2>\n  <p>Tu progreso está actualizado.</p>\n</section>',
          explanation: "role=status permite anunciar una actualización no urgente. aria-labelledby usa el título visible como nombre y el borde aporta una señal adicional al color.",
          concepts: ["status anuncia cambios no urgentes", "aria-labelledby reutiliza un título", "Borde y texto refuerzan el significado"],
          goal: "Crea section.aviso role=\"status\" aria-labelledby=\"estado-titulo\" con h2 id=\"estado-titulo\" Progreso guardado y un párrafo. Estila con border-left: 4px solid #185c45, padding 16px y background #eef7e8.",
          starter: '<div style="color: green">Guardado</div>',
          hints: ["Usa section con class aviso y role status.", "Conecta aria-labelledby con el id del h2 visible.", "Añade las tres propiedades CSS sin quitar el texto."],
          checks: [
            check("El aviso tiene rol y nombre conectado", has(/<section\b(?=[^>]*class\s*=\s*["'][^"']*\baviso\b)(?=[^>]*role\s*=\s*["']status["'])(?=[^>]*aria-labelledby\s*=\s*["']estado-titulo["'])[^>]*>/i)),
            check("El título visible coincide con el nombre", has(/<h2\b[^>]*id\s*=\s*["']estado-titulo["'][^>]*>\s*Progreso guardado\s*<\/h2>/i)),
            check(".aviso combina borde, espacio y fondo", has(/\.aviso\s*\{(?=[^}]*border-left\s*:\s*4px\s+solid\s+#185c45)(?=[^}]*padding\s*:\s*16px)(?=[^}]*background\s*:\s*#eef7e8)[^}]*\}/is))
          ],
          steps: ["section agrupa el mensaje actualizado.", "El h2 visible nombra la región mediante aria-labelledby.", "El borde, el fondo y el texto entregan señales complementarias."],
          prediction: "¿role=status convierte el mensaje en urgente?",
          answer: "No. status se usa para actualizaciones informativas; alert corresponde a mensajes que requieren atención inmediata.",
          reflection: "Lee el aviso sin considerar sus colores y comprueba que el significado permanece.",
          extension: "Crea una variante de error con otro texto e icono visible, sin depender solo del rojo."
        }),
        module({
          id: 36, topic: "Diálogos", title: "Estructura un diálogo nativo", shortTitle: "dialog",
          prerequisites: "Reutiliza títulos, formularios y botones con tipos explícitos.",
          intro: "dialog expresa una ventana superpuesta con semántica nativa. Su contenido todavía necesita un título claro y acciones comprensibles.",
          example: '<dialog open aria-labelledby="dialogo-titulo">\n  <h2 id="dialogo-titulo">Confirmar salida</h2>\n  <p>¿Quieres guardar los cambios?</p>\n  <form method="dialog">\n    <button value="cancelar">Cancelar</button>\n    <button value="guardar">Guardar</button>\n  </form>\n</dialog>',
          explanation: "open permite revisar el diálogo sin JavaScript. method=dialog hace que los botones cierren el control y sus value expresan la decisión seleccionada.",
          concepts: ["dialog representa contenido modal o no modal", "aria-labelledby conecta su título", "method=dialog devuelve una decisión"],
          goal: "Crea dialog open aria-labelledby=\"dialogo-titulo\" con h2 Guardar progreso, una pregunta y form method=\"dialog\". Incluye botones con value cancelar y guardar y textos Cancelar y Guardar.",
          starter: '<div class="modal">\n  <b>Guardar progreso</b>\n  <button>OK</button>\n</div>',
          hints: ["Reemplaza div por dialog y agrega open.", "Usa h2 con id y aria-labelledby en dialog.", "Agrupa dos botones con valores distintos dentro de form method dialog."],
          checks: [
            check("dialog está abierto y nombrado", has(/<dialog\b(?=[^>]*\bopen\b)(?=[^>]*aria-labelledby\s*=\s*["']dialogo-titulo["'])[^>]*>/i)),
            check("El título visible dice Guardar progreso", has(/<h2\b[^>]*id\s*=\s*["']dialogo-titulo["'][^>]*>\s*Guardar progreso\s*<\/h2>/i)),
            check("El formulario ofrece cancelar y guardar", both(has(/<form\b[^>]*method\s*=\s*["']dialog["']/i), has(/<button\b[^>]*value\s*=\s*["']cancelar["'][^>]*>\s*Cancelar\s*<\/button>/i), has(/<button\b[^>]*value\s*=\s*["']guardar["'][^>]*>\s*Guardar\s*<\/button>/i)))
          ],
          steps: ["dialog abre una superficie separada del contenido principal.", "aria-labelledby reutiliza el h2 como nombre del control.", "El formulario dialog cierra y conserva el valor de la acción elegida."],
          prediction: "¿Necesitas JavaScript para ver este ejemplo abierto?",
          answer: "No. El atributo open lo muestra; una aplicación real usaría showModal() para gestionar la apertura modal.",
          reflection: "Recorre los botones con Tab y verifica que sus nombres describen decisiones distintas.",
          extension: "Estila ::backdrop y documenta que la gestión completa del foco necesita comportamiento adicional."
        })
      ]
    },
    {
      title: "Composición avanzada",
      description: "Áreas, posición, proporciones y desplazamiento",
      modules: [
        module({
          id: 37, topic: "Grid", title: "Nombra las áreas de una página", shortTitle: "Grid areas",
          prerequisites: "Reutiliza Grid, columnas, filas y etiquetas semánticas.",
          intro: "Las áreas nombradas conectan la intención del diseño con sus regiones y facilitan reorganizar una página sin alterar su HTML.",
          example: '<style>\n.layout { display: grid; grid-template-areas: "cabecera cabecera" "menu contenido"; grid-template-columns: 220px 1fr; }\nheader { grid-area: cabecera; } nav { grid-area: menu; } main { grid-area: contenido; }\n</style>',
          explanation: "grid-template-areas dibuja un mapa textual. Cada región recibe su nombre mediante grid-area y las columnas definen cuánto espacio ocupa.",
          concepts: ["Las cadenas dibujan áreas", "grid-area asigna una región", "Las columnas controlan proporciones"],
          goal: "Crea .layout con áreas \"cabecera cabecera\" y \"lateral contenido\", columnas 240px 1fr y gap 20px. Asigna header a cabecera, aside a lateral y main a contenido.",
          starter: '<style>\n.layout { display: grid; }\n</style>\n<div class="layout"><header>Panel</header><aside>Filtros</aside><main>Cursos</main></div>',
          hints: ["Agrega grid-template-areas con dos filas entre comillas.", "Define grid-template-columns: 240px 1fr y gap.", "Asigna grid-area por separado a header, aside y main."],
          checks: [
            check(".layout define el mapa y columnas", has(/\.layout\s*\{(?=[^}]*grid-template-areas\s*:\s*["']cabecera cabecera["']\s*["']lateral contenido["'])(?=[^}]*grid-template-columns\s*:\s*240px\s+1fr)(?=[^}]*gap\s*:\s*20px)[^}]*\}/is)),
            check("header y aside reciben sus áreas", both(has(/header\s*\{[^}]*grid-area\s*:\s*cabecera/is), has(/aside\s*\{[^}]*grid-area\s*:\s*lateral/is))),
            check("main recibe contenido", has(/main\s*\{[^}]*grid-area\s*:\s*contenido/is))
          ],
          steps: ["La primera cadena reserva toda la fila para cabecera.", "La segunda coloca menú y contenido en columnas vecinas.", "grid-area conecta cada etiqueta con el nombre escrito en el mapa."],
          prediction: "¿Qué debes cambiar para poner lateral debajo de contenido sin mover el HTML?",
          answer: "El mapa de grid-template-areas; las asignaciones grid-area pueden permanecer iguales.",
          reflection: "Invierte temporalmente lateral y contenido en la segunda fila.",
          extension: "Agrega una media query móvil que convierta todas las áreas en una sola columna."
        }),
        module({
          id: 38, topic: "Posición", title: "Mantén visible una ayuda contextual", shortTitle: "position sticky",
          prerequisites: "Reutiliza aside, propiedades lógicas y layout con Grid.",
          intro: "Una ayuda sticky permanece visible durante parte del desplazamiento sin salir del flujo de su contenedor.",
          example: '<style>\n.ayuda { position: sticky; top: 16px; align-self: start; }\n</style>\n<aside class="ayuda"><h2>Conceptos</h2><p>Revisa esta lista mientras practicas.</p></aside>',
          explanation: "position: sticky combina el flujo normal con un límite de desplazamiento. top indica la distancia al borde y align-self evita que Grid estire el aside.",
          concepts: ["sticky conserva el flujo", "top define el límite", "align-self controla el estiramiento"],
          goal: "Crea aside.ayuda con h2 Pistas y un párrafo. Aplica position: sticky, top: 24px, align-self: start y max-height: calc(100vh - 48px).",
          starter: '<aside><b>Pistas</b><p>Revisa la estructura primero.</p></aside>',
          hints: ["Agrega la clase ayuda y usa h2 para el título.", "position, top y align-self pertenecen a .ayuda.", "Limita la altura con calc(100vh - 48px)."],
          checks: [
            check("aside ayuda contiene título y texto", has(/<aside\b[^>]*class\s*=\s*["'][^"']*\bayuda\b[\s\S]*<h2\b[^>]*>\s*Pistas\s*<\/h2>[\s\S]*<p\b[\s\S]*<\/aside>/i)),
            check(".ayuda usa sticky y top 24px", has(/\.ayuda\s*\{(?=[^}]*position\s*:\s*sticky)(?=[^}]*top\s*:\s*24px)[^}]*\}/is)),
            check("La ayuda controla alineación y altura", has(/\.ayuda\s*\{(?=[^}]*align-self\s*:\s*start)(?=[^}]*max-height\s*:\s*calc\(\s*100vh\s*-\s*48px\s*\))[^}]*\}/is))
          ],
          steps: ["aside conserva una posición normal al comenzar.", "Al llegar a 16px del borde, sticky mantiene esa distancia.", "align-self start evita que la caja se estire a toda la fila de Grid."],
          prediction: "¿sticky saca el aside del flujo como position fixed?",
          answer: "No. Sigue ocupando su lugar y se limita al contenedor que lo contiene.",
          reflection: "Agrega contenido largo junto al aside y observa dónde comienza y termina su efecto.",
          extension: "Incluye overflow: auto para una lista de pistas que supere la altura disponible."
        }),
        module({
          id: 39, topic: "Medios", title: "Conserva proporciones de una portada", shortTitle: "aspect-ratio",
          prerequisites: "Reutiliza img, dimensiones, clases y object-fit.",
          intro: "Reservar una proporción evita saltos de diseño y object-fit decide cómo ocupa la imagen esa caja.",
          example: '<style>\n.portada { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 12px; }\n</style>\n<img class="portada" src="curso.jpg" alt="Pantalla con código HTML">',
          explanation: "aspect-ratio reserva la forma antes de conocer el tamaño final. object-fit: cover llena la caja y recorta los bordes cuando es necesario.",
          concepts: ["aspect-ratio reserva forma", "object-fit controla el ajuste", "width 100% conserva fluidez"],
          goal: "Crea img.portada con alt=\"Persona diseñando una interfaz\" y aplica width: 100%, aspect-ratio: 16 / 9, object-fit: cover y border-radius: 16px.",
          starter: '<img src="portada.jpg" alt="Diseño">',
          hints: ["Agrega class portada y mejora la descripción alt.", "Define el ancho y la proporción en .portada.", "Completa object-fit cover y border-radius 16px."],
          checks: [
            check("La imagen tiene clase y alt descriptivo", has(/<img\b(?=[^>]*class\s*=\s*["'][^"']*\bportada\b)(?=[^>]*alt\s*=\s*["']Persona diseñando una interfaz["'])[^>]*>/i)),
            check(".portada es fluida y 16:9", has(/\.portada\s*\{(?=[^}]*width\s*:\s*100%)(?=[^}]*aspect-ratio\s*:\s*16\s*\/\s*9)[^}]*\}/is)),
            check("La imagen cubre la caja y redondea", has(/\.portada\s*\{(?=[^}]*object-fit\s*:\s*cover)(?=[^}]*border-radius\s*:\s*16px)[^}]*\}/is))
          ],
          steps: ["width permite que la imagen siga el contenedor.", "aspect-ratio reserva una caja 16:9.", "object-fit recorta la imagen para llenar esa caja sin deformarla."],
          prediction: "¿cover deforma la imagen para ajustarla?",
          answer: "No. Conserva la proporción original y recorta el excedente.",
          reflection: "Cambia cover por contain y compara el espacio libre y el recorte.",
          extension: "Combina esta regla con picture para elegir una fuente adecuada por ancho."
        }),
        module({
          id: 40, topic: "Desplazamiento", title: "Crea una fila desplazable con puntos de ajuste", shortTitle: "Scroll snap",
          prerequisites: "Reutiliza Flexbox, overflow, gap y tarjetas.",
          intro: "En pantallas estrechas, una fila desplazable puede conservar tarjetas legibles y detenerse de forma predecible en cada una.",
          example: '<style>\n.carrusel { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; }\n.carrusel article { flex: 0 0 80%; scroll-snap-align: start; }\n</style>',
          explanation: "overflow-x habilita el desplazamiento horizontal. scroll-snap-type define el eje y cada hijo declara con scroll-snap-align dónde debe detenerse.",
          concepts: ["overflow-x permite desplazar", "scroll-snap-type define el comportamiento", "scroll-snap-align fija cada parada"],
          goal: "Crea .carrusel con flex, gap 16px, overflow-x auto y scroll-snap-type: x mandatory. Incluye tres article y aplica flex: 0 0 80% y scroll-snap-align: start a sus hijos.",
          starter: '<div class="carrusel"><article>HTML</article><article>CSS</article></div>',
          hints: ["Completa tres article dentro del carrusel.", "Las propiedades de desplazamiento pertenecen al contenedor.", "El tamaño y scroll-snap-align pertenecen a .carrusel article."],
          checks: [
            check("El carrusel contiene tres tarjetas", both(has(/class\s*=\s*["'][^"']*\bcarrusel\b/i), count(/<article\b/gi, 3))),
            check("El contenedor permite desplazamiento con snap", has(/\.carrusel\s*\{(?=[^}]*display\s*:\s*flex)(?=[^}]*gap\s*:\s*16px)(?=[^}]*overflow-x\s*:\s*auto)(?=[^}]*scroll-snap-type\s*:\s*x\s+mandatory)[^}]*\}/is)),
            check("Cada artículo define tamaño y parada", has(/\.carrusel\s+article\s*\{(?=[^}]*flex\s*:\s*0\s+0\s+80%)(?=[^}]*scroll-snap-align\s*:\s*start)[^}]*\}/is))
          ],
          steps: ["Flexbox coloca las tarjetas en una fila.", "overflow-x conserva la fila y permite desplazarla.", "scroll-snap-align hace que el borde inicial de cada tarjeta sea una parada."],
          prediction: "¿Por qué las tarjetas usan flex: 0 0 80%?",
          answer: "Para que no se encojan, ocupen un ancho legible y dejen asomar parte de la siguiente como pista visual.",
          reflection: "Cambia 80% a 60% y observa cuántas tarjetas aparecen simultáneamente.",
          extension: "Añade scroll-padding-inline para separar la primera parada del borde."
        })
      ]
    },
    {
      title: "Accesibilidad visual y de navegación",
      description: "Jerarquía, salto, foco, contraste y movimiento",
      modules: [
        module({
          id: 41, topic: "Estructura", title: "Construye un esquema de encabezados", shortTitle: "Landmarks y títulos",
          prerequisites: "Reutiliza header, nav, main, aside, footer y títulos h1–h3.",
          intro: "Las regiones y los encabezados forman un mapa que permite comprender y recorrer una página antes de leer cada párrafo.",
          example: '<header><h1>Panel de aprendizaje</h1></header>\n<nav aria-label="Principal">...</nav>\n<main><section><h2>Rutas activas</h2><article><h3>HTML</h3></article></section></main>\n<footer>Ayuda</footer>',
          explanation: "Un h1 nombra la página, h2 divide temas y h3 nombra elementos dentro de esos temas. main aparece una vez y reúne el contenido central.",
          concepts: ["Un h1 nombra la página", "Los niveles no deben saltarse por apariencia", "Las regiones delimitan responsabilidades"],
          goal: "Crea header con h1 Mi aprendizaje, nav aria-label=\"Principal\", main con section h2 Rutas activas y dos article con h3 HTML y CSS, y footer.",
          starter: '<div class="titulo">Mi aprendizaje</div>\n<div>Inicio | Rutas</div>\n<div><b>Rutas activas</b><p>HTML</p></div>',
          hints: ["Reemplaza contenedores genéricos por header, nav, main, section, article y footer.", "Usa h1 para la página, h2 para la sección y h3 para cada artículo.", "Crea dos article y da un nombre accesible a nav."],
          checks: [
            check("La página tiene regiones principales", both(has(/<header\b/i), has(/<nav\b[^>]*aria-label\s*=\s*["']Principal["']/i), has(/<main\b/i), has(/<footer\b/i))),
            check("La jerarquía incluye h1 y h2", both(has(/<h1\b[^>]*>\s*Mi aprendizaje\s*<\/h1>/i), has(/<h2\b[^>]*>\s*Rutas activas\s*<\/h2>/i))),
            check("Dos artículos tienen h3", both(count(/<article\b/gi, 2), count(/<h3\b/gi, 2), has(/HTML/i), has(/CSS/i)))
          ],
          steps: ["header presenta el h1 que nombra toda la página.", "nav y main separan navegación de contenido.", "h2 abre un tema y los h3 nombran elementos dentro de él."],
          prediction: "¿Debes usar h4 para hacer un texto visualmente pequeño?",
          answer: "No. El nivel expresa jerarquía; el tamaño se decide con CSS.",
          reflection: "Lee solo los encabezados y comprueba si forman un resumen coherente.",
          extension: "Añade un aside con h2 Recomendaciones sin alterar el orden lógico."
        }),
        module({
          id: 42, topic: "Teclado", title: "Ofrece un salto al contenido", shortTitle: "Skip link",
          prerequisites: "Reutiliza enlaces internos, id, focus y pseudoclases.",
          intro: "Un enlace de salto permite omitir una navegación repetida y llegar directamente al contenido principal con teclado.",
          example: '<a class="saltar" href="#contenido">Saltar al contenido</a>\n<header>...</header>\n<main id="contenido" tabindex="-1">...</main>\n<style>\n.saltar { position: absolute; transform: translateY(-150%); }\n.saltar:focus { transform: translateY(0); }\n</style>',
          explanation: "El href apunta al id de main. El enlace puede quedar fuera de vista hasta recibir foco, pero no debe usar display:none porque dejaría de ser operable.",
          concepts: ["El destino usa un id único", "El enlace permanece enfocable", ":focus lo vuelve visible"],
          goal: "Crea como primer enlace a.saltar href=\"#contenido\" con texto Saltar al contenido. Crea main id=\"contenido\" tabindex=\"-1\". Oculta visualmente con transform: translateY(-150%) y muestra en .saltar:focus con translateY(0).",
          starter: '<header><nav>Muchos enlaces</nav></header>\n<main><h1>Contenido</h1></main>',
          hints: ["El enlace de salto debe aparecer antes del header.", "Conecta href #contenido con el id del main.", "Usa transform en estado normal y :focus; no uses display none."],
          checks: [
            check("El enlace apunta al contenido", has(/<a\b[^>]*class\s*=\s*["'][^"']*\bsaltar\b[^"']*["'][^>]*href\s*=\s*["']#contenido["'][^>]*>\s*Saltar al contenido\s*<\/a>/i)),
            check("main puede recibir el foco programático", has(/<main\b(?=[^>]*id\s*=\s*["']contenido["'])(?=[^>]*tabindex\s*=\s*["']-1["'])[^>]*>/i)),
            check("El enlace aparece al recibir foco", both(has(/\.saltar\s*\{[^}]*transform\s*:\s*translateY\(\s*-150%\s*\)/is), has(/\.saltar\s*:\s*focus\s*\{[^}]*transform\s*:\s*translateY\(\s*0\s*\)/is), code => !/\.saltar\s*\{[^}]*display\s*:\s*none/is.test(code)))
          ],
          steps: ["El primer enlace ofrece una ruta corta al main.", "El destino tiene id contenido y puede recibir foco.", "La regla focus mueve el enlace dentro de la pantalla cuando se usa Tab."],
          prediction: "¿Funcionaría igual con display:none en el estado normal?",
          answer: "No. Un elemento con display:none sale del orden de foco y el teclado no podría descubrirlo.",
          reflection: "Pulsa Tab desde el inicio y comprueba que el enlace aparece antes de la navegación.",
          extension: "Añade una transición breve y respeta reducción de movimiento en el módulo 44."
        }),
        module({
          id: 43, topic: "Foco", title: "Diseña controles visibles en varios fondos", shortTitle: "currentColor y foco",
          prerequisites: "Reutiliza botones, :focus-visible, outline y variables CSS.",
          intro: "Un control debe conservar contraste y foco aunque cambie su fondo. currentColor permite que bordes e iconos sigan el color de texto definido por cada variante.",
          example: '<style>\n.accion { color: #17352a; border: 2px solid currentColor; background: transparent; }\n.accion:focus-visible { outline: 3px solid #ffbf47; outline-offset: 3px; }\n</style>',
          explanation: "currentColor toma el valor de color y mantiene coherencia. Un outline separado del borde hace visible el foco sin depender del cambio de fondo.",
          concepts: ["currentColor reutiliza el color de texto", "outline no cambia la caja", "focus-visible distingue navegación por teclado"],
          goal: "Crea button.accion con color #17352a, background #ffffff y border: 2px solid currentColor. En .accion:focus-visible usa outline: 3px solid #ffbf47 y outline-offset: 4px.",
          starter: '<style>.accion { border: 0; }</style>\n<button class="accion">Continuar</button>',
          hints: ["Define color y fondo con suficiente diferencia.", "Usa currentColor dentro de border.", "Agrega la regla focus-visible con outline y offset exactos."],
          checks: [
            check("El control es un botón accion", has(/<button\b[^>]*class\s*=\s*["'][^"']*\baccion\b/i)),
            check(".accion define color, fondo y borde currentColor", has(/\.accion\s*\{(?=[^}]*color\s*:\s*#17352a)(?=[^}]*background\s*:\s*#ffffff)(?=[^}]*border\s*:\s*2px\s+solid\s+currentColor)[^}]*\}/is)),
            check("focus-visible dibuja un contorno separado", has(/\.accion\s*:\s*focus-visible\s*\{(?=[^}]*outline\s*:\s*3px\s+solid\s+#ffbf47)(?=[^}]*outline-offset\s*:\s*4px)[^}]*\}/is))
          ],
          steps: ["color define el tono del texto.", "currentColor copia ese tono en el borde.", "focus-visible agrega un segundo contorno amarillo separado cuatro píxeles."],
          prediction: "¿Qué cambia en el borde si modificas color a azul?",
          answer: "El borde también se vuelve azul porque usa currentColor.",
          reflection: "Navega con Tab y verifica que el foco se distingue del borde normal.",
          extension: "Crea una variante oscura cambiando color y background sin tocar border."
        }),
        module({
          id: 44, topic: "Movimiento", title: "Respeta la reducción de movimiento", shortTitle: "prefers-reduced-motion",
          prerequisites: "Reutiliza transition, animation y media queries.",
          intro: "Algunas personas reducen el movimiento del sistema. Una interfaz debe conservar sus estados sin obligarlas a ver animaciones amplias.",
          example: '<style>\n.tarjeta { transition: transform .3s ease; }\n.tarjeta:hover { transform: translateY(-4px); }\n@media (prefers-reduced-motion: reduce) {\n  .tarjeta { transition: none; }\n  .tarjeta:hover { transform: none; }\n}\n</style>',
          explanation: "La consulta detecta una preferencia del sistema. Dentro se retira el movimiento, pero el contenido y la interacción continúan disponibles.",
          concepts: ["La preferencia llega desde el sistema", "La alternativa elimina movimiento", "El estado sigue siendo comprensible"],
          goal: "Crea .tarjeta con transition: transform .3s ease y hover translateY(-6px). En @media (prefers-reduced-motion: reduce), aplica transition: none y transform: none en hover.",
          starter: '<style>\n.tarjeta { transition: transform .3s ease; }\n.tarjeta:hover { transform: translateY(-6px); }\n</style>\n<article class="tarjeta">Curso recomendado</article>',
          hints: ["Conserva el estado normal y hover existentes.", "Añade una media query prefers-reduced-motion: reduce.", "Dentro retira transition y el transform del hover."],
          checks: [
            check("La tarjeta tiene transición y movimiento", both(has(/\.tarjeta\s*\{[^}]*transition\s*:\s*transform\s+\.3s\s+ease/is), has(/\.tarjeta\s*:\s*hover\s*\{[^}]*transform\s*:\s*translateY\(\s*-6px\s*\)/is))),
            check("Existe la consulta de reducción", has(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/i)),
            check("La alternativa retira transición y desplazamiento", has(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{[\s\S]*\.tarjeta\s*\{[^}]*transition\s*:\s*none[\s\S]*\.tarjeta\s*:\s*hover\s*\{[^}]*transform\s*:\s*none/i))
          ],
          steps: ["La tarjeta normal se desplaza suavemente en hover.", "La consulta detecta reduce.", "Las reglas interiores conservan la tarjeta pero eliminan transición y movimiento."],
          prediction: "¿La consulta impide usar la tarjeta?",
          answer: "No. Solo adapta la presentación; el contenido y la acción permanecen.",
          reflection: "Activa la preferencia de reducción del sistema o simúlala en herramientas y compara ambos estados.",
          extension: "Aplica la misma preferencia a scroll-behavior y otras animaciones del documento."
        })
      ]
    },
    {
      title: "Calidad y rendimiento",
      description: "Base predecible, propiedades lógicas, impresión e imágenes",
      modules: [
        module({
          id: 45, topic: "Base CSS", title: "Crea una base de cajas predecible", shortTitle: "Reset mínimo",
          prerequisites: "Comprende el modelo de caja, herencia y selectores universales.",
          intro: "Una base pequeña reduce diferencias inesperadas: border-box incluye padding y borde dentro del tamaño declarado, y los medios no desbordan su contenedor.",
          example: '<style>\n*, *::before, *::after { box-sizing: border-box; }\nbody { margin: 0; }\nimg, picture, video { display: block; max-width: 100%; }\n</style>',
          explanation: "El selector universal y sus pseudoelementos unifican el cálculo de cajas. El reset de medios conserva proporciones y evita desbordamientos comunes.",
          concepts: ["border-box estabiliza tamaños", "body margin 0 retira el margen inicial", "Los medios respetan el contenedor"],
          goal: "Escribe un reset con *, *::before, *::after en box-sizing: border-box; body margin: 0; e img, picture, video con display: block y max-width: 100%.",
          starter: '<style>\nbody { font-family: system-ui; }\n</style>',
          hints: ["Agrupa selector universal y ambos pseudoelementos.", "Retira solo el margin inicial de body.", "Agrupa los tres tipos de medio con display block y max-width 100%."],
          checks: [
            check("Todas las cajas usan border-box", has(/\*\s*,\s*\*::before\s*,\s*\*::after\s*\{[^}]*box-sizing\s*:\s*border-box/is)),
            check("body retira su margen", has(/body\s*\{[^}]*margin\s*:\s*0/is)),
            check("Los medios son bloques fluidos", has(/img\s*,\s*picture\s*,\s*video\s*\{(?=[^}]*display\s*:\s*block)(?=[^}]*max-width\s*:\s*100%)[^}]*\}/is))
          ],
          steps: ["El selector universal alcanza todos los elementos.", "::before y ::after reciben el mismo cálculo.", "La regla de medios impide que una imagen intrínsecamente grande ensanche la página."],
          prediction: "¿border-box elimina padding?",
          answer: "No. Lo incluye dentro del ancho y alto declarados en vez de sumarlo por fuera.",
          reflection: "Crea una caja de 200px con padding y compara content-box con border-box.",
          extension: "Añade font: inherit a button, input y textarea para una tipografía coherente."
        }),
        module({
          id: 46, topic: "Internacionalización", title: "Usa propiedades lógicas", shortTitle: "Espaciado lógico",
          prerequisites: "Reutiliza margin, padding, border y comprende eje de bloque y eje en línea.",
          intro: "Las propiedades lógicas describen inicio y final según el modo de escritura y funcionan mejor al traducir una interfaz.",
          example: '<style>\n.nota { padding-inline: 20px; padding-block: 12px; border-inline-start: 4px solid #185c45; margin-block: 16px; }\n</style>',
          explanation: "inline corresponde al eje de lectura y block al eje de párrafos. start cambia de lado automáticamente en escrituras de derecha a izquierda.",
          concepts: ["inline sigue la dirección del texto", "block sigue el flujo de párrafos", "start y end se adaptan"],
          goal: "Crea .nota con padding-inline: 20px, padding-block: 12px, margin-block: 16px y border-inline-start: 4px solid #185c45. Úsala en aside con h2 Nota.",
          starter: '<style>.nota { padding-left: 20px; border-left: 4px solid green; }</style>\n<div class="nota"><b>Nota</b></div>',
          hints: ["Cambia div por aside y b por h2.", "Sustituye left por inline-start y usa padding-inline.", "Agrega padding-block y margin-block con los valores indicados."],
          checks: [
            check("aside nota tiene un h2", has(/<aside\b[^>]*class\s*=\s*["'][^"']*\bnota\b[\s\S]*<h2\b[^>]*>\s*Nota\s*<\/h2>[\s\S]*<\/aside>/i)),
            check(".nota usa padding lógico", has(/\.nota\s*\{(?=[^}]*padding-inline\s*:\s*20px)(?=[^}]*padding-block\s*:\s*12px)[^}]*\}/is)),
            check(".nota usa margen y borde lógicos", has(/\.nota\s*\{(?=[^}]*margin-block\s*:\s*16px)(?=[^}]*border-inline-start\s*:\s*4px\s+solid\s+#185c45)[^}]*\}/is))
          ],
          steps: ["padding-inline añade aire a ambos lados del eje de lectura.", "padding-block actúa antes y después en el eje vertical habitual.", "border-inline-start elige automáticamente el comienzo correcto."],
          prediction: "¿En español habitual inline-start corresponde a izquierda o derecha?",
          answer: "A la izquierda; en una escritura de derecha a izquierda correspondería al lado contrario.",
          reflection: "Cambia temporalmente dir=rtl en el contenedor y observa el borde.",
          extension: "Reemplaza margin-top y margin-bottom de otro componente por margin-block."
        }),
        module({
          id: 47, topic: "Impresión", title: "Prepara una versión para imprimir", shortTitle: "@media print",
          prerequisites: "Reutiliza media queries, clases y propiedades de visualización.",
          intro: "Una hoja impresa necesita retirar controles inútiles, evitar fondos costosos y mostrar destinos que en pantalla viven detrás de enlaces.",
          example: '<style>\n@media print {\n  nav, .acciones { display: none; }\n  body { color: #000; background: #fff; }\n  a[href]::after { content: " (" attr(href) ")"; }\n}\n</style>',
          explanation: "@media print contiene ajustes que solo se aplican al imprimir. attr(href) hace visible el destino de un enlace cuando ya no se puede activar.",
          concepts: ["print separa otro medio", "display none retira controles irrelevantes", "attr() recupera un atributo"],
          goal: "Dentro de @media print oculta nav y .acciones, define body color #000 y background #fff, y agrega la URL con a[href]::after usando content: \" (\" attr(href) \")\".",
          starter: '<style>body { background: #eef7e8; }</style>\n<nav>Menú</nav>\n<main><a href="https://example.com/guia">Guía</a><div class="acciones"><button>Guardar</button></div></main>',
          hints: ["Añade una media query cuyo medio sea print.", "Agrupa nav y .acciones para ocultarlos solo allí.", "Usa a[href]::after y attr(href) dentro de content."],
          checks: [
            check("Existe una consulta de impresión", has(/@media\s+print\s*\{/i)),
            check("Navegación y acciones se ocultan", has(/@media\s+print\s*\{[\s\S]*nav\s*,\s*\.acciones\s*\{[^}]*display\s*:\s*none/i)),
            check("La impresión usa blanco y negro y muestra href", both(has(/@media\s+print\s*\{[\s\S]*body\s*\{(?=[^}]*color\s*:\s*#000)(?=[^}]*background\s*:\s*#fff)[^}]*\}/i), has(/a\[href\]\s*::after\s*\{[^}]*content\s*:[^}]*attr\(\s*href\s*\)/is)))
          ],
          steps: ["La consulta se activa en la vista de impresión.", "El menú y los botones desaparecen porque no funcionan en papel.", "Cada enlace añade su href para conservar el destino."],
          prediction: "¿Las reglas de print cambian la página normal?",
          answer: "No. Solo se aplican al imprimir o al abrir la previsualización de impresión.",
          reflection: "Abre la vista de impresión y comprueba qué información permanece.",
          extension: "Evita que una tarjeta se corte entre páginas con break-inside: avoid."
        }),
        module({
          id: 48, topic: "Rendimiento", title: "Reserva espacio para imágenes", shortTitle: "Carga y dimensiones",
          prerequisites: "Reutiliza img, alt, width, height y recursos adaptables.",
          intro: "Declarar dimensiones permite reservar espacio antes de descargar una imagen. loading=lazy aplaza medios que todavía están lejos de la vista.",
          example: '<img src="curso.webp" alt="Vista del curso" width="640" height="360" loading="lazy" decoding="async">',
          explanation: "width y height entregan una proporción inicial y reducen saltos de contenido. lazy es apropiado para imágenes secundarias, no para la principal que aparece al cargar.",
          concepts: ["Dimensiones reservan espacio", "lazy aplaza recursos secundarios", "decoding async evita bloquear el pintado"],
          goal: "Crea tres img con alt descriptivo. Cada una usa width=\"480\", height=\"270\", loading=\"lazy\" y decoding=\"async\". Agrúpalas dentro de section.galeria con h2 Proyectos.",
          starter: '<section><h2>Proyectos</h2><img src="uno.webp"><img src="dos.webp"></section>',
          hints: ["Agrega la clase galeria y una tercera imagen.", "Escribe un alt distinto y útil para cada proyecto.", "Repite dimensiones, loading y decoding en las tres imágenes."],
          checks: [
            check("La galería tiene título y tres imágenes", both(has(/<section\b[^>]*class\s*=\s*["'][^"']*\bgaleria\b[\s\S]*<h2\b[^>]*>\s*Proyectos\s*<\/h2>/i), count(/<img\b/gi, 3))),
            check("Todas reservan 480 por 270", count(/<img\b(?=[^>]*width\s*=\s*["']480["'])(?=[^>]*height\s*=\s*["']270["'])[^>]*>/gi, 3)),
            check("Todas difieren carga y tienen alt", count(/<img\b(?=[^>]*alt\s*=\s*["'][^"']{5,}["'])(?=[^>]*loading\s*=\s*["']lazy["'])(?=[^>]*decoding\s*=\s*["']async["'])[^>]*>/gi, 3))
          ],
          steps: ["width y height reservan una caja 16:9.", "loading lazy posterga la descarga cuando la imagen está lejos.", "decoding async permite continuar el pintado mientras se decodifica."],
          prediction: "¿Conviene usar lazy en el logotipo principal visible al abrir?",
          answer: "Generalmente no. Los recursos críticos visibles al inicio deben estar disponibles pronto; lazy sirve mejor para contenido inferior.",
          reflection: "Retira temporalmente dimensiones y explica qué podría ocurrir durante una carga lenta.",
          extension: "Combina estas imágenes con srcset para entregar tamaños apropiados."
        })
      ]
    },
    {
      title: "Proyecto final de interfaz",
      description: "Página de presentación y panel accesible",
      modules: [
        module({
          id: 49, topic: "Proyecto", title: "Construye una página de presentación", shortTitle: "Landing integrada", duration: "35 min", difficulty: "Proyecto",
          prerequisites: "Integra semántica, contenedor fluido, Grid auto-fit, componentes, foco y responsive.",
          intro: "Una página de presentación reúne una jerarquía clara, una acción principal y beneficios que se adaptan sin perder significado.",
          example: '<header class="portada">\n  <nav aria-label="Principal"><a href="#beneficios">Beneficios</a></nav>\n  <div class="contenedor"><h1>Aprende creando</h1><p>Proyectos breves y guiados.</p><a class="accion" href="#beneficios">Ver beneficios</a></div>\n</header>\n<main id="beneficios" class="beneficios"><article><h2>Práctica</h2><p>Escribe código.</p></article></main>',
          explanation: "Las regiones organizan el recorrido, el contenedor limita las líneas y la grilla permite repetir beneficios. La acción sigue siendo un enlace porque navega a otra sección.",
          concepts: ["La jerarquía guía la lectura", "Los componentes repiten estructura", "El layout se adapta sin cambiar el HTML"],
          goal: "Crea header con nav Principal, h1 Aprende desarrollo web y enlace Comenzar a #beneficios. Crea main id=beneficios con section.beneficios y tres article con h2. Usa .contenedor fluido, .beneficios con auto-fit minmax(220px,1fr), y .accion:focus-visible con outline.",
          starter: '<h1>Mi sitio</h1>\n<p>Aprende desarrollo web.</p>\n<button>Comenzar</button>',
          hints: ["Construye primero header, nav, main y la sección con tres article.", "El destino Comenzar es un enlace a #beneficios y el main o section necesita ese id.", "Añade contenedor fluido, grilla auto-fit y foco visible a la acción."],
          checks: [
            check("La portada tiene navegación, título y acción", both(has(/<header\b[\s\S]*<nav\b[^>]*aria-label\s*=\s*["']Principal["'][\s\S]*<h1\b[^>]*>\s*Aprende desarrollo web\s*<\/h1>/i), has(/<a\b[^>]*class\s*=\s*["'][^"']*\baccion\b[^"']*["'][^>]*href\s*=\s*["']#beneficios["'][^>]*>\s*Comenzar\s*<\/a>/i))),
            check("Beneficios contiene tres artículos con títulos", both(has(/<(?:main|section)\b[^>]*id\s*=\s*["']beneficios["']/i), count(/<article\b/gi, 3), count(/<h2\b/gi, 3))),
            check("El diseño combina contenedor, auto-fit y foco", both(has(/\.contenedor\s*\{[^}]*width\s*:\s*min\(/is), has(/\.beneficios\s*\{[^}]*repeat\(\s*auto-fit\s*,\s*minmax\(\s*220px\s*,\s*1fr\s*\)/is), has(/\.accion\s*:\s*focus-visible\s*\{[^}]*outline\s*:/is)))
          ],
          steps: ["header reúne marca, navegación y propuesta principal.", "La acción enlaza la sección beneficios dentro del mismo documento.", "Grid repite tres artículos y ajusta automáticamente sus columnas."],
          prediction: "¿Por qué Comenzar debe ser a y no button en este ejemplo?",
          answer: "Porque cambia la ubicación hacia una sección identificada; un enlace representa navegación.",
          reflection: "Recorre toda la página con teclado y comprueba el orden de foco y la jerarquía de títulos.",
          extension: "Agrega un bloque de testimonios con citas semánticas del módulo 19."
        }),
        module({
          id: 50, topic: "Proyecto final", title: "Entrega un panel accesible y adaptable", shortTitle: "Proyecto 50", duration: "42 min", difficulty: "Proyecto final",
          prerequisites: "Integra landmarks, skip link, navegación, Grid areas, tarjetas, estados, propiedades lógicas y reducción de movimiento.",
          intro: "El proyecto final convierte decisiones aisladas en un sistema coherente: estructura navegable, composición adaptable, componentes reutilizables y preferencias respetadas.",
          example: '<a class="saltar" href="#contenido">Saltar al contenido</a>\n<div class="panel">\n  <header><h1>Mi aprendizaje</h1></header>\n  <nav aria-label="Principal">...</nav>\n  <main id="contenido"><section><h2>En curso</h2><article class="tarjeta">HTML y CSS</article></section></main>\n</div>',
          explanation: "El panel usa regiones y títulos para formar un mapa, Grid para componerlas y componentes para repetir información. Las preferencias de foco y movimiento siguen siendo parte de la definición de calidad.",
          concepts: ["La estructura debe funcionar antes del estilo", "El sistema reutiliza componentes", "La adaptación incluye tamaño, teclado y movimiento"],
          goal: "Crea enlace Saltar al contenido, div.panel con header h1 Panel de aprendizaje, nav Principal con tres enlaces, main id=contenido tabindex=-1 y section h2 Cursos en progreso con tres article.tarjeta. Usa Grid areas cabecera/menu/contenido, una columna móvil y 220px 1fr desde 800px. Añade foco visible y una consulta prefers-reduced-motion.",
          starter: '<div>\n  <b>Panel</b>\n  <p>HTML y CSS</p>\n</div>',
          hints: ["Resuelve primero skip link, header, nav, main, section y tres article con títulos coherentes.", "Define .panel como grid móvil de una columna y cambia sus áreas y columnas desde 800px.", "Incluye :focus-visible y @media (prefers-reduced-motion: reduce) con una alternativa sin transición."],
          checks: [
            check("La estructura ofrece salto y regiones completas", both(has(/<a\b[^>]*class\s*=\s*["'][^"']*\bsaltar\b[^"']*["'][^>]*href\s*=\s*["']#contenido["'][^>]*>\s*Saltar al contenido\s*<\/a>/i), has(/<header\b[\s\S]*<h1\b[^>]*>\s*Panel de aprendizaje\s*<\/h1>/i), has(/<nav\b[^>]*aria-label\s*=\s*["']Principal["']/i), has(/<main\b(?=[^>]*id\s*=\s*["']contenido["'])(?=[^>]*tabindex\s*=\s*["']-1["'])/i))),
            check("El contenido reúne tres tarjetas", both(has(/<h2\b[^>]*>\s*Cursos en progreso\s*<\/h2>/i), count(/<article\b[^>]*class\s*=\s*["'][^"']*\btarjeta\b/gi, 3), count(/<a\b/gi, 4))),
            check("El CSS integra áreas, adaptación, foco y movimiento", both(has(/\.panel\s*\{[^}]*display\s*:\s*grid/is), has(/grid-template-areas\s*:/i), has(/@media\s*\(\s*min-width\s*:\s*800px\s*\)/i), has(/grid-template-columns\s*:\s*220px\s+1fr/i), has(/:focus-visible\s*\{[^}]*outline\s*:/is), has(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/i)))
          ],
          steps: ["El enlace inicial permite saltar navegación y lleva el foco a main.", "Grid areas describe cabecera, menú y contenido primero en una columna.", "La consulta amplia crea dos columnas y las reglas de foco y movimiento conservan preferencias."],
          prediction: "¿Qué parte del panel debe seguir funcionando si todo el CSS falla?",
          answer: "La estructura completa: salto, navegación, títulos, enlaces y tarjetas conservan orden y significado en el HTML.",
          reflection: "Revisa el panel sin estilos, con teclado y a un ancho estrecho; anota qué evidencia demuestra cada requisito.",
          extension: "Añade el aviso de progreso del módulo 35 y una versión de impresión del módulo 47."
        })
      ]
    }
  ];

  levels.forEach((level, index) => {
    const moduleCount = level.modules.length;
    level.completionTitle = `Finalizaste ${level.title.toLowerCase()} de HTML y CSS.`;
    level.completionCopy = index < levels.length - 1
      ? `Completaste ${moduleCount === 1 ? "el módulo" : `los ${moduleCount} módulos`} de esta etapa. Rinde el mini examen; el siguiente nivel ya está disponible.`
      : "Completaste los dos proyectos integradores. Rinde el mini examen final y vuelve a cualquier módulo que todavía no puedas explicar con tus palabras.";
    level.approvedCopy = index < levels.length - 1
      ? `Aprobaste ${level.title.toLowerCase()}. Puedes continuar y volver cuando quieras para repasar.`
      : "Aprobaste el nivel final. Completaste cincuenta módulos de HTML y CSS desde tu primera etiqueta hasta una interfaz accesible y adaptable.";
  });

  const question = (text, options, answer, explanation) => ({ question: text, options, answer, explanation });
  const exam = (levelId, title, questions) => ({
    levelId, title: `Mini examen: ${title}`, passing: 4,
    intro: `Repasa ${title.toLowerCase()}. Necesitas cuatro respuestas correctas de cinco.`, questions
  });
  const exams = [
    exam(5, "contenido semántico avanzado", [
      question("¿Qué aporta datetime dentro de time?", ["Un color", "Un valor normalizado", "Un enlace visible", "Una zona horaria automática"], 1, "datetime conserva una fecha u hora interpretable por herramientas sin cambiar necesariamente el texto visible."),
      question("¿Qué marca aria-current=page?", ["Un enlace externo", "La ubicación actual", "Un error", "El primer elemento"], 1, "Comunica cuál elemento representa la página actual dentro de una navegación."),
      question("¿Dónde se ubica una cita extensa?", ["kbd", "blockquote", "output", "nav"], 1, "blockquote representa una cita en bloque y puede acompañarse de una atribución."),
      question("¿Qué elemento conserva espacios y saltos?", ["code", "pre", "cite", "time"], 1, "pre conserva el formato; code aporta el significado de código."),
      question("¿Qué representa kbd?", ["Una tecla o entrada", "Una URL", "Una fecha", "Una imagen"], 0, "kbd identifica una entrada que la persona debe realizar con teclado u otro dispositivo.")
    ]),
    exam(6, "formularios robustos", [
      question("¿Qué nombra un grupo fieldset?", ["placeholder", "legend", "output", "meter"], 1, "legend presenta la pregunta o nombre común de los controles agrupados."),
      question("¿Qué une varios radio en una elección?", ["El mismo id", "El mismo name", "El mismo value", "El mismo label"], 1, "Compartir name hace que el navegador permita una sola opción del grupo."),
      question("¿autocomplete reemplaza label?", ["Sí", "No", "Solo en email", "Solo en móvil"], 1, "autocomplete ayuda a rellenar; label sigue nombrando el control de forma visible y accesible."),
      question("¿Qué caso prueba minlength=4?", ["Vacío solamente", "Menos de cuatro caracteres", "Mayúsculas", "Un correo"], 1, "minlength establece una longitud mínima para el valor escrito."),
      question("¿Qué representa progress?", ["Una cita", "El avance de una tarea", "Una medida estable", "Una navegación"], 1, "progress comunica cuánto ha avanzado un proceso respecto de su máximo.")
    ]),
    exam(7, "sistemas visuales con CSS", [
      question("¿Dónde suelen definirse variables globales?", ["@print", ":root", "::after", "fieldset"], 1, ":root permite compartir custom properties en todo el documento."),
      question("¿Qué aporta una clase base?", ["Propiedades comunes", "Solo colores", "Un id", "Una URL"], 0, "Una clase base concentra la forma compartida y las variantes cambian solo diferencias."),
      question("¿Qué expresa el segundo valor de clamp?", ["El mínimo", "El valor preferido fluido", "El máximo", "Un error"], 1, "clamp recibe mínimo, preferido y máximo en ese orden."),
      question("¿Qué propiedad necesitan ::before y ::after para mostrarse?", ["content", "href", "datetime", "name"], 0, "content define qué caja o texto generado debe aparecer."),
      question("¿Debe un pseudoelemento guardar información esencial única?", ["Sí", "No", "Solo en enlaces", "Solo en botones"], 1, "El contenido esencial debe permanecer en HTML; los pseudoelementos sirven para decoración o redundancia.")
    ]),
    exam(8, "diseño adaptable moderno", [
      question("¿Qué enfoque usa una columna como regla base?", ["Desktop first", "Mobile first", "Print first", "Fixed first"], 1, "Mobile first comienza con poco espacio y añade capacidad mediante min-width."),
      question("¿Qué hace min(100% - 32px, 1100px)?", ["Elige siempre 1100px", "Elige el menor de dos tamaños", "Suma ambos", "Oculta el contenido"], 1, "min selecciona el tamaño menor y crea un contenedor fluido con límite."),
      question("¿Qué combina auto-fit con minmax?", ["Columnas fluidas automáticas", "Una animación", "Un formulario", "Una cita"], 0, "Grid calcula cuántas columnas mínimas caben y reparte el espacio sobrante."),
      question("¿Dónde vive alt al usar picture?", ["En source", "En img", "En picture", "En CSS"], 1, "img representa el contenido compartido y conserva la descripción alternativa."),
      question("¿Qué consulta agrega diseño desde un ancho?", ["max-height", "min-width", "prefers-color", "print-only"], 1, "min-width se cumple desde el valor indicado hacia pantallas mayores.")
    ]),
    exam(9, "componentes de interfaz", [
      question("¿Qué etiqueta encierra una tarjeta independiente?", ["article", "br", "kbd", "time"], 0, "article es apropiado cuando el contenido se entiende como una unidad independiente."),
      question("¿Qué evita desbordamiento en un menú flex?", ["flex-wrap", "font-weight", "z-index", "opacity"], 0, "flex-wrap permite que los elementos continúen en otra fila."),
      question("¿Para qué sirve role=status?", ["Una alerta urgente", "Una actualización informativa", "Un enlace", "Una fecha"], 1, "status comunica cambios no urgentes sin mover el foco."),
      question("¿Qué nombra un diálogo mediante un título existente?", ["aria-labelledby", "placeholder", "srcset", "datetime"], 0, "aria-labelledby referencia el id del título visible."),
      question("¿Qué expresa form method=dialog?", ["Una descarga", "Una decisión que cierra dialog", "Una navegación", "Una tabla"], 1, "Los botones pueden cerrar el diálogo y aportar su value como resultado.")
    ]),
    exam(10, "composición avanzada", [
      question("¿Qué dibuja grid-template-areas?", ["Un mapa de regiones", "Un color", "Un formulario", "Una URL"], 0, "Sus cadenas describen la posición relativa de áreas nombradas."),
      question("¿Sticky sale del flujo como fixed?", ["Sí", "No", "Solo en Grid", "Solo en móvil"], 1, "Sticky conserva su lugar y queda limitado por su contenedor."),
      question("¿Qué hace object-fit: cover?", ["Deforma", "Llena recortando sin deformar", "Oculta", "Reduce opacidad"], 1, "Cover conserva la proporción y recorta el excedente para llenar la caja."),
      question("¿Qué habilita overflow-x:auto?", ["Desplazamiento horizontal", "Impresión", "Foco", "Contraste"], 0, "Permite recorrer contenido que supera el ancho en el eje horizontal."),
      question("¿Qué define cada parada del scroll snap?", ["scroll-snap-align", "align-content", "top", "content"], 0, "Cada hijo indica cómo se alinea al detener el desplazamiento.")
    ]),
    exam(11, "accesibilidad visual y de navegación", [
      question("¿Qué debe nombrar h1?", ["Cada tarjeta", "La página", "Cada enlace", "El pie"], 1, "El h1 principal comunica el tema general de la página."),
      question("¿Por qué no ocultar un skip link con display:none?", ["Pierde colores", "Sale del orden de foco", "Ocupa más espacio", "Cambia el href"], 1, "Si no participa en el foco, una persona con teclado no puede activarlo."),
      question("¿Qué copia currentColor?", ["El fondo", "El valor de color", "El padding", "La URL"], 1, "currentColor usa el color de texto calculado del elemento."),
      question("¿Qué selector muestra foco de teclado sin depender siempre del cursor?", [":hover", ":focus-visible", "::after", ":root"], 1, ":focus-visible permite un indicador adecuado para interacciones que necesitan señal de foco."),
      question("¿Qué consulta respeta menos movimiento?", ["prefers-reduced-motion", "max-color", "print", "orientation"], 0, "La preferencia reduce permite ofrecer una alternativa sin transiciones o desplazamientos amplios.")
    ]),
    exam(12, "calidad y rendimiento", [
      question("¿Qué incluye border-box en el tamaño?", ["Padding y borde", "Margin", "Solo texto", "La URL"], 0, "El ancho declarado incluye contenido, padding y borde."),
      question("¿Qué ventaja tiene border-inline-start?", ["Se adapta a la dirección de escritura", "Carga imágenes", "Crea Grid", "Imprime"], 0, "Las propiedades lógicas cambian de lado según el flujo del idioma."),
      question("¿Dónde se aplican reglas @media print?", ["Solo en móvil", "Al imprimir", "Solo en oscuro", "En lectores de pantalla"], 1, "El medio print se activa en impresión o su previsualización."),
      question("¿Qué hace attr(href) en un pseudoelemento?", ["Recupera la URL del atributo", "Navega", "Descarga", "Cambia el id"], 0, "attr puede insertar el valor textual del atributo href en contenido generado."),
      question("¿Por qué declarar width y height en img?", ["Para reservar espacio", "Para escribir alt", "Para crear enlaces", "Para ocultar la imagen"], 0, "Las dimensiones permiten calcular la proporción antes de completar la carga.")
    ]),
    exam(13, "proyecto final de interfaz", [
      question("¿Qué debe funcionar antes de aplicar CSS?", ["La estructura y navegación", "Las animaciones", "El color", "El scroll snap"], 0, "HTML debe conservar orden, nombres y acciones aunque la presentación falle."),
      question("¿Cuándo corresponde un enlace en vez de button?", ["Al navegar a otro destino", "Al enviar cualquier formulario", "Al abrir estilos", "Siempre"], 0, "Los enlaces cambian ubicación; los botones ejecutan acciones dentro del contexto actual."),
      question("¿Qué prueba un diseño adaptable?", ["Solo una captura grande", "Varios anchos y contenido real", "El nombre del archivo", "La cantidad de CSS"], 1, "La adaptación se verifica cambiando el espacio y observando orden, lectura y operación."),
      question("¿Qué integra el proyecto final?", ["Solo Grid", "Semántica, adaptación, teclado y preferencias", "Solo imágenes", "Solo formularios"], 1, "La calidad emerge de combinar estructura, composición y formas diversas de interacción."),
      question("¿Qué evidencia ayuda a revisar una interfaz?", ["Requisitos observables y comprobaciones", "Más selectores", "Un color de marca", "Ocultar errores"], 0, "Cada requisito debe relacionarse con una estructura o comportamiento que pueda verificarse.")
    ])
  ];

  function apply() {
    const course = globalThis.HtmlCssCourse;
    if (!course) return;
    if (course.levels.length === 3) globalThis.CourseExpansion?.apply({ "html-css": course });
    if (course.levels.length === 4) globalThis.HtmlCssLearning?.apply(course);
    if (course.levels.length !== 4) return;
    course.levels.push(...levels);
    course.stages = [...(course.stages || []), ...levels.map(level => level.title)];
    const bank = globalThis.StarterExams?.LEVEL_EXAMS?.["html-css"];
    if (bank) for (const item of exams) if (!bank.some(existing => existing.levelId === item.levelId)) bank.push(item);
    const modules = course.levels.flatMap(level => level.modules);
    modules.forEach((item, index) => {
      const next = modules[index + 1];
      if (index >= 16) item.success += next
        ? ` En el siguiente módulo aplicarás esta base para ${next.title.toLowerCase()}.`
        : " Completaste cincuenta módulos; revisa el proyecto y rinde el último mini examen.";
    });
  }

  apply();
  globalThis.HtmlCssFiftyCourse = Object.freeze({ levels, exams, apply });
})();

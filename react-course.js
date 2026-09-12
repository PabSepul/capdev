/* Ruta React: doce módulos sobre react-lab.js. El JSX se transforma a llamadas
   createElement y los componentes se ejecutan de verdad con el intérprete del
   sitio. El primer render de cada solución se contrasta con React 19 real en
   route-react.test.mjs, usando el compilador de TypeScript para transpilar el
   mismo JSX. */
(() => {
  "use strict";
  const check = (label, test) => ({ label, test });

  const pantalla = (indice, html) => (_, r) =>
    !r.error && r.pantallas[indice] !== undefined && r.pantallas[indice].html === html;
  const dibuja = (html) => pantalla(0, html);
  const pantallas = (...listaHtml) => (_, r) =>
    !r.error && r.pantallas.length === listaHtml.length
    && listaHtml.every((html, i) => r.pantallas[i].html === html);
  const clavesEn = (indice, cantidad) => (_, r) =>
    !r.error && r.pantallas[indice] !== undefined && r.pantallas[indice].claves.length === cantidad;
  const usa = (expresion) => (code) => expresion.test(code);
  const ambos = (primera, segunda) => (code, r) => primera(code, r) && segunda(code, r);

  function lesson(spec) {
    return {
      duration: "16 min",
      file: "App.jsx",
      success: "Funciona. Ese mismo componente, copiado a un proyecto React, se dibujaría igual.",
      ...spec
    };
  }

  const CURSOS = '[{ id: 1, nombre: "Python", horas: 12, activo: true }, { id: 2, nombre: "SQL", horas: 5, activo: false }]';

  const lessons = [
    lesson({
      kicker: "Módulo 01 · Componentes",
      title: "Una función que devuelve interfaz",
      shortTitle: "Primer componente",
      difficulty: "Inicio",
      intro: "En React, un trozo de interfaz es una función. Devuelve lo que se tiene que ver, y React se encarga de ponerlo en la pantalla.",
      example: "function Saludo() {\n  return <h1>Hola, React</h1>;\n}",
      explanation: "Lo que va después de return se parece a HTML pero es JSX, y no es JavaScript: antes de ejecutarse se transforma en llamadas a React.createElement. El nombre del componente empieza con mayúscula, y esa mayúscula es lo que distingue un componente tuyo de una etiqueta html. Aquí, render(Saludo) es lo que pide dibujarlo.",
      concepts: [
        "Un componente es una función que devuelve JSX.",
        "El nombre en mayúscula lo distingue de una etiqueta html.",
        "El JSX se transforma antes de ejecutarse; ningún navegador lo entiende directamente."
      ],
      goal: "Escribe el componente Saludo para que devuelva un h1 con el texto «Hola, React» y dibújalo.",
      hints: [
        "El cuerpo del componente termina con return y el JSX.",
        "La etiqueta es <h1> y se cierra con </h1>.",
        "La última línea del archivo tiene que ser render(Saludo);"
      ],
      starter: 'function Saludo() {\n  // Devuelve un h1 con el texto "Hola, React"\n}\n\n// Dibuja el componente\n',
      checks: [
        check("Dibuja el título pedido", dibuja("<h1>Hola, React</h1>")),
        check("Define un componente con nombre en mayúscula", usa(/function\s+Saludo\s*\(/)),
        check("Pide dibujarlo con render", usa(/render\s*\(\s*Saludo\s*\)/))
      ]
    }),
    lesson({
      kicker: "Módulo 02 · Props",
      title: "El mismo componente con datos distintos",
      shortTitle: "Props",
      difficulty: "Inicio",
      intro: "Un componente que siempre muestra lo mismo sirve una vez. Las props son los datos que entran desde afuera y lo vuelven reutilizable.",
      example: "<p>{props.nombre} dura {props.horas} horas</p>",
      explanation: "React entrega a tu función un único objeto llamado props con todo lo que le pasaron. Las llaves dentro del JSX no son parte del texto: marcan dónde se inserta el valor de una expresión de JavaScript. Fíjate en los espacios: los que escribes en una misma línea se conservan tal cual.",
      concepts: [
        "props es un objeto: se leen sus campos con props.nombre.",
        "Las llaves insertan el valor de una expresión.",
        "El mismo componente sirve para cualquier dato con esa forma."
      ],
      goal: "Haz que Curso muestre «Python dura 12 horas» leyendo nombre y horas desde props.",
      hints: [
        "El parámetro de la función se llama props.",
        "Dentro del JSX, {props.nombre} inserta el valor.",
        "Cuida los espacios alrededor de la palabra «dura»."
      ],
      starter: 'function Curso(props) {\n  // Devuelve un p con "<nombre> dura <horas> horas"\n}\n\nrender(Curso, { nombre: "Python", horas: 12 });\n',
      checks: [
        check("Muestra el texto con los datos recibidos", dibuja("<p>Python dura 12 horas</p>")),
        check("Lee el nombre desde props", usa(/props\.nombre/)),
        check("Lee las horas desde props", usa(/props\.horas/))
      ]
    }),
    lesson({
      kicker: "Módulo 03 · Estructura",
      title: "Varios elementos bajo un solo padre",
      shortTitle: "Un solo padre",
      difficulty: "Inicio",
      intro: "Un componente devuelve una sola cosa. Si necesitas mostrar un título y un párrafo, tienen que ir dentro de un elemento que los contenga.",
      example: "<article className=\"ficha\"> … </article>",
      explanation: "return solo puede entregar un valor, así que dos elementos hermanos necesitan un padre que los envuelva. Los paréntesis después de return permiten escribir el JSX en varias líneas sin que JavaScript lo corte. El atributo de clase se escribe className, porque class es una palabra reservada de JavaScript.",
      concepts: [
        "Un componente devuelve un único elemento raíz.",
        "Los paréntesis permiten escribir JSX en varias líneas.",
        "className se convierte en class al dibujarse."
      ],
      goal: "Devuelve un article con clase «ficha» que contenga un h2 con el nombre y un p que diga «Nivel: » y el nivel.",
      hints: [
        "Envuelve todo en <article className=\"ficha\"> … </article>.",
        "Usa paréntesis después de return para escribirlo en varias líneas.",
        "El párrafo lleva el texto «Nivel: » y luego {props.nivel}."
      ],
      starter: 'function Ficha(props) {\n  // Devuelve un article con clase "ficha",\n  // con un h2 y un p adentro\n}\n\nrender(Ficha, { nombre: "SQL", nivel: "inicial" });\n',
      checks: [
        check("Dibuja la ficha completa", dibuja('<article class="ficha"><h2>SQL</h2><p>Nivel: inicial</p></article>')),
        check("Usa className para la clase", usa(/className\s*=/)),
        check("Agrupa los dos elementos bajo un article", usa(/<article/))
      ]
    }),
    lesson({
      kicker: "Módulo 04 · Composición",
      title: "Un componente dentro de otro",
      shortTitle: "Componer",
      difficulty: "Fundamentos",
      intro: "La ventaja real aparece cuando un componente usa a otro. Cada uno se entiende por separado y se arregla por separado.",
      example: "<Etiqueta texto={props.nivel} />",
      explanation: "Un componente se usa como si fuera una etiqueta más, con su nombre en mayúscula. Los datos se le pasan como atributos y llegan a su objeto props. Cuando no tiene contenido adentro, se cierra en la misma etiqueta con una barra antes del signo mayor.",
      concepts: [
        "Un componente se usa como una etiqueta con nombre en mayúscula.",
        "Los atributos que le pones se convierten en sus props.",
        "Sin contenido adentro, se cierra con /> en la misma etiqueta."
      ],
      goal: "Escribe Etiqueta, que devuelve un span con clase «etiqueta» y el texto recibido, y úsalo dentro de Ficha pasándole el nivel.",
      hints: [
        "Etiqueta recibe props.texto y devuelve <span className=\"etiqueta\">.",
        "Dentro de Ficha, escribe <Etiqueta texto={props.nivel} />.",
        "Las llaves alrededor de props.nivel son necesarias: sin ellas pasarías el texto literal."
      ],
      starter: '// 1. Escribe el componente Etiqueta (un span con clase "etiqueta")\n\nfunction Ficha(props) {\n  return (\n    <div>\n      <h2>{props.nombre}</h2>\n      {/* 2. Usa Etiqueta aquí, pasándole el nivel */}\n    </div>\n  );\n}\n\nrender(Ficha, { nombre: "Git", nivel: "inicial" });\n',
      checks: [
        check("Dibuja la ficha con su etiqueta", dibuja('<div><h2>Git</h2><span class="etiqueta">inicial</span></div>')),
        check("Define el componente Etiqueta", usa(/function\s+Etiqueta\s*\(/)),
        check("Lo usa como etiqueta pasándole el nivel", usa(/<Etiqueta[^>]*texto\s*=\s*\{/))
      ]
    }),
    lesson({
      kicker: "Módulo 05 · Listas",
      title: "Una lista construida desde datos",
      shortTitle: "Listas con key",
      difficulty: "Fundamentos",
      intro: "Casi ninguna interfaz tiene una cantidad fija de elementos. La lista se arma recorriendo los datos, no escribiendo cada fila a mano.",
      example: "{props.cursos.map(function (curso) { … })}",
      explanation: "map transforma cada dato en un elemento de JSX, y el arreglo resultante se dibuja completo. Cada elemento de una lista necesita una prop key con un valor estable y único: React la usa para saber cuál es cuál cuando la lista cambia. El identificador del dato sirve; la posición no, porque cambia al reordenar o filtrar.",
      concepts: [
        "map convierte cada dato en un elemento.",
        "key identifica a cada elemento entre sus hermanos.",
        "Un id del dato es estable; la posición en la lista no lo es."
      ],
      goal: "Dibuja un ul con un li por curso, usando el id de cada uno como key y mostrando su nombre.",
      hints: [
        "Dentro del ul, abre llaves y llama a props.cursos.map.",
        "La función del map devuelve <li key={curso.id}>{curso.nombre}</li>.",
        "No olvides el return dentro de la función del map."
      ],
      starter: 'function Lista(props) {\n  return (\n    <ul>\n      {/* Un li por curso, con su key */}\n    </ul>\n  );\n}\n\nrender(Lista, { cursos: [{ id: 1, nombre: "Python" }, { id: 2, nombre: "SQL" }] });\n',
      checks: [
        check("Dibuja los dos cursos", dibuja("<ul><li>Python</li><li>SQL</li></ul>")),
        check("Le da una key a cada elemento", clavesEn(0, 2)),
        check("Construye la lista con map", usa(/\.map\s*\(/))
      ]
    }),
    lesson({
      kicker: "Módulo 06 · Filtros",
      title: "Decide qué mostrar antes de dibujar",
      shortTitle: "Filtrar datos",
      difficulty: "Fundamentos",
      intro: "Un componente no tiene que dibujar todo lo que recibe. Preparar los datos antes del return deja el JSX limpio y la lógica visible.",
      example: "const activos = props.cursos.filter(...)",
      explanation: "El cuerpo del componente es JavaScript normal: puedes calcular lo que necesites antes de devolver el JSX. Filtrar arriba y dibujar abajo separa la decisión de la presentación, y hace que el JSX se lea de un vistazo. Es la misma idea que ordenar los datos antes de imprimir un informe.",
      concepts: [
        "El cuerpo del componente admite cualquier JavaScript.",
        "Calcular antes del return deja el JSX legible.",
        "filter no modifica los datos que llegaron por props."
      ],
      goal: "Muestra solo los cursos con activo verdadero: debe quedar únicamente Python.",
      hints: [
        "Antes del return, crea una constante con props.cursos.filter.",
        "La condición es que curso.activo sea verdadero.",
        "Después recorre esa constante con map, no props.cursos."
      ],
      starter: 'function Lista(props) {\n  // 1. Quédate solo con los cursos activos\n\n  return (\n    <ul>\n      {/* 2. Dibuja un li por cada curso activo, con su key */}\n    </ul>\n  );\n}\n\nrender(Lista, { cursos: ' + CURSOS + ' });\n',
      checks: [
        check("Dibuja solamente el curso activo", dibuja("<ul><li>Python</li></ul>")),
        check("Filtra los datos antes de dibujar", usa(/\.filter\s*\(/)),
        check("Mantiene la key en cada elemento", clavesEn(0, 1))
      ]
    }),
    lesson({
      kicker: "Módulo 07 · Condiciones",
      title: "Dos resultados posibles",
      shortTitle: "Dibujar según el caso",
      difficulty: "Práctica",
      intro: "Una lista vacía no se muestra igual que una con datos. Un componente puede devolver una cosa u otra según lo que reciba.",
      example: "if (props.cantidad === 0) {\n  return <p className=\"vacio\">…</p>;\n}",
      explanation: "Un return temprano es la forma más clara de manejar un caso especial: se atiende primero y el resto del componente se escribe sin pensar en él. Cuando la diferencia es pequeña también sirve un ternario dentro del JSX, pero para dos estructuras distintas conviene separar los dos returns.",
      concepts: [
        "Un componente puede tener varios return.",
        "El caso especial atendido primero simplifica el resto.",
        "Un mensaje para la lista vacía es parte de la interfaz, no un detalle."
      ],
      goal: "Si la cantidad es cero, devuelve un p con clase «vacio» y el texto «No hay cursos todavía.»; si no, un p que diga «Hay N cursos.»",
      hints: [
        "Empieza con if (props.cantidad === 0) y devuelve ahí el mensaje.",
        "El texto exacto del caso vacío es «No hay cursos todavía.»",
        "El otro caso muestra «Hay », la cantidad y « cursos.»"
      ],
      starter: 'function Aviso(props) {\n  // 1. Si no hay cursos, devuelve el mensaje de lista vacía\n  // 2. Si los hay, devuelve el recuento\n}\n\nrender(Aviso, { cantidad: 0 });\n',
      checks: [
        check("Muestra el mensaje de lista vacía", dibuja('<p class="vacio">No hay cursos todavía.</p>')),
        check("Distingue el caso con una condición", usa(/if\s*\(/)),
        check("Marca ese caso con la clase vacio", usa(/className\s*=\s*["']vacio["']/))
      ]
    }),
    lesson({
      kicker: "Módulo 08 · Estado",
      title: "Algo que cambia cuando el usuario actúa",
      shortTitle: "useState",
      difficulty: "Práctica",
      intro: "Las props llegan de afuera y el componente no las cambia. El estado es lo contrario: un dato que vive dentro del componente y que sí cambia con el tiempo.",
      example: "const [valor, poner] = useState(0);",
      explanation: "useState devuelve dos cosas: el valor actual y una función para cambiarlo. Llamar a esa función no modifica la variable: le pide a React que vuelva a dibujar el componente con el valor nuevo. Por eso los nombres se reparten con corchetes, y por eso el primero se lee pero nunca se le asigna.",
      concepts: [
        "useState entrega el valor y la función que lo cambia.",
        "Cambiar el estado provoca un nuevo render.",
        "Al valor no se le asigna directamente: se usa la función."
      ],
      goal: "Muestra «Llevas N clics» y un botón «Sumar» que aumente el contador en uno cada vez.",
      hints: [
        "const [valor, poner] = useState(0); reparte los dos nombres.",
        "El botón lleva onClick con una función que llama a poner.",
        "El valor nuevo es valor + 1."
      ],
      starter: 'function Contador() {\n  // 1. Declara el estado con valor inicial 0\n\n  return (\n    <div>\n      {/* 2. Un p con "Llevas N clics" */}\n      {/* 3. Un botón "Sumar" que aumente el contador */}\n    </div>\n  );\n}\n\nrender(Contador);\n',
      scenario: { acciones: [{ texto: "Sumar" }, { texto: "Sumar" }] },
      checks: [
        check("El contador avanza con cada clic", pantallas(
          "<div><p>Llevas 0 clics</p><button>Sumar</button></div>",
          "<div><p>Llevas 1 clics</p><button>Sumar</button></div>",
          "<div><p>Llevas 2 clics</p><button>Sumar</button></div>")),
        check("Declara el estado con useState", usa(/useState\s*\(/)),
        check("Responde al clic del botón", usa(/onClick\s*=\s*\{/))
      ]
    }),
    lesson({
      kicker: "Módulo 09 · Interacción",
      title: "Dos acciones sobre el mismo dato",
      shortTitle: "Subir y bajar",
      difficulty: "Práctica",
      intro: "El estado no es de un botón: es del componente. Dos controles distintos pueden cambiar el mismo valor, cada uno a su manera.",
      example: "<button onClick={function () { poner(valor - 1); }}>Menos</button>",
      explanation: "Cada manejador calcula el valor nuevo a partir del actual y se lo entrega a la función del estado. React vuelve a dibujar y ambos botones ven el valor actualizado, porque los dos leen la misma variable. No hay que sincronizar nada a mano: ese es justamente el trabajo que React se lleva.",
      concepts: [
        "El estado pertenece al componente, no al control que lo cambia.",
        "Cada manejador decide el valor nuevo desde el actual.",
        "Después de cada cambio, todo el componente se vuelve a dibujar."
      ],
      goal: "Parte en 10, muestra «Valor: N» y agrega dos botones, «Más» y «Menos», que suman y restan uno.",
      hints: [
        "El valor inicial de useState es 10.",
        "El botón Más llama a poner(valor + 1) y el otro a poner(valor - 1).",
        "Los dos botones van dentro del mismo div, después del párrafo."
      ],
      starter: 'function Ajuste() {\n  // 1. Estado con valor inicial 10\n\n  return (\n    <div>\n      {/* 2. Un p con "Valor: N" */}\n      {/* 3. Un botón "Más" y otro "Menos" */}\n    </div>\n  );\n}\n\nrender(Ajuste);\n',
      scenario: { acciones: [{ texto: "Más" }, { texto: "Menos" }, { texto: "Menos" }] },
      checks: [
        check("Sube y baja según el botón", pantallas(
          "<div><p>Valor: 10</p><button>Más</button><button>Menos</button></div>",
          "<div><p>Valor: 11</p><button>Más</button><button>Menos</button></div>",
          "<div><p>Valor: 10</p><button>Más</button><button>Menos</button></div>",
          "<div><p>Valor: 9</p><button>Más</button><button>Menos</button></div>")),
        check("Parte desde 10", usa(/useState\s*\(\s*10\s*\)/)),
        check("Tiene dos controles distintos", (code) => (code.match(/onClick/g) || []).length >= 2)
      ]
    }),
    lesson({
      kicker: "Módulo 10 · Listas vivas",
      title: "Una lista que crece",
      shortTitle: "Estado con lista",
      difficulty: "Avanzado",
      intro: "Cuando el estado es una lista, la regla cambia un poco: no se modifica la lista que ya está, se entrega una nueva.",
      example: "poner(tareas.concat([\"Nueva\"]))",
      explanation: "React compara el valor anterior con el nuevo para decidir si hay que volver a dibujar. Si modificas la misma lista con push, sigue siendo la misma y el cambio puede pasar desapercibido. concat devuelve una lista nueva con el elemento agregado y deja intacta la anterior, que es lo que React espera.",
      concepts: [
        "El estado se reemplaza, no se modifica en su lugar.",
        "concat devuelve una lista nueva; push cambia la existente.",
        "Cada elemento sigue necesitando su key."
      ],
      goal: "Parte con la tarea «Estudiar» y agrega una tarea «Nueva» cada vez que se presione el botón «Agregar».",
      hints: [
        'El estado inicial es la lista ["Estudiar"].',
        "Dibuja la lista con map, usando el índice como key.",
        'El botón llama a poner(tareas.concat(["Nueva"])).'
      ],
      starter: 'function Tareas() {\n  // 1. Estado con la lista inicial ["Estudiar"]\n\n  return (\n    <div>\n      <ul>\n        {/* 2. Un li por tarea, con su key */}\n      </ul>\n      {/* 3. Un botón "Agregar" que añada "Nueva" */}\n    </div>\n  );\n}\n\nrender(Tareas);\n',
      scenario: { acciones: [{ texto: "Agregar" }, { texto: "Agregar" }] },
      checks: [
        check("La lista crece con cada clic", pantallas(
          "<div><ul><li>Estudiar</li></ul><button>Agregar</button></div>",
          "<div><ul><li>Estudiar</li><li>Nueva</li></ul><button>Agregar</button></div>",
          "<div><ul><li>Estudiar</li><li>Nueva</li><li>Nueva</li></ul><button>Agregar</button></div>")),
        check("Entrega una lista nueva en vez de modificar la anterior", ambos(usa(/\.concat\s*\(/), (code) => !/\.push\s*\(/.test(code))),
        check("Cada tarea conserva su key", clavesEn(2, 3))
      ]
    }),
    lesson({
      kicker: "Módulo 11 · Mostrar y ocultar",
      title: "Un interruptor en la interfaz",
      shortTitle: "Estado booleano",
      difficulty: "Avanzado",
      intro: "El estado más simple es un sí o un no, y suele ser el más útil: decide qué se ve y qué texto lleva el control que lo cambia.",
      example: "{visible ? <p>Contenido visible</p> : null}",
      explanation: "Un ternario dentro del JSX elige entre dos resultados; devolver null significa «aquí no se dibuja nada». El texto del propio botón también depende del estado, así que cambia junto con lo que muestra. Invertir un booleano con el signo de exclamación es todo lo que necesita el manejador.",
      concepts: [
        "null en el JSX significa que no se dibuja nada.",
        "El ternario elige entre dos resultados dentro de las llaves.",
        "El control puede cambiar de texto según el estado."
      ],
      goal: "Muestra un párrafo «Contenido visible» y un botón que diga «Ocultar» cuando se ve y «Mostrar» cuando no.",
      hints: [
        "El estado inicial es true.",
        "Usa {visible ? <p>Contenido visible</p> : null} dentro del div.",
        "El texto del botón también sale de un ternario, y el clic hace poner(!visible)."
      ],
      starter: 'function Panel() {\n  // 1. Estado booleano que empieza en true\n\n  return (\n    <div>\n      {/* 2. El párrafo, solo cuando corresponde */}\n      {/* 3. El botón, que cambia de texto y de estado */}\n    </div>\n  );\n}\n\nrender(Panel);\n',
      scenario: { acciones: [{ texto: "Ocultar" }, { texto: "Mostrar" }] },
      checks: [
        check("Oculta y vuelve a mostrar", pantallas(
          "<div><p>Contenido visible</p><button>Ocultar</button></div>",
          "<div><button>Mostrar</button></div>",
          "<div><p>Contenido visible</p><button>Ocultar</button></div>")),
        check("Elige qué dibujar con un ternario", usa(/\?[^]*:/)),
        check("Invierte el valor al cambiar el estado", usa(/poner\s*\(\s*!/))
      ]
    }),
    lesson({
      kicker: "Módulo 12 · Proyecto",
      title: "Un catálogo con filtro",
      shortTitle: "Catálogo con filtro",
      difficulty: "Proyecto",
      duration: "25 min",
      intro: "Último módulo: dos componentes, props que bajan, una lista con key, un estado que decide qué se ve y un contador que se ajusta solo.",
      example: "<Curso key={curso.id} curso={curso} />",
      explanation: "El componente de arriba tiene el estado y decide qué datos pasar; el de abajo solo recibe un curso y lo dibuja. Esa separación es la que hace que una interfaz crezca sin volverse ilegible: el de abajo no sabe nada del filtro, y el de arriba no sabe cómo se ve una fila. El contador del título no se actualiza a mano, sale de la cantidad que quedó tras filtrar.",
      concepts: [
        "El estado vive arriba y los datos bajan como props.",
        "El componente de abajo no necesita saber por qué le llega ese dato.",
        "Lo que se muestra se calcula, no se mantiene sincronizado a mano."
      ],
      goal: "Dibuja un catálogo con el total entre paréntesis, una fila por curso con su nombre en negrita y sus horas, y un botón que alterne entre todos y solo los activos.",
      hints: [
        "Curso recibe props.curso y devuelve un li con clase «curso».",
        "El estado del filtro empieza en false y el botón lo invierte.",
        "El título muestra la cantidad de cursos visibles, no el total original."
      ],
      starter: '// 1. Escribe el componente Curso: un li con clase "curso",\n//    el nombre en <strong> y luego " · N h"\n\nfunction Catalogo(props) {\n  // 2. Estado del filtro, que empieza en false\n  // 3. Calcula los cursos visibles\n\n  return (\n    <section>\n      {/* 4. Un h2 con "Catálogo (N)" */}\n      {/* 5. La lista, usando el componente Curso */}\n      {/* 6. El botón que alterna el filtro */}\n    </section>\n  );\n}\n\nrender(Catalogo, { cursos: [\n  { id: 1, nombre: "Python", horas: 12, activo: true },\n  { id: 2, nombre: "SQL", horas: 5, activo: false }\n] });\n',
      scenario: { acciones: [{ texto: "Solo activos" }] },
      success: "Ruta terminada: sabes repartir una interfaz en componentes y hacer que responda a quien la usa.",
      checks: [
        check("El catálogo se filtra al presionar el botón", pantallas(
          '<section><h2>Catálogo (2)</h2><ul><li class="curso"><strong>Python</strong> · 12 h</li><li class="curso"><strong>SQL</strong> · 5 h</li></ul><button>Solo activos</button></section>',
          '<section><h2>Catálogo (1)</h2><ul><li class="curso"><strong>Python</strong> · 12 h</li></ul><button>Ver todos</button></section>')),
        check("Separa la fila en su propio componente", usa(/function\s+Curso\s*\(/)),
        check("Cada fila lleva su key", clavesEn(0, 2))
      ]
    })
  ];

  const titles = ["La interfaz por partes", "Datos en pantalla", "Estado e interacción"];
  const descriptions = [
    "Componentes, props y composición",
    "Listas, filtros, condiciones y el primer estado",
    "Interacción, listas vivas y un proyecto"
  ];

  globalThis.ReactCourse = {
    name: "React",
    kind: "react",
    storageKey: "codigo-cero.react-v2.completed",
    examsKey: "codigo-cero.react-v2.exams",
    stages: titles,
    levels: titles.map((title, i) => ({ title, description: descriptions[i], modules: lessons.slice(i * 4, i * 4 + 4) })),
    lessons
  };

  const questions = [
    [
      ["¿Qué es un componente en React?", ["Un archivo html", "Una función que devuelve interfaz", "Una hoja de estilos", "Una etiqueta nueva del navegador"], 1, "Devuelve JSX, y React se encarga de ponerlo en la pantalla."],
      ["¿Por qué el nombre de un componente empieza con mayúscula?", ["Por estilo", "Para distinguirlo de una etiqueta html", "Porque JavaScript lo exige", "Para que sea más rápido"], 1, "En minúscula, JSX lo trataría como una etiqueta html corriente."],
      ["¿Qué es realmente el JSX?", ["HTML dentro de JavaScript", "Una sintaxis que se transforma en llamadas a createElement", "Una plantilla de texto", "Un archivo aparte"], 1, "Ningún navegador entiende JSX: se transforma antes de ejecutarse."],
      ["¿Qué son las props?", ["Variables globales", "Los datos que un componente recibe desde afuera", "El estado interno", "Los estilos"], 1, "Llegan en un único objeto y el componente no las modifica."],
      ["¿Por qué se escribe className y no class?", ["Por convención de React", "Porque class es una palabra reservada de JavaScript", "Porque es más corto", "Porque el navegador lo exige"], 1, "Al dibujarse, className se convierte en el atributo class."]
    ],
    [
      ["¿Cuántos elementos puede devolver un componente?", ["Todos los que quiera", "Uno solo, que puede contener otros", "Máximo dos", "Ninguno"], 1, "return entrega un solo valor: los hermanos necesitan un padre que los envuelva."],
      ["¿Para qué sirve map al dibujar una lista?", ["Para ordenar", "Para convertir cada dato en un elemento", "Para contar", "Para filtrar"], 1, "El arreglo de elementos que devuelve se dibuja completo."],
      ["¿Para qué sirve la prop key?", ["Para dar estilo", "Para que React identifique cada elemento entre sus hermanos", "Para ordenar la lista", "Para acelerar el filtro"], 1, "Sin una identidad estable, React no sabe cuál elemento es cuál cuando la lista cambia."],
      ["¿Por qué la posición no sirve como key si la lista se reordena?", ["Porque es un número", "Porque cambia y deja de identificar al mismo dato", "Porque React la rechaza", "Porque es lenta"], 1, "El id del dato viaja con él; su posición, no."],
      ["¿Dónde conviene filtrar los datos?", ["Dentro del JSX", "Antes del return, en el cuerpo del componente", "En otro archivo siempre", "Después de dibujar"], 1, "Separar el cálculo de la presentación deja el JSX legible."]
    ],
    [
      ["¿Qué devuelve useState?", ["Solo el valor", "El valor actual y una función para cambiarlo", "Una función", "Un objeto con opciones"], 1, "Por eso se reparte con corchetes en dos nombres."],
      ["¿Qué pasa al llamar a la función que cambia el estado?", ["Cambia la variable al instante", "React vuelve a dibujar el componente con el valor nuevo", "No pasa nada hasta recargar", "Se borra el componente"], 1, "El nuevo valor se ve en el render siguiente, no en la línea de abajo."],
      ["¿Cuál es la diferencia entre props y estado?", ["Ninguna", "Las props llegan de afuera; el estado vive dentro y cambia", "El estado llega de afuera", "Las props cambian solas"], 1, "Un componente no modifica sus props; sí administra su estado."],
      ["Si el estado es una lista, ¿cómo se agrega un elemento?", ["Con push sobre la misma lista", "Entregando una lista nueva, por ejemplo con concat", "Modificando el índice", "No se puede"], 1, "React compara el valor anterior con el nuevo: si es la misma lista, puede no notar el cambio."],
      ["¿Qué significa devolver null dentro del JSX?", ["Un error", "Que ahí no se dibuja nada", "Una lista vacía", "Un espacio en blanco"], 1, "Es la forma habitual de ocultar algo según una condición."]
    ]
  ];

  globalThis.StarterExams.LEVEL_EXAMS.react = questions.map((bank, i) => ({
    levelId: i + 1,
    title: "Mini examen: " + titles[i],
    passing: 4,
    intro: "Responde las cinco preguntas. Apruebas con cuatro aciertos y puedes repetir el repaso.",
    questions: bank.map(([question, options, answer, explanation]) => ({ question, options, answer, explanation }))
  }));
})();

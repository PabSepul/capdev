(() => {
  "use strict";
  const check = (label, test) => ({ label, test });
  const file = (path, value) => (_, r) => r.state.files[path] === value;
  const ran = (name, output) => (_, r) => r.history.some(h => h.commands.some(c => c[0] === name) && (output === undefined || h.output === output));
  const base = globalThis.TerminalLab.initial();
  function lesson(title, intro, explanation, concepts, goal, example, starter, solution, hints, checks, scenario) {
    return { title, shortTitle: title, intro, explanation, concepts, goal, example, starter, solution, hints, checks,
      duration: "15 min", file: "Terminal · archivos virtuales", difficulty: "Fundamentos", scenario,
      success: "Misión resuelta. Revisa qué cambió en la carpeta virtual antes de avanzar." };
  }
  const lessons = [
    lesson("Ubícate antes de actuar", "La terminal comienza en /proyecto. Antes de cambiar archivos, averigua dónde estás y qué contiene esa carpeta.",
      "pwd muestra la ruta actual; ls enumera su contenido inmediato. Una ruta identifica una ubicación, no un archivo abierto. Este laboratorio usa convenciones de un shell de estilo Bash: no es PowerShell y no accede a tu computador.",
      ["pwd significa print working directory.", "ls no cambia la ubicación.", "Los nombres distinguen mayúsculas y minúsculas."],
      "Muestra la ubicación /proyecto y lista README.md, datos/ y docs/ sin cambiar de carpeta.", "pwd\nls", "pwd", "pwd\nls",
      ["pwd ya muestra la ubicación actual.", "Añade ls en una segunda línea.", "La lista debe incluir README.md y las carpetas datos y docs."],
      [check("Consulta la ubicación", ran("pwd", "/proyecto\n")), check("Lista el contenido", (_, r) => r.history.some(h => h.commands[0][0] === "ls" && ["README.md", "datos/", "docs/"].every(s => h.output.includes(s)))), check("Permanece en /proyecto", (_, r) => r.state.cwd === "/proyecto")]),
    lesson("Entra a una carpeta y lee sus notas", "Las notas del proyecto viven en docs. Cambiar de carpeta modifica cómo se interpretan las rutas relativas.",
      "cd docs entra en una carpeta hija. Después cat notas.txt muestra su contenido porque ahora la ruta se interpreta desde /proyecto/docs. cat no abre un editor ni cambia el archivo.",
      ["cd cambia el directorio actual.", "Una ruta relativa parte de tu ubicación.", "cat escribe el contenido del archivo en la salida."],
      "Entra en docs, lee notas.txt y confirma con pwd que estás en /proyecto/docs.", "cd datos\ncat cursos.txt", "ls", "cd docs\ncat notas.txt\npwd",
      ["Empieza con cd docs.", "Ya dentro, usa cat notas.txt.", "Termina con pwd para verificar la ubicación."],
      [check("Entra en docs", (_, r) => r.state.cwd === "/proyecto/docs"), check("Lee las tres notas", ran("cat", base.files["/proyecto/docs/notas.txt"])), check("Comprueba la ubicación final", ran("pwd", "/proyecto/docs\n"))]),
    lesson("Vuelve y usa una ruta absoluta", "No necesitas moverte a cada carpeta para leer un archivo. Una ruta absoluta empieza por / y se interpreta desde la raíz virtual.",
      ".. representa la carpeta padre. Desde docs, cd .. vuelve a /proyecto. cat /proyecto/datos/cursos.txt identifica el archivo completo sin depender de la carpeta actual. La raíz virtual / no es la raíz de tu disco.",
      [".. sube un nivel.", "Una ruta absoluta empieza con /.", "Leer un archivo no cambia cwd."],
      "Partiendo de /proyecto/docs, vuelve a /proyecto, lee la lista de cursos con su ruta absoluta y confirma la ubicación con pwd.", "cd ..\ncat /proyecto/README.md", "pwd", "cd ..\ncat /proyecto/datos/cursos.txt\npwd",
      ["cd .. te lleva a la carpeta padre.", "Usa cat /proyecto/datos/cursos.txt.", "pwd debe seguir mostrando /proyecto."],
      [check("Vuelve a la carpeta padre", (_, r) => r.state.cwd === "/proyecto"), check("Lee todos los cursos", ran("cat", base.files["/proyecto/datos/cursos.txt"])), check("Usa la ruta absoluta solicitada", (_, r) => r.history.some(h => h.commands.some(c => c[0] === "cat" && c[1] === "/proyecto/datos/cursos.txt")))], { ...base, cwd: "/proyecto/docs" }),
    lesson("Prepara una estructura de trabajo", "Una carpeta ordenada ayuda a separar código, datos y documentación. Crear la estructura no equivale a crear el contenido de los archivos.",
      "mkdir crea carpetas. La opción -p también crea sus padres si faltan. touch crea un archivo vacío cuando no existe; en un shell real también actualiza sus marcas de tiempo, algo que esta simulación no representa.",
      ["mkdir y touch trabajan con tipos distintos.", "-p permite crear rutas anidadas.", "Las rutas pueden ser relativas a /proyecto."],
      "Crea trabajo/src y el archivo vacío trabajo/src/app.txt. Lista trabajo/src para comprobarlo.", "mkdir -p ejemplos/web\ntouch ejemplos/web/index.txt", "ls", "mkdir -p trabajo/src\ntouch trabajo/src/app.txt\nls trabajo/src",
      ["Usa mkdir -p trabajo/src.", "Después ejecuta touch trabajo/src/app.txt.", "Comprueba el contenido con ls trabajo/src."],
      [check("Crea la carpeta anidada", (_, r) => r.state.dirs.includes("/proyecto/trabajo/src")), check("Crea app.txt vacío", file("/proyecto/trabajo/src/app.txt", "")), check("Lista el archivo creado", ran("ls", "app.txt\n"))]),
    lesson("Guarda texto con una redirección", "echo produce texto en la salida. El operador > permite guardar esa salida en un archivo.",
      "> crea el destino o reemplaza su contenido anterior. No agrega texto al final. Las comillas agrupan palabras con espacios en un argumento. En esta práctica echo añade un salto de línea al texto.",
      ["La salida puede ir a la pantalla o a un archivo.", "> reemplaza el contenido del destino.", "Las comillas no forman parte del texto guardado."],
      'Crea saludo.txt con la línea Hola, terminal y léelo con cat. Conserva README.md.', 'echo "Primer paso" > paso.txt\ncat paso.txt', "ls",
      'echo "Hola, terminal" > saludo.txt\ncat saludo.txt',
      ['Escribe echo "Hola, terminal".', "Redirige esa salida con > saludo.txt.", "Añade cat saludo.txt para comprobar lo escrito."],
      [check("Guarda el saludo exacto", file("/proyecto/saludo.txt", "Hola, terminal\n")), check("Lee el saludo guardado", ran("cat", "Hola, terminal\n")), check("Conserva README.md", file("/proyecto/README.md", base.files["/proyecto/README.md"]))]),
    lesson("Añade una segunda línea sin borrar la primera", "Un registro crece con nuevas entradas. Usar > cada vez eliminaría lo que escribiste antes.",
      ">> agrega al final del archivo. La diferencia de un solo símbolo cambia el resultado: > reemplaza, >> conserva y añade. wc -l cuenta saltos de línea; con estas dos llamadas a echo tendrá dos líneas.",
      ["> y >> no son equivalentes.", "echo termina cada entrada con un salto de línea.", "wc -l resume la cantidad de líneas terminadas."],
      "Crea diario.txt con Aprender en la primera línea y Practicar en la segunda. Muestra las dos líneas con cat.", 'echo "Uno" > ejemplo.txt\necho "Dos" >> ejemplo.txt', "ls",
      'echo "Aprender" > diario.txt\necho "Practicar" >> diario.txt\ncat diario.txt',
      ["Crea la primera línea con >.", "Para la segunda usa >> sobre el mismo archivo.", "cat diario.txt debe mostrar Aprender y Practicar en líneas distintas."],
      [check("Conserva ambas líneas", file("/proyecto/diario.txt", "Aprender\nPracticar\n")), check("Lee el registro completo", ran("cat", "Aprender\nPracticar\n")), check("No modifica las notas iniciales", file("/proyecto/docs/notas.txt", base.files["/proyecto/docs/notas.txt"]))]),
    lesson("Haz una copia antes de editar", "Una copia permite conservar el punto de partida. El archivo original y su copia son entradas independientes en la carpeta.",
      "cp recibe origen y destino, en ese orden. Tras copiar README.md, puedes escribir en la copia sin cambiar el original. No confundas cp con mv: mover retira el nombre anterior.",
      ["cp conserva el origen.", "El destino recibe el contenido actual.", "Redirigir luego a la copia solo cambia la copia."],
      "Copia README.md a respaldo.md y crea notas-personales.txt con la línea Mi plan. Comprueba con cat que respaldo.md conserva el contenido original.", "cp datos/cursos.txt cursos-copia.txt\ncat cursos-copia.txt", "ls",
      'cp README.md respaldo.md\necho "Mi plan" > notas-personales.txt\ncat respaldo.md',
      ["cp README.md respaldo.md crea una copia.", 'Usa echo "Mi plan" > notas-personales.txt para un archivo aparte.', "Lee respaldo.md; no redirijas sobre él."],
      [check("Conserva original y copia", (_, r) => r.state.files["/proyecto/README.md"] === base.files["/proyecto/README.md"] && r.state.files["/proyecto/respaldo.md"] === base.files["/proyecto/README.md"]), check("Guarda el plan aparte", file("/proyecto/notas-personales.txt", "Mi plan\n")), check("Verifica el respaldo", ran("cat", base.files["/proyecto/README.md"]))]),
    lesson("Renombra y retira un archivo temporal", "La carpeta inicial incluye borrador.txt y temporal.txt. La misión solo necesita conservar el borrador con un nombre definitivo.",
      "mv mueve o renombra un archivo; rm lo elimina. En este laboratorio solo rm de un archivo está disponible, sin borrado recursivo. En una terminal real, revisa la ruta antes de eliminar: rm no envía normalmente el archivo a una papelera.",
      ["mv no crea una segunda copia.", "rm actúa sobre la ruta indicada.", "ls permite revisar la carpeta después de un cambio."],
      "Renombra borrador.txt a entrega.txt, elimina solo temporal.txt y lista /proyecto. Conserva README.md y la entrega.", "mv nombre-viejo.txt nombre-nuevo.txt", "ls",
      "mv borrador.txt entrega.txt\nrm temporal.txt\nls",
      ["Primero usa mv borrador.txt entrega.txt.", "Elimina únicamente temporal.txt con rm temporal.txt.", "Revisa con ls que entrega.txt permanezca."],
      [check("Renombra sin conservar el nombre anterior", (_, r) => r.state.files["/proyecto/entrega.txt"] === "Entrega de práctica\n" && !("/proyecto/borrador.txt" in r.state.files)), check("Retira el temporal", (_, r) => !("/proyecto/temporal.txt" in r.state.files)), check("Conserva README.md", file("/proyecto/README.md", base.files["/proyecto/README.md"]))],
      { ...base, files: { ...base.files, "/proyecto/borrador.txt": "Entrega de práctica\n", "/proyecto/temporal.txt": "Prueba temporal\n" } }),
    lesson("Encuentra las tareas pendientes", "Las notas mezclan tareas terminadas y pendientes. Puedes seleccionar las líneas que contienen una palabra.",
      "grep muestra líneas que coinciden. Aquí solo admite texto literal y distingue mayúsculas: Pendiente no es pendiente. No borra las líneas del archivo; filtra lo que aparece en pantalla.",
      ["Una búsqueda filtra la salida.", "El archivo original permanece igual.", "El laboratorio no admite expresiones regulares de grep."],
      "Busca Pendiente dentro de docs/notas.txt, mostrando únicamente las dos líneas pendientes. Conserva el archivo.", 'grep "Hecho" docs/notas.txt', "cat docs/notas.txt", 'grep "Pendiente" docs/notas.txt',
      ["El patrón es Pendiente, con P mayúscula.", "Usa grep seguido del patrón y la ruta.", "La salida debe contener leer y repasar, sin Hecho."],
      [check("Selecciona exactamente las dos pendientes", ran("grep", "Pendiente: leer\nPendiente: repasar\n")), check("Conserva el archivo", file("/proyecto/docs/notas.txt", base.files["/proyecto/docs/notas.txt"])), check("No cambia de carpeta", (_, r) => r.state.cwd === "/proyecto")]),
    lesson("Conecta dos comandos", "Una tubería evita guardar un archivo intermedio: entrega la salida de un comando como entrada del siguiente.",
      "El operador | conecta flujos. cat datos/cursos.txt | wc -l cuenta los saltos de línea emitidos por cat. El segundo comando recibe texto, no el nombre del archivo original.",
      ["| conecta salida con entrada.", "wc -l cuenta saltos de línea.", "Una tubería de lectura no cambia archivos."],
      "Conecta cat datos/cursos.txt con wc -l. La salida final debe ser 4 y el archivo de cursos debe quedar intacto.", 'echo "Una línea" | wc -l', "cat datos/cursos.txt", "cat datos/cursos.txt | wc -l",
      ["Empieza con cat datos/cursos.txt.", "Añade | wc -l en la misma línea.", "No uses >: la misión pide mostrar el conteo, no escribirlo en un archivo."],
      [check("Conecta cat con wc", (_, r) => r.history.some(h => h.commands.length === 2 && h.commands[0][0] === "cat" && h.commands[1][0] === "wc")), check("Obtiene cuatro líneas", ran("wc", "4\n")), check("Conserva los cursos", file("/proyecto/datos/cursos.txt", base.files["/proyecto/datos/cursos.txt"]))]),
    lesson("Guarda una muestra de los datos", "Para inspeccionar un archivo grande, una muestra inicial puede ser suficiente. head permite elegir cuántas líneas ver.",
      "head -n 2 selecciona las primeras dos líneas. Puedes redirigir ese resultado a un archivo nuevo. Nunca uses el mismo archivo como origen y destino de >: la redirección lo vacía antes de que el comando lo lea.",
      ["-n indica la cantidad solicitada.", "Una muestra no modifica el origen.", "Origen y destino deben ser diferentes al redirigir."],
      "Guarda las primeras dos líneas de datos/cursos.txt en muestra.txt y lee la muestra. Conserva los cuatro cursos originales.", "head -n 1 docs/notas.txt", "cat datos/cursos.txt",
      "head -n 2 datos/cursos.txt > muestra.txt\ncat muestra.txt",
      ["Usa head -n 2 datos/cursos.txt.", "Redirige a muestra.txt, no a cursos.txt.", "cat muestra.txt debe mostrar HTML y SQL."],
      [check("Guarda dos cursos en la muestra", file("/proyecto/muestra.txt", "HTML\nSQL\n")), check("Lee la muestra", ran("cat", "HTML\nSQL\n")), check("Conserva el origen", file("/proyecto/datos/cursos.txt", base.files["/proyecto/datos/cursos.txt"]))]),
    lesson("Entrega un reporte verificable", "Combina carpetas, filtros, copias y conteos para entregar un reporte pequeño que otra persona pueda revisar.",
      "Primero crea reportes, después filtra las notas pendientes a un archivo dentro de esa carpeta. Haz un respaldo y cuenta sus líneas por una tubería. El reporte y su respaldo deben contener lo mismo; las notas iniciales siguen siendo la fuente.",
      ["Prepara la carpeta antes de escribir el archivo.", "Guarda solo las filas que responden la misión.", "Verifica el contenido y su cantidad."],
      "Crea reportes/pendientes.txt con las dos tareas pendientes, cópialo a reportes/respaldo.txt y muestra el conteo 2 usando cat y wc -l. Conserva las notas originales.", "mkdir reportes\nls reportes", "ls",
      'mkdir reportes\ngrep "Pendiente" docs/notas.txt > reportes/pendientes.txt\ncp reportes/pendientes.txt reportes/respaldo.txt\ncat reportes/pendientes.txt | wc -l',
      ["mkdir reportes prepara el destino.", 'grep "Pendiente" docs/notas.txt > reportes/pendientes.txt crea el reporte.', "Copia el reporte y usa cat reportes/pendientes.txt | wc -l."],
      [check("Entrega reporte y respaldo idénticos", (_, r) => ["pendientes.txt", "respaldo.txt"].every(n => r.state.files["/proyecto/reportes/" + n] === "Pendiente: leer\nPendiente: repasar\n")), check("Comprueba dos líneas por tubería", (_, r) => r.history.some(h => h.commands.length === 2 && h.commands[0][0] === "cat" && h.commands[1][0] === "wc" && h.output === "2\n")), check("Conserva la fuente", file("/proyecto/docs/notas.txt", base.files["/proyecto/docs/notas.txt"]))])
  ];
  const shortTitles = ["pwd y ls", "cd y cat", "Rutas absolutas", "mkdir y touch",
    "Redirección >", "Añadir con >>", "Copiar con cp", "mv y rm",
    "Filtrar con grep", "Tuberías con |", "Muestra con head", "Proyecto final"];
  const difficulties = ["Inicio", "Inicio", "Inicio", "Fundamentos", "Fundamentos", "Fundamentos",
    "Práctica", "Práctica", "Práctica", "Integración", "Integración", "Proyecto"];
  lessons.forEach((l, i) => {
    l.kicker = "Módulo " + String(i + 1).padStart(2, "0") + " · Terminal";
    l.shortTitle = shortTitles[i];
    l.difficulty = difficulties[i];
  });
  const titles = ["Ubicación y rutas", "Archivos y salidas", "Filtros y reportes"];
  globalThis.TerminalCourse = { name: "Terminal", kind: "terminal", storageKey: "codigo-cero.terminal-v2.completed", examsKey: "codigo-cero.terminal-v2.exams",
    stages: titles, levels: titles.map((title, i) => ({ title, description: ["Navegar, leer y preparar carpetas", "Escribir, copiar y renombrar", "Buscar, conectar y verificar"][i], modules: lessons.slice(i * 4, i * 4 + 4) })), lessons };
  const questions = [
    [
      ["¿Qué muestra pwd?", ["La ubicación actual", "Todos los archivos del disco", "El usuario de GitHub", "El contenido de un archivo"], 0, "pwd imprime la ruta del directorio de trabajo."],
      ["¿Qué hace cd ..?", ["Crea una carpeta", "Sube a la carpeta padre", "Borra la carpeta", "Abre un archivo"], 1, ".. representa el directorio padre."],
      ["¿Qué distingue una ruta absoluta aquí?", ["Tiene espacios", "Termina en txt", "Empieza con /", "Siempre es más corta"], 2, "Se interpreta desde la raíz virtual, independientemente de cwd."],
      ["¿Para qué sirve mkdir -p?", ["Listar archivos", "Imprimir texto", "Leer notas", "Crear carpetas y padres que falten"], 3, "-p permite preparar una ruta anidada sin crear sus padres por separado."],
      ["¿Los comandos de esta página modifican tu disco?", ["Sí", "No, usan archivos virtuales", "Solo rm", "Solo echo"], 1, "La simulación está en memoria y reinicia el escenario en cada intento."]
    ],
    [
      ["¿Qué hace > con un archivo existente?", ["Añade al final", "Lo copia", "Reemplaza el contenido", "Lo renombra"], 2, "La redirección > trunca el archivo antes de ejecutar el comando."],
      ["¿Cómo agregas otra línea sin perder las anteriores?", ["Con >>", "Con >", "Con cd", "Con mv"], 0, ">> conserva el contenido y añade la salida nueva al final."],
      ["¿Qué comando conserva el origen al copiar?", ["rm", "mv", "cd", "cp"], 3, "cp crea o reemplaza el destino y conserva el origen."],
      ["¿Qué hace mv a.txt b.txt?", ["Combina ambos", "Mueve o renombra el archivo", "Imprime b", "Cuenta líneas"], 1, "El nombre anterior deja de existir cuando el movimiento termina."],
      ["Antes de rm en una terminal real conviene…", ["Añadir -r siempre", "Ignorar la ubicación", "Revisar la ruta exacta", "Borrar toda la carpeta"], 2, "rm no usa normalmente una papelera; identifica el archivo que quieres retirar."]
    ],
    [
      ["¿Qué entrega grep en esta práctica?", ["Las líneas con el texto buscado", "La cantidad de carpetas", "Una copia del archivo", "Un archivo modificado"], 0, "El filtro cambia la salida, no el archivo fuente."],
      ["¿Qué conecta el operador |?", ["Dos carpetas", "Un archivo y su nombre", "Dos cuentas", "La salida de un comando y la entrada del siguiente"], 3, "Una tubería permite componer operaciones sin guardar un archivo intermedio."],
      ["¿Qué cuenta wc -l?", ["Palabras", "Saltos de línea", "Letras", "Archivos"], 1, "Una última línea sin salto final puede no entrar en ese conteo."],
      ["¿Por qué evitar cat a.txt > a.txt?", ["Porque cat escribe mayúsculas", "Porque cambia de carpeta", "Porque > vacía el origen antes de leerlo", "Porque crea una copia"], 2, "El shell prepara la redirección antes de ejecutar cat."],
      ["¿Qué verificarías al entregar un reporte?", ["Solo el nombre", "Solo el tamaño", "Nada si no hubo errores", "El contenido, cantidad y conservación del origen"], 3, "Un comando que termina bien aún puede producir un reporte que no responda la misión."]
    ]
  ];
  globalThis.StarterExams.LEVEL_EXAMS.terminal = questions.map((bank, i) => ({ levelId: i + 1, title: "Mini examen: " + titles[i], passing: 4,
    intro: "Responde las cinco preguntas. Apruebas con cuatro aciertos y puedes repetir el repaso.",
    questions: bank.map(([question, options, answer, explanation]) => ({ question, options, answer, explanation })) }));
})();

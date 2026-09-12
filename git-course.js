/*
  Ruta de Git y GitHub: 3 niveles de 4 módulos sobre el simulador de git-lab.js.
  Cada módulo describe la carpeta de trabajo con la que empieza el laboratorio.
*/
(() => {
  "use strict";

  const commit = (id, message, parent, files) => ({ id, message, parent, branch: "main", files, merge: false });

  const usa = (code, patron) => patron.test(String(code).replace(/^\s*#.*$/gm, ""));
  const muestra = (result, texto) => result.output.some((linea) => linea.includes(texto));
  const commitsDe = (result, rama) => {
    const historia = [];
    let actual = result.state.branches[rama];
    while (actual) {
      const encontrado = result.state.commits.find((item) => item.id === actual);
      if (!encontrado) break;
      historia.push(encontrado);
      actual = encontrado.parent;
    }
    return historia;
  };

  const PAGINA = "<h1>Mi portafolio</h1>\n<p>Proyectos en construcción.</p>";
  const ESTILOS = "body { font-family: system-ui; }";

  const lessons = [
    {
      kicker: "Módulo 01 · Repositorio",
      title: "Crea el repositorio",
      shortTitle: "git init",
      duration: "10 min",
      difficulty: "Inicio",
      file: "Terminal · carpeta mi-portafolio",
      intro: "Git no vigila tus carpetas por defecto. Primero hay que decirle que empiece a seguir esta.",
      example: "git init",
      explanation: "git init crea la carpeta oculta .git, donde Git guardará todas las versiones. Desde ese momento la carpeta es un repositorio y git status puede informarte qué ve.",
      concepts: [
        "La carpeta ya tiene archivos: Git aún no los conoce.",
        "git init crea el repositorio; se ejecuta una sola vez por proyecto.",
        "git status es el comando que más usarás: dice en qué estado está todo."
      ],
      goal: "Convierte la carpeta en un repositorio y luego pide el estado para ver los archivos sin seguimiento.",
      hints: [
        "Escribe un comando por línea; el laboratorio los ejecuta en orden.",
        "El primero es git init.",
        "El segundo es git status: debe listar index.html y estilos.css como archivos sin seguimiento."
      ],
      starter: "git status",
      success: "Ya tienes un repositorio y sabes cómo preguntarle qué está pasando.",
      scenario: {
        initialized: false,
        files: { "index.html": { content: PAGINA }, "estilos.css": { content: ESTILOS } }
      },
      checks: [
        { label: "Inicializas el repositorio con git init", test: (code, result) => result.state.initialized && muestra(result, "Inicializado repositorio Git") },
        { label: "Consultas el estado con git status", test: (code, result) => usa(code, /git\s+status/) && muestra(result, "En la rama main") },
        { label: "El estado muestra los dos archivos sin seguimiento", test: (code, result) => muestra(result, "index.html") && muestra(result, "estilos.css") && muestra(result, "Archivos sin seguimiento") }
      ]
    },
    {
      kicker: "Módulo 02 · Preparación",
      title: "Elige qué se va a guardar",
      shortTitle: "git add",
      duration: "12 min",
      difficulty: "Fundamentos",
      file: "Terminal · repositorio iniciado",
      intro: "Git guarda en dos pasos. Primero eliges qué entra en la próxima versión; recién después la confirmas.",
      example: "git add index.html",
      explanation: "El área de preparación (staging) es una lista de lo que entrará en el próximo commit. Sirve para separar un cambio importante de otros archivos que todavía no quieres publicar.",
      concepts: [
        "git add mueve un archivo del área de trabajo al área de preparación.",
        "Puedes agregar archivos uno por uno o todos con git add .",
        "Lo que no está preparado no entra en el commit."
      ],
      goal: "Prepara solo index.html y estilos.css. Deja fuera notas-personales.txt y comprueba el resultado con git status.",
      hints: [
        "Agrega los archivos uno por uno: git add index.html.",
        "Repite el comando con estilos.css.",
        "Termina con git status: los preparados aparecen en “Cambios a ser confirmados”."
      ],
      starter: "git status",
      success: "Ya controlas qué entra en cada versión y qué se queda fuera.",
      scenario: {
        initialized: true,
        branches: { main: null },
        files: {
          "index.html": { content: PAGINA },
          "estilos.css": { content: ESTILOS },
          "notas-personales.txt": { content: "ideas sueltas" }
        }
      },
      checks: [
        { label: "Usas git add", test: (code) => usa(code, /git\s+add\s+\S/) },
        { label: "index.html y estilos.css quedan preparados", test: (code, result) => result.state.files["index.html"].staged && result.state.files["estilos.css"].staged },
        { label: "notas-personales.txt queda fuera", test: (code, result) => result.state.files["notas-personales.txt"].staged === false }
      ]
    },
    {
      kicker: "Módulo 03 · Commit",
      title: "Guarda tu primera versión",
      shortTitle: "git commit",
      duration: "14 min",
      difficulty: "Fundamentos",
      file: "Terminal · repositorio iniciado",
      intro: "Un commit es una foto del proyecto con un mensaje que explica qué cambió y por qué.",
      example: 'git commit -m "Agrega la portada del portafolio"',
      explanation: "El commit toma lo que está preparado y lo guarda de forma permanente en el historial. El mensaje va entre comillas y debe describir el cambio, no el archivo.",
      concepts: [
        "Solo se guarda lo que está en el área de preparación.",
        "El mensaje es para tu yo del futuro: describe el cambio.",
        "Después del commit el árbol de trabajo queda limpio."
      ],
      goal: "Prepara los dos archivos, confirma con un mensaje de al menos 15 caracteres y comprueba que el árbol quede limpio.",
      hints: [
        "Puedes preparar todo de una vez con git add .",
        'Después escribe git commit -m "Agrega la portada del portafolio".',
        "Cierra con git status: debe decir que el árbol de trabajo está limpio."
      ],
      starter: "git add .",
      success: "Tu trabajo ya tiene una versión guardada a la que siempre podrás volver.",
      scenario: {
        initialized: true,
        branches: { main: null },
        files: { "index.html": { content: PAGINA }, "estilos.css": { content: ESTILOS } }
      },
      checks: [
        { label: "Creas un commit", test: (code, result) => result.state.commits.length === 1 },
        { label: "El mensaje describe el cambio (15 caracteres o más)", test: (code, result) => (result.state.commits[0]?.message || "").trim().length >= 15 },
        { label: "El árbol de trabajo queda limpio", test: (code, result) => muestra(result, "el árbol de trabajo está limpio") }
      ]
    },
    {
      kicker: "Módulo 04 · Historial",
      title: "Suma una versión y lee el historial",
      shortTitle: "git log",
      duration: "14 min",
      difficulty: "Práctica",
      file: "Terminal · repositorio con un commit",
      intro: "El valor de Git aparece con el segundo commit: ahí empieza a existir una historia que puedes recorrer.",
      example: "git log --oneline",
      explanation: "Cada commit apunta al anterior y forma una cadena. git log recorre esa cadena desde el más reciente; con --oneline la muestra en una línea por versión.",
      concepts: [
        "Acabas de editar estilos.css: Git lo detecta como modificado.",
        "El ciclo se repite siempre: add, commit.",
        "Cada commit tiene un identificador corto y único."
      ],
      goal: "Guarda el cambio pendiente de estilos.css en un commit nuevo y muestra el historial compacto con dos versiones.",
      hints: [
        "Empieza con git status para ver qué está modificado.",
        "Prepara y confirma: git add estilos.css y luego git commit con su mensaje.",
        "Termina con git log --oneline: deben aparecer dos líneas."
      ],
      starter: "git status",
      success: "Ya sabes leer la historia de un proyecto y agregarle capítulos.",
      scenario: {
        initialized: true,
        branches: { main: "a1b2c3d" },
        commits: [commit("a1b2c3d", "Agrega la portada del portafolio", null, { "index.html": PAGINA, "estilos.css": ESTILOS })],
        files: {
          "index.html": { content: PAGINA, committed: PAGINA },
          "estilos.css": { content: ESTILOS + "\nh1 { color: #1c69d4; }", committed: ESTILOS }
        }
      },
      checks: [
        { label: "El historial tiene dos commits", test: (code, result) => commitsDe(result, "main").length === 2 },
        { label: "Usas git log --oneline", test: (code, result) => usa(code, /git\s+log[^\n]*--oneline/) && muestra(result, "a1b2c3d") },
        { label: "No quedan cambios sin guardar", test: (code, result) => result.state.files["estilos.css"].committed === result.state.files["estilos.css"].content }
      ]
    },
    {
      kicker: "Módulo 05 · Deshacer",
      title: "Descarta un cambio que no querías",
      shortTitle: "git restore",
      duration: "14 min",
      difficulty: "Práctica",
      file: "Terminal · repositorio con historial",
      intro: "Tener versiones guardadas sirve justamente para esto: volver atrás sin miedo cuando algo salió mal.",
      example: "git restore index.html",
      explanation: "git diff muestra qué cambió respecto del último commit. git restore reemplaza el archivo del área de trabajo por la última versión guardada, así que el cambio no deseado desaparece.",
      concepts: [
        "git diff compara el archivo actual con el último commit.",
        "git restore descarta cambios locales: no se pueden recuperar.",
        "Solo funciona con archivos que ya tienen al menos un commit."
      ],
      goal: "Revisa qué cambió en index.html, descarta ese cambio y confirma con git status que el árbol quedó limpio.",
      hints: [
        "Primero mira la diferencia con git diff.",
        "Luego descarta el cambio con git restore index.html.",
        "Comprueba el resultado con git status."
      ],
      starter: "git diff",
      success: "Ya puedes experimentar tranquilo: siempre hay una versión guardada esperándote.",
      scenario: {
        initialized: true,
        branches: { main: "a1b2c3d" },
        commits: [commit("a1b2c3d", "Agrega la portada del portafolio", null, { "index.html": PAGINA, "estilos.css": ESTILOS })],
        files: {
          "index.html": { content: "<h1>asdfgh</h1>\n<p>borrador equivocado</p>", committed: PAGINA },
          "estilos.css": { content: ESTILOS, committed: ESTILOS }
        }
      },
      checks: [
        { label: "Revisas la diferencia con git diff", test: (code, result) => usa(code, /git\s+diff/) && muestra(result, "diff --git") },
        { label: "Descartas el cambio con git restore", test: (code) => usa(code, /git\s+restore\s+index\.html/) },
        { label: "index.html vuelve a su versión guardada", test: (code, result) => result.state.files["index.html"].content === PAGINA }
      ]
    },
    {
      kicker: "Módulo 06 · Preparación",
      title: "Saca algo del área de preparación",
      shortTitle: "restore --staged",
      duration: "14 min",
      difficulty: "Práctica",
      file: "Terminal · dos archivos preparados",
      intro: "Preparaste dos archivos, pero uno no debería entrar en este commit. Todavía estás a tiempo.",
      example: "git restore --staged borrador.txt",
      explanation: "Mientras no confirmes, el área de preparación se puede corregir. La opción --staged devuelve el archivo al área de trabajo sin perder lo que escribiste en él.",
      concepts: [
        "git restore --staged saca del área de preparación, no borra el archivo.",
        "Sin --staged, el comando descarta los cambios: son dos cosas distintas.",
        "Revisar con git status antes de confirmar evita commits desordenados."
      ],
      goal: "Saca borrador.txt del área de preparación y confirma solamente el cambio de index.html.",
      hints: [
        "Usa git restore --staged borrador.txt.",
        "Comprueba con git status que solo quede index.html preparado.",
        'Confirma con git commit -m "Actualiza el texto de la portada".'
      ],
      starter: "git status",
      success: "Cada commit puede contar una sola historia, y tú decides cuál.",
      scenario: {
        initialized: true,
        branches: { main: "a1b2c3d" },
        commits: [commit("a1b2c3d", "Agrega la portada del portafolio", null, { "index.html": PAGINA, "estilos.css": ESTILOS })],
        files: {
          "index.html": { content: PAGINA + "\n<p>Actualizado</p>", committed: PAGINA, staged: true, stagedContent: PAGINA + "\n<p>Actualizado</p>" },
          "estilos.css": { content: ESTILOS, committed: ESTILOS },
          "borrador.txt": { content: "ideas a medio escribir", staged: true, stagedContent: "ideas a medio escribir" }
        }
      },
      checks: [
        { label: "Usas git restore --staged", test: (code) => usa(code, /git\s+restore\s+--staged/) },
        { label: "borrador.txt sigue sin commit", test: (code, result) => result.state.files["borrador.txt"].committed === null || result.state.files["borrador.txt"].committed === undefined },
        { label: "El commit nuevo guarda el cambio de index.html", test: (code, result) => commitsDe(result, "main").length === 2 && result.state.files["index.html"].committed === PAGINA + "\n<p>Actualizado</p>" }
      ]
    },
    {
      kicker: "Módulo 07 · .gitignore",
      title: "Deja fuera lo que no se publica",
      shortTitle: ".gitignore",
      duration: "12 min",
      difficulty: "Práctica",
      file: "Terminal · repositorio con .gitignore",
      intro: "Hay archivos que nunca deben viajar al repositorio: claves, datos personales o carpetas generadas.",
      example: "*.env",
      explanation: "El archivo .gitignore lista patrones de archivos que Git debe ignorar. Ya está escrito con la regla *.env, así que claves.env no aparece en git status ni puede agregarse por descuido.",
      concepts: [
        ".gitignore es un archivo más: hay que versionarlo.",
        "Un patrón como *.env cubre todos los archivos con esa extensión.",
        "Lo ignorado no se sube nunca, ni siquiera con git add ."
      ],
      goal: "Comprueba con git status que claves.env no aparece, agrega .gitignore junto con index.html y confírmalos.",
      hints: [
        "Ejecuta git status: solo deberían aparecer .gitignore e index.html.",
        "Puedes agregar todo lo visible con git add .",
        'Confirma con git commit -m "Ignora los archivos con claves".'
      ],
      starter: "git status",
      success: "Tus claves se quedan en tu computador, donde corresponde.",
      scenario: {
        initialized: true,
        branches: { main: "a1b2c3d" },
        ignored: ["*.env"],
        commits: [commit("a1b2c3d", "Agrega la portada del portafolio", null, { "index.html": PAGINA })],
        files: {
          "index.html": { content: PAGINA + "\n<p>Contacto</p>", committed: PAGINA },
          ".gitignore": { content: "*.env" },
          "claves.env": { content: "TOKEN=secreto" }
        }
      },
      checks: [
        { label: "git status no muestra claves.env", test: (code, result) => usa(code, /git\s+status/) && !muestra(result, "claves.env") },
        { label: "Versionas el archivo .gitignore", test: (code, result) => result.state.files[".gitignore"].committed === "*.env" },
        { label: "claves.env nunca entra al repositorio", test: (code, result) => !result.state.commits.some((item) => Object.keys(item.files).includes("claves.env")) }
      ]
    },
    {
      kicker: "Módulo 08 · Lectura",
      title: "Lee la historia del proyecto",
      shortTitle: "Historial",
      duration: "12 min",
      difficulty: "Práctica",
      file: "Terminal · repositorio con tres commits",
      intro: "Un repositorio con historia responde preguntas: qué se hizo, en qué orden y con qué identificador.",
      example: "git log --oneline",
      explanation: "Cada línea de git log --oneline muestra el identificador corto y el mensaje. HEAD -> main señala en qué commit y en qué rama estás parado ahora mismo.",
      concepts: [
        "El commit más reciente aparece primero.",
        "El identificador corto basta para referirse a una versión.",
        "HEAD indica dónde estás parado en la historia."
      ],
      goal: "Muestra el historial compacto de los tres commits y confirma con git status que no hay cambios pendientes.",
      hints: [
        "Usa git log --oneline para verlos en una línea cada uno.",
        "Fíjate en cuál lleva la marca HEAD -> main.",
        "Cierra con git status para comprobar que el árbol está limpio."
      ],
      starter: "git log",
      success: "Ya puedes orientarte dentro de la historia de cualquier repositorio.",
      scenario: {
        initialized: true,
        branches: { main: "c3d4e5f" },
        commits: [
          commit("a1b2c3d", "Agrega la portada del portafolio", null, { "index.html": PAGINA }),
          commit("b2c3d4e", "Agrega los estilos base", "a1b2c3d", { "index.html": PAGINA, "estilos.css": ESTILOS }),
          commit("c3d4e5f", "Corrige el color del título", "b2c3d4e", { "index.html": PAGINA, "estilos.css": ESTILOS + "\nh1 { color: #1c69d4; }" })
        ],
        files: {
          "index.html": { content: PAGINA, committed: PAGINA },
          "estilos.css": { content: ESTILOS + "\nh1 { color: #1c69d4; }", committed: ESTILOS + "\nh1 { color: #1c69d4; }" }
        }
      },
      checks: [
        { label: "Usas git log --oneline", test: (code) => usa(code, /git\s+log[^\n]*--oneline/) },
        { label: "Aparecen los tres commits", test: (code, result) => muestra(result, "a1b2c3d") && muestra(result, "b2c3d4e") && muestra(result, "c3d4e5f") },
        { label: "Confirmas que no hay cambios pendientes", test: (code, result) => usa(code, /git\s+status/) && muestra(result, "el árbol de trabajo está limpio") }
      ]
    },
    {
      kicker: "Módulo 09 · Ramas",
      title: "Abre una rama para probar",
      shortTitle: "Crear rama",
      duration: "14 min",
      difficulty: "Ramas",
      file: "Terminal · repositorio con historial",
      intro: "Una rama es una línea de trabajo paralela: puedes experimentar sin tocar la versión que ya funciona.",
      example: "git switch -c nueva-portada",
      explanation: "La rama parte desde el commit actual y avanza por su cuenta. main se queda intacta hasta que decidas unir el trabajo.",
      concepts: [
        "git switch -c crea la rama y te cambia a ella en un paso.",
        "git branch lista las ramas y marca con * la actual.",
        "Crear una rama no copia archivos: solo mueve un puntero."
      ],
      goal: "Crea la rama nueva-portada, cámbiate a ella y comprueba con git branch que quedaste parado ahí.",
      hints: [
        "Usa git switch -c nueva-portada.",
        "Luego ejecuta git branch.",
        "El asterisco debe quedar delante de nueva-portada."
      ],
      starter: "git branch",
      success: "Ya puedes probar ideas sin arriesgar lo que funciona.",
      scenario: {
        initialized: true,
        branches: { main: "a1b2c3d" },
        commits: [commit("a1b2c3d", "Agrega la portada del portafolio", null, { "index.html": PAGINA, "estilos.css": ESTILOS })],
        files: {
          "index.html": { content: PAGINA, committed: PAGINA },
          "estilos.css": { content: ESTILOS, committed: ESTILOS }
        }
      },
      checks: [
        { label: "Creas la rama nueva-portada", test: (code, result) => result.state.branches["nueva-portada"] !== undefined },
        { label: "Quedas parado en esa rama", test: (code, result) => result.state.head === "nueva-portada" },
        { label: "Lo compruebas con git branch", test: (code, result) => usa(code, /git\s+branch/) && muestra(result, "* nueva-portada") }
      ]
    },
    {
      kicker: "Módulo 10 · Ramas",
      title: "Trabaja dentro de la rama",
      shortTitle: "Commit en rama",
      duration: "14 min",
      difficulty: "Ramas",
      file: "Terminal · rama nueva-portada",
      intro: "Ya estás en la rama y editaste la portada. Ese commit se guardará solo en esta línea de trabajo.",
      example: "git commit -m \"Rediseña la portada\"",
      explanation: "Los commits que haces en una rama no aparecen en main hasta que las unas. Por eso puedes cambiar de rama y ver el proyecto como estaba antes.",
      concepts: [
        "El ciclo add + commit es igual en cualquier rama.",
        "git switch main te devuelve a la versión anterior del proyecto.",
        "Cada rama recuerda su propio último commit."
      ],
      goal: "Guarda el cambio de index.html en la rama nueva-portada y después vuelve a main.",
      hints: [
        "Prepara y confirma el cambio como siempre.",
        "Después ejecuta git switch main.",
        "Puedes verificar con git log --oneline en cada rama."
      ],
      starter: "git status",
      success: "Tu experimento vive en su propia rama, sin tocar main.",
      scenario: {
        initialized: true,
        head: "nueva-portada",
        branches: { main: "a1b2c3d", "nueva-portada": "a1b2c3d" },
        commits: [commit("a1b2c3d", "Agrega la portada del portafolio", null, { "index.html": PAGINA, "estilos.css": ESTILOS })],
        files: {
          "index.html": { content: "<h1>Hola, soy Pablo</h1>\n<p>Portafolio de proyectos.</p>", committed: PAGINA },
          "estilos.css": { content: ESTILOS, committed: ESTILOS }
        }
      },
      checks: [
        { label: "La rama nueva-portada suma un commit", test: (code, result) => commitsDe(result, "nueva-portada").length === 2 },
        { label: "main sigue con su commit original", test: (code, result) => result.state.branches.main === "a1b2c3d" },
        { label: "Vuelves a main con git switch", test: (code, result) => usa(code, /git\s+switch\s+main/) && result.state.head === "main" }
      ]
    },
    {
      kicker: "Módulo 11 · Unir",
      title: "Une la rama con main",
      shortTitle: "git merge",
      duration: "14 min",
      difficulty: "Ramas",
      file: "Terminal · parado en main",
      intro: "El experimento funcionó. Es hora de incorporarlo a la línea principal del proyecto.",
      example: "git merge nueva-portada",
      explanation: "Estando en la rama que recibe, git merge trae los commits de la otra. Cuando main no avanzó por su cuenta, Git solo adelanta el puntero: eso es un fast-forward.",
      concepts: [
        "Primero te cambias a la rama que recibirá los cambios.",
        "git merge trae el trabajo de la rama indicada.",
        "Fast-forward significa que no hizo falta un commit de unión."
      ],
      goal: "Estando en main, une la rama nueva-portada y comprueba en el historial que su commit ya forma parte de main.",
      hints: [
        "Comprueba con git branch que estás en main.",
        "Ejecuta git merge nueva-portada.",
        "Revisa el resultado con git log --oneline."
      ],
      starter: "git branch",
      success: "Sabes abrir una línea de trabajo, avanzar en ella y devolverla al proyecto.",
      scenario: {
        initialized: true,
        head: "main",
        branches: { main: "a1b2c3d", "nueva-portada": "d4e5f6a" },
        commits: [
          commit("a1b2c3d", "Agrega la portada del portafolio", null, { "index.html": PAGINA, "estilos.css": ESTILOS }),
          { id: "d4e5f6a", message: "Rediseña la portada", parent: "a1b2c3d", branch: "nueva-portada", merge: false, files: { "index.html": "<h1>Hola, soy Pablo</h1>", "estilos.css": ESTILOS } }
        ],
        files: {
          "index.html": { content: PAGINA, committed: PAGINA },
          "estilos.css": { content: ESTILOS, committed: ESTILOS }
        }
      },
      checks: [
        { label: "Ejecutas git merge nueva-portada", test: (code) => usa(code, /git\s+merge\s+nueva-portada/) },
        { label: "main queda con el commit de la rama", test: (code, result) => result.state.branches.main === "d4e5f6a" },
        { label: "El historial de main incluye “Rediseña la portada”", test: (code, result) => commitsDe(result, "main").some((item) => item.message === "Rediseña la portada") }
      ]
    },
    {
      kicker: "Módulo 12 · Proyecto final",
      title: "Publica el proyecto en GitHub",
      shortTitle: "Proyecto final",
      duration: "18 min",
      difficulty: "Proyecto",
      file: "Terminal · repositorio listo para publicar",
      intro: "GitHub es una copia de tu repositorio en internet. Conectarlo tiene dos pasos: indicar la dirección y enviar los commits.",
      example: "git remote add origin https://github.com/tu-usuario/mi-portafolio.git",
      explanation: "El remoto es un apodo para una dirección; por convención se llama origin. git push envía los commits de tu rama y, con -u, deja recordada la relación para las próximas veces.",
      concepts: [
        "git remote add conecta el repositorio local con GitHub.",
        "git push envía los commits que el remoto todavía no tiene.",
        "La opción -u guarda el enlace entre tu rama y la del remoto."
      ],
      goal: "Conecta el remoto origin con https://github.com/tu-usuario/mi-portafolio.git, publica main con -u y comprueba la conexión con git remote -v.",
      hints: [
        "Primero git remote add origin <url>.",
        "Después git push -u origin main.",
        "Cierra con git remote -v para ver la dirección configurada."
      ],
      starter: "git log --oneline",
      success: "Terminaste la ruta: tu proyecto tiene historia local y una copia publicada.",
      scenario: {
        initialized: true,
        branches: { main: "b2c3d4e" },
        commits: [
          commit("a1b2c3d", "Agrega la portada del portafolio", null, { "index.html": PAGINA }),
          commit("b2c3d4e", "Agrega los estilos base", "a1b2c3d", { "index.html": PAGINA, "estilos.css": ESTILOS })
        ],
        files: {
          "index.html": { content: PAGINA, committed: PAGINA },
          "estilos.css": { content: ESTILOS, committed: ESTILOS }
        }
      },
      checks: [
        { label: "Conectas el remoto origin con la dirección de GitHub", test: (code, result) => (result.state.remotes.origin || "").includes("github.com/tu-usuario/mi-portafolio") },
        { label: "Publicas main con git push -u", test: (code, result) => usa(code, /git\s+push[^\n]*-u/) && result.state.pushed.origin?.main === result.state.branches.main },
        { label: "Compruebas la conexión con git remote -v", test: (code, result) => usa(code, /git\s+remote\s+-v/) && muestra(result, "(push)") }
      ]
    }
  ];

  globalThis.GitCourse = {
    name: "Git y GitHub",
    storageKey: "codigo-cero.git-v2.completed",
    examsKey: "codigo-cero.git-v2.exams",
    kind: "git",
    stages: ["Guardar tu trabajo", "Corregir con confianza", "Ramas y GitHub"],
    levels: [
      { title: "El ciclo básico", description: "Repositorio, preparación, commits e historial", modules: lessons.slice(0, 4) },
      { title: "Las correcciones", description: "Deshacer, ignorar y leer la historia", modules: lessons.slice(4, 8) },
      { title: "El trabajo en paralelo", description: "Ramas, unión y publicación en GitHub", modules: lessons.slice(8, 12) }
    ],
    lessons
  };
})();

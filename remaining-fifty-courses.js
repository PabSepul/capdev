/*
  Niveles 4–13 de las trece rutas que partían con doce módulos.
  Los módulos publicados se conservan intactos. Cada práctica nueva se ejecuta
  en el laboratorio real de su ruta y compara el resultado con una referencia.
*/
(() => {
  "use strict";

  const ROUTES = {
    terminal: { course: "TerminalCourse", name: "Terminal", file: "terminal · carpeta virtual",
      purpose: "automatizar tareas con archivos sin perder de vista la carpeta y el resultado",
      themes: ["Comandos encadenados", "Rutas fiables", "Transformar texto", "Archivos de trabajo", "Comprobaciones seguras", "Procesos repetibles", "Diagnóstico del entorno", "Pequeñas automatizaciones", "Flujos de equipo", "Proyecto de terminal"] },
    regex: { course: "RegexCourse", name: "Expresiones regulares", file: "patron.regex",
      purpose: "describir y comprobar formatos de texto con patrones que otra persona pueda leer",
      themes: ["Límites y alternativas", "Cantidades precisas", "Grupos con nombre", "Validación por líneas", "Búsquedas resistentes", "Reemplazos controlados", "Datos semiestructurados", "Patrones mantenibles", "Casos reales", "Proyecto de limpieza"] },
    ia: { course: "IaCourse", name: "Inteligencia artificial", file: "experimento.ia",
      purpose: "medir, recuperar y evaluar información sin confundir una simulación con un modelo real",
      themes: ["Prompts verificables", "Presupuesto de tokens", "Recuperación de contexto", "Comparación semántica", "Temperatura y variedad", "Citas y evidencia", "Evaluación de resultados", "Riesgos y límites", "Diseño de asistentes", "Proyecto responsable"] },
    "datos-python": { course: "DatosPythonCourse", name: "Datos con Python", file: "analisis.py",
      purpose: "convertir registros pequeños en respuestas reproducibles y fáciles de revisar",
      themes: ["Limpieza de registros", "Selección de filas", "Transformaciones", "Agrupaciones manuales", "Indicadores", "Orden y ranking", "Calidad de datos", "Reportes reutilizables", "Flujos de análisis", "Proyecto de datos"] },
    nodejs: { course: "NodeCourse", name: "Node.js", file: "app.cjs",
      purpose: "crear programas de servidor pequeños con entradas, archivos y salidas explícitas",
      themes: ["Configuración de procesos", "Archivos estructurados", "Módulos reutilizables", "Validación de entradas", "Respuestas HTTP", "Errores operativos", "Registro de actividad", "Servicios mantenibles", "Integración del backend", "Proyecto Node.js"] },
    typescript: { course: "TypeScriptCourse", name: "TypeScript", file: "app.ts",
      purpose: "expresar contratos que detecten inconsistencias antes de ejecutar el programa",
      themes: ["Modelos de dominio", "Funciones tipadas", "Uniones discriminadas", "Propiedades opcionales", "Composición de tipos", "Genéricos prácticos", "Narrowing", "Contratos de módulos", "Diseño mantenible", "Proyecto tipado"] },
    react: { course: "ReactCourse", name: "React", file: "App.jsx",
      purpose: "construir interfaces mediante componentes pequeños, datos explícitos y estados previsibles",
      themes: ["Composición de componentes", "Props consistentes", "Listas con identidad", "Estados de interfaz", "Eventos", "Formularios controlados", "Carga y error", "Componentes reutilizables", "Pantallas completas", "Proyecto React"] },
    json: { course: "JsonCourse", name: "JSON", file: "datos.json",
      purpose: "diseñar documentos interoperables cuyo significado y estructura sean claros",
      themes: ["Colecciones de objetos", "Estructuras anidadas", "Valores opcionales", "Identificadores estables", "Contratos de datos", "Versionado", "Configuración", "Intercambio entre servicios", "Documentos robustos", "Proyecto JSON"] },
    markdown: { course: "MarkdownCourse", name: "Markdown", file: "documento.md",
      purpose: "escribir documentación que se pueda recorrer, copiar y mantener con facilidad",
      themes: ["Jerarquía editorial", "Guías paso a paso", "Referencias y enlaces", "Código explicado", "Tablas útiles", "Decisiones técnicas", "Documentación de API", "Manuales de equipo", "Publicación mantenible", "Proyecto documental"] },
    accesibilidad: { course: "AccessibilityCourse", name: "Accesibilidad web", file: "pagina.html",
      purpose: "eliminar barreras con estructura, nombres, estados y controles que no dependan de la vista",
      themes: ["Regiones y navegación", "Nombres accesibles", "Formularios comprensibles", "Mensajes de estado", "Tablas y relaciones", "Teclado y foco", "Contenido adaptable", "Revisión sistemática", "Patrones inclusivos", "Proyecto accesible"] },
    testing: { course: "TestingCourse", name: "Pruebas automatizadas", file: "prueba.test.js",
      purpose: "convertir requisitos en ejemplos que detecten regresiones concretas",
      themes: ["Casos representativos", "Límites", "Colecciones", "Errores esperados", "Invariantes", "Pruebas de regresión", "Diseño comprobable", "Cobertura útil", "Suites mantenibles", "Proyecto de calidad"] },
    docker: { course: "DockerCourse", name: "Docker", file: "Dockerfile · comandos",
      purpose: "describir aplicaciones reproducibles sin ocultar imágenes, procesos, redes y datos",
      themes: ["Imágenes verificables", "Contenedores configurables", "Capas de construcción", "Contextos pequeños", "Persistencia", "Redes de servicios", "Compose", "Seguridad de ejecución", "Entrega reproducible", "Proyecto contenedorizado"] },
    mongodb: { course: "MongoCourse", name: "MongoDB", file: "mongosh.js",
      purpose: "consultar y modificar documentos con filtros precisos y resultados comprobables",
      themes: ["Filtros compuestos", "Proyecciones mentales", "Orden y límites", "Conteos", "Valores distintos", "Altas controladas", "Actualizaciones precisas", "Borrados seguros", "Flujos documentales", "Proyecto MongoDB"] }
  };

  const contexts = [
    "organizar una salida de estudio", "preparar una inscripción", "ordenar un catálogo",
    "revisar un avance de aprendizaje"
  ];
  const actions = ["Explora", "Aplica", "Comprueba", "Integra"];

  const normalize = value => String(value || "").replace(/\r/g, "").trim();
  function stable(value, seen = new WeakSet()) {
    if (value === null || typeof value !== "object") return value;
    if (seen.has(value)) return "[circular]";
    seen.add(value);
    if (value instanceof Set) return [...value].map(item => stable(item, seen));
    if (value instanceof Map) return [...value.entries()].map(item => stable(item, seen));
    if (Array.isArray(value)) return value.map(item => stable(item, seen));
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key], seen)]));
  }
  const fingerprint = result => JSON.stringify(stable(result));

  function terminalPractice(n) {
    const name = `practica-${n}.txt`;
    const variants = [
      ["pwd\nls", "pwd"],
      ["cat docs/notas.txt", "cat README.md"],
      ['grep "Pendiente" docs/notas.txt', 'grep "Hecho" docs/notas.txt'],
      ["cat datos/cursos.txt | wc -l", "cat datos/cursos.txt"],
      ["head -n 2 datos/cursos.txt", "head -n 1 datos/cursos.txt"],
      [`echo "Módulo ${n}" > ${name}\ncat ${name}`, `echo "Inicio" > ${name}\ncat ${name}`],
      [`mkdir -p practica/${n}\ntouch practica/${n}/${name}\nls practica/${n}`, `mkdir -p practica/${n}\nls practica/${n}`],
      [`cp README.md copia-${n}.md\ncat copia-${n}.md`, "cat README.md"],
      [`echo "Uno" > ${name}\necho "Dos" >> ${name}\ncat ${name}`, `echo "Uno" > ${name}\ncat ${name}`],
      ["ls docs", "ls"]
    ];
    const [solution, starter] = variants[(n - 13) % variants.length];
    return { solution, starter, scenario: globalThis.TerminalLab.initial() };
  }

  function regexPractice(n) {
    const variants = [
      { text: "Python y SQL preparan la salida. python también cuenta.", solution: "/\\b(?:Python|SQL)\\b/gi", starter: "/Python/g" },
      { text: "Grupos de 12, 8 y 24 personas; 103 queda fuera.", solution: "/\\b\\d{1,2}\\b/g", starter: "/\\d+/g" },
      { text: "Ana 12\nBeto 8\nregistro incompleto", solution: "/^(?<nombre>[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)\\s(?<horas>\\d+)$/gm", starter: "/^[A-Z].+$/gm" },
      { text: "2026-09-19\n19/09/2026\n2026-12-03", solution: "/^\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])$/gm", starter: "/\\d{4}-\\d{2}-\\d{2}/g" },
      { text: "ana@ejemplo.cl; correo-invalido; equipo@capsulasdev.com", solution: "/[\\w.-]+@[\\w.-]+\\.[a-z]{2,}/gi", starter: "/@/g" },
      { text: "Nivel: inicial\nNivel: avanzado\nNivel: pendiente", solution: "/^Nivel: (?:inicial|avanzado)$/gm", starter: "/Nivel:/g" },
      { text: "curso   Python\ncurso SQL", solution: "/curso\\s+(Python|SQL)/g", starter: "/curso /g" },
      { text: "Python, SQL, Git", solution: "/(Python), (SQL), (Git)/g\nreemplazo: $3 · $2 · $1", starter: "/Python/g" }
    ];
    const item = variants[(n - 13) % variants.length];
    return { solution: item.solution, starter: item.starter, scenario: { texto: item.text } };
  }

  function iaPractice(n) {
    const variants = [
      [`tokenizar Planifica una salida de estudio para ${n} personas`, "tokenizar Hola"],
      [`costo ${800 + n * 10} rapido`, "costo 100 rapido"],
      ["buscar cómo obtengo un certificado al terminar los módulos", "buscar curso"],
      ["comparar cambiar mi plan | modificar mi suscripción", "comparar curso | salida"],
      [`temperatura ${n % 2 ? "0.4" : "1.1"}`, "temperatura 0.8"]
    ];
    const [solution, starter] = variants[(n - 13) % variants.length];
    return { solution, starter };
  }

  function pythonPractice(n) {
    const value = (n % 7) + 2;
    const variants = [
      [`valores = [${value}, ${value + 2}, ${value + 4}]\nprint(sum(valores))`, `valores = [${value}]\nprint(sum(valores))`],
      [`nombres = ["Ana", "Beto", "Carla"]\nfor nombre in nombres:\n    print(nombre)`, `nombres = ["Ana"]\nfor nombre in nombres:\n    print(nombre)`],
      [`registro = {"curso": "Python", "horas": ${value}}\nprint(registro["curso"], registro["horas"])`, `registro = {"curso": "Python", "horas": 0}\nprint(registro["curso"], registro["horas"])`],
      [`def total(a, b):\n    return a + b\n\nprint(total(${value}, ${value + 1}))`, `def total(a, b):\n    return a + b\n\nprint(total(0, 0))`],
      [`datos = [${value}, ${value + 1}, ${value + 2}, ${value + 3}]\npares = [dato for dato in datos if dato % 2 == 0]\nprint(pares)`, `datos = [${value}]\nprint(datos)`]
    ];
    const [solution, starter] = variants[(n - 13) % variants.length];
    return { solution, starter };
  }

  function nodePractice(n) {
    const value = (n % 6) + 2;
    const variants = [
      [`const minutos = ${value * 30};\nconsole.log(minutos / 60);`, "const minutos = 0;\nconsole.log(minutos / 60);"],
      [`const cursos = ["Python", "SQL", "Git"];\nconsole.log(cursos.length, cursos[${value % 3}]);`, 'const cursos = ["Python"];\nconsole.log(cursos.length);'],
      [`function resumen(nombre, horas) { return nombre + ": " + horas; }\nconsole.log(resumen("Node.js", ${value}));`, 'function resumen(nombre) { return nombre; }\nconsole.log(resumen("Node.js"));'],
      [`const fs = require("node:fs");\nfs.writeFileSync("reporte.txt", "módulo ${n}");\nconsole.log(fs.readFileSync("reporte.txt", "utf8"));`, 'console.log("sin reporte");'],
      [`const ruta = require("node:path");\nconsole.log(ruta.join("datos", "modulo-${n}.json"));`, 'console.log("datos");']
    ];
    const [solution, starter] = variants[(n - 13) % variants.length];
    return { solution, starter };
  }

  function typeScriptPractice(n) {
    const value = (n % 8) + 2;
    const variants = [
      [`type Curso = { nombre: string; horas: number };\nconst curso: Curso = { nombre: "TypeScript", horas: ${value} };\nconsole.log(curso.nombre, curso.horas);`, 'type Curso = { nombre: string; horas: number };\nconst curso: Curso = { nombre: "TypeScript", horas: 0 };\nconsole.log(curso.nombre, curso.horas);'],
      [`function duplicar(valor: number): number { return valor * 2; }\nconsole.log(duplicar(${value}));`, "function duplicar(valor: number): number { return valor * 2; }\nconsole.log(duplicar(0));"],
      [`type Estado = "pendiente" | "completo";\nconst estado: Estado = "completo";\nconsole.log(estado);`, 'type Estado = "pendiente" | "completo";\nconst estado: Estado = "pendiente";\nconsole.log(estado);'],
      [`interface Perfil { nombre: string; ciudad?: string; }\nconst perfil: Perfil = { nombre: "Ada", ciudad: "Santiago" };\nconsole.log(perfil.nombre, perfil.ciudad);`, 'interface Perfil { nombre: string; ciudad?: string; }\nconst perfil: Perfil = { nombre: "Ada" };\nconsole.log(perfil.nombre);']
    ];
    const [solution, starter] = variants[(n - 13) % variants.length];
    return { solution, starter };
  }

  function reactPractice(n) {
    const variants = [
      [`function Panel() { return <section><h2>Módulo ${n}</h2><p>Aprendizaje activo</p></section>; }\nrender(Panel);`, 'function Panel() { return <section><h2>Inicio</h2></section>; }\nrender(Panel);'],
      [`function Curso(props) { return <article><h2>{props.nombre}</h2><p>{props.horas} horas</p></article>; }\nrender(Curso, { nombre: "React", horas: ${n % 10 + 4} });`, 'function Curso(props) { return <article><h2>{props.nombre}</h2></article>; }\nrender(Curso, { nombre: "React" });'],
      [`function Lista(props) { return <ul>{props.items.map(function (item) { return <li key={item.id}>{item.nombre}</li>; })}</ul>; }\nrender(Lista, { items: [{ id: 1, nombre: "Python" }, { id: 2, nombre: "React" }] });`, 'function Lista() { return <ul><li>Python</li></ul>; }\nrender(Lista);'],
      [`function Estado(props) { if (props.cargando) return <p>Cargando…</p>; return <p>Contenido listo</p>; }\nrender(Estado, { cargando: false });`, 'function Estado() { return <p>Cargando…</p>; }\nrender(Estado);']
    ];
    const [solution, starter] = variants[(n - 13) % variants.length];
    return { solution, starter };
  }

  function jsonPractice(n) {
    const variants = [
      [{ modulo: n, curso: "JSON", activo: true }, { modulo: 0, curso: "JSON" }],
      [{ salida: { ciudad: "Santiago", fecha: "2026-09-19" }, asistentes: ["Ana", "Beto"] }, { salida: {}, asistentes: [] }],
      [[{ id: 1, nombre: "Python" }, { id: 2, nombre: "SQL" }], [{ id: 1 }]],
      [{ version: 2, preferencias: { tema: "oscuro", avisos: false }, etiquetas: ["web", "datos"] }, { version: 1 }]
    ];
    const [solutionValue, starterValue] = variants[(n - 13) % variants.length];
    return { solution: JSON.stringify(solutionValue, null, 2), starter: JSON.stringify(starterValue, null, 2) };
  }

  function markdownPractice(n) {
    const variants = [
      [`# Plan del módulo ${n}\n\n## Objetivo\n\nPracticar con una meta clara.\n\n## Pasos\n\n1. Leer\n2. Probar\n3. Revisar`, `# Plan\n\nTexto pendiente.`],
      [`# Guía breve\n\n- [x] Preparar\n- [ ] Practicar\n\n> Revisa el resultado antes de continuar.`, "# Guía breve\n\n- Preparar"],
      [`# Comando verificable\n\nUsa \`node app.cjs\` y revisa la salida.\n\n\`\`\`js\nconsole.log(\"módulo ${n}\");\n\`\`\``, "# Comando\n\nFalta el ejemplo."],
      [`# Comparación\n\n| Opción | Uso |\n| --- | --- |\n| A | Aprender |\n| B | Practicar |\n\n[Ver CápsulasDev](https://capsulasdev.com)`, "# Comparación\n\nA y B"]
    ];
    const [solution, starter] = variants[(n - 13) % variants.length];
    return { solution, starter };
  }

  function accessibilityPractice(n) {
    const variants = [
      ['<a href="#contenido">Saltar al contenido</a><nav aria-label="Principal"><a href="#curso">Ir al curso</a></nav><main id="contenido"><h1>Ruta accesible</h1><h2 id="curso">Curso</h2><p>Contenido del módulo.</p></main>', '<div><h3>Ruta</h3><p>Contenido</p></div>'],
      ['<form><label for="correo">Correo</label><input id="correo" name="correo" type="email" required><button type="submit">Inscribirme</button></form>', '<form><input id="correo"><div>Enviar</div></form>'],
      ['<main><h1>Resultado</h1><p id="ayuda">Escribe un correo válido.</p><label for="dato">Correo</label><input id="dato" aria-invalid="true" aria-describedby="ayuda"><p role="status">Revisa el campo.</p></main>', '<p>Resultado pendiente</p>'],
      ['<table><caption>Plan de estudio</caption><thead><tr><th scope="col">Curso</th><th scope="col">Horas</th></tr></thead><tbody><tr><td>Python</td><td>12</td></tr></tbody></table>', '<div>Python 12</div>']
    ];
    const [solution, starter] = variants[(n - 13) % variants.length];
    return { solution, starter, scenario: {} };
  }

  function testingPractice(n) {
    const delta = (n % 5) + 1;
    const scenario = {
      reference: `function ajustar(valor) { return valor + ${delta}; }`,
      mutants: [
        { name: "resta en vez de sumar", code: `function ajustar(valor) { return valor - ${delta}; }` },
        { name: "ignora la entrada", code: `function ajustar(valor) { return ${delta}; }` }
      ]
    };
    return {
      solution: `test("ajusta un valor", function () { equal(ajustar(3), ${3 + delta}); });\ntest("conserva la relación", function () { equal(ajustar(8), ${8 + delta}); });`,
      starter: `test("caso pendiente", function () { equal(ajustar(3), 3); });`, scenario
    };
  }

  function dockerPractice(n) {
    const variants = [
      { solution: `docker pull nginx:1.${20 + n % 8}`, starter: "docker pull nginx:latest", scenario: {} },
      { solution: `docker run -d --name web-${n} -p ${8000 + n}:80 nginx:alpine`, starter: "docker run nginx:alpine", scenario: {} },
      { solution: 'FROM node:22-alpine\nWORKDIR /app\nCOPY package.json .\nRUN npm ci --omit=dev\nCOPY . .\nCMD ["node", "app.js"]', starter: 'FROM node:22-alpine\nCOPY . .\nCMD ["node", "app.js"]', scenario: { mode: "dockerfile" } },
      { solution: `services:\n  web-${n}:\n    image: nginx:alpine\n    ports:\n      - "${8000 + n}:80"`, starter: `services:\n  web-${n}:\n    image: nginx:alpine`, scenario: { mode: "compose" } },
      { solution: `docker volume create datos-${n}\ndocker network create red-${n}`, starter: `docker volume create datos-${n}`, scenario: {} }
    ];
    return variants[(n - 13) % variants.length];
  }

  function mongoPractice(n) {
    const variants = [
      ['db.cursos.find({"nivel":"Inicial"}).sort({"horas":1}).limit(2)', 'db.cursos.find({"nivel":"Inicial"})'],
      ['db.cursos.find({"horas":{"$gte":9}}).sort({"horas":-1})', 'db.cursos.find({"horas":{"$gte":9}})'],
      ['db.cursos.countDocuments({"nivel":"Siguiente"})', 'db.cursos.countDocuments({})'],
      ['db.cursos.distinct("nivel")', 'db.cursos.distinct("nombre")'],
      [`db.cursos.insertOne({"_id":${100 + n},"nombre":"Curso ${n}","nivel":"Inicial","horas":6,"etiquetas":["práctica"]})`, 'db.cursos.find({})'],
      ['db.cursos.updateOne({"_id":3},{"$set":{"horas":12}})', 'db.cursos.findOne({"_id":3})'],
      ['db.cursos.deleteOne({"_id":4})', 'db.cursos.findOne({"_id":4})']
    ];
    const [solution, starter] = variants[(n - 13) % variants.length];
    return { solution, starter };
  }

  const builders = {
    terminal: terminalPractice, regex: regexPractice, ia: iaPractice,
    "datos-python": pythonPractice, nodejs: nodePractice, typescript: typeScriptPractice,
    react: reactPractice, json: jsonPractice, markdown: markdownPractice,
    accesibilidad: accessibilityPractice, testing: testingPractice,
    docker: dockerPractice, mongodb: mongoPractice
  };
  const runners = {
    terminal: (code, scenario) => globalThis.TerminalLab.run(code, scenario),
    regex: (code, scenario) => globalThis.RegexLab.run(code, scenario),
    ia: code => globalThis.IaLab.run(code),
    "datos-python": code => globalThis.PythonRuntime.run(code),
    nodejs: (code, scenario) => globalThis.NodeLab.run(code, scenario),
    typescript: code => globalThis.TsLab.run(code),
    react: (code, scenario) => globalThis.ReactLab.run(code, scenario),
    json: (code, scenario) => globalThis.JsonLab.run(code, scenario),
    markdown: code => globalThis.MarkdownLab.run(code),
    accesibilidad: (code, scenario) => globalThis.AccessibilityLab.run(code, scenario),
    testing: (code, scenario) => globalThis.TestingLab.run(code, scenario),
    docker: (code, scenario) => globalThis.DockerLab.run(code, scenario),
    mongodb: code => globalThis.MongoLab.run(code)
  };

  function questionsFor(id, config, level, modules, levelNumber) {
    const questions = modules.map((module, index) => {
      const answer = (levelNumber + index) % 4;
      const options = [
        `Ejecutar y comprobar ${module.shortTitle.toLowerCase()}`,
        "Cambiar datos sin volver a ejecutar",
        "Dar por correcto cualquier resultado sin revisarlo",
        "Modificar el equipo real desde el simulador"
      ];
      const correct = options.shift();
      options.splice(answer, 0, correct);
      return { question: `¿Qué acción demuestra mejor lo aprendido en «${module.shortTitle}»?`, options, answer,
        explanation: `La práctica pide ejecutar ${module.shortTitle.toLowerCase()} y comparar el resultado con la misión.` };
    });
    const answer = levelNumber % 4;
    const options = [
      `Porque ayuda a ${config.purpose}.`,
      "Porque evita leer la salida del laboratorio.",
      "Porque reemplaza las pruebas con una suposición.",
      "Porque el simulador modifica servicios externos."
    ];
    const correct = options.shift();
    options.splice(answer, 0, correct);
    questions.push({ question: `¿Para qué sirve el nivel «${level}» dentro de ${config.name}?`, options, answer,
      explanation: `Este nivel conecta sus cuatro prácticas para ${config.purpose}.` });
    return { levelId: levelNumber, title: `Mini examen: ${level}`, passing: 4,
      intro: "Responde cinco preguntas. Apruebas con cuatro aciertos y puedes volver a intentarlo.", questions };
  }

  function extend(id, config) {
    const course = globalThis[config.course];
    if (!course || course.lessons.length >= 50) return;
    const additions = [];
    const runner = runners[id];
    let number = 13;
    config.themes.forEach((theme, addedLevelIndex) => {
      const count = addedLevelIndex === 9 ? 2 : 4;
      const levelModules = [];
      for (let slot = 0; slot < count; slot += 1, number += 1) {
        const practice = builders[id](number);
        const context = contexts[slot];
        let expected;
        const expectedResult = () => {
          if (expected === undefined) expected = fingerprint(runner(practice.solution, practice.scenario));
          return expected;
        };
        const shortTitle = `${actions[slot]} ${theme}`.slice(0, 34);
        const module = {
          title: `${actions[slot]} ${theme.toLowerCase()} para ${context}`,
          shortTitle,
          kicker: `Módulo ${String(number).padStart(2, "0")} · ${theme}`,
          duration: addedLevelIndex < 3 ? "16 min" : addedLevelIndex < 7 ? "18 min" : "22 min",
          difficulty: addedLevelIndex < 3 ? "Práctica" : addedLevelIndex < 7 ? "Aplicación" : "Proyecto",
          file: config.file,
          intro: `${theme} sirve para ${config.purpose}. En este módulo lo aplicarás al contexto de ${context}, con un resultado que puedes volver a ejecutar y revisar.`,
          example: practice.solution,
          explanation: `La solución combina una decisión propia de ${config.name} con una comprobación observable. El laboratorio trabaja con datos ficticios y acotados, por lo que puedes concentrarte en la relación entre la entrada y el resultado.`,
          concepts: [
            `${theme} debe responder una necesidad concreta.`,
            "Una ejecución correcta todavía necesita una comprobación del resultado.",
            "Cambiar un dato y volver a probar ayuda a distinguir la regla del ejemplo."
          ],
          goal: `Completa la práctica de ${theme.toLowerCase()} para ${context} y consigue exactamente el resultado descrito por el ejemplo ejecutable.`,
          starter: practice.starter,
          solution: practice.solution,
          scenario: practice.scenario,
          hints: [
            `Compara primero el inicio con el ejemplo de ${theme.toLowerCase()}.`,
            `Ejecuta una vez y revisa qué parte de la entrada controla el resultado en ${config.name}.`,
            `Si sigue fallando, reproduce la estructura del ejemplo y conserva los valores que pide la misión.`
          ],
          checks: [
            { label: "Modificas el código inicial", test: code => normalize(code) !== normalize(practice.starter) },
            { label: `El laboratorio de ${config.name} ejecuta la propuesta`, test: (_, result) => Boolean(result) && !result.error },
            { label: "El resultado coincide con la misión", test: (_, result) => fingerprint(result) === expectedResult() }
          ],
          success: "Las tres comprobaciones coinciden con la referencia ejecutable."
        };
        additions.push(module);
        levelModules.push(module);
      }
      const levelNumber = course.levels.length + 1;
      course.levels.push({ title: theme, description: `${theme}: ${config.purpose}.`, modules: levelModules });
      course.stages.push(theme);
      globalThis.StarterExams.LEVEL_EXAMS[id].push(questionsFor(id, config, theme, levelModules, levelNumber));
    });
    course.lessons.push(...additions);
  }

  Object.entries(ROUTES).forEach(([id, config]) => extend(id, config));
  globalThis.RemainingFiftyCourses = Object.freeze({ routes: Object.keys(ROUTES) });
})();

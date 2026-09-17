/* Niveles 5–13 de Git y GitHub. Conserva intactos los 16 módulos publicados. */
(() => {
  "use strict";

  const commit = (id, message, parent, files, branch = "main") => ({ id, message, parent, branch, files, merge: false });
  const file = (content, committed = content, staged = false, stagedContent) => ({
    content, committed, staged, ...(staged ? { stagedContent: stagedContent ?? content } : {})
  });
  const BASE_README = "# Aula Dev\nGuía inicial.";
  const README_GUIDE = BASE_README + "\n\n## Instalación\nAbre index.html en el navegador.";
  const PAGE = "<h1>Aula Dev</h1>";
  const PAGE_A11Y = '<h1>Aula Dev</h1>\n<a href="#contenido">Saltar al contenido</a>';
  const CSS = "body { color: #17352a; }";
  const CSS_FOCUS = CSS + "\na:focus-visible { outline: 3px solid #126ee3; }";
  const REMOTE = "https://github.com/ejemplo/aula-dev.git";

  const baseCommit = (files = { "README.md": BASE_README, "index.html": PAGE, "estilos.css": CSS }) =>
    commit("base001", "Crea la base del proyecto", null, files);
  const baseRepo = (extra = {}) => {
    const snapshot = { "README.md": BASE_README, "index.html": PAGE, "estilos.css": CSS };
    return {
      initialized: true, head: "main", branches: { main: "base001" }, commits: [baseCommit(snapshot)],
      files: { "README.md": file(BASE_README), "index.html": file(PAGE), "estilos.css": file(CSS) },
      ...extra
    };
  };
  const branchRepo = ({ head = "main", main = "base001", branch = "mejora", branchId = "feat002", branchFiles, mainFiles, extra = {} } = {}) => {
    const rootFiles = { "README.md": BASE_README, "index.html": PAGE, "estilos.css": CSS };
    const featureFiles = branchFiles || { ...rootFiles, "README.md": README_GUIDE };
    const mainSnapshot = mainFiles || rootFiles;
    const commits = [baseCommit(rootFiles)];
    if (main !== "base001") commits.push(commit(main, "Actualiza la rama principal", "base001", mainSnapshot));
    commits.push(commit(branchId, "Prepara la mejora revisada", "base001", featureFiles, branch));
    const activeSnapshot = head === branch ? featureFiles : mainSnapshot;
    const files = Object.fromEntries(Object.entries(activeSnapshot).map(([name, content]) => [name, file(content)]));
    return { initialized: true, head, branches: { main, [branch]: branchId }, commits, files, ...extra };
  };

  const specs = [
    {
      id: 17, title: "Prepara solo el cambio que vas a explicar", short: "Selección precisa", topic: "Preparación",
      goal: "Guarda únicamente la guía de instalación en README.md y deja notas-locales.txt fuera del historial.",
      scenario: baseRepo({ files: { "README.md": file(README_GUIDE, BASE_README), "index.html": file(PAGE), "estilos.css": file(CSS), "notas-locales.txt": file("Idea todavía sin revisar", null) } }),
      starter: "git status", solution: 'git status\ngit add README.md\ngit diff --staged\ngit commit -m "Documenta la instalación"\ngit status',
      required: [/git\s+add\s+README\.md/i, /git\s+diff\s+--staged/i, /git\s+commit\s+-m/i], verify: /git\s+status\s*$/i,
      prediction: "¿Qué archivo aparecerá en el commit y cuál seguirá como archivo sin seguimiento?",
      answer: "README.md entrará en el commit; notas-locales.txt seguirá local y sin seguimiento porque nunca se preparó."
    },
    {
      id: 18, title: "Distingue lo preparado de lo que editaste después", short: "Dos instantáneas", topic: "Preparación",
      goal: "Confirma la primera versión preparada de README.md y conserva la edición posterior como cambio pendiente.",
      scenario: baseRepo({ files: { "README.md": file(README_GUIDE + "\nBorrador nuevo", BASE_README, true, README_GUIDE), "index.html": file(PAGE), "estilos.css": file(CSS) } }),
      starter: "git status", solution: 'git diff --staged\ngit diff\ngit commit -m "Documenta la instalación"\ngit status',
      required: [/git\s+diff\s+--staged/i, /^git\s+diff\s*$/im, /git\s+commit\s+-m/i], verify: /git\s+status\s*$/i,
      prediction: "¿El commit guardará también la línea Borrador nuevo que se escribió después de git add?",
      answer: "No. El commit toma la instantánea preparada; la línea posterior permanece modificada en el área de trabajo."
    },
    {
      id: 19, title: "Corrige una selección antes de confirmar", short: "Sacar de staging", topic: "Preparación",
      goal: "Saca notas-locales.txt del área de preparación y confirma solamente README.md.",
      scenario: baseRepo({ files: { "README.md": file(README_GUIDE, BASE_README, true), "index.html": file(PAGE), "estilos.css": file(CSS), "notas-locales.txt": file("Pendiente", null, true) } }),
      starter: "git status", solution: 'git restore --staged notas-locales.txt\ngit diff --staged\ngit commit -m "Documenta la instalación"\ngit status',
      required: [/git\s+restore\s+--staged\s+notas-locales\.txt/i, /git\s+diff\s+--staged/i, /git\s+commit\s+-m/i], verify: /git\s+status\s*$/i,
      prediction: "¿restore --staged borra el contenido de notas-locales.txt?",
      answer: "No. Solo lo saca de la próxima instantánea; el archivo y su contenido permanecen en la carpeta."
    },
    {
      id: 20, title: "Construye un commit atómico", short: "Cambio coherente", topic: "Preparación",
      goal: "Confirma juntos index.html y estilos.css porque forman la misma mejora visual, sin incluir ideas.txt.",
      scenario: baseRepo({ files: { "README.md": file(BASE_README), "index.html": file(PAGE_A11Y, PAGE), "estilos.css": file(CSS_FOCUS, CSS), "ideas.txt": file("Cambiar logo más adelante", null) } }),
      starter: "git status", solution: 'git add index.html estilos.css\ngit diff --staged\ngit commit -m "Mejora el acceso con teclado"\ngit status',
      required: [/git\s+add\s+index\.html\s+estilos\.css/i, /git\s+diff\s+--staged/i, /git\s+commit\s+-m/i], verify: /git\s+status\s*$/i,
      prediction: "¿Por qué conviene que HTML y CSS entren juntos en este caso?",
      answer: "Ambos archivos implementan una sola mejora verificable; el borrador de ideas pertenece a otra decisión."
    },

    {
      id: 21, title: "Descarta una prueba local con evidencia", short: "Diff y restore", topic: "Recuperación",
      goal: "Revisa el cambio accidental de estilos.css, descártalo y comprueba que el repositorio queda limpio.",
      scenario: baseRepo({ files: { "README.md": file(BASE_README), "index.html": file(PAGE), "estilos.css": file("body { color: hotpink; }", CSS) } }),
      starter: "git status", solution: "git diff\ngit restore estilos.css\ngit status",
      required: [/^git\s+diff\s*$/im, /git\s+restore\s+estilos\.css/i], verify: /git\s+status\s*$/i,
      prediction: "¿Qué contenido conservará estilos.css después de restaurarlo?",
      answer: "Volverá a la versión del último commit; el experimento local se descartará de forma consciente."
    },
    {
      id: 22, title: "Desprepara sin perder tu trabajo", short: "Conservar cambios", topic: "Recuperación",
      goal: "Saca README.md del área de preparación, conserva su edición en la carpeta y revisa el estado.",
      scenario: baseRepo({ files: { "README.md": file(README_GUIDE, BASE_README, true), "index.html": file(PAGE), "estilos.css": file(CSS) } }),
      starter: "git status", solution: "git restore --staged README.md\ngit diff\ngit status",
      required: [/git\s+restore\s+--staged\s+README\.md/i, /^git\s+diff\s*$/im], verify: /git\s+status\s*$/i,
      prediction: "¿README.md quedará como estaba en el commit o conservará la guía nueva?",
      answer: "Conservará la guía nueva como cambio no preparado; --staged no modifica el archivo de trabajo."
    },
    {
      id: 23, title: "Actualiza una instantánea preparada", short: "Volver a preparar", topic: "Recuperación",
      goal: "Reemplaza la versión preparada de README.md por su edición más reciente y confírmala.",
      scenario: baseRepo({ files: { "README.md": file(README_GUIDE + "\nCompatible con Windows.", BASE_README, true, README_GUIDE), "index.html": file(PAGE), "estilos.css": file(CSS) } }),
      starter: "git diff --staged", solution: 'git restore --staged README.md\ngit add README.md\ngit diff --staged\ngit commit -m "Completa la guía de instalación"\ngit status',
      required: [/git\s+restore\s+--staged\s+README\.md/i, /git\s+add\s+README\.md/i, /git\s+diff\s+--staged/i], verify: /git\s+status\s*$/i,
      prediction: "¿Qué versión de README.md tomará el commit después del segundo git add?",
      answer: "Tomará la edición más reciente, incluida la compatibilidad con Windows, porque git add actualiza la instantánea."
    },
    {
      id: 24, title: "Recupera una entrega mezclada", short: "Separar decisiones", topic: "Recuperación",
      goal: "Descarta el experimento de estilos.css y confirma únicamente la documentación válida de README.md.",
      scenario: baseRepo({ files: { "README.md": file(README_GUIDE, BASE_README), "index.html": file(PAGE), "estilos.css": file("body { display: none; }", CSS) } }),
      starter: "git status", solution: 'git diff\ngit restore estilos.css\ngit add README.md\ngit diff --staged\ngit commit -m "Documenta la instalación"\ngit status',
      required: [/git\s+restore\s+estilos\.css/i, /git\s+add\s+README\.md/i, /git\s+commit\s+-m/i], verify: /git\s+status\s*$/i,
      prediction: "¿El commit incluirá alguna modificación de estilos.css?",
      answer: "No. La restauración recupera su versión confirmada antes de preparar el cambio de documentación."
    },

    {
      id: 25, title: "Abre una rama con un nombre que explique la tarea", short: "Rama temática", topic: "Ramas",
      goal: "Crea y activa la rama mejora-accesibilidad; después lista las ramas para comprobar dónde estás.",
      scenario: baseRepo(), starter: "git branch", solution: "git switch -c mejora-accesibilidad\ngit branch",
      required: [/git\s+switch\s+-c\s+mejora-accesibilidad/i], verify: /git\s+branch\s*$/i,
      prediction: "¿main avanzará al crear mejora-accesibilidad?",
      answer: "No. Las dos ramas apuntarán al mismo commit inicial, pero la nueva rama quedará activa."
    },
    {
      id: 26, title: "Aísla una mejora en su propia rama", short: "Commit aislado", topic: "Ramas",
      goal: "Crea mejora-accesibilidad, confirma los dos archivos de la mejora y vuelve a main sin moverla.",
      scenario: baseRepo({ files: { "README.md": file(BASE_README), "index.html": file(PAGE_A11Y, PAGE), "estilos.css": file(CSS_FOCUS, CSS) } }),
      starter: "git status", solution: 'git switch -c mejora-accesibilidad\ngit add index.html estilos.css\ngit commit -m "Mejora la navegación con teclado"\ngit switch main\ngit branch',
      required: [/git\s+switch\s+-c\s+mejora-accesibilidad/i, /git\s+commit\s+-m/i, /git\s+switch\s+main/i], verify: /git\s+branch\s*$/i,
      prediction: "¿Qué rama conservará el commit nuevo cuando vuelvas a main?",
      answer: "mejora-accesibilidad conservará el commit; main seguirá apuntando a la base anterior."
    },
    {
      id: 27, title: "Comprueba dos historias sin mezclarlas", short: "Historia por rama", topic: "Ramas",
      goal: "Guarda la guía en rama-documentacion, revisa su historial, vuelve a main y revisa también el suyo.",
      scenario: baseRepo({ files: { "README.md": file(README_GUIDE, BASE_README), "index.html": file(PAGE), "estilos.css": file(CSS) } }),
      starter: "git status", solution: 'git switch -c rama-documentacion\ngit add README.md\ngit commit -m "Documenta la instalación"\ngit log --oneline\ngit switch main\ngit log --oneline',
      required: [/git\s+switch\s+-c\s+rama-documentacion/i, /git\s+log\s+--oneline/i, /git\s+switch\s+main/i], verify: /git\s+log\s+--oneline\s*$/i,
      prediction: "¿El último log de main mostrará el commit de documentación?",
      answer: "No. Ese commit pertenece a rama-documentacion hasta que una integración mueva main."
    },
    {
      id: 28, title: "Publica una propuesta sin alterar main", short: "Rama para revisión", topic: "Ramas",
      goal: "Crea docs-instalacion, confirma README.md y publica esa rama en origin con seguimiento.",
      scenario: baseRepo({ files: { "README.md": file(README_GUIDE, BASE_README), "index.html": file(PAGE), "estilos.css": file(CSS) }, remotes: { origin: REMOTE } }),
      starter: "git status", solution: 'git switch -c docs-instalacion\ngit add README.md\ngit commit -m "Documenta la instalación"\ngit push -u origin docs-instalacion\ngit branch',
      required: [/git\s+switch\s+-c\s+docs-instalacion/i, /git\s+commit\s+-m/i, /git\s+push\s+-u\s+origin\s+docs-instalacion/i], verify: /git\s+branch\s*$/i,
      prediction: "¿Publicar docs-instalacion integra su commit en main?",
      answer: "No. El push publica la rama para revisión; main conserva su posición hasta una fusión posterior."
    },

    {
      id: 29, title: "Integra con avance directo", short: "Fast-forward", topic: "Integración",
      goal: "Integra mejora-accesibilidad en main y revisa que el historial incluya la propuesta.",
      scenario: branchRepo({ branch: "mejora-accesibilidad", branchId: "a11y002", branchFiles: { "README.md": BASE_README, "index.html": PAGE_A11Y, "estilos.css": CSS_FOCUS } }),
      starter: "git branch", solution: "git merge mejora-accesibilidad\ngit log --oneline\ngit status",
      required: [/git\s+merge\s+mejora-accesibilidad/i, /git\s+log\s+--oneline/i], verify: /git\s+status\s*$/i,
      prediction: "¿Será necesario crear un commit de fusión cuando main no avanzó?",
      answer: "No. Git puede adelantar main directamente hasta el commit de la rama mediante fast-forward."
    },
    {
      id: 30, title: "Reconoce una rama ya integrada", short: "Ya actualizado", topic: "Integración",
      goal: "Intenta integrar docs cuando main ya apunta al mismo commit y confirma que no cambia el historial.",
      scenario: branchRepo({ main: "docs002", branch: "docs", branchId: "docs002", branchFiles: { "README.md": README_GUIDE, "index.html": PAGE, "estilos.css": CSS } }),
      starter: "git branch", solution: "git merge docs\ngit log --oneline\ngit status",
      required: [/git\s+merge\s+docs/i, /git\s+log\s+--oneline/i], verify: /git\s+status\s*$/i,
      prediction: "¿La integración creará otro commit idéntico?",
      answer: "No. Git detecta que el commit de docs ya pertenece a la historia de main y responde que está actualizado."
    },
    {
      id: 31, title: "Une historias que avanzaron por separado", short: "Commit de fusión", topic: "Integración",
      goal: "Integra mejora-accesibilidad en una main que también avanzó y revisa el nuevo commit de fusión.",
      scenario: branchRepo({ main: "main002", branch: "mejora-accesibilidad", branchId: "a11y002", mainFiles: { "README.md": README_GUIDE, "index.html": PAGE, "estilos.css": CSS }, branchFiles: { "README.md": BASE_README, "index.html": PAGE_A11Y, "estilos.css": CSS_FOCUS } }),
      starter: "git branch", solution: "git merge mejora-accesibilidad\ngit log --oneline\ngit status",
      required: [/git\s+merge\s+mejora-accesibilidad/i, /git\s+log\s+--oneline/i], verify: /git\s+status\s*$/i,
      prediction: "¿Por qué aparece un commit de fusión en vez de fast-forward?",
      answer: "main y la rama tienen commits distintos desde la base; la unión necesita representar ambas historias."
    },
    {
      id: 32, title: "Elige correctamente la rama que recibe", short: "Dirección del merge", topic: "Integración",
      goal: "Desde la rama propuesta vuelve a main, integra docs-instalacion y confirma el historial resultante.",
      scenario: branchRepo({ head: "docs-instalacion", branch: "docs-instalacion", branchId: "docs002", branchFiles: { "README.md": README_GUIDE, "index.html": PAGE, "estilos.css": CSS } }),
      starter: "git branch", solution: "git switch main\ngit merge docs-instalacion\ngit log --oneline\ngit status",
      required: [/git\s+switch\s+main/i, /git\s+merge\s+docs-instalacion/i, /git\s+log\s+--oneline/i], verify: /git\s+status\s*$/i,
      prediction: "¿Qué rama debe estar activa justo antes del merge?",
      answer: "main debe estar activa porque es la base que recibirá los commits de docs-instalacion."
    },

    {
      id: 33, title: "Conecta y audita un remoto", short: "Remote origin", topic: "Remotos",
      goal: "Agrega origin con la dirección indicada y comprueba sus direcciones de lectura y escritura.",
      scenario: baseRepo(), starter: "git remote -v", solution: `git remote add origin ${REMOTE}\ngit remote -v`,
      required: [/git\s+remote\s+add\s+origin\s+https:\/\/github\.com\/ejemplo\/aula-dev\.git/i], verify: /git\s+remote\s+-v\s*$/i,
      prediction: "¿origin es el repositorio remoto o solo un nombre corto local?",
      answer: "Es un nombre corto local que apunta a la dirección del repositorio remoto."
    },
    {
      id: 34, title: "Publica una rama con seguimiento", short: "Push con -u", topic: "Remotos",
      goal: "Publica docs-instalacion en origin y deja configurado su seguimiento.",
      scenario: branchRepo({ head: "docs-instalacion", branch: "docs-instalacion", branchId: "docs002", branchFiles: { "README.md": README_GUIDE, "index.html": PAGE, "estilos.css": CSS }, extra: { remotes: { origin: REMOTE } } }),
      starter: "git branch", solution: "git push -u origin docs-instalacion\ngit remote -v",
      required: [/git\s+push\s+-u\s+origin\s+docs-instalacion/i], verify: /git\s+remote\s+-v\s*$/i,
      prediction: "¿Qué referencia remota se crea con este push?",
      answer: "Se crea la rama docs-instalacion en origin apuntando al mismo commit que la rama local."
    },
    {
      id: 35, title: "Actualiza una rama que ya estaba publicada", short: "Push incremental", topic: "Remotos",
      goal: "Envía el commit más reciente de docs-instalacion a la rama que ya existe en origin.",
      scenario: branchRepo({ head: "docs-instalacion", branch: "docs-instalacion", branchId: "docs002", branchFiles: { "README.md": README_GUIDE, "index.html": PAGE, "estilos.css": CSS }, extra: { remotes: { origin: REMOTE }, pushed: { origin: { "docs-instalacion": "base001" } } } }),
      starter: "git log --oneline", solution: "git push origin docs-instalacion\ngit remote -v",
      required: [/git\s+push\s+origin\s+docs-instalacion/i], verify: /git\s+remote\s+-v\s*$/i,
      prediction: "¿El segundo push vuelve a enviar una rama nueva?",
      answer: "No. Actualiza la rama remota desde el commit anterior hasta el commit nuevo."
    },
    {
      id: 36, title: "Publica la rama correcta para una entrega", short: "Destino explícito", topic: "Remotos",
      goal: "Publica release-septiembre, sin publicar main, y comprueba el remoto configurado.",
      scenario: branchRepo({ head: "release-septiembre", branch: "release-septiembre", branchId: "rel002", branchFiles: { "README.md": README_GUIDE, "index.html": PAGE, "estilos.css": CSS }, extra: { remotes: { origin: REMOTE } } }),
      starter: "git branch", solution: "git push -u origin release-septiembre\ngit remote -v",
      required: [/git\s+push\s+-u\s+origin\s+release-septiembre/i], verify: /git\s+remote\s+-v\s*$/i,
      prediction: "¿Afectará este comando a origin/main?",
      answer: "No. El destino explícito es origin/release-septiembre; main no se publica en esta misión."
    },

    {
      id: 37, title: "Lee una historia compacta", short: "Log oneline", topic: "Auditoría",
      goal: "Muestra los tres commits de main en formato compacto y termina comprobando el estado.",
      scenario: (() => { const a={"README.md":BASE_README}; const b={...a,"index.html":PAGE}; const c={...b,"estilos.css":CSS}; return { initialized:true, head:"main", branches:{main:"css003"}, commits:[commit("base001","Crea la documentación",null,a),commit("page002","Agrega la portada","base001",b),commit("css003","Agrega los estilos","page002",c)], files:Object.fromEntries(Object.entries(c).map(([n,v])=>[n,file(v)])) }; })(),
      starter: "git status", solution: "git log --oneline\ngit status",
      required: [/git\s+log\s+--oneline/i], verify: /git\s+status\s*$/i,
      prediction: "¿Qué commit aparecerá primero en el historial compacto?",
      answer: "Agrega los estilos aparecerá primero porque HEAD de main apunta al commit más reciente."
    },
    {
      id: 38, title: "Lee mensajes y autoría del historial", short: "Log detallado", topic: "Auditoría",
      goal: "Muestra el historial detallado de main y comprueba después que no hay cambios pendientes.",
      scenario: baseRepo({ author: "equipo-capsulas" }), starter: "git status", solution: "git log\ngit status",
      required: [/^git\s+log\s*$/im], verify: /git\s+status\s*$/i,
      prediction: "¿Qué información adicional muestra git log sin --oneline?",
      answer: "Muestra el identificador, la referencia HEAD, la autoría y el mensaje separado del commit."
    },
    {
      id: 39, title: "Revisa un cambio antes de prepararlo", short: "Diff de trabajo", topic: "Auditoría",
      goal: "Inspecciona la edición de index.html sin prepararla y confirma con status que sigue pendiente.",
      scenario: baseRepo({ files: { "README.md": file(BASE_README), "index.html": file(PAGE_A11Y, PAGE), "estilos.css": file(CSS) } }),
      starter: "git status", solution: "git diff\ngit status",
      required: [/^git\s+diff\s*$/im], verify: /git\s+status\s*$/i,
      prediction: "¿git diff modifica el archivo o el área de preparación?",
      answer: "No. Solo muestra la diferencia del área de trabajo para que puedas revisarla."
    },
    {
      id: 40, title: "Compara staging y área de trabajo", short: "Doble revisión", topic: "Auditoría",
      goal: "Revisa la instantánea preparada y también la edición posterior de README.md sin alterar ninguna.",
      scenario: baseRepo({ files: { "README.md": file(README_GUIDE + "\nPendiente: Linux", BASE_README, true, README_GUIDE), "index.html": file(PAGE), "estilos.css": file(CSS) } }),
      starter: "git status", solution: "git diff --staged\ngit diff\ngit status",
      required: [/git\s+diff\s+--staged/i, /^git\s+diff\s*$/im], verify: /git\s+status\s*$/i,
      prediction: "¿Por qué los dos diff muestran contenidos diferentes?",
      answer: "Uno compara staging con el commit; el otro compara la edición actual con la instantánea preparada."
    },

    {
      id: 41, title: "Protege archivos de entorno", short: "Ignorar secretos", topic: "Higiene",
      goal: "Versiona .gitignore y README.md sin permitir que desarrollo.env entre al historial.",
      scenario: baseRepo({ ignored:["*.env"], files:{"README.md":file(README_GUIDE,BASE_README),"index.html":file(PAGE),"estilos.css":file(CSS),".gitignore":file("*.env",null),"desarrollo.env":file("TOKEN=privado",null)} }),
      starter: "git status", solution: 'git add .gitignore README.md\ngit diff --staged\ngit commit -m "Protege la configuración local"\ngit status',
      required: [/git\s+add\s+\.gitignore\s+README\.md/i, /git\s+diff\s+--staged/i, /git\s+commit\s+-m/i], verify: /git\s+status\s*$/i,
      prediction: "¿desarrollo.env aparecerá en status o en el commit?",
      answer: "No. El patrón *.env lo mantiene fuera de las listas versionables del laboratorio."
    },
    {
      id: 42, title: "Excluye resultados generados", short: "Ignorar carpetas", topic: "Higiene",
      goal: "Confirma el cambio fuente y .gitignore, manteniendo dist/bundle.js fuera del historial.",
      scenario: baseRepo({ ignored:["dist/"], files:{"README.md":file(BASE_README),"index.html":file(PAGE_A11Y,PAGE),"estilos.css":file(CSS),".gitignore":file("dist/",null),"dist/bundle.js":file("código generado",null)} }),
      starter: "git status", solution: 'git add index.html .gitignore\ngit diff --staged\ngit commit -m "Mejora la estructura accesible"\ngit status',
      required: [/git\s+add\s+index\.html\s+\.gitignore/i, /git\s+diff\s+--staged/i, /git\s+commit\s+-m/i], verify: /git\s+status\s*$/i,
      prediction: "¿Por qué conviene versionar .gitignore aunque dist no se versione?",
      answer: "La regla es parte del acuerdo del proyecto y evita que otras personas agreguen resultados generados."
    },
    {
      id: 43, title: "Conserva un borrador fuera de una entrega", short: "Archivo sin seguimiento", topic: "Higiene",
      goal: "Confirma README.md y deja borrador-charla.txt local, sin preparar ni versionar.",
      scenario: baseRepo({ files:{"README.md":file(README_GUIDE,BASE_README),"index.html":file(PAGE),"estilos.css":file(CSS),"borrador-charla.txt":file("Notas personales",null)} }),
      starter: "git status", solution: 'git add README.md\ngit diff --staged\ngit commit -m "Documenta la instalación"\ngit status',
      required: [/git\s+add\s+README\.md/i, /git\s+diff\s+--staged/i, /git\s+commit\s+-m/i], verify: /git\s+status\s*$/i,
      prediction: "¿push podría subir borrador-charla.txt después de este commit?",
      answer: "No. Push envía commits; un archivo que nunca entró en un commit permanece solo en la carpeta local."
    },
    {
      id: 44, title: "Audita una entrega antes de guardarla", short: "Lista de control", topic: "Higiene",
      goal: "Revisa trabajo, prepara HTML y CSS por nombre, revisa staging, confirma y verifica el estado final.",
      scenario: baseRepo({ files:{"README.md":file(BASE_README),"index.html":file(PAGE_A11Y,PAGE),"estilos.css":file(CSS_FOCUS,CSS),"pendiente.txt":file("Revisar después",null)} }),
      starter: "git status", solution: 'git status\ngit diff\ngit add index.html estilos.css\ngit diff --staged\ngit commit -m "Mejora la navegación accesible"\ngit status',
      required: [/^git\s+diff\s*$/im, /git\s+add\s+index\.html\s+estilos\.css/i, /git\s+diff\s+--staged/i], verify: /git\s+status\s*$/i,
      prediction: "¿pendiente.txt impedirá confirmar o publicar la mejora?",
      answer: "No. Seguirá sin seguimiento y no formará parte del commit preparado por nombre."
    },

    {
      id: 45, title: "Prepara una propuesta revisable", short: "Flujo de propuesta", topic: "Colaboración",
      goal: "Crea docs-instalacion, confirma la guía, publícala con seguimiento y termina revisando el estado.",
      scenario: baseRepo({ files:{"README.md":file(README_GUIDE,BASE_README),"index.html":file(PAGE),"estilos.css":file(CSS)}, remotes:{origin:REMOTE} }),
      starter: "git status", solution: 'git switch -c docs-instalacion\ngit add README.md\ngit diff --staged\ngit commit -m "Documenta la instalación"\ngit push -u origin docs-instalacion\ngit status',
      required: [/git\s+switch\s+-c\s+docs-instalacion/i, /git\s+diff\s+--staged/i, /git\s+push\s+-u\s+origin\s+docs-instalacion/i], verify: /git\s+status\s*$/i,
      prediction: "¿Qué paso de GitHub ocurre después y no lo simula este laboratorio?",
      answer: "Abrir, conversar y aprobar el pull request ocurre en GitHub; aquí se practica la historia Git que lo sustenta."
    },
    {
      id: 46, title: "Integra una propuesta aprobada", short: "Base aprobada", topic: "Colaboración",
      goal: "Integra docs-instalacion en main, publica main y comprueba el historial final.",
      scenario: branchRepo({ branch:"docs-instalacion", branchId:"docs002", branchFiles:{"README.md":README_GUIDE,"index.html":PAGE,"estilos.css":CSS}, extra:{remotes:{origin:REMOTE}} }),
      starter: "git branch", solution: "git merge docs-instalacion\ngit push origin main\ngit log --oneline\ngit status",
      required: [/git\s+merge\s+docs-instalacion/i, /git\s+push\s+origin\s+main/i, /git\s+log\s+--oneline/i], verify: /git\s+status\s*$/i,
      prediction: "¿Qué debe suceder antes de ejecutar este merge en un proyecto real?",
      answer: "La propuesta debe revisarse y aprobarse según las reglas del equipo; el laboratorio parte de esa aprobación."
    },
    {
      id: 47, title: "Entrega una corrección urgente aislada", short: "Rama hotfix", topic: "Colaboración",
      goal: "Crea hotfix-enlace, confirma solo index.html y publica la rama para una revisión rápida.",
      scenario: baseRepo({ files:{"README.md":file(BASE_README),"index.html":file('<h1>Aula Dev</h1>\n<a href="/ayuda.html">Ayuda</a>',PAGE),"estilos.css":file(CSS),"notas.txt":file("Investigar otra mejora",null)}, remotes:{origin:REMOTE} }),
      starter: "git status", solution: 'git switch -c hotfix-enlace\ngit add index.html\ngit diff --staged\ngit commit -m "Corrige el enlace de ayuda"\ngit push -u origin hotfix-enlace\ngit status',
      required: [/git\s+switch\s+-c\s+hotfix-enlace/i, /git\s+add\s+index\.html/i, /git\s+push\s+-u\s+origin\s+hotfix-enlace/i], verify: /git\s+status\s*$/i,
      prediction: "¿Las notas locales entrarán en la corrección urgente?",
      answer: "No. La preparación explícita mantiene el commit enfocado en index.html y deja notas.txt fuera."
    },
    {
      id: 48, title: "Publica una integración de historias paralelas", short: "Merge y publicación", topic: "Colaboración",
      goal: "Integra mejora-accesibilidad en la main divergente, revisa el historial y publica la nueva main.",
      scenario: branchRepo({ main:"main002", branch:"mejora-accesibilidad", branchId:"a11y002", mainFiles:{"README.md":README_GUIDE,"index.html":PAGE,"estilos.css":CSS}, branchFiles:{"README.md":BASE_README,"index.html":PAGE_A11Y,"estilos.css":CSS_FOCUS}, extra:{remotes:{origin:REMOTE},pushed:{origin:{main:"main002"}}} }),
      starter: "git branch", solution: "git merge mejora-accesibilidad\ngit log --oneline\ngit push origin main\ngit status",
      required: [/git\s+merge\s+mejora-accesibilidad/i, /git\s+log\s+--oneline/i, /git\s+push\s+origin\s+main/i], verify: /git\s+status\s*$/i,
      prediction: "¿Qué representa el commit adicional que aparece en main?",
      answer: "Representa la unión de dos historias que avanzaron por separado desde una base común."
    },

    {
      id: 49, title: "Versiona un proyecto desde una carpeta nueva", short: "Proyecto completo", topic: "Proyecto final",
      goal: "Inicializa el repositorio, confirma los archivos públicos sin claves.env, conecta origin y publica main.",
      scenario: { initialized:false, ignored:["*.env"], files:{"README.md":file(BASE_README,null),"index.html":file(PAGE,null),"estilos.css":file(CSS,null),".gitignore":file("*.env",null),"claves.env":file("TOKEN=privado",null)} },
      starter: "git status", solution: `git init\ngit status\ngit add README.md index.html estilos.css .gitignore\ngit diff --staged\ngit commit -m "Crea la base de Aula Dev"\ngit remote add origin ${REMOTE}\ngit push -u origin main\ngit remote -v\ngit status`,
      required: [/git\s+init/i, /git\s+add\s+README\.md\s+index\.html\s+estilos\.css\s+\.gitignore/i, /git\s+push\s+-u\s+origin\s+main/i], verify: /git\s+status\s*$/i,
      prediction: "¿Qué archivos estarán en la primera versión y cuál permanecerá privado?",
      answer: "README.md, index.html, estilos.css y .gitignore estarán versionados; claves.env seguirá ignorado."
    },
    {
      id: 50, title: "Completa un flujo profesional de entrega", short: "Integración 50", topic: "Proyecto final",
      goal: "Crea una rama accesible, confirma y publica la propuesta, intégrala en main y publica el resultado.",
      scenario: baseRepo({ files:{"README.md":file(BASE_README),"index.html":file(PAGE_A11Y,PAGE),"estilos.css":file(CSS_FOCUS,CSS)}, remotes:{origin:REMOTE}, pushed:{origin:{main:"base001"}} }),
      starter: "git status", solution: 'git switch -c mejora-accesibilidad\ngit add index.html estilos.css\ngit diff --staged\ngit commit -m "Mejora la navegación con teclado"\ngit push -u origin mejora-accesibilidad\ngit switch main\ngit merge mejora-accesibilidad\ngit push origin main\ngit log --oneline\ngit status',
      required: [/git\s+switch\s+-c\s+mejora-accesibilidad/i, /git\s+push\s+-u\s+origin\s+mejora-accesibilidad/i, /git\s+merge\s+mejora-accesibilidad/i, /git\s+push\s+origin\s+main/i], verify: /git\s+status\s*$/i,
      prediction: "¿Qué dos referencias remotas terminarán apuntando al commit de accesibilidad?",
      answer: "origin/mejora-accesibilidad y origin/main terminarán en el mismo commit después de publicar e integrar."
    }
  ];

  const levelMeta = [
    ["Preparación con intención", "Instantáneas precisas y commits coherentes"],
    ["Recuperación segura", "Revisar, despreparar y descartar con criterio"],
    ["Ramas con propósito", "Aislar propuestas y conservar la línea principal"],
    ["Integración consciente", "Dirección, fast-forward e historias divergentes"],
    ["Publicación remota", "Origen, seguimiento y destinos explícitos"],
    ["Auditoría del trabajo", "Historial y diferencias entre las tres áreas"],
    ["Higiene del repositorio", "Secretos, generados y entregas enfocadas"],
    ["Colaboración verificable", "Propuestas, revisiones e integraciones publicadas"],
    ["Proyectos de entrega", "Flujos completos desde el inicio hasta main"]
  ];

  const stable = value => {
    if (Array.isArray(value)) return value.map(stable);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  };
  const shape = state => JSON.stringify(stable({
    initialized: state.initialized, head: state.head, branches: state.branches, remotes: state.remotes,
    pushed: state.pushed, ignored: state.ignored, commits: state.commits, files: state.files
  }));
  const runsAll = (code, patterns) => patterns.every(pattern => pattern.test(String(code).replace(/^\s*#.*$/gm, "")));
  const check = (label, test) => ({ label, test });
  const levels = [];
  const exams = [];

  function makeModule(spec, index) {
    const reference = globalThis.GitLab.run(spec.solution, spec.scenario);
    if (reference.error) throw new Error(`Git, módulo ${spec.id}: ${reference.error}`);
    const next = specs[index + 1];
    const mainIdea = spec.short.toLowerCase();
    return {
      id: spec.id, kicker: `Módulo ${String(spec.id).padStart(2, "0")} · ${spec.topic}`,
      title: spec.title, shortTitle: spec.short, duration: spec.id >= 49 ? "32 min" : "20 min",
      difficulty: spec.id >= 49 ? "Proyecto final" : "Avanzado", file: "Terminal · repositorio simulado",
      intro: `Practicarás ${mainIdea} en un repositorio preparado para que cada comando tenga una consecuencia visible y comprobable.`,
      example: spec.solution,
      explanation: `Este flujo usa ${mainIdea} para separar lo que existe en la carpeta, lo que está preparado, la historia local y lo que ya se publicó. Lee la salida después de cada paso y no trates esas áreas como si fueran una sola.`,
      paragraphs: [
        `La misión reproduce una decisión frecuente al trabajar con ${mainIdea}. El orden de los comandos importa porque cada uno parte del estado que dejó el anterior.`,
        "El laboratorio ejecuta Git sobre memoria: no toca tus archivos reales ni se conecta a GitHub. Los estados y mensajes conservan el significado del flujo que practicarías en una terminal.",
        "Si una comprobación falla, vuelve a git status y revisa la rama activa, el área de preparación, el último commit y el destino del push antes de agregar más comandos."
      ],
      concepts: [
        `${spec.short} responde a una decisión concreta del flujo, no a un paso automático.`,
        "status, diff y log aportan evidencia en momentos distintos.",
        "Un remoto recibe commits y ramas; no recibe todos los archivos de la carpeta."
      ],
      goal: spec.goal, starter: spec.starter, solution: spec.solution, scenario: spec.scenario,
      hints: [
        `Identifica primero qué estado debe cambiar mediante ${mainIdea} y cuál debe conservarse.`,
        "Ejecuta las acciones en orden y usa el comando de revisión indicado antes de confirmar o publicar.",
        `Compara tu secuencia con esta estructura y adapta solo lo necesario: ${spec.solution.replace(/\n/g, " → ")}`
      ],
      checks: [
        check(`Usas los comandos esenciales de ${spec.short}`, code => runsAll(code, spec.required)),
        check("El repositorio termina exactamente en el estado solicitado", (_, result) => !result.error && shape(result.state) === shape(reference.state)),
        check("Terminas sin errores y verificas el resultado", (code, result) => !result.error && spec.verify.test(String(code).trim()) && result.output.length > 0)
      ],
      success: next ? `Completaste un flujo comprobable. El siguiente módulo aplicará esta base en «${next.title}».` : "Completaste cincuenta módulos y un flujo de entrega completo desde la rama de trabajo hasta main.",
      steps: [
        ["Estado inicial", "Lee la rama, los archivos y el remoto descritos antes de escribir comandos."],
        ["Transformación", "Sigue cada comando y explica qué referencia o área cambia en ese momento."],
        ["Evidencia", "Usa la última consulta para comprobar el resultado en vez de suponer que funcionó."]
      ],
      question: spec.prediction, answer: spec.answer,
      mistakes: [
        ["El repositorio queda en otra rama o con otro commit", "Revisa la dirección de switch y merge, y confirma solo después de preparar los archivos correctos."],
        ["El push llega a una referencia distinta", "Escribe explícitamente el nombre del remoto y de la rama que pide la misión."]
      ],
      lesson: {
        prerequisites: index === 0 ? "Haber completado los dieciséis módulos iniciales de Git y GitHub." : `Haber completado el módulo anterior: ${specs[index - 1].title}.`,
        walkthrough: ["Reconoce la rama y las tres áreas de Git.", "Predice qué cambia tras cada comando de la secuencia.", "Contrasta el estado final con la misión y la salida visible."],
        prediction: spec.prediction, answer: spec.answer,
        reflection: "Explica con tus palabras qué parte del repositorio cambió y qué parte se mantuvo intacta al completar esta misión.",
        extension: "Repite mentalmente el flujo con otro nombre de rama o archivo y señala qué comandos tendrían que cambiar.",
        feedback: ["Revisa los comandos esenciales y sus argumentos.", "Compara rama, commits, archivos preparados y referencias remotas.", "Añade la consulta final indicada y corrige cualquier error previo."]
      }
    };
  }

  function build() {
    if (levels.length) return;
    for (let levelIndex = 0; levelIndex < levelMeta.length; levelIndex += 1) {
      const start = levelIndex * 4;
      const part = specs.slice(start, start + (levelIndex === 8 ? 2 : 4));
      const modules = part.map((spec, localIndex) => makeModule(spec, start + localIndex));
      const [title, description] = levelMeta[levelIndex];
      levels.push({
        title, description, modules,
        completionTitle: `Finalizaste ${title.toLowerCase()} de Git y GitHub.`,
        completionCopy: levelIndex < 8 ? `Completaste ${modules.length} prácticas conectadas. Rinde el mini examen y continúa cuando estés listo.` : "Completaste los dos proyectos integradores. Rinde el examen final y repasa cualquier comando que todavía no puedas explicar.",
        approvedCopy: levelIndex < 8 ? `Aprobaste ${title.toLowerCase()}.` : "Aprobaste el nivel final y completaste cincuenta módulos de Git y GitHub."
      });
      const questions = Array.from({ length: 5 }, (_, questionIndex) => {
        if (questionIndex === 4) return { question: `¿Cómo compruebas un flujo de ${title.toLowerCase()}?`, options: ["Revisando rama, estado, historial y destino", "Suponiendo que no hubo errores", "Usando siempre git add .", "Publicando antes de revisar"], answer: 0, explanation: "La salida y las referencias finales permiten confirmar qué ocurrió realmente en cada área de Git." };
        const module = modules[questionIndex % modules.length];
        const correct = module.concepts[0];
        const options = [correct, "Todo archivo local se publica automáticamente", "Cambiar de rama siempre integra commits", "Un push reemplaza la revisión del equipo"];
        const shift = questionIndex % options.length;
        const rotated = options.slice(shift).concat(options.slice(0, shift));
        return { question: `¿Qué idea corresponde a «${module.shortTitle}»?`, options: rotated, answer: rotated.indexOf(correct), explanation: `${correct} ${module.explanation}` };
      });
      exams.push({ levelId: levelIndex + 5, title: `Mini examen: ${title}`, passing: 4, intro: `Repasa ${title.toLowerCase()}. Necesitas cuatro respuestas correctas de cinco.`, questions });
    }
  }

  function apply() {
    const course = globalThis.GitCourse;
    if (!course || !globalThis.GitLab) return;
    if (course.levels.length === 3) globalThis.CourseExpansion?.apply({ git: course });
    if (course.levels.length !== 4) return;
    build();
    course.levels.push(...levels);
    course.lessons = course.levels.flatMap(level => level.modules);
    course.stages = [...course.stages, ...levels.map(level => level.title)];
    const bank = globalThis.StarterExams?.LEVEL_EXAMS?.git;
    if (bank) for (const exam of exams) if (!bank.some(item => item.levelId === exam.levelId)) bank.push(exam);
  }

  apply();
  globalThis.GitFiftyCourse = Object.freeze({ levels, exams, specs, apply });
})();

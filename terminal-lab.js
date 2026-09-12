/* Shell educativo con archivos virtuales. No ejecuta procesos ni accede al disco o a la red. */
(() => {
  "use strict";
  const MAX_COMMANDS = 40, MAX_FILE = 20000, MAX_OUTPUT = 40000;
  const initial = () => ({ cwd: "/proyecto", dirs: ["/", "/proyecto", "/proyecto/datos", "/proyecto/docs"],
    files: { "/proyecto/README.md": "Bienvenido a Cápsulas Dev\nPractica en una carpeta virtual\n",
      "/proyecto/datos/cursos.txt": "HTML\nSQL\nJavaScript\nPython\n", "/proyecto/docs/notas.txt": "Pendiente: leer\nHecho: practicar\nPendiente: repasar\n" } });
  const fail = message => { throw new Error(message); };
  function resolve(cwd, path) {
    if (!path || path.includes("\0")) fail("Indica una ruta válida.");
    const parts = (path.startsWith("/") ? path : cwd + "/" + path).split("/");
    const result = [];
    for (const part of parts) { if (!part || part === ".") continue; if (part === "..") result.pop(); else result.push(part); }
    return "/" + result.join("/");
  }
  const parent = path => path.slice(0, path.lastIndexOf("/")) || "/";
  function tokens(source) {
    const list = []; let word = "", quoted = false, quote = null;
    const flush = () => { if (word || quoted) list.push({ value: word, operator: false }); word = ""; quoted = false; };
    for (let i = 0; i < source.length; i++) {
      const c = source[i];
      // Bash expandiría $VAR incluso entre comillas dobles; aquí se avisa en vez de imprimirlo literal.
      if (quote) { if (c === quote) { quote = null; quoted = true; } else if (c === "$" && quote === '"') fail("El laboratorio no admite variables como $HOME, ni siquiera entre comillas dobles."); else word += c; continue; }
      if (c === "'" || c === '"') { quote = c; quoted = true; continue; }
      if (/\s/.test(c)) { flush(); continue; }
      if (c === "#" && !word && !quoted) break;
      if (c === "|" || c === ">") { flush(); let op = c; if (c === ">" && source[i + 1] === ">") { op = ">>"; i++; } list.push({ value: op, operator: true }); continue; }
      if (/[;&`$*?<>]/.test(c)) fail("El laboratorio no admite variables, comodines, sustituciones ni operadores distintos de |, > y >>.");
      word += c;
    }
    if (quote) fail("Falta cerrar una comilla. Puedes encerrar rutas con espacios entre comillas.");
    flush(); return list;
  }
  function run(source, scenario) {
    const fixture = scenario || initial();
    const state = { cwd: fixture.cwd || "/proyecto", dirs: new Set(fixture.dirs || initial().dirs), files: new Map(Object.entries(fixture.files || initial().files)) };
    const history = [], output = [];
    const finish = error => ({ text: output.join("\n"), output, error, history,
      state: { cwd: state.cwd, dirs: [...state.dirs], files: Object.fromEntries(state.files) } });
    const read = path => { const full = resolve(state.cwd, path); if (!state.files.has(full)) fail("No existe el archivo: " + path); return state.files.get(full); };
    const write = (full, text) => {
      if (!state.dirs.has(parent(full))) fail("No existe la carpeta de destino: " + parent(full));
      if (state.dirs.has(full)) fail("La ruta es una carpeta, no un archivo: " + full);
      if (text.length > MAX_FILE || (!state.files.has(full) && state.files.size >= 100)) fail("Se alcanzó el límite de archivos o tamaño de esta práctica.");
      state.files.set(full, text);
    };
    const linesOf = input => { const lines = input.split("\n"); if (input.endsWith("\n")) lines.pop(); return input === "" ? [] : lines; };
    function command(parts, input, piped) {
      const [name, ...args] = parts;
      if (!name) fail("Falta un comando junto al operador.");
      const argc = n => { if (args.length !== n) fail(name + (n === 1 ? ": se espera 1 argumento" : ": se esperan " + n + " argumentos") + " en esta práctica."); };
      let text = "";
      if (name === "pwd") { argc(0); text = state.cwd + "\n"; }
      else if (name === "ls") {
        if (args.length > 1 || args[0]?.startsWith("-")) fail("Usa ls o ls <carpeta>; esta práctica no admite opciones de ls.");
        const dir = resolve(state.cwd, args[0] || ".");
        if (!state.dirs.has(dir)) fail("No existe la carpeta: " + dir);
        const children = [...state.dirs].filter(p => p !== "/" && parent(p) === dir).map(p => p.split("/").pop() + "/")
          .concat([...state.files.keys()].filter(p => parent(p) === dir && !p.split("/").pop().startsWith(".")).map(p => p.split("/").pop())).sort();
        text = children.length ? children.join("\n") + "\n" : "";
      } else if (name === "cd") { argc(1); const dir = resolve(state.cwd, args[0]); if (!state.dirs.has(dir)) fail("No existe la carpeta: " + args[0]); state.cwd = dir; }
      else if (name === "mkdir") {
        const recursive = args[0] === "-p"; const paths = recursive ? args.slice(1) : args;
        if (paths.length !== 1 || paths[0].startsWith("-")) fail("Usa mkdir <carpeta> o mkdir -p <ruta>.");
        const full = resolve(state.cwd, paths[0]);
        if (state.files.has(full)) fail("Ya hay un archivo en esa ruta.");
        if (state.dirs.has(full) && !recursive) fail("La carpeta ya existe.");
        if (recursive) { let current = ""; for (const part of full.split("/").filter(Boolean)) { current += "/" + part; if (state.files.has(current)) fail("Un archivo ocupa parte de la ruta."); state.dirs.add(current); } }
        else { if (!state.dirs.has(parent(full))) fail("La carpeta padre no existe. Puedes usar mkdir -p."); state.dirs.add(full); }
        if (state.dirs.size > 100) fail("Demasiadas carpetas en esta práctica.");
      } else if (name === "touch") { argc(1); const full = resolve(state.cwd, args[0]); if (!state.files.has(full)) write(full, ""); }
      else if (name === "cat") { if (!args.length && piped) text = input; else { if (!args.length) fail("Indica el archivo que quieres leer."); text = args.map(read).join(""); } }
      else if (name === "echo") { if (args[0]?.startsWith("-")) fail("Las opciones de echo no están disponibles; usa echo seguido del texto."); text = args.join(" ") + "\n"; }
      else if (name === "cp" || name === "mv") {
        argc(2); const src = resolve(state.cwd, args[0]); let dest = resolve(state.cwd, args[1]);
        if (state.dirs.has(dest)) dest = resolve(dest, src.split("/").pop());
        if (src === dest) fail("Origen y destino son el mismo archivo.");
        const value = read(args[0]); write(dest, value); if (name === "mv") state.files.delete(src);
      } else if (name === "rm") { argc(1); if (args[0].startsWith("-")) fail("Solo se admite rm <archivo>; no hay borrado recursivo."); const full = resolve(state.cwd, args[0]); if (!state.files.has(full)) fail("No existe el archivo: " + args[0]); state.files.delete(full); }
      else if (name === "grep") {
        if ((piped && args.length !== 1) || (!piped && args.length !== 2)) fail("Usa grep <texto> <archivo> o un flujo | grep <texto>.");
        if (args[0].startsWith("-") || /[.*+?^$[\]{}()\\|]/.test(args[0])) fail("grep solo admite una búsqueda literal en esta práctica, sin opciones ni expresiones regulares.");
        const matches = linesOf(piped ? input : read(args[1])).filter(line => line.includes(args[0]));
        text = matches.length ? matches.join("\n") + "\n" : "";
      } else if (name === "wc") {
        if (args[0] !== "-l" || args.length !== (piped ? 1 : 2)) fail("Usa wc -l <archivo> o un flujo | wc -l.");
        const value = piped ? input : read(args[1]); text = String((value.match(/\n/g) || []).length) + (piped ? "" : " " + args[1]) + "\n";
      } else if (name === "head") {
        if (args[0] !== "-n" || !/^\d+$/.test(args[1] || "") || args.length !== (piped ? 2 : 3) || Number(args[1]) > 100) fail("Usa head -n <cantidad hasta 100> <archivo>.");
        const value = piped ? input : read(args[2]); const rows = linesOf(value).slice(0, Number(args[1])); text = rows.length ? rows.join("\n") + "\n" : "";
      } else fail("Comando no disponible: " + name + ". Usa pwd, ls, cd, mkdir, touch, cat, echo, cp, mv, rm, grep, wc o head.");
      return text;
    }
    try {
      if (String(source).length > 30000) fail("El intento supera el tamaño máximo de 30000 caracteres.");
      const lines = String(source).split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith("#"));
      if (!lines.length || lines.length > MAX_COMMANDS) fail("Escribe entre 1 y 40 líneas de comandos.");
      for (const line of lines) {
        const parsed = tokens(line); if (!parsed.length) continue;
        const redirs = parsed.map((t, i) => t.operator && (t.value === ">" || t.value === ">>") ? i : -1).filter(i => i >= 0);
        let dest = null, append = false, redirectionInput;
        if (redirs.length) {
          const at = redirs[0]; if (redirs.length !== 1 || at !== parsed.length - 2 || parsed[at + 1].operator) fail("La redirección debe terminar la línea: comando > archivo.");
          append = parsed[at].value === ">>"; dest = resolve(state.cwd, parsed[at + 1].value); redirectionInput = state.files.get(dest) || ""; parsed.splice(at);
        }
        const groups = [[]];
        for (const token of parsed) { if (token.operator) groups.push([]); else groups[groups.length - 1].push(token.value); }
        if (groups.length > 4) fail("Usa hasta cuatro comandos por tubería.");
        if (groups.length > 1 && groups.some(g => !["cat", "grep", "wc", "head", "echo", "ls", "pwd"].includes(g[0]))) fail("En una tubería solo se admiten comandos de lectura o salida.");
        // La redirección se prepara antes de leer, igual que en un shell: cat a > a vacía a.
        if (dest) write(dest, append ? redirectionInput : "");
        const before = state.cwd; let value = "";
        groups.forEach((group, i) => { value = command(group, value, i > 0); });
        if (dest) write(dest, (append ? redirectionInput : "") + value);
        history.push({ source: line, cwd: before, commands: groups, output: value, destination: dest });
        output.push("$ " + line); if (!dest && value) output.push(value.replace(/\n$/, ""));
        if (output.join("\n").length > MAX_OUTPUT) fail("La salida supera el límite de esta práctica.");
      }
      return finish(null);
    } catch (error) { output.push("Error: " + error.message); return finish(error.message); }
  }
  globalThis.TerminalLab = { run, initial, resolve };
})();

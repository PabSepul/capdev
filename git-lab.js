/*
  Simulador de Git para Código Cero.
  Mantiene un repositorio real en memoria: área de trabajo, área de preparación,
  commits, ramas y remoto. No ejecuta Git ni toca el disco; cuando un comando no
  está disponible lo dice en lugar de inventar una salida.
*/
(() => {
  "use strict";

  const MAX_COMMANDS = 40;

  function shortId(seed) {
    let hash = 0x811c9dc5;
    for (let index = 0; index < seed.length; index += 1) {
      hash ^= seed.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, "0").slice(0, 7);
  }

  function cloneFiles(files) {
    const copy = {};
    for (const [name, file] of Object.entries(files)) copy[name] = { ...file };
    return copy;
  }

  function createState(scenario = {}) {
    const files = {};
    for (const [name, info] of Object.entries(scenario.files || {})) {
      files[name] = {
        content: info.content ?? "",
        committed: info.committed ?? null,
        staged: Boolean(info.staged)
      };
      if (info.staged) files[name].stagedContent = info.stagedContent ?? info.content ?? "";
    }
    return {
      initialized: Boolean(scenario.initialized),
      files,
      commits: (scenario.commits || []).map((commit) => ({ ...commit })),
      branches: { ...(scenario.branches || {}) },
      head: scenario.head || "main",
      remotes: { ...(scenario.remotes || {}) },
      pushed: { ...(scenario.pushed || {}) },
      ignored: [...(scenario.ignored || [])],
      author: scenario.author || "tu-usuario"
    };
  }

  const isIgnored = (state, name) => state.ignored.some((pattern) => {
    if (pattern === name) return true;
    if (pattern.startsWith("*.")) return name.endsWith(pattern.slice(1));
    if (pattern.endsWith("/")) return name.startsWith(pattern);
    return false;
  });

  const listFiles = (state) => Object.keys(state.files).filter((name) => !isIgnored(state, name)).sort();
  const stagedFiles = (state) => listFiles(state).filter((name) => state.files[name].staged);
  const untrackedFiles = (state) => listFiles(state)
    .filter((name) => state.files[name].committed === null && !state.files[name].staged);
  const modifiedFiles = (state) => listFiles(state).filter((name) => {
    const file = state.files[name];
    return file.committed !== null && !file.staged && file.committed !== file.content;
  });

  const headCommit = (state) => state.commits.find((commit) => commit.id === state.branches[state.head]) || null;
  const historyOf = (state, branch = state.head) => {
    const history = [];
    let current = state.branches[branch];
    while (current) {
      const commit = state.commits.find((item) => item.id === current);
      if (!commit) break;
      history.push(commit);
      current = commit.parent;
    }
    return history;
  };

  function fail(message, suggestion) {
    const error = new Error(message);
    error.gitMessage = message;
    error.suggestion = suggestion || "";
    return error;
  }

  function requireRepo(state) {
    if (!state.initialized) {
      throw fail(
        "fatal: no es un repositorio git (ni ninguno de los directorios superiores): .git",
        "Ejecuta git init para crear el repositorio antes de usar otros comandos."
      );
    }
  }

  function parseArguments(line) {
    const tokens = [];
    let current = "";
    let quote = null;
    for (const character of line.trim()) {
      if (quote) {
        if (character === quote) { quote = null; continue; }
        current += character;
        continue;
      }
      if (character === '"' || character === "'") { quote = character; continue; }
      if (character === " ") {
        if (current) { tokens.push(current); current = ""; }
        continue;
      }
      current += character;
    }
    if (quote) throw fail("error: falta cerrar las comillas del mensaje.", 'Escribe el mensaje entre comillas: git commit -m "texto".');
    if (current) tokens.push(current);
    return tokens;
  }

  const COMMANDS = {
    init(state, args, output) {
      if (state.initialized) {
        output.push("Reinicializado un repositorio Git existente en /mi-proyecto/.git/");
        return;
      }
      state.initialized = true;
      state.branches = { main: null };
      state.head = "main";
      output.push("Inicializado repositorio Git vacío en /mi-proyecto/.git/");
      output.push("Rama inicial: main");
    },

    status(state, args, output) {
      requireRepo(state);
      output.push("En la rama " + state.head);
      if (!state.branches[state.head]) output.push("", "No hay commits todavía");

      const preparados = stagedFiles(state);
      const modificados = modifiedFiles(state);
      const sinSeguimiento = untrackedFiles(state);

      if (preparados.length) {
        output.push("", "Cambios a ser confirmados:", '  (usa "git restore --staged <archivo>" para sacarlo del área de preparación)');
        for (const name of preparados) {
          const esNuevo = state.files[name].committed === null;
          output.push("\t" + (esNuevo ? "nuevo archivo:  " : "modificado:     ") + name);
        }
      }
      if (modificados.length) {
        output.push("", "Cambios no preparados para el commit:", '  (usa "git add <archivo>" para actualizar lo que será confirmado)');
        for (const name of modificados) output.push("\tmodificado:     " + name);
      }
      if (sinSeguimiento.length) {
        output.push("", "Archivos sin seguimiento:", '  (usa "git add <archivo>" para incluirlo en lo que será confirmado)');
        for (const name of sinSeguimiento) output.push("\t" + name);
      }
      if (!preparados.length && !modificados.length && !sinSeguimiento.length) {
        output.push("", "nada para hacer commit, el árbol de trabajo está limpio");
      } else if (!preparados.length) {
        output.push("", 'no hay nada agregado al commit pero hay archivos sin seguimiento (usa "git add" para hacerles seguimiento)');
      }
    },

    add(state, args, output) {
      requireRepo(state);
      if (args.length === 0) {
        throw fail("Nada especificado, nada agregado.", 'Indica un archivo o usa git add . para agregar todo lo que cambió.');
      }
      const objetivos = args.includes(".") || args.includes("-A") || args.includes("--all")
        ? [...untrackedFiles(state), ...modifiedFiles(state)]
        : args;
      let agregados = 0;
      for (const name of objetivos) {
        if (!Object.prototype.hasOwnProperty.call(state.files, name)) {
          throw fail(
            "fatal: la ruta '" + name + "' no coincide con ningún archivo",
            "Revisa el nombre en la lista de archivos de la carpeta."
          );
        }
        if (isIgnored(state, name)) {
          throw fail(
            "Las siguientes rutas son ignoradas por alguno de tus archivos .gitignore:\n" + name,
            "Ese archivo está en .gitignore. Quítalo de la lista si de verdad quieres versionarlo."
          );
        }
        state.files[name].staged = true;
        state.files[name].stagedContent = state.files[name].content;
        agregados += 1;
      }
      if (agregados === 0) output.push("No había cambios para agregar al área de preparación.");
    },

    commit(state, args, output) {
      requireRepo(state);
      const flag = args.indexOf("-m");
      if (flag === -1 || !args[flag + 1]) {
        throw fail(
          "error: falta el mensaje del commit",
          'Escribe el mensaje entre comillas: git commit -m "Describe el cambio".'
        );
      }
      const message = args[flag + 1];
      const preparados = stagedFiles(state);
      if (preparados.length === 0) {
        const modificados = modifiedFiles(state);
        const sinSeguimiento = untrackedFiles(state);
        throw fail(
          "En la rama " + state.head + "\nno hay nada agregado al commit"
            + (modificados.length || sinSeguimiento.length ? " pero sí hay cambios sin preparar" : ", el árbol de trabajo está limpio"),
          "Usa git add antes de confirmar: solo se guarda lo que está en el área de preparación."
        );
      }
      const parent = state.branches[state.head];
      const snapshot = {};
      for (const name of listFiles(state)) {
        const file = state.files[name];
        const contenido = file.staged ? file.stagedContent : file.committed;
        if (contenido !== null && contenido !== undefined) snapshot[name] = contenido;
      }
      const id = shortId(message + "|" + (parent || "raiz") + "|" + state.commits.length);
      state.commits.push({ id, message, parent, branch: state.head, files: snapshot, merge: false });
      state.branches[state.head] = id;
      for (const name of preparados) {
        state.files[name].committed = state.files[name].stagedContent;
        state.files[name].staged = false;
        delete state.files[name].stagedContent;
      }
      output.push("[" + state.head + (parent ? "" : " (commit-raíz)") + " " + id + "] " + message);
      output.push(" " + preparados.length + (preparados.length === 1 ? " archivo cambiado" : " archivos cambiados"));
    },

    log(state, args, output) {
      requireRepo(state);
      const history = historyOf(state);
      if (history.length === 0) {
        throw fail(
          "fatal: tu rama actual '" + state.head + "' todavía no tiene ningún commit",
          "Haz tu primer commit para que exista historial."
        );
      }
      const oneline = args.includes("--oneline");
      history.forEach((commit, index) => {
        const etiqueta = index === 0 ? " (HEAD -> " + state.head + ")" : "";
        if (oneline) {
          output.push(commit.id + etiqueta + " " + commit.message);
          return;
        }
        if (index > 0) output.push("");
        output.push("commit " + commit.id + etiqueta);
        output.push("Autor: " + state.author + " <" + state.author + "@ejemplo.cl>");
        output.push("");
        output.push("    " + commit.message);
      });
    },

    diff(state, args, output) {
      requireRepo(state);
      const staged = args.includes("--staged") || args.includes("--cached");
      const modificados = staged ? stagedFiles(state) : listFiles(state).filter(name => {
        const file = state.files[name];
        return (file.committed !== null || file.staged) && file.content !== (file.staged ? file.stagedContent : file.committed);
      });
      if (modificados.length === 0) {
        output.push("Sin diferencias respecto del último commit.");
        return;
      }
      for (const name of modificados) {
        output.push("diff --git a/" + name + " b/" + name);
        output.push("--- a/" + name);
        output.push("+++ b/" + name);
        const file = state.files[name];
        const antes = String((staged ? file.committed : file.staged ? file.stagedContent : file.committed) ?? "").split("\n");
        const ahora = String(staged ? file.stagedContent : file.content).split("\n");
        for (const linea of antes) if (!ahora.includes(linea)) output.push("-" + linea);
        for (const linea of ahora) if (!antes.includes(linea)) output.push("+" + linea);
      }
    },

    restore(state, args, output) {
      requireRepo(state);
      const staged = args.includes("--staged");
      const objetivos = args.filter((value) => !value.startsWith("--"));
      if (objetivos.length === 0) {
        throw fail("error: falta indicar qué archivo restaurar", "Escribe git restore <archivo> o git restore --staged <archivo>.");
      }
      for (const name of objetivos) {
        const file = state.files[name];
        if (!file) throw fail("error: la ruta '" + name + "' no existe", "Revisa el nombre del archivo.");
        if (staged) {
          file.staged = false;
          delete file.stagedContent;
          continue;
        }
        if (file.committed === null) {
          throw fail(
            "error: la ruta '" + name + "' no tiene una versión guardada",
            "Solo puedes restaurar archivos que ya tengan al menos un commit."
          );
        }
        file.content = file.committed;
        file.staged = false;
      }
      if (!staged) output.push("Se descartaron los cambios locales de: " + objetivos.join(", "));
      else output.push("Se sacaron del área de preparación: " + objetivos.join(", "));
    },

    branch(state, args, output) {
      requireRepo(state);
      const nombres = args.filter((value) => !value.startsWith("-"));
      if (nombres.length === 0) {
        for (const nombre of Object.keys(state.branches).sort()) {
          output.push((nombre === state.head ? "* " : "  ") + nombre);
        }
        return;
      }
      const nombre = nombres[0];
      if (state.branches[nombre] !== undefined) {
        throw fail("fatal: la rama '" + nombre + "' ya existe", "Elige otro nombre o cámbiate a ella con git switch " + nombre + ".");
      }
      if (!state.branches[state.head]) {
        throw fail(
          "fatal: no es un nombre de objeto válido: '" + state.head + "'",
          "Necesitas al menos un commit antes de crear ramas."
        );
      }
      state.branches[nombre] = state.branches[state.head];
      output.push("Rama '" + nombre + "' creada desde " + state.branches[state.head] + ".");
    },

    switch(state, args, output) {
      requireRepo(state);
      const crear = args.includes("-c") || args.includes("-b");
      const nombre = args.find((value) => !value.startsWith("-"));
      if (!nombre) throw fail("fatal: falta el nombre de la rama", "Escribe git switch <rama> o git switch -c <rama-nueva>.");
      if (crear) {
        if (state.branches[nombre] !== undefined) {
          throw fail("fatal: la rama '" + nombre + "' ya existe", "Cámbiate con git switch " + nombre + " sin la opción -c.");
        }
        if (!state.branches[state.head]) {
          throw fail("fatal: todavía no hay commits", "Haz el primer commit antes de crear una rama.");
        }
        state.branches[nombre] = state.branches[state.head];
        state.head = nombre;
        output.push("Cambiado a nueva rama '" + nombre + "'");
        return;
      }
      if (state.branches[nombre] === undefined) {
        throw fail("fatal: no existe la rama '" + nombre + "'", "Revisa las ramas disponibles con git branch.");
      }
      const commit = state.commits.find((item) => item.id === state.branches[nombre]);
      if (commit) {
        for (const [name, file] of Object.entries(state.files)) {
          const target = commit.files[name] ?? null;
          const changed = file.staged || file.content !== file.committed;
          if (changed && target !== file.committed && (file.committed !== null || target !== null)) {
            throw fail("No puedo cambiar de rama: se sobrescribirían cambios en " + name, "Confirma tus cambios o restáuralos conscientemente antes de cambiar de rama.");
          }
        }
      }
      state.head = nombre;
      if (commit) {
        for (const name of Object.keys(state.files)) {
          if (Object.prototype.hasOwnProperty.call(commit.files, name)) {
            if (state.files[name].committed === commit.files[name]) continue;
            state.files[name].content = commit.files[name];
            state.files[name].committed = commit.files[name];
            state.files[name].staged = false;
            delete state.files[name].stagedContent;
          } else if (state.files[name].committed !== null) {
            delete state.files[name];
          }
        }
        for (const [name, contenido] of Object.entries(commit.files)) {
          if (!state.files[name]) state.files[name] = { content: contenido, committed: contenido, staged: false };
        }
      }
      output.push("Cambiado a rama '" + nombre + "'");
    },

    checkout(state, args, output) {
      if (args.includes("-b")) return COMMANDS.switch(state, args, output);
      return COMMANDS.switch(state, args.filter((value) => value !== "-b"), output);
    },

    merge(state, args, output) {
      requireRepo(state);
      const nombre = args.find((value) => !value.startsWith("-"));
      if (!nombre) throw fail("fatal: falta el nombre de la rama a unir", "Escribe git merge <rama>.");
      if (state.branches[nombre] === undefined) {
        throw fail("merge: " + nombre + " - no es algo que podamos unir", "Revisa el nombre con git branch.");
      }
      if (nombre === state.head) {
        throw fail("Ya está actualizado.", "Cámbiate primero a la rama que recibirá los cambios.");
      }
      const destino = state.branches[state.head];
      const origen = state.branches[nombre];
      const historiaDestino = historyOf(state, state.head).map((commit) => commit.id);
      const historiaOrigen = historyOf(state, nombre).map((commit) => commit.id);
      if (historiaDestino.includes(origen)) {
        output.push("Ya está actualizado.");
        return;
      }
      const commitOrigen = state.commits.find((item) => item.id === origen);
      if (historiaOrigen.includes(destino)) {
        state.branches[state.head] = origen;
        for (const [name, contenido] of Object.entries(commitOrigen.files)) {
          state.files[name] = { content: contenido, committed: contenido, staged: false };
        }
        output.push("Actualizando " + (destino || "0000000") + ".." + origen);
        output.push("Fast-forward");
        output.push(" " + Object.keys(commitOrigen.files).length + " archivos en la rama unida");
        return;
      }
      const message = "Merge branch '" + nombre + "'";
      const id = shortId(message + destino + origen);
      const files = { ...(state.commits.find((item) => item.id === destino)?.files || {}), ...commitOrigen.files };
      state.commits.push({ id, message, parent: destino, branch: state.head, files, merge: true, second: origen });
      state.branches[state.head] = id;
      for (const [name, contenido] of Object.entries(files)) {
        state.files[name] = { content: contenido, committed: contenido, staged: false };
      }
      output.push("Uniendo con estrategia 'ort'.");
      output.push(message);
      output.push(" " + Object.keys(commitOrigen.files).length + " archivos incorporados");
    },

    remote(state, args, output) {
      requireRepo(state);
      if (args[0] === "add") {
        const nombre = args[1];
        const url = args[2];
        if (!nombre || !url) {
          throw fail("uso: git remote add <nombre> <url>", "Por ejemplo: git remote add origin https://github.com/tu-usuario/mi-proyecto.git");
        }
        if (state.remotes[nombre]) {
          throw fail("error: el remoto " + nombre + " ya existe.", "Usa git remote -v para revisar los remotos configurados.");
        }
        state.remotes[nombre] = url;
        output.push("Remoto '" + nombre + "' agregado: " + url);
        return;
      }
      const nombres = Object.keys(state.remotes);
      if (nombres.length === 0) {
        output.push("No hay remotos configurados.");
        return;
      }
      for (const nombre of nombres) {
        output.push(nombre + "\t" + state.remotes[nombre] + " (fetch)");
        output.push(nombre + "\t" + state.remotes[nombre] + " (push)");
      }
    },

    push(state, args, output) {
      requireRepo(state);
      const positivos = args.filter((value) => !value.startsWith("-"));
      const remoto = positivos[0] || "origin";
      const rama = positivos[1] || state.head;
      if (!state.remotes[remoto]) {
        throw fail(
          "fatal: '" + remoto + "' no parece ser un repositorio git",
          "Primero conecta el remoto: git remote add origin <url del repositorio en GitHub>."
        );
      }
      if (!state.branches[rama]) {
        throw fail("error: src refspec " + rama + " no coincide con ninguna referencia", "Haz al menos un commit antes de publicar.");
      }
      const previo = state.pushed[remoto]?.[rama];
      if (previo === state.branches[rama]) {
        output.push("Todo actualizado");
        return;
      }
      state.pushed[remoto] = { ...(state.pushed[remoto] || {}), [rama]: state.branches[rama] };
      const total = historyOf(state, rama).length;
      output.push("Enumerando objetos: " + (total * 3) + ", listo.");
      output.push("A " + state.remotes[remoto]);
      output.push(previo ? "   " + previo + ".." + state.branches[rama] + "  " + rama + " -> " + rama
        : " * [nueva rama]      " + rama + " -> " + rama);
      if (args.includes("-u") || args.includes("--set-upstream")) {
        output.push("La rama '" + rama + "' está configurada para hacer seguimiento a '" + remoto + "/" + rama + "'.");
      }
    }
  };

  const ALIASES = {
    "git status": "status", "git log": "log", "git init": "init"
  };

  function runCommand(state, line, output) {
    const tokens = parseArguments(line);
    if (tokens.length === 0) return;
    if (tokens[0] !== "git") {
      throw fail(
        tokens[0] + ": el laboratorio solo entiende comandos que empiezan con git",
        "Los archivos ya están creados: concéntrate en los comandos de Git."
      );
    }
    const nombre = tokens[1];
    if (!nombre) {
      throw fail("uso: git <comando> [opciones]", "Prueba con git status para ver el estado del repositorio.");
    }
    const command = COMMANDS[nombre];
    if (!command) {
      throw fail(
        "git: '" + nombre + "' no es un comando de git en este laboratorio",
        "Disponibles: init, status, add, commit, log, diff, restore, branch, switch, checkout, merge, remote y push."
      );
    }
    command(state, tokens.slice(2), output);
  }

  function run(source, scenario) {
    const state = createState(scenario);
    const output = [];
    const lines = String(source).split(/\r?\n/)
      .map((line) => line.replace(/^\s*\$\s*/, "").trim())
      .filter((line) => line && !line.startsWith("#"));

    if (lines.length === 0) {
      return { output: [], text: "Escribe al menos un comando de Git y ejecuta.", error: "Sin comandos", state, commands: [] };
    }
    if (lines.length > MAX_COMMANDS) {
      return { output: [], text: "Demasiados comandos en un solo intento.", error: "Demasiados comandos", state, commands: [] };
    }

    for (const line of lines) {
      output.push("$ " + line);
      try {
        runCommand(state, line, output);
      } catch (error) {
        output.push(error.gitMessage || error.message);
        if (error.suggestion) output.push("↳ " + error.suggestion);
        return {
          output,
          text: output.join("\n"),
          error: error.gitMessage || error.message,
          state,
          commands: lines
        };
      }
      output.push("");
    }
    while (output.length && output[output.length - 1] === "") output.pop();
    return { output, text: output.join("\n"), error: null, state, commands: lines };
  }

  globalThis.GitLab = {
    run,
    createState,
    helpers: { listFiles, stagedFiles, untrackedFiles, modifiedFiles, historyOf, headCommit, isIgnored }
  };
})();

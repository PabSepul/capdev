/*
  Laboratorio de expresiones regulares.
  Ejecuta el motor de expresiones regulares real del navegador (sabor ECMAScript)
  sobre textos de muestra acotados. No usa eval ni Function: el patrón se compila
  con RegExp y se descarta cualquier patrón con riesgo de retroceso catastrófico.
*/
(() => {
  "use strict";

  const MAX_PATTERN = 200;
  const MAX_TEXT = 600;
  const MAX_MATCHES = 60;
  const FLAGS = "gimsuy";

  function fail(message, ayuda) {
    const error = new Error(message);
    error.friendly = true;
    error.ayuda = ayuda || "";
    return error;
  }

  /* Rechaza las formas clásicas de retroceso catastrófico: un cuantificador
     aplicado a un grupo que ya contiene otro cuantificador sin límite. */
  function riesgoDeRetroceso(pattern) {
    let profundidad = 0;
    const grupos = [];
    for (let index = 0; index < pattern.length; index += 1) {
      const caracter = pattern[index];
      if (caracter === "\\") { index += 1; continue; }
      if (caracter === "[") {
        while (index < pattern.length && pattern[index] !== "]") {
          if (pattern[index] === "\\") index += 1;
          index += 1;
        }
        continue;
      }
      if (caracter === "(") { profundidad += 1; grupos.push({ inicio: index, cuantificado: false }); continue; }
      if (caracter === ")") {
        profundidad = Math.max(0, profundidad - 1);
        const grupo = grupos.pop();
        const siguiente = pattern[index + 1];
        if (grupo && grupo.cuantificado && (siguiente === "*" || siguiente === "+" || siguiente === "{")) return true;
        continue;
      }
      if ((caracter === "*" || caracter === "+") && grupos.length) grupos[grupos.length - 1].cuantificado = true;
    }
    return false;
  }

  function parseLiteral(linea) {
    const texto = linea.trim();
    if (!texto.startsWith("/")) {
      throw fail(
        "El patrón debe escribirse entre barras, como en JavaScript.",
        "Por ejemplo: /\\d+/g . La primera barra abre el patrón y la segunda lo cierra."
      );
    }
    let cierre = -1;
    for (let index = 1; index < texto.length; index += 1) {
      if (texto[index] === "\\") { index += 1; continue; }
      if (texto[index] === "[") {
        while (index < texto.length && texto[index] !== "]") {
          if (texto[index] === "\\") index += 1;
          index += 1;
        }
        continue;
      }
      if (texto[index] === "/") { cierre = index; break; }
    }
    if (cierre === -1) {
      throw fail("Falta la barra que cierra el patrón.", "La forma completa es /patrón/banderas, por ejemplo /hola/i .");
    }
    const pattern = texto.slice(1, cierre);
    const flags = texto.slice(cierre + 1);
    if (!pattern) throw fail("El patrón está vacío.", "Escribe qué quieres buscar entre las barras.");
    if (pattern.length > MAX_PATTERN) throw fail("El patrón supera los " + MAX_PATTERN + " caracteres de esta práctica.");
    for (const bandera of flags) {
      if (!FLAGS.includes(bandera)) {
        throw fail("La bandera “" + bandera + "” no existe.", "Disponibles: g (todas), i (sin distinguir mayúsculas), m (multilínea), s, u e y.");
      }
    }
    if (new Set(flags).size !== flags.length) throw fail("Hay una bandera repetida.", "Cada bandera se escribe una sola vez.");
    if (riesgoDeRetroceso(pattern)) {
      throw fail(
        "Ese patrón puede tardar demasiado: hay un cuantificador aplicado sobre un grupo que ya repite.",
        "Formas como (\\d+)+ obligan al motor a probar millones de combinaciones. Simplifica el grupo interno."
      );
    }
    return { pattern, flags };
  }

  function describirGrupos(match) {
    const numerados = match.slice(1).map((valor, indice) => "$" + (indice + 1) + " = " + (valor === undefined ? "(sin capturar)" : JSON.stringify(valor)));
    const nombrados = Object.entries(match.groups || {}).map(([nombre, valor]) => nombre + " = " + (valor === undefined ? "(sin capturar)" : JSON.stringify(valor)));
    return [...numerados, ...nombrados];
  }

  function run(source, scenario) {
    const texto = String(scenario?.texto ?? "").slice(0, MAX_TEXT);
    const output = [];
    const vacio = { text: "", output: [], error: null, pattern: "", flags: "", matches: [], reemplazo: null, resultado: null, texto };

    let pattern;
    let flags;
    let reemplazo = null;
    try {
      const lineas = String(source).split(/\r?\n/).filter((linea) => linea.trim() && !linea.trim().startsWith("#"));
      if (!lineas.length) throw fail("Escribe un patrón para probarlo.", "Empieza con algo como /palabra/ .");
      if (lineas.length > 2) throw fail("Usa una línea para el patrón y, si la misión lo pide, otra para el reemplazo.");
      ({ pattern, flags } = parseLiteral(lineas[0]));
      if (lineas[1]) {
        const marca = lineas[1].match(/^\s*reemplazo\s*:\s*([\s\S]*)$/i);
        if (!marca) {
          throw fail(
            "No entiendo la segunda línea.",
            'Para reemplazar escribe: reemplazo: texto nuevo (puedes usar $1 para reutilizar un grupo).'
          );
        }
        reemplazo = marca[1].replace(/^"(.*)"$/, "$1");
      }
    } catch (error) {
      const mensaje = error.friendly ? error.message : "No pude leer el patrón.";
      return { ...vacio, error: mensaje, text: mensaje + (error.ayuda ? "\n↳ " + error.ayuda : "") };
    }

    let expresion;
    try {
      expresion = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
    } catch (error) {
      const mensaje = "El patrón no es válido: " + error.message;
      return { ...vacio, pattern, flags, error: mensaje, text: mensaje + "\n↳ Revisa los paréntesis, los corchetes y las barras invertidas." };
    }

    const matches = [];
    let coincidencia = expresion.exec(texto);
    while (coincidencia) {
      matches.push({
        valor: coincidencia[0],
        indice: coincidencia.index,
        grupos: coincidencia.slice(1).map((valor) => (valor === undefined ? null : valor)),
        nombrados: { ...(coincidencia.groups || {}) },
        descripcion: describirGrupos(coincidencia)
      });
      if (matches.length >= MAX_MATCHES) break;
      if (coincidencia[0] === "") expresion.lastIndex += 1;
      if (!flags.includes("g")) break;
      coincidencia = expresion.exec(texto);
    }

    output.push("Patrón: /" + pattern + "/" + flags);
    output.push("Texto de prueba: " + texto.length + " caracteres");
    output.push("");
    if (matches.length === 0) {
      output.push("Sin coincidencias.");
    } else {
      output.push(matches.length === 1 ? "1 coincidencia:" : matches.length + " coincidencias:");
      matches.forEach((item, indice) => {
        output.push("  " + (indice + 1) + ". " + JSON.stringify(item.valor) + "  (posición " + item.indice + ")");
        for (const detalle of item.descripcion) output.push("       " + detalle);
      });
    }

    let resultado = null;
    if (reemplazo !== null) {
      const reemplazador = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      resultado = texto.replace(reemplazador, reemplazo);
      output.push("");
      output.push("Texto resultante:");
      for (const linea of resultado.split("\n")) output.push("  " + linea);
    }

    return {
      text: output.join("\n"),
      output,
      error: null,
      pattern,
      flags,
      matches,
      reemplazo,
      resultado,
      texto
    };
  }

  globalThis.RegexLab = { run, MAX_TEXT };
})();

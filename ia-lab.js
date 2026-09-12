/*
  Laboratorio de inteligencia artificial.
  Calcula de verdad lo que se puede calcular: tokens aproximados, costo, similitud
  entre textos, recuperación de documentos y el efecto de la temperatura sobre una
  distribución. No genera texto ni simula respuestas de un modelo: cuando algo
  depende de un modelo real, lo dice en lugar de inventarlo.
*/
(() => {
  "use strict";

  const MAX_TEXTO = 1200;

  /* Precios de ejemplo para practicar el cálculo. No son tarifas de ningún proveedor. */
  const MODELOS = {
    rapido: { nombre: "rapido", clpPorMilTokens: 0.5, descripcion: "respuestas cortas y tareas simples" },
    avanzado: { nombre: "avanzado", clpPorMilTokens: 12, descripcion: "razonamiento largo y tareas complejas" }
  };

  const CORPUS = [
    { id: "doc-1", titulo: "Cambio de plan", texto: "Puedes cambiar de plan desde la sección Suscripción. El cambio se aplica en el siguiente ciclo de facturación." },
    { id: "doc-2", titulo: "Cancelar la suscripción", texto: "Para cancelar la suscripción entra a Suscripción y presiona Cancelar. Conservas el acceso hasta que termine el mes pagado." },
    { id: "doc-3", titulo: "Medios de pago", texto: "Aceptamos tarjeta de crédito y débito. La boleta llega por correo el mismo día del cobro." },
    { id: "doc-4", titulo: "Recuperar contraseña", texto: "Si olvidaste tu contraseña usa la opción Recuperar acceso. Te enviamos un enlace al correo registrado." },
    { id: "doc-5", titulo: "Certificados", texto: "El certificado se descarga al completar todos los módulos y aprobar los exámenes de la ruta." }
  ];

  const VACIAS = new Set(["el", "la", "los", "las", "un", "una", "de", "del", "y", "o", "a", "en", "para", "por", "con",
    "que", "se", "mi", "tu", "su", "al", "lo", "es", "son", "como", "cuando", "donde", "cual", "cuales", "me", "te"]);

  const CANDIDATOS = [
    { token: "hola", logit: 2.5 },
    { token: "buenas", logit: 1.8 },
    { token: "estimado", logit: 0.9 },
    { token: "qué", logit: 0.2 }
  ];

  function fail(message, ayuda) {
    const error = new Error(message);
    error.friendly = true;
    error.ayuda = ayuda || "";
    return error;
  }

  const normalizar = (texto) => String(texto).toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .split(/\s+/).filter((palabra) => palabra && !VACIAS.has(palabra));

  /* Aproximación declarada: separa por espacios y signos, y parte las palabras largas.
     No reproduce el tokenizador exacto de ningún modelo. */
  function tokenizar(texto) {
    const piezas = String(texto).match(/[\wáéíóúñü]+|[^\s\wáéíóúñü]/gi) || [];
    const tokens = [];
    for (const pieza of piezas) {
      if (pieza.length <= 6) { tokens.push(pieza); continue; }
      for (let indice = 0; indice < pieza.length; indice += 4) tokens.push(pieza.slice(indice, indice + 4));
    }
    return tokens;
  }

  function similitud(a, b) {
    const cuentaA = new Map();
    const cuentaB = new Map();
    for (const palabra of normalizar(a)) cuentaA.set(palabra, (cuentaA.get(palabra) || 0) + 1);
    for (const palabra of normalizar(b)) cuentaB.set(palabra, (cuentaB.get(palabra) || 0) + 1);
    let producto = 0;
    for (const [palabra, valor] of cuentaA) producto += valor * (cuentaB.get(palabra) || 0);
    const norma = (mapa) => Math.sqrt([...mapa.values()].reduce((total, valor) => total + valor * valor, 0));
    const divisor = norma(cuentaA) * norma(cuentaB);
    return divisor === 0 ? 0 : Math.round((producto / divisor) * 1000) / 1000;
  }

  function analizarPrompt(texto) {
    const plano = String(texto).toLowerCase();
    const criterios = [
      { clave: "rol", etiqueta: "Define un rol", cumple: /\b(eres|actúa como|actua como|como un[ao]?|tu rol)\b/.test(plano),
        consejo: "Empieza diciendo qué papel debe tomar: “Eres un tutor de matemáticas”." },
      { clave: "tarea", etiqueta: "Pide una tarea concreta", cumple: /\b(explica|resume|traduce|clasifica|escribe|corrige|compara|genera|analiza|responde|lista)\b/.test(plano),
        consejo: "Usa un verbo claro: explica, resume, clasifica, corrige." },
      { clave: "contexto", etiqueta: "Entrega contexto o datos", cumple: /\b(contexto|el siguiente|a continuación|a continuacion|estos datos|el texto|el documento|el usuario)\b/.test(plano),
        consejo: "Indica sobre qué material debe trabajar: “usando el siguiente texto…”." },
      { clave: "formato", etiqueta: "Especifica el formato de salida", cumple: /\b(formato|en json|lista|viñetas|vinetas|tabla|máximo|maximo|párrafo|parrafo|palabras|pasos)\b/.test(plano),
        consejo: "Di cómo quieres la respuesta: “en una lista de 3 puntos” o “máximo 80 palabras”." },
      { clave: "restriccion", etiqueta: "Pone límites o condiciones", cumple: /\b(no inventes|si no sabes|no lo sabes|no lo sé|no lo se|no está en|no esta en|no aparece|solo|únicamente|unicamente|evita|sin usar|no incluyas)\b/.test(plano),
        consejo: "Acota lo que no debe hacer: “si no está en el texto, responde que no lo sabes”." },
      { clave: "ejemplo", etiqueta: "Muestra un ejemplo", cumple: /\b(por ejemplo|ejemplo:|ejemplos:)\b/.test(plano),
        consejo: "Un ejemplo de entrada y salida reduce las respuestas fuera de formato." }
    ];
    const puntaje = criterios.filter((criterio) => criterio.cumple).length;
    return { criterios, puntaje, total: criterios.length };
  }

  function softmax(temperatura) {
    if (!Number.isFinite(temperatura) || temperatura <= 0) {
      throw fail("La temperatura debe ser un número mayor que 0.", "Prueba con 0.2 para respuestas predecibles o 1.2 para más variedad.");
    }
    const ajustados = CANDIDATOS.map((item) => item.logit / temperatura);
    const maximo = Math.max(...ajustados);
    const exponenciales = ajustados.map((valor) => Math.exp(valor - maximo));
    const suma = exponenciales.reduce((total, valor) => total + valor, 0);
    return CANDIDATOS.map((item, indice) => ({
      token: item.token,
      probabilidad: Math.round((exponenciales[indice] / suma) * 1000) / 10
    }));
  }

  function run(source) {
    const output = [];
    const acciones = [];
    const texto = String(source);
    if (texto.length > MAX_TEXTO) {
      const mensaje = "El intento supera los " + MAX_TEXTO + " caracteres de esta práctica.";
      return { text: mensaje, output: [mensaje], error: mensaje, acciones };
    }

    const lineas = texto.split(/\r?\n/);
    let ultimaBusqueda = null;

    try {
      for (let indice = 0; indice < lineas.length; indice += 1) {
        const linea = lineas[indice].trim();
        if (!linea || linea.startsWith("#")) continue;
        const [comando, ...resto] = linea.split(/\s+/);
        const argumento = linea.slice(comando.length).trim();
        const nombre = comando.toLowerCase();

        if (nombre === "prompt") {
          const cuerpo = lineas.slice(indice + 1).join("\n").trim();
          if (!cuerpo) throw fail("Después de prompt falta el texto que quieres analizar.", "Escribe prompt en una línea y tu instrucción en las siguientes.");
          const analisis = analizarPrompt(cuerpo);
          acciones.push({ tipo: "prompt", texto: cuerpo, ...analisis });
          output.push("> prompt (" + tokenizar(cuerpo).length + " tokens aproximados)");
          output.push("Estructura: " + analisis.puntaje + " de " + analisis.total + " elementos presentes");
          for (const criterio of analisis.criterios) {
            output.push("  " + (criterio.cumple ? "✓" : "·") + " " + criterio.etiqueta + (criterio.cumple ? "" : " — " + criterio.consejo));
          }
          output.push("");
          output.push("Este análisis revisa la estructura del prompt, no la calidad de la respuesta:");
          output.push("el laboratorio no ejecuta ningún modelo de lenguaje.");
          break;
        }

        if (nombre === "tokenizar") {
          if (!argumento) throw fail("Indica el texto que quieres medir.", 'Por ejemplo: tokenizar Hola, ¿cómo estás?');
          const tokens = tokenizar(argumento);
          acciones.push({ tipo: "tokenizar", texto: argumento, tokens: tokens.length, lista: tokens });
          output.push("> tokenizar");
          output.push("Texto: " + JSON.stringify(argumento));
          output.push("Tokens aproximados: " + tokens.length);
          output.push("Piezas: " + tokens.slice(0, 20).map((token) => JSON.stringify(token)).join(" ") + (tokens.length > 20 ? " …" : ""));
          output.push("(Aproximación del laboratorio: separa por signos y parte las palabras largas.)");
        } else if (nombre === "costo") {
          const numero = Number(resto[0]);
          const modelo = MODELOS[(resto[1] || "rapido").toLowerCase()];
          if (!Number.isFinite(numero) || numero <= 0) throw fail("Indica cuántos tokens quieres cobrar.", "Por ejemplo: costo 1200 avanzado");
          if (!modelo) throw fail("No conozco ese modelo.", "Los modelos de ejemplo son rapido y avanzado.");
          const total = Math.round((numero / 1000) * modelo.clpPorMilTokens * 100) / 100;
          acciones.push({ tipo: "costo", tokens: numero, modelo: modelo.nombre, total });
          output.push("> costo " + numero + " " + modelo.nombre);
          output.push(modelo.nombre + ": " + modelo.clpPorMilTokens + " CLP por cada 1000 tokens (" + modelo.descripcion + ")");
          output.push("Total: " + total + " CLP");
          output.push("(Precios de ejemplo para practicar el cálculo, no tarifas reales.)");
        } else if (nombre === "buscar") {
          if (!argumento) throw fail("Indica qué quieres buscar en la base de conocimiento.", 'Por ejemplo: buscar cómo cancelo mi plan');
          const ranking = CORPUS
            .map((documento) => ({ ...documento, puntaje: similitud(argumento, documento.titulo + " " + documento.texto) }))
            .sort((izquierda, derecha) => derecha.puntaje - izquierda.puntaje);
          ultimaBusqueda = { consulta: argumento, ranking };
          acciones.push({ tipo: "buscar", consulta: argumento, ranking });
          output.push("> buscar " + JSON.stringify(argumento));
          for (const documento of ranking) {
            output.push("  " + documento.puntaje.toFixed(3) + "  " + documento.id + "  " + documento.titulo);
          }
          output.push("(Similitud del coseno sobre palabras, sin modelo de embeddings.)");
        } else if (nombre === "comparar") {
          const partes = argumento.split("|");
          if (partes.length !== 2 || !partes[0].trim() || !partes[1].trim()) {
            throw fail("Compara dos textos separados por una barra vertical.", "Por ejemplo: comparar cambiar de plan | modificar mi suscripción");
          }
          const puntaje = similitud(partes[0], partes[1]);
          acciones.push({ tipo: "comparar", a: partes[0].trim(), b: partes[1].trim(), puntaje });
          output.push("> comparar");
          output.push("  A: " + partes[0].trim());
          output.push("  B: " + partes[1].trim());
          output.push("Similitud: " + puntaje.toFixed(3) + " (0 = nada en común, 1 = mismas palabras)");
        } else if (nombre === "temperatura") {
          const valor = Number(resto[0]);
          const distribucion = softmax(valor);
          acciones.push({ tipo: "temperatura", valor, distribucion });
          output.push("> temperatura " + valor);
          for (const item of distribucion) {
            const barra = "█".repeat(Math.max(0, Math.round(item.probabilidad / 4)));
            output.push("  " + item.token.padEnd(9) + String(item.probabilidad).padStart(5) + " %  " + barra);
          }
          output.push("(Softmax real sobre una lista fija de candidatos; no se elige ninguno al azar.)");
        } else if (nombre === "citar") {
          if (!ultimaBusqueda) throw fail("Primero busca en la base de conocimiento.", "Usa buscar antes de citar para saber qué documentos existen.");
          if (!argumento) throw fail("Escribe la respuesta que quieres revisar.", "Por ejemplo: citar Puedes cancelar desde Suscripción [doc-2]");
          const citados = [...new Set((argumento.match(/doc-\d+/g) || []))];
          const existentes = citados.filter((id) => CORPUS.some((documento) => documento.id === id));
          const inventados = citados.filter((id) => !existentes.includes(id));
          const relevantes = ultimaBusqueda.ranking.filter((documento) => documento.puntaje > 0).slice(0, 2).map((documento) => documento.id);
          const respaldadas = existentes.filter((id) => relevantes.includes(id));
          acciones.push({ tipo: "citar", texto: argumento, citados, existentes, inventados, relevantes, respaldadas });
          output.push("> citar");
          output.push("Documentos citados: " + (citados.length ? citados.join(", ") : "ninguno"));
          if (inventados.length) output.push("No existen en la base: " + inventados.join(", "));
          output.push("Mejores resultados de la última búsqueda: " + relevantes.join(", "));
          output.push(respaldadas.length
            ? "La respuesta se apoya en: " + respaldadas.join(", ")
            : "La respuesta no cita ninguno de los documentos recuperados.");
        } else {
          throw fail(
            "No conozco el comando “" + comando + "”.",
            "Disponibles: tokenizar, costo, buscar, comparar, temperatura, citar y prompt."
          );
        }
        output.push("");
      }
    } catch (error) {
      const mensaje = error.friendly ? error.message : "No pude ejecutar el intento.";
      output.push(mensaje);
      if (error.ayuda) output.push("↳ " + error.ayuda);
      return { text: output.join("\n"), output, error: mensaje, acciones };
    }

    while (output.length && output[output.length - 1] === "") output.pop();
    if (!output.length) {
      const mensaje = "Escribe al menos una instrucción para el laboratorio.";
      return { text: mensaje + "\n↳ Prueba con: tokenizar Hola mundo", output: [mensaje], error: mensaje, acciones };
    }
    return { text: output.join("\n"), output, error: null, acciones };
  }

  globalThis.IaLab = { run, CORPUS, MODELOS, tokenizar, similitud, analizarPrompt };
})();

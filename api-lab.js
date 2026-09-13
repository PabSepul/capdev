/*
  Laboratorio de APIs para Código Cero.
  Simula un servidor HTTP con datos en memoria: rutas, parámetros, cabeceras,
  cuerpos JSON y códigos de estado reales. No sale a la red ni usa fetch: cada
  ejecución parte de los mismos datos, así el resultado siempre es comprobable.
*/
(() => {
  "use strict";

  const TOKEN = "clave-demo-2026";
  const MAX_REQUESTS = 12;
  const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

  function datosIniciales() {
    return {
      cursos: [
        { id: 1, nombre: "Python", nivel: "Inicial", categoria: "Lenguajes", duracion: 12, inscritos: 320 },
        { id: 2, nombre: "HTML y CSS", nivel: "Inicial", categoria: "Web", duracion: 6, inscritos: 410 },
        { id: 3, nombre: "JavaScript", nivel: "Inicial", categoria: "Web", duracion: 8, inscritos: 275 },
        { id: 4, nombre: "SQL", nivel: "Inicial", categoria: "Datos", duracion: 5, inscritos: 190 },
        { id: 5, nombre: "Git", nivel: "Siguiente", categoria: "Herramientas", duracion: 4, inscritos: 150 },
        { id: 6, nombre: "APIs", nivel: "Siguiente", categoria: "Web", duracion: 9, inscritos: 96 },
        { id: 7, nombre: "Datos con Python", nivel: "Avanzado", categoria: "Datos", duracion: 14, inscritos: 64 }
      ],
      estudiantes: [
        { id: 1, nombre: "Ada", ciudad: "Santiago", curso_id: 1 },
        { id: 2, nombre: "Grace", ciudad: "Valparaíso", curso_id: 1 },
        { id: 3, nombre: "Linus", ciudad: "Santiago", curso_id: 3 },
        { id: 4, nombre: "Katherine", ciudad: "Concepción", curso_id: 4 }
      ]
    };
  }

  const TEXTOS = {
    200: "OK", 201: "Created", 204: "No Content", 400: "Bad Request", 401: "Unauthorized",
    404: "Not Found", 405: "Method Not Allowed", 415: "Unsupported Media Type"
  };

  function parseRequests(source) {
    const lines = String(source).replace(/\r\n?/g, "\n").split("\n");
    const bloques = [];
    let actual = null;
    for (const raw of lines) {
      const line = raw.replace(/^\s*###.*$/, "").trimEnd();
      const inicio = line.match(/^\s*(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\S+)\s*$/i);
      if (inicio) {
        if (actual) bloques.push(actual);
        actual = { metodo: inicio[1].toUpperCase(), url: inicio[2], headers: {}, cuerpo: "" };
        continue;
      }
      if (!actual) {
        if (line.trim() && !line.trim().startsWith("#")) {
          const suelto = line.trim().split(/\s+/)[0].toUpperCase();
          const pista = METHODS.includes(suelto)
            ? "Escribe el método y la ruta en la misma línea, por ejemplo: GET /cursos"
            : "Cada petición empieza con el método y la ruta, por ejemplo: GET /cursos";
          return { error: "No encontré el método HTTP al comienzo de la petición.", pista };
        }
        continue;
      }
      const cabecera = line.match(/^([A-Za-z][A-Za-z0-9-]*)\s*:\s*(.*)$/);
      if (cabecera && !actual.cuerpo && !actual.enCuerpo) {
        actual.headers[cabecera[1].toLowerCase()] = cabecera[2].trim();
        continue;
      }
      if (!line.trim() && !actual.cuerpo) { actual.enCuerpo = true; continue; }
      actual.enCuerpo = true;
      actual.cuerpo += (actual.cuerpo ? "\n" : "") + line;
    }
    if (actual) bloques.push(actual);
    if (bloques.length === 0) {
      return { error: "Todavía no escribiste ninguna petición.", pista: "Empieza con una línea como GET /cursos" };
    }
    if (bloques.length > MAX_REQUESTS) {
      return { error: "Demasiadas peticiones en un solo intento.", pista: "Prueba con " + MAX_REQUESTS + " o menos." };
    }
    return { bloques };
  }

  function parseUrl(url) {
    const [ruta, consulta = ""] = url.split("?");
    const params = {};
    for (const par of consulta.split("&")) {
      if (!par) continue;
      const [clave, valor = ""] = par.split("=");
      params[decodeURIComponent(clave)] = decodeURIComponent(valor.replace(/\+/g, " "));
    }
    return { ruta: ruta.replace(/\/+$/, "") || "/", params };
  }

  const respuesta = (status, cuerpo, headers = {}) => ({ status, texto: TEXTOS[status] || "", cuerpo, headers });
  const error = (status, mensaje, ayuda) => respuesta(status, ayuda ? { error: mensaje, ayuda } : { error: mensaje });

  function autorizado(peticion) {
    const cabecera = peticion.headers.authorization || "";
    if (!cabecera) return { ok: false, motivo: "Falta la cabecera Authorization." };
    if (!/^Bearer\s+/i.test(cabecera)) return { ok: false, motivo: "El formato correcto es: Authorization: Bearer <token>." };
    if (cabecera.replace(/^Bearer\s+/i, "").trim() !== TOKEN) return { ok: false, motivo: "El token no es válido." };
    return { ok: true };
  }

  function leerCuerpo(peticion) {
    if (!peticion.cuerpo.trim()) {
      return { error: error(400, "El cuerpo de la petición está vacío.", "Envía un objeto JSON con los datos del recurso.") };
    }
    const tipo = peticion.headers["content-type"] || "";
    if (tipo && !tipo.includes("application/json")) {
      return { error: error(415, "Solo se acepta application/json.", "Agrega la cabecera Content-Type: application/json.") };
    }
    try {
      const datos = JSON.parse(peticion.cuerpo);
      if (datos === null || typeof datos !== "object" || Array.isArray(datos)) {
        return { error: error(400, "El cuerpo debe ser un objeto JSON.", 'Por ejemplo: {"nombre": "Go", "nivel": "Inicial"}') };
      }
      return { datos };
    } catch {
      return { error: error(400, "El JSON del cuerpo no es válido.", "Revisa las comillas dobles, las comas y las llaves.") };
    }
  }

  function validarCurso(datos, parcial) {
    const faltan = [];
    if (!parcial || Object.prototype.hasOwnProperty.call(datos, "nombre")) {
      if (typeof datos.nombre !== "string" || !datos.nombre.trim()) faltan.push("nombre (texto)");
    }
    if (!parcial || Object.prototype.hasOwnProperty.call(datos, "nivel")) {
      if (!["Inicial", "Siguiente", "Avanzado"].includes(datos.nivel)) faltan.push("nivel (Inicial, Siguiente o Avanzado)");
    }
    if (Object.prototype.hasOwnProperty.call(datos, "duracion") && !Number.isFinite(Number(datos.duracion))) {
      faltan.push("duracion (número de horas)");
    }
    return faltan;
  }

  function coleccion(items, params, campos) {
    let resultado = [...items];
    for (const [clave, valor] of Object.entries(params)) {
      if (["orden", "pagina", "tamano", "q"].includes(clave)) continue;
      if (!campos.includes(clave)) {
        return { error: error(400, "El parámetro '" + clave + "' no existe en este recurso.", "Disponibles: " + campos.join(", ") + ", q, orden, pagina y tamano.") };
      }
      resultado = resultado.filter((item) => String(item[clave]).toLowerCase() === valor.toLowerCase());
    }
    if (params.q) {
      const busqueda = params.q.toLowerCase();
      resultado = resultado.filter((item) => String(item.nombre).toLowerCase().includes(busqueda));
    }
    if (params.orden) {
      const descendente = params.orden.startsWith("-");
      const campo = descendente ? params.orden.slice(1) : params.orden;
      if (!campos.includes(campo)) {
        return { error: error(400, "No se puede ordenar por '" + campo + "'.", "Ordena por: " + campos.join(", ") + ". Usa un guion delante para invertir.") };
      }
      resultado.sort((a, b) => {
        const izquierda = a[campo];
        const derecha = b[campo];
        const comparacion = typeof izquierda === "number" && typeof derecha === "number"
          ? izquierda - derecha
          : String(izquierda).localeCompare(String(derecha), "es");
        return descendente ? -comparacion : comparacion;
      });
    }
    const total = resultado.length;
    let pagina = 1;
    let tamano = total;
    if (params.pagina || params.tamano) {
      pagina = Number(params.pagina || 1);
      tamano = Number(params.tamano || 3);
      if (!Number.isInteger(pagina) || pagina < 1 || !Number.isInteger(tamano) || tamano < 1) {
        return { error: error(400, "pagina y tamano deben ser números enteros mayores que cero.") };
      }
      resultado = resultado.slice((pagina - 1) * tamano, pagina * tamano);
    }
    return { resultado, total, pagina, tamano };
  }

  function manejar(peticion, datos) {
    const { ruta, params } = parseUrl(peticion.url);
    if (!ruta.startsWith("/")) {
      return error(400, "La ruta debe empezar con /.", "Por ejemplo: GET /cursos");
    }
    if (ruta === "/") {
      return respuesta(200, {
        mensaje: "API de CápsulasDev",
        recursos: ["/cursos", "/cursos/{id}", "/estudiantes", "/estudiantes/{id}"],
        autenticacion: "Bearer " + TOKEN + " para crear, modificar o borrar"
      });
    }

    const partes = ruta.split("/").filter(Boolean);
    const recurso = partes[0];
    const identificador = partes[1];
    if (!["cursos", "estudiantes"].includes(recurso) || partes.length > 2) {
      return error(404, "No existe la ruta " + ruta + ".", "Recursos disponibles: /cursos y /estudiantes.");
    }
    const lista = datos[recurso];
    const campos = recurso === "cursos"
      ? ["id", "nombre", "nivel", "categoria", "duracion", "inscritos"]
      : ["id", "nombre", "ciudad", "curso_id"];

    if (identificador !== undefined) {
      if (!/^\d+$/.test(identificador)) {
        return error(400, "El identificador debe ser un número entero.", "Por ejemplo: /" + recurso + "/3");
      }
      const indice = lista.findIndex((item) => item.id === Number(identificador));
      if (indice === -1 && peticion.metodo !== "POST") {
        return error(404, "No existe " + recurso.slice(0, -1) + " con id " + identificador + ".", "Consulta /" + recurso + " para ver los identificadores disponibles.");
      }
      if (peticion.metodo === "GET") return respuesta(200, lista[indice]);
      if (peticion.metodo === "DELETE") {
        const permiso = autorizado(peticion);
        if (!permiso.ok) return error(401, "No autorizado.", permiso.motivo);
        lista.splice(indice, 1);
        return respuesta(204, null);
      }
      if (peticion.metodo === "PUT" || peticion.metodo === "PATCH") {
        const permiso = autorizado(peticion);
        if (!permiso.ok) return error(401, "No autorizado.", permiso.motivo);
        const cuerpo = leerCuerpo(peticion);
        if (cuerpo.error) return cuerpo.error;
        const desconocidos = Object.keys(cuerpo.datos).filter((clave) => !campos.includes(clave));
        if (desconocidos.length) {
          return error(400, "Campos desconocidos: " + desconocidos.join(", ") + ".", "Campos válidos: " + campos.join(", ") + ".");
        }
        if (recurso === "cursos") {
          const faltan = validarCurso({ ...lista[indice], ...cuerpo.datos }, peticion.metodo === "PATCH");
          if (faltan.length) return error(400, "Datos inválidos.", "Revisa: " + faltan.join("; ") + ".");
        }
        lista[indice] = { ...lista[indice], ...cuerpo.datos, id: lista[indice].id };
        return respuesta(200, lista[indice]);
      }
      return error(405, "El método " + peticion.metodo + " no está permitido en " + ruta + ".", "Métodos disponibles: GET, PUT, PATCH y DELETE.");
    }

    if (peticion.metodo === "GET") {
      const filtrado = coleccion(lista, params, campos);
      if (filtrado.error) return filtrado.error;
      const cuerpo = { total: filtrado.total, datos: filtrado.resultado };
      if (params.pagina || params.tamano) {
        cuerpo.pagina = filtrado.pagina;
        cuerpo.tamano = filtrado.tamano;
        cuerpo.paginas = Math.max(1, Math.ceil(filtrado.total / filtrado.tamano));
      }
      return respuesta(200, cuerpo);
    }

    if (peticion.metodo === "POST") {
      const permiso = autorizado(peticion);
      if (!permiso.ok) return error(401, "No autorizado.", permiso.motivo);
      const cuerpo = leerCuerpo(peticion);
      if (cuerpo.error) return cuerpo.error;
      const desconocidos = Object.keys(cuerpo.datos).filter((clave) => !campos.includes(clave) || clave === "id");
      if (desconocidos.length) {
        return error(400, "Campos no permitidos al crear: " + desconocidos.join(", ") + ".", "El id lo asigna el servidor. Campos válidos: " + campos.filter((c) => c !== "id").join(", ") + ".");
      }
      if (recurso === "cursos") {
        const faltan = validarCurso(cuerpo.datos, false);
        if (faltan.length) return error(400, "Faltan datos obligatorios.", "Revisa: " + faltan.join("; ") + ".");
      } else if (typeof cuerpo.datos.nombre !== "string" || !cuerpo.datos.nombre.trim()) {
        return error(400, "Faltan datos obligatorios.", "Revisa: nombre (texto).");
      }
      const nuevo = { id: Math.max(0, ...lista.map((item) => item.id)) + 1, ...cuerpo.datos };
      lista.push(nuevo);
      return respuesta(201, nuevo, { Location: "/" + recurso + "/" + nuevo.id });
    }

    return error(405, "El método " + peticion.metodo + " no está permitido en " + ruta + ".", "Para la colección puedes usar GET y POST.");
  }

  function formatear(peticion, resultado) {
    const lineas = ["> " + peticion.metodo + " " + peticion.url];
    lineas.push("HTTP/1.1 " + resultado.status + " " + resultado.texto);
    if (resultado.status !== 204) lineas.push("Content-Type: application/json");
    for (const [clave, valor] of Object.entries(resultado.headers || {})) lineas.push(clave + ": " + valor);
    if (resultado.status === 204 || resultado.cuerpo === null) {
      lineas.push("", "(sin contenido)");
      return lineas;
    }
    lineas.push("", JSON.stringify(resultado.cuerpo, null, 2));
    return lineas;
  }

  function run(source) {
    const analisis = parseRequests(source);
    if (analisis.error) {
      return {
        output: [],
        text: analisis.error + (analisis.pista ? "\n↳ " + analisis.pista : ""),
        error: analisis.error,
        respuestas: [],
        datos: datosIniciales()
      };
    }
    const datos = datosIniciales();
    const output = [];
    const respuestas = [];
    analisis.bloques.forEach((peticion, indice) => {
      let resultado;
      try { resultado = manejar(peticion, datos); }
      catch (cause) {
        if (!(cause instanceof URIError)) throw cause;
        resultado = error(400, "La URL contiene una codificación inválida.", "Revisa los símbolos %. Un espacio puede escribirse como %20.");
      }
      respuestas.push({
        metodo: peticion.metodo,
        url: peticion.url,
        status: resultado.status,
        cuerpo: JSON.parse(JSON.stringify(resultado.cuerpo)),
        headers: resultado.headers || {}
      });
      if (indice > 0) output.push("", "─".repeat(46), "");
      output.push(...formatear(peticion, resultado));
    });
    return { output, text: output.join("\n"), error: null, respuestas, datos };
  }

  globalThis.ApiLab = { run, token: TOKEN, datosIniciales };
})();

/* Laboratorio de Node.js. El JavaScript que escribe la persona lo ejecuta el
   intérprete propio de starter-runtime.js: no hay eval, no hay Function y no hay
   un proceso de Node detrás. Lo que este archivo aporta son los objetos que Node
   pone a disposición —require, module, process, fs, path, http— sobre un sistema
   de archivos en memoria y un servidor que responde a peticiones simuladas.

   Cada cosa que queda fuera del alcance se dice en pantalla en lugar de fingirse:
   no hay red, no hay npm, no hay Buffers y no hay código asíncrono. */
(() => {
  "use strict";

  const CWD = "/proyecto";
  const MAX_ARCHIVOS = 40;
  const MAX_TAMANO = 20000;
  const MAX_REQUIRE = 12;

  const ARCHIVOS_BASE = {
    "/proyecto/cursos.json": '[\n  {"id": 1, "nombre": "Python", "horas": 12, "activo": true},\n  {"id": 2, "nombre": "SQL", "horas": 5, "activo": true},\n  {"id": 3, "nombre": "Git", "horas": 4, "activo": false}\n]\n',
    "/proyecto/notas.txt": "Revisar el informe\nPreparar la clase\nResponder correos\n",
    "/proyecto/formato.js": 'function mayusculas(texto) {\n  return texto.toUpperCase();\n}\n\nmodule.exports = mayusculas;\n',
    "/proyecto/calculos.js": 'function sumar(valores) {\n  let total = 0;\n  for (const valor of valores) {\n    total = total + valor;\n  }\n  return total;\n}\n\nfunction promedio(valores) {\n  return sumar(valores) / valores.length;\n}\n\nmodule.exports = { sumar: sumar, promedio: promedio };\n'
  };

  function estadoInicial() {
    return { cwd: CWD, files: { ...ARCHIVOS_BASE }, argv: [], requests: [] };
  }

  /* friendly es la marca que usa starter-runtime.js para mostrar el mensaje tal
     cual. Sin ella, el intérprete lo reemplaza por un aviso genérico de sintaxis
     y se pierde justo la explicación que hace útil al laboratorio. */
  function fallar(mensaje) {
    const error = new Error(mensaje);
    error.friendly = true;
    error.nodeLab = true;
    throw error;
  }

  /* ------------------------------------------------------------- rutas */

  function normalizar(ruta) {
    if (typeof ruta !== "string" || ruta === "") fallar("Una ruta de archivo tiene que ser un texto.");
    const absoluta = ruta.startsWith("/") ? ruta : CWD + "/" + ruta;
    const partes = [];
    for (const parte of absoluta.split("/")) {
      if (parte === "" || parte === ".") continue;
      if (parte === "..") { partes.pop(); continue; }
      partes.push(parte);
    }
    return "/" + partes.join("/");
  }

  const nombreVisible = (ruta) => (ruta.startsWith(CWD + "/") ? ruta.slice(CWD.length + 1) : ruta);

  /* --------------------------------------------------------------- JSON */

  function serializar(valor, sangria, nivel, api) {
    if (valor === null) return "null";
    if (typeof valor === "boolean") return String(valor);
    if (typeof valor === "number") return Number.isFinite(valor) ? String(valor) : "null";
    if (typeof valor === "string") return JSON.stringify(valor);
    if (api.isCallable(valor)) return undefined;
    const salto = sangria ? "\n" : "";
    const dentro = sangria ? sangria.repeat(nivel + 1) : "";
    const fuera = sangria ? sangria.repeat(nivel) : "";
    if (Array.isArray(valor)) {
      if (valor.length === 0) return "[]";
      const partes = valor.map((item) => {
        const texto = serializar(item, sangria, nivel + 1, api);
        return dentro + (texto === undefined ? "null" : texto);
      });
      return "[" + salto + partes.join("," + salto) + salto + fuera + "]";
    }
    if (typeof valor === "object") {
      const partes = [];
      for (const clave of Object.keys(valor)) {
        const texto = serializar(valor[clave], sangria, nivel + 1, api);
        if (texto === undefined) continue;
        partes.push(dentro + JSON.stringify(clave) + (sangria ? ": " : ":") + texto);
      }
      if (partes.length === 0) return "{}";
      return "{" + salto + partes.join("," + salto) + salto + fuera + "}";
    }
    return undefined;
  }

  function crearJson(api) {
    return {
      stringify(valor, _reemplazo, espacio) {
        const sangria = typeof espacio === "number" ? " ".repeat(Math.max(0, Math.min(10, espacio)))
          : typeof espacio === "string" ? espacio.slice(0, 10) : "";
        return serializar(valor, sangria, 0, api);
      },
      parse(texto) {
        if (typeof texto !== "string") fallar("JSON.parse() necesita un texto. Recuerda leer el archivo con la codificación utf8.");
        try {
          return JSON.parse(texto);
        } catch {
          fallar("El texto no es JSON válido. Revisa las comillas, las comas y los corchetes.");
          return null;
        }
      }
    };
  }

  /* ----------------------------------------------------------------- fs */

  function crearFs(estado) {
    const leer = (ruta) => {
      const completa = normalizar(ruta);
      if (!(completa in estado.files)) {
        fallar("No existe el archivo " + nombreVisible(completa) + ". Comprueba el nombre con fs.readdirSync(\".\").");
      }
      return estado.files[completa];
    };
    const escribir = (ruta, contenido, agregar) => {
      const completa = normalizar(ruta);
      if (typeof contenido !== "string") {
        fallar("Un archivo se escribe con texto. Si tienes un objeto, conviértelo antes con JSON.stringify().");
      }
      const anterior = agregar ? (estado.files[completa] || "") : "";
      const nuevo = anterior + contenido;
      if (nuevo.length > MAX_TAMANO) fallar("El archivo supera el tamaño máximo del laboratorio.");
      if (!(completa in estado.files) && Object.keys(estado.files).length >= MAX_ARCHIVOS) {
        fallar("El laboratorio no admite más archivos en esta práctica.");
      }
      estado.files[completa] = nuevo;
      estado.escritos.add(completa);
      return null;
    };
    return {
      readFileSync(ruta, codificacion) {
        if (codificacion !== "utf8" && codificacion !== "utf-8") {
          fallar("Indica la codificación para recibir texto: fs.readFileSync(ruta, \"utf8\"). Sin ella Node devuelve un Buffer, que este laboratorio no representa.");
        }
        return leer(ruta);
      },
      writeFileSync: (ruta, contenido) => escribir(ruta, contenido, false),
      appendFileSync: (ruta, contenido) => escribir(ruta, contenido, true),
      existsSync: (ruta) => normalizar(ruta) in estado.files,
      readdirSync(ruta) {
        const carpeta = normalizar(ruta || ".");
        const prefijo = carpeta === "/" ? "/" : carpeta + "/";
        const nombres = [];
        for (const clave of Object.keys(estado.files)) {
          if (!clave.startsWith(prefijo)) continue;
          const resto = clave.slice(prefijo.length);
          const nombre = resto.split("/")[0];
          if (nombre && !nombres.includes(nombre)) nombres.push(nombre);
        }
        if (nombres.length === 0) fallar("La carpeta " + nombreVisible(carpeta) + " no existe o está vacía.");
        return nombres.sort();
      },
      unlinkSync(ruta) {
        const completa = normalizar(ruta);
        if (!(completa in estado.files)) fallar("No existe el archivo " + nombreVisible(completa) + ".");
        delete estado.files[completa];
        estado.escritos.add(completa);
        return null;
      }
    };
  }

  /* --------------------------------------------------------------- path */

  /* path.join depende del sistema: en Windows, Node real devuelve datos\informes.
     Aquí siempre se usa el estilo POSIX, que es el de Linux, macOS y cualquier
     servidor donde termine el código. La página lo dice de forma explícita. */
  const modPath = {
    join(...partes) {
      const limpias = partes.filter((parte) => parte !== "" && parte !== undefined && parte !== null);
      if (limpias.some((parte) => typeof parte !== "string")) fallar("path.join() solo une textos.");
      const unida = limpias.join("/").replace(/\/+/g, "/");
      const resultado = [];
      for (const parte of unida.split("/")) {
        if (parte === "." || parte === "") continue;
        if (parte === ".." && resultado.length && resultado[resultado.length - 1] !== "..") { resultado.pop(); continue; }
        resultado.push(parte);
      }
      return (unida.startsWith("/") ? "/" : "") + resultado.join("/");
    },
    basename(ruta) {
      const partes = String(ruta).split("/");
      return partes[partes.length - 1];
    },
    extname(ruta) {
      const nombre = modPath.basename(ruta);
      const punto = nombre.lastIndexOf(".");
      return punto <= 0 ? "" : nombre.slice(punto);
    },
    dirname(ruta) {
      const partes = String(ruta).split("/");
      partes.pop();
      const resto = partes.join("/");
      return resto === "" ? (String(ruta).startsWith("/") ? "/" : ".") : resto;
    }
  };

  /* --------------------------------------------------------------- http */

  function crearHttp(estado) {
    return {
      createServer(manejador) {
        if (!estado.esFuncion(manejador)) {
          fallar("createServer() necesita una función que reciba la petición y la respuesta: http.createServer(function (req, res) { ... }).");
        }
        estado.manejador = manejador;
        return {
          listen(puerto, alTerminar) {
            estado.puerto = typeof puerto === "number" ? puerto : Number(puerto) || 3000;
            if (alTerminar !== undefined && estado.esFuncion(alTerminar)) estado.llamar(alTerminar, []);
            return null;
          }
        };
      }
    };
  }

  /* Ejecuta el manejador que escribió la persona contra cada petición del módulo.
     La respuesta se arma solo con lo que ese código haga: si nunca llama a end(),
     se informa que la petición quedó sin respuesta, igual que en un servidor real. */
  function responder(estado, peticion) {
    const respuesta = { status: 200, headers: {}, body: "", terminada: false };
    const res = {
      statusCode: 200,
      setHeader(nombre, valor) {
        if (respuesta.terminada) fallar("No puedes cambiar las cabeceras después de enviar la respuesta con end().");
        respuesta.headers[String(nombre).toLowerCase()] = String(valor);
        return null;
      },
      writeHead(codigo, cabeceras) {
        if (respuesta.terminada) fallar("No puedes cambiar las cabeceras después de enviar la respuesta con end().");
        respuesta.status = Number(codigo);
        res.statusCode = Number(codigo);
        if (cabeceras && typeof cabeceras === "object") {
          for (const nombre of Object.keys(cabeceras)) respuesta.headers[nombre.toLowerCase()] = String(cabeceras[nombre]);
        }
        return null;
      },
      end(cuerpo) {
        if (respuesta.terminada) fallar("La respuesta ya se envió: end() se llama una sola vez por petición.");
        respuesta.terminada = true;
        respuesta.status = Number(res.statusCode) || respuesta.status;
        respuesta.body = cuerpo === undefined || cuerpo === null ? "" : String(cuerpo);
        return null;
      }
    };
    const req = { method: peticion.method || "GET", url: peticion.url || "/", headers: { host: "localhost:" + (estado.puerto || 3000) } };
    estado.llamar(estado.manejador, [req, res]);
    if (!respuesta.terminada) {
      fallar("La petición " + req.method + " " + req.url + " quedó sin respuesta. Todo camino del manejador tiene que terminar en res.end().");
    }
    return { method: req.method, url: req.url, status: respuesta.status, headers: respuesta.headers, body: respuesta.body };
  }

  /* ------------------------------------------------------------- require */

  function crearRequire(estado, api, globalesBase) {
    const cache = new Map();
    const integrados = {
      "node:fs": () => estado.fs,
      fs: () => estado.fs,
      "node:path": () => modPath,
      path: () => modPath,
      "node:http": () => estado.http,
      http: () => estado.http
    };
    return function require(nombre) {
      if (typeof nombre !== "string") fallar("require() necesita el nombre del módulo entre comillas.");
      if (Object.prototype.hasOwnProperty.call(integrados, nombre)) return integrados[nombre]();
      if (!nombre.startsWith(".") && !nombre.startsWith("/")) {
        fallar("El módulo " + nombre + " no está disponible: este laboratorio no instala paquetes con npm. Los módulos integrados son node:fs, node:path y node:http.");
      }
      const ruta = normalizar(nombre.endsWith(".js") ? nombre : nombre + ".js");
      if (cache.has(ruta)) return cache.get(ruta);
      if (!(ruta in estado.files)) {
        fallar("No existe el módulo " + nombreVisible(ruta) + " en la carpeta del proyecto.");
      }
      estado.profundidad += 1;
      if (estado.profundidad > MAX_REQUIRE) fallar("Demasiados módulos encadenados: revisa si dos archivos se piden entre sí.");
      const modulo = { exports: {} };
      const resultado = estado.runtime.runJavaScript(estado.files[ruta], {
        globals: (interno) => ({
          ...globalesBase(interno),
          module: modulo,
          exports: modulo.exports,
          require
        })
      });
      estado.profundidad -= 1;
      for (const linea of resultado.output) estado.salida.push(linea);
      if (resultado.error) {
        fallar("Error dentro de " + nombreVisible(ruta) + ": " + (resultado.error.message || resultado.error));
      }
      cache.set(ruta, modulo.exports);
      return modulo.exports;
    };
  }

  /* ---------------------------------------------------------------- run */

  function run(code, scenario) {
    const runtime = globalThis.StarterRuntime;
    const base = { ...estadoInicial(), ...(scenario || {}) };
    const estado = {
      runtime,
      files: { ...base.files },
      escritos: new Set(),
      salida: [],
      manejador: null,
      puerto: null,
      profundidad: 0,
      llamar: () => null,
      esFuncion: () => false
    };
    estado.fs = crearFs(estado);
    estado.http = crearHttp(estado);

    /* El programa que se está ejecutando también es un archivo de la carpeta:
       sin esto, fs.readdirSync(".") mostraría una carpeta que no existe en Node. */
    const ARCHIVO_PRINCIPAL = CWD + "/app.cjs";
    estado.files[ARCHIVO_PRINCIPAL] = typeof code === "string" ? code : "";

    const argv = ["/usr/local/bin/node", ARCHIVO_PRINCIPAL, ...(base.argv || []).map(String)];
    const modulo = { exports: {} };

    const globalesBase = (api) => {
      estado.llamar = (fn, args) => api.call(fn, args);
      estado.esFuncion = (valor) => api.isCallable(valor);
      return {
        console: {
          log: (...valores) => estado.salida.push(valores.map((valor) => api.format(valor)).join(" ")),
          error: (...valores) => estado.salida.push(valores.map((valor) => api.format(valor)).join(" "))
        },
        JSON: crearJson(api),
        process: {
          argv,
          env: { NODE_ENV: "development" },
          exit: () => fallar("process.exit() no está disponible en el laboratorio: deja que el programa termine solo.")
        },
        require: null
      };
    };

    let resultado;
    try {
      resultado = runtime.runJavaScript(code, {
        globals: (api) => {
          const globales = globalesBase(api);
          globales.require = crearRequire(estado, api, globalesBase);
          globales.module = modulo;
          globales.exports = modulo.exports;
          return globales;
        }
      });
    } catch (error) {
      return terminar(estado, base, error.message || String(error));
    }

    if (resultado.error) {
      const mensaje = resultado.error.message || String(resultado.error);
      return terminar(estado, base, mensaje);
    }

    if (estado.manejador) {
      const peticiones = (base.requests || []).length ? base.requests : [{ method: "GET", url: "/" }];
      try {
        estado.respuestas = peticiones.map((peticion) => responder(estado, peticion));
      } catch (error) {
        return terminar(estado, base, error.message || String(error));
      }
    }

    return terminar(estado, base, null);
  }

  function terminar(estado, base, error) {
    const bloques = [];
    if (estado.salida.length) bloques.push(estado.salida.join("\n"));

    if (estado.puerto !== null) {
      bloques.push("Servidor simulado escuchando en el puerto " + estado.puerto + ".");
    }
    const respuestas = estado.respuestas || [];
    if (respuestas.length) {
      const lineas = [];
      for (const respuesta of respuestas) {
        lineas.push("→ " + respuesta.method + " " + respuesta.url);
        const tipo = respuesta.headers["content-type"];
        lineas.push("← " + respuesta.status + (tipo ? " · " + tipo : ""));
        if (respuesta.body !== "") {
          for (const linea of respuesta.body.split("\n")) lineas.push("  " + linea);
        }
      }
      bloques.push(lineas.join("\n"));
    }

    const escritos = [...estado.escritos].sort();
    if (escritos.length) {
      bloques.push("Archivos guardados: " + escritos.map(nombreVisible).join(", "));
    }

    if (error) bloques.push("⚠ " + error);
    else if (bloques.length === 0) bloques.push("El programa terminó sin mostrar nada. Usa console.log(...) para ver un valor.");

    return {
      text: bloques.join("\n\n"),
      output: estado.salida.slice(),
      error,
      files: { ...estado.files },
      escritos,
      respuestas,
      puerto: estado.puerto,
      argv: (base.argv || []).slice()
    };
  }

  globalThis.NodeLab = { run, initial: estadoInicial, archivos: ARCHIVOS_BASE };
})();

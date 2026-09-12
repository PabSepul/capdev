/* Laboratorio de JSON.

   Dos motores propios, ninguno prestado:

   1. Un analizador de JSON escrito a mano. No usa JSON.parse para leer lo que
      escribe la persona, porque el mensaje de error es la mitad de la lección:
      aquí cada problema se explica con su línea, su columna y qué se esperaba.
      Las pruebas comprueban que acepte y rechace exactamente lo mismo que
      JSON.parse, y que el valor obtenido sea idéntico.

   2. Un validador de un subconjunto de JSON Schema: type, required, properties,
      items, enum, additionalProperties, minimum, maximum, minLength, maxLength
      y minItems. Con eso, la persona escribe un contrato y el laboratorio lo
      pone a prueba contra ejemplos que deben pasar y ejemplos que deben fallar.

   Lo que queda fuera se dice: no hay referencias ($ref), ni combinadores
   (allOf, anyOf), ni formatos, ni expresiones regulares en el esquema. */
(() => {
  "use strict";

  const MAX_LARGO = 8000;
  const MAX_PROFUNDIDAD = 20;

  /* ====================== Analizador de JSON ====================== */

  function analizar(texto, avisos) {
    let i = 0;
    let linea = 1;
    let columna = 1;
    const avisar = (mensaje) => { if (avisos && !avisos.includes(mensaje)) avisos.push(mensaje); };

    const avanzar = (cantidad = 1) => {
      for (let n = 0; n < cantidad; n += 1) {
        if (texto[i] === "\n") { linea += 1; columna = 1; } else { columna += 1; }
        i += 1;
      }
    };

    const fallar = (mensaje) => {
      const error = new Error("Línea " + linea + ", columna " + columna + " · " + mensaje);
      error.friendly = true;
      error.jsonLab = true;
      error.linea = linea;
      error.columna = columna;
      throw error;
    };

    const nombreDe = (c) => {
      if (c === undefined) return "el final del texto";
      if (c === "\n") return "un salto de línea";
      return "“" + c + "”";
    };

    function saltarEspacios() {
      for (;;) {
        const c = texto[i];
        if (c === " " || c === "\t" || c === "\n" || c === "\r") { avanzar(); continue; }
        if (c === "/" && (texto[i + 1] === "/" || texto[i + 1] === "*")) {
          fallar("JSON no admite comentarios. Quita esta línea o guárdala como un campo más.");
        }
        return;
      }
    }

    function valor(profundidad) {
      if (profundidad > MAX_PROFUNDIDAD) fallar("La estructura está anidada demasiadas veces.");
      saltarEspacios();
      const c = texto[i];
      if (c === undefined) fallar("Se terminó el texto y faltaba un valor.");
      if (c === "{") return objeto(profundidad);
      if (c === "[") return arreglo(profundidad);
      if (c === '"') return cadena();
      if (c === "'") fallar("JSON solo admite comillas dobles. Cambia ' por \".");
      if (c === "-" || (c >= "0" && c <= "9")) return numero();
      if (texto.startsWith("true", i)) { avanzar(4); return true; }
      if (texto.startsWith("false", i)) { avanzar(5); return false; }
      if (texto.startsWith("null", i)) { avanzar(4); return null; }
      if (texto.startsWith("True", i) || texto.startsWith("False", i)) {
        fallar("En JSON se escriben en minúscula: true y false.");
      }
      if (texto.startsWith("None", i) || texto.startsWith("undefined", i) || texto.startsWith("NaN", i)) {
        fallar("JSON no tiene ese valor. Para «sin dato» se usa null.");
      }
      if (/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ_]/.test(c)) {
        fallar("Un texto tiene que ir entre comillas dobles: encontré " + nombreDe(c) + " suelto.");
      }
      fallar("No esperaba " + nombreDe(c) + " aquí.");
      return null;
    }

    function objeto(profundidad) {
      avanzar();
      const resultado = {};
      const vistas = new Set();
      saltarEspacios();
      if (texto[i] === "}") { avanzar(); return resultado; }
      for (;;) {
        saltarEspacios();
        if (texto[i] === "}") fallar("Sobra una coma antes de }. JSON no admite una coma final.");
        if (texto[i] !== '"') {
          if (texto[i] === "'") fallar("El nombre de un campo va entre comillas dobles: cambia ' por \".");
          fallar("El nombre de un campo tiene que ir entre comillas dobles.");
        }
        const clave = cadena();
        /* JSON.parse acepta un campo repetido y se queda con el último. Aquí se
           hace lo mismo para no separarse del motor real, pero se avisa: casi
           siempre es un descuido de quien escribió el documento. */
        if (vistas.has(clave)) {
          avisar("El campo “" + clave + "” aparece más de una vez: manda el último valor, igual que en JavaScript.");
        }
        vistas.add(clave);
        saltarEspacios();
        if (texto[i] !== ":") fallar("Falta el signo : después del nombre “" + clave + "”.");
        avanzar();
        resultado[clave] = valor(profundidad + 1);
        saltarEspacios();
        if (texto[i] === ",") { avanzar(); continue; }
        if (texto[i] === "}") { avanzar(); return resultado; }
        if (texto[i] === undefined) fallar("Se terminó el texto y faltaba cerrar el objeto con }.");
        fallar("Esperaba una coma o } y encontré " + nombreDe(texto[i]) + ".");
      }
    }

    function arreglo(profundidad) {
      avanzar();
      const resultado = [];
      saltarEspacios();
      if (texto[i] === "]") { avanzar(); return resultado; }
      for (;;) {
        saltarEspacios();
        if (texto[i] === "]") fallar("Sobra una coma antes de ]. JSON no admite una coma final.");
        resultado.push(valor(profundidad + 1));
        saltarEspacios();
        if (texto[i] === ",") { avanzar(); continue; }
        if (texto[i] === "]") { avanzar(); return resultado; }
        if (texto[i] === undefined) fallar("Se terminó el texto y faltaba cerrar la lista con ].");
        fallar("Esperaba una coma o ] y encontré " + nombreDe(texto[i]) + ".");
      }
    }

    function cadena() {
      avanzar();
      let resultado = "";
      for (;;) {
        const c = texto[i];
        if (c === undefined) fallar("Se terminó el texto y faltaba cerrar el texto con \".");
        if (c === "\n") fallar("Un texto no puede cortarse en varias líneas. Usa \\n si necesitas un salto.");
        if (c === '"') { avanzar(); return resultado; }
        if (c === "\\") {
          avanzar();
          const escape = texto[i];
          if (escape === undefined) fallar("Se terminó el texto después de una barra invertida.");
          if (escape === "u") {
            const hex = texto.slice(i + 1, i + 5);
            if (!/^[0-9a-fA-F]{4}$/.test(hex)) fallar("Después de \\u hacen falta cuatro dígitos hexadecimales.");
            resultado += String.fromCharCode(parseInt(hex, 16));
            avanzar(5);
            continue;
          }
          const tabla = { '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t" };
          if (!(escape in tabla)) fallar("La secuencia \\" + escape + " no existe en JSON.");
          resultado += tabla[escape];
          avanzar();
          continue;
        }
        if (c < " ") fallar("Un texto no puede contener un carácter de control sin escapar.");
        resultado += c;
        avanzar();
      }
    }

    function numero() {
      const inicio = i;
      if (texto[i] === "-") avanzar();
      if (texto[i] === "0") {
        avanzar();
        if (texto[i] >= "0" && texto[i] <= "9") {
          const resto = texto.slice(i).match(/^\d+/)[0];
          fallar("Un número no puede empezar con cero. Escribe " + resto + " sin el cero de adelante.");
        }
      } else if (texto[i] >= "1" && texto[i] <= "9") { while (texto[i] >= "0" && texto[i] <= "9") avanzar(); }
      else fallar("Después del signo menos hace falta un dígito.");
      if (texto[i] === ".") {
        avanzar();
        if (!(texto[i] >= "0" && texto[i] <= "9")) fallar("Después del punto decimal hace falta al menos un dígito.");
        while (texto[i] >= "0" && texto[i] <= "9") avanzar();
      }
      if (texto[i] === "e" || texto[i] === "E") {
        avanzar();
        if (texto[i] === "+" || texto[i] === "-") avanzar();
        if (!(texto[i] >= "0" && texto[i] <= "9")) fallar("Después de la e del exponente hace falta un dígito.");
        while (texto[i] >= "0" && texto[i] <= "9") avanzar();
      }
      const crudo = texto.slice(inicio, i);
      if (/^-?0\d/.test(crudo)) fallar("Un número no puede empezar con un cero de más: escribe " + crudo.replace(/^(-?)0+/, "$1") + ".");
      return Number(crudo);
    }

    saltarEspacios();
    if (texto[i] === undefined) {
      const error = new Error("El documento está vacío. Escribe un objeto entre llaves o una lista entre corchetes.");
      error.friendly = true;
      error.jsonLab = true;
      throw error;
    }
    const resultado = valor(0);
    saltarEspacios();
    if (i < texto.length) fallar("Sobra contenido después del valor. Un documento JSON contiene un solo valor.");
    return resultado;
  }

  /* ====================== Descripción de tipos ====================== */

  function tipoDe(valor) {
    if (valor === null) return "null";
    if (Array.isArray(valor)) return "array";
    if (typeof valor === "number") return Number.isInteger(valor) ? "integer" : "number";
    return typeof valor;
  }

  const tipoVisible = (valor) => (tipoDe(valor) === "integer" ? "number (entero)" : tipoDe(valor));

  function resumir(valor, ruta, salida, profundidad) {
    if (profundidad > 4 || salida.length > 40) return;
    const tipo = tipoVisible(valor);
    if (Array.isArray(valor)) {
      salida.push(ruta + ": array de " + valor.length + (valor.length === 1 ? " elemento" : " elementos"));
      valor.slice(0, 3).forEach((item, indice) => resumir(item, ruta + "[" + indice + "]", salida, profundidad + 1));
      return;
    }
    if (valor !== null && typeof valor === "object") {
      const claves = Object.keys(valor);
      salida.push(ruta + ": object con " + claves.length + (claves.length === 1 ? " campo" : " campos"));
      for (const clave of claves.slice(0, 8)) {
        resumir(valor[clave], ruta + "." + clave, salida, profundidad + 1);
      }
      return;
    }
    salida.push(ruta + ": " + tipo + " = " + JSON.stringify(valor));
  }

  /* ======================== Validador ======================== */

  const TIPOS = ["string", "number", "integer", "boolean", "null", "object", "array"];

  function validar(esquema, dato, ruta, errores, profundidad) {
    if (profundidad > MAX_PROFUNDIDAD) return;
    if (esquema === null || typeof esquema !== "object" || Array.isArray(esquema)) {
      errores.push({ ruta, mensaje: "un esquema tiene que ser un objeto" });
      return;
    }
    const donde = ruta === "" ? "el documento" : ruta;

    if (esquema.type !== undefined) {
      const tipos = Array.isArray(esquema.type) ? esquema.type : [esquema.type];
      for (const tipo of tipos) {
        if (!TIPOS.includes(tipo)) {
          errores.push({ ruta, mensaje: "el esquema pide el tipo “" + tipo + "”, que no existe en JSON Schema" });
          return;
        }
      }
      const real = tipoDe(dato);
      const encaja = tipos.some((tipo) => (tipo === "number" ? real === "number" || real === "integer" : tipo === real));
      if (!encaja) {
        errores.push({
          ruta,
          mensaje: donde + " tenía que ser " + tipos.join(" o ") + " y llegó " + tipoVisible(dato)
        });
        return;
      }
    }

    if (esquema.enum !== undefined) {
      if (!Array.isArray(esquema.enum)) {
        errores.push({ ruta, mensaje: "enum tiene que ser una lista de valores permitidos" });
      } else if (!esquema.enum.some((permitido) => JSON.stringify(permitido) === JSON.stringify(dato))) {
        errores.push({
          ruta,
          mensaje: donde + " solo admite " + esquema.enum.map((v) => JSON.stringify(v)).join(", ")
            + " y llegó " + JSON.stringify(dato)
        });
      }
    }

    if (typeof dato === "number") {
      if (typeof esquema.minimum === "number" && dato < esquema.minimum) {
        errores.push({ ruta, mensaje: donde + " tenía que ser al menos " + esquema.minimum + " y llegó " + dato });
      }
      if (typeof esquema.maximum === "number" && dato > esquema.maximum) {
        errores.push({ ruta, mensaje: donde + " tenía que ser como máximo " + esquema.maximum + " y llegó " + dato });
      }
    }

    if (typeof dato === "string") {
      if (typeof esquema.minLength === "number" && dato.length < esquema.minLength) {
        errores.push({ ruta, mensaje: donde + " tenía que tener al menos " + esquema.minLength + " caracteres" });
      }
      if (typeof esquema.maxLength === "number" && dato.length > esquema.maxLength) {
        errores.push({ ruta, mensaje: donde + " tenía que tener como máximo " + esquema.maxLength + " caracteres" });
      }
    }

    if (Array.isArray(dato)) {
      if (typeof esquema.minItems === "number" && dato.length < esquema.minItems) {
        errores.push({
          ruta,
          mensaje: donde + " tenía que traer al menos " + esquema.minItems
            + (esquema.minItems === 1 ? " elemento" : " elementos")
        });
      }
      if (esquema.items !== undefined) {
        dato.forEach((item, indice) => validar(esquema.items, item, ruta + "[" + indice + "]", errores, profundidad + 1));
      }
    }

    if (dato !== null && typeof dato === "object" && !Array.isArray(dato)) {
      const propiedades = esquema.properties && typeof esquema.properties === "object" ? esquema.properties : {};
      if (Array.isArray(esquema.required)) {
        for (const campo of esquema.required) {
          if (!Object.prototype.hasOwnProperty.call(dato, campo)) {
            errores.push({ ruta, mensaje: "falta el campo obligatorio “" + campo + "”" + (ruta ? " en " + ruta : "") });
          }
        }
      }
      for (const campo of Object.keys(dato)) {
        if (Object.prototype.hasOwnProperty.call(propiedades, campo)) {
          validar(propiedades[campo], dato[campo], ruta ? ruta + "." + campo : campo, errores, profundidad + 1);
          continue;
        }
        if (esquema.additionalProperties === false) {
          errores.push({ ruta, mensaje: "el campo “" + campo + "” no está permitido" + (ruta ? " en " + ruta : "") });
        }
      }
    }
  }

  const validarDocumento = (esquema, dato) => {
    const errores = [];
    validar(esquema, dato, "", errores, 0);
    return errores;
  };

  /* =========================== run =========================== */

  function run(code, scenario) {
    if (typeof code !== "string") code = "";
    if (code.length > MAX_LARGO) {
      return { text: "⚠ El documento es demasiado largo para el laboratorio.", error: "Documento demasiado largo.", valor: null, resultados: [] };
    }

    const avisos = [];
    let valor;
    try {
      valor = analizar(code, avisos);
    } catch (error) {
      const mensaje = error.friendly ? error.message : "No pude leer el documento.";
      return { text: "⚠ " + mensaje, error: mensaje, valor: null, tipo: null, resultados: [] };
    }

    const base = scenario || {};

    if (base.modo === "esquema") {
      const resultados = [];
      const evaluar = (ejemplos, debePasar) => {
        for (const ejemplo of ejemplos || []) {
          const errores = validarDocumento(valor, ejemplo.dato);
          resultados.push({
            nombre: ejemplo.nombre,
            debePasar,
            paso: errores.length === 0,
            correcto: (errores.length === 0) === debePasar,
            errores: errores.map((e) => e.mensaje)
          });
        }
      };
      evaluar(base.validos, true);
      evaluar(base.invalidos, false);

      const lineas = ["El esquema se leyó bien. Se probó contra " + resultados.length + " ejemplos:", ""];
      for (const resultado of resultados) {
        const marca = resultado.correcto ? "✓" : "✗";
        const esperado = resultado.debePasar ? "debía aceptarse" : "debía rechazarse";
        const obtenido = resultado.paso ? "lo aceptó" : "lo rechazó";
        lineas.push(marca + " " + resultado.nombre + " · " + esperado + " y " + obtenido);
        for (const mensaje of resultado.errores.slice(0, 3)) lineas.push("    – " + mensaje);
      }
      const acertados = resultados.filter((r) => r.correcto).length;
      lineas.push("");
      lineas.push(acertados === resultados.length
        ? "El contrato distingue bien los " + resultados.length + " casos."
        : "Todavía fallan " + (resultados.length - acertados) + " de " + resultados.length + " casos.");

      return { text: lineas.join("\n"), error: null, valor, tipo: tipoDe(valor), resultados };
    }

    const resumen = [];
    resumir(valor, "raíz", resumen, 0);
    const bonito = JSON.stringify(valor, null, 2);
    const cabecera = avisos.length
      ? "✓ JSON válido, con " + (avisos.length === 1 ? "un aviso" : avisos.length + " avisos") + ":\n"
        + avisos.map((aviso) => "  ⚠ " + aviso).join("\n")
      : "✓ JSON válido.";
    return {
      text: cabecera + "\n\nEstructura:\n" + resumen.map((linea) => "  " + linea).join("\n")
        + "\n\nAsí queda ordenado:\n" + bonito,
      error: null,
      valor,
      tipo: tipoDe(valor),
      bonito,
      resumen,
      avisos,
      resultados: []
    };
  }

  globalThis.JsonLab = { run, analizar, validar: validarDocumento, tipoDe };
})();

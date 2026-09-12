/* Panel de recuperación del avance local y de dónde cuesta.

   Las cuentas sincronizan el avance de forma automática. Esta copia solo cubre
   el modo invitado y recuperaciones de avances antiguos. La importación se
   valida con el motor de la ruta JSON: el mismo que enseña a escribir un esquema
   es el que revisa este archivo. */
(() => {
  "use strict";
  const state = globalThis.LearningState;
  const raiz = document.querySelector("#progress-panel");
  if (!state || !raiz) return;

  const ver = (selector) => raiz.querySelector(selector);
  const salida = ver("#progress-export");
  const entrada = ver("#progress-import");
  const aviso = ver("#progress-status");
  const listaAtascos = ver("#progress-stuck");
  const resumenTexto = ver("#progress-summary");

  const plural = (cantidad, singular, muchos) => cantidad + " " + (cantidad === 1 ? singular : muchos);

  const describir = ({ rutas, modulos, examenes }, vacio) => (modulos === 0 && examenes === 0
    ? vacio
    : plural(modulos, "ejercicio", "ejercicios") + " y " + plural(examenes, "examen", "exámenes")
      + " en " + plural(rutas, "ruta", "rutas") + ".");

  const decir = (mensaje, tono) => {
    if (!aviso) return;
    aviso.textContent = mensaje;
    aviso.className = "progress-status" + (tono ? " is-" + tono : "");
  };

  function pintarResumen() {
    if (resumenTexto) {
      resumenTexto.textContent = describir(state.resumen(), "Todavía no hay avance guardado en este navegador.");
    }
    if (!listaAtascos) return;
    const atascos = state.atascos(3).slice(0, 5);
    listaAtascos.replaceChildren();
    if (atascos.length === 0) {
      const vacio = document.createElement("li");
      vacio.textContent = "Sin módulos que hayan costado más de dos intentos.";
      listaAtascos.append(vacio);
      return;
    }
    for (const dato of atascos) {
      const fila = document.createElement("li");
      fila.textContent = `${dato.nombre} · módulo ${dato.modulo + 1}: ${dato.intentos} intentos`
        + (dato.superado ? " (superado)" : " (sin superar)");
      listaAtascos.append(fila);
    }
  }

  ver("#progress-generate")?.addEventListener("click", () => {
    if (!salida) return;
    salida.value = state.exportar();
    salida.hidden = false;
    salida.focus();
    salida.select();
    decir("Listo. Esta copia local sirve para recuperar un avance de invitado.", "ok");
  });

  ver("#progress-copy")?.addEventListener("click", async () => {
    if (!salida || !salida.value) { decir("Primero genera la copia local.", "error"); return; }
    salida.select();
    try {
      await navigator.clipboard.writeText(salida.value);
      decir("Copiado al portapapeles.", "ok");
    } catch {
      decir("No pude copiarlo solo: el texto quedó seleccionado, usa Ctrl+C.", "error");
    }
  });

  /* Un archivo llega entero. Pegar cuatro mil caracteres en un chat se corta,
     se reformatea o se pierde, y la copia deja de servir. */
  ver("#progress-download")?.addEventListener("click", () => {
    const contenido = state.exportar();
    const fecha = new Date().toISOString().slice(0, 10);
    const nombre = "codigo-cero-" + state.perfil().instalacion + "-" + fecha + ".json";
    try {
      const enlace = document.createElement("a");
      const url = URL.createObjectURL(new Blob([contenido], { type: "application/json" }));
      enlace.href = url;
      enlace.download = nombre;
      document.body.append(enlace);
      enlace.click();
      enlace.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      decir("Descargado como " + nombre + ".", "ok");
    } catch {
      if (salida) { salida.value = contenido; salida.hidden = false; salida.select(); }
      decir("Tu navegador no permitió la descarga: la copia quedó abajo para copiarla.", "error");
    }
  });

  ver("#progress-apply")?.addEventListener("click", () => {
    const texto = entrada ? entrada.value.trim() : "";
    if (!texto) { decir("Pega primero la copia local que quieres restaurar.", "error"); return; }
    const resultado = state.importar(texto);
    if (!resultado.ok) { decir(resultado.error, "error"); return; }
    decir("Avance restaurado: " + describir(resultado.resumen, "sin ejercicios completados."), "ok");
    entrada.value = "";
    pintarResumen();
    globalThis.dispatchEvent(new Event("pageshow"));
  });

  /* Borrar es irreversible y no hay copia en ningún servidor: se pide confirmar. */
  ver("#progress-clear")?.addEventListener("click", (evento) => {
    const boton = evento.currentTarget;
    if (boton.dataset.confirmando !== "si") {
      boton.dataset.confirmando = "si";
      boton.textContent = "Confirmar borrado";
      decir("Esto borra todo tu avance en este navegador y no se puede deshacer. Vuelve a pulsar para confirmar.", "error");
      return;
    }
    if (state.borrar() === false) {
      decir("Para eliminar tu cuenta y los datos sincronizados, abre Mi cuenta.", "error");
      boton.dataset.confirmando = "no";
      boton.textContent = "Borrar mi avance";
      return;
    }
    boton.dataset.confirmando = "no";
    boton.textContent = "Borrar mi avance";
    if (salida) { salida.value = ""; salida.hidden = true; }
    decir("Avance borrado.", "ok");
    pintarResumen();
    globalThis.dispatchEvent(new Event("pageshow"));
  });

  pintarResumen();
  globalThis.addEventListener("pageshow", pintarResumen);
})();

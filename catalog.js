(() => {
  "use strict";
  const state = globalThis.LearningState;
  const container = document.querySelector("#continue-learning");
  if (!state || !container) return;
  const routeLink = (href) => {
    const review = document.documentElement?.dataset?.review;
    if (!review) return href;
    const [path, hash] = href.split("#");
    return path + "?revision=" + encodeURIComponent(review) + (hash ? "#" + hash : "");
  };
  function render() {
    const routes = state.routes.map((route) => state.progress(route.id));
    routes.forEach((route) => {
      const card = document.querySelector('[data-learning-route="' + route.id + '"]');
      if (!card) return;
      const progress = card.querySelector("[data-route-progress]");
      const details = card.querySelector("[data-route-detail]");
      const fill = card.querySelector("[data-route-fill]");
      progress.textContent = route.completed + "/" + route.count + " " + route.unit;
      details.textContent = route.done ? "✓ Ruta completada · puedes repasar"
        : route.mini ? (route.started ? "En curso · práctica guiada" : "Introducción guiada")
        : route.exams + "/" + Math.ceil(route.count / 4) + " exámenes aprobados"
          + (route.completed === route.count ? " · termina los pendientes" : "");
      fill.style.width = route.percent + "%";
      card.querySelector("[data-route-action]").textContent = route.done ? "Repasar ruta →" : route.started ? "Continuar aprendiendo →" : route.mini ? "Abrir mini curso →" : "Abrir ruta →";
      card.href = routeLink(route.started ? route.href : route.path);
    });
    const recent = routes.filter((route) => route.started && !route.done).sort((a, b) => b.updatedAt - a.updatedAt)[0];
    container.hidden = !recent;
    if (recent) {
      document.querySelector("#continue-title").textContent = "Continúa con " + recent.name;
      document.querySelector("#continue-description").textContent = (recent.mini ? "Mini proyecto " : recent.id === "python" ? "Proyecto " : "Módulo ")
        + (recent.active + 1) + " de " + recent.count + " · Completados: " + recent.completed + "."
        + (!recent.mini && recent.completed === recent.count && recent.exams < Math.ceil(recent.count / 4)
          ? " Te quedan exámenes para cerrar la ruta."
          : " Retoma tus elecciones y borradores.");
      document.querySelector("#continue-link").href = routeLink(recent.href);
    }
    document.querySelector("#catalog-storage").textContent = state.storageAvailable()
      ? state.cuenta?.() ? "Tu avance se guarda automáticamente en tu perfil."
        : "Crea tu perfil en Mi cuenta para guardar tu avance y retomarlo desde cualquier dispositivo."
      : "No pudimos preparar el almacenamiento seguro de tu perfil. Inicia sesión de nuevo.";
  }
  render();
  /* Volver a la pestaña o un cambio hecho en otra obliga a releer el avance:
     el estado vive en memoria y pudo quedar atrás. */
  const releer = () => { state.refrescar?.(); render(); };
  window.addEventListener("pageshow", releer);
  window.addEventListener("storage", releer);
})();

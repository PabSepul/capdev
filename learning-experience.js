/* Itinerarios y feedback estructurado. No recoge texto libre ni código. */
(() => {
  "use strict";
  const state = globalThis.LearningState;
  if (!state) return;

  const paths = [
    {
      id: "web",
      name: "Desarrollo web",
      description: "Construye interfaces y conecta una aplicación con datos.",
      routes: ["html-css", "javascript", "git", "apis", "typescript", "react"]
    },
    {
      id: "python-datos",
      name: "Python y datos",
      description: "Programa, consulta información y prepara reportes reproducibles.",
      routes: ["python", "sql", "datos-python", "apis", "mongodb"]
    },
    {
      id: "herramientas",
      name: "Herramientas profesionales",
      description: "Domina el flujo de trabajo que acompaña a un proyecto real.",
      routes: ["terminal", "git", "nodejs", "docker", "testing"]
    }
  ];
  const routeById = new Map(state.routes.map(route => [route.id, route]));
  const selectedPath = () => paths.find(path => path.id === state.itinerario()) || null;
  const reviewLink = href => {
    const review = document.documentElement?.dataset?.review;
    if (!review) return href;
    const [path, hash] = href.split("#");
    return path + "?revision=" + encodeURIComponent(review) + (hash ? "#" + hash : "");
  };
  const routeLink = id => reviewLink(routeById.get(id)?.path || (id + ".html"));

  function nextRoute(path) {
    return path.routes.find(id => !state.progress(id)?.done) || path.routes.at(-1);
  }

  function renderHome() {
    const host = document.querySelector("#itinerarios");
    if (!host || typeof host.querySelectorAll !== "function") return;
    const selected = selectedPath();
    host.querySelectorAll("[data-itinerary]").forEach(card => {
      const path = paths.find(item => item.id === card.dataset.itinerary);
      if (!path) return;
      const progress = path.routes.map(id => state.progress(id));
      const completed = progress.filter(item => item?.done).length;
      const modules = progress.reduce((sum, item) => sum + (item?.completed || 0), 0);
      const total = progress.reduce((sum, item) => sum + (item?.count || 0), 0);
      const chosen = selected?.id === path.id;
      card.classList.toggle("is-selected", chosen);
      const button = card.querySelector("[data-choose-itinerary]");
      button.setAttribute("aria-pressed", String(chosen));
      button.textContent = chosen ? "Itinerario elegido ✓" : "Elegir este itinerario";
      card.querySelector("[data-itinerary-progress]").textContent = completed
        ? `${completed} de ${path.routes.length} rutas completas · ${modules} de ${total} ejercicios`
        : "Listo para comenzar · puedes cambiarlo cuando quieras";
      const resume = card.querySelector("[data-itinerary-resume]");
      const destination = nextRoute(path);
      resume.href = routeLink(destination);
      resume.textContent = progress.some(item => item?.started) ? "Continuar itinerario →" : "Comenzar itinerario →";
    });
    const status = host.querySelector("#itinerary-status");
    if (status) status.textContent = selected
      ? `Elegiste ${selected.name}. Te mostraremos el paso recomendado dentro de cada ruta.`
      : "Elige un itinerario para recibir orientación entre rutas. Todas seguirán disponibles.";
  }

  function choose(event) {
    const button = event.target.closest("[data-choose-itinerary]");
    if (!button) return;
    const card = button.closest("[data-itinerary]");
    if (!card || !state.seleccionarItinerario(card.dataset.itinerary)) return;
    renderHome();
    document.querySelector("#itinerary-status")?.focus();
  }

  function currentRouteId() {
    if (document.body?.dataset?.course) return document.body.dataset.course;
    return location.pathname.split("/").pop()?.replace(/\.html$/, "") === "python" ? "python" : null;
  }

  function renderOrientation() {
    const routeId = currentRouteId();
    const breadcrumb = document.querySelector(".course-breadcrumb");
    if (!routeId || !breadcrumb || typeof breadcrumb.insertAdjacentElement !== "function") return;
    let panel = document.querySelector("#route-orientation");
    if (!panel) {
      panel = document.createElement("aside");
      panel.id = "route-orientation";
      panel.className = "route-orientation";
      panel.setAttribute("aria-label", "Orientación de aprendizaje");
      breadcrumb.insertAdjacentElement("afterend", panel);
    }
    const path = selectedPath();
    if (!path) {
      panel.innerHTML = `<div><span>ORIENTACIÓN</span><strong>¿Quieres saber qué estudiar después?</strong><p>Elige un itinerario para conectar esta ruta con un objetivo.</p></div><a href="${reviewLink("index.html#itinerarios")}">Ver itinerarios →</a>`;
      return;
    }
    const position = path.routes.indexOf(routeId);
    if (position < 0) {
      panel.innerHTML = `<div><span>EXPLORACIÓN LIBRE</span><strong>${path.name} sigue guardado</strong><p>Esta ruta no cambia el avance de tu itinerario. Puedes explorarla y regresar cuando quieras.</p></div><a href="${reviewLink("index.html#itinerarios")}">Volver al itinerario →</a>`;
      return;
    }
    const previous = path.routes[position - 1];
    const next = path.routes[position + 1];
    const nextCopy = next ? `Después continúa con ${routeById.get(next).name}.` : "Esta es la última ruta del itinerario.";
    panel.innerHTML = `<div><span>${path.name.toUpperCase()} · PASO ${position + 1} DE ${path.routes.length}</span><strong>${routeById.get(routeId).name}</strong><p>${nextCopy}</p></div><div class="route-orientation-links">${previous ? `<a href="${routeLink(previous)}">← ${routeById.get(previous).name}</a>` : ""}${next ? `<a href="${routeLink(next)}">${routeById.get(next).name} →</a>` : `<a href="${reviewLink("index.html#itinerarios")}">Ver avance →</a>`}</div>`;
  }

  let active = null;
  function feedbackPanel() {
    let panel = document.querySelector("#exercise-feedback");
    if (panel && typeof panel.querySelector === "function" && panel.querySelector("#exercise-feedback-title")) return panel;
    if (panel) return null;
    const anchor = document.querySelector("#starter-complete, #complete-course-project");
    if (!anchor || typeof anchor.insertAdjacentElement !== "function") return null;
    panel = document.createElement("section");
    panel.id = "exercise-feedback";
    panel.className = "exercise-feedback";
    panel.hidden = true;
    panel.innerHTML = `<div><span>AYÚDANOS A MEJORAR</span><h4 id="exercise-feedback-title">¿Esta cápsula fue clara?</h4><p>Tu respuesta no incluye el código que escribiste.</p></div><div class="exercise-feedback-actions"><button type="button" data-feedback-value="claro">Sí, quedó claro</button><button type="button" data-feedback-value="mejorar">Necesita más claridad</button></div><div class="exercise-feedback-areas" hidden><p>¿Qué deberíamos revisar?</p><div><button type="button" data-feedback-area="explicacion">Explicación</button><button type="button" data-feedback-area="mision">Misión</button><button type="button" data-feedback-area="resultado">Resultado o error</button><button type="button" data-feedback-area="pistas">Pistas</button><button type="button" data-feedback-area="otro">Otro aspecto</button></div></div><p class="exercise-feedback-status" role="status" tabindex="-1"></p>`;
    anchor.insertAdjacentElement("afterend", panel);
    panel.addEventListener("click", event => {
      const valueButton = event.target.closest("[data-feedback-value]");
      const areaButton = event.target.closest("[data-feedback-area]");
      if (!active || (!valueButton && !areaButton)) return;
      if (valueButton?.dataset.feedbackValue === "mejorar") {
        panel.querySelector(".exercise-feedback-areas").hidden = false;
        panel.querySelector("[data-feedback-area]")?.focus();
        return;
      }
      const value = areaButton ? "mejorar" : "claro";
      const area = areaButton?.dataset.feedbackArea || null;
      state.registrarFeedback(active.route, active.index, value, area);
      paintFeedback(panel);
      const status = panel.querySelector(".exercise-feedback-status");
      status.textContent = state.cuenta()
        ? "Gracias. Guardaremos esta respuesta con tu perfil."
        : "Gracias. La respuesta quedó en este dispositivo; entra en Mi cuenta para enviarla con tu perfil.";
      status.focus();
    });
    return panel;
  }

  function paintFeedback(panel) {
    const answer = active ? state.feedback(active.route, active.index) : null;
    panel.querySelectorAll("[data-feedback-value]").forEach(button => {
      const selected = answer?.valor === button.dataset.feedbackValue;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    panel.querySelectorAll("[data-feedback-area]").forEach(button => {
      const selected = answer?.area === button.dataset.feedbackArea;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    panel.querySelector(".exercise-feedback-areas").hidden = answer?.valor !== "mejorar";
  }

  function setModule(route, index, details = {}) {
    active = { route, index, title: details.title || "esta cápsula" };
    const panel = feedbackPanel();
    if (!panel) return;
    panel.querySelector("#exercise-feedback-title").textContent = `¿La cápsula «${active.title}» fue clara?`;
    panel.querySelector(".exercise-feedback-status").textContent = "";
    paintFeedback(panel);
    panel.hidden = !state.feedback(route, index);
  }

  function showFeedback() {
    const panel = feedbackPanel();
    if (panel && active) panel.hidden = false;
  }

  document.querySelector("#itinerarios")?.addEventListener("click", choose);
  renderHome();
  renderOrientation();
  globalThis.addEventListener?.("pageshow", () => { state.refrescar?.(); renderHome(); renderOrientation(); });
  globalThis.LearningExperience = Object.freeze({ paths, setModule, showFeedback });
})();

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
  const routeTips = Object.freeze({
    "python": "Aquí una instrucción pequeña puede convertirse en un programa completo.",
    "html-css": "Aquí verás cómo el contenido y el estilo construyen una interfaz juntos.",
    "javascript": "Prueba cada cambio y observa cómo los datos hacen que la página responda.",
    "sql": "Lee la consulta como una pregunta: cada cláusula precisa la respuesta.",
    "git": "Haz cambios pequeños y descríbelos bien: así será más fácil volver y comparar.",
    "apis": "Sigue el viaje de la petición a la respuesta antes de cambiar el código.",
    "terminal": "Lee primero la ruta y después el comando: sabrás dónde ocurrirá cada acción.",
    "regex": "Construye el patrón por partes y comprueba qué texto acepta en cada paso.",
    "ia": "Compara la entrada, el proceso y la salida antes de evaluar una respuesta.",
    "datos-python": "Observa una fila primero; después aplica la transformación al conjunto.",
    "nodejs": "Distingue qué dato entra, qué procesa el servidor y qué resultado devuelve.",
    "typescript": "Los tipos describen tu intención y te ayudan a detectar inconsistencias antes.",
    "react": "Piensa cada componente como una pieza con datos de entrada y una responsabilidad.",
    "json": "Revisa llaves, comas y tipos: la estructura hace que el dato sea previsible.",
    "markdown": "Empieza por la jerarquía del contenido y añade formato solo cuando ayude a leer.",
    "accesibilidad": "Comprueba que la información siga clara con teclado, texto y buen contraste.",
    "testing": "Una buena prueba explica el comportamiento esperado con un caso concreto.",
    "docker": "Separa imagen, contenedor y datos persistentes para entender qué estás cambiando.",
    "mongodb": "Mira primero la forma del documento y después decide cómo consultarlo."
  });
  const selectedPath = () => paths.find(path => path.id === state.itinerario()) || null;
  const reviewLink = href => {
    const review = document.documentElement?.dataset?.review;
    if (!review) return href;
    const [path, hash] = href.split("#");
    return path + "?revision=" + encodeURIComponent(review) + (hash ? "#" + hash : "");
  };
  const routeLink = id => reviewLink(routeById.get(id)?.path || (id + ".html"));
  const capiAsset = pose => `assets/capi-${pose}.svg?v=20260914-capi3`;
  const capiImage = (pose, alt, className = "capi-character") =>
    `<img class="${className}" src="${capiAsset(pose)}" alt="${alt || ""}">`;

  function decorateHome() {
    const anchor = document.querySelector(".home-hero .hero-footnote");
    if (!anchor || document.querySelector(".home-capi-intro")) return;
    anchor.insertAdjacentHTML("afterend", `<aside class="home-capi-intro" aria-label="Presentación de Capi">${capiImage("welcome", "Capi, la mascota de CápsulasDev, saludando")}<p><strong>Hola, soy Capi.</strong><span>Te acompañaré cuando necesites una pista o quieras saber qué sigue.</span></p></aside>`);
  }

  function decorateHints() {
    document.querySelectorAll(".hint-box > div:first-child").forEach(header => {
      if (header.querySelector(".capi-hint-character")) return;
      header.insertAdjacentHTML("afterbegin", capiImage("thinking", "", "capi-character capi-hint-character"));
      header.classList.add("has-capi");
    });
  }

  function decorateAssessments() {
    const checkpoint = document.querySelector(".checkpoint-copy");
    if (checkpoint && typeof checkpoint.querySelector === "function" && typeof checkpoint.insertAdjacentHTML === "function" && !checkpoint.querySelector(".capi-checkpoint-note")) {
      checkpoint.insertAdjacentHTML("beforeend", `<div class="capi-checkpoint-note">${capiImage("celebrate", "", "capi-character")}<span>Completaste los ejercicios del nivel. Ahora comprueba lo que puedes explicar y aplicar.</span></div>`);
    }
    const examCopy = document.querySelector(".exam-head > div:first-child");
    if (examCopy && typeof examCopy.querySelector === "function" && typeof examCopy.insertAdjacentHTML === "function" && !examCopy.querySelector(".capi-exam-guide")) {
      examCopy.insertAdjacentHTML("afterbegin", `<div class="capi-exam-guide">${capiImage("thinking", "", "capi-character")}<span>Capi te acompaña: lee cada opción con calma.</span></div>`);
    }
    document.querySelectorAll(".python-finish > span:first-child").forEach(icon => {
      if (typeof icon.querySelector !== "function" || icon.querySelector(".capi-finish-character")) return;
      icon.innerHTML = capiImage("celebrate", "", "capi-character capi-finish-character");
    });
  }

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
    const routeTip = routeTips[routeId] || "Avanza con una idea a la vez y comprueba cada cambio.";
    if (!path) {
      panel.innerHTML = `<div class="route-orientation-main">${capiImage("thinking", "", "capi-character capi-orientation-character")}<div><span>ORIENTACIÓN DE CAPI</span><strong>¿Quieres saber qué estudiar después?</strong><p>${routeTip} Elige un itinerario para conectar esta ruta con un objetivo.</p></div></div><a href="${reviewLink("index.html#itinerarios")}">Ver itinerarios →</a>`;
      return;
    }
    const position = path.routes.indexOf(routeId);
    if (position < 0) {
      panel.innerHTML = `<div class="route-orientation-main">${capiImage("guide", "", "capi-character capi-orientation-character")}<div><span>CAPI · EXPLORACIÓN LIBRE</span><strong>${path.name} sigue guardado</strong><p>${routeTip} Esta ruta no cambia el avance de tu itinerario.</p></div></div><a href="${reviewLink("index.html#itinerarios")}">Volver al itinerario →</a>`;
      return;
    }
    const previous = path.routes[position - 1];
    const next = path.routes[position + 1];
    const nextCopy = next ? `Después continúa con ${routeById.get(next).name}.` : "Esta es la última ruta del itinerario.";
    panel.innerHTML = `<div class="route-orientation-main">${capiImage(next ? "guide" : "celebrate", "", "capi-character capi-orientation-character")}<div><span>CAPI · ${path.name.toUpperCase()} · PASO ${position + 1} DE ${path.routes.length}</span><strong>${routeById.get(routeId).name}</strong><p>${routeTip} ${nextCopy}</p></div></div><div class="route-orientation-links">${previous ? `<a href="${routeLink(previous)}">← ${routeById.get(previous).name}</a>` : ""}${next ? `<a href="${routeLink(next)}">${routeById.get(next).name} →</a>` : `<a href="${reviewLink("index.html#itinerarios")}">Ver avance →</a>`}</div>`;
  }

  let active = null;
  const sessionAttempts = new Map();
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
    panel.innerHTML = `<div class="exercise-feedback-intro">${capiImage("guide", "", "capi-character capi-feedback-character")}<div><span>CAPI TE ACOMPAÑA</span><strong class="capi-coach-message">Revisemos cómo resultó este intento.</strong><h4 id="exercise-feedback-title">¿Esta cápsula fue clara?</h4><p>Tu respuesta no incluye el código que escribiste.</p></div></div><div class="capi-adaptive-help" hidden><span class="capi-adaptive-kicker"></span><p class="capi-adaptive-copy"></p><button type="button" data-adaptive-hint>Abrir una pista</button></div><div class="exercise-feedback-actions"><button type="button" data-feedback-value="claro">Sí, quedó claro</button><button type="button" data-feedback-value="mejorar">Necesita más claridad</button></div><div class="exercise-feedback-areas" hidden><p>¿Qué deberíamos revisar?</p><div><button type="button" data-feedback-area="explicacion">Explicación</button><button type="button" data-feedback-area="mision">Misión</button><button type="button" data-feedback-area="resultado">Resultado o error</button><button type="button" data-feedback-area="pistas">Pistas</button><button type="button" data-feedback-area="otro">Otro aspecto</button></div></div><p class="exercise-feedback-status" role="status" tabindex="-1"></p>`;
    anchor.insertAdjacentElement("afterend", panel);
    panel.addEventListener("click", event => {
      const valueButton = event.target.closest("[data-feedback-value]");
      const areaButton = event.target.closest("[data-feedback-area]");
      const adaptiveButton = event.target.closest("[data-adaptive-hint]");
      if (adaptiveButton) {
        const hintButton = document.querySelector("#show-hint, #starter-show-hint");
        if (!hintButton || hintButton.disabled) return;
        hintButton.click();
        adaptiveButton.textContent = hintButton.disabled ? "Ya viste todas las pistas" : "Abrir la siguiente pista";
        adaptiveButton.disabled = hintButton.disabled;
        hintButton.focus();
        return;
      }
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
    panel.querySelector(".capi-adaptive-help").hidden = true;
    paintFeedback(panel);
    panel.hidden = !state.feedback(route, index);
  }

  function activeAttemptCount() {
    if (!active) return 0;
    const key = `${active.route}:${active.index}`;
    const sessionCount = sessionAttempts.get(key) || 0;
    if (typeof state.atascos !== "function") return sessionCount;
    const item = state.atascos(1).find(entry => entry.ruta === active.route && entry.modulo === active.index);
    return Math.max(item?.intentos || 0, sessionCount);
  }

  function renderAdaptiveHelp(panel, outcome) {
    const help = panel.querySelector(".capi-adaptive-help");
    if (!help) return;
    const attempts = activeAttemptCount();
    const hintButton = document.querySelector("#show-hint, #starter-show-hint");
    help.hidden = Boolean(outcome.passed) || attempts < 2 || !hintButton;
    if (help.hidden) return;

    const kicker = help.querySelector(".capi-adaptive-kicker");
    const copy = help.querySelector(".capi-adaptive-copy");
    const action = help.querySelector("[data-adaptive-hint]");
    action.disabled = Boolean(hintButton.disabled);
    if (hintButton.disabled) {
      kicker.textContent = "PISTAS REVISADAS";
      copy.textContent = "Ya abriste las tres pistas. Compara una comprobación pendiente a la vez con tu código.";
      action.textContent = "Ya viste todas las pistas";
      return;
    }
    if (attempts >= 4) {
      kicker.textContent = "AYUDA CONCRETA";
      copy.textContent = "Has trabajado varias veces en esta cápsula. Abre la siguiente pista y compárala, línea por línea, con tu código.";
      action.textContent = "Acercarme a la ayuda concreta";
      return;
    }
    if (attempts === 3) {
      kicker.textContent = "SEGUNDO APOYO";
      copy.textContent = "El bloqueo continúa. La siguiente pista explica el concepto que sostiene la solución.";
      action.textContent = "Abrir la siguiente pista";
      return;
    }
    kicker.textContent = "PRIMER APOYO";
    copy.textContent = "Ya hiciste dos intentos. Una pista breve puede ayudarte a mirar el problema desde otro ángulo.";
    action.textContent = "Ver la primera pista";
  }

  function showFeedback(outcome = {}) {
    const panel = feedbackPanel();
    if (!panel || !active) return;
    const key = `${active.route}:${active.index}`;
    if (outcome.passed) sessionAttempts.delete(key);
    else sessionAttempts.set(key, Math.min((sessionAttempts.get(key) || 0) + 1, 99999));
    const pose = outcome.passed ? "celebrate" : outcome.error ? "thinking" : "guide";
    const attempts = activeAttemptCount();
    const message = outcome.passed
      ? "¡Buen avance! Tu solución cumple la misión."
      : attempts >= 4
        ? "Tu esfuerzo ya merece una ayuda más concreta. Avancemos una pista a la vez."
        : attempts === 3
          ? "Ya aislaste parte del problema. La siguiente pista explica el concepto."
          : attempts === 2
            ? "Veo que ya hiciste dos intentos. Probemos una pista breve."
      : outcome.error
        ? "Revisemos el error con calma. La consola señala dónde empezar."
        : "Tu código ya se ejecuta. Revisa el primer criterio pendiente.";
    const character = panel.querySelector(".capi-feedback-character");
    if (character) character.src = capiAsset(pose);
    panel.querySelector(".capi-coach-message").textContent = message;
    renderAdaptiveHelp(panel, outcome);
    panel.hidden = false;
  }

  function showExamResult(outcome = {}) {
    const guide = document.querySelector(".capi-exam-guide");
    if (!guide || typeof guide.querySelector !== "function") return;
    const character = guide.querySelector("img");
    const copy = guide.querySelector("span");
    if (!character || !copy) return;
    let pose = "thinking";
    let message = "Capi te acompaña: lee cada opción con calma.";
    if (outcome.pending) message = "Todavía falta una respuesta. Revisa las preguntas antes de continuar.";
    else if (outcome.passed === true) {
      pose = "celebrate";
      message = `¡Nivel aprobado! Resolviste ${outcome.correct} de ${outcome.total} preguntas.`;
    } else if (outcome.passed === false) {
      message = `Este intento tuvo ${outcome.correct} de ${outcome.total}. Revisa las explicaciones y vuelve a probar.`;
    }
    character.src = capiAsset(pose);
    copy.textContent = message;
  }

  document.querySelector("#itinerarios")?.addEventListener("click", choose);
  decorateHome();
  decorateHints();
  decorateAssessments();
  renderHome();
  renderOrientation();
  globalThis.addEventListener?.("pageshow", () => { state.refrescar?.(); decorateHome(); decorateHints(); decorateAssessments(); renderHome(); renderOrientation(); });
  globalThis.LearningExperience = Object.freeze({ paths, routeTips, setModule, showFeedback, showExamResult });
})();

(() => {
  "use strict";

  const state = globalThis.LearningState;
  const dialog = document.querySelector("#onboarding-dialog");
  if (!state || !dialog) return;

  const view = dialog.querySelector("#onboarding-view");
  const stepLabel = dialog.querySelector("#onboarding-step");
  const progress = dialog.querySelector(".onboarding-progress");
  const progressFill = progress.querySelector("span");
  const back = dialog.querySelector("#onboarding-back");
  const capiImage = dialog.querySelector("#onboarding-capi-image");
  const capiCopy = dialog.querySelector("#onboarding-capi-copy");
  const answers = {};
  let current = 0;
  let lastFocus = null;

  const questions = [
    {
      id: "aspiration",
      title: "¿Qué te gustaría lograr con la programación?",
      copy: "Piensa en algo que te daría orgullo poder construir o entender.",
      capi: "Empecemos por tu destino. Yo me encargo de ordenar el camino.",
      pose: "welcome",
      options: [
        ["web", "&lt;/&gt;", "Crear sitios o aplicaciones", "Quiero construir experiencias que otras personas puedan usar."],
        ["data", "▤", "Trabajar con datos", "Quiero organizar información y convertirla en respuestas."],
        ["workflow", ">_", "Dominar herramientas profesionales", "Quiero organizar, probar y publicar proyectos con confianza."],
        ["discover", "?", "Todavía quiero descubrirlo", "Quiero probar distintas ideas antes de decidir."]
      ]
    },
    {
      id: "motivation",
      title: "¿Qué te mueve a aprender ahora?",
      copy: "Tu motivo nos ayuda a elegir ejemplos y un ritmo que tenga sentido para ti.",
      capi: "No tiene que ser una meta enorme. Una razón concreta es suficiente para empezar.",
      pose: "thinking",
      options: [
        ["project", "01", "Dar vida a una idea propia", "Tengo algo que me gustaría crear paso a paso."],
        ["career", "02", "Abrir nuevas oportunidades", "Quiero desarrollar habilidades para mi futuro laboral."],
        ["work", "03", "Resolver mejor tareas reales", "Quiero automatizar, analizar u organizar mejor mi trabajo."],
        ["curiosity", "04", "Entender cómo funciona la tecnología", "Quiero aprender por curiosidad y construir buenas bases."]
      ]
    },
    {
      id: "experience",
      title: "¿Desde dónde estás comenzando?",
      copy: "Esto no cambia lo que puedes aprender; solo ajusta la primera parte del recorrido.",
      capi: "Puedes empezar sin experiencia. Cada ruta explica la idea antes de pedirte que la uses.",
      pose: "guide",
      options: [
        ["none", "A", "Nunca he programado", "Quiero partir con explicaciones muy claras."],
        ["tried", "B", "He probado algunos tutoriales", "Reconozco ciertas ideas, pero todavía necesito guía."],
        ["basics", "C", "Ya hice ejercicios pequeños", "Puedo leer código básico y quiero avanzar con más propósito."]
      ]
    },
    {
      id: "time",
      title: "¿Cuánto tiempo puedes dedicar cada semana?",
      copy: "Elige un ritmo realista. Siempre podrás avanzar más lento o más rápido.",
      capi: "La constancia pesa más que la velocidad. Incluso una hora semanal puede llevarte lejos.",
      pose: "thinking",
      options: [
        ["light", "1h", "Alrededor de 1 hora", "Dos o tres cápsulas breves por semana."],
        ["steady", "3h", "Entre 2 y 3 horas", "Varias sesiones cortas para mantener continuidad."],
        ["focused", "5h", "Entre 4 y 6 horas", "Un ritmo más intenso con tiempo para practicar y repasar."]
      ]
    }
  ];

  const pathDetails = {
    web: {
      name: "Desarrollo web", href: "html-css.html", modules: 88,
      stages: ["HTML y CSS", "JavaScript, Git y APIs", "TypeScript y React"]
    },
    "python-datos": {
      name: "Python y datos", href: "python.html", modules: 76,
      stages: ["Python", "SQL y Datos con Python", "APIs y MongoDB"]
    },
    herramientas: {
      name: "Herramientas profesionales", href: "terminal.html", modules: 64,
      stages: ["Terminal y Git", "Node.js y Docker", "Pruebas automatizadas"]
    }
  };

  const paceDetails = {
    light: { label: "1 hora por semana", capsules: "2–3 cápsulas", divisor: 1 },
    steady: { label: "2–3 horas por semana", capsules: "6–8 cápsulas", divisor: 2.5 },
    focused: { label: "4–6 horas por semana", capsules: "10–14 cápsulas", divisor: 5 }
  };

  function recommendation(input = answers) {
    const scores = { web: 0, "python-datos": 0, herramientas: 0 };
    const aspiration = {
      web: { web: 6 }, data: { "python-datos": 6 }, workflow: { herramientas: 6 },
      discover: { web: 1, "python-datos": 1, herramientas: 1 }
    }[input.aspiration] || {};
    const motivation = {
      project: { web: 3, "python-datos": 1 },
      career: { web: 2, "python-datos": 2, herramientas: 2 },
      work: { "python-datos": 3, herramientas: 2 },
      curiosity: { "python-datos": 2, herramientas: 1, web: 1 }
    }[input.motivation] || {};
    for (const [id, score] of Object.entries(aspiration)) scores[id] += score;
    for (const [id, score] of Object.entries(motivation)) scores[id] += score;
    const id = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];
    const path = pathDetails[id];
    const pace = paceDetails[input.time] || paceDetails.steady;
    const hours = path.modules / 3;
    const center = hours / pace.divisor;
    const weeks = `${Math.max(3, Math.round(center * .85))}–${Math.max(4, Math.round(center * 1.15))} semanas`;
    const experienceCopy = {
      none: "La primera etapa irá con más pausa para que entiendas cada concepto antes de combinarlo.",
      tried: "Comenzarás por los fundamentos, pero podrás avanzar rápido cuando una idea ya te resulte familiar.",
      basics: "Podrás usar las primeras cápsulas como repaso y concentrarte pronto en aplicar lo aprendido."
    }[input.experience] || "Comenzarás por los fundamentos y ajustarás el ritmo mientras avanzas.";
    return { id, ...path, pace, weeks, experienceCopy };
  }

  function reviewHref(href) {
    const review = document.documentElement.dataset.review;
    if (!review) return href;
    const url = new URL(href, location.href);
    url.searchParams.set("revision", review);
    return url.href;
  }

  function optionMarkup(option) {
    const [value, symbol, title, detail] = option;
    return `<button class="onboarding-option" type="button" data-onboarding-choice="${value}"><span aria-hidden="true">${symbol}</span><span><strong>${title}</strong><small>${detail}</small></span><span aria-hidden="true">→</span></button>`;
  }

  function updateFrame(pose, copy, complete = false) {
    capiImage.src = `assets/capi-${pose}.svg?v=20260914-capi3`;
    capiCopy.textContent = copy;
    const value = complete ? questions.length : current + 1;
    progress.setAttribute("aria-valuenow", String(value));
    progressFill.style.width = `${value / questions.length * 100}%`;
    stepLabel.textContent = complete ? "Tu recomendación" : `Pregunta ${value} de ${questions.length}`;
    back.hidden = current === 0;
    back.textContent = complete ? "← Ajustar respuestas" : "← Pregunta anterior";
  }

  function renderQuestion() {
    const question = questions[current];
    updateFrame(question.pose, question.capi);
    view.innerHTML = `<h2 id="onboarding-title" tabindex="-1">${question.title}</h2><p>${question.copy}</p><div class="onboarding-options">${question.options.map(optionMarkup).join("")}</div>`;
    view.querySelector("h2")?.focus();
  }

  function renderResult() {
    const result = recommendation();
    updateFrame("celebrate", `Tu punto de partida recomendado es ${result.stages[0]}. Después iremos conectando cada habilidad.`, true);
    view.innerHTML = `<p class="onboarding-result-kicker">TU RECORRIDO RECOMENDADO</p><h2 id="onboarding-title" tabindex="-1">${result.name}</h2><p>${result.experienceCopy}</p><div class="onboarding-result-summary"><strong>${result.pace.label} · ${result.pace.capsules} por semana</strong><p>El itinerario completo puede tomar alrededor de ${result.weeks}. Es una referencia: puedes detenerte, repetir y ajustar el ritmo.</p></div><ol class="onboarding-curve" aria-label="Curva de aprendizaje recomendada"><li><span>01 · BASES</span><strong>${result.stages[0]}</strong></li><li><span>02 · CONEXIÓN</span><strong>${result.stages[1]}</strong></li><li><span>03 · INTEGRACIÓN</span><strong>${result.stages[2]}</strong></li></ol><div class="onboarding-result-actions"><a class="button" href="${reviewHref(result.href)}" data-onboarding-accept="${result.id}">Elegir esta ruta y comenzar →</a></div><p class="onboarding-result-note">Tus respuestas se usan en este navegador para preparar la recomendación. Solo guardamos el itinerario cuando lo eliges.</p>`;
    view.querySelector("h2")?.focus();
  }

  function render() {
    view.style.animation = "none";
    void view.offsetWidth;
    view.style.animation = "";
    if (current >= questions.length) renderResult(); else renderQuestion();
  }

  function removeOpenParameter() {
    const url = new URL(location.href);
    if (!url.searchParams.has("onboarding")) return;
    url.searchParams.delete("onboarding");
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  function close() {
    if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
    document.body.classList.remove("onboarding-open");
    removeOpenParameter();
    lastFocus?.focus?.();
  }

  function open(trigger = null) {
    lastFocus = trigger || document.activeElement;
    current = 0;
    for (const key of Object.keys(answers)) delete answers[key];
    render();
    try { dialog.showModal(); } catch { dialog.setAttribute("open", ""); }
    document.body.classList.add("onboarding-open");
    view.querySelector("h2")?.focus();
  }

  document.querySelectorAll("[data-onboarding-open]").forEach(trigger => {
    trigger.addEventListener("click", event => { event.preventDefault(); open(trigger); });
  });
  dialog.addEventListener("click", event => {
    const choice = event.target.closest("[data-onboarding-choice]");
    const accept = event.target.closest("[data-onboarding-accept]");
    if (choice) {
      answers[questions[current].id] = choice.dataset.onboardingChoice;
      current += 1;
      render();
    } else if (accept) {
      state.seleccionarItinerario(accept.dataset.onboardingAccept);
    } else if (event.target.closest("[data-onboarding-close]") || event.target === dialog) close();
  });
  dialog.addEventListener("cancel", event => { event.preventDefault(); close(); });
  back.addEventListener("click", () => { current = Math.max(0, current - 1); render(); });

  if (new URL(location.href).searchParams.get("onboarding") === "1") open();
  globalThis.LearningOnboarding = Object.freeze({ open, recommendation });
})();

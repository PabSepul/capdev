/* Orientación práctica compartida: próximo paso, meta semanal y repaso. */
(() => {
  "use strict";
  const state = globalThis.LearningState;
  if (!state) return;

  const paceLabels = Object.freeze({
    light: "Ritmo tranquilo",
    steady: "Ritmo constante",
    focused: "Ritmo intensivo"
  });

  function reviewHref(href) {
    const review = document.documentElement?.dataset?.review;
    if (!review) return href;
    const url = new URL(href, location.href);
    url.searchParams.set("revision", review);
    return url.href;
  }

  function selectedPath() {
    return (globalThis.LearningExperience?.paths || []).find(path => path.id === state.itinerario()) || null;
  }

  function nextStep() {
    const path = selectedPath();
    const all = state.routes.map(route => state.progress(route.id));
    const recent = all.filter(route => route.started && !route.done).sort((a, b) => b.updatedAt - a.updatedAt)[0];
    const route = path
      ? path.routes.map(id => state.progress(id)).find(progress => progress && !progress.done)
      : recent;
    if (!route) return null;
    const pendingExamLevel = route.exams + 1;
    const pendingExam = route.completed >= pendingExamLevel * 4;
    if (pendingExam) return {
      route,
      path,
      title: `Cierra el nivel ${pendingExamLevel} de ${route.name}`,
      copy: `Completaste sus cuatro ejercicios. Ahora responde el mini examen para abrir el siguiente nivel.`,
      action: "Ir al mini examen →"
    };
    return {
      route,
      path,
      title: route.started ? `Retoma ${route.name}` : `Comienza con ${route.name}`,
      copy: `Tu próximo paso es ${route.id === "python" ? "el proyecto" : "el módulo"} ${route.active + 1} de ${route.count}. ${route.completed ? `Ya completaste ${route.completed}.` : "Aquí empieza tu itinerario."}`,
      action: route.started ? "Continuar desde aquí →" : "Comenzar esta ruta →"
    };
  }

  function renderHome() {
    const container = document.querySelector("#continue-learning");
    if (!container) return;
    const step = nextStep();
    container.hidden = !step;
    if (!step) return;
    document.querySelector("#continue-title").textContent = step.title;
    document.querySelector("#continue-description").textContent = step.copy;
    const link = document.querySelector("#continue-link");
    link.href = reviewHref(step.route.href);
    link.textContent = step.action;

    const weekly = document.querySelector("#weekly-home");
    const plan = state.metaSemanal();
    weekly.hidden = !plan;
    if (plan) {
      document.querySelector("#weekly-home-value").textContent = `${plan.completados} / ${plan.objetivo} cápsulas`;
      document.querySelector("#weekly-home-copy").textContent = plan.restantes
        ? `Te faltan ${plan.restantes} para completar tu meta. Cada ejercicio terminado cuenta.`
        : "Meta cumplida. Puedes repasar o avanzar a tu propio ritmo.";
      const meter = document.querySelector("#weekly-home-meter");
      meter.setAttribute("aria-valuenow", String(plan.porcentaje));
      meter.querySelector("span").style.width = `${plan.porcentaje}%`;
    }

    const review = document.querySelector("#review-home");
    const list = document.querySelector("#review-home-list");
    const suggestions = state.recomendacionesRepaso(2);
    list.replaceChildren();
    for (const item of suggestions) {
      const li = document.createElement("li");
      const anchor = document.createElement("a");
      const copy = document.createElement("span");
      anchor.href = reviewHref(item.href);
      anchor.textContent = `${item.nombre} · ${item.modulo === 0 && item.ruta === "python" ? "Proyecto 1" : `${item.ruta === "python" ? "Proyecto" : "Módulo"} ${item.numero}`}`;
      copy.textContent = item.motivo;
      li.append(anchor, copy);
      list.append(li);
    }
    review.hidden = suggestions.length === 0;
  }

  function renderAccount() {
    const host = document.querySelector("#account-weekly");
    if (!host) return;
    const plan = state.metaSemanal();
    const title = document.querySelector("#account-weekly-title");
    const copy = document.querySelector("#account-weekly-copy");
    const meter = document.querySelector("#account-weekly-meter");
    host.querySelectorAll("[data-weekly-pace]").forEach(button => {
      const selected = plan?.ritmo === button.dataset.weeklyPace;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    meter.hidden = !plan;
    if (!plan) {
      title.textContent = "Elige un ritmo sostenible";
      copy.textContent = "Capi convertirá el tiempo que tienes en una meta breve. Puedes cambiarla cuando quieras.";
      return;
    }
    title.textContent = `${paceLabels[plan.ritmo]} · ${plan.objetivo} cápsulas`;
    copy.textContent = plan.restantes
      ? `Llevas ${plan.completados}. Te faltan ${plan.restantes} esta semana.`
      : "Completaste tu meta semanal. El siguiente paso queda disponible cuando quieras.";
    meter.setAttribute("aria-valuenow", String(plan.porcentaje));
    meter.querySelector("span").style.width = `${plan.porcentaje}%`;
  }

  document.querySelector("#account-weekly")?.addEventListener("click", event => {
    const button = event.target.closest("[data-weekly-pace]");
    if (!button || !state.definirPlanSemanal(button.dataset.weeklyPace)) return;
    renderAccount();
  });

  function render() { renderHome(); renderAccount(); }
  render();
  globalThis.addEventListener?.("pageshow", render);
  globalThis.addEventListener?.("storage", () => { state.refrescar?.(); render(); });
  globalThis.LearningPlan = Object.freeze({ nextStep, render });
})();

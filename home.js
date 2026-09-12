(() => {
  "use strict";
  const grid = document.querySelector("#route-grid");
  if (!grid) return;
  const cards = [...grid.querySelectorAll("[data-learning-route]")];
  const filters = [...document.querySelectorAll("[data-filter]")];
  const search = document.querySelector("#route-search");
  const more = document.querySelector("#catalog-more");
  const results = document.querySelector("#catalog-results");
  const normalize = text => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const searchable = new Map(cards.map(card => [card, normalize(card.querySelector("h3").textContent + " " + card.querySelector("p").textContent + " " + card.dataset.category)]));
  let category = "all";
  let expanded = false;
  function render() {
    const query = normalize(search.value);
    const matches = cards.filter(card => (category === "all" || card.dataset.category.split(" ").includes(category))
      && query.split(/\s+/).every(word => searchable.get(card).includes(word)));
    const visible = category === "all" && !query && !expanded ? matches.slice(0, 6) : matches;
    cards.forEach(card => { card.hidden = !visible.includes(card); });
    filters.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.filter === category)));
    more.hidden = visible.length === matches.length;
    more.setAttribute("aria-expanded", String(expanded));
    document.querySelector("#catalog-empty").hidden = matches.length !== 0;
    results.textContent = visible.length < matches.length ? "Mostrando " + visible.length + " de " + matches.length + " rutas. Explora el resto cuando quieras."
      : matches.length + (matches.length === 1 ? " ruta encontrada" : " rutas encontradas");
  }
  filters.forEach(button => button.addEventListener("click", () => { category = button.dataset.filter; render(); }));
  search.addEventListener("input", render);
  more.addEventListener("click", () => {
    const nextCard = cards.find(card => card.hidden);
    expanded = true;
    render();
    nextCard?.focus();
  });
  document.querySelector("#catalog-reset").addEventListener("click", () => {
    category = "all"; search.value = ""; expanded = true; render(); search.focus();
  });
  // Los ceros no compiten con la elección de una ruta; el progreso aparece al empezar.
  const updateProgress = () => {
    cards.forEach(card => {
      const progress = globalThis.LearningState?.progress(card.dataset.learningRoute);
      card.querySelector(".route-progress").hidden = !progress?.started;
    });
  };
  document.querySelector(".catalog-controls").hidden = false;
  more.setAttribute("aria-controls", "route-grid");
  render(); updateProgress();
  window.addEventListener("pageshow", updateProgress);
  window.addEventListener("storage", updateProgress);
})();

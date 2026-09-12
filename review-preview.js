/* Vista previa por enlace, no autenticación. El código y el contenido son públicos.
   Si este recurso falla, la protección visual de mantenimiento del HTML permanece. */
(() => {
  "use strict";
  const reviewValue = "septiembre-2026";
  const key = "codigo-cero.review-session-v1";
  const params = new URLSearchParams(window.location.search);
  let enabled = false;
  try { enabled = sessionStorage.getItem(key) === reviewValue; } catch { /* enlace directo */ }
  if (params.has("revision")) enabled = params.get("revision") === reviewValue;
  if (params.has("maintenance")) enabled = false;
  try {
    if (enabled) sessionStorage.setItem(key, reviewValue);
    else sessionStorage.removeItem(key);
  } catch { /* La navegación de revisión conserva el parámetro. */ }
  if (!enabled) return;
  document.documentElement.classList.remove("is-maintenance");
  document.documentElement.dataset.review = reviewValue;
  const pageTitle = document.querySelector('meta[property="og:title"]');
  document.title = (pageTitle?.content || "Código Cero") + " · Revisión";
  let robots = document.querySelector('meta[name="robots"]');
  if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.append(robots); }
  robots.content = "noindex, nofollow";
})();

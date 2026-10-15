// Robodex — carrousel des robots (écrans étroits) : flèches, molette, glisser à la souris, bords estompés.
// Au doigt, le défilement natif suffit ; ce fichier rend la liste aussi facile à parcourir à la souris.
(() => {
  const list = document.querySelector("#roster-list");
  const wrap = list.parentElement;
  const mk = (cls, label, path) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `roster-nav ${cls}`;
    b.setAttribute("aria-label", label);
    b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
    wrap.append(b);
    return b;
  };
  const { T } = window.ROBODEX_I18N;
  const prev = mk("prev", T("roster.prev"), "M15 5l-7 7 7 7");
  const next = mk("next", T("roster.next"), "M9 5l7 7-7 7");
  const page = (dir) => list.scrollBy({ left: dir * Math.max(180, list.clientWidth * 0.7), behavior: "smooth" });
  prev.addEventListener("click", () => page(-1));
  next.addEventListener("click", () => page(1));

  // Affiche les flèches et l'estompage seulement du côté où il reste des robots
  const update = () => {
    const max = list.scrollWidth - list.clientWidth;
    const scrollable = max > 4;
    wrap.classList.toggle("can-prev", scrollable && list.scrollLeft > 4);
    wrap.classList.toggle("can-next", scrollable && list.scrollLeft < max - 4);
  };
  list.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  new MutationObserver(update).observe(list, { childList: true });

  // La molette verticale fait défiler la liste à l'horizontale
  list.addEventListener(
    "wheel",
    (e) => {
      if (list.scrollWidth <= list.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      list.scrollLeft += e.deltaY;
    },
    { passive: false },
  );

  // Glisser avec la souris (le doigt utilise le défilement natif)
  let startX = 0;
  let startLeft = 0;
  let dragging = false;
  let moved = false;
  list.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || list.scrollWidth <= list.clientWidth) return;
    dragging = true;
    moved = false;
    startX = e.clientX;
    startLeft = list.scrollLeft;
  });
  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 6) moved = true;
    if (moved) {
      list.classList.add("is-dragging");
      list.scrollLeft = startLeft - dx;
    }
  });
  window.addEventListener("pointerup", () => {
    dragging = false;
    list.classList.remove("is-dragging");
  });
  // Un glissement ne doit pas sélectionner le robot sous le curseur
  list.addEventListener(
    "click",
    (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    },
    true,
  );
  update();
  setTimeout(update, 400);
})();

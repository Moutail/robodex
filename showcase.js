// Robodex — accueil en images : un grand diaporama des robots, et les photos derrière les compteurs.
// Chargé après home.js.
(() => {
  const DB = window.ROBODEX;
  const $ = (s) => document.querySelector(s);
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Les photos les plus fortes d'abord
  const ORDER = ["atlas", "optimus", "g1", "digit", "figure03", "neo", "t800", "h1"];
  const slides = ORDER.map((id) => DB.robots.find((r) => r.id === id)).filter((r) => r && r.image);
  if (!slides.length) return;

  const imgs = [$("#show-a"), $("#show-b")];
  const dots = $("#show-dots");
  const DURATION = 5500;
  let index = -1;
  let layer = 0;
  let timer = null;

  const openRobot = (id) => {
    const s = $("#search");
    s.value = "";
    s.dispatchEvent(new Event("input"));
    document.querySelector('.tab[data-view="base"]').click();
    document.querySelector(`#roster-list button[data-id="${id}"]`)?.click();
  };
  const onHome = () => $("#view-home").classList.contains("is-on") && !document.hidden;

  const go = (i) => {
    index = (i + slides.length) % slides.length;
    const r = slides[index];
    layer = 1 - layer;
    const img = imgs[layer];
    img.src = r.image[0];
    img.alt = `${r.name}, ${r.maker}`;
    img.style.objectPosition = r.image[2] || "50% 20%";
    img.classList.remove("is-on");
    void img.offsetWidth; // relance le lent zoom
    img.classList.add("is-on");
    imgs[1 - layer].classList.remove("is-on");
    $("#show-name").textContent = r.name;
    $("#show-maker").textContent = r.maker;
    $("#show-status").textContent = r.status;
    $("#show-credit").textContent = r.image[1];
    const text = $("#show-text");
    text.classList.remove("anim");
    void text.offsetWidth;
    text.classList.add("anim");
    dots.querySelectorAll("button").forEach((d, k) => {
      d.classList.toggle("is-on", k === index);
      d.setAttribute("aria-current", k === index ? "true" : "false");
    });
    // Le fond flouté de la page suit le robot affiché
    if (onHome()) {
      const bg = document.querySelector("#bg .bg-layer.is-on");
      if (bg) bg.style.backgroundImage = `url("${r.image[0]}")`;
    }
    schedule();
  };
  const schedule = () => {
    clearTimeout(timer);
    if (calm) return; // pas de défilement automatique si l'utilisateur a demandé moins d'animations
    timer = setTimeout(() => (onHome() ? go(index + 1) : schedule()), DURATION);
  };

  slides.forEach((r, k) => {
    const d = document.createElement("button");
    d.type = "button";
    d.setAttribute("aria-label", `Afficher ${r.name}`);
    d.append(document.createElement("i"));
    d.addEventListener("click", () => go(k));
    dots.append(d);
  });
  $("#show-open").addEventListener("click", () => openRobot(slides[index].id));
  $("#show-prev").addEventListener("click", () => go(index - 1));
  $("#show-next").addEventListener("click", () => go(index + 1));

  // Balayage du doigt
  let x0 = null;
  let y0 = null;
  const show = $("#show");
  show.addEventListener("touchstart", (e) => ([x0, y0] = [e.touches[0].clientX, e.touches[0].clientY]), { passive: true });
  show.addEventListener("touchend", (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    const dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) go(index + (dx < 0 ? 1 : -1));
  });

  // Les photos des robots derrière les deux compteurs
  const P = DB.promises || [];
  const endOf = (d) => new Date(`${d}T23:59:59`);
  const late = P.filter((p) => p.status === "missed" && p.due).sort((a, b) => endOf(a.due) - endOf(b.due))[0];
  const next = P.filter((p) => p.status === "pending" && p.due && endOf(p.due) > Date.now()).sort((a, b) => endOf(a.due) - endOf(b.due))[0];
  [[late, "#live-late"], [next, "#live-next"]].forEach(([p, sel]) => {
    const r = p && DB.robots.find((x) => x.id === p.robot);
    const root = $(sel);
    if (!r || !r.image || !root) return;
    const img = document.createElement("img");
    img.className = "live-bg";
    img.src = r.image[0];
    img.alt = "";
    img.loading = "lazy";
    img.style.objectPosition = r.image[2] || "50% 20%";
    root.prepend(img);
    root.classList.add("has-img");
  });

  go(0);
})();

// Robodex — page d'accueil et « Promesse contre réalité ».
// Chargé après app.js : il lit window.ROBODEX et pilote la fiche d'un robot en cliquant sur la liste existante.
(() => {
  const DB = window.ROBODEX;
  const P = DB.promises;
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const robot = (id) => DB.robots.find((r) => r.id === id);
  const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const frDate = (d) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day ? Number(day) + " " : ""}${m ? MONTHS[Number(m) - 1] + " " : ""}${y}`;
  };
  const STATUS = {
    kept: ["Tenue", "ok"],
    partial: ["Tenue en partie", "mid"],
    missed: ["Non tenue", "bad"],
    disputed: ["Contestée", "bad"],
    unproven: ["Sans preuve publique", "mid"],
    pending: ["En cours", "wait"],
    open: ["Sans échéance", "wait"],
  };
  const DAY = 86400000;
  const endOf = (d) => new Date(`${d}T23:59:59`);

  const goTo = (view) => document.querySelector(`.tab[data-view="${view}"]`).click();
  const openRobot = (id) => {
    const s = $("#search");
    s.value = "";
    s.dispatchEvent(new Event("input"));
    goTo("base");
    document.querySelector(`#roster-list button[data-id="${id}"]`)?.click();
  };

  // ---------- Carte d'une promesse ----------
  const card = (p, i = 0) => {
    const [label, tone] = STATUS[p.status];
    const c = el("article", `glass promise tone-${tone}`);
    c.style.setProperty("--i", i);
    c.id = `p-${p.id}`; // ancre pour les liens venant de l'accueil
    const head = el("div", "promise-head");
    head.append(el("span", "brand-tag", p.brand), el("span", `state ${tone}`, label));
    c.append(head, el("h4", "", p.title));
    const when = [];
    if (p.said) when.push(`Annoncé en ${frDate(p.said)}`);
    if (p.due) when.push(`échéance : ${frDate(p.due)}`);
    if (when.length) c.append(el("div", "when", when.join(" · ")));
    const two = el("div", "two");
    const a = el("div");
    a.append(el("span", "k", "La promesse"), el("p", "", p.promise));
    const b = el("div");
    b.append(el("span", "k", "La réalité"), el("p", "", p.reality));
    two.append(a, b);
    c.append(two);
    const foot = el("div", "promise-foot");
    p.sources.forEach(([t, u]) => {
      const link = el("a", "", t);
      link.href = u;
      link.target = "_blank";
      link.rel = "noopener";
      foot.append(link);
    });
    const open = el("button", "", `Fiche ${robot(p.robot).name}`);
    open.type = "button";
    open.addEventListener("click", () => openRobot(p.robot));
    foot.append(open);
    c.append(foot);
    return c;
  };

  // ---------- Vue « Promesses » ----------
  const renderPromises = (filter = "all") => {
    const list = $("#promise-list");
    list.textContent = "";
    P.filter((p) => filter === "all" || p.brand === filter).forEach((p, i) => list.append(card(p, i)));
  };
  const brands = [...new Set(P.map((p) => p.brand))];
  const filters = $("#promise-filters");
  [["all", "Toutes"], ...brands.map((b) => [b, b])].forEach(([value, label], i) => {
    const b = el("button", i ? "" : "is-on", label);
    b.type = "button";
    b.addEventListener("click", () => {
      filters.querySelectorAll("button").forEach((x) => x.classList.toggle("is-on", x === b));
      renderPromises(value);
    });
    filters.append(b);
  });

  // ---------- Tableau par marque ----------
  const board = $("#scoreboard");
  brands.forEach((brand) => {
    const mine = P.filter((p) => p.brand === brand);
    const row = el("button", "score-row");
    row.type = "button";
    row.append(el("span", "score-name", brand));
    const bar = el("span", "score-bar");
    ["ok", "mid", "bad", "wait"].forEach((tone) => {
      const n = mine.filter((p) => STATUS[p.status][1] === tone).length;
      if (!n) return;
      const seg = el("i", tone);
      seg.style.flex = n;
      seg.title = `${n}`;
      bar.append(seg);
    });
    row.append(bar, el("span", "score-count", `${mine.length} promesse${mine.length > 1 ? "s" : ""}`));
    row.addEventListener("click", () => {
      goTo("promises");
      [...filters.querySelectorAll("button")].find((b) => b.textContent === brand)?.click();
    });
    board.append(row);
  });

  // ---------- Chiffres d'accueil ----------
  const count = (tones) => P.filter((p) => tones.includes(STATUS[p.status][1])).length;
  $("#n-total").textContent = P.length;
  $("#n-ok").textContent = count(["ok"]);
  $("#n-bad").textContent = count(["bad"]);
  $("#n-wait").textContent = count(["wait", "mid"]);
  $("#n-robots").textContent = DB.robots.length;

  // ---------- Compteurs en direct : la promesse manquée la plus ancienne, la prochaine échéance ----------
  const now0 = Date.now();
  const late = P.filter((p) => p.status === "missed" && p.due).sort((a, b) => endOf(a.due) - endOf(b.due))[0];
  const next = P.filter((p) => p.status === "pending" && p.due && endOf(p.due) > now0).sort((a, b) => endOf(a.due) - endOf(b.due))[0];
  const fill = (root, p, kicker) => {
    if (!p) return root.remove();
    root.querySelector(".kicker").textContent = kicker;
    root.querySelector("h3").textContent = p.title;
    root.querySelector(".who").textContent = `${p.brand} · échéance : ${frDate(p.due)}`;
    root.querySelector("button").addEventListener("click", () => {
      goTo("promises");
      setTimeout(() => document.getElementById(`p-${p.id}`)?.scrollIntoView({ block: "center" }), 80);
    });
  };
  fill($("#live-late"), late, "Promesse non tenue · retard");
  fill($("#live-next"), next, "Prochaine échéance · il reste");
  const two = (n) => String(n).padStart(2, "0");
  const tick = () => {
    const now = Date.now();
    [[late, "#late", 1], [next, "#next-due", -1]].forEach(([p, sel, sign]) => {
      if (!p) return;
      const ms = Math.max(0, sign * (now - endOf(p.due)));
      const d = Math.floor(ms / DAY);
      const h = Math.floor((ms % DAY) / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      $(`${sel}-d`).textContent = d;
      $(`${sel}-hms`).textContent = `${two(h)} h ${two(m)} min ${two(s)} s`;
    });
  };
  tick();
  setInterval(tick, 1000);

  // ---------- Robots et dernières nouvelles sur l'accueil ----------
  const strip = $("#home-robots");
  DB.robots.forEach((r) => {
    const b = el("button", "home-robot");
    b.type = "button";
    if (r.image) {
      const img = el("img");
      img.src = r.image[0];
      img.alt = "";
      img.loading = "lazy";
      img.style.objectPosition = r.image[2] || "50% 20%";
      b.append(img);
    } else b.append(el("span", "noimg", r.name[0]));
    const cap = el("span", "cap");
    cap.append(el("b", "", r.name), el("small", "", r.maker));
    b.append(cap);
    b.addEventListener("click", () => openRobot(r.id));
    strip.append(b);
  });
  const news = $("#home-news");
  DB.journal.slice(0, 3).forEach((j) => {
    const li = el("li");
    li.append(el("span", "when", frDate(j.date)), el("b", "", j.title));
    news.append(li);
  });
  $("#home-cta-promises").addEventListener("click", () => goTo("promises"));
  $("#home-cta-robots").addEventListener("click", () => goTo("base"));
  $("#home-cta-news").addEventListener("click", () => goTo("journal"));

  renderPromises();
})();

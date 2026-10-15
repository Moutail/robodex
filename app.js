// Robodex — affichage des fiches et assistant vocal VEGA.
// VEGA ne prononce que les phrases de lines.js (construites depuis data.js) : elle n'invente rien.
// Si audio/manifest.json contient la phrase avec le même texte, elle joue le fichier ElevenLabs (en français) ;
// sinon (phrase nouvelle ou modifiée, ou site en anglais) elle utilise la voix du navigateur.
(() => {
  const DB = window.ROBODEX;
  const LINES = window.ROBODEX_LINES;
  const { lang, locale, T, shortDate } = window.ROBODEX_I18N;
  const EN = lang === "en";
  const { STATS, SUPER, COUNTRIES, best, frDate } = window.ROBODEX_UTIL;
  const ROBOTS = DB.robots;
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const byId = (id) => ROBOTS.find((r) => r.id === id);
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const haystack = (r) => norm(`${r.name} ${r.maker} ${r.country} ${r.role} ${r.aliases.join(" ")}`);
  const CONF = { C: ["c", T("conf.c")], P: ["p", T("conf.p")], "?": ["q", T("conf.q")] };
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPhone = () => matchMedia("(max-width: 760px)").matches;

  let current = ROBOTS[0].id;
  let voiceOn = false;

  // ---------- Thème ----------
  const setTheme = (t) => {
    document.documentElement.dataset.theme = t;
    $("#theme").textContent = t === "dark" ? T("theme.light") : T("theme.dark");
    document.querySelector('meta[name="theme-color"]').content = t === "dark" ? "#0b0e17" : "#e9eef6";
    try {
      localStorage.setItem("robodex-theme", t);
    } catch (e) {
      /* stockage indisponible : le thème reste valable pour cette visite */
    }
  };

  // ---------- Fond : fondu entre deux couches ----------
  const layers = document.querySelectorAll("#bg .bg-layer");
  let layer = 0;
  const setBackdrop = (src) => {
    layer = 1 - layer;
    layers[layer].style.backgroundImage = src ? `url("${src}")` : "none";
    layers[layer].classList.add("is-on");
    layers[1 - layer].classList.remove("is-on");
  };

  // ---------- Schéma (échelle, et remplacement quand il n'y a pas de photo) ----------
  const SVGNS = "http://www.w3.org/2000/svg";
  const svg = (tag, attrs, text) => {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  };
  const GROUND = 460;
  const PX = 195; // pixels par mètre
  const figure = (cx, meters, robot) => {
    const H = meters * PX;
    const top = GROUND - H;
    const g = svg("g", { class: robot ? "fig robot" : "fig human" });
    const y = (f) => top + f * H;
    const w = (f) => f * H;
    if (robot) g.append(svg("rect", { x: cx - w(0.055), y: y(0.005), width: w(0.11), height: w(0.125), rx: w(0.025) }));
    else g.append(svg("ellipse", { cx, cy: y(0.065), rx: w(0.05), ry: w(0.062) }));
    g.append(svg("polygon", { points: [[-0.13, 0.155], [0.13, 0.155], [0.095, 0.5], [-0.095, 0.5]].map(([a, b]) => `${cx + w(a)},${y(b)}`).join(" ") }));
    [-1, 1].forEach((s) => {
      g.append(svg("polygon", { points: [[0.14, 0.165], [0.185, 0.175], [0.2, 0.54], [0.16, 0.54]].map(([a, b]) => `${cx + s * w(a)},${y(b)}`).join(" ") }));
      g.append(svg("polygon", { points: [[0.012, 0.51], [0.095, 0.51], [0.085, 0.985], [0.022, 0.985]].map(([a, b]) => `${cx + s * w(a)},${y(b)}`).join(" ") }));
      if (robot) [[0.16, 0.175], [0.18, 0.36], [0.055, 0.52], [0.055, 0.74]].forEach(([a, b]) => g.append(svg("circle", { class: "joint", cx: cx + s * w(a), cy: y(b), r: w(0.016) })));
    });
    if (robot) g.append(svg("line", { class: "visor", x1: cx - w(0.035), x2: cx + w(0.035), y1: y(0.06), y2: y(0.06) }));
    return g;
  };
  const renderScan = (r) => {
    const s = $("#scan");
    s.textContent = "";
    for (let m = 0; m <= 2; m += 0.5) {
      const yy = GROUND - m * PX;
      s.append(svg("line", { class: "tick", x1: 70, x2: 560, y1: yy, y2: yy }));
      s.append(svg("text", { class: "tick-lbl", x: 60, y: yy + 5, "text-anchor": "end" }, `${m.toLocaleString(locale, { minimumFractionDigits: 1 })} m`));
    }
    const h = r.height ? r.height[0] : 1.7;
    s.append(figure(215, 1.75, false), figure(415, h, true));
    s.append(svg("text", { class: "fig-lbl", x: 215, y: GROUND - 1.75 * PX - 12, "text-anchor": "middle" }, T("scan.human")));
    s.append(svg("text", { class: "fig-lbl robot", x: 415, y: GROUND - h * PX - 12, "text-anchor": "middle" }, `${r.name} · ${r.height ? STATS[0].show(h) : T("scan.unknown")}`));
    const alt = $("#r-noimg");
    alt.textContent = "";
    alt.append(figure(300, 2.2, true));
  };

  // ---------- Liste ----------
  const renderRoster = (filter = "") => {
    const list = $("#roster-list");
    list.textContent = "";
    const f = norm(filter);
    const shown = ROBOTS.filter((r) => !f || haystack(r).includes(f));
    if (!shown.length) list.append(el("li", "empty", T("roster.empty")));
    shown.forEach((r) => {
      const li = el("li");
      const b = el("button", r.id === current ? "is-on" : "");
      b.type = "button";
      b.dataset.id = r.id;
      const thumb = r.image ? el("img", "thumb") : el("span", "thumb");
      if (r.image) {
        thumb.src = r.image[0];
        thumb.alt = "";
        thumb.loading = "lazy";
        thumb.style.objectPosition = r.image[2] || "50% 20%";
      }
      const nm = el("span", "nm", r.name);
      nm.append(el("span", "mk", r.maker));
      b.append(thumb, nm);
      b.addEventListener("click", () => select(r.id));
      li.append(b);
      list.append(li);
    });
    // Sur téléphone la liste défile à l'horizontale : on garde le robot affiché en vue
    const on = list.querySelector(".is-on");
    if (on && isPhone()) list.scrollTo({ left: on.parentElement.offsetLeft - list.clientWidth / 2 + on.offsetWidth / 2, behavior: calm ? "auto" : "smooth" });
  };

  // ---------- Fiche ----------
  // Le chiffre monte de zéro à sa valeur pendant que la jauge se remplit
  const countUp = (node, st, target) => {
    if (calm) return (node.textContent = st.show(target));
    const t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / 650);
      const eased = 1 - Math.pow(1 - k, 3);
      const v = target * eased;
      node.textContent = st.show(k < 1 && Number.isInteger(target) ? Math.round(v) : k < 1 ? Math.round(v * 100) / 100 : target);
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const statRow = (r, st, i) => {
    const row = el("div", "stat");
    row.style.setProperty("--i", i);
    const top = el("div", "stat-top");
    const lbl = el("span", "lbl");
    const v = r[st.key];
    if (v) {
      const dot = el("i", `dot ${CONF[v[1]][0]}`);
      dot.title = CONF[v[1]][1];
      lbl.append(dot);
    }
    lbl.append(st.label);
    const val = el("span", v ? "val" : "val none", v ? st.show(v[0]) : T("na"));
    top.append(lbl, val);
    const bar = el("div", "bar");
    const fill = el("i");
    fill.style.width = "0%";
    bar.append(fill);
    row.append(top, bar);
    if (r.notes[st.key]) row.append(el("div", "note", r.notes[st.key]));
    if (v) {
      countUp(val, st, v[0]);
      setTimeout(() => (fill.style.width = `${Math.min(100, (v[0] / st.max) * 100)}%`), 40);
    }
    return row;
  };
  const replay = (node, cls) => {
    node.classList.remove(cls);
    void node.offsetWidth; // relance l'animation CSS
    node.classList.add(cls);
  };
  const select = (id, dir = 0) => {
    current = id;
    const r = byId(id);
    const hero = $("#hero");
    hero.dataset.dir = dir < 0 ? "back" : "next";
    $("#r-maker").textContent = r.maker;
    $("#r-name").textContent = r.name;
    $("#r-status").textContent = r.status;
    $("#r-country").textContent = r.country;
    $("#r-year").textContent = r.year;
    $("#r-role").textContent = r.role;
    hero.classList.toggle("no-photo", !r.image);
    const img = $("#r-img");
    img.classList.remove("is-in");
    if (r.image) {
      // setTimeout plutôt que requestAnimationFrame : la photo doit apparaître même si l'onglet est en arrière-plan
      const show = () => setTimeout(() => img.classList.add("is-in"), 30);
      img.onload = show;
      img.src = r.image[0];
      img.alt = `${r.name}, ${r.maker}`;
      img.style.objectPosition = r.image[2] || "50% 20%";
      if (img.complete) show();
      $("#r-credit").textContent = r.image[1];
    } else {
      $("#r-credit").textContent = T("nophoto");
    }
    setBackdrop(r.image && r.image[0]);
    replay(hero, "anim");
    renderScan(r);
    const stats = $("#stats");
    stats.textContent = "";
    STATS.forEach((st, i) => stats.append(statRow(r, st, i)));
    const facts = $("#facts");
    facts.textContent = "";
    r.facts.forEach((f, i) => {
      const li = el("li", "", f);
      li.style.setProperty("--i", i + STATS.length);
      facts.append(li);
    });
    const src = $("#sources");
    src.textContent = "";
    r.sources.forEach(([t, u]) => {
      const li = el("li");
      const a = el("a", "", t);
      a.href = u;
      a.target = "_blank";
      a.rel = "noopener";
      li.append(a);
      src.append(li);
    });
    // Si le filtre de recherche cache le robot affiché, on l'efface
    const f = norm($("#search").value);
    if (f && !haystack(r).includes(f)) $("#search").value = "";
    renderRoster($("#search").value);
  };
  const step = (d) => {
    const i = ROBOTS.findIndex((r) => r.id === current);
    select(ROBOTS[(i + d + ROBOTS.length) % ROBOTS.length].id, d);
  };

  // ---------- Comparer ----------
  const renderCompare = () => {
    const a = byId($("#cmp-a").value);
    const b = byId($("#cmp-b").value);
    const body = $("#cmp-body");
    body.textContent = "";
    const head = el("div", "cmp-row");
    const side = (r, cls) => {
      const d = el("div", `cmp-side ${cls}`);
      if (r.image) {
        const img = el("img", "cmp-face");
        img.src = r.image[0];
        img.alt = "";
        img.style.objectPosition = r.image[2] || "50% 20%";
        d.append(img);
      }
      d.append(el("div", "cmp-head", r.name), el("div", "note", r.maker));
      return d;
    };
    head.append(side(a, "left"), el("div", "mid", ""), side(b, ""));
    body.append(head);
    STATS.forEach((st, i) => {
      const row = el("div", "cmp-row");
      row.style.setProperty("--i", i + 1);
      const cell = (r, cls, amber) => {
        const d = el("div", `cmp-side ${cls}`);
        const v = r[st.key];
        d.append(el("div", v ? "val" : "note", v ? st.show(v[0]) : T("na")));
        const bar = el("div", "bar");
        const fill = el("i", amber ? "b" : "");
        fill.style.width = "0%";
        bar.append(fill);
        d.append(bar);
        if (v) setTimeout(() => (fill.style.width = `${Math.min(100, (v[0] / st.max) * 100)}%`), 40);
        return d;
      };
      row.append(cell(a, "left", false), el("div", "mid", st.label), cell(b, "", true));
      body.append(row);
    });
  };

  // ---------- Journal ----------
  const renderJournal = () => {
    const list = $("#journal-list");
    const seen = "IntersectionObserver" in window && !calm ? new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("seen"), seen.unobserve(e.target))), { threshold: 0.15 }) : null;
    DB.journal.forEach((j) => {
      const li = el("li", seen ? "" : "seen");
      const left = el("div");
      left.append(el("div", "when", frDate(j.date)), el("span", "tag", j.tag));
      const right = el("div");
      right.append(el("h4", "", j.title), el("p", "", j.text));
      const more = el("div", "more");
      const a = el("a", "", T("journal.source", { src: j.src }));
      a.href = j.url;
      a.target = "_blank";
      a.rel = "noopener";
      const open = el("button", "", T("journal.open", { name: byId(j.robot).name }));
      open.type = "button";
      open.addEventListener("click", () => {
        show("base");
        select(j.robot);
      });
      more.append(a, open);
      right.append(more);
      li.append(left, right);
      list.append(li);
      seen?.observe(li);
    });
  };

  // ---------- Onglets (la pastille glisse sous l'onglet actif) ----------
  const movePill = () => {
    const on = document.querySelector(".tab.is-on");
    const pill = $(".tab-pill");
    pill.style.width = `${on.offsetWidth}px`;
    pill.style.transform = `translateX(${on.offsetLeft}px)`;
  };
  const show = (view) => {
    document.querySelectorAll(".view").forEach((v) => v.classList.toggle("is-on", v.id === `view-${view}`));
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("is-on", t.dataset.view === view));
    movePill();
    if (view === "compare") renderCompare();
    window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
  };

  // ---------- Voix ----------
  const synth = window.speechSynthesis;
  let browserVoice = null;
  const pickVoice = () => {
    if (!synth) return;
    const mine = synth.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith(lang));
    const us = mine.filter((v) => /en-us/i.test(v.lang.replace("_", "-")));
    browserVoice = EN
      ? us.find((v) => /google/i.test(v.name)) || us[0] || mine[0] || null
      : mine.find((v) => /henri|paul|claude|thomas/i.test(v.name)) || mine.find((v) => /google/i.test(v.name)) || mine[0] || null;
  };
  if (synth) {
    pickVoice();
    synth.addEventListener?.("voiceschanged", pickVoice);
  }
  // Phrases enregistrées avec ElevenLabs (en français) : identifiant → texte enregistré.
  // Un enregistrement n'est joué que si son texte est encore celui de lines.js.
  let clips = {};
  if (!EN)
    fetch("audio/manifest.json")
      .then((r) => (r.ok ? r.json() : {}))
      .then((m) => (clips = m.texts || {}))
      .catch(() => {});
  const player = new Audio();
  const setState = (s) => {
    $("#vega").classList.toggle("is-speaking", s === "speaking");
    $("#vega").classList.toggle("is-listening", s === "listening");
    $("#vega-state").textContent = T(s === "speaking" ? "vega.speaking" : s === "listening" ? "vega.listening" : "vega.idle");
  };
  const browserSpeak = (text) => {
    if (!synth) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = locale;
    if (browserVoice) u.voice = browserVoice;
    u.pitch = 0.85;
    u.onstart = () => setState("speaking");
    u.onend = u.onerror = () => setState("idle");
    synth.speak(u);
  };
  // Affiche la phrase `id` et la prononce
  const say = (id) => {
    const text = LINES[id];
    $("#vega-say").textContent = text;
    replay($("#vega-say"), "pop");
    synth?.cancel();
    player.pause();
    setState("idle");
    if (!voiceOn) return;
    if (clips[id] !== text) return browserSpeak(text);
    player.src = `audio/${id}.mp3`;
    player.onplaying = () => setState("speaking");
    player.onended = player.onpause = () => setState("idle");
    player.onerror = () => browserSpeak(text);
    player.play().catch(() => browserSpeak(text));
  };

  // ---------- Compréhension des questions ----------
  const findRobots = (q) => {
    const hits = [];
    ROBOTS.forEach((r) => {
      let pos = -1;
      r.aliases.concat(norm(r.name)).forEach((a) => {
        const m = new RegExp(`(^| )${norm(a)}( |$)`).exec(q);
        if (m && (pos < 0 || m.index < pos)) pos = m.index;
      });
      if (pos >= 0) hits.push([pos, r]);
    });
    return hits.sort((a, b) => a[0] - b[0]).map((h) => h[1]);
  };
  const ATTRS = [
    { key: "price", re: /prix|cout|coute|combien vaut|tarif|cher|price|cost|how much|expensive/ },
    { key: "height", re: /taille|mesure|hauteur|grand|haut|height|tall/ },
    { key: "weight", re: /poids|pese|lourd|kilo|weigh|heavy/ },
    { key: "speed", re: /vitesse|rapide|court|vite|speed|fast/ },
    { key: "dof", re: /degre|articulation|liberte|joint|freedom/ },
  ];
  const handle = (raw) => {
    const q = norm(raw);
    if (!q) return say("empty");
    const found = findRobots(q);

    if (/^(aide|help)|que peux tu|tu sais faire|comment ca marche|what can you|how does (it|this) work/.test(q)) return say("help");

    if (/quoi de neuf|nouveau|actualite|avancee|dernier|journal|news|what s new|latest|timeline/.test(q)) {
      show("journal");
      return say("journal");
    }

    if (found.length >= 2 && /compar|versus| vs |difference|contre|entre| ou | et |against|between| or | and /.test(` ${q} `)) {
      $("#cmp-a").value = found[0].id;
      $("#cmp-b").value = found[1].id;
      show("compare");
      return say("compare");
    }

    const sup = SUPER.find((s) => s.re.test(q));
    if (sup && found.length < 2) {
      show("base");
      select(best(sup).robot.id);
      return say(`sup-${sup.id}`);
    }

    const country = COUNTRIES.find((c) => c.re.test(q));
    if (country && !found.length) {
      $("#search").value = country.name;
      show("base");
      renderRoster(country.name);
      return say(`country-${country.id}`);
    }

    if (/combien de robot|combien d unite|combien y a|how many robot/.test(q)) return say("count");

    const attr = ATTRS.find((a) => a.re.test(q));
    const r = found[0] || (attr || /statut|disponible|acheter|vente|source|ce robot|status|available|buy|sale|this robot/.test(q) ? byId(current) : null);
    if (r) {
      show("base");
      select(r.id);
      if (/statut|disponible|acheter|en vente|commercialis|status|available|buy|for sale|on sale/.test(q)) return say(`status-${r.id}`);
      if (/source|d ou vien|preuve|proof|where does/.test(q)) return say("sources");
      if (attr) return say(`${attr.key}-${r.id}`);
      return say(`sum-${r.id}`);
    }
    return say("fallback");
  };

  // ---------- Micro ----------
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  const listen = () => {
    if (!Rec) {
      openVega(true);
      $("#q").focus();
      return say("nomic");
    }
    if (rec) return rec.stop();
    synth?.cancel();
    player.pause();
    rec = new Rec();
    rec.lang = locale;
    rec.interimResults = false;
    rec.onstart = () => setState("listening");
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      $("#q").value = text;
      handle(text);
    };
    rec.onerror = () => say("noheard");
    rec.onend = () => {
      rec = null;
      if ($("#vega").classList.contains("is-listening")) setState("idle");
    };
    rec.start();
  };

  // ---------- Panneau de l'assistant (téléphone) ----------
  const openVega = (open) => {
    $("#vega").classList.toggle("is-open", open);
    $("#vega-toggle").setAttribute("aria-expanded", String(open));
    $("#vega-toggle").setAttribute("aria-label", T(open ? "vega.close" : "vega.open"));
  };

  // ---------- Démarrage ----------
  $("#count").textContent = ROBOTS.length;
  $("#updated").textContent = shortDate(DB.updated);
  ["#cmp-a", "#cmp-b"].forEach((id, i) => {
    ROBOTS.forEach((r) => {
      const o = el("option", "", `${r.name} — ${r.maker}`);
      o.value = r.id;
      $(id).append(o);
    });
    $(id).value = i ? "optimus" : ROBOTS[0].id;
    $(id).addEventListener("change", renderCompare);
  });
  T("chips").forEach((c) => {
    const b = el("button", "", c);
    b.type = "button";
    b.addEventListener("click", () => {
      $("#q").value = c;
      handle(c);
      if (isPhone()) openVega(false);
    });
    $("#chips").append(b);
  });
  document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => show(t.dataset.view)));
  $("#search").addEventListener("input", (e) => renderRoster(e.target.value));
  $("#brief").addEventListener("click", () => say(`sum-${current}`));
  $("#orb").addEventListener("click", listen);
  $("#vega-toggle").addEventListener("click", () => openVega(!$("#vega").classList.contains("is-open")));
  $("#vega-body").addEventListener("click", (e) => {
    if (isPhone() && !e.target.closest("button")) openVega(!$("#vega").classList.contains("is-open"));
  });
  $("#ask").addEventListener("submit", (e) => {
    e.preventDefault();
    handle($("#q").value);
    if (isPhone()) {
      $("#q").blur();
      openVega(false);
    }
  });
  $("#prev").addEventListener("click", () => step(-1));
  $("#next").addEventListener("click", () => step(1));
  // Balayage du doigt sur la photo pour changer de robot
  let touchX = null;
  let touchY = null;
  $("#hero").addEventListener("touchstart", (e) => ([touchX, touchY] = [e.touches[0].clientX, e.touches[0].clientY]), { passive: true });
  $("#hero").addEventListener("touchend", (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    touchX = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
  });
  document.addEventListener("keydown", (e) => {
    if (/input|select|textarea/i.test(e.target.tagName) || !$("#view-base").classList.contains("is-on")) return;
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });
  const setVoice = (on) => {
    voiceOn = on;
    if (!on) {
      synth?.cancel();
      player.pause();
      setState("idle");
    }
    $("#mute").textContent = T(on ? "voice.on" : "voice.off");
    $("#mute").setAttribute("aria-pressed", String(!on));
  };
  $("#mute").addEventListener("click", () => setVoice(!voiceOn));
  $("#theme").addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  // quiet : après un changement de langue, on revient sans repasser par l'écran de démarrage et sans parler
  // (le navigateur n'autorise la voix qu'après un clic sur la nouvelle page)
  const boot = (withVoice, quiet = false) => {
    setVoice(quiet ? false : withVoice);
    $("#boot").classList.add("is-off");
    document.body.classList.add("is-ready");
    say("greet");
    if (quiet) setVoice(withVoice);
  };
  $("#boot-start").addEventListener("click", () => boot(true));
  $("#boot-silent").addEventListener("click", () => boot(false));
  window.ROBODEX_APP = { voiceOn: () => voiceOn };
  window.addEventListener("resize", movePill);
  document.fonts?.ready.then(movePill);

  setTheme(document.documentElement.dataset.theme || "dark");
  renderJournal();
  renderCompare();
  select(current);
  movePill();
  try {
    const resume = sessionStorage.getItem("robodex-resume");
    if (resume) {
      sessionStorage.removeItem("robodex-resume");
      boot(!!JSON.parse(resume).voice, true);
    }
  } catch (e) {
    /* stockage indisponible : l'écran de démarrage s'affiche normalement */
  }
})();

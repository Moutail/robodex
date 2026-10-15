// Robodex — langue du site : français par défaut, anglais au choix (bouton FR | EN, ou lien ?lang=en).
// La langue est choisie dans <head> avant l'affichage (document.documentElement.lang), puis ce fichier :
//   1. remplace les textes français des fiches, du journal et des promesses par leur traduction `en` ;
//   2. traduit les textes fixes de la page (attributs data-i18n et data-i18n-attr) ;
//   3. fournit T() et fmtDate() aux autres scripts, et le changement de langue.
// Chargé juste après promises.js, avant lines.js et app.js.
(() => {
  const lang = document.documentElement.lang === "en" ? "en" : "fr";
  const DB = window.ROBODEX;

  // ---------- Textes d'interface ----------
  // Les textes fixes de index.html sont écrits en français dans la page : seule leur version anglaise figure ici.
  const STR = {
    fr: {
      "conf.c": "donnée du constructeur",
      "conf.p": "presse ou revendeurs",
      "conf.q": "non confirmé",
      "theme.light": "Mode clair",
      "theme.dark": "Mode sombre",
      "scan.human": "Humain · 1,75 m",
      "scan.unknown": "taille inconnue",
      "roster.empty": "Aucun robot ne correspond.",
      na: "non communiqué",
      nophoto: "Pas de photo disponible",
      "journal.source": "Source : {src}",
      "journal.open": "Voir la fiche {name}",
      "vega.speaking": "parle",
      "vega.listening": "écoute",
      "vega.idle": "en veille",
      "vega.open": "Ouvrir l'assistant",
      "vega.close": "Réduire l'assistant",
      "voice.on": "Voix : oui",
      "voice.off": "Voix : non",
      chips: ["Présente Atlas", "Lequel est le plus rapide ?", "Compare G1 et Optimus", "Quoi de neuf ?", "Robots chinois"],
      "status.kept": "Tenue",
      "status.partial": "Tenue en partie",
      "status.missed": "Non tenue",
      "status.disputed": "Contestée",
      "status.unproven": "Sans preuve publique",
      "status.pending": "En cours",
      "status.open": "Sans échéance",
      "p.said": "Annoncé en {d}",
      "p.due": "échéance : {d}",
      "p.promise": "La promesse",
      "p.reality": "La réalité",
      "p.open": "Fiche {name}",
      "p.all": "Toutes",
      "p.count1": "{n} promesse",
      "p.countN": "{n} promesses",
      "live.late": "Promesse non tenue · retard",
      "live.next": "Prochaine échéance · il reste",
      "live.who": "{brand} · échéance : {d}",
      "show.robot": "Afficher {name}",
      "roster.prev": "Robots précédents",
      "roster.next": "Robots suivants",
    },
    en: {
      "conf.c": "manufacturer data",
      "conf.p": "press or resellers",
      "conf.q": "unconfirmed",
      "theme.light": "Light mode",
      "theme.dark": "Dark mode",
      "scan.human": "Human · 1.75 m",
      "scan.unknown": "height unknown",
      "roster.empty": "No robot matches.",
      na: "not disclosed",
      nophoto: "No photo available",
      "journal.source": "Source: {src}",
      "journal.open": "View the {name} profile",
      "vega.speaking": "speaking",
      "vega.listening": "listening",
      "vega.idle": "standby",
      "vega.open": "Open the assistant",
      "vega.close": "Collapse the assistant",
      "voice.on": "Voice: on",
      "voice.off": "Voice: off",
      chips: ["Introduce Atlas", "Which one is the fastest?", "Compare G1 and Optimus", "What's new?", "Chinese robots"],
      "status.kept": "Kept",
      "status.partial": "Partly kept",
      "status.missed": "Not kept",
      "status.disputed": "Disputed",
      "status.unproven": "No public proof",
      "status.pending": "In progress",
      "status.open": "No deadline",
      "p.said": "Announced {d}",
      "p.due": "deadline: {d}",
      "p.promise": "The promise",
      "p.reality": "The reality",
      "p.open": "{name} profile",
      "p.all": "All",
      "p.count1": "{n} promise",
      "p.countN": "{n} promises",
      "live.late": "Promise not kept · overdue by",
      "live.next": "Next deadline · time left",
      "live.who": "{brand} · deadline: {d}",
      "show.robot": "Show {name}",
      "roster.prev": "Previous robots",
      "roster.next": "Next robots",
      // Textes fixes de index.html
      "doc.title": "Robodex — humanoid robots: what is promised, what is proven",
      "doc.desc": "Humanoid robot makers' promises versus reality, with robot profiles, comparisons and a voice assistant.",
      "boot.tagline": "Humanoid robots: what is promised, what is proven",
      "boot.voice": "Enter with voice",
      "boot.silent": "Enter without voice",
      "lang.group": "Language",
      "tab.home": "Home",
      "tab.promises": "Promises",
      "tab.robots": "Robots",
      "tab.compare": "Compare",
      "tab.journal": "Timeline",
      "top.updated": "robots · updated",
      "show.over": "Humanoid robots · promised or proven?",
      "show.open": "View profile",
      "show.promises": "The promises",
      "nav.prev": "Previous robot",
      "nav.next": "Next robot",
      "home.the": "The",
      "home.robots": "robots",
      "home.explore": "Explore all",
      "live.days": "days",
      "live.more": "See details",
      "num.total": "promises tracked",
      "num.ok": "kept",
      "num.bad": "not kept or disputed",
      "num.wait": "awaiting proof",
      "board.title": "Brand scoreboard",
      "legend.ok": "kept",
      "legend.mid": "partly, or no proof",
      "legend.bad": "not kept, disputed",
      "legend.wait": "in progress",
      "news.title": "Latest developments",
      "news.all": "Full timeline",
      "promises.title": "Promise vs. reality",
      "promises.intro": "Each card takes an announcement from a manufacturer, its date and its deadline, then what independent sources have found. A promise without a source does not make the list.",
      "search.ph": "Search a robot, a country…",
      "search.label": "Search",
      "chip.country": "Country",
      "chip.year": "Unveiled in",
      "chip.role": "Use",
      "scale.title": "To scale",
      "scale.label": "Size comparison with a 1.75 m human",
      "intel.title": "Specifications",
      "legend.c": "manufacturer",
      "legend.p": "press, resellers",
      "legend.q": "unconfirmed",
      "facts.title": "Key facts",
      "brief": "Listen to the summary",
      "sources.title": "Sources",
      "cmp.title": "Compare two robots",
      "cmp.a": "First robot",
      "cmp.b": "Second robot",
      "journal.title": "Progress timeline",
      "vega.talk": "Talk to VEGA",
      "vega.hello": "Ask me a question about a robot.",
      "ask.ph": "E.g.: how much is the G1?",
      "ask.label": "Question for VEGA",
      "ask.send": "Ask",
    },
  };
  const T = (key, vars = {}) => {
    const s = STR[lang][key] ?? STR.fr[key] ?? key;
    return typeof s === "string" ? s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? "")) : s;
  };

  // ---------- Dates : « 29 juin 2026 » / « June 29, 2026 » ; le mois et le jour sont facultatifs ----------
  const MONTHS = {
    fr: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  };
  const fmtDate = (d) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    const month = m ? MONTHS[lang][Number(m) - 1] : "";
    if (lang === "en") return month ? `${month} ${day ? Number(day) + ", " : ""}${y}` : y;
    return `${day ? Number(day) + " " : ""}${month ? month + " " : ""}${y}`;
  };
  // Date courte de l'en-tête : « 15.10.2026 » / « Oct 15, 2026 »
  const shortDate = (d) => {
    const [y, m, day] = d.split("-");
    return lang === "en" ? `${MONTHS.en[Number(m) - 1].slice(0, 3)} ${Number(day)}, ${y}` : `${day}.${m}.${y}`;
  };

  // ---------- Données : la traduction remplace le français, champ par champ ----------
  const translate = (item) => {
    const en = item.en;
    if (!en) return;
    Object.keys(en).forEach((k) => {
      if (k === "sources") item.sources = item.sources.map(([title, url], i) => [en.sources[i] || title, url]);
      else if (k === "notes") item.notes = { ...item.notes, ...en.notes };
      else item[k] = en[k];
    });
  };
  if (lang === "en") {
    [...DB.robots, ...DB.journal, ...(DB.promises || [])].forEach(translate);
    // Crédits des photos : « Image : Unitree » → « Image: Unitree »
    DB.robots.forEach((r) => {
      if (r.image) r.image = [r.image[0], r.image[1].replace(/^(Image|Photo) : /, "$1: ").replace("domaine public", "public domain"), r.image[2]];
    });
  }

  // ---------- Textes fixes de la page ----------
  if (lang === "en") {
    document.title = T("doc.title");
    document.querySelector('meta[name="description"]')?.setAttribute("content", T("doc.desc"));
    document.querySelectorAll("[data-i18n]").forEach((n) => (n.textContent = T(n.dataset.i18n)));
    // data-i18n-attr="placeholder:search.ph;aria-label:search.label"
    document.querySelectorAll("[data-i18n-attr]").forEach((n) =>
      n.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":");
        n.setAttribute(attr, T(key));
      }),
    );
  }

  // ---------- Changement de langue ----------
  // Le site est rechargé dans la nouvelle langue, sur le même écran. Le choix est retenu dans localStorage ;
  // si le navigateur le refuse, il passe dans l'adresse (?lang=en) pour survivre au rechargement.
  const VIEW_ROUTE = { home: "accueil", promises: "promesses", journal: "journal" };
  const currentRoute = () => {
    const view = document.querySelector(".tab.is-on")?.dataset.view;
    if (view === "base") return `robots/${document.querySelector("#roster-list button.is-on")?.dataset.id || ""}`;
    if (view === "compare") return `comparer/${document.querySelector("#cmp-a").value}/${document.querySelector("#cmp-b").value}`;
    return VIEW_ROUTE[view] || "";
  };
  const switchTo = (next) => {
    if (next === lang) return;
    let stored = false;
    try {
      localStorage.setItem("robodex-lang", next);
      stored = localStorage.getItem("robodex-lang") === next;
    } catch (e) {
      /* stockage indisponible : la langue passe par l'adresse */
    }
    const url = new URL(location.href);
    if (stored) url.searchParams.delete("lang");
    else url.searchParams.set("lang", next);
    // Après l'écran de démarrage, on revient au même endroit sans repasser par lui
    if (document.body.classList.contains("is-ready")) {
      url.hash = currentRoute();
      let kept = false;
      try {
        sessionStorage.setItem("robodex-resume", JSON.stringify({ voice: !!window.ROBODEX_APP?.voiceOn() }));
        kept = true;
      } catch (e) {
        /* sans sessionStorage, ?entrer passe l'écran de démarrage */
      }
      if (!kept) url.searchParams.set("entrer", "");
    }
    history.replaceState(null, "", url.href);
    location.reload();
  };
  document.querySelectorAll(".lang button[data-lang]").forEach((b) => {
    const on = b.dataset.lang === lang;
    b.classList.toggle("is-on", on);
    b.setAttribute("aria-pressed", String(on));
    b.addEventListener("click", () => switchTo(b.dataset.lang));
  });

  window.ROBODEX_I18N = { lang, locale: lang === "en" ? "en-US" : "fr-FR", T, fmtDate, shortDate };
})();

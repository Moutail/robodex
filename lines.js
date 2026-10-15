// Robodex — toutes les phrases que VEGA peut prononcer, construites à partir de data.js, en français ou en anglais.
// Le même fichier sert au site (affichage) et à tools/tts.py (génération des fichiers audio ElevenLabs, en français).
// Les phrases françaises ne doivent pas changer sans raison : chaque changement rend l'enregistrement correspondant obsolète.
(() => {
  const DB = window.ROBODEX;
  const ROBOTS = DB.robots;
  // tools/tts.py charge ce fichier sans i18n.js : le français s'applique alors
  const I = window.ROBODEX_I18N || { lang: "fr", locale: "fr-FR" };
  const EN = I.lang === "en";
  const nf = (n, d = 0) => n.toLocaleString(I.locale, { minimumFractionDigits: d, maximumFractionDigits: d });
  // « de Unitree » → « d'Unitree » devant une voyelle
  const de = (name) => (/^[aeiouyéèê]/i.test(name) ? `d'${name}` : `de ${name}`);
  // Le statut en milieu de phrase : seule la première lettre passe en minuscule (« chez BMW » reste en capitales)
  const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);

  const STATS = EN
    ? [
        { key: "height", label: "Height", max: 2.1, show: (v) => `${nf(v, 2)} m`, say: (v) => `${nf(v, 2)} meters` },
        { key: "weight", label: "Weight", max: 100, show: (v) => `${nf(v, v % 1 ? 1 : 0)} kg`, say: (v) => `${nf(v, v % 1 ? 1 : 0)} kilos` },
        { key: "speed", label: "Speed", max: 3.5, show: (v) => `${nf(v, 1)} m/s`, say: (v) => `${nf(v, 1)} meters per second, or about ${nf(v * 3.6, 0)} kilometers per hour` },
        { key: "dof", label: "Degrees of freedom", max: 60, show: (v) => nf(v), say: (v) => `${v} degrees of freedom` },
        { key: "price", label: "Price", max: 100000, show: (v) => `$${nf(v)}`, say: (v) => `${nf(v)} dollars` },
      ]
    : [
        { key: "height", label: "Taille", max: 2.1, show: (v) => `${nf(v, 2)} m`, say: (v) => `${Math.floor(v)} mètre ${String(Math.round((v % 1) * 100)).padStart(2, "0")}` },
        { key: "weight", label: "Poids", max: 100, show: (v) => `${nf(v, v % 1 ? 1 : 0)} kg`, say: (v) => `${nf(v, v % 1 ? 1 : 0)} kilos` },
        { key: "speed", label: "Vitesse", max: 3.5, show: (v) => `${nf(v, 1)} m/s`, say: (v) => `${nf(v, 1)} mètres par seconde, soit environ ${nf(v * 3.6, 0)} kilomètres-heure` },
        { key: "dof", label: "Degrés de liberté", max: 60, show: (v) => nf(v), say: (v) => `${v} degrés de liberté` },
        { key: "price", label: "Prix", max: 100000, show: (v) => `${nf(v)} $`, say: (v) => `${nf(v)} dollars` },
      ];
  const stat = (key) => STATS.find((s) => s.key === key);

  const caveat = (r, key) => {
    const v = r[key];
    let s = "";
    if (r.notes[key]) s += EN ? ` Note: ${r.notes[key]}.` : ` Précision : ${r.notes[key]}.`;
    if (v && v[1] === "?") s += EN ? " Careful, this figure is not confirmed." : " Attention, cette donnée n'est pas confirmée.";
    return s;
  };
  const attrLine = (r, key) => {
    const st = stat(key);
    const v = r[key];
    if (!v) {
      if (EN) return `I don't have this figure for ${r.name}: it has not been disclosed.${r.notes[key] ? ` Note: ${r.notes[key]}.` : ""}`;
      return `Je n'ai pas cette donnée pour ${r.name} : elle n'a pas été communiquée.${r.notes[key] ? ` Précision : ${r.notes[key]}.` : ""}`;
    }
    const lead = (EN
      ? {
          price: v[1] === "?" ? `${r.name} has no selling price. The announced target is about ${st.say(v[0])}.` : `${r.name}: ${st.say(v[0])}.`,
          height: `${r.name} is ${st.say(v[0])} tall.`,
          weight: `${r.name} weighs ${st.say(v[0])}.`,
          speed: `${r.name} reaches ${st.say(v[0])}.`,
          dof: `${r.name} has ${st.say(v[0])}.`,
        }
      : {
          price: v[1] === "?" ? `${r.name} n'a pas de prix de vente. L'objectif annoncé est d'environ ${st.say(v[0])}.` : `${r.name} : ${st.say(v[0])}.`,
          height: `${r.name} mesure ${st.say(v[0])}.`,
          weight: `${r.name} pèse ${st.say(v[0])}.`,
          speed: `${r.name} atteint ${st.say(v[0])}.`,
          dof: `${r.name} compte ${st.say(v[0])}.`,
        })[key];
    return lead + caveat(r, key);
  };

  // Les questions sont comprises dans les deux langues, quelle que soit la langue affichée
  const SUPER = [
    { id: "tallest", re: /plus grand|tallest/, key: "height", dir: 1, word: EN ? "the tallest" : "le plus grand" },
    { id: "shortest", re: /plus petit|shortest|smallest/, key: "height", dir: -1, word: EN ? "the shortest" : "le plus petit" },
    { id: "heaviest", re: /plus lourd|heaviest/, key: "weight", dir: 1, word: EN ? "the heaviest" : "le plus lourd" },
    { id: "lightest", re: /plus leger|lightest/, key: "weight", dir: -1, word: EN ? "the lightest" : "le plus léger" },
    { id: "fastest", re: /plus rapide|plus vite|fastest|quickest/, key: "speed", dir: 1, word: EN ? "the fastest" : "le plus rapide" },
    { id: "cheapest", re: /moins cher|plus abordable|cheapest|least expensive|most affordable/, key: "price", dir: -1, word: EN ? "the cheapest" : "le moins cher" },
    { id: "priciest", re: /plus cher|most expensive|priciest/, key: "price", dir: 1, word: EN ? "the most expensive" : "le plus cher" },
  ];
  // Les valeurs non confirmées ne participent pas aux classements
  const best = (sup) => {
    const pool = ROBOTS.filter((r) => r[sup.key] && r[sup.key][1] !== "?");
    return { pool, robot: pool.reduce((m, r) => ((r[sup.key][0] - m[sup.key][0]) * sup.dir > 0 ? r : m)) };
  };
  // `name` doit correspondre au pays tel qu'il est écrit dans les fiches (traduites en anglais par i18n.js)
  const COUNTRIES = [
    { id: "chine", re: /chin/, name: EN ? "China" : "Chine" },
    { id: "usa", re: /americ|etats unis|usa|united states/, name: EN ? "United States" : "États-Unis" },
    { id: "norvege", re: /norveg|norw/, name: EN ? "Norway" : "Norvège" },
  ];
  const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const frDate = I.fmtDate || ((d) => {
    const [y, m, day] = d.split("-");
    return `${day ? Number(day) + " " : ""}${MONTHS[Number(m) - 1]} ${y}`;
  });
  const n = ROBOTS.length;
  const latest = DB.journal.slice(0, 3).map((j) => `${frDate(j.date)}${EN ? ": " : " : "}${j.title}`).join(". ");

  const L = EN
    ? {
        greet: `Systems online. I am VEGA. ${n} robots are in the database. Ask me for a price, a height, or a comparison.`,
        empty: "I'm listening. Ask me for a price, a height, or a comparison.",
        help: "You can ask me for a robot's profile, its price, height, weight or speed. I can also compare two robots, find the fastest or the cheapest, and read you the latest developments.",
        fallback: "I don't have that information in my database. Try with a robot's name, for example: introduce Atlas, or how much is the G1.",
        nomic: "Speech recognition is not available in this browser. Type your question, and I'll answer out loud.",
        noheard: "I didn't hear you. Try again, or type your question.",
        compare: "Comparison displayed. The two profiles are side by side.",
        sources: "The sources for this profile are listed below the figures. Each link opens the original document.",
        count: `The database contains ${n} humanoid robots.`,
        journal: `Here are the three latest entries in the timeline. ${latest}.`,
      }
    : {
        greet: `Systèmes en ligne. Je suis VEGA. ${n} robots sont dans la base. Demande-moi un prix, une taille, ou une comparaison.`,
        empty: "Je t'écoute. Demande-moi un prix, une taille, ou une comparaison.",
        help: "Tu peux me demander la fiche d'un robot, son prix, sa taille, son poids ou sa vitesse. Je peux aussi comparer deux robots, trouver le plus rapide ou le moins cher, et te lire les dernières avancées.",
        fallback: "Je n'ai pas cette information dans ma base. Essaie avec le nom d'un robot, par exemple : présente Atlas, ou combien coûte le G1.",
        nomic: "La reconnaissance vocale n'est pas disponible dans ce navigateur. Écris ta question, je te répondrai à voix haute.",
        noheard: "Je n'ai pas entendu. Réessaie, ou écris ta question.",
        compare: "Comparaison affichée. Les deux fiches sont côte à côte.",
        sources: "Les sources de cette fiche sont listées sous les chiffres. Chaque lien ouvre le document d'origine.",
        count: `La base contient ${n} robots humanoïdes.`,
        journal: `Voici les trois dernières entrées du journal. ${latest}.`,
      };
  ROBOTS.forEach((r) => {
    L[`sum-${r.id}`] = r.summary;
    STATS.forEach((st) => (L[`${st.key}-${r.id}`] = attrLine(r, st.key)));
    L[`status-${r.id}`] = EN ? `${r.name} status: ${lowerFirst(r.status)}.` : `Statut ${de(r.name)} : ${lowerFirst(r.status)}.`;
  });
  SUPER.forEach((sup) => {
    const { pool, robot } = best(sup);
    const said = stat(sup.key).say(robot[sup.key][0]);
    L[`sup-${sup.id}`] = EN
      ? `Among the ${pool.length} robots for which I have this figure, ${sup.word} is ${robot.name}, from ${robot.maker}: ${said}.${caveat(robot, sup.key)}`
      : `Parmi les ${pool.length} robots pour lesquels j'ai cette donnée, ${sup.word} est ${robot.name}, ${de(robot.maker)} : ${said}.${caveat(robot, sup.key)}`;
  });
  COUNTRIES.forEach((c) => {
    const list = ROBOTS.filter((r) => r.country.includes(c.name));
    const s = list.length > 1 ? "s" : "";
    L[`country-${c.id}`] = EN
      ? `I have ${list.length} robot${s} for this country: ${list.map((r) => `${r.name} from ${r.maker}`).join(", ")}.`
      : `J'ai ${list.length} robot${s} pour ce pays : ${list.map((r) => `${r.name} ${de(r.maker)}`).join(", ")}.`;
  });

  window.ROBODEX_LINES = L;
  window.ROBODEX_UTIL = { STATS, SUPER, COUNTRIES, best, frDate, nf };
})();

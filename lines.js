// Robodex — toutes les phrases que VEGA peut prononcer, construites à partir de data.js.
// Le même fichier sert au site (affichage) et à tools/voice.mjs (génération des fichiers audio ElevenLabs).
(() => {
  const DB = window.ROBODEX;
  const ROBOTS = DB.robots;
  const nf = (n, d = 0) => n.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
  // « de Unitree » → « d'Unitree » devant une voyelle
  const de = (name) => (/^[aeiouyéèê]/i.test(name) ? `d'${name}` : `de ${name}`);

  const STATS = [
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
    if (r.notes[key]) s += ` Précision : ${r.notes[key]}.`;
    if (v && v[1] === "?") s += " Attention, cette donnée n'est pas confirmée.";
    return s;
  };
  const attrLine = (r, key) => {
    const st = stat(key);
    const v = r[key];
    if (!v) return `Je n'ai pas cette donnée pour ${r.name} : elle n'a pas été communiquée.${r.notes[key] ? ` Précision : ${r.notes[key]}.` : ""}`;
    const lead = {
      price: v[1] === "?" ? `${r.name} n'a pas de prix de vente. L'objectif annoncé est d'environ ${st.say(v[0])}.` : `${r.name} : ${st.say(v[0])}.`,
      height: `${r.name} mesure ${st.say(v[0])}.`,
      weight: `${r.name} pèse ${st.say(v[0])}.`,
      speed: `${r.name} atteint ${st.say(v[0])}.`,
      dof: `${r.name} compte ${st.say(v[0])}.`,
    }[key];
    return lead + caveat(r, key);
  };

  const SUPER = [
    { id: "tallest", re: /plus grand/, key: "height", dir: 1, word: "le plus grand" },
    { id: "shortest", re: /plus petit/, key: "height", dir: -1, word: "le plus petit" },
    { id: "heaviest", re: /plus lourd/, key: "weight", dir: 1, word: "le plus lourd" },
    { id: "lightest", re: /plus leger/, key: "weight", dir: -1, word: "le plus léger" },
    { id: "fastest", re: /plus rapide|plus vite/, key: "speed", dir: 1, word: "le plus rapide" },
    { id: "cheapest", re: /moins cher|plus abordable/, key: "price", dir: -1, word: "le moins cher" },
    { id: "priciest", re: /plus cher/, key: "price", dir: 1, word: "le plus cher" },
  ];
  // Les valeurs non confirmées ne participent pas aux classements
  const best = (sup) => {
    const pool = ROBOTS.filter((r) => r[sup.key] && r[sup.key][1] !== "?");
    return { pool, robot: pool.reduce((m, r) => ((r[sup.key][0] - m[sup.key][0]) * sup.dir > 0 ? r : m)) };
  };
  const COUNTRIES = [
    { id: "chine", re: /chin/, name: "Chine" },
    { id: "usa", re: /americ|etats unis|usa/, name: "États-Unis" },
    { id: "norvege", re: /norveg/, name: "Norvège" },
  ];
  const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const frDate = (d) => {
    const [y, m, day] = d.split("-");
    return `${day ? Number(day) + " " : ""}${MONTHS[Number(m) - 1]} ${y}`;
  };

  const L = {
    greet: `Systèmes en ligne. Je suis VEGA. ${ROBOTS.length} robots sont dans la base. Demande-moi un prix, une taille, ou une comparaison.`,
    empty: "Je t'écoute. Demande-moi un prix, une taille, ou une comparaison.",
    help: "Tu peux me demander la fiche d'un robot, son prix, sa taille, son poids ou sa vitesse. Je peux aussi comparer deux robots, trouver le plus rapide ou le moins cher, et te lire les dernières avancées.",
    fallback: "Je n'ai pas cette information dans ma base. Essaie avec le nom d'un robot, par exemple : présente Atlas, ou combien coûte le G1.",
    nomic: "La reconnaissance vocale n'est pas disponible dans ce navigateur. Écris ta question, je te répondrai à voix haute.",
    noheard: "Je n'ai pas entendu. Réessaie, ou écris ta question.",
    compare: "Comparaison affichée. Les deux fiches sont côte à côte.",
    sources: "Les sources de cette fiche sont listées sous les chiffres. Chaque lien ouvre le document d'origine.",
    count: `La base contient ${ROBOTS.length} robots humanoïdes.`,
    journal: `Voici les trois dernières entrées du journal. ${DB.journal.slice(0, 3).map((j) => `${frDate(j.date)} : ${j.title}`).join(". ")}.`,
  };
  ROBOTS.forEach((r) => {
    L[`sum-${r.id}`] = r.summary;
    STATS.forEach((st) => (L[`${st.key}-${r.id}`] = attrLine(r, st.key)));
    L[`status-${r.id}`] = `Statut ${de(r.name)} : ${r.status.toLowerCase()}.`;
  });
  SUPER.forEach((sup) => {
    const { pool, robot } = best(sup);
    L[`sup-${sup.id}`] = `Parmi les ${pool.length} robots pour lesquels j'ai cette donnée, ${sup.word} est ${robot.name}, ${de(robot.maker)} : ${stat(sup.key).say(robot[sup.key][0])}.${caveat(robot, sup.key)}`;
  });
  COUNTRIES.forEach((c) => {
    const list = ROBOTS.filter((r) => r.country.includes(c.name));
    L[`country-${c.id}`] = `J'ai ${list.length} robot${list.length > 1 ? "s" : ""} pour ce pays : ${list.map((r) => `${r.name} ${de(r.maker)}`).join(", ")}.`;
  });

  window.ROBODEX_LINES = L;
  window.ROBODEX_UTIL = { STATS, SUPER, COUNTRIES, best, frDate, nf };
})();

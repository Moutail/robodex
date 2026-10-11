// Robodex — « Promesse contre réalité ». Chaque entrée : ce qu'une marque a annoncé, quand, pour quand, et ce qui s'est passé.
// Statuts : kept (tenue), partial (tenue en partie), missed (non tenue), disputed (contestée),
//           unproven (aucune preuve publique), pending (en cours), open (sans échéance).
// Vérifié le 10 octobre 2026. Une promesse sans source n'entre pas dans cette liste.
window.ROBODEX.promises = [
  {
    id: "tesla-10000", brand: "Tesla", robot: "optimus", status: "missed", said: "2025", due: "2025-12-31",
    title: "10 000 robots Optimus construits en 2025",
    promise: "Elon Musk annonce environ 10 000 Optimus construits dans l'année, dont un millier au travail dans les usines Tesla.",
    reality: "L'objectif est manqué. En janvier 2026, Musk reconnaît qu'aucun Optimus ne fait de travail utile dans les usines ; quelques centaines d'unités servent à l'apprentissage.",
    sources: [["Electrek", "https://electrek.co/2026/01/28/musk-admits-no-optimus-robots-are-doing-useful-work-at-tesla-after-claiming-otherwise/"], ["Fortune, 22 janvier 2026", "https://fortune.com/2026/01/22/elon-musk-agonizingly-slow-cybercab-optimus-robot-rollout-tesla/"], ["Nasdaq / Zacks", "https://www.nasdaq.com/articles/why-teslas-optimus-story-more-promise-progress"]],
  },
  {
    id: "tesla-vente", brand: "Tesla", robot: "optimus", status: "pending", said: "2024-07", due: "2026-12-31",
    title: "Optimus vendu à d'autres entreprises en 2026",
    promise: "Musk écrit que Tesla aura des robots en petite production pour son usage interne en 2025 et, « espérons-le », en grande production pour d'autres entreprises en 2026.",
    reality: "À l'été 2026, Optimus n'est toujours pas en vente et aucune précommande n'est ouverte. La production de la version 3 est annoncée pour plus tard dans l'année.",
    sources: [["Digital Trends", "https://digitaltrends.com/?p=3652284"], ["Standard Bots, point 2026", "https://standardbots.com/blog/tesla-robot"]],
  },
  {
    id: "tesla-prix", brand: "Tesla", robot: "optimus", status: "open", said: null, due: null,
    title: "Un Optimus entre 20 000 et 30 000 dollars",
    promise: "Tesla vise un prix de 20 000 à 30 000 dollars une fois la production en grande série.",
    reality: "C'est un objectif, pas un tarif : aucun Optimus n'a encore été vendu, donc aucun prix n'a été pratiqué.",
    sources: [["Standard Bots, point 2026", "https://standardbots.com/blog/tesla-robot"]],
  },
  {
    id: "figure-flotte", brand: "Figure AI", robot: "figure03", status: "disputed", said: "2025-02", due: null,
    title: "Une « flotte » de robots au travail chez BMW",
    promise: "Le patron de Figure décrit une flotte de robots qui réalise des opérations de bout en bout dans l'usine BMW.",
    reality: "Interrogé par Fortune, BMW répond qu'un seul robot Figure travaille à la fois dans l'usine, sur une tâche limitée. Figure a contesté l'article.",
    sources: [["Fortune, 6 avril 2025", "https://fortune.com/2025/04/06/figure-ai-bmw-humanoid-robot-partnership-details-reality-exaggeration"], ["Repairer Driven News", "https://www.repairerdrivennews.com/2025/10/15/figure-ai-founder-claims-robots-running-on-bmw-production-line-10-hours-a-day/"]],
  },
  {
    id: "figure-maison", brand: "Figure AI", robot: "figure03", status: "unproven", said: "2025-02", due: "2025-12-31",
    title: "Des essais à domicile dès 2025",
    promise: "Figure annonce le début d'essais « alpha » de son robot dans des maisons avant la fin de 2025.",
    reality: "Aucun compte rendu indépendant ne confirme que ces essais ont eu lieu, ni ce qu'ils ont donné.",
    sources: [["TechCrunch, 27 février 2025", "https://techcrunch.com/2025/02/27/figure-will-start-alpha-testing-its-humanoid-robot-in-the-home-in-2025/"]],
  },
  {
    id: "figure-100000", brand: "Figure AI", robot: "figure03", status: "pending", said: "2025", due: "2029-01-31",
    title: "100 000 robots livrés en quatre ans",
    promise: "Figure dit voir « un chemin vers 100 000 robots » en quatre ans avec deux clients, BMW et un second non nommé.",
    reality: "Aucune source ne rapporte de livraisons proches de cette échelle. Le déploiement connu reste un pilote chez BMW.",
    sources: [["IoT World Today", "https://iotworldtoday.com/robotics/figure-ai-plans-to-ship-100-000-humanoid-robots-over-next-few-years"], ["The Robot Report, juin 2026", "https://www.therobotreport.com/bmw-group-deploys-figure-03-humanoid-after-tests-previous-version/"]],
  },
  {
    id: "1x-livraisons", brand: "1X", robot: "neo", status: "pending", said: "2025-10", due: "2026-12-31",
    title: "NEO livré dans les foyers américains en 2026",
    promise: "À l'ouverture des précommandes, 1X promet les premières livraisons aux États-Unis en 2026.",
    reality: "L'usine de Hayward a lancé la production le 30 avril 2026. En mai 2026, la presse spécialisée ne relevait encore aucune livraison confirmée chez un particulier.",
    sources: [["Gulf News", "https://gulfnews.com/technology/consumer-electronics/meet-neo-the-20000-humanoid-assistant-aiming-to-fully-automate-your-home-chores-1.500325447"], ["Macau Business — ouverture de l'usine", "https://macaubusiness.com/1x-opens-neo-factory-in-hayward-ca-americas-first-vertically-integrated-humanoid-robot-factory-with-consumer-shipments-planned-for-2026/"], ["The Gadgeteer, mai 2026", "https://the-gadgeteer.com/2026/05/20/home-robots-available-2026/"]],
  },
  {
    id: "1x-100000", brand: "1X", robot: "neo", status: "pending", said: "2026-04", due: "2027-12-31",
    title: "Plus de 100 000 NEO par an fin 2027",
    promise: "1X annonce une capacité de 10 000 robots la première année, et vise plus de 100 000 par an d'ici la fin de 2027.",
    reality: "La production vient de commencer. Aucun chiffre de robots réellement fabriqués n'a été publié.",
    sources: [["Macau Business — ouverture de l'usine", "https://macaubusiness.com/1x-opens-neo-factory-in-hayward-ca-americas-first-vertically-integrated-humanoid-robot-factory-with-consumer-shipments-planned-for-2026/"]],
  },
  {
    id: "unitree-g1", brand: "Unitree", robot: "g1", status: "kept", said: "2024-05", due: null,
    title: "Un humanoïde à 16 000 dollars",
    promise: "Unitree présente le G1 et annonce un prix de 16 000 dollars pour la version de base.",
    reality: "La version de série sort trois mois plus tard, au prix annoncé.",
    sources: [["Heise", "https://heise.de/-9720187"], ["Maginative — version de série", "https://www.maginative.com/article/unitree-launches-production-version-of-g1-humanoid-robot/"]],
  },
  {
    id: "unitree-r1", brand: "Unitree", robot: "g1", status: "partial", said: "2025-07", due: null,
    title: "Un humanoïde à moins de 6 000 dollars",
    promise: "Unitree présente le R1 à partir de 39 999 yuans, soit environ 5 900 dollars.",
    reality: "Le R1 est bien mis en vente à l'international en avril 2026, mais autour de 8 150 dollars avec les frais d'importation, pour des livraisons annoncées fin juin 2026.",
    sources: [["AI Business", "https://aibusiness.com/automation/humanoid-robot-priced-under-6k-unveiled"], ["VnExpress — mise en vente", "https://e.vnexpress.net/news/tech/enterprises/unitree-starts-selling-cheapest-humanoid-robot-from-6-800-5063068.html"]],
  },
  {
    id: "engineai-ceinture", brand: "EngineAI", robot: "t800", status: "pending", said: "2026-02", due: "2026-12-31",
    title: "Une ceinture en or de 10 kg pour l'équipe gagnante",
    promise: "En lançant sa ligue de combat de robots URKL, EngineAI promet à l'équipe championne une ceinture en or de 10 kg, d'une valeur annoncée de 10 millions de yuans.",
    reality: "Les premiers combats ont eu lieu à Shenzhen en juillet 2026. Les finales sont annoncées pour la fin de l'année : la ceinture n'a pas encore été remise.",
    sources: [["Gouvernement de Shenzhen", "https://www.sz.gov.cn/en_szgov/news/infocus/aisz/news/content/post_12647297.html"], ["TVB News — premiers combats", "https://news.tvb.com/en/1183656-HumanoidrobotfightingleaguemakesdebutinShenzhen"]],
  },
];

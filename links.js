// Robodex — liens directs vers un écran du site.
//   #promesses            #promesses/tesla-10000     #robots/atlas
//   #comparer/g1/optimus  #journal                   #accueil
// Paramètres : ?entrer (passe l'écran de démarrage, sans la voix) · ?q=question (pose la question à VEGA)
//              ?robot=n (affiche le n-ième robot du diaporama d'accueil) · ?theme=sombre|clair · ?y=hauteur
// Chargé en dernier.
(() => {
  const $ = (s) => document.querySelector(s);
  const tab = (view) => document.querySelector(`.tab[data-view="${view}"]`)?.click();
  const route = () => {
    const [name, a, b] = decodeURIComponent(location.hash.slice(1)).split("/");
    if (!name) return;
    if (name === "accueil") return tab("home");
    if (name === "journal") return tab("journal");
    if (name === "promesses") {
      tab("promises");
      if (a) setTimeout(() => document.getElementById(`p-${a}`)?.scrollIntoView({ block: "center" }), 120);
      return;
    }
    if (name === "robots") {
      tab("base");
      if (a) document.querySelector(`#roster-list button[data-id="${a}"]`)?.click();
      return;
    }
    if (name === "comparer") {
      if (a && $(`#cmp-a option[value="${a}"]`)) $("#cmp-a").value = a;
      if (b && $(`#cmp-b option[value="${b}"]`)) $("#cmp-b").value = b;
      $("#cmp-a").dispatchEvent(new Event("change"));
      tab("compare");
    }
  };
  const params = new URLSearchParams(location.search);
  // ?theme=sombre ou ?theme=clair force le thème ; ?y=600 fait défiler la page jusqu'à cette hauteur
  const want = { sombre: "dark", clair: "light" }[params.get("theme")];
  if (want && document.documentElement.dataset.theme !== want) $("#theme")?.click();
  if (params.has("entrer")) $("#boot-silent")?.click();
  if (params.has("robot")) document.querySelectorAll("#show-dots button")[Number(params.get("robot"))]?.click();
  route();
  window.addEventListener("hashchange", route);
  if (params.has("y")) setTimeout(() => window.scrollTo(0, Number(params.get("y"))), 200);
  if (params.get("q")) {
    $("#q").value = params.get("q");
    $("#ask").requestSubmit();
  }
})();

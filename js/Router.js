import Route from "./Route.js";
import { allRoutes, websiteName } from "./allRoutes.js";
import { initLogin } from "./auth/login.js";
import { initRegister } from "./auth/register.js";
import { initCharacterCreator, loadCharacterDetails, loadUserCharacter, initMessaging, loadUserInfo, loadCommunityCharacters, } from "./script/script.js";

const route404 = new Route("404", "Page introuvable", "/pages/404.html");

const getRouteByUrl = (url) => {
  let currentRoute = null;
  allRoutes.forEach((element) => {
    if (element.url == url) {
      currentRoute = element;
    }
  });
  return currentRoute != null ? currentRoute : route404;
};

const LoadContentPage = async () => {
  let path = window.location.hash.slice(1) || "/";

  // Gestion du chemin dynamique pour les détails
  let routePathToSearch = path;
  if (path.startsWith("/charDetails/")) {
    routePathToSearch = "/charDetails";
  }

  const actualRoute = getRouteByUrl(routePathToSearch);
  
  // Changement du titre (ON LE MET ICI, à l'intérieur de la fonction)
  document.title = actualRoute.title + " - " + websiteName;

  // Récupération et injection du HTML
  try {
    const response = await fetch(actualRoute.pathHtml);
    const html = await response.text();
    document.getElementById("main-page").innerHTML = html;

    // --- Déclenchement des scripts ---
    if (actualRoute.url === "/register") initRegister();
    if (actualRoute.url === "/login") initLogin();
    if (actualRoute.url === "/createChar") initCharacterCreator();
    if (actualRoute.url === "/profile") {
      await loadUserInfo();
      await loadUserCharacter();
      await loadCommunityCharacters();
    }
    if (actualRoute.url === "/messaging") initMessaging();
    
    
    // Si on est sur les détails (on vérifie le path réel avec l'ID)
    if (path.startsWith("/charDetails/")) {
      loadCharacterDetails();
    }
  } catch (error) {
    console.error("Erreur lors du chargement de la page:", error);
  }
};

// Événements
window.onpopstate = LoadContentPage;
window.addEventListener("hashchange", LoadContentPage);
window.route = (event) => {
  event = event || window.event;
  event.preventDefault();
  window.history.pushState({}, "", event.target.href);
  LoadContentPage();
};

// Premier chargement
LoadContentPage();
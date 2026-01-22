import Route from "./Route.js";

//Définir ici vos routes
export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html"),
    new Route("/404", "Erreur404", "/pages/404.html"),
    new Route("/register", "Inscription", "/pages/register.html"),
];

//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "Hero Tavern";
import Route from "./Route.js";

//Définir ici vos routes
export const allRoutes = [
    new Route("/", "Accueil", "./pages/home.html"),
    new Route("/404", "Erreur404", "./pages/404.html"),
    new Route("/register", "Inscription", "./pages/register.html",),
    new Route("/login", "Connexion", "./pages/login.html"),
    new Route("/passwordReset", "Réinitialisation du mot de passe", "./pages/passwordReset.html"),
    new Route("/profile", "Profil", "./pages/profile.html"),
    new Route("/createChar", "CréationPersonnage","./pages/createChar.html"),
    new Route("/charDetails", "Edition personnage", "./pages/charDetails.html"),
    new Route("/messaging", "Messagerie", "./pages/messaging.html"),
    new Route("/admin", "Admin", "./pages/admin.html"),
];

//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "Hero Tavern";
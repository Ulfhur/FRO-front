import { API_URL } from "../config.js";

// Function to register a User // 

export async function registerUser(email, username, password) {

    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            mail: email,
            username: username,
            password: password
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);  
        throw new Error(errorData.error || "Erreur lors de l'inscription");
    }

    return response.json();
}

// Function to log user // 

export async function loginUser(email, password) {

    const response = await fetch(`${API_URL}/login_check`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            mail: email,
            password: password
        })
    });

    if (!response.ok) {
        throw new Error("Identifiants invalides");
    }

    return response.json();
}

// Function to log out a user //

export function logoutUser() {

    // Erase current token // 

    localStorage.removeItem('token');
    updateHeader();

    window.location.href="#/";
}

// Function to update header (to avoid the need of refresh page to make it appears) // 

export function updateHeader() {
    const headerNavEl = document.getElementById("main-header");
    const headerUsernameEl = document.getElementById("header-username");
    if (!headerNavEl) return;

    const token = localStorage.getItem("token");

    if (token) {
        // Affiche le header
        headerNavEl.classList.remove("header-logged"); 
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // Lexik stocke l'identifiant (email) dans 'username'
            const userIdentifier = payload.username || "Joueur";
            
            if (headerUsernameEl) {
                // On peut nettoyer l'email pour n'afficher que la partie avant le @ 
                // ou laisser l'email entier pour l'instant
                headerUsernameEl.textContent = userIdentifier.split('@')[0]; 
            }
        } catch (e) {
            console.error("Erreur décodage token:", e);
            localStorage.removeItem("token");
            headerNavEl.classList.add("header-logged");
        }
    } else {
        // Cache le header
        headerNavEl.classList.add("header-logged");
        if (headerUsernameEl) headerUsernameEl.textContent = "Menu";
    }
}
// Initialize header state immediately
updateHeader();

// Function to check if user is admin //

export function isAdmin() {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.roles && payload.roles.includes('ROLE_ADMIN');
    } catch (e) {
        return false;
    }
}

// Function to register a User // 

export async function registerUser(email, username, password) {

    const response = await fetch("http://127.0.0.1:8000/api/register", {
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
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de l'inscription");
    }

    return response.json();
}

// Function to log user // 

export async function loginUser(email, password) {

    const response = await fetch("http://127.0.0.1:8000/api/login_check", {
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
    localStorage.removeItem('user');

    window.location.href="#/";
}



// Function to check if any token is in the local storage // 
    // If token founded => show hearder //

const headerNavEl = document.getElementById("main-header");

if (headerNavEl) {
    if (localStorage.getItem("token")) {
        headerNavEl.classList.remove("header-logged");
    } else {
        headerNavEl.classList.add("header-logged");
    }
}

// Function to refresh header after a login // 

export function updateHeader() {
    const headerNavEl = document.getElementById("main-header");
    if (!headerNavEl) return;

    if (localStorage.getItem("token")) {
        headerNavEl.classList.remove("header-logged");
    } else {
        headerNavEl.classList.add("header-logged");
    }
}


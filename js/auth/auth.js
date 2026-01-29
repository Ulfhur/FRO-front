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

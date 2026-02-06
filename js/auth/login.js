import { loginUser } from "./auth.js";
import { updateHeader } from "./auth.js";

export function initLogin() {
    
    const form = document.querySelector("#formLogin");
    const emailInput = document.querySelector("#EmailInput");
    const passwordInput = document.querySelector("#PasswordInput");
    const errorContainer = document.querySelector("#loginError");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Clear previous errors //

        errorContainer.textContent = "";

        try {
            const result = await loginUser(
                emailInput.value,
                passwordInput.value
            );

            // JWT Token //

            localStorage.setItem("token", result.token);

            // Update header //
            updateHeader();
           
            // Redirection to "profile" page //

            window.location.hash = "/profile";

        } catch (error) {
            
            errorContainer.textContent = error.message;
        }
    });
}

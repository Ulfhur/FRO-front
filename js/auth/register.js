import { registerUser } from "./auth.js";

export function initRegister() {
    const inputMail = document.getElementById("EmailInput");
    const inputPseudo = document.getElementById("PseudoInput");
    const inputPassword = document.getElementById("PasswordInput");
    const inputValidatePassword = document.getElementById("ValidatePasswordInput");
    const form = document.getElementById("registerForm");
    const btnRegister = document.getElementById("btnRegister");

    if (!form) return; // sécurité SPA

    inputMail.addEventListener("input", validateForm);
    inputPseudo.addEventListener("input", validateForm);
    inputPassword.addEventListener("input", validateForm);
    inputValidatePassword.addEventListener("input", validateForm);

    function validateForm() {
        const checkPseudo = validatePseudo(inputPseudo);
        const checkMail = validateMail(inputMail);
        const checkPassword = validatePassword(inputPassword);
        const checkValidatePassword = validateConfirmPassword(inputValidatePassword);
        btnRegister.disabled = !(checkPseudo && checkMail && checkPassword && checkValidatePassword);
    }

    function validateMail(input) {
        const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const ok = mailRegex.test(input.value);
        input.classList.toggle("is-valid", ok);
        input.classList.toggle("is-invalid", !ok);
        return ok;
    }

    function validatePseudo(input) {
        const pseudoRegex = /^[a-zA-Z0-9]{4,12}$/;
        const ok = pseudoRegex.test(input.value);
        input.classList.toggle("is-valid", ok);
        input.classList.toggle("is-invalid", !ok);
        return ok;
    }

    function validatePassword(input) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        const ok = passwordRegex.test(input.value);
        input.classList.toggle("is-valid", ok);
        input.classList.toggle("is-invalid", !ok);
        return ok;
    }

    function validateConfirmPassword(input) {
        const ok = input.value !== "" && input.value === inputPassword.value;
        input.classList.toggle("is-valid", ok);
        input.classList.toggle("is-invalid", !ok);
        return ok;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        await registerUser(
            inputMail.value,
            inputPseudo.value,
            inputPassword.value
        );
    });
}


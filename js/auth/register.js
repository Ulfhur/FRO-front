// Every const in Register page // 

const inputMail = document.getElementById("EmailInput");
const inputPseudo = document.getElementById("PseudoInput");
const inputPassword = document.getElementById("PasswordInput");
const inputValidatePassword = document.getElementById("ValidatePasswordInput");
const btnRegister = document.getElementById("btnRegister");

// Add Event Listener for every input //

inputMail.addEventListener("keyup", validateForm);
inputPseudo.addEventListener("keyup", validateForm);
inputPassword.addEventListener("keyup", validateForm);
inputValidatePassword.addEventListener("keyup", validateForm);


// Function to SET UP and CHECK every required fields. //
    // If all clear then active register button //

function validateForm() {
    const checkPseudo = validatePseudo(inputPseudo);
    const checkMail = validateMail(inputMail);
    const checkPassword = validatePassword(inputPassword);
    const checkValidatePassword = validateConfirmPassword(inputValidatePassword);
    
    if (checkPseudo && checkMail && checkPassword && checkValidatePassword) {
        btnRegister.disabled = false;
    } else {
        btnRegister.disabled = true;
    }
}

    // Function for Email validate with Regex //

function validateMail(input) {

        // Regex setup //

    const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mailUser = input.value;

    if(mailUser.match(mailRegex)) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
        return true;
    }
    else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

    // Function for Pseudo validate with Regex //

function validatePseudo(input) {

        // Regex setup // 

    const pseudoRegex = /^[a-zA-Z0-9]{4,12}$/;
    const pseudoUser = input.value;

    if(pseudoUser.match(pseudoRegex)) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid")
        return true;
    }
    else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

    // Function for Password validate with Regex // 

function validatePassword(input) {

        // Regex setup //

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    const passwordUser = input.value;

    if(passwordUser.match(passwordRegex)) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
        return true;
    }
    else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

    // Function to check if Validate Password match with Password input // 

function validateConfirmPassword(input) {

    if (inputValidatePassword.value == inputPassword.value) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
        return true;
    }
    else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}



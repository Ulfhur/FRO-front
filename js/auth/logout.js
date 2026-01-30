import { logoutUser } from "./auth.js";
import { updateHeader } from "./auth.js";

document.addEventListener("click", (e) => {
    if (e.target.closest("#logoutBtn")) {
        logoutUser();
    }
    updateHeader();
});


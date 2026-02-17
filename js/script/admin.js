// ALL FUNCTIONS FOR ADMIN PAGE //

let allCharacters = [];
let allComments = [];

    // Load Admin Page //

export async function loadAdminPage() {
    const token = localStorage.getItem("token");

    await Promise.all([
        fetchCharacters(token),
        fetchComments(token)
    ]);
    initEventListeners();
}

    // Load All Characters //

async function fetchCharacters(token) {
    try {
        const response = await fetch('http://localhost:8000/api/admin/characters', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        allCharacters = await response.json();
        renderCharacters();
    } catch (e) { console.error("Erreur récup héros:", e); }
}

function renderCharacters() {
    const container = document.getElementById('admin-community-characters-container');
    const search = document.getElementById('filter-search').value.toLowerCase();
    const sort = document.getElementById('filter-sort').value;

    if (!container) return;

    let filtered = allCharacters.filter(char => 
        char.name.toLowerCase().includes(search) || 
        char.user.toLowerCase().includes(search)
    );

    if (sort === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        filtered.sort((a, b) => b.id - a.id);
    }

    container.innerHTML = filtered.map(char => `
        <div class="card bg-dark text-white border-secondary shadow-sm" style="width: 18rem;">
            <div class="card-body">
                <h5 class="card-title text-primary">${char.name}</h5>
                <h6 class="card-subtitle mb-3 text-white-50">Par : ${char.user}</h6>
                <div class="d-grid gap-2">
                    <button class="btn btn-sm btn-outline-danger" onclick="adminDeleteChar(${char.id})">
                        <i class="bi bi-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

    // Load All Comments //

async function fetchComments(token) {
    try {
        const response = await fetch('http://localhost:8000/api/admin/comments', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        allComments = await response.json();
        renderComments();
    } catch (e) { console.error("Erreur récup messages:", e); }
}

function renderComments() {
    const list = document.getElementById('admin-comments-list');
    const search = document.getElementById('comment-search').value.toLowerCase();
    const sort = document.getElementById('comment-sort').value;

    if (!list) return;

    let filtered = allComments.filter(c => 
        c.content.toLowerCase().includes(search) || 
        c.author.toLowerCase().includes(search) || 
        c.characterName.toLowerCase().includes(search)
    );

    if (sort === "recent") filtered.sort((a, b) => b.id - a.id);
    else filtered.sort((a, b) => a.id - b.id);

    list.innerHTML = filtered.map(c => `
        <div class="list-group-item bg-dark text-white border-secondary mb-2 rounded shadow-sm">
            <div class="d-flex justify-content-between border-bottom border-secondary pb-1 mb-2">
                <small class="text-info">Héros : <strong>${c.characterName}</strong></small>
                <small class="text-white-50">${c.createdAt}</small>
            </div>
            <p class="mb-2 italic">"${c.content}"</p>
            <div class="d-flex justify-content-between align-items-center">
                <span class="badge bg-primary">Auteur : ${c.author}</span>
                <button class="btn btn-sm btn-danger" onclick="adminDeleteComment(${c.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}


function initEventListeners() {
    document.getElementById('filter-search').oninput = renderCharacters;
    document.getElementById('filter-sort').onchange = renderCharacters;
    document.getElementById('comment-search').oninput = renderComments;
    document.getElementById('comment-sort').onchange = renderComments;
}

    // Function to DELETE a character or a comment //

        // Characters //

window.adminDeleteChar = async function(id) {
    if (!confirm("Supprimer ce héros définitivement ?")) return;
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:8000/api/admin/characters/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    if (response.ok) fetchCharacters(token);
};

        // Comments //

window.adminDeleteComment = async function(id) {
    if (!confirm("Supprimer ce message définitivement ?")) return;
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:8000/api/admin/comment/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    if (response.ok) fetchComments(token);
};
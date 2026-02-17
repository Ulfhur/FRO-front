import { API_URL } from "../config.js";

// FUNCTION TO GET USER ID //

function getConnectedUserEmail() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        return payload.username || payload.mail;
    } catch (e) {
        return null;
    }
}

// FUNCTION TO CUSTOMISE CHARACTER WITH DRAG AND DROP //

export function initCharacterCreator() {

  console.log("🟢 initCharacterCreator lancé");

  // STATE //

  const equippedItems = {
    helmet: null,
    armor: null,
    legs: null,
    weapon: null,
    shield: null
  };

  let draggedItem = null;
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  // GET ELEMENTS //

  const character = document.getElementById('character');
  const inventory = document.getElementById('inventory');

  if (!character || !inventory) {
    console.error("❌ DOM personnage non chargé");
    return;
  }

  // CATEGORY FILTER //

  document.querySelectorAll('.category').forEach(btn => {
    btn.addEventListener('click', () => {

      document.querySelectorAll('.category')
        .forEach(b => b.classList.remove('active'));

      btn.classList.add('active');

      const selected = btn.dataset.category;

      document.querySelectorAll('#inventory .item').forEach(item => {
        item.style.display =
          item.dataset.category === selected ? 'block' : 'none';
      });
    });
  });

  // Filter //

  const activeCategory = document.querySelector('.category.active');
  if (activeCategory) {
    document.querySelectorAll('#inventory .item').forEach(item => {
      item.style.display =
        item.dataset.category === activeCategory.dataset.category
          ? 'block'
          : 'none';
    });
  }

  // DRAG START //

  inventory.querySelectorAll('.item').forEach(item => {

    item.addEventListener('mousedown', (e) => {

      e.preventDefault();

      draggedItem = item.cloneNode(true);
      draggedItem.classList.add('item-on-character');
      draggedItem.style.position = 'absolute';

      const type = item.dataset.category;
      draggedItem.style.zIndex = getZIndex(type);

      const rect = item.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      character.appendChild(draggedItem);

      isDragging = true;
    });
  });

  // DRAG MOVE //

  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !draggedItem) return;

    const rect = character.getBoundingClientRect();

    let left = e.clientX - rect.left - offsetX;
    let top = e.clientY - rect.top - offsetY;

    left = Math.max(0, Math.min(left, rect.width - draggedItem.offsetWidth));
    top = Math.max(0, Math.min(top, rect.height - draggedItem.offsetHeight));

    draggedItem.style.left = left + 'px';
    draggedItem.style.top = top + 'px';
  });

  // DRAG END //

  document.addEventListener('mouseup', () => {
    if (!isDragging || !draggedItem) return;

    snapToSlot(draggedItem);

    draggedItem = null;
    isDragging = false;
  });

  //SNAP //

  function snapToSlot(item) {
    const type = item.dataset.category;
    const slot = document.querySelector(`.slot[data-slot="${type}"]`);
    if (!slot) return;

    if (equippedItems[type]) {
      equippedItems[type].remove();
    }

    item.style.left = '0px';
    item.style.top = '0px';
    item.style.position = 'absolute';
    item.style.zIndex = getZIndex(type);

    slot.appendChild(item);
    equippedItems[type] = item;
  }

  // Z-INDEX //

  function getZIndex(type) {
    switch(type) {
      case 'helmet': return 3;
      case 'armor': return 2;
      case 'legs': return 1;
      case 'weapon': return 5;
      case 'shield': return 4;
      default: return 0;
    }
  }

// CREATE BUTTON //
  
const createBtn = document.getElementById('create-char-btn');

if (!createBtn) {
  console.error("Button #create-char-btn not found !");
} else {

  createBtn.addEventListener('click', () => {

    const nameInput = document.getElementById('character-name-input');
    const characterName = nameInput?.value?.trim();

    if (!characterName) {
      alert("Merci d'entrer un nom pour le personnage");
      return;
    }

    const defaultCharacterData = {
      name: characterName,

      // Fixed values for now need more character assets //
      genre: 'male',
      skinColor: 'pale',
      eyesColor: 'black',
      hairColor: 'black',
      face: 'standard',
      hair: 'short',
      equipmentIds: [],
      isShared: false
    };


    for (let key in equippedItems) {
      const el = equippedItems[key];
      if (el) {
        const equipId = el.dataset.id;
        if (equipId) {
          defaultCharacterData.equipmentIds.push(parseInt(equipId));
        }
      }
    }

    console.log("Data sent:", defaultCharacterData);

    fetch(`${API_URL}/character`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify(defaultCharacterData)
    })
    .then(async res => {
      const text = await res.text();
      console.log("Server answer :", text);

      try {
        return JSON.parse(text);
      } catch (e) {
        throw { error: "Not JSON Response" };
      }
    })
    .then(data => {
      console.log('✅ Personnage créé !', data);
      alert('Personnage créé avec succès ! Retour sur ton profil !');
      window.location.hash = "#/profile";
    })
    .catch(err => {
      console.error('Erreur création personnage', err);
      alert('Erreur : ' + (err.error || err.message || 'inconnue'));
    });
  });
}
}

// FUNCTION TO GET USER CHARACTER DATA FOR PROFILE PAGE //

export async function loadUserCharacter() {
  const container = document.getElementById('characters-container');
  if(!container) return;

  try {
    const response = await fetch(`${API_URL}/character`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token"),
        "Content-type": "application/json"
      }
    });

    if (!response.ok) throw new Error("Not able to load characters")

    const character = await response.json();

    if (character.length === 0) {
      container.innerHTML = "<p class='text-center'>Il est grand temps de créer ton premier personnage !</p>";
      return;
  }

  container.innerHTML = "";

  character.forEach(char => {
    let equipmentHtml = '';
    if (char.equipment && char.equipment.length > 0) {
      char.equipment.forEach(item => {
        const imgSrc = getEquipmentImage(item.type);
        equipmentHtml += `<img src="${imgSrc}" class="equip-overlay">`;
      });
    }

    const charCard = `
        <div class="character-window">
            <div class="character-display-container">
                <a href="#/charDetails/${char.id}">
                  <img src="Images/perso.png" class="character-window-image base-body" alt="Corps">
                  ${equipmentHtml}
                </a>
            </div>
            <ul class="character-window-text">
                <li class="fw-bold">${char.name}</li>
            </ul>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', charCard);
  });
  } catch (error) {
    console.error(error);
    document.getElementById('profile-state').innerHTML = 
    "<div class='alert alert-danger'>Erreur de chargement des personnages</div>";
  }
}

  // Function to map equipment type //

function getEquipmentImage(type) {
  const mapping = {
    'helmet': 'Images/casquePerso.png',
    'armor': 'Images/armurePerso.png',
    'legs': 'Images/jambierePerso.png',
    'weapon': 'Images/epeePerso.png',
    'shield': 'Images/bouclierPerso.png'
  };
  return mapping[type] || '';
}

// FUNCTION TO GET DETAILS OF A SPECIFIC CHARACTER (charDetails page) //

export async function loadCharacterDetails() {
    
    const charContainer = document.getElementById('main-edit-character');
    const inventoryContainer = document.getElementById('inventory');
    const connectedEmail = getConnectedUserEmail();
    
    if (!charContainer || !inventoryContainer) {
        console.warn("Containers not found");
        return;
    }
    charContainer.style.width = "400px";
    charContainer.style.height = "400px";

      // Get character's ID //

    const hash = window.location.hash;
    const parts = hash.split('/');
    const charId = parts[parts.length - 1];

    try {
        const response = await fetch(`${API_URL}/character/${charId}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token"),
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Error while trying to load character data");

        const char = await response.json();
        console.log("Données du perso :", char); 
        console.log("Email connecté :", connectedEmail)
        const isOwner = char.user && char.user.mail === connectedEmail;

        // Set img of base character //
        charContainer.innerHTML = `
            <img src="Images/perso.png" alt="Corps" class="edit-character">
        `;

        // Set every equip item on character //
        if (char.equipment && char.equipment.length > 0) {
            char.equipment.forEach(item => {
                const imgSrc = getEquipmentImage(item.type);
                const equipHtml = `
                    <img src="${imgSrc}" 
                         class="edit-slot" 
                         data-slot="${item.type}" 
                         alt="${item.name}">
                `;
                charContainer.insertAdjacentHTML('beforeend', equipHtml);
            });
        }

        // Set the container for equipped stuff //
        inventoryContainer.innerHTML = `
            <div class="p-3 w-100">
                <h3>${char.name}</h3>
                <p class="text-muted">Classe : Aventurier</p>
                <hr class="text-white">
                <div class="d-flex flex-wrap gap-2">
                    ${char.equipment.map(item => `
                        <div class="item-detail-card">
                            <small class="d-block text-uppercase fw-bold">${item.type}</small>
                            <span>${item.name}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="d-flex flex-wrap gap-2 mt-4">
                     <a href="#/profile" class="btn btn-sm btn-outline-dark">Retour au profil</a>
                     ${isOwner ? `
                        <button class="my-button align-self-center" id="share-btn">Partager</button>` : ``
                      }
                     <div class="ms-auto" id="comments-btn" style="cursor: pointer;">
                      <i class="bi bi-chat-left-dots-fill fs-4"></i>
                    </div>
                </div>
            </div>
        `;

        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            shareBtn.textContent = char.isShared ? "Ne plus partager" : "Partager";
            if (char.isShared) shareBtn.classList.add('btn-danger');
        }
        toggleShareCharacter(char.isShared);

        document.getElementById('comments-btn')?.addEventListener('click', () => {
            openCommentsModal(char);
        });

    } catch (error) {
        console.error(error);
        charContainer.innerHTML = `<p class="text-danger">Impossible de charger ce personnage.</p>`;
    }
}

// SHARE BUTTON //

export async function toggleShareCharacter(currentStatus) {

    const shareBtn = document.getElementById('share-btn');
    if (!shareBtn) return;

    let isCurrentlyShared = currentStatus;

    shareBtn.addEventListener('click', async () => {
        const charId = window.location.hash.split('/').pop();
        const token = localStorage.getItem('token');

        shareBtn.disabled = true;

        const previousText = shareBtn.textContent;

        shareBtn.textContent = "En cours...";

        const newStatus = !isCurrentlyShared;

        try {
            const response = await fetch(`${API_URL}/character/${charId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    isShared: newStatus
                })
            });

            if (response.ok) {
                isCurrentlyShared = newStatus;
                alert(isCurrentlyShared ? 'Personnage partagé !' : 'Partage annulé !');
                
                shareBtn.textContent = isCurrentlyShared ? "Ne plus partager" : "Partager";
                shareBtn.classList.toggle('btn-danger', isCurrentlyShared);
            } else {
                throw new Error();
            }
        } catch (error) {
            console.error("Erreur API:", error);
            alert("Une erreur est survenue.");
            shareBtn.textContent = previousText;
        } finally {
            shareBtn.disabled = false;
        }
    });
}

// FUNCTION TO INITIALIZE MESSAGING PAGE //

export function initMessaging() {
  const form = document.getElementById('messageForm');
  

  loadMessages('received');
  loadMessages('sent');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const recipientInput = document.getElementById('recipientInput');
    const titleInput = document.getElementById('messageTitle');
    const messageInput = document.getElementById('messageText');
    
    if (!recipientInput || !messageInput || !titleInput) return;

    const recipient = recipientInput.value.trim();
    const title = titleInput.value.trim();
    const message = messageInput.value.trim();
    const token = localStorage.getItem('token');

    if (!token) {
      alert("Erreur : Vous devez être connecté pour envoyer un message.");
      window.location.hash = "#/login";
      return;
    }

    if (!recipient || !message || !title) {
      alert("Veuillez remplir tous les champs (Destinataire, Sujet, Message).");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/message`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          content: message,
          recipientUsername: recipient
        })
      });

      if (response.ok) {
        alert("Message envoyé avec succès !");
        form.reset();
        
        loadMessages('sent');
    
      } else {
        const data = await response.json();
        alert("Erreur lors de l'envoi : " + (data.error || data.message || response.statusText));
      }

    } catch (error) {
      console.error("Erreur envoi message:", error);
      alert("Une erreur est survenue lors de l'envoi du message.");
    }
  });
}

// LOAD ALL MESSAGES //

async function loadMessages(type) {
  const isReceived = type === 'received';
  const url = `${API_URL}/message`;

  const containerId = isReceived 
    ? 'navbarToggleExternalContentReceived' 
    : 'navbarToggleExternalContentSent';

  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error("Erreur chargement messages");

    const allMessages = await response.json();
    
    let currentUsername = null;
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        currentUsername = payload.username;
      } catch (e) {}
    }

    const messages = allMessages;

    container.innerHTML = '';

    if (!messages || messages.length === 0) {
      container.innerHTML = `<div class="p-4 text-white">Aucun message ${isReceived ? 'reçu' : 'envoyé'}.</div>`;
      return;
    }

    const list = document.createElement('div');
    list.className = 'list-group m-3';

    messages.forEach(msg => {
      
      const contactLabel = isReceived 
        ? `De : ${msg.senderUsername}` 
        : `À : ${msg.recipientUsername}`;

      const title = msg.title || "Sans titre";
      const content = msg.content || "";
      const date = msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "";

      const item = document.createElement('div');
      item.className = "list-group-item list-group-item-action bg-light text-dark mb-2 rounded";
      item.style.cursor = "pointer";
      item.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1 fw-bold">${title} <small class="text-muted">(${contactLabel})</small></h5>
          <small class="text-muted">${date}</small>
        </div>
        <p class="mb-1 text-truncate">${content}</p>`;

      item.addEventListener('click', () => {
        document.getElementById('modalMessageTitle').textContent = title;
        document.getElementById('modalMessageInfo').textContent = `${contactLabel} - ${date}`;
        document.getElementById('modalMessageBody').textContent = content;
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('messageModal'));
        modal.show();
      });

      list.appendChild(item);
    });

    container.appendChild(list);

  } catch (error) {
    console.error("Erreur loadMessages:", error);
    container.innerHTML = `<div class="p-4 text-danger">Impossible de charger les messages.</div>`;
  }
}

// LOAD USER INFORMATIONS //

export async function loadUserInfo() {
   
    const pseudoEl = document.getElementById("user-pseudo");
    const emailEl = document.getElementById("user-email");
    const headerUsernameEl = document.getElementById("header-username");

    try {
        const response = await fetch(`${API_URL}/user/me`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token"),
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json(); 
            
            throw new Error(errorData.message);
        }

        const user = await response.json();
        if (pseudoEl) pseudoEl.textContent = user.username;
        if (emailEl) emailEl.textContent = user.mail;
        if (headerUsernameEl) headerUsernameEl.textContent = user.username;

    } catch (error) {
        console.error("Erreur profil:", error);
        if (pseudoEl) pseudoEl.textContent = "Utilisateur";
    }
}

// LOAD COMMUNITY CHARACTERS //

let allCommunityChars = [];

export async function loadCommunityCharacters() {
    const container = document.getElementById('community-characters-container');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/character/community`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Erreur de récupération');

        allCommunityChars = await response.json();
        
        initFilters();
        
        renderCharacters(allCommunityChars);

    } catch (error) {
        console.error("Erreur communauté:", error);
    }
}

function initFilters() {
    const searchInput = document.getElementById('filter-search');
    const sortSelect = document.getElementById('filter-sort');

    const applyFilters = () => {
        let filtered = [...allCommunityChars];
        const search = searchInput.value.toLowerCase();
        if (search) {
            filtered = filtered.filter(char => 
                char.name.toLowerCase().includes(search) || 
                char.owner.toLowerCase().includes(search)
            );
        }

        const sortBy = sortSelect.value;
        if (sortBy === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'comments') {
            filtered.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
        } else {
            filtered.sort((a, b) => b.id - a.id);
        }

        renderCharacters(filtered);
    };

    searchInput.oninput = applyFilters;
    sortSelect.onchange = applyFilters;
}

// FUNCTION TO CREATE CHAR CARD //

function renderCharacters(chars) {
    const container = document.getElementById('community-characters-container');
    container.innerHTML = "";

    if (chars.length === 0) {
        container.innerHTML = "<p class='text-white-50 text-center w-100'>Aucun héros ne correspond à ces critères...</p>";
        return;
    }

    chars.forEach(char => {
    
        let equipmentHtml = "";
        const items = char.equipments || char.equipment || [];
        
        items.forEach(item => {
            
            const type = (typeof item === 'object') ? item.type : item;
            const imgSrc = getEquipmentImage(type);
            
            if (imgSrc) {
                equipmentHtml += `<img src="${imgSrc}" class="character-window-image equipment-layer" alt="">`;
            }
        });

        const charCard = `
            <div class="character-window position-relative"> 
                <a href="#/charDetails/${char.id}" class="full-card-link"></a>
                <div class="character-display-container">
                    <img src="/Images/perso.png" class="character-window-image base-body" alt="">
                    ${equipmentHtml}
                </div>
                <ul class="character-window-text">
                    <li class="fw-bold">${char.name}</li>
                    <li class="text-muted" style="font-size: 11px;">Par: ${char.owner}</li>
                    ${char.commentCount ? `<li class="text-warning" style="font-size: 10px;"><i class="bi bi-chat-dots"></i> ${char.commentCount} rumeurs</li>` : ''}
                </ul>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', charCard);
    });
}

// MODAL FOR COMMENT AND COMMENTARY FUNCTIONS //

    // Modal //
    
export async function openCommentsModal(char) {
    if (!char || !char.id) {
        console.error("Données du personnage manquantes.");
        return;
    }

    let modalEl = document.getElementById('commentsModal');
    
    if (!modalEl) {
        const modalHtml = `
            <div class="modal fade" id="commentsModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content text-dark">
                        <div class="modal-header text-white">
                            <h5 class="modal-title text-white">${char.name}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div id="comments-list" class="mb-3" style="max-height: 300px; overflow-y: auto;"></div>
                            <hr>
                            <form id="comment-form">
                                <div class="mb-2">
                                    <label class="form-label small fw-bold">Note :</label>
                                    <select id="comment-note" class="form-select form-select-sm w-auto">
                                        <option value="5">5 ★★★★★</option>
                                        <option value="4">4 ★★★★</option>
                                        <option value="3">3 ★★★</option>
                                        <option value="2">2 ★★</option>
                                        <option value="1">1 ★</option>
                                    </select>
                                </div>
                                <textarea id="comment-content" class="form-control mb-2" placeholder="Partage ce tu penses du personnage..." required></textarea>
                                <button type="submit" class="btn btn-primary w-100">Partager</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modalEl = document.getElementById('commentsModal');
    }

    modalEl.querySelector('.modal-title').textContent = `Taverne - ${char.name}`;
    loadTavernComments(char.id);

    const form = document.getElementById('comment-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
      
        const commentData = {
            content: document.getElementById('comment-content').value,
            note: document.getElementById('comment-note').value,
            characterId: char.id
        };

        const success = await sendCommentToApi(commentData);
        
        if (success) {
            form.reset();
            loadTavernComments(char.id);
        } else {
            alert("La taverne refuse votre message (Vérifiez votre connexion).");
        }
    };

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
}

  // Load comments //

export async function loadTavernComments(charId) {
    const list = document.getElementById('comments-list');
    if (!list) return;

    try {
        const res = await fetch(`${API_URL}/comment/character/${charId}`, {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        
        if (!res.ok) throw new Error("Erreur de récupération");
        
        const comments = await res.json();

        if (comments.length === 0) {
            list.innerHTML = `<p class="small text-muted text-center">Le silence règne... Aucune rumeur sur ce héros.</p>`;
            return;
        }

        list.innerHTML = comments.map(c => `
            <div class="p-2 mb-2 bg-light rounded border-bottom">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold text-primary" style="font-size: 0.9rem;">${c.authorName}</span>
                    <span class="text-warning" style="letter-spacing: 2px;">${"★".repeat(c.note || 5)}</span>
                </div>
                <p class="mb-0 text-dark" style="font-size: 0.9rem;">${c.content}</p>
                <small class="text-muted" style="font-size: 0.7rem;">Publié le ${c.dateComment}</small>
            </div>
        `).join('');
    } catch (e) {
        list.innerHTML = "<p class='text-danger small text-center'>Erreur lors du chargement des rumeurs.</p>";
    }
}

  // Publish comment //

export async function sendCommentToApi(data) {
    try {
        const response = await fetch(`${API_URL}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(data) 
        });
        return response.ok;
    } catch (error) {
        console.error("Erreur API:", error);
        return false;
    }
}

// FUNCTION TO LOAD ADMIN BUTTON INTO PROFILE PAGE IF USER IS ADMIN //

export function showAdminButton() {
    const container = document.getElementById('admin-access-container');
    const token = localStorage.getItem("token");

    if (!token || !container) return;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const roles = payload.roles || [];

        if (roles.includes('ROLE_ADMIN')) {
            container.innerHTML = `
                <div class="mt-4 p-3 border border-danger rounded bg-dark">
                    <h5 class="text-danger"><i class="bi bi-shield-lock"></i> Zone Administrateur</h5>
                    <p class="small text-white-50">Accédez aux outils de modération de la taverne.</p>
                    <a href="#/admin" class="btn btn-danger w-100">
                        Accéder au Dashboard Admin
                    </a>
                </div>
            `;
        }
    } catch (e) {
        console.error("Erreur lors de la lecture des rôles", e);
    }
}
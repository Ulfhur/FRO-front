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
      equipmentIds: []
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

    fetch('http://localhost:8000/api/character', {
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
    const response = await fetch("http://localhost:8000/api/character/", {
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
                  <img src="/Images/perso.png" class="character-window-image base-body" alt="Corps">
                  ${equipmentHtml}
                </a>
            </div>
            <ul class="character-window-text">
                <li class="fw-bold">${char.name}</li>
                <li>
                    <button class="btn btn-sm btn-link text-primary p-0">Modifier</button>
                </li>
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
    'helmet': '/Images/casquePerso.png',
    'armor': '/Images/armurePerso.png',
    'legs': '/Images/jambierePerso.png',
    'weapon': '/Images/epeePerso.png',
    'shield': '/Images/bouclierPerso.png'
  };
  return mapping[type] || '';
}

// FUNCTION TO GET DETAILS OF A SPECIFIC CHARACTER (charDetails page) //

export async function loadCharacterDetails() {
    const charContainer = document.getElementById('character');
    const inventoryContainer = document.getElementById('inventory');
    
    if (!charContainer || !inventoryContainer) return;

    // 1. Extraction de l'ID depuis l'URL (#/charDetails/ID)
    const hash = window.location.hash;
    const parts = hash.split('/');
    const charId = parts[parts.length - 1];

    try {
        const response = await fetch(`http://localhost:8000/api/character/${charId}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token"),
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération du personnage");

        const char = await response.json();

        // 2. Affichage du corps du personnage
        charContainer.innerHTML = `
            <img src="/Images/perso.png" alt="Corps" class="base-body">
        `;

        // 3. Affichage de l'équipement visuel (overlays)
        if (char.equipment && char.equipment.length > 0) {
            char.equipment.forEach(item => {
                // On utilise tes classes .slot et le data-slot pour le positionnement CSS
                const imgSrc = getEquipmentImage(item.type); // Ta fonction qui lie type -> image
                const equipHtml = `
                    <img src="${imgSrc}" 
                         class="slot" 
                         data-slot="${item.type}" 
                         alt="${item.name}">
                `;
                charContainer.insertAdjacentHTML('beforeend', equipHtml);
            });
        }

        // 4. Affichage de l'inventaire (liste détaillée en dessous ou à côté)
        inventoryContainer.innerHTML = `
            <div class="p-3 w-100">
                <h3 class="text-white">${char.name}</h3>
                <p class="text-muted">Classe : Aventurier</p>
                <hr class="text-white">
                <div class="d-flex flex-wrap gap-2">
                    ${char.equipment.map(item => `
                        <div class="item-detail-card border p-2 rounded bg-light" style="min-width: 120px;">
                            <small class="d-block text-uppercase fw-bold">${item.type}</small>
                            <span>${item.name}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-4">
                     <a href="#/profile" class="btn btn-sm btn-outline-light">Retour au profil</a>
                </div>
            </div>
        `;

    } catch (error) {
        console.error(error);
        charContainer.innerHTML = `<p class="text-danger">Impossible de charger ce personnage.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {

  /* ===============================
     STATE
  =============================== */
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

  /* ===============================
     CATEGORIES (SPA SAFE)
  =============================== */
 document.addEventListener('click', (e) => {
  const btn = e.target.closest('.category');
  if (!btn) return;

  const categories = document.querySelectorAll('.category');
  const inventoryItems = document.querySelectorAll('#inventory .item'); // <--- IMPORTANT

  categories.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const selected = btn.dataset.category;

  inventoryItems.forEach(item => {
    item.style.display =
      item.dataset.category === selected ? 'block' : 'none';
  });
});


  // Initial filter
  const activeCategory = document.querySelector('.category.active');
  if (activeCategory) {
    const items = document.querySelectorAll('.item');
    items.forEach(item => {
      item.style.display =
        item.dataset.category === activeCategory.dataset.category
          ? 'block'
          : 'none';
    });
  }

  /* ===============================
     DRAG START
  =============================== */
  document.addEventListener('mousedown', (e) => {
    const item = e.target.closest('.item');
    if (!item) return;

    e.preventDefault();

    draggedItem = item.cloneNode(true);
    draggedItem.classList.add('item-on-character');
    draggedItem.style.position = 'absolute';
    draggedItem.style.zIndex = 100;

    const rect = item.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    const character = document.getElementById('character');
    if (!character) return;

    character.appendChild(draggedItem);
    isDragging = true;
  });

  /* ===============================
     DRAG MOVE
  =============================== */
  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !draggedItem) return;

    const character = document.getElementById('character');
    if (!character) return;

    const rect = character.getBoundingClientRect();

    draggedItem.style.left = (e.clientX - rect.left - offsetX) + 'px';
    draggedItem.style.top = (e.clientY - rect.top - offsetY) + 'px';
  });

  /* ===============================
     DRAG END / SNAP
  =============================== */
  document.addEventListener('mouseup', () => {
    if (!isDragging || !draggedItem) return;

    snapToSlot(draggedItem);

    draggedItem = null;
    isDragging = false;
  });

  /* ===============================
     SNAP TO SLOT (PAR TYPE)
  =============================== */
  function snapToSlot(item) {
    const type = item.dataset.category;
    const slot = document.querySelector(`.slot[data-slot="${type}"]`);
    if (!slot) return;

    // Supprime l'ancien item du slot uniquement
    if (equippedItems[type]) {
      equippedItems[type].remove();
    }

    // Reset position relative au slot
    item.style.left = '0px';
    item.style.top = '0px';

    slot.appendChild(item);
    equippedItems[type] = item;
  }

});

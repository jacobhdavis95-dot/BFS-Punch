const STORAGE_KEY = 'bfs-punch-report-v2';
const $ = (selector, root = document) => root.querySelector(selector);
const itemsList = $('#itemsList');
let saveTimer;

$('#currentDate').textContent = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
$('#dueDate').min = new Date().toISOString().slice(0, 10);

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function updateItemNumbers() {
  const cards = [...document.querySelectorAll('.punch-card')];
  cards.forEach((card, index) => {
    $('.item-number', card).textContent = `ITEM ${String(index + 1).padStart(2, '0')}`;
    $('.remove-item', card).hidden = cards.length === 1;
  });
  $('#itemTotal').textContent = `${cards.length} item${cards.length === 1 ? '' : 's'}`;
}

function readImages(files, preview) {
  preview.innerHTML = '';
  [...files].slice(0, 5).forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.src = reader.result;
      image.alt = 'Punch item preview';
      preview.append(image);
    };
    reader.readAsDataURL(file);
  });
}

function addItem(data = {}) {
  const fragment = $('#itemTemplate').content.cloneNode(true);
  const card = $('.punch-card', fragment);
  $('.item-name', card).value = data.name || '';
  $('.item-location', card).value = data.location || '';
  $('.item-details', card).value = data.details || '';
  $('.item-trade', card).value = data.trade || '';
  $('.item-priority', card).value = data.priority || 'Standard';
  $('.item-status', card).value = data.status || 'Open';
  $('.remove-item', card).addEventListener('click', () => { card.remove(); updateItemNumbers(); saveDraft(); });
  $('.photo-input', card).addEventListener('change', event => readImages(event.target.files, $('.photo-previews', card)));
  itemsList.append(card);
  updateItemNumbers();
}

function collectDraft() {
  const fields = ['manager', 'neighborhood', 'lot', 'customer', 'address', 'jobNumber', 'dueDate', 'finalNotes'];
  return {
    fields: Object.fromEntries(fields.map(id => [id, $(`#${id}`).value])),
    items: [...document.querySelectorAll('.punch-card')].map(card => ({
      name: $('.item-name', card).value, location: $('.item-location', card).value,
      details: $('.item-details', card).value, trade: $('.item-trade', card).value,
      priority: $('.item-priority', card).value, status: $('.item-status', card).value
    }))
  };
}

function saveDraft() {
  clearTimeout(saveTimer);
  $('#saveState').innerHTML = '<i></i> Saving…';
  saveTimer = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collectDraft()));
    $('#saveState').innerHTML = '<i></i> Draft saved';
  }, 350);
}

function loadDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!draft) return addItem();
    Object.entries(draft.fields || {}).forEach(([id, value]) => { if ($(`#${id}`)) $(`#${id}`).value = value; });
    (draft.items?.length ? draft.items : [{}]).forEach(addItem);
  } catch { addItem(); }
}

$('#addItem').addEventListener('click', () => { addItem(); document.querySelector('.punch-card:last-child').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
$('#reportForm').addEventListener('input', saveDraft);
$('#clearDraft').addEventListener('click', () => {
  if (!confirm('Clear all project details and punch items?')) return;
  localStorage.removeItem(STORAGE_KEY);
  $('#reportForm').reset();
  itemsList.innerHTML = '';
  addItem();
  $('#dueDate').min = new Date().toISOString().slice(0, 10);
  showToast('Draft cleared');
});
$('#reportForm').addEventListener('submit', event => {
  event.preventDefault();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collectDraft()));
  showToast(`Report created with ${document.querySelectorAll('.punch-card').length} punch item(s)`);
  $('.primary').textContent = 'Report created ✓';
  setTimeout(() => { $('.primary').innerHTML = 'Create punch report <span>→</span>'; }, 2600);
});

loadDraft();

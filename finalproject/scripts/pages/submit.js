// pages/submit.js (ES module)
import { store, PREF_KEY } from '../modules/storage.js';

const form = document.getElementById('tip-form');
const ts = document.getElementById('timestamp');

function init() {
  // Prefill categoría desde LocalStorage
  const pref = store.get(PREF_KEY, 'general');
  const sel = form.elements['prefCategory'];
  if (sel) sel.value = pref;

  // Timestamp oculto
  ts.value = new Date().toISOString();

  // Persistir preferencia al cambiar
  sel?.addEventListener('change', () => store.set(PREF_KEY, sel.value));
}

init();

// pages/browse.js (ES module)
import { store, PREF_KEY } from '../modules/storage.js';
import { loadNews, imgOf, formatDate } from '../modules/newsData.js';
import { openModal } from '../modules/modal.js';

const list = document.getElementById('browse-list');
const catSel = document.getElementById('cat');
const savePrefBtn = document.getElementById('savePref');
const countEl = document.getElementById('count');

function renderItems(articles) {
  list.innerHTML = '';
  // Asegura al menos 15 (si hay)
  const limited = articles.slice(0, Math.max(15, articles.length));

  limited.forEach(a => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <h4><a href="${a.url}" target="_blank" rel="noopener">${a.title}</a></h4>
      <p class="meta">${a.source ?? a.source?.name ?? 'Source'} • ${formatDate(a.publishedAt)}</p>
      <p>${a.description ?? ''}</p>
      <img class="thumb" src="${imgOf(a)}" alt="${a.title}" width="640" height="360" loading="lazy" decoding="async" style="aspect-ratio:16/9;width:100%;height:auto;">
      <button class="details">Details</button>
    `;
    card.querySelector('.details').addEventListener('click', () => {
      // Modal con más info
      openModal(
        a.title,
        `
        <p><strong>Source:</strong> ${a.source?.name ?? a.source ?? 'Unknown'}</p>
        <p><strong>Published:</strong> ${formatDate(a.publishedAt)}</p>
        <p>${a.description ?? ''}</p>
        <p><a href="${a.url}" target="_blank" rel="noopener">Read full article</a></p>
        <img src="${imgOf(a)}" alt="${a.title}" width="900" height="600" loading="lazy" decoding="async" style="aspect-ratio:3/2;width:100%;height:auto;">
        `
      );
    });
    list.appendChild(card);
  });

  // Array method reduce para contar
  const total = limited.reduce((acc) => acc + 1, 0);
  countEl.textContent = `${total} articles shown`;
}

async function loadCategory(category) {
  const articles = await loadNews(category);
  renderItems(articles);
}

function init() {
  // Carga preferencia guardada
  const pref = store.get(PREF_KEY, 'general');
  catSel.value = pref;
  loadCategory(pref);

  catSel.addEventListener('change', () => loadCategory(catSel.value));
  savePrefBtn.addEventListener('click', () => {
    store.set(PREF_KEY, catSel.value);
    savePrefBtn.textContent = 'Saved!';
    setTimeout(() => (savePrefBtn.textContent = 'Save Preference'), 1200);
  });
}

init();
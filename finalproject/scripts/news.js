// scripts/news.js

/* ===== CONFIG ===== */
const NEWS_API_KEY = 'TU_API_KEY_DE_NEWSAPI'; // <-- pon tu API key
let currentCategory = 'general';               // categorías: general, business, technology, sports, entertainment
const NEWS_TTL = 24 * 60 * 60 * 1000;         // 24h
const NEWS_CACHE_KEY = (category) => `newstime:news:us:${category}`;

/* ===== HELPERS ===== */
const $ = (sel) => document.querySelector(sel);
const articleImage = (a) => a?.urlToImage || 'https://picsum.photos/800/450?blur=2';

/* ===== RENDER ===== */
function renderHero(article) {
  const hero = $('#hero');
  if (!hero || !article) return;
  hero.innerHTML = `
    <a href="${article.url}" target="_blank" rel="noopener">
      <img class="hero-img" src="${articleImage(article)}" alt="${article.title}" width="1280" height="720" loading="eager">
      <div class="hero-body">
        <h2>${article.title}</h2>
        <p>${article.description ?? ''}</p>
      </div>
    </a>
  `;
}

function renderFeature(article) {
  const box = $('#feature');
  if (!box || !article) return;
  box.innerHTML = `
    <article class="feature-card">
      <div class="content">
        <h3>${article.title}</h3>
        <p>${article.description ?? ''}</p>
      </div>
      <div class="media">
        <img src="${articleImage(article)}" alt="${article.title}" width="900" height="600" loading="lazy">
      </div>
    </article>
  `;
}

function renderCards(articles) {
  const list = $('#cards');
  if (!list) return;
  list.innerHTML = '';
  articles.forEach((a) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <h4><a href="${a.url}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit">${a.title}</a></h4>
      <p>${a.description ?? ''}</p>
      <img class="thumb" src="${articleImage(a)}" alt="${a.title}" width="800" height="450" loading="lazy">
    `;
    list.appendChild(card);
  });
}

/* ===== FETCH (USA fijo) ===== */
async function fetchTopHeadlinesUSA(category = 'general') {
  const url = new URL('https://newsapi.org/v2/top-headlines');
  url.searchParams.set('country', 'us');     // fijo a USA
  url.searchParams.set('category', category);
  url.searchParams.set('pageSize', '12');
  url.searchParams.set('apiKey', NEWS_API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`News API error: ${res.status}`);
  const data = await res.json();
  return data.articles ?? [];
}

/* ===== LOAD with NTCache ===== */
async function loadFeed() {
  const cacheKey = NEWS_CACHE_KEY(currentCategory);
  const cached = window.NTCache?.read(cacheKey);

  // 1) Cache fresco
  if (cached && !cached.stale && Array.isArray(cached.payload) && cached.payload.length) {
    const articles = cached.payload;
    renderHero(articles[0]);
    renderFeature(articles[1] ?? articles[0]);
    renderCards(articles.slice(2));
    return;
  }

  // 2) Intentar API
  try {
    const articles = await fetchTopHeadlinesUSA(currentCategory);
    if (!articles.length) throw new Error('No articles returned');
    renderHero(articles[0]);
    renderFeature(articles[1] ?? articles[0]);
    renderCards(articles.slice(2));
    window.NTCache?.write(cacheKey, articles, NEWS_TTL);
  } catch (err) {
    console.error(err);
    // 3) Fallback a cache viejo si existe
    if (cached && Array.isArray(cached.payload) && cached.payload.length) {
      const articles = cached.payload;
      renderHero(articles[0]);
      renderFeature(articles[1] ?? articles[0]);
      renderCards(articles.slice(2));
    } else {
      $('#hero').innerHTML = `
        <div class="hero-body">
          <h2>Unable to load headlines</h2>
          <p>Please try again later.</p>
        </div>`;
    }
  }
}

/* ===== Interacciones: categorías del menú ===== */
document.addEventListener('click', (e) => {
  const link = e.target.closest('.nav-links a[data-category]');
  if (!link) return;
  e.preventDefault();
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  link.classList.add('active');
  currentCategory = link.dataset.category || 'general';
  loadFeed();
});

/* ===== Refresh manual opcional ===== */
// Llama a esta función desde un botón si quieres forzar actualización
window.refreshNews = function() {
  const cacheKey = NEWS_CACHE_KEY(currentCategory);
  localStorage.removeItem(cacheKey);
  loadFeed();
};

/* ===== Init ===== */
loadFeed();

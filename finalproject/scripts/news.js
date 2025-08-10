// scripts/news.js (frontend lee JSON estático generado por Actions)

let currentCategory = 'general';
const NEWS_TTL = 24 * 60 * 60 * 1000;
const NEWS_CACHE_KEY = (cat) => `newstime:news-cache:${cat}`;

const $ = (s) => document.querySelector(s);
const articleImage = (a) => a?.urlToImage || 'https://picsum.photos/800/450?blur=2';

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
    </a>`;
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
    </article>`;
}

function renderCards(articles) {
  const list = $('#cards');
  if (!list) return;
  list.innerHTML = '';
  articles.forEach(a => {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <h4><a href="${a.url}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit">${a.title}</a></h4>
      <p>${a.description ?? ''}</p>
      <img class="thumb" src="${articleImage(a)}" alt="${a.title}" width="800" height="450" loading="lazy">`;
    list.appendChild(el);
  });
}

async function loadCachedNews(category = 'general') {
  const cacheKey = NEWS_CACHE_KEY(category);
  const cached = window.NTCache?.read(cacheKey);
  if (cached && !cached.stale && cached.payload?.length) {
    const articles = cached.payload;
    renderHero(articles[0]);
    renderFeature(articles[1] ?? articles[0]);
    renderCards(articles.slice(2));
    return;
  }

  try {
    const res = await fetch(`data/news-cache-${category}.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const articles = data?.articles ?? [];
    if (!articles.length) throw new Error('Empty news list');

    renderHero(articles[0]);
    renderFeature(articles[1] ?? articles[0]);
    renderCards(articles.slice(2));

    window.NTCache?.write(cacheKey, articles, NEWS_TTL);
  } catch (err) {
    console.error(err);
    if (cached?.payload?.length) {
      const articles = cached.payload;
      renderHero(articles[0]);
      renderFeature(articles[1] ?? articles[0]);
      renderCards(articles.slice(2));
    } else {
      $('#hero').innerHTML = `
        <div class="hero-body">
          <h2>Unable to load headlines</h2>
          <p>Please check back later.</p>
        </div>`;
    }
  }
}

// Interacción de categorías
document.addEventListener('click', (e) => {
  const link = e.target.closest('.nav-links a[data-category]');
  if (!link) return;
  e.preventDefault();
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  link.classList.add('active');
  currentCategory = link.dataset.category || 'general';
  loadCachedNews(currentCategory);
});

window.refreshNews = function() {
  localStorage.removeItem(NEWS_CACHE_KEY(currentCategory));
  loadCachedNews(currentCategory);
};

loadCachedNews(currentCategory);

// --- al inicio de scripts/news.js ---
let currentCategory = 'general';

const NEWS_TTL = 24 * 60 * 60 * 1000;
const NEWS_CACHE_KEY = (cat) => `newstime:news-cache:${cat}`;

// Calcula la raíz del proyecto a partir de /finalproject/
const NEWS_ROOT = window.location.pathname.split('/finalproject/')[0] || '';
const NEWS_DATA_BASE = `${window.location.origin}${NEWS_ROOT}/data`; // <— nombre único

const $ = (s) => document.querySelector(s);
const articleImage = (a) => a?.urlToImage || 'https://picsum.photos/800/450?blur=2';

// Devuelve una URL proxificada con ancho deseado y webp
function proxify(url, w) {
  try {
    const u = new URL(url);
    // weserv requiere host sin protocolo en el parámetro 'url'
    const hostPlusPath = u.host + u.pathname + (u.search || '');
    const encoded = encodeURIComponent(hostPlusPath);
    return `https://images.weserv.nl/?url=${encoded}&w=${w}&output=webp`;
  } catch {
    // fallback si la url está mal
    return url;
  }
}

// Crea srcset con varios anchos usando el proxy
function buildSrcSet(url, widths = [400, 700, 1000, 1400]) {
  return widths.map(w => `${proxify(url, w)} ${w}w`).join(', ');
}

// Devuelve el placeholder o la original si no hay url
function rawImage(article) {
  return article?.urlToImage || 'https://picsum.photos/1280/720?blur=2';
}


// Render: Hero (artículo principal)
function renderHero(article) {
  const hero = $('#hero');
  if (!hero || !article) return;
  const imgUrl = rawImage(article);
  hero.innerHTML = `
    <a href="${article.url}" target="_blank" rel="noopener">
      <picture>
        <source type="image/webp"
                srcset="${buildSrcSet(imgUrl, [480, 768, 1024, 1280])}"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px">
        <img class="hero-img"
            src="${proxify(imgUrl, 1024)}"
            alt="${article.title}"
            width="1280" height="720"
            loading="eager" decoding="async"
            style="aspect-ratio:16/9; width:100%; height:auto;">
      </picture>
      <div class="hero-body">
        <h2>${article.title}</h2>
        <p>${article.description ?? ''}</p>
      </div>
    </a>
  `;
}

// Render: Feature (segundo destacado)
function renderFeature(article) {
  const box = $('#feature');
  if (!box || !article) return;
  const imgUrl = rawImage(article);
  box.innerHTML = `
    <article class="feature-card">
      <div class="content">
        <h3>${article.title}</h3>
        <p>${article.description ?? ''}</p>
      </div>
      <div class="media">
        <picture>
          <source type="image/webp"
                  srcset="${buildSrcSet(imgUrl, [480, 700, 900])}"
                  sizes="(max-width: 640px) 100vw, 50vw">
          <img src="${proxify(imgUrl, 900)}"
              alt="${article.title}"
              width="900" height="600"
              loading="lazy" decoding="async"
              style="aspect-ratio:3/2; width:100%; height:auto;">
        </picture>
      </div>
    </article>
  `;
}

// Render: Cards (resto de artículos)
function renderCards(articles) {
  const list = $('#cards');
  if (!list) return;
  list.innerHTML = '';
  articles.forEach((a) => {
    const card = document.createElement('article');
    card.className = 'card';
    const imgUrl = rawImage(a);
    card.innerHTML = `
      <h4><a href="${a.url}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit">${a.title}</a></h4>
      <p>${a.description ?? ''}</p>
      <picture>
        <source type="image/webp"
                srcset="${buildSrcSet(imgUrl, [320, 480, 640])}"
                sizes="(max-width: 640px) 100vw, 320px">
        <img class="thumb"
            src="${proxify(imgUrl, 480)}"
            alt="${a.title}"
            width="640" height="360"
            loading="lazy" decoding="async"
            style="aspect-ratio:16/9; width:100%; height:auto;">
      </picture>
    `;

    list.appendChild(card);
  });
}

// Carga desde JSON estático + cache local
async function loadCachedNews(category) {
  const cacheKey = NEWS_CACHE_KEY(category);
  const cached = window.NTCache?.read(cacheKey);

  // 1) Si hay cache fresco, úsalo
  if (cached && !cached.stale && Array.isArray(cached.payload) && cached.payload.length) {
    const articles = cached.payload;
    renderHero(articles[0]);
    renderFeature(articles[1] ?? articles[0]);
    renderCards(articles.slice(2));
    return;
  }

  // 2) Pide el JSON estático desde /wdd231/data/news-cache-<cat>.json
  try {
    const res = await fetch(`${NEWS_DATA_BASE}/news-cache-${category}.json`, { cache: 'no-store' });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const articles = data?.articles ?? [];
    if (!articles.length) throw new Error('Empty news list');

    renderHero(articles[0]);
    renderFeature(articles[1] ?? articles[0]);
    renderCards(articles.slice(2));

    // Guarda en cache 24h
    window.NTCache?.write(cacheKey, articles, NEWS_TTL);
  } catch (err) {
    console.error(err);
    // 3) Si falló la red pero existe cache viejo, úsalo
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

// Interacción del menú (categorías)
document.addEventListener('click', (e) => {
  const link = e.target.closest('.nav-links a[data-category]');
  if (!link) return;
  e.preventDefault();
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  link.classList.add('active');
  currentCategory = link.dataset.category || 'general';
  loadCachedNews(currentCategory);
});

// Refresh manual opcional (por si pones un botón)
window.refreshNews = function() {
  localStorage.removeItem(NEWS_CACHE_KEY(currentCategory));
  loadCachedNews(currentCategory);
};

// Inicializa
loadCachedNews(currentCategory);

// Base ya existente arriba:
const VIDEOS_ROOT = window.location.pathname.split('/finalproject/')[0] || '';
const VIDEOS_DATA_BASE = `${window.location.origin}${VIDEOS_ROOT}/data`;
const panel = document.getElementById('video-list');
const YT_TTL = 24 * 60 * 60 * 1000;
const YT_CACHE_KEY = 'newstime:yt:daily';

function renderError(msg) {
  if (panel) panel.innerHTML = `<p>${msg}</p>`;
}

function renderVideos(list) {
  if (!panel) return;
  panel.innerHTML = '';
  list.forEach(v => {
    const origin = encodeURIComponent(window.location.origin);
    const card = document.createElement('article');
    card.className = 'video-card';
    card.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${v.id}?origin=${origin}&rel=0&modestbranding=1"
        title="${v.title}"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"></iframe>
      <div class="vc-body">
        <h5>${v.title}</h5>
        <p>${v.channel}</p>
      </div>
    `;
    panel.appendChild(card);
  });
  if (!list.length) renderError('No embeddable videos right now.');
}

// Extrae ID de url tipo youtube.com/watch?v=ID o youtu.be/ID
function extractIdFromUrl(url = '') {
  const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}

// Acepta {id} | {videoId} | {youtubeId} | {url} y normaliza
function normalizeVideo(v = {}) {
  let id = v.id || v.videoId || v.youtubeId || '';
  if (!id && v.url) id = extractIdFromUrl(v.url);
  return {
    id,
    title: v.title || 'Video',
    channel: v.channel || v.source || 'News'
  };
}

async function loadVideos() {
  try {
    if (!panel) return;

    // 1) cache fresco
    const cached = window.NTCache?.read(YT_CACHE_KEY);
    if (cached && !cached.stale && Array.isArray(cached.payload) && cached.payload.length) {
      renderVideos(cached.payload);
      return;
    }

    // 2) pedir JSON estático generado por Actions
    const res = await fetch(`${VIDEOS_DATA_BASE}/videos-cache.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const raw = Array.isArray(data) ? data : (Array.isArray(data.videos) ? data.videos : []);
    if (!raw.length) throw new Error('Empty video list (raw)');

    // Normaliza y filtra válidos
    const list = raw.map(normalizeVideo).filter(v => !!v.id);

    if (!list.length) throw new Error('Empty video list (after normalization)');

    renderVideos(list);
    window.NTCache?.write(YT_CACHE_KEY, list, YT_TTL);

  } catch (err) {
    console.error('Videos load error:', err);
    // fallback a cache viejo si existe
    const stale = window.NTCache?.read(YT_CACHE_KEY);
    if (stale?.payload?.length) {
      renderVideos(stale.payload);
    } else {
      renderError('Unable to load videos. Please check back later.');
    }
  }
}

loadVideos();

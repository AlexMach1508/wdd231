// scripts/videos.js (frontend simple: lee el JSON estático generado)

const panel = document.getElementById('video-list');
const YT_CACHE_KEY = 'newstime:yt:daily';
const YT_TTL = 24 * 60 * 60 * 1000;

function renderError(msg){ if(panel) panel.innerHTML = `<p>${msg}</p>`; }

function renderVideos(list){
  if(!panel) return;
  panel.innerHTML = '';
  list.forEach(v => {
    const card = document.createElement('article');
    card.className = 'video-card';
    card.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${v.id}"
        title="${v.title}"
        loading="lazy"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"></iframe>
      <div class="vc-body">
        <h5>${v.title}</h5>
        <p>${v.channel}</p>
      </div>
    `;
    panel.appendChild(card);
  });
}

async function loadVideos(){
  try{
    // 1) cache fresco
    const cached = window.NTCache?.read(YT_CACHE_KEY);
    if(cached && !cached.stale && cached.payload?.length){
      renderVideos(cached.payload);
      return;
    }

    // 2) pedir el JSON estático del repo
    const res = await fetch('data/videos-cache.json', { cache: 'no-store' });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const list = data?.videos ?? [];
    if(!list.length) throw new Error('Empty list');

    renderVideos(list);
    window.NTCache?.write(YT_CACHE_KEY, list, YT_TTL);
  }catch(err){
    console.error(err);
    renderError('Unable to load videos. Try again later.');
  }
}

loadVideos();

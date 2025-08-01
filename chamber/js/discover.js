const container = document.getElementById('places-container');
const visitMessage = document.getElementById('visit-message');

// Cargar lugares
async function loadPlaces() {
  const res = await fetch('data/places.json');
  const { places } = await res.json();
  displayPlaces(places);
}

function displayPlaces(places) {
  container.innerHTML = '';
  places.forEach(place => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <h2>${place.name}</h2>
      <figure>
        <img src="../chamber/images/${place.image}" alt="${place.name}" width="300" height="200" />
      </figure>
      <address>${place.address}</address>
      <p>${place.description}</p>
      <button>Learn More</button>
    `;
    container.appendChild(card);
  });
}

// Mensaje de visitas con localStorage
function checkVisit() {
  const lastVisit = localStorage.getItem('lastVisit');
  const now = Date.now();

  if (!lastVisit) {
    visitMessage.textContent = "Welcome! Let us know if you have any questions.";
  } else {
    const days = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));
    if (days < 1) {
      visitMessage.textContent = "Back so soon! Awesome!";
    } else if (days === 1) {
      visitMessage.textContent = "You last visited 1 day ago.";
    } else {
      visitMessage.textContent = `You last visited ${days} days ago.`;
    }
  }
  localStorage.setItem('lastVisit', now);
}

loadPlaces();
checkVisit();

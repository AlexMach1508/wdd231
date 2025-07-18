async function getSpotlights() {
  const res = await fetch('data/members.json');
  const { members } = await res.json();
  const eligible = members.filter(m => m.membership === 'Gold' || m.membership === 'Silver');
  const random = eligible.sort(() => 0.5 - Math.random()).slice(0, 3);

  const container = document.getElementById('spotlight-container');
  if (!container) return;

  container.innerHTML = '';

  random.forEach(member => {
    const card = document.createElement('div');
    card.className = 'spotlight-card';
    card.innerHTML = `
      <img src="../chamber/images/${member.image}" alt="${member.name} logo" width="100" height="100" />
      <h3>${member.name}</h3>
      <p>${member.address}</p>
      <p>${member.phone}</p>
      <a href="${member.website}" target="_blank">Visit Website</a>
      <p><strong>${member.membership} Member</strong></p>
    `;
    container.appendChild(card);
  });
}

getSpotlights();

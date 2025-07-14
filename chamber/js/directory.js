const container = document.getElementById('members');
const gridBtn = document.getElementById('grid-view');
const listBtn = document.getElementById('list-view');

async function getMembers(view = 'grid') {
  try {
    const res = await fetch('data/members.json');
    const { members } = await res.json();
    displayMembers(members, view);
  } catch (err) {
    console.error("Error loading members:", err);
  }
}

function displayMembers(members, view) {
  container.innerHTML = '';
  container.className = view + '-view';

  members.forEach(member => {
    const card = document.createElement('div');
    card.classList.add('member-card');
    
    if (view === 'list') {
      card.classList.add('list');
      card.innerHTML = `
        <div><strong>${member.name}</strong></div>
        <div>${member.address}</div>
        <div>${member.phone}</div>
        <div><a href="${member.website}" target="_blank">${member.website}</a></div>
      `;
    } else {
      card.innerHTML = `
        <img src="../chamber/images/${member.image}" alt="${member.name} logo" width="80" height="80" loading="lazy" />
        <h2>${member.name}</h2>
        <p>${member.address}</p>
        <p>${member.phone}</p>
        <a href="${member.website}" target="_blank">Visit Website</a>
        <p class="level level-${member.membership.toLowerCase()}">Level ${member.membership}</p>
      `;
    }

    container.appendChild(card);
  });
}

gridBtn.addEventListener('click', () => {
  gridBtn.classList.add('active');
  listBtn.classList.remove('active');
  getMembers('grid');
});

listBtn.addEventListener('click', () => {
  listBtn.classList.add('active');
  gridBtn.classList.remove('active');
  getMembers('list');
});

getMembers();


gridBtn.addEventListener('click', () => {
  gridBtn.classList.add('active');
  listBtn.classList.remove('active');
  getMembersAndRender('grid');
});

listBtn.addEventListener('click', () => {
  listBtn.classList.add('active');
  gridBtn.classList.remove('active');
  getMembersAndRender('list');
});

function getMembersAndRender(view) {
  fetch('data/members.json')
    .then(res => res.json())
    .then(data => displayMembers(data.members, view));
}

getMembers();

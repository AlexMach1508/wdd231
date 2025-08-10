document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('menu');
  const links = document.getElementById('nav-links');

  btn?.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? '✖' : '☰';
  });
});

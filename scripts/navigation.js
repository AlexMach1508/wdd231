document.addEventListener('DOMContentLoaded', function () {
  const menuButton = document.getElementById('menu');
  const navLinks = document.getElementById('nav-links');

  menuButton.addEventListener('click', () => {
    navLinks.classList.toggle('open');

    // Cambiar el ícono del botón ☰ ↔ ✖
    if (navLinks.classList.contains('open')) {
      menuButton.textContent = '✖';
    } else {
      menuButton.textContent = '☰';
    }
  });
});

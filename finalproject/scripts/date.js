document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('currentyear');
  const lm = document.getElementById('lastModified');
  if (y) y.textContent = new Date().getFullYear();
  if (lm) lm.textContent = `Last Modified: ${document.lastModified}`;
});

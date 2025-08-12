// modal.js (ES module)
const backdrop = document.getElementById('modal-backdrop');
const dialog = document.getElementById('news-modal');
const closes = document.querySelectorAll('[data-close-modal]');

export function openModal(title, html) {
  document.getElementById('modal-title').textContent = title || 'Details';
  document.getElementById('modal-body').innerHTML = html || '';
  backdrop.style.display = 'block';
  dialog.showModal();
}

export function closeModal() {
  dialog.close();
  backdrop.style.display = 'none';
}

closes.forEach(btn => btn.addEventListener('click', closeModal));
backdrop?.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && dialog?.open) closeModal();
});

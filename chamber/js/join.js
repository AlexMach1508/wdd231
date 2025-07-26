document.addEventListener("DOMContentLoaded", () => {
  // Agregar timestamp actual
  document.getElementById("timestamp").value = new Date().toISOString();

  // Abrir modales
  document.querySelectorAll("[data-modal]").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const modal = document.getElementById(link.dataset.modal);
      modal.style.display = "block";
    });
  });

  // Cerrar modales
  document.querySelectorAll(".close").forEach(closeBtn => {
    closeBtn.addEventListener("click", () => {
      const modal = document.getElementById(closeBtn.dataset.close);
      modal.style.display = "none";
    });
  });

  // Cerrar al hacer clic fuera
  window.addEventListener("click", e => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none";
    }
  });
});

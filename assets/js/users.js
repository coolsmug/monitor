document.addEventListener("DOMContentLoaded", function() {
  const modal = document.querySelector(".modal");
  const overlay = document.querySelector(".overlay");
  const openModalBtn = document.querySelector(".btn-open");
  const closeModalBtn = document.querySelector(".btn-close");

  const openModal = function () {
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
  };

  openModalBtn.addEventListener("click", openModal);

  const closeModal = function () {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
  };

  closeModalBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  const modals = document.querySelector(".modals");
  const overlays = document.querySelector(".overlays");
  const openModalBtns = document.querySelectorAll(".btn-opens");
  const closeModalBtns = document.querySelectorAll(".btn-closes");

  const openModals = function () {
    modals.classList.remove("hiddens");
    overlays.classList.remove("hiddens");
  };

  openModalBtns.forEach(btn => btn.addEventListener("click", openModals));

  const closeModals = function () {
    modals.classList.add("hiddens");
    overlays.classList.add("hiddens");
  };

  closeModalBtns.forEach(btn => btn.addEventListener("click", closeModals));
  overlays.addEventListener("click", closeModals);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modals.classList.contains("hiddens")) {
      closeModals();
    }
  });
});

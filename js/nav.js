(function () {
  const buttons = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".chapter");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;

      buttons.forEach((b) => b.classList.toggle("active", b === btn));
      sections.forEach((s) => s.classList.toggle("active", s.id === target));

      window.dispatchEvent(new CustomEvent("chapter-shown", { detail: target }));
    });
  });
})();

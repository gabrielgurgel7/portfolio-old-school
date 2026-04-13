// ANIMAÇÃO DO OVERFLOW MENU
const overflowMenu = document.getElementById("overflow-menu");
const ellipsisBtn = document.getElementById("ellipsis-menu-btn");
const menuItems = overflowMenu.querySelectorAll("li:not(.hidden)");

// Estado inicial — menu fechado
gsap.set(menuItems, { opacity: 0, y: -16, display: "none" });

let isOpen = false;

ellipsisBtn.addEventListener("click", () => {
  if (!isOpen) {
    // ABRIR
    gsap.set(menuItems, { display: "flex" });
    gsap.to(overflowMenu, { paddingTop: 48, paddingBottom: 8, duration: 0.1 });
    gsap.to(menuItems, {
      opacity: 1,
      y: 0,
      duration: 0.3,
      ease: "power2.out",
      stagger: 0.06,
    });
  } else {
    // FECHAR
    gsap.to(overflowMenu, { paddingTop: 0, paddingBottom: 0, duration: 0.1 });
    gsap.to(menuItems, {
      opacity: 0,
      y: -16,
      duration: 0.2,
      ease: "power2.in",
      stagger: 0.04,
      onComplete: () =>
        gsap.set(menuItems, { display: "none", border: "none" }),
    });
  }

  isOpen = !isOpen;
});

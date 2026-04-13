const overflowMenu = document.getElementById("overflow-menu");
const ellipsisBtn = document.getElementById("ellipsis-menu-btn");
const menuItems = overflowMenu.querySelectorAll("li:not(.hidden)");

// 🔒 Estado inicial (menu escondido)
gsap.set(overflowMenu, {
  opacity: 0,
  scale: 0.95,
  y: -8,
  transformOrigin: "top right",
  pointerEvents: "none",
});

gsap.set(menuItems, {
  opacity: 0,
  y: -10,
});

let isOpen = false;

ellipsisBtn.addEventListener("click", () => {
  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
  });

  if (!isOpen) {
    // 🟢 ABRIR
    tl.to(overflowMenu, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.25,
      pointerEvents: "auto",
    }).to(
      menuItems,
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        stagger: 0.08,
      },
      "-=0.15",
    );
  } else {
    // 🔴 FECHAR
    tl.to(menuItems, {
      opacity: 0,
      y: -10,
      duration: 0.25,
      ease: "power2.in",
      stagger: 0.05,
    }).to(
      overflowMenu,
      {
        opacity: 0,
        scale: 0.95,
        y: -8,
        duration: 0.2,
        pointerEvents: "none",
      },
      "-=0.1",
    );
  }

  isOpen = !isOpen;
});

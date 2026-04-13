const overflowMenu = document.getElementById("overflow-menu");
const ellipsisBtn = document.getElementById("ellipsis-menu-btn");
const menuItems = overflowMenu.querySelectorAll("li:not(.hidden)");

gsap.set(overflowMenu, {
  opacity: 0,
  scale: 0.96,
  transformOrigin: "top right",
  backdropFilter: "blur(0px)",
});

gsap.set(menuItems, {
  opacity: 0,
  y: -10,
  display: "none",
});

let isOpen = false;

ellipsisBtn.addEventListener("click", () => {
  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
  });

  if (!isOpen) {
    // ABRIR
    gsap.set(menuItems, { display: "flex" });

    tl.to(overflowMenu, {
      opacity: 1,
      scale: 1,
      backdropFilter: "blur(16px)",
      paddingTop: 48,
      paddingBottom: 12,
      duration: 0.35,
    }).to(
      menuItems,
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.08,
        pointerEvents: "auto",
      },
      "-=0.2",
    );
  } else {
    // FECHAR
    tl.to(menuItems, {
      opacity: 0,
      y: -10,
      duration: 0.25,
      ease: "power2.in",
      stagger: 0.05,
      pointerEvents: "none",
    })
      .to(
        overflowMenu,
        {
          opacity: 0,
          scale: 0.96,
          backdropFilter: "blur(0px)",
          paddingTop: 0,
          paddingBottom: 0,
          duration: 0.25,
        },
        "-=0.15",
      )
      .set(menuItems, { display: "none" });
  }

  isOpen = !isOpen;
});

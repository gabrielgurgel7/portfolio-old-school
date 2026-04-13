const overflowMenu = document.getElementById("overflow-menu");
const ellipsisBtn = document.getElementById("ellipsis-menu-btn");
const menuWrapper = document.getElementById("overflow-menu-wrapper");
const menuItems = overflowMenu.querySelectorAll("li:not(.hidden)");

// ─── DRAGGABLE ───────────────────────────────────────────────
gsap.registerPlugin(Draggable);

const STORAGE_KEY = "floatingMenuPos";

const savedPos = JSON.parse(localStorage.getItem(STORAGE_KEY));
if (savedPos) {
  gsap.set(menuWrapper, { x: savedPos.x, y: savedPos.y });
}

let isDragging = false;

Draggable.create(menuWrapper, {
  type: "x,y",
  edgeResistance: 0.65,
  bounds: window,
  inertia: true,

  onDragStart() {
    isDragging = false;
  },

  onDrag() {
    isDragging = true;
  },

  onDragEnd() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: this.x, y: this.y }));

    setTimeout(() => {
      isDragging = false;
    }, 0);
  },
});

// ─── MENU ABRIR/FECHAR ────────────────────────────────────────
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
  if (isDragging) return;

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
  });

  if (!isOpen) {
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

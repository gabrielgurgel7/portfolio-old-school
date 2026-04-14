const overflowMenu = document.getElementById("overflow-menu");
const ellipsisBtn = document.getElementById("ellipsis-menu-btn");
const menuWrapper = document.getElementById("overflow-menu-wrapper");
const menuItems = overflowMenu.querySelectorAll("li:not(.hidden)");
const ghost = document.getElementById("menu-ghost");

gsap.registerPlugin(Draggable);

const STORAGE_KEY = "floatingMenuPos";

let isDragging = false;
let startX = 0;
let startY = 0;

// ─── HELPERS ───────────────────────────────────────────────
const getDistance = (x1, y1, x2, y2) => {
  return Math.hypot(x2 - x1, y2 - y1);
};

// 🧲 SNAP (FONTE DA VERDADE)
const snapToGhost = (animate = false) => {
  const ghostRect = ghost.getBoundingClientRect();
  const wrapperRect = menuWrapper.getBoundingClientRect();
  const buttonRect = ellipsisBtn.getBoundingClientRect();

  const offsetX = buttonRect.left - wrapperRect.left;
  const offsetY = buttonRect.top - wrapperRect.top;

  const baseX =
    ghostRect.left -
    wrapperRect.left -
    offsetX +
    gsap.getProperty(menuWrapper, "x");

  const baseY =
    ghostRect.top -
    wrapperRect.top -
    offsetY +
    gsap.getProperty(menuWrapper, "y");

  const FINE_TUNE_X = 2;
  const FINE_TUNE_Y = 2;

  const finalX = baseX + FINE_TUNE_X;
  const finalY = baseY + FINE_TUNE_Y;

  if (animate) {
    gsap.to(menuWrapper, {
      x: finalX,
      y: finalY,
      duration: 0.5,
      ease: "elastic.out(1, 0.6)",
    });
  } else {
    gsap.set(menuWrapper, {
      x: finalX,
      y: finalY,
    });
  }

  return { x: finalX, y: finalY };
};

// ─── RESTORE (CORRETO) ─────────────────────────────────────
window.addEventListener("load", () => {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (!saved) return;

  if (saved.snapped) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        snapToGhost(false);
      });
    });
  } else {
    gsap.set(menuWrapper, { x: saved.x, y: saved.y });
  }
});

// ─── DRAG ──────────────────────────────────────────────────
Draggable.create(menuWrapper, {
  type: "x,y",
  edgeResistance: 0.65,
  bounds: window,
  inertia: true,

  onDragStart() {
    startX = this.x;
    startY = this.y;
    isDragging = false;
  },

  onDrag() {
    const moved = Math.hypot(this.x - startX, this.y - startY);

    if (moved > 5) {
      isDragging = true;
    }

    const ghostRect = ghost.getBoundingClientRect();
    const buttonRect = ellipsisBtn.getBoundingClientRect();

    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;

    const ghostCenterX = ghostRect.left + ghostRect.width / 2;
    const ghostCenterY = ghostRect.top + ghostRect.height / 2;

    const distance = getDistance(
      buttonCenterX,
      buttonCenterY,
      ghostCenterX,
      ghostCenterY,
    );

    // 👁️ GHOST VISUAL
    const ACTIVATION_RADIUS = 140;
    ghost.classList.toggle("active", distance < ACTIVATION_RADIUS);

    // 🧲 MAGNETISMO (ALINHADO COM SNAP)
    const MAGNET_RADIUS = 120;

    if (distance < MAGNET_RADIUS) {
      const strength = (MAGNET_RADIUS - distance) / MAGNET_RADIUS;

      const target = snapToGhost(false); // 👈 usa mesma lógica

      const pullX = (target.x - this.x) * strength * 0.3;
      const pullY = (target.y - this.y) * strength * 0.3;

      gsap.set(menuWrapper, {
        x: this.x + pullX,
        y: this.y + pullY,
      });
    }
  },

  onDragEnd() {
    const ghostRect = ghost.getBoundingClientRect();
    const buttonRect = ellipsisBtn.getBoundingClientRect();

    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;

    const ghostCenterX = ghostRect.left + ghostRect.width / 2;
    const ghostCenterY = ghostRect.top + ghostRect.height / 2;

    const distance = getDistance(
      buttonCenterX,
      buttonCenterY,
      ghostCenterX,
      ghostCenterY,
    );

    const SNAP_RADIUS = 100;
    const isSnapped = distance < SNAP_RADIUS;

    if (isSnapped) {
      const final = snapToGhost(true);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          snapped: true,
        }),
      );
    } else {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          x: this.x,
          y: this.y,
          snapped: false,
        }),
      );
    }

    ghost.classList.remove("active");

    setTimeout(() => {
      isDragging = false;
    }, 0);
  },
});

// ─── MENU ───────────────────────────────────────────────────
gsap.set(overflowMenu, {
  opacity: 0,
  scale: 0.95,
  y: -8,
  transformOrigin: "top right",
  display: "none",
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
    tl.set(overflowMenu, { display: "flex" })
      .to(overflowMenu, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.25,
      })
      .to(
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
      stagger: 0.05,
    })
      .to(overflowMenu, {
        opacity: 0,
        scale: 0.95,
        y: -8,
        duration: 0.2,
      })
      .set(overflowMenu, { display: "none" });
  }

  isOpen = !isOpen;
});

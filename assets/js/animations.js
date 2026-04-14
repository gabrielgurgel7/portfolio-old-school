const overflowMenu = document.getElementById("overflow-menu");
const ellipsisBtn = document.getElementById("ellipsis-menu-btn");
const menuWrapper = document.getElementById("overflow-menu-wrapper");
const menuItems = overflowMenu.querySelectorAll("li:not(.hidden)");
const ghost = document.getElementById("menu-ghost");

// ─── DRAGGABLE ───────────────────────────────────────────────
gsap.registerPlugin(Draggable);

const STORAGE_KEY = "floatingMenuPos";

let isDragging = false;
let startX = 0;
let startY = 0;

// ─── FUNÇÕES AUXILIARES ───────────────────────────────────────
const getDistance = (x1, y1, x2, y2) => {
  return Math.hypot(x2 - x1, y2 - y1);
};

const snapToGhost = (animate = false) => {
  const ghostRect = ghost.getBoundingClientRect();
  const wrapperRect = menuWrapper.getBoundingClientRect();
  const buttonRect = ellipsisBtn.getBoundingClientRect();

  // 🧠 offset interno (ESSENCIAL)
  const offsetX = buttonRect.left - wrapperRect.left;
  const offsetY = buttonRect.top - wrapperRect.top;

  const targetX =
    ghostRect.left -
    wrapperRect.left -
    offsetX +
    gsap.getProperty(menuWrapper, "x");

  const targetY =
    ghostRect.top -
    wrapperRect.top -
    offsetY +
    gsap.getProperty(menuWrapper, "y");

  // 🧪 AJUSTE FINO (coloca AQUI)
  const FINE_TUNE_X = 2;
  const FINE_TUNE_Y = 2;

  if (animate) {
    gsap.to(menuWrapper, {
      x: targetX + FINE_TUNE_X,
      y: targetY + FINE_TUNE_Y,
      duration: 0.5,
      ease: "elastic.out(1, 0.6)",
    });
  } else {
    gsap.set(menuWrapper, {
      x: targetX + FINE_TUNE_X,
      y: targetY + FINE_TUNE_Y,
    });
  }
};

// ─── RESTORE POSIÇÃO ─────────────────────────────────────────
const savedPos = JSON.parse(localStorage.getItem(STORAGE_KEY));

if (savedPos) {
  if (savedPos.snapped) {
    // espera layout estabilizar
    setTimeout(() => snapToGhost(false), 50);
  } else {
    gsap.set(menuWrapper, { x: savedPos.x, y: savedPos.y });
  }
}

// ─── DRAG ────────────────────────────────────────────────────
Draggable.create(menuWrapper, {
  type: "x,y",
  edgeResistance: 0.65,
  bounds: window,
  inertia: true,

  onDrag() {
    const moved = Math.hypot(this.x - startX, this.y - startY);

    if (moved > 5) {
      isDragging = true;
    }

    // 📦 posições
    const ghostRect = ghost.getBoundingClientRect();
    const buttonRect = ellipsisBtn.getBoundingClientRect();

    // 🎯 centros
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

    // ─── 👁️ ATIVAÇÃO VISUAL DO GHOST ───────────────────────────
    const ACTIVATION_RADIUS = 140;

    if (distance < ACTIVATION_RADIUS) {
      ghost.classList.add("active");
    } else {
      ghost.classList.remove("active");
    }

    // ─── 🧲 MAGNETISMO ─────────────────────────────────────────
    const MAGNET_RADIUS = 120;

    if (distance < MAGNET_RADIUS) {
      const strength = (MAGNET_RADIUS - distance) / MAGNET_RADIUS;

      const pullX = (ghostCenterX - buttonCenterX) * strength * 0.2;
      const pullY = (ghostCenterY - buttonCenterY) * strength * 0.2;

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

    const deltaX = ghostCenterX - buttonCenterX;
    const deltaY = ghostCenterY - buttonCenterY;

    const isSnapped = distance < SNAP_RADIUS;

    if (isSnapped) {
      snapToGhost(true);

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

    setTimeout(() => {
      isDragging = false;
    }, 0);

    ghost.classList.remove("active");
  },
});

// ─── MENU ABRIR/FECHAR ───────────────────────────────────────
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

window.addEventListener("resize", () => {
  const savedPos = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (savedPos?.snapped) {
    snapToGhost(false);
  }
});

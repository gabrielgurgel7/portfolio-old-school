const overflowMenu = document.getElementById("overflow-menu");
const ellipsisBtn = document.getElementById("ellipsis-menu-btn");
const menuWrapper = document.getElementById("overflow-menu-wrapper");
const menuItems = overflowMenu.querySelectorAll("li:not(.hidden)");
const ghost = document.getElementById("menu-ghost");

gsap.registerPlugin(Draggable);

const STORAGE_KEY = "floatingMenuPos";
const SNAP_RADIUS = 100;
const MAGNET_RADIUS = 120;
const ACTIVATION_RADIUS = 140;
const MIN_DRAG_PX = 8;
const MIN_DRAG_MS = 120;

// ─── ESTADO ────────────────────────────────────────────────
let isDragging = false;
let dragLocked = false;
let isSnapped = true;
let startX = 0;
let startY = 0;
let startTime = 0;
let startTouchY = 0;

// ─── HELPERS ───────────────────────────────────────────────
const getDistance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

const calcSnapTarget = () => {
  const ghostRect = ghost.getBoundingClientRect();
  const buttonRect = ellipsisBtn.getBoundingClientRect();

  // Centro do ghost na viewport
  const ghostCX = ghostRect.left + ghostRect.width / 2;
  const ghostCY = ghostRect.top + ghostRect.height / 2;

  // Centro do botão na viewport (posição atual)
  const buttonCX = buttonRect.left + buttonRect.width / 2;
  const buttonCY = buttonRect.top + buttonRect.height / 2;

  // Novo transform = transform atual + delta necessário para alinhar centros
  return {
    x: gsap.getProperty(menuWrapper, "x") + (ghostCX - buttonCX),
    y: gsap.getProperty(menuWrapper, "y") + (ghostCY - buttonCY),
  };
};

const snapToGhost = (animate = false) => {
  const { x, y } = calcSnapTarget();
  if (animate) {
    gsap.to(menuWrapper, { x, y, duration: 0.5, ease: "elastic.out(1, 0.6)" });
  } else {
    gsap.set(menuWrapper, { x, y });
  }
  isSnapped = true;
  return { x, y };
};

// ─── POSIÇÃO INICIAL ────────────────────────────────────────
window.addEventListener("load", () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  const saved = raw ? JSON.parse(raw) : null;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (saved && !saved.snapped) {
        gsap.set(menuWrapper, { x: saved.x, y: saved.y });
        isSnapped = false;
      } else {
        snapToGhost(false);
      }
      Draggable.get(menuWrapper)?.update();
    });
  });
});

// ─── RESIZE — re-encaixa se estava snapped ─────────────────
window.addEventListener("resize", () => {
  if (isSnapped) {
    snapToGhost(false);
    Draggable.get(menuWrapper)?.update();
  }
});

// ─── DRAG ──────────────────────────────────────────────────
Draggable.create(menuWrapper, {
  type: "x,y",
  edgeResistance: 0.65,
  bounds: window,
  inertia: true,
  minimumMovement: MIN_DRAG_PX,

  onPress() {
    startX = this.x;
    startY = this.y;
    startTime = Date.now();
    isDragging = false;
    dragLocked = false;

    const touch = this.pointerEvent?.touches?.[0];
    startTouchY = touch ? touch.clientY : 0;
  },

  onDragStart() {
    // Cancela se o movimento for predominantemente vertical (intenção de scroll)
    const touch = this.pointerEvent?.touches?.[0];
    if (touch) {
      const deltaY = Math.abs(touch.clientY - startTouchY);
      const deltaX = Math.abs(this.x - startX);
      if (deltaY > deltaX * 1.5 && deltaY > 10) {
        this.endDrag();
        return;
      }
    }
    isDragging = true;
  },

  onDrag() {
    const moved = Math.hypot(this.x - startX, this.y - startY);
    const elapsed = Date.now() - startTime;

    if (moved > MIN_DRAG_PX && elapsed > MIN_DRAG_MS) {
      dragLocked = true;
    }

    if (!dragLocked) return;

    const buttonRect = ellipsisBtn.getBoundingClientRect();
    const ghostRect = ghost.getBoundingClientRect();
    const buttonCX = buttonRect.left + buttonRect.width / 2;
    const buttonCY = buttonRect.top + buttonRect.height / 2;
    const ghostCX = ghostRect.left + ghostRect.width / 2;
    const ghostCY = ghostRect.top + ghostRect.height / 2;
    const distance = getDistance(buttonCX, buttonCY, ghostCX, ghostCY);

    ghost.classList.toggle("active", distance < ACTIVATION_RADIUS);

    if (distance < MAGNET_RADIUS) {
      const strength = (MAGNET_RADIUS - distance) / MAGNET_RADIUS;
      const target = calcSnapTarget();
      gsap.set(menuWrapper, {
        x: this.x + (target.x - this.x) * strength * 0.3,
        y: this.y + (target.y - this.y) * strength * 0.3,
      });
    }
  },

  onDragEnd() {
    if (!dragLocked) {
      isDragging = false;
      return;
    }

    const buttonRect = ellipsisBtn.getBoundingClientRect();
    const ghostRect = ghost.getBoundingClientRect();
    const buttonCX = buttonRect.left + buttonRect.width / 2;
    const buttonCY = buttonRect.top + buttonRect.height / 2;
    const ghostCX = ghostRect.left + ghostRect.width / 2;
    const ghostCY = ghostRect.top + ghostRect.height / 2;
    const distance = getDistance(buttonCX, buttonCY, ghostCX, ghostCY);

    if (distance < SNAP_RADIUS) {
      snapToGhost(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ snapped: true }));
    } else {
      isSnapped = false;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ snapped: false, x: this.x, y: this.y }),
      );
    }

    ghost.classList.remove("active");

    setTimeout(() => {
      isDragging = false;
      dragLocked = false;
    }, 0);
  },
});

// ─── MENU ABRIR / FECHAR ────────────────────────────────────
gsap.set(overflowMenu, {
  opacity: 0,
  scale: 0.95,
  y: -8,
  transformOrigin: "top right",
  display: "none",
});

gsap.set(menuItems, { opacity: 0, y: -10 });

let isOpen = false;

ellipsisBtn.addEventListener("click", () => {
  if (isDragging || dragLocked) return;

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  if (!isOpen) {
    tl.set(overflowMenu, { display: "flex" })
      .to(overflowMenu, { opacity: 1, scale: 1, y: 0, duration: 0.25 })
      .to(
        menuItems,
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.08 },
        "-=0.15",
      );
  } else {
    tl.to(menuItems, { opacity: 0, y: -10, duration: 0.25, stagger: 0.05 })
      .to(overflowMenu, { opacity: 0, scale: 0.95, y: -8, duration: 0.2 })
      .set(overflowMenu, { display: "none" });
  }

  isOpen = !isOpen;
});

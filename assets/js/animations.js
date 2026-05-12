/* SCROLL SUAVE */
gsap.registerPlugin(ScrollTrigger);

// ─── PRELOADER ────────────────────────────────────
const tl = gsap.timeline({
  onComplete() {
    gsap.to("#preloader", {
      opacity: 0,
      onComplete() {
        gsap.to("#preloader", {
          display: "none",
        });
      },
    });
  },
});

tl.to("#preloader path", {
  duration: 2,
  strokeDashoffset: 0,
});

tl.to(
  "#preloader-text",
  {
    display: "block",
    opacity: 1,
    duration: 1,
  },
  "+= 0.3",
);

tl.to("#preloader path", {
  fill: "#1e91e1",
  duration: 1,
  strokeDashoffset: 0,
});

/* CURSOR GRADIENT */
const gradient = document.getElementById("cursor-gradient");

document.addEventListener("mousemove", (e) => {
  gradient.style.left = e.clientX + "px";
  gradient.style.top = e.clientY + "px";
});

/* ANIMAÇÃO MACINTOSH */
const canvas = document.querySelector("#hero-canvas");
const ctx = canvas.getContext("2d");
const TOTAL = 192;
const frames = [];

function framePath(i) {
  return `assets/frames/macintosh${i + 1}.png`;
}

function preloadFrames() {
  return Promise.all(
    Array.from({ length: TOTAL }, (_, i) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = framePath(i);
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        frames[i] = img;
      });
    }),
  );
}

function renderFrame(index) {
  const img = frames[index];
  if (!img) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
}

async function init() {
  await preloadFrames();

  const first = frames.find((f) => f !== null);
  if (first) {
    canvas.width = first.naturalWidth;
    canvas.height = first.naturalHeight;
  }

  const state = { frame: TOTAL - 1 };

  gsap.to(state, {
    frame: 0,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      trigger: "#about-me",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
    },
    onUpdate: () => renderFrame(Math.round(state.frame)),
  });

  gsap.to("#post-it", {
    y: 600,
    x: 40,
    rotation: 25,
    opacity: 0,
    ease: "power2.in",
    scrollTrigger: {
      trigger: "#about-me",
      start: "top top", // começa quando 1/3 da seção já passou
      end: "top+=300px top", // termina antes da metade
      scrub: 0.8,
    },
  });
}

init();

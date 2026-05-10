/* SCROLL SUAVE */
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

let smoother;

let mm = gsap.matchMedia();

mm.add("(min-width: 1024px)", () => {
  smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 2,
    effects: true,
    normalizeScroll: true,
  });
});

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
  return `assets/frames/img${i + 1}.png`;
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

  renderFrame(0);

  const state = { frame: 0 };

  gsap.to(state, {
    frame: TOTAL - 1,
    snap: "frame", // garante sempre número inteiro
    ease: "none", // progresso linear com o scroll
    scrollTrigger: {
      trigger: "#about-me",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5, // suavização leve (0 = instantâneo, 2 = mais lento)
    },
    onUpdate: () => renderFrame(Math.round(state.frame)),
  });
}

init();

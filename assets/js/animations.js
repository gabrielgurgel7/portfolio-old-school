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

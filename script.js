/*
  Versión final — experiencia vertical premium.
  Una imagen a la vez. El usuario decide cuándo avanzar.
*/

const CONFIG = {
  facebook: "https://www.facebook.com/share/1bkfygafYA/?mibextid=wwXIfr",
  instagram: "https://www.instagram.com/amistadcristianaponiente?stkn=MWl4OHZxZ3QzMHY3aw==",
  googleReview: "https://www.google.com/maps/place//data=!4m3!3m2!1s0x8f5675868718607f:0x15cf13f0f951dfcd!12e1"
};

const welcome = document.getElementById("welcome");
const startButton = document.getElementById("startButton");
const story = document.getElementById("story");
const slidesWrap = document.getElementById("slides");
const slides = [...document.querySelectorAll(".slide")];
const progress = document.getElementById("progress");
const soundButton = document.getElementById("soundButton");
const music = document.getElementById("music");
const ending = document.getElementById("ending");
const instagramLink = document.getElementById("instagramLink");
const facebookLink = document.getElementById("facebookLink");
const reviewLink = document.getElementById("reviewLink");

facebookLink.href = CONFIG.facebook;
instagramLink.href = CONFIG.instagram;
reviewLink.href = CONFIG.googleReview;

let started = false;
let current = 0;
let touchStartY = null;
let touchStartX = null;
let wheelLocked = false;
let transitionTimer = null;

function buildProgress() {
  progress.innerHTML = "";
  slides.forEach((slide, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Ir a la imagen ${index + 1}`);
    button.addEventListener("click", () => goTo(index));
    progress.appendChild(button);
  });
}

function updateProgress() {
  [...progress.children].forEach((button, index) => {
    const active = index === current;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function renderSlide(index, direction = 1) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, i) => {
    slide.classList.toggle("is-active", i === current);
    slide.classList.toggle("is-before", i < current);
    slide.classList.toggle("is-after", i > current);
    slide.setAttribute("aria-hidden", i === current ? "false" : "true");
  });
  slidesWrap.style.setProperty("--direction", direction);
  updateProgress();
}

function goTo(index, direction = index >= current ? 1 : -1) {
  if (!started || index === current) return;
  renderSlide(index, direction);
}

function next() {
  if (!started || wheelLocked) return;
  if (current < slides.length - 1) {
    goTo(current + 1, 1);
    lockInput();
  } else {
    showEnding();
  }
}

function previous() {
  if (!started || wheelLocked) return;
  if (current > 0) {
    goTo(current - 1, -1);
    lockInput();
  }
}

function lockInput() {
  wheelLocked = true;
  clearTimeout(transitionTimer);
  transitionTimer = setTimeout(() => { wheelLocked = false; }, 850);
}

function showEnding() {
  if (!started || wheelLocked) return;
  wheelLocked = true;
  ending.classList.add("is-ready");
  setTimeout(() => {
    ending.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => { wheelLocked = false; }, 900);
  }, 80);
}

function startExperience() {
  if (started) return;
  started = true;
  music.volume = 0.72;
  music.play().catch(() => {});
  welcome.classList.add("is-hidden");
  story.classList.add("is-visible");
  story.setAttribute("aria-hidden", "false");
  document.body.classList.add("experience-started");
  renderSlide(0, 1);
  window.scrollTo(0, 0);
}

startButton.addEventListener("click", startExperience);

soundButton.addEventListener("click", () => {
  if (music.paused) {
    music.play().catch(() => {});
    soundButton.classList.remove("is-muted");
    soundButton.setAttribute("aria-label", "Silenciar música");
  } else {
    music.pause();
    soundButton.classList.add("is-muted");
    soundButton.setAttribute("aria-label", "Activar música");
  }
});

// En móvil: un gesto vertical completo cambia exactamente una imagen.
slidesWrap.addEventListener("touchstart", (event) => {
  if (!started) return;
  const touch = event.changedTouches[0];
  touchStartY = touch.clientY;
  touchStartX = touch.clientX;
}, { passive: true });

slidesWrap.addEventListener("touchend", (event) => {
  if (!started || touchStartY === null || wheelLocked) return;
  const touch = event.changedTouches[0];
  const dy = touch.clientY - touchStartY;
  const dx = touch.clientX - touchStartX;
  touchStartY = null;
  touchStartX = null;

  if (Math.abs(dy) < 55 || Math.abs(dy) < Math.abs(dx) * 1.15) return;
  if (dy < 0) next();
  else previous();
}, { passive: true });

// En escritorio: rueda vertical cambia una imagen por gesto, sin movimiento automático.
window.addEventListener("wheel", (event) => {
  if (!started || wheelLocked) return;
  if (Math.abs(event.deltaY) < 8) return;
  if (ending.getBoundingClientRect().top < window.innerHeight * 0.8 && event.deltaY < 0) return;
  event.preventDefault();
  if (event.deltaY > 0) next();
  else previous();
}, { passive: false });

// Teclado: flechas arriba/abajo y espacio.
window.addEventListener("keydown", (event) => {
  if (!started || wheelLocked) return;
  if (["ArrowDown", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    next();
  } else if (["ArrowUp", "PageUp"].includes(event.key)) {
    event.preventDefault();
    previous();
  }
});

// Si el usuario ya está en el cierre y vuelve hacia arriba, el navegador puede regresar a la historia.
window.addEventListener("scroll", () => {
  if (!started) return;
  if (window.scrollY <= 4 && ending.classList.contains("is-ready")) {
    ending.classList.remove("is-ready");
    wheelLocked = false;
  }
}, { passive: true });

buildProgress();
renderSlide(0);

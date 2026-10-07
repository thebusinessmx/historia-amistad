/*
  Página única — no usa base de datos, login ni parámetros ?id=.
  Solo edita las tres URLs de CONFIG cuando tengas las cuentas definitivas.
*/

const CONFIG = {
  facebook: "https://www.facebook.com/share/1bkfygafYA/?mibextid=wwXIfr",
  instagram: "https://www.instagram.com/amistadcristianaponiente?stkn=MWl4OHZxZ3QzMHY3aw==",
  googleReview: "https://www.google.com/maps/place//data=!4m3!3m2!1s0x8f5675868718607f:0x15cf13f0f951dfcd!12e1"
};

const welcome = document.getElementById("welcome");
const startButton = document.getElementById("startButton");
const story = document.getElementById("story");
const ending = document.getElementById("ending");
const music = document.getElementById("music");
const slides = [...document.querySelectorAll(".slide")];
const progress = document.getElementById("progress");
const soundButton = document.getElementById("soundButton");
const swipeHint = document.getElementById("swipeHint");
const instagramLink = document.getElementById("instagramLink");
const facebookLink = document.getElementById("facebookLink");
const reviewLink = document.getElementById("reviewLink");

facebookLink.href = CONFIG.facebook;
instagramLink.href = CONFIG.instagram;
reviewLink.href = CONFIG.googleReview;

let current = 0;
let started = false;
let timer = null;
let touchStartX = 0;
let touchStartY = 0;
let isTransitioning = false;

const SLIDE_TIME = 9000;

function buildProgress() {
  progress.innerHTML = "";
  slides.forEach((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Ir a la imagen ${index + 1}`);
    button.addEventListener("click", () => goTo(index, true));
    progress.appendChild(button);
  });
}

function updateProgress() {
  [...progress.children].forEach((button, index) => {
    button.classList.toggle("is-active", index === current);
    button.setAttribute("aria-selected", index === current ? "true" : "false");
  });
}

function goTo(index, manual = false) {
  if (!started || isTransitioning) return;

  const next = Math.max(0, Math.min(slides.length - 1, index));
  if (next === current) {
    if (manual) restartTimer();
    return;
  }

  isTransitioning = true;
  slides[current].classList.remove("is-active");
  current = next;
  slides[current].classList.add("is-active");
  updateProgress();

  if (current > 0) swipeHint.classList.add("is-hidden");

  if (current === slides.length - 1) {
    // Let the final image breathe before revealing the closing section.
    clearTimeout(timer);
    timer = setTimeout(() => {
      ending.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 9500);
  } else if (manual) {
    restartTimer();
  }

  setTimeout(() => { isTransitioning = false; }, 1100);
}

function next() {
  if (current < slides.length - 1) goTo(current + 1);
  else ending.scrollIntoView({ behavior: "smooth", block: "start" });
}

function previous() {
  if (current > 0) goTo(current - 1, true);
}

function restartTimer() {
  clearTimeout(timer);
  if (current < slides.length - 1) timer = setTimeout(next, SLIDE_TIME);
  else timer = setTimeout(() => ending.scrollIntoView({ behavior: "smooth", block: "start" }), SLIDE_TIME);
}

async function startExperience() {
  if (started) return;
  started = true;

  try {
    music.volume = 0.72;
    await music.play();
  } catch (_) {
    // If the browser blocks audio for any reason, the visual experience still starts.
  }

  welcome.classList.add("is-hidden");
  story.classList.add("is-visible");
  story.setAttribute("aria-hidden", "false");

  updateProgress();
  restartTimer();
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

document.addEventListener("keydown", (event) => {
  if (!started) return;
  if (event.key === "ArrowRight" || event.key === " ") {
    event.preventDefault();
    next();
  }
  if (event.key === "ArrowLeft") previous();
});

slides[0].parentElement.addEventListener("touchstart", (event) => {
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });

slides[0].parentElement.addEventListener("touchend", (event) => {
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
  if (dx < 0) next();
  else previous();
}, { passive: true });

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearTimeout(timer);
  } else if (started) {
    restartTimer();
  }
});

buildProgress();

/*
  Página única — no usa base de datos, login ni parámetros ?id=.
  Las historias se muestran una debajo de otra para que cada persona avance
  a su propio ritmo desplazándose verticalmente.
*/

const CONFIG = {
  facebook: "https://www.facebook.com/share/1bkfygafYA/?mibextid=wwXIfr",
  instagram: "https://www.instagram.com/amistadcristianaponiente?stkn=MWl4OHZxZ3QzMHY3aw==",
  googleReview: "https://www.google.com/maps/place//data=!4m3!3m2!1s0x8f5675868718607f:0x15cf13f0f951dfcd!12e1"
};

const welcome = document.getElementById("welcome");
const startButton = document.getElementById("startButton");
const story = document.getElementById("story");
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

let started = false;
let current = 0;

function buildProgress() {
  progress.innerHTML = "";
  slides.forEach((slide, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Ir a la imagen ${index + 1}`);
    button.addEventListener("click", () => {
      if (!started) return;
      slide.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    progress.appendChild(button);
  });
}

function updateProgress() {
  [...progress.children].forEach((button, index) => {
    button.classList.toggle("is-active", index === current);
    button.setAttribute("aria-selected", index === current ? "true" : "false");
  });
}

function updateCurrentSlide() {
  if (!started) return;

  const viewportCenter = window.scrollY + (window.innerHeight * 0.42);
  let closestIndex = 0;
  let closestDistance = Infinity;

  slides.forEach((slide, index) => {
    const rect = slide.getBoundingClientRect();
    const center = window.scrollY + rect.top + (rect.height / 2);
    const distance = Math.abs(center - viewportCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  if (closestIndex !== current) {
    current = closestIndex;
    updateProgress();
  }

  if (window.scrollY > 80) swipeHint.classList.add("is-hidden");
}

async function startExperience() {
  if (started) return;
  started = true;

  try {
    music.volume = 0.72;
    await music.play();
  } catch (_) {
    // Si el navegador bloquea el audio, la experiencia visual continúa normalmente.
  }

  welcome.classList.add("is-hidden");
  story.classList.add("is-visible");
  story.setAttribute("aria-hidden", "false");
  document.body.classList.add("experience-started");

  current = 0;
  updateProgress();
  window.scrollTo({ top: 0, behavior: "instant" });
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

window.addEventListener("scroll", updateCurrentSlide, { passive: true });
window.addEventListener("resize", updateCurrentSlide, { passive: true });

buildProgress();
updateProgress();

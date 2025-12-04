(function () {
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Smooth scroll
  function scrollToTarget(target) {
    const el = typeof target === "string" ? qs(target) : target;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  qsa("[data-scroll]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const target = el.getAttribute("data-scroll") || el.getAttribute("href");
      if (target && target.startsWith("#")) {
        scrollToTarget(target);
      }
    });
  });

  qsa("a.nav-link").forEach((el) => {
    el.addEventListener("click", (e) => {
      const href = el.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        scrollToTarget(href);
        closeMobileNav();
      }
    });
  });

  // Burger menu
  const navBurger = qs("#navBurger");
  const navLinks = qs("#navLinks");

  function closeMobileNav() {
    if (!navBurger) return;
    navBurger.classList.remove("active");
    navLinks && navLinks.classList.remove("open");
  }

  if (navBurger && navLinks) {
    navBurger.addEventListener("click", () => {
      navBurger.classList.toggle("active");
      navLinks.classList.toggle("open");
    });
  }

  // Back to top
  const backToTop = qs("#backToTop");
  window.addEventListener("scroll", () => {
    const y = window.scrollY || window.pageYOffset;
    if (backToTop) {
      if (y > 400) backToTop.classList.add("visible");
      else backToTop.classList.remove("visible");
    }
  });
  backToTop &&
    backToTop.addEventListener("click", () => {
      scrollToTarget("#hero");
    });

  // Reveal on scroll
  const revealEls = qsa(".reveal");
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => obs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  // Fade slider
  const fadeSlider = qs("#fadeSlider");
  if (fadeSlider) {
    const slides = qsa(".fade-slide", fadeSlider);
    const dots = qsa(".slider-dot", fadeSlider);
    const prevBtn = qs(".slider-btn[data-dir='prev']", fadeSlider);
    const nextBtn = qs(".slider-btn[data-dir='next']", fadeSlider);
    let current = 0;
    let fadeTimer;

    function showSlide(idx) {
      if (!slides.length) return;
      current = (idx + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === current);
      });
    }

    function next() {
      showSlide(current + 1);
    }
    function prev() {
      showSlide(current - 1);
    }

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const t = Number(dot.dataset.target || "0");
        showSlide(t);
        restartTimer();
      });
    });

    prevBtn &&
      prevBtn.addEventListener("click", () => {
        prev();
        restartTimer();
      });
    nextBtn &&
      nextBtn.addEventListener("click", () => {
        next();
        restartTimer();
      });

    function restartTimer() {
      if (fadeTimer) window.clearInterval(fadeTimer);
      fadeTimer = window.setInterval(next, 30000);
    }

    restartTimer();
  }

  // Candy carousel (horizontal slider)
  const carousel = qs("#candyCarousel");
  if (carousel) {
    const track = qs(".carousel-track", carousel);
    const items = qsa(".carousel-item", carousel);
    const dots = qsa("#carouselDots .carousel-dot");
    const prevBtn = qs("#carouselPrev");
    const nextBtn = qs("#carouselNext");
    let current = 0;
    let autoTimer;

    function updateCarousel() {
      if (!track || !items.length) return;
      const offset = -current * 100;
      track.style.transform = `translateX(${offset}%)`;
      items.forEach((item, i) =>
        item.classList.toggle("active", i === current)
      );
      dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
    }

    function goTo(idx) {
      const len = items.length;
      current = (idx + len) % len;
      updateCarousel();
    }

    prevBtn &&
      prevBtn.addEventListener("click", () => {
        goTo(current - 1);
        restartAuto();
      });
    nextBtn &&
      nextBtn.addEventListener("click", () => {
        goTo(current + 1);
        restartAuto();
      });

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const t = Number(dot.dataset.target || "0");
        goTo(t);
        restartAuto();
      });
    });

    function restartAuto() {
      if (autoTimer) window.clearInterval(autoTimer);
      autoTimer = window.setInterval(() => goTo(current + 1), 6000);
    }

    updateCarousel();
    restartAuto();
  }

  // Custom video player
  const video = qs("#factoryVideo");
  const playBtn = qs("#videoPlayBtn");
  const progress = qs("#videoProgress");
  const timeLabel = qs("#videoTime");

  function formatTime(sec) {
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }

  if (video && playBtn && progress && timeLabel) {
    playBtn.addEventListener("click", () => {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", () => {
      playBtn.textContent = "⏸";
    });

    video.addEventListener("pause", () => {
      playBtn.textContent = "▶";
    });

    video.addEventListener("timeupdate", () => {
      if (video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        progress.value = percent;
        timeLabel.textContent = formatTime(video.currentTime);
      }
    });

    progress.addEventListener("input", () => {
      if (!video.duration) return;
      const pct = Number(progress.value) / 100;
      video.currentTime = video.duration * pct;
    });
  }

  // Audio players
  let currentAudio = null;
  let currentCard = null;
  const audioCards = qsa(".audio-card");

  function bindAudioCard(card) {
    const audioId = card.getAttribute("data-audio-id");
    const audioEl = audioId ? qs("#" + audioId) : null;
    if (!audioEl) return;
    const btn = qs(".audio-btn", card);
    const slider = qs(".audio-slider", card);

    btn.addEventListener("click", () => {
      if (currentAudio && currentAudio !== audioEl) {
        currentAudio.pause();
        if (currentCard) {
          const b = qs(".audio-btn", currentCard);
          const s = qs(".audio-slider", currentCard);
          if (b) b.textContent = "▶";
          if (s) s.value = 0;
        }
      }
      if (audioEl.paused) {
        audioEl.play();
        btn.textContent = "⏸";
        currentAudio = audioEl;
        currentCard = card;
      } else {
        audioEl.pause();
        btn.textContent = "▶";
      }
    });

    slider.addEventListener("input", () => {
      if (!audioEl.duration) return;
      const pct = Number(slider.value) / 100;
      audioEl.currentTime = audioEl.duration * pct;
    });

    audioEl.addEventListener("timeupdate", () => {
      if (!audioEl.duration) return;
      const pct = (audioEl.currentTime / audioEl.duration) * 100;
      slider.value = pct;
    });

    audioEl.addEventListener("ended", () => {
      slider.value = 0;
      btn.textContent = "▶";
      if (currentAudio === audioEl) {
        currentAudio = null;
        currentCard = null;
      }
    });
  }

  audioCards.forEach(bindAudioCard);


    function startLiveHeadline() {
    const container = document.getElementById("liveHeadline");
    if (!container) return;

    const text = "ЖИВОЙ РЕПОРТАЖ";
    container.innerHTML = "";
    const chars = [...text]; // корректно для кириллицы и пробелов

    chars.forEach((ch, index) => {
      const span = document.createElement("span");
      span.textContent = ch === " " ? "\u00A0" : ch; // неразрывный пробел
      container.appendChild(span);

      setTimeout(() => {
        span.classList.add("visible");
      }, 80 * index); // скорость «набора»
    });
  }

  function initCandyRain() {
    const rain = document.getElementById("candyRain");
    if (!rain) {
      // если контейнера нет — просто запускаем заголовок
      startLiveHeadline();
      return;
    }

    const emojis = ["🍬", "🍭", "🎁", "✨", "🍫"];
    const COUNT = 40;

    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement("span");
      el.className = "candy";
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      const delay = Math.random() * 0.8;              // 0–0.8 сек
      const duration = 1.8 + Math.random() * 1.2;     // ~1.8–3 сек

      el.style.left = Math.random() * 100 + "vw";
      el.style.animationDelay = delay + "s";
      el.style.animationDuration = duration + "s";

      rain.appendChild(el);
    }

    // через ~3 секунды плавно убираем дождь и запускаем заголовок
    setTimeout(() => {
      rain.classList.add("candy-rain--hide");
      startLiveHeadline();
      setTimeout(() => {
        rain.remove();
      }, 800);
    }, 3100);
  }

  // запускаем сразу, скрипт внизу страницы — DOM уже есть
  initCandyRain();
})();


// Устанавливаем фон для step-card-media из data-img
document.querySelectorAll(".step-card-media").forEach((el) => {
    const url = el.dataset.img;
    el.style.backgroundImage = `url("${url}")`;
});


// === Modal Gallery ===
const modal = document.getElementById("photoModal");
const modalImg = document.getElementById("modalImage");
const closeBtn = document.querySelector(".modal-close");
const nextBtn = document.querySelector(".modal-nav.next");
const prevBtn = document.querySelector(".modal-nav.prev");

// Собираем все фото фонов
const mediaBlocks = document.querySelectorAll(".step-card-media");

// Массив путей к фоновым картинкам
const images = Array.from(mediaBlocks).map(el => el.dataset.img);


let currentIndex = 0;

// Открыть модалку
function openModal(index) {
  currentIndex = index;
  modalImg.src = images[index];
  modal.classList.add("open");
}

// Закрыть
function closeModal() {
  modal.classList.remove("open");
}

// Переключение
function showNext() {
  currentIndex = (currentIndex + 1) % images.length;
  modalImg.src = images[currentIndex];
}

function showPrev() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  modalImg.src = images[currentIndex];
}

// События
mediaBlocks.forEach((block, index) => {
  block.addEventListener("click", () => openModal(index));
});

closeBtn.addEventListener("click", closeModal);

nextBtn.addEventListener("click", showNext);
prevBtn.addEventListener("click", showPrev);

// Закрытие по клику вне контента
modal.addEventListener("click", e => {
  if (e.target === modal) closeModal();
});

// Закрытие по ESC
document.addEventListener("keydown", e => {
  if (!modal.classList.contains("open")) return;
  if (e.key === "Escape") closeModal();
  if (e.key === "ArrowRight") showNext();
  if (e.key === "ArrowLeft") showPrev();
});

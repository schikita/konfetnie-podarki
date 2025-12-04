(function () {
  "use strict";

  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ===== SMOOTH SCROLL =====
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

  // ===== BURGER MENU =====
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

    // Закрытие меню при клике вне его
    document.addEventListener("click", (e) => {
      if (!navBurger.contains(e.target) && !navLinks.contains(e.target)) {
        closeMobileNav();
      }
    });
  }

  // ===== BACK TO TOP =====
  const backToTop = qs("#backToTop");
  let ticking = false;

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset;
        if (backToTop) {
          if (y > 400) backToTop.classList.add("visible");
          else backToTop.classList.remove("visible");
        }
        ticking = false;
      });
      ticking = true;
    }
  });

  backToTop &&
    backToTop.addEventListener("click", () => {
      scrollToTarget("#hero");
    });

  // ===== REVEAL ON SCROLL =====
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
      { threshold: 0.15, rootMargin: "50px" }
    );
    revealEls.forEach((el) => obs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  // ===== FADE SLIDER (STEP 2) =====
  const fadeSlider = qs("#fadeSlider");
  if (fadeSlider) {
    const slides = qsa(".fade-slide", fadeSlider);
    const dots = qsa(".slider-dot", fadeSlider);
    const prevBtn = qs(".slider-btn[data-dir='prev']", fadeSlider);
    const nextBtn = qs(".slider-btn[data-dir='next']", fadeSlider);
    let current = 0;
    let fadeTimer;
    let isAutoPlay = true;

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

    function restartTimer() {
      if (fadeTimer) window.clearInterval(fadeTimer);
      if (isAutoPlay) {
        fadeTimer = window.setInterval(next, 8000);
      }
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

    // Pause on hover
    fadeSlider.addEventListener("mouseenter", () => {
      if (fadeTimer) window.clearInterval(fadeTimer);
    });

    fadeSlider.addEventListener("mouseleave", () => {
      restartTimer();
    });

    showSlide(0);
    restartTimer();
  }

  // ===== AUDIO PLAYERS =====
  let currentAudio = null;
  let currentCard = null;
  const audioCards = qsa(".audio-card");

  function bindAudioCard(card) {
    const audioId = card.getAttribute("data-audio-id");
    const audioEl = audioId ? qs("#" + audioId) : null;
    if (!audioEl) return;
    
    const btn = qs(".audio-btn", card);
    const slider = qs(".audio-slider", card);
    if (!btn || !slider) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      
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

    audioEl.addEventListener("error", () => {
      console.warn(`Audio error: ${audioId}`);
      btn.textContent = "✕";
      btn.disabled = true;
    });
  }

  audioCards.forEach(bindAudioCard);

  // ===== LIVE HEADLINE =====
  function startLiveHeadline() {
    const container = document.getElementById("liveHeadline");
    if (!container) return;

    const text = "ЖИВОЙ РЕПОРТАЖ";
    container.innerHTML = "";
    const chars = [...text];

    chars.forEach((ch, index) => {
      const span = document.createElement("span");
      span.textContent = ch === " " ? "\u00A0" : ch;
      container.appendChild(span);

      setTimeout(() => {
        span.classList.add("visible");
      }, 80 * index);
    });
  }

  // ===== CANDY RAIN =====
  function initCandyRain() {
    const rain = document.getElementById("candyRain");
    if (!rain) {
      startLiveHeadline();
      return;
    }

    const emojis = ["🍬", "🍭", "🎁", "✨", "🍫"];
    const COUNT = 40;

    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement("span");
      el.className = "candy";
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      const delay = Math.random() * 0.8;
      const duration = 1.8 + Math.random() * 1.2;

      el.style.left = Math.random() * 100 + "vw";
      el.style.animationDelay = delay + "s";
      el.style.animationDuration = duration + "s";

      rain.appendChild(el);
    }

    setTimeout(() => {
      rain.classList.add("candy-rain--hide");
      startLiveHeadline();
      setTimeout(() => {
        rain.style.display = "none";
      }, 800);
    }, 3100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCandyRain);
  } else {
    initCandyRain();
  }

  // ===== STEP CARD MEDIA BACKGROUNDS =====
  document.querySelectorAll(".step-card-media").forEach((el) => {
    const url = el.dataset.img;
    if (url) {
      el.style.backgroundImage = `url("${url}")`;
    }
  });

  // ===== MODAL GALLERY =====
  const modal = document.getElementById("photoModal");
  const modalImg = document.getElementById("modalImage");
  const closeBtn = document.querySelector(".modal-close");
  const nextBtn = document.querySelector(".modal-nav.next");
  const prevBtn = document.querySelector(".modal-nav.prev");

  if (modal && modalImg && closeBtn && nextBtn && prevBtn) {
    const mediaBlocks = document.querySelectorAll(".step-card-media");
    const images = Array.from(mediaBlocks).map((el) => el.dataset.img).filter(Boolean);
    let currentIndex = 0;

    function openModal(index) {
      if (index < 0 || index >= images.length) return;
      currentIndex = index;
      modalImg.src = images[index];
      modalImg.alt = `Фотография ${index + 1}`;
      modal.classList.add("open");
    }

    function closeModal() {
      modal.classList.remove("open");
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % images.length;
      modalImg.src = images[currentIndex];
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      modalImg.src = images[currentIndex];
    }

    mediaBlocks.forEach((block, index) => {
      if (block.dataset.img) {
        block.style.cursor = "pointer";
        block.addEventListener("click", () => openModal(index));
      }
    });

    closeBtn.addEventListener("click", closeModal);
    nextBtn.addEventListener("click", showNext);
    prevBtn.addEventListener("click", showPrev);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("open")) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    });
  }

  // ===== STEP 3 SLIDERS =====
  function supportsIO() {
    return "IntersectionObserver" in window;
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".step3-slider").forEach((slider) => {
      const track = slider.querySelector(".step3-slider-track");
      const slides = slider.querySelectorAll(".step3-slide");
      const prev = slider.querySelector(".step3-slider-btn.prev");
      const next = slider.querySelector(".step3-slider-btn.next");

      if (!track || slides.length === 0) return;

      let index = 0;

      const update = () => {
        track.style.transform = `translateX(-${index * 100}%)`;
      };

      next?.addEventListener("click", () => {
        index = (index + 1) % slides.length;
        update();
      });

      prev?.addEventListener("click", () => {
        index = (index - 1 + slides.length) % slides.length;
        update();
      });
    });

    // ===== PROJECTS CAROUSEL =====
    const viewport = document.querySelector("#projects .projects-viewport");
    if (viewport) {
      const stage = viewport.querySelector(".projects-stage");
      if (stage) {
        const cards = Array.from(stage.querySelectorAll(".project-card"));
        if (cards.length) {
          const dotsWrap = viewport.querySelector(".pr-dots");
          const prevBtn = viewport.querySelector(".prev");
          const nextBtn = viewport.querySelector(".next");

          if (dotsWrap) {
            let i = 0;
            let timer = null;
            const interval = +(viewport.dataset.interval || 5000);
            const autoplay = viewport.dataset.autoplay !== "false";
            const reduce =
              window.matchMedia &&
              window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            dotsWrap.innerHTML = cards.map(() => "<i></i>").join("");
            const dots = Array.from(dotsWrap.children);

            const show = (idx) => {
              i = (idx + cards.length) % cards.length;
              cards.forEach((c, k) => c.classList.toggle("is-active", k === i));
              dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
            };

            const next = () => show(i + 1);
            const prev = () => show(i - 1);

            const stop = () => {
              if (timer) {
                clearInterval(timer);
                timer = null;
              }
            };

            const play = () => {
              if (reduce || !autoplay) return;
              stop();
              timer = setInterval(next, interval);
            };

            show(0);
            play();

            nextBtn &&
              nextBtn.addEventListener("click", () => {
                next();
                play();
              });

            prevBtn &&
              prevBtn.addEventListener("click", () => {
                prev();
                play();
              });

            dotsWrap.addEventListener("click", (e) => {
              const idx = dots.indexOf(e.target);
              if (idx > -1) {
                show(idx);
                play();
              }
            });

            viewport.addEventListener("mouseenter", stop);
            viewport.addEventListener("mouseleave", play);
            viewport.addEventListener("focusin", stop);
            viewport.addEventListener("focusout", play);

            if (supportsIO()) {
              const sectionObserver = new IntersectionObserver(
                (entries) => {
                  entries.forEach((entry) => {
                    if (entry.target !== viewport) return;
                    if (entry.isIntersecting) {
                      play();
                    } else {
                      stop();
                    }
                  });
                },
                { threshold: 0.2 }
              );
              sectionObserver.observe(viewport);
            }
          }
        }
      }
    }
  });

  // ===== PERFORMANCE: Lazy Load Images =====
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src && !img.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
          }
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }
})();

// ===== ANALYTICS LOADING =====
function loadYandexMetrika() {
  (function (m, e, t, r, i, k, a) {
    m[i] =
      m[i] ||
      function () {
        (m[i].a = m[i].a || []).push(arguments);
      };
    m[i].l = 1 * new Date();
    for (var j = 0; j < document.scripts.length; j++) {
      if (document.scripts[j].src === r) return;
    }
    (k = e.createElement(t)),
      (a = e.getElementsByTagName(t)[0]),
      (k.async = 1),
      (k.src = r),
      a.parentNode.insertBefore(k, a);
  })(
    window,
    document,
    "script",
    "https://mc.yandex.ru/metrika/tag.js",
    "ym"
  );
  try {
    ym(16707172, "init", {
      webvisor: true,
      clickmap: true,
      accurateTrackBounce: true,
      trackLinks: true,
    });
  } catch (e) {
    console.warn("Yandex Metrika failed to initialize");
  }
}

function loadGTM() {
  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l !== "dataLayer" ? "&l=" + l : "";
    j.async = true;
    j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, "script", "dataLayer", "GTM-KRVNNK");
}

window.addEventListener("load", () => {
  setTimeout(loadYandexMetrika, 3000);
  setTimeout(loadGTM, 4000);
});

document.addEventListener("DOMContentLoaded", () => {
  const collageItems = document.querySelectorAll(".step3-collage .collage-item");

  const EMOJIS = ["🍬", "🍭", "🍫", "✨", "🎁"];

  collageItems.forEach(item => {
    item.style.position = "relative";

    item.addEventListener("click", (e) => {
      const rect = item.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Теперь конфет намного больше
      const count = 20 + Math.floor(Math.random() * 12);

      for (let i = 0; i < count; i++) {
        const candy = document.createElement("span");
        candy.className = "candy-fall";
        candy.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

        // Гораздо более мощный разлет (пышнее)
        const dx = (Math.random() - 0.5) * 240;  // горизонталь: −120 .. +120
        const dy = 80 + Math.random() * 120;    // вниз: 80–200px
        const rot = `${(Math.random() - 0.5) * 720}deg`; // до 720° вращения

        // Передаём параметры в CSS
        candy.style.setProperty("--dx", `${dx}px`);
        candy.style.setProperty("--dy", `${dy}px`);
        candy.style.setProperty("--rot", rot);

        // Мини-рандом по стартовой позиции
        candy.style.left = `${clickX + (Math.random() - 0.5) * 20}px`;
        candy.style.top = `${clickY + (Math.random() - 0.5) * 20}px`;

        // Рандомная задержка – чтобы "взрыв" был живым
        candy.style.animationDelay = `${Math.random() * 0.15}s`;

        // Разная длительность падения
        candy.style.animationDuration = `${0.9 + Math.random() * 0.9}s`;

        item.appendChild(candy);

        candy.addEventListener("animationend", () => candy.remove());
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {

  const collageItems = document.querySelectorAll(".step3-collage .collage-item img");

  const modal = document.getElementById("collageModal");
  const modalImg = document.getElementById("collageModalImg");
  const closeBtn = document.querySelector(".collage-close");
  const nextBtn = document.querySelector(".collage-nav.next");
  const prevBtn = document.querySelector(".collage-nav.prev");

  let currentIndex = 0;
  let images = [];

  // Собираем пути всех изображений коллажа
  images = Array.from(collageItems).map(img => img.src);

  // Открытие
  collageItems.forEach((img, index) => {
    img.addEventListener("click", () => {
      currentIndex = index;
      modalImg.src = images[currentIndex];
      modal.classList.add("open");
    });
  });

  // Закрытие
  closeBtn.addEventListener("click", () => modal.classList.remove("open"));
  modal.addEventListener("click", e => {
    if (e.target === modal) modal.classList.remove("open");
  });

  // Навигация
  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    modalImg.src = images[currentIndex];
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    modalImg.src = images[currentIndex];
  }

  nextBtn.addEventListener("click", showNext);
  prevBtn.addEventListener("click", showPrev);

  // Клавиатура
  document.addEventListener("keydown", e => {
    if (!modal.classList.contains("open")) return;

    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "Escape") modal.classList.remove("open");
  });
});


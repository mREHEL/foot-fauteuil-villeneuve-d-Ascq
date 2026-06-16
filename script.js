const carousel = document.querySelector("[data-carousel]");
const track = document.querySelector(".sponsor-track");
const prevButton = document.querySelector(".carousel-arrow.prev");
const nextButton = document.querySelector(".carousel-arrow.next");
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#site-search");
const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector("#site-nav");
const siteHeader = document.querySelector(".site-header");
const headerParent = siteHeader ? siteHeader.parentElement : null;
const heroTitleText = document.querySelector(".hero-title-text");
const layoutButtons = document.querySelectorAll(".layout-button");
const layoutPanels = document.querySelectorAll(".layout-panel");

let carouselIndex = 0;
let heroPhraseIndex = 0;
let carouselTimer = null;
let isHeaderStuck = false;

const heroPhrases = [
  "Bienvenue au Foot Fauteuil Villeneuvois",
];

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getStep() {
  if (!track) {
    return 0;
  }

  const firstCard = track.querySelector(".sponsor-card");
  if (!firstCard) {
    return 0;
  }

  const style = window.getComputedStyle(track);
  const gap = Number.parseFloat(style.columnGap || style.gap) || 0;
  return firstCard.getBoundingClientRect().width + gap;
}

function getMaxIndex() {
  const step = getStep();
  if (!step || !carousel || !track) {
    return 0;
  }

  const hiddenWidth = track.scrollWidth - carousel.clientWidth;
  return Math.max(0, Math.ceil(hiddenWidth / step));
}

function updateCarousel() {
  const step = getStep();
  const maxIndex = getMaxIndex();

  if (!track) {
    return;
  }

  carouselIndex = Math.min(Math.max(carouselIndex, 0), maxIndex);
  track.style.transform = `translateX(${-carouselIndex * step}px)`;
}

function goToNextSponsor() {
  const maxIndex = getMaxIndex();

  if (!maxIndex) {
    return;
  }

  carouselIndex = carouselIndex >= maxIndex ? 0 : carouselIndex + 1;
  updateCarousel();
}

function startCarouselAutoScroll() {
  if (!carousel || carouselTimer) {
    return;
  }

  carouselTimer = window.setInterval(goToNextSponsor, 3200);
}

function stopCarouselAutoScroll() {
  window.clearInterval(carouselTimer);
  carouselTimer = null;
}

function updateHeaderPosition() {
  if (!siteHeader) {
    return;
  }

  if (isHeaderStuck && headerParent) {
    headerParent.style.paddingTop = `${siteHeader.offsetHeight}px`;
  }

  if (!isHeaderStuck && window.scrollY > 120) {
    isHeaderStuck = true;
    if (headerParent) {
      headerParent.style.paddingTop = `${siteHeader.offsetHeight}px`;
    }
    siteHeader.classList.add("is-stuck");
  }

  if (isHeaderStuck && window.scrollY < 60) {
    isHeaderStuck = false;
    siteHeader.classList.remove("is-stuck");
    if (headerParent) {
      headerParent.style.paddingTop = "";
    }
  }
}

if (menuButton && siteNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    if (headerParent) {
      headerParent.classList.toggle("has-open-nav", isOpen);
    }
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      siteNav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      if (headerParent) {
        headerParent.classList.remove("has-open-nav");
      }
    }
  });
}

if (prevButton && nextButton) {
  prevButton.addEventListener("click", () => {
    carouselIndex -= 1;
    updateCarousel();
    stopCarouselAutoScroll();
    startCarouselAutoScroll();
  });

  nextButton.addEventListener("click", () => {
    carouselIndex += 1;
    updateCarousel();
    stopCarouselAutoScroll();
    startCarouselAutoScroll();
  });
}

if (carousel) {
  carousel.addEventListener("mouseenter", stopCarouselAutoScroll);
  carousel.addEventListener("mouseleave", startCarouselAutoScroll);
  carousel.addEventListener("focusin", stopCarouselAutoScroll);
  carousel.addEventListener("focusout", startCarouselAutoScroll);
}

if (searchForm && searchInput) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = normalizeText(searchInput.value.trim());

    if (!query) {
      return;
    }

    const match = [...document.querySelectorAll("h1, h2, h3, p, a")].find((element) =>
      normalizeText(element.textContent).includes(query)
    );

    if (match) {
      match.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

if (heroTitleText) {
  setInterval(() => {
    heroPhraseIndex = (heroPhraseIndex + 1) % heroPhrases.length;
    heroTitleText.classList.add("is-changing");

    window.setTimeout(() => {
      heroTitleText.textContent = heroPhrases[heroPhraseIndex];
      heroTitleText.classList.remove("is-changing");
    }, 280);
  }, 4200);
}

if (layoutButtons.length && layoutPanels.length) {
  layoutButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedLayout = button.dataset.layout;

      layoutButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-selected", String(isActive));
      });

      layoutPanels.forEach((panel) => {
        const isActive = panel.dataset.layoutPanel === selectedLayout;
        panel.classList.toggle("is-active", isActive);
        panel.hidden = !isActive;
      });
    });
  });
}

window.addEventListener("scroll", updateHeaderPosition, { passive: true });
window.addEventListener("resize", () => {
  updateCarousel();
  updateHeaderPosition();
  if (window.innerWidth > 1020 && siteNav && menuButton) {
    siteNav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    if (headerParent) {
      headerParent.classList.remove("has-open-nav");
    }
  }
});
updateCarousel();
updateHeaderPosition();
startCarouselAutoScroll();

/* Clase 7 · fix seguro de layout, sidebar, scroll progress e imágenes */
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const sidebar = document.getElementById("course-sidebar");
  const progressBar = document.getElementById("progress-bar");

  /* Sidebar */
  const oldToggle = document.getElementById("sidebar-toggle");

  if (oldToggle && sidebar) {
    const toggle = oldToggle.cloneNode(true);
    oldToggle.replaceWith(toggle);

    function setSidebar(collapsed) {
      body.classList.toggle("sidebar-collapsed", collapsed);
      sidebar.classList.toggle("is-hidden", collapsed);

      toggle.textContent = collapsed ? "☰" : "×";
      toggle.setAttribute("aria-label", collapsed ? "Mostrar menú" : "Ocultar menú");
    }

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setSidebar(!body.classList.contains("sidebar-collapsed"));
    });

    setSidebar(false);
  }

  /* Barra superior de scroll */
  function updateScrollProgress() {
    if (!progressBar) return;

    const doc = document.documentElement;
    const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
    const percent = Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100));

    progressBar.style.width = `${percent}%`;
  }

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);
  updateScrollProgress();

  /* Iniciar misión */
  const startBtn = document.getElementById("c7-start");

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      const target =
        document.querySelector('[data-section="2"]') ||
        document.querySelector(".class7-section");

      if (!target) return;

      const top = target.getBoundingClientRect().top + window.scrollY - 40;
      window.scrollTo({ top, behavior: "smooth" });
    });
  }

  /* Lightbox de imágenes */
  const lightbox = document.getElementById("class7-image-lightbox");
  const lightboxImg = document.getElementById("class7-lightbox-img");
  const lightboxCaption = document.getElementById("class7-lightbox-caption");
  const closeBtn = document.getElementById("class7-lightbox-close");

  function openLightbox(img) {
    if (!lightbox || !lightboxImg || !lightboxCaption) return;

    const figure = img.closest("figure");
    const caption =
      figure?.querySelector("figcaption")?.textContent ||
      img.alt ||
      "Imagen ampliada";

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || caption;
    lightboxCaption.textContent = caption;
    lightbox.hidden = false;
    document.body.classList.add("class7-lightbox-open");
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImg || !lightboxCaption) return;

    lightbox.hidden = true;
    lightboxImg.src = "";
    lightboxCaption.textContent = "";
    document.body.classList.remove("class7-lightbox-open");
  }

  document.addEventListener("click", (event) => {
    const img = event.target.closest(
      ".class7-colab-image img, .class7-colab-gallery img, .class7-omes-gallery img, .class7-colab-guide img, .class7-omes-figure img"
    );

    if (img) {
      event.preventDefault();
      openLightbox(img);
      return;
    }

    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeLightbox);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox && !lightbox.hidden) {
      closeLightbox();
    }
  });
});

/* Clase 7 · navegación inferior por secciones */
document.addEventListener("DOMContentLoaded", () => {
  const prevBtn = document.getElementById("c7-section-prev");
  const nextBtn = document.getElementById("c7-section-next");
  const counter = document.getElementById("c7-section-counter");

  if (!prevBtn || !nextBtn) return;

  const sections = Array.from(
    document.querySelectorAll(".class7-hero[data-section], .class7-section[data-section], .class7-credit-section[data-section]")
  );

  if (!sections.length) return;

  function getCurrentSectionIndex() {
    const scrollReference = window.scrollY + window.innerHeight * 0.35;

    let currentIndex = 0;

    sections.forEach((section, index) => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;

      if (sectionTop <= scrollReference) {
        currentIndex = index;
      }
    });

    return currentIndex;
  }

  function updateNavState() {
    const index = getCurrentSectionIndex();

    prevBtn.disabled = index <= 0;
    nextBtn.disabled = index >= sections.length - 1;

    prevBtn.classList.toggle("is-disabled", prevBtn.disabled);
    nextBtn.classList.toggle("is-disabled", nextBtn.disabled);

    if (counter) {
      counter.textContent = `${index + 1} / ${sections.length}`;
    }
  }

  function goToSection(index) {
    const safeIndex = Math.max(0, Math.min(sections.length - 1, index));
    const target = sections[safeIndex];

    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - 8;

    window.scrollTo({
      top,
      behavior: "smooth"
    });

    setTimeout(updateNavState, 420);
  }

  prevBtn.addEventListener("click", () => {
    const index = getCurrentSectionIndex();
    goToSection(index - 1);
  });

  nextBtn.addEventListener("click", () => {
    const index = getCurrentSectionIndex();
    goToSection(index + 1);
  });

  window.addEventListener("scroll", updateNavState, { passive: true });
  window.addEventListener("resize", updateNavState);

  updateNavState();
});


/* Clase 7 · sincronizar tarjeta de progreso XP */
document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "clase7NotebookLabProgress";

  const XP_MAP = {
    preparation: 8,
    colabGuide: 10,
    notebook: 8,
    python: 8,
    pandas: 8,
    csv: 12,
    sandbox: 14,
    diagnosis: 12,
    validation: 10,
    challenge: 10,
    report: 10,
    evidence: 10
  };

  const value = document.getElementById("c7-xp-value");
  const fill = document.getElementById("c7-progress-fill");
  const text = document.getElementById("c7-progress-text");

  const legacyLabel = document.getElementById("c7-xp-label");
  const legacyBar = document.getElementById("c7-xp-bar");

  if (!value || !fill || !text) return;

  function clampXP(xp) {
    return Math.max(0, Math.min(100, Number(xp) || 0));
  }

  function parseXPFromText(raw) {
    const match = String(raw || "").match(/(\d+)\s*(?:\/\s*100)?\s*XP/i);
    return match ? Number(match[1]) : 0;
  }

  function readXPFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return 0;

      const data = JSON.parse(raw);

      if (typeof data === "number") return data;
      if (typeof data?.xp === "number") return data.xp;
      if (typeof data?.totalXP === "number") return data.totalXP;

      const source = data?.missions && typeof data.missions === "object"
        ? data.missions
        : data;

      if (!source || typeof source !== "object") return 0;

      let xp = 0;

      Object.entries(source).forEach(([key, val]) => {
        const completed =
          val === true ||
          val === "true" ||
          val === "completed" ||
          val?.completed === true ||
          val?.done === true;

        if (!completed) return;

        xp += XP_MAP[key] || 10;
      });

      return xp;
    } catch {
      return 0;
    }
  }

  function readXP() {
    let xp = 0;

    if (legacyLabel) {
      xp = parseXPFromText(legacyLabel.textContent);
    }

    if (!xp && legacyBar) {
      const width = legacyBar.style.width || "";
      const match = width.match(/(\d+(?:\.\d+)?)%/);
      if (match) xp = Number(match[1]);
    }

    if (!xp) {
      xp = readXPFromStorage();
    }

    return clampXP(xp);
  }

  function updateMissionCard() {
    const xp = readXP();

    value.textContent = `${xp} XP`;
    fill.style.width = `${xp}%`;

    text.textContent = xp >= 100
      ? "Misión completada. Insignia desbloqueada."
      : `Te faltan ${100 - xp} XP para desbloquear la insignia.`;
  }

  if (legacyLabel) {
    new MutationObserver(updateMissionCard).observe(legacyLabel, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  if (legacyBar) {
    new MutationObserver(updateMissionCard).observe(legacyBar, {
      attributes: true,
      attributeFilter: ["style", "class"]
    });
  }

  window.addEventListener("storage", updateMissionCard);

  document.addEventListener("click", () => {
    setTimeout(updateMissionCard, 120);
    setTimeout(updateMissionCard, 500);
  }, true);

  document.addEventListener("input", () => {
    setTimeout(updateMissionCard, 120);
    setTimeout(updateMissionCard, 500);
  }, true);

  document.addEventListener("change", () => {
    setTimeout(updateMissionCard, 120);
    setTimeout(updateMissionCard, 500);
  }, true);

  updateMissionCard();
  setTimeout(updateMissionCard, 500);
  setTimeout(updateMissionCard, 1200);
});

/* Clase 7 · sincronizador final de XP */
document.addEventListener("DOMContentLoaded", () => {
  const xpValue = document.getElementById("c7-xp-value");
  const xpFill = document.getElementById("c7-progress-fill");
  const xpText = document.getElementById("c7-progress-text");

  if (!xpValue || !xpFill || !xpText) return;

  const STORAGE_KEYS = [
    "clase7NotebookLabProgress",
    "clase7NotebookProgress",
    "clase7Progress",
    "class7Progress"
  ];

  const XP_MAP = {
    preparation: 8,
    colabGuide: 10,
    notebook: 8,
    python: 8,
    pandas: 8,
    csv: 12,
    sandbox: 14,
    diagnosis: 12,
    validation: 10,
    challenge: 10,
    report: 10,
    evidence: 10,

    start: 8,
    intro: 8,
    colab: 10,
    commands: 14,
    diagnostic: 12,
    finalChallenge: 10,
    finalReport: 10
  };

  function clampXP(value) {
    return Math.max(0, Math.min(100, Number(value) || 0));
  }

  function parseNumberFromText(text) {
    const match = String(text || "").match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  }

  function isCompleted(value) {
    return (
      value === true ||
      value === "true" ||
      value === "completed" ||
      value === "done" ||
      value === "ok" ||
      value?.completed === true ||
      value?.done === true ||
      value?.checked === true
    );
  }

  function scoreObject(obj) {
    if (!obj || typeof obj !== "object") return 0;

    if (typeof obj.xp === "number") return obj.xp;
    if (typeof obj.totalXP === "number") return obj.totalXP;
    if (typeof obj.currentXP === "number") return obj.currentXP;

    let xp = 0;

    if (Array.isArray(obj.completedMissions)) {
      obj.completedMissions.forEach(key => {
        xp += XP_MAP[key] || 0;
      });
    }

    if (Array.isArray(obj.completed)) {
      obj.completed.forEach(key => {
        xp += XP_MAP[key] || 0;
      });
    }

    const source =
      obj.missions && typeof obj.missions === "object"
        ? obj.missions
        : obj.progress && typeof obj.progress === "object"
          ? obj.progress
          : obj;

    Object.entries(source).forEach(([key, value]) => {
      if (isCompleted(value)) {
        xp += XP_MAP[key] || 0;
      }
    });

    return xp;
  }

  function readStorageXP() {
    let best = 0;

    STORAGE_KEYS.forEach(key => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;

        const parsed = JSON.parse(raw);
        best = Math.max(best, scoreObject(parsed));
      } catch {
        // Ignorar valores no JSON.
      }
    });

    return best;
  }

  function readDomXP() {
    let xp = 0;

    document.querySelectorAll("[data-xp]").forEach(el => {
      const points = Number(el.dataset.xp || 0);
      const card = el.closest(".completed, .is-complete, .active, label, article, div");

      const completed =
        el.checked === true ||
        el.classList.contains("completed") ||
        el.classList.contains("is-complete") ||
        card?.classList.contains("completed") ||
        card?.classList.contains("is-complete");

      if (completed) xp += points;
    });

    return xp;
  }

  function readLegacyXP() {
    const legacyLabel = document.getElementById("c7-xp-label");
    const legacyBar = document.getElementById("c7-xp-bar");

    let xp = 0;

    if (legacyLabel) {
      xp = Math.max(xp, parseNumberFromText(legacyLabel.textContent));
    }

    if (legacyBar && legacyBar.style.width) {
      xp = Math.max(xp, parseNumberFromText(legacyBar.style.width));
    }

    return xp;
  }

  function calculateXP() {
    return clampXP(
      Math.max(
        readStorageXP(),
        readDomXP(),
        readLegacyXP()
      )
    );
  }

  function renderXP() {
    const xp = calculateXP();

    xpValue.textContent = `${xp} XP`;
    xpFill.style.width = `${xp}%`;

    xpText.textContent = xp >= 100
      ? "Misión completada. Insignia desbloqueada."
      : `Te faltan ${100 - xp} XP para desbloquear la insignia.`;
  }

  // Recalcular después de interacciones.
  ["click", "input", "change", "keyup"].forEach(eventName => {
    document.addEventListener(eventName, () => {
      setTimeout(renderXP, 80);
      setTimeout(renderXP, 350);
      setTimeout(renderXP, 900);
    }, true);
  });

  // Recalcular cuando localStorage cambie dentro de la misma página.
  if (!window.__clase7StoragePatchApplied) {
    window.__clase7StoragePatchApplied = true;

    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function patchedSetItem(key, value) {
      originalSetItem.apply(this, arguments);

      if (String(key).toLowerCase().includes("clase7") || String(key).toLowerCase().includes("class7")) {
        setTimeout(renderXP, 80);
        setTimeout(renderXP, 350);
      }
    };
  }

  window.addEventListener("storage", renderXP);

  renderXP();
  setTimeout(renderXP, 500);
  setTimeout(renderXP, 1200);
});

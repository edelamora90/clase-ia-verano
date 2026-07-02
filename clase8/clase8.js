/* Clase 8 · Data Cleaning Lab autoguiado */
document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "clase8AutoguiadaProgress";

  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("course-sidebar");

  if (sidebarToggle && sidebar) {
    const desktopQuery = window.matchMedia("(min-width: 1101px)");
    const sectionLinks = Array.from(sidebar.querySelectorAll("[data-c8-scroll-link]"));

    function isDesktopLayout() {
      return desktopQuery.matches;
    }

    function setSidebarOpen(open) {
      document.body.classList.toggle("sidebar-collapsed", !open);
      sidebar.classList.toggle("is-hidden", !open);
      sidebarToggle.textContent = open ? "×" : "☰";
      sidebarToggle.setAttribute("aria-label", open ? "Ocultar menú" : "Mostrar menú");
      sidebarToggle.setAttribute("aria-expanded", String(open));
    }

    function syncSectionLinks() {
      if (!sectionLinks.length) return;

      const reference = window.scrollY + window.innerHeight * 0.34;
      let activeSection = null;

      sectionLinks.forEach(link => {
        const target = document.querySelector(link.hash);
        if (!target) return;

        const top = target.getBoundingClientRect().top + window.scrollY;
        if (top <= reference) {
          activeSection = target;
        }
      });

      sectionLinks.forEach(link => {
        link.classList.toggle("is-current", Boolean(activeSection && link.hash === `#${activeSection.id}`));
      });
    }

    let wasDesktop = isDesktopLayout();
    setSidebarOpen(wasDesktop);

    sidebarToggle.addEventListener("click", () => {
      setSidebarOpen(document.body.classList.contains("sidebar-collapsed"));
    });

    window.addEventListener("resize", () => {
      const desktop = isDesktopLayout();

      if (desktop !== wasDesktop) {
        setSidebarOpen(desktop);
        wasDesktop = desktop;
      }

      syncSectionLinks();
    });

    sectionLinks.forEach(link => {
      link.addEventListener("click", event => {
        const target = document.querySelector(link.hash);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });

        if (!isDesktopLayout()) {
          setSidebarOpen(false);
        }

        window.setTimeout(syncSectionLinks, 260);
      });
    });

    window.addEventListener("scroll", syncSectionLinks, { passive: true });
    syncSectionLinks();
  }

  const checks = Array.from(document.querySelectorAll("[data-c8-mission][data-xp]"));
  const xpValue = document.getElementById("c8-xp-value");
  const xpFill = document.getElementById("c8-progress-fill");
  const xpText = document.getElementById("c8-progress-text");
  const unlock = document.getElementById("c8-unlock");

  function readProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function updateXP() {
    const progress = readProgress();
    let xp = 0;

    checks.forEach(check => {
      const key = check.dataset.c8Mission;
      const completed = Boolean(progress[key]);

      check.checked = completed;
      check.closest(".c8edu-mission-card")?.classList.toggle("completed", completed);

      if (completed) {
        xp += Number(check.dataset.xp || 0);
      }
    });

    xp = Math.min(100, xp);

    if (xpValue) xpValue.textContent = `${xp} XP`;
    if (xpFill) xpFill.style.width = `${xp}%`;

    if (xpText) {
      xpText.textContent = xp >= 100
        ? "Misión completada. Insignia desbloqueada."
        : `Te faltan ${100 - xp} XP para desbloquear la insignia.`;
    }

    if (unlock) unlock.hidden = xp < 100;
  }

  checks.forEach(check => {
    check.addEventListener("change", () => {
      const progress = readProgress();
      progress[check.dataset.c8Mission] = check.checked;
      saveProgress(progress);
      updateXP();
    });
  });

  document.querySelectorAll(".c8edu-copy").forEach(button => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target) return;

      const original = button.textContent;

      try {
        await navigator.clipboard.writeText(target.textContent.trim());
        button.textContent = "Copiado";
        button.classList.add("copied");
      } catch {
        button.textContent = "Copia manual";
      }

      setTimeout(() => {
        button.textContent = original;
        button.classList.remove("copied");
      }, 1400);
    });
  });

  const sections = Array.from(document.querySelectorAll("[data-section]"));
  const prev = document.getElementById("c8-prev");
  const next = document.getElementById("c8-next");

  function currentSectionIndex() {
    const reference = window.scrollY + window.innerHeight * 0.38;
    let index = 0;

    sections.forEach((section, i) => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      if (top <= reference) index = i;
    });

    return index;
  }

  function updateNav() {
    if (!prev || !next || !sections.length) return;

    const current = currentSectionIndex();

    prev.disabled = current <= 0;
    next.disabled = current >= sections.length - 1;
  }

  function goTo(direction) {
    const current = currentSectionIndex();
    const targetIndex = Math.max(0, Math.min(sections.length - 1, current + direction));
    const target = sections[targetIndex];

    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - 24;

    window.scrollTo({ top, behavior: "smooth" });

    setTimeout(updateNav, 450);
  }

  prev?.addEventListener("click", () => goTo(-1));
  next?.addEventListener("click", () => goTo(1));

  window.addEventListener("scroll", updateNav, { passive: true });
  window.addEventListener("resize", updateNav);

  updateXP();
  updateNav();

  window.c8UpdateXP = updateXP;
});

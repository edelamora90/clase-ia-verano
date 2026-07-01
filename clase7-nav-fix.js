/* Clase 7 · navegación discreta por secciones */
document.addEventListener("DOMContentLoaded", () => {
  const prevBtn = document.getElementById("c7-section-prev");
  const nextBtn = document.getElementById("c7-section-next");

  if (!prevBtn || !nextBtn) return;

  function getSections() {
    return Array.from(
      document.querySelectorAll(
        ".class7-hero[data-section], .class7-section[data-section], .class7-credit-section[data-section]"
      )
    ).filter(section => {
      const rect = section.getBoundingClientRect();
      const style = window.getComputedStyle(section);

      return style.display !== "none" && rect.height > 0;
    });
  }

  function getCurrentIndex(sections) {
    const referenceY = window.scrollY + window.innerHeight * 0.38;
    let current = 0;

    sections.forEach((section, index) => {
      const top = section.getBoundingClientRect().top + window.scrollY;

      if (top <= referenceY) {
        current = index;
      }
    });

    return current;
  }

  function go(direction) {
    const sections = getSections();

    if (!sections.length) return;

    const currentIndex = getCurrentIndex(sections);
    const targetIndex = Math.max(
      0,
      Math.min(sections.length - 1, currentIndex + direction)
    );

    const target = sections[targetIndex];

    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - 10;

    window.scrollTo({
      top,
      behavior: "smooth"
    });

    setTimeout(updateState, 350);
  }

  function updateState() {
    const sections = getSections();

    if (!sections.length) return;

    const currentIndex = getCurrentIndex(sections);

    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= sections.length - 1;

    prevBtn.classList.toggle("is-disabled", prevBtn.disabled);
    nextBtn.classList.toggle("is-disabled", nextBtn.disabled);
  }

  // Captura el click antes que otros scripts.
  prevBtn.addEventListener("click", event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    go(-1);
  }, true);

  nextBtn.addEventListener("click", event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    go(1);
  }, true);

  window.addEventListener("scroll", updateState, { passive: true });
  window.addEventListener("resize", updateState);

  updateState();
});

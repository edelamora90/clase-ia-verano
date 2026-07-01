/* Clase 7 · Tablero de misiones estilo Clase 6 */
document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "clase7MissionBoardProgress";

  const board = document.getElementById("c7-mission-board");
  const checks = Array.from(document.querySelectorAll("[data-c7-mission][data-xp]"));

  const xpValue = document.getElementById("c7-xp-value");
  const xpFill = document.getElementById("c7-progress-fill");
  const xpText = document.getElementById("c7-progress-text");
  const unlock = document.getElementById("c7-unlock");

  if (!board || !checks.length || !xpValue || !xpFill || !xpText) return;

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

  function calculateXP(progress) {
    return checks.reduce((sum, check) => {
      const completed = Boolean(progress[check.dataset.c7Mission]);
      return sum + (completed ? Number(check.dataset.xp || 0) : 0);
    }, 0);
  }

  function updateXP() {
    const progress = readProgress();
    const xp = Math.min(100, calculateXP(progress));

    checks.forEach(check => {
      const completed = Boolean(progress[check.dataset.c7Mission]);
      check.checked = completed;
      check.closest(".class7-mission-card")?.classList.toggle("completed", completed);
    });

    xpValue.textContent = `${xp} XP`;
    xpFill.style.width = `${xp}%`;
    xpFill.setAttribute("aria-valuenow", String(xp));

    xpText.textContent = xp >= 100
      ? "Misión completada. Insignia desbloqueada."
      : `Te faltan ${100 - xp} XP para desbloquear la insignia.`;

    if (unlock) {
      unlock.hidden = xp < 100;
    }
  }

  checks.forEach(check => {
    check.addEventListener("change", () => {
      const progress = readProgress();
      progress[check.dataset.c7Mission] = check.checked;
      saveProgress(progress);
      updateXP();
    });
  });

  window.c7MissionBoardUpdateXP = updateXP;

  updateXP();
});

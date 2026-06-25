(() => {
  function initToolMenu() {
    const menu = document.querySelector('.tool-page-menu');
    if (!menu) return;
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    menu.querySelectorAll('a').forEach(link => {
      const hrefFile = link.getAttribute('href')?.split('/').pop();
      const active = hrefFile === currentFile;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
    });
  }

  function initToolMiniActivities() {
    document.querySelectorAll('[data-tool-activity]').forEach(activity => {
      const reset = activity.querySelector('[data-tool-reset]');
      const cases = Array.from(activity.querySelectorAll('.tool-activity-case'));
      const groups = cases.length ? cases : [activity];

      groups.forEach(group => {
        const feedback = group.querySelector('.tool-activity-feedback');
        const cards = Array.from(group.querySelectorAll('.tool-choice-card[data-correct]'));

        cards.forEach(card => {
          card.addEventListener('click', () => {
            const isCorrect = card.dataset.correct === 'true';
            cards.forEach(item => {
              item.classList.remove('selected', 'is-correct', 'is-wrong');
              item.setAttribute('aria-pressed', 'false');
            });
            card.classList.add('selected', isCorrect ? 'is-correct' : 'is-wrong');
            card.setAttribute('aria-pressed', 'true');
            if (feedback) {
              feedback.className = `tool-activity-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`;
              feedback.textContent = card.dataset.feedback || (isCorrect ? 'Correcto.' : 'Revisa el tipo de dato y la salida esperada.');
            }
          });
        });
      });

      if (reset) {
        reset.addEventListener('click', () => {
          activity.querySelectorAll('.tool-choice-card[data-correct]').forEach(card => {
            card.classList.remove('selected', 'is-correct', 'is-wrong');
            card.setAttribute('aria-pressed', 'false');
          });
          activity.querySelectorAll('.tool-activity-feedback').forEach(feedback => {
            feedback.className = 'tool-activity-feedback';
            feedback.textContent = feedback.dataset.default || 'Elige una tarjeta para ver retroalimentación.';
          });
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initToolMenu();
    initToolMiniActivities();
  });
})();

(() => {
  const routes = {
    home: 'index.html',
    'clase-1': 'clase1.html',
    'clase-2': 'clase2.html',
    'clase-3': 'clase3.html',
    'clase-4': 'clase4.html',
    'clase-5': 'clase5.html',
    'clase-6': 'clase6.html',
  'clase-7': 'clase7.html',
    'herramienta-redes-neuronales': 'herramienta-redes-neuronales.html',
    'herramienta-robotica': 'herramienta-robotica.html',
    'herramienta-vision-artificial': 'herramienta-vision-artificial.html',
    'herramienta-logica-difusa': 'herramienta-logica-difusa.html',
    'herramienta-pln': 'herramienta-pln.html',
    'herramienta-sistemas-expertos': 'herramienta-sistemas-expertos.html'
  };
  let sections = [];
  let currentSection = 0;
  function refreshActiveSections() { sections = Array.from(document.querySelectorAll('section[data-section]')); currentSection = Math.min(currentSection, Math.max(sections.length - 1, 0)); }
  function updateSectionIndicator() { const indicator = document.getElementById('section-indicator'); const prev = document.getElementById('btn-prev'); const next = document.getElementById('btn-next'); if (!indicator || !prev || !next) return; const total = sections.length || 1; indicator.textContent = (currentSection + 1) + ' / ' + total; prev.disabled = currentSection === 0; next.disabled = currentSection >= total - 1; }
  function goToSection(index) { if (!sections.length) refreshActiveSections(); if (index < 0 || index >= sections.length) return; currentSection = index; sections[index].scrollIntoView({ behavior: 'smooth' }); sections[index].classList.add('visible'); updateSectionIndicator(); }
  function updateProgressBar() { const bar = document.getElementById('progress-bar'); if (!bar) return; const docHeight = document.documentElement.scrollHeight - window.innerHeight; const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0; bar.style.width = progress + '%'; }
  function trackCurrentSection() { if (!sections.length) return; const scrollPos = window.scrollY + window.innerHeight / 3; sections.forEach((section, index) => { const top = section.offsetTop; const bottom = top + section.offsetHeight; if (scrollPos >= top && scrollPos < bottom && currentSection !== index) { currentSection = index; updateSectionIndicator(); } }); }
  function initSectionObserver() { if (!('IntersectionObserver' in window)) { sections.forEach(section => section.classList.add('visible')); return; } const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); }); }, { threshold: 0.1 }); sections.forEach(section => observer.observe(section)); }
  function switchLesson(lessonId, sectionIndex = 0) { const current = document.body.dataset.activeLesson; if (current === lessonId && sections.length) { goToSection(sectionIndex); return; } window.location.href = routes[lessonId] || routes.home; }
  function initSidebar() { const sidebarToggle = document.getElementById('sidebar-toggle'); const sidebar = document.getElementById('course-sidebar'); if (!sidebarToggle || !sidebar) return; const stored = localStorage.getItem('sidebarCollapsed'); const mobileDefault = window.matchMedia('(max-width: 768px)').matches; const shouldCollapse = stored === 'true' || (stored === null && mobileDefault); sidebar.classList.toggle('collapsed', shouldCollapse); document.body.classList.toggle('sidebar-collapsed', shouldCollapse); sidebarToggle.textContent = shouldCollapse ? '☰' : '✕'; sidebarToggle.addEventListener('click', () => { const isCollapsed = sidebar.classList.toggle('collapsed'); document.body.classList.toggle('sidebar-collapsed', isCollapsed); localStorage.setItem('sidebarCollapsed', String(isCollapsed)); sidebarToggle.textContent = isCollapsed ? '☰' : '✕'; }); document.querySelectorAll('.lesson-tab[data-lesson]').forEach(tab => { tab.addEventListener('click', (event) => { const lessonId = tab.dataset.lesson; if (document.body.dataset.activeLesson === lessonId) { event.preventDefault(); goToSection(0); } }); }); document.querySelectorAll('[data-switch-lesson]').forEach(btn => { btn.addEventListener('click', () => switchLesson(btn.dataset.switchLesson)); }); document.querySelectorAll('[data-home-link]').forEach(btn => { btn.addEventListener('click', () => { window.location.href = btn.dataset.homeLink || 'index.html'; }); }); }
  function initPresentationNav() { const prev = document.getElementById('btn-prev'); const next = document.getElementById('btn-next'); if (prev) prev.addEventListener('click', () => goToSection(currentSection - 1)); if (next) next.addEventListener('click', () => goToSection(currentSection + 1)); document.addEventListener('keydown', (e) => { if (!sections.length || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return; if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && currentSection < sections.length - 1) { e.preventDefault(); goToSection(currentSection + 1); } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && currentSection > 0) { e.preventDefault(); goToSection(currentSection - 1); } }); }
  function initAgendaAccordions(scope = document) { scope.querySelectorAll('.agenda-item').forEach(item => { item.addEventListener('click', () => { const parent = item.closest('.agenda-timeline') || document; const isActive = item.classList.contains('active'); parent.querySelectorAll('.agenda-item').forEach(i => i.classList.remove('active')); if (!isActive) item.classList.add('active'); }); }); }
  function init() { refreshActiveSections(); initSidebar(); initPresentationNav(); initSectionObserver(); initAgendaAccordions(); updateSectionIndicator(); updateProgressBar(); if (sections[0]) sections[0].classList.add('visible'); window.addEventListener('scroll', () => { updateProgressBar(); trackCurrentSection(); }); }
  window.Course = { goToSection, switchLesson, refreshActiveSections, updateProgressBar, trackCurrentSection, updateSectionIndicator, initAgendaAccordions };
  document.addEventListener('DOMContentLoaded', init);
})();


/* ========================================================= */
/* SECCIÓN 10 — EVALUACIÓN FINAL CON IA */
/* ========================================================= */

function copiarPromptEvaluacionIA() {
  const prompt = document.getElementById("prompt-evaluacion-ia");

  if (!prompt) {
    alert("No se encontró el prompt de evaluación.");
    return;
  }

  prompt.select();
  prompt.setSelectionRange(0, 99999);

  navigator.clipboard
    .writeText(prompt.value)
    .then(() => {
      alert("Prompt copiado correctamente.");
    })
    .catch(() => {
      alert("No se pudo copiar automáticamente. Selecciona el texto y cópialo manualmente.");
    });
}

function generarPDFReporteFinal() {
  const botonPDF = document.querySelector(".pdf-final-section");

  if (botonPDF) {
    botonPDF.style.display = "none";
  }

  window.print();

  setTimeout(() => {
    if (botonPDF) {
      botonPDF.style.display = "";
    }
  }, 500);
}


/* Hero parallax neuronal · compatible con index-hero-pro y h-root */
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".index-hero-pro, .h-root");
  if (!hero || hero.dataset.parallaxReady === "true") return;

  hero.dataset.parallaxReady = "true";

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;

  function setParallaxVars(x, y) {
    hero.style.setProperty("--mx", `${x}px`);
    hero.style.setProperty("--my", `${y}px`);

    const neuralBg = hero.querySelector(".hero-neural-bg");
    if (neuralBg) {
      neuralBg.style.setProperty("--mx", `${x}px`);
      neuralBg.style.setProperty("--my", `${y}px`);
    }
  }

  hero.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const normalizedX = (x - rect.width / 2) / (rect.width / 2);
    const normalizedY = (y - rect.height / 2) / (rect.height / 2);

    targetX = normalizedX * 34;
    targetY = normalizedY * 34;
  });

  hero.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;
  });

  function animateParallax() {
    currentX += (targetX - currentX) * 0.10;
    currentY += (targetY - currentY) * 0.10;

    setParallaxVars(currentX, currentY);

    requestAnimationFrame(animateParallax);
  }

  animateParallax();
});


/* Hero parallax neuronal · compatible con index-hero-pro y h-root */
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".index-hero-pro, .h-root");
  if (!hero || hero.dataset.parallaxReady === "true") return;

  hero.dataset.parallaxReady = "true";

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;

  function setParallaxVars(x, y) {
    hero.style.setProperty("--mx", `${x}px`);
    hero.style.setProperty("--my", `${y}px`);

    const neuralBg = hero.querySelector(".hero-neural-bg");
    if (neuralBg) {
      neuralBg.style.setProperty("--mx", `${x}px`);
      neuralBg.style.setProperty("--my", `${y}px`);
    }
  }

  hero.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const normalizedX = (x - rect.width / 2) / (rect.width / 2);
    const normalizedY = (y - rect.height / 2) / (rect.height / 2);

    targetX = normalizedX * 34;
    targetY = normalizedY * 34;
  });

  hero.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;
  });

  function animateParallax() {
    currentX += (targetX - currentX) * 0.10;
    currentY += (targetY - currentY) * 0.10;

    setParallaxVars(currentX, currentY);

    requestAnimationFrame(animateParallax);
  }

  animateParallax();
});


});

});


/* Sidebar toggle estable */
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("course-sidebar") || document.querySelector(".course-sidebar");
  const shell = document.querySelector(".app-shell");

  if (!toggle || !sidebar) return;
  if (toggle.dataset.sidebarToggleReady === "true") return;

  toggle.dataset.sidebarToggleReady = "true";

  function syncSidebarIcon() {
    const isCollapsed = document.body.classList.contains("sidebar-collapsed");

    toggle.textContent = isCollapsed ? "☰" : "×";
    toggle.setAttribute(
      "aria-label",
      isCollapsed ? "Mostrar menú" : "Ocultar menú"
    );
  }

  toggle.addEventListener("click", () => {
    const isCollapsed = document.body.classList.toggle("sidebar-collapsed");

    sidebar.classList.toggle("is-hidden", isCollapsed);

    if (shell) {
      shell.classList.toggle("sidebar-collapsed", isCollapsed);
    }

    syncSidebarIcon();
  });

  syncSidebarIcon();
});


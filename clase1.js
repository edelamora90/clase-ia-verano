const AI_APPS = {
  netflix: '<strong>Netflix</strong> usa algoritmos de recomendación basados en tu historial de visualización, calificaciones y comportamiento de millones de usuarios. También usa IA para optimizar la calidad de streaming y generar miniaturas personalizadas.',
  youtube: '<strong>YouTube</strong> emplea IA para recomendar videos en tu feed, moderar contenido inapropiado automáticamente, generar subtítulos y analizar tendencias para sugerirte contenido relevante.',
  spotify: '<strong>Spotify</strong> crea playlists personalizadas como Discover Weekly usando aprendizaje automático. Analiza tus gustos musicales, ritmo de escucha y preferencias de millones de usuarios similares.',
  maps: '<strong>Google Maps</strong> predice tráfico en tiempo real analizando datos de millones de dispositivos, optimiza rutas con IA y reconoce edificios y señales mediante visión por computadora.',
  whatsapp: '<strong>WhatsApp</strong> usa IA para sugerir respuestas rápidas, traducir mensajes en tiempo real, detectar spam y moderar contenido. Meta AI también ofrece asistente integrado en la app.',
  tiktok: '<strong>TikTok</strong> tiene uno de los algoritmos de recomendación más potentes: analiza cada segundo que ves, tus interacciones y preferencias para crear un feed "Para ti" altamente personalizado.',
  bancos: '<strong>Los bancos</strong> usan IA para detectar fraudes en transacciones en milisegundos, evaluar riesgo crediticio, ofrecer chatbots de atención al cliente y personalizar productos financieros.',
  camara: '<strong>La cámara de tu celular</strong> usa IA para detectar rostros, aplicar modo retrato con desenfoque, mejorar fotos con HDR, reconocer escenas (comida, paisaje, noche) y estabilizar video.'
};

const QUIZ_DATA = [
  {
    question: 'ChatGPT escribiendo un resumen de un artículo.',
    answer: 'generativa',
    explanation: 'ChatGPT es un modelo de IA generativa: crea texto nuevo basándose en patrones aprendidos de millones de documentos.'
  },
  {
    question: 'Una calculadora básica que suma dos números.',
    answer: 'no-ia',
    explanation: 'Una calculadora ejecuta operaciones aritméticas predefinidas sin aprender ni adaptarse. No es IA, es automatización simple.'
  },
  {
    question: 'Netflix recomendando una serie basada en tu historial.',
    answer: 'debil',
    explanation: 'El sistema de recomendación de Netflix es IA débil: está diseñado específicamente para predecir qué contenido te gustará.'
  },
  {
    question: 'Un robot aspiradora detectando obstáculos y ajustando su ruta.',
    answer: 'debil',
    explanation: 'El robot usa sensores y algoritmos para una tarea específica (limpiar y navegar). Es IA débil aplicada a un dominio concreto.'
  },
  {
    question: 'Photoshop generando una imagen a partir de una descripción de texto.',
    answer: 'generativa',
    explanation: 'Generar imágenes nuevas a partir de texto es una función de IA generativa, similar a DALL·E o Midjourney.'
  },
  {
    question: 'Un archivo de Excel con una fórmula de suma simple (=SUMA(A1:A10)).',
    answer: 'no-ia',
    explanation: 'Una fórmula de Excel ejecuta una operación fija sin aprendizaje ni adaptación. Es una herramienta de cálculo, no IA.'
  }
];

let quizAnswered = 0;
function initActivity1() { const result = document.getElementById('activity1-result'); document.querySelectorAll('.activity-btn').forEach(btn => { btn.addEventListener('click', () => { document.querySelectorAll('.activity-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); if (result) result.innerHTML = '<p>' + AI_APPS[btn.dataset.app] + '</p>'; }); }); }
function initQuiz() { quizAnswered = 0; const container = document.getElementById('quiz-container'); if (!container) return; container.innerHTML = ''; QUIZ_DATA.forEach((item, index) => { const div = document.createElement('div'); div.className = 'quiz-item'; div.innerHTML = '<p class="quiz-question">' + (index + 1) + '. ' + item.question + '</p><div class="quiz-options"><button class="quiz-option" data-answer="debil">IA débil</button><button class="quiz-option" data-answer="generativa">IA generativa</button><button class="quiz-option" data-answer="no-ia">No es IA</button></div><div class="quiz-feedback"></div>'; div.querySelectorAll('.quiz-option').forEach(opt => { opt.addEventListener('click', () => handleQuizAnswer(div, opt, item)); }); container.appendChild(div); }); const score = document.getElementById('quiz-score'); if (score) score.textContent = ''; }
function handleQuizAnswer(quizItem, selectedBtn, item) { if (quizItem.classList.contains('answered-correct') || quizItem.classList.contains('answered-wrong')) return; const selected = selectedBtn.dataset.answer; const isCorrect = selected === item.answer; const feedback = quizItem.querySelector('.quiz-feedback'); quizItem.querySelectorAll('.quiz-option').forEach(opt => { opt.disabled = true; if (opt.dataset.answer === item.answer) opt.classList.add('selected-correct'); }); if (isCorrect) { selectedBtn.classList.add('selected-correct'); quizItem.classList.add('answered-correct'); feedback.className = 'quiz-feedback show correct'; feedback.innerHTML = '✅ <strong>Correcto.</strong> ' + item.explanation; } else { selectedBtn.classList.add('selected-wrong'); quizItem.classList.add('answered-wrong'); feedback.className = 'quiz-feedback show wrong'; feedback.innerHTML = '❌ <strong>Incorrecto.</strong> ' + item.explanation; } quizAnswered++; if (quizAnswered === QUIZ_DATA.length) { const correct = document.querySelectorAll('.quiz-item.answered-correct').length; document.getElementById('quiz-score').textContent = 'Puntuación: ' + correct + ' de ' + QUIZ_DATA.length + ' correctas'; } }
function initFlipCards() { document.querySelectorAll('.flip-card').forEach(card => { card.addEventListener('click', () => card.classList.toggle('flipped')); card.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('flipped'); } }); }); }
function initDebate() { document.querySelectorAll('.debate-toggle').forEach(btn => { btn.addEventListener('click', () => { const ideas = btn.nextElementSibling; const isShown = ideas.classList.contains('show'); ideas.classList.toggle('show'); btn.textContent = isShown ? 'Mostrar ideas para discutir' : 'Ocultar ideas'; }); }); }
function resetClass1() { document.querySelectorAll('.flip-card').forEach(card => card.classList.remove('flipped')); document.querySelectorAll('.agenda-item').forEach(item => item.classList.remove('active')); document.querySelectorAll('.activity-btn').forEach(btn => btn.classList.remove('active')); const result = document.getElementById('activity1-result'); if (result) result.innerHTML = '<p>👆 Selecciona un servicio para ver cómo usa IA en tu vida diaria.</p>'; initQuiz(); document.querySelectorAll('.debate-ideas').forEach(el => el.classList.remove('show')); document.querySelectorAll('.debate-toggle').forEach(btn => { btn.textContent = 'Mostrar ideas para discutir'; }); window.Course?.goToSection(0); }
document.addEventListener('DOMContentLoaded', () => { initActivity1(); initQuiz(); initFlipCards(); initDebate(); document.getElementById('btn-iniciar')?.addEventListener('click', () => window.Course?.goToSection(1)); document.getElementById('btn-reiniciar')?.addEventListener('click', resetClass1); });

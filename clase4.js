(() => {
  const CLASS4_OPTIONS = [
    'Robótica',
    'Redes neuronales / Machine Learning (ML)',
    'Visión artificial',
    'Lógica difusa',
    'Procesamiento de Lenguaje Natural (PLN)',
    'Sistemas expertos'
  ];

  const CLASS4_CASES = [
    {
      text: 'Una app identifica si una planta está enferma usando una foto.',
      dataType: 'Imagen',
      answer: 'Visión artificial',
      explanation: 'El sistema necesita analizar patrones visuales en una imagen.'
    },
    {
      text: 'Un chatbot responde dudas administrativas de alumnos.',
      dataType: 'Texto',
      answer: 'Procesamiento de Lenguaje Natural (PLN)',
      explanation: 'El sistema interpreta lenguaje humano y genera respuestas.'
    },
    {
      text: 'Un robot evita obstáculos en un pasillo.',
      dataType: 'Sensores y movimiento',
      answer: 'Robótica',
      explanation: 'El sistema debe percibir el entorno físico y actuar.'
    },
    {
      text: 'Un sistema recomienda cursos según historial académico.',
      dataType: 'Datos históricos',
      answer: 'Redes neuronales / Machine Learning (ML)',
      explanation: 'El sistema aprende patrones a partir de registros previos.'
    },
    {
      text: 'Un aire acondicionado ajusta intensidad según temperatura.',
      dataType: 'Variable gradual',
      answer: 'Lógica difusa',
      explanation: 'El sistema trabaja con grados como frío, templado o caliente.'
    },
    {
      text: 'Un sistema diagnostica fallas a partir de síntomas.',
      dataType: 'Reglas',
      answer: 'Sistemas expertos',
      explanation: 'El conocimiento puede representarse mediante reglas SI/ENTONCES.'
    }
  ];

  const TOOL_DATA = [
    { id: 'robotica', name: 'Robótica', url: 'herramienta-robotica.html', img: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=700&q=80', alt: 'Robot autónomo en un entorno tecnológico', when: 'el sistema debe moverse o actuar físicamente.', example: 'robot repartidor.', risk: 'seguridad, obstáculos y batería.' },
    { id: 'redes', name: 'Redes neuronales / Machine Learning (ML)', url: 'herramienta-redes-neuronales.html', img: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=700&q=80', alt: 'Código y datos para aprendizaje automático', when: 'hay datos históricos para aprender patrones.', example: 'riesgo académico.', risk: 'sesgo o datos incompletos.' },
    { id: 'vision', name: 'Visión artificial', url: 'herramienta-vision-artificial.html', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=700&q=80', alt: 'Análisis visual con tecnología', when: 'la entrada son imágenes o video.', example: 'equipo de seguridad.', risk: 'privacidad e iluminación.' },
    { id: 'difusa', name: 'Lógica difusa', url: 'herramienta-logica-difusa.html', img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80', alt: 'Panel de automatización industrial', when: 'la decisión usa grados bajo, medio o alto.', example: 'control de temperatura.', risk: 'mala calibración.' },
    { id: 'pln', name: 'Procesamiento de Lenguaje Natural (PLN)', url: 'herramienta-pln.html', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=80', alt: 'Comunicación mediante texto en computadora', when: 'el problema usa texto o voz.', example: 'chatbot escolar.', risk: 'ambigüedad o respuestas incorrectas.' },
    { id: 'expertos', name: 'Sistemas expertos', url: 'herramienta-sistemas-expertos.html', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=700&q=80', alt: 'Equipo analizando reglas de decisión', when: 'el conocimiento se puede escribir como reglas.', example: 'diagnóstico de fallas.', risk: 'reglas incompletas.' }
  ];

  const PROBLEM_DATA = {
    vision: { area: 'Visión artificial', reason: 'La evidencia son imágenes o video que deben analizarse visualmente.', risk: 'Privacidad o mala iluminación.' },
    pln: { area: 'Procesamiento de Lenguaje Natural (PLN)', reason: 'El sistema debe interpretar preguntas y responder en lenguaje natural.', risk: 'Respuestas incorrectas o falta de contexto.' },
    robotica: { area: 'Robótica', reason: 'El sistema debe percibir sensores y moverse en un espacio físico.', risk: 'Obstáculos y seguridad.' },
    expertos: { area: 'Sistemas expertos', reason: 'Las fallas conocidas pueden modelarse con reglas SI/ENTONCES.', risk: 'Reglas incompletas.' },
    difusa: { area: 'Lógica difusa', reason: 'La intensidad se decide por grados como bajo, medio o alto.', risk: 'Mala calibración.' },
    redes: { area: 'Redes neuronales / Machine Learning (ML)', reason: 'El sistema aprende patrones desde registros académicos históricos.', risk: 'Sesgo o datos incompletos.' }
  };

  const triggerFeedback = {
    vision: 'No es la opción principal: visión artificial serviría si el dato central fueran imágenes o video.',
    pln: 'Podría ayudar si se analizaran textos, pero aquí el dato principal son registros académicos.',
    redes: 'Correcto. La opción más adecuada sería aprendizaje automático o redes neuronales, porque usa datos históricos como asistencia, calificaciones y tareas para predecir riesgo. También puede complementarse con reglas de docentes.',
    robotica: 'No corresponde: robótica aplica cuando el sistema debe moverse o actuar físicamente.',
    expertos: 'Puede complementar la solución con reglas académicas, pero por sí solo no aprende patrones históricos.',
    difusa: 'No es la opción principal: lógica difusa serviría si se definieran grados manuales de riesgo.'
  };

  let caseIndex = 0;
  let score = 0;
  let answered = false;
  let selectedAnswers = [];

  function initStartButton() {
    const btn = document.querySelector('[data-c4-start]');
    const labStart = document.getElementById('class4-lab-start');
    if (btn && labStart) {
      btn.addEventListener('click', () => {
        const top = labStart.getBoundingClientRect().top + window.scrollY - 84;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    }
  }

  function initDecisionMap() {
    const options = document.getElementById('c4-trigger-options');
    const feedback = document.getElementById('c4-trigger-feedback');
    if (!options || !feedback) return;
    options.addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-answer]');
      if (!btn) return;
      options.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === btn));
      const correct = btn.dataset.answer === 'redes';
      feedback.className = `c4-trigger-feedback ${correct ? 'is-correct' : 'is-partial'}`;
      feedback.textContent = triggerFeedback[btn.dataset.answer];
    });
  }

  function initAreaToolbox() {
    const grid = document.getElementById('c4-tool-grid');
    if (!grid) return;
    grid.innerHTML = TOOL_DATA.map(tool => `
      <article class="c4-tool-card class4-tool-card" data-tool="${tool.id}">
        <img src="${tool.img}" alt="${tool.alt}" loading="lazy" onerror="this.style.display='none'; this.parentElement.classList.add('image-fallback');">
        <h3>${tool.name}</h3>
        <p><strong>Sirve cuando:</strong> ${tool.when}</p>
        <p><strong>Ejemplo:</strong> ${tool.example}</p>
        <p><strong>Riesgo:</strong> ${tool.risk}</p>
        <a class="class4-tool-link tool-detail-link" href="${tool.url}">Ver explicación completa →</a>
      </article>
    `).join('');
  }

  function initProblemLab() {
    const board = document.querySelector('.c4-problem-board');
    if (!board) return;
    board.addEventListener('click', (event) => {
      const btn = event.target.closest('button');
      if (!btn) return;
      const card = btn.closest('.c4-problem-card');
      const data = PROBLEM_DATA[card.dataset.problem];
      const reveal = card.querySelector('.c4-problem-reveal');
      if (!data || !reveal) return;
      reveal.hidden = false;
      reveal.innerHTML = `<p><strong>Área recomendada:</strong> ${data.area}</p><p><strong>Justificación:</strong> ${data.reason}</p><p><strong>Riesgo:</strong> ${data.risk}</p>`;
      btn.textContent = 'Área revelada';
      btn.disabled = true;
    });
  }

  function renderClassifier() {
    const root = document.getElementById('c4-simulator');
    if (!root) return;
    const item = CLASS4_CASES[caseIndex];
    const finished = caseIndex >= CLASS4_CASES.length;
    if (finished) {
      root.innerHTML = `<div class="c4-sim-result"><h3>Resultado: ${score} / ${CLASS4_CASES.length}</h3><p>Recomendación: captura esta pantalla o transcribe tus resultados en tu PDF.</p><button class="btn btn-primary btn-small" type="button" id="c4-sim-reset">Reiniciar</button></div>`;
      return;
    }
    root.innerHTML = `
      <div class="c4-sim-head"><span>Caso ${caseIndex + 1} de ${CLASS4_CASES.length}</span><strong>Aciertos: ${score}</strong></div>
      <article class="c4-sim-case"><h3>${item.text}</h3><p><strong>Tipo de dato:</strong> ${item.dataType}</p></article>
      <div class="c4-sim-options class4-classifier-options">${CLASS4_OPTIONS.map(option => `<button class="class4-option-btn" type="button" data-area-option="${option}">${option}</button>`).join('')}</div>
      <div class="c4-sim-feedback class4-feedback" id="c4-sim-feedback">Elige un área para recibir retroalimentación.</div>
      <div class="c4-sim-actions"><button class="btn btn-secondary btn-small" type="button" id="c4-sim-next">Siguiente caso</button><button class="btn btn-secondary btn-small" type="button" id="c4-sim-reset">Reiniciar</button></div>
    `;
    answered = false;
  }

  function initApplicationClassifier() {
    const root = document.getElementById('c4-simulator');
    if (!root) return;
    renderClassifier();
    root.addEventListener('click', (event) => {
      const option = event.target.closest('[data-area-option]');
      if (option) {
        const item = CLASS4_CASES[caseIndex];
        const correct = option.dataset.areaOption === item.answer;
        root.querySelectorAll('[data-area-option]').forEach(btn => {
          btn.classList.remove('correct', 'wrong');
          if (btn.dataset.areaOption === item.answer) btn.classList.add('correct');
        });
        if (!correct) option.classList.add('wrong');
        if (correct && !answered) {
          score += 1;
          selectedAnswers[caseIndex] = item.answer;
          answered = true;
        }
        const feedback = document.getElementById('c4-sim-feedback');
        feedback.className = `c4-sim-feedback class4-feedback ${correct ? 'is-correct' : 'is-wrong'}`;
        feedback.textContent = `${correct ? 'Correcto.' : 'Incorrecto.'} ${item.explanation}`;
        root.querySelector('.c4-sim-head strong').textContent = `Aciertos: ${score}`;
        return;
      }
      if (event.target.id === 'c4-sim-next') {
        caseIndex += 1;
        renderClassifier();
      }
      if (event.target.id === 'c4-sim-reset') resetClass4();
    });
  }

  function resetClass4() {
    caseIndex = 0;
    score = 0;
    answered = false;
    selectedAnswers = [];
    renderClassifier();
  }

  function initClass4Interactions() {
    initStartButton();
    initDecisionMap();
    initAreaToolbox();
    initProblemLab();
    initApplicationClassifier();
  }

  window.resetClass4 = resetClass4;
  document.addEventListener('DOMContentLoaded', initClass4Interactions);
})();

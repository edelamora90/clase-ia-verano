(() => {
  const STORAGE_KEY = 'clase6DataLabV2Progress';

  const CONCEPT_QUIZ = [
    {
      text: 'Para recomendar una bebida en cafetería, el cliente dice su presupuesto.',
      answer: 'useful',
      explanation: 'El presupuesto ayuda a recomendar algo que el cliente sí puede comprar.'
    },
    {
      text: 'Para recomendar una bebida, se registra el color de la mochila del cliente.',
      answer: 'trash',
      explanation: 'El color de mochila no ayuda a decidir qué bebida recomendar.'
    },
    {
      text: 'Para recomendar un platillo, el sistema pide la CURP del cliente.',
      answer: 'sensitive',
      explanation: 'La CURP es un dato personal sensible e innecesario para recomendar comida.'
    },
    {
      text: 'El cliente pide una recomendación, pero no dice si quiere algo frío o caliente.',
      answer: 'missing',
      explanation: 'Falta un dato importante. La IA debería preguntar antes de recomendar.'
    },
    {
      text: 'Para recomendar un platillo, el cliente indica que es alérgico al camarón.',
      answer: 'useful',
      explanation: 'Puede parecer sensible porque habla de salud, pero en este caso es un dato útil y necesario para evitar una recomendación peligrosa. La regla es pedir solo lo indispensable.'
    },
    {
      text: 'Para recomendar una refacción compatible, el sistema pide el número de placas del vehículo.',
      answer: 'sensitive',
      explanation: 'Puede parecer útil para identificar el vehículo, pero para compatibilidad normalmente bastan marca, modelo, año y motor. Las placas son un dato sensible e innecesario para esta decisión.'
    }
  ];

  const QUALITY_QUIZ = [
    {
      text: 'En el dataset aparecen las categorías: frappe, frappé, frape y Frappe.',
      answer: 'inconsistent',
      explanation: 'Es un problema de inconsistencia. Conviene normalizar a una sola categoría.'
    },
    {
      text: 'Solo se capturaron ventas de la mañana, pero la IA recomendará todo el día.',
      answer: 'bias',
      explanation: 'Hay sesgo porque los datos no representan tarde, noche u otros contextos.'
    },
    {
      text: 'El cliente no indicó presupuesto, pero el asistente debe recomendar un producto.',
      answer: 'missing',
      explanation: 'Falta un dato importante. La IA debería preguntar presupuesto.'
    },
    {
      text: 'El dataset pide dirección exacta para recomendar una bebida.',
      answer: 'privacy',
      explanation: 'Es un problema de privacidad. Ese dato no es necesario para la decisión.'
    }
  ];

  const DECISION_HELP = {
    recomendar: {
      title: 'Recomendar algo',
      explanation: 'La IA debe sugerir la mejor opción para una persona según sus necesidades, preferencias o contexto.',
      target: 'recomendacion',
      dataNeeded: 'preferencias, presupuesto, contexto, restricciones y opciones disponibles'
    },
    clasificar: {
      title: 'Clasificar un caso',
      explanation: 'La IA debe asignar una categoría a un caso. Por ejemplo: bajo, medio, alto; urgente, no urgente; queja, duda o venta.',
      target: 'categoria',
      dataNeeded: 'características del caso, señales observables y criterios de clasificación'
    },
    predecir: {
      title: 'Predecir una cantidad',
      explanation: 'La IA debe estimar un número o valor. Por ejemplo: ventas esperadas, demanda, tiempo de atención o probabilidad.',
      target: 'valor_estimado',
      dataNeeded: 'datos históricos, fechas, cantidades anteriores y factores que influyen en el resultado'
    },
    detectar: {
      title: 'Detectar un riesgo',
      explanation: 'La IA debe identificar si existe una alerta, falla, anomalía o situación que requiere atención.',
      target: 'riesgo_detectado',
      dataNeeded: 'síntomas, señales, condiciones, indicadores y contexto del caso'
    },
    generar: {
      title: 'Generar respuesta',
      explanation: 'La IA debe redactar una respuesta, resumen, promoción o mensaje usando contexto y reglas.',
      target: 'respuesta_generada',
      dataNeeded: 'mensaje del usuario, contexto del negocio, reglas, tono y formato esperado'
    }
  };

  const BUSINESS_DATA = {
    cafeteria: {
      label: 'Cafetería',
      icon: '☕',
      problem: 'Muchos clientes no saben qué bebida, snack o combo elegir.',
      suggestedDecision: 'Mi IA debe recomendar una bebida, snack o combo usando datos como clima, horario, presupuesto, gusto y nivel de hambre.',
      target: 'recomendacion',
      modelType: 'Sistema recomendador / clasificación',
      cards: [
        { name: 'horario', example: 'mañana, tarde, noche', type: 'useful', role: 'entrada', reason: 'Ayuda a decidir si conviene algo para iniciar el día, merendar o cerrar la noche.' },
        { name: 'clima', example: 'calor, frío, lluvia', type: 'useful', role: 'entrada', reason: 'Ayuda a decidir entre bebida fría o caliente.' },
        { name: 'presupuesto', example: '50, 80, 100', type: 'useful', role: 'entrada', reason: 'Evita recomendar algo fuera del alcance del cliente.' },
        { name: 'gusto', example: 'dulce, amargo, ligero', type: 'useful', role: 'entrada', reason: 'Ayuda a personalizar la recomendación.' },
        { name: 'nivel_hambre', example: 'bajo, medio, alto', type: 'useful', role: 'entrada', reason: 'Ayuda a decidir si basta una bebida o conviene un combo.' },
        { name: 'recomendacion', example: 'frappé + pan dulce', type: 'target', role: 'objetivo', reason: 'Es la salida que queremos que la IA aprenda a recomendar.' },
        { name: 'color_de_mochila', example: 'azul', type: 'trash', role: 'eliminar', reason: 'No ayuda a recomendar una bebida.' },
        { name: 'marca_de_celular', example: 'iPhone', type: 'trash', role: 'eliminar', reason: 'No aporta valor para decidir qué vender.' },
        { name: 'nombre_completo', example: 'Juan Pérez', type: 'sensitive', role: 'evitar', reason: 'No es necesario para recomendar una bebida.' },
        { name: 'presupuesto_no_indicado', example: 'dato faltante', type: 'missing', role: 'preguntar', reason: 'Si no se conoce el presupuesto, la IA debería preguntarlo.' }
      ],
      csvHeader: ['horario', 'clima', 'presupuesto', 'gusto', 'nivel_hambre', 'recomendacion'],
      sampleRows: [
        ['mañana', 'frío', '50', 'amargo', 'bajo', 'café americano'],
        ['tarde', 'calor', '80', 'dulce', 'medio', 'frappé'],
        ['tarde', 'calor', '100', 'dulce', 'alto', 'frappé + pan dulce'],
        ['mañana', 'frío', '70', 'dulce', 'medio', 'capuchino + galleta'],
        ['noche', 'frío', '60', 'ligero', 'bajo', 'café suave']
      ]
    },
    restaurante: {
      label: 'Restaurante',
      icon: '🍽️',
      problem: 'Los clientes preguntan qué platillo elegir según presupuesto, tiempo y restricciones.',
      suggestedDecision: 'Mi IA debe recomendar un platillo usando datos como presupuesto, tiempo disponible, nivel de hambre, picante y restricciones alimentarias.',
      target: 'platillo_recomendado',
      modelType: 'Sistema recomendador / clasificación',
      cards: [
        { name: 'presupuesto', example: '80, 120, 200', type: 'useful', role: 'entrada', reason: 'Permite recomendar opciones acordes al gasto.' },
        { name: 'tiempo_disponible', example: '15, 30, 45 minutos', type: 'useful', role: 'entrada', reason: 'Ayuda a recomendar algo rápido o elaborado.' },
        { name: 'restriccion_alimentaria', example: 'sin camarón, vegetariano', type: 'useful', role: 'entrada', reason: 'Evita recomendaciones peligrosas o inadecuadas.' },
        { name: 'picante', example: 'sí, no, poco', type: 'useful', role: 'entrada', reason: 'Ayuda a adaptar el platillo al gusto del cliente.' },
        { name: 'platillo_recomendado', example: 'tacos, ensalada, sopa', type: 'target', role: 'objetivo', reason: 'Es la salida que queremos obtener.' },
        { name: 'color_de_playera', example: 'rojo', type: 'trash', role: 'eliminar', reason: 'No ayuda a recomendar comida.' },
        { name: 'equipo_favorito', example: 'equipo de fútbol', type: 'trash', role: 'eliminar', reason: 'No aporta valor para la decisión.' },
        { name: 'direccion_exacta', example: 'calle y número', type: 'sensitive', role: 'evitar', reason: 'No hace falta para recomendar un platillo.' },
        { name: 'alergia_no_indicada', example: 'dato faltante', type: 'missing', role: 'preguntar', reason: 'Si hay sospecha de alergia, se debe preguntar antes de recomendar.' }
      ],
      csvHeader: ['presupuesto', 'tiempo_disponible', 'restriccion_alimentaria', 'picante', 'platillo_recomendado'],
      sampleRows: [
        ['80', '15', 'ninguna', 'no', 'tacos sencillos'],
        ['120', '30', 'ninguna', 'poco', 'combo individual'],
        ['100', '20', 'vegetariano', 'no', 'ensalada vegetariana'],
        ['180', '45', 'ninguna', 'sí', 'platillo especial'],
        ['90', '15', 'sin camarón', 'no', 'pollo a la plancha']
      ]
    },
    refaccionaria: {
      label: 'Refaccionaria',
      icon: '🔧',
      problem: 'Clientes describen fallas, pero no saben qué refacción necesitan.',
      suggestedDecision: 'Mi IA debe orientar una posible refacción o sistema a revisar usando datos como marca, modelo, año, motor, síntoma y ruido.',
      target: 'refaccion_posible',
      modelType: 'Clasificación / sistema experto asistido',
      cards: [
        { name: 'marca', example: 'Nissan, Toyota, Ford', type: 'useful', role: 'entrada', reason: 'Ayuda a validar compatibilidad.' },
        { name: 'modelo', example: 'Versa, Corolla', type: 'useful', role: 'entrada', reason: 'Es clave para buscar piezas correctas.' },
        { name: 'año', example: '2015, 2020', type: 'useful', role: 'entrada', reason: 'Las piezas pueden cambiar según el año.' },
        { name: 'motor', example: '1.6, 2.0', type: 'useful', role: 'entrada', reason: 'Ayuda a evitar errores de compatibilidad.' },
        { name: 'sintoma', example: 'no enciende, se calienta', type: 'useful', role: 'entrada', reason: 'Permite orientar posibles sistemas afectados.' },
        { name: 'refaccion_posible', example: 'batería, alternador, balatas', type: 'target', role: 'objetivo', reason: 'Es la salida que queremos sugerir como orientación inicial.' },
        { name: 'color_del_auto', example: 'rojo', type: 'trash', role: 'eliminar', reason: 'Normalmente no ayuda a detectar la falla.' },
        { name: 'nombre_del_dueño', example: 'persona', type: 'sensitive', role: 'evitar', reason: 'No es necesario para orientar la refacción.' },
        { name: 'placas', example: 'dato vehicular', type: 'sensitive', role: 'evitar', reason: 'Puede ser sensible y no es necesario para orientación inicial.' },
        { name: 'año_no_indicado', example: 'dato faltante', type: 'missing', role: 'preguntar', reason: 'Sin año puede haber errores de compatibilidad.' }
      ],
      csvHeader: ['marca', 'modelo', 'año', 'motor', 'sintoma', 'refaccion_posible'],
      sampleRows: [
        ['Nissan', 'Versa', '2018', '1.6', 'no enciende', 'batería o marcha'],
        ['Toyota', 'Corolla', '2016', '1.8', 'se calienta', 'termostato o ventilador'],
        ['Ford', 'Fiesta', '2014', '1.6', 'vibra al frenar', 'balatas o discos'],
        ['Chevrolet', 'Aveo', '2017', '1.5', 'luces débiles', 'alternador o batería'],
        ['Honda', 'Civic', '2019', '2.0', 'falla al acelerar', 'bujías o bobina']
      ]
    },
    propia: {
      label: 'Propuesta propia',
      icon: '💡',
      problem: 'Problema definido por el alumno.',
      suggestedDecision: 'Mi IA debe apoyar una decisión real del negocio usando solo los datos necesarios.',
      target: 'salida_esperada',
      modelType: 'Depende del problema: recomendación, clasificación, predicción o generación.',
      cards: [
        { name: 'necesidad_del_cliente', example: 'lo que busca resolver', type: 'useful', role: 'entrada', reason: 'Ayuda a entender qué quiere el usuario.' },
        { name: 'presupuesto', example: 'cantidad disponible', type: 'useful', role: 'entrada', reason: 'Puede ayudar a recomendar opciones viables.' },
        { name: 'preferencia', example: 'gusto o prioridad', type: 'useful', role: 'entrada', reason: 'Permite personalizar la respuesta.' },
        { name: 'urgencia', example: 'baja, media, alta', type: 'useful', role: 'entrada', reason: 'Ayuda a priorizar atención.' },
        { name: 'salida_esperada', example: 'recomendación o categoría', type: 'target', role: 'objetivo', reason: 'Representa lo que la IA debe producir.' },
        { name: 'color_favorito', example: 'azul', type: 'trash', role: 'eliminar', reason: 'Solo sirve si afecta directamente la decisión.' },
        { name: 'dato_curioso', example: 'sin relación', type: 'trash', role: 'eliminar', reason: 'No ayuda a resolver el problema.' },
        { name: 'nombre_completo', example: 'dato personal', type: 'sensitive', role: 'evitar', reason: 'Puede ser innecesario según el caso.' },
        { name: 'dato_clave_no_indicado', example: 'faltante', type: 'missing', role: 'preguntar', reason: 'Si falta información importante, la IA debe preguntar.' }
      ],
      csvHeader: ['necesidad_del_cliente', 'presupuesto', 'preferencia', 'urgencia', 'salida_esperada'],
      sampleRows: [
        ['cliente necesita ayuda', '100', 'rápido', 'alta', 'opción A'],
        ['cliente busca algo económico', '60', 'barato', 'media', 'opción B'],
        ['cliente no sabe qué elegir', '80', 'calidad', 'baja', 'opción C'],
        ['cliente tiene poco tiempo', '120', 'rápido', 'alta', 'opción D'],
        ['cliente compara opciones', '90', 'costo-beneficio', 'media', 'opción E']
      ]
    }
  };

  let selectedBusinessKey = '';
  let selectedDecisionType = '';
  let classified = {};
  let conceptCorrect = {};
  let qualityCorrect = {};

  function $(selector) {
    return document.querySelector(selector);
  }

  function $all(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function getField(id) {
    return document.getElementById(id)?.value.trim() || '';
  }

  function setField(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
  }

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

  function markMission(id) {
    const progress = readProgress();
    if (!progress[id]) {
      progress[id] = true;
      saveProgress(progress);
      updateXP();
    }
  }

  function updateXP() {
    const progress = readProgress();
    let xp = 0;

    $all('[data-xp]').forEach(check => {
      check.checked = Boolean(progress[check.dataset.mission]);
      if (check.checked) xp += Number(check.dataset.xp || 0);
      check.closest('.class6-mission-card')?.classList.toggle('completed', check.checked);
    });

    const value = $('#c6-xp-value');
    const fill = $('#c6-progress-fill');
    const text = $('#c6-progress-text');
    const unlock = $('#c6-unlock');

    if (value) value.textContent = `${xp} XP`;
    if (fill) fill.style.width = `${Math.min(xp, 100)}%`;
    if (text) {
      text.textContent = xp >= 100
        ? 'Misión completada. Insignia desbloqueada.'
        : `Te faltan ${100 - xp} XP para desbloquear la insignia.`;
    }
    if (unlock) unlock.hidden = xp < 100;
  }

  function initMissionChecks() {
    const grid = $('#c6-mission-grid');
    if (!grid) return;

    grid.addEventListener('change', event => {
      const check = event.target.closest('[data-xp]');
      if (!check) return;

      const progress = readProgress();
      progress[check.dataset.mission] = check.checked;
      saveProgress(progress);
      updateXP();
    });

    updateXP();
  }

  function getBusiness() {
    return BUSINESS_DATA[selectedBusinessKey] || null;
  }

  function buildDecisionSentence(decisionType) {
    const business = getBusiness();
    const help = DECISION_HELP[decisionType];

    if (!help) return '';

    const businessName = business ? business.label.toLowerCase() : 'negocio';
    const problem = business ? business.problem : 'un problema real del negocio';

    const examples = {
      cafeteria: {
        recomendar: 'Mi IA debe recomendar una bebida, snack o combo usando datos como clima, horario, presupuesto, gusto y nivel de hambre.',
        clasificar: 'Mi IA debe clasificar el tipo de pedido del cliente usando datos como gusto, presupuesto, horario y nivel de hambre.',
        predecir: 'Mi IA debe predecir la demanda de productos usando datos como horario, clima, día de la semana y ventas anteriores.',
        detectar: 'Mi IA debe detectar si falta información importante antes de recomendar, usando datos como presupuesto, gusto, clima y preferencia frío/caliente.',
        generar: 'Mi IA debe generar una respuesta breve de atención usando la pregunta del cliente, el menú disponible y reglas para no inventar precios.'
      },
      restaurante: {
        recomendar: 'Mi IA debe recomendar un platillo usando datos como presupuesto, tiempo disponible, nivel de hambre, picante y restricciones alimentarias.',
        clasificar: 'Mi IA debe clasificar la solicitud del cliente como pedido, duda de menú, restricción alimentaria, queja o promoción.',
        predecir: 'Mi IA debe predecir la demanda de platillos usando datos como día, horario, clima, historial de ventas y eventos especiales.',
        detectar: 'Mi IA debe detectar riesgos en la recomendación, como alergias, restricciones alimentarias o falta de información importante.',
        generar: 'Mi IA debe generar una respuesta de WhatsApp usando la pregunta del cliente, el menú, restricciones y reglas de atención.'
      },
      refaccionaria: {
        recomendar: 'Mi IA debe orientar una posible refacción o sistema a revisar usando datos como marca, modelo, año, motor, síntoma y ruido.',
        clasificar: 'Mi IA debe clasificar la falla reportada por sistema del vehículo: eléctrico, frenos, motor, suspensión o enfriamiento.',
        predecir: 'Mi IA debe predecir qué refacciones podrían tener mayor demanda usando historial de ventas, temporada y modelos frecuentes.',
        detectar: 'Mi IA debe detectar si faltan datos críticos de compatibilidad, como marca, modelo, año o motor, antes de sugerir una refacción.',
        generar: 'Mi IA debe generar una respuesta de orientación inicial usando síntomas del cliente y reglas para no dar diagnóstico definitivo.'
      },
      propia: {
        recomendar: `Mi IA debe recomendar una opción para ${businessName} usando datos relevantes del cliente, contexto, restricciones y objetivo del negocio.`,
        clasificar: `Mi IA debe clasificar casos de ${businessName} usando características observables y categorías útiles para resolver el problema.`,
        predecir: `Mi IA debe predecir un valor importante para ${businessName} usando datos históricos y factores que influyen en el resultado.`,
        detectar: `Mi IA debe detectar riesgos o información faltante en ${businessName} usando señales, condiciones e indicadores relacionados con el problema.`,
        generar: `Mi IA debe generar una respuesta útil para ${businessName} usando contexto del negocio, reglas y datos proporcionados por el usuario.`
      }
    };

    if (business && examples[selectedBusinessKey] && examples[selectedBusinessKey][decisionType]) {
      return examples[selectedBusinessKey][decisionType];
    }

    return `Mi IA debe ${help.title.toLowerCase()} para apoyar este problema: ${problem}. Para eso necesita datos como ${help.dataNeeded}.`;
  }

  function shuffleArray(items) {
    return [...items].sort(() => Math.random() - 0.5);
  }

  function initConceptQuiz() {
    const root = $('#c6-concept-quiz');
    if (!root) return;

    const answerOptions = [
      { value: 'useful', label: 'Dato útil' },
      { value: 'trash', label: 'Dato basura' },
      { value: 'sensitive', label: 'Dato sensible' },
      { value: 'missing', label: 'Dato faltante' }
    ];

    root.innerHTML = CONCEPT_QUIZ.map((item, index) => {
      const shuffledOptions = shuffleArray(answerOptions);

      return `
        <article class="class6v2-quiz-card" data-concept-index="${index}">
          <h3>Caso ${index + 1}</h3>
          <p>${item.text}</p>
          <div class="class6v2-quiz-options">
            ${shuffledOptions.map(option => `
              <button type="button" data-concept-answer="${option.value}">
                ${option.label}
              </button>
            `).join('')}
          </div>
          <div class="class6v2-feedback" hidden></div>
        </article>
      `;
    }).join('');

    root.addEventListener('click', event => {
      const btn = event.target.closest('[data-concept-answer]');
      if (!btn) return;

      const card = btn.closest('[data-concept-index]');
      const index = Number(card.dataset.conceptIndex);
      const item = CONCEPT_QUIZ[index];
      const correct = btn.dataset.conceptAnswer === item.answer;
      const feedback = card.querySelector('.class6v2-feedback');

      card.classList.toggle('is-correct', correct);
      card.classList.toggle('is-wrong', !correct);
      card.querySelectorAll('button').forEach(option => option.classList.toggle('active', option === btn));

      feedback.hidden = false;
      feedback.innerHTML = `<strong>${correct ? 'Correcto.' : 'Revisa.'}</strong> ${item.explanation}`;

      if (correct) conceptCorrect[index] = true;
      if (Object.keys(conceptCorrect).length >= CONCEPT_QUIZ.length) markMission('concepts');
    });
  }

  function selectBusiness(key) {
    selectedBusinessKey = key;
    classified = {};
    const business = getBusiness();
    if (!business) return;

    $all('.class6-business-card').forEach(card => {
      card.classList.toggle('active', card.dataset.business === key);
    });

    const ownPanel = $('#c6-own-panel');
    if (ownPanel) ownPanel.hidden = key !== 'propia';

    const panel = $('#c6-business-panel');
    if (panel) {
      panel.innerHTML = `
        <strong>${business.icon} ${business.label}</strong>
        <p><b>Problema real:</b> ${business.problem}</p>
        <p><b>Decisión sugerida:</b> ${business.suggestedDecision}</p>
        <p><b>Tipo de IA probable:</b> ${business.modelType}</p>
      `;
    }

    setField('c6-decision-text', business.suggestedDecision);

    renderDataCards();
    renderColumnsSuggestion();
    markMission('business');
  }

  function initBusinessSelector() {
    const grid = $('#c6-business-grid');
    if (grid) {
      grid.addEventListener('click', event => {
        const btn = event.target.closest('[data-business]');
        if (!btn) return;
        selectBusiness(btn.dataset.business);
      });
    }

    const applyOwn = $('#c6-apply-own');
    if (applyOwn) {
      applyOwn.addEventListener('click', () => {
        const name = getField('c6-own-name') || 'Negocio propio';
        const context = getField('c6-own-context') || 'Contexto definido por el alumno.';
        const problem = getField('c6-own-problem') || 'Problema definido por el alumno.';

        BUSINESS_DATA.propia.label = name;
        BUSINESS_DATA.propia.problem = problem;
        BUSINESS_DATA.propia.suggestedDecision = `Mi IA debe apoyar a ${name} resolviendo este problema: ${problem}. Debe usar solo datos necesarios del cliente, contexto y restricciones.`;

        selectBusiness('propia');

        const panel = $('#c6-business-panel');
        if (panel) {
          panel.innerHTML = `
            <strong>💡 ${name}</strong>
            <p><b>Contexto:</b> ${context}</p>
            <p><b>Problema real:</b> ${problem}</p>
            <p><b>Decisión sugerida:</b> ${BUSINESS_DATA.propia.suggestedDecision}</p>
          `;
        }

        setField('c6-decision-text', BUSINESS_DATA.propia.suggestedDecision);
      });
    }
  }

    function initDecisionOptions() {
    const root = $('#c6-decision-options');
    const help = $('#c6-decision-help');
    if (!root || !help) return;

    root.addEventListener('click', event => {
      const btn = event.target.closest('[data-decision]');
      if (!btn) return;

      selectedDecisionType = btn.dataset.decision;
      const data = DECISION_HELP[selectedDecisionType];
      const sentence = buildDecisionSentence(selectedDecisionType);

      root.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === btn));

      help.innerHTML = `
        <strong>${data.title}</strong>
        <p>${data.explanation}</p>
        <div class="class6v2-template">
          <span>Qué significa para tu dataset:</span>
          <p>
            Si la IA debe <b>${data.title.toLowerCase()}</b>, entonces tu dataset necesita columnas con
            <b>${data.dataNeeded}</b>.
          </p>
          <p>
            La variable objetivo podría ser: <b>${data.target}</b>.
          </p>
        </div>
      `;

      setField('c6-decision-text', sentence);
      markMission('decision');
    });

    const text = $('#c6-decision-text');
    if (text) {
      text.addEventListener('input', () => {
        if (text.value.trim().length > 20) markMission('decision');
      });
    }
  }

    function initInputTarget() {
    const btn = $('#c6-understand-input-target');
    const result = $('#c6-input-target-result');

    if (!btn) return;

    btn.addEventListener('click', () => {
      const business = getBusiness();

      if (!business) {
        if (result) {
          result.hidden = false;
          result.innerHTML = `
            <strong>Primero selecciona un negocio</strong>
            <p>
              Para aplicar este concepto necesitas elegir cafetería, restaurante,
              refaccionaria o propuesta propia en el nivel anterior.
            </p>
          `;
        }
        return;
      }

      const inputColumns = business.cards
        .filter(card => card.type === 'useful')
        .map(card => card.name);

      const targetColumn = business.cards.find(card => card.type === 'target');

      if (result) {
        result.hidden = false;
        result.innerHTML = `
          <strong>${business.icon} Aplicación al caso: ${business.label}</strong>

          <div class="class6v2-application-grid">
            <div>
              <span>📥 Variables de entrada</span>
              <p>Son los datos que la IA necesita antes de responder.</p>
              <ul>
                ${inputColumns.map(column => `<li>${column}</li>`).join('')}
              </ul>
            </div>

            <div>
              <span>🏷️ Variable objetivo</span>
              <p>Es lo que queremos que la IA produzca como resultado.</p>
              <ul>
                <li>${targetColumn ? targetColumn.name : business.target}</li>
              </ul>
            </div>
          </div>

          <p class="class6v2-application-note">
            En tu dataset, las variables de entrada serán columnas que describen cada caso.
            La variable objetivo será la columna que representa la respuesta esperada.
          </p>
        `;
      }

      markMission('inputTarget');
    });
  }

  function labelType(type) {
    return {
      useful: 'Dato útil',
      target: 'Variable objetivo',
      trash: 'Dato basura',
      sensitive: 'Dato sensible',
      missing: 'Dato faltante'
    }[type] || type;
  }

  function renderDataCards() {
    const root = $('#c6-data-cards');
    const business = getBusiness();

    if (!root || !business) return;

    root.innerHTML = business.cards.map((card, index) => `
      <article class="class6-data-card class6v2-data-card" data-card-index="${index}">
        <div class="class6-data-card-head">
          <strong>${card.name}</strong>
          <span>${card.example}</span>
        </div>

        <div class="class6v2-card-question">
          ¿Este dato ayuda directamente a resolver la decisión IA?
        </div>

        <div class="class6-data-actions class6v2-data-actions">
          <button type="button" data-classify="useful">Dato útil</button>
          <button type="button" data-classify="target">Objetivo</button>
          <button type="button" data-classify="trash">Basura</button>
          <button type="button" data-classify="sensitive">Sensible</button>
          <button type="button" data-classify="missing">Faltante</button>
        </div>

        <p class="class6-data-reason" id="c6-reason-${index}" hidden></p>
      </article>
    `).join('');

    updateFilterScore();
  }

  function initDataClassifier() {
    const root = $('#c6-data-cards');
    if (!root) return;

    root.addEventListener('click', event => {
      const btn = event.target.closest('[data-classify]');
      if (!btn) return;

      const cardEl = btn.closest('[data-card-index]');
      const index = Number(cardEl.dataset.cardIndex);
      const business = getBusiness();
      const card = business.cards[index];
      const choice = btn.dataset.classify;
      const correct = choice === card.type;

      classified[index] = choice;

      cardEl.classList.toggle('is-correct', correct);
      cardEl.classList.toggle('is-wrong', !correct);

      cardEl.querySelectorAll('[data-classify]').forEach(item => {
        item.classList.toggle('active', item === btn);
      });

      const reason = document.getElementById(`c6-reason-${index}`);
      if (reason) {
        reason.hidden = false;
        reason.innerHTML = correct
          ? `<strong>Correcto.</strong> ${card.reason}`
          : `<strong>Revisa.</strong> Este dato corresponde a <b>${labelType(card.type)}</b>. ${card.reason}`;
      }

      updateFilterScore();
      renderColumnsSuggestion();
    });
  }

  function updateFilterScore() {
    const business = getBusiness();
    if (!business) return;

    let correct = 0;
    business.cards.forEach((card, index) => {
      if (classified[index] === card.type) correct += 1;
    });

    const score = $('#c6-filter-score');
    if (score) score.textContent = `${correct} / ${business.cards.length}`;

    if (correct >= Math.ceil(business.cards.length * 0.7)) markMission('filter');
  }

  function getCorrectUsefulCards() {
    const business = getBusiness();
    if (!business) return [];
    return business.cards.filter((card, index) => classified[index] === 'useful' && card.type === 'useful');
  }

  function getCorrectTargetCard() {
    const business = getBusiness();
    if (!business) return null;
    return business.cards.find((card, index) => classified[index] === 'target' && card.type === 'target')
      || business.cards.find(card => card.type === 'target');
  }

  function getRemovedCards() {
    const business = getBusiness();
    if (!business) return [];
    return business.cards.filter((card, index) => {
      return ['trash', 'sensitive'].includes(card.type) || ['trash', 'sensitive'].includes(classified[index]);
    });
  }

  function renderColumnsSuggestion() {
    const root = $('#c6-columns-suggestion');
    const business = getBusiness();
    if (!root || !business) return;

    const useful = getCorrectUsefulCards();
    const target = getCorrectTargetCard();

    if (!useful.length) {
      root.innerHTML = `
        <p>Aún no hay columnas. Primero clasifica datos útiles en el detector.</p>
        <p><strong>Meta:</strong> mínimo 3 variables de entrada y 1 variable objetivo.</p>
      `;
      return;
    }

    root.innerHTML = `
      <h3>Variables de entrada</h3>
      <p>Estos son los datos que la IA necesita antes de decidir:</p>
      <div class="class6-column-tags">
        ${useful.map(card => `<span>${card.name}</span>`).join('')}
      </div>

      <h3>Variable objetivo</h3>
      <p>Esta es la salida que queremos obtener:</p>
      <div class="class6-column-tags target">
        <span>${target ? target.name : business.target}</span>
      </div>
    `;

    if (useful.length >= 3 && target) markMission('inputTarget');
  }

  function generateCSV() {
    const business = getBusiness();
    if (!business) return '';

    const useful = getCorrectUsefulCards();
    const target = getCorrectTargetCard();

    const header = useful.length >= 3 && target
      ? [...useful.map(card => card.name), target.name]
      : business.csvHeader;

    const rows = business.sampleRows.map(row => {
      if (header.length === business.csvHeader.length) return row;
      const targetValue = row[row.length - 1];
      const inputs = row.slice(0, header.length - 1);
      return [...inputs, targetValue];
    });

    const csv = [header, ...rows].map(row => row.join(',')).join('\n');
    setField('c6-dataset-text', csv);
    markMission('dataset');
    return csv;
  }

  function initDatasetBuilder() {
    const generate = $('#c6-generate-columns');
    const copy = $('#c6-copy-csv');
    const download = $('#c6-download-csv');
    const status = $('#c6-csv-status');
    const textarea = $('#c6-dataset-text');

    if (generate) generate.addEventListener('click', generateCSV);

    if (textarea) {
      textarea.addEventListener('input', () => {
        if (textarea.value.trim().split('\n').filter(Boolean).length >= 6) markMission('dataset');
      });
    }

    if (copy) {
      copy.addEventListener('click', async () => {
        const csv = getField('c6-dataset-text') || generateCSV();
        try {
          await navigator.clipboard.writeText(csv);
          if (status) status.textContent = 'CSV copiado.';
        } catch {
          if (status) status.textContent = 'No se pudo copiar automáticamente. Cópialo manualmente.';
        }
      });
    }

    if (download) {
      download.addEventListener('click', () => {
        const csv = getField('c6-dataset-text') || generateCSV();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dataset-clase6.csv';
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  }

  function initQualityQuiz() {
    const root = $('#c6-quality-quiz');
    if (!root) return;

    root.innerHTML = QUALITY_QUIZ.map((item, index) => `
      <article class="class6v2-quiz-card" data-quality-index="${index}">
        <h3>Escenario ${index + 1}</h3>
        <p>${item.text}</p>
        <div class="class6v2-quiz-options">
          <button type="button" data-quality-answer="missing">Dato faltante</button>
          <button type="button" data-quality-answer="inconsistent">Dato inconsistente</button>
          <button type="button" data-quality-answer="bias">Sesgo</button>
          <button type="button" data-quality-answer="privacy">Privacidad</button>
        </div>
        <div class="class6v2-feedback" hidden></div>
      </article>
    `).join('');

    root.addEventListener('click', event => {
      const btn = event.target.closest('[data-quality-answer]');
      if (!btn) return;

      const card = btn.closest('[data-quality-index]');
      const index = Number(card.dataset.qualityIndex);
      const item = QUALITY_QUIZ[index];
      const correct = btn.dataset.qualityAnswer === item.answer;
      const feedback = card.querySelector('.class6v2-feedback');

      card.classList.toggle('is-correct', correct);
      card.classList.toggle('is-wrong', !correct);
      card.querySelectorAll('button').forEach(option => option.classList.toggle('active', option === btn));

      feedback.hidden = false;
      feedback.innerHTML = `<strong>${correct ? 'Correcto.' : 'Revisa.'}</strong> ${item.explanation}`;

      if (correct) qualityCorrect[index] = true;
      if (Object.keys(qualityCorrect).length >= QUALITY_QUIZ.length) markMission('quality');
    });

    const risks = $('#c6-risks');
    if (risks) {
      risks.addEventListener('input', () => {
        if (risks.value.trim().length > 20) markMission('quality');
      });
    }
  }


  function analyzeRiskText(text) {
    const lower = text.toLowerCase();
    const risks = [];

    if (lower.includes('presupuesto')) {
      risks.push({
        risk: 'Puede faltar el presupuesto del cliente.',
        impact: 'La IA podría recomendar productos fuera del alcance económico del cliente.',
        action: 'Agregar la columna presupuesto y pedir ese dato antes de recomendar.'
      });
    }

    if (lower.includes('ambigu') || lower.includes('no dice') || lower.includes('no especifica')) {
      risks.push({
        risk: 'Puede haber respuestas ambiguas del cliente.',
        impact: 'La IA podría interpretar mal la necesidad y generar una recomendación poco útil.',
        action: 'Agregar preguntas aclaratorias antes de decidir, por ejemplo: ¿dulce o salado?, ¿frío o caliente?, ¿presupuesto aproximado?'
      });
    }

    if (lower.includes('sesgo') || lower.includes('mañana') || lower.includes('tarde') || lower.includes('noche')) {
      risks.push({
        risk: 'Puede existir sesgo por capturar datos de un solo horario o tipo de cliente.',
        impact: 'La IA podría recomendar siempre lo mismo y fallar en otros contextos.',
        action: 'Recolectar datos de diferentes horarios, días, tipos de cliente y situaciones.'
      });
    }

    if (lower.includes('disponibilidad') || lower.includes('inventario') || lower.includes('producto no')) {
      risks.push({
        risk: 'La IA podría recomendar productos no disponibles.',
        impact: 'El cliente recibiría una recomendación que el negocio no puede cumplir.',
        action: 'Agregar una columna de disponibilidad o conectar la recomendación con inventario actualizado.'
      });
    }

    if (lower.includes('precio') || lower.includes('precios')) {
      risks.push({
        risk: 'Los precios pueden estar incompletos o desactualizados.',
        impact: 'La IA podría dar información incorrecta o inventar precios.',
        action: 'Agregar una fuente actualizada de precios y una regla para no inventar información.'
      });
    }

    if (lower.includes('sensible') || lower.includes('privacidad') || lower.includes('curp') || lower.includes('dirección') || lower.includes('telefono') || lower.includes('teléfono')) {
      risks.push({
        risk: 'Se podrían recopilar datos personales o sensibles innecesarios.',
        impact: 'Aumenta el riesgo de privacidad y se piden datos que no ayudan a la decisión.',
        action: 'Eliminar datos sensibles que no sean indispensables y aplicar minimización de datos.'
      });
    }

    if (!risks.length && text.trim()) {
      risks.push({
        risk: text.trim(),
        impact: 'Este riesgo puede afectar la calidad de las recomendaciones, clasificaciones o predicciones.',
        action: 'Definir una acción concreta: corregir formato, pedir el dato faltante, eliminar columnas irrelevantes o capturar más ejemplos.'
      });
    }

    return risks;
  }

  function generateRiskPlan() {
    const text = getField('c6-risks');
    const root = $('#c6-risk-plan');

    if (!root) return;

    if (!text) {
      root.hidden = false;
      root.innerHTML = `
        <strong>Primero escribe al menos un riesgo</strong>
        <p>Ejemplo: puede faltar presupuesto, puede haber datos ambiguos o puede existir sesgo por tener pocos registros.</p>
      `;
      return;
    }

    const risks = analyzeRiskText(text);

    root.hidden = false;
    root.innerHTML = `
      <strong>Plan de mejora del dataset</strong>
      <p>Estos riesgos ahora se convierten en acciones concretas.</p>

      <div class="class6v2-risk-table-wrap">
        <table class="class6-table">
          <thead>
            <tr>
              <th>Riesgo detectado</th>
              <th>Impacto en la IA</th>
              <th>Acción correctiva</th>
            </tr>
          </thead>
          <tbody>
            ${risks.map(item => `
              <tr>
                <td>${item.risk}</td>
                <td>${item.impact}</td>
                <td>${item.action}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    markMission('quality');
  }

  function initRiskPlan() {
    const btn = $('#c6-generate-risk-plan');
    if (btn) {
      btn.addEventListener('click', generateRiskPlan);
    }
  }


  function generateEvidence() {
    const business = getBusiness();
    const useful = getCorrectUsefulCards();
    const target = getCorrectTargetCard();
    const removed = getRemovedCards();

    const evidence = `EVIDENCIA CLASE 6 — IA DATA LAB

Integrantes:
[Escribe los nombres del equipo]

Negocio:
${business ? business.label : '[No seleccionado]'}

Problema real:
${business ? business.problem : '[No seleccionado]'}

Decisión que apoyará la IA:
${getField('c6-decision-text') || '[No registrada]'}

Tipo de IA recomendado:
${business ? business.modelType : '[No registrado]'}

Variables de entrada:
${useful.length ? useful.map(card => '- ' + card.name + ': ' + card.reason).join('\n') : '[No registradas]'}

Variable objetivo:
${target ? target.name + ': ' + target.reason : '[No registrada]'}

Datos eliminados o evitados:
${removed.length ? removed.map(card => '- ' + card.name + ' (' + labelType(card.type) + '): ' + card.reason).join('\n') : '[No registrados]'}

Dataset inicial:
${getField('c6-dataset-text') || '[No generado]'}

Riesgos de calidad de datos:
${getField('c6-risks') || '[No registrados]'}

Plan de mejora del dataset:
${$('#c6-risk-plan')?.innerText || '[No generado]'}

Conclusión:
Este dataset es un primer diseño porque separa datos de entrada, variable objetivo, datos basura y datos sensibles. Antes de entrenar un modelo, se debe revisar que los datos sean completos, relevantes, consistentes y representativos.`;

    const output = $('#c6-evidence-output');
    if (output) output.textContent = evidence;

    return evidence;
  }

  function initEvidence() {
    const generate = $('#c6-generate-evidence');
    const copy = $('#c6-copy-evidence');
    const status = $('#c6-evidence-status');

    if (generate) generate.addEventListener('click', generateEvidence);

    if (copy) {
      copy.addEventListener('click', async () => {
        const evidence = $('#c6-evidence-output')?.textContent || generateEvidence();
        try {
          await navigator.clipboard.writeText(evidence);
          if (status) status.textContent = 'Evidencia copiada.';
        } catch {
          if (status) status.textContent = 'No se pudo copiar automáticamente. Cópiala manualmente.';
        }
      });
    }
  }

  function initStartAndReset() {
    const start = document.querySelector('[data-c6-start]');
    const reset = document.querySelector('[data-c6-reset]');
    const target = $('#class6-start');

    if (start && target) {
      start.addEventListener('click', () => {
        const top = target.getBoundingClientRect().top + window.scrollY - 84;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    }

    if (reset) {
      reset.addEventListener('click', () => {
        if (!confirm('¿Reiniciar progreso de la Clase 6?')) return;
        localStorage.removeItem(STORAGE_KEY);
        selectedBusinessKey = '';
        selectedDecisionType = '';
        classified = {};
        conceptCorrect = {};
        qualityCorrect = {};
        updateXP();
        location.reload();
      });
    }
  }

  function initClass6() {
    initStartAndReset();
    initMissionChecks();
    initConceptQuiz();
    initBusinessSelector();
    initDecisionOptions();
    initInputTarget();
    initDataClassifier();
    initDatasetBuilder();
    initQualityQuiz();
    initRiskPlan();
    initEvidence();
  }

  document.addEventListener('DOMContentLoaded', initClass6);
})();

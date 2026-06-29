(() => {
  const STORAGE_KEY = 'clase5BusinessLabProgress';

  const BUSINESS_DATA = {
    cafeteria: {
      label: 'Cafetería',
      icon: '☕',
      assistantName: 'CaféBot',
      role: 'Actúa como asistente de atención y ventas para una cafetería.',
      task: 'Recomendar bebidas, snacks o combos según gustos, clima, horario y presupuesto del cliente.',
      context: 'La cafetería vende café caliente, café frío, frappés, pan dulce, galletas, snacks y combos escolares. Muchos clientes preguntan qué elegir y quieren recomendaciones rápidas.',
      rules: 'No inventes precios. Si falta presupuesto, pregúntalo. Da máximo 3 opciones. Recomienda combos cuando tenga sentido. Responde de forma breve y amable.',
      format: '1. Recomendación principal\\n2. Alternativa\\n3. Por qué conviene\\n4. Pregunta de seguimiento',
      criteria: 'Claridad, utilidad, recomendación realista, orientación a venta, no inventar datos.',
      problems: [
        'Clientes preguntan qué bebida elegir.',
        'No saben qué combo conviene.',
        'Se pierde tiempo respondiendo dudas repetidas.',
        'Quieren crear promociones para vender más.'
      ],
      scenarios: [
        'Un cliente quiere algo frío, dulce y barato. ¿Qué le recomiendas?',
        'Un cliente tiene poco tiempo y quiere café más algo para llevar.',
        'Un cliente no sabe si comprar frappé o café caliente.',
        'Un cliente quiere una promoción para dos personas.'
      ]
    },
    restaurante: {
      label: 'Restaurante',
      icon: '🍽️',
      assistantName: 'MenuBot',
      role: 'Actúa como asistente de menú y atención para un restaurante familiar.',
      task: 'Recomendar platillos según presupuesto, preferencias, restricciones alimentarias y tiempo disponible.',
      context: 'El restaurante recibe mensajes por WhatsApp preguntando por menú, precios, comida sin picante, opciones económicas y tiempo de preparación. El asistente debe ayudar sin inventar información.',
      rules: 'No inventes precios ni ingredientes. Si el cliente menciona alergias, recomienda confirmar con cocina. Ofrece máximo 3 opciones. Pregunta si desea algo económico, rápido o especial.',
      format: '1. Opción recomendada\\n2. Alternativa\\n3. Advertencia si aplica\\n4. Pregunta para cerrar pedido',
      criteria: 'Atención clara, cuidado con restricciones, recomendaciones útiles, no inventar información.',
      problems: [
        'Clientes preguntan por platillos y precios.',
        'Hay dudas sobre comida sin picante o con restricciones.',
        'Se tarda mucho en responder WhatsApp.',
        'Quieren sugerir promociones o combos.'
      ],
      scenarios: [
        'Un cliente quiere comida sin picante, económica y rápida.',
        'Un cliente pregunta qué pedir para una familia de cuatro personas.',
        'Un cliente dice que es alérgico al camarón y quiere recomendación.',
        'Un cliente pide algo ligero para comer en menos de 20 minutos.'
      ]
    },
    refaccionaria: {
      label: 'Refaccionaria',
      icon: '🔧',
      assistantName: 'RefaccioBot',
      role: 'Actúa como asistente de orientación inicial para una refaccionaria.',
      task: 'Ayudar a clientes a describir fallas, pedir datos del vehículo y orientar posibles refacciones o revisiones.',
      context: 'La refaccionaria recibe clientes que no siempre saben qué pieza necesitan. El asistente debe hacer preguntas, orientar y recordar que se debe validar compatibilidad antes de comprar.',
      rules: 'No des diagnóstico definitivo. No prometas que una pieza resolverá el problema. Pide marca, modelo, año y motor. Recomienda revisar compatibilidad. Sugiere acudir con un mecánico si hay riesgo.',
      format: '1. Posibles causas\\n2. Preguntas necesarias\\n3. Refacciones a revisar\\n4. Advertencia o recomendación profesional',
      criteria: 'Orientación segura, preguntas correctas, no diagnosticar de forma definitiva, utilidad para venta responsable.',
      problems: [
        'Clientes no saben qué pieza necesitan.',
        'Se pierde tiempo preguntando datos básicos del vehículo.',
        'Hay errores por compatibilidad de piezas.',
        'Se pueden recomendar productos complementarios.'
      ],
      scenarios: [
        'Mi carro no prende bien y hace clic al girar la llave. ¿Qué podría revisar primero?',
        'El auto se calienta cuando estoy parado en tráfico. ¿Qué piezas debería revisar?',
        'Necesito balatas, pero no sé cuáles lleva mi carro.',
        'Mi carro vibra al frenar. ¿Qué puede ser?'
      ]
    },
    propia: {
      label: 'Propuesta propia',
      icon: '💡',
      assistantName: 'MiAsistenteIA',
      role: 'Actúa como asistente inteligente para apoyar a un negocio real.',
      task: 'Ayudar a resolver un problema específico del negocio mediante atención, recomendación, organización, análisis o generación de contenido.',
      context: 'El alumno debe describir el negocio, sus clientes, productos o servicios y el problema detectado.',
      rules: 'No inventes información del negocio. Si falta contexto, haz preguntas aclaratorias. Da recomendaciones prácticas. Explica límites y riesgos. Propón una solución útil para el negocio.',
      format: '1. Diagnóstico del problema\\n2. Solución IA propuesta\\n3. Preguntas necesarias\\n4. Recomendación práctica\\n5. Valor para el negocio',
      criteria: 'Claridad, utilidad real, relación con el problema, viabilidad, no inventar datos.',
      problems: [
        'Atención repetitiva a clientes.',
        'Recomendación de productos o servicios.',
        'Organización de pedidos, citas o solicitudes.',
        'Generación de promociones o contenido.',
        'Clasificación de dudas, quejas o mensajes.',
        'Análisis básico para tomar decisiones.'
      ],
      scenarios: [
        'Tengo un negocio y muchos clientes preguntan lo mismo. ¿Cómo podría automatizar respuestas?',
        'Quiero recomendar productos según lo que el cliente necesita. ¿Cómo debería hacerlo?',
        'Necesito organizar pedidos o citas para no perder clientes. ¿Qué solución IA puede ayudar?',
        'Quiero crear promociones para vender más. ¿Qué ideas puede proponer la IA?'
      ]
    }
  };

  function $(selector) {
    return document.querySelector(selector);
  }

  function $all(selector) {
    return Array.from(document.querySelectorAll(selector));
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

  function updateXP() {
    const checks = $all('[data-xp]');
    const progress = readProgress();
    let xp = 0;

    checks.forEach(check => {
      check.checked = Boolean(progress[check.dataset.mission]);
      if (check.checked) xp += Number(check.dataset.xp || 0);
      check.closest('.class5-mission-card')?.classList.toggle('completed', check.checked);
    });

    const value = $('#c5-xp-value');
    const fill = $('#c5-progress-fill');
    const text = $('#c5-progress-text');
    const unlock = $('#c5-unlock');

    if (value) value.textContent = `${xp} XP`;
    if (fill) fill.style.width = `${Math.min(xp, 100)}%`;
    if (text) {
      text.textContent = xp >= 100
        ? 'Misión completada. Insignia desbloqueada.'
        : `Te faltan ${100 - xp} XP para desbloquear la insignia.`;
    }
    if (unlock) unlock.hidden = xp < 100;
  }

  function markMission(missionId) {
    const progress = readProgress();
    if (!progress[missionId]) {
      progress[missionId] = true;
      saveProgress(progress);
      updateXP();
    }
  }

  function initMissionChecks() {
    const grid = $('#c5-mission-grid');
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

  function setField(id, value) {
    const field = document.getElementById(id);
    if (field) field.value = value || '';
  }

  function getField(id) {
    return document.getElementById(id)?.value.trim() || '';
  }

  function getSelectedBusinessKey() {
    return document.body.dataset.c5Business || '';
  }

  function getSelectedBusiness() {
    const key = getSelectedBusinessKey();
    return BUSINESS_DATA[key] || null;
  }

  function renderProblemOptions(business) {
    const select = $('#c5-problem-select');
    if (!select || !business) return;

    select.innerHTML = '<option value="">Selecciona una opción</option>' +
      business.problems.map(problem => `<option>${problem}</option>`).join('');
  }

  function renderScenarios(business) {
    const root = $('#c5-scenario-list');
    if (!root || !business) return;

    root.innerHTML = business.scenarios.map(scenario => `
      <button type="button" class="class5-scenario-btn" data-scenario="${escapeHtml(scenario)}">
        ${scenario}
      </button>
    `).join('');
  }

  function renderCaseSummary(business) {
    const summary = $('#c5-case-summary');
    if (!summary || !business) return;

    summary.innerHTML = `
      <div class="class5-case-card">
        <span>${business.icon}</span>
        <div>
          <strong>${business.label}</strong>
          <p>${business.context}</p>
        </div>
      </div>
    `;
  }

  function fillBusinessPrompt(business) {
    setField('c5-name', business.assistantName);
    setField('c5-role', business.role);
    setField('c5-task', business.task);
    setField('c5-context', business.context);
    setField('c5-rules', business.rules);
    setField('c5-format', business.format);
    setField('c5-criteria', business.criteria);
  }

  function initBusinessSelector() {
    const grid = $('#c5-business-grid');
    const panel = $('#c5-business-panel');
    if (!grid || !panel) return;

    grid.addEventListener('click', event => {
      const btn = event.target.closest('[data-business]');
      if (!btn) return;

      const key = btn.dataset.business;
      const business = BUSINESS_DATA[key];
      if (!business) return;

      document.body.dataset.c5Business = key;

      $all('.class5-business-card').forEach(card => {
        card.classList.toggle('active', card === btn);
      });

      const ownPanel = $('#c5-own-business-panel');
      if (ownPanel) ownPanel.hidden = key !== 'propia';

      panel.innerHTML = `
        <strong>${business.icon} ${business.label} seleccionado</strong>
        <p><b>Misión:</b> ${business.task}</p>
        <p><b>Asistente sugerido:</b> ${business.assistantName}</p>
      `;

      fillBusinessPrompt(business);
      renderProblemOptions(business);
      renderScenarios(business);
      renderCaseSummary(business);
      generatePrompt();
      markMission('business');
    });
  }

  function initOwnBusiness() {
    const applyBtn = $('#c5-apply-own-business');
    if (!applyBtn) return;

    applyBtn.addEventListener('click', () => {
      const businessName = getField('c5-own-business-name') || 'Negocio propio';
      const businessContext = getField('c5-own-business-context') || 'Negocio propuesto por el alumno.';
      const businessProblem = getField('c5-own-business-problem') || 'Problema identificado por el alumno.';
      const solutionType = getField('c5-own-solution-type') || 'Solución IA personalizada';

      const customBusiness = BUSINESS_DATA.propia;
      customBusiness.label = businessName;
      customBusiness.assistantName = `${businessName.replace(/\s+/g, '')}Bot`;
      customBusiness.role = `Actúa como asistente inteligente para ${businessName}.`;
      customBusiness.task = `${solutionType}: ayudar a resolver el problema identificado en el negocio.`;
      customBusiness.context = businessContext;
      customBusiness.problems = [
        businessProblem,
        'Atención repetitiva a clientes.',
        'Mejorar ventas o recomendaciones.',
        'Ahorrar tiempo en tareas operativas.'
      ];
      customBusiness.scenarios = [
        `Soy cliente de ${businessName}. Necesito ayuda con una duda frecuente del negocio.`,
        `Quiero una recomendación relacionada con ${businessName}.`,
        `Tengo este problema: ${businessProblem}`,
        `¿Cómo puede este negocio usar IA para atender mejor o vender más?`
      ];

      renderProblemOptions(customBusiness);
      renderScenarios(customBusiness);
      renderCaseSummary(customBusiness);
      fillBusinessPrompt(customBusiness);
      setField('c5-problem-text', businessProblem);

      const panel = $('#c5-business-panel');
      if (panel) {
        panel.innerHTML = `
          <strong>💡 ${businessName} seleccionado</strong>
          <p><b>Problema detectado:</b> ${businessProblem}</p>
          <p><b>Solución sugerida:</b> ${solutionType}</p>
        `;
      }

      generatePrompt();
      markMission('business');
      markMission('problem');
    });
  }

  function initProblemLab() {
    const problemSelect = $('#c5-problem-select');
    const problemText = $('#c5-problem-text');
    const userSelect = $('#c5-user-select');

    if (problemSelect) {
      problemSelect.addEventListener('change', () => {
        if (problemSelect.value) {
          setField('c5-problem-text', problemSelect.value);
          markMission('problem');
        }
      });
    }

    if (problemText) {
      problemText.addEventListener('input', () => {
        if (problemText.value.trim().length > 15) markMission('problem');
      });
    }

    if (userSelect) {
      userSelect.addEventListener('change', () => {
        if (userSelect.value) markMission('user');
      });
    }
  }

  function generatePrompt() {
    const business = getSelectedBusiness();
    const businessLabel = business ? business.label : '[Negocio]';
    const problem = getField('c5-problem-text') || getField('c5-problem-select') || '[Problema real]';
    const user = getField('c5-user-select') || '[Usuario objetivo]';

    const name = getField('c5-name') || '[Nombre del asistente]';
    const role = getField('c5-role') || '[Rol del asistente]';
    const task = getField('c5-task') || '[Tarea principal]';
    const context = getField('c5-context') || '[Contexto del negocio]';
    const rules = getField('c5-rules') || '[Reglas]';
    const format = getField('c5-format') || '[Formato de respuesta]';
    const criteria = getField('c5-criteria') || '[Criterios de calidad]';

    const prompt = `Nombre del asistente: ${name}

${role}

Negocio:
${businessLabel}

Problema real que debe resolver:
${problem}

Usuario principal:
${user}

Tarea:
${task}

Contexto del negocio:
${context}

Reglas obligatorias:
${rules}

Formato de respuesta:
${format}

Criterios de calidad:
${criteria}

Antes de responder:
- Verifica si tienes suficiente información.
- Si falta un dato importante, haz una pregunta aclaratoria.
- No inventes precios, disponibilidad, compatibilidad ni datos técnicos.
- Tu respuesta debe ayudar al negocio a atender mejor, ahorrar tiempo o vender de forma responsable.`;

    const output = $('#c5-prompt-output');
    if (output) output.textContent = prompt;

    markMission('assistant');
    return prompt;
  }

  function initPromptBuilder() {
    const generate = $('#c5-generate');
    const copy = $('#c5-copy');
    const status = $('#c5-copy-status');

    if (generate) generate.addEventListener('click', generatePrompt);

    ['c5-name', 'c5-role', 'c5-task', 'c5-context', 'c5-rules', 'c5-format', 'c5-criteria'].forEach(id => {
      const field = document.getElementById(id);
      if (field) field.addEventListener('input', () => {
        if (getField('c5-name') && getField('c5-role') && getField('c5-task')) {
          markMission('assistant');
        }
      });
    });

    if (copy) {
      copy.addEventListener('click', async () => {
        const text = $('#c5-prompt-output')?.textContent || '';
        try {
          await navigator.clipboard.writeText(text);
          if (status) status.textContent = 'Prompt copiado. Pégalo en ChatGPT, Gemini o la IA que uses en clase.';
        } catch {
          if (status) status.textContent = 'No se pudo copiar automáticamente. Selecciona el texto y cópialo manualmente.';
        }
      });
    }
  }

  function initScenarioButtons() {
    const root = $('#c5-scenario-list');
    if (!root) return;

    root.addEventListener('click', event => {
      const btn = event.target.closest('[data-scenario]');
      if (!btn) return;
      setField('c5-test-input', btn.dataset.scenario);
      markMission('test');
    });
  }

  function updateABScores() {
    const scoreA = $all('[data-ab-a]').filter(item => item.checked).length;
    const scoreB = $all('[data-ab-b]').filter(item => item.checked).length;
    const delta = scoreB - scoreA;

    const scoreAEl = $('#c5-score-a');
    const scoreBEl = $('#c5-score-b');
    const finalA = $('#c5-final-score-a');
    const finalB = $('#c5-final-score-b');
    const finalDelta = $('#c5-final-delta');

    if (scoreAEl) scoreAEl.textContent = `${scoreA} / 5`;
    if (scoreBEl) scoreBEl.textContent = `${scoreB} / 5`;
    if (finalA) finalA.textContent = `${scoreA} / 5`;
    if (finalB) finalB.textContent = `${scoreB} / 5`;

    if (finalDelta) {
      finalDelta.textContent = `${delta >= 0 ? '+' : ''}${delta} puntos`;
      finalDelta.classList.toggle('is-positive', delta > 0);
      finalDelta.classList.toggle('is-negative', delta < 0);
    }

    if (scoreA > 0 && scoreB > 0 && getField('c5-test-output') && getField('c5-test-output-v2')) {
      markMission('test');
    }

    if (delta > 0 && getField('c5-fix').length > 10) {
      markMission('fix');
    }
  }

  function buildImprovedPrompt() {
    const originalPrompt = $('#c5-prompt-output')?.textContent || generatePrompt();
    const failure = getField('c5-bad') || '[Describe la falla detectada]';
    const improvement = getField('c5-fix') || '[Describe la mejora aplicada]';

    const improvedPrompt = `${originalPrompt}

MEJORA DESPUÉS DE LA PRUEBA A/B:
Falla detectada en la versión inicial:
${failure}

Nueva regla o ajuste obligatorio:
${improvement}

Al responder, asegúrate de corregir esa falla. La nueva respuesta debe ser más clara, más útil para el negocio y no debe inventar información.`;

    setField('c5-improved-prompt', improvedPrompt);
    markMission('fix');
    return improvedPrompt;
  }

  function initABComparison() {
    $all('[data-ab-a], [data-ab-b]').forEach(check => {
      check.addEventListener('change', updateABScores);
    });

    const buildBtn = $('#c5-build-improved-prompt');
    if (buildBtn) {
      buildBtn.addEventListener('click', buildImprovedPrompt);
    }

    ['c5-test-output', 'c5-test-output-v2', 'c5-bad', 'c5-fix', 'c5-good'].forEach(id => {
      const field = document.getElementById(id);
      if (field) {
        field.addEventListener('input', () => {
          updateABScores();
          if (getField('c5-bad').length > 10 && getField('c5-fix').length > 10) {
            markMission('fix');
          }
          if (getField('c5-good').length > 20) {
            markMission('value');
          }
        });
      }
    });
  }

  function initTestAndImprovement() {
    const testInput = $('#c5-test-input');
    const testOutput = $('#c5-test-output');
    const good = $('#c5-good');
    const bad = $('#c5-bad');
    const fix = $('#c5-fix');
    const value = $('#c5-value');

    function checkTest() {
      if (getField('c5-test-input') && getField('c5-test-output')) {
        markMission('test');
      }
    }

    function checkFix() {
      if (getField('c5-bad').length > 10 && getField('c5-fix').length > 10) {
        markMission('fix');
      }
    }

    if (testInput) testInput.addEventListener('input', checkTest);
    if (testOutput) testOutput.addEventListener('input', checkTest);
    if (good) good.addEventListener('input', () => {});
    if (bad) bad.addEventListener('input', checkFix);
    if (fix) fix.addEventListener('input', checkFix);
    if (value) value.addEventListener('input', () => {
      if (value.value.trim().length > 20) markMission('value');
    });

    $all('[data-value-chip]').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = getField('c5-value');
        const addition = btn.dataset.valueChip;
        setField('c5-value', current ? `${current}\n- ${addition}` : `- ${addition}`);
        markMission('value');
      });
    });
  }

  function generateEvidence() {
    const business = getSelectedBusiness();
    const businessLabel = business ? business.label : '[No seleccionado]';

    const evidence = `EVIDENCIA CLASE 5 — IA BUSINESS LAB

Integrantes:
[Escribe los nombres del equipo]

Negocio elegido:
${businessLabel}

Problema real:
${getField('c5-problem-text') || '[No registrado]'}

Usuario principal:
${getField('c5-user-select') || '[No registrado]'}

Nombre del asistente:
${getField('c5-name') || '[No registrado]'}

Prompt final:
${$('#c5-prompt-output')?.textContent || '[No generado]'}

Prueba realizada:
${getField('c5-test-input') || '[No registrada]'}

Respuesta obtenida versión A:
${getField('c5-test-output') || '[No registrada]'}

Prompt mejorado:
${getField('c5-improved-prompt') || '[No registrado]'}

Respuesta obtenida versión B:
${getField('c5-test-output-v2') || '[No registrada]'}

Puntaje versión A:
${$('#c5-score-a')?.textContent || '0 / 5'}

Puntaje versión B:
${$('#c5-score-b')?.textContent || '0 / 5'}

Qué salió bien:
${getField('c5-good') || '[No registrado]'}

Qué falló o qué faltó:
${getField('c5-bad') || '[No registrado]'}

Mejora aplicada:
${getField('c5-fix') || '[No registrada]'}

Valor para el negocio:
${getField('c5-value') || '[No registrado]'}

Conclusión:
Esta solución de IA puede apoyar al negocio porque atiende un problema real, mejora la atención y permite responder de forma más clara, rápida o segura.`;

    const output = $('#c5-evidence-output');
    if (output) output.textContent = evidence;

    markMission('value');
    return evidence;
  }

  function initEvidence() {
    const generate = $('#c5-generate-evidence');
    const copy = $('#c5-copy-evidence');
    const status = $('#c5-evidence-status');

    if (generate) generate.addEventListener('click', generateEvidence);

    if (copy) {
      copy.addEventListener('click', async () => {
        const evidence = $('#c5-evidence-output')?.textContent || '';
        try {
          await navigator.clipboard.writeText(evidence);
          if (status) status.textContent = 'Evidencia copiada. Ya puede pegarse en un documento o plataforma.';
        } catch {
          if (status) status.textContent = 'No se pudo copiar automáticamente. Selecciona el texto y cópialo manualmente.';
        }
      });
    }
  }

  function initStartAndReset() {
    const start = document.querySelector('[data-c5-start]');
    const reset = document.querySelector('[data-c5-reset]');
    const target = $('#class5-start');

    if (start && target) {
      start.addEventListener('click', () => {
        const top = target.getBoundingClientRect().top + window.scrollY - 84;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    }

    if (reset) {
      reset.addEventListener('click', () => {
        if (!confirm('¿Reiniciar progreso de la misión?')) return;
        localStorage.removeItem(STORAGE_KEY);
        $all('[data-xp]').forEach(check => check.checked = false);
        updateXP();
      });
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }

  function initClass5() {
    initStartAndReset();
    initMissionChecks();
    initBusinessSelector();
    initOwnBusiness();
    initProblemLab();
    initPromptBuilder();
    initScenarioButtons();
    initABComparison();
    initTestAndImprovement();
    initEvidence();
  }

  document.addEventListener('DOMContentLoaded', initClass5);
})();


/* ========================================================= */
/* CLASE 5 · EVALUACIÓN FINAL DEL REPORTE CON IA */
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
  const analisis = document.getElementById("c5-analisis-final-ia");

  if (!analisis) {
    alert("No encontré el campo de análisis final.");
    return;
  }

  const texto = analisis.value.trim();

  if (!texto) {
    alert("Primero pega el análisis final de la IA.");
    analisis.focus();
    return;
  }

  const ventana = window.open("", "_blank");

  if (!ventana) {
    alert("El navegador bloqueó la ventana emergente. Permite pop-ups para generar el PDF.");
    return;
  }

  const textoSeguro = texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  ventana.document.open();
  ventana.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Análisis final IA Business Lab</title>
      <style>
        body {
          margin: 40px;
          font-family: Arial, sans-serif;
          color: #111;
          background: #fff;
          font-size: 12pt;
          line-height: 1.6;
        }

        h1 {
          font-size: 18pt;
          margin-bottom: 8px;
          color: #111;
        }

        .subtitle {
          font-size: 10pt;
          color: #555;
          margin-bottom: 28px;
        }

        pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: Arial, sans-serif;
          font-size: 12pt;
          line-height: 1.6;
        }

        @media print {
          body {
            margin: 24mm;
          }
        }
      </style>
    </head>
    <body>
      <h1>Análisis final del reporte con IA</h1>
      <div class="subtitle">Evidencia Clase 5 — IA Business Lab</div>
      <pre>${textoSeguro}</pre>

      <script>
        window.onload = function() {
          window.print();
        };
      <\/script>
    </body>
    </html>
  `);
  ventana.document.close();
}

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
  const normalizeId = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "_");

  const guidedDefaults = [
    { id: "recomendar_frappe", label: "🥤 Recomendar frappé", beneficio: 80, confianza: 70, seguridad: 75, costo: 40, riesgo: 15 },
    { id: "recomendar_cafe_caliente", label: "☕ Recomendar café caliente", beneficio: 45, confianza: 30, seguridad: 60, costo: 25, riesgo: 35 },
    { id: "recomendar_combo_escolar", label: "🥪 Recomendar combo escolar", beneficio: 70, confianza: 55, seguridad: 70, costo: 55, riesgo: 25 }
  ];

  const feedbackState = {
    guided: {
      caseData: { clima: "calor", gusto: "dulce", busca: "frío", hambre: "baja", presupuesto: "medio" },
      actions: [],
      selectedAction: null,
      rankingBefore: [],
      rankingAfter: [],
      logs: []
    },
    student: {
      agentName: "", problem: "", user: "", caseDescription: "", initialAction: "",
      expectedResult: "", realResult: "", records: [], actions: [],
      rankingBefore: [], rankingAfter: [], colabCode: "", report: ""
    }
  };

  const feedbackAdjustments = { positivo: 5, parcial: 1, negativo: -7, incierto: 0 };
  const signalMeta = {
    clima: ["🌡️", "Clima"], gusto: ["👄", "Gusto"], busca: ["🧊", "Busca"],
    hambre: ["🍪", "Hambre"], presupuesto: ["💵", "Presupuesto"]
  };

  function calculateScore(action, confidenceKey = "confianza") {
    return Number(action.beneficio) + Number(action[confidenceKey]) + Number(action.seguridad) - Number(action.costo) - Number(action.riesgo);
  }

  function rankActions(actions, confidenceKey = "confianza") {
    return actions.map((action) => ({ ...action, puntaje: calculateScore(action, confidenceKey) }))
      .sort((a, b) => b.puntaje - a.puntaje || b.confianza - a.confianza);
  }

  function renderSignalCards(target) {
    const container = $(target);
    if (!container) return;
    container.innerHTML = Object.entries(feedbackState.guided.caseData).map(([key, value]) => {
      const [icon, label] = signalMeta[key];
      return `<article class="signal-card"><span aria-hidden="true">${icon}</span><small>${label}</small><strong>${escapeHtml(value)}</strong></article>`;
    }).join("");
  }

  function renderGuidedCase() {
    renderSignalCards("#guided-case");
    renderSignalCards("#sim-case");
  }

  function renderConfidenceMeter(value) {
    const safeValue = clamp(value);
    return `<div class="confidence-cell"><div class="confidence-meter" aria-label="Confianza ${safeValue}%"><span style="width:${safeValue}%"></span></div><strong>${safeValue}%</strong></div>`;
  }

  function renderGuidedActions() {
    const container = $("#guided-actions");
    if (!container) return;
    container.innerHTML = feedbackState.guided.actions.map((action) => `
      <article class="agent-decision-card ${feedbackState.guided.selectedAction === action.id ? "winner" : ""}">
        <div class="action-head"><strong>${escapeHtml(action.label)}</strong><strong>${calculateScore(action)} pts</strong></div>
        ${renderConfidenceMeter(action.confianza)}
        <div class="metrics"><span>Beneficio ${action.beneficio}</span><span>Seguridad ${action.seguridad}</span><span>Costo ${action.costo}</span><span>Riesgo ${action.riesgo}</span></div>
      </article>`).join("");
  }

  function renderGuidedRanking(ranking) {
    const body = $("#guided-ranking");
    body.innerHTML = ranking.length ? ranking.map((action, index) => `
      <tr><td>${index + 1}</td><td>${escapeHtml(action.label)}</td><td>${renderConfidenceMeter(action.confianza)}</td><td><strong>${action.puntaje}</strong></td></tr>`).join("")
      : `<tr><td colspan="4">Calcula una recomendación para ver el ranking.</td></tr>`;
  }

  function rankGuidedActions() {
    return rankActions(feedbackState.guided.actions);
  }

  function calculateGuidedRecommendation() {
    const ranking = rankGuidedActions();
    if (!feedbackState.guided.rankingBefore.length) feedbackState.guided.rankingBefore = ranking.map((item) => ({ ...item }));
    feedbackState.guided.rankingAfter = ranking.map((item) => ({ ...item }));
    feedbackState.guided.selectedAction = ranking[0].id;
    const winner = ranking[0];
    $("#guided-summary").innerHTML = `
      <p><strong>Decisión:</strong><br>CaféBot recomienda ${escapeHtml(winner.label)}.</p>
      <p><strong>Por qué ganó:</strong><br>Su puntaje de ${winner.puntaje} supera a las otras opciones por su combinación de beneficio, confianza y seguridad.</p>`;
    renderGuidedActions();
    renderGuidedRanking(ranking);
    renderBeforeAfter();
    return winner;
  }

  function applyGuidedFeedback(type) {
    if (!feedbackState.guided.selectedAction) {
      $("#guided-summary").innerHTML = "<p>Primero calcula una recomendación. El feedback necesita una decisión previa.</p>";
      return;
    }
    const action = feedbackState.guided.actions.find((item) => item.id === feedbackState.guided.selectedAction);
    const before = action.confianza;
    action.confianza = clamp(before + feedbackAdjustments[type]);
    const after = action.confianza;
    const resultText = type === "positivo" ? "El cliente aceptó." : type === "parcial" ? "El cliente aceptó con reservas." : type === "negativo" ? "El cliente rechazó la recomendación." : "No hubo información suficiente.";
    const ranking = rankGuidedActions();
    feedbackState.guided.rankingAfter = ranking.map((item) => ({ ...item }));
    feedbackState.guided.selectedAction = ranking[0].id;
    feedbackState.guided.logs.unshift({
      action: action.label, type, before, after,
      text: `${action.label}: feedback ${type}; confianza ${before}% → ${after}%.`
    });
    $("#guided-summary").innerHTML = `
      <p><strong>Decisión observada:</strong><br>${escapeHtml(action.label)}</p>
      <p><strong>Resultado:</strong><br>${resultText}</p>
      <p><strong>Ajuste:</strong><br>La confianza cambió de ${before}% a ${after}%.</p>
      <p><strong>Nuevo aprendizaje:</strong><br>En casos de calor + dulce + frío, esta acción ahora tiene ${after > before ? "más" : after < before ? "menos" : "el mismo"} respaldo.</p>`;
    renderGuidedActions();
    renderGuidedRanking(ranking);
    renderBeforeAfter();
    renderFeedbackLogs();
  }

  function renderBeforeAfter() {
    const before = feedbackState.guided.rankingBefore;
    const after = feedbackState.guided.rankingAfter;
    const container = $("#guided-before-after");
    const rankingList = (items) => items.slice(0, 3).map((item, index) => `<li>${index + 1}. ${escapeHtml(item.label)} · ${item.confianza}% · ${item.puntaje} pts</li>`).join("");
    container.innerHTML = `
      <article><h3>Antes del feedback</h3>${before.length ? `<p><strong>Decisión:</strong> ${escapeHtml(before[0].label)}</p><ol>${rankingList(before)}</ol>` : "<p>Calcula la recomendación para guardar el ranking inicial.</p>"}</article>
      <article><h3>Después del feedback</h3>${after.length ? `<p><strong>Decisión:</strong> ${escapeHtml(after[0].label)}</p><ol>${rankingList(after)}</ol>` : "<p>Aplica feedback para observar el cambio.</p>"}</article>`;
  }

  function renderFeedbackLogs() {
    const list = $("#feedback-logs");
    list.innerHTML = feedbackState.guided.logs.length
      ? feedbackState.guided.logs.map((log) => `<li>${escapeHtml(log.text)}</li>`).join("")
      : "<li>Aún no hay feedback aplicado.</li>";
  }

  function resetGuidedExample() {
    feedbackState.guided.actions = guidedDefaults.map((action) => ({ ...action }));
    feedbackState.guided.selectedAction = null;
    feedbackState.guided.rankingBefore = [];
    feedbackState.guided.rankingAfter = [];
    feedbackState.guided.logs = [];
    $("#guided-summary").innerHTML = "<p>Calcula una recomendación para comenzar.</p>";
    renderGuidedActions();
    renderGuidedRanking([]);
    renderBeforeAfter();
    renderFeedbackLogs();
  }

  function loadGuidedExample() {
    renderGuidedCase();
    resetGuidedExample();
  }

  function saveStudentCase(event) {
    event?.preventDefault();
    const student = feedbackState.student;
    student.agentName = $("#agent-name").value.trim();
    student.user = $("#agent-user").value.trim();
    student.problem = $("#agent-problem").value.trim();
    student.caseDescription = $("#case-description").value.trim();
    student.initialAction = $("#initial-action").value.trim();
    student.expectedResult = $("#expected-result").value.trim();
    $("#case-status").textContent = `Caso guardado para ${student.agentName || "tu agente"}: ${student.caseDescription || "sin descripción"}.`;
    $("#record-case").value ||= student.caseDescription;
    $("#record-action").value ||= student.initialAction;
    $("#record-expected").value ||= student.expectedResult;
  }

  function addStudentRecord(event) {
    event.preventDefault();
    const record = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      case: $("#record-case").value.trim(), action: $("#record-action").value.trim(),
      expected: $("#record-expected").value.trim(), real: $("#record-real").value.trim(),
      feedback: $("#record-feedback").value, note: $("#record-note").value.trim()
    };
    feedbackState.student.records.push(record);
    feedbackState.student.realResult = record.real;
    renderStudentRecords();
    event.target.reset();
  }

  function renderStudentRecords() {
    const body = $("#records-body");
    body.innerHTML = feedbackState.student.records.length ? feedbackState.student.records.map((record) => `
      <tr><td>${escapeHtml(record.case)}</td><td>${escapeHtml(record.action)}</td><td>${escapeHtml(record.expected)}</td><td>${escapeHtml(record.real)}</td>
      <td><span class="feedback-badge ${record.feedback === "positivo" ? "positive" : record.feedback === "negativo" ? "negative" : ""}">${escapeHtml(record.feedback)}</span></td>
      <td>${escapeHtml(record.note)}</td><td><button class="delete-button" type="button" data-delete-record="${record.id}" title="Eliminar registro">×</button></td></tr>`).join("")
      : `<tr><td colspan="7">Agrega tu primer registro.</td></tr>`;
  }

  function addStudentAction(event) {
    event.preventDefault();
    const initialConfidence = clamp($("#action-confidence").value);
    feedbackState.student.actions.push({
      id: normalizeId($("#action-name").value) || `accion_${Date.now()}`,
      label: $("#action-name").value.trim(),
      confianzaInicial: initialConfidence, confianza: initialConfidence,
      beneficio: clamp($("#action-benefit").value), seguridad: clamp($("#action-safety").value),
      costo: clamp($("#action-cost").value), riesgo: clamp($("#action-risk").value),
      feedbackSummary: "Sin registros", adjustment: 0, justification: "Aún no se ha aplicado feedback."
    });
    renderStudentActions();
    event.target.reset();
    $("#action-confidence").value = 60; $("#action-benefit").value = 70; $("#action-safety").value = 70; $("#action-cost").value = 30; $("#action-risk").value = 20;
  }

  function updateStudentAction(index, field, value) {
    const action = feedbackState.student.actions[index];
    if (!action) return;
    if (field === "label") {
      action.label = value.trim();
      action.id = normalizeId(value);
    } else {
      action[field] = clamp(value);
      if (field === "confianzaInicial") action.confianza = action.confianzaInicial;
    }
    feedbackState.student.rankingBefore = [];
    feedbackState.student.rankingAfter = [];
    renderStudentActions();
  }

  function deleteStudentAction(index) {
    feedbackState.student.actions.splice(index, 1);
    renderStudentActions();
  }

  function getAdjustmentRules() {
    return {
      positivo: Number($("#adjust-positive").value) || 0, parcial: Number($("#adjust-partial").value) || 0,
      negativo: Number($("#adjust-negative").value) || 0, incierto: Number($("#adjust-uncertain").value) || 0
    };
  }

  function calculateStudentAdjustments() {
    const rules = getAdjustmentRules();
    feedbackState.student.actions.forEach((action) => {
      const matches = feedbackState.student.records.filter((record) => normalizeId(record.action) === action.id);
      const adjustment = matches.reduce((sum, record) => sum + rules[record.feedback], 0);
      action.adjustment = adjustment;
      action.confianza = clamp(action.confianzaInicial + adjustment);
      action.feedbackSummary = matches.length ? matches.map((record) => record.feedback).join(", ") : "Sin coincidencias";
      action.justification = matches.length
        ? `${matches.length} registro(s) producen un ajuste total de ${adjustment >= 0 ? "+" : ""}${adjustment}.`
        : "Usa en el registro el mismo nombre de la acción.";
    });
    renderStudentActions();
    compareStudentRankings();
  }

  function renderStudentActions() {
    const body = $("#student-actions-body");
    body.innerHTML = feedbackState.student.actions.length ? feedbackState.student.actions.map((action, index) => `
      <tr>
        <td><input data-action-index="${index}" data-action-field="label" value="${escapeAttribute(action.label)}" aria-label="Nombre de acción"></td>
        <td><input type="number" min="0" max="100" data-action-index="${index}" data-action-field="confianzaInicial" value="${action.confianzaInicial}" aria-label="Confianza inicial"></td>
        <td>${escapeHtml(action.feedbackSummary)}</td><td>${action.adjustment >= 0 ? "+" : ""}${action.adjustment}</td>
        <td>${renderConfidenceMeter(action.confianza)}</td><td>${escapeHtml(action.justification)}</td>
        <td><button class="delete-button" type="button" data-delete-action="${index}" title="Eliminar acción">×</button></td>
      </tr>
      <tr class="metric-row"><td colspan="7"><div class="metrics">
        ${metricInput(index, "beneficio", action.beneficio)}${metricInput(index, "seguridad", action.seguridad)}
        ${metricInput(index, "costo", action.costo)}${metricInput(index, "riesgo", action.riesgo)}
      </div></td></tr>`).join("")
      : `<tr><td colspan="7">Agrega acciones de tu agente.</td></tr>`;
  }

  function metricInput(index, field, value) {
    return `<label>${field}<input type="number" min="0" max="100" data-action-index="${index}" data-action-field="${field}" value="${value}"></label>`;
  }

  function calculateStudentRankingBefore() {
    return rankActions(feedbackState.student.actions.map((action) => ({ ...action, confianza: action.confianzaInicial })));
  }

  function calculateStudentRankingAfter() {
    return rankActions(feedbackState.student.actions);
  }

  function compareStudentRankings() {
    const student = feedbackState.student;
    student.rankingBefore = calculateStudentRankingBefore();
    student.rankingAfter = calculateStudentRankingAfter();
    const container = $("#student-comparison");
    if (!student.actions.length) {
      container.innerHTML = "<article><h3>Antes</h3><p>Agrega al menos una acción.</p></article><article><h3>Después</h3><p>No hay datos para comparar.</p></article>";
      $("#comparison-explanation").textContent = "Necesitas acciones para calcular el ranking.";
      return;
    }
    const list = (items) => `<ol>${items.map((item) => `<li>${escapeHtml(item.label)} · ${item.confianza}% · ${item.puntaje} pts</li>`).join("")}</ol>`;
    container.innerHTML = `<article><h3>Antes del feedback</h3><p><strong>Ganadora:</strong> ${escapeHtml(student.rankingBefore[0].label)}</p>${list(student.rankingBefore)}</article>
      <article><h3>Después del feedback</h3><p><strong>Ganadora:</strong> ${escapeHtml(student.rankingAfter[0].label)}</p>${list(student.rankingAfter)}</article>`;
    const changed = student.rankingBefore[0].id !== student.rankingAfter[0].id;
    $("#comparison-explanation").textContent = changed
      ? `La decisión cambió: el feedback dio mayor respaldo a ${student.rankingAfter[0].label}.`
      : `La decisión se mantiene en ${student.rankingAfter[0].label}, pero su nivel de respaldo puede haber cambiado.`;
  }

  function generateStudentColabCode() {
    saveStudentCase();
    const student = feedbackState.student;
    const actions = student.actions.length ? student.actions : [{
      id: normalizeId(student.initialAction) || "mi_accion", label: student.initialAction || "mi_accion",
      beneficio: 70, confianza: 60, seguridad: 70, costo: 30, riesgo: 20
    }];
    const actionLines = actions.map((action) => `    ${pythonString(action.id)}: {
        "beneficio": ${action.beneficio},
        "confianza": ${action.confianzaInicial ?? action.confianza},
        "seguridad": ${action.seguridad},
        "costo": ${action.costo},
        "riesgo": ${action.riesgo}
    }`).join(",\n");
    const latest = student.records.at(-1);
    const feedback = latest?.feedback || "positivo";
    const selectedId = normalizeId(latest?.action) && actions.some((action) => action.id === normalizeId(latest.action))
      ? normalizeId(latest.action) : actions[0].id;
    student.colabCode = `# Clase 13 - Feedback & Confidence Lab
# Agente: ${student.agentName || "Mi agente"}

acciones = {
${actionLines}
}

ajustes_feedback = {
    "positivo": ${getAdjustmentRules().positivo},
    "parcial": ${getAdjustmentRules().parcial},
    "negativo": ${getAdjustmentRules().negativo},
    "incierto": ${getAdjustmentRules().incierto}
}

def calcular_puntaje(valores):
    return (
        valores["beneficio"]
        + valores["confianza"]
        + valores["seguridad"]
        - valores["costo"]
        - valores["riesgo"]
    )

def elegir_mejor_accion(acciones):
    ranking = sorted(
        acciones.items(),
        key=lambda item: calcular_puntaje(item[1]),
        reverse=True
    )
    return ranking

def limitar_valor(valor, minimo=0, maximo=100):
    return max(minimo, min(maximo, valor))

def aplicar_feedback(acciones, accion, feedback):
    ajuste = ajustes_feedback.get(feedback, 0)
    anterior = acciones[accion]["confianza"]
    nuevo = limitar_valor(anterior + ajuste)
    acciones[accion]["confianza"] = nuevo
    return anterior, nuevo

def registrar_feedback(caso, accion, esperado, real, feedback):
    return {
        "caso": caso,
        "accion": accion,
        "resultado_esperado": esperado,
        "resultado_real": real,
        "feedback": feedback
    }

ranking_antes = elegir_mejor_accion(acciones)
registro = registrar_feedback(
    ${pythonString(student.caseDescription || latest?.case || "Mi caso real")},
    ${pythonString(selectedId)},
    ${pythonString(student.expectedResult || latest?.expected || "Resultado esperado")},
    ${pythonString(latest?.real || student.realResult || "Resultado observado")},
    ${pythonString(feedback)}
)

anterior, nuevo = aplicar_feedback(
    acciones,
    registro["accion"],
    registro["feedback"]
)
ranking_despues = elegir_mejor_accion(acciones)

print("AGENTE:", ${pythonString(student.agentName || "Mi agente")})
print("CASO:", registro["caso"])
print("RANKING ANTES:", [(a, calcular_puntaje(v)) for a, v in ranking_antes])
print("CONFIANZA:", anterior, "->", nuevo)
print("RANKING DESPUES:", [(a, calcular_puntaje(v)) for a, v in ranking_despues])
print("APRENDIZAJE: el feedback convierte el resultado real en un ajuste explicable.")
`;
    $("#colab-code").textContent = student.colabCode;
    setStatus("#code-status", "Código generado con los datos actuales del laboratorio.");
  }

  function clearStudentColabCode() {
    feedbackState.student.colabCode = "";
    $("#colab-code").textContent = "Completa tu caso y tus acciones para generar Python personalizado.";
    setStatus("#code-status", "Código limpiado.");
  }

  async function copyText(text, statusTarget) {
    if (!text) return setStatus(statusTarget, "Primero genera el contenido.");
    try {
      await navigator.clipboard.writeText(text);
      setStatus(statusTarget, "Copiado al portapapeles.");
    } catch {
      const area = document.createElement("textarea");
      area.value = text; document.body.append(area); area.select(); document.execCommand("copy"); area.remove();
      setStatus(statusTarget, "Copiado al portapapeles.");
    }
  }

  function copyStudentColabCode() {
    return copyText(feedbackState.student.colabCode, "#code-status");
  }

  function downloadText(content, filename, statusTarget) {
    if (!content) return setStatus(statusTarget, "Primero genera el contenido.");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    link.download = filename; link.click(); URL.revokeObjectURL(link.href);
    setStatus(statusTarget, `Descarga preparada: ${filename}`);
  }

  function downloadStudentColabCode(extension = "py") {
    const name = normalizeId(feedbackState.student.agentName) || "mi_agente";
    downloadText(feedbackState.student.colabCode, `${name}_feedback.${extension}`, "#code-status");
  }

  function generateFinalReport() {
    saveStudentCase();
    const student = feedbackState.student;
    if (student.actions.length && !student.rankingAfter.length) compareStudentRankings();
    const latest = student.records.at(-1) || {};
    const chosen = student.rankingAfter[0] || student.actions[0] || {};
    student.report = `# Reporte final · Feedback & Confidence Lab

## Proyecto
- **Nombre del agente:** ${student.agentName || "Sin definir"}
- **Problema:** ${student.problem || "Sin definir"}
- **Usuario final:** ${student.user || "Sin definir"}
- **Caso analizado:** ${student.caseDescription || latest.case || "Sin definir"}

## Decisión y resultado
- **Acción recomendada:** ${chosen.label || student.initialAction || latest.action || "Sin definir"}
- **Resultado esperado:** ${student.expectedResult || latest.expected || "Sin definir"}
- **Resultado real:** ${latest.real || student.realResult || "Sin definir"}
- **Feedback:** ${latest.feedback || "Sin registrar"}

## Ajuste de confianza
- **Confianza antes:** ${chosen.confianzaInicial ?? "Sin calcular"}%
- **Confianza después:** ${chosen.confianza ?? "Sin calcular"}%
- **Qué aprendió el agente:** ${chosen.justification || "Necesita feedback para convertir la experiencia en ajuste."}

## Conexión con redes neuronales
En esta clase ajustamos la confianza de forma manual y explicable. En una red neuronal, muchos ejemplos permiten ajustar pesos automáticamente.

## Reflexión
${$("#student-reflection").value.trim() || "Pendiente de completar."}
`;
    $("#report-output").textContent = student.report;
    setStatus("#report-status", "Reporte generado.");
  }

  function clearFinalReport() {
    feedbackState.student.report = "";
    $("#report-output").textContent = "Tu reporte aparecerá aquí.";
    setStatus("#report-status", "Reporte limpiado.");
  }

  function copyFinalReport() {
    return copyText(feedbackState.student.report, "#report-status");
  }

  function downloadFinalReport(extension = "md") {
    const name = normalizeId(feedbackState.student.agentName) || "mi_agente";
    downloadText(feedbackState.student.report, `${name}_reporte_feedback.${extension}`, "#report-status");
  }

  function initCleanSidebar() {
    const toggle = $("#sidebar-toggle");
    const overlay = $("#sidebar-overlay");
    const desktop = window.matchMedia("(min-width: 1051px)");
    const closeMobile = () => {
      document.body.classList.remove("sidebar-open");
      toggle.setAttribute("aria-expanded", desktop.matches ? String(!document.body.classList.contains("sidebar-collapsed")) : "false");
    };
    toggle.addEventListener("click", toggleSidebar);
    overlay.addEventListener("click", closeMobile);
    $$("#lesson-sidebar a").forEach((link) => link.addEventListener("click", () => {
      if (!desktop.matches) closeMobile();
    }));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMobile();
    });
    desktop.addEventListener("change", closeMobile);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        $$("#lesson-sidebar nav a").forEach((link) => link.classList.toggle("active", link.hash === `#${entry.target.id}`));
      });
    }, { rootMargin: "-25% 0px -65%" });
    $$("main section[id]").forEach((section) => observer.observe(section));
  }

  function toggleSidebar() {
    const desktop = window.matchMedia("(min-width: 1051px)").matches;
    if (desktop) {
      document.body.classList.toggle("sidebar-collapsed");
      const hidden = document.body.classList.contains("sidebar-collapsed");
      $("#sidebar-toggle").setAttribute("aria-expanded", String(!hidden));
      $(".toggle-label").textContent = hidden ? "Mostrar" : "Ocultar";
      $("#sidebar-toggle").title = hidden ? "Mostrar navegación" : "Ocultar navegación";
    } else {
      document.body.classList.toggle("sidebar-open");
      const open = document.body.classList.contains("sidebar-open");
      $("#sidebar-toggle").setAttribute("aria-expanded", String(open));
    }
  }

  function bindEvents() {
    $("#calculate-guided").addEventListener("click", calculateGuidedRecommendation);
    $("#reset-guided").addEventListener("click", resetGuidedExample);
    $$("[data-guided-feedback]").forEach((button) => button.addEventListener("click", () => applyGuidedFeedback(button.dataset.guidedFeedback)));
    $("#student-case-form").addEventListener("submit", saveStudentCase);
    $("#record-form").addEventListener("submit", addStudentRecord);
    $("#action-form").addEventListener("submit", addStudentAction);
    $("#calculate-adjustments").addEventListener("click", calculateStudentAdjustments);
    $("#compare-student").addEventListener("click", compareStudentRankings);
    $("#records-body").addEventListener("click", (event) => {
      const id = event.target.dataset.deleteRecord;
      if (!id) return;
      feedbackState.student.records = feedbackState.student.records.filter((record) => record.id !== id);
      renderStudentRecords();
    });
    $("#student-actions-body").addEventListener("change", (event) => {
      const { actionIndex, actionField } = event.target.dataset;
      if (actionIndex === undefined) return;
      updateStudentAction(Number(actionIndex), actionField, event.target.value);
    });
    $("#student-actions-body").addEventListener("click", (event) => {
      if (event.target.dataset.deleteAction === undefined) return;
      deleteStudentAction(Number(event.target.dataset.deleteAction));
    });
    $("#generate-code").addEventListener("click", generateStudentColabCode);
    $("#copy-code").addEventListener("click", copyStudentColabCode);
    $("#clear-code").addEventListener("click", clearStudentColabCode);
    $("#download-py").addEventListener("click", () => downloadStudentColabCode("py"));
    $("#download-code-txt").addEventListener("click", () => downloadStudentColabCode("txt"));
    $("#generate-report").addEventListener("click", generateFinalReport);
    $("#copy-report").addEventListener("click", copyFinalReport);
    $("#clear-report").addEventListener("click", clearFinalReport);
    $("#download-md").addEventListener("click", () => downloadFinalReport("md"));
    $("#download-report-txt").addEventListener("click", () => downloadFinalReport("txt"));
  }

  function pythonString(value) {
    return JSON.stringify(String(value ?? "")).replace(/\u2028|\u2029/g, "");
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function setStatus(target, message) {
    $(target).textContent = message;
  }

  function init() {
    initCleanSidebar();
    loadGuidedExample();
    renderStudentRecords();
    renderStudentActions();
    bindEvents();
  }

  window.feedbackState = feedbackState;
  window.loadGuidedExample = loadGuidedExample;
  window.calculateScore = calculateScore;
  window.rankGuidedActions = rankGuidedActions;
  window.renderGuidedCase = renderGuidedCase;
  window.renderGuidedActions = renderGuidedActions;
  window.calculateGuidedRecommendation = calculateGuidedRecommendation;
  window.applyGuidedFeedback = applyGuidedFeedback;
  window.resetGuidedExample = resetGuidedExample;
  window.renderConfidenceMeter = renderConfidenceMeter;
  window.renderBeforeAfter = renderBeforeAfter;
  window.renderFeedbackLogs = renderFeedbackLogs;
  window.saveStudentCase = saveStudentCase;
  window.addStudentRecord = addStudentRecord;
  window.addStudentAction = addStudentAction;
  window.updateStudentAction = updateStudentAction;
  window.deleteStudentAction = deleteStudentAction;
  window.calculateStudentAdjustments = calculateStudentAdjustments;
  window.calculateStudentRankingBefore = calculateStudentRankingBefore;
  window.calculateStudentRankingAfter = calculateStudentRankingAfter;
  window.compareStudentRankings = compareStudentRankings;
  window.generateStudentColabCode = generateStudentColabCode;
  window.clearStudentColabCode = clearStudentColabCode;
  window.copyStudentColabCode = copyStudentColabCode;
  window.downloadStudentColabCode = downloadStudentColabCode;
  window.generateFinalReport = generateFinalReport;
  window.clearFinalReport = clearFinalReport;
  window.copyFinalReport = copyFinalReport;
  window.downloadFinalReport = downloadFinalReport;
  window.initCleanSidebar = initCleanSidebar;
  window.toggleSidebar = toggleSidebar;

  document.addEventListener("DOMContentLoaded", init);
})();

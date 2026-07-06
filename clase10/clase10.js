(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const targetHints = /(recomendacion|resultado|riesgo|solucion|clase|categoria|diagnostico|diagnóstico|accion|acción|estado|target|label|decision|decisión)/i;
  const criticalHints = /(urgente|critico|crítico|riesgo|alto|bloqueo|error|emergencia|fraude|no|rechaz|fall)/i;
  const storagePrefix = "clase10-ruleforge";
  const storageKey = `${storagePrefix}:state`;
  const progressPrefix = `${storagePrefix}:progress`;

  const state = {
    headers: [],
    rows: [],
    diagnosis: null,
    target: "",
    inputs: [],
    patterns: [],
    rules: [],
    fallback: { answer: "", needs: "" },
    caseDraft: {},
    debugFindings: [],
    debugSummary: null,
    debugReflection: {
      reviewed: false,
      explanation: false,
      condition: false,
      confidence: false,
      limitationCheck: false,
      improvement: "",
      limitation: ""
    },
    tests: []
  };

  const guidedCSV = `clima,gusto,hambre,presupuesto,tipo_cliente,recomendacion,calificacion
calor,dulce,baja,medio,estudiante,frappe,5
frio,amargo,baja,bajo,estudiante,cafe caliente,4
lluvia,ligero,baja,medio,universitario,te caliente,5
nublado,dulce,media,bajo,estudiante,galleta,4
calor,amargo,baja,medio,universitario,cafe frio,4
calor,dulce,alta,medio,estudiante,combo escolar,5
frio,dulce,alta,alto,universitario,pan dulce,4
calor,salado,alta,bajo,estudiante,combo escolar,5
calor,dulce,baja,alto,estudiante,frappe,5
frio,amargo,media,medio,universitario,cafe caliente,5
lluvia,dulce,baja,bajo,estudiante,pan dulce,4
calor,salado,media,bajo,universitario,combo escolar,4`;

  const emptyFeedback = {
    dataset: "Esperando dataset.",
    mini: "Completa la regla para revisarla.",
    rule: "Agrega condiciones y resultado.",
    exception: "Crea mínimo 2 excepciones. La página revisará si parecen excepciones o reglas normales.",
    fallback: "El respaldo todavía no está definido.",
    arena: "Esperando caso."
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function parseCSV(text) {
    const records = [];
    let field = "";
    let row = [];
    let quoted = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];
      if (char === '"') {
        if (quoted && next === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = !quoted;
        }
      } else if (char === "," && !quoted) {
        row.push(field.trim());
        field = "";
      } else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && next === "\n") i += 1;
        row.push(field.trim());
        if (row.some(Boolean)) records.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }

    row.push(field.trim());
    if (row.some(Boolean)) records.push(row);
    if (!records.length) return { headers: [], rows: [] };

    const headers = records[0].map((header, index) => header || `columna_${index + 1}`);
    const rows = records.slice(1).map((values) => headers.reduce((acc, header, index) => {
      acc[header] = values[index] === undefined ? "" : values[index].trim();
      return acc;
    }, {}));

    return { headers, rows };
  }

  function valueCounts(rows, column) {
    return rows.reduce((acc, row) => {
      const value = String(row[column] || "").trim() || "(vacío)";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  function duplicateCount(rows) {
    const seen = new Set();
    let duplicates = 0;
    rows.forEach((row) => {
      const key = JSON.stringify(row);
      if (seen.has(key)) duplicates += 1;
      seen.add(key);
    });
    return duplicates;
  }

  function diagnose(headers, rows) {
    const missing = headers.map((column) => ({
      column,
      count: rows.filter((row) => !String(row[column] || "").trim()).length
    }));
    const missingTotal = missing.reduce((sum, item) => sum + item.count, 0);
    const missingPct = rows.length && headers.length ? missingTotal / (rows.length * headers.length) : 0;
    const duplicates = duplicateCount(rows);
    const namedTargets = headers.filter((header) => targetHints.test(header));
    const distributionTargets = headers.filter((header) => {
      const unique = Object.keys(valueCounts(rows, header)).filter((value) => value !== "(vacío)").length;
      return !targetHints.test(header) && unique > 1 && unique <= Math.max(8, rows.length * 0.45);
    });
    const possibleTargets = [...namedTargets, ...distributionTargets];
    const notes = [];
    if (!headers.length) notes.push("No se detectaron columnas.");
    if (rows.length < 8) notes.push("Hay pocos registros: sirve para practicar, pero la evidencia será débil.");
    if (missingPct > 0.1) notes.push("Hay más de 10% de valores faltantes.");
    if (duplicates) notes.push(`Hay ${duplicates} fila(s) duplicada(s) exacta(s).`);
    if (!possibleTargets.length) notes.push("No se detectó objetivo probable por nombre o distribución.");
    return { missing, missingTotal, missingPct, duplicates, possibleTargets, notes };
  }

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify({
      target: state.target,
      inputs: state.inputs,
      csvText: $("#csv-text")?.value || "",
      rules: state.rules,
      fallback: state.fallback,
      caseDraft: state.caseDraft,
      tests: state.tests,
      patternActivity: readPatternActivity(),
      debugReflection: readDebugReflection(),
      debugFindings: state.debugFindings,
      debugSummary: state.debugSummary,
      agentName: $("#agent-name")?.value || "",
      agentProblem: $("#agent-problem")?.value || "",
      agentUser: $("#agent-user")?.value || ""
    }));
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      $("#csv-text").value = saved.csvText || "";
      if (saved.csvText) {
        const parsed = parseCSV(saved.csvText);
        state.headers = parsed.headers;
        state.rows = parsed.rows;
        state.diagnosis = diagnose(state.headers, state.rows);
      }
      state.target = saved.target || "";
      state.inputs = Array.isArray(saved.inputs) ? saved.inputs : [];
      state.rules = Array.isArray(saved.rules) ? saved.rules : [];
      state.fallback = saved.fallback || state.fallback;
      state.caseDraft = saved.caseDraft || {};
      state.tests = Array.isArray(saved.tests) ? saved.tests : [];
      state.debugFindings = Array.isArray(saved.debugFindings) ? saved.debugFindings : [];
      state.debugSummary = saved.debugSummary || null;
      state.debugReflection = saved.debugReflection || state.debugReflection;
      writeDebugReflection(state.debugReflection);
      writePatternActivity(saved.patternActivity || {});
      $("#agent-name").value = saved.agentName || "";
      $("#agent-problem").value = saved.agentProblem || "";
      $("#agent-user").value = saved.agentUser || "";
      $("#fallback-answer").value = state.fallback.answer || "";
      $("#fallback-needs").value = state.fallback.needs || "";
    } catch {
      localStorage.removeItem(storageKey);
    }
  }

  function setupNavigation() {
    const sidebar = $("#mission-sidebar");
    const toggle = $("#sidebar-toggle");
    const overlay = $("#sidebar-overlay");
    const links = $$(".mission-nav a");
    const desktopQuery = window.matchMedia("(min-width: 1101px)");

    function sync() {
      if (desktopQuery.matches) {
        document.body.classList.remove("sidebar-open");
        toggle.setAttribute("aria-expanded", String(!document.body.classList.contains("sidebar-collapsed")));
        overlay.setAttribute("aria-hidden", "true");
      } else {
        document.body.classList.remove("sidebar-collapsed");
        const open = document.body.classList.contains("sidebar-open");
        toggle.setAttribute("aria-expanded", String(open));
        overlay.setAttribute("aria-hidden", String(!open));
      }
    }

    function close() {
      if (desktopQuery.matches) {
        document.body.classList.add("sidebar-collapsed");
      } else {
        document.body.classList.remove("sidebar-open");
      }
      sync();
    }

    function open() {
      if (desktopQuery.matches) {
        document.body.classList.remove("sidebar-collapsed");
      } else {
        document.body.classList.add("sidebar-open");
      }
      sync();
    }

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const expanded = desktopQuery.matches
        ? !document.body.classList.contains("sidebar-collapsed")
        : document.body.classList.contains("sidebar-open");
      expanded ? close() : open();
    });
    overlay.addEventListener("click", close);
    links.forEach((link) => link.addEventListener("click", () => {
      if (!desktopQuery.matches) close();
    }));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !desktopQuery.matches) close();
    });
    document.addEventListener("click", (event) => {
      if (desktopQuery.matches || !document.body.classList.contains("sidebar-open")) return;
      if (sidebar.contains(event.target) || toggle.contains(event.target)) return;
      close();
    });
    desktopQuery.addEventListener("change", sync);
    sync();

    const sections = links.map((link) => $(link.getAttribute("href"))).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-34% 0px -58% 0px", threshold: 0.01 });
    sections.forEach((section) => observer.observe(section));
  }

  const missions = [
    ["m1", "Dataset analizado y diseño inicial"],
    ["m2", "Regla SI/ENTONCES comprendida"],
    ["m3", "Patrones detectados"],
    ["m4", "5 reglas normales"],
    ["m5", "2 reglas de excepción"],
    ["m6", "Regla de respaldo"],
    ["m7", "5 pruebas en Agent Arena"],
    ["m8", "Debug de conocimiento"],
    ["m9", "Exportación final"]
  ];

  function progressKey(id) {
    return `${progressPrefix}:${id}`;
  }

  function updateProgress() {
    let xp = 0;
    const completed = new Set();
    $$("[data-complete]").forEach((check) => {
      const id = check.dataset.complete;
      if (check.checked) {
        completed.add(id);
        localStorage.setItem(progressKey(id), "1");
      } else {
        localStorage.removeItem(progressKey(id));
      }
    });
    completed.forEach((id) => {
      xp += Number($(`[data-mission="${id}"]`)?.dataset.xp || 0);
    });
    $("#xp-bar").style.width = `${Math.min(100, xp)}%`;
    $("#xp-text").textContent = `${xp} / 100`;
    $("#xp-status").textContent = xp >= 100
      ? "Base desbloqueada: puedes exportar y defender tu agente."
      : "Completa misiones para desbloquear la base.";
    $$("#mission-checklist [data-complete]").forEach((clone) => {
      const original = $(`.mission [data-complete="${clone.dataset.complete}"]`);
      if (original && clone.checked !== original.checked) clone.checked = original.checked;
    });
  }

  function setMissionProgress(ids, checked) {
    ids.forEach((id) => {
      $$(`[data-complete="${id}"]`).forEach((check) => {
        check.checked = checked;
      });
      if (checked) {
        localStorage.setItem(progressKey(id), "1");
      } else {
        localStorage.removeItem(progressKey(id));
      }
    });
    updateProgress();
  }

  function setupProgress() {
    $("#mission-checklist").innerHTML = missions.map(([id, label]) => `
      <label><input type="checkbox" data-complete="${id}"> ${label}</label>
    `).join("");

    const checks = $$("[data-complete]");
    checks.forEach((check) => {
      check.checked = localStorage.getItem(progressKey(check.dataset.complete)) === "1";
      check.addEventListener("change", () => {
        $$(`[data-complete="${check.dataset.complete}"]`).forEach((same) => {
          same.checked = check.checked;
        });
        updateProgress();
      });
    });
    updateProgress();
  }

  function renderOptions(select, values, selected = [], placeholder = "Selecciona") {
    const selectedSet = new Set(Array.isArray(selected) ? selected : [selected]);
    select.innerHTML = `${select.multiple ? "" : `<option value="">${placeholder}</option>`}${values.map((value) => `
      <option value="${escapeHtml(value)}" ${selectedSet.has(value) ? "selected" : ""}>${escapeHtml(value)}</option>
    `).join("")}`;
  }

  function selectedValues(select) {
    return Array.from(select.selectedOptions).map((option) => option.value).filter(Boolean);
  }

  function refreshColumnControls() {
    const inputCandidates = state.headers.filter((header) => header !== state.target);
    renderOptions($("#target-column"), state.headers, state.target);
    renderOptions($("#input-columns"), inputCandidates, state.inputs);
    renderOptions($("#mini-var-1"), inputCandidates, state.inputs[0] || "");
    renderOptions($("#mini-var-2"), inputCandidates, state.inputs[1] || "");
    renderOptions($("#pattern-columns"), inputCandidates, state.inputs);
    $("#mini-target-label").textContent = state.target || "objetivo";
    renderConditionEditor();
    renderCaseForm();
  }

  function renderDiagnosis() {
    const metrics = $("#dataset-metrics");
    const targets = $("#possible-targets");
    if (!state.diagnosis) {
      metrics.innerHTML = "";
      targets.innerHTML = "";
      return;
    }
    metrics.innerHTML = `
      <div class="metric"><span>Filas</span><strong>${state.rows.length}</strong></div>
      <div class="metric"><span>Columnas</span><strong>${state.headers.length}</strong></div>
      <div class="metric"><span>Faltantes</span><strong>${state.diagnosis.missingTotal}</strong></div>
      <div class="metric"><span>Duplicados</span><strong>${state.diagnosis.duplicates}</strong></div>
    `;
    targets.innerHTML = state.diagnosis.possibleTargets.length
      ? state.diagnosis.possibleTargets.map((target) => `<span>${escapeHtml(target)}</span>`).join("")
      : "<span>Sin objetivo evidente</span>";
    const feedback = $("#dataset-feedback");
    const notes = state.diagnosis.notes.length ? state.diagnosis.notes.join(" ") : "Dataset listo para buscar patrones.";
    feedback.className = `feedback ${state.diagnosis.notes.length ? "warn" : "good"}`;
    feedback.textContent = notes;
  }

  function analyzeCurrentCSV() {
    const parsed = parseCSV($("#csv-text").value);
    state.headers = parsed.headers;
    state.rows = parsed.rows;
    state.diagnosis = diagnose(state.headers, state.rows);
    state.target = state.diagnosis.possibleTargets[0] || state.headers[state.headers.length - 1] || "";
    state.inputs = state.headers.filter((header) => header !== state.target).slice(0, 5);
    state.patterns = [];
    renderDiagnosis();
    refreshColumnControls();
    renderPatterns();
    saveState();
  }

  function setupDataset() {
    $("#load-sample").addEventListener("click", loadGuidedExample);
    $("#analyze-csv").addEventListener("click", analyzeCurrentCSV);
    $("#csv-file").addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      $("#csv-text").value = await file.text();
      analyzeCurrentCSV();
    });
    $("#target-column").addEventListener("change", (event) => {
      state.target = event.target.value;
      state.inputs = state.inputs.filter((input) => input !== state.target);
      refreshColumnControls();
      saveState();
    });
    $("#input-columns").addEventListener("change", (event) => {
      state.inputs = selectedValues(event.target);
      refreshColumnControls();
      saveState();
    });
    ["agent-name", "agent-problem", "agent-user"].forEach((id) => {
      $(`#${id}`).addEventListener("input", saveState);
    });
  }

  function setupWorkMode() {
    $("#load-guided-example").addEventListener("click", loadGuidedExample);
    $("#clear-workspace").addEventListener("click", clearRuleForgeWorkspace);
  }

  function setupMiniBuilder() {
    const inputs = ["mini-var-1", "mini-value-1", "mini-var-2", "mini-value-2", "mini-result"].map((id) => $(`#${id}`));
    function review() {
      const complete = inputs.every((input) => input.value.trim()) && state.target;
      const feedback = $("#mini-feedback");
      feedback.className = `feedback ${complete ? "good" : "warn"}`;
      feedback.textContent = complete
        ? `Regla completa: SI ${$("#mini-var-1").value} = ${$("#mini-value-1").value}, Y ${$("#mini-var-2").value} = ${$("#mini-value-2").value}, ENTONCES ${state.target} = ${$("#mini-result").value}.`
        : "Falta variable, valor, resultado o columna objetivo.";
    }
    inputs.forEach((input) => input.addEventListener("input", review));
    inputs.forEach((input) => input.addEventListener("change", review));
  }

  function groupPatterns(columns) {
    const groups = new Map();
    state.rows.forEach((row) => {
      if (!String(row[state.target] || "").trim()) return;
      const key = columns.map((column) => `${column}=${String(row[column] || "").trim() || "(vacío)"}`).join(" | ");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    });

    return Array.from(groups.entries()).map(([key, rows]) => {
      const counts = valueCounts(rows, state.target);
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      const [result, count] = sorted[0] || ["", 0];
      const precision = rows.length ? count / rows.length : 0;
      const outputCount = sorted.length;
      const type = classifyPattern(rows.length, precision, outputCount);
      const confidence = patternConfidence(type, rows.length, precision);
      return {
        id: `P${state.patterns.length + Math.floor(Math.random() * 9000)}`,
        columns,
        key,
        conditions: Object.fromEntries(key.split(" | ").map((item) => item.split("="))),
        topResult: result,
        result,
        coverage: rows.length,
        cases: rows.length,
        precision,
        confidence,
        type,
        strength: typeToLegacyStrength(type),
        outputCount,
        outputSummary: sorted.map(([value, total]) => `${value}: ${total}`).join(", "),
        feedback: patternFeedback(type, rows.length, precision, outputCount)
      };
    }).filter((pattern) => pattern.cases >= 2)
      .sort((a, b) => (b.precision - a.precision) || (b.cases - a.cases));
  }

  function classifyPattern(coverage, precision, outputCount) {
    if (outputCount > 1 && precision < 0.8) return "conflict";
    if (precision >= 0.8 && coverage >= 3) return "strong";
    if (coverage < 3) return "weak";
    if (precision < 0.6) return "doubtful";
    return "weak";
  }

  function patternConfidence(type, coverage, precision) {
    if (type === "strong") return "alta";
    if (type === "conflict" || type === "doubtful") return "baja";
    if (coverage >= 3 && precision >= 0.65) return "media";
    return "baja";
  }

  function typeToLegacyStrength(type) {
    if (type === "strong") return "fuerte";
    if (type === "weak") return "debil";
    if (type === "conflict") return "conflicto";
    return "dudoso";
  }

  function patternTypeLabel(type) {
    return {
      strong: "fuerte",
      weak: "débil",
      doubtful: "dudoso",
      conflict: "conflicto"
    }[type] || "dudoso";
  }

  function patternFeedback(type, coverage, precision, outputCount) {
    if (type === "strong") {
      return "Patrón fuerte: esta combinación se repite y tiene una salida consistente.";
    }
    if (type === "weak") {
      return "Patrón débil: aparece pocas veces. Puede servir como regla candidata, pero con confianza baja.";
    }
    if (type === "conflict") {
      return "Posible conflicto: esta combinación no siempre produce el mismo resultado.";
    }
    if (precision < 0.6 || outputCount > 1) {
      return "Patrón dudoso: la salida cambia mucho. Intenta agregar otra variable o no lo conviertas todavía en regla.";
    }
    return "Patrón dudoso: revisa más evidencia antes de convertirlo en regla.";
  }

  function renderPatterns() {
    const root = $("#pattern-results");
    if (!state.patterns.length) {
      root.innerHTML = "<div class=\"feedback\">Analiza combinaciones para ver patrones candidatos.</div>";
      return;
    }
    root.innerHTML = state.patterns.slice(0, 16).map((pattern, index) => `
      <article class="pattern-card type-${pattern.type}">
        <header>
          <strong>${escapeHtml(Object.entries(pattern.conditions).map(([k, v]) => `${k} = ${v}`).join(" + "))}</strong>
          <span class="pattern-type-badge type-${pattern.type}">${patternTypeLabel(pattern.type)}</span>
        </header>
        <p>Resultado más común: <strong>${escapeHtml(state.target || "resultado")} = ${escapeHtml(pattern.topResult)}</strong></p>
        <div class="card-meta">
          <span>cobertura ${pattern.coverage}</span>
          <span>${Math.round(pattern.precision * 100)}% precisión</span>
          <span>confianza ${pattern.confidence}</span>
          <span>${escapeHtml(pattern.outputSummary)}</span>
        </div>
        <div class="pattern-feedback">${escapeHtml(pattern.feedback)}</div>
        <button class="btn" type="button" data-pattern-rule="${index}">Convertir en regla</button>
      </article>
    `).join("");
    $$("[data-pattern-rule]").forEach((button) => {
      button.addEventListener("click", () => {
        const pattern = state.patterns[Number(button.dataset.patternRule)];
        addRule({
          type: "normal",
          priority: pattern.confidence === "alta" ? "alta" : "media",
          conditions: pattern.conditions,
          result: pattern.topResult,
          explanation: `${pattern.feedback} Detectado en ${pattern.coverage} caso(s) con ${Math.round(pattern.precision * 100)}% de precisión.`,
          coverage: pattern.coverage,
          precision: pattern.precision,
          confidence: pattern.confidence
        });
      });
    });
  }

  function setupPatterns() {
    $("#analyze-patterns").addEventListener("click", () => {
      const size = Number($("#pattern-size").value);
      const columns = selectedValues($("#pattern-columns")).slice(0, size);
      if (!state.rows.length || !state.target || columns.length !== size) {
        $("#pattern-results").innerHTML = "<div class=\"feedback warn\">Carga un CSV, elige objetivo y selecciona exactamente la cantidad de variables indicada.</div>";
        return;
      }
      state.patterns = groupPatterns(columns);
      renderPatterns();
    });
  }

  function readPatternActivity() {
    return {
      strong: $("#activity-strong-pattern")?.value || "",
      weak: $("#activity-weak-pattern")?.value || "",
      doubtful: $("#activity-doubtful-pattern")?.value || "",
      strongCheck: Boolean($("#activity-strong-check")?.checked),
      weakCheck: Boolean($("#activity-weak-check")?.checked),
      doubtfulCheck: Boolean($("#activity-doubtful-check")?.checked)
    };
  }

  function writePatternActivity(activity) {
    if ($("#activity-strong-pattern")) $("#activity-strong-pattern").value = activity.strong || "";
    if ($("#activity-weak-pattern")) $("#activity-weak-pattern").value = activity.weak || "";
    if ($("#activity-doubtful-pattern")) $("#activity-doubtful-pattern").value = activity.doubtful || "";
    if ($("#activity-strong-check")) $("#activity-strong-check").checked = Boolean(activity.strongCheck);
    if ($("#activity-weak-check")) $("#activity-weak-check").checked = Boolean(activity.weakCheck);
    if ($("#activity-doubtful-check")) $("#activity-doubtful-check").checked = Boolean(activity.doubtfulCheck);
  }

  function setupPatternActivity() {
    [
      "activity-strong-pattern",
      "activity-weak-pattern",
      "activity-doubtful-pattern",
      "activity-strong-check",
      "activity-weak-check",
      "activity-doubtful-check"
    ].forEach((id) => {
      $(`#${id}`)?.addEventListener("input", saveState);
      $(`#${id}`)?.addEventListener("change", saveState);
    });
  }

  function newRuleId(type) {
    const prefix = type === "excepcion" ? "E" : "R";
    const count = state.rules.filter((rule) => rule.tipo === type).length + 1;
    return `${prefix}${count}`;
  }

  function evaluateEvidence(conditions, result) {
    const matched = state.rows.filter((row) => Object.entries(conditions).every(([column, value]) => String(row[column] || "").trim() === String(value).trim()));
    const correct = matched.filter((row) => String(row[state.target] || "").trim() === String(result).trim()).length;
    const precision = matched.length ? correct / matched.length : 0;
    const confidence = matched.length >= 5 && precision >= 0.8 ? "alta" : matched.length >= 2 && precision >= 0.6 ? "media" : "baja";
    return { coverage: matched.length, precision, confidence };
  }

  function ruleFeedback(rule) {
    const conditionCount = Object.keys(rule.condiciones).length;
    if (!rule.resultado?.[state.target || "resultado"]) return "Regla incompleta: falta resultado.";
    if (!rule.explicacion) return "Regla incompleta: falta explicación.";
    if (conditionCount < 2) return "Regla demasiado general: agrega otra condición.";
    if (conditionCount >= 4 && rule.cobertura <= 1) return "Regla demasiado específica: cubre muy pocos casos.";
    if (rule.cobertura >= 2 && rule.precision >= 0.7) return "Regla con buena evidencia.";
    return "Regla creada, pero la evidencia es débil. Revísala contra más casos.";
  }

  function addRule(data) {
    const resultKey = state.target || "resultado";
    const evidence = data.coverage === undefined ? evaluateEvidence(data.conditions, data.result) : data;
    const rule = {
      id: newRuleId(data.type),
      tipo: data.type,
      prioridad: data.priority,
      condiciones: data.conditions,
      resultado: { [resultKey]: data.result },
      explicacion: data.explanation,
      cobertura: evidence.coverage,
      precision: Number(evidence.precision || 0),
      confianza: evidence.confidence || "baja"
    };
    state.rules.push(rule);
    saveState();
    renderRules();
    $("#rule-feedback").className = `feedback ${rule.precision >= 0.7 ? "good" : "warn"}`;
    $("#rule-feedback").textContent = ruleFeedback(rule);
  }

  function renderConditionEditor() {
    const root = $("#rule-condition-editor");
    const existing = $$(".condition-row", root).map((row) => ({
      column: $(".condition-column", row)?.value || "",
      value: $(".condition-value", row)?.value || ""
    }));
    const rows = existing.length ? existing : [{ column: state.inputs[0] || "", value: "" }, { column: state.inputs[1] || "", value: "" }];
    root.innerHTML = rows.map((row, index) => `
      <div class="condition-row">
        <label class="field">Variable
          <select class="condition-column">${state.inputs.map((input) => `<option value="${escapeHtml(input)}" ${input === row.column ? "selected" : ""}>${escapeHtml(input)}</option>`).join("")}</select>
        </label>
        <label class="field">Valor
          <input class="condition-value" value="${escapeHtml(row.value)}" placeholder="valor exacto">
        </label>
        <button class="btn" type="button" data-remove-condition="${index}">Quitar</button>
      </div>
    `).join("");
    $$("[data-remove-condition]", root).forEach((button) => {
      button.addEventListener("click", () => {
        button.closest(".condition-row").remove();
      });
    });
  }

  function readRuleFormConditions() {
    const conditions = {};
    $$(".condition-row", $("#rule-condition-editor")).forEach((row) => {
      const column = $(".condition-column", row)?.value;
      const value = $(".condition-value", row)?.value.trim();
      if (column && value) conditions[column] = value;
    });
    return conditions;
  }

  function clearRuleForm() {
    $("#rule-result").value = "";
    $("#rule-explanation").value = "";
    renderConditionEditor();
  }

  function renderRules() {
    const normal = state.rules.filter((rule) => rule.tipo === "normal");
    const exceptions = state.rules.filter((rule) => rule.tipo === "excepcion");
    $("#normal-count").textContent = `${normal.length}/5`;
    $("#normal-rules").innerHTML = renderRuleCards(normal);
    $("#exception-rules").innerHTML = renderRuleCards(exceptions);
    const exceptionFeedback = $("#exception-feedback");
    exceptionFeedback.className = `feedback ${exceptions.length >= 2 ? "good" : "warn"}`;
    exceptionFeedback.textContent = exceptions.length >= 2
      ? "Meta cumplida. Revisa que las excepciones tengan prioridad alta y condiciones específicas."
      : "Crea mínimo 2 excepciones. Una excepción suele cubrir un caso crítico, raro o de alto riesgo.";
    $$("[data-delete-rule]").forEach((button) => {
      button.addEventListener("click", () => {
        state.rules = state.rules.filter((rule) => rule.id !== button.dataset.deleteRule);
        saveState();
        renderRules();
      });
    });
  }

  function renderRuleCards(rules) {
    if (!rules.length) return "<div class=\"feedback\">Todavía no hay reglas aquí.</div>";
    return rules.map((rule) => `
      <article class="rule-card">
        <strong>${escapeHtml(rule.id)} · ${escapeHtml(rule.tipo)} · prioridad ${escapeHtml(rule.prioridad)}</strong>
        <p>SI ${escapeHtml(Object.entries(rule.condiciones).map(([k, v]) => `${k} = ${v}`).join(" Y "))}</p>
        <p>ENTONCES ${escapeHtml(Object.entries(rule.resultado).map(([k, v]) => `${k} = ${v}`).join(", "))}</p>
        <p>${escapeHtml(rule.explicacion || "Sin explicación")}</p>
        <div class="card-meta">
          <span>cobertura ${rule.cobertura}</span>
          <span>${Math.round(rule.precision * 100)}% precisión</span>
          <span>confianza ${rule.confianza}</span>
        </div>
        <button class="btn" type="button" data-delete-rule="${escapeHtml(rule.id)}">Eliminar</button>
      </article>
    `).join("");
  }

  function setupRules() {
    $("#add-condition").addEventListener("click", () => {
      $("#rule-condition-editor").insertAdjacentHTML("beforeend", `
        <div class="condition-row">
          <label class="field">Variable
            <select class="condition-column">${state.inputs.map((input) => `<option value="${escapeHtml(input)}">${escapeHtml(input)}</option>`).join("")}</select>
          </label>
          <label class="field">Valor
            <input class="condition-value" placeholder="valor exacto">
          </label>
          <button class="btn" type="button" data-remove-condition>Quitar</button>
        </div>
      `);
      $$("[data-remove-condition]").forEach((button) => button.onclick = () => button.closest(".condition-row").remove());
    });
    $("#clear-rule-form").addEventListener("click", clearRuleForm);
    $("#save-rule").addEventListener("click", () => {
      const conditions = readRuleFormConditions();
      const result = $("#rule-result").value.trim();
      const explanation = $("#rule-explanation").value.trim();
      if (!Object.keys(conditions).length || !result) {
        $("#rule-feedback").className = "feedback warn";
        $("#rule-feedback").textContent = "Regla incompleta: agrega condiciones y resultado.";
        return;
      }
      addRule({
        type: $("#rule-type").value,
        priority: $("#rule-priority").value,
        conditions,
        result,
        explanation
      });
      clearRuleForm();
    });
  }

  function setupFallback() {
    $("#save-fallback").addEventListener("click", () => {
      state.fallback = {
        answer: $("#fallback-answer").value.trim(),
        needs: $("#fallback-needs").value.trim()
      };
      const complete = state.fallback.answer && state.fallback.needs;
      $("#fallback-feedback").className = `feedback ${complete ? "good" : "warn"}`;
      $("#fallback-feedback").textContent = complete
        ? "Respaldo listo: el agente tiene una salida segura cuando ninguna regla aplica."
        : "Falta respuesta o datos mínimos. Sin respaldo, el agente podría inventar.";
      saveState();
    });
  }

  function renderCaseForm() {
    const root = $("#case-form");
    if (!state.inputs.length) {
      root.innerHTML = "<div class=\"feedback\">Carga un CSV y elige variables de entrada.</div>";
      return;
    }
    root.innerHTML = state.inputs.map((column) => {
      const values = Object.keys(valueCounts(state.rows, column)).filter((value) => value !== "(vacío)").slice(0, 18);
      return `
        <label class="field">${escapeHtml(column)}
          <input list="case-list-${escapeHtml(column)}" data-case-column="${escapeHtml(column)}" value="${escapeHtml(state.caseDraft[column] || "")}" placeholder="valor">
          <datalist id="case-list-${escapeHtml(column)}">${values.map((value) => `<option value="${escapeHtml(value)}"></option>`).join("")}</datalist>
        </label>
      `;
    }).join("");
    $$("[data-case-column]", root).forEach((input) => {
      input.addEventListener("input", () => {
        state.caseDraft[input.dataset.caseColumn] = input.value.trim();
        saveState();
      });
    });
  }

  function readCase() {
    const example = $$("[data-case-column]").reduce((acc, input) => {
      if (input.value.trim()) acc[input.dataset.caseColumn] = input.value.trim();
      return acc;
    }, {});
    state.caseDraft = example;
    saveState();
    return example;
  }

  function ruleMatches(rule, example) {
    return Object.entries(rule.condiciones).every(([column, value]) => String(example[column] || "").trim() === String(value).trim());
  }

  function runArena() {
    const example = readCase();
    if (!Object.keys(example).length) {
      $("#arena-result").className = "feedback warn";
      $("#arena-result").textContent = "Completa al menos un valor del caso.";
      return;
    }
    const matches = state.rules
      .filter((rule) => ruleMatches(rule, example))
      .sort((a, b) => priorityScore(b) - priorityScore(a));
    const uniqueResults = new Set(matches.map((rule) => JSON.stringify(rule.resultado)));
    const conflict = uniqueResults.size > 1;
    let message = "";
    if (!matches.length) {
      message = state.fallback.answer
        ? `Ninguna regla aplica. Respaldo: ${state.fallback.answer} Datos mínimos: ${state.fallback.needs || "no definidos"}.`
        : "Ninguna regla aplica y no hay respaldo. El agente debe pedir más datos.";
    } else {
      const winner = matches[0];
      message = `${conflict ? "Conflicto detectado. " : ""}Regla activada: ${winner.id}. Resultado: ${Object.entries(winner.resultado).map(([k, v]) => `${k} = ${v}`).join(", ")}. Explicación: ${winner.explicacion || "sin explicación"}.`;
    }
    $("#arena-result").className = `feedback ${matches.length && !conflict ? "good" : "warn"}`;
    $("#arena-result").textContent = message;
    state.tests.unshift({ example, message, conflict, at: new Date().toLocaleString("es-MX") });
    state.tests = state.tests.slice(0, 12);
    saveState();
    renderHistory();
  }

  function priorityScore(rule) {
    const base = { baja: 1, media: 2, alta: 3 }[rule.prioridad] || 2;
    return base + (rule.tipo === "excepcion" ? 10 : 0);
  }

  function renderHistory() {
    $("#test-count").textContent = `${Math.min(5, state.tests.length)}/5`;
    $("#test-history").innerHTML = state.tests.length ? state.tests.map((test) => `
      <article class="history-item">
        <strong>${escapeHtml(test.at)}</strong>
        <p>${escapeHtml(Object.entries(test.example).map(([k, v]) => `${k}: ${v}`).join(" · "))}</p>
        <p>${escapeHtml(test.message)}</p>
      </article>
    `).join("") : "<div class=\"feedback\">Todavía no hay pruebas.</div>";
  }

  function showGlobalMessage(message, type = "good") {
    const box = $("#global-message");
    if (!box) return;
    box.className = `global-message is-visible ${type}`;
    box.textContent = message;
  }

  function clearClase10Storage() {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(storagePrefix) || key.startsWith("clase10:")) {
        localStorage.removeItem(key);
      }
    });
  }

  function setFeedbackDefaults() {
    $("#dataset-feedback").className = "feedback";
    $("#dataset-feedback").textContent = emptyFeedback.dataset;
    $("#mini-feedback").className = "feedback";
    $("#mini-feedback").textContent = emptyFeedback.mini;
    $("#rule-feedback").className = "feedback";
    $("#rule-feedback").textContent = emptyFeedback.rule;
    $("#exception-feedback").className = "feedback";
    $("#exception-feedback").textContent = emptyFeedback.exception;
    $("#fallback-feedback").className = "feedback";
    $("#fallback-feedback").textContent = emptyFeedback.fallback;
    $("#arena-result").className = "feedback";
    $("#arena-result").textContent = emptyFeedback.arena;
    $("#debug-dashboard").innerHTML = "";
    $("#debug-results").innerHTML = "";
    $("#debug-reflection-feedback").className = "feedback";
    $("#debug-reflection-feedback").textContent = "Tu reflexión aparecerá en el reporte final.";
    $("#json-output").value = "";
    $("#report-output").value = "";
  }

  function resetRuleForgeState() {
    state.headers = [];
    state.rows = [];
    state.diagnosis = null;
    state.target = "";
    state.inputs = [];
    state.patterns = [];
    state.rules = [];
    state.fallback = { answer: "", needs: "" };
    state.caseDraft = {};
    state.debugFindings = [];
    state.debugSummary = null;
    state.debugReflection = {
      reviewed: false,
      explanation: false,
      condition: false,
      confidence: false,
      limitationCheck: false,
      improvement: "",
      limitation: ""
    };
    state.tests = [];
  }

  function renderAll() {
    renderDiagnosis();
    refreshColumnControls();
    renderPatterns();
    renderRules();
    renderHistory();
    renderDebugDashboard();
    renderDebugFindings();
    updateProgress();
  }

  function buildGuidedRule(id, tipo, prioridad, condiciones, result, explicacion, confianza) {
    const evidence = evaluateEvidence(condiciones, result);
    return {
      id,
      tipo,
      prioridad,
      condiciones,
      resultado: { recomendacion: result },
      explicacion,
      cobertura: evidence.coverage,
      precision: Number(evidence.precision || 0),
      confianza
    };
  }

  function loadGuidedExample() {
    resetRuleForgeState();
    $("#csv-text").value = guidedCSV;
    const parsed = parseCSV(guidedCSV);
    state.headers = parsed.headers;
    state.rows = parsed.rows;
    state.diagnosis = diagnose(state.headers, state.rows);
    state.target = "recomendacion";
    state.inputs = ["clima", "gusto", "hambre", "presupuesto", "tipo_cliente"];
    $("#agent-name").value = "CaféBot Rule Forge";
    $("#agent-problem").value = "Recomendar bebidas, snacks o combos a estudiantes universitarios según contexto y preferencias.";
    $("#agent-user").value = "Estudiantes universitarios y encargado de cafetería.";
    $("#fallback-answer").value = "No tengo suficiente información para recomendar con seguridad. Necesito conocer al menos clima, gusto, hambre y presupuesto.";
    $("#fallback-needs").value = "clima\ngusto\nhambre\npresupuesto";
    state.fallback = {
      answer: $("#fallback-answer").value,
      needs: $("#fallback-needs").value
    };
    state.rules = [
      buildGuidedRule("R1", "normal", "media", { clima: "calor", gusto: "dulce" }, "frappe", "Hace calor y el estudiante busca algo dulce, por lo que una bebida fría y dulce puede ser adecuada.", "media"),
      buildGuidedRule("R2", "normal", "media", { clima: "frio", gusto: "amargo" }, "cafe caliente", "Cuando hace frío y el gusto es amargo, el café caliente coincide con el patrón observado.", "media"),
      buildGuidedRule("R3", "normal", "media", { hambre: "alta", presupuesto: "medio" }, "combo escolar", "Si el estudiante tiene hambre alta y presupuesto medio, un combo puede resolver mejor la necesidad.", "media"),
      buildGuidedRule("R4", "normal", "baja", { clima: "lluvia" }, "te caliente", "En clima de lluvia, una bebida caliente puede ser una recomendación adecuada.", "baja"),
      buildGuidedRule("R5", "normal", "baja", { gusto: "salado", hambre: "alta" }, "combo escolar", "Cuando el gusto es salado y el hambre es alta, el combo escolar puede ser más conveniente.", "media"),
      buildGuidedRule("R6", "excepcion", "alta", { presupuesto: "bajo", hambre: "baja" }, "galleta", "Si el presupuesto es bajo y el hambre es baja, conviene priorizar una opción sencilla y económica.", "baja"),
      buildGuidedRule("R7", "excepcion", "alta", { hambre: "alta", presupuesto: "bajo" }, "combo escolar", "Aunque el presupuesto sea bajo, si el hambre es alta se prioriza una opción más llenadora.", "media")
    ];
    state.caseDraft = {
      clima: "calor",
      gusto: "dulce",
      hambre: "baja",
      presupuesto: "medio",
      tipo_cliente: "estudiante"
    };
    state.patterns = groupPatterns(["clima", "gusto"]);
    $("#pattern-size").value = "2";
    $("#mini-value-1").value = "calor";
    $("#mini-value-2").value = "dulce";
    $("#mini-result").value = "frappe";
    writePatternActivity({
      strong: "clima = calor + gusto = dulce -> recomendacion = frappe. Lo convertiría en regla porque se repite y mantiene una salida consistente.",
      weak: "clima = lluvia + gusto = ligero -> recomendacion = te caliente. Puede orientar una regla con confianza baja porque aparece poco.",
      doubtful: "Si una combinación produce varias recomendaciones, agregaría hambre o presupuesto antes de convertirla en regla.",
      strongCheck: true,
      weakCheck: true,
      doubtfulCheck: true
    });
    renderAll();
    renderOptions($("#pattern-columns"), state.inputs, ["clima", "gusto"]);
    runArena();
    runDebug();
    $("#json-output").value = knowledgeJSON();
    $("#report-output").value = buildReport();
    setMissionProgress(missions.map(([id]) => id), true);
    saveState();
    showGlobalMessage("Ejemplo guiado cargado. Recorre las misiones para ver cómo se construye una base de conocimiento. Después puedes limpiar todo y usar tu propio dataset.", "good");
  }

  function clearRuleForgeWorkspace() {
    const ok = window.confirm("Esto borrará el ejemplo, reglas, patrones, pruebas y progreso local de la Clase 10. ¿Deseas continuar?");
    if (!ok) return;
    clearClase10Storage();
    resetRuleForgeState();
    $("#csv-text").value = "";
    $("#csv-file").value = "";
    $("#agent-name").value = "";
    $("#agent-problem").value = "";
    $("#agent-user").value = "";
    $("#fallback-answer").value = "";
    $("#fallback-needs").value = "";
    $("#mini-value-1").value = "";
    $("#mini-value-2").value = "";
    $("#mini-result").value = "";
    $("#rule-result").value = "";
    $("#rule-explanation").value = "";
    writePatternActivity({});
    writeDebugReflection({});
    setMissionProgress(missions.map(([id]) => id), false);
    renderAll();
    setFeedbackDefaults();
    showGlobalMessage("Listo. Ahora carga tu propio dataset para iniciar la dinámica.", "good");
  }

  function setupArena() {
    $("#run-arena").addEventListener("click", runArena);
  }

  function ruleResultText(rule) {
    const entries = Object.entries(rule.resultado || {}).filter(([, value]) => String(value || "").trim());
    return entries.length ? entries.map(([key, value]) => `${key} = ${value}`).join(", ") : "Sin resultado";
  }

  function ruleConditionsText(rule) {
    const entries = Object.entries(rule.condiciones || {}).filter(([, value]) => String(value || "").trim());
    return entries.length ? entries.map(([key, value]) => `${key} = ${value}`).join(" Y ") : "Sin condiciones";
  }

  function ruleSnapshot(rule) {
    return {
      id: rule.id,
      tipo: rule.tipo || "normal",
      prioridad: rule.prioridad || "sin prioridad",
      condiciones: { ...(rule.condiciones || {}) },
      resultado: { ...(rule.resultado || {}) },
      explicacion: rule.explicacion || "",
      confianza: rule.confianza || "",
      cobertura: rule.cobertura,
      precision: rule.precision
    };
  }

  function makeFinding(type, severity, ruleIds, title, whyItMatters, suggestion, rules) {
    return {
      type,
      severity,
      ruleIds,
      title,
      whyItMatters,
      suggestion,
      ruleSnapshots: rules.map(ruleSnapshot)
    };
  }

  function detectRuleIssues(rule) {
    const issues = [];
    const conditionCount = Object.keys(rule.condiciones || {}).filter((key) => String(rule.condiciones[key] || "").trim()).length;
    const hasResult = Object.values(rule.resultado || {}).some((value) => String(value || "").trim());
    const explanation = String(rule.explicacion || "").trim();

    if (!conditionCount) {
      issues.push(makeFinding(
        "missing_conditions",
        "high",
        [rule.id],
        "Regla sin condiciones",
        `${rule.id} no define qué debe observar el agente antes de decidir. Esto puede hacer que la regla se active sin contexto suficiente.`,
        "Agrega condiciones conectadas con las variables de entrada del dataset.",
        [rule]
      ));
    }
    if (!hasResult) {
      issues.push(makeFinding(
        "missing_result",
        "high",
        [rule.id],
        "Regla sin resultado",
        `${rule.id} detecta un caso, pero no dice qué debe recomendar, clasificar, alertar o decidir.`,
        "Define el valor de la columna objetivo o la acción final que debe producir el agente.",
        [rule]
      ));
    }
    if (!explanation || explanation.length < 24) {
      issues.push(makeFinding(
        "missing_explanation",
        "medium",
        [rule.id],
        "Regla sin explicación clara",
        `${rule.id} tiene condiciones y resultado, pero el agente no puede explicar con suficiente claridad por qué decide eso.`,
        "Agrega una explicación conectada con el problema real, las condiciones usadas y el resultado esperado.",
        [rule]
      ));
    }
    if (conditionCount === 1 && ["baja", "media", ""].includes(rule.prioridad || "")) {
      issues.push(makeFinding(
        "too_general",
        "medium",
        [rule.id],
        "Regla posiblemente demasiado general",
        `${rule.id} podría activarse con muy poca información, por lo que puede recomendar en casos donde no tiene suficiente contexto.`,
        "Considera agregar una condición relevante como gusto, hambre, presupuesto o tipo de usuario.",
        [rule]
      ));
    }
    if (conditionCount >= 5) {
      issues.push(makeFinding(
        "too_specific",
        "low",
        [rule.id],
        "Regla posiblemente demasiado específica",
        `${rule.id} usa muchas condiciones y casi nunca podría activarse. Puede ser correcta, pero poco útil para casos nuevos.`,
        "Quita condiciones que no cambian realmente la decisión o valida si todas son necesarias.",
        [rule]
      ));
    }
    if (!rule.confianza) {
      issues.push(makeFinding(
        "missing_confidence",
        "medium",
        [rule.id],
        "Regla sin confianza",
        `${rule.id} necesita nivel de confianza. Esto es importante porque el agente debe saber si la regla representa un patrón fuerte, medio o débil.`,
        "Asigna confianza alta, media o baja según cobertura, precisión o criterio del equipo.",
        [rule]
      ));
    }
    if (!rule.prioridad) {
      issues.push(makeFinding(
        "missing_priority",
        "medium",
        [rule.id],
        "Regla sin prioridad",
        `${rule.id} no indica qué tan importante es frente a otras reglas. Si hay choque, el agente no sabrá cuál obedecer primero.`,
        "Define prioridad baja, media o alta. Usa prioridad alta para excepciones o casos críticos.",
        [rule]
      ));
    }
    if (rule.confianza === "baja") {
      issues.push(makeFinding(
        "low_confidence",
        "low",
        [rule.id],
        "Regla con baja confianza",
        `${rule.id} puede funcionar como regla candidata, pero debería validarse con más datos antes de tratarla como fuerte.`,
        "Conserva la regla con confianza baja o busca más casos en el dataset antes de usarla como regla fuerte.",
        [rule]
      ));
    }
    if (Number(rule.cobertura || 0) === 0) {
      issues.push(makeFinding(
        "missing_evidence",
        "medium",
        [rule.id],
        "Regla sin evidencia en el dataset",
        `${rule.id} suena lógica, pero no se verificó con casos del dataset. Puede ser una suposición inventada.`,
        "Valídala con patrones, cobertura o una revisión en Colab antes de exportarla como conocimiento confiable.",
        [rule]
      ));
    }
    return issues;
  }

  function conditionsCompatible(a, b) {
    const aEntries = Object.entries(a.condiciones || {});
    const bEntries = Object.entries(b.condiciones || {});
    return aEntries.every(([key, value]) => b.condiciones?.[key] === undefined || String(b.condiciones[key]) === String(value))
      && bEntries.every(([key, value]) => a.condiciones?.[key] === undefined || String(a.condiciones[key]) === String(value));
  }

  function detectRuleConflicts(rules) {
    const conflicts = [];
    for (let i = 0; i < rules.length; i += 1) {
      for (let j = i + 1; j < rules.length; j += 1) {
        const a = rules[i];
        const b = rules[j];
        if (!conditionsCompatible(a, b)) continue;
        if (JSON.stringify(a.resultado || {}) === JSON.stringify(b.resultado || {})) continue;
        conflicts.push(makeFinding(
          "conflict",
          "high",
          [a.id, b.id],
          "Posible conflicto entre reglas",
          `${a.id} y ${b.id} pueden activarse en situaciones parecidas, pero producen resultados diferentes. Esto puede confundir al agente.`,
          "Decide cuál tiene más prioridad, convierte una en excepción, agrega condiciones para diferenciarlas o usa confianza para desempatar.",
          [a, b]
        ));
      }
    }
    return conflicts;
  }

  function analyzeKnowledgeBase() {
    const ruleFindings = state.rules.flatMap(detectRuleIssues);
    const conflictFindings = detectRuleConflicts(state.rules);
    const fallbackFindings = [];
    if (!state.fallback.answer || !state.fallback.needs) {
      fallbackFindings.push({
        type: "fallback_incomplete",
        severity: "medium",
        ruleIds: ["respaldo"],
        title: "Regla de respaldo incompleta",
        whyItMatters: "Si ninguna regla aplica y el respaldo está incompleto, el agente puede inventar una respuesta o quedarse sin salida segura.",
        suggestion: "Define qué debe responder cuando no sabe y qué datos mínimos debe pedir.",
        ruleSnapshots: [{
          id: "respaldo",
          tipo: "respaldo",
          prioridad: "seguridad",
          condiciones: {},
          resultado: { respuesta: state.fallback.answer || "Sin respuesta de respaldo" },
          explicacion: state.fallback.needs ? `Datos mínimos: ${state.fallback.needs}` : "Sin datos mínimos definidos",
          confianza: "segura si está completa"
        }]
      });
    }
    state.debugFindings = [...ruleFindings, ...conflictFindings, ...fallbackFindings];
    const rulesWithIssues = new Set(state.debugFindings.flatMap((finding) => finding.ruleIds).filter((id) => id !== "respaldo"));
    const critical = state.debugFindings.filter((finding) => finding.severity === "high").length;
    state.debugSummary = {
      totalRules: state.rules.length,
      readyRules: Math.max(0, state.rules.length - rulesWithIssues.size),
      reviewRules: rulesWithIssues.size,
      conflicts: conflictFindings.length,
      critical,
      text: `Se analizaron ${state.rules.length} reglas. ${Math.max(0, state.rules.length - rulesWithIssues.size)} están listas, ${rulesWithIssues.size} requieren revisión y se detectaron ${conflictFindings.length} posible(s) conflicto(s).`
    };
    renderDebugDashboard();
    renderDebugFindings();
    saveState();
  }

  function renderDebugDashboard() {
    const root = $("#debug-dashboard");
    if (!root) return;
    const summary = state.debugSummary;
    if (!summary) {
      root.innerHTML = "";
      return;
    }
    root.innerHTML = `
      <div class="debug-summary">${escapeHtml(summary.text)}</div>
      <div class="debug-metric"><span>Total</span><strong>${summary.totalRules}</strong></div>
      <div class="debug-metric"><span>Listas</span><strong>${summary.readyRules}</strong></div>
      <div class="debug-metric"><span>Revisión</span><strong>${summary.reviewRules}</strong></div>
      <div class="debug-metric"><span>Conflictos</span><strong>${summary.conflicts}</strong></div>
      <div class="debug-metric"><span>Críticas</span><strong>${summary.critical}</strong></div>
    `;
  }

  function severityLabel(severity) {
    return {
      high: "crítico",
      medium: "revisar",
      low: "mejora",
      ready: "listo"
    }[severity] || "revisar";
  }

  function renderRuleReferenceCard(rule) {
    return `
      <article class="debug-rule-card">
        <strong>${escapeHtml(rule.id)} · ${escapeHtml(rule.tipo === "excepcion" ? "Regla de excepción" : rule.tipo === "respaldo" ? "Regla de respaldo" : "Regla normal")}</strong>
        <dl>
          <div><dt>Prioridad</dt><dd>${escapeHtml(rule.prioridad || "sin prioridad")}</dd></div>
          <div><dt>Condiciones</dt><dd>${escapeHtml(ruleConditionsText(rule))}</dd></div>
          <div><dt>Resultado</dt><dd>${escapeHtml(ruleResultText(rule))}</dd></div>
          <div><dt>Explicación</dt><dd>${escapeHtml(rule.explicacion || "Sin explicación")}</dd></div>
          <div><dt>Confianza</dt><dd>${escapeHtml(rule.confianza || "Sin confianza")}</dd></div>
        </dl>
        <span class="debug-review-chip">Revisar esta regla</span>
      </article>
    `;
  }

  function renderDebugFindings() {
    const root = $("#debug-results");
    if (!root) return;
    if (!state.debugSummary) {
      root.innerHTML = "";
      return;
    }
    if (!state.debugFindings.length) {
      root.innerHTML = `
        <article class="debug-finding severity-ready">
          <div class="debug-finding-header">
            <strong>Base sin problemas básicos detectados</strong>
            <span class="severity-badge ready">listo</span>
          </div>
          <p>La base no muestra errores básicos. Haz pruebas con casos límite antes de entregarla.</p>
        </article>
      `;
      return;
    }
    root.innerHTML = state.debugFindings.map((finding) => {
      const isConflict = finding.type === "conflict";
      return `
        <article class="debug-finding severity-${escapeHtml(finding.severity)}">
          <div class="debug-finding-header">
            <strong>${escapeHtml(finding.title)} · ${escapeHtml(finding.ruleIds.join(" / "))}</strong>
            <span class="severity-badge ${escapeHtml(finding.severity)}">${severityLabel(finding.severity)}</span>
          </div>
          <p><strong>Problema detectado:</strong> ${escapeHtml(finding.title)}.</p>
          <p><strong>Por qué importa:</strong> ${escapeHtml(finding.whyItMatters)}</p>
          <p><strong>Sugerencia de corrección:</strong> ${escapeHtml(finding.suggestion)}</p>
          <div class="${isConflict ? "debug-conflict-grid" : "debug-rule-grid"}">
            ${finding.ruleSnapshots.map(renderRuleReferenceCard).join("")}
          </div>
          ${isConflict ? `
            <div class="debug-conflict-panel">
              <strong>Cómo resolverlo:</strong>
              <ul>
                <li>Asigna mayor prioridad a la regla más específica.</li>
                <li>Convierte una de ellas en excepción.</li>
                <li>Agrega una condición adicional.</li>
                <li>Usa confianza para decidir.</li>
                <li>Define una regla de desempate.</li>
              </ul>
            </div>
          ` : ""}
        </article>
      `;
    }).join("");
  }

  function runDebug() {
    analyzeKnowledgeBase();
  }

  function readDebugReflection() {
    return {
      reviewed: Boolean($("#debug-check-reviewed")?.checked),
      explanation: Boolean($("#debug-check-explanation")?.checked),
      condition: Boolean($("#debug-check-condition")?.checked),
      confidence: Boolean($("#debug-check-confidence")?.checked),
      limitationCheck: Boolean($("#debug-check-limitation")?.checked),
      improvement: $("#debug-improvement")?.value || "",
      limitation: $("#debug-limitation")?.value || ""
    };
  }

  function writeDebugReflection(reflection) {
    if ($("#debug-check-reviewed")) $("#debug-check-reviewed").checked = Boolean(reflection.reviewed);
    if ($("#debug-check-explanation")) $("#debug-check-explanation").checked = Boolean(reflection.explanation);
    if ($("#debug-check-condition")) $("#debug-check-condition").checked = Boolean(reflection.condition);
    if ($("#debug-check-confidence")) $("#debug-check-confidence").checked = Boolean(reflection.confidence);
    if ($("#debug-check-limitation")) $("#debug-check-limitation").checked = Boolean(reflection.limitationCheck);
    if ($("#debug-improvement")) $("#debug-improvement").value = reflection.improvement || "";
    if ($("#debug-limitation")) $("#debug-limitation").value = reflection.limitation || "";
  }

  function saveDebugReflection() {
    state.debugReflection = readDebugReflection();
    saveState();
    const complete = state.debugReflection.improvement.trim() && state.debugReflection.limitation.trim();
    $("#debug-reflection-feedback").className = `feedback ${complete ? "good" : "warn"}`;
    $("#debug-reflection-feedback").textContent = complete
      ? "Reflexión guardada. Se incluirá en el reporte Markdown final."
      : "Reflexión guardada parcialmente. Agrega mejora y limitación para que el reporte quede completo.";
  }

  function setupDebug() {
    $("#run-debug").addEventListener("click", runDebug);
    $("#save-debug-reflection").addEventListener("click", saveDebugReflection);
    [
      "debug-check-reviewed",
      "debug-check-explanation",
      "debug-check-condition",
      "debug-check-confidence",
      "debug-check-limitation",
      "debug-improvement",
      "debug-limitation"
    ].forEach((id) => {
      $(`#${id}`)?.addEventListener("input", () => {
        state.debugReflection = readDebugReflection();
        saveState();
      });
      $(`#${id}`)?.addEventListener("change", () => {
        state.debugReflection = readDebugReflection();
        saveState();
      });
    });
  }

  function knowledgeJSON() {
    return JSON.stringify(state.rules, null, 2);
  }

  function markdownCell(value) {
    return String(value ?? "")
      .replaceAll("|", "\\|")
      .replaceAll("\n", " ")
      .trim() || "No registrado";
  }

  function percent(value) {
    return `${Math.round(Number(value || 0) * 100)}%`;
  }

  function datasetStatus() {
    if (!state.headers.length) return "No se cargó dataset.";
    if (state.diagnosis?.missingPct > 0.25 || state.rows.length < 5) return "requiere limpieza";
    if (state.diagnosis?.notes?.length) return "requiere revisión";
    return "usable";
  }

  function formatConditions(conditions = {}) {
    const entries = Object.entries(conditions).filter(([, value]) => String(value || "").trim());
    return entries.length ? entries.map(([key, value]) => `${key} = ${value}`).join(", ") : "Sin condiciones";
  }

  function formatResult(result = {}) {
    const entries = Object.entries(result).filter(([, value]) => String(value || "").trim());
    return entries.length ? entries.map(([key, value]) => `${key} = ${value}`).join(", ") : "Sin resultado";
  }

  function formatRuleMarkdown(rule) {
    return `### ${rule.id} · ${rule.tipo}
**Prioridad:** ${rule.prioridad || "sin prioridad"}  
**Condiciones:** ${formatConditions(rule.condiciones)}  
**Resultado:** ${formatResult(rule.resultado)}  
**Explicación:** ${rule.explicacion || "Sin explicación"}  
**Cobertura:** ${rule.cobertura ?? "no registrada"}  
**Precisión:** ${percent(rule.precision)}  
**Confianza:** ${rule.confianza || "sin confianza"}`;
  }

  function patternsMarkdownTable() {
    if (!state.patterns.length) return "No se registraron patrones.";
    const rows = state.patterns.map((pattern) => {
      return `| ${markdownCell(formatConditions(pattern.conditions))} | ${markdownCell(pattern.topResult || pattern.result)} | ${pattern.coverage ?? pattern.cases ?? 0} | ${percent(pattern.precision)} | ${markdownCell(pattern.confidence)} | ${markdownCell(pattern.feedback || pattern.strength)} |`;
    });
    return [
      "| Patrón | Resultado más común | Cobertura | Precisión | Confianza | Interpretación |",
      "|---|---|---:|---:|---|---|",
      ...rows
    ].join("\n");
  }

  function rulesMarkdown(type) {
    const rules = state.rules.filter((rule) => rule.tipo === type);
    if (!rules.length) {
      return type === "excepcion" ? "No se registraron reglas de excepción." : "No se registraron reglas normales.";
    }
    return rules.map(formatRuleMarkdown).join("\n\n");
  }

  function testStatus(test) {
    if (test.conflict || /conflicto/i.test(test.message || "")) return "Conflicto";
    if (/Ninguna regla aplica|no hay respaldo|pedir más datos/i.test(test.message || "")) return "No resuelto";
    if (/Respaldo/i.test(test.message || "")) return "Parcial";
    return "Resuelto";
  }

  function activatedRuleFromMessage(message = "") {
    return message.match(/Regla activada:\s*([A-Z]\d+)/)?.[1] || "No registrada";
  }

  function resultFromMessage(message = "") {
    return message.match(/Resultado:\s*([^.]*)/)?.[1]?.trim() || "No registrado";
  }

  function explanationFromMessage(message = "") {
    return message.match(/Explicación:\s*(.*)$/)?.[1]?.trim() || message || "Sin explicación";
  }

  function testsMarkdownTable() {
    if (!state.tests.length) return "No se registraron pruebas de Agent Arena.";
    const rows = state.tests.map((test, index) => {
      const caseData = Object.entries(test.example || {}).map(([key, value]) => `${key}: ${value}`).join(", ");
      return `| Caso ${index + 1} | ${markdownCell(caseData)} | ${markdownCell(activatedRuleFromMessage(test.message))} | ${markdownCell(resultFromMessage(test.message))} | ${testStatus(test)} | ${markdownCell(explanationFromMessage(test.message))} |`;
    });
    return [
      "| Caso | Datos del caso | Regla activada | Resultado | Estado | Explicación |",
      "|---|---|---|---|---|---|",
      ...rows
    ].join("\n");
  }

  function debugChecklistMarkdown(reflection) {
    const checks = [
      ["Revisé las reglas señaladas", reflection.reviewed],
      ["Mejoré al menos una explicación", reflection.explanation],
      ["Ajusté una condición", reflection.condition],
      ["Definí confianza o prioridad", reflection.confidence],
      ["Documenté una limitación de mi base", reflection.limitationCheck]
    ];
    return checks.map(([label, checked]) => `- [${checked ? "x" : " "}] ${label}`).join("\n");
  }

  function debugFindingsMarkdown() {
    if (!state.debugFindings.length) return "No se registraron hallazgos de debug.";
    return state.debugFindings.map((finding) => {
      return `- **${finding.title}** (${finding.ruleIds.join(", ")}): ${finding.whyItMatters} Sugerencia: ${finding.suggestion}`;
    }).join("\n");
  }

  function generateFinalReport() {
    const agentName = $("#agent-name").value.trim() || "Agente sin nombre";
    const problem = $("#agent-problem").value.trim() || "Problema no definido";
    const user = $("#agent-user").value.trim() || "Usuario no definido";
    const generationDate = new Date().toLocaleString("es-MX");
    const datasetLoaded = Boolean(state.headers.length);
    const missingPct = state.diagnosis ? `${Math.round(state.diagnosis.missingPct * 100)}%` : "0%";
    const possibleTargets = state.diagnosis?.possibleTargets?.join(", ") || "No se detectaron posibles columnas objetivo.";
    const debugSummary = state.debugSummary || {
      totalRules: state.rules.length,
      readyRules: 0,
      reviewRules: 0,
      conflicts: 0
    };
    const reviewedRules = [...new Set(state.debugFindings.flatMap((finding) => finding.ruleIds))].join(", ") || "Sin reglas revisadas registradas.";
    const reflection = state.debugReflection || readDebugReflection();
    const knowledge = knowledgeJSON();
    return `# Evidencia Clase 10 · Rule Forge Arena

## 1. Datos generales
- Nombre del equipo o alumno: ______________________________
- Nombre del agente: ${agentName}
- Fecha de generación: ${generationDate}
- Herramientas utilizadas:
  - ChatGPT / Claude / Gemini
  - Google Colab / Notebook Jupyter
  - Página web Clase 10 Rule Forge Arena

## 2. Objetivo de la práctica
Construir, validar y probar una base de conocimiento inicial para un agente inteligente basado en reglas, usando un dataset propio y herramientas de IA asistida.

## 3. Dataset utilizado
${datasetLoaded ? `- Número de filas: ${state.rows.length}
- Número de columnas: ${state.headers.length}
- Columnas detectadas: ${state.headers.join(", ")}
- Porcentaje de valores faltantes: ${missingPct}
- Duplicados detectados: ${state.diagnosis?.duplicates ?? 0}
- Estado del dataset: ${datasetStatus()}
- Posibles columnas objetivo detectadas: ${possibleTargets}` : "No se cargó dataset."}

## 4. Diseño del agente
- Nombre del agente: ${agentName}
- Problema que resuelve: ${problem}
- Usuario del agente: ${user}
- Columna objetivo seleccionada: ${state.target || "no definida"}
- Variables de entrada seleccionadas: ${state.inputs.join(", ") || "no definidas"}

## 5. Patrones encontrados
${patternsMarkdownTable()}

## 6. Reglas normales creadas
${rulesMarkdown("normal")}

## 7. Reglas de excepción
${rulesMarkdown("excepcion")}

## 8. Regla de respaldo
${state.fallback.answer || state.fallback.needs ? `- Respuesta de respaldo: ${state.fallback.answer || "No registrada"}
- Datos mínimos requeridos: ${state.fallback.needs || "No registrados"}
- Explicación: Evita que el agente invente porque define una salida segura cuando ninguna regla aplica y pide los datos mínimos necesarios para decidir.` : "No se registró regla de respaldo."}

## 9. Pruebas en Agent Arena
${testsMarkdownTable()}

## 10. Debug de conocimiento
- Total de reglas analizadas: ${debugSummary.totalRules ?? state.rules.length}
- Reglas listas: ${debugSummary.readyRules ?? 0}
- Reglas que requieren revisión: ${debugSummary.reviewRules ?? 0}
- Conflictos detectados: ${debugSummary.conflicts ?? 0}
- Reglas revisadas: ${reviewedRules}

### Hallazgos principales
${debugFindingsMarkdown()}

### Reflexión de debug
${reflection.improvement || reflection.limitation ? `${debugChecklistMarkdown(reflection)}

- Mi mejora más importante fue: ${reflection.improvement || "no registrada"}
- Una limitación que todavía tiene mi base es: ${reflection.limitation || "no registrada"}` : "No se registró reflexión de debug."}

## 11. Base de conocimiento final
La base de conocimiento se exportó en archivo JSON.

\`\`\`json
${knowledge}
\`\`\`

## Productos finales generados
- Base de conocimiento JSON.
- Reporte de evidencia Markdown.
- Reporte de evidencia TXT.`;
  }

  function buildReport() {
    return generateFinalReport();
  }

  async function copyText(textarea) {
    const text = textarea.value;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      textarea.select();
      document.execCommand("copy");
    }
  }

  function downloadText(filename, text, type = "text/plain;charset=utf-8") {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function setupExport() {
    $("#generate-json").addEventListener("click", () => {
      $("#json-output").value = knowledgeJSON();
    });
    $("#copy-json").addEventListener("click", () => copyText($("#json-output")));
    $("#download-json").addEventListener("click", () => {
      const output = $("#json-output").value || knowledgeJSON();
      $("#json-output").value = output;
      downloadText("base-conocimiento-clase10.json", output, "application/json;charset=utf-8");
    });
    $("#generate-report").addEventListener("click", () => {
      $("#report-output").value = buildReport();
    });
    $("#copy-report").addEventListener("click", () => copyText($("#report-output")));
    $("#download-report-md").addEventListener("click", () => {
      const output = $("#report-output").value || buildReport();
      $("#report-output").value = output;
      downloadText("evidencia-clase10-rule-forge.md", output, "text/markdown;charset=utf-8");
    });
    $("#download-report-txt").addEventListener("click", () => {
      const output = $("#report-output").value || buildReport();
      $("#report-output").value = output;
      downloadText("evidencia-clase10-rule-forge.txt", output, "text/plain;charset=utf-8");
    });
  }

  function init() {
    setupNavigation();
    setupProgress();
    loadState();
    setupWorkMode();
    setupDataset();
    setupMiniBuilder();
    setupPatterns();
    setupPatternActivity();
    setupRules();
    setupFallback();
    setupArena();
    setupDebug();
    setupExport();
    renderRules();
    renderHistory();
    refreshColumnControls();
  }

  document.addEventListener("DOMContentLoaded", init);
})();

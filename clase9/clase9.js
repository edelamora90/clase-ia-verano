(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const state = { headers: [], rows: [], diagnosis: null };
  const targetKeywords = /(recomendacion|resultado|riesgo|solucion|clase|categoria|diagnostico|accion|estado|target|label)/i;
  const riskyInput = /(id|nombre|correo|email|teléfono|telefono|phone|folio)/i;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setupXP() {
    const checks = $$("[data-xp-check]");
    const xpBar = $("#c9-xp-bar");
    const xpText = $("#c9-xp-text");
    const badge = $("#c9-badge-status");

    function updateXP() {
      let xp = 0;
      checks.forEach((check) => {
        if (check.checked) {
          xp += Number(check.closest("[data-xp]")?.dataset.xp || 0);
        }
        localStorage.setItem(`clase9:${check.dataset.xpCheck}`, check.checked ? "1" : "0");
      });
      if (xpBar) xpBar.style.width = `${Math.min(100, xp)}%`;
      if (xpText) xpText.textContent = `${xp} / 100 XP`;
      if (badge) {
        badge.textContent = xp >= 100
          ? "Insignia desbloqueada: Arquitecto de Agentes IA"
          : "Insignia bloqueada";
      }
    }

    checks.forEach((check) => {
      check.checked = localStorage.getItem(`clase9:${check.dataset.xpCheck}`) === "1";
      check.addEventListener("change", updateXP);
    });
    updateXP();
  }

  function setupNavigation() {
    const sidebar = $("#mission-sidebar");
    const toggle = $("#sidebar-toggle");
    const overlay = $("#sidebar-overlay");
    const links = $$(".c9-nav a");
    const desktopQuery = window.matchMedia("(min-width: 1101px)");

    function isDesktop() {
      return desktopQuery.matches;
    }

    function syncSidebarState() {
      if (!sidebar || !toggle || !overlay) return;
      if (isDesktop()) {
        document.body.classList.remove("sidebar-open");
        overlay.setAttribute("aria-hidden", "true");
        const expanded = !document.body.classList.contains("sidebar-collapsed");
        toggle.setAttribute("aria-expanded", String(expanded));
      } else {
        document.body.classList.remove("sidebar-collapsed");
        const expanded = document.body.classList.contains("sidebar-open");
        toggle.setAttribute("aria-expanded", String(expanded));
        overlay.setAttribute("aria-hidden", String(!expanded));
      }
    }

    function openSidebar() {
      if (!sidebar || !toggle || !overlay) return;
      if (isDesktop()) {
        document.body.classList.remove("sidebar-collapsed");
      } else {
        document.body.classList.add("sidebar-open");
        overlay.setAttribute("aria-hidden", "false");
      }
      toggle.setAttribute("aria-expanded", "true");
    }

    function closeSidebar() {
      if (!sidebar || !toggle || !overlay) return;
      if (isDesktop()) {
        document.body.classList.add("sidebar-collapsed");
      } else {
        document.body.classList.remove("sidebar-open");
        overlay.setAttribute("aria-hidden", "true");
      }
      toggle.setAttribute("aria-expanded", "false");
    }

    function toggleSidebar() {
      const expanded = isDesktop()
        ? !document.body.classList.contains("sidebar-collapsed")
        : document.body.classList.contains("sidebar-open");
      if (expanded) {
        closeSidebar();
      } else {
        openSidebar();
      }
    }

    toggle?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleSidebar();
    });

    overlay?.addEventListener("click", () => {
      if (!isDesktop()) closeSidebar();
    });

    document.addEventListener("click", (event) => {
      if (isDesktop() || !document.body.classList.contains("sidebar-open")) return;
      if (sidebar?.contains(event.target) || toggle?.contains(event.target)) return;
      closeSidebar();
    });

    links.forEach((link) => {
      link.addEventListener("click", () => {
        if (!isDesktop()) closeSidebar();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !isDesktop()) closeSidebar();
    });

    desktopQuery.addEventListener("change", syncSidebarState);
    syncSidebarState();

    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: "-35% 0px -58% 0px", threshold: 0.01 });

    sections.forEach((section) => observer.observe(section));
  }

  function parseCSV(text) {
    const rows = [];
    let field = "";
    let record = [];
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
        record.push(field.trim());
        field = "";
      } else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && next === "\n") i += 1;
        record.push(field.trim());
        if (record.some((item) => item !== "")) rows.push(record);
        field = "";
        record = [];
      } else {
        field += char;
      }
    }

    record.push(field.trim());
    if (record.some((item) => item !== "")) rows.push(record);
    if (!rows.length) return { headers: [], rows: [] };

    const headers = rows[0].map((header, index) => header || `columna_${index + 1}`);
    const dataRows = rows.slice(1).map((values) => {
      return headers.reduce((row, header, index) => {
        row[header] = values[index] === undefined ? "" : values[index].trim();
        return row;
      }, {});
    });

    return { headers, rows: dataRows };
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

  function missingByColumn(headers, rows) {
    return headers.map((column) => {
      const count = rows.filter((row) => !String(row[column] || "").trim()).length;
      return { column, count, pct: rows.length ? (count / rows.length) * 100 : 0 };
    });
  }

  function valueCounts(rows, column) {
    const counts = rows.reduce((acc, row) => {
      const key = String(row[column] || "").trim() || "(vacío)";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }

  function uniqueCount(rows, column) {
    return new Set(rows.map((row) => String(row[column] || "").trim()).filter(Boolean)).size;
  }

  function diagnose(headers, rows) {
    const missing = missingByColumn(headers, rows);
    const missingValues = missing.reduce((sum, column) => sum + column.count, 0);
    const totalCells = Math.max(1, headers.length * rows.length);
    const missingPct = (missingValues / totalCells) * 100;
    const duplicates = duplicateCount(rows);
    const possibleTargets = headers.filter((header) => targetKeywords.test(header));
    const issues = [];

    if (!headers.length) issues.push("No se detectaron columnas. Revisa el formato del CSV.");
    if (rows.length < 8) issues.push("Tiene pocos registros. Sirve para diseñar, pero será débil para entrenar un modelo.");
    if (missingPct > 10) issues.push("Tiene más de 10% de valores faltantes. Requiere revisión antes de entrenar.");
    if (duplicates > 0) issues.push(`Tiene ${duplicates} fila(s) duplicada(s) exacta(s).`);
    if (!possibleTargets.length) issues.push("No se detectó una columna objetivo por nombre. Elige una manualmente.");

    let level = "usable";
    if (!headers.length || rows.length < 5 || missingPct > 25) {
      level = "requiere limpieza";
    } else if (issues.length) {
      level = "requiere revisión";
    }

    return { level, issues, missing, missingPct, duplicates, possibleTargets };
  }

  function inputHint(column) {
    if (riskyInput.test(column)) return "Advertencia: parece identificador o dato personal.";
    if (/(fecha|date)/i.test(column)) return "Úsala solo si el tiempo influye en la decisión.";
    return "Puede ser entrada si ayuda a explicar el objetivo.";
  }

  function renderMission2DatasetContext() {
    const context = $("#c9-m2-dataset-context");
    const status = $("#c9-m2-radar-status");
    if (!context || !status) return;

    if (!state.headers.length) {
      status.textContent = "Esperando análisis";
      context.textContent = "Analiza un CSV en la Misión 1 para detectar columnas y posibles salidas.";
      return;
    }

    const possibleOutputs = state.headers.filter((header) => targetKeywords.test(header));
    const previewColumns = state.headers.slice(0, 8);
    status.textContent = possibleOutputs.length ? "Salida detectada" : "Revisión manual";

    context.innerHTML = `
      <div class="c9-m2-stat-grid">
        <span>${state.rows.length} filas</span>
        <span>${state.headers.length} columnas</span>
      </div>
      <div>
        <strong>Columnas visibles</strong>
        <div class="c9-m2-column-list">
          ${previewColumns.map((column) => `<span>${escapeHtml(column)}</span>`).join("")}
          ${state.headers.length > previewColumns.length ? `<span>+${state.headers.length - previewColumns.length} más</span>` : ""}
        </div>
      </div>
      <div>
        <strong>Posibles columnas relacionadas con decisión</strong>
        <div class="c9-m2-target-list">
          ${possibleOutputs.length
            ? possibleOutputs.map((column) => `<span>${escapeHtml(column)}</span>`).join("")
            : "<span>No detectada</span>"}
        </div>
      </div>
      <p>${possibleOutputs.length
        ? `Tu dataset parece tener una posible salida: ${escapeHtml(possibleOutputs[0])}. Esto puede ayudarte a definir qué decidirá el agente.`
        : "No detecté una columna de salida evidente. Observa tus columnas y define qué resultado tendría sentido que el agente produzca."}</p>`;
  }

  function updateMission2Definition() {
    const definition = $("#m2-definition");
    if (!definition) return;

    const description = fieldValue("#m2-dataset-desc") || "[descripción del dataset]";
    const user = fieldValue("#m2-user") || "[usuario]";
    const decision = fieldValue("#m2-agent-help") || fieldValue("#m2-repeated-decision") || "[decisión]";
    const decide = fieldValue("#m2-agent-decide") || "[qué debe decidir]";

    definition.textContent = `Mi agente ayudará a ${user} a ${decision} usando datos sobre ${description}. Cuando reciba un nuevo caso, deberá ${decide}.`;
  }

  function reviewMission2Problem() {
    const feedback = $("#m2-feedback");
    if (!feedback) return;

    const fields = [
      ["Mi dataset describe", fieldValue("#m2-dataset-desc")],
      ["El usuario que podría necesitar este agente es", fieldValue("#m2-user")],
      ["La decisión que se repite en este problema es", fieldValue("#m2-repeated-decision")],
      ["Mi agente ayudará a", fieldValue("#m2-agent-help")],
      ["Cuando el agente reciba un nuevo caso, debería decidir", fieldValue("#m2-agent-decide")]
    ];
    const missing = fields.filter(([, value]) => !value).map(([label]) => label);
    const allText = fields.map(([, value]) => value.toLowerCase()).join(" ");
    const description = fieldValue("#m2-dataset-desc");
    const user = fieldValue("#m2-user");
    const decisionText = `${fieldValue("#m2-repeated-decision")} ${fieldValue("#m2-agent-help")} ${fieldValue("#m2-agent-decide")}`.toLowerCase();
    const decisionVerb = /(recomendar|recomienda|clasificar|clasifica|alertar|alerta|diagnosticar|diagnostica|sugerir|sugiere|priorizar|prioriza|decidir|decide|detectar|detecta|asignar|asigna|categorizar|categoriza)/i;
    const analysisOnly = /(analizar|analiza|explorar|explora|visualizar|visualiza|describir|describe|resumir|resume|revisar datos|ver datos)/i;
    const messages = [];

    if (missing.length) {
      messages.push(`Faltan campos por completar: ${missing.join(", ")}.`);
    }
    if (description && description.length < 35) {
      messages.push("La descripción del dataset necesita un poco más de contexto: qué representa cada fila y qué situación real aparece.");
    }
    if (!user || user.length < 3) {
      messages.push("Define quién usará el agente: una persona, rol o área concreta.");
    }
    if (!decisionVerb.test(decisionText)) {
      messages.push("Incluye una decisión con verbos como recomendar, clasificar, alertar, diagnosticar, sugerir o priorizar.");
    }
    if (analysisOnly.test(allText) && !decisionVerb.test(decisionText)) {
      messages.push("Suena todavía a análisis de datos. Convierte ese análisis en una acción del agente.");
    }

    feedback.classList.toggle("is-good", messages.length === 0);
    feedback.classList.toggle("is-warn", messages.length > 0);
    feedback.innerHTML = messages.length
      ? messages.map((message) => `<p>${escapeHtml(message)}</p>`).join("")
      : "<p>Buen avance. Tu problema ya tiene contexto, usuario y decisión. En la siguiente misión podrás conectar esta decisión con una columna objetivo.</p>";

    updateMission2Definition();
  }

  function renderDiagnosis() {
    const box = $("#c9-diagnosis");
    const target = $("#c9-target");
    if (!box || !target || !state.diagnosis) return;

    const { diagnosis } = state;
    const statusClass = diagnosis.level === "usable"
      ? "ok"
      : diagnosis.level === "requiere revisión" ? "warn" : "bad";
    const missingColumns = diagnosis.missing.filter((item) => item.count > 0);

    box.innerHTML = `
      <div class="c9-status ${statusClass}">
        <strong>Estado: ${escapeHtml(diagnosis.level.toUpperCase())}</strong>
        <span>${state.rows.length} filas · ${state.headers.length} columnas · ${diagnosis.missingPct.toFixed(1)}% faltantes · ${diagnosis.duplicates} duplicados</span>
      </div>
      <div class="c9-feedback-list">
        ${diagnosis.issues.length
          ? diagnosis.issues.map((issue) => `<p>${escapeHtml(issue)}</p>`).join("")
          : "<p>El dataset parece usable para diseñar el agente.</p>"}
      </div>
      <details>
        <summary>Columnas con valores faltantes</summary>
        <div class="c9-missing-grid">
          ${missingColumns.length
            ? missingColumns.map((item) => `<span>${escapeHtml(item.column)}: ${item.count} (${item.pct.toFixed(1)}%)</span>`).join("")
            : "<span>No se detectaron columnas con faltantes.</span>"}
        </div>
      </details>`;

    const current = target.value;
    const options = state.headers.map((header) => {
      const selected = header === current || (!current && diagnosis.possibleTargets[0] === header);
      const marker = diagnosis.possibleTargets.includes(header) ? " · sugerida" : "";
      return `<option value="${escapeHtml(header)}"${selected ? " selected" : ""}>${escapeHtml(header + marker)}</option>`;
    });
    target.innerHTML = options.join("");
    renderTargetFeedback();
  }

  function renderTargetFeedback() {
    const target = $("#c9-target");
    const feedback = $("#c9-target-feedback");
    const vars = $("#c9-input-vars");
    if (!target || !feedback || !vars) return;

    const column = target.value;
    if (!column) {
      feedback.textContent = "Selecciona una columna objetivo.";
      vars.innerHTML = "";
      return;
    }

    const counts = valueCounts(state.rows, column);
    const total = state.rows.length || 1;
    const top = counts[0];
    const topPct = top ? (top[1] / total) * 100 : 0;
    const uniques = uniqueCount(state.rows, column);
    const missing = state.rows.filter((row) => !String(row[column] || "").trim()).length;
    const messages = [];

    if (missing > 0) messages.push(`El objetivo tiene ${missing} valores vacíos.`);
    if (uniques > Math.max(10, total * 0.6)) messages.push("Tiene demasiados valores únicos; podría ser ID, folio o texto libre.");
    if (topPct > 75 && counts.length > 1) messages.push("Está desbalanceado: una clase domina demasiado.");
    if (!messages.length) messages.push("Parece una columna objetivo razonable. Justifica por qué representa la decisión final.");

    feedback.innerHTML = `
      <p><strong>${escapeHtml(column)}</strong>: ${uniques} clases · dominante: ${escapeHtml(top ? top[0] : "N/A")} (${topPct.toFixed(1)}%)</p>
      ${messages.map((message) => `<p>${escapeHtml(message)}</p>`).join("")}
      <div class="c9-dynamic-bars">
        ${counts.map(([label, count]) => {
          const width = Math.max(10, (count / total) * 100);
          return `<div><span>${escapeHtml(label)}</span><strong style="width:${width}%">${count}</strong></div>`;
        }).join("")}
      </div>`;

    vars.innerHTML = state.headers
      .filter((header) => header !== column)
      .map((header) => {
        const risky = riskyInput.test(header);
        return `
          <label class="c9-var-option">
            <input type="checkbox" value="${escapeHtml(header)}"${risky ? "" : " checked"}>
            <span>${escapeHtml(header)}</span>
            <small>${escapeHtml(inputHint(header))}</small>
          </label>`;
      })
      .join("");

    renderInputFeedback();
  }

  function renderInputFeedback() {
    const box = $("#c9-input-feedback");
    if (!box) return;

    const selected = $$("#c9-input-vars input:checked").map((input) => input.value);
    const risky = selected.filter((column) => riskyInput.test(column));
    const messages = [];

    if (selected.length < 2) messages.push("Selecciona al menos 2 variables de entrada.");
    if (risky.length) messages.push(`Advertencia: ${risky.join(", ")} parecen identificadores o datos personales.`);
    if (!messages.length) messages.push("La selección parece adecuada. Justifica por qué cada variable ayuda a tomar la decisión.");

    box.innerHTML = messages.map((message) => `<p>${escapeHtml(message)}</p>`).join("");
  }

  function analyzeDataset() {
    const parsed = parseCSV($("#c9-csv")?.value || "");
    state.headers = parsed.headers;
    state.rows = parsed.rows;
    state.diagnosis = diagnose(state.headers, state.rows);
    renderDiagnosis();
    renderMission2DatasetContext();
  }

  function fieldValue(selector) {
    return $(selector)?.value.trim() || "";
  }

  function generateEvidence() {
    const selected = $$("#c9-input-vars input:checked").map((input) => input.value);
    const hypotheses = $$(".hypothesis").map((textarea) => textarea.value.trim()).filter(Boolean);
    const rules = $$(".rule-candidate").map((textarea) => textarea.value.trim()).filter(Boolean);
    const target = $("#c9-target")?.value || "";
    const d = state.diagnosis;
    const observations = d?.issues.length
      ? d.issues.map((issue) => `  - ${issue}`).join("\n")
      : "  - El dataset parece usable para diseñar el agente.";

    const markdown = `# Clase 9 · Diseño del agente inteligente

## 1. Nombre del agente
${fieldValue("#agent-name") || "[Pendiente]"}

## 2. Usuario del agente
${fieldValue("#agent-user") || "[Pendiente]"}

## 3. Problema real
${fieldValue("#agent-problem") || "[Pendiente]"}

## 4. Decisión que tomará
${fieldValue("#agent-decision") || "[Pendiente]"}

## 5. Diagnóstico del dataset
- Filas: ${state.rows.length}
- Columnas: ${state.headers.length}
- Estado: ${d ? d.level : "no analizado"}
- Porcentaje de valores faltantes: ${d ? `${d.missingPct.toFixed(1)}%` : "no analizado"}
- Columnas con faltantes: ${d ? (d.missing.filter((item) => item.count > 0).map((item) => item.column).join(", ") || "ninguna") : "no analizado"}
- Duplicados exactos: ${d ? d.duplicates : "no analizado"}
- Observaciones:
${observations}

## 6. Columna objetivo
${target || "[Pendiente]"}

Justificación:
[Explica por qué esta columna representa la salida que el agente debe producir.]

## 7. Variables de entrada seleccionadas
${selected.length ? selected.map((column) => `- ${column}`).join("\n") : "[Pendiente]"}

## 8. Hipótesis de decisión
${hypotheses.length ? hypotheses.map((item, index) => `${index + 1}. ${item}`).join("\n") : "[Pendiente]"}

## 9. Reglas candidatas SI/ENTONCES
${rules.length ? rules.map((item, index) => `${index + 1}. ${item}`).join("\n") : "[Pendiente]"}

## 10. PEAS
- Performance: ${fieldValue("#peas-p") || "[Pendiente]"}
- Environment: ${fieldValue("#peas-e") || "[Pendiente]"}
- Actuators: ${fieldValue("#peas-a") || "[Pendiente]"}
- Sensors: ${fieldValue("#peas-s") || "[Pendiente]"}

## 11. Arquitectura propuesta
Datos de entrada → validación → predicción/clasificación → reglas → respuesta explicada.

## 12. Limitaciones iniciales
[Explica qué casos todavía no podría resolver el agente y qué datos faltan para mejorarlo.]`;

    $("#c9-evidence-output").textContent = markdown;
  }

  function setupSandbox() {
    $("#c9-analyze")?.addEventListener("click", analyzeDataset);
    $("#c9-target")?.addEventListener("change", renderTargetFeedback);
    $("#c9-input-vars")?.addEventListener("change", renderInputFeedback);
    $("#c9-file")?.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      $("#c9-csv").value = await file.text();
      analyzeDataset();
    });
    $("#c9-generate-evidence")?.addEventListener("click", generateEvidence);
    $("#c9-copy-evidence")?.addEventListener("click", async () => {
      const button = $("#c9-copy-evidence");
      try {
        await navigator.clipboard.writeText($("#c9-evidence-output")?.textContent || "");
        button.textContent = "Copiado";
        setTimeout(() => {
          button.textContent = "Copiar evidencia";
        }, 1300);
      } catch {
        button.textContent = "No se pudo copiar";
        setTimeout(() => {
          button.textContent = "Copiar evidencia";
        }, 1500);
      }
    });
    analyzeDataset();
  }

  function setupMission2() {
    $("#m2-review-problem")?.addEventListener("click", reviewMission2Problem);
    [
      "#m2-dataset-desc",
      "#m2-user",
      "#m2-repeated-decision",
      "#m2-agent-help",
      "#m2-agent-decide"
    ].forEach((selector) => {
      $(selector)?.addEventListener("input", updateMission2Definition);
    });
    renderMission2DatasetContext();
    updateMission2Definition();
  }

  setupXP();
  setupNavigation();
  setupMission2();
  setupSandbox();
})();

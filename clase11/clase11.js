(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const storageKey = "clase11-battle-inference:state";
  const priorityScore = { alta: 3, media: 2, baja: 1 };
  const confidenceScore = { alta: 3, media: 2, baja: 1 };
  const typeClass = {
    fuego: "type-fuego",
    planta: "type-planta",
    agua: "type-agua",
    electrico: "type-electrico",
    roca: "type-roca",
    normal: "type-normal"
  };
  const defaultKeys = [
    "criatura_jugador",
    "tipo_jugador",
    "criatura_enemigo",
    "tipo_enemigo",
    "nivel_jugador",
    "nivel_enemigo",
    "vida_jugador",
    "vida_enemigo",
    "energia",
    "ataque_disponible",
    "tipo_ataque",
    "tiene_pocion"
  ];

  const creatures = {
    Charm: {
      name: "Charm",
      type: "fuego",
      level: "medio",
      hp: 85,
      energy: 70,
      asset: "./assets/charmander.png",
      fallback: "C",
      attacks: [
        { id: "chispa_fuego", label: "Chispa Fuego", type: "fuego", power: "medio" },
        { id: "rasguño", label: "Rasguño", type: "normal", power: "bajo" },
        { id: "flama_intensa", label: "Flama Intensa", type: "fuego", power: "alto", requires: "energia alta" }
      ]
    },
    Bulbi: {
      name: "Bulbi",
      type: "planta",
      level: "medio",
      hp: 90,
      energy: 60,
      asset: "./assets/bulbasur.png",
      fallback: "B",
      attacks: [
        { id: "latigo_cepa", label: "Latigo Cepa", type: "planta", power: "medio" },
        { id: "placaje", label: "Placaje", type: "normal", power: "bajo" },
        { id: "esporas", label: "Esporas", type: "planta", power: "defensivo" }
      ]
    },
    Pica: { name: "Pica", type: "electrico", level: "medio", hp: 82, energy: 78, asset: "./assets/pica.png", fallback: "P", attacks: [] },
    Oni: { name: "Oni", type: "roca", level: "alto", hp: 96, energy: 52, asset: "./assets/oni.png", fallback: "O", attacks: [] },
    Squar: { name: "Squar", type: "agua", level: "medio", hp: 88, energy: 64, asset: "./assets/squar.png", fallback: "S", attacks: [] }
  };

  const inferenceState = {
    rawJson: "",
    knowledgeBase: [],
    rules: [],
    fallbackRule: null,
    activeRules: [],
    inactiveRules: [],
    selectedRuleId: "",
    currentCase: {},
    winningRule: null,
    conflict: null,
    trialCases: [],
    validation: null,
    battleLog: "",
    turn: 1,
    engineTraceStep: 0,
    engineTraceTimers: [],
    student: {
      rawJson: "",
      knowledgeBase: null,
      rules: [],
      fallbackRule: null,
      currentCase: {},
      savedCases: [],
      activeRules: [],
      inactiveRules: [],
      winningRule: null,
      conflict: null,
      validation: null,
      variables: [],
      colabCode: "",
      colabStatus: "",
      report: ""
    },
    finalReflection: {
      learning: "",
      bestCase: "",
      failedCase: "",
      nextImprovement: ""
    },
    progress: {}
  };

  const initialBattleState = {
    turn: 1,
    running: false,
    finished: false,
    winner: null,
    defending: false,
    status: "Esperando inferencia",
    player: {
      name: "Charm",
      type: "fuego",
      level: "medio",
      hp: 85,
      maxHp: 85,
      energy: 70,
      maxEnergy: 100,
      potion: true,
      charging: null
    },
    enemy: {
      name: "Bulbi",
      type: "planta",
      level: "medio",
      hp: 90,
      maxHp: 90,
      energy: 60,
      maxEnergy: 100
    },
    lastAction: null,
    logs: ["Batalla reiniciada. Charm espera instrucciones del motor."]
  };

  let battleState = structuredClone(initialBattleState);

  const guidedKnowledgeBase = {
    agent: {
      nombre: "Battle Inference Engine",
      problema: "Recomendar la mejor acción de Charm durante un combate por turnos usando vida, energía, tipos, ataques y prioridad de reglas.",
      usuario: "Jugador que necesita decidir qué acción tomar en el turno actual.",
      salida: "accion_recomendada"
    },
    rules: [
      {
        id: "R1",
        tipo: "excepcion",
        prioridad: "alta",
        condiciones: { vida_jugador: "baja", tiene_pocion: "si" },
        resultado: { accion_recomendada: "usar_pocion" },
        explicacion: "La vida de Charm está baja y hay una poción disponible. Sobrevivir tiene prioridad antes de atacar.",
        confianza: "alta"
      },
      {
        id: "R2",
        tipo: "normal",
        prioridad: "media",
        condiciones: { tipo_ataque: "fuego", tipo_enemigo: "planta" },
        resultado: { accion_recomendada: "usar_ataque_fuego" },
        explicacion: "Los ataques de fuego son efectivos contra criaturas de tipo planta. Charm puede aprovechar ventaja elemental contra Bulbi.",
        confianza: "alta"
      },
      {
        id: "R3",
        tipo: "normal",
        prioridad: "media",
        condiciones: { tipo_ataque: "agua", tipo_enemigo: "fuego" },
        resultado: { accion_recomendada: "usar_ataque_agua" },
        explicacion: "Los ataques de agua son efectivos contra criaturas de tipo fuego.",
        confianza: "alta"
      },
      {
        id: "R4",
        tipo: "normal",
        prioridad: "media",
        condiciones: { tipo_ataque: "planta", tipo_enemigo: "agua" },
        resultado: { accion_recomendada: "usar_ataque_planta" },
        explicacion: "Los ataques de planta son efectivos contra criaturas de tipo agua.",
        confianza: "alta"
      },
      {
        id: "R5",
        tipo: "normal",
        prioridad: "media",
        condiciones: { tipo_ataque: "electrico", tipo_enemigo: "agua" },
        resultado: { accion_recomendada: "usar_ataque_electrico" },
        explicacion: "Los ataques eléctricos son efectivos contra criaturas de tipo agua.",
        confianza: "alta"
      },
      {
        id: "R6",
        tipo: "normal",
        prioridad: "alta",
        condiciones: { vida_enemigo: "baja", energia: "alta" },
        resultado: { accion_recomendada: "ataque_especial" },
        explicacion: "El enemigo tiene poca vida y Charm tiene energía suficiente para preparar Flama Intensa. Hace más daño, pero consume 2 turnos: un turno para cargar y otro para liberar el ataque.",
        confianza: "media"
      },
      {
        id: "R6B",
        tipo: "normal",
        prioridad: "baja",
        condiciones: { ataque_disponible: "rasguño", tipo_enemigo: "planta" },
        resultado: { accion_recomendada: "usar_rasguño" },
        explicacion: "Rasguño puede usarse cuando no hay energía para fuego, pero es menos eficaz contra Bulbi porque no aprovecha la ventaja elemental. Si Charm tiene energía, debería escoger Chispa Fuego o preparar Flama Intensa.",
        confianza: "media"
      },
      {
        id: "R7",
        tipo: "excepcion",
        prioridad: "alta",
        condiciones: { vida_jugador: "baja", tiene_pocion: "no" },
        resultado: { accion_recomendada: "defender" },
        explicacion: "La vida de Charm está baja y no hay poción disponible, por lo que conviene defender para reducir daño.",
        confianza: "media"
      },
      {
        id: "R8",
        tipo: "normal",
        prioridad: "baja",
        condiciones: { nivel_enemigo: "alto", nivel_jugador: "bajo" },
        resultado: { accion_recomendada: "cambiar_estrategia" },
        explicacion: "El enemigo tiene mayor nivel, así que atacar directamente puede ser riesgoso.",
        confianza: "media"
      },
      {
        id: "R_BACKUP",
        tipo: "respaldo",
        prioridad: "baja",
        condiciones: {},
        resultado: { accion_recomendada: "analizar_mas_datos" },
        explicacion: "No hay suficiente información para recomendar una acción segura. Se necesitan datos sobre vida, energía, tipo de ataque y tipo enemigo.",
        confianza: "baja"
      }
    ]
  };

  const guidedCases = [
    {
      name: "Charm vs Bulbi · ventaja fuego",
      expected: "usar_ataque_fuego",
      data: {
        criatura_jugador: "Charm",
        tipo_jugador: "fuego",
        criatura_enemigo: "Bulbi",
        tipo_enemigo: "planta",
        nivel_jugador: "medio",
        nivel_enemigo: "medio",
        vida_jugador: "alta",
        vida_enemigo: "alta",
        energia: "media",
        ataque_disponible: "chispa_fuego",
        tipo_ataque: "fuego",
        tiene_pocion: "si"
      }
    },
    {
      name: "Charm en peligro · prioridad supervivencia",
      expected: "usar_pocion",
      data: {
        criatura_jugador: "Charm",
        tipo_jugador: "fuego",
        criatura_enemigo: "Bulbi",
        tipo_enemigo: "planta",
        nivel_jugador: "medio",
        nivel_enemigo: "medio",
        vida_jugador: "baja",
        vida_enemigo: "alta",
        energia: "media",
        ataque_disponible: "chispa_fuego",
        tipo_ataque: "fuego",
        tiene_pocion: "si"
      }
    },
    {
      name: "Pica vs Squar · final posible",
      expected: "ataque_especial o usar_ataque_electrico",
      data: {
        criatura_jugador: "Pica",
        tipo_jugador: "electrico",
        criatura_enemigo: "Squar",
        tipo_enemigo: "agua",
        nivel_jugador: "medio",
        nivel_enemigo: "medio",
        vida_jugador: "alta",
        vida_enemigo: "baja",
        energia: "alta",
        ataque_disponible: "chispa_volt",
        tipo_ataque: "electrico",
        tiene_pocion: "no"
      }
    }
  ];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalize(value) {
    return String(value ?? "").trim().toLowerCase();
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getHpLabel(current, max) {
    const ratio = max ? current / max : 0;
    if (ratio <= 0.30) return "baja";
    if (ratio <= 0.70) return "media";
    return "alta";
  }

  function getEnergyLabel(current, max) {
    const ratio = max ? current / max : 0;
    if (ratio <= 0.30) return "baja";
    if (ratio <= 0.70) return "media";
    return "alta";
  }

  function barClass(label) {
    return {
      alta: "hp-high",
      media: "hp-medium",
      baja: "hp-low"
    }[label] || "hp-low";
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function addBattleLog(message) {
    battleState.logs.push(message);
    if (battleState.logs.length > 80) battleState.logs = battleState.logs.slice(-80);
    inferenceState.battleLog = battleState.logs.join("\n\n");
  }

  function chooseAvailableAttack() {
    if (battleState.player.charging?.attack === "flama_intensa") return "flama_intensa";
    if (battleState.player.energy >= 75 && battleState.enemy.hp <= 35) return "flama_intensa";
    if (battleState.player.energy >= 12) return "chispa_fuego";
    return "rasguño";
  }

  function analyzeAttackOptions(caseData = inferenceState.currentCase) {
    const lines = [
      "Rasguño: daño bajo, tipo normal y sin ventaja contra Bulbi. Es la opción menos eficaz; solo conviene si Charm no tiene energía suficiente para un ataque de fuego.",
      "Chispa Fuego: daño medio, costo bajo de energía y ventaja de tipo fuego contra planta. Por eso el motor debería escogerlo sobre Rasguño cuando hay al menos 12 de energía.",
      "Flama Intensa: daño alto y ventaja de fuego, pero consume 2 turnos: primero se carga y después se libera. Conviene cuando Bulbi está con vida baja y Charm tiene energía alta; si Charm está en peligro, Chispa Fuego puede ser más segura porque pega en el mismo turno."
    ];

    if (normalize(caseData.ataque_disponible) === "rasguño") {
      lines.push("En este turno Charm tiene Rasguño como ataque disponible, así que el motor lo marca como alternativa de emergencia y explica por qué debería preferir un ataque de fuego en cuanto recupere energía.");
    }

    if (normalize(caseData.ataque_disponible) === "flama_intensa") {
      lines.push("En este turno Flama Intensa está disponible: el motor debe comparar su mayor daño contra el riesgo de perder un turno cargando mientras Bulbi puede responder.");
    }

    return lines.join("\n");
  }

  function buildCaseFromBattleState() {
    const attack = chooseAvailableAttack();
    return {
      criatura_jugador: battleState.player.name,
      tipo_jugador: battleState.player.type,
      criatura_enemigo: battleState.enemy.name,
      tipo_enemigo: battleState.enemy.type,
      nivel_jugador: battleState.player.level,
      nivel_enemigo: battleState.enemy.level,
      vida_jugador: getHpLabel(battleState.player.hp, battleState.player.maxHp),
      vida_enemigo: getHpLabel(battleState.enemy.hp, battleState.enemy.maxHp),
      energia: getEnergyLabel(battleState.player.energy, battleState.player.maxEnergy),
      ataque_disponible: attack,
      tipo_ataque: attack === "rasguño" ? "normal" : "fuego",
      tiene_pocion: battleState.player.potion ? "si" : "no"
    };
  }

  function showMessage(message, tone = "info") {
    const box = $("#global-message");
    if (!box) return;
    box.textContent = message;
    box.className = `global-message ${tone === "bad" ? "status-bad" : tone === "warn" ? "status-warn" : "status-good"}`;
  }

  function getRulesFromPayload(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.rules)) return payload.rules;
    if (Array.isArray(payload.reglas)) return payload.reglas;
    if (Array.isArray(payload.knowledgeBase)) return payload.knowledgeBase;
    return [];
  }

  function parseKnowledgeBaseJSON() {
    const text = $("#kb-json")?.value.trim() || "";
    inferenceState.rawJson = text;
    if (!text) throw new Error("Pega o carga un JSON de reglas.");
    const payload = JSON.parse(text);
    const rules = getRulesFromPayload(payload);
    if (!rules.length) throw new Error("El JSON debe incluir un arreglo de reglas en rules, reglas o knowledgeBase.");
    inferenceState.knowledgeBase = payload;
    inferenceState.rules = rules.map((rule, index) => ({
      id: String(rule.id || rule.nombre || `R${index + 1}`),
      tipo: normalize(rule.tipo || "normal"),
      prioridad: normalize(rule.prioridad || "baja"),
      condiciones: rule.condiciones && typeof rule.condiciones === "object" && !Array.isArray(rule.condiciones) ? rule.condiciones : {},
      resultado: rule.resultado && typeof rule.resultado === "object" && !Array.isArray(rule.resultado) ? rule.resultado : { accion_recomendada: rule.accion_recomendada || "" },
      explicacion: String(rule.explicacion || "Sin explicación."),
      confianza: normalize(rule.confianza || "baja")
    }));
    inferenceState.fallbackRule = getFallbackRule();
    return inferenceState.rules;
  }

  function validateKnowledgeBase() {
    const incomplete = [];
    const normal = inferenceState.rules.filter((rule) => rule.tipo === "normal");
    const exceptions = inferenceState.rules.filter((rule) => rule.tipo === "excepcion");
    const fallback = inferenceState.rules.filter((rule) => rule.tipo === "respaldo");

    inferenceState.rules.forEach((rule) => {
      const missing = [];
      if (!rule.id) missing.push("id");
      if (!["normal", "excepcion", "respaldo"].includes(rule.tipo)) missing.push("tipo");
      if (!["alta", "media", "baja"].includes(rule.prioridad)) missing.push("prioridad");
      if (!["alta", "media", "baja"].includes(rule.confianza)) missing.push("confianza");
      if (rule.tipo !== "respaldo" && !Object.keys(rule.condiciones).length) missing.push("condiciones");
      if (!rule.resultado.accion_recomendada) missing.push("resultado.accion_recomendada");
      if (missing.length) incomplete.push({ id: rule.id || "(sin id)", missing });
    });

    inferenceState.validation = {
      total: inferenceState.rules.length,
      normal: normal.length,
      exceptions: exceptions.length,
      fallback: fallback.length,
      incomplete
    };
    renderKnowledgeBaseSummary();
    buildCaseForm();
    renderRuleSelector();
    renderBattle();
    renderMission5Rules();
    saveProgress();
    return inferenceState.validation;
  }

  function renderMetric(label, value) {
    return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
  }

  function renderKnowledgeBaseSummary() {
    const summary = $("#kb-summary");
    const preview = $("#rules-preview");
    const feedback = $("#kb-feedback");
    const validation = inferenceState.validation || { total: 0, normal: 0, exceptions: 0, fallback: 0, incomplete: [] };
    if (summary) {
      summary.innerHTML = [
        renderMetric("Total de reglas", validation.total),
        renderMetric("Normales", validation.normal),
        renderMetric("Excepciones", validation.exceptions),
        renderMetric("Respaldo", validation.fallback),
        renderMetric("Incompletas", validation.incomplete.length)
      ].join("");
    }
    if (preview) preview.innerHTML = inferenceState.rules.map(renderRuleCard).join("") || "Sin reglas cargadas.";
    if (feedback) {
      const ok = validation.total && !validation.incomplete.length && validation.fallback === 1;
      feedback.textContent = ok
        ? "Base válida: el motor puede comparar, activar reglas, resolver prioridades y usar respaldo."
        : `Revisa la base: ${validation.incomplete.length} regla(s) incompleta(s), ${validation.fallback} regla(s) de respaldo.`;
      feedback.className = `feedback ${ok ? "status-good" : "status-warn"}`;
    }
  }

  function renderRuleCard(rule) {
    const conditions = Object.entries(rule.condiciones).map(([key, value]) => `<span class="pill">${escapeHtml(key)} = ${escapeHtml(value)}</span>`).join("") || '<span class="pill">sin condiciones</span>';
    return `
      <article class="rule-card">
        <header>
          <strong>${escapeHtml(rule.id)} · ${escapeHtml(rule.resultado.accion_recomendada || "sin accion")}</strong>
          <span>
            <span class="pill">${escapeHtml(rule.tipo)}</span>
            <span class="pill ${escapeHtml(rule.prioridad)}">prioridad ${escapeHtml(rule.prioridad)}</span>
            <span class="pill ${escapeHtml(rule.confianza)}">confianza ${escapeHtml(rule.confianza)}</span>
          </span>
        </header>
        <div>${conditions}</div>
        <p>${escapeHtml(rule.explicacion)}</p>
      </article>
    `;
  }

  function getAllConditionKeys() {
    const keys = new Set(defaultKeys);
    inferenceState.rules.forEach((rule) => Object.keys(rule.condiciones || {}).forEach((key) => keys.add(key)));
    return Array.from(keys);
  }

  function guessOptionsForKey(key) {
    if (key.includes("criatura")) return ["", "Charm", "Bulbi", "Pica", "Oni", "Squar"];
    if (key.includes("tipo")) return ["", "fuego", "planta", "agua", "electrico", "roca", "normal"];
    if (key.includes("vida") || key.includes("energia") || key.includes("nivel")) return ["", "baja", "media", "alta", "bajo", "medio", "alto"];
    if (key.includes("pocion")) return ["", "si", "no"];
    if (key.includes("ataque")) return ["", "chispa_fuego", "rasguño", "flama_intensa", "latigo_cepa", "placaje", "esporas", "chispa_volt"];
    return null;
  }

  function buildCaseForm() {
    const form = $("#case-form");
    if (!form) return;
    form.innerHTML = getAllConditionKeys().map((key) => {
      const options = guessOptionsForKey(key);
      const current = inferenceState.currentCase[key] || "";
      if (options) {
        return `
          <label class="field">${escapeHtml(key)}
            <select data-case-key="${escapeHtml(key)}">
              ${options.map((option) => `<option value="${escapeHtml(option)}"${normalize(option) === normalize(current) ? " selected" : ""}>${escapeHtml(option || "Selecciona")}</option>`).join("")}
            </select>
          </label>
        `;
      }
      return `
        <label class="field">${escapeHtml(key)}
          <input data-case-key="${escapeHtml(key)}" value="${escapeHtml(current)}" placeholder="valor">
        </label>
      `;
    }).join("");
    $$("[data-case-key]", form).forEach((input) => input.addEventListener("change", () => {
      readCaseForm();
      renderBattle();
    }));
    renderCasePreview();
  }

  function readCaseForm() {
    const data = {};
    $$("[data-case-key]").forEach((input) => {
      data[input.dataset.caseKey] = input.value.trim();
    });
    inferenceState.currentCase = data;
    renderCasePreview();
    renderBattle();
    saveProgress();
    return data;
  }

  function renderCasePreview() {
    const preview = $("#case-preview");
    if (preview) preview.textContent = JSON.stringify(inferenceState.currentCase, null, 2);
    renderBattleCasePanel();
  }

  function labelForAttack(attackId) {
    const attacks = Object.values(creatures).flatMap((creature) => creature.attacks || []);
    return attacks.find((attack) => attack.id === attackId)?.label || String(attackId || "ataque");
  }

  function healthValue(label, numericDefault) {
    const normalized = normalize(label);
    if (normalized === "alta") return numericDefault;
    if (normalized === "media") return 58;
    if (normalized === "baja") return 28;
    return numericDefault;
  }

  function energyValue(label, numericDefault) {
    const normalized = normalize(label);
    if (normalized === "alta") return 88;
    if (normalized === "media") return numericDefault;
    if (normalized === "baja") return 28;
    return numericDefault;
  }

  function setSprite(containerSelector, imgSelector, creature) {
    const container = $(containerSelector);
    const img = $(imgSelector);
    if (!container || !img || !creature) return;
    container.classList.remove("image-missing");
    container.dataset.fallback = creature.fallback || creature.name?.charAt(0) || "?";
    img.src = creature.asset;
    img.alt = `${creature.name} criatura tipo ${creature.type}`;
  }

  function renderBattle() {
    if (!Object.keys(inferenceState.currentCase || {}).length) {
      inferenceState.currentCase = buildCaseFromBattleState();
    }
    const playerName = battleState.player.name;
    const enemyName = battleState.enemy.name;
    const player = creatures[playerName] || creatures.Charm;
    const enemy = creatures[enemyName] || creatures.Bulbi;
    const playerType = battleState.player.type || player.type;
    const enemyType = battleState.enemy.type || enemy.type;
    const playerHp = clamp(battleState.player.hp, 0, battleState.player.maxHp);
    const enemyHp = clamp(battleState.enemy.hp, 0, battleState.enemy.maxHp);
    const energy = clamp(battleState.player.energy, 0, battleState.player.maxEnergy);
    const playerHpPct = battleState.player.maxHp ? (playerHp / battleState.player.maxHp) * 100 : 0;
    const enemyHpPct = battleState.enemy.maxHp ? (enemyHp / battleState.enemy.maxHp) * 100 : 0;
    const energyPct = battleState.player.maxEnergy ? (energy / battleState.player.maxEnergy) * 100 : 0;

    $("#player-name").textContent = playerName;
    $("#enemy-name").textContent = enemyName;
    updateTypeBadge($("#player-type"), playerType);
    updateTypeBadge($("#enemy-type"), enemyType);
    $("#player-hp-label").textContent = `${playerHp}/${battleState.player.maxHp}`;
    $("#enemy-hp-label").textContent = `${enemyHp}/${battleState.enemy.maxHp}`;
    $("#player-energy-label").textContent = `${energy}/${battleState.player.maxEnergy}`;
    updateBar($("#player-hp-bar"), playerHpPct, getHpLabel(playerHp, battleState.player.maxHp));
    updateBar($("#enemy-hp-bar"), enemyHpPct, getHpLabel(enemyHp, battleState.enemy.maxHp));
    updateBar($("#player-energy-bar"), energyPct, getEnergyLabel(energy, battleState.player.maxEnergy));
    $("#turn-number").textContent = battleState.turn;
    $("#turn-status").textContent = battleState.finished && battleState.winner
      ? `Batalla terminada · Gana ${battleState.winner}`
      : battleState.status;
    setSprite("#player-card .creature-image-card", "#player-img", player);
    setSprite("#enemy-card .creature-image-card", "#enemy-img", enemy);
    renderAttackPad(player);
    renderBattleCasePanel();
    renderNumericState();
    if ($("#battle-log")) $("#battle-log").textContent = battleState.logs.join("\n\n");
  }

  function updateBar(element, pct, label) {
    if (!element) return;
    element.style.width = `${clamp(pct, 0, 100)}%`;
    element.className = barClass(label);
  }

  function renderNumericState() {
    const panel = $("#numeric-state");
    if (!panel) return;
    panel.innerHTML = `
      <div><span>Charm HP</span><strong>${battleState.player.hp}/${battleState.player.maxHp}</strong></div>
      <div><span>Charm energía</span><strong>${battleState.player.energy}/${battleState.player.maxEnergy}</strong></div>
      <div><span>Bulbi HP</span><strong>${battleState.enemy.hp}/${battleState.enemy.maxHp}</strong></div>
      <div><span>Estado</span><strong>${escapeHtml(battleState.finished ? `Gana ${battleState.winner}` : battleState.status)}</strong></div>
    `;
  }

  function updateTypeBadge(element, type) {
    if (!element) return;
    element.className = `type-badge ${typeClass[normalize(type)] || "type-normal"}`;
    element.textContent = type || "normal";
  }

  function renderAttackPad(player) {
    const pad = $("#attack-pad");
    if (!pad) return;
    const attacks = player.attacks?.length ? player.attacks : creatures.Charm.attacks;
    pad.innerHTML = attacks.map((attack) => `
      <button class="attack-button ${normalize(inferenceState.currentCase.ataque_disponible) === normalize(attack.id) ? "active" : ""}" type="button" data-attack="${escapeHtml(attack.id)}" data-type="${escapeHtml(attack.type)}">
        <strong>${escapeHtml(attack.label)}</strong>
        <span>${escapeHtml(attack.type)} · poder ${escapeHtml(attack.power)}</span>
      </button>
    `).join("");
    $$(".attack-button", pad).forEach((button) => {
      button.addEventListener("click", () => {
        inferenceState.currentCase.ataque_disponible = button.dataset.attack;
        inferenceState.currentCase.tipo_ataque = button.dataset.type;
        buildCaseForm();
        renderBattle();
        saveProgress();
      });
    });
  }

  function renderBattleCasePanel() {
    const panel = $("#battle-case-panel");
    if (!panel) return;
    const keys = ["tipo_jugador", "tipo_enemigo", "vida_jugador", "vida_enemigo", "energia", "tipo_ataque", "tiene_pocion", "nivel_jugador", "nivel_enemigo"];
    panel.innerHTML = keys.map((key) => `<span class="pill">${escapeHtml(key)}: ${escapeHtml(inferenceState.currentCase[key] || "(vacío)")}</span>`).join("");
  }

  function ruleApplies(rule, caseData) {
    return explainRuleMatch(rule, caseData).applies;
  }

  function explainRuleMatch(rule, caseData) {
    const entries = Object.entries(rule.condiciones || {});
    const checks = entries.map(([key, expected]) => {
      const actual = caseData[key] ?? "";
      const ok = normalize(actual) === normalize(expected);
      return { key, expected, actual, ok };
    });
    const matched = checks.filter((check) => check.ok);
    const failed = checks.filter((check) => !check.ok);
    const applies = rule.tipo !== "respaldo" && checks.length > 0 && failed.length === 0;
    return {
      rule,
      applies,
      checks,
      matched,
      failed,
      reason: applies
        ? "Todas las condiciones coinciden."
        : failed[0]
          ? `No aplica porque ${failed[0].key} no coincide.`
          : "No aplica porque no tiene condiciones evaluables."
    };
  }

  function getActiveRules() {
    inferenceState.activeRules = inferenceState.rules
      .filter((rule) => rule.tipo !== "respaldo")
      .map((rule) => explainRuleMatch(rule, inferenceState.currentCase))
      .filter((match) => match.applies);
    return inferenceState.activeRules;
  }

  function getInactiveRules() {
    inferenceState.inactiveRules = inferenceState.rules
      .filter((rule) => rule.tipo !== "respaldo")
      .map((rule) => explainRuleMatch(rule, inferenceState.currentCase))
      .filter((match) => !match.applies);
    return inferenceState.inactiveRules;
  }

  function scoreRule(rule) {
    return (priorityScore[rule.prioridad] || 0) * 100 + (confidenceScore[rule.confianza] || 0) * 10 + Object.keys(rule.condiciones || {}).length;
  }

  function selectWinningRule(activeRules = inferenceState.activeRules) {
    const matches = activeRules.map((item) => item.rule ? item : { rule: item });
    if (!matches.length) {
      inferenceState.winningRule = getFallbackRule();
      return inferenceState.winningRule;
    }
    const sorted = [...matches].sort((a, b) => scoreRule(b.rule) - scoreRule(a.rule));
    inferenceState.winningRule = sorted[0].rule;
    return inferenceState.winningRule;
  }

  function detectInferenceConflict() {
    if (!inferenceState.activeRules.length || !inferenceState.winningRule) {
      inferenceState.conflict = null;
      return null;
    }
    const topScore = scoreRule(inferenceState.winningRule);
    const tied = inferenceState.activeRules
      .map((match) => match.rule)
      .filter((rule) => scoreRule(rule) === topScore);
    const actions = new Set(tied.map((rule) => rule.resultado.accion_recomendada));
    inferenceState.conflict = actions.size > 1 ? { score: topScore, rules: tied, actions: Array.from(actions) } : null;
    return inferenceState.conflict;
  }

  function getFallbackRule() {
    return inferenceState.fallbackRule || inferenceState.rules.find((rule) => rule.tipo === "respaldo") || null;
  }

  function generateAgentResponse() {
    const rule = inferenceState.winningRule || selectWinningRule();
    const conflict = detectInferenceConflict();
    if (!rule) return "No hay regla ganadora ni regla de respaldo. Revisa la base de conocimiento.";
    const action = rule.resultado.accion_recomendada || "sin_accion";
    const prefix = rule.tipo === "respaldo"
      ? "No se activó ninguna regla específica."
      : `La regla ganadora es ${rule.id}.`;
    const conflictText = conflict
      ? ` Hay conflicto entre ${conflict.rules.map((item) => item.id).join(", ")} porque empatan en prioridad/confianza y proponen acciones distintas: ${conflict.actions.join(", ")}.`
      : "";
    return `${prefix} Acción recomendada: ${action}. ${rule.explicacion} Prioridad: ${rule.prioridad}. Confianza: ${rule.confianza}.${conflictText}`;
  }

  function reasonForInactive(match) {
    const failed = match.checks.find((check) => !check.ok);
    if (!failed) return `${match.rule.id} no aplicó: no tiene condiciones evaluables.`;
    return `${match.rule.id} no aplicó: ${failed.key} no es ${failed.expected}; en el caso vale ${failed.actual || "(vacío)"}.`;
  }

  function actionToBattleText(action) {
    const player = inferenceState.currentCase.criatura_jugador || "Charm";
    const enemy = inferenceState.currentCase.criatura_enemigo || "Bulbi";
    const attackName = labelForAttack(inferenceState.currentCase.ataque_disponible);
    const map = {
      usar_pocion: `${player} usa una poción para sobrevivir el turno.`,
      usar_ataque_fuego: `${player} usa ${attackName} contra ${enemy}.`,
      usar_ataque_agua: `${player} usa un ataque de agua contra ${enemy}.`,
      usar_ataque_planta: `${player} usa un ataque de planta contra ${enemy}.`,
      usar_ataque_electrico: `${player} usa un ataque eléctrico contra ${enemy}.`,
      usar_rasguño: `${player} usa Rasguño como ataque de emergencia contra ${enemy}.`,
      ataque_especial: `${player} prepara Flama Intensa contra ${enemy}.`,
      defender: `${player} adopta una postura defensiva para reducir daño.`,
      cambiar_estrategia: `${player} cambia de estrategia antes de arriesgarse.`,
      analizar_mas_datos: `${player} detiene la acción y pide más datos del turno.`
    };
    return map[action] || `${player} ejecuta ${action}.`;
  }

  function simulatedResult(action) {
    if (action === "usar_ataque_fuego" && normalize(inferenceState.currentCase.tipo_enemigo) === "planta") return "Bulbi recibe daño efectivo.";
    if (action === "usar_pocion") return "Charm recupera margen para continuar el combate.";
    if (action === "analizar_mas_datos") return "El turno queda en espera hasta completar datos.";
    if (action === "defender") return "Charm reduce el riesgo del siguiente golpe.";
    if (action === "usar_rasguño") return "Bulbi recibe poco daño porque Rasguño no tiene ventaja elemental.";
    if (action === "ataque_especial") return "El enemigo queda bajo presión por un ataque de alto impacto que requiere 2 turnos.";
    return "El resultado depende del siguiente estado de batalla.";
  }

  function describeInferenceEvaluation() {
    const active = inferenceState.activeRules.map((match) => (
      `${match.rule.id} se activa porque ${match.checks.map((check) => `${check.key} = ${check.expected}`).join(" y ")}.`
    ));
    const inactive = inferenceState.inactiveRules.slice(0, 5).map((match) => reasonForInactive(match));
    return [...active, ...inactive].join("\n") || "Ninguna regla específica aplica.";
  }

  function applyPlayerAction(rule) {
    let action = rule?.resultado?.accion_recomendada || "analizar_mas_datos";
    const result = [];
    battleState.defending = false;

    if (action === "ataque_especial" && battleState.player.energy < 25) {
      result.push("El motor detectó que no hay suficiente energía para ataque especial.");
      action = battleState.player.energy >= 12 ? "usar_ataque_fuego" : "cambiar_estrategia";
    }

    if (action === "usar_ataque_fuego" && battleState.player.energy < 12) {
      result.push("El motor detectó que no hay suficiente energía para ataque de fuego.");
      action = "cambiar_estrategia";
    }

    if (action === "usar_pocion") {
      const before = battleState.player.hp;
      battleState.player.hp = clamp(battleState.player.hp + 30, 0, battleState.player.maxHp);
      battleState.player.potion = false;
      result.push(`Charm usa poción y recupera ${battleState.player.hp - before} puntos de vida. Vida actual: ${battleState.player.hp}/${battleState.player.maxHp}.`);
    } else if (action === "usar_ataque_fuego") {
      battleState.enemy.hp = clamp(battleState.enemy.hp - 28, 0, battleState.enemy.maxHp);
      battleState.player.energy = clamp(battleState.player.energy - 12, 0, battleState.player.maxEnergy);
      result.push(`Charm usa Chispa Fuego. Es muy efectivo contra Bulbi por ser tipo planta.`);
      result.push(`Bulbi pierde 28 HP. Vida restante de Bulbi: ${battleState.enemy.hp}/${battleState.enemy.maxHp}.`);
      result.push(`Charm gasta 12 energía. Energía restante: ${battleState.player.energy}/${battleState.player.maxEnergy}.`);
    } else if (action === "usar_rasguño") {
      battleState.enemy.hp = clamp(battleState.enemy.hp - 10, 0, battleState.enemy.maxHp);
      result.push("Charm usa Rasguño. Hace daño bajo porque es un ataque normal y no aprovecha la debilidad de Bulbi ante el fuego.");
      result.push(`Bulbi pierde 10 HP. Vida restante de Bulbi: ${battleState.enemy.hp}/${battleState.enemy.maxHp}.`);
      result.push("El análisis recomienda cambiar a Chispa Fuego cuando haya energía, porque pega más fuerte y sí usa ventaja elemental.");
    } else if (action === "ataque_especial") {
      battleState.player.energy = clamp(battleState.player.energy - 25, 0, battleState.player.maxEnergy);
      battleState.player.charging = { attack: "flama_intensa", turnsRemaining: 1 };
      result.push("Charm empieza a cargar Flama Intensa. Este ataque consume 2 turnos: este turno prepara la energía y el siguiente libera el daño.");
      result.push(`Charm gasta 25 energía al preparar el ataque. Energía restante: ${battleState.player.energy}/${battleState.player.maxEnergy}.`);
      result.push("No hay daño inmediato; el beneficio es que el golpe final será más fuerte que Chispa Fuego.");
    } else if (action === "defender") {
      battleState.defending = true;
      result.push("Charm se defiende para reducir el daño del siguiente ataque.");
    } else if (action === "cambiar_estrategia") {
      battleState.player.energy = clamp(battleState.player.energy + 10, 0, battleState.player.maxEnergy);
      result.push(`Charm decide cambiar de estrategia y recuperar energía. Energía actual: ${battleState.player.energy}/${battleState.player.maxEnergy}.`);
    } else {
      result.push("El agente no tiene suficiente información y evita tomar una decisión riesgosa.");
    }

    battleState.lastAction = action;
    return { action, result };
  }

  function releaseChargedAttack() {
    const charge = battleState.player.charging;
    if (!charge || charge.attack !== "flama_intensa") return false;
    battleState.player.charging = null;
    battleState.lastAction = "flama_intensa_liberada";
    battleState.status = "Charm liberó Flama Intensa";
    battleState.enemy.hp = clamp(battleState.enemy.hp - 50, 0, battleState.enemy.maxHp);
    addBattleLog(`Turno ${battleState.turn}
Charm completa la carga de Flama Intensa.

Análisis de ataque:
Flama Intensa consumió 2 turnos: el turno anterior cargó energía y este turno libera el golpe.
Hace más daño que Chispa Fuego, pero el costo táctico fue permitir que Bulbi respondiera durante la carga.
Por eso el motor solo debería escogerla cuando Charm tiene energía alta y Bulbi ya está cerca de caer.

Resultado:
Bulbi pierde 50 HP. Vida restante de Bulbi: ${battleState.enemy.hp}/${battleState.enemy.maxHp}.`);
    return true;
  }

  function executePlayerTurn() {
    if (releaseChargedAttack()) return;
    battleState.status = "Ejecutando inferencia";
    inferenceState.currentCase = buildCaseFromBattleState();
    renderCasePreview();
    runInferenceCore();
    const winner = inferenceState.winningRule;
    const applied = applyPlayerAction(winner);
    battleState.status = `Charm decidió ${applied.action}`;
    const caseData = inferenceState.currentCase;
    addBattleLog(`Turno ${battleState.turn}
Charm analiza a Bulbi.

Estado detectado:
- vida_jugador: ${caseData.vida_jugador}
- vida_enemigo: ${caseData.vida_enemigo}
- energía: ${caseData.energia}
- tipo_ataque: ${caseData.tipo_ataque}
- tipo_enemigo: ${caseData.tipo_enemigo}

Motor de inferencia:
${describeInferenceEvaluation()}

Análisis de alternativas:
${analyzeAttackOptions(caseData)}

Regla ganadora:
${winner ? `${winner.id} · ${winner.resultado.accion_recomendada}` : "Sin regla ganadora"}
- prioridad: ${winner?.prioridad || "sin dato"}
- confianza: ${winner?.confianza || "sin dato"}

Decisión:
${actionToBattleText(applied.action)}

Explicación:
${winner?.explicacion || "No hay explicación disponible."}

Resultado:
${applied.result.join("\n")}`);
  }

  function executeEnemyTurn() {
    if (battleState.finished || battleState.enemy.hp <= 0) return;
    battleState.status = "Bulbi responde";
    const enemyEnergyLabel = getEnergyLabel(battleState.enemy.energy, battleState.enemy.maxEnergy);
    const enemyHpLabel = getHpLabel(battleState.enemy.hp, battleState.enemy.maxHp);
    let damage = 15;
    let log = "Bulbi responde con Latigazo Cepa.";

    if (enemyHpLabel === "baja" && battleState.enemy.energy >= 15) {
      battleState.enemy.energy = clamp(battleState.enemy.energy - 12, 0, battleState.enemy.maxEnergy);
      addBattleLog(`Bulbi usa Esporas para defenderse y ganar tiempo. Energía restante de Bulbi: ${battleState.enemy.energy}/${battleState.enemy.maxEnergy}.`);
      return;
    }

    if (enemyEnergyLabel === "baja") {
      damage = 10;
      log = "Bulbi responde con Placaje para ahorrar energía.";
    } else {
      battleState.enemy.energy = clamp(battleState.enemy.energy - 10, 0, battleState.enemy.maxEnergy);
    }

    if (battleState.defending) {
      damage = 8;
      log += "\nCharm estaba defendiendo, el daño se reduce.";
    }

    battleState.player.hp = clamp(battleState.player.hp - damage, 0, battleState.player.maxHp);
    battleState.defending = false;
    addBattleLog(`${log}
Charm pierde ${damage} puntos de vida. Vida restante de Charm: ${battleState.player.hp}/${battleState.player.maxHp}.`);
  }

  function checkBattleEnd() {
    if (battleState.enemy.hp <= 0) {
      battleState.enemy.hp = 0;
      battleState.finished = true;
      battleState.running = false;
      battleState.winner = "Charm";
      battleState.status = "Batalla terminada";
      addBattleLog("Batalla terminada. Charm gana porque el motor eligió acciones efectivas.");
      return true;
    }
    if (battleState.player.hp <= 0) {
      battleState.player.hp = 0;
      battleState.finished = true;
      battleState.running = false;
      battleState.winner = "Bulbi";
      battleState.status = "Batalla terminada";
      addBattleLog("Batalla terminada. Bulbi gana. Revisa si las reglas de supervivencia se activaron a tiempo.");
      return true;
    }
    return false;
  }

  function executeBattleRound() {
    if (battleState.finished || battleState.running) return;
    executePlayerTurn();
    if (!checkBattleEnd()) {
      executeEnemyTurn();
      checkBattleEnd();
    }
    if (!battleState.finished) {
      battleState.turn += 1;
      battleState.status = "Esperando inferencia";
    }
    renderInference();
    renderBattle();
    saveProgress();
  }

  async function simulateFullBattle() {
    if (battleState.running || battleState.finished) return;
    battleState.running = true;
    battleState.status = "Simulación automática";
    renderBattle();
    while (!battleState.finished && battleState.turn <= 20) {
      battleState.running = false;
      executeBattleRound();
      if (battleState.finished) break;
      battleState.running = true;
      await delay(900);
    }
    battleState.running = false;
    if (!battleState.finished) {
      battleState.finished = true;
      battleState.winner = "Empate técnico";
      battleState.status = "Batalla terminada";
      addBattleLog("La batalla llegó al límite de turnos. Se declara empate técnico.");
    }
    renderBattle();
    saveProgress();
  }

  function resetBattle() {
    battleState = structuredClone(initialBattleState);
    inferenceState.turn = 1;
    inferenceState.currentCase = buildCaseFromBattleState();
    inferenceState.activeRules = [];
    inferenceState.inactiveRules = [];
    inferenceState.winningRule = null;
    inferenceState.conflict = null;
    inferenceState.battleLog = battleState.logs.join("\n\n");
    buildCaseForm();
    renderCasePreview();
    if ($("#active-rules")) $("#active-rules").textContent = "Sin ejecución.";
    if ($("#inactive-rules")) $("#inactive-rules").textContent = "Sin ejecución.";
    if ($("#battle-inactive-reasons")) $("#battle-inactive-reasons").textContent = "Pendiente de evaluación.";
    if ($("#conflict-output")) $("#conflict-output").textContent = "Ejecuta el motor para resolver prioridades.";
    if ($("#agent-response")) $("#agent-response").textContent = "Ejecuta el motor para ver la recomendación.";
    if ($("#decision-card")) $("#decision-card").textContent = "Ejecuta el siguiente turno para ver la regla ganadora.";
    renderBattle();
    renderMission5Rules();
    saveProgress();
  }

  function generateBattleLog() {
    const player = inferenceState.currentCase.criatura_jugador || "Charm";
    const enemy = inferenceState.currentCase.criatura_enemigo || "Bulbi";
    const winner = inferenceState.winningRule;
    const action = winner?.resultado?.accion_recomendada || "sin_accion";
    const importantInactive = inferenceState.inactiveRules.slice(0, 5).map((match) => `Se evaluó ${match.rule.id}: no aplica porque ${reasonForInactive(match).replace(`${match.rule.id} no aplicó: `, "")}`).join("\n");
    const active = inferenceState.activeRules.map((match) => `Se evaluó ${match.rule.id}: aplica porque ${match.checks.map((check) => `${check.key} = ${check.expected}`).join(" y ")}.`).join("\n");
    const conflictText = inferenceState.conflict
      ? `\nConflicto:\n${inferenceState.conflict.rules.map((rule) => rule.id).join(", ")} empatan y proponen ${inferenceState.conflict.actions.join(", ")}.`
      : "";

    return `Turno ${inferenceState.turn}
${player} analiza a ${enemy}...

Estado detectado:
- Tipo de ataque: ${inferenceState.currentCase.tipo_ataque || "(sin dato)"}
- Tipo enemigo: ${inferenceState.currentCase.tipo_enemigo || "(sin dato)"}
- Vida de ${player}: ${inferenceState.currentCase.vida_jugador || "(sin dato)"}
- Energía: ${inferenceState.currentCase.energia || "(sin dato)"}

Motor de inferencia:
${active || "Ninguna regla específica aplica."}
${importantInactive}

Regla ganadora:
${winner ? `${winner.id} · ${action}` : "Sin regla ganadora"}
${conflictText}

Decisión:
${actionToBattleText(action)}

Explicación:
${winner?.explicacion || "No hay explicación disponible."}

Resultado simulado:
${simulatedResult(action)}`;
  }

  function renderMatch(match) {
    return `
      <article class="rule-card">
        <header><strong>${escapeHtml(match.rule.id)}</strong><span class="pill ${match.applies ? "alta" : "baja"}">${match.applies ? "aplica" : "no aplica"}</span></header>
        ${match.checks.map((check) => `
          <div class="condition-row ${check.ok ? "ok" : "fail"}">
            <strong>${escapeHtml(check.key)} = ${escapeHtml(check.expected)}</strong>
            <span>${check.ok ? "Cumplida" : `Caso: ${escapeHtml(check.actual || "(vacío)")}`}</span>
          </div>
        `).join("") || '<div class="condition-row fail"><strong>Sin condiciones evaluables</strong><span>No aplica</span></div>'}
      </article>
    `;
  }

  function renderRuleSelector() {
    const selector = $("#rule-selector");
    if (!selector) return;
    selector.innerHTML = inferenceState.rules
      .filter((rule) => rule.tipo !== "respaldo")
      .map((rule) => `<option value="${escapeHtml(rule.id)}">${escapeHtml(rule.id)} · ${escapeHtml(rule.resultado.accion_recomendada)}</option>`)
      .join("");
    if (inferenceState.selectedRuleId) selector.value = inferenceState.selectedRuleId;
  }

  function compareSelectedRule() {
    readCaseForm();
    const id = $("#rule-selector")?.value;
    inferenceState.selectedRuleId = id;
    const rule = inferenceState.rules.find((item) => item.id === id);
    const output = $("#rule-match-output");
    if (!rule || !output) return;
    output.innerHTML = renderMatch(explainRuleMatch(rule, inferenceState.currentCase));
    saveProgress();
  }

  function rebuildRulesFromKnowledgeBaseIfNeeded() {
    if (inferenceState.rules.length) return;
    const sourceRules = getRulesFromPayload(inferenceState.knowledgeBase || {});
    if (!sourceRules.length) return;
    inferenceState.rules = sourceRules.map((rule, index) => ({
      id: String(rule.id || rule.nombre || `R${index + 1}`),
      tipo: normalize(rule.tipo || "normal"),
      prioridad: normalize(rule.prioridad || "baja"),
      condiciones: rule.condiciones && typeof rule.condiciones === "object" && !Array.isArray(rule.condiciones) ? rule.condiciones : {},
      resultado: rule.resultado && typeof rule.resultado === "object" && !Array.isArray(rule.resultado) ? rule.resultado : { accion_recomendada: rule.accion_recomendada || "" },
      explicacion: String(rule.explicacion || "Sin explicación."),
      confianza: normalize(rule.confianza || "baja")
    }));
    inferenceState.fallbackRule = inferenceState.rules.find((rule) => rule.tipo === "respaldo") || null;
  }

  function ruleActionLabel(rule) {
    return rule?.resultado?.accion_recomendada || "sin_accion";
  }

  function renderRuleEvaluationCard(match, active) {
    const conditions = match.checks.length
      ? match.checks.map((check) => `
        <li class="rule-condition ${check.ok ? "is-match" : "is-fail"}">
          <span>${escapeHtml(check.key)}</span>
          <strong>${escapeHtml(check.expected)} ${check.ok ? "OK" : "!="} ${escapeHtml(check.actual || "(vacío)")}</strong>
        </li>
      `).join("")
      : '<li class="rule-condition is-fail"><span>condiciones</span><strong>Sin condiciones evaluables</strong></li>';
    const failed = match.failed[0];
    const detail = active
      ? "Se activa porque todas sus condiciones coinciden con el caso actual."
      : failed
        ? `No aplica porque ${failed.key} esperaba ${failed.expected} y el caso tiene ${failed.actual || "(vacío)"}.`
        : match.reason;

    return `
      <article class="rule-eval-card ${active ? "is-active" : "is-inactive"}">
        <header>
          <div>
            <strong>${escapeHtml(match.rule.id)} · ${escapeHtml(ruleActionLabel(match.rule))}</strong>
            <span>${escapeHtml(match.rule.tipo)} · prioridad ${escapeHtml(match.rule.prioridad)} · confianza ${escapeHtml(match.rule.confianza)}</span>
          </div>
          <b>${active ? "Activada" : "No activada"}</b>
        </header>
        <p>${escapeHtml(detail)}</p>
        <ul class="rule-condition-list">${conditions}</ul>
      </article>
    `;
  }

  function renderMission5Rules() {
    const panel = $("#mission5RulesPanel");
    if (!panel) return;

    rebuildRulesFromKnowledgeBaseIfNeeded();

    const hasBase = inferenceState.rules.length || getRulesFromPayload(inferenceState.knowledgeBase || {}).length;
    if (!hasBase) {
      panel.innerHTML = '<div class="feedback status-warn">Primero carga la batalla guiada o pega tu base de conocimiento.</div>';
      return;
    }

    if (!Object.keys(inferenceState.currentCase || {}).length) {
      panel.innerHTML = '<div class="feedback status-warn">Primero crea o carga un estado de combate.</div>';
      return;
    }

    const evaluated = inferenceState.activeRules.length + inferenceState.inactiveRules.length;
    if (!evaluated) {
      panel.innerHTML = `
        <div class="feedback status-warn">Hay base y caso, pero aún no se ha ejecutado inferencia.</div>
        <button class="btn primary" type="button" data-evaluate-mission5>Evaluar reglas ahora</button>
      `;
      $("[data-evaluate-mission5]", panel)?.addEventListener("click", evaluateRulesForCurrentCase);
      return;
    }

    const winner = inferenceState.winningRule;
    panel.innerHTML = `
      <div class="rules-summary-grid">
        ${renderMetric("Reglas evaluadas", evaluated)}
        ${renderMetric("Activadas", inferenceState.activeRules.length)}
        ${renderMetric("No activadas", inferenceState.inactiveRules.length)}
        ${renderMetric("Ganadora", winner ? winner.id : "sin regla")}
      </div>
      <div class="rule-evaluation-layout">
        <section class="active-rules-column">
          <h3>Reglas activadas</h3>
          ${inferenceState.activeRules.map((match) => renderRuleEvaluationCard(match, true)).join("") || '<div class="feedback status-warn">Ninguna regla específica se activó.</div>'}
        </section>
        <section class="inactive-rules-column">
          <h3>Reglas no activadas</h3>
          ${inferenceState.inactiveRules.map((match) => renderRuleEvaluationCard(match, false)).join("") || '<div class="feedback status-good">Todas las reglas específicas aplicaron.</div>'}
        </section>
      </div>
      <section class="winning-rule-panel">
        <span>Regla ganadora</span>
        <h3>${winner ? `${escapeHtml(winner.id)} · ${escapeHtml(ruleActionLabel(winner))}` : "Sin regla ganadora"}</h3>
        <p>${escapeHtml(winner?.explicacion || "Ejecuta la inferencia para obtener una explicación.")}</p>
      </section>
    `;
  }

  function evaluateRulesForCurrentCase(options = {}) {
    rebuildRulesFromKnowledgeBaseIfNeeded();
    const caseData = Object.keys(inferenceState.currentCase || {}).length
      ? inferenceState.currentCase
      : buildCaseFromBattleState();
    const rules = (inferenceState.rules || []).filter((rule) => rule.tipo !== "respaldo");

    inferenceState.currentCase = caseData;
    inferenceState.activeRules = [];
    inferenceState.inactiveRules = [];

    rules.forEach((rule) => {
      const explanation = explainRuleMatch(rule, caseData);
      if (explanation.applies) {
        inferenceState.activeRules.push(explanation);
      } else {
        inferenceState.inactiveRules.push(explanation);
      }
    });

    selectWinningRule(inferenceState.activeRules.map((item) => item.rule));
    detectInferenceConflict();
    if (options.render !== false) {
      renderMission5Rules();
      renderInference();
      buildCaseForm();
      renderCasePreview();
      renderBattle();
      saveProgress();
    }
  }

  function renderDecisionCard() {
    const card = $("#decision-card");
    if (!card) return;
    const winner = inferenceState.winningRule;
    if (!winner) {
      card.textContent = "Ejecuta la inferencia para ver la regla ganadora.";
      return;
    }
    const match = explainRuleMatch(winner, inferenceState.currentCase);
    card.innerHTML = `
      <strong>${escapeHtml(winner.id)} · ${escapeHtml(winner.resultado.accion_recomendada)}</strong>
      <p>${escapeHtml(winner.explicacion)}</p>
      <span class="pill ${escapeHtml(winner.prioridad)}">prioridad ${escapeHtml(winner.prioridad)}</span>
      <span class="pill ${escapeHtml(winner.confianza)}">confianza ${escapeHtml(winner.confianza)}</span>
      <div>${match.checks.map((check) => `<span class="pill">${escapeHtml(check.key)} = ${escapeHtml(check.expected)}</span>`).join("") || '<span class="pill">regla de respaldo</span>'}</div>
    `;
  }

  function renderInference() {
    const active = $("#active-rules");
    const inactive = $("#inactive-rules");
    const battleInactive = $("#battle-inactive-reasons");
    const conflict = $("#conflict-output");
    const response = $("#agent-response");
    const battleLog = $("#battle-log");

    if (active) active.innerHTML = inferenceState.activeRules.map(renderMatch).join("") || "Ninguna regla específica se activó.";
    if (inactive) inactive.innerHTML = inferenceState.inactiveRules.map(renderMatch).join("") || "Todas las reglas específicas aplicaron.";
    if (battleInactive) battleInactive.innerHTML = inferenceState.inactiveRules.map((match) => `<p>${escapeHtml(reasonForInactive(match))}</p>`).join("") || "Todas las reglas específicas aplicaron.";
    if (conflict) {
      const winner = inferenceState.winningRule;
      conflict.innerHTML = `
        ${winner ? renderRuleCard(winner) : "Sin regla ganadora."}
        ${inferenceState.conflict ? `<div class="feedback status-warn">Conflicto detectado: ${escapeHtml(inferenceState.conflict.rules.map((rule) => rule.id).join(", "))} empatan y recomiendan ${escapeHtml(inferenceState.conflict.actions.join(", "))}.</div>` : '<div class="feedback status-good">No hay empate irresoluble. El desempate por prioridad/confianza es suficiente.</div>'}
      `;
    }
    if (response) response.textContent = generateAgentResponse();
    inferenceState.battleLog = battleState.logs.length > 1 ? battleState.logs.join("\n\n") : generateBattleLog();
    if (battleLog) battleLog.textContent = inferenceState.battleLog;
    if (battleState.logs.length <= 1) $("#turn-status").textContent = inferenceState.winningRule?.resultado?.accion_recomendada || "Sin decisión";
    renderDecisionCard();
    renderMission5Rules();
  }

  function runInferenceCore() {
    evaluateRulesForCurrentCase({ render: false });
  }

  function runInference() {
    readCaseForm();
    runInferenceCore();
    renderInference();
    saveProgress();
  }

  function normalizeRules(rawRules) {
    return rawRules.map((rule, index) => ({
      id: String(rule.id || rule.nombre || `R${index + 1}`),
      tipo: normalize(rule.tipo || "normal"),
      prioridad: normalize(rule.prioridad || "baja"),
      condiciones: rule.condiciones && typeof rule.condiciones === "object" && !Array.isArray(rule.condiciones) ? rule.condiciones : {},
      resultado: rule.resultado && typeof rule.resultado === "object" && !Array.isArray(rule.resultado) ? rule.resultado : { accion_recomendada: rule.accion_recomendada || "" },
      explicacion: String(rule.explicacion || "Sin explicación."),
      confianza: normalize(rule.confianza || "baja")
    }));
  }

  function getStudentName() {
    const kb = inferenceState.student.knowledgeBase || {};
    return kb.agent?.nombre || kb.agente?.nombre || kb.nombre || "Mi agente";
  }

  function getStudentConditionKeys() {
    const keys = new Set();
    const rules = inferenceState.student.rules || [];
    rules.forEach((rule) => {
      Object.keys(rule.condiciones || {}).forEach((key) => keys.add(key));
    });
    return Array.from(keys);
  }

  function detectStudentVariables() {
    inferenceState.student.variables = getStudentConditionKeys();
    return inferenceState.student.variables;
  }

  function validateStudentKnowledgeBase() {
    const text = $("#student-json")?.value.trim() || "";
    const feedback = $("#student-feedback");
    if (!text) {
      if (feedback) {
        feedback.textContent = "Pega o carga el JSON de tu agente.";
        feedback.className = "feedback status-warn";
      }
      return;
    }
    try {
      const payload = JSON.parse(text);
      const rules = getRulesFromPayload(payload);
      if (!rules.length) throw new Error("El JSON debe incluir un arreglo de reglas en rules, reglas o knowledgeBase.");
      inferenceState.student.rawJson = text;
      inferenceState.student.knowledgeBase = payload;
      inferenceState.student.rules = normalizeRules(rules);
      inferenceState.student.fallbackRule = inferenceState.student.rules.find((rule) => rule.tipo === "respaldo") || null;
      const normal = inferenceState.student.rules.filter((rule) => rule.tipo === "normal");
      const exceptions = inferenceState.student.rules.filter((rule) => rule.tipo === "excepcion");
      const fallback = inferenceState.student.rules.filter((rule) => rule.tipo === "respaldo");
      const incomplete = inferenceState.student.rules.filter((rule) => (
        !rule.id || !rule.resultado.accion_recomendada || (rule.tipo !== "respaldo" && !Object.keys(rule.condiciones).length)
      ));
      inferenceState.student.validation = {
        total: inferenceState.student.rules.length,
        normal: normal.length,
        exceptions: exceptions.length,
        fallback: fallback.length,
        incomplete: incomplete.length
      };
      detectStudentVariables();
      renderStudentSummary();
      buildStudentCaseForm();
      if (feedback) {
        feedback.textContent = `Base de ${getStudentName()} validada. Variables detectadas: ${inferenceState.student.variables.join(", ") || "ninguna"}.`;
        feedback.className = "feedback status-good";
      }
      saveProgress();
    } catch (error) {
      if (feedback) {
        feedback.textContent = error.message;
        feedback.className = "feedback status-bad";
      }
    }
  }

  function renderStudentSummary() {
    const summary = $("#student-summary");
    const validation = inferenceState.student.validation;
    if (!summary || !validation) return;
    summary.innerHTML = [
      renderMetric("Total", validation.total),
      renderMetric("Normales", validation.normal),
      renderMetric("Excepciones", validation.exceptions),
      renderMetric("Respaldo", validation.fallback),
      renderMetric("Incompletas", validation.incomplete)
    ].join("");
  }

  function buildStudentCaseForm() {
    const form = $("#student-case-form");
    if (!form) return;
    const variables = inferenceState.student.variables;
    if (!variables.length) {
      form.innerHTML = '<div class="feedback status-warn">Valida tu JSON para detectar variables.</div>';
      renderStudentCasePreview();
      return;
    }
    form.innerHTML = variables.map((key) => `
      <label class="field">${escapeHtml(key)}
        <input data-student-case-key="${escapeHtml(key)}" value="${escapeHtml(inferenceState.student.currentCase[key] || "")}" placeholder="valor para ${escapeHtml(key)}">
      </label>
    `).join("");
    $$("[data-student-case-key]", form).forEach((input) => {
      input.addEventListener("input", readStudentCaseForm);
    });
    renderStudentCasePreview();
  }

  function readStudentCaseForm() {
    const data = {};
    $$("[data-student-case-key]").forEach((input) => {
      data[input.dataset.studentCaseKey] = input.value.trim();
    });
    inferenceState.student.currentCase = data;
    renderStudentCasePreview();
  }

  function renderStudentCasePreview() {
    const preview = $("#student-case-preview");
    if (preview) preview.textContent = JSON.stringify(inferenceState.student.currentCase || {}, null, 2);
  }

  function loadStudentExampleCase() {
    const firstRule = inferenceState.student.rules.find((rule) => rule.tipo !== "respaldo" && Object.keys(rule.condiciones).length);
    if (!firstRule) {
      showMessage("Valida una base con reglas para inferir un caso de ejemplo.", "warn");
      return;
    }
    inferenceState.student.currentCase = { ...firstRule.condiciones };
    buildStudentCaseForm();
    renderStudentCasePreview();
  }

  function clearStudentCase() {
    inferenceState.student.currentCase = {};
    buildStudentCaseForm();
    renderStudentCasePreview();
  }

  function evaluateStudentRules() {
    readStudentCaseForm();
    const student = inferenceState.student;
    if (!student.rules.length) {
      $("#student-inference-output").innerHTML = '<div class="feedback status-warn">Primero carga y valida tu JSON.</div>';
      return;
    }
    if (!Object.keys(student.currentCase).length) {
      $("#student-inference-output").innerHTML = '<div class="feedback status-warn">Primero crea un caso de prueba.</div>';
      return;
    }
    student.activeRules = [];
    student.inactiveRules = [];
    student.rules.filter((rule) => rule.tipo !== "respaldo").forEach((rule) => {
      const match = explainRuleMatch(rule, student.currentCase);
      if (match.applies) student.activeRules.push(match);
      else student.inactiveRules.push(match);
    });
    const winnerMatch = student.activeRules.length
      ? [...student.activeRules].sort((a, b) => scoreRule(b.rule) - scoreRule(a.rule))[0]
      : null;
    student.winningRule = winnerMatch?.rule || student.fallbackRule || null;
    const topScore = student.winningRule ? scoreRule(student.winningRule) : 0;
    const tied = student.activeRules.map((match) => match.rule).filter((rule) => scoreRule(rule) === topScore);
    const actions = new Set(tied.map((rule) => rule.resultado.accion_recomendada));
    student.conflict = actions.size > 1 ? { rules: tied, actions: Array.from(actions) } : null;
    student.savedCases.unshift({
      date: new Date().toLocaleString("es-MX"),
      caseData: { ...student.currentCase },
      activeRules: student.activeRules.map((match) => match.rule.id),
      winningRule: student.winningRule?.id || "",
      action: student.winningRule?.resultado?.accion_recomendada || "",
      fallback: !student.activeRules.length
    });
    renderStudentInference();
    saveProgress();
  }

  function renderStudentInference() {
    const output = $("#student-inference-output");
    const student = inferenceState.student;
    if (!output) return;
    const winner = student.winningRule;
    output.innerHTML = `
      <div class="rules-summary-grid">
        ${renderMetric("Reglas evaluadas", student.activeRules.length + student.inactiveRules.length)}
        ${renderMetric("Activadas", student.activeRules.length)}
        ${renderMetric("No activadas", student.inactiveRules.length)}
        ${renderMetric("Ganadora", winner?.id || "sin regla")}
      </div>
      <div class="rule-evaluation-layout">
        <section class="active-rules-column">
          <h3>Reglas activadas</h3>
          ${student.activeRules.map((match) => renderRuleEvaluationCard(match, true)).join("") || '<div class="feedback status-warn">Ninguna regla específica se activó.</div>'}
        </section>
        <section class="inactive-rules-column">
          <h3>Reglas no activadas</h3>
          ${student.inactiveRules.map((match) => renderRuleEvaluationCard(match, false)).join("") || '<div class="feedback status-good">Todas las reglas específicas aplicaron.</div>'}
        </section>
      </div>
      <section class="winning-rule-panel">
        <span>${student.activeRules.length ? "Regla ganadora" : "Respaldo"}</span>
        <h3>${winner ? `${escapeHtml(winner.id)} · ${escapeHtml(ruleActionLabel(winner))}` : "Sin regla ganadora"}</h3>
        <p>${escapeHtml(winner?.explicacion || "No hay explicación disponible.")}</p>
        ${student.conflict ? `<div class="feedback status-warn">Conflicto: ${escapeHtml(student.conflict.rules.map((rule) => rule.id).join(", "))} recomiendan ${escapeHtml(student.conflict.actions.join(", "))}.</div>` : ""}
      </section>
    `;
  }

  function generateStudentColabCode() {
    const student = inferenceState.student;
    if (!student.knowledgeBase || !student.rules.length) return "";
    const source = student.knowledgeBase || { rules: student.rules };
    const variables = getStudentConditionKeys();
    const caseFromState = Object.keys(student.currentCase || {}).length
      ? student.currentCase
      : Object.fromEntries(variables.map((key, index) => [key || `variable_${index + 1}`, "valor_aqui"]));
    const savedCases = student.savedCases.length
      ? student.savedCases.map((item) => item.caseData)
      : [caseFromState];

    return `# Clase 11 · Motor de inferencia en Colab
# Código generado desde el JSON del alumno

import json
from pprint import pprint

base_conocimiento = ${JSON.stringify(source, null, 2)}

def obtener_reglas(base):
    if isinstance(base, list):
        return base
    if isinstance(base, dict) and "rules" in base:
        return base["rules"]
    if isinstance(base, dict) and "reglas" in base:
        return base["reglas"]
    return []

reglas = [
    regla for regla in obtener_reglas(base_conocimiento)
    if regla.get("tipo") != "respaldo"
]

regla_respaldo = next(
    (regla for regla in obtener_reglas(base_conocimiento)
     if regla.get("tipo") == "respaldo"),
    None
)

def regla_aplica(regla, caso):
    condiciones = regla.get("condiciones", {})
    for variable, esperado in condiciones.items():
        actual = caso.get(variable)
        if actual != esperado:
            return False
    return True

def explicar_coincidencia(regla, caso):
    condiciones = regla.get("condiciones", {})
    detalles = []

    for variable, esperado in condiciones.items():
        actual = caso.get(variable)
        detalles.append({
            "variable": variable,
            "esperado": esperado,
            "actual": actual,
            "cumple": actual == esperado
        })

    aplica = all(item["cumple"] for item in detalles)

    return {
        "regla": regla.get("id", "sin_id"),
        "aplica": aplica,
        "detalles": detalles
    }

def obtener_reglas_activadas(reglas, caso):
    activadas = []
    no_activadas = []

    for regla in reglas:
        explicacion = explicar_coincidencia(regla, caso)
        if explicacion["aplica"]:
            activadas.append({
                "regla": regla,
                "explicacion": explicacion
            })
        else:
            no_activadas.append({
                "regla": regla,
                "explicacion": explicacion
            })

    return activadas, no_activadas

def puntaje_regla(regla):
    puntos_prioridad = {
        "alta": 3,
        "media": 2,
        "baja": 1
    }

    puntos_confianza = {
        "alta": 3,
        "media": 2,
        "baja": 1
    }

    prioridad = str(regla.get("prioridad", "baja")).lower()
    confianza = str(regla.get("confianza", "baja")).lower()

    return (
        puntos_prioridad.get(prioridad, 1),
        puntos_confianza.get(confianza, 1)
    )

def elegir_regla_ganadora(activadas):
    if not activadas:
        return None

    activadas_ordenadas = sorted(
        activadas,
        key=lambda item: puntaje_regla(item["regla"]),
        reverse=True
    )

    return activadas_ordenadas[0]

def detectar_conflicto(activadas):
    if len(activadas) <= 1:
        return None

    resultados = []
    for item in activadas:
        resultado = item["regla"].get("resultado", {})
        resultados.append(json.dumps(resultado, sort_keys=True, ensure_ascii=False))

    resultados_unicos = set(resultados)

    if len(resultados_unicos) > 1:
        return {
            "hay_conflicto": True,
            "mensaje": "Varias reglas se activaron con resultados diferentes.",
            "reglas": [item["regla"].get("id") for item in activadas]
        }

    return None

def generar_respuesta(caso):
    activadas, no_activadas = obtener_reglas_activadas(reglas, caso)
    conflicto = detectar_conflicto(activadas)
    ganadora = elegir_regla_ganadora(activadas)

    if ganadora is None:
        if regla_respaldo:
            return {
                "estado": "respaldo",
                "mensaje": regla_respaldo.get("explicacion", "No hay regla aplicable."),
                "resultado": regla_respaldo.get("resultado", {}),
                "reglas_activadas": [],
                "reglas_no_activadas": no_activadas
            }

        return {
            "estado": "sin_respuesta",
            "mensaje": "No se activó ninguna regla y no existe regla de respaldo.",
            "resultado": None,
            "reglas_activadas": [],
            "reglas_no_activadas": no_activadas
        }

    regla = ganadora["regla"]

    return {
        "estado": "resuelto",
        "regla_ganadora": regla.get("id"),
        "resultado": regla.get("resultado", {}),
        "explicacion": regla.get("explicacion", "Sin explicación."),
        "prioridad": regla.get("prioridad"),
        "confianza": regla.get("confianza"),
        "conflicto": conflicto,
        "reglas_activadas": activadas,
        "reglas_no_activadas": no_activadas
    }

# Cambia los valores para probar distintos escenarios de tu agente.
caso_prueba = ${JSON.stringify(caseFromState, null, 2)}

respuesta = generar_respuesta(caso_prueba)
pprint(respuesta)

casos_prueba = ${JSON.stringify(savedCases, null, 2)}

for i, caso in enumerate(casos_prueba, start=1):
    print(f"\\nCASO {i}")
    pprint(generar_respuesta(caso))
`;
  }

  function renderStudentColabStatus(message, tone = "info") {
    const status = $("#studentColabStatus");
    inferenceState.student.colabStatus = message;
    if (!status) return;
    status.textContent = message;
    status.className = `feedback ${tone === "bad" ? "status-bad" : tone === "warn" ? "status-warn" : "status-good"}`;
  }

  function renderStudentColabCode() {
    const output = $("#studentColabCodeOutput");
    const compactOutput = $("#student-colab-code");
    if (!inferenceState.student.rules.length) {
      const message = "Primero carga y valida tu JSON en el Laboratorio del alumno. Esta herramienta genera código usando tu propia base de conocimiento.";
      if (output) output.textContent = "";
      if (compactOutput) compactOutput.textContent = message;
      renderStudentColabStatus(message, "warn");
      return;
    }
    if (!getStudentConditionKeys().length) {
      const message = "Se encontraron reglas, pero ninguna tiene condiciones. El motor necesita condiciones para comparar casos.";
      if (output) output.textContent = "";
      if (compactOutput) compactOutput.textContent = message;
      renderStudentColabStatus(message, "warn");
      return;
    }
    const code = generateStudentColabCode();
    inferenceState.student.colabCode = code;
    if (output) output.textContent = code;
    if (compactOutput) compactOutput.textContent = code;
    renderStudentColabStatus("Código generado con la base de conocimiento del alumno.", "ok");
    saveProgress();
  }

  function copyStudentColabCode() {
    renderStudentColabCode();
    const code = inferenceState.student.colabCode || $("#studentColabCodeOutput")?.textContent || $("#student-colab-code")?.textContent || "";
    if (!code) return;
    navigator.clipboard?.writeText(code).then(
      () => renderStudentColabStatus("Código copiado al portapapeles.", "ok"),
      () => renderStudentColabStatus("No se pudo copiar automáticamente. Puedes seleccionarlo manualmente.", "warn")
    );
  }

  function clearStudentColabCode() {
    inferenceState.student.colabCode = "";
    if ($("#studentColabCodeOutput")) $("#studentColabCodeOutput").textContent = "";
    if ($("#student-colab-code")) $("#student-colab-code").textContent = "Código limpiado. Puedes generar uno nuevo cuando quieras.";
    renderStudentColabStatus("Código limpiado. Puedes generar uno nuevo cuando quieras.", "ok");
    saveProgress();
  }

  function scrollToStudentJsonLoader() {
    const target = $("#student-lab");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function generateStudentReport() {
    const student = inferenceState.student;
    const report = `# Evidencia de práctica · ${getStudentName()}

## Del ejemplo guiado a mi agente
- Aprendí con Charm vs Bulbi cómo el motor compara condiciones, activa reglas y explica una decisión.
- Apliqué la misma lógica a mi propio JSON, sin depender de variables de batalla.

## Resumen de base
- Reglas: ${student.validation?.total || 0}
- Variables detectadas: ${student.variables.join(", ") || "ninguna"}
- Respaldo: ${student.fallbackRule?.id || "no definido"}

## Caso actual
\`\`\`json
${JSON.stringify(student.currentCase, null, 2)}
\`\`\`

## Resultado
- Regla ganadora: ${student.winningRule?.id || "sin regla"}
- Acción: ${student.winningRule?.resultado?.accion_recomendada || "sin acción"}
- Uso de respaldo: ${student.activeRules.length ? "No" : "Sí"}
- Conflicto: ${student.conflict ? student.conflict.rules.map((rule) => rule.id).join(", ") : "No detectado"}

## Casos probados
${student.savedCases.map((item, index) => `- Caso ${index + 1}: regla ${item.winningRule || "respaldo"}, acción ${item.action || "sin acción"}, activadas ${item.activeRules.join(", ") || "ninguna"}`).join("\n") || "- Sin casos guardados"}
`;
    student.report = report;
    if ($("#student-report-output")) $("#student-report-output").textContent = report;
    saveProgress();
  }

  function generateColabCode() {
    const kb = JSON.stringify({ rules: inferenceState.rules }, null, 2);
    const cases = JSON.stringify(guidedCases.map((item) => item.data), null, 2);
    return `# Clase 11 · Battle Inference Engine
import json

base_conocimiento = ${kb}

def normalizar(valor):
    return str(valor or "").strip().lower()

def regla_aplica(regla, caso):
    condiciones = regla.get("condiciones", {})
    if regla.get("tipo") == "respaldo" or not condiciones:
        return False
    return all(normalizar(caso.get(k)) == normalizar(v) for k, v in condiciones.items())

def obtener_reglas_activadas(reglas, caso):
    return [r for r in reglas if regla_aplica(r, caso)]

def obtener_reglas_no_activadas(reglas, caso):
    return [r for r in reglas if r.get("tipo") != "respaldo" and not regla_aplica(r, caso)]

def puntaje_regla(regla):
    prioridad = {"alta": 3, "media": 2, "baja": 1}
    confianza = {"alta": 3, "media": 2, "baja": 1}
    return prioridad.get(regla.get("prioridad"), 0) * 100 + confianza.get(regla.get("confianza"), 0) * 10 + len(regla.get("condiciones", {}))

def obtener_regla_respaldo(reglas):
    for regla in reglas:
        if regla.get("tipo") == "respaldo":
            return regla
    return None

def elegir_mejor_regla(reglas_activadas, reglas):
    if not reglas_activadas:
        return obtener_regla_respaldo(reglas)
    return sorted(reglas_activadas, key=puntaje_regla, reverse=True)[0]

def detectar_conflicto(reglas_activadas, ganadora):
    if not reglas_activadas or not ganadora:
        return None
    puntaje = puntaje_regla(ganadora)
    empatadas = [r for r in reglas_activadas if puntaje_regla(r) == puntaje]
    acciones = {r.get("resultado", {}).get("accion_recomendada") for r in empatadas}
    if len(acciones) > 1:
        return {"reglas": [r["id"] for r in empatadas], "acciones": list(acciones)}
    return None

def generar_respuesta(reglas, caso):
    activadas = obtener_reglas_activadas(reglas, caso)
    no_activadas = obtener_reglas_no_activadas(reglas, caso)
    ganadora = elegir_mejor_regla(activadas, reglas)
    conflicto = detectar_conflicto(activadas, ganadora)
    if not ganadora:
        return {"accion": "sin_respuesta", "explicacion": "No hay regla ganadora ni respaldo."}
    return {
        "accion": ganadora.get("resultado", {}).get("accion_recomendada"),
        "regla": ganadora.get("id"),
        "explicacion": ganadora.get("explicacion"),
        "activadas": [r.get("id") for r in activadas],
        "no_activadas": [r.get("id") for r in no_activadas],
        "conflicto": conflicto,
    }

casos_prueba = ${cases}

for i, caso in enumerate(casos_prueba, start=1):
    print("Caso", i)
    print(json.dumps(generar_respuesta(base_conocimiento["rules"], caso), ensure_ascii=False, indent=2))
`;
  }

  function copyColabCode() {
    const code = $("#colab-code")?.textContent || "";
    if (!code || code.includes("Genera el código")) {
      showMessage("Primero genera el código de Colab.", "warn");
      return;
    }
    navigator.clipboard?.writeText(code).then(
      () => showMessage("Código copiado al portapapeles.", "ok"),
      () => showMessage("No se pudo copiar automáticamente. Puedes seleccionarlo manualmente.", "warn")
    );
  }

  function classifyTrial() {
    if (!inferenceState.winningRule) return "error";
    if (inferenceState.conflict) return "conflicto";
    if (inferenceState.winningRule.tipo === "respaldo") return "respaldo";
    return "resuelto";
  }

  function addTrialCase() {
    runInference();
    inferenceState.trialCases.unshift({
      id: `trial-${Date.now()}`,
      date: new Date().toLocaleString("es-MX"),
      status: classifyTrial(),
      caseData: { ...inferenceState.currentCase },
      activeRules: inferenceState.activeRules.map((match) => match.rule.id),
      winningRule: inferenceState.winningRule?.id || "",
      action: inferenceState.winningRule?.resultado?.accion_recomendada || "",
      conflict: inferenceState.conflict
    });
    renderTrialHistory();
    saveProgress();
  }

  function renderTrialHistory() {
    const metrics = $("#trial-metrics");
    const history = $("#trial-history");
    const counts = inferenceState.trialCases.reduce((acc, trial) => {
      acc[trial.status] = (acc[trial.status] || 0) + 1;
      return acc;
    }, {});
    if (metrics) {
      metrics.innerHTML = [
        renderMetric("Casos probados", inferenceState.trialCases.length),
        renderMetric("Resueltos", counts.resuelto || 0),
        renderMetric("Respaldo", counts.respaldo || 0),
        renderMetric("Conflicto", counts.conflicto || 0),
        renderMetric("Error", counts.error || 0)
      ].join("");
    }
    if (history) {
      history.innerHTML = inferenceState.trialCases.map((trial, index) => `
        <article class="trial-card">
          <header><strong>Caso ${inferenceState.trialCases.length - index} · ${escapeHtml(trial.status)}</strong><span>${escapeHtml(trial.date)}</span></header>
          <span>Acción: ${escapeHtml(trial.action || "sin respuesta")}</span>
          <span>Regla ganadora: ${escapeHtml(trial.winningRule || "respaldo/no definida")}</span>
          <span>Activadas: ${escapeHtml(trial.activeRules.join(", ") || "ninguna")}</span>
        </article>
      `).join("") || "Sin casos registrados.";
    }
  }

  function generateEvidenceReport() {
    readReflection();
    const validation = inferenceState.validation || validateKnowledgeBase();
    const response = generateAgentResponse();
    const conflict = inferenceState.conflict
      ? `${inferenceState.conflict.rules.map((rule) => rule.id).join(", ")} -> ${inferenceState.conflict.actions.join(", ")}`
      : "No detectado";
    return `# Clase 11 · Battle Inference Engine

## Base cargada
- Total de reglas: ${validation.total}
- Reglas normales: ${validation.normal}
- Reglas de excepción: ${validation.exceptions}
- Regla de respaldo: ${validation.fallback}
- Reglas incompletas: ${validation.incomplete.length}

## Caso principal Charm vs Bulbi (guía)
\`\`\`json
${JSON.stringify(guidedCases[0].data, null, 2)}
\`\`\`

## Caso evaluado actualmente
\`\`\`json
${JSON.stringify(inferenceState.currentCase, null, 2)}
\`\`\`

## Regla ganadora
- ${inferenceState.winningRule ? `${inferenceState.winningRule.id}: ${inferenceState.winningRule.resultado.accion_recomendada}` : "No definida"}

## Explicación
${response}

## Reglas activadas
${inferenceState.activeRules.map((match) => `- ${match.rule.id}: ${match.rule.resultado.accion_recomendada}`).join("\n") || "- Ninguna"}

## Reglas no aplicadas
${inferenceState.inactiveRules.map((match) => `- ${reasonForInactive(match)}`).join("\n") || "- Ninguna"}

## Conflicto
- ${conflict}

## Uso de respaldo
- ${inferenceState.winningRule?.tipo === "respaldo" ? "Sí" : "No"}

## Log de batalla
\`\`\`
${inferenceState.battleLog || "Sin log generado."}
\`\`\`

## Pruebas
${inferenceState.trialCases.map((trial, index) => `- Caso ${index + 1}: ${trial.status}, accion ${trial.action}, regla ${trial.winningRule || "respaldo"}`).join("\n") || "- Sin casos registrados"}

## Reflexión final
- Aprendizaje: ${inferenceState.finalReflection.learning}
- Mejor caso: ${inferenceState.finalReflection.bestCase}
- Caso débil: ${inferenceState.finalReflection.failedCase}
- Siguiente mejora: ${inferenceState.finalReflection.nextImprovement}
`;
  }

  function downloadEvidenceReport(format = "md") {
    const output = $("#report-output");
    const report = output?.textContent.includes("Genera el reporte") ? generateEvidenceReport() : output.textContent;
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clase11-battle-inference.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function readReflection() {
    inferenceState.finalReflection = {
      learning: $("#reflection-learning")?.value.trim() || "",
      bestCase: $("#reflection-best")?.value.trim() || "",
      failedCase: $("#reflection-failed")?.value.trim() || "",
      nextImprovement: $("#reflection-next")?.value.trim() || ""
    };
  }

  function applyReflection() {
    if ($("#reflection-learning")) $("#reflection-learning").value = inferenceState.finalReflection.learning || "";
    if ($("#reflection-best")) $("#reflection-best").value = inferenceState.finalReflection.bestCase || "";
    if ($("#reflection-failed")) $("#reflection-failed").value = inferenceState.finalReflection.failedCase || "";
    if ($("#reflection-next")) $("#reflection-next").value = inferenceState.finalReflection.nextImprovement || "";
  }

  function saveProgress() {
    inferenceState.progress = {};
    $$("[data-complete]").forEach((input) => {
      inferenceState.progress[input.dataset.complete] = input.checked;
    });
    readReflection();
    localStorage.setItem(storageKey, JSON.stringify({
      rawJson: inferenceState.rawJson,
      currentCase: inferenceState.currentCase,
      trialCases: inferenceState.trialCases,
      finalReflection: inferenceState.finalReflection,
      progress: inferenceState.progress,
      student: inferenceState.student,
      selectedRuleId: inferenceState.selectedRuleId,
      turn: inferenceState.turn
    }));
    renderProgress();
  }

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      if (saved.rawJson) {
        $("#kb-json").value = saved.rawJson;
        inferenceState.rawJson = saved.rawJson;
        parseKnowledgeBaseJSON();
        validateKnowledgeBase();
      }
      inferenceState.currentCase = saved.currentCase || inferenceState.currentCase;
      inferenceState.trialCases = saved.trialCases || [];
      inferenceState.finalReflection = saved.finalReflection || inferenceState.finalReflection;
      inferenceState.progress = saved.progress || {};
      inferenceState.student = { ...inferenceState.student, ...(saved.student || {}) };
      inferenceState.selectedRuleId = saved.selectedRuleId || "";
      inferenceState.turn = saved.turn || 1;
      $$("[data-complete]").forEach((input) => {
        input.checked = Boolean(inferenceState.progress[input.dataset.complete]);
      });
      buildCaseForm();
      renderCasePreview();
      renderRuleSelector();
      renderTrialHistory();
      applyReflection();
      renderProgress();
      renderBattle();
      renderMission5Rules();
      renderStudentSummary();
      buildStudentCaseForm();
      renderStudentInference();
      renderStudentColabCode();
      if ($("#student-json")) $("#student-json").value = inferenceState.student.rawJson || "";
      if ($("#studentColabCodeOutput")) $("#studentColabCodeOutput").textContent = inferenceState.student.colabCode || "";
      if (inferenceState.student.colabStatus) renderStudentColabStatus(inferenceState.student.colabStatus, "ok");
      if ($("#student-report-output") && inferenceState.student.report) $("#student-report-output").textContent = inferenceState.student.report;
    } catch (error) {
      showMessage(`No se pudo cargar el progreso: ${error.message}`, "warn");
    }
  }

  function renderProgress() {
    const checks = $$("[data-complete]");
    const missionXp = checks.reduce((sum, input) => sum + Number(input.closest(".mission")?.dataset.xp || 0), 0);
    const earned = checks.reduce((sum, input) => sum + (input.checked ? Number(input.closest(".mission")?.dataset.xp || 0) : 0), 0);
    const total = missionXp || 100;
    const pct = total ? Math.round((earned / total) * 100) : 0;
    if ($("#xp-text")) $("#xp-text").textContent = `${earned} / ${total}`;
    if ($("#xp-bar")) $("#xp-bar").style.width = `${Math.min(100, pct)}%`;
    if ($("#xp-status")) $("#xp-status").textContent = pct >= 100 ? "Motor documentado y evidencia lista." : `${pct}% del laboratorio completado.`;
  }

  function loadGuidedExample() {
    $("#kb-json").value = JSON.stringify(guidedKnowledgeBase, null, 2);
    inferenceState.rawJson = $("#kb-json").value;
    parseKnowledgeBaseJSON();
    validateKnowledgeBase();
    resetBattle();
    evaluateRulesForCurrentCase();
    showMessage("Batalla guiada Charm vs Bulbi cargada. Ejecuta el siguiente turno para ver razonar al motor.", "ok");
  }

  function clearWorkspace() {
    localStorage.removeItem(storageKey);
    inferenceState.rawJson = "";
    inferenceState.knowledgeBase = [];
    inferenceState.rules = [];
    inferenceState.fallbackRule = null;
    inferenceState.activeRules = [];
    inferenceState.inactiveRules = [];
    inferenceState.selectedRuleId = "";
    inferenceState.currentCase = {};
    inferenceState.winningRule = null;
    inferenceState.conflict = null;
    inferenceState.trialCases = [];
    inferenceState.validation = null;
    inferenceState.battleLog = "";
    inferenceState.turn = 1;
    battleState = structuredClone(initialBattleState);
    inferenceState.finalReflection = { learning: "", bestCase: "", failedCase: "", nextImprovement: "" };
    inferenceState.progress = {};
    $("#kb-json").value = "";
    $("#kb-summary").innerHTML = "";
    $("#rules-preview").textContent = "Sin reglas cargadas.";
    $("#kb-feedback").textContent = "Esperando base de conocimiento.";
    $("#case-form").innerHTML = "";
    $("#case-preview").textContent = "{}";
    $("#rule-selector").innerHTML = "";
    $("#rule-match-output").textContent = "Selecciona una regla.";
    $("#active-rules").textContent = "Sin ejecución.";
    $("#inactive-rules").textContent = "Sin ejecución.";
    if ($("#mission5RulesPanel")) $("#mission5RulesPanel").textContent = "Primero carga la batalla guiada o pega tu base de conocimiento.";
    $("#battle-inactive-reasons").textContent = "Pendiente de evaluación.";
    $("#conflict-output").textContent = "Ejecuta el motor para resolver prioridades.";
    $("#agent-response").textContent = "Ejecuta el motor para ver la recomendación.";
    $("#decision-card").textContent = "Ejecuta el siguiente turno para ver la regla ganadora.";
    $("#fallback-output").textContent = "Pendiente de prueba.";
    if ($("#colab-code")) $("#colab-code").textContent = "Genera el código para verlo aquí.";
    if ($("#studentColabCodeOutput")) $("#studentColabCodeOutput").textContent = "";
    if ($("#studentColabStatus")) $("#studentColabStatus").textContent = "Primero carga y valida tu JSON en el Laboratorio del alumno.";
    $("#report-output").textContent = "Genera el reporte para verlo aquí.";
    $("#battle-log").textContent = "Carga la batalla guiada y ejecuta el siguiente turno.";
    applyReflection();
    renderTrialHistory();
    $$("[data-complete]").forEach((input) => { input.checked = false; });
    renderProgress();
    renderBattle();
    showMessage("Entorno limpio. Pega tu base JSON para comenzar.", "ok");
  }

  function loadIncompleteCase() {
    inferenceState.currentCase = {
      criatura_jugador: "Charm",
      tipo_jugador: "fuego",
      criatura_enemigo: "Oni",
      tipo_enemigo: "",
      nivel_jugador: "medio",
      nivel_enemigo: "",
      vida_jugador: "media",
      vida_enemigo: "media",
      energia: "media",
      ataque_disponible: "",
      tipo_ataque: "",
      tiene_pocion: "no"
    };
    buildCaseForm();
    renderCasePreview();
    renderBattle();
    saveProgress();
  }

  function loadPriorityConflictCase() {
    inferenceState.currentCase = { ...guidedCases[1].data };
    buildCaseForm();
    renderBattle();
    runInference();
  }

  function loadExplicitTieCase() {
    const hasTieRule = inferenceState.rules.some((rule) => rule.id === "R9_TIE");
    if (!hasTieRule) {
      inferenceState.rules.push({
        id: "R9_TIE",
        tipo: "normal",
        prioridad: "media",
        condiciones: { tipo_ataque: "fuego", tipo_enemigo: "planta" },
        resultado: { accion_recomendada: "cambiar_estrategia" },
        explicacion: "Regla de prueba: empata con R2 en prioridad/confianza pero propone otra acción.",
        confianza: "alta"
      });
      $("#kb-json").value = JSON.stringify({ rules: inferenceState.rules }, null, 2);
      inferenceState.rawJson = $("#kb-json").value;
      validateKnowledgeBase();
    }
    inferenceState.currentCase = { ...guidedCases[0].data };
    buildCaseForm();
    renderBattle();
    runInference();
  }

  function testFallback() {
    loadIncompleteCase();
    runInference();
    const output = $("#fallback-output");
    if (output) output.textContent = generateAgentResponse();
  }

  function setupMediaFallbacks() {
    $$(".creature-image-card img").forEach((img) => {
      img.addEventListener("error", () => {
        img.closest(".creature-image-card")?.classList.add("image-missing");
      });
      img.addEventListener("load", () => {
        img.closest(".creature-image-card")?.classList.remove("image-missing");
      });
    });
  }

  function setupSidebar() {
    const sidebar = $("#mission-sidebar");
    const toggle = $("#sidebar-toggle");
    const overlay = $("#sidebar-overlay");
    const desktop = window.matchMedia("(min-width: 1101px)");

    function setOpen(open) {
      document.body.classList.toggle("sidebar-open", open && !desktop.matches);
      document.body.classList.toggle("sidebar-collapsed", !open && desktop.matches);
      toggle?.setAttribute("aria-expanded", String(open));
      overlay?.setAttribute("aria-hidden", String(!open));
    }

    toggle?.addEventListener("click", () => {
      const collapsed = desktop.matches
        ? document.body.classList.contains("sidebar-collapsed")
        : document.body.classList.contains("sidebar-open");
      setOpen(collapsed);
    });
    overlay?.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
    document.addEventListener("click", (event) => {
      if (desktop.matches || !document.body.classList.contains("sidebar-open")) return;
      if (sidebar?.contains(event.target) || toggle?.contains(event.target)) return;
      setOpen(false);
    });
    $$(".mission-nav a").forEach((link) => link.addEventListener("click", () => {
      if (!desktop.matches) setOpen(false);
    }));
    desktop.addEventListener("change", () => {
      document.body.classList.remove("sidebar-open", "sidebar-collapsed");
      toggle?.setAttribute("aria-expanded", "true");
    });
  }

  function resetEngineTrace() {
    inferenceState.engineTraceTimers.forEach((timer) => clearTimeout(timer));
    inferenceState.engineTraceTimers = [];
    inferenceState.engineTraceStep = 0;
    $$("[data-trace-step]").forEach((step) => step.classList.remove("is-active"));
    const log = $("#engineTraceLog");
    if (log) log.textContent = "Presiona “Ver cómo piensa el motor” para ver la traza.";
  }

  function runEngineTrace() {
    const steps = $$("[data-trace-step]");
    const log = $("#engineTraceLog");
    const logs = [
      "Leyendo estado de batalla: Charm observa a Bulbi.",
      "Comparando caso contra reglas SI/ENTONCES.",
      "R2 coincide: tipo_ataque = fuego y tipo_enemigo = planta.",
      "El motor revisa prioridad media y confianza alta.",
      "Decisión explicada: Charm usa Chispa Fuego porque fuego tiene ventaja contra planta."
    ];
    if (!steps.length || !log) return;

    resetEngineTrace();
    log.textContent = "";

    logs.forEach((message, index) => {
      const timer = setTimeout(() => {
        inferenceState.engineTraceStep = index + 1;
        steps[index]?.classList.add("is-active");
        log.textContent = `${log.textContent}${index ? "\n" : ""}${index + 1}. ${message}`;
      }, index * 680);
      inferenceState.engineTraceTimers.push(timer);
    });
  }

  function viewFullBattleFromCore() {
    const simulator = $("#simulador");
    location.hash = "#simulador";
    if (simulator) {
      const scroller = document.scrollingElement || document.documentElement;
      const previousBehavior = scroller.style.scrollBehavior;
      scroller.style.scrollBehavior = "auto";
      window.scrollTo({ top: simulator.offsetTop, behavior: "auto" });
      scroller.style.scrollBehavior = previousBehavior;
      return;
    }
  }

  function evaluateMission5Turn() {
    evaluateRulesForCurrentCase();
    showMessage("Reglas del turno actual evaluadas en Misión 5.", "ok");
  }

  function loadMission5ConflictCase() {
    inferenceState.currentCase = { ...guidedCases[1].data };
    buildCaseForm();
    renderCasePreview();
    renderBattle();
    evaluateRulesForCurrentCase();
    showMessage("Caso de conflicto cargado: supervivencia y ataque de fuego se activan a la vez.", "ok");
  }

  function restoreMission5GuidedCase() {
    inferenceState.currentCase = { ...guidedCases[0].data };
    buildCaseForm();
    renderCasePreview();
    renderBattle();
    evaluateRulesForCurrentCase();
    showMessage("Caso Charm vs Bulbi restaurado y evaluado.", "ok");
  }

  function bindEvents() {
    $("#load-guided-example")?.addEventListener("click", loadGuidedExample);
    $("#load-guided-example-inline")?.addEventListener("click", loadGuidedExample);
    $("#clear-workspace")?.addEventListener("click", clearWorkspace);
    $("#validate-kb")?.addEventListener("click", () => {
      try {
        parseKnowledgeBaseJSON();
        validateKnowledgeBase();
        showMessage("Base validada correctamente.", "ok");
      } catch (error) {
        $("#kb-feedback").textContent = error.message;
        $("#kb-feedback").className = "feedback status-bad";
        showMessage(error.message, "bad");
      }
    });
    $("#json-file")?.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      $("#kb-json").value = await file.text();
      $("#validate-kb").click();
    });
    $("#student-json-file")?.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      $("#student-json").value = await file.text();
      validateStudentKnowledgeBase();
    });
    $("#student-validate")?.addEventListener("click", validateStudentKnowledgeBase);
    $("#student-save-case")?.addEventListener("click", () => {
      readStudentCaseForm();
      showMessage("Caso del alumno guardado en el laboratorio.", "ok");
    });
    $("#student-example-case")?.addEventListener("click", loadStudentExampleCase);
    $("#student-clear-case")?.addEventListener("click", clearStudentCase);
    $("#student-run-inference")?.addEventListener("click", evaluateStudentRules);
    $("#student-generate-colab")?.addEventListener("click", renderStudentColabCode);
    $("#student-copy-colab")?.addEventListener("click", copyStudentColabCode);
    $("#student-generate-report")?.addEventListener("click", generateStudentReport);
    $("#save-case")?.addEventListener("click", () => {
      readCaseForm();
      showMessage("Caso guardado.", "ok");
    });
    $("#load-backup-case")?.addEventListener("click", loadIncompleteCase);
    $("#compare-rule")?.addEventListener("click", compareSelectedRule);
    $("#run-inference")?.addEventListener("click", runInference);
    $("#run-turn-inference")?.addEventListener("click", executeBattleRound);
    $("#simulate-full-battle")?.addEventListener("click", simulateFullBattle);
    $("#reset-battle")?.addEventListener("click", resetBattle);
    $("#runEngineTraceBtn")?.addEventListener("click", runEngineTrace);
    $("#resetEngineTraceBtn")?.addEventListener("click", resetEngineTrace);
    $("#viewFullBattleBtn")?.addEventListener("click", viewFullBattleFromCore);
    $("#evaluate-turn-rules")?.addEventListener("click", evaluateMission5Turn);
    $("#mission5-battle-link")?.addEventListener("click", viewFullBattleFromCore);
    $("#mission5-conflict-case")?.addEventListener("click", loadMission5ConflictCase);
    $("#mission5-restore-case")?.addEventListener("click", restoreMission5GuidedCase);
    $("#generate-response")?.addEventListener("click", () => {
      runInference();
      $("#agent-response").textContent = generateAgentResponse();
    });
    $("#test-priority-conflict")?.addEventListener("click", loadPriorityConflictCase);
    $("#test-explicit-tie")?.addEventListener("click", loadExplicitTieCase);
    $("#test-fallback")?.addEventListener("click", testFallback);
    $("#restore-guided-case")?.addEventListener("click", () => {
      inferenceState.currentCase = { ...guidedCases[0].data };
      buildCaseForm();
      renderBattle();
      runInference();
    });
    $("#generate-colab")?.addEventListener("click", renderStudentColabCode);
    $("#copy-colab")?.addEventListener("click", copyStudentColabCode);
    $("#clear-colab-code")?.addEventListener("click", clearStudentColabCode);
    $("#go-student-json")?.addEventListener("click", scrollToStudentJsonLoader);
    $("#add-trial")?.addEventListener("click", addTrialCase);
    $("#clear-trials")?.addEventListener("click", () => {
      inferenceState.trialCases = [];
      renderTrialHistory();
      saveProgress();
    });
    $("#generate-report")?.addEventListener("click", () => {
      runInference();
      $("#report-output").textContent = generateEvidenceReport();
      saveProgress();
    });
    $("#download-md")?.addEventListener("click", () => downloadEvidenceReport("md"));
    $("#download-txt")?.addEventListener("click", () => downloadEvidenceReport("txt"));
    $$("[data-complete], #reflection-learning, #reflection-best, #reflection-failed, #reflection-next").forEach((input) => {
      input.addEventListener("change", saveProgress);
      input.addEventListener("input", saveProgress);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupMediaFallbacks();
    setupSidebar();
    bindEvents();
    renderProgress();
    renderTrialHistory();
    renderBattle();
    loadProgress();
    if (!inferenceState.rules.length) loadGuidedExample();
  });

  window.inferenceState = inferenceState;
  window.loadGuidedExample = loadGuidedExample;
  window.clearWorkspace = clearWorkspace;
  window.parseKnowledgeBaseJSON = parseKnowledgeBaseJSON;
  window.validateKnowledgeBase = validateKnowledgeBase;
  window.renderKnowledgeBaseSummary = renderKnowledgeBaseSummary;
  window.getAllConditionKeys = getAllConditionKeys;
  window.buildCaseForm = buildCaseForm;
  window.ruleApplies = ruleApplies;
  window.explainRuleMatch = explainRuleMatch;
  window.getActiveRules = getActiveRules;
  window.getInactiveRules = getInactiveRules;
  window.scoreRule = scoreRule;
  window.selectWinningRule = selectWinningRule;
  window.detectInferenceConflict = detectInferenceConflict;
  window.getFallbackRule = getFallbackRule;
  window.generateAgentResponse = generateAgentResponse;
  window.generateColabCode = generateColabCode;
  window.copyColabCode = copyColabCode;
  window.addTrialCase = addTrialCase;
  window.renderTrialHistory = renderTrialHistory;
  window.generateEvidenceReport = generateEvidenceReport;
  window.downloadEvidenceReport = downloadEvidenceReport;
  window.saveProgress = saveProgress;
  window.loadProgress = loadProgress;
})();

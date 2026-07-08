(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const storageKey = "clase12-strategy-tree-arena";
  const legacyStrategyActionName = ["cambiar", "estrategia"].join("_");
  const initialBattleState = {
    schemaVersion: 2,
    turn: 1,
    finished: false,
    winner: "",
    charm: {
      hp: 80,
      maxHp: 100,
      energy: 70,
      maxEnergy: 100,
      potions: 1,
      defenseActive: "no",
      nextAttackBoost: "no"
    },
    oni: {
      hp: 120,
      maxHp: 120,
      energy: 80,
      maxEnergy: 100,
      defense: "alta",
      attackRisk: "alto",
      status: "normal"
    },
    currentStrategy: null,
    strategyReason: "",
    actions: [
      { name: "ataque_fuego", benefit: 20, safety: 5, advantage: 0, energyCost: 12, risk: 30, condition: "si Oni tiene defensa alta, baja la ventaja", justification: "El fuego está disponible, pero Oni resiste bien por su defensa alta." },
      { name: "defender", benefit: 5, safety: 35, advantage: 0, energyCost: 0, risk: 8, condition: "sube si Charm tiene vida baja", justification: "Defender reduce daño y ayuda a sobrevivir." },
      { name: "usar_pocion", benefit: 15, safety: 45, advantage: 0, energyCost: 0, risk: 5, condition: "solo disponible si hay pociones", justification: "La poción aumenta supervivencia, especialmente con vida baja." },
      { name: "ataque_especial", benefit: 45, safety: 5, advantage: 10, energyCost: 35, risk: 28, condition: "sube si Oni tiene vida baja y Charm tiene energía alta", justification: "Puede causar mucho daño, pero consume mucha energía." },
      { name: "concentrarse", benefit: 8, safety: 18, advantage: 18, energyCost: 0, risk: 6, condition: "recupera energía y prepara el siguiente ataque", justification: "Concentrarse consume el turno para recuperar energía y preparar una acción ofensiva posterior." }
    ],
    ranking: [],
    selectedAction: null,
    logs: ""
  };

  const strategyState = {
    guided: {
      scenario: {
        player: "Charm",
        enemy: "Oni",
        playerHp: "media",
        playerEnergy: "media",
        enemyDefense: "alta",
        enemyType: "roca",
        risk: "alto",
        potion: "si",
        elementalAdvantage: "no"
      },
      options: [
        { name: "usar_ataque_fuego", label: "Atacar con fuego", benefit: 20, safety: 10, advantage: 0, cost: 12, risk: 25, explanation: "Puede hacer daño, pero Oni tiene defensa alta y el fuego no tiene ventaja clara.", justification: "Causa poco beneficio porque Oni tiene defensa alta. No tiene ventaja elemental clara y puede provocar contraataque." },
        { name: "defender", label: "Defender", benefit: 5, safety: 35, advantage: 0, cost: 0, risk: 8, explanation: "No causa mucho daño, pero aumenta supervivencia y reduce el riesgo inmediato.", justification: "No causa daño, pero reduce riesgo y aumenta seguridad cuando la situación es peligrosa." },
        { name: "usar_pocion", label: "Usar poción", benefit: 12, safety: 30, advantage: 0, cost: 8, risk: 12, explanation: "Recupera margen defensivo, especialmente si la vida baja.", justification: "Sube la supervivencia si la vida está baja, pero si la vida está media su beneficio es menor." },
        { name: "ataque_especial", label: "Ataque especial", benefit: 35, safety: 5, advantage: 10, cost: 28, risk: 24, explanation: "Puede impactar fuerte, pero consume mucha energía y deja a Charm expuesto.", justification: "Puede causar más impacto, pero consume mucha energía y puede ser riesgoso si falla." },
        { name: "concentrarse", label: "Concentrarse", benefit: 8, safety: 18, advantage: 18, cost: 0, risk: 6, explanation: "Recupera energía y prepara una acción futura sin llamarlo estrategia.", justification: "Es una acción concreta: Charm usa el turno para prepararse y reducir una decisión impulsiva." }
      ],
      rankedOptions: [],
      winningOption: null,
      logs: []
    },
    student: {
      agentName: "",
      problem: "",
      options: [],
      rankedOptions: [],
      winningOption: null,
      scenarios: [],
      report: "",
      colabCode: ""
    },
    battle: structuredClone(initialBattleState)
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function calculateScore(option) {
    return Number(option.benefit || 0) + Number(option.safety || 0) + Number(option.advantage || 0) - Number(option.cost || 0) - Number(option.risk || 0);
  }

  function scoreTableRows(options, mode) {
    return options.map((option) => `
      <tr class="${option.name === (mode === "guided" ? strategyState.guided.winningOption?.name : strategyState.student.winningOption?.name) ? "is-winner" : ""}">
        <td><strong>${escapeHtml(option.name)}</strong></td>
        ${["benefit", "safety", "advantage", "cost", "risk"].map((key) => `
          <td><input type="number" value="${Number(option[key] || 0)}" data-${mode}-score="${escapeHtml(option.name)}" data-key="${key}"></td>
        `).join("")}
        <td><strong>${calculateScore(option)}</strong></td>
        <td class="justification-cell">${mode === "student"
          ? `<textarea data-${mode}-justification="${escapeHtml(option.name)}">${escapeHtml(option.justification || "")}</textarea>`
          : escapeHtml(option.justification || option.explanation || "Pendiente de justificar.")}</td>
      </tr>
    `).join("");
  }

  function renderScoreTable(target, options, mode) {
    const table = $(target);
    if (!table) return;
    table.innerHTML = `
      <thead>
        <tr><th>Opción</th><th>Beneficio</th><th>Seguridad</th><th>Ventaja</th><th>Costo</th><th>Riesgo</th><th>Puntaje</th><th>Justificación</th></tr>
      </thead>
      <tbody>${scoreTableRows(options, mode)}</tbody>
    `;
    $$(`[data-${mode}-score]`, table).forEach((input) => {
      input.addEventListener("input", () => {
        const option = options.find((item) => item.name === input.dataset[`${mode}Score`]);
        if (!option) return;
        option[input.dataset.key] = Number(input.value || 0);
        if (mode === "guided") rankGuidedOptions();
        else rankStudentOptions();
      });
    });
    $$(`[data-${mode}-justification]`, table).forEach((input) => {
      input.addEventListener("input", () => {
        const option = options.find((item) => item.name === input.dataset[`${mode}Justification`]);
        if (!option) return;
        option.justification = input.value;
        saveState();
      });
    });
  }

  function rankOptions(options) {
    return [...options].map((option) => ({ ...option, score: calculateScore(option) })).sort((a, b) => b.score - a.score);
  }

  function explainScore(option) {
    const score = calculateScore(option);
    return `La opción ${option.name} obtuvo ${score} porque combina beneficio ${Number(option.benefit || 0)}, seguridad ${Number(option.safety || 0)}, ventaja ${Number(option.advantage || 0)}, costo ${Number(option.cost || 0)} y riesgo ${Number(option.risk || 0)}.`;
  }

  function setOptionValues(name, values) {
    const option = strategyState.guided.options.find((item) => item.name === name);
    if (!option) return;
    Object.assign(option, values);
  }

  function loadValidationScenario(type) {
    const scenarios = {
      balanced: {
        expected: "defender",
        label: "Escenario balanceado",
        note: "Vida y energía medias contra Oni fuerte: esperamos que defender gane porque la cautela reduce riesgo sin gastar energía.",
        values: {
          usar_ataque_fuego: { benefit: 20, safety: 10, advantage: 0, cost: 12, risk: 25 },
          defender: { benefit: 8, safety: 46, advantage: 0, cost: 0, risk: 8 },
          usar_pocion: { benefit: 12, safety: 30, advantage: 0, cost: 8, risk: 12 },
          ataque_especial: { benefit: 35, safety: 5, advantage: 10, cost: 28, risk: 24 },
          concentrarse: { benefit: 8, safety: 18, advantage: 18, cost: 0, risk: 6 }
        }
      },
      emergency: {
        expected: "usar_pocion",
        label: "Escenario de emergencia",
        note: "Vida baja y poción disponible: esperamos que usar_pocion gane porque la supervivencia pesa más que causar daño.",
        values: {
          usar_ataque_fuego: { benefit: 16, safety: 4, advantage: 0, cost: 12, risk: 34 },
          defender: { benefit: 8, safety: 42, advantage: 0, cost: 0, risk: 15 },
          usar_pocion: { benefit: 28, safety: 68, advantage: 0, cost: 10, risk: 8 },
          ataque_especial: { benefit: 34, safety: 2, advantage: 8, cost: 30, risk: 38 },
          concentrarse: { benefit: 6, safety: 12, advantage: 10, cost: 0, risk: 20 }
        }
      },
      offensive: {
        expected: "ataque_especial",
        label: "Escenario ofensivo",
        note: "Energía alta y enemigo vulnerable: esperamos que ataque_especial gane porque el beneficio y la ventaja compensan su costo.",
        values: {
          usar_ataque_fuego: { benefit: 28, safety: 12, advantage: 18, cost: 10, risk: 18 },
          defender: { benefit: 4, safety: 26, advantage: 0, cost: 0, risk: 8 },
          usar_pocion: { benefit: 8, safety: 22, advantage: 0, cost: 8, risk: 10 },
          ataque_especial: { benefit: 70, safety: 12, advantage: 26, cost: 24, risk: 18 },
          concentrarse: { benefit: 10, safety: 12, advantage: 16, cost: 0, risk: 8 }
        }
      }
    };
    const scenario = scenarios[type];
    if (!scenario) return;
    Object.entries(scenario.values).forEach(([name, values]) => setOptionValues(name, values));
    rankGuidedOptions();
    const winner = strategyState.guided.winningOption;
    const ok = winner?.name === scenario.expected;
    const result = $("#validation-result");
    if (result) {
      result.textContent = `${scenario.label}
Resultado esperado: ${scenario.expected}
Resultado obtenido: ${winner?.name || "sin ganador"} (${winner?.score ?? 0} puntos)
Diagnóstico: ${ok ? "La heurística responde como esperábamos para este caso." : "El resultado no coincide con lo esperado; revisa pesos, criterios o valores."}
${scenario.note}`;
    }
  }

  function renderDecisionTree() {
    const tree = $("#decision-tree");
    if (!tree) return;
    tree.innerHTML = strategyState.guided.options.map((option, index) => `
      <button class="decision-branch" type="button" data-tree-option="${escapeHtml(option.name)}">
        <span>${index === 0 ? "Estado actual: Charm vs Oni → " : ""}${escapeHtml(option.label)}</span>
        <strong>${escapeHtml(option.name)}</strong>
      </button>
    `).join("");
    $$("[data-tree-option]", tree).forEach((button) => {
      button.addEventListener("click", () => showOptionDetail(button.dataset.treeOption));
    });
  }

  function showOptionDetail(name) {
    const option = strategyState.guided.options.find((item) => item.name === name);
    if (!option) return;
    $$(".decision-branch").forEach((branch) => branch.classList.toggle("is-active", branch.dataset.treeOption === name));
    $("#option-detail").innerHTML = `
      <h3>${escapeHtml(option.label)}</h3>
      <p>${escapeHtml(option.explanation)}</p>
      <p><strong>Beneficio:</strong> ${option.benefit} · <strong>Riesgo:</strong> ${option.risk} · <strong>Costo:</strong> ${option.cost}</p>
    `;
  }

  function rankGuidedOptions() {
    strategyState.guided.rankedOptions = rankOptions(strategyState.guided.options);
    strategyState.guided.winningOption = strategyState.guided.rankedOptions[0] || null;
    renderScoreTable("#guided-score-table", strategyState.guided.options, "guided");
    renderGuidedWinner();
    renderGuidedRanking();
    saveState();
  }

  function renderGuidedWinner() {
    const panel = $("#guided-winner-panel");
    const winner = strategyState.guided.winningOption;
    if (!panel || !winner) return;
    panel.innerHTML = `
      <span>Mejor ruta</span>
      <h3>${escapeHtml(winner.name)}</h3>
      <p>${escapeHtml(explainScore(winner))}</p>
      <small>${escapeHtml(winner.justification || winner.explanation || "")}</small>
      <strong>Puntaje: ${winner.score}</strong>
    `;
  }

  function renderGuidedRanking() {
    const ranking = $("#guided-ranking");
    const explanation = $("#guided-explanation");
    if (!ranking) return;
    const ranked = strategyState.guided.rankedOptions.length ? strategyState.guided.rankedOptions : rankOptions(strategyState.guided.options);
    ranking.innerHTML = ranked.map((option, index) => `
      <article class="score-card ${index === 0 ? "is-winner" : ""}">
        <strong>${index + 1}</strong>
        <span>${escapeHtml(option.name)}</span>
        <b>${option.score}</b>
      </article>
    `).join("");
    if (explanation && ranked[0]) {
      const second = ranked[1];
      explanation.textContent = `El agente eligió ${ranked[0].name} porque obtuvo ${ranked[0].score} puntos. ${second ? `${second.name} quedó cerca con ${second.score}, pero no tuvo el mismo balance.` : ""}`;
    }
  }

  function updateGuidedScenario() {
    const hp = $("#scenario-hp").value;
    const energy = $("#scenario-energy").value;
    const defense = $("#scenario-defense").value;
    const risk = $("#scenario-risk").value;
    const potion = $("#scenario-potion").value;
    const advantage = $("#scenario-advantage").value;
    strategyState.guided.scenario = { ...strategyState.guided.scenario, playerHp: hp, playerEnergy: energy, enemyDefense: defense, risk, potion, elementalAdvantage: advantage };
    const potionOption = strategyState.guided.options.find((item) => item.name === "usar_pocion");
    const special = strategyState.guided.options.find((item) => item.name === "ataque_especial");
    const defend = strategyState.guided.options.find((item) => item.name === "defender");
    const fire = strategyState.guided.options.find((item) => item.name === "usar_ataque_fuego");
    if (potionOption) {
      potionOption.safety = hp === "baja" && potion === "si" ? 46 : 20;
      potionOption.risk = potion === "si" ? 8 : 30;
    }
    if (special) {
      special.benefit = energy === "alta" ? 45 : 25;
      special.cost = energy === "alta" ? 22 : 34;
    }
    if (defend) defend.safety = risk === "alto" ? 42 : 24;
    if (fire) {
      fire.advantage = advantage === "si" ? 24 : 0;
      fire.risk = defense === "alta" ? 28 : 14;
    }
    rankGuidedOptions();
    const winner = strategyState.guided.winningOption;
    $("#scenario-result").textContent = `Escenario recalculado: vida ${hp}, energía ${energy}, defensa ${defense}, riesgo ${risk}, poción ${potion}, ventaja ${advantage}.
Mejor decisión: ${winner?.name || "sin decisión"} (${winner?.score ?? 0} puntos).`;
  }

  function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, Number(value || 0)));
  }

  function getHpState(current, max) {
    const ratio = Number(current || 0) / Math.max(1, Number(max || 1));
    if (ratio <= 0.3) return "baja";
    if (ratio <= 0.7) return "media";
    return "alta";
  }

  function getEnergyState(current, max) {
    const ratio = Number(current || 0) / Math.max(1, Number(max || 1));
    if (ratio <= 0.3) return "baja";
    if (ratio <= 0.7) return "media";
    return "alta";
  }

  function syncBattleStateFromInputs() {
    const battle = strategyState.battle;
    const charm = battle.charm;
    const oni = battle.oni;
    charm.maxHp = Math.max(1, Number($("#battle-charm-max-hp")?.value || charm.maxHp));
    charm.hp = clampNumber($("#battle-charm-hp")?.value ?? charm.hp, 0, charm.maxHp);
    charm.maxEnergy = Math.max(1, Number($("#battle-charm-max-energy")?.value || charm.maxEnergy));
    charm.energy = clampNumber($("#battle-charm-energy")?.value ?? charm.energy, 0, charm.maxEnergy);
    charm.potions = Math.max(0, Number($("#battle-charm-potions")?.value || 0));
    charm.defenseActive = $("#battle-charm-defense")?.value || charm.defenseActive;
    charm.nextAttackBoost = $("#battle-charm-boost")?.value || charm.nextAttackBoost;

    oni.maxHp = Math.max(1, Number($("#battle-oni-max-hp")?.value || oni.maxHp));
    oni.hp = clampNumber($("#battle-oni-hp")?.value ?? oni.hp, 0, oni.maxHp);
    oni.maxEnergy = Math.max(1, Number($("#battle-oni-max-energy")?.value || oni.maxEnergy));
    oni.energy = clampNumber($("#battle-oni-energy")?.value ?? oni.energy, 0, oni.maxEnergy);
    oni.defense = $("#battle-oni-defense")?.value || oni.defense;
    oni.attackRisk = $("#battle-oni-risk")?.value || oni.attackRisk;
    oni.status = $("#battle-oni-status")?.value || oni.status;
  }

  function determineTurnStrategy(battleState) {
    const charmHpState = getHpState(battleState.charm.hp, battleState.charm.maxHp);
    const charmEnergyState = getEnergyState(battleState.charm.energy, battleState.charm.maxEnergy);
    const oniHpState = getHpState(battleState.oni.hp, battleState.oni.maxHp);
    const hasOffensiveEnergy = battleState.charm.energy >= 35 || charmEnergyState === "alta";
    if (charmHpState === "baja" && battleState.charm.potions > 0) {
      return {
        strategy: "recuperación",
        reason: "Charm tiene vida baja y aún cuenta con poción. Antes de atacar, conviene recuperar vida."
      };
    }
    if (charmHpState === "baja" && battleState.charm.potions <= 0) {
      return {
        strategy: "defensiva",
        reason: "Charm tiene vida baja y no puede curarse. Conviene reducir daño."
      };
    }
    if (oniHpState === "baja" && hasOffensiveEnergy) {
      return {
        strategy: "ofensiva",
        reason: "Oni tiene poca vida y Charm tiene energía suficiente para intentar cerrar el combate."
      };
    }
    if (battleState.oni.defense === "alta" || battleState.oni.attackRisk === "alto") {
      return {
        strategy: "cautela",
        reason: "Oni tiene defensa o riesgo alto. Atacar sin evaluar puede ser mala decisión."
      };
    }
    if ((charmHpState === "alta" || charmHpState === "media") && (charmEnergyState === "media" || charmEnergyState === "alta")) {
      return {
        strategy: "ofensiva",
        reason: "Charm tiene recursos suficientes para atacar."
      };
    }
    return {
      strategy: "cautela",
      reason: "No hay una ventaja clara. Conviene priorizar una decisión segura."
    };
  }

  function calculateDynamicAdjustment(action, battleState) {
    const hpState = getHpState(battleState.charm.hp, battleState.charm.maxHp);
    const energyState = getEnergyState(battleState.charm.energy, battleState.charm.maxEnergy);
    const oniHpState = getHpState(battleState.oni.hp, battleState.oni.maxHp);
    const currentStrategy = battleState.currentStrategy || "cautela";
    let adjustment = 0;

    if (currentStrategy === "recuperación") {
      if (action.name === "usar_pocion") adjustment += 40;
      if (action.name === "defender") adjustment += 10;
      if (action.name === "ataque_fuego") adjustment -= 20;
      if (action.name === "ataque_especial") adjustment -= 30;
    }
    if (currentStrategy === "defensiva") {
      if (action.name === "defender") adjustment += 35;
      if (action.name === "usar_pocion" && battleState.charm.potions > 0) adjustment += 20;
      if (action.name === "ataque_fuego") adjustment -= 10;
      if (action.name === "ataque_especial") adjustment -= 20;
    }
    if (currentStrategy === "ofensiva") {
      if (action.name === "ataque_fuego") adjustment += 15;
      if (action.name === "ataque_especial" && battleState.charm.energy >= Number(action.energyCost || 0)) adjustment += 25;
      if (action.name === "defender") adjustment -= 15;
      if (action.name === "usar_pocion" && hpState !== "baja") adjustment -= 20;
    }
    if (currentStrategy === "cautela") {
      if (action.name === "defender") adjustment += 20;
      if (action.name === "concentrarse") adjustment += 15;
      if (action.name === "ataque_fuego" && battleState.oni.defense === "alta") adjustment -= 10;
      if (action.name === "ataque_especial" && battleState.oni.attackRisk === "alto") adjustment -= 10;
    }

    if (action.name === "usar_pocion") {
      if (battleState.charm.potions <= 0) return -999;
      if (hpState === "baja") adjustment += 35;
      if (hpState === "media") adjustment += 10;
      if (hpState === "alta") adjustment -= 30;
      return adjustment;
    }
    if (action.name === "defender") {
      if (hpState === "baja") adjustment += 25;
      if (battleState.oni.attackRisk === "alto") adjustment += 15;
      if (battleState.charm.defenseActive === "si") adjustment -= 20;
      return adjustment;
    }
    if (action.name === "ataque_fuego") {
      if (battleState.oni.defense === "alta") adjustment -= 15;
      if (battleState.charm.nextAttackBoost === "si") adjustment += 20;
      if (energyState === "baja") adjustment -= 20;
      return adjustment;
    }
    if (action.name === "ataque_especial") {
      if (oniHpState === "baja") adjustment += 35;
      if (energyState === "alta") adjustment += 15;
      if (energyState === "media") adjustment -= 5;
      if (energyState === "baja") adjustment -= 50;
      if (battleState.charm.energy < Number(action.energyCost || 0)) adjustment -= 999;
      return adjustment;
    }
    if (action.name === "concentrarse") {
      if (battleState.charm.nextAttackBoost === "si") adjustment -= 18;
      if (energyState === "baja" || energyState === "media") adjustment += 10;
      if (hpState === "baja") adjustment -= 10;
      return adjustment;
    }
    return adjustment;
  }

  function evaluateCharmOptions() {
    syncBattleStateFromInputs();
    const battle = strategyState.battle;
    const strategy = determineTurnStrategy(battle);
    battle.currentStrategy = strategy.strategy;
    battle.strategyReason = strategy.reason;
    battle.ranking = battle.actions.map((action) => {
      const adjustment = calculateDynamicAdjustment(action, battle);
      const unavailable = (action.name === "usar_pocion" && battle.charm.potions <= 0)
        || ((action.name === "ataque_especial" || action.name === "ataque_fuego") && battle.charm.energy < Number(action.energyCost || 0));
      const score = unavailable
        ? -999
        : Number(action.benefit || 0) + Number(action.safety || 0) + Number(action.advantage || 0) + adjustment - Number(action.energyCost || 0) - Number(action.risk || 0);
      return { ...action, adjustment, score, unavailable };
    }).sort((a, b) => b.score - a.score);
    battle.selectedAction = battle.ranking.find((action) => !action.unavailable) || null;
    renderBattleState();
    renderTurnPhoto();
    renderBattleMatrix();
    renderBattleWinner();
    renderBattleRanking();
    saveState();
    return battle.ranking;
  }

  function actionScoreLine(action) {
    if (action.unavailable) {
      return `- ${action.name}: no disponible (${action.name === "usar_pocion" ? "sin pociones" : "energía insuficiente"})`;
    }
    return `- ${action.name}: beneficio ${action.benefit} + seguridad ${action.safety} + ventaja ${action.advantage} + ajuste ${action.adjustment} - costo ${action.energyCost} - riesgo ${action.risk} = ${action.score}`;
  }

  function applyCharmAction(action, lines) {
    const battle = strategyState.battle;
    const charm = battle.charm;
    const oni = battle.oni;
    if (!action) return;
    if (action.name === "ataque_fuego") {
      const damage = charm.nextAttackBoost === "si" ? 28 : 18;
      oni.hp = clampNumber(oni.hp - damage, 0, oni.maxHp);
      charm.energy = clampNumber(charm.energy - Number(action.energyCost || 0), 0, charm.maxEnergy);
      if (charm.nextAttackBoost === "si") charm.nextAttackBoost = "no";
      lines.push(`Charm usa ataque_fuego. Aunque Oni tiene defensa alta, la acción fue elegida por su balance actual de puntaje. Oni pierde ${damage} HP.`);
    }
    if (action.name === "defender") {
      charm.defenseActive = "si";
      charm.energy = clampNumber(charm.energy + 5, 0, charm.maxEnergy);
      lines.push("Charm decide defender. La heurística priorizó seguridad sobre daño. Charm recupera 5 energía.");
    }
    if (action.name === "usar_pocion") {
      charm.hp = clampNumber(charm.hp + 30, 0, charm.maxHp);
      charm.potions = Math.max(0, charm.potions - 1);
      lines.push("Charm usa poción porque la heurística detectó que la supervivencia era más importante que atacar. Charm recupera 30 HP.");
    }
    if (action.name === "ataque_especial") {
      oni.hp = clampNumber(oni.hp - 42, 0, oni.maxHp);
      charm.energy = clampNumber(charm.energy - Number(action.energyCost || 0), 0, charm.maxEnergy);
      if (charm.nextAttackBoost === "si") charm.nextAttackBoost = "no";
      lines.push("Charm usa ataque especial porque el puntaje indicó una oportunidad ofensiva. Oni pierde 42 HP.");
    }
    if (action.name === "concentrarse") {
      charm.nextAttackBoost = "si";
      charm.energy = clampNumber(charm.energy + 15, 0, charm.maxEnergy);
      lines.push("Charm usa concentrarse. Es una acción concreta: consume el turno para recuperar 15 energía y preparar el siguiente ataque.");
    }
  }

  function executeOniTurn(lines) {
    const battle = strategyState.battle;
    const charm = battle.charm;
    const oni = battle.oni;
    if (oni.hp <= 0) return;
    let damage;
    if (oni.energy >= 15) {
      damage = 18;
      oni.energy = clampNumber(oni.energy - 15, 0, oni.maxEnergy);
      lines.push("Oni usa golpe_roca.");
    } else {
      damage = 10;
      oni.energy = clampNumber(oni.energy + 5, 0, oni.maxEnergy);
      lines.push("Oni tiene energía baja y usa embestida_lenta. Recupera 5 energía.");
    }
    if (charm.defenseActive === "si") {
      damage = 8;
      charm.defenseActive = "no";
      lines.push("Oni ataca, pero Charm estaba defendiendo. El daño se reduce.");
    }
    charm.hp = clampNumber(charm.hp - damage, 0, charm.maxHp);
    lines.push(`Charm pierde ${damage} HP.`);
  }

  function checkStrategyBattleEnd(lines) {
    const battle = strategyState.battle;
    if (battle.oni.hp <= 0) {
      battle.oni.hp = 0;
      battle.finished = true;
      battle.winner = "Charm";
      lines.push("La simulación terminó. Charm ganó tomando decisiones con base en la matriz heurística.");
      return true;
    }
    if (battle.charm.hp <= 0) {
      battle.charm.hp = 0;
      battle.finished = true;
      battle.winner = "Oni";
      lines.push("La simulación terminó. Oni ganó. Revisa si la heurística priorizó tarde la defensa o la poción.");
      return true;
    }
    if (battle.turn >= 20) {
      battle.finished = true;
      battle.winner = "Empate técnico";
      lines.push("La simulación alcanzó el límite de turnos. Revisa si los puntajes producen decisiones poco concluyentes.");
      return true;
    }
    return false;
  }

  function executeHeuristicTurn() {
    const battle = strategyState.battle;
    syncBattleStateFromInputs();
    if (battle.finished) {
      appendBattleLog(`La batalla ya terminó. Ganador: ${battle.winner || "sin ganador"}. Usa Reiniciar simulación para probar otra tabla.`);
      return;
    }
    const hpState = getHpState(battle.charm.hp, battle.charm.maxHp);
    const energyState = getEnergyState(battle.charm.energy, battle.charm.maxEnergy);
    const oniHpState = getHpState(battle.oni.hp, battle.oni.maxHp);
    evaluateCharmOptions();
    const action = battle.selectedAction;
    const lines = [
      `Turno ${battle.turn}`,
      "",
      "Fotografía actual:",
      `- Charm vida: ${battle.charm.hp}/${battle.charm.maxHp} → ${hpState}`,
      `- Charm energía: ${battle.charm.energy}/${battle.charm.maxEnergy} → ${energyState}`,
      `- Oni vida: ${battle.oni.hp}/${battle.oni.maxHp} → ${oniHpState}`,
      `- Defensa de Oni: ${battle.oni.defense}`,
      `- Riesgo de ataque de Oni: ${battle.oni.attackRisk}`,
      `- Pociones: ${battle.charm.potions}`,
      `- Impulso preparado: ${battle.charm.nextAttackBoost}`,
      "",
      "Estrategia recomendada:",
      battle.currentStrategy,
      "",
      "Razón:",
      battle.strategyReason,
      "",
      "Evaluación de acciones concretas:",
      ...battle.ranking.map(actionScoreLine),
      "",
      "Decisión:",
      action ? `Charm adopta una estrategia de ${battle.currentStrategy} y, con base en esa estrategia, la acción concreta mejor puntuada fue ${action.name} (${action.score} puntos).` : "No hay acciones disponibles.",
      "",
      "Por qué:",
      action ? `${action.justification} La estrategia ${battle.currentStrategy} modificó los puntajes y esta acción quedó con el mejor balance.` : "La tabla dejó todas las acciones sin disponibilidad.",
      "",
      "Resultado:"
    ];
    applyCharmAction(action, lines);
    if (!checkStrategyBattleEnd(lines)) {
      lines.push("", "Respuesta de Oni:");
      executeOniTurn(lines);
      checkStrategyBattleEnd(lines);
    }
    lines.push("", "Estado final del turno:", `Charm: ${battle.charm.hp}/${battle.charm.maxHp} HP · ${battle.charm.energy}/${battle.charm.maxEnergy} energía`, `Oni: ${battle.oni.hp}/${battle.oni.maxHp} HP · ${battle.oni.energy}/${battle.oni.maxEnergy} energía`);
    if (!battle.finished) battle.turn += 1;
    appendBattleLog(lines.join("\n"));
    renderBattleState();
    evaluateCharmOptions();
  }

  function appendBattleLog(text) {
    const consoleEl = $("#battle-console");
    if (!consoleEl) return;
    const current = consoleEl.textContent.includes("Presiona “Siguiente turno”") ? "" : consoleEl.textContent.trim();
    consoleEl.textContent = `${current ? `${current}\n\n` : ""}${text}`;
    consoleEl.scrollTop = consoleEl.scrollHeight;
    strategyState.battle.logs = consoleEl.textContent;
  }

  function clearBattleConsole() {
    strategyState.battle.logs = "";
    $("#battle-console").textContent = "Consola limpia. Presiona “Siguiente turno” para generar una nueva explicación.";
    saveState();
  }

  function resetBattleSimulation() {
    strategyState.battle = structuredClone(initialBattleState);
    $("#battle-console").textContent = "Simulación reiniciada. Presiona “Siguiente turno” para observar una nueva decisión automática.";
    renderBattleState();
    evaluateCharmOptions();
  }

  function renderBattleState() {
    const battle = strategyState.battle;
    const values = {
      "battle-charm-hp": battle.charm.hp,
      "battle-charm-max-hp": battle.charm.maxHp,
      "battle-charm-energy": battle.charm.energy,
      "battle-charm-max-energy": battle.charm.maxEnergy,
      "battle-charm-potions": battle.charm.potions,
      "battle-charm-defense": battle.charm.defenseActive,
      "battle-charm-boost": battle.charm.nextAttackBoost,
      "battle-oni-hp": battle.oni.hp,
      "battle-oni-max-hp": battle.oni.maxHp,
      "battle-oni-energy": battle.oni.energy,
      "battle-oni-max-energy": battle.oni.maxEnergy,
      "battle-oni-defense": battle.oni.defense,
      "battle-oni-risk": battle.oni.attackRisk,
      "battle-oni-status": battle.oni.status
    };
    Object.entries(values).forEach(([id, value]) => {
      const field = $(`#${id}`);
      if (field && field.value !== String(value)) field.value = value;
    });
    const setBar = (selector, current, max) => {
      const bar = $(selector);
      if (bar) bar.style.width = `${clampNumber((Number(current || 0) / Math.max(1, Number(max || 1))) * 100, 0, 100)}%`;
    };
    setBar("#battle-charm-hp-bar", battle.charm.hp, battle.charm.maxHp);
    setBar("#battle-charm-energy-bar", battle.charm.energy, battle.charm.maxEnergy);
    setBar("#battle-oni-hp-bar", battle.oni.hp, battle.oni.maxHp);
    setBar("#battle-oni-energy-bar", battle.oni.energy, battle.oni.maxEnergy);
  }

  function renderTurnPhoto() {
    const summary = $("#turn-photo-summary");
    if (!summary) return;
    const battle = strategyState.battle;
    const charmHpState = getHpState(battle.charm.hp, battle.charm.maxHp);
    const charmEnergyState = getEnergyState(battle.charm.energy, battle.charm.maxEnergy);
    const oniHpState = getHpState(battle.oni.hp, battle.oni.maxHp);
    summary.innerHTML = `
      <span>Vida Charm <strong>${battle.charm.hp}/${battle.charm.maxHp} · ${charmHpState}</strong></span>
      <span>Energía Charm <strong>${battle.charm.energy}/${battle.charm.maxEnergy} · ${charmEnergyState}</strong></span>
      <span>Vida Oni <strong>${battle.oni.hp}/${battle.oni.maxHp} · ${oniHpState}</strong></span>
      <span>Defensa/Riesgo Oni <strong>${escapeHtml(battle.oni.defense)} / ${escapeHtml(battle.oni.attackRisk)}</strong></span>
      <span>Estrategia recomendada <strong>${escapeHtml(battle.currentStrategy || "pendiente")}</strong></span>
      <span class="strategy-reason">Razón <strong>${escapeHtml(battle.strategyReason || "Recalcula para analizar la fotografía actual.")}</strong></span>
    `;
  }

  function renderBattleMatrix() {
    const table = $("#battle-heuristic-table");
    if (!table) return;
    const selectedName = strategyState.battle.selectedAction?.name;
    table.innerHTML = `
      <thead>
        <tr><th>Acción</th><th>Beneficio base</th><th>Seguridad base</th><th>Ventaja base</th><th>Costo de energía</th><th>Riesgo base</th><th>Condición especial</th><th>Ajuste dinámico</th><th>Puntaje final</th><th>Justificación</th></tr>
      </thead>
      <tbody>
        ${strategyState.battle.actions.map((action) => {
          const ranked = strategyState.battle.ranking.find((item) => item.name === action.name) || { adjustment: 0, score: 0, unavailable: false };
          return `
            <tr class="${selectedName === action.name ? "is-winner" : ""} ${ranked.unavailable ? "unavailable-action" : ""}">
              <td><strong>${escapeHtml(action.name)}</strong></td>
              ${["benefit", "safety", "advantage", "energyCost", "risk"].map((key) => `
                <td><input type="number" value="${Number(action[key] || 0)}" data-battle-action="${escapeHtml(action.name)}" data-battle-key="${key}"></td>
              `).join("")}
              <td class="condition-cell">${escapeHtml(action.condition)}</td>
              <td class="${ranked.adjustment >= 0 ? "score-positive" : "score-negative"}">${ranked.adjustment}</td>
              <td class="${ranked.score >= 0 ? "score-positive" : "score-negative"}">${ranked.unavailable ? "No disponible" : ranked.score}</td>
              <td class="justification-cell">${escapeHtml(action.justification)}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    `;
    $$("[data-battle-action]", table).forEach((input) => {
      input.addEventListener("input", () => {
        const action = strategyState.battle.actions.find((item) => item.name === input.dataset.battleAction);
        if (!action) return;
        action[input.dataset.battleKey] = Number(input.value || 0);
        evaluateCharmOptions();
      });
    });
  }

  function renderBattleWinner() {
    const panel = $("#battle-winner-panel");
    if (!panel) return;
    const action = strategyState.battle.selectedAction;
    panel.innerHTML = action ? `
      <span>Estrategia recomendada</span>
      <h3>${escapeHtml(strategyState.battle.currentStrategy || "pendiente")}</h3>
      <p>${escapeHtml(strategyState.battle.strategyReason || "")}</p>
      <span>Acción elegida</span>
      <h3>${escapeHtml(action.name)}</h3>
      <p>Puntaje final: <strong>${action.score}</strong></p>
      <p>${escapeHtml(action.justification)}</p>
      <p>La estrategia modifica los puntajes, pero la acción concreta es lo que Charm ejecuta en el turno.</p>
    ` : "No hay acciones disponibles con el estado actual.";
  }

  function renderBattleRanking() {
    const list = $("#battle-ranking-list");
    if (!list) return;
    list.innerHTML = strategyState.battle.ranking.map((action, index) => `
      <article class="${index === 0 && !action.unavailable ? "is-winner" : ""} ${action.unavailable ? "unavailable-action" : ""}">
        <strong>${index + 1}. ${escapeHtml(action.name)}</strong>
        <span>Ajuste: ${action.adjustment}</span>
        <span>Puntaje: ${action.unavailable ? "No disponible" : action.score}</span>
      </article>
    `).join("");
  }

  function bindBattleEvents() {
    $$("#mision-4-5 input, #mision-4-5 select").forEach((field) => {
      field.addEventListener("input", () => evaluateCharmOptions());
      field.addEventListener("change", () => evaluateCharmOptions());
    });
    $("#next-heuristic-turn")?.addEventListener("click", executeHeuristicTurn);
    $("#recalculate-battle")?.addEventListener("click", () => {
      evaluateCharmOptions();
      appendBattleLog("Recalculo sin avanzar turno: la matriz se actualizó con el estado actual.");
    });
    $("#reset-battle")?.addEventListener("click", resetBattleSimulation);
    $("#clear-battle-console")?.addEventListener("click", clearBattleConsole);
  }

  function addStudentOption() {
    const name = $("#student-option-name").value.trim();
    if (!name) return;
    strategyState.student.agentName = $("#student-agent-name").value.trim();
    strategyState.student.problem = $("#student-problem").value.trim();
    strategyState.student.options.push({
      name,
      label: name,
      description: $("#student-option-description").value.trim(),
      when: $("#student-option-when").value.trim(),
      result: $("#student-option-result").value.trim(),
      justification: $("#student-option-justification").value.trim() || "Valores iniciales estimados por el equipo; deben ajustarse con evidencia.",
      benefit: 10,
      safety: 10,
      advantage: 10,
      cost: 5,
      risk: 5
    });
    ["student-option-name", "student-option-description", "student-option-when", "student-option-result", "student-option-justification"].forEach((id) => { $(`#${id}`).value = ""; });
    renderStudentOptions();
    rankStudentOptions();
  }

  function deleteStudentOption(index) {
    strategyState.student.options.splice(index, 1);
    renderStudentOptions();
    rankStudentOptions();
  }

  function renderStudentOptions() {
    const list = $("#student-options-list");
    if (!list) return;
    list.innerHTML = strategyState.student.options.map((option, index) => `
      <article class="student-option-row">
        <div>
          <strong>${escapeHtml(option.name)}</strong>
          <p>${escapeHtml(option.description || "Sin descripción")} · ${escapeHtml(option.when || "sin condición")} · ${escapeHtml(option.result || "sin resultado")}</p>
          <p><strong>Justificación:</strong> ${escapeHtml(option.justification || "Pendiente de justificar.")}</p>
        </div>
        <button class="btn danger" type="button" data-delete-option="${index}">Eliminar</button>
      </article>
    `).join("") || "Aún no hay opciones.";
    $$("[data-delete-option]", list).forEach((button) => {
      button.addEventListener("click", () => deleteStudentOption(Number(button.dataset.deleteOption)));
    });
    saveState();
  }

  function rankStudentOptions() {
    strategyState.student.rankedOptions = rankOptions(strategyState.student.options);
    strategyState.student.winningOption = strategyState.student.rankedOptions[0] || null;
    renderScoreTable("#student-score-table", strategyState.student.options, "student");
    const panel = $("#student-winner-panel");
    if (panel) {
      const winner = strategyState.student.winningOption;
      panel.innerHTML = winner
        ? `<span>Mejor opción</span><h3>${escapeHtml(winner.name)}</h3><p>${escapeHtml(winner.description || winner.result || "Obtuvo el mayor puntaje.")}</p><p>${escapeHtml(winner.justification || "Pendiente de justificar.")}</p><strong>Puntaje: ${winner.score}</strong>`
        : "Agrega opciones para calcular la matriz.";
    }
    saveState();
  }

  function generateStudentColabCode() {
    const options = strategyState.student.options.map((option) => ({
      nombre: option.name,
      beneficio: Number(option.benefit || 0),
      seguridad: Number(option.safety || 0),
      ventaja: Number(option.advantage || 0),
      costo: Number(option.cost || 0),
      riesgo: Number(option.risk || 0),
      justificacion: option.justification || "Sin justificación"
    }));
    const code = `# Clase 12 · Strategy Tree Arena
# Código generado con las opciones del alumno

opciones = ${JSON.stringify(options, null, 2)}

def calcular_puntaje(opcion):
    # puntaje = beneficio + seguridad + ventaja - costo - riesgo
    return opcion["beneficio"] + opcion["seguridad"] + opcion["ventaja"] - opcion["costo"] - opcion["riesgo"]

def elegir_mejor_opcion(opciones):
    return sorted(opciones, key=calcular_puntaje, reverse=True)[0]

def explicar_decision(opcion):
    return f"La mejor opción es {opcion['nombre']} porque obtuvo el mayor puntaje. Justificación: {opcion.get('justificacion', 'sin justificación')}"

mejor = elegir_mejor_opcion(opciones)
print(explicar_decision(mejor))
print("Puntaje:", calcular_puntaje(mejor))
`;
    strategyState.student.colabCode = code;
    $("#student-colab-output").textContent = code;
    saveState();
  }

  function clearStudentColabCode() {
    strategyState.student.colabCode = "";
    $("#student-colab-output").textContent = "Agrega opciones y genera código.";
    saveState();
  }

  function generateEvidenceReport() {
    strategyState.student.agentName = $("#student-agent-name").value.trim() || strategyState.student.agentName || "Mi agente";
    strategyState.student.problem = $("#student-problem").value.trim() || strategyState.student.problem || "Problema no definido";
    const winner = strategyState.student.winningOption;
    const reflections = {
      compare: $("#reflection-compare").value.trim(),
      criteria: $("#reflection-criteria").value.trim(),
      winner: $("#reflection-winner").value.trim(),
      improve: $("#reflection-improve").value.trim(),
      class11: $("#reflection-class11").value.trim()
    };
    const report = `# Evidencia Clase 12 · Strategy Tree Arena

## Agente
- Nombre: ${strategyState.student.agentName}
- Problema: ${strategyState.student.problem}

## Opciones definidas
${strategyState.student.options.map((option) => `- ${option.name}: ${option.description || "sin descripción"}\n  - Justificación: ${option.justification || "sin justificación"}`).join("\n") || "- Sin opciones"}

## Matriz de puntajes
${strategyState.student.rankedOptions.map((option) => `- ${option.name}: ${option.score} puntos\n  - Beneficio ${option.benefit}, seguridad ${option.safety}, ventaja ${option.advantage}, costo ${option.cost}, riesgo ${option.risk}\n  - Justificación: ${option.justification || "sin justificación"}`).join("\n") || "- Sin matriz calculada"}

## Mejor opción
- ${winner ? `${winner.name} (${winner.score} puntos)` : "Sin opción ganadora"}

## Explicación
- ${winner ? `La mejor opción es ${winner.name} porque obtuvo el mayor puntaje en la comparación de beneficio, seguridad, ventaja, costo y riesgo.` : "Pendiente"}

## Reflexión
- ¿Qué aprendí sobre comparar opciones? ${reflections.compare}
- ¿Qué criterio fue más importante? ${reflections.criteria}
- ¿Qué opción ganó y por qué? ${reflections.winner}
- ¿Qué cambiaría para mejorar mi agente? ${reflections.improve}
- ¿Cómo se conecta esto con la Clase 11? ${reflections.class11}
`;
    strategyState.student.report = report;
    $("#report-output").textContent = report;
    saveState();
  }

  function clearEvidenceReport() {
    strategyState.student.report = "";
    $("#report-output").textContent = "Genera evidencia para verla aquí.";
    saveState();
  }

  function copyTextFrom(selector) {
    const text = $(selector)?.textContent || "";
    if (text) navigator.clipboard?.writeText(text);
  }

  function downloadReport(ext) {
    const text = $("#report-output").textContent || "";
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clase12-evidencia.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function probeImage(src, label) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        img.alt = label || "";
        resolve(img);
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function hydrateImages() {
    const figures = $$(".image-slot");
    await Promise.all(figures.map(async (figure) => {
      const candidates = [figure.dataset.image, figure.dataset.altImage].filter(Boolean);
      for (const src of candidates) {
        const img = await probeImage(src, figure.dataset.label);
        if (img) {
          figure.prepend(img);
          figure.classList.add("has-image");
          return;
        }
      }
    }));
  }

  function setupSidebar() {
    const sidebar = $("#lesson-sidebar");
    const toggle = $("#sidebar-toggle");
    const overlay = $(".sidebar-overlay");
    const desktop = window.matchMedia("(min-width: 1101px)");
    function setOpen(open) {
      document.body.classList.toggle("sidebar-open", open && !desktop.matches);
      toggle?.setAttribute("aria-expanded", String(open));
      overlay?.setAttribute("aria-hidden", String(!open));
    }
    toggle?.addEventListener("click", () => setOpen(!document.body.classList.contains("sidebar-open")));
    overlay?.addEventListener("click", () => setOpen(false));
    $$(".lesson-nav a").forEach((link) => link.addEventListener("click", () => {
      if (!desktop.matches) setOpen(false);
    }));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(strategyState));
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      if (saved.guided) Object.assign(strategyState.guided, saved.guided);
      if (saved.student) Object.assign(strategyState.student, saved.student);
      if (saved.battle && saved.battle.schemaVersion === initialBattleState.schemaVersion) {
        strategyState.battle = structuredClone(initialBattleState);
        Object.assign(strategyState.battle, saved.battle);
        strategyState.battle.charm = { ...initialBattleState.charm, ...(saved.battle.charm || {}) };
        strategyState.battle.oni = { ...initialBattleState.oni, ...(saved.battle.oni || {}) };
        strategyState.battle.actions = Array.isArray(saved.battle.actions) ? saved.battle.actions : structuredClone(initialBattleState.actions);
        strategyState.battle.actions = strategyState.battle.actions.filter((action) => action.name !== legacyStrategyActionName);
        initialBattleState.actions.forEach((fallback) => {
          if (!strategyState.battle.actions.some((action) => action.name === fallback.name)) {
            strategyState.battle.actions.push(structuredClone(fallback));
          }
        });
      }
      strategyState.guided.options = strategyState.guided.options.filter((option) => option.name !== legacyStrategyActionName);
      if (!strategyState.guided.options.some((option) => option.name === "concentrarse")) {
        strategyState.guided.options.push({ name: "concentrarse", label: "Concentrarse", benefit: 8, safety: 18, advantage: 18, cost: 0, risk: 6, explanation: "Recupera energía y prepara una acción futura sin llamarlo estrategia.", justification: "Es una acción concreta: Charm usa el turno para prepararse y reducir una decisión impulsiva." });
      }
      strategyState.guided.options.forEach((option) => {
        if (!option.justification) option.justification = option.explanation || "Valores estimados para comparar esta opción.";
      });
      strategyState.student.options.forEach((option) => {
        if (!option.justification) option.justification = "Pendiente de justificar con reglas, datos o criterio del equipo.";
      });
      strategyState.battle.actions.forEach((action, index) => {
        const fallback = initialBattleState.actions[index] || {};
        action.condition ||= fallback.condition || "";
        action.justification ||= fallback.justification || "Valores base definidos por el equipo.";
      });
    } catch {
      // Ignore corrupted local progress.
    }
  }

  function bindEvents() {
    $("#calculate-guided-scores")?.addEventListener("click", rankGuidedOptions);
    $("#recalculate-scenario")?.addEventListener("click", updateGuidedScenario);
    $("#add-student-option")?.addEventListener("click", addStudentOption);
    $("#calculate-student-matrix")?.addEventListener("click", rankStudentOptions);
    $("#generate-student-colab")?.addEventListener("click", generateStudentColabCode);
    $("#clear-student-colab")?.addEventListener("click", clearStudentColabCode);
    $("#generate-report")?.addEventListener("click", generateEvidenceReport);
    $("#copy-report")?.addEventListener("click", () => copyTextFrom("#report-output"));
    $("#download-md")?.addEventListener("click", () => downloadReport("md"));
    $("#download-txt")?.addEventListener("click", () => downloadReport("txt"));
    $("#clear-report")?.addEventListener("click", clearEvidenceReport);
    $$("[data-focus-option]").forEach((button) => {
      button.addEventListener("click", () => showOptionDetail(button.dataset.focusOption));
    });
    $$("[data-validation-scenario]").forEach((button) => {
      button.addEventListener("click", () => loadValidationScenario(button.dataset.validationScenario));
    });
    bindBattleEvents();
  }

  function init() {
    loadState();
    setupSidebar();
    hydrateImages();
    renderDecisionTree();
    renderScoreTable("#guided-score-table", strategyState.guided.options, "guided");
    rankGuidedOptions();
    renderStudentOptions();
    rankStudentOptions();
    renderBattleState();
    evaluateCharmOptions();
    if (strategyState.battle.logs) $("#battle-console").textContent = strategyState.battle.logs;
    if (strategyState.student.colabCode) $("#student-colab-output").textContent = strategyState.student.colabCode;
    if (strategyState.student.report) $("#report-output").textContent = strategyState.student.report;
    bindEvents();
  }

  document.addEventListener("DOMContentLoaded", init);
})();

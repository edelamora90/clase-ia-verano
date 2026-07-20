(() => {
  "use strict";
  const KEY = "proyectoFinalIA";
  const STORE = {
    equipo: `${KEY}.equipo`,
    clase19: `${KEY}.clase19`,
    clase20: `${KEY}.clase20`,
    clase21: `${KEY}.clase21`,
    entrega: `${KEY}.entrega`
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const blankIdea = () => ({ name: "", user: "", situation: "", cause: "", consequence: "", current: "", agentFunction: "", scores: [1, 1, 1, 1, 1, 1] });
  const blankOpportunity = () => ({ proposer: "", context: "", user: "", observed: "", frequency: "", current: "", consequence: "", repeated: "", decision: "", agentHelp: "", limit: "", scores: Array(5).fill(0), selected: false });
  const blankFlow = (name = "") => ({ name, receives: "", does: "", produces: "", error: "", fallback: "" });
  const state = loadState();

  const mission1Comparisons = [
    {
      vague: "Un chatbot para una cafetería.",
      problem: "Los estudiantes tardan en decidir qué comprar porque desconocen qué bebidas o snacks se adaptan a su gusto, horario y nivel de hambre.",
      agent: "Preguntar preferencias y recomendar hasta tres opciones disponibles sin inventar productos ni precios.",
      why: "La versión concreta define usuario, situación, problema, consecuencia, función y límite.",
      elements: ["usuario", "situación", "problema", "consecuencia", "función", "límite"]
    },
    {
      vague: "Una IA para la escuela.",
      problem: "Los estudiantes de nuevo ingreso no saben a qué área acudir cuando tienen un problema administrativo.",
      agent: "Interpretar la situación, identificar el trámite probable y explicar el siguiente paso.",
      why: "La herramienta deja de ser el centro; ahora hay una decisión que el agente ayuda a tomar.",
      elements: ["usuario", "contexto", "clasificación", "resultado", "área responsable", "límite"]
    },
    {
      vague: "Una IA para soporte técnico.",
      problem: "Los usuarios pierden tiempo intentando resolver fallas comunes porque no saben qué pasos revisar ni cuándo escalar el problema.",
      agent: "Clasificar la incidencia, proponer verificaciones y canalizar cuando el problema supera el alcance.",
      why: "Hay información variable, pasos repetidos y una decisión de escalamiento.",
      elements: ["usuario", "falla", "verificación", "clasificación", "escalamiento", "límite"]
    }
  ];
  const mission1Cases = [
    ["Caso A", "Una tienda quiere cambiar el color de su logotipo.", "no", "Probablemente no necesita un agente porque es una tarea puntual de diseño."],
    ["Caso B", "Una tienda recibe diariamente preguntas sobre disponibilidad, características y compatibilidad de productos.", "sí", "Sí podría justificar un agente porque interpreta solicitudes repetidas y orienta con información disponible."],
    ["Caso C", "Un área administrativa recibe repetidamente solicitudes ambiguas y debe clasificarlas antes de canalizarlas.", "sí", "Sí podría justificar un agente porque interpreta texto variable, clasifica y canaliza con límites."]
  ];
  const mission1Criteria = ["Usuario claro", "Problema observable", "Función del agente", "Viable en siete horas", "Límite claro"];

  const canvasFields = [
    ["agentName", "Nombre del agente", "¿Cómo se llamará?", "Ej. TramitaBot", "Elegir un nombre genérico que no diga qué hace."],
    ["user", "Usuario principal", "¿A quién ayuda?", "Estudiantes de primer semestre", "Decir “todos”."],
    ["problem", "Problema", "¿Qué dificultad específica resuelve?", "No saben qué trámite escolar iniciar", "Confundir tema con problema."],
    ["goal", "Objetivo", "¿Qué resultado debe lograr?", "Reducir visitas innecesarias a control escolar", "Prometer resolver todo."],
    ["input", "Entrada", "¿Qué debe proporcionar el usuario?", "Situación, semestre, documento disponible", "Pedir información que no se usa."],
    ["processing", "Procesamiento", "¿Qué analiza o clasifica?", "Tipo de trámite, documentos, área", "No explicar qué pasa con la entrada."],
    ["decisions", "Decisiones", "¿Qué decide o recomienda?", "Trámite probable y siguiente paso", "Responder sin criterio."],
    ["output", "Salida", "¿Qué entrega?", "Lista de requisitos y área sugerida", "Entregar solo texto genérico."],
    ["rules", "Reglas", "¿Qué condiciones debe respetar?", "No inventar horarios ni requisitos", "Reglas imposibles de probar."],
    ["knowledge", "Conocimientos necesarios", "¿Qué información necesita?", "Reglamento, horarios, catálogo de trámites", "Depender de datos no disponibles."],
    ["limits", "Límites", "¿Qué no debe hacer?", "No sustituye a control escolar", "No reconocer límites."],
    ["errors", "Posibles errores", "¿Dónde podría fallar?", "Datos incompletos o trámite ambiguo", "Pensar que nunca falla."],
    ["unknown", "Cuando no sabe", "¿Qué hace?", "Pide datos o escala a persona", "Inventar respuesta."],
    ["success", "Criterio de éxito", "¿Cómo sabrán que funciona?", "8 de 10 casos reciben orientación útil", "No definir evidencia."]
  ];
  const promptFields = [
    ["identity", "Identidad", "Quién es el agente y qué rol debe asumir.", "Eres un agente de orientación para estudiantes de primer semestre."],
    ["user", "Usuario", "A quién atiende y en qué contexto.", "Atiende a estudiantes que no saben qué trámite escolar iniciar."],
    ["problem", "Problema", "Qué dificultad concreta debe ayudar a resolver.", "El usuario describe una situación administrativa confusa."],
    ["goal", "Objetivo", "Qué resultado útil debe producir.", "Identificar trámite probable, área responsable y siguiente paso."],
    ["tasks", "Tareas", "Acciones ordenadas que debe realizar.", "1. Leer el caso. 2. Detectar intención. 3. Pedir datos faltantes. 4. Recomendar."],
    ["info", "Información disponible", "Qué datos, catálogo, reglas o ejemplos puede usar.", "Catálogo simulado de trámites, requisitos generales y áreas responsables."],
    ["rules", "Reglas obligatorias", "Condiciones que siempre debe respetar.", "No inventar requisitos. No recomendar si faltan datos mínimos."],
    ["limits", "Límites", "Qué no puede prometer ni realizar.", "No aprueba trámites, no consulta expedientes y no sustituye a control escolar."],
    ["uncertainty", "Manejo de incertidumbre", "Qué hace si no sabe o hay dos opciones posibles.", "Si el caso es ambiguo, pedir aclaración antes de elegir."],
    ["format", "Formato de respuesta", "Cómo debe ordenar la salida.", "Situación identificada, trámite probable, razón, requisitos generales, área, siguiente paso y aclaración."],
    ["examples", "Ejemplos", "Casos breves que muestran el comportamiento esperado.", "Entrada: Perdí mi credencial. Salida: reposición probable, requisitos generales y área."],
    ["forbidden", "Casos prohibidos", "Respuestas o conductas que deben evitarse.", "No inventar costos, fechas, documentos oficiales ni resoluciones."]
  ];
  const components = ["interfaz", "entrada", "validador", "router", "base de conocimiento", "modelo de lenguaje", "clasificador", "reglas", "memoria", "herramienta", "generador de respuesta", "registro de resultados"];
  const componentInfo = {
    interfaz: ["Dónde interactúa el usuario.", "Inclúyanla si habrá formulario, chat, página, tablero o herramienta visual."],
    entrada: ["Información que recibe el agente.", "Siempre debe existir: texto, archivo, selección, imagen, tabla o datos."],
    validador: ["Revisa si falta información o si hay datos ambiguos.", "Útil cuando el agente no debe recomendar sin datos mínimos."],
    router: ["Decide a qué ruta mandar el caso.", "Útil si existen tipos de solicitud o caminos diferentes."],
    "base de conocimiento": ["Fuente de información consultable.", "Útil si el agente responde con catálogo, reglas, documentos o criterios."],
    "modelo de lenguaje": ["Interpreta texto y redacta respuestas.", "Útil si se requiere comprender lenguaje natural o explicar con claridad."],
    clasificador: ["Asigna una categoría o intención.", "Útil si el agente decide entre opciones como trámite, prioridad, riesgo o tipo de caso."],
    reglas: ["Condiciones que limitan lo que puede hacer.", "Siempre conviene incluirlas para evitar inventar, prometer o salirse del alcance."],
    memoria: ["Guarda contexto durante la interacción.", "Útil si la respuesta depende de pasos anteriores."],
    herramienta: ["Acción externa o cálculo específico.", "Útil si consulta, calcula, filtra, genera archivo o usa una función concreta."],
    "generador de respuesta": ["Organiza la salida final.", "Siempre debe existir si el usuario recibe explicación, recomendación o reporte."],
    "registro de resultados": ["Guarda pruebas o evidencias.", "Útil para Clase 20 porque permite comparar errores y mejoras."]
  };

  document.addEventListener("DOMContentLoaded", () => {
    initSidebar();
    initFields();
    initChecks();
    renderMission1();
    renderIdeas();
    renderCanvas();
    renderFlow();
    renderComponents();
    renderPromptForm();
    renderTeam();
    bindButtons();
    updateAll();
    initTimer();
  });

  function loadState() {
    const equipo = read(STORE.equipo, {});
    const clase19 = read(STORE.clase19, {});
    return {
      team: { role1: "Líder de problema", role2: "Diseñador del agente", role3: "Constructor del prototipo", role4: "Evaluador y documentalista", ...(equipo.team || {}) },
      mission1: {
        comparisons: {}, cases: {}, opportunities: [blankOpportunity(), blankOpportunity(), blankOpportunity(), blankOpportunity(), blankOpportunity()],
        vagueInput: "", conclusion: "", ready: false, report: "",
        ...(clase19.mission1 || {})
      },
      project: { ...(clase19.project || {}) },
      requirements: { ...(clase19.requirements || {}) },
      ideas: clase19.ideas?.length ? clase19.ideas : [blankIdea(), blankIdea(), blankIdea()],
      problem: { ...(clase19.problem || {}) },
      validation: { ...(clase19.validation || {}) },
      canvas: { ...(clase19.canvas || {}) },
      flow: clase19.flow?.length ? clase19.flow : ["Inicio", "Recepción de solicitud", "Validación", "Clasificación o análisis", "Consulta de información", "Aplicación de reglas", "Decisión o recomendación", "Explicación", "Cierre o seguimiento"].map(blankFlow),
      guidedCase: { ...(clase19.guidedCase || {}) },
      architecture: { components: [], ...(clase19.architecture || {}) },
      prompt: { ...(clase19.prompt || {}) },
      rules: { ...(clase19.rules || {}) },
      prototype: { ...(clase19.prototype || {}) },
      visited: { ...(clase19.visited || {}) }
    };
  }
  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
  }
  function save() {
    localStorage.setItem(STORE.equipo, JSON.stringify({ team: state.team }));
    localStorage.setItem(STORE.clase19, JSON.stringify({
      mission1: state.mission1, project: state.project, requirements: state.requirements, ideas: state.ideas, problem: state.problem, validation: state.validation,
      canvas: state.canvas, flow: state.flow, guidedCase: state.guidedCase, architecture: state.architecture, prompt: state.prompt,
      rules: state.rules, prototype: state.prototype, visited: state.visited, updatedAt: new Date().toISOString()
    }));
    updateAll();
  }
  function getPath(path) {
    return path.split(".").reduce((obj, key) => obj?.[key], state);
  }
  function setPath(path, value) {
    const keys = path.split(".");
    let obj = state;
    keys.slice(0, -1).forEach((key) => { obj[key] ||= {}; obj = obj[key]; });
    obj[keys.at(-1)] = value;
  }

  function initSidebar() {
    const toggle = $("#sidebar-toggle");
    const set = (open) => {
      if (matchMedia("(max-width:1050px)").matches) document.body.classList.toggle("sidebar-open", open);
      else document.body.classList.toggle("sidebar-collapsed", !open);
      toggle?.setAttribute("aria-expanded", String(open));
    };
    let open = !matchMedia("(max-width:1050px)").matches;
    toggle?.addEventListener("click", () => { open = !open; set(open); });
    window.addEventListener("resize", () => set(open));
    set(open);
    const links = $$("nav a");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
          state.visited[entry.target.id] = true;
          save();
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 });
    $$("main section[id]").forEach((s) => io.observe(s));
  }
  function initFields(root = document) {
    $$("[data-field]", root).forEach((el) => {
      el.value = getPath(el.dataset.field) || "";
      el.addEventListener("input", () => { setPath(el.dataset.field, el.value.trim()); save(); });
      el.addEventListener("change", () => { setPath(el.dataset.field, el.value.trim()); save(); });
    });
  }
  function initChecks(root = document) {
    $$("[data-check]", root).forEach((el) => {
      el.checked = Boolean(getPath(el.dataset.check));
      el.addEventListener("change", () => { setPath(el.dataset.check, el.checked); save(); });
    });
  }
  function bindButtons() {
    $("[data-save]")?.addEventListener("click", () => { save(); flash("Avance guardado."); });
    $("[data-export]")?.addEventListener("click", exportProject);
    $("[data-import]")?.addEventListener("change", importProject);
    $("[data-reset]")?.addEventListener("click", resetProject);
    $("#add-idea")?.addEventListener("click", () => { state.ideas.push(blankIdea()); renderIdeas(); save(); });
    $("#mission1-add-opportunity")?.addEventListener("click", () => { state.mission1.opportunities.push(blankOpportunity()); renderMission1Opportunities(); renderMission1Evaluation(); updateMission1Product(); save(); });
    $("#mission1-save")?.addEventListener("click", () => { save(); flash("Evidencia de Misión 1 guardada."); });
    $("#mission1-detect-vague")?.addEventListener("click", detectMission1VagueIdea);
    $("#mission1-generate-evidence")?.addEventListener("click", () => generateMission1Evidence());
    $("#mission1-download-evidence")?.addEventListener("click", () => downloadText("clase19-mision1-evidencia.txt", state.mission1.report || generateMission1Evidence(true)));
    $("#score-ideas")?.addEventListener("click", scoreIdeas);
    $("#validate-statement")?.addEventListener("click", validateStatement);
    $("#add-flow-step")?.addEventListener("click", () => { state.flow.push(blankFlow("Nueva etapa")); renderFlow(); save(); });
    $("#render-flow")?.addEventListener("click", () => { renderFlowPreview(); save(); });
    $("#build-prompt")?.addEventListener("click", buildPrompt);
    $("#detect-vague-rules")?.addEventListener("click", detectVagueRules);
    $("#generate-card")?.addEventListener("click", () => generateClassReport());
    $$("[data-copy]").forEach((b) => b.addEventListener("click", () => copyText($(b.dataset.copy)?.textContent || "")));
    $$("[data-download-report]").forEach((b) => b.addEventListener("click", () => downloadText(b.dataset.downloadReport, $("#class-report")?.textContent || generateClassReport(true))));
  }

  function renderMission1() {
    renderMission1Comparisons();
    renderMission1Cases();
    renderMission1Opportunities();
    renderMission1Evaluation();
    updateMission1Product();
  }
  function renderMission1Comparisons() {
    const box = $("#mission1-comparisons");
    if (!box) return;
    box.innerHTML = mission1Comparisons.map((item, index) => `
      <article class="comparison-card">
        <div class="idea-side"><span class="pill danger">Idea vaga</span><p>${esc(item.vague)}</p></div>
        <details data-mission1-comparison="${index}">
          <summary>Revelar problema concreto</summary>
          <p>${esc(item.problem)}</p>
        </details>
        <details>
          <summary>Revelar función del agente</summary>
          <p>${esc(item.agent)}</p>
        </details>
        <details>
          <summary>Identificar elementos</summary>
          <div class="mini-tags">${item.elements.map((element) => `<span>${esc(element)}</span>`).join("")}</div>
        </details>
        <button type="button" data-mission1-why="${index}" aria-expanded="false">¿Por qué esta propuesta es mejor?</button>
        <p class="status-box" id="mission1-why-${index}" hidden>${esc(item.why)}</p>
      </article>`).join("");
    $$("[data-mission1-why]", box).forEach((button) => {
      button.addEventListener("click", () => {
        const panel = $(`#mission1-why-${button.dataset.mission1Why}`);
        const open = panel.hidden;
        panel.hidden = !open;
        button.setAttribute("aria-expanded", String(open));
        state.mission1.comparisons[button.dataset.mission1Why] = open;
        save();
      });
    });
  }
  function renderMission1Cases() {
    const box = $("#mission1-agent-cases");
    if (!box) return;
    box.innerHTML = mission1Cases.map(([label, text], index) => {
      const current = state.mission1.cases[index] || {};
      return `<article class="agent-case">
        <h4>${label}</h4>
        <p>${esc(text)}</p>
        <fieldset>
          <legend>¿Necesita un agente?</legend>
          ${["sí", "no", "depende"].map((value) => `<label><input type="radio" name="mission1-case-${index}" value="${value}" ${current.answer === value ? "checked" : ""}> ${value}</label>`).join("")}
        </fieldset>
        ${mission1CaseArea(index, "reason", "Justificación breve", current.reason)}
        <div class="toolbar"><button type="button" data-case-feedback="${index}">Ver retroalimentación</button></div>
        <div class="status-box" id="mission1-case-feedback-${index}" aria-live="polite">${current.feedback || "Completen la respuesta y pidan retroalimentación."}</div>
      </article>`;
    }).join("");
    $$("[name^='mission1-case-']", box).forEach((input) => input.addEventListener("change", () => {
      const index = input.name.split("-").pop();
      state.mission1.cases[index] ||= {};
      state.mission1.cases[index].answer = input.value;
      save();
    }));
    $$("[data-mission1-case]", box).forEach((el) => el.addEventListener("input", () => {
      const [index, key] = el.dataset.mission1Case.split(".");
      state.mission1.cases[index] ||= {};
      state.mission1.cases[index][key] = el.value.trim();
      save();
    }));
    $$("[data-case-feedback]", box).forEach((button) => button.addEventListener("click", () => showMission1CaseFeedback(Number(button.dataset.caseFeedback))));
  }
  function mission1CaseArea(index, key, label, value = "") {
    return `<label>${label}<textarea data-mission1-case="${index}.${key}">${esc(value)}</textarea></label>`;
  }
  function showMission1CaseFeedback(index) {
    const expected = mission1Cases[index][2];
    const reason = mission1Cases[index][3];
    const answer = state.mission1.cases[index]?.answer || "sin respuesta";
    const missing = state.mission1.cases[index]?.reason ? [] : ["justificación breve"];
    const tone = answer === expected ? "green" : answer === "depende" || expected === "depende" ? "yellow" : "red";
    const feedback = `<strong>Resultado orientativo:</strong> ${expected}. ${esc(reason)} ${missing.length ? `<br><strong>Falta justificar:</strong> ${missing.join(", ")}.` : "<br>La justificación ya cubre los elementos mínimos."} Recuerden que el contexto puede cambiar la respuesta.`;
    state.mission1.cases[index] ||= {};
    state.mission1.cases[index].feedback = feedback;
    const box = $(`#mission1-case-feedback-${index}`);
    box.className = `status-box ${tone}`;
    box.innerHTML = feedback;
    save();
  }
  function renderMission1Opportunities() {
    const box = $("#mission1-opportunities");
    if (!box) return;
    box.innerHTML = state.mission1.opportunities.map((opportunity, index) => `
      <article class="dynamic-item opportunity-editor">
        <div class="opportunity-head">
          <h4>Oportunidad ${index + 1}</h4>
          <div class="toolbar"><button type="button" data-op-up="${index}">Subir</button><button type="button" data-op-down="${index}">Bajar</button><button type="button" data-op-remove="${index}">Eliminar</button></div>
        </div>
        <div class="form-grid compact-form-grid">
          ${mission1OpportunityField(index, "proposer", "Integrante que propone", opportunity.proposer)}
          ${mission1OpportunityField(index, "context", "Lugar o contexto", opportunity.context)}
          ${mission1OpportunityField(index, "user", "Persona afectada", opportunity.user)}
          ${mission1OpportunityArea(index, "observed", "Problema observable", opportunity.observed)}
          ${mission1OpportunityArea(index, "consequence", "Consecuencia", opportunity.consequence)}
          ${mission1OpportunityArea(index, "agentHelp", "Posible ayuda del agente", opportunity.agentHelp)}
          ${mission1OpportunityArea(index, "limit", "Límite inicial", opportunity.limit)}
        </div>
      </article>`).join("");
    $$("[data-mission1-opportunity]", box).forEach((el) => el.addEventListener("input", () => {
      const [index, key] = el.dataset.mission1Opportunity.split(".");
      state.mission1.opportunities[index][key] = el.value.trim();
      updateMission1Product();
      save();
    }));
    $$("[data-op-up]", box).forEach((button) => button.addEventListener("click", () => moveMission1Opportunity(Number(button.dataset.opUp), -1)));
    $$("[data-op-down]", box).forEach((button) => button.addEventListener("click", () => moveMission1Opportunity(Number(button.dataset.opDown), 1)));
    $$("[data-op-remove]", box).forEach((button) => button.addEventListener("click", () => {
      if (state.mission1.opportunities.length <= 1) return flash("Mantengan al menos una oportunidad.");
      state.mission1.opportunities.splice(Number(button.dataset.opRemove), 1);
      renderMission1();
      save();
    }));
  }
  function mission1OpportunityField(index, key, label, value = "") {
    return `<label>${label}<input data-mission1-opportunity="${index}.${key}" value="${esc(value)}"></label>`;
  }
  function mission1OpportunityArea(index, key, label, value = "") {
    return `<label>${label}<textarea data-mission1-opportunity="${index}.${key}">${esc(value)}</textarea></label>`;
  }
  function moveMission1Opportunity(index, delta) {
    const next = index + delta;
    if (next < 0 || next >= state.mission1.opportunities.length) return;
    [state.mission1.opportunities[index], state.mission1.opportunities[next]] = [state.mission1.opportunities[next], state.mission1.opportunities[index]];
    renderMission1();
    save();
  }
  function renderMission1Evaluation() {
    const box = $("#mission1-evaluation");
    if (!box) return;
    box.innerHTML = state.mission1.opportunities.map((opportunity, index) => {
      const total = mission1Score(opportunity);
      return `<article class="evaluation-card">
        <div>
          <h4>${index + 1}. ${esc(opportunity.observed || "Situación pendiente")}</h4>
          <p><strong>Total:</strong> ${total}/10 · <strong>Nivel:</strong> ${mission1Level(total)}</p>
          <p><strong>Fortalezas:</strong> ${mission1Strengths(opportunity).join(", ") || "pendientes"}</p>
          <p><strong>Por precisar:</strong> ${mission1Gaps(opportunity).join(", ") || "sin aspectos críticos"}</p>
        </div>
        <div class="criteria-grid">
          ${mission1Criteria.map((criterion, scoreIndex) => `<label>${criterion}<select data-mission1-score="${index}.${scoreIndex}"><option value="0" ${Number(opportunity.scores?.[scoreIndex]) === 0 ? "selected" : ""}>0 · no</option><option value="1" ${Number(opportunity.scores?.[scoreIndex]) === 1 ? "selected" : ""}>1 · parcial</option><option value="2" ${Number(opportunity.scores?.[scoreIndex]) === 2 ? "selected" : ""}>2 · claro</option></select></label>`).join("")}
        </div>
        <label class="preselect"><input type="checkbox" data-mission1-selected="${index}" ${opportunity.selected ? "checked" : ""}> Preseleccionar esta oportunidad</label>
      </article>`;
    }).join("");
    $$("[data-mission1-score]", box).forEach((select) => select.addEventListener("change", () => {
      const [index, scoreIndex] = select.dataset.mission1Score.split(".").map(Number);
      state.mission1.opportunities[index].scores[scoreIndex] = Number(select.value);
      renderMission1Evaluation();
      updateMission1Product();
      save();
    }));
    $$("[data-mission1-selected]", box).forEach((input) => input.addEventListener("change", () => {
      const index = Number(input.dataset.mission1Selected);
      const selectedCount = state.mission1.opportunities.filter((item) => item.selected).length;
      if (input.checked && selectedCount >= 3) {
        input.checked = false;
        return flash("Deben preseleccionar exactamente tres oportunidades, no más.");
      }
      state.mission1.opportunities[index].selected = input.checked;
      updateMission1Product();
      save();
    }));
  }
  function mission1Score(opportunity) {
    return mission1Criteria.reduce((total, _, index) => total + Number(opportunity.scores?.[index] || 0), 0);
  }
  function mission1Level(score) {
    if (score >= 8) return "Alta oportunidad";
    if (score >= 5) return "Oportunidad media";
    return "Baja oportunidad";
  }
  function mission1Strengths(opportunity) {
    return mission1Criteria.filter((_, index) => Number(opportunity.scores?.[index]) === 2).slice(0, 4);
  }
  function mission1Gaps(opportunity) {
    return mission1Criteria.filter((_, index) => Number(opportunity.scores?.[index]) === 0).slice(0, 4);
  }
  function detectMission1VagueIdea() {
    const text = ($("#mission1-vague-input")?.value || state.mission1.vagueInput || "").toLowerCase();
    state.mission1.vagueInput = text;
    const vagueWords = ["un chatbot", "una inteligencia artificial", "una app con ia", "un asistente", "ayudar a las personas", "responder preguntas", "hacer todo", "mejorar algo"];
    const found = vagueWords.filter((word) => text.includes(word));
    const missing = [];
    if (!/estudiante|docente|cliente|usuario|persona|equipo|área|area|trabajador|administrativo/.test(text)) missing.push("falta identificar usuario");
    if (!/cuando|al |durante|recibe|necesita|tarda|pierde|confunde|revisa/.test(text)) missing.push("falta definir situación");
    if (!/provoca|causa|genera|pierde|retrasa|satura|incompleta|error/.test(text)) missing.push("falta describir consecuencia");
    if (!/clasificar|recomendar|orientar|detectar|priorizar|decidir|canalizar|explicar/.test(text)) missing.push("falta indicar qué decisión apoya");
    if (!/resultado|lista|siguiente paso|recomendación|recomendacion|reporte|alerta|canalización|canalizacion/.test(text)) missing.push("falta definir resultado");
    if (!/sin |no debe|límite|limite|no inventar|no reemplaza|no diagnostica/.test(text)) missing.push("falta establecer límites");
    const box = $("#mission1-vague-feedback");
    const example = text.includes("chatbot") && text.includes("estudiantes") ? "La propuesta menciona una herramienta y un usuario general, pero no explica qué problema ocurre, en qué situación, qué decisión apoyará ni qué resultado entregará." : "";
    box.className = `status-box ${missing.length ? "yellow" : "green"}`;
    box.innerHTML = `${found.length ? `<strong>Expresiones vagas detectadas:</strong> ${found.join(", ")}.<br>` : ""}${missing.length ? `<strong>Revisen:</strong> ${missing.join("; ")}.` : "La propuesta ya contiene elementos suficientes para analizarse."} ${example}`;
    save();
  }
  function mission1Validation() {
    const opportunities = state.mission1.opportunities || [];
    const complete = opportunities.filter((op) => op.user && op.observed && op.agentHelp);
    const evaluated = opportunities.filter((op) => (op.scores || []).some((score) => Number(score) > 0));
    const selected = opportunities.filter((op) => op.selected);
    const completedCases = mission1Cases.filter((_, index) => {
      const item = state.mission1.cases[index] || {};
      return item.answer && item.reason;
    });
    const issues = [];
    if (completedCases.length < mission1Cases.length) issues.push("analicen los tres casos del Ejercicio 2 con respuesta y justificación breve");
    if (complete.length < 5) issues.push("registren al menos cinco oportunidades con usuario, situación y función del agente");
    if (opportunities.some((op) => !op.user)) issues.push("faltan usuarios");
    if (opportunities.some((op) => !op.agentHelp)) issues.push("faltan funciones del agente");
    if (evaluated.length < complete.length) issues.push("evalúen las oportunidades completas");
    if (selected.length !== 3) issues.push("marquen exactamente tres oportunidades preseleccionadas");
    return { issues, selected, complete, evaluated, completedCases };
  }
  function updateMission1Product() {
    const checkpoint = $("#mission1-checkpoint");
    if (!checkpoint) return;
    const validation = mission1Validation();
    const ready = validation.issues.length === 0;
    state.mission1.ready = ready;
    checkpoint.className = `status-box ${ready ? "green" : validation.complete.length >= 3 ? "yellow" : "red"}`;
    checkpoint.innerHTML = `<strong>${ready ? "✓ Listo" : validation.complete.length >= 3 ? "◐ En proceso" : "○ Incompleto"}:</strong> ${ready ? "la misión produce evidencia suficiente para continuar." : validation.issues.join("; ")}<div class="checklist mission1-status-list">
      ${[
        ["comprendimos qué diferencia un agente de un chatbot", validation.completedCases.length >= mission1Cases.length],
        ["analizamos situaciones que sí y no justifican un agente", validation.completedCases.length >= mission1Cases.length],
        ["hay aportaciones identificadas", state.mission1.opportunities.some((op) => op.proposer)],
        ["registramos al menos cinco oportunidades", validation.complete.length >= 5],
        ["evaluamos cada oportunidad", validation.evaluated.length >= validation.complete.length && validation.complete.length >= 5],
        ["descartamos ideas poco viables", state.mission1.opportunities.some((op) => mission1Score(op) <= 4)],
        ["preseleccionamos tres opciones", validation.selected.length === 3],
        ["guardamos la evidencia", Boolean(state.mission1.report || ready)]
      ].map(([label, ok]) => `<label><input type="checkbox" ${ok ? "checked" : ""} disabled> ${ok ? "✓" : "○"} ${label}</label>`).join("")}
    </div>`;
    renderMission1Summary(validation.selected);
    syncMission1Preselection();
  }
  function renderMission1Summary() {
    const box = $("#mission1-summary");
    if (!box) return;
    const rows = state.mission1.opportunities.map((op, index) => {
      const total = mission1Score(op);
      return `<tr><td data-label="Número">${index + 1}</td><td data-label="Integrante">${esc(op.proposer || "Pendiente")}</td><td data-label="Situación">${esc(op.observed || "Pendiente")}</td><td data-label="Usuario">${esc(op.user || "Pendiente")}</td><td data-label="Problema">${esc(op.consequence || "Pendiente")}</td><td data-label="Función">${esc(op.agentHelp || "Pendiente")}</td><td data-label="Puntuación">${total}/10</td><td data-label="Nivel">${mission1Level(total)}</td><td data-label="Preseleccionada">${op.selected ? "Sí" : "No"}</td></tr>`;
    }).join("");
    box.innerHTML = `<table><thead><tr><th>Número</th><th>Integrante</th><th>Situación</th><th>Usuario</th><th>Problema</th><th>Función del agente</th><th>Puntuación</th><th>Nivel</th><th>Preseleccionada</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
  function syncMission1Preselection() {
    const selected = state.mission1.opportunities.filter((op) => op.selected).slice(0, 3);
    if (selected.length !== 3) return;
    state.ideas = selected.map((op) => ({
      name: op.observed.slice(0, 60) || "Oportunidad preseleccionada",
      user: op.user,
      situation: op.observed,
      cause: op.repeated,
      consequence: op.consequence,
      current: op.current,
      agentFunction: op.agentHelp,
      scores: [1, 1, 1, 1, 1, 1]
    }));
  }
  function generateMission1Evidence(returnOnly = false) {
    updateMission1Product();
    const selected = state.mission1.opportunities.filter((op) => op.selected);
    const report = `EVIDENCIA · MISIÓN 1 · CLASE 19
Equipo: ${state.team.name || "Pendiente"}
Integrantes: ${[1, 2, 3, 4].map((n) => state.team[`member${n}`] || "Pendiente").join(", ")}

Oportunidades registradas:
${state.mission1.opportunities.map((op, index) => `${index + 1}. Integrante: ${op.proposer || "Pendiente"}
   Usuario: ${op.user || "Pendiente"}
   Situación: ${op.observed || "Pendiente"}
   Problema/consecuencia: ${op.consequence || "Pendiente"}
   Función posible del agente: ${op.agentHelp || "Pendiente"}
   Puntuación: ${mission1Score(op)}/10
   Nivel: ${mission1Level(mission1Score(op))}
   Preseleccionada: ${op.selected ? "Sí" : "No"}`).join("\n\n")}

Tres oportunidades preseleccionadas:
${selected.map((op, index) => `${index + 1}. ${op.observed || "Pendiente"} · ${op.user || "usuario pendiente"} · ${op.agentHelp || "función pendiente"}`).join("\n") || "Pendiente"}

Conclusión del equipo:
${state.mission1.opportunities.filter((op) => op.selected).length === 3 ? "El equipo cuenta con tres opciones iniciales para analizar con mayor profundidad." : "Pendiente"}

Cierre:
Ya identificaron situaciones donde un agente podría aportar valor. Aún no han elegido el proyecto definitivo. Sus tres oportunidades preseleccionadas serán analizadas con mayor profundidad en las siguientes misiones.`;
    state.mission1.report = report;
    if (!returnOnly) $("#mission1-report").textContent = report;
    localStorage.setItem(STORE.entrega, JSON.stringify({ ...(read(STORE.entrega, {})), clase19Mision1: report }));
    save();
    return report;
  }

  function renderIdeas() {
    const box = $("#ideas-list");
    if (!box) return;
    box.innerHTML = state.ideas.map((idea, index) => `
      <article class="dynamic-item">
        <h3>Problemática ${index + 1}</h3>
        <div class="form-grid">
          ${field(`ideas.${index}.name`, "Nombre provisional")}
          ${field(`ideas.${index}.user`, "Usuario")}
          ${area(`ideas.${index}.situation`, "Situación")}
          ${area(`ideas.${index}.cause`, "Causa")}
          ${area(`ideas.${index}.consequence`, "Consecuencia")}
          ${area(`ideas.${index}.current`, "Solución actual")}
          ${area(`ideas.${index}.agentFunction`, "Función posible del agente", "wide")}
        </div>
        <div class="matrix-row">
          <strong>Puntaje 1-5</strong>
          ${["claridad", "impacto", "viabilidad", "información", "demo", "IA"].map((label, s) => `<label>${label}<input type="number" min="1" max="5" value="${idea.scores?.[s] || 1}" data-score="${index}.${s}"></label>`).join("")}
          <button type="button" data-remove-idea="${index}">Eliminar</button>
        </div>
      </article>`).join("");
    initFields(box);
    $$("[data-score]", box).forEach((input) => input.addEventListener("input", () => {
      const [i, s] = input.dataset.score.split(".").map(Number);
      state.ideas[i].scores[s] = Math.max(1, Math.min(5, Number(input.value) || 1));
      save();
    }));
    $$("[data-remove-idea]", box).forEach((button) => button.addEventListener("click", () => {
      if (state.ideas.length <= 3) return flash("Mantengan al menos tres problemáticas.");
      state.ideas.splice(Number(button.dataset.removeIdea), 1); renderIdeas(); save();
    }));
  }
  function renderCanvas() {
    const box = $("#canvas-form");
    if (!box) return;
    box.innerHTML = canvasFields.map(([key, title, question, example, error]) => `
      <label>${title}
        <small>${question} Ejemplo: ${example}. Error frecuente: ${error}</small>
        <textarea data-field="canvas.${key}"></textarea>
      </label>`).join("");
    initFields(box);
  }
  function renderFlow() {
    const box = $("#flow-list");
    if (!box) return;
    box.innerHTML = state.flow.map((step, index) => `
      <article class="dynamic-item">
        <h3>Etapa ${index + 1}</h3>
        <div class="form-grid">
          ${field(`flow.${index}.name`, "Nombre")}
          ${area(`flow.${index}.receives`, "Qué recibe")}
          ${area(`flow.${index}.does`, "Qué hace")}
          ${area(`flow.${index}.produces`, "Qué produce")}
          ${area(`flow.${index}.error`, "Posible error")}
          ${area(`flow.${index}.fallback`, "Respuesta ante error")}
        </div>
        <div class="toolbar"><button type="button" data-up="${index}">Subir</button><button type="button" data-down="${index}">Bajar</button><button type="button" data-remove-flow="${index}">Eliminar</button></div>
      </article>`).join("");
    initFields(box);
    $$("[data-up]", box).forEach((b) => b.addEventListener("click", () => moveFlow(Number(b.dataset.up), -1)));
    $$("[data-down]", box).forEach((b) => b.addEventListener("click", () => moveFlow(Number(b.dataset.down), 1)));
    $$("[data-remove-flow]", box).forEach((b) => b.addEventListener("click", () => { state.flow.splice(Number(b.dataset.removeFlow), 1); renderFlow(); save(); }));
    renderFlowPreview();
  }
  function moveFlow(index, delta) {
    const next = index + delta;
    if (next < 0 || next >= state.flow.length) return;
    [state.flow[index], state.flow[next]] = [state.flow[next], state.flow[index]];
    renderFlow(); save();
  }
  function renderFlowPreview() {
    const box = $("#flow-preview");
    if (!box) return;
    box.innerHTML = state.flow.filter((s) => s.name).map((s, i) => `<div class="flow-step"><strong>${i + 1}. ${esc(s.name)}</strong><p>${esc(s.does || "Describe qué hace esta etapa.")}</p></div>`).join("");
  }
  function renderComponents() {
    const box = $("#component-picker");
    if (!box) return;
    box.innerHTML = components.map((name) => {
      const [purpose, use] = componentInfo[name] || ["Componente del agente.", "Inclúyanlo solo si aporta al flujo."];
      return `<label class="card architecture-component">
        <input type="checkbox" data-component="${esc(name)}">
        <strong>${esc(name)}</strong>
        <span>${esc(purpose)}</span>
        <small>${esc(use)}</small>
      </label>`;
    }).join("");
    $$("[data-component]", box).forEach((input) => {
      input.checked = state.architecture.components.includes(input.dataset.component);
      input.addEventListener("change", () => {
        const value = input.dataset.component;
        state.architecture.components = input.checked ? [...new Set([...state.architecture.components, value])] : state.architecture.components.filter((x) => x !== value);
        renderArchitecture(); save();
      });
    });
    renderArchitecture();
  }
  function renderArchitecture() {
    const box = $("#architecture-diagram");
    if (!box) return;
    const selected = state.architecture.components || [];
    if (!selected.length) {
      box.innerHTML = `<div class="status-box">Seleccionen componentes para generar el diagrama. Empiecen por entrada, validador, clasificador o reglas según su flujo.</div>`;
      return;
    }
    box.innerHTML = selected.map((c, i) => {
      const [purpose] = componentInfo[c] || ["Componente del agente."];
      const receives = i === 0 ? "Recibe el primer dato del usuario o del sistema." : `Recibe la salida de “${selected[i - 1]}”.`;
      const produces = i === selected.length - 1 ? "Entrega una salida revisable para el usuario o para la evidencia." : `Entrega información a “${selected[i + 1]}”.`;
      return `<div class="diagram-node architecture-node">
        <span>${i + 1}</span>
        <strong>${esc(c)}</strong>
        <p>${esc(purpose)}</p>
        <small>${esc(receives)} ${esc(produces)}</small>
      </div>`;
    }).join("");
  }
  function renderPromptForm() {
    const box = $("#prompt-form");
    if (!box) return;
    box.innerHTML = promptFields.map(([key, label, help, example]) => `<label>${label}<small>${help} Ejemplo: ${example}</small><textarea data-field="prompt.${key}" placeholder="${esc(example)}"></textarea></label>`).join("");
    initFields(box);
  }
  function renderTeam() {
    const box = $("#team-summary");
    if (!box) return;
    box.innerHTML = [1, 2, 3, 4].map((n) => `<article class="card"><h3>${esc(state.team[`member${n}`] || `Integrante ${n}`)}</h3><p>${esc(state.team[`role${n}`] || "Rol pendiente")}</p><p>${esc(state.team[`contribution${n}`] || "Aportación pendiente.")}</p></article>`).join("");
  }

  function scoreIdeas() {
    const ranked = state.ideas.map((idea, index) => {
      const scores = (idea.scores || []).map((score) => Number(score || 0));
      return { index, name: idea.name || `Problemática ${index + 1}`, total: scores.reduce((a, b) => a + b, 0), scores };
    }).sort((a, b) => b.total - a.total);
    const totals = ranked.map((item) => item.total);
    const sameTotals = totals.length > 1 && new Set(totals).size === 1;
    const flatIdeas = ranked.filter((item) => new Set(item.scores).size === 1);
    const warnings = [];
    if (sameTotals) warnings.push("Todas las problemáticas tienen el mismo total. El ranking no distingue cuál conviene analizar primero.");
    if (flatIdeas.length) warnings.push(`Revisen calificaciones planas en: ${flatIdeas.map((item) => item.name).join(", ")}. Si todo es 3 o todo es 5, probablemente no evaluaron criterio por criterio.`);
    const tieBreakers = sameTotals || flatIdeas.length ? `<div class="status-box yellow"><strong>¿Qué hacer si todo queda igual?</strong><br>1. Elijan la opción con usuario más específico.<br>2. Suban la que tenga problema más repetitivo y observable.<br>3. Bajen la que dependa de datos que no tienen.<br>4. Bajen la que no pueda demostrarse con dos casos.<br>5. Si no requiere interpretar, clasificar o recomendar, no necesita agente.</div>` : "";
    $("#ideas-score").innerHTML = `<strong>Resultado orientativo:</strong><br>${ranked.map((r) => `${esc(r.name)}: ${r.total}/30`).join("<br>")}<p>El puntaje no decide por ustedes. Úsenlo para conversar sobre claridad, impacto y viabilidad.</p>${warnings.length ? `<div class="status-box yellow"><strong>Alerta de evaluación:</strong><br>${warnings.join("<br>")}</div>${tieBreakers}` : `<div class="status-box green"><strong>Lectura útil:</strong> hay diferencias suficientes para conversar cuál oportunidad conviene llevar a validación.</div>`}`;
  }
  function validateStatement() {
    const text = (state.problem.statement || "").toLowerCase();
    const checks = [
      ["usuario", /estudiante|cliente|usuario|persona|equipo|docente|visitante|paciente|comerciante|administrador/.test(text)],
      ["problema", /dificultad|problema|no puede|tarda|confunde|pierde|falta/.test(text)],
      ["contexto", /cuando|en |durante|al /.test(text)],
      ["consecuencia", /provoca|causa|genera|reduce|aumenta/.test(text)],
      ["función", /agente ayudará|ayudará|clasificar|recomendar|orientar|detectar|explicar/.test(text)],
      ["información", /utilizando|con datos|información|entrada/.test(text)],
      ["límite", /sin |no debe|límite|excepto/.test(text)]
    ];
    const missing = checks.filter(([, ok]) => !ok).map(([name]) => name);
    const box = $("#statement-feedback");
    box.className = `status-box ${missing.length ? missing.length > 3 ? "red" : "yellow" : "green"}`;
    box.innerHTML = missing.length ? `Falta precisión en: <strong>${missing.join(", ")}</strong>. Ejemplo: se identifica al usuario, pero no siempre se explica qué decisión apoyará el agente.` : "Declaración completa: se identifica usuario, problema, contexto, consecuencia, función, información y límite.";
    updateCheckpoint();
  }
  function updateCheckpoint() {
    const required = ["problem.statement", "project.name", "canvas.user", "canvas.problem", "canvas.limits", "architecture.justification"];
    const missing = required.filter((p) => !getPath(p));
    const box = $("#checkpoint-box");
    if (!box) return;
    if (missing.length > 3) { box.className = "status-box red"; box.innerHTML = "<strong>Rojo:</strong> incompleto. Faltan elementos esenciales."; }
    else if (missing.length) { box.className = "status-box yellow"; box.innerHTML = `<strong>Amarillo:</strong> requiere precisión. Falta: ${missing.join(", ")}.`; }
    else { box.className = "status-box green"; box.innerHTML = "<strong>Verde:</strong> listo para diseñar y construir."; }
  }
  function buildPrompt() {
    const parts = promptFields.map(([key, label]) => `## ${label}\n${state.prompt[key] || "[pendiente]"}`).join("\n\n");
    $("#prompt-output").textContent = parts;
    copyText(parts, false);
    save();
  }
  function detectVagueRules() {
    const text = Object.values(state.rules).join("\n").toLowerCase();
    const vague = ["responder bien", "ayudar", "ser claro", "hacerlo fácil"].filter((x) => text.includes(x));
    const countRules = (state.rules.required || "").split("\n").filter((x) => x.trim()).length;
    const issues = [];
    if (countRules < 5) issues.push("faltan cinco reglas obligatorias");
    if (vague.length) issues.push(`hay reglas vagas: ${vague.join(", ")}`);
    $("#rules-feedback").innerHTML = issues.length ? `Revisen: <strong>${issues.join("; ")}</strong>. Cambien ideas generales por condiciones observables.` : "Reglas suficientemente concretas para probar.";
  }
  function generateClassReport(returnOnly = false) {
    const report = `FICHA DEL PROYECTO · CLASE 19
Equipo: ${state.team.name || "Pendiente"}
Integrantes: ${[1, 2, 3, 4].map((n) => `${state.team[`member${n}`] || "Pendiente"} (${state.team[`role${n}`] || "rol"})`).join(", ")}

Proyecto: ${state.project.name || "Pendiente"}
Problemática: ${state.problem.statement || state.problem.title || "Pendiente"}
Usuario: ${state.canvas.user || "Pendiente"}
Objetivo: ${state.canvas.goal || "Pendiente"}

Misión 1 · Oportunidades preseleccionadas:
${state.mission1.opportunities.filter((op) => op.selected).map((op, i) => `${i + 1}. ${op.observed || "Pendiente"} · Usuario: ${op.user || "Pendiente"} · Función: ${op.agentHelp || "Pendiente"} · ${mission1Score(op)}/10`).join("\n") || "Pendiente"}

Canvas:
${canvasFields.map(([key, label]) => `- ${label}: ${state.canvas[key] || "Pendiente"}`).join("\n")}

Arquitectura:
Componentes: ${(state.architecture.components || []).join(", ") || "Pendiente"}
Justificación: ${state.architecture.justification || "Pendiente"}

Flujo:
${state.flow.map((s, i) => `${i + 1}. ${s.name}: recibe ${s.receives || "pendiente"}; produce ${s.produces || "pendiente"}.`).join("\n")}

Prompt:
${$("#prompt-output")?.textContent || "Pendiente"}

Reglas:
${state.rules.required || "Pendiente"}

Primer prototipo:
Ruta: ${state.prototype.route || "Pendiente"}
Evidencia: ${state.prototype.evidence || "Pendiente"}
Caso procesado: ${state.prototype.demoInput || "Pendiente"}
Salida: ${state.prototype.demoOutput || "Pendiente"}

Pendientes para Clase 20:
- Completar MVP.
- Diseñar ocho pruebas.
- Ejecutar, documentar y mejorar con evidencia.`;
    if (!returnOnly) $("#class-report").textContent = report;
    localStorage.setItem(STORE.entrega, JSON.stringify({ ...(read(STORE.entrega, {})), clase19Report: report }));
    save();
    return report;
  }
  function updateClosingChecklist() {
    const items = [
      ["Equipo registrado", state.team.name && state.team.member1 && state.team.member2 && state.team.member3 && state.team.member4],
      ["Roles asignados", state.team.role1 && state.team.role2 && state.team.role3 && state.team.role4],
      ["Problema validado", state.problem.statement],
      ["Canvas mínimo", ["agentName", "user", "problem", "goal", "input", "output", "limits", "success"].every((key) => state.canvas[key])],
      ["Flujo diseñado", state.flow.some((s) => s.name && s.does)],
      ["Prompt", state.prompt.identity && state.prompt.tasks && state.prompt.rules],
      ["Caso procesado", state.prototype.demoInput && state.prototype.demoOutput],
      ["Evidencia", state.prototype.evidence],
      ["Profundización: arquitectura", (state.architecture.components || []).length && state.architecture.justification],
      ["Profundización: reglas avanzadas", (state.rules.required || "").split("\n").filter(Boolean).length >= 5]
    ];
    $("#closing-checklist").innerHTML = items.map(([label, ok]) => `<label><input type="checkbox" ${ok ? "checked" : ""} disabled> ${esc(label)}</label>`).join("");
  }
  function updateProgress() {
    const sections = $$("main section[data-required]");
    const complete = sections.filter((section) => (section.dataset.required || "").split(",").every((p) => Boolean(getPath(p.trim())))).length;
    const pct = Math.round((complete / Math.max(sections.length, 1)) * 100);
    $("#progress-fill").style.width = `${pct}%`;
    $("#progress-label").textContent = `${pct}%`;
    $("#progress-note").textContent = pct >= 100 ? "Clase 19 lista para continuar." : `${complete}/${sections.length} secciones con evidencia esencial.`;
    localStorage.setItem(`${KEY}.avance`, JSON.stringify({ clase19: pct, updatedAt: new Date().toISOString() }));
  }
  function updateTeacherPanel() {
    $("#teacher-panel").innerHTML = `
      <div class="metrics-grid">
        <div><strong>${esc(state.team.name || "Equipo sin nombre")}</strong><p>Equipo</p></div>
        <div><strong>${$("#progress-label")?.textContent || "0%"}</strong><p>Avance Clase 19</p></div>
        <div><strong>${state.project.name ? "Definido" : "Pendiente"}</strong><p>Proyecto</p></div>
        <div><strong>${state.prototype.evidence ? "Con evidencia" : "Sin evidencia"}</strong><p>Prototipo</p></div>
      </div>`;
  }
  function updateAll() {
    renderTeam();
    renderArchitecture();
    renderFlowPreview();
    updateMission1Product();
    updateCheckpoint();
    updateClosingChecklist();
    updateProgress();
    updateTeacherPanel();
  }
  function exportProject() {
    save();
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      equipo: read(STORE.equipo, {}),
      clase19: read(STORE.clase19, {}),
      clase20: read(STORE.clase20, {}),
      clase21: read(STORE.clase21, {}),
      entrega: read(STORE.entrega, {})
    };
    downloadText(`proyecto-final-ia-${Date.now()}.json`, JSON.stringify(payload, null, 2));
  }
  function importProject(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.equipo) localStorage.setItem(STORE.equipo, JSON.stringify(data.equipo));
        if (data.clase19) localStorage.setItem(STORE.clase19, JSON.stringify(data.clase19));
        if (data.clase20) localStorage.setItem(STORE.clase20, JSON.stringify(data.clase20));
        if (data.clase21) localStorage.setItem(STORE.clase21, JSON.stringify(data.clase21));
        if (data.entrega) localStorage.setItem(STORE.entrega, JSON.stringify(data.entrega));
        location.reload();
      } catch { flash("No se pudo importar el JSON."); }
    };
    reader.readAsText(file);
  }
  function resetProject() {
    if (!confirm("¿Reiniciar todo el proyecto final en este navegador? Esta acción no se puede deshacer.")) return;
    Object.values(STORE).forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem(`${KEY}.avance`);
    location.reload();
  }
  function initTimer() {
    const box = $("[data-timer]");
    if (!box) return;
    let seconds = Number(box.dataset.timer) * 60;
    let id = null;
    const render = () => {
      const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
      const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
      const s = Math.floor(seconds % 60).toString().padStart(2, "0");
      $("[data-timer-display]", box).textContent = `${h}:${m}:${s}`;
    };
    $("[data-timer-start]", box)?.addEventListener("click", () => { if (!id) id = setInterval(() => { seconds = Math.max(0, seconds - 1); render(); }, 1000); });
    $("[data-timer-pause]", box)?.addEventListener("click", () => { clearInterval(id); id = null; });
    $("[data-timer-reset]", box)?.addEventListener("click", () => { clearInterval(id); id = null; seconds = Number(box.dataset.timer) * 60; render(); });
    render();
  }
  function field(path, label, wide = "") { return `<label class="${wide}">${label}<input data-field="${path}"></label>`; }
  function area(path, label, wide = "") { return `<label class="${wide}">${label}<textarea data-field="${path}"></textarea></label>`; }
  function copyText(text, notify = true) {
    navigator.clipboard?.writeText(text);
    if (notify) flash("Copiado.");
  }
  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
  function flash(message) {
    const note = $("#progress-note");
    if (note) note.textContent = message;
  }
})();

(() => {
  "use strict";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  document.addEventListener("DOMContentLoaded", () => {
    initSidebar();
    initReadingProgress();
    initActiveNav();
    initDataTypeSelector();
    initDenseNetwork();
    initCnnLab();
    initCnnJourney();
    initMixer();
    initStrategyLab();
    initColabStrategyLab();
    initHybridAgentBuilder();
    initSimulator();
    initArchitectureForm();
    initCodeGenerator();
    initTestCases();
    initReportForm();
  });

  // ---------- Sidebar ----------
  function initSidebar() {
    const toggle = $("#sidebar-toggle");
    const overlay = $("#sidebar-overlay");
    if (!toggle) return;
    const isNarrow = () => window.matchMedia("(max-width:1050px)").matches;
    const setState = (open) => {
      if (isNarrow()) {
        document.body.classList.toggle("sidebar-open", open);
        document.body.classList.remove("sidebar-collapsed");
      } else {
        document.body.classList.toggle("sidebar-collapsed", !open);
        document.body.classList.remove("sidebar-open");
      }
      toggle.setAttribute("aria-expanded", String(open));
    };
    let open = !isNarrow();
    setState(open);
    toggle.addEventListener("click", () => { open = !open; setState(open); });
    overlay?.addEventListener("click", () => { open = false; setState(open); });
    window.addEventListener("resize", () => setState(open));
  }

  // ---------- Reading progress ----------
  function initReadingProgress() {
    const fill = $("#reading-progress-fill");
    const label = $("#reading-progress-label");
    const note = $("#reading-progress-note");
    if (!fill || !label) return;
    const notes = [
      [0, "Recorre la clase para completar tu progreso."],
      [10, "Fase 1 · Fundamentos del agente híbrido."],
      [25, "Fase 2 · Redes neuronales."],
      [40, "Fase 3 · Combinar modelos y reglas."],
      [55, "Fase 4 · Arquitectura completa."],
      [70, "Fase 5 · Simulador."],
      [80, "Fase 6 · Tu propio agente."],
      [95, "Fase 7 · Cierre e integración."]
    ];
    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((scrollTop / max) * 100))) : 0;
      fill.style.width = `${pct}%`;
      label.textContent = `${pct}%`;
      if (note) {
        const current = notes.filter(([threshold]) => pct >= threshold).pop();
        if (current) note.textContent = current[1];
      }
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  // ---------- Active nav highlight ----------
  function initActiveNav() {
    const links = $$(".lesson-sidebar nav a[href^='#']");
    if (!links.length) return;
    const sections = links
      .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
      .filter(Boolean);
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = links.find((a) => a.getAttribute("href") === `#${entry.target.id}`);
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach((a) => a.classList.remove("active"));
            link.classList.add("active");
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
  }

  // ---------- Misión 2: selector de tipos de datos ----------
  function initDataTypeSelector() {
    const select = $("#data-type-select");
    const panels = $$(".data-panel");
    const caption = $("#data-type-caption");
    if (!select || !panels.length) return;
    const captions = {
      tabular: "Datos tabulares: números en filas y columnas, lo que procesa la red densa.",
      texto: "Texto libre: lo que escribe el cliente, lo procesa un clasificador de texto.",
      serie: "Serie temporal: valores a lo largo del tiempo, útil para detectar tendencias.",
      imagen: "Imagen: la foto del daño, la procesa la CNN pixel por pixel."
    };
    const update = () => {
      const val = select.value;
      panels.forEach((p) => {
        const match = p.dataset.type === val;
        p.classList.toggle("is-active", match);
        p.classList.toggle("is-muted", !match);
      });
      if (caption) caption.textContent = captions[val] || "";
    };
    select.addEventListener("change", update);
    update();
  }

  // ---------- Misión 3: red densa SVG ----------
  function initDenseNetwork() {
    const svg = $("#dense-network-svg");
    if (!svg) return;
    const inputsG = $("#dense-input-nodes", svg);
    const hiddenG = $("#dense-hidden-nodes", svg);
    const linesIn = $("#dense-lines-in", svg);
    const linesOut = $("#dense-lines-out", svg);
    const inputs = [
      { label: "edad", y: 60 },
      { label: "presup.", y: 160 },
      { label: "reclamos", y: 260 },
      { label: "antig.", y: 360 }
    ];
    const hiddens = [30, 130, 210, 290, 380];
    const NS = "http://www.w3.org/2000/svg";
    const mk = (tag, attrs) => {
      const el = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      return el;
    };
    inputs.forEach((inp, i) => {
      // "presup." (i=1) y "reclamos" (i=2) son las entradas que la red aprendió a pesar más fuerte
      const isKeyInput = i === 1 || i === 2;
      const g = mk("g", { class: isKeyInput ? "input-layer key-node" : "input-layer" });
      g.appendChild(mk("circle", { cx: 80, cy: inp.y, r: 34 }));
      const t = mk("text", { x: 80, y: inp.y + 5 });
      t.textContent = inp.label;
      g.appendChild(t);
      inputsG.appendChild(g);
      hiddens.forEach((hy, hIdx) => {
        const strong = isKeyInput && hIdx % 2 === 0;
        linesIn.appendChild(mk("line", { x1: 114, y1: inp.y, x2: 446, y2: hy, class: strong ? "strong" : "" }));
      });
    });
    hiddens.forEach((hy, idx) => {
      const isKeyHidden = idx % 2 === 0;
      const baseClass = idx % 2 === 0 ? "hidden-one" : "hidden-two";
      const g = mk("g", { class: isKeyHidden ? `${baseClass} key-node` : baseClass });
      g.appendChild(mk("circle", { cx: 480, cy: hy, r: 30 }));
      const t = mk("text", { x: 480, y: hy + 5 });
      t.textContent = "h" + (idx + 1);
      g.appendChild(t);
      hiddenG.appendChild(g);
      linesOut.appendChild(mk("line", { x1: 510, y1: hy, x2: 845, y2: 210, class: isKeyHidden ? "strong" : "" }));
    });

    const propagateBtn = $("#dense-propagate");
    const resetBtn = $("#dense-reset");
    propagateBtn?.addEventListener("click", () => {
      svg.classList.remove("is-propagating");
      void svg.getBoundingClientRect();
      svg.classList.add("is-propagating");
      setTimeout(() => svg.classList.remove("is-propagating"), 2500);
    });
    resetBtn?.addEventListener("click", () => svg.classList.remove("is-propagating"));
  }

  // ---------- Misión 4: CNN lab ----------
  const CNN_FILTERS = {
    vertical: { img: "cnn-vertical.webp", text: "El filtro de bordes verticales resalta el contorno de la puerta y el parachoques." },
    horizontal: { img: "cnn-horizontal.webp", text: "El filtro de bordes horizontales resalta la línea del cofre y la defensa." },
    texture: { img: "cnn-texture.webp", text: "El filtro de textura resalta cambios bruscos: rayones y abolladuras." },
    contour: { img: "cnn-contour.webp", text: "El contorno combinado junta bordes verticales y horizontales en un solo mapa." }
  };
  const REAL_PIXELS = [
    [141, 147, 157], [137, 155, 175], [77, 97, 131],
    [96, 98, 105], [67, 80, 101], [36, 48, 65],
    [124, 117, 111], [81, 81, 80], [72, 69, 65]
  ];
  function initCnnLab() {
    const matrix = $("#cnn-pixel-matrix");
    if (matrix) {
      matrix.innerHTML = REAL_PIXELS.map(([r, g, b]) => `<span style="background:rgba(${r},${g},${b},.5)">${r},${g},${b}</span>`).join("");
    }
    const buttons = $$("#cnn-filter-buttons button");
    const featureImg = $("#feature-map-image");
    const resultText = $("#filter-result");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("primary"));
        btn.classList.add("primary");
        const conf = CNN_FILTERS[btn.dataset.filter];
        if (!conf) return;
        if (featureImg) featureImg.src = `./assets/${conf.img}`;
        if (resultText) resultText.textContent = conf.text;
      });
    });
  }

  // ---------- Misión 5: CNN journey ----------
  function initCnnJourney() {
    const journey = $("#cnn-journey");
    if (!journey) return;
    const stages = $$(".cnn-stage", journey);
    const progress = $("#cnn-progress");
    stages.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = String(i + 1);
      b.dataset.stage = String(i);
      progress.appendChild(b);
    });
    const progressButtons = $$("button", progress);
    let current = 0;
    const render = () => {
      stages.forEach((s, i) => s.classList.toggle("is-active", i === current));
      progressButtons.forEach((b, i) => {
        b.classList.toggle("is-active", i === current);
        b.classList.toggle("is-complete", i < current);
      });
    };
    progressButtons.forEach((b) => b.addEventListener("click", () => { current = Number(b.dataset.stage); journey.classList.remove("show-all"); render(); }));
    $("#cnn-prev")?.addEventListener("click", () => { current = Math.max(0, current - 1); journey.classList.remove("show-all"); render(); });
    $("#cnn-next")?.addEventListener("click", () => { current = Math.min(stages.length - 1, current + 1); journey.classList.remove("show-all"); render(); });
    $("#cnn-show-all")?.addEventListener("click", () => { journey.classList.toggle("show-all"); });
    render();
  }

  // ---------- Misión 7: mezclador ponderado ----------
  function initMixer() {
    const ids = ["tabular", "texto", "cnn"];
    const sliders = ids.map((id) => $(`#mix-${id}`));
    const weights = ids.map((id) => $(`#mix-${id}-w`));
    const valLabels = ids.map((id) => $(`#mix-${id}-val`));
    const output = $("#mixer-result");
    if (!output || sliders.some((s) => !s)) return;
    const update = () => {
      let num = 0, den = 0;
      ids.forEach((_, i) => {
        const v = parseFloat(sliders[i].value);
        const w = parseFloat(weights[i].value);
        if (valLabels[i]) valLabels[i].textContent = v.toFixed(2);
        num += v * w;
        den += w;
      });
      output.textContent = den > 0 ? (num / den).toFixed(2) : "0.00";
    };
    [...sliders, ...weights].forEach((el) => el.addEventListener("input", update));
    update();
  }

  // ---------- Misión 7: laboratorio de estrategias ----------
  const STRATEGY_DATA = [
    {
      id: "weighted",
      name: "Weighted Voting",
      tag: "Cuando algunos modelos pesan más",
      problem: "Algunos modelos son mucho más confiables que otros para el caso actual. Si todos pesan igual, una señal débil puede arrastrar la decisión.",
      use: ["Tienes pocos modelos", "Cada modelo entrega porcentaje o puntaje comparable", "Conoces la precisión histórica de cada modelo", "Necesitas una explicación numérica simple"],
      avoid: ["Los modelos entregan clases que no se pueden convertir a puntajes", "No sabes qué peso asignar", "Un error crítico debe bloquear la decisión antes de promediar"],
      example: {
        title: "Recomendador de bebidas",
        lines: ["Modelo sabor: 82% porque el cliente pidió dulce", "Modelo horario: 74% porque es tarde y baja la cafeína", "Modelo historial: 90% porque compra frappé seguido", "Pesos: sabor 0.3, horario 0.2, historial 0.5"],
        result: "Resultado = (82x0.3 + 74x0.2 + 90x0.5) / 1.0 = 84.4%. Se recomienda frappé porque el historial pesa más y no contradice a los demás."
      },
      steps: [
        ["Definir modelos", "Tengo tres especialistas: sabor, horario e historial.", ["Sabor", "Horario", "Historial", "Cliente"], "Sé qué señal aporta cada modelo."],
        ["Obtener predicciones", "Cada modelo entrega un porcentaje de confianza para recomendar frappé.", ["82%", "74%", "90%", "frappé"], "Ahora las salidas son comparables."],
        ["Asignar pesos", "Doy más peso al modelo históricamente más confiable para compras repetidas.", ["0.3", "0.2", "0.5", "suma 1.0"], "El historial tendrá más influencia."],
        ["Multiplicar", "Cada predicción se multiplica por su peso.", ["24.6", "14.8", "45.0", "parciales"], "El peso convierte confianza en aporte."],
        ["Sumar", "Sumo los aportes: 24.6 + 14.8 + 45.0.", ["24.6", "+14.8", "+45.0", "84.4"], "Obtengo el puntaje final."],
        ["Explicar", "La recomendación gana porque todos apoyan la bebida y el historial empuja con fuerza.", ["84.4%", "frappé", "historial", "explicación"], "El alumno puede justificar pesos y resultado."]
      ]
    },
    {
      id: "voting",
      name: "Voting",
      tag: "Cuando importan los acuerdos",
      problem: "No todos los modelos están de acuerdo, pero cada uno puede votar una clase clara. La pregunta es qué decisión gana por mayoría.",
      use: ["Modelos muy distintos", "Clasificación con etiquetas claras", "Pocos o muchos modelos con voto comparable", "Alta incertidumbre individual pero consenso colectivo"],
      avoid: ["Un modelo es claramente superior y no quieres que valga igual", "Necesitas probabilidades finas", "Las clases de los modelos no significan lo mismo"],
      example: {
        title: "Filtro de reportes urgentes",
        lines: ["Modelo texto vota urgente por palabras como 'no puede circular'", "Modelo tabular vota normal porque el presupuesto no es alto", "Modelo historial vota urgente porque el cliente tuvo reclamos recientes"],
        result: "Urgente gana 2 a 1. No porque cada modelo sea perfecto, sino porque dos señales independientes apuntan a la misma clase."
      },
      steps: [
        ["Definir la clase", "La salida posible es normal o urgente.", ["normal", "urgente", "clases", "regla"], "Todos votan en el mismo idioma."],
        ["Recolectar votos", "Cada modelo elige una clase final.", ["urgente", "normal", "urgente", "3 votos"], "Tengo una urna de decisiones."],
        ["Contar mayoría", "Cuento cuántos votos recibió cada clase.", ["urgente 2", "normal 1", "mayoría", "2/3"], "Urgente queda arriba."],
        ["Resolver empates", "Si hubiera empate, uso confianza o pido revisión humana.", ["empate", "confianza", "humano", "fallback"], "La estrategia no queda ambigua."],
        ["Emitir decisión", "Selecciono la clase con más votos.", ["urgente", "gana", "2 votos", "salida"], "La salida es robusta y fácil de explicar."],
        ["Explicar descartes", "Normal se descarta porque solo un modelo lo defendió.", ["por qué sí", "por qué no", "riesgo", "claridad"], "El alumno explica la decisión y lo descartado."]
      ]
    },
    {
      id: "bagging",
      name: "Bagging",
      tag: "Cuando un modelo es inestable",
      problem: "Un solo modelo cambia demasiado si los datos de entrenamiento cambian un poco. Bagging reduce esa variación entrenando varios modelos parecidos sobre muestras distintas.",
      use: ["Datos ruidosos", "Modelos parecidos pero inestables", "Clasificación o regresión", "Tablas con suficientes ejemplos"],
      avoid: ["Tienes muy pocos datos", "Necesitas máxima interpretabilidad de un solo modelo", "El problema requiere modelos especialistas muy diferentes"],
      example: {
        title: "Predicción de abandono de alumnos",
        lines: ["Muestra A predice 61% de abandono", "Muestra B predice 55%", "Muestra C predice 64%", "Muestra D predice 58%"],
        result: "Promedio = 59.5%. En vez de creerle a una sola muestra, el sistema suaviza la inestabilidad de los datos."
      },
      steps: [
        ["Crear muestras", "Tomo varias muestras del dataset con reemplazo.", ["A", "B", "C", "D"], "Cada muestra ve una versión distinta del problema."],
        ["Entrenar copias", "Entreno el mismo tipo de modelo en cada muestra.", ["árbol A", "árbol B", "árbol C", "árbol D"], "Obtengo modelos parecidos pero no idénticos."],
        ["Predecir", "Cada copia predice el mismo caso.", ["61%", "55%", "64%", "58%"], "Veo la variación real."],
        ["Combinar", "Promedio si es regresión o voto si es clasificación.", ["sumar", "dividir", "votar", "combinar"], "La decisión se estabiliza."],
        ["Medir variación", "Si las copias difieren mucho, reporto incertidumbre.", ["alto ruido", "rango 55-64", "alerta", "revisión"], "No oculto el ruido."],
        ["Explicar", "La decisión no depende de una sola partición de datos.", ["estable", "menos varianza", "más costo", "razón"], "El alumno sabe por qué Bagging ayuda."]
      ]
    },
    {
      id: "boosting",
      name: "Boosting",
      tag: "Cuando quieres corregir errores",
      problem: "El primer modelo se equivoca en ciertos casos. Boosting entrena modelos secuenciales que ponen más atención en los errores anteriores.",
      use: ["Necesitas alta precisión", "Los errores tienen patrones corregibles", "Datos tabulares con señales débiles", "Puedes pagar más cuidado de validación"],
      avoid: ["Hay demasiado ruido o etiquetas dudosas", "Necesitas entrenar muy rápido", "El modelo empieza a memorizar errores raros"],
      example: {
        title: "Detección de fraude en reclamos",
        lines: ["Modelo 1 acierta casos simples pero falla reclamos con texto ambiguo", "Modelo 2 se enfoca en esos errores", "Modelo 3 corrige casos con presupuesto atípico"],
        result: "La decisión final mejora porque cada ronda aprende de los fallos anteriores, pero requiere vigilar sobreajuste."
      },
      steps: [
        ["Entrenar base", "Entreno un modelo inicial simple.", ["modelo 1", "casos", "errores", "base"], "Obtengo una primera lista de fallos."],
        ["Marcar errores", "Identifico los ejemplos mal clasificados.", ["error A", "error B", "correctos", "pesos"], "Los errores se vuelven más importantes."],
        ["Entrenar siguiente", "El siguiente modelo se concentra en esos casos difíciles.", ["modelo 2", "más peso", "difíciles", "corrección"], "Empieza a corregir sesgos."],
        ["Repetir", "Cada ronda agrega un corrector nuevo.", ["M1", "M2", "M3", "secuencia"], "El sistema aprende de forma acumulativa."],
        ["Combinar rondas", "La salida final suma los aportes de cada modelo secuencial.", ["aporte 1", "aporte 2", "aporte 3", "final"], "La predicción mejora si los errores eran aprendibles."],
        ["Controlar riesgo", "Valido con datos no vistos para detectar sobreajuste.", ["validación", "ruido", "alto costo", "freno"], "El alumno sabe cuándo detenerse."]
      ]
    },
    {
      id: "stacking",
      name: "Stacking",
      tag: "Cuando tienes especialistas",
      problem: "Cada modelo mira una parte distinta del caso: imagen, texto, tabla o reglas. Stacking aprende cómo combinar esas salidas con un modelo final.",
      use: ["Modelos especialistas", "Imagen + texto + datos tabulares", "Modelos con fortalezas distintas", "Quieres aprender la combinación desde datos históricos"],
      avoid: ["Tienes pocos ejemplos para entrenar el combinador", "Los modelos base no agregan información nueva", "Necesitas una explicación extremadamente simple"],
      example: {
        title: "Agente híbrido de seguros",
        lines: ["CNN detecta daño moderado: 0.81", "Texto detecta tono normal: 0.40", "Tabular detecta riesgo bajo: 0.23", "Combinador aprende que imagen pesa más cuando hay foto clara"],
        result: "El meta-modelo recomienda revisión humana porque la imagen contradice la calma del texto. Stacking aprende esa regla desde casos anteriores."
      },
      steps: [
        ["Preparar especialistas", "Cada modelo resuelve una vista distinta del caso.", ["CNN", "Texto", "Tabular", "Reglas"], "No compiten: se complementan."],
        ["Generar salidas", "Guardo las predicciones de cada especialista.", ["0.81", "0.40", "0.23", "ok"], "Creo una nueva tabla de predicciones."],
        ["Entrenar combinador", "Un meta-modelo aprende qué salida creer según el contexto.", ["meta", "histórico", "pesos", "patrones"], "La combinación se aprende, no se inventa."],
        ["Evaluar conflicto", "El combinador detecta contradicciones entre fuentes.", ["imagen alta", "texto bajo", "conflicto", "alerta"], "Puede decidir revisión humana."],
        ["Emitir decisión", "La salida usa la predicción del meta-modelo.", ["revisar", "confianza", "fuentes", "salida"], "La decisión aprovecha especialistas."],
        ["Explicar", "Reporto qué especialistas influyeron y cuáles se descartaron.", ["CNN pesa", "texto baja", "tabla apoya", "motivo"], "El alumno justifica por qué no era Voting simple."]
      ]
    }
  ];

  const TREE_NODES = {
    start: { q: "¿Tengo un solo modelo?", reason: "Si solo existe un modelo, combinar todavía no aporta nada.", yes: ["single", "No necesitas combinar: mejora, valida o explica ese modelo."], no: "sameTask" },
    sameTask: { q: "¿Todos los modelos hacen exactamente la misma tarea?", reason: "Combinar modelos que predicen cosas incompatibles produce decisiones confusas.", yes: "similar", no: "specialists" },
    similar: { q: "¿Son modelos parecidos entrenados sobre datos ruidosos?", reason: "Si se parecen y son inestables, conviene reducir varianza.", yes: ["bagging", "Usa Bagging: varias copias estabilizan la decisión."], no: "scores" },
    scores: { q: "¿Todos entregan puntajes comparables y algunos son mejores que otros?", reason: "Si tienes probabilidades comparables, los pesos pueden expresar confianza histórica.", yes: ["weighted", "Usa Weighted Voting: das más influencia al modelo más confiable."], no: ["voting", "Usa Voting: si solo tienes clases, decide por mayoría y explica el consenso."] },
    specialists: { q: "¿Cada modelo es especialista en una fuente distinta?", reason: "Imagen, texto y tabla suelen tener fortalezas diferentes; eso pide un combinador que aprenda relaciones.", yes: ["stacking", "Usa Stacking: un meta-modelo aprende cómo mezclar especialistas."], no: "sequential" },
    sequential: { q: "¿Quieres corregir errores secuencialmente?", reason: "Cuando los errores se repiten con patrón, una estrategia por rondas puede concentrarse en ellos.", yes: ["boosting", "Usa Boosting: cada ronda corrige fallos de la anterior."], no: ["voting", "Usa Voting como punto de partida: consenso simple antes de diseñar algo más complejo."] }
  };

  const STRATEGY_SCENARIOS = [
    { title: "Seguro con imagen, texto y tabla", facts: ["Tres fuentes distintas", "CNN es fuerte en fotos", "Texto y tabla aportan contexto"], answer: "stacking", why: "Son especialistas por modalidad. Stacking aprende cuándo creerle más a la imagen, al texto o a la tabla." },
    { title: "Tres clasificadores baratos votan spam/no spam", facts: ["Todos hacen la misma tarea", "Solo entregan clase final", "No hay probabilidades confiables"], answer: "voting", why: "Voting basta porque todos hablan el mismo idioma y la mayoría es fácil de explicar." },
    { title: "Árbol de decisión cambia mucho con pequeños cambios", facts: ["Datos tabulares ruidosos", "Modelo inestable", "Hay suficientes ejemplos"], answer: "bagging", why: "Bagging reduce varianza entrenando copias sobre muestras distintas." },
    { title: "Fraude con errores repetidos en casos difíciles", facts: ["Primera versión falla patrones concretos", "Hay validación disponible", "Se busca alta precisión"], answer: "boosting", why: "Boosting enfoca rondas nuevas en los errores previos, siempre vigilando sobreajuste." },
    { title: "Recomendador de bebidas con precisiones conocidas", facts: ["Tres modelos entregan porcentajes", "Historial es más confiable que horario", "Se requiere explicación numérica"], answer: "weighted", why: "Weighted Voting expresa que algunos modelos merecen más influencia." },
    { title: "Modelos muy parecidos pero etiquetas con ruido", facts: ["Misma tarea", "Mismo tipo de modelo", "Mucho ruido en entrenamiento"], answer: "bagging", why: "Bagging suaviza decisiones que dependen demasiado de una muestra concreta." },
    { title: "Clasificación médica con modelos que contradicen por modalidad", facts: ["Imagen, notas clínicas y laboratorio", "Cada fuente captura riesgos distintos", "Hay historial para aprender combinador"], answer: "stacking", why: "Stacking aprovecha especialistas y aprende cuándo una fuente contradice a otra." },
    { title: "Encuesta con cinco modelos simples y sin pesos confiables", facts: ["Todos predicen satisfacción alta/baja", "No sabes cuál es mejor", "Necesitas decisión transparente"], answer: "voting", why: "Voting evita inventar pesos y permite explicar cuántos modelos apoyaron la clase final." }
  ];

  function initStrategyLab() {
    const lab = $("#strategy-lab");
    if (!lab) return;
    lab.innerHTML = STRATEGY_DATA.map(renderStrategyCard).join("");
    STRATEGY_DATA.forEach((strategy) => initStrategyCard(strategy));
    renderStrategyComparison();
    initStrategyTree();
    initStrategyScenarioSimulator();
  }

  function renderStrategyCard(strategy) {
    return `
      <article class="strategy-card" id="strategy-${strategy.id}" data-strategy="${strategy.id}">
        <header>
          <div><span>${escapeHtml(strategy.tag)}</span><h3>${escapeHtml(strategy.name)}</h3><p>${escapeHtml(strategy.problem)}</p></div>
          <strong class="path-chip">${escapeHtml(strategy.steps.length)} pasos</strong>
        </header>
        <div class="strategy-quick-grid">
          <article><h4>¿Qué problema intenta resolver?</h4><p>${escapeHtml(strategy.problem)}</p><p>Nació para evitar una decisión ingenua cuando las predicciones no deben tratarse todas igual.</p></article>
          <article><h4>¿Cuándo usarla?</h4><ul>${strategy.use.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
          <article><h4>Evítala cuando...</h4><ul>${strategy.avoid.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
        </div>
        <div class="strategy-example-box">
          <h4>Ejemplo completamente desarrollado: ${escapeHtml(strategy.example.title)}</h4>
          ${strategy.example.lines.map((line) => `<div class="strategy-example-line">${escapeHtml(line)}</div>`).join("")}
          <strong>${escapeHtml(strategy.example.result)}</strong>
        </div>
        <div class="strategy-flow">
          <div class="strategy-step-list" aria-label="Pasos de ${escapeHtml(strategy.name)}">
            ${strategy.steps.map((step, index) => `<button type="button" data-step="${index}">${index + 1}. ${escapeHtml(step[0])}</button>`).join("")}
          </div>
          <div class="strategy-step-panel" data-step-panel></div>
        </div>
        <div class="strategy-controls">
          <button type="button" class="secondary" data-action="prev">Anterior</button>
          <button type="button" data-action="next">Siguiente</button>
          <button type="button" class="secondary" data-action="reset">Reiniciar</button>
        </div>
      </article>
    `;
  }

  function initStrategyCard(strategy) {
    const card = $(`#strategy-${strategy.id}`);
    if (!card) return;
    const panel = $("[data-step-panel]", card);
    const buttons = $$("[data-step]", card);
    let current = 0;
    const renderStep = () => {
      buttons.forEach((button, index) => button.classList.toggle("is-active", index === current));
      panel.innerHTML = renderStrategyStep(strategy.steps[current], current);
    };
    buttons.forEach((button) => button.addEventListener("click", () => {
      current = Number(button.dataset.step);
      renderStep();
    }));
    $("[data-action='prev']", card)?.addEventListener("click", () => { current = Math.max(0, current - 1); renderStep(); });
    $("[data-action='next']", card)?.addEventListener("click", () => { current = Math.min(strategy.steps.length - 1, current + 1); renderStep(); });
    $("[data-action='reset']", card)?.addEventListener("click", () => { current = 0; renderStep(); });
    renderStep();
  }

  function renderStrategyStep(step, index) {
    const [title, explanation, visual, result] = step;
    return `
      <article>
        <h4>Paso ${index + 1}: ${escapeHtml(title)}</h4>
        <p>${escapeHtml(explanation)}</p>
        <div class="step-visual">${visual.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
        <p><strong>Ejemplo:</strong> ${escapeHtml(visual.join(" -> "))}</p>
        <p><strong>Resultado obtenido:</strong> ${escapeHtml(result)}</p>
      </article>
    `;
  }

  function renderStrategyComparison() {
    const target = $("#strategy-comparison-table");
    if (!target) return;
    const rows = [
      ["Weighted Voting", "Combinar votos o puntajes según confianza", "Puntajes comparables y pesos conocidos", "Sin pesos confiables o reglas críticas", "Baja", "Bajo", "Alta", "Muy explicable y ajustable", "Puede diluir señales fuertes"],
      ["Voting", "Elegir por mayoría", "Modelos con clases claras", "Un modelo debe pesar mucho más", "Baja", "Bajo", "Alta", "Simple y robusta", "Ignora certeza individual"],
      ["Bagging", "Reducir inestabilidad", "Datos ruidosos y modelos parecidos", "Muy pocos datos o necesidad de modelo único", "Media", "Medio", "Media", "Reduce varianza", "Más costoso que un modelo"],
      ["Boosting", "Corregir errores secuenciales", "Errores con patrón y alta precisión", "Ruido fuerte o etiquetas malas", "Alta", "Medio-alto", "Media-baja", "Muy preciso", "Riesgo de sobreajuste"],
      ["Stacking", "Aprender cómo combinar especialistas", "Imagen + texto + tabla o modelos distintos", "Pocos datos para meta-modelo", "Alta", "Alto", "Media", "Aprovecha fortalezas distintas", "Más difícil de explicar y validar"]
    ];
    target.innerHTML = `
      <table>
        <thead><tr><th>Estrategia</th><th>Objetivo</th><th>Cuándo usar</th><th>Cuándo evitar</th><th>Complejidad</th><th>Costo computacional</th><th>Interpretabilidad</th><th>Ventajas</th><th>Desventajas</th></tr></thead>
        <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    `;
  }

  function initStrategyTree() {
    const tree = $("#strategy-decision-tree");
    if (!tree) return;
    let current = "start";
    const path = [];
    const render = () => {
      const node = TREE_NODES[current];
      if (!node) return;
      tree.innerHTML = `
        <div class="tree-question">
          <strong>${escapeHtml(node.q)}</strong>
          <p>${escapeHtml(node.reason)}</p>
          <div class="tree-options">
            <button type="button" data-answer="yes">Sí</button>
            <button type="button" data-answer="no">No</button>
            <button type="button" data-answer="reset">Reiniciar</button>
          </div>
        </div>
        <div class="tree-path">${path.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
      `;
      $$("[data-answer]", tree).forEach((button) => {
        button.addEventListener("click", () => {
          if (button.dataset.answer === "reset") {
            current = "start";
            path.length = 0;
            render();
            return;
          }
          const answer = button.dataset.answer === "yes" ? "Sí" : "No";
          const next = node[button.dataset.answer];
          if (Array.isArray(next)) {
            path.push(`${node.q} ${answer}. ${next[1]}`);
          } else {
            path.push(`${node.q} ${answer}. ${node.reason}`);
            current = next;
          }
          render();
        });
      });
    };
    render();
  }

  function initStrategyScenarioSimulator() {
    const scenarioSelect = $("#strategy-scenario-select");
    const answerSelect = $("#strategy-answer-select");
    const reasonInput = $("#strategy-reason-input");
    const checkBtn = $("#strategy-check-answer");
    const card = $("#strategy-scenario-card");
    const feedback = $("#strategy-feedback");
    if (!scenarioSelect || !answerSelect || !checkBtn || !card || !feedback) return;
    scenarioSelect.innerHTML = STRATEGY_SCENARIOS.map((scenario, index) => `<option value="${index}">${escapeHtml(scenario.title)}</option>`).join("");
    const renderScenario = () => {
      const scenario = STRATEGY_SCENARIOS[Number(scenarioSelect.value)];
      card.innerHTML = `<h4>${escapeHtml(scenario.title)}</h4><ul>${scenario.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join("")}</ul>`;
      feedback.className = "strategy-feedback";
      feedback.textContent = "Elige una estrategia y presiona Evaluar elección.";
    };
    checkBtn.addEventListener("click", () => {
      const scenario = STRATEGY_SCENARIOS[Number(scenarioSelect.value)];
      const chosen = STRATEGY_DATA.find((strategy) => strategy.id === answerSelect.value);
      const correct = answerSelect.value === scenario.answer;
      const rightName = STRATEGY_DATA.find((strategy) => strategy.id === scenario.answer)?.name || scenario.answer;
      const reason = reasonInput?.value.trim() || "";
      const reasonNote = reason.length > 35
        ? `Tu justificación registrada: "${escapeHtml(reason)}".`
        : "Falta una justificación suficiente: antes de evaluar, explica por qué eliges esa estrategia y cuál descartas.";
      feedback.className = `strategy-feedback ${correct ? "is-good" : "is-bad"}`;
      feedback.innerHTML = correct
        ? `<strong>Buena elección: ${escapeHtml(rightName)}.</strong><p>${escapeHtml(scenario.why)}</p><p>${reasonNote}</p><p>También puedes explicar por qué descartas las demás: no todas usan especialistas, no todas corrigen errores y no todas permiten pesos.</p>`
        : `<strong>Tu elección (${escapeHtml(chosen?.name || "sin estrategia")}) no es la más adecuada.</strong><p>Mejor: ${escapeHtml(rightName)}. ${escapeHtml(scenario.why)}</p><p>${reasonNote}</p><p>La mala elección puede ocultar conflicto entre modelos, inventar pesos o aumentar costo sin resolver el problema real.</p>`;
    });
    scenarioSelect.addEventListener("change", renderScenario);
    renderScenario();
  }

  // ---------- Misión 8: implementación en Google Colab ----------
  const COLAB_STRATEGIES = [
    {
      id: "colab-voting",
      name: "Voting",
      what: "Programaremos una mayoría simple: cada modelo entrega una etiqueta y Python cuenta cuál aparece más veces.",
      variables: [["predicciones", "Lista de votos emitidos por los modelos."], ["conteo", "Diccionario que acumula cuántas veces aparece cada etiqueta."], ["decision", "Etiqueta ganadora después del conteo."]],
      lines: [
        { code: "predicciones = ['aprobar', 'rechazar', 'aprobar']", does: "Guarda los votos de tres modelos.", why: "Colab necesita una estructura simple para recorrer los votos.", produces: "Tres etiquetas listas para contar.", visual: ["aprobar", "rechazar", "aprobar"] },
        { code: "conteo = {}", does: "Crea una caja vacía para acumular votos.", why: "Sin conteo no sabemos qué opción gana.", produces: "Un diccionario vacío.", visual: ["conteo", "{}", "listo"] },
        { code: "for voto in predicciones: conteo[voto] = conteo.get(voto, 0) + 1", does: "Recorre cada voto y suma uno a su etiqueta.", why: "La mayoría se obtiene contando apariciones.", produces: "aprobar: 2, rechazar: 1.", visual: ["aprobar 2", "rechazar 1", "mayoría"] },
        { code: "decision = max(conteo, key=conteo.get)", does: "Busca la etiqueta con más votos.", why: "El ganador es la clase con mayor conteo.", produces: "decision = aprobar.", visual: ["gana", "aprobar", "2 de 3"] }
      ],
      result: "Colab devuelve 'aprobar'. Si cambias un voto por 'rechazar', el alumno puede predecir si cambia la mayoría antes de ejecutar.",
      exercise: "Cambia la segunda predicción a 'aprobar', vuelve a ejecutar y verifica que aprobar gana 3 de 3."
    },
    {
      id: "colab-weighted",
      name: "Weighted Voting",
      what: "Programaremos una votación con pesos: los modelos no valen igual porque algunos han sido más confiables.",
      variables: [["predicciones", "Votos o puntajes de cada modelo."], ["pesos", "Importancia asignada a cada modelo."], ["puntaje", "Acumulador de confianza ponderada."]],
      lines: [
        { code: "predicciones = [0.82, 0.74, 0.90]", does: "Guarda tres niveles de confianza.", why: "Weighted Voting necesita salidas comparables.", produces: "Tres porcentajes como números.", visual: ["82%", "74%", "90%"] },
        { code: "pesos = [0.3, 0.2, 0.5]", does: "Define cuánto pesa cada modelo.", why: "El modelo más confiable debe influir más.", produces: "Pesos que suman 1.0.", visual: ["0.3", "0.2", "0.5"] },
        { code: "aportes = [p * w for p, w in zip(predicciones, pesos)]", does: "Multiplica cada predicción por su peso.", why: "Así se convierte confianza en aporte real.", produces: "0.246, 0.148, 0.45.", visual: ["0.246", "0.148", "0.45"] },
        { code: "decision = sum(aportes)", does: "Suma todos los aportes.", why: "La suma representa la decisión final ponderada.", produces: "decision = 0.844.", visual: ["84.4%", "recomendar", "alto"] }
      ],
      result: "Colab devuelve 0.844. No es magia: cada número viene de multiplicar confianza por peso.",
      exercise: "Baja el peso del historial de 0.5 a 0.2, sube el peso de sabor y predice si el resultado baja o sube."
    },
    {
      id: "colab-bagging",
      name: "Bagging",
      what: "Programaremos la parte mental de Bagging: varias copias del modelo predicen y luego se estabiliza el resultado.",
      variables: [["muestras", "Versiones distintas del dataset."], ["predicciones", "Resultado de cada copia del modelo."], ["promedio", "Decisión estabilizada."]],
      lines: [
        { code: "muestras = ['A', 'B', 'C', 'D']", does: "Representa cuatro muestras de entrenamiento.", why: "Bagging nace de mirar el problema desde muestras distintas.", produces: "Cuatro muestras simuladas.", visual: ["A", "B", "C", "D"] },
        { code: "predicciones = [0.61, 0.55, 0.64, 0.58]", does: "Guarda lo que predijo cada copia.", why: "Un solo modelo podía ser inestable; varias copias revelan el rango.", produces: "Cuatro resultados cercanos.", visual: ["61%", "55%", "64%", "58%"] },
        { code: "promedio = sum(predicciones) / len(predicciones)", does: "Calcula el promedio de las copias.", why: "Promediar reduce la dependencia de una sola muestra.", produces: "promedio = 0.595.", visual: ["sumar", "dividir", "59.5%"] },
        { code: "decision = 'riesgo medio' if promedio > 0.5 else 'riesgo bajo'", does: "Convierte el promedio en una etiqueta.", why: "El sistema necesita una decisión final interpretable.", produces: "decision = riesgo medio.", visual: ["59.5%", ">", "riesgo medio"] }
      ],
      result: "Colab muestra riesgo medio. El valor no salió de una copia: salió de estabilizar cuatro miradas.",
      exercise: "Cambia 0.64 por 0.40 y observa si una sola copia extrema cambia o no cambia toda la decisión."
    },
    {
      id: "colab-boosting",
      name: "Boosting",
      what: "Programaremos una versión guiada de Boosting: cada ronda suma una corrección sobre el error anterior.",
      variables: [["base", "Predicción inicial."], ["correcciones", "Aportes de rondas posteriores."], ["puntaje_final", "Resultado después de corregir."]],
      lines: [
        { code: "base = 0.52", does: "Define la primera predicción.", why: "Boosting empieza con un modelo base imperfecto.", produces: "Un punto de partida.", visual: ["base", "52%", "inicial"] },
        { code: "correcciones = [0.08, 0.04, -0.02]", does: "Guarda ajustes aprendidos en rondas posteriores.", why: "Cada ronda corrige patrones de error.", produces: "Tres correcciones.", visual: ["+8%", "+4%", "-2%"] },
        { code: "puntaje_final = base + sum(correcciones)", does: "Suma la base y las correcciones.", why: "La decisión final acumula aprendizajes secuenciales.", produces: "puntaje_final = 0.62.", visual: ["52%", "+10%", "62%"] },
        { code: "decision = 'revisar' if puntaje_final > 0.6 else 'aprobar'", does: "Aplica un umbral de decisión.", why: "El agente necesita convertir puntaje en acción.", produces: "decision = revisar.", visual: ["62%", "umbral 60%", "revisar"] }
      ],
      result: "Colab devuelve revisar. El alumno ve cómo pequeñas correcciones cambian una decisión fronteriza.",
      exercise: "Cambia la corrección -0.02 por -0.08 y predice si el caso sigue pasando el umbral de revisión."
    },
    {
      id: "colab-stacking",
      name: "Stacking",
      what: "Programaremos un meta-combinador simple: toma salidas de especialistas y aprende una mezcla final.",
      variables: [["salidas", "Predicciones de CNN, texto y tabular."], ["pesos_meta", "Reglas aprendidas por el combinador final."], ["decision", "Salida del meta-modelo."]],
      lines: [
        { code: "salidas = {'cnn': 0.81, 'texto': 0.40, 'tabular': 0.23}", does: "Guarda predicciones de especialistas.", why: "Stacking empieza después de que cada modelo hizo su trabajo.", produces: "Una fila para el meta-modelo.", visual: ["CNN 0.81", "texto 0.40", "tabla 0.23"] },
        { code: "pesos_meta = {'cnn': 0.55, 'texto': 0.25, 'tabular': 0.20}", does: "Define cuánto aprendió a creer el combinador.", why: "El meta-modelo no vota a ciegas: aprende relaciones históricas.", produces: "Pesos del combinador.", visual: ["55%", "25%", "20%"] },
        { code: "puntaje = sum(salidas[k] * pesos_meta[k] for k in salidas)", does: "Combina cada salida con el peso aprendido.", why: "La mezcla final usa especialistas y contexto.", produces: "puntaje = 0.5925.", visual: ["0.4455", "0.10", "0.046", "0.592"] },
        { code: "decision = 'revision humana' if puntaje > 0.55 else 'aprobar'", does: "Convierte el puntaje en acción.", why: "Un agente completo debe terminar en una decisión operable.", produces: "decision = revision humana.", visual: ["59.2%", "conflicto", "revision"] }
      ],
      result: "Colab devuelve revision humana porque la CNN pesa mucho y detecta daño moderado.",
      exercise: "Baja el peso de CNN a 0.30, sube texto a 0.45 y revisa cómo cambia la decisión."
    }
  ];

  function initColabStrategyLab() {
    const lab = $("#colab-strategy-lab");
    if (!lab) return;
    lab.innerHTML = COLAB_STRATEGIES.map(renderColabStrategy).join("");
    COLAB_STRATEGIES.forEach(initColabCard);
  }

  function renderColabStrategy(strategy) {
    return `
      <article class="colab-card" id="${strategy.id}">
        <header><span>Google Colab</span><h3>${escapeHtml(strategy.name)}</h3><p>${escapeHtml(strategy.what)}</p></header>
        <div class="colab-grid">
          <article><h4>¿Qué vamos a programar?</h4><p>${escapeHtml(strategy.what)}</p></article>
          <article><h4>Preparación</h4><ul>${strategy.variables.map(([name, desc]) => `<li><strong>${escapeHtml(name)}:</strong> ${escapeHtml(desc)}</li>`).join("")}</ul></article>
        </div>
        <div class="colab-runner">
          <div class="code-snippet" data-code>${escapeHtml(strategy.lines.map((line) => line.code).join("\n"))}</div>
          <div class="colab-step-output" data-output></div>
        </div>
        <label class="wide">Predicción antes de ejecutar
          <textarea data-prediction placeholder="Antes de presionar Ejecutar, escribe qué crees que producirá la siguiente línea."></textarea>
        </label>
        <div class="colab-actions">
          <button type="button" data-colab-action="copy">Copiar a Colab</button>
          <button type="button" data-colab-action="run">Ejecutar</button>
          <button type="button" data-colab-action="modify">Modificar valores</button>
          <button type="button" data-colab-action="rerun">Volver a ejecutar</button>
        </div>
        <div class="colab-result"><h4>Resultado</h4><p>${escapeHtml(strategy.result)}</p><h4>Ejercicio guiado</h4><p>${escapeHtml(strategy.exercise)}</p></div>
      </article>
    `;
  }

  function initColabCard(strategy) {
    const card = $(`#${strategy.id}`);
    if (!card) return;
    const output = $("[data-output]", card);
    const prediction = $("[data-prediction]", card);
    let index = 0;
    const renderLine = () => {
      const line = strategy.lines[index];
      output.innerHTML = `
        <h4>Línea ${index + 1}: <code>${escapeHtml(line.code)}</code></h4>
        <p><strong>Tu predicción:</strong> ${escapeHtml(prediction?.value.trim() || "sin predicción escrita")}</p>
        <p><strong>¿Qué hace?</strong> ${escapeHtml(line.does)}</p>
        <p><strong>¿Por qué existe?</strong> ${escapeHtml(line.why)}</p>
        <p><strong>¿Qué produce?</strong> ${escapeHtml(line.produces)}</p>
        <div class="step-visual">${line.visual.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
      `;
    };
    $("[data-colab-action='copy']", card)?.addEventListener("click", async (event) => {
      try {
        await navigator.clipboard.writeText(strategy.lines.map((line) => line.code).join("\n"));
        event.currentTarget.textContent = "Copiado";
        setTimeout(() => { event.currentTarget.textContent = "Copiar a Colab"; }, 1200);
      } catch (err) {
        output.textContent = "No se pudo copiar automáticamente. Selecciona el bloque y cópialo manualmente.";
      }
    });
    $("[data-colab-action='run']", card)?.addEventListener("click", () => {
      index = Math.min(strategy.lines.length - 1, index + 1);
      renderLine();
    });
    $("[data-colab-action='modify']", card)?.addEventListener("click", () => {
      index = Math.max(0, strategy.lines.length - 2);
      renderLine();
    });
    $("[data-colab-action='rerun']", card)?.addEventListener("click", () => {
      index = 0;
      renderLine();
    });
    renderLine();
  }

  // ---------- Misión 9: agente híbrido completo ----------
  const AGENT_STEPS = [
    {
      title: "Entrada",
      text: "El agente recibe un caso con tabla, texto, imagen y metadatos.",
      visual: ["caso", "tabla", "texto", "foto"],
      code: "def decidir(caso):\n    entrada = caso"
    },
    {
      title: "Preprocesamiento",
      text: "Normaliza campos: números como números, texto limpio e imagen preparada.",
      visual: ["edad limpia", "texto minúsculas", "foto lista"],
      code: "    datos = preprocesar(entrada)"
    },
    {
      title: "Validación",
      text: "Revisa si faltan datos mínimos antes de consultar modelos.",
      visual: ["campos", "completos", "continúa"],
      code: "    if faltan_datos(datos):\n        return pedir_mas_informacion(datos)"
    },
    {
      title: "Modelo tabular",
      text: "Consulta el especialista que entiende columnas numéricas y categóricas.",
      visual: ["edad", "presupuesto", "riesgo 0.23"],
      code: "    pred_tabular = modelo_tabular(datos['tabla'])"
    },
    {
      title: "Modelo de texto",
      text: "Consulta el especialista que interpreta el reporte escrito.",
      visual: ["reporte", "tono normal", "0.40"],
      code: "    pred_texto = modelo_texto(datos['texto'])"
    },
    {
      title: "CNN",
      text: "Consulta el especialista visual si hay imagen disponible.",
      visual: ["foto", "daño moderado", "0.81"],
      code: "    pred_cnn = modelo_cnn(datos['imagen'])"
    },
    {
      title: "Estrategia de combinación",
      text: "Usa la estrategia ya elegida para combinar salidas disponibles.",
      visual: ["0.23", "0.40", "0.81", "0.58"],
      code: "    combinado = combinar([pred_tabular, pred_texto, pred_cnn], estrategia='stacking')"
    },
    {
      title: "Reglas",
      text: "Aplica restricciones de negocio después de conocer el resultado combinado.",
      visual: ["presupuesto ok", "sin bloqueo", "continúa"],
      code: "    combinado = aplicar_reglas(combinado, datos)"
    },
    {
      title: "Explicación",
      text: "Convierte números y reglas en una explicación entendible.",
      visual: ["CNN influyó", "texto no alertó", "tabla baja"],
      code: "    explicacion = explicar(combinado, datos)"
    },
    {
      title: "Decisión",
      text: "Devuelve una respuesta final reutilizable por otra app o por Colab.",
      visual: ["revisión humana", "confianza 58%", "motivo"],
      code: "    return {'decision': combinado['decision'], 'explicacion': explicacion}"
    }
  ];

  const AGENT_CASES = [
    { title: "Caso completo con foto clara", tabular: 0.23, text: 0.40, image: 0.81, budget: 18400, note: "La imagen empuja a revisión aunque tabla y texto son tranquilos." },
    { title: "Caso sin imagen", tabular: 0.48, text: 0.62, image: null, budget: 9200, note: "El agente debe omitir CNN y explicar que decide con menos evidencia." },
    { title: "Caso bloqueado por regla", tabular: 0.20, text: 0.30, image: 0.25, budget: 350, note: "La regla de presupuesto mínimo bloquea aunque los modelos parezcan tranquilos." },
    { title: "Alta alerta textual", tabular: 0.44, text: 0.88, image: 0.52, budget: 12500, note: "El reporte escrito tiene señales fuertes y debe aparecer en la explicación." }
  ];

  function initHybridAgentBuilder() {
    const root = $("#hybrid-agent-builder");
    if (!root) return;
    root.innerHTML = `
      <div class="agent-layout">
        <div class="agent-steps" id="agent-step-list"></div>
        <div class="agent-stage" id="agent-stage"></div>
      </div>
      <div class="agent-controls">
        <button type="button" id="agent-prev">Anterior</button>
        <button type="button" id="agent-next">Siguiente</button>
        <button type="button" id="agent-reset">Reiniciar</button>
      </div>
      <article class="agent-final-function">
        <h3>Función final reutilizable</h3>
        <div class="warning compact"><strong>No todo existe todavía:</strong> <code>preprocesar</code>, <code>modelo_tabular</code>, <code>modelo_texto</code>, <code>modelo_cnn</code>, <code>combinar</code>, <code>aplicar_reglas</code> y <code>explicar</code> son piezas que debes implementar o simular en Colab.</div>
        <pre class="code-snippet" id="agent-final-code"></pre>
      </article>
      <article class="agent-simulator">
        <h3>Simulador final del agente</h3>
        <div class="agent-sim-grid">
          <label for="agent-case-select">Caso
            <select id="agent-case-select"></select>
          </label>
          <label for="agent-models-select">Modelos a usar
            <select id="agent-models-select">
              <option value="all">Tabular + texto + CNN</option>
              <option value="tab-text">Tabular + texto</option>
              <option value="tab-only">Solo tabular</option>
            </select>
          </label>
          <label for="agent-strategy-select">Estrategia
            <select id="agent-strategy-select">
              <option value="stacking">Stacking</option>
              <option value="weighted">Weighted Voting</option>
              <option value="voting">Voting</option>
            </select>
          </label>
          <label for="agent-rules-select">Reglas
            <select id="agent-rules-select">
              <option value="budget">Bloquear presupuesto menor a 500</option>
              <option value="none">Sin regla dura</option>
            </select>
          </label>
          <button type="button" id="agent-run">Ejecutar flujo</button>
        </div>
        <div class="agent-execution" id="agent-execution"></div>
      </article>
    `;
    initAgentStepper();
    initAgentSimulator();
  }

  function initAgentStepper() {
    const list = $("#agent-step-list");
    const stage = $("#agent-stage");
    const code = $("#agent-final-code");
    if (!list || !stage || !code) return;
    list.innerHTML = AGENT_STEPS.map((step, index) => `<button type="button" data-agent-step="${index}">${index + 1}. ${escapeHtml(step.title)}</button>`).join("");
    const buttons = $$("[data-agent-step]", list);
    let current = 0;
    const render = () => {
      const step = AGENT_STEPS[current];
      buttons.forEach((button, index) => button.classList.toggle("is-active", index === current));
      stage.innerHTML = `
        <h3>${escapeHtml(step.title)}</h3>
        <p>${escapeHtml(step.text)}</p>
        <div class="step-visual">${step.visual.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
        <pre class="code-snippet">${escapeHtml(AGENT_STEPS.slice(0, current + 1).map((item) => item.code).join("\n"))}</pre>
      `;
      code.textContent = AGENT_STEPS.map((item) => item.code).join("\n");
    };
    buttons.forEach((button) => button.addEventListener("click", () => { current = Number(button.dataset.agentStep); render(); }));
    $("#agent-prev")?.addEventListener("click", () => { current = Math.max(0, current - 1); render(); });
    $("#agent-next")?.addEventListener("click", () => { current = Math.min(AGENT_STEPS.length - 1, current + 1); render(); });
    $("#agent-reset")?.addEventListener("click", () => { current = 0; render(); });
    render();
  }

  function initAgentSimulator() {
    const caseSelect = $("#agent-case-select");
    const run = $("#agent-run");
    const output = $("#agent-execution");
    if (!caseSelect || !run || !output) return;
    caseSelect.innerHTML = AGENT_CASES.map((item, index) => `<option value="${index}">${escapeHtml(item.title)}</option>`).join("");
    run.addEventListener("click", () => {
      const selected = AGENT_CASES[Number(caseSelect.value)];
      const models = $("#agent-models-select")?.value || "all";
      const strategy = $("#agent-strategy-select")?.value || "stacking";
      const rules = $("#agent-rules-select")?.value || "budget";
      const active = [];
      if (models !== "none") active.push(["Tabular", selected.tabular]);
      if (models === "all" || models === "tab-text") active.push(["Texto", selected.text]);
      if (models === "all" && selected.image !== null) active.push(["CNN", selected.image]);
      const blocked = rules === "budget" && selected.budget < 500;
      const weights = strategy === "stacking" ? [0.2, 0.25, 0.55] : strategy === "weighted" ? [0.35, 0.25, 0.4] : active.map(() => 1 / Math.max(active.length, 1));
      const combined = active.length ? active.reduce((sum, [, value], index) => sum + value * (weights[index] || (1 / active.length)), 0) : 0;
      const decision = blocked ? "BLOQUEAR" : combined > 0.55 ? "REVISIÓN HUMANA" : "APROBAR";
      output.innerHTML = `
        <div class="agent-execution-grid">
          <article><h4>Caso</h4><p>${escapeHtml(selected.title)}</p><p>${escapeHtml(selected.note)}</p></article>
          <article><h4>Predicciones</h4>${active.map(([name, value]) => `<span class="model-chip">${escapeHtml(name)}: ${value.toFixed(2)}</span>`).join("") || "<p>Sin modelos activos.</p>"}</article>
          <article><h4>Pesos</h4>${active.map(([name], index) => `<span class="model-chip">${escapeHtml(name)}: ${(weights[index] || (1 / active.length)).toFixed(2)}</span>`).join("")}</article>
          <article><h4>Resultado combinado</h4><strong>${combined.toFixed(2)}</strong></article>
          <article><h4>Decisión</h4><strong>${escapeHtml(decision)}</strong></article>
          <article><h4>Explicación</h4><p>${blocked ? "La regla dura se aplicó antes de aceptar la recomendación final." : `La estrategia ${strategy} combinó los modelos activos y produjo una confianza de ${combined.toFixed(2)}.`}</p></article>
        </div>
      `;
    });
  }

  // ---------- Simulador ----------
  function initSimulator() {
    const runBtn = $("#sim-run");
    if (!runBtn) return;
    runBtn.addEventListener("click", () => {
      const hasTabular = $("#sim-has-tabular")?.checked;
      const hasText = $("#sim-has-text")?.checked;
      const hasImage = $("#sim-has-image")?.checked;
      const dataComplete = $("#sim-data-complete")?.checked;
      const criticalRule = $("#sim-critical-rule")?.checked;
      const strategy = $("#sim-strategy")?.value || "weighted";
      const prediction = $("#sim-prediction")?.value.trim() || "sin predicción previa";
      const modelsOut = $("#sim-models-output");
      const log = $("#sim-log");

      if (!dataComplete) {
        modelsOut.innerHTML = `<div class="option-card"><h3>Sin ejecutar</h3><p class="blocked">Faltan datos requeridos.</p></div>`;
        log.textContent = `Predicción del alumno: ${prediction}\nDecisión: PEDIR MÁS INFORMACIÓN\nMotivo: el caso llegó con campos incompletos. El agente nunca decide sobre datos parciales sin marcarlo explícitamente.\nModelos consultados: ninguno.`;
        return;
      }
      if (criticalRule) {
        modelsOut.innerHTML = `<div class="option-card"><h3>Sin ejecutar</h3><p class="blocked">Regla dura activa: bloquea antes de llamar modelos.</p></div>`;
        log.textContent = `Predicción del alumno: ${prediction}\nDecisión: BLOQUEAR\nMotivo: la regla de presupuesto mínimo se activó. Las reglas duras siempre se evalúan antes que cualquier modelo.\nModelos consultados: ninguno.`;
        return;
      }
      const active = [];
      if (hasTabular) active.push({ name: "Tabular", value: "riesgo 0.23 (bajo)" });
      if (hasText) active.push({ name: "Texto", value: "tono neutro" });
      if (hasImage) active.push({ name: "CNN", value: "daño moderado 0.81" });

      if (!active.length) {
        modelsOut.innerHTML = `<div class="option-card"><h3>Sin datos</h3><p class="blocked">No hay ningún dato disponible para consultar un modelo.</p></div>`;
        log.textContent = `Predicción del alumno: ${prediction}\nDecisión: PEDIR MÁS INFORMACIÓN\nMotivo: ningún modelo tiene datos de entrada.`;
        return;
      }
      modelsOut.innerHTML = active.map((m) => `<div class="option-card"><h3>${escapeHtml(m.name)}</h3><p>${escapeHtml(m.value)}</p></div>`).join("");

      const decision = hasImage ? "RECOMENDAR con revisión humana" : "RECOMENDAR";
      const confianza = hasImage ? (strategy === "stacking" ? "59%" : "81%") : hasTabular && hasText ? "68%" : "55%";
      const strategyLabel = { weighted: "Weighted Voting", stacking: "Stacking", voting: "Voting" }[strategy] || strategy;
      log.textContent = `Predicción del alumno: ${prediction}\nDecisión: ${decision}\nConfianza: ${confianza}\nEstrategia usada: ${strategyLabel}\nModelos consultados: ${active.map((m) => m.name).join(", ")}\nExplicación: el enrutador solo llamó a los especialistas con datos disponibles y combinó sus resultados con ${strategyLabel}.`;
    });
  }

  // ---------- Diseño: formulario de arquitectura ----------
  function initArchitectureForm() {
    const form = $("#architecture-form");
    const map = $("#student-architecture-map");
    if (!form || !map) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const caseName = $("#arch-case")?.value.trim() || "tu caso";
      const rule = $("#arch-rule")?.value.trim() || "sin regla definida";
      const model1 = $("#arch-model1")?.value.trim() || "modelo 1 sin definir";
      const model2 = $("#arch-model2")?.value.trim() || "modelo 2 sin definir";
      const strategy = $("#arch-strategy")?.value || "promedio";
      const strategyLabel = { promedio: "Promedio ponderado", votacion: "Votación", reglas: "Reglas primero" }[strategy];
      map.innerHTML = `
        <div class="architecture-step"><strong>Caso:</strong> ${escapeHtml(caseName)}</div>
        <div class="architecture-step"><strong>Regla dura:</strong> ${escapeHtml(rule)}</div>
        <div class="architecture-step"><strong>Modelo 1:</strong> ${escapeHtml(model1)}</div>
        <div class="architecture-step"><strong>Modelo 2:</strong> ${escapeHtml(model2)}</div>
        <div class="architecture-step"><strong>Estrategia:</strong> ${escapeHtml(strategyLabel)}</div>
      `;
      window.hybridArchitecture = { caseName, rule, model1, model2, strategy, strategyLabel };
    });
  }

  // ---------- Generador de código ----------
  function initCodeGenerator() {
    const genBtn = $("#generate-code");
    const copyBtn = $("#copy-code");
    const output = $("#generated-code");
    if (!genBtn || !output) return;
    genBtn.addEventListener("click", () => {
      const arch = window.hybridArchitecture;
      if (!arch) {
        output.textContent = "Primero guarda tu arquitectura en la sección Diseño.";
        return;
      }
      const pyRule = JSON.stringify(arch.rule);
      const pyCase = JSON.stringify(arch.caseName);
      output.textContent = `# BLOQUE EJECUTABLE: empieza con modelos simulados y luego reemplázalos por modelos reales.
# Caso diseñado: ${arch.caseName}

PESOS = {"modelo_1": 0.5, "modelo_2": 0.5}
NOMBRE_CASO = ${pyCase}

def regla_dura_activada(caso):
    return bool(caso.get("regla_activa", False))

def bloquear(motivo):
    return {
        "decision": "BLOQUEAR",
        "confianza": 1.0,
        "modelos": [],
        "explicacion": motivo
    }

def modelo_1(caso):
    # Simula: ${arch.model1}
    return {"etiqueta": "revisar", "confianza": 0.62}

def modelo_2(caso):
    # Simula: ${arch.model2}
    return {"etiqueta": "revisar", "confianza": 0.74}

def combinar(resultados, estrategia="${arch.strategy}"):
    if not resultados:
        return {"etiqueta": "PEDIR MÁS INFORMACIÓN", "confianza": 0.0}
    total = 0
    total_pesos = 0
    for nombre, resultado in resultados.items():
        peso = PESOS.get(nombre, 1 / len(resultados))
        total += resultado["confianza"] * peso
        total_pesos += peso
    confianza = round(total / total_pesos, 2) if total_pesos else 0
    etiqueta = "REVISIÓN HUMANA" if confianza >= 0.55 else "APROBAR"
    return {"etiqueta": etiqueta, "confianza": confianza}

def explicar(decision, resultados):
    usados = ", ".join(resultados.keys()) or "ninguno"
    return f"Para {NOMBRE_CASO}, se consultaron: {usados}. Estrategia: ${arch.strategyLabel}. Confianza final: {decision['confianza']}."

def decidir_con_agente_hibrido(caso):
    # Regla dura: ${arch.rule}
    if regla_dura_activada(caso):
        return bloquear(${pyRule})

    resultados = {}
    resultados["modelo_1"] = modelo_1(caso)
    resultados["modelo_2"] = modelo_2(caso)

    decision = combinar(resultados, estrategia="${arch.strategy}")
    return {
        "decision": decision["etiqueta"],
        "confianza": decision["confianza"],
        "modelos": list(resultados.keys()),
        "explicacion": explicar(decision, resultados)
    }

caso_demo = {
    "caso": NOMBRE_CASO,
    "regla_activa": False,
    "datos": "reemplaza esto por los datos reales de tu caso"
}

print(decidir_con_agente_hibrido(caso_demo))`;
    });
    copyBtn?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(output.textContent);
        copyBtn.textContent = "Copiado";
        setTimeout(() => { copyBtn.textContent = "Copiar"; }, 1500);
      } catch (err) {
        /* clipboard unavailable, ignore silently */
      }
    });
  }

  // ---------- Prueba: casos de test ----------
  const TEST_CASES = {
    completo: `Caso completo\nEntrada JSON:\n{"tabla":{"edad":34,"presupuesto":18400,"reclamos":0},"texto":"daño frontal moderado","imagen":"foto.jpg"}\nSalida esperada:\n{"decision":"REVISIÓN HUMANA","modelos":["tabular","texto","cnn"],"confianza":0.59}\nCriterio: los tres modelos corren y la explicación debe mencionar la señal visual.`,
    bloqueado: `Caso bloqueado\nEntrada JSON:\n{"tabla":{"edad":34,"presupuesto":350,"reclamos":0},"texto":"daño leve","imagen":null}\nSalida esperada:\n{"decision":"BLOQUEAR","modelos":[],"motivo":"presupuesto insuficiente"}\nCriterio: la regla dura se activa antes de llamar modelos.`,
    incompleto: `Datos incompletos\nEntrada JSON:\n{"tabla":{"presupuesto":18400},"texto":"daño frontal","imagen":null}\nSalida esperada:\n{"decision":"PEDIR MÁS INFORMACIÓN","campo_faltante":"edad"}\nCriterio: el agente no decide con campos requeridos vacíos.`,
    "baja-confianza": `Baja confianza\nEntrada JSON:\n{"tabla":{"riesgo":0.42},"texto_confianza":0.38,"imagen_confianza":0.45}\nSalida esperada:\n{"decision":"REVISIÓN HUMANA","motivo":"ningún modelo supera confianza mínima"}\nCriterio: el agente no fuerza una recomendación automática.`,
    "con-imagen": `Con imagen\nEntrada JSON:\n{"tabla":{"riesgo":0.23},"texto":"tono normal","imagen":"daño_moderado.jpg"}\nSalida esperada:\n{"decision":"REVISIÓN HUMANA","modelos":["tabular","texto","cnn"],"evidencia":"cnn=0.81"}\nCriterio: la explicación debe decir por qué la imagen pesa más.`
  };
  function initTestCases() {
    const buttons = $$("#test-case-buttons button");
    const output = $("#test-case-output");
    if (!buttons.length || !output) return;
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("primary"));
        btn.classList.add("primary");
        output.textContent = TEST_CASES[btn.dataset.case] || "";
      });
    });
  }

  // ---------- Reporte final ----------
  function initReportForm() {
    const form = $("#report-form");
    const output = $("#report-output");
    if (!form || !output) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#report-name")?.value.trim() || "Sin nombre";
      const strategy = $("#report-strategy")?.value.trim() || "sin definir";
      const learning = $("#report-learning")?.value.trim() || "sin respuesta";
      const next = $("#report-next")?.value.trim() || "sin respuesta";
      const arch = window.hybridArchitecture;
      output.textContent = `REPORTE FINAL — CLASE 18
Alumno: ${name}
Fecha: ${new Date().toLocaleDateString("es-MX")}

Arquitectura diseñada:
${arch ? `  Caso: ${arch.caseName}\n  Regla dura: ${arch.rule}\n  Modelos: ${arch.model1} + ${arch.model2}\n  Estrategia: ${arch.strategyLabel}` : "  (no se guardó una arquitectura en la sección Diseño)"}

Estrategia elegida para el reporte: ${strategy}

Reflexión — lo más difícil de combinar reglas y modelos:
${learning}

Reflexión — qué mejoraría con más tiempo:
${next}`;
    });
  }
})();

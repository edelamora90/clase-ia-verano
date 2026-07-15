(() => {
  "use strict";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  document.addEventListener("DOMContentLoaded", () => {
    initSidebar();
    initReadingProgress();
    initActiveNav();
    initTokenizer();
    initNbJourney();
    initTextSimulator();
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
      [10, "Fase 1 · Fundamentos de clasificación de texto."],
      [30, "Fase 2 · Vectorización y modelo."],
      [50, "Fase 3 · Evaluación."],
      [62, "Fase 4 · Aplicación completa."],
      [72, "Fase 5 · Simulador."],
      [85, "Fase 6 · Tu propio clasificador."],
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
    const sections = links.map((a) => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);
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

  // ---------- Naive Bayes real, entrenado sobre el corpus de 12 comentarios de campaña ----------
  // Estos números son EXACTAMENTE los mismos que se calculan en la Misión 5 y en
  // modelo-naive-bayes.webp: conteo real de cada palabra por clase (sentimiento neto),
  // sobre el corpus completo de esta clase, sin inventar ni redondear a mano.
  const STOPWORDS = new Set(["el", "la", "los", "las", "un", "una", "de", "del", "se", "a", "y", "por", "fue", "con", "es", "hay", "que", "muy", "mi", "su", "lo", "en", "no"]);
  const CLASS_TOTALS = { positivo: 25, negativo: 30, neutral: 21 }; // palabras útiles totales por clase
  const CLASS_PRIORS = { positivo: 4 / 12, negativo: 5 / 12, neutral: 3 / 12 }; // 4, 5 y 3 comentarios de 12
  const VOCAB_SIZE = 69; // palabras distintas en todo el corpus (para el suavizado de Laplace)
  const WORD_CLASS_COUNTS = { "ando": { "neutral": 1 }, "antes": { "positivo": 1 }, "así": { "neutral": 1 }, "atención": { "positivo": 1 }, "ayer": { "positivo": 1 }, "bajen": { "neutral": 1 }, "barata": { "negativo": 1 }, "bien": { "neutral": 1 }, "bonito": { "negativo": 1 }, "buenísima": { "positivo": 1 }, "buscando": { "neutral": 1 }, "calidad": { "positivo": 1 }, "cambiarlos": { "negativo": 1 }, "carísimos": { "negativo": 1 }, "chica": { "negativo": 1 }, "copia": { "negativo": 1 }, "cuestan": { "neutral": 1 }, "cuánto": { "neutral": 1 }, "delgada": { "negativo": 1 }, "diseño": { "negativo": 1 }, "duda": { "positivo": 1 }, "encuentro": { "neutral": 1 }, "envío": { "negativo": 1 }, "esperado": { "positivo": 1 }, "esperar": { "neutral": 1 }, "esto": { "negativo": 1 }, "estos": { "positivo": 1 }, "está": { "negativo": 1 }, "están": { "negativo": 1 }, "excelente": { "positivo": 1 }, "expectativas": { "positivo": 1 }, "hombre": { "neutral": 1 }, "increíbles": { "positivo": 1 }, "lado": { "neutral": 1 }, "llegaron": { "positivo": 2 }, "llegó": { "negativo": 1 }, "marca": { "negativo": 1 }, "me": { "positivo": 1, "negativo": 1 }, "minutos": { "positivo": 1 }, "mis": { "positivo": 1 }, "neta": { "negativo": 1 }, "ningún": { "neutral": 1 }, "nunca": { "negativo": 1 }, "ofrecen": { "negativo": 1 }, "otra": { "negativo": 1 }, "para": { "negativo": 1, "neutral": 1 }, "pedido": { "negativo": 1 }, "perfectos": { "positivo": 1 }, "pero": { "negativo": 1, "neutral": 1 }, "precio": { "neutral": 2 }, "prefiero": { "neutral": 1 }, "pésimo": { "negativo": 1 }, "quedó": { "negativo": 1 }, "quiero": { "positivo": 1 }, "recomiendo": { "negativo": 1 }, "resolvieron": { "positivo": 1 }, "servicio": { "negativo": 1 }, "siente": { "positivo": 1 }, "suela": { "negativo": 1 }, "superaron": { "positivo": 1 }, "talla": { "negativo": 1, "neutral": 1 }, "tenis": { "positivo": 1 }, "tienen": { "neutral": 1 }, "tuve": { "negativo": 1 }, "unos": { "neutral": 1 }, "ve": { "negativo": 1 }, "ven": { "positivo": 1, "neutral": 1 }, "wow": { "positivo": 1 }, "ya": { "positivo": 1 } };

  function pWordGivenClass(word, cls) {
    const count = (WORD_CLASS_COUNTS[word] && WORD_CLASS_COUNTS[word][cls]) || 0;
    return (count + 1) / (CLASS_TOTALS[cls] + VOCAB_SIZE);
  }

  // Importante: NO se quitan acentos. "está" y "esta" son palabras distintas para esta
  // tabla (igual que en el cálculo de Python que generó modelo-naive-bayes.webp), así que
  // conservamos los acentos para que el texto que escribas coincida con el vocabulario real.
  function tokenizeText(raw) {
    const clean = raw.toLowerCase().replace(/[^a-z0-9\sáéíóúñ]/gi, "");
    return clean.split(/\s+/).filter(Boolean);
  }

  // ---------- Misión 2: tokenizador ----------
  function initTokenizer() {
    const input = $("#tokenize-input");
    const btn = $("#tokenize-run");
    const output = $("#tokenize-demo-output");
    if (!btn || !input || !output) return;
    const render = () => {
      const tokens = input.value.toLowerCase().split(/\s+/).filter(Boolean);
      output.innerHTML = tokens
        .map((t) => `<span class="token-chip${STOPWORDS.has(t) ? " stopword" : " key"}">${escapeHtml(t)}</span>`)
        .join("");
    };
    btn.addEventListener("click", render);
    render();
  }

  // ---------- Misión 5: Naive Bayes journey ----------
  function initNbJourney() {
    const journey = $("#nb-journey");
    if (!journey) return;
    const stages = $$(".cnn-stage", journey);
    const progress = $("#nb-progress");
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
    $("#nb-prev")?.addEventListener("click", () => { current = Math.max(0, current - 1); journey.classList.remove("show-all"); render(); });
    $("#nb-next")?.addEventListener("click", () => { current = Math.min(stages.length - 1, current + 1); journey.classList.remove("show-all"); render(); });
    $("#nb-show-all")?.addEventListener("click", () => { journey.classList.toggle("show-all"); });
    render();
  }

  // ---------- Clasificador real: Naive Bayes con suavizado de Laplace (dimensión: sentimiento) ----------
  // Mismo algoritmo, mismo corpus y mismas fórmulas que ves paso a paso en la Misión 5.
  // Las palabras que nunca aparecieron en el corpus reciben una probabilidad pequeña e
  // igual en las tres clases (gracias al suavizado), así que no inclinan la decisión.
  function classifyText(raw) {
    const classes = ["positivo", "negativo", "neutral"];
    const tokens = tokenizeText(raw).filter((t) => !STOPWORDS.has(t));
    const logProbs = {};
    classes.forEach((c) => {
      let lp = Math.log(CLASS_PRIORS[c]);
      tokens.forEach((t) => { lp += Math.log(pWordGivenClass(t, c)); });
      logProbs[c] = lp;
    });
    const maxLp = Math.max(...classes.map((c) => logProbs[c]));
    const exps = {};
    let total = 0;
    classes.forEach((c) => { exps[c] = Math.exp(logProbs[c] - maxLp); total += exps[c]; });
    const posterior = {};
    classes.forEach((c) => { posterior[c] = exps[c] / total; });
    const label = classes.reduce((a, b) => (posterior[a] >= posterior[b] ? a : b));
    const knownTokens = tokens.filter((t) => WORD_CLASS_COUNTS[t]);
    return { tokens, knownTokens, posterior, label };
  }

  // ---------- Reglas de palabras clave: las otras 3 dimensiones del caso de campaña ----------
  // A diferencia del sentimiento (Naive Bayes real, entrenado), estas 3 dimensiones se
  // resuelven con reglas simples y deterministas: si el texto contiene ciertas palabras,
  // se asigna una etiqueta. Es una técnica real de NLP (clasificación basada en reglas),
  // más simple que un modelo entrenado, y con límites honestos que se explican en la Misión 10.
  const YA_COMPRO_KEYWORDS = ["llegaron", "llegó", "llego", "compré", "compre", "recibí", "recibi"];
  const INTERESADO_KEYWORDS = ["quiero", "cuánto", "cuanto", "cuestan", "talla", "precio", "cuesta", "interesa"];

  const SPAM_KEYWORDS = ["gratis", "gana", "premio", "www", "http"];
  const QUEJA_KEYWORDS = ["pésimo", "pesimo", "nunca", "carísimos", "carisimos", "copia", "barata", "delgada", "chica", "recomiendo"];
  const ELOGIO_KEYWORDS = ["excelente", "perfectos", "increíbles", "increibles", "buenísima", "buenisima", "superaron"];

  const PRECIO_KEYWORDS = ["precio", "cuesta", "cuestan", "carísimos", "carisimos", "barata", "caro"];
  const CALIDAD_KEYWORDS = ["calidad", "suela", "delgada", "buenísima", "buenisima", "perfectos", "material"];
  const ENVIO_KEYWORDS = ["envío", "envio", "pedido", "llegó", "llego", "tardó", "tardo", "paquete"];
  const SERVICIO_KEYWORDS = ["atención", "atencion", "servicio", "resolvieron", "duda", "ayuda"];
  const DISENO_KEYWORDS = ["diseño", "diseno", "talla", "color", "bonito", "ven", "increíbles", "increibles"];

  const includesAny = (text, list) => list.some((k) => text.includes(k));

  function detectIntencion(rawLower) {
    if (includesAny(rawLower, YA_COMPRO_KEYWORDS)) return "ya compró";
    if (includesAny(rawLower, INTERESADO_KEYWORDS)) return "interesado";
    return "indiferente";
  }
  function detectTipo(rawLower) {
    if (includesAny(rawLower, SPAM_KEYWORDS)) return "spam";
    if (rawLower.includes("?")) return "pregunta";
    if (includesAny(rawLower, QUEJA_KEYWORDS)) return "queja";
    if (includesAny(rawLower, ELOGIO_KEYWORDS)) return "elogio";
    return "comentario general";
  }
  function detectTema(rawLower) {
    if (includesAny(rawLower, PRECIO_KEYWORDS)) return "precio";
    if (includesAny(rawLower, CALIDAD_KEYWORDS)) return "calidad";
    if (includesAny(rawLower, ENVIO_KEYWORDS)) return "envío";
    if (includesAny(rawLower, SERVICIO_KEYWORDS)) return "servicio";
    if (includesAny(rawLower, DISENO_KEYWORDS)) return "diseño";
    return "general";
  }

  function analyzeComment(raw) {
    const sentiment = classifyText(raw);
    const rawLower = raw.toLowerCase();
    return {
      sentiment,
      intencion: detectIntencion(rawLower),
      tipo: detectTipo(rawLower),
      tema: detectTema(rawLower)
    };
  }

  // ---------- Simulador (Fase 5): dashboard de 4 métricas ----------
  function initTextSimulator() {
    const btn = $("#text-sim-run");
    const input = $("#text-sim-input");
    const output = $("#text-sim-output");
    if (!btn || !input || !output) return;
    btn.addEventListener("click", () => {
      const result = analyzeComment(input.value);
      const pct = (n) => Math.round(n * 1000) / 10;
      const s = result.sentiment;
      const seenNote = s.knownTokens.length
        ? `Palabras que sí estaban en el corpus de entrenamiento: ${s.knownTokens.join(", ")}.`
        : `Ninguna de tus palabras estaba en el corpus de 12 comentarios — el modelo solo pudo usar la probabilidad "de fondo" (el prior), por eso el sentimiento es poco confiable con un texto así.`;
      output.textContent = `DASHBOARD DEL COMENTARIO
------------------------------------
1) Sentimiento neto (Naive Bayes real, Misión 5)
   P(positivo): ${pct(s.posterior.positivo)}%   P(negativo): ${pct(s.posterior.negativo)}%   P(neutral): ${pct(s.posterior.neutral)}%
   → ${s.label.toUpperCase()}

2) Intención de compra (reglas de palabras clave, Misión 10)
   → ${result.intencion.toUpperCase()}

3) Tipo de comentario (reglas de palabras clave, Misión 10)
   → ${result.tipo.toUpperCase()}

4) Tema mencionado (reglas de palabras clave, Misión 10)
   → ${result.tema.toUpperCase()}

------------------------------------
Tokens útiles detectados para el sentimiento: ${s.tokens.join(", ") || "(ninguno)"}
${seenNote}

El sentimiento usa el mismo cálculo de Naive Bayes con suavizado de Laplace de la Misión 5. Las otras 3 métricas usan reglas simples de palabras clave (no un modelo entrenado) — por eso pueden fallar con oraciones ambiguas o con negaciones, igual que viste en la Misión 8.`;
    });
  }

  // ---------- Diseño: formulario ----------
  function initArchitectureForm() {
    const form = $("#architecture-form");
    const map = $("#student-architecture-map");
    if (!form || !map) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const caseName = $("#arch-case")?.value.trim() || "tu caso";
      const cat1 = $("#arch-cat1")?.value.trim() || "primera etiqueta";
      const cat2 = $("#arch-cat2")?.value.trim() || "segunda etiqueta";
      const example = $("#arch-example")?.value.trim() || "sin ejemplo";
      const strategy = $("#arch-strategy")?.value || "bow";
      const strategyLabel = { bow: "Bolsa de palabras", tfidf: "TF-IDF" }[strategy];
      map.innerHTML = `
        <div class="architecture-step"><strong>Texto a clasificar:</strong> ${escapeHtml(caseName)}</div>
        <div class="architecture-step"><strong>Las 2 etiquetas posibles:</strong> ${escapeHtml(cat1)} / ${escapeHtml(cat2)}</div>
        <div class="architecture-step"><strong>Ejemplo (primera etiqueta):</strong> ${escapeHtml(example)}</div>
        <div class="architecture-step"><strong>Vectorización:</strong> ${escapeHtml(strategyLabel)}</div>
      `;
      window.textClassifierDesign = { caseName, cat1, cat2, example, strategy, strategyLabel };
    });
  }

  // ---------- Generador de código ----------
  function initCodeGenerator() {
    const genBtn = $("#generate-code");
    const copyBtn = $("#copy-code");
    const output = $("#generated-code");
    if (!genBtn || !output) return;
    genBtn.addEventListener("click", () => {
      const d = window.textClassifierDesign;
      if (!d) {
        output.textContent = "Primero guarda tu diseño en la sección Diseño.";
        return;
      }
      const vectorizerClass = d.strategy === "tfidf" ? "TfidfVectorizer" : "CountVectorizer";
      output.textContent = `from sklearn.feature_extraction.text import ${vectorizerClass}
from sklearn.naive_bayes import MultinomialNB

# Caso: ${d.caseName}
textos = ["${d.example}", "..."]
etiquetas = ["${d.cat1}", "${d.cat2}"]  # ajusta según tus ejemplos reales

vectorizador = ${vectorizerClass}(stop_words=stopwords_es)
X = vectorizador.fit_transform(textos)

modelo = MultinomialNB()
modelo.fit(X, etiquetas)

def clasificar_texto(texto_nuevo):
    X_nuevo = vectorizador.transform([texto_nuevo])
    return modelo.predict(X_nuevo)[0]`;
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

  // ---------- Prueba: casos de test, calculados en vivo con el modelo real ----------
  const TEST_CASES = {
    "claro-positivo": { text: "Excelente atención, resolvieron mi duda en minutos", note: "Idéntico a un comentario real del corpus — el modelo lo reconoce con alta confianza." },
    "claro-negativo": { text: "Pésimo servicio y carísimos, no recomiendo", note: "Reutiliza varias palabras negativas del corpus — confianza alta hacia negativo." },
    "neutral": { text: "Se ven bien pero prefiero esperar el precio", note: "Mezcla de duda y espera, sin señal fuerte en ningún sentido — el modelo lo marca neutral." },
    "negacion": { text: "No está tan caro como pensé", note: "\"no\" se descarta como stopword y \"está\" es una palabra que en el corpus solo apareció en negativo — el modelo puede inclinarse a negativo aunque la intención real sea positiva. El mismo problema de negación de la Misión 8, con números reales." },
    "corto": { text: "Bien.", note: "Una sola palabra da muy poca evidencia estadística — nota qué tan repartidas quedan las tres probabilidades." }
  };
  function initTestCases() {
    const buttons = $$("#test-case-buttons button");
    const output = $("#test-case-output");
    if (!buttons.length || !output) return;
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("primary"));
        btn.classList.add("primary");
        const testCase = TEST_CASES[btn.dataset.case];
        if (!testCase) return;
        const result = classifyText(testCase.text);
        const pct = (n) => Math.round(n * 1000) / 10;
        output.textContent = `"${testCase.text}"\n\nP(positivo): ${pct(result.posterior.positivo)}%   P(negativo): ${pct(result.posterior.negativo)}%   P(neutral): ${pct(result.posterior.neutral)}%\nClasificación final: ${result.label.toUpperCase()}\n\n${testCase.note}`;
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
      const d = window.textClassifierDesign;
      output.textContent = `REPORTE FINAL — CLASE 16
Alumno: ${name}
Fecha: ${new Date().toLocaleDateString("es-MX")}

Clasificador diseñado:
${d ? `  Texto a clasificar: ${d.caseName}\n  Las 2 etiquetas posibles: ${d.cat1} / ${d.cat2}\n  Vectorización: ${d.strategyLabel}` : "  (no se guardó un diseño en la sección Diseño)"}

Técnica elegida para el reporte: ${strategy}

Reflexión — lo más difícil de convertir texto en números:
${learning}

Reflexión — qué mejoraría con más tiempo:
${next}`;
    });
  }
})();

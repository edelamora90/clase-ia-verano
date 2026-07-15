(() => {
  "use strict";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  document.addEventListener("DOMContentLoaded", () => {
    initSidebar();
    initReadingProgress();
    initActiveNav();
    initRgbMatrix();
    initCnnJourney();
    initCnnLab();
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
      [10, "Fase 1 · Fundamentos de imágenes."],
      [25, "Fase 2 · Convolución."],
      [45, "Fase 3 · Arquitectura completa."],
      [62, "Fase 4 · Evaluación."],
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

  // Píxeles reales tomados de la fotografía de esta clase (muestreo 3x3)
  const REAL_PIXELS = [
    [141, 147, 157], [137, 155, 175], [77, 97, 131],
    [96, 98, 105], [67, 80, 101], [36, 48, 65],
    [124, 117, 111], [81, 81, 80], [72, 69, 65]
  ];
  function initRgbMatrix() {
    const matrix = $("#rgb-pixel-matrix");
    if (!matrix) return;
    matrix.innerHTML = REAL_PIXELS.map(([r, g, b]) => `<span style="background:rgba(${r},${g},${b},.55)">${r},${g},${b}</span>`).join("");
  }

  // ---------- Misión 8: CNN journey ----------
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

  // ---------- Simulador de filtros ----------
  const CNN_FILTERS = {
    vertical: { img: "cnn-vertical.webp", text: "El filtro de bordes verticales resalta el contorno de la puerta y el parachoques." },
    horizontal: { img: "cnn-horizontal.webp", text: "El filtro de bordes horizontales resalta la línea del cofre y la defensa." },
    texture: { img: "cnn-texture.webp", text: "El filtro de textura resalta cambios bruscos: rayones y abolladuras." },
    contour: { img: "cnn-contour.webp", text: "El contorno combinado junta bordes verticales y horizontales en un solo mapa." }
  };
  function initCnnLab() {
    const buttons = $$("#cnn-filter-buttons button");
    const featureImg = $("#feature-map-image");
    const resultText = $("#filter-result");
    if (!buttons.length) return;
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
      const filters = $("#arch-filters")?.value || "32";
      const size = $("#arch-size")?.value || "128";
      map.innerHTML = `
        <div class="architecture-step"><strong>Imágenes a clasificar:</strong> ${escapeHtml(caseName)}</div>
        <div class="architecture-step"><strong>Las 2 etiquetas posibles:</strong> ${escapeHtml(cat1)} / ${escapeHtml(cat2)}</div>
        <div class="architecture-step"><strong>Filtros en la primera capa:</strong> ${escapeHtml(filters)}</div>
        <div class="architecture-step"><strong>Tamaño de entrada:</strong> ${escapeHtml(size)}x${escapeHtml(size)}</div>
      `;
      window.cnnDesign = { caseName, cat1, cat2, filters, size };
    });
  }

  // ---------- Generador de código ----------
  function initCodeGenerator() {
    const genBtn = $("#generate-code");
    const copyBtn = $("#copy-code");
    const output = $("#generated-code");
    if (!genBtn || !output) return;
    genBtn.addEventListener("click", () => {
      const d = window.cnnDesign;
      if (!d) {
        output.textContent = "Primero guarda tu diseño en la sección Diseño.";
        return;
      }
      output.textContent = `from tensorflow.keras import layers, models

# Caso: ${d.caseName}
modelo = models.Sequential([
    layers.Conv2D(${d.filters}, (3,3), activation="relu", input_shape=(${d.size},${d.size},3)),
    layers.MaxPooling2D((2,2)),
    layers.Conv2D(${Number(d.filters) * 2}, (3,3), activation="relu"),
    layers.MaxPooling2D((2,2)),
    layers.Flatten(),
    layers.Dense(64, activation="relu"),
    layers.Dense(2, activation="softmax")  # ${d.cat1} / ${d.cat2}
])

modelo.compile(optimizer="adam",
               loss="sparse_categorical_crossentropy",
               metrics=["accuracy"])`;
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
    claro: "Caso claro: foto nítida, bien iluminada, con el daño centrado.\nResultado esperado: alta confianza (>85%) en la clase correcta.",
    borroso: "Imagen borrosa: la foto está movida o fuera de foco.\nLa CNN pierde precisión porque los bordes que detecta pierden nitidez — la confianza suele bajar notablemente.",
    angulo: "Ángulo inusual: la foto se tomó desde un ángulo que no estaba en el set de entrenamiento.\nSi el entrenamiento no incluyó suficiente variedad de ángulos, la predicción puede fallar.",
    oclusion: "Objeto tapado: parte del daño está cubierto por otro objeto o una sombra.\nLa CNN solo puede juzgar lo que ve — información oculta no se puede inferir de forma confiable.",
    "nueva-clase": "Clase nunca vista: la foto muestra un tipo de daño que el modelo nunca vio en entrenamiento.\nEl modelo igual devolverá una probabilidad para alguna clase conocida, aunque ninguna sea realmente correcta — por eso la confianza reportada importa tanto como la etiqueta."
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
      const d = window.cnnDesign;
      output.textContent = `REPORTE FINAL — CLASE 17
Alumno: ${name}
Fecha: ${new Date().toLocaleDateString("es-MX")}

CNN diseñada:
${d ? `  Imágenes a clasificar: ${d.caseName}\n  Las 2 etiquetas posibles: ${d.cat1} / ${d.cat2}\n  Filtros primera capa: ${d.filters}\n  Tamaño de entrada: ${d.size}x${d.size}` : "  (no se guardó un diseño en la sección Diseño)"}

Arquitectura elegida para el reporte: ${strategy}

Reflexión — lo más difícil de entender sobre convolución:
${learning}

Reflexión — qué mejoraría con más tiempo:
${next}`;
    });
  }
})();

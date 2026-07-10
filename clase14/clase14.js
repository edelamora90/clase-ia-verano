(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
  const normalizeId = (value) => String(value || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

  const state = {
    training: { weight: 0.2, epoch: 0, history: [], logs: [] },
    project: {
      name: "", user: "", prediction: "", features: ["", "", ""], target: "",
      code: "", report: ""
    }
  };

  function prediction() {
    const heat = Number($("#heat-input")?.value || 0);
    return clamp(heat * 10 * state.training.weight, 0, 100);
  }

  function updateTrainingView() {
    const heat = Number($("#heat-input").value);
    const target = Number($("#target-input").value);
    const pred = prediction();
    const error = target - pred;
    const loss = Math.round(error * error);

    $("#heat-output").textContent = heat;
    $("#target-output").textContent = `${target}%`;
    $("#weight-value").textContent = state.training.weight.toFixed(2);
    $("#prediction-value").textContent = `${Math.round(pred)}%`;
    $("#error-value").textContent = String(Math.round(error));
    $("#loss-value").textContent = String(loss);
    renderLossChart();
    renderTrainingLog();
  }

  function trainOneEpoch() {
    const heat = Number($("#heat-input").value);
    const target = Number($("#target-input").value);
    const pred = prediction();
    const error = target - pred;
    const previousWeight = state.training.weight;
    const previousLoss = Math.round(error * error);
    const learningRate = 0.012;
    state.training.weight = clamp(state.training.weight + (error / 100) * (heat / 10) * learningRate * 10, 0, 1.4);
    state.training.epoch += 1;
    const newPred = prediction();
    const newError = target - newPred;
    const loss = Math.round(newError * newError);
    state.training.history.push(loss);
    state.training.logs.unshift(formatTrainingLog({
      epoch: state.training.epoch,
      heat,
      target,
      prediction: Math.round(newPred),
      error: Math.round(newError),
      loss,
      previousLoss,
      previousWeight,
      currentWeight: state.training.weight
    }));
    state.training.history = state.training.history.slice(-28);
    state.training.logs = state.training.logs.slice(0, 8);
    updateTrainingView();
  }

  function renderLossChart() {
    const chart = $("#loss-chart");
    const values = state.training.history.length ? state.training.history : [Math.round((Number($("#target-input").value) - prediction()) ** 2)];
    const max = Math.max(...values, 1);
    chart.innerHTML = values.map((loss) => `<span style="height:${Math.max(8, Math.round((loss / max) * 140))}px" title="loss ${loss}"></span>`).join("");
  }

  function renderTrainingLog() {
    const list = $("#training-log");
    list.innerHTML = state.training.logs.length
      ? state.training.logs.map((log) => `<li>${log}</li>`).join("")
      : "<li>Aún no has entrenado el modelo.</li>";
  }

  function formatTrainingLog({ epoch, heat, target, prediction, error, loss, previousLoss, previousWeight, currentWeight }) {
    const direction = currentWeight > previousWeight ? "sube un poco" : currentWeight < previousWeight ? "baja un poco" : "se mantiene";
    const relativeError = error === 0
      ? "la predicción coincide con la salida esperada"
      : error > 0
        ? `el modelo quedó ${Math.abs(error)} puntos abajo`
        : `el modelo quedó ${Math.abs(error)} puntos arriba`;
    const lossTrend = loss < previousLoss
      ? "El loss bajó: el modelo se acercó a la respuesta correcta."
      : loss === previousLoss
        ? "El loss se mantuvo: el modelo necesita más ajuste."
        : "El loss subió: este ajuste todavía no ayudó.";
    const progressLine = epoch > 1 && loss < previousLoss
      ? "La predicción ya se acerca más a la salida esperada; esto indica que el modelo está aprendiendo."
      : "Observa si en las siguientes épocas el error y el loss bajan.";

    return `<div class="training-log-entry">
      <strong>Época ${epoch}</strong>
      <span>Entrada: calor = ${heat}/10.</span>
      <span>Peso actual: ${currentWeight.toFixed(2)}.</span>
      <span>Predicción: ${prediction}% · Salida esperada: ${target}%.</span>
      <span>Error: ${relativeError}.</span>
      <span>Ajuste: el peso ${direction} para acercar la predicción a la salida esperada.</span>
      <em>Loss: ${loss}. ${lossTrend}</em>
      <span>${progressLine}</span>
    </div>`;
  }

  function resetTraining() {
    state.training = { weight: 0.2, epoch: 0, history: [], logs: [] };
    updateTrainingView();
  }

  function saveProject(event) {
    event?.preventDefault();
    state.project.name = $("#project-name").value.trim();
    state.project.user = $("#project-user").value.trim();
    state.project.prediction = $("#project-prediction").value.trim();
    state.project.features = [$("#feature-one").value.trim(), $("#feature-two").value.trim(), $("#feature-three").value.trim()].filter(Boolean);
    state.project.target = $("#target-name").value.trim();
    $("#project-status").textContent = `Diseño guardado: ${state.project.name || "tu proyecto"} predecirá ${state.project.target || "una salida"} usando ${state.project.features.length || 3} entrada(s).`;
  }

  function generateCode() {
    saveProject();
    const project = state.project;
    const featureNames = project.features.length ? project.features : ["entrada_1", "entrada_2", "entrada_3"];
    const safeFeatures = featureNames.map((feature) => normalizeId(feature) || "entrada");
    const target = normalizeId(project.target) || "salida_esperada";
    const projectName = project.name || "Mi proyecto";
    const featureComment = safeFeatures.map((feature, index) => `# ${index + 1}. ${feature}`).join("\n");
    const sampleRows = safeFeatures.length;

    project.code = `# Clase 14 - Primera red neuronal con Keras
# Proyecto: ${projectName}
# Objetivo: ${project.prediction || "predecir una salida a partir de entradas del proyecto"}

import numpy as np
import tensorflow as tf
from tensorflow import keras

# Entradas del proyecto:
${featureComment}

# Datos de ejemplo. En Clase 15 reemplazaremos esto con datos reales.
entradas = np.array([
    ${exampleRow(sampleRows, 0)},
    ${exampleRow(sampleRows, 1)},
    ${exampleRow(sampleRows, 2)},
    ${exampleRow(sampleRows, 3)}
], dtype=float)

# Salida esperada: ${target}
salidas = np.array([0, 0, 1, 1], dtype=float)

model = keras.Sequential([
    keras.layers.Dense(units=4, activation="relu", input_shape=[${safeFeatures.length}]),
    keras.layers.Dense(units=1, activation="sigmoid")
])

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.05),
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

historial = model.fit(entradas, salidas, epochs=80, verbose=0)

nuevo_caso = np.array([${exampleRow(sampleRows, 4)}], dtype=float)
prediccion = model.predict(nuevo_caso)

print("Proyecto:", ${pythonString(projectName)})
print("Predicción:", prediccion[0][0])
print("Loss final:", historial.history["loss"][-1])
print("Idea clave: model.fit entrena; model.predict predice después de entrenar.")
`;

    $("#colab-code").textContent = project.code;
    setStatus("#code-status", "Código generado para Colab.");
  }

  function exampleRow(length, offset) {
    return `[${Array.from({ length }, (_, index) => ((index + 1 + offset) % 5) / 4).join(", ")}]`;
  }

  function generateReport() {
    saveProject();
    const project = state.project;
    project.report = `# Reporte final · Clase 14

## Proyecto
- **Nombre:** ${project.name || "Sin definir"}
- **Usuario final:** ${project.user || "Sin definir"}
- **Qué quiere predecir:** ${project.prediction || "Sin definir"}

## Entradas y salida
- **Entradas:** ${(project.features.length ? project.features : ["Sin definir"]).join(", ")}
- **Salida esperada:** ${project.target || "Sin definir"}

## Explicación del aprendizaje
Una red neuronal no nace sabiendo. Recibe ejemplos, produce una predicción, compara contra el resultado real, calcula error o loss y ajusta pesos para equivocarse menos.

## Conexión con clases anteriores
- Clase 12: el agente decidía con una heurística.
- Clase 13: ajustamos confianza manualmente con feedback.
- Clase 14: el modelo ajusta pesos automáticamente con ejemplos.
- Clase 15: usaremos datos reales del proyecto.

## Herramientas
Python permite programar el ejemplo. Google Colab permite ejecutarlo sin instalar nada. TensorFlow es el motor de entrenamiento. Keras facilita construir, compilar, entrenar y predecir.

## Reflexión
${$("#student-reflection").value.trim() || "Pendiente de completar."}
`;
    $("#report-output").textContent = project.report;
    setStatus("#report-status", "Reporte generado.");
  }

  async function copyText(text, statusTarget) {
    if (!text) return setStatus(statusTarget, "Primero genera el contenido.");
    try {
      await navigator.clipboard.writeText(text);
      setStatus(statusTarget, "Copiado al portapapeles.");
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      setStatus(statusTarget, "Copiado al portapapeles.");
    }
  }

  function downloadText(content, filename, statusTarget) {
    if (!content) return setStatus(statusTarget, "Primero genera el contenido.");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    setStatus(statusTarget, `Descarga preparada: ${filename}`);
  }

  function clearCode() {
    state.project.code = "";
    $("#colab-code").textContent = "Completa el diseño de tu proyecto para generar un ejemplo base.";
    setStatus("#code-status", "Código limpiado.");
  }

  function clearReport() {
    state.project.report = "";
    $("#report-output").textContent = "Tu reporte aparecerá aquí.";
    setStatus("#report-status", "Reporte limpiado.");
  }

  function initSidebar() {
    const toggle = $("#sidebar-toggle");
    const overlay = $("#sidebar-overlay");
    const desktop = window.matchMedia("(min-width: 1051px)");
    const closeMobile = () => {
      document.body.classList.remove("sidebar-open");
      toggle.setAttribute("aria-expanded", desktop.matches ? String(!document.body.classList.contains("sidebar-collapsed")) : "false");
    };

    toggle.addEventListener("click", () => {
      if (desktop.matches) {
        document.body.classList.toggle("sidebar-collapsed");
        const expanded = !document.body.classList.contains("sidebar-collapsed");
        toggle.setAttribute("aria-expanded", String(expanded));
        $(".toggle-label", toggle).textContent = expanded ? "Ocultar" : "Mostrar";
      } else {
        document.body.classList.toggle("sidebar-open");
        toggle.setAttribute("aria-expanded", String(document.body.classList.contains("sidebar-open")));
      }
    });

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

  function bindEvents() {
    $("#heat-input").addEventListener("input", updateTrainingView);
    $("#target-input").addEventListener("input", updateTrainingView);
    $("#train-step").addEventListener("click", trainOneEpoch);
    $("#train-ten").addEventListener("click", () => {
      for (let i = 0; i < 10; i += 1) trainOneEpoch();
    });
    $("#reset-training").addEventListener("click", resetTraining);
    $("#project-form").addEventListener("submit", saveProject);
    $("#generate-code").addEventListener("click", generateCode);
    $("#copy-code").addEventListener("click", () => copyText(state.project.code, "#code-status"));
    $("#download-py").addEventListener("click", () => downloadText(state.project.code, `${normalizeId(state.project.name) || "clase14_red_neuronal"}.py`, "#code-status"));
    $("#clear-code").addEventListener("click", clearCode);
    $("#generate-report").addEventListener("click", generateReport);
    $("#copy-report").addEventListener("click", () => copyText(state.project.report, "#report-status"));
    $("#download-md").addEventListener("click", () => downloadText(state.project.report, `${normalizeId(state.project.name) || "reporte_clase14"}.md`, "#report-status"));
    $("#clear-report").addEventListener("click", clearReport);
  }

  function setStatus(selector, message) {
    const target = $(selector);
    if (target) target.textContent = message;
  }

  function pythonString(value) {
    return JSON.stringify(String(value || ""));
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;"
    })[char]);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initSidebar();
    bindEvents();
    updateTrainingView();
  });
})();

(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const normalizeId = (value) => String(value || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const parseCommaList = (value) => String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
  const sanitizePythonString = (value) => JSON.stringify(String(value || ""));
  const buildColumnsList = (value) => `[${parseCommaList(value).map(sanitizePythonString).join(", ")}]`;

  const trainingState = {
    guided: {
      cafeDataset: [
        { calor: 1, dulce: 1, frio: 1, hambre_alta: 0, presupuesto_bajo: 0, acepta: 1 },
        { calor: 1, dulce: 1, frio: 1, hambre_alta: 0, presupuesto_bajo: 1, acepta: 0 },
        { calor: 0, dulce: 1, frio: 0, hambre_alta: 1, presupuesto_bajo: 0, acepta: 0 },
        { calor: 1, dulce: 0, frio: 1, hambre_alta: 1, presupuesto_bajo: 0, acepta: 1 },
        { calor: 0, dulce: 0, frio: 0, hambre_alta: 1, presupuesto_bajo: 1, acepta: 0 }
      ],
      selectedTarget: "acepta",
      features: ["calor", "dulce", "frio", "hambre_alta", "presupuesto_bajo"],
      logs: []
    },
    student: {
      datasetName: "", datasetTopic: "", kaggleSource: "", rowCount: "", columnCount: "",
      predictionGoal: "", targetColumn: "", numericColumns: "", categoricalColumns: "", textColumns: "",
      dateColumns: "", idColumns: "", hasMissingValues: false, isBalanced: "", problemType: "binary",
      agentName: "", agentProblem: "", agentDecision: "", modelPredicts: "", positiveMeaning: "",
      negativeMeaning: "", agentUse: "", selectedFeatures: "", columnsToRemove: "", cleaningPlan: [],
      trainingConfig: { epochs: 50, testSize: 0.2, learningRate: 0.001, hiddenLayers: 2, neuronsLayer1: 16, neuronsLayer2: 8, type: "binary" },
      results: { loss: "", accuracy: "", lossDown: "", accuracyUp: "", predictionSense: "", notes: "", nextAdjustment: "" },
      colabCode: "", report: ""
    }
  };

  const tutorialSteps = [
    ["Descargar dataset", "Descarga el CSV desde Kaggle o súbelo manualmente a Colab."],
    ["Cargar CSV", "import pandas as pd\\ndf = pd.read_csv(\"mi_dataset.csv\")\\ndf.head()"],
    ["Explorar dataset", "df.info()\\ndf.describe()\\ndf.isna().sum()"],
    ["Elegir objetivo", "target = \"nombre_columna_objetivo\""],
    ["Separar X/y", "X = df.drop(columns=[target])\\ny = df[target]"],
    ["Eliminar irrelevantes", "X = X.drop(columns=[\"id\"], errors=\"ignore\")"],
    ["Limpiar vacíos", "X = X.fillna(X.median(numeric_only=True))"],
    ["Convertir categorías", "X = pd.get_dummies(X, drop_first=True)"],
    ["Convertir y", "y = y.map({\"No\": 0, \"Yes\": 1})"],
    ["Separar train/test", "train_test_split(..., test_size=0.2)"],
    ["Escalar datos", "StandardScaler().fit_transform(X_train)"],
    ["Crear modelo", "tf.keras.Sequential([...])"],
    ["Compilar", "model.compile(optimizer=\"adam\", loss=...)"],
    ["Entrenar", "history = model.fit(...)"],
    ["Evaluar", "loss, accuracy = model.evaluate(...)"],
    ["Graficar loss", "plt.plot(history.history[\"loss\"])"],
    ["Predecir", "predictions = model.predict(X_test_scaled)"],
    ["Interpretar", "Cerca de 1 = salida positiva; cerca de 0 = menor probabilidad."]
  ];

  function renderGuidedDataset() {
    const body = $("#guided-dataset");
    body.innerHTML = trainingState.guided.cafeDataset.map((row) => `<tr>${trainingState.guided.features.map((key) => `<td>${row[key]}</td>`).join("")}<td><strong>${row.acepta}</strong></td></tr>`).join("");
  }

  function renderTrainingFlow() {
    $("#tutorial-steps").innerHTML = tutorialSteps.map((step, index) => `<article><b>${index + 1}</b><h3>${escapeHtml(step[0])}</h3><p>${escapeHtml(step[1])}</p></article>`).join("");
  }

  function saveDatasetDiagnosis(event) {
    event?.preventDefault();
    const s = trainingState.student;
    s.datasetName = $("#dataset-name").value.trim();
    s.datasetTopic = $("#dataset-topic").value.trim();
    s.kaggleSource = $("#kaggle-source").value.trim();
    s.rowCount = $("#row-count").value.trim();
    s.columnCount = $("#column-count").value.trim();
    s.predictionGoal = $("#prediction-goal").value.trim();
    s.targetColumn = $("#target-column").value.trim();
    s.numericColumns = $("#numeric-columns").value.trim();
    s.categoricalColumns = $("#categorical-columns").value.trim();
    s.textColumns = $("#text-columns").value.trim();
    s.dateColumns = $("#date-columns").value.trim();
    s.idColumns = $("#id-columns").value.trim();
    s.hasMissingValues = $("#missing-values").value;
    s.isBalanced = $("#balanced-classes").value;
    s.problemType = $("#problem-type").value;
    analyzeDatasetStructure();
  }

  function analyzeDatasetStructure() {
    const s = trainingState.student;
    const items = [
      `Tu columna objetivo será y: ${s.targetColumn || "defínela antes de entrenar"}.`,
      `Tus columnas de entrada serán X: ${s.numericColumns || s.categoricalColumns ? "numéricas y categóricas seleccionadas" : "elige columnas útiles"}.`,
      s.idColumns ? `Elimina columnas ID: ${s.idColumns}.` : "Busca columnas ID, folio, nombre o URL y elimínalas si no aportan.",
      s.categoricalColumns ? "Convierte columnas categóricas con pd.get_dummies." : "Si aparecen categorías, conviértelas antes de entrenar.",
      s.hasMissingValues === "yes" ? "Revisa valores vacíos con fillna o dropna." : "Aun así revisa valores vacíos con df.isna().sum().",
      s.textColumns ? "Para texto largo, déjalo fuera por ahora o simplifícalo." : "Si hay texto largo en Kaggle, no lo mezcles al inicio.",
      s.problemType === "binary" ? "Si tu problema es sí/no, usa sigmoid y binary_crossentropy." : s.problemType === "regression" ? "Si predices un número, usa salida lineal y mean_squared_error." : "Si tiene varias categorías, usa softmax y una estrategia multiclase."
    ];
    $("#dataset-recommendations").innerHTML = `<strong>Recomendaciones:</strong><ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function savePredictiveProblem(event) {
    event.preventDefault();
    const s = trainingState.student;
    s.agentName = $("#agent-name").value.trim();
    s.agentProblem = $("#agent-problem").value.trim();
    s.agentDecision = $("#agent-decision").value.trim();
    s.modelPredicts = $("#model-predicts").value.trim();
    s.positiveMeaning = $("#positive-meaning").value.trim();
    s.negativeMeaning = $("#negative-meaning").value.trim();
    s.agentUse = $("#agent-use").value.trim();
    $("#problem-status").textContent = `${s.agentName || "Tu agente"} usará el modelo para ${s.modelPredicts || "apoyar una predicción"} y decidir ${s.agentDecision || "una acción"}.`;
  }

  function generateXYPlan(event) {
    event.preventDefault();
    const s = trainingState.student;
    s.targetColumn = $("#xy-target").value.trim() || s.targetColumn;
    s.selectedFeatures = $("#xy-features").value.trim();
    s.columnsToRemove = $("#xy-remove").value.trim();
    $("#xy-plan").innerHTML = `<strong>X/y propuesto</strong><p><b>X:</b> ${escapeHtml(s.selectedFeatures || "sin definir")}</p><p><b>y:</b> ${escapeHtml(s.targetColumn || "sin definir")}</p><p><b>Eliminar:</b> ${escapeHtml(s.columnsToRemove || "ninguna por ahora")}</p>`;
  }

  function saveXYPractice(event) {
    event.preventDefault();
    const s = trainingState.student;
    s.predictionGoal = $("#xy-practice-goal").value.trim();
    s.targetColumn = $("#xy-practice-target").value.trim();
    s.selectedFeatures = $("#xy-practice-features").value.trim();
    s.columnsToRemove = $("#xy-practice-remove").value.trim();
    renderXYPracticeSummary($("#xy-practice-reason").value.trim());
  }

  function renderXYPracticeSummary(reason = "") {
    const s = trainingState.student;
    const target = normalizeId(s.targetColumn);
    const features = parseCommaList(s.selectedFeatures);
    const normalizedFeatures = features.map(normalizeId);
    const hasTargetInsideX = target && normalizedFeatures.includes(target);
    const warning = hasTargetInsideX
      ? `<div class="xy-practice-warning">Cuidado: tu columna objetivo aparece también dentro de X. El modelo estaría viendo la respuesta. Elimina esa columna de las entradas.</div>`
      : "";
    $("#xy-practice-summary").innerHTML = `
      <strong>Tu separación X/y</strong>
      <p><b>Tu objetivo:</b> ${escapeHtml(s.predictionGoal || "sin definir")}</p>
      <p><b>Tu y:</b> ${escapeHtml(s.targetColumn || "sin definir")}</p>
      <p><b>Tus X:</b> ${escapeHtml(features.join(", ") || "sin definir")}</p>
      <p><b>Columnas que excluirás:</b> ${escapeHtml(s.columnsToRemove || "ninguna por ahora")}</p>
      <p><b>Por qué ayudan:</b> ${escapeHtml(reason || "pendiente de explicar")}</p>
      <p><b>Recomendación:</b> Revisa que tu y no esté dentro de X. Si aparece, elimínala de las entradas.</p>
      ${warning}`;
  }

  function generateCleaningPlan(event) {
    event.preventDefault();
    const selected = $$('input[type="checkbox"]:checked', $("#cleaning-form")).map((input) => input.value);
    const map = {
      missing: "Usa dropna si son pocos vacíos o fillna con mediana/desconocido.",
      categorical: "Usa pd.get_dummies para convertir categorías en 0/1.",
      text: "Quita texto largo por ahora o conviértelo a longitud.",
      dates: "Extrae año, mes o día si la fecha aporta señal.",
      ids: "Elimina IDs: suelen identificar filas, no patrones.",
      imbalanced: "Revisa distribución de clases; no confíes solo en accuracy.",
      scale: "Usa StandardScaler para columnas numéricas con escalas distintas.",
      many: "Empieza con una versión mínima con pocas columnas útiles."
    };
    trainingState.student.cleaningPlan = selected.map((key) => map[key]);
    $("#cleaning-plan").innerHTML = trainingState.student.cleaningPlan.length ? `<ol>${trainingState.student.cleaningPlan.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>` : "Marca al menos una condición para crear tu plan.";
  }

  function saveTrainingConfig(event) {
    event.preventDefault();
    trainingState.student.trainingConfig = {
      type: $("#training-type").value,
      epochs: Number($("#epochs").value) || 50,
      testSize: Number($("#test-size").value) || 0.2,
      learningRate: Number($("#learning-rate").value) || 0.001,
      hiddenLayers: Number($("#hidden-layers").value) || 2,
      neuronsLayer1: Number($("#neurons-1").value) || 16,
      neuronsLayer2: Number($("#neurons-2").value) || 8
    };
    $("#training-status").textContent = `Configuración guardada: ${trainingState.student.trainingConfig.epochs} épocas, test_size ${trainingState.student.trainingConfig.testSize}, learning rate ${trainingState.student.trainingConfig.learningRate}.`;
  }

  function interpretResults(event) {
    event.preventDefault();
    const s = trainingState.student;
    s.results = {
      loss: $("#result-loss").value.trim(),
      accuracy: $("#result-accuracy").value.trim(),
      lossDown: $("#loss-down").value,
      accuracyUp: $("#accuracy-up").value,
      predictionSense: $("#prediction-sense").value,
      notes: $("#result-notes").value.trim(),
      nextAdjustment: $("#next-adjustment").value.trim()
    };
    const guide = [];
    if (s.results.lossDown !== "Sí") guide.push("Si loss no baja: revisa datos, objetivo, vacíos, escalado o baja learning rate.");
    if (s.results.accuracyUp === "Sí" && s.isBalanced === "No") guide.push("Accuracy alta puede ser sospechosa si las clases están desbalanceadas.");
    if (s.results.predictionSense !== "Sí") guide.push("Si la predicción no tiene sentido: revisa X/y, encoding y si el dataset contiene el patrón.");
    $("#results-guide").innerHTML = guide.length ? `<ul>${guide.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "Resultados coherentes. Documenta evidencia y prueba casos nuevos.";
  }

  function generateBinaryClassificationCode() {
    const s = trainingState.student;
    const target = s.targetColumn || "target";
    const remove = buildColumnsList(s.columnsToRemove || s.idColumns);
    const epochs = s.trainingConfig.epochs;
    return `# Clase 15 - Entrenamiento de modelo con dataset de Kaggle
# Dataset: ${s.datasetName || "mi_dataset"}

import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

df = pd.read_csv("mi_dataset.csv")
print(df.head())
print(df.info())
print(df.isna().sum())

target = ${sanitizePythonString(target)}
X = df.drop(columns=[target])
y = df[target]

# Eliminar columnas que no ayudan al aprendizaje
X = X.drop(columns=${remove}, errors="ignore")

# Limpiar valores vacíos
X = X.fillna(X.median(numeric_only=True))
X = X.fillna("desconocido")

# Convertir categorías a números 0/1
X = pd.get_dummies(X, drop_first=True)

# Si y viene como Sí/No, ajusta este mapeo a los valores reales de tu dataset
if y.dtype == "object":
    y = y.astype("category").cat.codes

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=${s.trainingConfig.testSize}, random_state=42
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = tf.keras.Sequential([
    tf.keras.layers.Dense(${s.trainingConfig.neuronsLayer1}, activation="relu", input_shape=[X_train_scaled.shape[1]]),
    tf.keras.layers.Dense(${s.trainingConfig.neuronsLayer2}, activation="relu"),
    tf.keras.layers.Dense(1, activation="sigmoid")
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=${s.trainingConfig.learningRate}),
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

history = model.fit(
    X_train_scaled, y_train,
    epochs=${epochs},
    validation_split=0.2,
    verbose=True
)

loss, accuracy = model.evaluate(X_test_scaled, y_test)
print("Loss:", loss)
print("Accuracy:", accuracy)

plt.plot(history.history["loss"], label="loss")
plt.plot(history.history["val_loss"], label="val_loss")
plt.legend()
plt.show()

predictions = model.predict(X_test_scaled)
predicted_classes = (predictions >= 0.5).astype(int)
print(predictions[:10])
print(predicted_classes[:10])

# Reflexión:
# ¿El loss bajó? ¿La accuracy subió? ¿Las predicciones tienen sentido para tu agente?
`;
  }

  function generateRegressionCode() {
    return generateBinaryClassificationCode()
      .replace('tf.keras.layers.Dense(1, activation="sigmoid")', 'tf.keras.layers.Dense(1)')
      .replace(`loss="binary_crossentropy",
    metrics=["accuracy"]`, `loss="mean_squared_error",
    metrics=["mae"]`)
      .replace(`predicted_classes = (predictions >= 0.5).astype(int)
print(predictions[:10])
print(predicted_classes[:10])`, "print(predictions[:10])");
  }

  function generateMulticlassNotes() {
    return `\n# Nota multiclase:\n# Para clasificación multiclase necesitas codificar y, usar una salida softmax\n# y elegir sparse_categorical_crossentropy o categorical_crossentropy según tu codificación.\n`;
  }

  function generateColabCode() {
    const type = trainingState.student.trainingConfig.type || trainingState.student.problemType;
    trainingState.student.colabCode = type === "regression" ? generateRegressionCode() : generateBinaryClassificationCode();
    if (type === "multiclass") trainingState.student.colabCode += generateMulticlassNotes();
    $("#colab-code").textContent = trainingState.student.colabCode;
    setStatus("#code-status", "Código Colab generado con los datos actuales.");
  }

  function generateFinalReport() {
    const s = trainingState.student;
    s.report = `# Reporte final · Clase 15

## Identificación
- Alumno/equipo: ${$("#student-name").value.trim() || "Sin definir"}
- Agente: ${s.agentName || "Sin definir"}
- Dataset usado: ${s.datasetName || "Sin definir"}
- Fuente Kaggle: ${s.kaggleSource || "Sin definir"}

## Problema
- Problema que resuelve: ${s.agentProblem || "Sin definir"}
- Qué quiere predecir: ${s.predictionGoal || s.modelPredicts || "Sin definir"}
- Columna objetivo: ${s.targetColumn || "Sin definir"}
- Columnas de entrada: ${s.selectedFeatures || s.numericColumns || "Sin definir"}
- Columnas eliminadas: ${s.columnsToRemove || s.idColumns || "Sin definir"}
- Tipo de problema: ${s.trainingConfig.type || s.problemType || "Sin definir"}

## Preparación
- Limpieza realizada: ${s.cleaningPlan.join("; ") || "Pendiente"}
- Conversión de categorías: ${s.categoricalColumns ? "Requiere pd.get_dummies" : "No definida"}
- Configuración: ${s.trainingConfig.epochs} épocas, test_size ${s.trainingConfig.testSize}, learning rate ${s.trainingConfig.learningRate}

## Resultados
- Loss: ${s.results.loss || "Sin registrar"}
- Accuracy: ${s.results.accuracy || "Sin registrar"}
- Interpretación: ${s.results.notes || "Pendiente"}
- Predicción de ejemplo: pendiente de completar en Colab.

## Integración al agente
${s.agentUse || "El modelo dará una señal predictiva adicional al agente."}

## Problemas encontrados
${$("#project-issues").value.trim() || "Pendiente"}

## Siguiente mejora
${s.results.nextAdjustment || "Probar más datos, limpiar mejor y comparar métricas."}
`;
    $("#report-output").textContent = s.report;
    setStatus("#report-status", "Reporte final generado.");
  }

  async function copyText(text, statusTarget) {
    if (!text) return setStatus(statusTarget, "Primero genera el contenido.");
    try { await navigator.clipboard.writeText(text); setStatus(statusTarget, "Copiado al portapapeles."); }
    catch {
      const area = document.createElement("textarea"); area.value = text; document.body.append(area); area.select(); document.execCommand("copy"); area.remove(); setStatus(statusTarget, "Copiado al portapapeles.");
    }
  }

  function downloadText(content, filename, statusTarget) {
    if (!content) return setStatus(statusTarget, "Primero genera el contenido.");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    link.download = filename; link.click(); URL.revokeObjectURL(link.href);
    setStatus(statusTarget, `Descarga preparada: ${filename}`);
  }

  function initCleanSidebar() {
    const toggle = $("#sidebar-toggle");
    const overlay = $("#sidebar-overlay");
    const desktop = window.matchMedia("(min-width: 1051px)");
    const closeMobile = () => { document.body.classList.remove("sidebar-open"); toggle.setAttribute("aria-expanded", desktop.matches ? String(!document.body.classList.contains("sidebar-collapsed")) : "false"); };
    toggle.addEventListener("click", toggleSidebar);
    overlay.addEventListener("click", closeMobile);
    $$("#lesson-sidebar a").forEach((link) => link.addEventListener("click", () => { if (!desktop.matches) closeMobile(); }));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMobile(); });
    desktop.addEventListener("change", closeMobile);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (!entry.isIntersecting) return; $$("#lesson-sidebar nav a").forEach((link) => link.classList.toggle("active", link.hash === `#${entry.target.id}`)); });
    }, { rootMargin: "-25% 0px -65%" });
    $$("main section[id]").forEach((section) => observer.observe(section));
  }

  function toggleSidebar() {
    const desktop = window.matchMedia("(min-width: 1051px)").matches;
    const toggle = $("#sidebar-toggle");
    if (desktop) {
      document.body.classList.toggle("sidebar-collapsed");
      const expanded = !document.body.classList.contains("sidebar-collapsed");
      toggle.setAttribute("aria-expanded", String(expanded));
      $(".toggle-label", toggle).textContent = expanded ? "Ocultar" : "Mostrar";
    } else {
      document.body.classList.toggle("sidebar-open");
      toggle.setAttribute("aria-expanded", String(document.body.classList.contains("sidebar-open")));
    }
  }

  function clearColabCode() { trainingState.student.colabCode = ""; $("#colab-code").textContent = "Completa el laboratorio para generar código personalizado."; setStatus("#code-status", "Código limpiado."); }
  function clearFinalReport() { trainingState.student.report = ""; $("#report-output").textContent = "Tu reporte aparecerá aquí."; setStatus("#report-status", "Reporte limpiado."); }
  function setStatus(selector, message) { const target = $(selector); if (target) target.textContent = message; }
  function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" })[char]); }

  function bindEvents() {
    $("#dataset-form").addEventListener("submit", saveDatasetDiagnosis);
    $("#problem-form").addEventListener("submit", savePredictiveProblem);
    $("#xy-form").addEventListener("submit", generateXYPlan);
    $("#xy-practice-form").addEventListener("submit", saveXYPractice);
    $("#cleaning-form").addEventListener("submit", generateCleaningPlan);
    $("#training-form").addEventListener("submit", saveTrainingConfig);
    $("#results-form").addEventListener("submit", interpretResults);
    $("#generate-code").addEventListener("click", generateColabCode);
    $("#copy-code").addEventListener("click", () => copyText(trainingState.student.colabCode, "#code-status"));
    $("#download-py").addEventListener("click", () => downloadText(trainingState.student.colabCode, `${normalizeId(trainingState.student.datasetName) || "clase15_modelo"}.py`, "#code-status"));
    $("#download-code-txt").addEventListener("click", () => downloadText(trainingState.student.colabCode, `${normalizeId(trainingState.student.datasetName) || "clase15_modelo"}.txt`, "#code-status"));
    $("#clear-code").addEventListener("click", clearColabCode);
    $("#generate-report").addEventListener("click", generateFinalReport);
    $("#copy-report").addEventListener("click", () => copyText(trainingState.student.report, "#report-status"));
    $("#download-md").addEventListener("click", () => downloadText(trainingState.student.report, `${normalizeId(trainingState.student.agentName) || "reporte_clase15"}.md`, "#report-status"));
    $("#download-report-txt").addEventListener("click", () => downloadText(trainingState.student.report, `${normalizeId(trainingState.student.agentName) || "reporte_clase15"}.txt`, "#report-status"));
    $("#clear-report").addEventListener("click", clearFinalReport);
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderGuidedDataset();
    renderTrainingFlow();
    initCleanSidebar();
    bindEvents();
  });
})();

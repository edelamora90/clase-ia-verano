document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("columns-input");
  const originalOutput = document.getElementById("original-output");
  const resultOutput = document.getElementById("result-output");
  const codeOutput = document.getElementById("code-output");
  const explanationOutput = document.getElementById("explanation-output");
  const warningOutput = document.getElementById("warning-output");
  const copyButton = document.getElementById("copy-code");
  const actions = Array.from(document.querySelectorAll(".sandbox-action"));

  if (
    !input ||
    !originalOutput ||
    !resultOutput ||
    !codeOutput ||
    !explanationOutput ||
    !warningOutput ||
    !copyButton ||
    !actions.length
  ) {
    console.error("Faltan elementos del sandbox.");
    return;
  }

  const config = {
    detect: {
      code: `df_limpio.columns`,
      explanation:
        "Detecta cuántas columnas hay y cómo están escritas antes de empezar la limpieza.",
      warning:
        "Error común: empezar a programar sin revisar cómo vienen escritos los nombres de las columnas."
    },

    trim: {
      code: `df_limpio.columns = df_limpio.columns.str.strip()`,
      explanation:
        "Quita espacios vacíos al inicio y al final de cada encabezado. No quita espacios internos como el espacio entre Precio y MXN.",
      warning:
        'Error común: un nombre como " Precio MXN " parece normal, pero tiene espacios escondidos al inicio y al final.'
    },

    lower: {
      code: `df_limpio.columns = df_limpio.columns.str.lower()`,
      explanation:
        "Convierte todos los nombres a minúsculas para que el código sea más consistente.",
      warning:
        "Error común: mezclar mayúsculas y minúsculas hace más fácil equivocarte al escribir una columna."
    },

    normalize: {
      code: `df_limpio.columns = (
    df_limpio.columns
    .str.normalize("NFKD")
    .str.encode("ascii", errors="ignore")
    .str.decode("utf-8")
)`,
      explanation:
        'Quita acentos y caracteres especiales. Por ejemplo: "Calificación" pasa a "Calificacion".',
      warning:
        "Error común: dejar acentos en columnas que después quieres usar muchas veces en Python."
    },

    snake: {
      code: `df_limpio.columns = df_limpio.columns.str.replace(" ", "_")`,
      explanation:
        "Reemplaza espacios internos por guion bajo. Esto convierte nombres como Precio MXN en Precio_MXN.",
      warning:
        'Error común: confundir strip() con replace(). strip() quita espacios externos; replace(" ", "_") cambia espacios internos.'
    },

    full: {
      code: `df_limpio.columns = (
    df_limpio.columns
    .str.strip()
    .str.lower()
    .str.normalize("NFKD")
    .str.encode("ascii", errors="ignore")
    .str.decode("utf-8")
    .str.replace(" ", "_")
)`,
      explanation:
        "Aplica la limpieza completa recomendada: quita espacios externos, pasa a minúsculas, elimina acentos y convierte espacios internos en guion bajo.",
      warning:
        "Error común: automatizar la limpieza y no revisar el resultado final con df_limpio.columns."
    }
  };

  let currentAction = "detect";

  function removeAccents(value) {
    return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  }

  function parseColumns() {
    return input.value
      .split(",")
      .map((value) => value)
      .filter((value) => value.length > 0);
  }

  function transformColumns(columns, action) {
    switch (action) {
      case "detect":
        return columns.map((value) => value);

      case "trim":
        return columns.map((value) => value.trim());

      case "lower":
        return columns.map((value) => value.trim().toLowerCase());

      case "normalize":
        return columns.map((value) => removeAccents(value.trim()));

      case "snake":
        return columns.map((value) => value.trim().replace(/\s+/g, "_"));

      case "full":
        return columns.map((value) =>
          removeAccents(value.trim().toLowerCase()).replace(/\s+/g, "_")
        );

      default:
        return columns.map((value) => value);
    }
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function visualizeSpaces(value) {
    const safe = escapeHtml(value);

    return safe
      .replace(/^ +/, (match) => {
        return `<span class="space-mark">${"·".repeat(match.length)}</span>`;
      })
      .replace(/ +$/, (match) => {
        return `<span class="space-mark">${"·".repeat(match.length)}</span>`;
      });
  }

  function renderChips(target, values) {
    if (!values.length) {
      target.innerHTML = `<span class="chip empty">Sin columnas detectadas</span>`;
      return;
    }

    target.innerHTML = values
      .map((value) => `<span class="chip">${visualizeSpaces(value)}</span>`)
      .join("");
  }

  function highlightPython(rawCode) {
    let html = escapeHtml(rawCode);

    html = html.replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\n]*"|'[^'\n]*')/g, '<span class="tok-string">$1</span>');
    html = html.replace(/\b(None|True|False|import|from|as|for|in|if|else|return|print)\b/g, '<span class="tok-keyword">$1</span>');
    html = html.replace(/\b(pd|StringIO|df_limpio)\b/g, '<span class="tok-builtin">$1</span>');
    html = html.replace(/(\.[a-zA-Z_][a-zA-Z0-9_]*)/g, '<span class="tok-method">$1</span>');

    return html;
  }

  function setActiveButton(action) {
    actions.forEach((button) => {
      button.classList.toggle("active", button.dataset.action === action);
    });
  }

  function updateSandbox() {
    const originalColumns = parseColumns();
    const transformedColumns = transformColumns(originalColumns, currentAction);
    const selected = config[currentAction];

    renderChips(originalOutput, originalColumns);
    renderChips(resultOutput, transformedColumns);

    codeOutput.innerHTML = highlightPython(selected.code);
    explanationOutput.textContent = selected.explanation;
    warningOutput.textContent = selected.warning;

    setActiveButton(currentAction);
  }

  actions.forEach((button) => {
    button.addEventListener("click", () => {
      currentAction = button.dataset.action;
      updateSandbox();
    });
  });

  input.addEventListener("input", updateSandbox);

  copyButton.addEventListener("click", async () => {
    const previousText = copyButton.textContent;

    try {
      await navigator.clipboard.writeText(config[currentAction].code);
      copyButton.textContent = "Copiado";
    } catch {
      copyButton.textContent = "Copia manual";
    }

    setTimeout(() => {
      copyButton.textContent = previousText;
    }, 1200);
  });

  updateSandbox();
});

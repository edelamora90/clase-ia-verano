(() => {
  const STORAGE_KEY = 'clase7NotebookLabProgress';
  const TOTAL_XP = 100;

  const XP_MAP = {
    setup: 8,
    colabGuide: 10,
    notebook: 8,
    python: 8,
    pandas: 8,
    csv: 8,
    sandbox: 12,
    validation: 10,
    challenge: 10,
    diagnosis: 10,
    evidence: 8
  };

  const COMMANDS = {
    upload: {
      title: 'Subir archivo',
      code: 'from google.colab import files\nuploaded = files.upload()',
      explanation: 'Este comando no abre el CSV para verlo. En Google Colab muestra un botón para elegir un archivo desde tu computadora y subir una copia temporal al notebook.',
      output: 'En Colab pasaría esto:\n\n1. Aparece un botón para seleccionar archivo.\n2. Eliges tu CSV desde tu computadora.\n3. Colab sube una copia temporal del archivo.\n4. El archivo queda disponible en la sesión actual.\n5. Después puedes leerlo con pd.read_csv("dataset-clase6.csv").\n\nNo tienes que cerrar nada. Solo asegúrate de usar el mismo nombre del archivo.',
      error: 'Error común: subir dataset-clase6.csv, pero después escribir otro nombre en read_csv(), por ejemplo pd.read_csv("dataset.csv"). El nombre debe coincidir exactamente.'
    },
    import: {
      title: 'Importar pandas',
      code: 'import pandas as pd',
      explanation: 'Carga pandas, la librería que permite trabajar con tablas de datos.',
      output: 'Pandas cargado correctamente como pd.',
      error: 'Error común: escribir panda en lugar de pandas.'
    },
    read: {
      title: 'Leer CSV',
      code: 'df = pd.read_csv("dataset-clase6.csv")',
      explanation: 'Abre el archivo CSV y lo guarda en una variable llamada df.',
      output: 'Dataset cargado correctamente.\nFilas: 5\nColumnas: 6',
      error: 'Error común: olvidar las comillas del nombre del archivo o escribir un nombre distinto.'
    },
    head: {
      title: 'Ver primeras filas',
      code: 'df.head()',
      explanation: 'Muestra las primeras filas del dataset para revisar si cargó bien.',
      output: tableOutput([
        ['horario', 'clima', 'presupuesto', 'gusto', 'nivel_hambre', 'recomendacion'],
        ['mañana', 'frío', '50', 'amargo', 'bajo', 'café americano'],
        ['tarde', 'calor', '80', 'dulce', 'medio', 'frappé'],
        ['noche', 'lluvia', '60', 'ligero', 'bajo', 'té caliente'],
        ['mañana', 'calor', '70', 'dulce', 'alto', 'combo escolar']
      ]),
      error: 'Al revisar head(), busca columnas mal nombradas, valores vacíos o datos que no tengan sentido.',
      html: true
    },
    shape: {
      title: 'Filas y columnas',
      code: 'df.shape',
      explanation: 'Muestra el tamaño del dataset: primero filas, después columnas.',
      output: '(5, 6)\nSignifica: 5 filas y 6 columnas.',
      error: 'Error común: confundir el orden. En pandas es filas primero, columnas después.'
    },
    columns: {
      title: 'Nombres de columnas',
      code: 'df.columns',
      explanation: 'Muestra los nombres de las columnas del dataset.',
      output: "Index(['Sabor', 'tipo de leche', 'tamaño', 'precio'], dtype='object')",
      error: 'Revisa mayúsculas, espacios, acentos, nombres repetidos y columnas sin unidad.'
    },
    info: {
      title: 'Estructura del dataset',
      code: 'df.info()',
      explanation: 'Muestra columnas, valores no vacíos y tipos de datos.',
      output: 'Columnas:\nhorario          5 valores no vacíos    texto\nclima            5 valores no vacíos    texto\npresupuesto      5 valores no vacíos    número\ngusto            4 valores no vacíos    texto\nnivel_hambre     5 valores no vacíos    texto\nrecomendacion    5 valores no vacíos    texto',
      error: 'Si una columna tiene menos valores no vacíos, significa que hay datos faltantes.'
    },
    describe: {
      title: 'Estadísticas numéricas',
      code: 'df.describe()',
      explanation: 'Muestra estadísticas de columnas numéricas, como promedio, mínimo y máximo.',
      output: tableOutput([
        ['', 'presupuesto'],
        ['count', '5'],
        ['mean', '72'],
        ['min', '50'],
        ['max', '100']
      ]),
      error: 'Si ves valores negativos o demasiado altos, puede haber errores de captura.',
      html: true
    },
    nulls: {
      title: 'Datos faltantes',
      code: 'df.isnull().sum()',
      explanation: 'Cuenta cuántos valores vacíos hay por columna.',
      output: 'horario          0\nclima            0\npresupuesto      0\ngusto            1\nnivel_hambre     0\nrecomendacion    0',
      error: 'Un dato faltante en una variable importante puede afectar la decisión de la IA.'
    },
    counts: {
      title: 'Contar categorías',
      code: 'df["recomendacion"].value_counts()',
      explanation: 'Cuenta cuántas veces aparece cada valor en una columna.',
      output: 'frappé              2\ncafé americano      1\nté caliente         1\ncombo escolar       1',
      error: 'Si una categoría aparece demasiado o está escrita de muchas formas, puede haber desbalance o inconsistencia.'
    },
    sample: {
      title: 'Muestra aleatoria',
      code: 'df.sample(5)',
      explanation: 'Muestra filas aleatorias. Es útil para revisar ejemplos distintos, no solo los primeros.',
      output: tableOutput([
        ['horario', 'clima', 'presupuesto', 'gusto', 'recomendacion'],
        ['noche', 'lluvia', '60', 'ligero', 'té caliente'],
        ['tarde', 'calor', '80', 'dulce', 'frappé'],
        ['mañana', 'frío', '50', 'amargo', 'café americano']
      ]),
      error: 'Si solo usas head(), podrías no ver errores que aparecen más abajo en el dataset.',
      html: true
    },
    dtypes: {
      title: 'Tipos de dato',
      code: 'df.dtypes',
      explanation: 'Muestra el tipo de dato de cada columna. Ayuda a detectar números cargados como texto.',
      output: 'horario           object\nclima             object\npresupuesto        int64\ngusto             object\nrecomendacion     object',
      error: 'Si presupuesto aparece como object, puede tener símbolos, espacios o textos mezclados.'
    },
    missingPercent: {
      title: 'Porcentaje de datos faltantes',
      code: '(df.isnull().mean() * 100).round(2)',
      explanation: 'Calcula qué porcentaje de cada columna está vacío. Es más informativo que solo contar nulos.',
      output: 'horario           0.00\nclima             0.00\npresupuesto       0.00\ngusto            20.00\nrecomendacion     0.00',
      error: 'Una columna crítica con muchos faltantes puede debilitar el dataset.'
    },
    duplicates: {
      title: 'Registros duplicados',
      code: 'df.duplicated().sum()',
      explanation: 'Cuenta filas repetidas. Los duplicados pueden sesgar el análisis.',
      output: '2\nSignifica que hay 2 filas exactamente repetidas.',
      error: 'No todos los duplicados son errores, pero siempre deben revisarse.'
    },
    unique: {
      title: 'Valores únicos por columna',
      code: 'df.nunique()',
      explanation: 'Cuenta cuántos valores diferentes tiene cada columna.',
      output: 'horario          3\nclima            3\npresupuesto      5\ngusto            4\nrecomendacion    4',
      error: 'Si una columna tiene demasiados valores únicos sin necesidad, quizá no es buena como categoría.'
    },
    cleanColumns: {
      title: 'Limpiar nombres de columnas',
      code: `df.columns = (
    df.columns
      .str.strip()
      .str.lower()
      .str.normalize('NFKD')
      .str.encode('ascii', errors='ignore')
      .str.decode('utf-8')
      .str.replace(' ', '_')
)`,
      explanation: 'Normaliza nombres de columnas: recorta espacios, usa minúsculas, quita acentos y reemplaza espacios por guiones bajos.',
      output: "Columnas limpias:\n['sabor', 'tipo_leche', 'tamano', 'precio']",
      error: 'Después de limpiar, revisa si conviene renombrar columnas para agregar unidades como precio_mxn.'
    },
    renameColumns: {
      title: 'Renombrar columnas manualmente',
      code: `df = df.rename(columns={
    "tipo de leche": "tipo_leche",
    "tamaño": "tamano",
    "precio": "precio_mxn"
})`,
      explanation: 'Cambia nombres específicos cuando ya sabes cómo quieres que se llamen las columnas.',
      output: "Columnas renombradas:\n['sabor', 'tipo_leche', 'tamano', 'precio_mxn']",
      error: 'Error común: escribir el nombre original distinto a como aparece en df.columns.'
    },
    selectDirtyColumn: {
      title: 'Seleccionar columna con espacio',
      code: 'df["tipo de leche"]',
      explanation: 'Pandas puede seleccionar columnas con espacios usando corchetes y el nombre exacto.',
      output: '0          Entera\n1    Deslactosada\nName: tipo de leche, dtype: object',
      error: 'Si escribes tipo_leche pero la columna real es "tipo de leche", pandas marcará KeyError.'
    },
    selectCleanColumn: {
      title: 'Seleccionar columna limpia',
      code: 'df["tipo_leche"]',
      explanation: 'Con snake_case el código queda más limpio, consistente y fácil de reutilizar.',
      output: '0          entera\n1    deslactosada\nName: tipo_leche, dtype: object',
      error: 'Los nombres limpios reducen errores, pero deben coincidir exactamente con df.columns.'
    },
    normalizeText: {
      title: 'Normalizar una columna de texto',
      code: 'df["recomendacion"] = df["recomendacion"].str.strip().str.lower()',
      explanation: 'Limpia espacios y convierte categorías a minúsculas para evitar duplicados falsos.',
      output: 'Antes: Frappé, frappe, FRAPPE\nDespués: frappé, frappe, frappe',
      error: 'Normalizar no siempre corrige acentos o errores de escritura. A veces hay que reemplazar manualmente.'
    },
    filterRows: {
      title: 'Filtrar filas',
      code: 'df[df["presupuesto"] >= 80]',
      explanation: 'Filtra registros que cumplen una condición. Sirve para analizar subconjuntos.',
      output: tableOutput([
        ['horario', 'clima', 'presupuesto', 'recomendacion'],
        ['tarde', 'calor', '80', 'frappé'],
        ['mañana', 'calor', '100', 'combo escolar']
      ]),
      error: 'Si presupuesto está como texto, el filtro numérico puede fallar o dar resultados incorrectos.',
      html: true
    },
    groupby: {
      title: 'Agrupar datos',
      code: 'df.groupby("clima")["presupuesto"].mean()',
      explanation: 'Agrupa por una categoría y calcula una métrica. Aquí calcula presupuesto promedio por clima.',
      output: 'clima\ncalor     85\nfrío      50\nlluvia    60',
      error: 'groupby ayuda a encontrar patrones, pero no prueba causalidad.'
    },
    crosstab: {
      title: 'Tabla cruzada',
      code: 'pd.crosstab(df["clima"], df["recomendacion"])',
      explanation: 'Cruza dos variables categóricas para ver relaciones entre ellas.',
      output: tableOutput([
        ['clima', 'café americano', 'frappé', 'té caliente'],
        ['calor', '0', '2', '0'],
        ['frío', '1', '0', '0'],
        ['lluvia', '0', '0', '1']
      ]),
      error: 'Una tabla cruzada con pocos datos puede mostrar patrones engañosos.',
      html: true
    },
    corr: {
      title: 'Correlación numérica',
      code: 'df[["presupuesto", "nivel_hambre_num"]].corr()',
      explanation: 'Mide relación entre columnas numéricas. Solo aplica a variables numéricas.',
      output: tableOutput([
        ['', 'presupuesto', 'nivel_hambre_num'],
        ['presupuesto', '1.00', '0.62'],
        ['nivel_hambre_num', '0.62', '1.00']
      ]),
      error: 'Correlación no significa causalidad. Además, no sirve directamente con texto sin convertirlo.',
      html: true
    },
    selectXY: {
      title: 'Separar entradas y objetivo',
      code: 'X = df[["horario", "clima", "presupuesto", "gusto"]]\ny = df["recomendacion"]',
      explanation: 'Separa variables de entrada X y variable objetivo y. Este paso prepara el dataset para entrenamiento supervisado.',
      output: 'X contiene las columnas de entrada.\ny contiene la respuesta esperada que el modelo intentará aprender.',
      error: 'Si eliges mal la variable objetivo, el modelo aprenderá una tarea incorrecta.'
    }
  };

  function tableOutput(rows) {
    const [header, ...body] = rows;

    return `
      <div class="class7-table-wrap">
        <table class="class7-table compact">
          <thead>
            <tr>${header.map(cell => `<th>${cell}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${body.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function $(selector) {
    return document.querySelector(selector);
  }

  function $all(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function readProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function markMission(key) {
    const progress = readProgress();
    progress[key] = true;
    saveProgress(progress);
    updateXP();
    // // updateClass7ProgressBar(); // removido // removido: función inexistente
  }

  function updateXP() {
    const progress = readProgress();
    const total = Object.entries(XP_MAP).reduce((sum, [key, xp]) => {
      return sum + (progress[key] ? xp : 0);
    // // updateClass7ProgressBar(); // removido // removido: función inexistente
    }, 0);

    const label = $('#c7-xp-label');
    const bar = $('#c7-xp-bar');

    if (label) label.textContent = `${total} / ${TOTAL_XP} XP`;
    if (bar) bar.style.width = `${Math.min(total, TOTAL_XP)}%`;
  }

  function getField(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setField(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
  }

  function initStart() {
    const btn = $('#c7-start');
    if (!btn) return;

    btn.addEventListener('click', () => {
      document.querySelector('[data-section="2"]')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  function initChecklist() {
    const setupChecks = $all('[data-c7-mission="setup"]');
    setupChecks.forEach(check => {
      check.addEventListener('change', () => {
        const completed = setupChecks.filter(item => item.checked).length;

        if (completed >= 3) {
          markMission('setup');
        }
      });
    });

    const colabGuideChecks = $all('[data-c7-mission="colabGuide"]');
    colabGuideChecks.forEach(check => {
      check.addEventListener('change', () => {
        const completed = colabGuideChecks.filter(item => item.checked).length;

        if (completed >= 4) {
          markMission('colabGuide');
        }
      });
    });
  }

  function initQuizzes() {
    $all('.class7-quiz').forEach(quiz => {
      const feedback = quiz.querySelector('.class7-feedback');
      const quizType = quiz.dataset.quiz;

      quiz.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          const ok = btn.dataset.answer === 'ok';

          quiz.querySelectorAll('button').forEach(item => {
            item.classList.remove('is-correct', 'is-wrong');
          });

          btn.classList.add(ok ? 'is-correct' : 'is-wrong');

          if (feedback) {
            feedback.textContent = ok
              ? 'Correcto. Entendiste el concepto.'
              : 'Revisa la explicación e inténtalo otra vez.';
          }

          if (ok) {
            if (quizType === 'notebook') markMission('notebook');
            if (quizType === 'pandas') markMission('pandas');
            if (quizType === 'csv') markMission('csv');
          }
        });
      });
    });
  }

  function initBasicPython() {
    const printBtn = $('[data-run-basic="print"]');
    const mathBtn = $('[data-run-basic="math"]');

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        const output = $('#c7-basic-output');
        if (output) output.textContent = 'Mi primer análisis de datos';
        markMission('python');
      });
    }

    if (mathBtn) {
      mathBtn.addEventListener('click', () => {
        const output = $('#c7-math-output');
        if (output) output.textContent = '5';
        markMission('python');
      });
    }

    const buildBtn = $('#c7-build-print');
    if (buildBtn) {
      buildBtn.addEventListener('click', () => {
        const topic = getField('c7-dataset-topic') || 'mi proyecto';
        const code = $('#c7-print-code');

        if (code) {
          code.textContent = `print("Mi dataset es de ${topic}")`;
        }

        markMission('python');
      });
    }
  }

  function renderCommand(commandKey) {
    const command = COMMANDS[commandKey] || COMMANDS.upload;

    const title = $('#c7-command-title');
    const code = $('#c7-command-code');
    const explanation = $('#c7-command-explanation');
    const output = $('#c7-command-output');
    const error = $('#c7-command-error');

    if (title) title.textContent = command.title;
    if (code) code.textContent = command.code;
    if (explanation) explanation.textContent = command.explanation;
    if (output) output.textContent = 'Resultado pendiente...';
    if (error) error.textContent = command.error;
  }

  function runCommand(commandKey) {
    const command = COMMANDS[commandKey] || COMMANDS.upload;
    const output = $('#c7-command-output');

    if (!output) return;

    if (command.html) {
      output.innerHTML = command.output;
    } else {
      output.textContent = command.output;
    }

    markMission('sandbox');
  }


  function initSandboxAccordion() {
    const groups = $all('.class7-command-group');

    groups.forEach(group => {
      const toggle = group.querySelector('.class7-command-group-toggle');

      if (!toggle) return;

      toggle.addEventListener('click', () => {
        const isOpen = group.classList.contains('is-open');

        groups.forEach(item => {
          item.classList.remove('is-open');
        });

        if (!isOpen) {
          group.classList.add('is-open');
        }
      });
    });

    $all('.class7-command-group-panel [data-command]').forEach(commandBtn => {
      commandBtn.addEventListener('click', () => {
        const parentGroup = commandBtn.closest('.class7-command-group');

        groups.forEach(item => {
          item.classList.remove('is-open');
        });

        if (parentGroup) {
          parentGroup.classList.add('is-open');
        }
      });
    });
  }


  function initSandbox() {
    let activeCommand = 'upload';

    $all('[data-command]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCommand = btn.dataset.command;

        $all('[data-command]').forEach(item => item.classList.remove('active'));
        btn.classList.add('active');

        renderCommand(activeCommand);
      });
    });

    const runBtn = $('#c7-run-command');
    if (runBtn) {
      runBtn.addEventListener('click', () => {
        runCommand(activeCommand);
      });
    }

    renderCommand(activeCommand);
  }


  function escapeHTML(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function parseCSVLine(line, options = {}) {
    const shouldTrim = options.trim !== false;
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"' && next === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(shouldTrim ? current.trim() : current);
        current = '';
      } else {
        current += char;
      }
    }

    values.push(shouldTrim ? current.trim() : current);
    return values;
  }

  function toSnakeCaseHeader(header) {
    let clean = String(header || '')
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_+/g, '_');

    clean = clean
      .split('_')
      .filter(part => !['de', 'del', 'la', 'el', 'los', 'las'].includes(part))
      .join('_');

    const unitMap = {
      precio: 'precio_mxn',
      costo: 'costo_mxn',
      peso: 'peso_kg',
      tiempo: 'tiempo_min',
      distancia: 'distancia_km',
      edad: 'edad_anios',
      cantidad: 'cantidad_unidades'
    };

    if (unitMap[clean]) {
      clean = unitMap[clean];
    }

    return clean || 'columna_sin_nombre';
  }

  function makeUniqueHeaders(headers) {
    const seen = {};

    return headers.map(header => {
      const base = header || 'columna_sin_nombre';
      seen[base] = (seen[base] || 0) + 1;
      return seen[base] === 1 ? base : `${base}_${seen[base]}`;
    });
  }

  function validateHeaders(header, body) {
    const structural = [];
    const cleanup = [];
    const suggestions = header.map(toSnakeCaseHeader);
    const uniqueSuggestions = makeUniqueHeaders(suggestions);
    const normalizedCounts = {};
    const genericPattern = /^(dato|columna|campo)_?\d*$/i;
    const unitCandidates = ['precio', 'costo', 'tiempo', 'peso', 'distancia', 'edad', 'cantidad'];

    header.forEach(column => {
      const normalized = column.trim().toLowerCase();
      normalizedCounts[normalized] = (normalizedCounts[normalized] || 0) + 1;
    });

    if (header.length < 2) {
      structural.push('El encabezado tiene menos de 2 columnas.');
    }

    header.forEach((column, index) => {
      const trimmed = column.trim();
      const suggested = uniqueSuggestions[index];
      const label = column || '(vacío)';
      const lower = trimmed.toLowerCase();
      const ascii = trimmed.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
      const rawSnake = ascii
        .toLowerCase()
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_+/g, '_');

      if (!trimmed) {
        structural.push(`"${label}": encabezado vacío. Sugerido: ${suggested}`);
        return;
      }

      if (normalizedCounts[lower] > 1) {
        structural.push(`"${label}": encabezado repetido. Sugerido: ${suggested}`);
      }

      if (column !== trimmed) {
        cleanup.push(`"${label}": tiene espacios al inicio o final. Sugerido: ${suggested}`);
      }

      if (/\s/.test(trimmed)) {
        cleanup.push(`"${label}": contiene espacios. Sugerido: ${suggested}`);
      }

      if (trimmed !== lower) {
        cleanup.push(`"${label}": usa mayúsculas. Sugerido: ${suggested}`);
      }

      if (ascii !== trimmed) {
        cleanup.push(`"${label}": contiene acento. Sugerido: ${suggested}`);
      }

      if (/[^A-Za-z0-9_\sáéíóúÁÉÍÓÚñÑ]/.test(trimmed)) {
        cleanup.push(`"${label}": contiene caracteres especiales. Sugerido: ${suggested}`);
      }

      if (trimmed.length > 24) {
        cleanup.push(`"${label}": nombre demasiado largo. Sugerido: ${suggested}`);
      }

      if (genericPattern.test(trimmed)) {
        cleanup.push(`"${label}": nombre demasiado genérico. Sugerido: ${suggested}`);
      }

      if (unitCandidates.includes(rawSnake)) {
        cleanup.push(`"${label}": considera agregar unidad. Sugerido: ${suggested}`);
      }
    });

    body.forEach((row, index) => {
      if (row.length !== header.length) {
        structural.push(`La fila ${index + 2} tiene ${row.length} columnas, pero el encabezado tiene ${header.length}.`);
      }
    });

    return {
      cleanup,
      structural,
      suggestedHeaders: uniqueSuggestions
    };
  }

  function renderHeaderValidator(header, body, validation, rawLines) {
    const status = $('#c7-header-status');
    const detected = $('#c7-detected-headers');
    const recommended = $('#c7-recommended-headers');
    const issues = $('#c7-header-issues');
    const recommendedCsv = $('#c7-recommended-csv');

    if (!status || !detected || !recommended || !issues || !recommendedCsv) return;

    let statusText = 'CSV listo para análisis';
    let statusClass = 'is-ok';

    if (validation.structural.length) {
      statusText = 'CSV con errores estructurales';
      statusClass = 'is-bad';
    } else if (validation.cleanup.length) {
      statusText = 'CSV usable pero necesita limpieza';
      statusClass = 'is-warning';
    }

    status.textContent = statusText;
    status.className = statusClass;

    detected.innerHTML = header.length
      ? header.map(column => `<code>${escapeHTML(column || '(vacío)')}</code>`).join('')
      : 'Sin encabezados detectados.';

    recommended.innerHTML = validation.suggestedHeaders.length
      ? validation.suggestedHeaders.map(column => `<code>${escapeHTML(column)}</code>`).join('')
      : 'Sin sugerencias.';

    const allIssues = [
      ...validation.structural.map(item => ({ type: 'bad', item })),
      ...validation.cleanup.map(item => ({ type: 'warning', item }))
    ];

    if (allIssues.length) {
      issues.innerHTML = `
        <strong>Problemas encontrados</strong>
        <ul>
          ${allIssues.map(issue => `<li class="${issue.type === 'bad' ? 'is-bad' : 'is-warning'}">${escapeHTML(issue.item)}</li>`).join('')}
        </ul>
      `;
    } else {
      issues.innerHTML = `
        <strong>Sin problemas detectados</strong>
        <p>Los encabezados están en snake_case, son consistentes y se pueden usar cómodamente en pandas.</p>
      `;
    }

    recommendedCsv.textContent = [
      validation.suggestedHeaders.join(','),
      ...rawLines.slice(1)
    ].join('\n');

    if (!validation.structural.length) {
      markMission('csv');
    }
  }

  function parseRawCSV() {
    const raw = getField('c7-raw-csv');
    const tableRoot = $('#c7-live-csv-table');
    const feedback = $('#c7-csv-parse-feedback');

    if (!tableRoot || !feedback) return;

    if (!raw) {
      tableRoot.innerHTML = '';
      feedback.innerHTML = '<strong>CSV vacío.</strong><p>Escribe encabezados y al menos una fila.</p>';
      feedback.className = 'class7-csv-feedback is-warning';
      renderHeaderValidator([], [], { cleanup: [], structural: ['CSV vacío.'], suggestedHeaders: [] }, []);
      return;
    }

    const lines = raw.split(/\r?\n/).filter(line => line.trim());
    const rows = lines.map(line => parseCSVLine(line, { trim: false }));
    const header = rows[0] || [];
    const body = rows.slice(1);
    const validation = validateHeaders(header, body);

    tableRoot.innerHTML = `
      <table class="class7-table compact">
        <thead>
          <tr>${header.map(cell => `<th>${escapeHTML(cell.trim() || '(sin nombre)')}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${body.map(row => `
            <tr>
              ${header.map((_, index) => `<td>${escapeHTML((row[index] || '').trim())}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    renderHeaderValidator(header, body, validation, lines);

    if (validation.structural.length) {
      feedback.className = 'class7-csv-feedback is-bad';
      feedback.innerHTML = `
        <strong>CSV con problemas estructurales</strong>
        <ul>${validation.structural.map(problem => `<li>${escapeHTML(problem)}</li>`).join('')}</ul>
      `;
    } else if (validation.cleanup.length) {
      feedback.className = 'class7-csv-feedback is-warning';
      feedback.innerHTML = `
        <strong>CSV usable pero necesita limpieza</strong>
        <p>La tabla se puede interpretar, pero conviene limpiar los encabezados antes de trabajar en pandas.</p>
      `;
    } else {
      feedback.className = 'class7-csv-feedback is-ok';
      feedback.innerHTML = `
        <strong>CSV listo para análisis</strong>
        <p>Columnas detectadas: ${header.length}. Registros detectados: ${body.length}.</p>
      `;
    }
  }

  function initLiveCSV() {
    const textarea = $('#c7-raw-csv');
    const parseBtn = $('#c7-parse-csv');
    const goodBtn = $('#c7-load-good-csv');
    const badBtn = $('#c7-load-bad-csv');

    if (textarea) {
      textarea.addEventListener('input', parseRawCSV);
    }

    if (parseBtn) {
      parseBtn.addEventListener('click', parseRawCSV);
    }

    const examples = {
      good: `sabor,tipo_leche,tamano,precio_mxn
vainilla,entera,grande,65
chocolate,deslactosada,mediano,58`,
      spaces: `Sabor,tipo de leche,tamaño,precio
Vainilla,Entera,Grande,65
Chocolate,Deslactosada,Mediano,58`,
      accents: `sabor,tamaño,azúcar,precio
vainilla,grande,baja,65
chocolate,mediano,media,58`,
      duplicates: `sabor,sabor,tamano,precio_mxn
vainilla,frappe,grande,65
chocolate,caliente,mediano,58`,
      incomplete: `sabor,tipo_leche,tamano,precio_mxn
vainilla,entera,grande,65
chocolate,deslactosada,mediano`
    };

    if (goodBtn) {
      goodBtn.addEventListener('click', () => {
        setField('c7-raw-csv', examples.good);
        parseRawCSV();
      });
    }

    $all('[data-c7-csv-example]').forEach(btn => {
      btn.addEventListener('click', () => {
        setField('c7-raw-csv', examples[btn.dataset.c7CsvExample] || examples.good);
        parseRawCSV();
      });
    });

    if (badBtn && !badBtn.dataset.c7CsvExample) {
      badBtn.addEventListener('click', () => {
        setField('c7-raw-csv', examples.incomplete);
        parseRawCSV();
      });
    }

    parseRawCSV();
  }

  function splitList(value) {
    return String(value || '')
      .split(/,|\n/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  function validateDataset() {
    const root = $('#c7-validation-result');
    if (!root) return;

    const rows = Number(getField('c7-rows') || 0);
    const columns = Number(getField('c7-columns') || 0);
    const inputs = splitList(getField('c7-input-vars'));
    const target = getField('c7-target-var');
    const problems = getSelectedProblems();
    const findings = getField('c7-findings');
    const actions = getField('c7-actions');

    let score = 0;
    const ok = [];
    const warnings = [];
    const critical = [];

    if (rows >= 30) {
      score += 20;
      ok.push('Tiene una cantidad aceptable de registros para una primera exploración.');
    } else if (rows >= 10) {
      score += 10;
      warnings.push('Tiene pocos registros. Puede servir para practicar, pero no para un modelo confiable.');
    } else {
      critical.push('Tiene muy pocos registros. Necesita más ejemplos antes de pensar en IA.');
    }

    if (columns >= 4) {
      score += 10;
      ok.push('Tiene suficientes columnas para describir los casos.');
    } else {
      warnings.push('Tiene pocas columnas. Revisa si faltan variables importantes de entrada.');
    }

    if (inputs.length >= 3) {
      score += 20;
      ok.push('Tiene al menos 3 variables de entrada.');
    } else {
      critical.push('Faltan variables de entrada. La IA necesita datos para tomar una decisión.');
    }

    if (target) {
      score += 20;
      ok.push('Tiene variable objetivo definida.');
    } else {
      critical.push('No tiene variable objetivo. No está listo para entrenamiento supervisado.');
    }

    if (!problems.includes('Datos faltantes')) {
      score += 10;
    } else {
      warnings.push('Hay datos faltantes. Debes decidir si se completan, se preguntan o se eliminan.');
    }

    if (!problems.includes('Categorías inconsistentes')) {
      score += 5;
    } else {
      warnings.push('Hay categorías inconsistentes. Debes normalizar texto antes de usar IA.');
    }

    if (!problems.includes('Dataset desbalanceado')) {
      score += 5;
    } else {
      warnings.push('El dataset puede estar desbalanceado. El modelo podría aprender a responder siempre la categoría dominante.');
    }

    if (findings && actions) {
      score += 10;
      ok.push('Incluye interpretación y acciones de mejora.');
    } else {
      warnings.push('Falta interpretación o acciones de mejora. Ejecutar comandos no basta; debes explicar qué significan.');
    }

    let status = 'Dataset débil';
    let statusClass = 'is-bad';

    if (score >= 80 && critical.length === 0) {
      status = 'Listo para una primera prueba controlada';
      statusClass = 'is-ok';
    } else if (score >= 55) {
      status = 'Parcialmente listo';
      statusClass = 'is-warning';
    }

    root.hidden = false;
    root.className = `class7-validation-result ${statusClass}`;
    root.innerHTML = `
      <strong>${status}</strong>
      <p>Puntaje de preparación: <b>${score}/100</b></p>

      ${critical.length ? `<h4>Problemas críticos</h4><ul>${critical.map(item => `<li>${item}</li>`).join('')}</ul>` : ''}
      ${warnings.length ? `<h4>Advertencias</h4><ul>${warnings.map(item => `<li>${item}</li>`).join('')}</ul>` : ''}
      ${ok.length ? `<h4>Fortalezas</h4><ul>${ok.map(item => `<li>${item}</li>`).join('')}</ul>` : ''}

      <p><b>Recomendación:</b> ${score >= 80 && critical.length === 0
        ? 'Puedes usarlo para una primera prueba educativa, pero sigue documentando supuestos y limitaciones.'
        : 'Mejora el dataset antes de usarlo para IA. Prioriza variable objetivo, variables de entrada, más registros y limpieza de categorías.'}</p>
    `;

    markMission('validation');
  }

  function initDatasetValidation() {
    const btn = $('#c7-validate-dataset');
    if (btn) btn.addEventListener('click', validateDataset);
  }

  function validateFinalChallenge() {
    const root = $('#c7-final-challenge-result');
    if (!root) return;

    const answers = [
      getField('c7-challenge-1'),
      getField('c7-challenge-2'),
      getField('c7-challenge-3'),
      getField('c7-challenge-4')
    ];

    const explanation = getField('c7-challenge-explanation');
    const correct = answers.filter(answer => answer === 'ok').length;

    const explanationOk = explanation.length >= 80;
    const passed = correct >= 3 && explanationOk;

    root.hidden = false;
    root.className = `class7-validation-result ${passed ? 'is-ok' : 'is-warning'}`;
    root.innerHTML = `
      <strong>${passed ? 'Reto integrador aprobado' : 'Reto integrador incompleto'}</strong>
      <p>Respuestas correctas: <b>${correct}/4</b></p>
      <p>Justificación: <b>${explanationOk ? 'suficiente' : 'demasiado breve'}</b></p>
      <p>${passed
        ? 'Tu interpretación ya conecta comandos, calidad de datos y preparación para IA.'
        : 'Revisa los casos. No se trata de memorizar comandos, sino de decidir qué acción tomar según el problema del dataset.'}</p>
    `;

    if (passed) markMission('challenge');
  }

  function initFinalChallenge() {
    const btn = $('#c7-check-final-challenge');
    if (btn) btn.addEventListener('click', validateFinalChallenge);
  }



  function normalizeHeaderNameForDiagnosis(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s_]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  function parseCSVForDiagnosis(raw) {
    const lines = String(raw || '')
      .split(/\r?\n/)
      .filter(line => line.trim());

    if (!lines.length) {
      return {
        headers: [],
        rows: [],
        structuralProblems: ['El CSV está vacío.']
      };
    }

    const parsedRows = lines.map(parseCSVLine);
    const headers = parsedRows[0] || [];
    const rows = parsedRows.slice(1);
    const structuralProblems = [];

    if (headers.length < 2) {
      structuralProblems.push('El encabezado tiene menos de 2 columnas.');
    }

    headers.forEach((header, index) => {
      if (!header.trim()) {
        structuralProblems.push(`La columna ${index + 1} no tiene nombre.`);
      }
    });

    const normalizedHeaders = headers.map(header => normalizeHeaderNameForDiagnosis(header));
    const repeated = normalizedHeaders.filter((header, index) => {
      return header && normalizedHeaders.indexOf(header) !== index;
    });

    if (repeated.length) {
      structuralProblems.push(`Hay encabezados repetidos: ${[...new Set(repeated)].join(', ')}.`);
    }

    rows.forEach((row, index) => {
      if (row.length !== headers.length) {
        structuralProblems.push(`La fila ${index + 2} tiene ${row.length} columnas, pero el encabezado tiene ${headers.length}.`);
      }
    });

    return {
      headers,
      normalizedHeaders,
      rows,
      structuralProblems
    };
  }

  function detectHeaderQualityProblems(headers) {
    const problems = [];

    headers.forEach(header => {
      const original = String(header || '');
      const clean = normalizeHeaderNameForDiagnosis(original);

      if (!original.trim()) {
        problems.push('Hay un encabezado vacío.');
        return;
      }

      if (original !== original.trim()) {
        problems.push(`"${original}" tiene espacios al inicio o al final.`);
      }

      if (/\s/.test(original.trim())) {
        problems.push(`"${original}" contiene espacios. Sugerido: "${clean}".`);
      }

      if (/[A-ZÁÉÍÓÚÑ]/.test(original)) {
        problems.push(`"${original}" usa mayúsculas. Sugerido: "${clean}".`);
      }

      if (/[áéíóúÁÉÍÓÚñÑ]/.test(original)) {
        problems.push(`"${original}" contiene acentos o ñ. Sugerido: "${clean}".`);
      }

      if (/[^a-zA-Z0-9_ áéíóúÁÉÍÓÚñÑ]/.test(original)) {
        problems.push(`"${original}" contiene caracteres especiales. Sugerido: "${clean}".`);
      }

      if (original.length > 28) {
        problems.push(`"${original}" es demasiado largo. Conviene usar un nombre más corto.`);
      }

      if (/^(dato|campo|columna)_?\d+$/i.test(original.trim())) {
        problems.push(`"${original}" es demasiado genérico. Usa un nombre descriptivo.`);
      }

      if (/^(precio|costo)$/i.test(original.trim())) {
        problems.push(`"${original}" debería indicar moneda. Sugerido: "precio_mxn".`);
      }

      if (/^(tiempo)$/i.test(original.trim())) {
        problems.push(`"${original}" debería indicar unidad. Sugerido: "tiempo_min".`);
      }

      if (/^(peso)$/i.test(original.trim())) {
        problems.push(`"${original}" debería indicar unidad. Sugerido: "peso_kg".`);
      }
    });

    return [...new Set(problems)];
  }

  function detectMissingValues(headers, rows) {
    const missing = [];

    headers.forEach((header, columnIndex) => {
      const count = rows.filter(row => {
        return !String(row[columnIndex] || '').trim();
      }).length;

      if (count > 0) {
        missing.push(`${header || `columna_${columnIndex + 1}`} tiene ${count} valor(es) faltante(s).`);
      }
    });

    return missing;
  }

  function detectDuplicatedRows(rows) {
    const seen = new Set();
    let duplicates = 0;

    rows.forEach(row => {
      const key = row.join('|').toLowerCase();
      if (seen.has(key)) duplicates += 1;
      seen.add(key);
    });

    return duplicates;
  }

  function inferTargetColumn(headers) {
    const normalized = headers.map(header => normalizeHeaderNameForDiagnosis(header));

    const targetPatterns = [
      'recomendacion',
      'clase_recomendada',
      'producto_recomendado',
      'servicio_recomendado',
      'platillo_recomendado',
      'categoria',
      'riesgo_detectado',
      'salida_esperada',
      'respuesta',
      'resultado',
      'objetivo',
      'target',
      'label'
    ];

    const foundIndex = normalized.findIndex(header => {
      return targetPatterns.some(pattern => header.includes(pattern));
    });

    if (foundIndex >= 0) {
      return {
        index: foundIndex,
        name: normalized[foundIndex] || headers[foundIndex]
      };
    }

    return {
      index: headers.length - 1,
      name: normalizeHeaderNameForDiagnosis(headers[headers.length - 1]) || headers[headers.length - 1] || ''
    };
  }

  function setProblemCheckboxesFromAutoDiagnosis(problemLabels) {
    const checks = $all('.c7-problem');

    checks.forEach(check => {
      check.checked = false;
    });

    problemLabels.forEach(label => {
      const check = checks.find(item => item.value === label);
      if (check) check.checked = true;
    });
  }

  function autofillDiagnosisFromCSV() {
    const raw = getField('c7-raw-csv');
    const validationRoot = $('#c7-validation-result');

    if (!raw) {
      if (validationRoot) {
        validationRoot.hidden = false;
        validationRoot.className = 'class7-validation-result is-bad';
        validationRoot.innerHTML = `
          <strong>No hay CSV para diagnosticar</strong>
          <p>Primero escribe o carga un CSV en la sección "CSV crudo editable".</p>
        `;
      }
      return;
    }

    const parsed = parseCSVForDiagnosis(raw);
    const headers = parsed.headers;
    const normalizedHeaders = headers.map(header => normalizeHeaderNameForDiagnosis(header));
    const rows = parsed.rows;

    const headerProblems = detectHeaderQualityProblems(headers);
    const missingValues = detectMissingValues(headers, rows);
    const duplicates = detectDuplicatedRows(rows);
    const target = inferTargetColumn(headers);

    const inputs = normalizedHeaders.filter((header, index) => {
      return index !== target.index && header;
    });

    const problemLabels = [];

    if (missingValues.length) {
      problemLabels.push('Datos faltantes');
    }

    if (headerProblems.length) {
      problemLabels.push('Categorías inconsistentes');
    }

    if (parsed.structuralProblems.length) {
      problemLabels.push('Valores raros o fuera de rango');
    }

    if (rows.length < 10) {
      problemLabels.push('Faltan registros');
    }

    setField('c7-dataset-name', 'dataset-clase7.csv');
    setField('c7-rows', String(rows.length));
    setField('c7-columns', String(headers.length));
    setField('c7-input-vars', inputs.join(', '));
    setField('c7-target-var', target.name);

    setProblemCheckboxesFromAutoDiagnosis(problemLabels);

    const findings = [];

    findings.push(`El CSV tiene ${rows.length} registros y ${headers.length} columnas.`);
    findings.push(`La variable objetivo probable es "${target.name}".`);
    findings.push(`Las variables de entrada detectadas son: ${inputs.join(', ') || 'no detectadas'}.`);

    if (parsed.structuralProblems.length) {
      findings.push(`Se detectaron problemas estructurales: ${parsed.structuralProblems.join(' ')}`);
    }

    if (headerProblems.length) {
      findings.push(`Los encabezados necesitan limpieza: ${headerProblems.join(' ')}`);
    }

    if (missingValues.length) {
      findings.push(`Hay datos faltantes: ${missingValues.join(' ')}`);
    }

    if (duplicates > 0) {
      findings.push(`Hay ${duplicates} fila(s) duplicada(s).`);
    }

    if (rows.length < 10) {
      findings.push('El dataset tiene pocos registros; sirve para práctica, pero no para entrenar un modelo confiable.');
    }

    const actions = [];

    if (headerProblems.length) {
      actions.push('Normalizar encabezados a snake_case, sin espacios, sin acentos y con unidades cuando aplique.');
    }

    if (missingValues.length) {
      actions.push('Completar datos faltantes o definir una regla clara para tratarlos como "desconocido".');
    }

    if (parsed.structuralProblems.length) {
      actions.push('Corregir filas que tienen más o menos columnas que el encabezado.');
    }

    if (duplicates > 0) {
      actions.push('Revisar filas duplicadas y eliminar las que sean errores de captura.');
    }

    if (rows.length < 30) {
      actions.push('Recolectar más registros antes de usar el dataset para una prueba de IA más seria.');
    }

    if (!target.name) {
      actions.push('Definir una variable objetivo clara: recomendacion, categoria, riesgo_detectado, salida_esperada, etc.');
    }

    if (!actions.length) {
      actions.push('El dataset tiene una estructura inicial aceptable. El siguiente paso es explorarlo en Colab con pandas.');
    }

    setField('c7-findings', findings.join('\n'));
    setField('c7-actions', actions.map(item => `- ${item}`).join('\n'));

    let readyStatus = 'Está parcialmente listo';
    let conclusion = 'El dataset está parcialmente listo porque tiene una estructura inicial útil, pero todavía debe revisarse en Colab con pandas antes de usarlo para IA.';

    if (parsed.structuralProblems.length || !target.name || inputs.length < 2) {
      readyStatus = 'Todavía no está listo';
      conclusion = 'El dataset todavía no está listo porque tiene problemas estructurales o no define claramente suficientes variables de entrada y una variable objetivo.';
    } else if (!headerProblems.length && !missingValues.length && rows.length >= 30 && inputs.length >= 3 && target.name) {
      readyStatus = 'Sí está listo';
      conclusion = 'El dataset está listo para una primera prueba controlada porque tiene encabezados limpios, suficientes registros, variables de entrada y una variable objetivo clara.';
    }

    const radio = document.querySelector(`input[name="c7-ready"][value="${readyStatus}"]`);
    if (radio) radio.checked = true;

    setField('c7-conclusion', conclusion);

    validateDataset();
    markMission('diagnosis');
  }

  function initAutoDiagnosis() {
    const btn = $('#c7-autofill-diagnosis');
    if (btn) {
      btn.addEventListener('click', autofillDiagnosisFromCSV);
    }
  }


  function getSelectedProblems() {
    return $all('.c7-problem')
      .filter(check => check.checked)
      .map(check => check.value);
  }

  function getReadyStatus() {
    const selected = document.querySelector('input[name="c7-ready"]:checked');
    return selected ? selected.value : '[No seleccionado]';
  }


  function getValidationScoreFromText() {
    const validationText = $('#c7-validation-result')?.innerText || '';
    const match = validationText.match(/Puntaje de preparación:\s*(\d+)\/100/i);

    if (match) {
      return Number(match[1]);
    }

    return 0;
  }

  function getFinalChallengeScore() {
    const answers = [
      getField('c7-challenge-1'),
      getField('c7-challenge-2'),
      getField('c7-challenge-3'),
      getField('c7-challenge-4')
    ];

    const correct = answers.filter(answer => answer === 'ok').length;
    const explanation = getField('c7-challenge-explanation');
    const explanationScore = explanation.length >= 120 ? 20 : explanation.length >= 80 ? 15 : explanation.length >= 40 ? 8 : 0;

    return Math.round((correct / 4) * 80 + explanationScore);
  }

  function calculateSuggestedGrade() {
    const validationScore = getValidationScoreFromText();
    const challengeScore = getFinalChallengeScore();

    const hasDatasetName = Boolean(getField('c7-dataset-name'));
    const hasRows = Boolean(getField('c7-rows'));
    const hasColumns = Boolean(getField('c7-columns'));
    const hasInputs = Boolean(getField('c7-input-vars'));
    const hasTarget = Boolean(getField('c7-target-var'));
    const hasFindings = getField('c7-findings').length >= 40;
    const hasActions = getField('c7-actions').length >= 40;
    const hasConclusion = getField('c7-conclusion').length >= 60;

    let completionScore = 0;
    if (hasDatasetName) completionScore += 8;
    if (hasRows) completionScore += 8;
    if (hasColumns) completionScore += 8;
    if (hasInputs) completionScore += 12;
    if (hasTarget) completionScore += 12;
    if (hasFindings) completionScore += 18;
    if (hasActions) completionScore += 18;
    if (hasConclusion) completionScore += 16;

    const finalGrade = Math.round(
      (validationScore * 0.40) +
      (challengeScore * 0.35) +
      (completionScore * 0.25)
    );

    let level = 'Insuficiente';
    let recommendation = 'Requiere rehacer o completar la evidencia. Debe corregir estructura, interpretación y justificación.';

    if (finalGrade >= 90) {
      level = 'Excelente';
      recommendation = 'Puede considerarse evidencia sobresaliente. El alumno demuestra análisis, criterio técnico y buena interpretación.';
    } else if (finalGrade >= 80) {
      level = 'Bueno';
      recommendation = 'Puede considerarse evidencia aprobatoria sólida. Hay comprensión general con detalles menores por mejorar.';
    } else if (finalGrade >= 70) {
      level = 'Suficiente';
      recommendation = 'Puede aprobar, pero conviene pedir correcciones puntuales antes de considerar el dataset listo.';
    } else if (finalGrade >= 60) {
      level = 'En desarrollo';
      recommendation = 'Muestra avance, pero necesita mejorar diagnóstico, limpieza o justificación antes de aprobar completamente.';
    }

    return {
      validationScore,
      challengeScore,
      completionScore,
      finalGrade,
      level,
      recommendation
    };
  }

  function buildSuggestedGradeText() {
    const grade = calculateSuggestedGrade();

    return `CALIFICACIÓN SUGERIDA

Calificación sugerida: ${grade.finalGrade}/100
Nivel: ${grade.level}

Desglose:
- Validación del dataset: ${grade.validationScore}/100
- Reto integrador: ${grade.challengeScore}/100
- Evidencia completada: ${grade.completionScore}/100

Criterio:
Esta calificación es una sugerencia automática para apoyar la revisión docente. La calificación final debe considerar la explicación oral, el notebook de Colab y la calidad real del CSV entregado.

Recomendación docente:
${grade.recommendation}`;
  }


  function generateReport() {
    const datasetName = getField('c7-dataset-name') || '[No registrado]';
    const rows = getField('c7-rows') || '[No registrado]';
    const columns = getField('c7-columns') || '[No registrado]';
    const inputVars = getField('c7-input-vars') || '[No registradas]';
    const targetVar = getField('c7-target-var') || '[No registrada]';
    const problems = getSelectedProblems();
    const findings = getField('c7-findings') || '[No registrados]';
    const actions = getField('c7-actions') || '[No registradas]';
    const ready = getReadyStatus();
    const conclusion = getField('c7-conclusion') || '[No registrada]';

    const report = `EVIDENCIA CLASE 7 — PRIMER NOTEBOOK IA

Dataset analizado:
${datasetName}

Tamaño del dataset:
- Filas: ${rows}
- Columnas: ${columns}

Variables de entrada:
${inputVars}

Variable objetivo:
${targetVar}

Comandos usados o practicados:
- import pandas as pd
- df = pd.read_csv("dataset.csv")
- df.head()
- df.shape
- df.columns
- df.info()
- df.describe()
- df.isnull().sum()
- df["columna"].value_counts()

Problemas encontrados:
${problems.length ? problems.map(item => `- ${item}`).join('\n') : '- No se registraron problemas'}

Hallazgos principales:
${findings}

Acciones de mejora:
${actions}

Validación automática:
${$('#c7-validation-result')?.innerText || '[No generada]'}

Conclusión:
Estado del dataset: ${ready}

${conclusion}

Reflexión:
Antes de usar IA, revisé si mi dataset tiene estructura clara, variables útiles, valores faltantes y problemas que puedan afectar la calidad de la solución.`;

    validateDataset();
    setField('c7-final-report', report);
    markMission('diagnosis');
    markMission('evidence');
  }

  function initDiagnosis() {
    const fields = [
      'c7-dataset-name',
      'c7-rows',
      'c7-columns',
      'c7-input-vars',
      'c7-target-var',
      'c7-findings',
      'c7-actions',
      'c7-conclusion'
    ];

    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          const filled = fields.filter(fieldId => getField(fieldId)).length;
          if (filled >= 5) markMission('diagnosis');
        });
      }
    });

    const btn = $('#c7-generate-report');
    if (btn) btn.addEventListener('click', generateReport);

    const finalBtn = $('#c7-generate-final-report');
    if (finalBtn) finalBtn.addEventListener('click', generateReport);
  }

  function initCopyReport() {
    const btn = $('#c7-copy-report');
    if (!btn) return;

    btn.addEventListener('click', async () => {
      const report = getField('c7-final-report');

      if (!report) {
        generateReport();
      }

      try {
        await navigator.clipboard.writeText(getField('c7-final-report'));
        btn.textContent = 'Evidencia copiada';
        setTimeout(() => {
          btn.textContent = 'Copiar evidencia';
        }, 1600);
      } catch {
        alert('No se pudo copiar automáticamente. Copia el texto manualmente.');
      }
    });
  }

  function initReset() {
    const btn = $('#c7-reset');
    if (!btn) return;

    btn.addEventListener('click', () => {
      if (!confirm('¿Reiniciar el progreso de la Clase 7?')) return;

      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    });
  }


  function initImageLightbox() {
    const lightbox = $('#class7-image-lightbox');
    const lightboxImg = $('#class7-lightbox-img');
    const lightboxCaption = $('#class7-lightbox-caption');
    const closeBtn = $('#class7-lightbox-close');

    if (!lightbox || !lightboxImg || !lightboxCaption) return;

    function openLightbox(img) {
      const figure = img.closest('figure');
      const caption = figure?.querySelector('figcaption')?.textContent || img.alt || 'Imagen ampliada';

      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || caption;
      lightboxCaption.textContent = caption;
      lightbox.hidden = false;
      document.body.classList.add('class7-lightbox-open');
    }

    function closeLightbox() {
      lightbox.hidden = true;
      lightboxImg.src = '';
      lightboxCaption.textContent = '';
      document.body.classList.remove('class7-lightbox-open');
    }

    document.addEventListener('click', event => {
      const img = event.target.closest('.class7-omes-gallery img, .class7-colab-guide img, .class7-colab-image img, .class7-omes-figure img');

      if (img) {
        openLightbox(img);
        return;
      }

      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeLightbox);
    }

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !lightbox.hidden) {
        closeLightbox();
      }
    });
  }



  function updateClass7ProgressBar() {
    const xpElement = document.getElementById('c7-xp');
    const fillElement = document.getElementById('c7-progress-fill');

    if (!xpElement || !fillElement) return;

    const rawXP = Number(String(xpElement.textContent || '0').replace(/[^\d]/g, ''));
    const safeXP = Math.max(0, Math.min(100, rawXP));

    fillElement.style.width = `${safeXP}%`;
    fillElement.setAttribute('aria-valuenow', String(safeXP));
  }



  function initClass7ProgressObserver() {
    const xpElement = document.getElementById('c7-xp');
    if (!xpElement) return;

    // // updateClass7ProgressBar(); // removido // removido: función inexistente

    const observer = new MutationObserver(updateClass7ProgressBar);
    observer.observe(xpElement, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }



  function updateClass7MissionProgress() {
    const xpValue = document.getElementById('c7-xp-value');
    const xpLabel = document.getElementById('c7-xp-label');
    const fill = document.getElementById('c7-progress-fill');
    const oldFill = document.getElementById('c7-xp-bar');
    const text = document.getElementById('c7-progress-text');

    let xp = 0;

    if (xpLabel) {
      const match = String(xpLabel.textContent || '').match(/\d+/);
      if (match) xp = Number(match[0]);
    }

    if (!xp && xpValue) {
      const match = String(xpValue.textContent || '').match(/\d+/);
      if (match) xp = Number(match[0]);
    }

    const safeXP = Math.max(0, Math.min(100, xp));

    if (xpValue) xpValue.textContent = `${safeXP} XP`;
    if (fill) fill.style.width = `${safeXP}%`;
    if (oldFill) oldFill.style.width = `${safeXP}%`;

    if (text) {
      text.textContent = safeXP >= 100
        ? 'Misión completada. Insignia desbloqueada.'
        : `Te faltan ${100 - safeXP} XP para desbloquear la insignia.`;
    }
  }

  function initClass7MissionProgress() {
    // // updateClass7MissionProgress(); // removido // removido: función inexistente

    const xpLabel = document.getElementById('c7-xp-label');
    const xpValue = document.getElementById('c7-xp-value');

    const observer = new MutationObserver(updateClass7MissionProgress);

    if (xpLabel) {
      observer.observe(xpLabel, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }

    if (xpValue) {
      observer.observe(xpValue, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }
  }


  function initClass7() {
    // // initClass7MissionProgress(); // removido // removido: función inexistente
    // // initClass7ProgressBar(); // removido // removido: función inexistente
    initClass7ProgressObserver();
    updateXP();
    // // updateClass7ProgressBar(); // removido // removido: función inexistente
    initStart();
    initChecklist();
    initQuizzes();
    initBasicPython();
    initSandboxAccordion();
    initSandbox();
    initLiveCSV();
    initDatasetValidation();
    initAutoDiagnosis();
    initFinalChallenge();
    initDiagnosis();
    initCopyReport();
    initImageLightbox();
    initReset();
  }

  document.addEventListener('DOMContentLoaded', initClass7);
})();



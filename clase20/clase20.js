(() => {
  'use strict';

  const STORAGE_KEY = 'clase20DesarrolloAgente';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = loadState();

  const files = {
    'server-health': {
      name: 'server.js · primera versión', language: 'JavaScript', explanation: 'Primero verifiquen Express sin depender del modelo.',
      code: [
        "import express from 'express';", "import dotenv from 'dotenv';", '', 'dotenv.config();', '',
        'const app = express();', 'const port = process.env.PORT || 3000;', '',
        "app.use(express.json({ limit: '100kb' }));", "app.use(express.static('public'));", '',
        "app.get('/api/health', (req, res) => {", '  res.json({', '    ok: true,', "    service: 'agente-web',", "    provider: 'ollama',", '    timestamp: new Date().toISOString()', '  });', '});', '',
        "app.post('/api/agent', async (req, res) => {", "  res.status(501).json({ ok: false, error: 'Endpoint todavía no conectado.' });", '});', '',
        'app.use((error, req, res, next) => {', "  console.error('Error interno:', error);", "  res.status(500).json({ ok: false, error: 'Ocurrió un error interno en el servidor.' });", '});', '',
        'app.listen(port, () => {', '  console.log(`Aplicación disponible en http://localhost:${port}`);', '});'
      ].join('\n')
    },
    package: {
      name: 'PowerShell · configurar package.json', language: 'PowerShell', explanation: 'Ejecuten estos comandos dentro de agente-web. Modifican type y scripts sin borrar las versiones reales de las dependencias.',
      code: ['npm pkg set type=module', 'npm pkg set scripts.start="node server.js"', 'npm pkg set scripts.dev="node --watch server.js"', 'npm pkg set scripts.check="node --check server.js && node --check public/app.js"', '', 'npm pkg get type scripts dependencies'].join('\n')
    },
    'env-example': { name: '.env.example y .env', language: 'dotenv', explanation: 'Usen exactamente el modelo que respondió en la prueba. En Windows verifiquen que el archivo no termine en .txt.', code: ['# .env.example', 'OLLAMA_URL=http://127.0.0.1:11434', 'OLLAMA_MODEL=qwen3:1.7b', 'PORT=3000', '', '# .env local', 'OLLAMA_URL=http://127.0.0.1:11434', 'OLLAMA_MODEL=qwen3:1.7b', 'PORT=3000'].join('\n') },
    gitignore: { name: '.gitignore', language: 'texto', explanation: 'Evita subir dependencias y configuración local.', code: ['node_modules/', '.env', '.DS_Store', 'npm-debug.log*'].join('\n') },
    'server-complete': {
      name: 'server.js · versión completa con Ollama', language: 'JavaScript', explanation: 'Reemplacen la primera versión completa de server.js por esta implementación.',
      code: [
        "import express from 'express';", "import dotenv from 'dotenv';", '', 'dotenv.config();', '',
        'const app = express();', 'const port = process.env.PORT || 3000;', "const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';", 'const ollamaModel = normalizeText(process.env.OLLAMA_MODEL);', '',
        'if (!ollamaModel) {', "  console.error('Falta OLLAMA_MODEL en el archivo .env');", '  process.exit(1);', '}', '',
        'const SYSTEM_PROMPT = `', 'Eres el agente de inteligencia artificial de [NOMBRE DEL PROYECTO].', '', 'PROPÓSITO:', '[EXPLICAR LA TAREA CONCRETA].', '', 'USUARIO:', '[EXPLICAR QUIÉN UTILIZA EL PRODUCTO].', '', 'DEBES:', '- Interpretar la solicitud y aplicar las reglas proporcionadas.', '- Entregar una respuesta útil y reconocer información faltante.', '- Señalar los límites del resultado.', '', 'NO DEBES:', '- Inventar datos ni afirmar que realizaste acciones externas.', '- Ocultar incertidumbre ni salirte del propósito.', '', 'FORMATO:', 'Devuelve solamente JSON válido:', '{', '  "title": "Título breve",', '  "answer": "Respuesta principal",', '  "recommendations": ["Recomendación"],', '  "warning": "",', '  "confidence": "alta | media | baja"', '}', '`;', '',
        'app.use(express.json({ limit: \'100kb\' }));', "app.use(express.static('public'));", '',
        'function normalizeText(value) {', "  return typeof value === 'string' ? value.trim() : '';", '}', '',
        'function extractJson(text) {', '  const normalized = text', "    .replace(/^```json\\s*/i, '')", "    .replace(/^```\\s*/i, '')", "    .replace(/\\s*```$/i, '')", '    .trim();', '  return JSON.parse(normalized);', '}', '',
        'function normalizeResult(result, fallbackText) {', '  return {', "    title: normalizeText(result?.title) || 'Resultado',", "    answer: normalizeText(result?.answer) || fallbackText || 'No se obtuvo una respuesta.',", '    recommendations: Array.isArray(result?.recommendations)', '      ? result.recommendations.map(item => normalizeText(item)).filter(Boolean).slice(0, 5)', '      : [],', '    warning: normalizeText(result?.warning),', "    confidence: ['alta', 'media', 'baja'].includes(result?.confidence)", "      ? result.confidence : 'media'", '  };', '}', '',
        "app.get('/api/health', async (req, res) => {", '  try {', '    const providerResponse = await fetch(`${ollamaUrl}/api/tags`);', '    res.json({ ok: true, service: \'agente-web\', provider: \'ollama\', providerReady: providerResponse.ok, timestamp: new Date().toISOString() });', '  } catch {', '    res.json({ ok: true, service: \'agente-web\', provider: \'ollama\', providerReady: false, timestamp: new Date().toISOString() });', '  }', '});', '',
        "app.post('/api/agent', async (req, res) => {", '  const message = normalizeText(req.body?.message);', '  const context = req.body?.context;', '',
        "  if (!message) return res.status(400).json({ ok: false, error: 'Escribe una consulta antes de continuar.' });", "  if (message.length < 5) return res.status(400).json({ ok: false, error: 'Agrega un poco más de información.' });", "  if (message.length > 4000) return res.status(400).json({ ok: false, error: 'La consulta es demasiado larga.' });", "  if (context !== undefined && (typeof context !== 'object' || Array.isArray(context))) return res.status(400).json({ ok: false, error: 'El contexto no tiene un formato válido.' });", '',
        '  try {', '    const providerResponse = await fetch(`${ollamaUrl}/api/chat`, {', "      method: 'POST',", "      headers: { 'Content-Type': 'application/json' },", '      body: JSON.stringify({', '        model: ollamaModel,', '        stream: false,', "        format: 'json',", '        messages: [', "          { role: 'system', content: SYSTEM_PROMPT },", "          { role: 'user', content: message }", '        ],', '        options: { temperature: 0.2 }', '      }),', '      signal: AbortSignal.timeout(60000)', '    });', '',
        '    if (!providerResponse.ok) {', "      console.error('Ollama respondió con status:', providerResponse.status);", "      return res.status(502).json({ ok: false, error: 'El proveedor local no respondió correctamente.' });", '    }', '',
        '    const providerData = await providerResponse.json();', '    const rawText = normalizeText(providerData?.message?.content);', "    if (!rawText) return res.status(502).json({ ok: false, error: 'El proveedor no devolvió una respuesta utilizable.' });", '',
        '    let parsed;', '    try { parsed = extractJson(rawText); } catch { parsed = null; }', '    const result = normalizeResult(parsed, rawText);', '',
        '    return res.json({ ok: true, result, meta: { createdAt: new Date().toISOString(), provider: \'ollama\' } });', '  } catch (error) {', "    console.error('Error al consultar Ollama:', error?.name || 'Error');", "    const timedOut = error?.name === 'TimeoutError';", "    return res.status(502).json({ ok: false, error: timedOut ? 'El modelo local tardó demasiado en responder.' : 'No fue posible conectar con Ollama. Verifica que esté abierto y que el modelo exista.' });", '  }', '});', '',
        'app.use((error, req, res, next) => {', "  console.error('Error interno:', error);", "  res.status(500).json({ ok: false, error: 'Ocurrió un error interno en el servidor.' });", '});', '',
        'app.listen(port, () => console.log(`Aplicación disponible en http://localhost:${port}`));'
      ].join('\n')
    },
    'public-html': {
      name: 'public/index.html', language: 'HTML', explanation: 'Interfaz semántica con estado accesible, resultado e historial.',
      code: [
        '<!doctype html>', '<html lang="es">', '<head>', '  <meta charset="utf-8">', '  <meta name="viewport" content="width=device-width,initial-scale=1">', '  <title>Nombre del producto</title>', '  <link rel="stylesheet" href="styles.css">', '</head>', '<body>',
        '  <header class="app-header"><div><span>Agente inteligente</span><h1>Nombre del producto</h1><p>Explique en una frase qué resuelve.</p></div><span id="connection-status">Comprobando servidor…</span></header>',
        '  <main class="app-shell">', '    <section class="product-intro" aria-labelledby="form-title">', '      <h2 id="form-title">Describa su situación</h2>', '      <p id="message-help">Incluya la información necesaria. No escriba datos sensibles.</p>', '      <div class="quick-prompts" aria-label="Ejemplos">', '        <button type="button" data-prompt="Ejemplo de consulta suficientemente detallado">Usar ejemplo</button>', '      </div>',
        '      <form id="agent-form">', '        <label for="message">Consulta</label>', '        <textarea id="message" required minlength="5" maxlength="4000" autocomplete="off" aria-describedby="message-help character-count"></textarea>', '        <span id="character-count">0 / 4000</span>', '        <div class="actions"><button id="submit-button" type="submit">Enviar consulta</button><button id="clear-button" type="button">Limpiar</button></div>', '      </form>', '      <p id="status-message" role="status" aria-live="polite"></p>', '      <div id="loading-panel" role="status" hidden>Consultando el modelo local…</div>', '    </section>',
        '    <section id="result-panel" class="result-panel" aria-live="polite" hidden>', '      <span id="result-confidence"></span><h2 id="result-title"></h2><p id="result-answer"></p>', '      <h3>Recomendaciones</h3><ul id="result-recommendations"></ul><p id="result-warning" hidden></p><small id="result-date"></small>', '      <details><summary>Ver respuesta técnica</summary><pre id="technical-response"></pre></details>', '    </section>',
        '    <aside class="history-panel"><div><h2>Historial local</h2><button id="clear-history-button" type="button">Limpiar historial</button></div><ul id="history-list"></ul></aside>',
        '  </main>', '  <footer>Este agente puede equivocarse. Verifique decisiones importantes.</footer>', '  <script src="app.js"></script>', '</body>', '</html>'
      ].join('\n')
    },
    'public-css': {
      name: 'public/styles.css', language: 'CSS', explanation: 'Diseño neutral, responsive y accesible que cada equipo debe adaptar.',
      code: [
        ':root { --ink:#172033; --muted:#5c667a; --paper:#f3f6fb; --surface:#fff; --brand:#3157d5; --line:#d7deea; --danger:#b42318; }',
        '* { box-sizing:border-box; }', 'body { margin:0; background:var(--paper); color:var(--ink); font-family:system-ui,sans-serif; line-height:1.6; }',
        'button,input,textarea { font:inherit; }', '.app-header,.app-shell,footer { width:min(1080px,calc(100% - 32px)); margin:auto; }',
        '.app-header { display:flex; justify-content:space-between; gap:20px; align-items:center; padding:42px 0 24px; }', '.app-header h1 { margin:.2em 0; font-size:clamp(2rem,6vw,4rem); }',
        '.app-shell { display:grid; grid-template-columns:minmax(0,1.4fr) minmax(280px,.6fr); gap:20px; }',
        '.product-intro,.result-panel,.history-panel { background:var(--surface); border:1px solid var(--line); border-radius:18px; padding:24px; box-shadow:0 14px 40px rgba(25,39,75,.08); }',
        '.product-intro { grid-row:span 2; }', 'label { display:block; font-weight:750; margin-top:18px; }', 'textarea { width:100%; min-height:180px; resize:vertical; border:1px solid #aeb8ca; border-radius:12px; padding:12px; }',
        'button { min-height:44px; border:1px solid #aeb8ca; border-radius:10px; padding:8px 14px; background:#fff; cursor:pointer; }', '#submit-button { background:var(--brand); color:#fff; border-color:var(--brand); }', 'button:disabled { opacity:.55; cursor:wait; }',
        '.quick-prompts,.actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }', '#character-count { display:block; text-align:right; color:var(--muted); }',
        '#status-message[data-type="error"],#result-warning { color:var(--danger); }', '#loading-panel { padding:14px; background:#eef3ff; border-radius:10px; margin-top:14px; }',
        '.result-panel { border-top:5px solid var(--brand); }', '#result-confidence { display:inline-block; background:#e8efff; color:#18358f; border-radius:99px; padding:3px 9px; }',
        '.history-panel>div { display:flex; justify-content:space-between; gap:10px; align-items:center; }', '#history-list { padding:0; list-style:none; }', '#history-list li { border-top:1px solid var(--line); padding:12px 0; }',
        'button:focus-visible,textarea:focus-visible,summary:focus-visible { outline:3px solid rgba(49,87,213,.3); outline-offset:2px; }', 'pre { overflow:auto; background:#111827; color:#dbeafe; padding:14px; border-radius:10px; }',
        'footer { padding:26px 0; color:var(--muted); }', '@media(max-width:760px) { .app-header { align-items:flex-start; flex-direction:column; } .app-shell { grid-template-columns:1fr; } .product-intro { grid-row:auto; } }',
        '@media(prefers-reduced-motion:reduce) { * { scroll-behavior:auto!important; animation:none!important; transition:none!important; } }'
      ].join('\n')
    },
    'public-js': {
      name: 'public/app.js', language: 'JavaScript', explanation: 'Conecta el formulario, presenta texto sin innerHTML y administra un historial local seguro.',
      code: [
        "'use strict';", "const HISTORY_KEY = 'agentProductHistory';", 'const MAX_HISTORY = 20;', 'const form = document.querySelector(\'#agent-form\');', "const messageInput = document.querySelector('#message');", "const submitButton = document.querySelector('#submit-button');", "const clearButton = document.querySelector('#clear-button');", "const characterCount = document.querySelector('#character-count');", "const statusMessage = document.querySelector('#status-message');", "const loadingPanel = document.querySelector('#loading-panel');", "const resultPanel = document.querySelector('#result-panel');", "const historyList = document.querySelector('#history-list');", '',
        "function normalizeInput(value) { return typeof value === 'string' ? value.trim() : ''; }", "function setStatus(message, type = 'info') { statusMessage.textContent = message; statusMessage.dataset.type = type; }", "function setLoading(value) { submitButton.disabled = value; messageInput.disabled = value; loadingPanel.hidden = !value; submitButton.textContent = value ? 'Consultando…' : 'Enviar consulta'; }", '',
        'async function requestAgent(message) {', '  const controller = new AbortController();', '  const timeoutId = window.setTimeout(() => controller.abort(), 65000);', '  try {', "    const response = await fetch('/api/agent', {", "      method: 'POST', headers: { 'Content-Type': 'application/json' },", "      body: JSON.stringify({ message, context: { projectName: document.title, mode: 'default' } }),", '      signal: controller.signal', '    });', '    const data = await response.json().catch(() => null);', "    if (!response.ok) throw new Error(data?.error || `La solicitud falló con código ${response.status}.`);", "    if (!data?.ok || !data?.result) throw new Error('El servidor devolvió una respuesta incompleta.');", '    return data;', '  } finally { window.clearTimeout(timeoutId); }', '}', '',
        'function renderRecommendations(items) {', "  const list = document.querySelector('#result-recommendations');", '  list.replaceChildren();', "  (Array.isArray(items) ? items : []).forEach(item => { const li = document.createElement('li'); li.textContent = item; list.append(li); });", '}',
        'function renderResult(result, meta, technical) {', "  document.querySelector('#result-title').textContent = result.title;", "  document.querySelector('#result-answer').textContent = result.answer;", "  document.querySelector('#result-confidence').textContent = `Confianza ${result.confidence}`;", "  const warning = document.querySelector('#result-warning'); warning.textContent = result.warning; warning.hidden = !result.warning;", "  document.querySelector('#result-date').textContent = new Date(meta.createdAt).toLocaleString();", "  document.querySelector('#technical-response').textContent = JSON.stringify(technical, null, 2);", '  renderRecommendations(result.recommendations); resultPanel.hidden = false;', '}', '',
        "function loadHistory() { try { const value = JSON.parse(localStorage.getItem(HISTORY_KEY)); return Array.isArray(value) ? value : []; } catch { return []; } }", 'function saveHistory(items) { localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY))); }',
        "function addHistoryItem(message, data) { const history = loadHistory(); history.unshift({ id: crypto.randomUUID(), message, result: data.result, createdAt: data.meta.createdAt }); saveHistory(history); renderHistory(); }", 'function restoreHistoryItem(item) { messageInput.value = item.message; renderResult(item.result, { createdAt:item.createdAt }, item); updateCount(); window.scrollTo({ top:0, behavior:\'smooth\' }); }',
        'function renderHistory() {', '  historyList.replaceChildren();', "  loadHistory().forEach(item => { const li = document.createElement('li'); const title = document.createElement('strong'); title.textContent = item.result.title; const open = document.createElement('button'); open.type = 'button'; open.textContent = 'Abrir'; open.addEventListener('click', () => restoreHistoryItem(item)); const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Eliminar'; remove.addEventListener('click', () => { saveHistory(loadHistory().filter(entry => entry.id !== item.id)); renderHistory(); }); li.append(title, open, remove); historyList.append(li); });", '}',
        "function updateCount() { characterCount.textContent = `${messageInput.value.length} / 4000`; }", '',
        "form.addEventListener('submit', async event => {", '  event.preventDefault();', '  const message = normalizeInput(messageInput.value);', "  if (message.length < 5) { setStatus('Agrega un poco más de información.', 'error'); messageInput.focus(); return; }", "  if (message.length > 4000) { setStatus('La consulta es demasiado larga.', 'error'); return; }", '  setLoading(true); setStatus(\'Enviando solicitud…\');', '  try { const data = await requestAgent(message); renderResult(data.result, data.meta, data); addHistoryItem(message, data); setStatus(\'Respuesta recibida.\', \'success\'); }', "  catch (error) { setStatus(error.name === 'AbortError' ? 'La solicitud tardó demasiado. Verifica Express y Ollama.' : error.message, 'error'); }", '  finally { setLoading(false); }', '});',
        "messageInput.addEventListener('input', updateCount);", "clearButton.addEventListener('click', () => { messageInput.value = ''; resultPanel.hidden = true; setStatus('Formulario limpio.'); updateCount(); messageInput.focus(); });", "document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => { messageInput.value = button.dataset.prompt; updateCount(); }));", "document.querySelector('#clear-history-button').addEventListener('click', () => { if (confirm('¿Borrar todo el historial local?')) { localStorage.removeItem(HISTORY_KEY); renderHistory(); } });", "window.addEventListener('offline', () => setStatus('No hay conexión de red.', 'error'));", "window.addEventListener('online', () => setStatus('La conexión se restableció.', 'success'));", '',
        "fetch('/api/health').then(response => response.json()).then(data => { document.querySelector('#connection-status').textContent = data.providerReady ? 'Servidor y Ollama disponibles' : 'Servidor disponible; revise Ollama'; }).catch(() => { document.querySelector('#connection-status').textContent = 'Servidor no disponible'; });", 'renderHistory(); updateCount();'
      ].join('\n')
    }
  };

  const missionNames = ['Arquitectura','Estructura','Servidor','Configuración','Contrato API','Conectar IA','Interfaz','fetch()','Respuesta','Errores','Historial','Personalizar','Pruebas','Producto final'];
  const templates = {
    orientador:{input:'situación, contexto y objetivo',output:'categoría, siguiente paso, requisitos y advertencia'},
    recomendador:{input:'preferencia, necesidad y restricciones',output:'recomendación principal, alternativas, razones y limitaciones'},
    clasificador:{input:'descripción y variables relevantes',output:'categoría, explicación, confianza y acción sugerida'},
    evaluador:{input:'contenido y criterios',output:'cumplimiento, observaciones, faltantes y sugerencias'},
    soporte:{input:'problema, dispositivo, síntomas y acciones intentadas',output:'diagnóstico inicial no definitivo, pasos, escalamiento y precauciones'}
  };
  const diagnostics = [
    ['node: command not found','Node no está instalado o no está en PATH. Instálelo, cierre la terminal y ábrala de nuevo.'],
    ['npm: command not found','Reinstale Node.js y verifique node --version.'],
    ['npm.ps1 no se puede cargar','PowerShell bloqueó el script. Pruebe npm.cmd o ejecute npm desde CMD. No cambie políticas de un equipo escolar sin autorización.'],
    ['No se encuentra package.json','La terminal está en otra carpeta. Ejecute Get-Location y entre con cd a agente-web.'],
    ['.env no funciona en Windows','Active las extensiones y confirme que el archivo se llama .env, no .env.txt. Reinicie Express después de corregirlo.'],
    ['code no se reconoce','Abra Visual Studio Code y use Archivo → Abrir carpeta para seleccionar agente-web.'],
    ["Cannot find package 'express'",'Entre a la carpeta que contiene package.json y ejecute npm install.'],
    ['Cannot use import statement outside a module','Agregue "type": "module" a package.json.'],
    ['EADDRINUSE','El puerto está ocupado. Cierre el proceso o cambie PORT en .env.'],
    ['Falta OLLAMA_MODEL','Ejecute ollama list y escriba en .env exactamente un modelo instalado.'],
    ['Ollama no responde','Abra Ollama y compruebe http://127.0.0.1:11434/api/tags.'],
    ['modelo no encontrado','Ejecute ollama list; instale el modelo con ollama pull NOMBRE y copie exactamente ese nombre a .env.'],
    ['Ollama es demasiado lento','Cierre aplicaciones, reduzca la entrada y pruebe un modelo más pequeño. Revise RAM, GPU y disco en el Administrador de tareas.'],
    ['Failed to fetch','Backend apagado, URL incorrecta, error de red o frontend abierto sin Express. Inicie npm run dev.'],
    ['Unexpected token < in JSON','La respuesta fue HTML. En DevTools → Network revise URL, status y Response.'],
    ['El formulario no hace nada','Revise script enlazado, IDs, Console, preventDefault y el listener de submit.'],
    ['Timeout','El modelo local tardó demasiado. Revise recursos del equipo, modelo y que Ollama esté activo.']
  ];

  function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{fields:{},checks:{},tests:[]};}catch{return{fields:{},checks:{},tests:[]}}}
  function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));updateProgress()}
  function setPath(bucket,key,value){state[bucket]??={};state[bucket][key]=value;saveState()}
  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),1800)}
  function escapeHtml(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]))}
  async function copyText(text,button){try{await navigator.clipboard.writeText(text);const old=button.textContent;button.textContent='Copiado';toast('Código copiado');setTimeout(()=>button.textContent=old,1400)}catch{toast('No fue posible copiar; seleccione el texto')}}
  function codeCard(file,key){return `<article class="code-card"><div class="panel-bar"><span>${escapeHtml(file.name)} · ${escapeHtml(file.language)}</span><button class="copy-button" data-copy-code="${key}" type="button">Copiar archivo</button></div><pre><code>${escapeHtml(file.code)}</code></pre><p class="code-explanation">${escapeHtml(file.explanation)}</p></article>`}
  function renderCode(){$$('.code-slot').forEach(slot=>{const key=slot.dataset.code;slot.innerHTML=codeCard(files[key],key)});$('#all-code-files').innerHTML=['server-complete','env-example','gitignore','package','public-html','public-css','public-js'].map(key=>codeCard(files[key],key)).join('')}
  function renderNav(){const nav=$('#mission-links');nav.innerHTML=missionNames.map((name,i)=>`<a href="#mision-${i+1}" data-nav-mission="${i+1}">${i+1}. ${name}</a>`).join('')+'<a href="#plantilla">Plantilla base</a><a href="#diagnostico">Diagnóstico</a><a href="#reporte">Reporte técnico</a>'}
  function bindFields(){$$('[data-field]').forEach(input=>{const key=input.dataset.field;if(state.fields?.[key]!==undefined&&input.value==='')input.value=state.fields[key];input.addEventListener('input',()=>setPath('fields',key,input.value))});$$('[data-check]').forEach(input=>{input.checked=Boolean(state.checks?.[input.dataset.check]);input.addEventListener('change',()=>{setPath('checks',input.dataset.check,input.checked);updateFileGate();updateFinalStatus()})})}
  function missionComplete(number){if(number===2)return ['files.server','files.package','files.env','files.example','files.ignore','files.html','files.css','files.js'].every(key=>state.checks?.[key]);if(number>=10)return Boolean(state.promptMissions?.[number]);return Boolean(state.visitedMissions?.[number])}
  function updateProgress(){const done=missionNames.filter((_,i)=>missionComplete(i+1)).length;const pct=Math.round(done/14*100);$('#progress-value').textContent=`${pct}%`;$('#progress-fill').style.width=`${pct}%`;$('#progress-detail').textContent=`${done} de 14 misiones`;$$('[data-nav-mission]').forEach(link=>link.classList.toggle('active',missionComplete(Number(link.dataset.navMission))))}
  function updateFileGate(){const ready=missionComplete(2);const el=$('[data-gate="files"]');el.textContent=ready?'Estructura confirmada. Guarden una captura del explorador.':'Confirmen los 8 archivos para completar esta misión.';el.classList.toggle('ready',ready)}
  function renderContract(){const message=$('#contract-message').value.trim()||'Texto escrito por el usuario';const project=$('#contract-project').value.trim()||'Nombre del proyecto';$('#request-preview').textContent=JSON.stringify({message,context:{projectName:project,mode:'default'}},null,2);$('#response-preview').textContent=JSON.stringify({ok:true,result:{title:'Resultado de la consulta',answer:'Respuesta principal',recommendations:['Recomendación 1','Recomendación 2'],warning:'',confidence:'media'},meta:{createdAt:new Date().toISOString(),provider:'ollama'}},null,2)}
  function renderTemplate(type='orientador'){const data=templates[type];$('#template-panel').innerHTML=`<h3>Plantilla ${type}</h3><p><strong>Entrada:</strong> ${data.input}.</p><p><strong>Salida:</strong> ${data.output}.</p>`;$$('[data-template]').forEach(button=>button.setAttribute('aria-selected',String(button.dataset.template===type)))}
  function updateFinalStatus(){const audited=missionComplete(14);const box=$('#product-status');box.classList.toggle('ready',audited);box.innerHTML=audited?'<span>Auditoría registrada</span><strong>Conserven el veredicto y los resultados</strong><p>PRODUCTO FUNCIONAL LISTO solo es válido cuando la revisión no reporta bloqueadores.</p>':'<span>Estado de la guía</span><strong>Ejecuten la auditoría antes de declarar el producto listo</strong><p>El veredicto debe provenir de archivos, terminal y pruebas reales.</p>';updateProgress()}
  function renderDiagnostics(filter=''){const query=filter.toLowerCase();$('#diagnostic-list').innerHTML=diagnostics.filter(item=>item.join(' ').toLowerCase().includes(query)).map(([title,body])=>`<details><summary>${escapeHtml(title)}</summary><p>${escapeHtml(body)}</p></details>`).join('')||'<p>No hay coincidencias. Revise Console y Network.</p>'}
  function terminalRun(command){const outputs={'mkdir agente-web':'Carpeta creada.','cd agente-web':'Directorio actual: agente-web','npm init -y':'package.json creado.','npm install express dotenv':'Dependencias instaladas y registradas.','mkdir public':'Carpeta public creada.','npm run dev':'Aplicación disponible en http://localhost:3000'};const panel=$('#terminal-output');const line=document.createElement('p');line.className='terminal-line';line.textContent=`$ ${command}`;const out=document.createElement('p');out.className='terminal-line output';out.textContent=outputs[command];panel.append(line,out);panel.scrollTop=panel.scrollHeight}

  function bindEvents(){
    document.addEventListener('click',event=>{const copy=event.target.closest('[data-copy-target]');if(copy){const target=$(`#${copy.dataset.copyTarget}`);if(target)copyText(target.textContent,copy)}const code=event.target.closest('[data-copy-code]');if(code)copyText(files[code.dataset.copyCode].code,code);const validation=event.target.closest('[data-validate-mission]');if(validation){const mission=Number(validation.dataset.validateMission);state.promptMissions??={};state.promptMissions[mission]=true;validation.textContent='Validación registrada';validation.disabled=true;saveState();updateFinalStatus();toast('Validación registrada')}});
    $('#refresh-contract').addEventListener('click',renderContract);$('#contract-message').addEventListener('input',renderContract);$('#contract-project').addEventListener('input',renderContract);
    $('#nav-toggle').addEventListener('click',()=>{const open=$('#lesson-nav').classList.toggle('open');$('#nav-toggle').setAttribute('aria-expanded',String(open))});$('#mission-links').addEventListener('click',()=>{$('#lesson-nav').classList.remove('open');$('#nav-toggle').setAttribute('aria-expanded','false')});
    $('#reset-progress').addEventListener('click',()=>{if(confirm('¿Restablecer únicamente el progreso de Clase 20?')){localStorage.removeItem(STORAGE_KEY);location.reload()}});
    $$('.template-tabs button').forEach(button=>button.addEventListener('click',()=>renderTemplate(button.dataset.template)));
    $$('[data-terminal-command]').forEach(button=>button.addEventListener('click',()=>terminalRun(button.dataset.terminalCommand)));$('#error-search').addEventListener('input',event=>renderDiagnostics(event.target.value));
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){$$('#mission-links a').forEach(link=>link.removeAttribute('aria-current'));const link=$(`#mission-links a[href="#${entry.target.id}"]`);if(link)link.setAttribute('aria-current','true');const mission=Number(entry.target.dataset.mission);if(mission<10&&!state.visitedMissions?.[mission]){state.visitedMissions??={};state.visitedMissions[mission]=true;saveState()}}}),{rootMargin:'-20% 0px -70%'});$$('.mission').forEach(section=>observer.observe(section));
  }
  function init(){renderNav();renderCode();bindFields();renderContract();renderTemplate();renderDiagnostics();bindEvents();$$('[data-validate-mission]').forEach(button=>{if(state.promptMissions?.[button.dataset.validateMission]){button.textContent='Validación registrada';button.disabled=true}});updateFileGate();updateFinalStatus()}
  init();
})();

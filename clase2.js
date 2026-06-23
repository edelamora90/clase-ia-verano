const AGENT_CASES = [
  {
    key: 'netflix', icon: '🎬', title: 'Netflix recomendando una serie',
    perceives: 'Historial de reproducción, búsquedas, pausas, calificaciones y gustos de usuarios similares.',
    decides: 'Qué serie o película tiene más probabilidad de interesarte.',
    acts: 'Ordena recomendaciones y muestra una lista personalizada.',
    objective: 'Aumentar satisfacción, permanencia y descubrimiento de contenido.'
  },
  {
    key: 'maps', icon: '🗺️', title: 'Google Maps eligiendo una ruta',
    perceives: 'Ubicación, tráfico, distancia, accidentes, calles y velocidad promedio.',
    decides: 'Cuál ruta conviene según tiempo, tráfico o restricciones.',
    acts: 'Muestra instrucciones, avisos y cambios de ruta.',
    objective: 'Llegar más rápido o evitar tráfico.'
  },
  {
    key: 'vacuum', icon: '🧹', title: 'Robot aspiradora evitando una pared',
    perceives: 'Distancia, choques, paredes, muebles, batería y suciedad.',
    decides: 'Avanzar, girar, regresar a cargar o limpiar una zona.',
    acts: 'Mueve ruedas, activa cepillos y cambia dirección.',
    objective: 'Limpiar la mayor superficie sin chocar ni quedarse sin batería.'
  },
  {
    key: 'game', icon: '🎮', title: 'Videojuego moviendo un enemigo',
    perceives: 'Posición del jugador, obstáculos, distancia y estado del juego.',
    decides: 'Perseguir, atacar, esconderse o patrullar.',
    acts: 'Mueve al personaje, cambia animaciones y ejecuta ataques.',
    objective: 'Crear reto, presión y una experiencia divertida.'
  },
  {
    key: 'chatbot', icon: '💬', title: 'Chatbot respondiendo una pregunta',
    perceives: 'Mensaje del usuario, historial, intención y contexto disponible.',
    decides: 'Qué información responder y con qué tono o estructura.',
    acts: 'Genera texto, enlaces, pasos o sugerencias.',
    objective: 'Resolver dudas de forma clara y útil.'
  },
  {
    key: 'fraud', icon: '🏦', title: 'Sistema bancario detectando fraude',
    perceives: 'Monto, ubicación, comercio, horario, dispositivo y patrones de compra.',
    decides: 'Si una transacción parece normal, riesgosa o sospechosa.',
    acts: 'Aprueba, bloquea, solicita confirmación o alerta al usuario.',
    objective: 'Reducir fraudes sin bloquear operaciones legítimas.'
  }
];

const AGENT_COMPONENTS = [
  ['🌎', 'Entorno', 'Es el mundo o contexto donde opera el agente.', 'Ejemplo: calles y tráfico para un taxi autónomo.'],
  ['📡', 'Sensores', 'Son los medios por los que el agente recibe información.', 'Ejemplo: cámaras, GPS, micrófono o clics del usuario.'],
  ['📥', 'Percepciones', 'Son los datos recibidos del entorno.', 'Ejemplo: ubicación actual, obstáculo cercano o mensaje escrito.'],
  ['🧠', 'Función del agente', 'Es la lógica que decide qué acción tomar.', 'Ejemplo: si hay obstáculo, girar a la derecha.'],
  ['🦾', 'Actuadores', 'Son los medios por los que el agente ejecuta acciones.', 'Ejemplo: ruedas, pantalla, texto, frenos o notificaciones.'],
  ['🎯', 'Objetivo', 'Es lo que el agente intenta lograr.', 'Ejemplo: llegar rápido, limpiar bien o responder con claridad.']
];

const PEAS_EXAMPLES = {
  taxi: {
    label: 'Taxi autónomo',
    performance: 'Seguridad, rapidez, comodidad y consumo eficiente.',
    environment: 'Calles, tráfico, peatones y señales.',
    actuators: 'Volante, frenos, acelerador y luces.',
    sensors: 'Cámaras, GPS, radar y velocímetro.'
  },
  vacuum: {
    label: 'Robot aspiradora',
    performance: 'Limpiar bien, no chocar y ahorrar batería.',
    environment: 'Casa, muebles, paredes y escaleras.',
    actuators: 'Ruedas, motor de succión y cepillos.',
    sensors: 'Sensores de choque, distancia, suciedad y batería.'
  },
  recommender: {
    label: 'Sistema recomendador',
    performance: 'Recomendaciones útiles, tiempo de uso y satisfacción.',
    environment: 'Catálogo, usuarios, historial y preferencias.',
    actuators: 'Lista de recomendaciones y notificaciones.',
    sensors: 'Clics, búsquedas, reproducciones y calificaciones.'
  },
  chatbot: {
    label: 'Chatbot académico',
    performance: 'Respuestas útiles, claridad y precisión.',
    environment: 'Plataforma educativa, alumnos y preguntas.',
    actuators: 'Texto, enlaces y sugerencias.',
    sensors: 'Mensajes del usuario, historial y contexto.'
  }
};

const AGENT_TYPES = [
  ['⚡', 'Agente reactivo simple', 'Decide con reglas directas.', 'SI hay obstáculo, ENTONCES girar.'],
  ['🧭', 'Agente basado en modelo', 'Mantiene una representación interna del entorno.', 'Robot que recuerda qué zonas ya limpió.'],
  ['🎯', 'Agente basado en objetivos', 'Elige acciones para alcanzar una meta.', 'Google Maps buscando llegar a un destino.'],
  ['⚖️', 'Agente basado en utilidad', 'Elige la mejor opción según beneficio o costo.', 'Ruta más rápida, más barata o con menos tráfico.'],
  ['📈', 'Agente que aprende', 'Mejora su comportamiento con experiencia.', 'Sistema recomendador que aprende tus gustos.']
];

const CLASSIFICATION_CASES = [
  ['Un termostato que enciende el aire si la temperatura sube.', 'Agente reactivo simple'],
  ['Un robot aspiradora que recuerda habitaciones limpiadas.', 'Agente basado en modelo'],
  ['Google Maps calculando la ruta más rápida.', 'Agente basado en objetivos / utilidad'],
  ['Netflix mejorando recomendaciones con el historial.', 'Agente que aprende'],
  ['Un enemigo de videojuego que persigue al jugador.', 'Agente basado en objetivos']
];

const CLASSIFICATION_OPTIONS = [
  'Agente reactivo simple',
  'Agente basado en modelo',
  'Agente basado en objetivos',
  'Agente basado en objetivos / utilidad',
  'Agente basado en utilidad',
  'Agente que aprende'
];

const simulatorState = { size: 5, agent: { row: 0, col: 0, dir: 1 }, goal: { row: 4, col: 4 }, obstacles: ['0,2', '1,2', '2,2', '3,1', '3,3'], stopped: false };
const LAB_SIZE = 5;
const LAB_DIRECTIONS = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const LAB_BASE_OBSTACLES = ['1,1', '1,3', '2,1', '3,3'];
let modelAgentState;
let goalAgentState;
let utilityAgentState;
let learningAgentState;
let goalAgentTimer = null;
function labKey(row, col) { return row + ',' + col; }
function labSameCell(a, b) { return a.row === b.row && a.col === b.col; }
function labDistance(a, b) { return Math.abs(a.row - b.row) + Math.abs(a.col - b.col); }
function labInside(row, col) { return row >= 0 && row < LAB_SIZE && col >= 0 && col < LAB_SIZE; }
function labIsBlocked(row, col, obstacles = LAB_BASE_OBSTACLES) { return !labInside(row, col) || obstacles.includes(labKey(row, col)); }
function labNeighbors(cell, obstacles = LAB_BASE_OBSTACLES) { return LAB_DIRECTIONS.map(([dr, dc], dir) => ({ row: cell.row + dr, col: cell.col + dc, dir })).filter(next => !labIsBlocked(next.row, next.col, obstacles)); }
function renderLabGrid(gridId, state, options = {}) { const grid = document.getElementById(gridId); if (!grid) return; const cells = []; const routeKeys = options.route ? options.route.map(cell => labKey(cell.row, cell.col)) : []; for (let row = 0; row < LAB_SIZE; row++) { for (let col = 0; col < LAB_SIZE; col++) { const key = labKey(row, col); const isAgent = labSameCell(state.agent, { row, col }); const isGoal = labSameCell(state.goal, { row, col }); const isWall = state.obstacles.includes(key); const isVisited = state.visited?.includes(key); const isRoute = routeKeys.includes(key) && !isAgent && !isGoal; const isReward = state.rewards?.includes(key); const isCost = state.costs?.includes(key); const value = state.values?.[row]?.[col] || 0; let content = ''; if (isAgent) content = '🤖' + directionSymbol(state.agent.dir || 1); else if (isGoal) content = '🎯'; else if (isWall) content = '🧱'; else if (isReward) content = '⭐'; else if (isCost) content = '⚠️'; else if (isVisited) content = '👣'; const intensity = Math.min(0.35, Math.abs(value) / 120); const color = value >= 0 ? '16, 185, 129' : '239, 68, 68'; const valueStyle = options.showValues && !isWall && !isAgent && !isGoal ? ' style="background: rgba(' + color + ', ' + intensity.toFixed(2) + ');"' : ''; const label = options.showValues && !isWall && !content ? '<span class="lab-cell-value">' + Math.round(value) + '</span>' : content; cells.push('<div class="grid-cell lab-cell ' + (isAgent ? 'agent ' : '') + (isGoal ? 'goal ' : '') + (isWall ? 'wall ' : '') + (isVisited ? 'visited ' : '') + (isRoute ? 'route ' : '') + (isReward ? 'reward ' : '') + (isCost ? 'cost ' : '') + (options.showValues ? 'learned ' : '') + '"' + valueStyle + '>' + label + '</div>'); } } grid.innerHTML = cells.join(''); }
function findLabPath(start, goal, obstacles = LAB_BASE_OBSTACLES) { const queue = [[start]]; const seen = [labKey(start.row, start.col)]; while (queue.length) { const path = queue.shift(); const current = path[path.length - 1]; if (labSameCell(current, goal)) return path; labNeighbors(current, obstacles).forEach(next => { const key = labKey(next.row, next.col); if (!seen.includes(key)) { seen.push(key); queue.push(path.concat({ row: next.row, col: next.col, dir: next.dir })); } }); } return []; }
function initModelAgent() { modelAgentState = { agent: { row: 0, col: 0, dir: 1 }, goal: { row: 4, col: 4 }, obstacles: LAB_BASE_OBSTACLES.slice(), visited: ['0,0'], stopped: false, showMemory: false }; renderModelAgent(); }
function renderModelAgent() { if (!modelAgentState) return; renderLabGrid('model-agent-grid', modelAgentState); const stats = document.getElementById('model-agent-stats'); if (stats) stats.innerHTML = '<div><strong>Posición</strong><span>(' + modelAgentState.agent.row + ', ' + modelAgentState.agent.col + ')</span></div><div><strong>Dirección</strong><span>' + directionSymbol(modelAgentState.agent.dir) + '</span></div><div><strong>Celdas visitadas</strong><span>' + modelAgentState.visited.length + '</span></div><div><strong>Memoria interna</strong><span>' + (modelAgentState.showMemory ? 'Visible' : 'Oculta') + '</span></div>'; const box = document.getElementById('model-agent-memory-box'); if (box) { box.classList.toggle('show', modelAgentState.showMemory); box.innerHTML = '<strong>Memoria:</strong> ' + modelAgentState.visited.join(' · '); } }
function stepModelAgent() { if (!modelAgentState || modelAgentState.stopped) return; if (labSameCell(modelAgentState.agent, modelAgentState.goal)) { modelAgentState.stopped = true; renderModelAgent(); return; } const current = modelAgentState.agent; const candidates = [current.dir, (current.dir + 1) % 4, (current.dir + 3) % 4, (current.dir + 2) % 4].map(dir => ({ dir, row: current.row + LAB_DIRECTIONS[dir][0], col: current.col + LAB_DIRECTIONS[dir][1] })).filter(next => !labIsBlocked(next.row, next.col, modelAgentState.obstacles)); const fresh = candidates.find(next => !modelAgentState.visited.includes(labKey(next.row, next.col))); const next = fresh || candidates[0]; if (!next) { current.dir = (current.dir + 1) % 4; renderModelAgent(); return; } modelAgentState.agent = { row: next.row, col: next.col, dir: next.dir }; const key = labKey(next.row, next.col); if (!modelAgentState.visited.includes(key)) modelAgentState.visited.push(key); if (labSameCell(modelAgentState.agent, modelAgentState.goal)) modelAgentState.stopped = true; renderModelAgent(); }
function initGoalAgent() { if (goalAgentTimer) clearInterval(goalAgentTimer); goalAgentTimer = null; goalAgentState = { agent: { row: 0, col: 0, dir: 1 }, goal: { row: 4, col: 4 }, obstacles: LAB_BASE_OBSTACLES.slice(), path: [], stepIndex: 0, status: 'Ruta sin calcular.' }; renderGoalAgent(); }
function renderGoalAgent() { if (!goalAgentState) return; renderLabGrid('goal-agent-grid', goalAgentState, { route: goalAgentState.path }); const stats = document.getElementById('goal-agent-stats'); if (stats) stats.innerHTML = '<div><strong>Ruta calculada</strong><span>' + (goalAgentState.path.length ? 'Sí' : 'No') + '</span></div><div><strong>Pasos</strong><span>' + Math.max(goalAgentState.path.length - 1, 0) + '</span></div><div><strong>Estado</strong><span>' + goalAgentState.status + '</span></div><div><strong>Longitud de ruta</strong><span>' + goalAgentState.path.length + ' celdas</span></div>'; }
function planGoalAgent() { if (!goalAgentState) return; goalAgentState.path = findLabPath(goalAgentState.agent, goalAgentState.goal, goalAgentState.obstacles); goalAgentState.stepIndex = 0; goalAgentState.status = goalAgentState.path.length ? 'Ruta lista.' : 'No hay ruta disponible.'; renderGoalAgent(); }
function stepGoalAgent() { if (!goalAgentState) return; if (!goalAgentState.path.length) planGoalAgent(); if (goalAgentState.stepIndex >= goalAgentState.path.length - 1) { goalAgentState.status = 'Meta alcanzada.'; renderGoalAgent(); if (goalAgentTimer) clearInterval(goalAgentTimer); goalAgentTimer = null; return; } goalAgentState.stepIndex += 1; const next = goalAgentState.path[goalAgentState.stepIndex]; const previous = goalAgentState.path[goalAgentState.stepIndex - 1]; const dir = LAB_DIRECTIONS.findIndex(([dr, dc]) => previous.row + dr === next.row && previous.col + dc === next.col); goalAgentState.agent = { row: next.row, col: next.col, dir: dir >= 0 ? dir : goalAgentState.agent.dir }; goalAgentState.status = labSameCell(goalAgentState.agent, goalAgentState.goal) ? 'Meta alcanzada.' : 'Siguiendo ruta.'; renderGoalAgent(); }
function scoreUtilityPath(path, state) { return path.reduce((score, cell, index) => { let total = score + (index === 0 ? 0 : -1); const key = labKey(cell.row, cell.col); if (state.rewards.includes(key)) total += 20; if (state.costs.includes(key)) total -= 15; if (labSameCell(cell, state.goal)) total += 100; return total; }, 0); }
function findUtilityPaths(state) { const paths = []; function walk(cell, path, seen) { if (path.length > 14) return; if (labSameCell(cell, state.goal)) { paths.push(path); return; } labNeighbors(cell, state.obstacles).forEach(next => { const key = labKey(next.row, next.col); if (!seen.includes(key)) walk(next, path.concat({ row: next.row, col: next.col, dir: next.dir }), seen.concat(key)); }); } walk(state.start, [state.start], [labKey(state.start.row, state.start.col)]); return paths; }
function initUtilityAgent() { utilityAgentState = { start: { row: 0, col: 0, dir: 1 }, agent: { row: 0, col: 0, dir: 1 }, goal: { row: 4, col: 4 }, obstacles: ['1,1', '1,3', '2,1', '3,3'], rewards: ['0,3', '3,2'], costs: ['2,2', '4,1'], path: [], stepIndex: 0, utility: 0, showUtility: false, status: 'Mejor ruta sin calcular.' }; renderUtilityAgent(); }
function renderUtilityAgent() { if (!utilityAgentState) return; renderLabGrid('utility-agent-grid', utilityAgentState, { route: utilityAgentState.path }); const stats = document.getElementById('utility-agent-stats'); if (stats) stats.innerHTML = '<div><strong>Utilidad total</strong><span>' + utilityAgentState.utility + '</span></div><div><strong>Costos</strong><span>-15 por ⚠️, -1 por paso</span></div><div><strong>Recompensas</strong><span>+20 por ⭐, +100 meta</span></div><div><strong>Ruta elegida</strong><span>' + (utilityAgentState.path.length ? utilityAgentState.path.length + ' celdas' : 'Pendiente') + '</span></div>'; const box = document.getElementById('utility-agent-score-box'); if (box) { box.classList.toggle('show', utilityAgentState.showUtility); box.innerHTML = '<strong>Utilidad:</strong> meta +100, recompensa +20, costo -15, paso -1. Resultado actual: ' + utilityAgentState.utility + '.'; } }
function planUtilityAgent() { if (!utilityAgentState) return; const paths = findUtilityPaths(utilityAgentState); const scored = paths.map(path => ({ path, score: scoreUtilityPath(path, utilityAgentState) })).sort((a, b) => b.score - a.score); const best = scored[0]; utilityAgentState.path = best ? best.path : []; utilityAgentState.utility = best ? best.score : 0; utilityAgentState.stepIndex = 0; utilityAgentState.agent = { ...utilityAgentState.start }; utilityAgentState.status = best ? 'Ruta con mejor utilidad lista.' : 'No hay ruta disponible.'; renderUtilityAgent(); }
function stepUtilityAgent() { if (!utilityAgentState) return; if (!utilityAgentState.path.length) planUtilityAgent(); if (utilityAgentState.stepIndex >= utilityAgentState.path.length - 1) { renderUtilityAgent(); return; } utilityAgentState.stepIndex += 1; const next = utilityAgentState.path[utilityAgentState.stepIndex]; const previous = utilityAgentState.path[utilityAgentState.stepIndex - 1]; const dir = LAB_DIRECTIONS.findIndex(([dr, dc]) => previous.row + dr === next.row && previous.col + dc === next.col); utilityAgentState.agent = { row: next.row, col: next.col, dir: dir >= 0 ? dir : utilityAgentState.agent.dir }; renderUtilityAgent(); }
function initLearningAgent() { learningAgentState = { agent: { row: 0, col: 0, dir: 1 }, goal: { row: 4, col: 4 }, obstacles: LAB_BASE_OBSTACLES.slice(), values: Array.from({ length: LAB_SIZE }, () => Array(LAB_SIZE).fill(0)), episodes: 0, successes: 0, bestPath: [], showTable: false }; renderLearningAgent(); }
function renderLearningAgent() { if (!learningAgentState) return; renderLabGrid('learning-agent-grid', learningAgentState, { route: learningAgentState.bestPath, showValues: true }); const rate = learningAgentState.episodes ? Math.round((learningAgentState.successes / learningAgentState.episodes) * 100) : 0; const stats = document.getElementById('learning-agent-stats'); if (stats) stats.innerHTML = '<div><strong>Episodios</strong><span>' + learningAgentState.episodes + '</span></div><div><strong>Éxitos</strong><span>' + learningAgentState.successes + '</span></div><div><strong>Tasa de éxito</strong><span>' + rate + '%</span></div><div><strong>Mejor ruta</strong><span>' + (learningAgentState.bestPath.length ? learningAgentState.bestPath.length + ' celdas' : 'Aprendiendo') + '</span></div>'; const box = document.getElementById('learning-agent-table-box'); if (box) { box.classList.toggle('show', learningAgentState.showTable); box.innerHTML = '<strong>Tabla aprendida:</strong> las celdas con valores más altos se colorean con mayor intensidad. Cada episodio ajusta la puntuación según si el agente se acerca o se aleja de la meta.'; } }
function updateLearningBestPath() { const path = [{ row: 0, col: 0, dir: 1 }]; const seen = ['0,0']; let current = path[0]; for (let i = 0; i < 16; i++) { if (labSameCell(current, learningAgentState.goal)) break; const options = labNeighbors(current, learningAgentState.obstacles).filter(next => !seen.includes(labKey(next.row, next.col))).sort((a, b) => (learningAgentState.values[b.row][b.col] - labDistance(b, learningAgentState.goal)) - (learningAgentState.values[a.row][a.col] - labDistance(a, learningAgentState.goal))); if (!options.length) break; current = options[0]; seen.push(labKey(current.row, current.col)); path.push({ row: current.row, col: current.col, dir: current.dir }); } learningAgentState.bestPath = path; }
function runLearningEpisode() { if (!learningAgentState) return; let current = { row: 0, col: 0, dir: 1 }; let success = false; for (let step = 0; step < 18; step++) { if (labSameCell(current, learningAgentState.goal)) { success = true; break; } const options = labNeighbors(current, learningAgentState.obstacles); const exploring = Math.random() < Math.max(0.12, 0.4 - learningAgentState.episodes * 0.01); const next = exploring ? options[Math.floor(Math.random() * options.length)] : options.sort((a, b) => (learningAgentState.values[b.row][b.col] - labDistance(b, learningAgentState.goal)) - (learningAgentState.values[a.row][a.col] - labDistance(a, learningAgentState.goal)))[0]; const before = labDistance(current, learningAgentState.goal); const after = labDistance(next, learningAgentState.goal); let reward = after < before ? 8 : -5; if (labSameCell(next, learningAgentState.goal)) reward = 60; learningAgentState.values[next.row][next.col] += reward * 0.25; current = { row: next.row, col: next.col, dir: next.dir }; if (labSameCell(current, learningAgentState.goal)) { success = true; break; } } learningAgentState.episodes += 1; if (success) learningAgentState.successes += 1; learningAgentState.agent = current; updateLearningBestPath(); renderLearningAgent(); }
function resetAgentLab() { initModelAgent(); initGoalAgent(); initUtilityAgent(); initLearningAgent(); }
function initAgentLab() { const tabs = document.querySelectorAll('[data-agent-lab-tab]'); const panels = document.querySelectorAll('[data-agent-lab-panel]'); if (!tabs.length) return; tabs.forEach(tab => { tab.addEventListener('click', () => { tabs.forEach(item => item.classList.toggle('active', item === tab)); panels.forEach(panel => panel.classList.toggle('active', panel.dataset.agentLabPanel === tab.dataset.agentLabTab)); }); }); document.getElementById('model-agent-step')?.addEventListener('click', stepModelAgent); document.getElementById('model-agent-reset')?.addEventListener('click', initModelAgent); document.getElementById('model-agent-memory')?.addEventListener('click', () => { modelAgentState.showMemory = !modelAgentState.showMemory; renderModelAgent(); }); document.getElementById('goal-agent-plan')?.addEventListener('click', planGoalAgent); document.getElementById('goal-agent-step')?.addEventListener('click', stepGoalAgent); document.getElementById('goal-agent-auto')?.addEventListener('click', () => { if (goalAgentTimer) { clearInterval(goalAgentTimer); goalAgentTimer = null; return; } if (!goalAgentState.path.length) planGoalAgent(); goalAgentTimer = setInterval(stepGoalAgent, 650); }); document.getElementById('goal-agent-reset')?.addEventListener('click', initGoalAgent); document.getElementById('utility-agent-plan')?.addEventListener('click', planUtilityAgent); document.getElementById('utility-agent-step')?.addEventListener('click', stepUtilityAgent); document.getElementById('utility-agent-score')?.addEventListener('click', () => { utilityAgentState.showUtility = !utilityAgentState.showUtility; renderUtilityAgent(); }); document.getElementById('utility-agent-reset')?.addEventListener('click', initUtilityAgent); document.getElementById('learning-agent-episode')?.addEventListener('click', runLearningEpisode); document.getElementById('learning-agent-ten')?.addEventListener('click', () => { for (let i = 0; i < 10; i++) runLearningEpisode(); }); document.getElementById('learning-agent-table')?.addEventListener('click', () => { learningAgentState.showTable = !learningAgentState.showTable; renderLearningAgent(); }); document.getElementById('learning-agent-reset')?.addEventListener('click', initLearningAgent); resetAgentLab(); }
function initAgentCases() { const grid = document.getElementById('agent-case-grid'); if (!grid) return; grid.innerHTML = AGENT_CASES.map(item => '<button class="card area-card agent-case-card" data-agent-case="' + item.key + '"><div class="area-card-header"><span class="area-emoji">' + item.icon + '</span><h3>' + item.title + '</h3></div><p class="area-example">Analizar percepción, decisión, acción y objetivo.</p></button>').join(''); grid.querySelectorAll('[data-agent-case]').forEach(btn => { btn.addEventListener('click', () => { const item = AGENT_CASES.find(agentCase => agentCase.key === btn.dataset.agentCase); document.getElementById('agent-case-result').innerHTML = '<h3>' + item.icon + ' ' + item.title + '</h3><div class="agent-result-table-wrap"><table class="agent-result-table"><tbody><tr><th>Percibe</th><td>' + item.perceives + '</td></tr><tr><th>Decide</th><td>' + item.decides + '</td></tr><tr><th>Actúa</th><td>' + item.acts + '</td></tr><tr><th>Objetivo</th><td>' + item.objective + '</td></tr></tbody></table></div>'; }); }); }
function initAgentComponents() { const grid = document.getElementById('agent-components-grid'); if (!grid) return; grid.innerHTML = AGENT_COMPONENTS.map(([icon, title, description, example]) => '<article class="card agent-component-card"><div class="area-card-header"><span class="area-emoji">' + icon + '</span><h3>' + title + '</h3></div><p>' + description + '</p><div class="extra-info show"><strong>Ejemplo:</strong> ' + example + '</div></article>').join(''); }
function initPeasTable() { const selector = document.getElementById('peas-selector'); if (!selector) return; selector.innerHTML = Object.entries(PEAS_EXAMPLES).map(([key, item], index) => '<button class="btn btn-secondary btn-small ' + (index === 0 ? 'active' : '') + '" data-peas="' + key + '">' + item.label + '</button>').join(''); selector.querySelectorAll('[data-peas]').forEach(btn => { btn.addEventListener('click', () => { selector.querySelectorAll('.btn').forEach(item => item.classList.remove('active')); btn.classList.add('active'); renderPeasTable(btn.dataset.peas); }); }); renderPeasTable('taxi'); }
function renderPeasTable(key) { const item = PEAS_EXAMPLES[key]; const body = document.querySelector('#peas-table tbody'); if (!item || !body) return; body.innerHTML = '<tr><td><strong>P</strong> Performance / Medida de desempeño</td><td>' + item.performance + '</td></tr><tr><td><strong>E</strong> Environment / Entorno</td><td>' + item.environment + '</td></tr><tr><td><strong>A</strong> Actuators / Actuadores</td><td>' + item.actuators + '</td></tr><tr><td><strong>S</strong> Sensors / Sensores</td><td>' + item.sensors + '</td></tr>'; }
function initAgentTypes() { const grid = document.getElementById('agent-types-grid'); if (!grid) return; grid.innerHTML = AGENT_TYPES.map(([icon, title, description, example], index) => '<article class="card agent-type-card"><div class="area-card-header"><span class="area-emoji">' + icon + '</span><h3>' + title + '</h3></div><p>' + description + '</p><button class="btn btn-secondary btn-small type-example-toggle" data-type-example="' + index + '">Ver ejemplo práctico</button><div class="extra-info" id="type-example-' + index + '"><strong>Ejemplo:</strong> ' + example + '</div></article>').join(''); grid.querySelectorAll('.type-example-toggle').forEach(btn => { btn.addEventListener('click', () => { document.getElementById('type-example-' + btn.dataset.typeExample)?.classList.toggle('show'); }); }); }
function directionSymbol(dir) { return ['⬆️', '➡️', '⬇️', '⬅️'][dir]; }
function resetSimulator() { simulatorState.agent = { row: 0, col: 0, dir: 1 }; simulatorState.stopped = false; const status = document.getElementById('agent-status'); if (status) status.textContent = 'Listo para iniciar.'; renderSimulator(); }
function renderSimulator() { const grid = document.getElementById('agent-grid'); if (!grid) return; const cells = []; for (let row = 0; row < simulatorState.size; row++) { for (let col = 0; col < simulatorState.size; col++) { const key = row + ',' + col; const isAgent = row === simulatorState.agent.row && col === simulatorState.agent.col; const isGoal = row === simulatorState.goal.row && col === simulatorState.goal.col; const isWall = simulatorState.obstacles.includes(key); const content = isAgent ? '🤖' + directionSymbol(simulatorState.agent.dir) : isGoal ? '🎯' : isWall ? '🧱' : ''; cells.push('<div class="grid-cell ' + (isAgent ? 'agent' : '') + ' ' + (isGoal ? 'goal' : '') + ' ' + (isWall ? 'wall' : '') + '">' + content + '</div>'); } } grid.innerHTML = cells.join(''); }
function moveAgent() { if (simulatorState.stopped) return; const deltas = [[-1, 0], [0, 1], [1, 0], [0, -1]]; const [dr, dc] = deltas[simulatorState.agent.dir]; const next = { row: simulatorState.agent.row + dr, col: simulatorState.agent.col + dc }; const outside = next.row < 0 || next.row >= simulatorState.size || next.col < 0 || next.col >= simulatorState.size; const blocked = outside || simulatorState.obstacles.includes(next.row + ',' + next.col); const status = document.getElementById('agent-status'); if (simulatorState.agent.row === simulatorState.goal.row && simulatorState.agent.col === simulatorState.goal.col) { simulatorState.stopped = true; if (status) status.textContent = 'Meta alcanzada. El agente se detiene.'; renderSimulator(); return; } if (blocked) { simulatorState.agent.dir = (simulatorState.agent.dir + 1) % 4; if (status) status.textContent = 'Obstáculo detectado: gira a la derecha.'; } else { simulatorState.agent.row = next.row; simulatorState.agent.col = next.col; if (status) status.textContent = 'Celda libre: avanza.'; } if (simulatorState.agent.row === simulatorState.goal.row && simulatorState.agent.col === simulatorState.goal.col) { simulatorState.stopped = true; if (status) status.textContent = 'Meta alcanzada. El agente se detiene.'; } renderSimulator(); }
function initClassification() { const grid = document.getElementById('agent-classification-grid'); if (!grid) return; grid.innerHTML = CLASSIFICATION_CASES.map(([text, answer], index) => '<div class="match-row classification-row"><div><strong>' + (index + 1) + '. ' + text + '</strong><div class="classification-feedback" id="classification-feedback-' + index + '"></div></div><select data-classification="' + index + '" data-answer="' + answer + '"><option value="">Selecciona el tipo</option>' + CLASSIFICATION_OPTIONS.map(option => '<option value="' + option + '">' + option + '</option>').join('') + '</select></div>').join(''); grid.querySelectorAll('select').forEach(select => { select.addEventListener('change', () => { const feedback = document.getElementById('classification-feedback-' + select.dataset.classification); if (!feedback) return; if (!select.value) { feedback.textContent = ''; return; } const isCorrect = select.value === select.dataset.answer; feedback.innerHTML = isCorrect ? '✅ Correcto.' : '❌ Revisa: la respuesta esperada es ' + select.dataset.answer + '.'; feedback.style.color = isCorrect ? 'var(--success)' : 'var(--error)'; }); }); }
function initClass2Interactions() { initAgentCases(); initAgentComponents(); initPeasTable(); initAgentTypes(); resetSimulator(); initAgentLab(); initClassification(); }
function resetClass2() { document.querySelectorAll('.agenda-item').forEach(item => item.classList.remove('active')); document.querySelectorAll('.agent-type-card .extra-info, .answer-box, #model-agent-memory-box, #utility-agent-score-box, #learning-agent-table-box').forEach(el => el.classList.remove('show')); document.getElementById('agent-rule-box')?.classList.remove('show'); const result = document.getElementById('agent-case-result'); if (result) result.innerHTML = '<p>Selecciona un caso para analizarlo como agente inteligente.</p>'; document.querySelectorAll('textarea').forEach(field => { field.value = ''; }); document.querySelectorAll('[data-agent-lab-tab]').forEach(tab => tab.classList.toggle('active', tab.dataset.agentLabTab === 'reactive')); document.querySelectorAll('[data-agent-lab-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.agentLabPanel === 'reactive')); initPeasTable(); initClassification(); resetSimulator(); resetAgentLab(); window.Course?.goToSection(0); }
document.addEventListener('DOMContentLoaded', () => { initClass2Interactions(); document.getElementById('btn-iniciar-c2')?.addEventListener('click', () => window.Course?.goToSection(1)); document.getElementById('agent-move')?.addEventListener('click', moveAgent); document.getElementById('agent-reset')?.addEventListener('click', resetSimulator); document.getElementById('agent-rule')?.addEventListener('click', () => document.getElementById('agent-rule-box')?.classList.toggle('show')); document.getElementById('show-peas-example')?.addEventListener('click', () => document.getElementById('peas-example-box')?.classList.toggle('show')); document.getElementById('btn-reiniciar-c2')?.addEventListener('click', resetClass2); });

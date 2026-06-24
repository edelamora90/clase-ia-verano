const bfsOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'ET10', 'H'];
const dfsOrder = ['Inicio', 'Pasillo A', '...', 'Sin solución', 'Regresar', 'Pasillo B'];

function renderMiniGrids() {
  document.querySelectorAll('.mini-grid').forEach(grid => {
    const isStateB = grid.classList.contains('state-b');
    const cells = [];
    for (let i = 0; i < 24; i += 1) {
      const robotIndex = isStateB ? 10 : 9;
      cells.push('<span>' + (i === robotIndex ? '🤖' : '') + '</span>');
    }
    grid.innerHTML = cells.join('');
  });
}

function renderStateDots() {
  const target = document.querySelector('.state-dot-grid');
  if (!target) return;
  const walls = new Set([3, 10, 16, 22]);
  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    cells.push('<span class="' + (walls.has(i) ? 'wall' : '') + '">' + (walls.has(i) ? '' : '•') + '</span>');
  }
  target.innerHTML = cells.join('');
}

function showSearchOrder(type) {
  const target = document.getElementById('search-demo-output');
  if (!target) return;
  const order = type === 'bfs' ? bfsOrder : dfsOrder;
  const label = type === 'bfs' ? 'BFS explora por niveles' : 'DFS profundiza una rama';
  target.innerHTML = '<strong>' + label + ':</strong> ' + order.map((item, index) => '<span>' + (index + 1) + '. ' + item + '</span>').join('');
}

function initClass3Interactions() {
  renderMiniGrids();
  renderStateDots();
  document.getElementById('run-bfs-demo')?.addEventListener('click', () => showSearchOrder('bfs'));
  document.getElementById('run-dfs-demo')?.addEventListener('click', () => showSearchOrder('dfs'));
}

function resetClass3() {
  renderMiniGrids();
  renderStateDots();
  const target = document.getElementById('search-demo-output');
  if (target) target.innerHTML = '<strong>Simulación:</strong> usa los botones de BFS o DFS para ver el orden de exploración.';
  window.Course?.goToSection(0);
}

document.addEventListener('DOMContentLoaded', initClass3Interactions);

# Prompt para Codex — Refactoring completo del proyecto "Curso IA"

## Contexto del proyecto

Tienes un proyecto de presentación educativa (curso de Inteligencia Artificial universitario) que actualmente consiste en:
- `index.html` — home con la barra lateral + Clase 1 y Clase 2 embebidas en el mismo archivo
- `clase1.html` — versión separada de la Clase 1

El proyecto usa HTML puro, CSS inline y JS inline (sin frameworks). El diseño usa un tema dark con variables CSS (`--bg-primary: #0a0e1a`, `--cyan: #06b6d4`, `--blue: #3b82f6`, `--purple: #8b5cf6`, etc.) y una barra lateral fija de 300px.

---

## Objetivo general

Refactorizar el proyecto en archivos separados con estructura profesional y corregir múltiples bugs de UI. El resultado debe ser:

```
/proyecto
  index.html       ← home/landing del curso (solo la portada del curso con la sidebar)
  clase1.html      ← Clase 1 completa (separada del index)
  clase2.html      ← Clase 2 completa (separada del index)
  styles.css       ← hoja de estilos compartida (extraída del HTML)
  main.js          ← JS compartido (sidebar, progress bar, navegación)
  clase1.js        ← lógica exclusiva de Clase 1 (quiz, actividad1, agenda)
  clase2.js        ← lógica exclusiva de Clase 2 (agentes, PEAS, simulador, clasificación)
```

---

## Tarea 1 — Separar archivos

### 1.1 Crear `styles.css`
Extraer todo el CSS que está dentro de las etiquetas `<style>` del `index.html` actual. Este CSS debe incluir:
- Variables CSS (`:root { ... }`)
- Reset y base (`*, body, html`)
- Barra lateral (`.course-sidebar`, `.lesson-tab`, `.progress-panel`, etc.)
- Componentes compartidos (`.card`, `.btn`, `.container`, `.section-title`, `.section-label`, etc.)
- Componentes de sección (`.flip-card`, `.agenda-timeline`, `.history-timeline`, `.type-card`, `.area-card`, etc.)
- Componentes de Clase 2 (`.milestone-card`, `.simulator-layout`, `.agent-grid`, `.match-row`, etc.)
- Media queries
- **Incluir todas las correcciones de UI descritas en la Tarea 3**

### 1.2 Crear `main.js`
Extraer y centralizar:
- Función `switchLesson(lessonId, sectionIndex)` — cambia entre vistas de clase
- Lógica de la sidebar: event listeners en `.lesson-tab`
- Sistema de navegación por secciones (`goToSection`, `updateProgressBar`, `trackCurrentSection`, `refreshActiveSections`, `initSectionObserver`, `updateSectionIndicator`)
- Event listeners de teclado (flechas)
- Progress bar
- Botones `btn-prev` / `btn-next`

### 1.3 Crear `clase1.js`
Extraer:
- Datos: `AI_APPS` (objeto con netflix, youtube, spotify, maps, whatsapp, tiktok, bancos, camara)
- Datos: `QUIZ_DATA` (array de preguntas)
- `initQuiz()` y su lógica
- Actividad 1: `initActivity1()` — botones de apps con `.activity-btn`
- Inicialización de `agenda-timeline` (accordeon)
- Event listener del botón `btn-iniciar` (scroll a siguiente sección)
- Event listener del botón `btn-reiniciar` (vuelve a sección 0)

### 1.4 Crear `clase2.js`
Extraer:
- Datos: `AGENT_CASES`, `AGENT_COMPONENTS`, `PEAS_EXAMPLES`, `AGENT_TYPES`, `CLASSIFICATION_CASES`, `CLASSIFICATION_OPTIONS`
- `initAgentCases()`, `initAgentComponents()`, `initPeasTable()`, `renderPeasTable()`, `initAgentTypes()`, `initClassification()`
- Simulador: `simulatorState`, `resetSimulator()`, `renderSimulator()`, `moveAgent()`, `directionSymbol()`
- `initClass2Interactions()` y `resetClass2()`
- Event listeners: `agent-move`, `agent-reset`, `agent-rule`, `show-peas-example`, `btn-reiniciar-c2`
- Event listeners debate toggle (`.debate-toggle`) — si solo se usan en clase2
- Event listener `btn-iniciar-c2`

### 1.5 Crear `index.html` (nuevo)
- Página de inicio del curso (landing/home) con la barra lateral
- Muestra la lista de clases disponibles con tarjetas de navegación
- Cada tarjeta enlaza a `clase1.html` o `clase2.html`
- Mantiene el mismo diseño dark y la sidebar retráctil (ver Tarea 2)
- Incluir: `<link rel="stylesheet" href="styles.css">` y `<script src="main.js"></script>`

### 1.6 Crear `clase1.html`
- Contiene el HTML de las 13 secciones de la Clase 1 (desde `#portada` hasta `#cierre`)
- Incluye la sidebar lateral retráctil con enlace de regreso al index
- Incluir: `<link rel="stylesheet" href="styles.css">`, `<script src="main.js"></script>`, `<script src="clase1.js"></script>`

### 1.7 Crear `clase2.html`
- Contiene el HTML de las secciones de la Clase 2 (desde `#c2-portada` hasta `#c2-cierre`)
- Incluye la sidebar lateral retráctil con enlace de regreso al index
- Incluir: `<link rel="stylesheet" href="styles.css">`, `<script src="main.js"></script>`, `<script src="clase2.js"></script>`

---

## Tarea 2 — Sidebar retráctil

### Comportamiento requerido
La barra lateral actualmente es `position: fixed; width: 300px` y el `body` tiene `padding-left: 300px`. Esto consume espacio permanentemente. Debe convertirse en un panel colapsable.

### Implementación

**HTML — agregar botón toggle:**
```html
<button class="sidebar-toggle" id="sidebar-toggle" aria-label="Mostrar/ocultar menú">
  ☰
</button>
<aside class="course-sidebar" id="course-sidebar" aria-label="Navegación del curso">
  <!-- contenido actual de la sidebar -->
</aside>
```

**CSS — sidebar colapsable:**
```css
/* Estado expandido (por defecto en desktop) */
.course-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: 280px;
  transform: translateX(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* resto de estilos actuales */
}

/* Estado colapsado */
.course-sidebar.collapsed {
  transform: translateX(-100%);
}

body {
  padding-left: 280px;
  transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body.sidebar-collapsed {
  padding-left: 0;
}

/* Botón toggle — siempre visible */
.sidebar-toggle {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 950;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(17, 24, 39, 0.92);
  backdrop-filter: blur(12px);
  color: var(--text-primary);
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.sidebar-toggle:hover {
  background: var(--gradient);
  border-color: transparent;
}

/* En mobile: sidebar siempre fuera, se abre sobre el contenido */
@media (max-width: 768px) {
  body { padding-left: 0; }
  body.sidebar-collapsed { padding-left: 0; }
  .course-sidebar { width: 260px; }
  .course-sidebar:not(.collapsed) {
    box-shadow: 4px 0 32px rgba(0, 0, 0, 0.6);
  }
}
```

**JS — lógica del toggle (en `main.js`):**
```javascript
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('course-sidebar');

// Inicializar estado desde localStorage
const sidebarState = localStorage.getItem('sidebarCollapsed');
if (sidebarState === 'true') {
  sidebar.classList.add('collapsed');
  document.body.classList.add('sidebar-collapsed');
}

sidebarToggle.addEventListener('click', () => {
  const isCollapsed = sidebar.classList.toggle('collapsed');
  document.body.classList.toggle('sidebar-collapsed', isCollapsed);
  localStorage.setItem('sidebarCollapsed', isCollapsed);
  sidebarToggle.textContent = isCollapsed ? '☰' : '✕';
});
```

---

## Tarea 3 — Correcciones de UI por sección

### Sección 1 (Portada/Hero) — Botón "Iniciar clase" centrado

**Problema:** El botón `#btn-iniciar` no está centrado visualmente.

**Corrección en CSS:**
```css
/* El contenedor .hero-content ya tiene text-align: center y es flex column */
/* Asegurarse de que el botón tenga display block o inline-block con margin auto */
#portada .hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#btn-iniciar, #btn-iniciar-c2 {
  align-self: center;
  margin: 0 auto;
}
```

---

### Sección 2 (Objetivos) — Texto renderizándose letra por letra (vertical)

**Diagnóstico exacto del bug:**
El `.objective-card` es `display: flex`. El `.objective-number` tiene `flex-shrink: 0` y un ancho fijo de 48px, correcto. Pero el `h3` hijo NO tiene `min-width: 0` ni `flex: 1`. En flexbox, el `min-width` implícito de un elemento de texto es su `min-content` width. Cuando el card no tiene espacio suficiente (grid de 2 columnas + padding 28px de la card + sidebar de 300px), el navegador colapsa el `h3` a ~1 carácter de ancho y el texto cae letra por letra en vertical. Se ve exactamente así en el screenshot.

**Corrección en CSS — dos líneas críticas:**
```css
.objective-card {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  /* SIN CAMBIOS en el card en sí */
}

.objective-number {
  flex-shrink: 0;   /* ya estaba — mantener */
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

/* LA CORRECCIÓN REAL está aquí: */
.objective-card h3 {
  flex: 1;              /* ← ocupa todo el espacio restante */
  min-width: 0;         /* ← anula el min-content implícito de flexbox */
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5;
  overflow-wrap: break-word; /* seguridad extra */
}
```

**Verificación:** Con `flex: 1` y `min-width: 0` el h3 siempre ocupa el espacio disponible (ancho del card − 48px del número − 20px de gap) y el texto hace wrap normal. Sin estas dos propiedades, flexbox no puede encoger el h3 por debajo de su `min-content`, forzando el desborde o el colapso vertical.

---

### Sección 4 (¿Qué es la IA?) — Rediseño de `.definition-card`

**Problema:** El título (quote `"`) a la derecha de cada card se ve mal. La pseudoclase `::before` con `content: '"'` se superpone o posiciona de forma extraña.

**Corrección:** Rediseñar la `.definition-card` usando un enfoque más limpio:

```css
.definition-card {
  background: var(--gradient-subtle);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-left: 4px solid var(--purple); /* borde izquierdo de acento */
  border-radius: var(--radius);
  padding: 32px 36px;
  margin-top: 32px;
  position: relative;
}

/* Eliminar el ::before con la comilla flotante */
.definition-card::before {
  content: none; /* desactivar */
}

/* Nueva estructura: agregar comilla decorativa integrada en el flujo */
.definition-card .quote-mark {
  display: block;
  font-size: 3.5rem;
  line-height: 1;
  color: var(--purple);
  opacity: 0.4;
  font-family: Georgia, serif;
  margin-bottom: 8px;
}

.definition-card p {
  font-size: 1.15rem;
  font-style: italic;
  color: var(--text-primary);
  line-height: 1.75;
  padding-left: 0; /* quitar padding-left anterior */
}

.definition-card .quote-source {
  display: block;
  margin-top: 16px;
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: normal;
}
```

**En el HTML de `clase1.html`**, cambiar la estructura del `.definition-card`:
```html
<div class="definition-card">
  <span class="quote-mark">"</span>
  <p>La Inteligencia Artificial es una rama de la computación que busca crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana, como aprender, razonar, tomar decisiones, reconocer patrones y resolver problemas.</p>
</div>
```

---

### Sección 5 (Mitos y Realidades) — Comillas en flip-card

**Problema:** La comilla de apertura `"` del texto del mito queda encimada con el contenido de la cita. La comilla de cierre `"` no aparece o queda mal posicionada.

**Corrección:** Los textos de los mitos están entre comillas directamente en el `p.flip-text`. Eliminar las comillas del contenido del texto y manejarlas con CSS:

```css
.flip-card-front .flip-text {
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.5;
  /* sin posición relativa problemática */
}

/* Si se quieren comillas decorativas, usar quotes de CSS */
.flip-card-front .flip-text::before { content: '\201C'; color: var(--error); opacity: 0.5; font-size: 1.2em; }
.flip-card-front .flip-text::after  { content: '\201D'; color: var(--error); opacity: 0.5; font-size: 1.2em; }
```

**En el HTML**, quitar las comillas del texto de cada `.flip-text` del frente:
```html
<!-- ANTES -->
<p class="flip-text">"La IA piensa como un ser humano."</p>

<!-- DESPUÉS -->
<p class="flip-text">La IA piensa como un ser humano.</p>
```

Aplicar a las 4 tarjetas flip de mitos.

---

### Sección 8 (Áreas de Aplicación) — Padding superior en botones y títulos junto al ícono

**Problema 1:** Los botones de acción (`.area-question`, texto inferior) están muy pegados al texto de arriba.

**Corrección:**
```css
.area-card {
  text-align: center;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.area-emoji {
  font-size: 2.4rem;
  margin-bottom: 0;
  line-height: 1;
}

/* Rediseño: emoji + título en la misma fila */
.area-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  width: 100%;
}

.area-card-header .area-emoji {
  font-size: 2rem;
  flex-shrink: 0;
}

.area-card-header h3 {
  font-size: 1rem;
  font-weight: 700;
  text-align: left;
  margin: 0;
  line-height: 1.3;
}

.area-example {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin-bottom: 16px;    /* más separación */
  text-align: left;
  width: 100%;
}

.area-question {
  font-size: 0.85rem;
  color: var(--purple);
  font-style: italic;
  border-top: 1px solid var(--border);
  padding-top: 16px;       /* más aire */
  margin-top: auto;        /* empuja al fondo del card */
  width: 100%;
  text-align: left;
}
```

**En el HTML de `clase1.html`**, actualizar la estructura de cada `.area-card` para usar el nuevo `.area-card-header`:
```html
<!-- ANTES -->
<div class="card area-card">
  <div class="area-emoji">🎓</div>
  <h3>Educación</h3>
  <p class="area-example">Ejemplo: ...</p>
  <p class="area-question">¿...?</p>
</div>

<!-- DESPUÉS -->
<div class="card area-card">
  <div class="area-card-header">
    <span class="area-emoji">🎓</span>
    <h3>Educación</h3>
  </div>
  <p class="area-example">Ejemplo: ...</p>
  <p class="area-question">¿...?</p>
</div>
```

Aplicar a las 8 cards de áreas de aplicación.

---

### Sección 9 (Simulador — Clase 2) — Simulador encima de la card

**Problema:** El `.simulator-layout` usa `grid-template-columns: minmax(280px, 420px) 1fr` pero el grid del agente (`#agent-grid`) se superpone al panel lateral (`.simulator-panel.card`).

**Corrección:**
```css
.simulator-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 28px;
  align-items: start;
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  padding: 12px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.035);
  width: fit-content;     /* no se expande más de lo necesario */
  max-width: 360px;
}

.simulator-panel {
  min-width: 0;           /* permite que el flex/grid shrink funcione */
  overflow: hidden;
}

.simulator-panel .class2-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;       /* padding superior para separar del texto */
}

/* Mobile: apilar verticalmente */
@media (max-width: 768px) {
  .simulator-layout {
    grid-template-columns: 1fr;
  }
  .agent-grid {
    max-width: 100%;
    width: 100%;
  }
}
```

---

## Tarea 4 — Ancho de contenido al 85%

El contenido principal debe usar el 85% del ancho disponible (excluyendo la sidebar). Actualizar el `.container`:

```css
.container {
  width: 85%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

@media (max-width: 768px) {
  .container {
    width: 95%;
    padding: 0 16px;
  }
}
```

---

## Tarea 5 — Botón "Iniciar Clase 2" centrado (Clase 1, portada)

En el archivo `clase1.html`, la portada tiene un botón secundario para ir a la Clase 2. Este botón debe aparecer centrado bajo los meta-items:

```css
/* Si existe un botón para ir a la clase siguiente */
.btn-next-class {
  display: block;
  margin: 24px auto 0;
  text-align: center;
}
```

En el HTML, asegurarse de que el enlace o botón de "Iniciar Clase 2" esté envuelto en un div centrado:
```html
<div style="text-align: center; margin-top: 24px;">
  <a href="clase2.html" class="btn btn-secondary">Ir a Clase 2 →</a>
</div>
```

---

## Instrucciones de calidad de código

1. **No duplicar CSS.** Todo CSS compartido en `styles.css`. CSS específico de clase solo si es muy particular.
2. **No duplicar JS.** Funciones utilitarias en `main.js`. Lógica de datos en `clase1.js` / `clase2.js`.
3. **Cargar scripts al final del `<body>`.** Orden: `main.js` primero, luego el script específico de clase.
4. **Mantener los `id` y `data-*` exactamente igual** para no romper las referencias JS.
5. **Los `data-section` en cada `<section>` deben seguir siendo numéricos y consecutivos** dentro de cada archivo de clase.
6. **Preservar accesibilidad**: `aria-label`, `tabindex`, roles existentes.
7. **Sidebar:** Recordar estado en `localStorage` para que persista entre páginas.
8. **No usar frameworks** — solo HTML, CSS y JS vanilla.
9. **Cada archivo HTML** debe tener su propio `<title>` descriptivo:
   - `index.html` → `Inteligencia Artificial · Curso`
   - `clase1.html` → `Clase 1 · Introducción a la IA`
   - `clase2.html` → `Clase 2 · Agentes Inteligentes`

---

## Checklist de verificación final

- [ ] `index.html` solo tiene la landing del curso, no el contenido de clases
- [ ] `clase1.html` tiene sus 13 secciones completas con todos los interactivos funcionando
- [ ] `clase2.html` tiene sus secciones completas con simulador, PEAS, clasificación y quiz funcionando
- [ ] `styles.css` contiene todo el CSS (incluidas correcciones de UI)
- [ ] `main.js` maneja sidebar, navegación y progress bar
- [ ] `clase1.js` maneja quiz y actividad 1
- [ ] `clase2.js` maneja simulador, PEAS, casos y clasificación
- [ ] Sidebar es retráctil en todas las páginas y recuerda su estado
- [ ] Botón "Iniciar clase" centrado en portada
- [ ] Textos de objetivos no se desbordan de sus cards
- [ ] Definition-card sin comilla flotante solapada
- [ ] Flip-cards sin comillas duplicadas/solapadas
- [ ] Cards de Áreas de Aplicación con emoji + título alineados horizontalmente y padding correcto
- [ ] Simulador no se solapa con el panel de control
- [ ] Contenido al 85% del ancho disponible
- [ ] Navegación entre `index.html`, `clase1.html` y `clase2.html` funciona con links `<a href>`

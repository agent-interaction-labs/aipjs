/* ═══════════════════════════════════════════════════════════════════════════
   Demo Harness
   Sets up the full split-panel demo: nav, panels, terminal, scenario switching
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Create a full demo instance.
 *
 * @param {object} opts
 * @param {string} opts.container - CSS selector for the mount point
 * @param {object} opts.scenarios - Map of scenario name → { label, without: {html}, with: {html, aipConfig, manualConfig?} }
 * @param {object} opts.terminal - Agent terminal instance (from createAgentTerminal)
 * @param {string} [opts.defaultScenario] - Name of the default scenario
 * @param {string} [opts.defaultMode] - 'auto-inference' or 'manual-config'
 */
export function createDemo(opts) {
  const {
    container: containerSelector,
    scenarios,
    terminal,
    defaultScenario = Object.keys(scenarios)[0],
    defaultMode = 'auto-inference',
  } = opts;

  const root = document.querySelector(containerSelector);
  if (!root) throw new Error(`Container "${containerSelector}" not found`);

  let currentScenario = defaultScenario;
  let currentMode = defaultMode; // 'auto-inference' | 'manual-config'
  let aipInstance = null;

  // ── Build shell ────────────────────────────────────────────────────────

  root.innerHTML = `
    <div class="demo-shell">
      <nav class="demo-nav">
        <div class="nav-brand">
          <span class="logo-dot"></span>
          <span>aip.js</span>
          <span style="font-weight:400;color:var(--text-muted);font-size:12px;">Demo</span>
        </div>
        <div class="nav-label">Scenario</div>
        <div class="tab-group" id="scenario-tabs"></div>
        <div class="nav-spacer"></div>
        <div class="nav-label">Agent View</div>
        <div class="tab-group" id="view-tabs">
          <button class="tab-btn active" data-view="simple">Simple</button>
          <button class="tab-btn" data-view="raw">Raw</button>
        </div>
      </nav>

      <div class="split-panels" id="split-panels">
        <div class="panel" id="panel-without">
          <div class="panel-header without">
            <span class="status-dot"></span>
            <span>Without aip.js</span>
            <span class="panel-subtitle">Raw HTML — agent must scrape</span>
          </div>
          <div class="panel-content" id="panel-without-content"></div>
        </div>
        <div class="panel" id="panel-with">
          <div class="panel-header with">
            <span class="status-dot"></span>
            <span>With aip.js</span>
            <span class="panel-subtitle">Structured tools — agent reads schemas</span>
          </div>
          <div class="panel-mode-bar" id="panel-mode-bar">
            <div class="tab-group">
              <button class="tab-btn active" data-mode="auto-inference">Auto-Inference</button>
              <button class="tab-btn" data-mode="manual-config">Manual Config</button>
            </div>
          </div>
          <div class="panel-content" id="panel-with-content"></div>
        </div>
      </div>

      <div id="security-panel-container"></div>
      <div id="terminal-container"></div>
    </div>
  `;

  // ── Element refs ───────────────────────────────────────────────────────

  const scenarioTabs = root.querySelector('#scenario-tabs');
  const viewTabs = root.querySelector('#view-tabs');
  const panelWithoutContent = root.querySelector('#panel-without-content');
  const panelWithContent = root.querySelector('#panel-with-content');
  const panelModeBar = root.querySelector('#panel-mode-bar');
  const securityContainer = root.querySelector('#security-panel-container');
  const terminalContainer = root.querySelector('#terminal-container');

  // ── Scenario tabs ──────────────────────────────────────────────────────

  function renderScenarioTabs() {
    scenarioTabs.innerHTML = Object.entries(scenarios).map(([name, sc]) =>
      `<button class="tab-btn${name === currentScenario ? ' active' : ''}" data-scenario="${name}">${sc.label}</button>`
    ).join('');
  }

  scenarioTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    const name = btn.dataset.scenario;
    if (name && name !== currentScenario) {
      switchScenario(name);
    }
  });

  // ── View tabs (Simple/Raw) ─────────────────────────────────────────────

  viewTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    const view = btn.dataset.view;
    if (view) {
      viewTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
      terminal.setMode(view);
    }
  });

  // ── Mode tabs (Auto-Inference / Manual Config) ─────────────────────────

  panelModeBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    const mode = btn.dataset.mode;
    if (mode && mode !== currentMode) {
      switchMode(mode);
    }
  });

  // ── Scenario switching ─────────────────────────────────────────────────

  function switchScenario(name) {
    if (!scenarios[name]) return;
    currentScenario = name;
    renderScenarioTabs();
    loadScenario();
  }

  function switchMode(mode) {
    currentMode = mode;
    panelModeBar.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    loadScenario();
  }

  // ── Load scenario ──────────────────────────────────────────────────────

  function loadScenario() {
    const sc = scenarios[currentScenario];
    if (!sc) return;

    // Destroy previous aip.js instance
    if (aipInstance?.stop) {
      try { aipInstance.stop(); } catch {}
    }
    aipInstance = null;

    // Clear panels
    panelWithoutContent.innerHTML = '';
    panelWithContent.innerHTML = '';
    terminal.clear();

    // Left panel: draw pure HTML (no aip.js)
    if (sc.without.html) {
      if (typeof sc.without.html === 'function') {
        panelWithoutContent.innerHTML = sc.without.html();
      } else {
        panelWithoutContent.innerHTML = sc.without.html;
      }
    }

    // Right panel: draw HTML, then initialize aip.js
    const config = currentMode === 'manual-config' && sc.with.manualConfig
      ? sc.with.manualConfig
      : sc.with.aipConfig;

    if (sc.with.html) {
      if (typeof sc.with.html === 'function') {
        panelWithContent.innerHTML = sc.with.html();
      } else {
        panelWithContent.innerHTML = sc.with.html;
      }
    }

    // Initialize aip.js in right panel
    if (config && typeof config === 'function') {
      aipInstance = config(panelWithContent);
    }

    // Populate terminal
    if (sc.terminal) {
      sc.terminal(terminal, currentMode);
    }

    // Setup security panel
    if (sc.securityPanel) {
      sc.securityPanel(securityContainer, panelWithContent, terminal);
    } else {
      securityContainer.innerHTML = '';
    }

    // Call setup hook if provided
    if (sc.setup) {
      sc.setup({ panelWithoutContent, panelWithContent, securityContainer, terminal, mode: currentMode });
    }

    // Trigger any custom event for scenario change
    root.dispatchEvent(new CustomEvent('demo:scenario-changed', {
      detail: { scenario: currentScenario, mode: currentMode },
    }));
  }

  // ── Init ───────────────────────────────────────────────────────────────

  renderScenarioTabs();
  terminalContainer.appendChild(terminal.container); // Move terminal into shell
  loadScenario();

  // ── Public API ─────────────────────────────────────────────────────────

  return {
    switchScenario,
    switchMode,
    getCurrentScenario: () => currentScenario,
    getCurrentMode: () => currentMode,
    getAipInstance: () => aipInstance,
    root,
  };
}

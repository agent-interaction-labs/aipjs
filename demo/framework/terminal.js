/* ═══════════════════════════════════════════════════════════════════════════
   Agent Terminal Component
   Renders what an AI agent "sees" in Simple (non-tech) and Raw (verbose) modes
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Create an Agent Terminal in a container element.
 *
 * @param {HTMLElement} container - The container to render into
 * @returns {{ addMessage, setMode, getMode, clear }}
 */
export function createAgentTerminal(container) {
  let mode = 'simple'; // 'simple' | 'raw'
  const simpleMessages = [];
  const rawMessages = [];

  // ── Build DOM ──────────────────────────────────────────────────────────

  container.innerHTML = `
    <div class="agent-terminal">
      <div class="terminal-header">
        <div class="terminal-title">
          <span class="icon">🤖</span>
          <span>Agent Terminal</span>
        </div>
        <div class="terminal-actions" id="terminal-actions"></div>
      </div>
      <div class="terminal-body" id="terminal-body">
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <div>Agent is analyzing the page…</div>
        </div>
      </div>
    </div>
  `;

  const body = container.querySelector('#terminal-body');
  const actionsBar = container.querySelector('#terminal-actions');

  // ── Add Simple/Raw toggle ──────────────────────────────────────────────

  const modeGroup = document.createElement('div');
  modeGroup.className = 'tab-group';
  modeGroup.innerHTML = `
    <button class="tab-btn active" data-mode="simple">Simple</button>
    <button class="tab-btn" data-mode="raw">Raw</button>
  `;
  actionsBar.appendChild(modeGroup);

  modeGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    const newMode = btn.dataset.mode;
    if (newMode) setMode(newMode);
  });

  // ── Render function ────────────────────────────────────────────────────

  function render() {
    const messages = mode === 'simple' ? simpleMessages : rawMessages;

    if (messages.length === 0) {
      body.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <div>Agent is analyzing the page…</div>
        </div>
      `;
      return;
    }

    body.innerHTML = messages.map((msg) => {
      if (mode === 'simple') {
        return renderSimpleMessage(msg);
      } else {
        return renderRawMessage(msg);
      }
    }).join('');

    body.scrollTop = body.scrollHeight;
  }

  // ── Simple message renderer ────────────────────────────────────────────

  function renderSimpleMessage(msg) {
    const side = msg.side === 'without' ? 'without' : 'with';
    const icon = msg.icon || (side === 'without' ? '😕' : '✅');
    const text = msg.html || escapeHtml(msg.text || '');

    return `
      <div class="terminal-message ${side}">
        <span class="msg-icon">${icon}</span>
        <div class="msg-text">${text}</div>
      </div>
    `;
  }

  // ── Raw message renderer ───────────────────────────────────────────────

  function renderRawMessage(msg) {
    const side = msg.side === 'without' ? 'without' : 'with';
    let content = '';

    if (msg.type === 'json') {
      content = `<pre class="code-block json"><code>${escapeHtml(msg.content)}</code></pre>`;
    } else if (msg.type === 'html') {
      content = `<pre class="code-block html"><code>${escapeHtml(msg.content)}</code></pre>`;
    } else if (msg.type === 'js') {
      content = `<pre class="code-block js"><code>${escapeHtml(msg.content)}</code></pre>`;
    } else if (msg.type === 'schema') {
      // Render tool schema as pretty cards in raw mode
      content = `<pre class="code-block json"><code>${escapeHtml(msg.content)}</code></pre>`;
    } else {
      content = `<pre class="code-block"><code>${escapeHtml(msg.content)}</code></pre>`;
    }

    return `
      <div class="terminal-message ${side}">
        <div style="flex:1; min-width:0">
          <div class="msg-header">${escapeHtml(msg.title || '')}</div>
          ${content}
        </div>
      </div>
    `;
  }

  // ── Public API ─────────────────────────────────────────────────────────

  /**
   * Add a message to the terminal.
   *
   * @param {'without'|'with'} side - Which column the message is for
   * @param {'simple'|'raw'} msgMode - Which mode this message appears in
   * @param {object} data - Message data
   * @param {string} [data.icon] - Emoji icon (simple mode)
   * @param {string} [data.text] - Text content (simple mode)
   * @param {string} [data.html] - HTML content (simple mode, overrides text)
   * @param {string} [data.title] - Header label (raw mode)
   * @param {string} [data.content] - Code/JSON content (raw mode)
   * @param {'json'|'html'|'js'|'schema'} [data.type] - Content type (raw mode)
   */
  function addMessage(side, msgMode, data) {
    const msg = { side, mode: msgMode, ...data };

    // Simple messages always go to simple array
    if (msgMode === 'simple') {
      simpleMessages.push(msg);
    }

    // Raw messages go to raw array
    if (msgMode === 'raw') {
      rawMessages.push(msg);
    }

    // If data includes both simple and raw info, add to both
    if (msgMode === 'both' || (data.simple && data.raw)) {
      if (data.simple) simpleMessages.push({ side, mode: 'simple', ...data.simple });
      if (data.raw) rawMessages.push({ side, mode: 'raw', ...data.raw });
      // Don't double-add the wrapper
      if (msgMode === 'both') {
        const idx = simpleMessages.indexOf(msg);
        if (idx !== -1) simpleMessages.splice(idx, 1);
        const ridx = rawMessages.indexOf(msg);
        if (ridx !== -1) rawMessages.splice(ridx, 1);
      }
    }

    render();
  }

  function setMode(newMode) {
    if (newMode === mode) return;
    mode = newMode;

    // Update button states
    modeGroup.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    render();
  }

  function getMode() {
    return mode;
  }

  function clear() {
    simpleMessages.length = 0;
    rawMessages.length = 0;
    render();
  }

  return {
    addMessage,
    setMode,
    getMode,
    clear,
    container,
  };
}

// ── Utility ──────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

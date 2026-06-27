/* ═══════════════════════════════════════════════════════════════════════════
   Agent Terminal Component
   Split-panel: left = without aixa.js, right = with aixa.js
   Clear per-column headers so users never confuse which side they're reading
   ═══════════════════════════════════════════════════════════════════════════ */

export function createAgentTerminal(container) {
  let mode = 'simple';
  const withoutMessages = [];
  const withMessages = [];

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
      <div class="terminal-columns" id="terminal-columns">
        <div class="terminal-col col-without">
          <div class="col-header without">
            <span>Without aixa.js</span>
            <span class="col-subtitle">Agent scrapes raw DOM</span>
          </div>
          <div class="col-body" id="col-without-body">
            <div class="empty-state">
              <div class="empty-icon">🔍</div>
              <div>Analyzing page structure…</div>
            </div>
          </div>
        </div>
        <div class="terminal-col col-with">
          <div class="col-header with">
            <span>With aixa.js</span>
            <span class="col-subtitle">Agent reads structured tools</span>
          </div>
          <div class="col-body" id="col-with-body">
            <div class="empty-state">
              <div class="empty-icon">📋</div>
              <div>Discovering tool schemas…</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const colWithoutBody = container.querySelector('#col-without-body');
  const colWithBody = container.querySelector('#col-with-body');
  const actionsBar = container.querySelector('#terminal-actions');

  // ── Simple/Raw toggle ──────────────────────────────────────────────────

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

  // ── Render ─────────────────────────────────────────────────────────────

  function render() {
    const wmsgs = mode === 'simple'
      ? withoutMessages.filter(m => m.mode === 'simple')
      : withoutMessages.filter(m => m.mode === 'raw');
    const ymsgs = mode === 'simple'
      ? withMessages.filter(m => m.mode === 'simple')
      : withMessages.filter(m => m.mode === 'raw');

    colWithoutBody.innerHTML = wmsgs.length === 0
      ? `<div class="empty-state"><div class="empty-icon">🔍</div><div>Analyzing page structure…</div></div>`
      : wmsgs.map(m => renderMessage(m)).join('');

    colWithBody.innerHTML = ymsgs.length === 0
      ? `<div class="empty-state"><div class="empty-icon">📋</div><div>Discovering tool schemas…</div></div>`
      : ymsgs.map(m => renderMessage(m)).join('');

    colWithoutBody.scrollTop = colWithoutBody.scrollHeight;
    colWithBody.scrollTop = colWithBody.scrollHeight;
  }

  function renderMessage(msg) {
    if (mode === 'simple') {
      const icon = msg.icon || '';
      const text = msg.html || escapeHtml(msg.text || '');
      return `<div class="terminal-msg">${icon ? `<span class="msg-icon">${icon}</span>` : ''}<div class="msg-text">${text}</div></div>`;
    }
    // Raw mode
    let content = '';
    if (msg.type === 'json') {
      content = `<pre class="code-block json"><code>${escapeHtml(msg.content)}</code></pre>`;
    } else if (msg.type === 'html') {
      content = `<pre class="code-block html"><code>${escapeHtml(msg.content)}</code></pre>`;
    } else if (msg.type === 'js') {
      content = `<pre class="code-block js"><code>${escapeHtml(msg.content)}</code></pre>`;
    } else if (msg.type === 'schema') {
      content = `<pre class="code-block json"><code>${escapeHtml(msg.content)}</code></pre>`;
    } else {
      content = `<pre class="code-block"><code>${escapeHtml(msg.content)}</code></pre>`;
    }
    return `<div class="terminal-msg">
      <div style="flex:1;min-width:0">
        <div class="msg-header">${escapeHtml(msg.title || '')}</div>
        ${content}
      </div>
    </div>`;
  }

  // ── Public API ─────────────────────────────────────────────────────────

  function addMessage(side, msgMode, data) {
    const msg = { side, mode: msgMode, ...data };
    if (side === 'without') {
      withoutMessages.push(msg);
    } else {
      withMessages.push(msg);
    }
    render();
  }

  function setMode(newMode) {
    if (newMode === mode) return;
    mode = newMode;
    modeGroup.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    render();
  }

  function getMode() { return mode; }

  function clear() {
    withoutMessages.length = 0;
    withMessages.length = 0;
    render();
  }

  return { addMessage, setMode, getMode, clear, container };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

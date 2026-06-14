// docs/assets/nav.js — injects shared sidebar navigation into all docs pages
(function() {
  const nav = document.getElementById('docs-nav');
  if (!nav) return;

  const path = window.location.pathname;

  function isActive(href) {
    return path === href || path.endsWith(href);
  }

  nav.innerHTML = `
    <div class="sidebar-logo"><a href="../">aip<span class="accent">.</span>js</a></div>

    <div class="nav-section">
      <div class="nav-section-title">Getting Started</div>
      <a href="./" class="nav-link${isActive('/docs/') ? ' active' : ''}">Introduction</a>
      <a href="getting-started.html" class="nav-link${isActive('getting-started') ? ' active' : ''}">Installation</a>
    </div>

    <div class="nav-section">
      <div class="nav-section-title">Core Concepts</div>
      <a href="auto-inference.html" class="nav-link${isActive('auto-inference') ? ' active' : ''}">Auto-Inference</a>
      <a href="manual-config.html" class="nav-link${isActive('manual-config') ? ' active' : ''}">Manual Config</a>
      <a href="hitl-security.html" class="nav-link${isActive('hitl-security') ? ' active' : ''}">HITL Security</a>
      <a href="ui-mirroring.html" class="nav-link${isActive('ui-mirroring') ? ' active' : ''}">UI Mirroring</a>
    </div>

    <div class="nav-section">
      <div class="nav-section-title">Plugins</div>
      <a href="ecommerce-plugin.html" class="nav-link${isActive('ecommerce-plugin') ? ' active' : ''}">E-Commerce</a>
      <a href="custom-plugins.html" class="nav-link${isActive('custom-plugins') ? ' active' : ''}">Custom Plugins</a>
    </div>

    <div class="nav-section">
      <div class="nav-section-title">Reference</div>
      <a href="configuration.html" class="nav-link${isActive('configuration') ? ' active' : ''}">Configuration</a>
      <a href="webmcp.html" class="nav-link${isActive('webmcp') ? ' active' : ''}">WebMCP Compat</a>
      <a href="api-reference.html" class="nav-link${isActive('api-reference') ? ' active' : ''}">API Reference</a>
    </div>

    <div class="nav-section" style="margin-top:auto">
      <a href="../demo/" class="nav-link demo-link">→ Live Demo</a>
      <a href="https://github.com/agent-interaction-labs/aipjs" class="nav-link demo-link">→ GitHub</a>
    </div>
  `;
})();

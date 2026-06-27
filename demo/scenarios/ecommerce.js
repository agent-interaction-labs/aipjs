/* ═══════════════════════════════════════════════════════════════════════════
   E-Commerce Scenario — NovaStore
   Demonstrates auto-inference, HIGH RISK mutation classification, and HITL
   ═══════════════════════════════════════════════════════════════════════════ */

import { AIXA, registerSearch, registerAction, createHITLManager } from '../vendor/bundle-entry.mjs';

// Shared reference so securityPanel can access the aixa instance
let __aixaInstance = null;
let __hitlCleanup = null;

// ── HTML Fragment ─────────────────────────────────────────────────────────
// Both panels share the same HTML; aixa.js auto-infers tools from it.
function panelHTML() {
  // The HTML fragment is loaded from ecommerce.html by the demo page.
  // Return a placeholder — the harness will inject the fragment from the file.
  return document.getElementById('ecommerce-template')?.innerHTML || '';
}

// ── aixa.js Config: Auto-Inference ─────────────────────────────────────────
function aixaConfig(panelContent) {
  const aixa = new AIXA({
    inference: { enabled: true },
    security: { hitl: { enabled: true } },
    ui: { mirroring: true },
    debug: false,
    cssPrefix: 'aixa',
  });
  aixa.start();
  __aixaInstance = aixa;
  return aixa;
}

// ── Manual Config Mode ────────────────────────────────────────────────────
function manualConfig(panelContent) {
  // Show the manual config code block, then init aixa.js with it
  const codeBlock = panelContent.querySelector('.manual-config-code');
  if (!codeBlock) return null;

  // We still initialize aixa.js for the demo
  const aixa = new AIXA({
    inference: { enabled: false },
    security: { hitl: { enabled: true } },
    ui: { mirroring: true },
    debug: false,
    cssPrefix: 'aixa',
  });

  // Register search tool explicitly
  registerSearch({
    name: 'search_products',
    description: 'Search the product catalog by keyword',
    parameters: [
      { name: 'q', type: 'string', description: 'Search query' },
    ],
    handler: async (params) => {
      console.log('[Manual] search_products called with', params);
      return { results: [], total: 0 };
    },
  });

  // Register filter tools
  registerAction({
    name: 'filter_by_category',
    description: 'Filter products by category',
    category: 'filter',
    parameters: [
      { name: 'category', type: 'string', enum: ['', 'electronics', 'clothing', 'home-garden', 'sports'] },
    ],
    handler: async (params) => {
      console.log('[Manual] filter_by_category called with', params);
      return { applied: true };
    },
  });

  registerAction({
    name: 'filter_by_price',
    description: 'Filter products by maximum price',
    category: 'filter',
    parameters: [
      { name: 'maxPrice', type: 'number', minimum: 0, maximum: 1000 },
    ],
    handler: async (params) => {
      console.log('[Manual] filter_by_price called with', params);
      return { applied: true };
    },
  });

  registerAction({
    name: 'filter_by_stock',
    description: 'Show only products that are in stock',
    category: 'filter',
    parameters: [
      { name: 'inStock', type: 'boolean' },
    ],
    handler: async (params) => {
      console.log('[Manual] filter_by_stock called with', params);
      return { applied: true };
    },
  });

  registerAction({
    name: 'sort_products',
    description: 'Sort the product list',
    category: 'sort',
    parameters: [
      { name: 'sort', type: 'string', enum: ['relevance', 'price-asc', 'price-desc', 'newest', 'rating'] },
    ],
    handler: async (params) => {
      console.log('[Manual] sort_products called with', params);
      return { applied: true };
    },
  });

  // CRITICAL: add_to_cart with requiresConfirmation:true
  registerAction({
    name: 'add_to_cart',
    description: 'Add a product to the shopping cart',
    category: 'mutate',
    riskLevel: 'high_risk',
    requiresConfirmation: true,
    parameters: [
      { name: 'productId', type: 'string', description: 'Product identifier' },
      { name: 'quantity', type: 'number', description: 'Quantity to add', minimum: 1 },
    ],
    handler: async (params) => {
      console.log('[Manual] add_to_cart called with', params);
      return { success: true, cartCount: 1 };
    },
  });

  // checkout — also HIGH RISK
  registerAction({
    name: 'checkout',
    description: 'Proceed to checkout with items in cart',
    category: 'mutate',
    riskLevel: 'high_risk',
    requiresConfirmation: true,
    parameters: [],
    handler: async (params) => {
      console.log('[Manual] checkout called');
      return { redirect: '/cart/checkout' };
    },
  });

  aixa.start();
  __aixaInstance = aixa;
  return aixa;
}

// ── Terminal Messages ─────────────────────────────────────────────────────
function populateTerminal(terminal, currentMode) {
  // ── SIMPLE MODE ──────────────────────────────────────────────────────
  // LEFT COLUMN (without aixa.js) — agent sees raw DOM, no structure

  terminal.addMessage('without', 'simple', {
    icon: '',
    html: '<strong>Page analysis:</strong> Detected 1 <code>&lt;input type="search"&gt;</code>, 4 <code>&lt;select&gt;</code> elements, 1 <code>&lt;input type="range"&gt;</code>, 1 <code>&lt;input type="checkbox"&gt;</code>, 6 <code>&lt;button type="submit"&gt;</code> elements. <strong>No structured tool schema available.</strong> All semantics must be inferred from DOM attributes alone.',
  });

  terminal.addMessage('without', 'simple', {
    icon: '',
    html: '<strong>Risk classification:</strong> Found <code>&lt;form action="/cart/add"&gt;</code> with submit buttons. <strong>Cannot determine whether this action is safe or destructive.</strong> No risk metadata present in the HTML.',
  });

  terminal.addMessage('without', 'simple', {
    icon: '',
    html: '<strong>Parameter ambiguity:</strong> The price range input provides no min/max metadata. The category select lists options but <strong>does not indicate whether multiple selections are supported.</strong> Each interaction requires trial and error.',
  });

  // RIGHT COLUMN (with aixa.js) — agent receives structured tool schemas

  terminal.addMessage('with', 'simple', {
    icon: '',
    html: '<strong>Capability discovery complete.</strong> Site exposes 8 structured tools: <span class="badge-inline badge-safe">search_products</span> <span class="badge-inline badge-safe">filter_by_category</span> <span class="badge-inline badge-safe">filter_by_price</span> <span class="badge-inline badge-safe">filter_by_stock</span> <span class="badge-inline badge-safe">sort_products</span> <span class="badge-inline badge-safe">navigate_to</span> <span class="badge-inline badge-risk">add_to_cart</span> <span class="badge-inline badge-risk">checkout</span>. Each tool includes typed parameters and descriptions.',
  });

  terminal.addMessage('with', 'simple', {
    icon: '',
    html: '<strong>Security classification:</strong> <span class="badge-inline badge-risk">add_to_cart</span> and <span class="badge-inline badge-risk">checkout</span> are classified as <strong>HIGH_RISK (riskLevel: "high_risk")</strong>. These operations <strong>require human-in-the-loop approval</strong> before execution. The site enforces this — the agent cannot bypass it.',
  });

  terminal.addMessage('with', 'simple', {
    icon: '',
    html: '<strong>Parameter validation:</strong> <code>filter_by_price</code> accepts <code>{ maxPrice: number }</code> with range 0–1000. <code>filter_by_stock</code> accepts <code>{ inStock: boolean }</code>. <strong>All parameter types and constraints are declared in the schema</strong> — no guessing required.',
  });

  terminal.addMessage('with', 'simple', {
    icon: '',
    html: '<strong>HITL enforcement:</strong> Invoking <code>add_to_cart</code> or <code>checkout</code> triggers a <strong>mandatory approval modal</strong>. The page freezes until a human explicitly approves or denies. <strong>This is enforced at the protocol level, not suggested.</strong>',
  });

  // ── RAW MODE ─────────────────────────────────────────────────────────

  // LEFT SIDE — actual HTML snippets the agent scrapes
  terminal.addMessage('without', 'raw', {
    title: 'Raw DOM — Search Input',
    content: '<input\n  type="search"\n  name="q"\n  placeholder="Search products..."\n  aria-label="Search products"\n>',
    type: 'html',
  });

  terminal.addMessage('without', 'raw', {
    title: 'Raw DOM — Category Select',
    content: '<select name="category" aria-label="Filter by category">\n  <option value="">All</option>\n  <option value="electronics">Electronics</option>\n  <option value="clothing">Clothing</option>\n  <option value="home-garden">Home & Garden</option>\n  <option value="sports">Sports</option>\n</select>',
    type: 'html',
  });

  terminal.addMessage('without', 'raw', {
    title: 'Raw DOM — Add to Cart (Unsafe)',
    content: '<form action="/cart/add" method="post">\n  <input name="productId" value="WH-001">\n  <input name="quantity" value="1">\n  <button>Add to Cart</button>\n</form>\n\n⚠ No risk classification\n⚠ No parameter validation\n⚠ No confirmation required\n⚠ Agent can invoke freely',
    type: 'html',
  });

  // RIGHT SIDE — JSON tool schemas
  terminal.addMessage('with', 'raw', {
    title: 'Tool Schema — search_products (SAFE)',
    content: JSON.stringify({
      name: 'search_products',
      description: 'Search the product catalog by keyword',
      riskLevel: 'safe',
      parameters: [
        { name: 'q', type: 'string', description: 'Search query' },
      ],
    }, null, 2),
    type: 'json',
  });

  terminal.addMessage('with', 'raw', {
    title: 'Tool Schema — filter_by_price (SAFE)',
    content: JSON.stringify({
      name: 'filter_by_price',
      description: 'Filter products by maximum price',
      riskLevel: 'safe',
      parameters: [
        { name: 'maxPrice', type: 'number', minimum: 0, maximum: 1000 },
      ],
    }, null, 2),
    type: 'json',
  });

  terminal.addMessage('with', 'raw', {
    title: 'Tool Schema — add_to_cart ⚠️ HIGH RISK',
    content: JSON.stringify({
      name: 'add_to_cart',
      description: 'Add a product to the shopping cart',
      riskLevel: 'high_risk',
      requiresConfirmation: true,
      parameters: [
        { name: 'productId', type: 'string', description: 'Product identifier' },
        { name: 'quantity', type: 'number', description: 'Quantity to add' },
      ],
    }, null, 2),
    type: 'json',
  });

  terminal.addMessage('with', 'raw', {
    title: 'Tool Schema — checkout ⚠️ HIGH RISK',
    content: JSON.stringify({
      name: 'checkout',
      description: 'Proceed to checkout with items in cart',
      riskLevel: 'high_risk',
      requiresConfirmation: true,
      parameters: [],
    }, null, 2),
    type: 'json',
  });
}

// ── Security Panel (HITL Demo) ────────────────────────────────────────────
function securityPanel(container, panelWithContent, terminal) {
  // Build the security demo bar
  container.innerHTML = `
    <div class="security-panel">
      <div class="security-info">
        <div class="security-title">
          <span>🛡️</span>
          <span>HITL Security Demo</span>
        </div>
        <div class="security-desc">
          See what happens when an agent tries to invoke <code>add_to_cart</code> — the page freezes until a human explicitly approves or denies the action.
        </div>
      </div>
      <button class="btn btn-danger" id="simulate-hitl-btn">
        ⚡ Simulate Agent: Add to Cart
      </button>
    </div>
  `;

  // ── Initialize HITL Manager (shows modal on aixa:hitl:request) ──────────
  const hitlManager = createHITLManager({
    cssPrefix: 'aixa',
    hitlTimeout: 30000,
  });
  hitlManager.listen();

  // ── Live terminal messages during simulation ───────────────────────────

  function terminalMsg(side, text) {
    if (terminal && terminal.addMessage) {
      terminal.addMessage(side, 'simple', { icon: '', html: text });
    }
  }

  // Listen for tool invocation
  const onToolInvoke = (e) => {
    const detail = e.detail;
    terminalMsg('with', `<strong>Agent invoked:</strong> <code>${detail.method}</code> with params <code>${JSON.stringify(detail.params)}</code>`);
  };
  window.addEventListener('aixa:tool:invoke', onToolInvoke);

  // Listen for HITL request (modal is about to appear)
  const onHitlRequest = (e) => {
    const req = e.detail;
    terminalMsg('with', `<div class="msg-text" style="background:#fef3c7;padding:8px;border-radius:4px;border-left:3px solid #f59e0b;">🛡️ <strong>HITL:</strong> Agent wants to run <code>${req.toolName}</code> — approval modal shown. <em>Awaiting human decision...</em></div>`);
  };
  window.addEventListener('aixa:hitl:request', onHitlRequest);

  // Listen for HITL response (user approved or denied)
  const onHitlResponse = (e) => {
    const resp = e.detail;
    if (resp.action === 'approve') {
      terminalMsg('with', `<div class="msg-text" style="background:#dcfce7;padding:8px;border-radius:4px;border-left:3px solid #16a34a;">✅ <strong>Human approved:</strong> Action allowed to proceed.</div>`);
    } else if (resp.action === 'deny') {
      terminalMsg('with', `<div class="msg-text" style="background:#fee2e2;padding:8px;border-radius:4px;border-left:3px solid #dc2626;">❌ <strong>Human denied:</strong> ${resp.reason || 'Action rejected'}.</div>`);
    } else if (resp.action === 'timeout') {
      terminalMsg('with', `<div class="msg-text" style="background:#fef3c7;padding:8px;border-radius:4px;border-left:3px solid #f59e0b;">⏱️ <strong>HITL timed out:</strong> No human response within 30s. Auto-denied.</div>`);
    }
  };
  window.addEventListener('aixa:hitl:response', onHitlResponse);

  // Listen for tool result
  const onToolResult = (e) => {
    const resp = e.detail;
    if (resp.error) {
      terminalMsg('with', `<div class="msg-text" style="background:#fee2e2;padding:8px;border-radius:4px;border-left:3px solid #dc2626;">⚠️ <strong>Tool error:</strong> ${resp.error.message || JSON.stringify(resp.error)}</div>`);
    } else {
      terminalMsg('with', `<strong>Tool result:</strong> <code>${JSON.stringify(resp.result)}</code>`);
    }
  };
  window.addEventListener('aixa:tool:result', onToolResult);

  // Clean up old listeners from previous securityPanel call
  if (__hitlCleanup) __hitlCleanup();
  __hitlCleanup = () => {
    window.removeEventListener('aixa:tool:invoke', onToolInvoke);
    window.removeEventListener('aixa:hitl:request', onHitlRequest);
    window.removeEventListener('aixa:hitl:response', onHitlResponse);
    window.removeEventListener('aixa:tool:result', onToolResult);
    if (hitlManager?.destroy) hitlManager.destroy();
  };

  // Wire up the simulate button
  const btn = container.querySelector('#simulate-hitl-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // Find any add-to-cart tool from the AIXA instance
    let methodName = 'add_to_cart';
    let params = { productId: 'WH-001', quantity: 1 };

    if (__aixaInstance) {
      const tools = __aixaInstance.getTools ? __aixaInstance.getTools() : [];
      if (tools.length === 0 && __aixaInstance.getCapabilities) {
        const caps = __aixaInstance.getCapabilities();
        tools.push(...caps.tools);
      }
      const cartTool = tools.find(t => {
        if (!t.name) return false;
        const normalized = t.name.toLowerCase().replace(/[ _-]+/g, '');
        return normalized.includes('addtocart');
      });
      if (cartTool) {
        methodName = cartTool.name;
        // Match params to the tool's declared parameters
        if (cartTool.parameters?.length) {
          params = {};
          for (const p of cartTool.parameters) {
            params[p.name] = p.type === 'number' ? 1 : 'WH-001';
          }
        }
      }
    }

    window.dispatchEvent(new CustomEvent('aixa:tool:invoke', {
      detail: {
        jsonrpc: '2.0',
        id: 'demo-' + Date.now(),
        method: methodName,
        params,
      },
      bubbles: true,
    }));

    btn.textContent = '⏳ Waiting for human…';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    // Listen for the HITL request event to know the modal appeared
    const onHitlRequest = () => {
      window.removeEventListener('aixa:hitl:request', onHitlRequest);
      // Reset button after a short delay (the modal is now showing)
      setTimeout(() => {
        btn.textContent = '⚡ Simulate Agent: Add to Cart';
        btn.disabled = false;
        btn.style.opacity = '1';
      }, 500);
    };
    window.addEventListener('aixa:hitl:request', onHitlRequest);

    // Also listen for tool result in case HITL is not triggered
    const onToolResult = (e) => {
      window.removeEventListener('aixa:tool:result', onToolResult);
      window.removeEventListener('aixa:hitl:request', onHitlRequest);
      setTimeout(() => {
        btn.textContent = '⚡ Simulate Agent: Add to Cart';
        btn.disabled = false;
        btn.style.opacity = '1';
      }, 300);
    };
    window.addEventListener('aixa:tool:result', onToolResult);

    // Fallback reset after 30s (HITL timeout)
    setTimeout(() => {
      window.removeEventListener('aixa:hitl:request', onHitlRequest);
      window.removeEventListener('aixa:tool:result', onToolResult);
      btn.textContent = '⚡ Simulate Agent: Add to Cart';
      btn.disabled = false;
      btn.style.opacity = '1';
    }, 31000);
  });
}

// ── Exported Scenario Config ──────────────────────────────────────────────
export const ecommerceScenario = {
  label: 'E-Commerce',
  without: {
    html: panelHTML,
  },
  with: {
    html: panelHTML,
    aixaConfig,
    manualConfig,
  },
  terminal: populateTerminal,
  securityPanel,
};

/* ═══════════════════════════════════════════════════════════════════════════
   E-Commerce Scenario — NovaStore
   Demonstrates auto-inference, HIGH RISK mutation classification, and HITL
   ═══════════════════════════════════════════════════════════════════════════ */

import { AIP, registerSearch, registerAction } from '../../packages/core/dist/index.js';

// Shared reference so securityPanel can access the aip instance
let __aipInstance = null;

// ── HTML Fragment ─────────────────────────────────────────────────────────
// Both panels share the same HTML; aip.js auto-infers tools from it.
function panelHTML() {
  // The HTML fragment is loaded from ecommerce.html by the demo page.
  // Return a placeholder — the harness will inject the fragment from the file.
  return document.getElementById('ecommerce-template')?.innerHTML || '';
}

// ── aip.js Config: Auto-Inference ─────────────────────────────────────────
function aipConfig(panelContent) {
  const aip = new AIP({
    autoInfer: true,
    hitlEnabled: true,
    uiMirroring: true,
    debug: false,
    cssPrefix: 'aipjs',
  });
  aip.start();
  __aipInstance = aip;
  return aip;
}

// ── Manual Config Mode ────────────────────────────────────────────────────
function manualConfig(panelContent) {
  // Show the manual config code block, then init aip.js with it
  const codeBlock = panelContent.querySelector('.manual-config-code');
  if (!codeBlock) return null;

  // We still initialize aip.js for the demo
  const aip = new AIP({
    autoInfer: false,
    hitlEnabled: true,
    uiMirroring: true,
    debug: false,
    cssPrefix: 'aipjs',
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

  aip.start();
  __aipInstance = aip;
  return aip;
}

// ── Terminal Messages ─────────────────────────────────────────────────────
function populateTerminal(terminal, currentMode) {
  // ── SIMPLE MODE ──────────────────────────────────────────────────────

  // LEFT SIDE (without aip.js) — agent is confused and scared
  terminal.addMessage('without', 'simple', {
    icon: '😕',
    html: 'I see <code>&lt;input name="q"&gt;</code>, <code>&lt;select name="category"&gt;</code>, and various buttons… <strong>I\'ll have to guess which element does what</strong> by reading attributes and hope I\'m right.',
  });

  terminal.addMessage('without', 'simple', {
    icon: '😰',
    html: 'There\'s an "Add to Cart" button inside a <code>&lt;form action="/cart/add"&gt;</code>. I <strong>don\'t know if it\'s safe</strong> to use it. What if it triggers a purchase?',
  });

  terminal.addMessage('without', 'simple', {
    icon: '😱',
    html: 'If I accidentally click multiple Add to Cart buttons while exploring the page, <strong>I could add dozens of items</strong> without the user knowing!',
  });

  // RIGHT SIDE (with aip.js) — agent is confident and secure
  terminal.addMessage('with', 'simple', {
    icon: '✅',
    html: 'This site exposes <strong>8 tools</strong>: <span class="badge-inline badge-safe">search_products</span> <span class="badge-inline badge-safe">filter_by_category</span> <span class="badge-inline badge-safe">filter_by_price</span> <span class="badge-inline badge-safe">filter_by_stock</span> <span class="badge-inline badge-safe">sort_products</span> <span class="badge-inline badge-safe">navigate_to</span> <span class="badge-inline badge-risk">add_to_cart</span> <span class="badge-inline badge-risk">checkout</span>',
  });

  terminal.addMessage('with', 'simple', {
    icon: '🛡️',
    html: '<strong>add_to_cart</strong> and <strong>checkout</strong> are classified as <span class="badge-inline badge-risk">HIGH RISK</span>. The site owner <strong>requires human-in-the-loop approval</strong> for every cart operation. I CANNOT bypass this.',
  });

  terminal.addMessage('with', 'simple', {
    icon: '✅',
    html: '<strong>filter_by_price</strong> gives me a numeric range (0–1000). <strong>filter_by_stock</strong> accepts a boolean. I know <strong>exactly</strong> what data to send.',
  });

  terminal.addMessage('with', 'simple', {
    icon: '🛡️',
    html: 'Even if a malicious script tries to invoke <code>add_to_cart</code> without approval, the <strong>HITL modal freezes the page</strong> until a human explicitly clicks Approve or Deny.',
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
function securityPanel(container, panelWithContent) {
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

  // Wire up the simulate button
  const btn = container.querySelector('#simulate-hitl-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // Find the add_to_cart tool name from the aip instance
    let methodName = 'add_to_cart';

    if (__aipInstance && __aipInstance.getCapabilities) {
      const caps = __aipInstance.getCapabilities();
      const cartTool = caps.tools.find(t =>
        t.name && t.name.toLowerCase().includes('add_to_cart')
      );
      if (cartTool) {
        methodName = cartTool.name;
      }
    }

    // Dispatch the tool invocation event — this is what an agent would send
    window.dispatchEvent(new CustomEvent('aip:tool:invoke', {
      detail: {
        jsonrpc: '2.0',
        id: 'demo-' + Date.now(),
        method: methodName,
        params: { productId: 'WH-001', quantity: 1 },
      },
      bubbles: true,
    }));

    // Visual feedback on the button
    btn.textContent = '⏳ Waiting for human…';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    // Listen for the HITL request event to know the modal appeared
    const onHitlRequest = () => {
      window.removeEventListener('aip:hitl:request', onHitlRequest);
      // Reset button after a short delay (the modal is now showing)
      setTimeout(() => {
        btn.textContent = '⚡ Simulate Agent: Add to Cart';
        btn.disabled = false;
        btn.style.opacity = '1';
      }, 500);
    };
    window.addEventListener('aip:hitl:request', onHitlRequest);

    // Also listen for tool result in case HITL is not triggered
    const onToolResult = (e) => {
      window.removeEventListener('aip:tool:result', onToolResult);
      window.removeEventListener('aip:hitl:request', onHitlRequest);
      setTimeout(() => {
        btn.textContent = '⚡ Simulate Agent: Add to Cart';
        btn.disabled = false;
        btn.style.opacity = '1';
      }, 300);
    };
    window.addEventListener('aip:tool:result', onToolResult);

    // Fallback reset after 30s (HITL timeout)
    setTimeout(() => {
      window.removeEventListener('aip:hitl:request', onHitlRequest);
      window.removeEventListener('aip:tool:result', onToolResult);
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
    aipConfig,
    manualConfig,
  },
  terminal: populateTerminal,
  securityPanel,
};

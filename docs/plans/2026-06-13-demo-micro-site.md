# AIP.js Demo Micro-Site Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a self-contained micro-website that demonstrates the difference between websites with and without aip.js. Two scenarios (general website + e-commerce). Split-panel comparison view. Dual audience (non-technical "Simple" mode + technical "Raw" mode). Emphasis on website-owner controls, HITL security, and manual config API.

**Architecture:** All files live under `/workspace/agentic-js/demo/`. Shared framework components (harness, terminal, styles) are built first. Two independent scenario pages are built in parallel. A landing/entry page ties them together. No build step — vanilla HTML/CSS/JS, loads aip.js from local dist.

**Tech Stack:** Vanilla HTML5, CSS3 (custom properties design system), ES modules. Uses `../packages/*/dist/*.js` for aip.js imports.

---

## Task 0: Project Directory Setup

**Objective:** Create the demo directory structure and shared assets.

**Files:**
- Create: `demo/index.html` (entry/landing page)
- Create: `demo/framework/` directory
- Create: `demo/scenarios/` directory
- Create: `demo/assets/` directory

**Step 1: Create directories**

```bash
mkdir -p /workspace/agentic-js/demo/framework
mkdir -p /workspace/agentic-js/demo/scenarios
mkdir -p /workspace/agentic-js/demo/assets
```

**Step 2: Commit**

```bash
cd /workspace/agentic-js
git add demo/
git commit -m "chore: create demo directory structure"
```

---

## Task 1: Shared Design System (framework/styles.css)

**Objective:** Single CSS file with design tokens, layout primitives, and component styles used by all demo pages. Dark theme with crisp typography.

**Files:**
- Create: `demo/framework/styles.css`

**Design Tokens:**
```css
:root {
  /* Colors */
  --bg-primary: #0f1117;
  --bg-secondary: #1a1d27;
  --bg-tertiary: #242836;
  --border: #2e3348;
  --text-primary: #e4e7ed;
  --text-secondary: #8b8fa3;
  --text-muted: #5a5e72;
  --accent: #6366f1;
  --accent-hover: #818cf8;
  --green: #10b981;
  --green-bg: rgba(16, 185, 129, 0.12);
  --red: #ef4444;
  --red-bg: rgba(239, 68, 68, 0.12);
  --amber: #f59e0b;
  --amber-bg: rgba(245, 158, 11, 0.12);
  --blue: #3b82f6;
  --blue-bg: rgba(59, 130, 246, 0.12);

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Typography */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --radius: 8px;
  --radius-lg: 12px;
}
```

**Components to style:**
- `.demo-shell` — full viewport container with top nav + split panels below
- `.demo-nav` — top bar with logo, scenario tabs, mode toggle
- `.split-panel` — two equal-width columns (left = without aip.js, right = with aip.js)
- `.panel` — individual panel with header bar and content area
- `.panel-header` — colored bar (red for without, green for with), label, status dot
- `.agent-terminal` — bottom collapsible panel, chat-like message bubbles
- `.terminal-message` — single message with colored left border
- `.terminal-message.without` — red left border
- `.terminal-message.with` — green left border  
- `.security-panel` — HITL demo area with simulate button
- `.code-block` — syntax-highlighted code display (JS/JSON)
- `.badge` — small label (SAFE=green, HIGH_RISK=red)
- `.tool-card` — individual tool schema display card
- `.tab-btn` / `.tab-btn.active` — navigation tab buttons
- `.toggle-switch` — Simple/Raw toggle
- `.btn-primary` / `.btn-secondary` — button styles
- Responsive: below 900px, stack panels vertically

**Verification:** Open any demo page, verify dark theme loads correctly, tab buttons work.

---

## Task 2: Agent Terminal Component (framework/terminal.js)

**Objective:** Reusable JavaScript component that shows "what the AI agent sees" in both Simple mode (non-technical) and Raw mode (verbose JSON + DOM snippets).

**Files:**
- Create: `demo/framework/terminal.js`

**API:**
```js
// Initialize terminal in a container element
const terminal = createAgentTerminal(containerEl);

// Add messages — Simple mode (human-readable)
terminal.addMessage('without', 'simple', {
  icon: '😕',
  text: 'I found an &lt;input&gt; but I don\'t know what it does. Maybe it\'s a search bar?',
});

terminal.addMessage('with', 'simple', {
  icon: '✅',
  text: 'This site told me: search_products accepts q (text), category (pick one), and maxPrice (number).',
});

// Add messages — Raw mode (technical)
terminal.addMessage('without', 'raw', {
  title: 'Raw DOM',
  content: '<input type="search" id="search" name="q" placeholder="Search...">',
  type: 'html',
});

terminal.addMessage('with', 'raw', {
  title: 'Tool Schema (JSON-RPC)',
  content: JSON.stringify({ name: 'search_products', parameters: [...] }, null, 2),
  type: 'json',
});

// Set mode
terminal.setMode('simple' | 'raw');
```

**Internal structure:**
- Maintains two arrays: `simpleMessages` and `rawMessages`
- `render()` redraws based on current mode
- Simple mode renders chat bubbles with icons
- Raw mode renders code blocks with language syntax
- Messages are tagged `without` (red border) or `with` (green border)
- Auto-scrolls to bottom on new messages

**Simple mode message template:**
```html
<div class="terminal-message ${side}">
  <span class="msg-icon">${icon}</span>
  <p class="msg-text">${text}</p>
</div>
```

**Raw mode message template:**
```html
<div class="terminal-message ${side}">
  <div class="msg-header">${title}</div>
  <pre class="code-block ${type}"><code>${escapedContent}</code></pre>
</div>
```

**Verification:** Create a test page that adds both simple and raw messages, toggle modes, verify rendering.

---

## Task 3: Demo Harness (framework/harness.js)

**Objective:** Reusable harness that sets up the split-panel demo layout for any scenario. Handles scenario switching, mode toggling, and aip.js initialization.

**Files:**
- Create: `demo/framework/harness.js`

**API:**
```js
// Create a demo instance
const demo = createDemo({
  container: '#app',
  scenarios: {
    'general': {
      label: 'General Website',
      without: { html: generalHTML },
      with: { html: generalHTML, aipConfig: generalConfig },
    },
    'ecommerce': {
      label: 'E-Commerce',
      without: { html: ecommerceHTML },
      with: { html: ecommerceHTML, aipConfig: ecommerceConfig },
    },
  },
  terminal: terminalInstance,
  defaultScenario: 'general',
});
```

**What the harness does:**
1. Builds the DOM: nav bar → split panels → agent terminal
2. Injects scenario HTML into both panels
3. Left panel: pure HTML (no aip.js)
4. Right panel: initializes aip.js with the provided config
5. Attaches listeners: scenario tab clicks swap content; mode toggle flips terminal
6. Exposes `demo.switchScenario(name)`, `demo.setMode('simple'|'raw')`, `demo.getLeftPanel()`, `demo.getRightPanel()`

**Nav bar structure:**
```html
<nav class="demo-nav">
  <div class="nav-brand">aip.js ← Demo</div>
  <div class="nav-tabs" id="scenarioTabs">
    <button class="tab-btn active" data-scenario="general">General Website</button>
    <button class="tab-btn" data-scenario="ecommerce">E-Commerce</button>
  </div>
  <div class="nav-controls">
    <span>Agent View:</span>
    <button class="tab-btn active" data-mode="simple">Simple</button>
    <button class="tab-btn" data-mode="raw">Raw</button>
  </div>
</nav>
```

**Panel header structure:**
```html
<div class="panel-header without">
  <span class="status-dot"></span>
  <span>Without aip.js</span>
  <span class="panel-subtitle">Raw HTML scraping</span>
</div>
```

```html
<div class="panel-header with">
  <span class="status-dot"></span>
  <span>With aip.js</span>
  <span class="panel-subtitle">Structured tool schemas</span>
</div>
```

**Verification:** Create a minimal test harness with two dummy scenarios, verify tabs switch, terminal toggles.

---

## Task 4: General Website Scenario — Auto-Inference Mode

**Objective:** A blog/content website that demonstrates auto-inference. The "without" side is raw HTML. The "with" side uses aip.js auto-inference to generate structured tools from the same HTML.

**Files:**
- Create: `demo/scenarios/general.html` (the page HTML fragment)
- Create: `demo/scenarios/general.js` (aip.js config + terminal population)

**Website content:**
A fictional blog "TechCrunch Daily" with:
- Header with site title and nav links (Home, Articles, About, Contact)
- Search bar: `<input type="search" name="q" placeholder="Search articles..." aria-label="Search articles">`
- Category filter: `<select name="category" aria-label="Filter by category">` with options: All, AI/ML, Web Dev, DevOps, Design, Security
- Sort control: `<select name="sort" aria-label="Sort articles">` with options: Newest, Oldest, Popular
- Article list: 4 article cards (title, excerpt, date, read link)
- Newsletter signup form at bottom: email input + submit button — marked as HIGH RISK via `data-aip-confirm`
- Contact form: name, email, message + submit button — marked as HIGH RISK via `data-aip-confirm`

**aip.js config (auto-inference):**
```js
import { AIP } from '../../packages/core/dist/index.js';

const aip = new AIP({
  autoInfer: true,
  hitlEnabled: true,
  uiMirroring: true,
  debug: false,
  cssPrefix: 'aipjs',
});
aip.start();
```

**Terminal messages to populate (Simple mode):**

Left side (without):
- 😕 "I found a `<select>` named 'category' with 6 options. I'll guess it filters articles, but I'm not sure which values are valid."
- 😰 "There's a `<form>` with a submit button. Should I fill it? What happens if I submit?"
- 🤔 "I found an `<input type='search'>`. Maybe it searches articles? Not sure what parameters it expects."

Right side (with):
- ✅ "This site exposes 6 tools: search_articles, filter_by_category, sort_articles, navigate_to, newsletter_signup ⚠️, contact_form ⚠️"
- 🛡️ "newsletter_signup is HIGH RISK — the site owner requires human approval before I can use it."
- "contact_form is also HIGH RISK. I'll let the user know before touching it."
- "filter_by_category supports: All, AI/ML, Web Dev, DevOps, Design, Security"
- "sort_articles supports: Newest, Oldest, Popular"

**Manual config variant (same page, different tab):**
Show explicit `registerSearch()` call for the search endpoint, and `registerAction()` with `requiresConfirmation: true` for newsletter and contact forms. The code is displayed in a code block above the right panel.

---

## Task 5: E-Commerce Scenario — Auto-Inference + HITL Focus

**Objective:** An e-commerce product store that emphasizes HITL security for "Add to Cart" and "Checkout" mutations. Shows the security modal in action.

**Files:**
- Create: `demo/scenarios/ecommerce.html`
- Create: `demo/scenarios/ecommerce.js`

**Website content:**
Fictional store "NovaStore" with:
- Header with logo and cart icon
- Search: `<input type="search" name="q" placeholder="Search products..." aria-label="Search products">`
- Category filter: `<select name="category" aria-label="Filter by category">` (Electronics, Clothing, Home, Sports)
- Price range: `<input type="range" name="maxPrice" min="0" max="1000" value="1000">` with live price display
- Stock filter: `<input type="checkbox" name="inStock">` In Stock Only
- Sort: `<select name="sort" aria-label="Sort products">` (Relevance, Price Low-High, Price High-Low, Newest, Rating)
- 6 product cards, each with:
  - Product name, image placeholder, price, rating stars
  - "Add to Cart" button with `<form action="/cart/add">` (auto-classified as HIGH RISK by aip.js)
- Checkout button in header (also HIGH RISK)

**aip.js config (auto-inference):**
```js
import { AIP } from '../../packages/core/dist/index.js';

const aip = new AIP({
  autoInfer: true,
  hitlEnabled: true,
  uiMirroring: true,
  debug: false,
  cssPrefix: 'aipjs',
});
aip.start();
```

**HITL Security Demo:**
Below the split panels, add a **security panel**:
- Shows: "Try simulating an agent attempting 'add_to_cart'"
- Big button: "Simulate Agent: Add to Cart"
- When clicked, fires an `aip:tool:invoke` CustomEvent for the `add_to_cart` tool
- HITL modal appears over the right panel (page freezes, darkened overlay, modal with Approve/Deny)
- Shows the user that agents CANNOT bypass this

**Terminal messages (Simple mode):**

Left:
- 😕 "I see `<input name='q'>`, `<select name='category'>`, and some buttons... I'll have to guess which does what."
- 😰 "There's an Add to Cart button inside a `<form action='/cart/add'>`. I don't know if it's safe to use."
- 😱 "What if I accidentally order 100 items while exploring?"

Right:
- ✅ "8 tools discovered: search_products, filter_by_category, filter_by_price, filter_by_stock, sort_products, navigate_to, add_to_cart ⚠️, checkout ⚠️"
- 🛡️ "add_to_cart and checkout are HIGH RISK — the site requires human approval for every cart operation."
- "The HITL modal cannot be bypassed by the agent."

**Manual config variant:**
Show the ecommerce plugin explicitly:
```js
import { ecommercePlugin } from '../../packages/plugins/ecommerce/dist/index.js';
ecommercePlugin({
  searchEndpoint: '/api/products/search',
  detailEndpoint: '/api/products',
}).register();
```

Plus explicit HITL override:
```js
aip.registerAction({
  name: 'add_to_cart',
  description: 'Add product to shopping cart',
  parameters: [{ name: 'productId', type: 'string' }, { name: 'quantity', type: 'number' }],
  handler: async (params) => { /* your backend logic */ },
  requiresConfirmation: true,  // ← non-negotiable HITL
});
```

---

## Task 6: Landing Page

**Objective:** Entry page that introduces the demo with a hero section and links to both scenarios.

**Files:**
- Create: `demo/index.html` (overwrite placeholder from Task 0)

**Content:**
- Hero: "aip.js — Agentic Engine Optimization" with tagline
- Two large cards linking to each scenario
- Brief "What is aip.js?" section with the value props for website owners
- "Open Demo" buttons navigate to each scenario page (or show them inline)

Actually, let's keep it simpler: the landing page IS the demo. Scenario switching happens via tabs in the harness. We could have:
- `demo/index.html` — General Website demo (default)
- `demo/ecommerce.html` — E-Commerce demo
- Or: one `demo/index.html` with the harness handling both scenarios via tabs

Actually, since the harness already does scenario switching, the best approach:
- `demo/index.html` — the full demo with both scenarios via tab switching
- Each scenario is a self-contained JS module loaded on demand

---

## Task 7: Integration & Polish

**Objective:** Wire everything together, test all flows, add smooth transitions and polish.

**Files:**
- Create: `demo/index.html` (final version, or modify existing)
- Modify: Any framework files that need tweaks

**Integration steps:**
1. `demo/index.html` loads `framework/styles.css`, `framework/terminal.js`, `framework/harness.js`
2. Harness loads `scenarios/general.js` and `scenarios/ecommerce.js` as dynamic imports
3. Verify: page loads, both scenarios switch cleanly, terminal works in both modes
4. Verify: HITL modal fires when "Simulate Add to Cart" is clicked
5. Verify: Simple/Raw toggle works
6. Add transition animations (panel content fades on scenario switch)
7. Add responsive behavior (stack panels on mobile)
8. Verify all aip.js auto-inferred tools are correct

**Commit:** Final commit with working demo.

---

## Task Order & Dependencies

```
Task 0 (directories)
  └─ Task 1 (styles.css)
      └─ Task 2 (terminal.js) + Task 3 (harness.js) ← can run in parallel
          ├─ Task 4 (general scenario) ┐
          └─ Task 5 (ecommerce)        ┘ ← can run in parallel after 2+3
              └─ Task 6 (landing/integration)
                  └─ Task 7 (polish)
```

## Verification Checklist

- [ ] `demo/index.html` opens and shows the split-panel demo
- [ ] Scenario tabs (General Website, E-Commerce) switch content
- [ ] Left panel ("Without aip.js") shows raw HTML rendered normally
- [ ] Right panel ("With aip.js") shows the same HTML + blue agent indicator dot
- [ ] Agent Terminal shows chat bubbles in Simple mode
- [ ] Agent Terminal shows code blocks in Raw mode
- [ ] Simple/Raw toggle flips terminal content
- [ ] E-Commerce: "Simulate Add to Cart" button triggers HITL modal
- [ ] HITL modal: dark overlay, Approve/Deny buttons, cannot dismiss without action
- [ ] E-Commerce: HITL modal shows agent action details (tool name, params)
- [ ] Auto-inference mode shows tools with SAFE/HIGH_RISK badges
- [ ] Manual config mode shows code snippets for registerSearch/registerAction
- [ ] Responsive: below 900px, panels stack vertically
- [ ] No 404 errors, all imports resolve

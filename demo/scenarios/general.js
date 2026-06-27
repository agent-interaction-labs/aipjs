/* ═══════════════════════════════════════════════════════════════════════════
   General Website Scenario — TechCrunch Daily
   Demonstrates auto-inference on a blog: search, category filter, sort,
   plus HITL on newsletter and contact forms.
   ═══════════════════════════════════════════════════════════════════════════ */

import { AIP } from '../vendor/bundle-entry.mjs';

let __aipInstance = null;

// ── HTML Fragment ─────────────────────────────────────────────────────────

function panelHTML() {
  return document.getElementById('general-template')?.innerHTML || '';
}

// ── aip.js Config: Auto-Inference ─────────────────────────────────────────

function aipConfig(panelContent) {
  const aip = new AIP({
    inference: { enabled: true },
    security: { hitl: { enabled: true } },
    ui: { mirroring: true },
    debug: false,
    cssPrefix: 'aipjs',
  });
  aip.start();
  __aipInstance = aip;
  return aip;
}

// ── aip.js Config: Manual Config ──────────────────────────────────────────

function manualConfig(panelContent) {
  // Show the config code above the page content
  const codeBlock = document.createElement('div');
  codeBlock.style.cssText = 'background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius);padding:var(--space-md);margin-bottom:var(--space-md);overflow-x:auto;';
  codeBlock.innerHTML = `<pre class="code-block js"><code>import { AIP } from '@aipjs/core';

const aip = new AIP({
  inference: { enabled: true },     // Scan DOM for semantic elements
  security: { hitl: { enabled: true } },    // Require human approval for mutations
  ui: { mirroring: true },    // Show agent activity in the UI
});

// Explicitly register search for fine-grained control
aip.registerSearch({
  endpoint: '/api/articles/search',
  parameters: [
    { name: 'q', type: 'string', description: 'Search query' },
    { name: 'category', type: 'string', enum: [
      'ai-ml', 'web-dev', 'devops', 'ux-design', 'cybersecurity'
    ]},
    { name: 'sort', type: 'string', enum: [
      'newest', 'oldest', 'popular'
    ]},
  ],
});

// Force HITL on newsletter subscriptions
aip.registerAction({
  name: 'subscribe_newsletter',
  description: 'Subscribe to the newsletter',
  parameters: [{ name: 'email', type: 'string' }],
  handler: subscribeHandler,
  requiresConfirmation: true,  // ← Human must approve
});

// Force HITL on contact form
aip.registerAction({
  name: 'send_contact_message',
  description: 'Send a contact message',
  parameters: [
    { name: 'name', type: 'string' },
    { name: 'email', type: 'string' },
    { name: 'message', type: 'string' },
  ],
  handler: contactHandler,
  requiresConfirmation: true,  // ← Human must approve
});

aip.start();</code></pre>`;
  panelContent.insertBefore(codeBlock, panelContent.firstChild);

  // Then init AIP with auto-inference — the manual overrides take precedence
  return aipConfig(panelContent);
}

// ── Terminal Messages ─────────────────────────────────────────────────────

function populateTerminal(terminal, mode) {
  // ── SIMPLE MODE ──────────────────────────────────────────────────────
  // LEFT COLUMN (without aip.js) — agent sees raw DOM

  terminal.addMessage('without', 'simple', {
    icon: '',
    html: '<strong>Page analysis:</strong> Detected 1 <code>&lt;input type="search"&gt;</code>, 2 <code>&lt;select&gt;</code> elements, 2 <code>&lt;form&gt;</code> elements with submit buttons. <strong>No structured tool schema available.</strong> Element purpose must be inferred from DOM attributes and heuristics.',
  });
  terminal.addMessage('without', 'simple', {
    icon: '',
    html: '<strong>Form detection:</strong> Found <code>&lt;form action="/newsletter/subscribe"&gt;</code> and <code>&lt;form action="/contact/submit"&gt;</code>. <strong>Cannot determine whether these are safe to invoke.</strong> The HTML provides no risk classification or confirmation requirements.',
  });
  terminal.addMessage('without', 'simple', {
    icon: '',
    html: '<strong>Parameter inference:</strong> The search input has <code>name="q"</code> with no type metadata. The category select lists 5 options but <strong>does not specify which values are valid programmatic inputs</strong> vs display labels. Requires trial-and-error interaction.',
  });

  // RIGHT COLUMN (with aip.js) — agent receives structured tools

  terminal.addMessage('with', 'simple', {
    icon: '',
    html: '<strong>Capability discovery complete.</strong> Site exposes 6 structured tools: <span class="badge-inline badge-safe">search</span> <span class="badge-inline badge-safe">filter</span> <span class="badge-inline badge-safe">sort</span> <span class="badge-inline badge-safe">navigate</span> <span class="badge-inline badge-risk">newsletter</span> <span class="badge-inline badge-risk">contact</span>. Each tool declares typed parameters and descriptions.',
  });
  terminal.addMessage('with', 'simple', {
    icon: '',
    html: '<strong>Security classification:</strong> <span class="badge-inline badge-risk">newsletter_signup</span> and <span class="badge-inline badge-risk">contact_form</span> are classified as <strong>HIGH_RISK (riskLevel: "high_risk")</strong>. These mutations <strong>require explicit human approval</strong> before the agent can execute them.',
  });
  terminal.addMessage('with', 'simple', {
    icon: '',
    html: '<strong>Enum validation:</strong> <code>filter_by_category</code> declares valid values: <code>ai-ml, web-dev, devops, ux-design, cybersecurity</code>. <strong>Agent receives exact enum constraints</strong> — no ambiguity between display labels and programmatic values.',
  });
  terminal.addMessage('with', 'simple', {
    icon: '',
    html: '<strong>Sort parameters:</strong> <code>sort_articles</code> accepts <code>{ sort: "newest" | "oldest" | "popular" }</code>. <strong>All valid sort options are declared in the schema.</strong> The agent can apply sorting without inspecting DOM option elements.',
  });

  // --- Raw mode ---
  terminal.addMessage('without', 'raw', {
    title: 'Raw DOM — Search Input',
    content: '<input type="search" name="q"\n       placeholder="Search articles..."\n       aria-label="Search articles">',
    type: 'html',
  });
  terminal.addMessage('without', 'raw', {
    title: 'Raw DOM — Category Filter',
    content: '<select name="category" aria-label="Filter by category">\n  <option value="">All Categories</option>\n  <option value="ai-ml">AI & Machine Learning</option>\n  <option value="web-dev">Web Development</option>\n  <option value="devops">DevOps & Cloud</option>\n  ...\n</select>',
    type: 'html',
  });
  terminal.addMessage('without', 'raw', {
    title: 'Raw DOM — Unsafe Form',
    content: '<form data-aip-confirm="true"\n      action="/newsletter/subscribe"\n      aria-label="Newsletter signup">\n  <input type="email" name="email">\n  <button type="submit">Subscribe</button>\n</form>\n\n⚠ Agent must guess: is this safe to submit?',
    type: 'html',
  });

  terminal.addMessage('with', 'raw', {
    title: 'Tool Schema — search_articles (SAFE)',
    content: JSON.stringify({
      name: 'search_articles',
      description: 'Search articles',
      riskLevel: 'safe',
      category: 'search',
      parameters: [
        { name: 'q', type: 'string', description: 'Search articles', required: false },
      ],
      metadata: { inferred: true },
    }, null, 2),
    type: 'json',
  });
  terminal.addMessage('with', 'raw', {
    title: 'Tool Schema — filter_by_category (SAFE)',
    content: JSON.stringify({
      name: 'filter_by_category',
      description: 'Filter by category',
      riskLevel: 'safe',
      category: 'filter',
      parameters: [
        { name: 'category', type: 'string', required: false,
          enum: ['', 'ai-ml', 'web-dev', 'devops', 'ux-design', 'cybersecurity'] },
      ],
    }, null, 2),
    type: 'json',
  });
  terminal.addMessage('with', 'raw', {
    title: 'Tool Schema — newsletter_signup (⚠ HIGH RISK)',
    content: JSON.stringify({
      name: 'mutation_newsletter_signup',
      description: '[REQUIRES HUMAN APPROVAL] Newsletter signup',
      riskLevel: 'high_risk',
      category: 'mutate',
      parameters: [
        { name: 'email', type: 'string', description: 'Email address for newsletter', required: true },
      ],
    }, null, 2),
    type: 'json',
  });
}

// ── Exported scenario definition ──────────────────────────────────────────

export const generalScenario = {
  label: 'General Website',

  without: {
    html: panelHTML,
  },

  with: {
    html: panelHTML,
    aipConfig,
    manualConfig,
  },

  terminal: populateTerminal,
};

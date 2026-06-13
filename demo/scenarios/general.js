/* ═══════════════════════════════════════════════════════════════════════════
   General Website Scenario — TechCrunch Daily
   Demonstrates auto-inference on a blog: search, category filter, sort,
   plus HITL on newsletter and contact forms.
   ═══════════════════════════════════════════════════════════════════════════ */

import { AIP } from '../../packages/core/dist/index.js';

let __aipInstance = null;

// ── HTML Fragment ─────────────────────────────────────────────────────────

function panelHTML() {
  return document.getElementById('general-template')?.innerHTML || '';
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

// ── aip.js Config: Manual Config ──────────────────────────────────────────

function manualConfig(panelContent) {
  // Show the config code above the page content
  const codeBlock = document.createElement('div');
  codeBlock.style.cssText = 'background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius);padding:var(--space-md);margin-bottom:var(--space-md);overflow-x:auto;';
  codeBlock.innerHTML = `<pre class="code-block js"><code>import { AIP } from '@aipjs/core';

const aip = new AIP({
  autoInfer: true,     // Scan DOM for semantic elements
  hitlEnabled: true,    // Require human approval for mutations
  uiMirroring: true,    // Show agent activity in the UI
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
  // --- Simple mode ---
  terminal.addMessage('without', 'simple', {
    icon: '😕',
    html: 'I found a <code>&lt;select&gt;</code> named "category" with options. I\'ll <strong>guess</strong> it filters articles, but I\'m not sure which values are valid or what happens when I change it. I have to <strong>try and see</strong>.',
  });
  terminal.addMessage('without', 'simple', {
    icon: '😰',
    html: 'There\'s a <code>&lt;form&gt;</code> with a submit button labeled "Subscribe". Should I fill and submit it? <strong>What if it triggers an unwanted action?</strong> I have no way to know — the HTML doesn\'t tell me what\'s safe.',
  });
  terminal.addMessage('without', 'simple', {
    icon: '🤔',
    html: 'I found an <code>&lt;input type="search"&gt;</code>. It\'s <strong>probably</strong> a search field. But I don\'t know what parameters it expects, what the backend returns, or if there are filters I should use.',
  });

  terminal.addMessage('with', 'simple', {
    icon: '✅',
    html: 'This site broadcasts <strong>6 structured tools</strong> I can use: <span class="badge-inline badge-safe">search</span> <span class="badge-inline badge-safe">filter</span> <span class="badge-inline badge-safe">sort</span> <span class="badge-inline badge-safe">navigate</span> <span class="badge-inline badge-risk">newsletter</span> <span class="badge-inline badge-risk">contact</span>',
  });
  terminal.addMessage('with', 'simple', {
    icon: '🛡️',
    html: '<strong>newsletter_signup</strong> and <strong>contact_form</strong> are marked <span class="badge-inline badge-risk">HIGH RISK</span>. The site owner <strong>requires human approval</strong> before I can use them. I <strong>cannot</strong> silently submit forms.',
  });
  terminal.addMessage('with', 'simple', {
    icon: '✅',
    html: '<strong>filter_by_category</strong> supports exactly: AI &amp; ML, Web Dev, DevOps &amp; Cloud, UX Design, Cybersecurity. <strong>No guessing needed</strong> — the site told me the valid options.',
  });
  terminal.addMessage('with', 'simple', {
    icon: '✅',
    html: '<strong>sort_articles</strong> supports: Newest First, Oldest First, Most Popular. I can confidently sort results. <strong>Zero ambiguity</strong> about what each value does.',
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

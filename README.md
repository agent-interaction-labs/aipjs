# aixa.js — The Agent Interaction & eXecution Agreement (AIXA) SDK

**Agent Interaction & eXecution Agreement (AIXA)** — gives your website the ability to expose structured, discoverable capabilities to visiting AI agents. Secure your platform, control the agent UX, and stop bots from breaking on fragile DOM updates.

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Tests](https://img.shields.io/badge/tests-26%2F26-brightgreen)]()
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)]()
[![Bundle Size](https://img.shields.io/badge/bundle-36KB-green)]()

## What is aixa.js?

**aixa.js** is the JavaScript SDK for the Agent Interaction & eXecution Agreement (AIXA). Just as SEO optimized websites for search crawlers, AIXA optimizes websites for AI agents.

Instead of allowing agents to scrape your DOM and simulate brittle clicks, aixa.js lets you expose your website's features (search, filter, checkout) as clean, structured JSON-RPC tools. It features auto-inference of your existing forms, developer overrides for SPAs, and built-in Human-in-the-Loop (HITL) security for high-risk actions.

*Note: aixa.js is fully compatible with the emerging [WebMCP (Web Model Context Protocol)](https://webmachinelearning.github.io/webmcp) standard, ensuring your tool schemas remain valid as native browser adoption grows.*

## How It Works

```
┌──────────────────────────────────────────────────────┐
│                    Your Website                      │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │ Auto-Infer  │  │  Developer  │  │   Security   │  │
│  │   Engine    │  │    API      │  │   (HITL)     │  │
│  │             │  │             │  │              │  │
│  │ DOM scan →  │  │ register    │  │ Prompt       │  │
│  │ ToolSchema  │  │ Search()    │  │ Injection    │  │
│  │             │  │ register    │  │ Protection   │  │
│  │             │  │ Action()    │  │              │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘  │
│         │                │                │          │
│         └────────────────┼────────────────┘          │
│                          ▼                           │
│              AgentCapability Broadcast               │
│   { tools: [...], page: {...}, protocolVersion }     │
│                          │                           │
└──────────────────────────┼───────────────────────────┘
                           │ CustomEvent
                           ▼
              ┌─────────────────────────┐
              │    Browser AI Agent     │
              │  (Chrome Agent, MCP     │
              │   Client, Claude, etc.) │
              └─────────────────────────┘
```

### Three Core Capabilities

1. **Auto-Inference Engine** — Scans your DOM for semantic HTML elements (search inputs, filter dropdowns, action buttons), ARIA attributes, and `data-aixa-*` hints, then automatically generates clean JSON-RPC tool schemas. Zero configuration needed.

2. **Developer Override API** — For complex SPAs and custom endpoints, register tools explicitly:
   ```js
   import { AIXA } from '@aixa/core';

   const aixa = new AIXA({ autoInfer: true, hitlEnabled: true });
   aixa.registerSearch({
     endpoint: '/api/v2/search',
     parameters: [
       { name: 'q', type: 'string', description: 'Search query', required: true },
       { name: 'category', type: 'string', description: 'Category filter', required: false },
     ]
   });
   aixa.start();
   ```

3. **Security & HITL** — Every tool is classified SAFE (read-only: search, filter, navigate) or HIGH_RISK (mutation: add to cart, checkout, profile changes). High-risk actions trigger a native DOM modal requiring explicit human approval before the payload touches your backend. Includes prompt injection sanitization to prevent malicious page data from hijacking agent instructions.

## Package Structure

| Package | Description | Size |
|---------|-------------|------|
| `@aixa/types` | Shared types: JSON-RPC, ToolSchema, HITL, Config | <2 KB |
| `@aixa/core` | Auto-inference, registry, UI mirroring, AIXA class | <8 KB |
| `@aixa/security` | HITL modal, prompt injection sanitizer | <6 KB |
| `@aixa/plugin-ecommerce` | Safe search abstraction for e-commerce, real estate, travel | <5 KB |

## Quick Start

### Auto-Inference (Zero Config)

```html
<script type="module">
  import { AIXA } from 'https://cdn.aixa.dev/core/index.js';

  const aixa = new AIXA({ autoInfer: true });
  aixa.start();

  // Your page now broadcasts tool schemas to browser agents
  // Search inputs, filters, sort controls — all auto-discovered
  console.log(aixa.getCapabilities());
  // { tools: [...], page: { title: "My Store", url: "..." }, ... }
</script>
```

### E-Commerce Plugin

```js
import { ecommercePlugin } from '@aixa/plugin-ecommerce';

ecommercePlugin({
  searchEndpoint: '/api/v1/products/search',
  detailEndpoint: '/api/v1/products',
}).register();

// Browser agents can now:
// - search({ q: "blue shirt", category: "clothing", sortBy: "price" })
// - get_product_detail({ id: "SKU-12345" })
// All read-only, zero mutation risk.
```

### With Security Module

```js
import { AIXA } from '@aixa/core';
import { createHITLManager, sanitizePayload } from '@aixa/security';

// Agent actions trigger HITL approval for high-risk operations
const hitl = createHITLManager({ cssPrefix: 'aixa', hitlTimeout: 30000 });
hitl.listen();

const aixa = new AIXA({ autoInfer: true, hitlEnabled: true });
aixa.start();
```

## Architecture

### Event Bridge

Agent-website communication uses CustomEvents on the window object:

| Event | Direction | Purpose |
|-------|-----------|---------|
| `aixa:capabilities:request` | Agent → Site | Agent asks "what can you do?" |
| `aixa:capabilities:response` | Site → Agent | Site replies with tool schemas |
| `aixa:tool:invoke` | Agent → Site | Agent calls a tool with params |
| `aixa:tool:result` | Site → Agent | Site returns tool result |
| `aixa:hitl:request` | Site → User | High-risk action needs approval |
| `aixa:hitl:response` | User → Site | User approves or denies |

### Risk Classification

| Risk Level | Examples | HITL Required |
|------------|----------|---------------|
| **SAFE** | Search, filter, sort, fetch details, navigate | ❌ |
| **HIGH_RISK** | Add to cart, checkout, profile changes, delete | ✅ |

### UI Mirroring

Agent actions are visually reflected in the DOM so users can see what their agent is doing:
- Form fields populate with agent-provided values
- Dropdowns change to reflect agent selections
- A subtle corner indicator pulses when the agent is active
- Blue outline flashes on affected elements

### SPA-Ready

Built for React, Vue, Next.js, and Svelte apps:
- `watchNavigation()` intercepts `pushState`/`replaceState` and listens for popstate
- `MutationObserver` detects DOM changes from framework re-renders
- `refreshTools()` re-scans after route changes

## WebMCP Compatibility

| Feature | WebMCP Spec | aixa.js |
|---------|------------|--------|
| Imperative API (`registerTool`) | ✅ `document.modelContext.registerTool()` | ✅ `aixa.registerSearch()` / `registerAction()` |
| Declarative API (HTML attrs) | ✅ `<form toolname="...">` | ✅ Auto-inference from semantic HTML + `data-aixa-*` |
| JSON Schema input params | ✅ | ✅ `ToolParameter` type |
| Read-only hints | ✅ `annotations.readOnlyHint` | ✅ `RiskLevel.SAFE` / `HIGH_RISK` |
| Origin-based exposure | ✅ `exposedTo` | 🔜 Planned |
| `requestUserInteraction()` HITL | ✅ `ModelContextClient.requestUserInteraction()` | ✅ HITL modal with Approve/Deny |
| Permissions Policy | ✅ `model-context` policy | 🔜 Planned (sandbox iframe support) |
| `:tool-form-active` CSS | ✅ CSS pseudo-class | 🔜 Planned |
| Browser-native transport | ✅ | 🔜 Polyfill via CustomEvents (spec-aligned when native ships) |

## Development

```bash
# Clone and install
git clone https://github.com/agent-interaction-labs/aixa.git
cd aixa
npm install

# Build all packages
npm run build        # tsc -b (incremental)

# Run tests
npm test             # vitest run — 26 tests across 3 suites

# Watch mode
npm run build:watch  # tsc -b -w
npm run test:watch   # vitest
```

## License

Apache 2.0 — see [LICENSE](LICENSE)

---

**Built by [Agent Interaction Labs](https://github.com/agent-interaction-labs)** — opening the web to agentic interaction.

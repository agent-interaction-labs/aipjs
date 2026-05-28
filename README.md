# agentic-js — Universal WebMCP Polyfill for Browser Agents

**Agentic Engine Optimization (AEO) SDK.** Give your website the ability to broadcast searchable, structured capabilities to AI agents — today, across all browsers, without waiting for native WebMCP adoption.

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Tests](https://img.shields.io/badge/tests-19%2F19-brightgreen)]()
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)]()

## What is agentic-js?

WebMCP (Web Model Context Protocol) is a [W3C Community Group specification](https://webmachinelearning.github.io/webmcp) that lets websites expose tools to AI agents. Chrome 146+ has an early preview behind a flag — but no other browser has announced support, and the spec is still evolving.

**agentic-js is the universal polyfill.** It gives your website immediate WebMCP-like capabilities (tool registration, agent discovery, JSON-RPC invocation) with a single script tag — no browser flag needed. When native WebMCP ships everywhere, you drop the polyfill and your tool registrations keep working.

## How It Works

```
┌──────────────────────────────────────────────────────┐
│                    Your Website                       │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │ Auto-Infer  │  │  Developer  │  │   Security   │ │
│  │   Engine    │  │    API      │  │   (HITL)     │ │
│  │             │  │             │  │              │ │
│  │ DOM scan →  │  │ register    │  │ Prompt       │ │
│  │ ToolSchema  │  │ Search()    │  │ Injection    │ │
│  │             │  │ register    │  │ Protection   │ │
│  │             │  │ Action()    │  │              │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘ │
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

1. **Auto-Inference Engine** — Scans your DOM for semantic HTML elements (search inputs, filter dropdowns, action buttons), ARIA attributes, and `data-agentic-*` hints, then automatically generates clean JSON-RPC tool schemas. Zero configuration needed.

2. **Developer Override API** — For complex SPAs and custom endpoints, register tools explicitly:
   ```js
   import { AgenticJS } from '@agentic-js/core';

   const agentic = new AgenticJS({ autoInfer: true, hitlEnabled: true });
   agentic.registerSearch({
     endpoint: '/api/v2/search',
     parameters: [
       { name: 'q', type: 'string', description: 'Search query', required: true },
       { name: 'category', type: 'string', description: 'Category filter', required: false },
     ]
   });
   agentic.start();
   ```

3. **Security & HITL** — Every tool is classified SAFE (read-only: search, filter, navigate) or HIGH_RISK (mutation: add to cart, checkout, profile changes). High-risk actions trigger a native DOM modal requiring explicit human approval before the payload touches your backend. Includes prompt injection sanitization to prevent malicious page data from hijacking agent instructions.

## Package Structure

| Package | Description | Size |
|---------|-------------|------|
| `@agentic-js/types` | Shared types: JSON-RPC, ToolSchema, HITL, Config | <2 KB |
| `@agentic-js/core` | Auto-inference, registry, UI mirroring, AgenticJS class | <8 KB |
| `@agentic-js/security` | HITL modal, prompt injection sanitizer | <6 KB |
| `@agentic-js/plugin-ecommerce` | Safe search abstraction for e-commerce, real estate, travel | <5 KB |

## Quick Start

### Auto-Inference (Zero Config)

```html
<script type="module">
  import { AgenticJS } from 'https://cdn.agentic-js.dev/core/index.js';

  const agentic = new AgenticJS({ autoInfer: true });
  agentic.start();

  // Your page now broadcasts tool schemas to browser agents
  // Search inputs, filters, sort controls — all auto-discovered
  console.log(agentic.getCapabilities());
  // { tools: [...], page: { title: "My Store", url: "..." }, ... }
</script>
```

### E-Commerce Plugin

```js
import { ecommercePlugin } from '@agentic-js/plugin-ecommerce';

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
import { AgenticJS } from '@agentic-js/core';
import { createHITLManager, sanitizePayload } from '@agentic-js/security';

// Agent actions trigger HITL approval for high-risk operations
const hitl = createHITLManager({ cssPrefix: 'agentic-js', hitlTimeout: 30000 });
hitl.listen();

const agentic = new AgenticJS({ autoInfer: true, hitlEnabled: true });
agentic.start();
```

## Architecture

### Event Bridge

Agent-website communication uses CustomEvents on the window object:

| Event | Direction | Purpose |
|-------|-----------|---------|
| `agentic:capabilities:request` | Agent → Site | Agent asks "what can you do?" |
| `agentic:capabilities:response` | Site → Agent | Site replies with tool schemas |
| `agentic:tool:invoke` | Agent → Site | Agent calls a tool with params |
| `agentic:tool:result` | Site → Agent | Site returns tool result |
| `agentic:hitl:request` | Site → User | High-risk action needs approval |
| `agentic:hitl:response` | User → Site | User approves or denies |

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

| Feature | WebMCP Spec | agentic-js |
|---------|------------|------------|
| Imperative API (`registerTool`) | ✅ `document.modelContext.registerTool()` | ✅ `agentic.registerSearch()` / `registerAction()` |
| Declarative API (HTML attrs) | ✅ `<form toolname="...">` | ✅ Auto-inference from semantic HTML + `data-agentic-*` |
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
git clone https://github.com/agentic-js/agentic-js.git
cd agentic-js
npm install

# Build all packages
npm run build        # tsc -b (incremental)

# Run tests
npm test             # vitest run — 19 tests across 3 suites

# Watch mode
npm run build:watch  # tsc -b -w
npm run test:watch   # vitest
```

## License

Apache 2.0 — see [LICENSE](LICENSE)

---

**Built by the Hermes Agent Swarm** — AI agents building tools for AI agents.

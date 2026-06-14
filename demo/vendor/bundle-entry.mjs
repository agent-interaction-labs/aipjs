// aip.js — Agentic Engine Optimization SDK — self-contained ESM bundle

// packages/types/dist/index.js
var RiskLevel;
(function(RiskLevel4) {
  RiskLevel4["SAFE"] = "safe";
  RiskLevel4["HIGH_RISK"] = "high_risk";
})(RiskLevel || (RiskLevel = {}));
var ActionCategory;
(function(ActionCategory3) {
  ActionCategory3["SEARCH"] = "search";
  ActionCategory3["FILTER"] = "filter";
  ActionCategory3["SORT"] = "sort";
  ActionCategory3["FETCH"] = "fetch";
  ActionCategory3["NAVIGATE"] = "navigate";
  ActionCategory3["MUTATE"] = "mutate";
  ActionCategory3["CUSTOM"] = "custom";
})(ActionCategory || (ActionCategory = {}));
var HITLAction;
(function(HITLAction3) {
  HITLAction3["APPROVE"] = "approve";
  HITLAction3["DENY"] = "deny";
  HITLAction3["TIMEOUT"] = "timeout";
})(HITLAction || (HITLAction = {}));
var DEFAULT_CONFIG = {
  autoInfer: true,
  developerOverrides: true,
  hitlEnabled: true,
  hitlTimeout: 3e4,
  hitlRiskLevels: [RiskLevel.HIGH_RISK],
  sanitizePayloads: true,
  uiMirroring: true,
  debug: false,
  cssPrefix: "aipjs",
  inferenceRoot: "body",
  inferenceTagAllowlist: []
};
var AgentBridgeEvent;
(function(AgentBridgeEvent3) {
  AgentBridgeEvent3["CAPABILITIES_REQUEST"] = "aip:capabilities:request";
  AgentBridgeEvent3["CAPABILITIES_RESPONSE"] = "aip:capabilities:response";
  AgentBridgeEvent3["TOOL_INVOKE"] = "aip:tool:invoke";
  AgentBridgeEvent3["TOOL_RESULT"] = "aip:tool:result";
  AgentBridgeEvent3["HITL_REQUEST"] = "aip:hitl:request";
  AgentBridgeEvent3["HITL_RESPONSE"] = "aip:hitl:response";
})(AgentBridgeEvent || (AgentBridgeEvent = {}));

// packages/core/src/inference.ts
var SEARCH_SELECTORS = [
  'input[type="search"]',
  'input[name*="search" i]',
  'input[name*="query" i]',
  'input[name="q"]',
  'input[placeholder*="search" i]',
  'input[role="searchbox"]',
  'input[role="combobox"]',
  'form[role="search"] input',
  "[data-aip-search]"
];
var FILTER_SELECTORS = [
  "select",
  'input[type="checkbox"]',
  'input[type="radio"]',
  '[role="radiogroup"]',
  'input[type="range"]',
  "[data-aip-filter]"
];
var SORT_SELECTORS = [
  'select[name*="sort" i]',
  'select[aria-label*="sort" i]',
  "[data-aip-sort]"
];
var MUTATION_SELECTORS = [
  'button[type="submit"]',
  'input[type="submit"]',
  'form[action*="cart" i] button[type="submit"]',
  'form[action*="checkout" i] button[type="submit"]',
  "[data-aip-confirm]"
];
function getElementLabel(el) {
  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel) return ariaLabel;
  if (el.id) {
    const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (label?.textContent) return label.textContent.trim();
  }
  const parentLabel = el.closest("label");
  if (parentLabel?.textContent) return parentLabel.textContent.replace(el.textContent || "", "").trim();
  const placeholder = el.placeholder;
  if (placeholder) return placeholder;
  const name = el.getAttribute("name");
  if (name) return name.replace(/[_-]/g, " ");
  const text = el.textContent?.trim();
  if (text && text.length < 80) return text;
  return el.tagName.toLowerCase();
}
function inferParameterType(el) {
  const tag = el.tagName.toLowerCase();
  const type = el.type;
  if (tag === "select") return "string";
  if (tag === "input") {
    if (type === "number" || type === "range") return "number";
    if (type === "checkbox" || type === "radio") return "boolean";
  }
  if (el.getAttribute("role") === "radiogroup") return "string";
  return "string";
}
function getElementSelector(el) {
  if (el.id) return `#${CSS.escape(el.id)}`;
  const name = el.getAttribute("name");
  if (name) return `[name="${CSS.escape(name)}"]`;
  const testId = el.getAttribute("data-testid");
  if (testId) return `[data-testid="${CSS.escape(testId)}"]`;
  return el.tagName.toLowerCase();
}
function classifyRisk(el) {
  const explicit = el.getAttribute("data-aip-risk");
  if (explicit === "high_risk") return RiskLevel.HIGH_RISK;
  if (explicit === "safe") return RiskLevel.SAFE;
  const tag = el.tagName.toLowerCase();
  if (tag === "button" || tag === "input") {
    const type = el.getAttribute("type");
    if (type === "submit") return RiskLevel.HIGH_RISK;
  }
  if (el.closest('form[action*="cart" i]') || el.closest('form[action*="checkout" i]'))
    return RiskLevel.HIGH_RISK;
  if (el.hasAttribute("data-aip-confirm")) return RiskLevel.HIGH_RISK;
  const href = el.href;
  if (href && /(checkout|subscribe|upgrade|delete|remove)/i.test(href))
    return RiskLevel.HIGH_RISK;
  return RiskLevel.SAFE;
}
function classifyCategory(el) {
  if (el.matches(SEARCH_SELECTORS.join(","))) return ActionCategory.SEARCH;
  if (el.matches(FILTER_SELECTORS.join(","))) return ActionCategory.FILTER;
  if (el.matches(SORT_SELECTORS.join(","))) return ActionCategory.SORT;
  if (el.tagName.toLowerCase() === "a") return ActionCategory.NAVIGATE;
  const typeAttr = el.type;
  if (typeAttr === "submit") return ActionCategory.MUTATE;
  const explicit = el.getAttribute("data-aip-category");
  if (explicit) return explicit;
  return ActionCategory.CUSTOM;
}
function extractParameters(el) {
  const params = [];
  const tag = el.tagName.toLowerCase();
  if (tag === "select") {
    const select = el;
    const options = Array.from(select.options).filter((o) => o.value).map((o) => o.value);
    params.push({
      name: getElementSelector(el),
      type: "string",
      description: getElementLabel(el),
      required: select.required,
      enum: options.length > 0 ? options : void 0
    });
  } else if (tag === "input") {
    const input = el;
    params.push({
      name: getElementSelector(el),
      type: inferParameterType(el),
      description: getElementLabel(el),
      required: input.required
    });
  } else if (tag === "button" || tag === "a") {
    const dataParams = el.getAttribute("data-aip-params");
    if (dataParams) {
      try {
        const parsed = JSON.parse(dataParams);
        for (const [key, value] of Object.entries(parsed)) {
          params.push({ name: key, type: typeof value, description: key, required: true });
        }
      } catch (err) {
        console.warn(`[@aipjs/core] Failed to parse data-aip-params on element:`, el, err);
      }
    }
  }
  return params;
}
function generateToolSchema(el, index) {
  const category = classifyCategory(el);
  const label = getElementLabel(el);
  const name = el.getAttribute("data-aip-name") || `${category}_${label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${index}`;
  const description = el.getAttribute("data-aip-description") || `${category === ActionCategory.MUTATE ? "[REQUIRES HUMAN APPROVAL] " : ""}${label}`;
  return {
    name,
    description,
    riskLevel: classifyRisk(el),
    category,
    parameters: extractParameters(el),
    sourceElement: getElementSelector(el),
    metadata: { inferred: true, url: window.location.href }
  };
}
function inferTools(config = {}) {
  const root = config.rootSelector ? document.querySelector(config.rootSelector) || document.body : document.body;
  const toolSchemas = [];
  const seen = /* @__PURE__ */ new Set();
  let idx = 0;
  const selectors = [...SEARCH_SELECTORS, ...FILTER_SELECTORS, ...SORT_SELECTORS, ...MUTATION_SELECTORS];
  for (const sel of selectors) {
    try {
      root.querySelectorAll(sel).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (config.tagAllowlist?.length && !config.tagAllowlist.includes(el.tagName.toLowerCase())) return;
        toolSchemas.push(generateToolSchema(el, idx++));
      });
    } catch {
    }
  }
  const safe = toolSchemas.filter((t) => t.riskLevel === RiskLevel.SAFE).length;
  const highRisk = toolSchemas.filter((t) => t.riskLevel === RiskLevel.HIGH_RISK).length;
  const categories = {};
  for (const t of toolSchemas) categories[t.category] = (categories[t.category] || 0) + 1;
  return { tools: toolSchemas, total: toolSchemas.length, safe, highRisk, categories };
}

// packages/core/src/registry.ts
var toolRegistry = /* @__PURE__ */ new Map();
function registerTool(options) {
  toolRegistry.set(options.name, {
    schema: {
      name: options.name,
      description: options.description,
      riskLevel: options.riskLevel || RiskLevel.SAFE,
      category: options.category || ActionCategory.CUSTOM,
      parameters: options.parameters,
      metadata: { registered: true, timestamp: Date.now() }
    },
    handler: options.handler,
    endpoint: options.endpoint,
    method: options.method || "GET"
  });
}
function registerSearch(options) {
  registerTool({
    name: "search",
    description: "Search the product/inventory catalog. Returns matching items.",
    parameters: options.parameters,
    endpoint: options.endpoint,
    method: options.method || "POST",
    handler: options.handler,
    riskLevel: RiskLevel.SAFE,
    category: ActionCategory.SEARCH
  });
}
function registerAction(options) {
  registerTool({
    ...options,
    riskLevel: options.requiresConfirmation !== false ? RiskLevel.HIGH_RISK : RiskLevel.SAFE,
    category: ActionCategory.MUTATE
  });
}
function unregisterTool(name) {
  return toolRegistry.delete(name);
}
function clearRegistry() {
  toolRegistry.clear();
}
function getRegisteredTools() {
  return Array.from(toolRegistry.values()).map((r) => r.schema);
}
async function executeTool(name, params) {
  const registered = toolRegistry.get(name);
  if (!registered) throw new Error(`Tool "${name}" not registered`);
  if (registered.handler) return registered.handler(params);
  if (registered.endpoint) {
    const method = registered.method || "GET";
    let url = registered.endpoint;
    if (method === "GET") {
      const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
      url = `${url}?${qs}`;
    }
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method !== "GET" ? JSON.stringify(params) : void 0
    });
    if (!res.ok) throw new Error(`Tool execution failed: ${res.status}`);
    return res.json();
  }
  throw new Error(`Tool "${name}" has no handler or endpoint`);
}

// packages/core/src/mirror.ts
var state = {
  active: /* @__PURE__ */ new Map(),
  indicator: null,
  cssPrefix: "aipjs",
  enabled: true
};
function ensureIndicator() {
  if (state.indicator) return state.indicator;
  const el = document.createElement("div");
  el.id = `${state.cssPrefix}-indicator`;
  el.innerHTML = `<div style="position:fixed;bottom:16px;right:16px;width:10px;height:10px;border-radius:50%;background:#3b82f6;z-index:2147483646;" title="Agentic JS Active"></div>`;
  document.body.appendChild(el);
  state.indicator = el;
  return el;
}
function injectStyles() {
  if (document.getElementById(`${state.cssPrefix}-styles`)) return;
  const style = document.createElement("style");
  style.id = `${state.cssPrefix}-styles`;
  style.textContent = `
    @keyframes ${state.cssPrefix}-pulse {
      0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
      70% { box-shadow: 0 0 0 10px rgba(16,185,129,0); }
      100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
    }
    .${state.cssPrefix}-mirror-focus { outline: 2px solid #3b82f6 !important; outline-offset: 2px !important; }
    .${state.cssPrefix}-mirror-changed { animation: ${state.cssPrefix}-flash 0.5s ease; }
    @keyframes ${state.cssPrefix}-flash {
      0%, 100% { background-color: transparent; }
      50% { background-color: rgba(59,130,246,0.15); }
    }
  `;
  document.head.appendChild(style);
}
function pulseIndicator(active) {
  const dot = state.indicator?.querySelector("div");
  if (!dot) return;
  if (active) {
    dot.style.animation = `${state.cssPrefix}-pulse 1.5s infinite`;
    dot.style.background = "#10b981";
  } else {
    dot.style.animation = "";
    dot.style.background = "#3b82f6";
  }
}
function mirrorElementValue(selector, value) {
  if (!state.enabled) return false;
  const el = document.querySelector(selector);
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  try {
    if (tag === "input") {
      const input = el;
      if (input.type === "checkbox") {
        input.checked = Boolean(value);
      } else {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
        setter?.call(input, String(value ?? ""));
      }
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.dispatchEvent(new Event("input", { bubbles: true }));
    } else if (tag === "select") {
      el.value = String(value ?? "");
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
    el.classList.add(`${state.cssPrefix}-mirror-focus`);
    setTimeout(() => el.classList.remove(`${state.cssPrefix}-mirror-focus`), 1500);
    return true;
  } catch {
    return false;
  }
}
function onToolStart(toolName, tool, params) {
  if (!state.enabled) return;
  state.active.set(`${toolName}-${Date.now()}`, { tool, startTime: Date.now(), params });
  pulseIndicator(true);
  if (tool.sourceElement) {
    for (const [key, value] of Object.entries(params)) {
      mirrorElementValue(`[name="${key}"]`, value);
    }
  }
}
function onToolComplete(toolName) {
  for (const [id, entry] of state.active) {
    if (entry.tool.name === toolName) {
      state.active.delete(id);
      break;
    }
  }
  if (state.active.size === 0) pulseIndicator(false);
}
function watchNavigation(callback) {
  const origPush = history.pushState.bind(history);
  const origReplace = history.replaceState.bind(history);
  history.pushState = function(data, unused, url) {
    origPush(data, unused, url);
    callback();
  };
  history.replaceState = function(data, unused, url) {
    origReplace(data, unused, url);
    callback();
  };
  window.addEventListener("popstate", callback);
  return () => {
    history.pushState = origPush;
    history.replaceState = origReplace;
    window.removeEventListener("popstate", callback);
  };
}
function initMirroring(config) {
  state.cssPrefix = config.cssPrefix;
  state.enabled = config.enabled !== false;
  if (state.enabled) {
    injectStyles();
    ensureIndicator();
  }
}

// packages/core/src/index.ts
var AIP = class {
  config;
  tools = [];
  started = false;
  cleanupFns = [];
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  start() {
    if (this.started) return;
    this.started = true;
    initMirroring({ cssPrefix: this.config.cssPrefix, enabled: this.config.uiMirroring });
    this.refreshTools();
    window.addEventListener(AgentBridgeEvent.CAPABILITIES_REQUEST, this.handleCapReq);
    window.addEventListener(AgentBridgeEvent.TOOL_INVOKE, this.handleToolInvoke);
    if (this.config.autoInfer) this.cleanupFns.push(watchNavigation(() => this.refreshTools()));
    this.broadcastCapabilities();
    if (this.config.debug) console.log(`[aip.js] Started \u2014 ${this.tools.length} tools`);
  }
  stop() {
    this.started = false;
    window.removeEventListener(AgentBridgeEvent.CAPABILITIES_REQUEST, this.handleCapReq);
    window.removeEventListener(AgentBridgeEvent.TOOL_INVOKE, this.handleToolInvoke);
    for (const fn of this.cleanupFns) fn();
    this.cleanupFns = [];
  }
  refreshTools() {
    const tools = [];
    if (this.config.developerOverrides) tools.push(...getRegisteredTools());
    if (this.config.autoInfer) {
      const inferred = inferTools({ rootSelector: this.config.inferenceRoot, tagAllowlist: this.config.inferenceTagAllowlist });
      const names = new Set(tools.map((t) => t.name));
      for (const t of inferred.tools) {
        if (!names.has(t.name)) tools.push(t);
      }
    }
    this.tools = tools;
  }
  getCapabilities() {
    return {
      tools: this.tools,
      page: {
        title: document.title,
        url: window.location.href,
        description: document.querySelector('meta[name="description"]')?.getAttribute("content") || void 0
      },
      protocolVersion: "0.1.0",
      allowsMutations: this.config.hitlEnabled,
      generatedAt: Date.now()
    };
  }
  broadcastCapabilities() {
    const caps = this.getCapabilities();
    window.dispatchEvent(new CustomEvent(AgentBridgeEvent.CAPABILITIES_RESPONSE, { detail: caps, bubbles: true }));
  }
  handleCapReq = () => {
    this.broadcastCapabilities();
  };
  handleToolInvoke = async (event) => {
    const detail = event.detail;
    if (!detail?.method) return;
    const tool = this.tools.find((t) => t.name === detail.method);
    if (!tool) {
      this.respondError(detail.id, -32601, `Tool not found: ${detail.method}`);
      return;
    }
    const params = detail.params || {};
    if (this.config.hitlEnabled && tool.riskLevel === RiskLevel.HIGH_RISK) {
      const approved = await this.requestHITL(tool, params);
      if (!approved) {
        this.respondError(detail.id, -32e3, "Human approval required");
        return;
      }
    }
    if (this.config.uiMirroring) onToolStart(tool.name, tool, params);
    try {
      const result = await executeTool(tool.name, params);
      onToolComplete(tool.name);
      this.respondSuccess(detail.id, result);
    } catch (err) {
      onToolComplete(tool.name);
      this.respondError(detail.id, -32e3, err instanceof Error ? err.message : "Execution failed");
    }
  };
  requestHITL(tool, params) {
    return new Promise((resolve) => {
      const reqId = `hitl-${Date.now()}`;
      const timeout = setTimeout(() => {
        resolve(false);
      }, this.config.hitlTimeout);
      const handler = (e) => {
        const d = e.detail;
        if (d?.requestId === reqId) {
          clearTimeout(timeout);
          resolve(d.action === "approve");
        }
      };
      window.addEventListener(AgentBridgeEvent.HITL_RESPONSE, handler, { once: false });
      window.dispatchEvent(new CustomEvent(AgentBridgeEvent.HITL_REQUEST, {
        detail: { id: reqId, toolName: tool.name, riskLevel: tool.riskLevel, payload: params, description: tool.description, timestamp: Date.now(), timeout: this.config.hitlTimeout },
        bubbles: true
      }));
    });
  }
  respondSuccess(id, result) {
    window.dispatchEvent(new CustomEvent(AgentBridgeEvent.TOOL_RESULT, { detail: { jsonrpc: "2.0", id, result }, bubbles: true }));
  }
  respondError(id, code, message) {
    window.dispatchEvent(new CustomEvent(AgentBridgeEvent.TOOL_RESULT, { detail: { jsonrpc: "2.0", id, error: { code, message } }, bubbles: true }));
  }
};

// packages/security/src/index.ts
var INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above|system)\s+(instructions?|prompts?|directives?)/i,
  /you\s+are\s+now\s+(a\s+)?/i,
  /system\s*prompt\s*[:=]/i,
  /disregard\s+(all\s+)?(previous|prior)\s+(instructions?|constraints?)/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /\[INST\]/i,
  /\[SYS\]/i,
  /<system>/i,
  /\u200B/,
  // zero-width space
  /\u200C/,
  // zero-width non-joiner
  /\uFEFF/
  // zero-width no-break space
];
function sanitizePayload(value) {
  if (typeof value !== "string") {
    if (Array.isArray(value)) return value.map(sanitizePayload);
    if (value !== null && typeof value === "object") {
      const sanitized = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key === "__proto__" || key === "constructor" ? `_sanitized_${key}` : key] = sanitizePayload(val);
      }
      return sanitized;
    }
    return value;
  }
  let s = value.replace(/[\u200B\u200C\u200D\uFEFF]/g, "");
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  if (s.length > 1e4) s = s.slice(0, 1e4) + "\u2026[truncated]";
  for (const p of INJECTION_PATTERNS) {
    if (p.test(s)) {
      s = `[SANITIZED] ${s.replace(/</g, "&lt;").replace(/>/g, "&gt;")}`;
      break;
    }
  }
  return s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
function injectHITLStyles(prefix) {
  if (document.getElementById(`${prefix}-hitl-styles`)) return;
  const s = document.createElement("style");
  s.id = `${prefix}-hitl-styles`;
  s.textContent = `
    .${prefix}-hitl-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:2147483647;animation:${prefix}-fade-in 0.2s ease;font-family:system-ui,sans-serif}
    @keyframes ${prefix}-fade-in{from{opacity:0}to{opacity:1}}
    .${prefix}-hitl-modal{background:#fff;border-radius:12px;max-width:520px;width:90%;box-shadow:0 25px 80px rgba(0,0,0,0.4);overflow:hidden}
    .${prefix}-hitl-header{background:#fef3c7;padding:20px 24px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #fde68a}
    .${prefix}-hitl-header h2{margin:0;font-size:16px;font-weight:600;color:#92400e}
    .${prefix}-hitl-body{padding:20px 24px}
    .${prefix}-hitl-body p{margin:0 0 12px;font-size:14px;color:#374151}
    .${prefix}-hitl-detail{display:flex;gap:8px;margin-bottom:6px;font-size:13px;color:#4b5563}
    .${prefix}-hitl-detail strong{min-width:80px;color:#6b7280}
    .${prefix}-hitl-risk{padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700}
    .${prefix}-hitl-risk.high_risk{background:#fee2e2;color:#dc2626}
    .${prefix}-hitl-payload summary{cursor:pointer;color:#6b7280;font-size:12px;font-weight:500}
    .${prefix}-hitl-payload pre{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;margin-top:8px;font-size:12px;max-height:200px;overflow:auto;color:#1f2937}
    .${prefix}-hitl-timer{margin:12px 0 0;font-size:13px;color:#9ca3af;text-align:center}
    .${prefix}-hitl-footer{padding:16px 24px;display:flex;gap:12px;justify-content:flex-end;border-top:1px solid #f3f4f6}
    .${prefix}-hitl-btn{padding:10px 24px;border-radius:8px;border:none;font-size:14px;font-weight:600;cursor:pointer}
    .${prefix}-hitl-btn.approve{background:#059669;color:#fff}
    .${prefix}-hitl-btn.approve:hover{background:#047857;box-shadow:0 4px 12px rgba(5,150,105,0.3)}
    .${prefix}-hitl-btn.deny{background:#f3f4f6;color:#6b7280}
    .${prefix}-hitl-btn.deny:hover{background:#e5e7eb;color:#374151}
  `;
  document.head.appendChild(s);
}
function createHITLModal(prefix, timeout) {
  injectHITLStyles(prefix);
  return {
    show(request) {
      return new Promise((resolve) => {
        let resolved = false;
        const backdrop = document.createElement("div");
        backdrop.className = `${prefix}-hitl-backdrop`;
        backdrop.setAttribute("role", "dialog");
        backdrop.setAttribute("aria-modal", "true");
        const secs = Math.ceil(timeout / 1e3);
        backdrop.innerHTML = `
          <div class="${prefix}-hitl-modal">
            <div class="${prefix}-hitl-header">
              <span style="font-size:28px">\u26A0\uFE0F</span>
              <h2>Agent Request \u2014 Human Approval Required</h2>
            </div>
            <div class="${prefix}-hitl-body">
              <p><strong>An AI agent wants to perform a high-risk action:</strong></p>
              <div class="${prefix}-hitl-detail"><strong>Action:</strong><span>${escapeHTML(request.description)}</span></div>
              <div class="${prefix}-hitl-detail"><strong>Tool:</strong><code>${escapeHTML(request.toolName)}</code></div>
              <div class="${prefix}-hitl-detail"><strong>Risk:</strong><span class="${prefix}-hitl-risk high_risk">HIGH RISK</span></div>
              <details class="${prefix}-hitl-payload"><summary>View Payload</summary><pre>${escapeHTML(JSON.stringify(request.payload, null, 2))}</pre></details>
              <p class="${prefix}-hitl-timer">Auto-denying in <span id="${prefix}-countdown">${secs}</span> seconds...</p>
            </div>
            <div class="${prefix}-hitl-footer">
              <button class="${prefix}-hitl-btn deny" id="${prefix}-hitl-deny">\u2715 Deny</button>
              <button class="${prefix}-hitl-btn approve" id="${prefix}-hitl-approve">\u2713 Approve</button>
            </div>
          </div>
        `;
        document.body.appendChild(backdrop);
        let countdown = secs;
        const cdEl = document.getElementById(`${prefix}-countdown`);
        const timerInt = setInterval(() => {
          countdown--;
          if (cdEl) cdEl.textContent = String(Math.max(0, countdown));
          if (countdown <= 0) clearInterval(timerInt);
        }, 1e3);
        const tId = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            clearInterval(timerInt);
            destroy();
            resolve({ requestId: request.id, action: HITLAction.TIMEOUT, timestamp: Date.now() });
          }
        }, timeout);
        const destroy = () => {
          clearTimeout(tId);
          clearInterval(timerInt);
          backdrop.remove();
        };
        document.getElementById(`${prefix}-hitl-approve`)?.addEventListener("click", () => {
          if (!resolved) {
            resolved = true;
            destroy();
            resolve({ requestId: request.id, action: HITLAction.APPROVE, timestamp: Date.now() });
          }
        });
        document.getElementById(`${prefix}-hitl-deny`)?.addEventListener("click", () => {
          if (!resolved) {
            resolved = true;
            destroy();
            resolve({ requestId: request.id, action: HITLAction.DENY, reason: "User denied", timestamp: Date.now() });
          }
        });
        backdrop.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            if (!resolved) {
              resolved = true;
              destroy();
              resolve({ requestId: request.id, action: HITLAction.DENY, reason: "ESC pressed", timestamp: Date.now() });
            }
          }
        });
      });
    },
    destroy() {
      document.querySelectorAll(`.${prefix}-hitl-backdrop`).forEach((el) => el.remove());
    }
  };
}
function createHITLManager(options) {
  const modal = createHITLModal(options.cssPrefix, options.hitlTimeout);
  let listening = false;
  function listen() {
    if (listening) return;
    listening = true;
    const handler = (event) => {
      const request = event.detail;
      if (!request?.id) return;
      modal.show(request).then((response) => {
        window.dispatchEvent(new CustomEvent(AgentBridgeEvent.HITL_RESPONSE, { detail: response, bubbles: true }));
      }).catch((err) => {
        console.error("[@aipjs/security] HITL error:", err);
      });
    };
    window.addEventListener(AgentBridgeEvent.HITL_REQUEST, handler);
  }
  function destroy() {
    listening = false;
    modal.destroy();
  }
  return { listen, destroy, modal };
}

// packages/core/dist/registry.js
var toolRegistry2 = /* @__PURE__ */ new Map();
function registerTool2(options) {
  toolRegistry2.set(options.name, {
    schema: {
      name: options.name,
      description: options.description,
      riskLevel: options.riskLevel || RiskLevel.SAFE,
      category: options.category || ActionCategory.CUSTOM,
      parameters: options.parameters,
      metadata: { registered: true, timestamp: Date.now() }
    },
    handler: options.handler,
    endpoint: options.endpoint,
    method: options.method || "GET"
  });
}
function registerSearch2(options) {
  registerTool2({
    name: "search",
    description: "Search the product/inventory catalog. Returns matching items.",
    parameters: options.parameters,
    endpoint: options.endpoint,
    method: options.method || "POST",
    handler: options.handler,
    riskLevel: RiskLevel.SAFE,
    category: ActionCategory.SEARCH
  });
}
function registerAction2(options) {
  registerTool2({
    ...options,
    riskLevel: options.requiresConfirmation !== false ? RiskLevel.HIGH_RISK : RiskLevel.SAFE,
    category: ActionCategory.MUTATE
  });
}

// packages/plugins/ecommerce/src/index.ts
function ecommercePlugin(config) {
  const searchParams = [
    { name: "q", type: "string", description: "Free-text search query (product name, keywords, description)", required: false },
    { name: "category", type: "string", description: "Category filter (e.g., electronics, clothing, furniture)", required: false },
    { name: "minPrice", type: "number", description: "Minimum price filter", required: false },
    { name: "maxPrice", type: "number", description: "Maximum price filter", required: false },
    { name: "brand", type: "string", description: "Brand name filter", required: false },
    { name: "inStock", type: "boolean", description: "Only show in-stock items", required: false },
    { name: "onSale", type: "boolean", description: "Only show items on sale", required: false },
    { name: "rating", type: "number", description: "Minimum customer rating (1-5)", required: false },
    { name: "sortBy", type: "string", description: "Sort field: price, rating, newest, relevance, name", required: false, enum: ["price", "rating", "newest", "relevance", "name"] },
    { name: "sortDir", type: "string", description: "Sort direction: asc or desc", required: false, enum: ["asc", "desc"] },
    { name: "page", type: "number", description: "Page number for pagination (starts at 1)", required: false },
    { name: "pageSize", type: "number", description: "Number of results per page (max 100)", required: false }
  ];
  const detailParams = [
    { name: "id", type: "string", description: "Product/listing ID", required: true }
  ];
  function buildSearchQuery(params) {
    const filters = [];
    if (params.category) filters.push({ field: "category", operator: "eq", value: params.category });
    if (params.minPrice !== void 0) filters.push({ field: "price", operator: "gte", value: Number(params.minPrice) });
    if (params.maxPrice !== void 0) filters.push({ field: "price", operator: "lte", value: Number(params.maxPrice) });
    if (params.brand) filters.push({ field: "brand", operator: "eq", value: params.brand });
    if (params.inStock !== void 0) filters.push({ field: "inStock", operator: "eq", value: Boolean(params.inStock) });
    if (params.onSale !== void 0) filters.push({ field: "onSale", operator: "eq", value: Boolean(params.onSale) });
    if (params.rating !== void 0) filters.push({ field: "rating", operator: "gte", value: Number(params.rating) });
    let sort;
    if (params.sortBy) {
      sort = { field: String(params.sortBy), direction: params.sortDir === "desc" ? "desc" : "asc" };
    }
    const pagination = {
      page: Number(params.page) || 1,
      pageSize: Math.min(Number(params.pageSize) || 20, 100)
    };
    return {
      q: params.q ? String(params.q) : void 0,
      filters: filters.length > 0 ? filters : void 0,
      sort,
      pagination
    };
  }
  const defaultSearchHandler = async (params) => {
    const query = buildSearchQuery(params);
    const qs = new URLSearchParams();
    if (query.q) qs.set("q", query.q);
    if (query.pagination) {
      qs.set("page", String(query.pagination.page));
      qs.set("pageSize", String(query.pagination.pageSize));
    }
    if (query.filters) {
      for (const f of query.filters) {
        qs.set(`filter[${f.field}]`, String(f.value));
      }
    }
    if (query.sort) {
      qs.set("sortBy", query.sort.field);
      qs.set("sortDir", query.sort.direction);
    }
    const res = await fetch(`${config.searchEndpoint}?${qs.toString()}`, {
      headers: { "Accept": "application/json" }
    });
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    return res.json();
  };
  const defaultDetailHandler = async (params) => {
    const id = String(params.id);
    const res = await fetch(`${config.detailEndpoint}/${encodeURIComponent(id)}`, {
      headers: { "Accept": "application/json" }
    });
    if (!res.ok) throw new Error(`Detail fetch failed: ${res.status}`);
    return res.json();
  };
  return {
    register() {
      registerSearch2({
        endpoint: config.searchEndpoint,
        parameters: searchParams,
        handler: config.searchHandler || defaultSearchHandler,
        method: "GET"
      });
      if (config.detailEndpoint) {
        const wrappedDetailHandler = config.detailHandler ? async (params) => config.detailHandler(String(params.id)) : defaultDetailHandler;
        registerAction2({
          name: "get_product_detail",
          description: "Get full details for a specific product or listing by ID. Safe read-only operation.",
          parameters: detailParams,
          handler: wrappedDetailHandler,
          requiresConfirmation: false
          // Read-only — no HITL needed
        });
      }
    },
    unregister() {
    }
  };
}
var VERTICAL_TEMPLATES = {
  ecommerce: {
    searchEndpoint: "/api/products/search",
    detailEndpoint: "/api/products",
    searchParams: [
      { name: "q", type: "string", description: "Product search query", required: false },
      { name: "category", type: "string", description: "Product category", required: false },
      { name: "minPrice", type: "number", description: "Min price", required: false },
      { name: "maxPrice", type: "number", description: "Max price", required: false },
      { name: "brand", type: "string", description: "Brand filter", required: false }
    ]
  },
  realEstate: {
    searchEndpoint: "/api/listings/search",
    detailEndpoint: "/api/listings",
    searchParams: [
      { name: "q", type: "string", description: "Location or address search", required: false },
      { name: "propertyType", type: "string", description: "Property type (house, apartment, condo, land)", required: false },
      { name: "minPrice", type: "number", description: "Min price", required: false },
      { name: "maxPrice", type: "number", description: "Max price", required: false },
      { name: "minBedrooms", type: "number", description: "Min bedrooms", required: false },
      { name: "minBathrooms", type: "number", description: "Min bathrooms", required: false },
      { name: "minArea", type: "number", description: "Min square footage", required: false }
    ]
  },
  travel: {
    searchEndpoint: "/api/flights/search",
    detailEndpoint: null,
    searchParams: [
      { name: "origin", type: "string", description: "Origin airport code (e.g., JFK, LAX)", required: true },
      { name: "destination", type: "string", description: "Destination airport code", required: true },
      { name: "departDate", type: "string", description: "Departure date (YYYY-MM-DD)", required: true },
      { name: "returnDate", type: "string", description: "Return date for round-trip (YYYY-MM-DD)", required: false },
      { name: "passengers", type: "number", description: "Number of passengers", required: false },
      { name: "cabinClass", type: "string", description: "Cabin class (economy, business, first)", required: false }
    ]
  }
};

// packages/types/src/index.ts
var RiskLevel3 = /* @__PURE__ */ ((RiskLevel4) => {
  RiskLevel4["SAFE"] = "safe";
  RiskLevel4["HIGH_RISK"] = "high_risk";
  return RiskLevel4;
})(RiskLevel3 || {});
var ActionCategory2 = /* @__PURE__ */ ((ActionCategory3) => {
  ActionCategory3["SEARCH"] = "search";
  ActionCategory3["FILTER"] = "filter";
  ActionCategory3["SORT"] = "sort";
  ActionCategory3["FETCH"] = "fetch";
  ActionCategory3["NAVIGATE"] = "navigate";
  ActionCategory3["MUTATE"] = "mutate";
  ActionCategory3["CUSTOM"] = "custom";
  return ActionCategory3;
})(ActionCategory2 || {});
var HITLAction2 = /* @__PURE__ */ ((HITLAction3) => {
  HITLAction3["APPROVE"] = "approve";
  HITLAction3["DENY"] = "deny";
  HITLAction3["TIMEOUT"] = "timeout";
  return HITLAction3;
})(HITLAction2 || {});
var DEFAULT_CONFIG2 = {
  autoInfer: true,
  developerOverrides: true,
  hitlEnabled: true,
  hitlTimeout: 3e4,
  hitlRiskLevels: ["high_risk" /* HIGH_RISK */],
  sanitizePayloads: true,
  uiMirroring: true,
  debug: false,
  cssPrefix: "aipjs",
  inferenceRoot: "body",
  inferenceTagAllowlist: []
};
var AgentBridgeEvent2 = /* @__PURE__ */ ((AgentBridgeEvent3) => {
  AgentBridgeEvent3["CAPABILITIES_REQUEST"] = "aip:capabilities:request";
  AgentBridgeEvent3["CAPABILITIES_RESPONSE"] = "aip:capabilities:response";
  AgentBridgeEvent3["TOOL_INVOKE"] = "aip:tool:invoke";
  AgentBridgeEvent3["TOOL_RESULT"] = "aip:tool:result";
  AgentBridgeEvent3["HITL_REQUEST"] = "aip:hitl:request";
  AgentBridgeEvent3["HITL_RESPONSE"] = "aip:hitl:response";
  return AgentBridgeEvent3;
})(AgentBridgeEvent2 || {});

export { AIP, ActionCategory2 as ActionCategory, AgentBridgeEvent2 as AgentBridgeEvent, DEFAULT_CONFIG2 as DEFAULT_CONFIG, HITLAction2 as HITLAction, RiskLevel3 as RiskLevel, VERTICAL_TEMPLATES, clearRegistry, createHITLManager, ecommercePlugin, executeTool, getRegisteredTools, inferTools, mirrorElementValue, registerAction, registerSearch, registerTool, sanitizePayload, unregisterTool };

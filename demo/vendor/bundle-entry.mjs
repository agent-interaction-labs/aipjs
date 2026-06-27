// aixa.js — Agent Interaction & eXecution Agreement (AIXA) SDK — self-contained ESM bundle

// packages/types/dist/index.js
var AIXA_PROTOCOL_VERSION = "1.0.0";
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
var HITLPolicy;
(function(HITLPolicy2) {
  HITLPolicy2["ALWAYS"] = "always";
  HITLPolicy2["ONCE"] = "once";
  HITLPolicy2["DELEGATED"] = "delegated";
  HITLPolicy2["CONDITIONAL"] = "conditional";
})(HITLPolicy || (HITLPolicy = {}));
var HITLAction;
(function(HITLAction3) {
  HITLAction3["APPROVE"] = "approve";
  HITLAction3["DENY"] = "deny";
  HITLAction3["TIMEOUT"] = "timeout";
})(HITLAction || (HITLAction = {}));
var AIXAErrorCode;
(function(AIXAErrorCode2) {
  AIXAErrorCode2[AIXAErrorCode2["TOOL_NOT_FOUND"] = -32001] = "TOOL_NOT_FOUND";
  AIXAErrorCode2[AIXAErrorCode2["TOOL_DISABLED"] = -32002] = "TOOL_DISABLED";
  AIXAErrorCode2[AIXAErrorCode2["TOOL_TIMEOUT"] = -32003] = "TOOL_TIMEOUT";
  AIXAErrorCode2[AIXAErrorCode2["TOOL_RATE_LIMITED"] = -32004] = "TOOL_RATE_LIMITED";
  AIXAErrorCode2[AIXAErrorCode2["TOOL_DEPENDENCY_FAIL"] = -32005] = "TOOL_DEPENDENCY_FAIL";
  AIXAErrorCode2[AIXAErrorCode2["HITL_EXPIRED"] = -32020] = "HITL_EXPIRED";
  AIXAErrorCode2[AIXAErrorCode2["HITL_DENIED"] = -32021] = "HITL_DENIED";
  AIXAErrorCode2[AIXAErrorCode2["HITL_REQUIRED"] = -32022] = "HITL_REQUIRED";
  AIXAErrorCode2[AIXAErrorCode2["HITL_UNAVAILABLE"] = -32023] = "HITL_UNAVAILABLE";
  AIXAErrorCode2[AIXAErrorCode2["UNAUTHORIZED_AGENT"] = -32030] = "UNAUTHORIZED_AGENT";
  AIXAErrorCode2[AIXAErrorCode2["FORBIDDEN_ACTION"] = -32031] = "FORBIDDEN_ACTION";
  AIXAErrorCode2[AIXAErrorCode2["AGENT_NOT_IDENTIFIED"] = -32032] = "AGENT_NOT_IDENTIFIED";
  AIXAErrorCode2[AIXAErrorCode2["UNSUPPORTED_VERSION"] = -32040] = "UNSUPPORTED_VERSION";
  AIXAErrorCode2[AIXAErrorCode2["FEATURE_NOT_AVAILABLE"] = -32041] = "FEATURE_NOT_AVAILABLE";
  AIXAErrorCode2[AIXAErrorCode2["MALFORMED_REQUEST"] = -32042] = "MALFORMED_REQUEST";
  AIXAErrorCode2[AIXAErrorCode2["VALIDATION_ERROR"] = -32043] = "VALIDATION_ERROR";
  AIXAErrorCode2[AIXAErrorCode2["RATE_LIMITED_GLOBAL"] = -32050] = "RATE_LIMITED_GLOBAL";
  AIXAErrorCode2[AIXAErrorCode2["QUOTA_EXCEEDED"] = -32051] = "QUOTA_EXCEEDED";
})(AIXAErrorCode || (AIXAErrorCode = {}));
var DEFAULT_CONFIG = {
  debug: false,
  inference: {
    enabled: true,
    rootSelector: "body",
    tagAllowlist: []
  },
  security: {
    hitl: {
      enabled: true,
      timeoutMs: 3e4,
      defaultPolicy: HITLPolicy.ALWAYS
    },
    sanitizePayloads: true
  },
  agents: {
    mode: "open"
  },
  rateLimit: {
    enabled: true,
    perMinute: 60,
    scope: "global"
  },
  session: {
    enabled: false,
    storage: "memory",
    ttlMs: 18e5
  },
  ui: {
    mirroring: true,
    cssPrefix: "aixa"
  }
};
var AgentBridgeEvent;
(function(AgentBridgeEvent3) {
  AgentBridgeEvent3["CAPABILITIES_REQUEST"] = "aixa:capabilities:request";
  AgentBridgeEvent3["CAPABILITIES_RESPONSE"] = "aixa:capabilities:response";
  AgentBridgeEvent3["TOOL_INVOKE"] = "aixa:tool:invoke";
  AgentBridgeEvent3["TOOL_RESULT"] = "aixa:tool:result";
  AgentBridgeEvent3["TOOL_CANCEL"] = "aixa:tool:cancel";
  AgentBridgeEvent3["HITL_REQUEST"] = "aixa:hitl:request";
  AgentBridgeEvent3["HITL_RESPONSE"] = "aixa:hitl:response";
  AgentBridgeEvent3["AGENT_INTRODUCE"] = "aixa:agent:introduce";
  AgentBridgeEvent3["AGENT_INTRODUCE_ACK"] = "aixa:agent:introduce:ack";
  AgentBridgeEvent3["TOOL_STREAM_START"] = "aixa:tool:stream:start";
  AgentBridgeEvent3["TOOL_STREAM_CHUNK"] = "aixa:tool:stream:chunk";
  AgentBridgeEvent3["TOOL_STREAM_END"] = "aixa:tool:stream:end";
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
  "[data-aixa-search]"
];
var FILTER_SELECTORS = [
  "select",
  'input[type="checkbox"]',
  'input[type="radio"]',
  '[role="radiogroup"]',
  'input[type="range"]',
  "[data-aixa-filter]"
];
var SORT_SELECTORS = [
  'select[name*="sort" i]',
  'select[aria-label*="sort" i]',
  "[data-aixa-sort]"
];
var MUTATION_SELECTORS = [
  'button[type="submit"]',
  'input[type="submit"]',
  'form[action*="cart" i] button[type="submit"]',
  'form[action*="checkout" i] button[type="submit"]',
  "[data-aixa-confirm]"
];
var NAVIGATION_SELECTORS = [
  'a[href]:not([href="#"]):not([href^="javascript:"])',
  "[data-aixa-navigate]",
  "nav a[href]",
  '[role="navigation"] a[href]'
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
  const explicit = el.getAttribute("data-aixa-risk");
  if (explicit === "high_risk") return RiskLevel.HIGH_RISK;
  if (explicit === "safe") return RiskLevel.SAFE;
  const tag = el.tagName.toLowerCase();
  if (tag === "button" || tag === "input") {
    const type = el.getAttribute("type");
    if (type === "submit") return RiskLevel.HIGH_RISK;
  }
  if (el.closest('form[action*="cart" i]') || el.closest('form[action*="checkout" i]'))
    return RiskLevel.HIGH_RISK;
  if (el.hasAttribute("data-aixa-confirm")) return RiskLevel.HIGH_RISK;
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
  const explicit = el.getAttribute("data-aixa-category");
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
    const dataParams = el.getAttribute("data-aixa-params");
    if (dataParams) {
      try {
        const parsed = JSON.parse(dataParams);
        for (const [key, value] of Object.entries(parsed)) {
          params.push({ name: key, type: typeof value, description: key, required: true });
        }
      } catch (err) {
        console.warn(`[@aixa/core] Failed to parse data-aixa-params on element:`, el, err);
      }
    }
  }
  return params;
}
function generateToolSchema(el, index) {
  const category = classifyCategory(el);
  const label = getElementLabel(el);
  const name = el.getAttribute("data-aixa-name") || `${category}_${label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${index}`;
  const description = el.getAttribute("data-aixa-description") || `${classifyRisk(el) === RiskLevel.HIGH_RISK ? "[REQUIRES HUMAN APPROVAL] " : ""}${label}`;
  const handler = buildAutoHandler(el, category);
  return {
    name,
    description,
    riskLevel: classifyRisk(el),
    category,
    parameters: extractParameters(el),
    sourceElement: getElementSelector(el),
    metadata: { inferred: true, url: window.location.href, _handler: handler }
  };
}
function buildAutoHandler(el, category) {
  return async (params) => {
    const tag = el.tagName.toLowerCase();
    const input = el;
    const select = el;
    const form = el.closest("form");
    const keys = Object.keys(params);
    const firstVal = keys.length > 0 ? params[keys[0]] : null;
    if (tag === "select" && firstVal !== null && firstVal !== void 0) {
      select.value = String(firstVal);
      select.dispatchEvent(new Event("change", { bubbles: true }));
    } else if (tag === "input") {
      const type = input.type;
      if (type === "checkbox") {
        input.checked = Boolean(firstVal);
      } else if (type === "radio") {
        input.checked = true;
      } else if (type === "range") {
        input.value = String(firstVal ?? input.value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        if (firstVal !== null && firstVal !== void 0) {
          input.value = String(firstVal);
        }
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
      input.dispatchEvent(new Event("change", { bubbles: true }));
    } else if (tag === "button" && form) {
      const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
      for (const hi of Array.from(hiddenInputs)) {
        const key = hi.getAttribute("name") || hi.id;
        if (key && params[key] !== void 0) {
          hi.value = String(params[key]);
        }
      }
      form.requestSubmit ? form.requestSubmit(el) : form.submit();
    } else if (tag === "a" && el.href) {
      window.location.href = el.href;
    } else if (form) {
      for (const [key, val] of Object.entries(params)) {
        let hidden = form.querySelector(`input[name="${key}"]`);
        if (!hidden) {
          hidden = document.createElement("input");
          hidden.type = "hidden";
          hidden.name = key;
          form.appendChild(hidden);
        }
        hidden.value = String(val);
      }
      form.requestSubmit ? form.requestSubmit() : form.submit();
    }
    return {
      success: true,
      action: category,
      element: getElementSelector(el),
      params
    };
  };
}
function inferTools(config = {}) {
  const root = config.rootSelector ? document.querySelector(config.rootSelector) || document.body : document.body;
  const toolSchemas = [];
  const seen = /* @__PURE__ */ new Set();
  let idx = 0;
  const selectors = [...SEARCH_SELECTORS, ...FILTER_SELECTORS, ...SORT_SELECTORS, ...MUTATION_SELECTORS, ...NAVIGATION_SELECTORS];
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
      metadata: { registered: true, timestamp: Date.now() },
      hitlPolicy: options.hitlPolicy,
      hitlCondition: options.hitlCondition,
      requires: options.requires,
      conflicts: options.conflicts,
      ordering: options.ordering,
      workflowId: options.workflowId
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
    category: ActionCategory.SEARCH,
    hitlPolicy: options.hitlPolicy
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
function hasRegisteredTool(name) {
  return toolRegistry.has(name);
}
async function executeTool(name, params, signal) {
  const registered = toolRegistry.get(name);
  if (!registered) throw new Error(`Tool "${name}" not registered`);
  if (registered.handler) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    return registered.handler(params, signal);
  }
  if (registered.endpoint) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const method = registered.method || "GET";
    let url = registered.endpoint;
    if (method === "GET") {
      const qs = new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString();
      url = `${url}?${qs}`;
    }
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method !== "GET" ? JSON.stringify(params) : void 0,
      signal
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
  cssPrefix: "aixa",
  enabled: true
};
function ensureIndicator() {
  if (state.indicator) return state.indicator;
  const el = document.createElement("div");
  el.id = `${state.cssPrefix}-indicator`;
  el.innerHTML = `<div style="position:fixed;bottom:16px;right:16px;width:10px;height:10px;border-radius:50%;background:#3b82f6;z-index:2147483646;" title="AIXA Active"></div>`;
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
function resolveConfig(partial) {
  const d = DEFAULT_CONFIG;
  const inf = partial.inference ?? {};
  const sec = partial.security ?? {};
  const secHitl = sec.hitl ?? {};
  const ag = partial.agents ?? {};
  const rl = partial.rateLimit ?? {};
  const ssn = partial.session ?? {};
  const u = partial.ui ?? {};
  return {
    debug: partial.debug ?? d.debug ?? false,
    inference: {
      enabled: inf.enabled ?? d.inference.enabled,
      rootSelector: inf.rootSelector ?? d.inference.rootSelector,
      tagAllowlist: inf.tagAllowlist ?? d.inference.tagAllowlist
    },
    security: {
      hitl: {
        enabled: secHitl.enabled ?? d.security.hitl.enabled,
        timeoutMs: secHitl.timeoutMs ?? d.security.hitl.timeoutMs,
        defaultPolicy: secHitl.defaultPolicy ?? d.security.hitl.defaultPolicy,
        auditCallback: secHitl.auditCallback ?? d.security.hitl.auditCallback
      },
      sanitizePayloads: sec.sanitizePayloads ?? d.security.sanitizePayloads
    },
    agents: {
      mode: ag.mode ?? d.agents.mode,
      allowlist: ag.allowlist ?? d.agents.allowlist,
      blocklist: ag.blocklist ?? d.agents.blocklist,
      onIntroduce: ag.onIntroduce ?? d.agents.onIntroduce
    },
    rateLimit: {
      enabled: rl.enabled ?? d.rateLimit.enabled,
      perMinute: rl.perMinute ?? d.rateLimit.perMinute,
      scope: rl.scope ?? d.rateLimit.scope
    },
    session: {
      enabled: ssn.enabled ?? d.session.enabled,
      storage: ssn.storage ?? d.session.storage,
      ttlMs: ssn.ttlMs ?? d.session.ttlMs
    },
    ui: {
      mirroring: u.mirroring ?? d.ui.mirroring,
      cssPrefix: u.cssPrefix ?? d.ui.cssPrefix
    }
  };
}
var TokenBucket = class {
  tokens;
  lastRefill;
  refillRate;
  // tokens per ms
  constructor(tokensPerMinute) {
    this.tokens = tokensPerMinute;
    this.lastRefill = Date.now();
    this.refillRate = tokensPerMinute / 6e4;
  }
  tryConsume(count = 1) {
    this.refill();
    this.tokens -= count;
    if (this.tokens < 0) {
      const msUntilRefill = Math.ceil(Math.abs(this.tokens) / this.refillRate);
      return { allowed: false, retryAfterMs: msUntilRefill };
    }
    return { allowed: true, retryAfterMs: 0 };
  }
  getInfo(total) {
    this.refill();
    return {
      limit: total,
      remaining: Math.max(0, Math.floor(this.tokens)),
      reset: this.lastRefill + 6e4,
      windowMs: 6e4,
      scope: "global"
    };
  }
  refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.tokens + elapsed * this.refillRate, this.refillRate * 6e4);
    this.lastRefill = now;
  }
};
var AIXA = class {
  config;
  tools = [];
  started = false;
  cleanupFns = [];
  globalLimiter;
  perToolLimiters = /* @__PURE__ */ new Map();
  hitlSession = { approvedTools: /* @__PURE__ */ new Set(), auditLog: [] };
  toolExecutions = /* @__PURE__ */ new Map();
  constructor(config = {}) {
    this.config = resolveConfig(config);
    this.globalLimiter = new TokenBucket(this.config.rateLimit.perMinute);
  }
  // ── Lifecycle ────────────────────────────────────────────────────────────
  start() {
    if (this.started) return;
    this.started = true;
    initMirroring({ cssPrefix: this.config.ui.cssPrefix, enabled: this.config.ui.mirroring });
    this.refreshTools();
    window.addEventListener(AgentBridgeEvent.CAPABILITIES_REQUEST, this.handleCapReq);
    window.addEventListener(AgentBridgeEvent.TOOL_INVOKE, this.handleToolInvoke);
    window.addEventListener(AgentBridgeEvent.TOOL_CANCEL, this.handleToolCancel);
    window.addEventListener(AgentBridgeEvent.AGENT_INTRODUCE, this.handleAgentIntroduce);
    if (this.config.inference.enabled) {
      this.cleanupFns.push(watchNavigation(() => this.refreshTools()));
    }
    this.broadcastCapabilities();
    if (this.config.debug) {
      console.log(`[aixa.js] Started \u2014 ${this.tools.length} tools, protocol v${AIXA_PROTOCOL_VERSION}`);
    }
  }
  stop() {
    this.started = false;
    window.removeEventListener(AgentBridgeEvent.CAPABILITIES_REQUEST, this.handleCapReq);
    window.removeEventListener(AgentBridgeEvent.TOOL_INVOKE, this.handleToolInvoke);
    window.removeEventListener(AgentBridgeEvent.TOOL_CANCEL, this.handleToolCancel);
    window.removeEventListener(AgentBridgeEvent.AGENT_INTRODUCE, this.handleAgentIntroduce);
    for (const fn of this.cleanupFns) fn();
    this.cleanupFns = [];
    for (const [name, ctrl] of this.toolExecutions) {
      ctrl.abort();
    }
    this.toolExecutions.clear();
  }
  // ── Tool Management ──────────────────────────────────────────────────────
  refreshTools() {
    const tools = [];
    tools.push(...getRegisteredTools());
    if (this.config.inference.enabled) {
      const inferred = inferTools({
        rootSelector: this.config.inference.rootSelector,
        tagAllowlist: this.config.inference.tagAllowlist
      });
      const names = new Set(tools.map((t) => t.name));
      for (const t of inferred.tools) {
        if (!names.has(t.name)) tools.push(t);
      }
    }
    this.tools = tools;
  }
  // ── Capabilities ─────────────────────────────────────────────────────────
  getCapabilities() {
    return {
      tools: this.tools,
      page: {
        title: document.title,
        url: window.location.href,
        description: document.querySelector('meta[name="description"]')?.getAttribute("content") || void 0
      },
      protocolVersion: AIXA_PROTOCOL_VERSION,
      allowsMutations: this.config.security.hitl.enabled,
      generatedAt: Date.now(),
      capabilities: {
        version: AIXA_PROTOCOL_VERSION,
        features: {
          hitl: this.config.security.hitl.enabled,
          nestedParams: true,
          streaming: false,
          rateLimit: this.config.rateLimit.enabled,
          agentAuth: false,
          // spec-defined, no enforcement yet — agents don't identify themselves
          multiPage: this.config.session.enabled
        },
        limits: {
          maxToolsPerPage: 500,
          maxParamsPerTool: 20,
          maxParamDepth: 3,
          hitlTimeoutMs: this.config.security.hitl.timeoutMs,
          rateLimitPerMinute: this.config.rateLimit.perMinute,
          rateLimitWindowMs: 6e4
        }
      }
    };
  }
  broadcastCapabilities() {
    const caps = this.getCapabilities();
    window.dispatchEvent(new CustomEvent(AgentBridgeEvent.CAPABILITIES_RESPONSE, {
      detail: caps,
      bubbles: true
    }));
  }
  // ── Agent Identity ───────────────────────────────────────────────────────
  handleAgentIntroduce = (event) => {
    const identity = event.detail;
    if (!identity?.id) return;
    let accepted = true;
    let reason;
    if (this.config.agents.mode === "filtered") {
      if (this.config.agents.blocklist?.includes(identity.id)) {
        accepted = false;
        reason = `Agent ${identity.name} is blocked`;
      } else if (this.config.agents.allowlist?.length) {
        accepted = this.config.agents.allowlist.some(
          (a) => (!a.vendor || a.vendor === identity.vendor) && (!a.name || a.name === identity.name)
        );
        if (!accepted) reason = `Agent ${identity.name} (${identity.vendor}) not in allowlist`;
      }
    }
    if (accepted && this.config.agents.onIntroduce) {
      const result = this.config.agents.onIntroduce(identity);
      if (result instanceof Promise) {
        result.then((r) => {
          if (!r) this.sendAgentAck(identity.id, false, "Rejected by site policy");
          else this.sendAgentAck(identity.id, true);
        });
        return;
      }
      accepted = result;
    }
    this.sendAgentAck(identity.id, accepted, reason);
  };
  sendAgentAck(agentId, accepted, reason) {
    window.dispatchEvent(new CustomEvent(AgentBridgeEvent.AGENT_INTRODUCE_ACK, {
      detail: { agentId, accepted, reason, timestamp: Date.now() },
      bubbles: true
    }));
  }
  // ── Tool Execution ───────────────────────────────────────────────────────
  handleCapReq = () => {
    this.broadcastCapabilities();
  };
  handleToolCancel = (event) => {
    const detail = event.detail;
    if (!detail?.toolName) return;
    const ctrl = this.toolExecutions.get(detail.toolName);
    if (ctrl) {
      ctrl.abort();
      this.toolExecutions.delete(detail.toolName);
    }
  };
  handleToolInvoke = async (event) => {
    const detail = event.detail;
    if (!detail?.method) return;
    const tool = this.tools.find((t) => t.name === detail.method);
    if (!tool) {
      this.respondAIXAError(detail.id, AIXAErrorCode.TOOL_NOT_FOUND, `Tool not found: ${detail.method}`, { toolName: detail.method });
      return;
    }
    const params = detail.params || {};
    if (this.config.rateLimit.enabled) {
      if (this.config.rateLimit.scope === "per-tool") {
        let limiter = this.perToolLimiters.get(tool.name);
        if (!limiter) {
          limiter = new TokenBucket(this.config.rateLimit.perMinute);
          this.perToolLimiters.set(tool.name, limiter);
        }
        const check = limiter.tryConsume();
        if (!check.allowed) {
          this.respondAIXAError(detail.id, AIXAErrorCode.TOOL_RATE_LIMITED, `Rate limited: ${tool.name}`, { toolName: tool.name, retryAfterMs: check.retryAfterMs });
          return;
        }
      } else {
        const check = this.globalLimiter.tryConsume();
        if (!check.allowed) {
          this.respondAIXAError(detail.id, AIXAErrorCode.RATE_LIMITED_GLOBAL, "Global rate limit reached", { retryAfterMs: check.retryAfterMs });
          return;
        }
      }
    }
    if (tool.requires?.length) {
      for (const dep of tool.requires) {
        if (!hasRegisteredTool(dep) && !this.tools.find((t) => t.name === dep)) {
          this.respondAIXAError(detail.id, AIXAErrorCode.TOOL_DEPENDENCY_FAIL, `Tool "${tool.name}" requires "${dep}" to be called first`, { toolName: tool.name, requiredTools: tool.requires });
          return;
        }
      }
    }
    const shouldHITL = this.shouldRequestHITL(tool);
    if (shouldHITL) {
      const approved = await this.requestHITL(tool, params);
      if (!approved) {
        return;
      }
    }
    if (this.config.ui.mirroring) onToolStart(tool.name, tool, params);
    const timeout = detail.timeout ?? this.config.security.hitl.timeoutMs;
    const abortCtrl = new AbortController();
    this.toolExecutions.set(tool.name, abortCtrl);
    const timeoutId = setTimeout(() => {
      abortCtrl.abort();
    }, timeout);
    try {
      const autoHandler = tool.metadata?._handler;
      const result = autoHandler ? await autoHandler(params, abortCtrl.signal) : await executeTool(tool.name, params, abortCtrl.signal);
      clearTimeout(timeoutId);
      this.toolExecutions.delete(tool.name);
      onToolComplete(tool.name);
      this.respondSuccess(detail.id, result);
    } catch (err) {
      clearTimeout(timeoutId);
      this.toolExecutions.delete(tool.name);
      onToolComplete(tool.name);
      if (err.name === "AbortError") {
        this.respondAIXAError(detail.id, AIXAErrorCode.TOOL_TIMEOUT, `Tool "${tool.name}" timed out`, { toolName: tool.name });
      } else {
        this.respondAIXAError(detail.id, AIXAErrorCode.TOOL_RATE_LIMITED, err instanceof Error ? err.message : "Execution failed", { toolName: tool.name });
      }
    }
  };
  // ── HITL ─────────────────────────────────────────────────────────────────
  shouldRequestHITL(tool) {
    if (!this.config.security.hitl.enabled) return false;
    if (tool.riskLevel !== RiskLevel.HIGH_RISK) return false;
    const policy = tool.hitlPolicy ?? this.config.security.hitl.defaultPolicy;
    switch (policy) {
      case HITLPolicy.DELEGATED:
        return false;
      case HITLPolicy.ONCE:
        return !this.hitlSession.approvedTools.has(tool.name);
      case HITLPolicy.CONDITIONAL:
        return true;
      case HITLPolicy.ALWAYS:
      default:
        return true;
    }
  }
  requestHITL(tool, params) {
    const policy = tool.hitlPolicy ?? this.config.security.hitl.defaultPolicy;
    return new Promise((resolve) => {
      const reqId = `hitl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const startTime = Date.now();
      const timeout = setTimeout(() => {
        this.recordHITLAudit(tool, policy, HITLAction.TIMEOUT, void 0, Date.now() - startTime, params);
        resolve(false);
        this.dispatchHITLError(reqId);
      }, this.config.security.hitl.timeoutMs);
      const handler = (e) => {
        const d = e.detail;
        if (d?.requestId !== reqId) return;
        clearTimeout(timeout);
        const duration = Date.now() - startTime;
        const action = d.action;
        this.recordHITLAudit(tool, policy, action, d.reason, duration, params);
        if (d.action === "approve") {
          if (policy === HITLPolicy.ONCE) {
            this.hitlSession.approvedTools.add(tool.name);
          }
          resolve(true);
        } else {
          this.respondAIXAError(reqId, AIXAErrorCode.HITL_DENIED, `Human denied: ${tool.name}`, { toolName: tool.name });
          resolve(false);
        }
      };
      window.addEventListener(AgentBridgeEvent.HITL_RESPONSE, handler, { once: false });
      window.dispatchEvent(new CustomEvent(AgentBridgeEvent.HITL_REQUEST, {
        detail: {
          id: reqId,
          toolName: tool.name,
          riskLevel: tool.riskLevel,
          payload: params,
          description: tool.description,
          timestamp: Date.now(),
          timeout: this.config.security.hitl.timeoutMs,
          policy
        },
        bubbles: true
      }));
    });
  }
  recordHITLAudit(tool, policy, action, reason, durationMs, payload) {
    const entry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      toolName: tool.name,
      riskLevel: tool.riskLevel,
      policy,
      action,
      reason,
      payload,
      durationMs
    };
    this.hitlSession.auditLog.push(entry);
    this.config.security.hitl.auditCallback?.(entry);
  }
  dispatchHITLError(reqId) {
    window.dispatchEvent(new CustomEvent(AgentBridgeEvent.TOOL_RESULT, {
      detail: {
        jsonrpc: "2.0",
        id: reqId,
        error: { code: AIXAErrorCode.HITL_EXPIRED, message: "HITL approval window expired" }
      },
      bubbles: true
    }));
  }
  // ── Response Helpers ─────────────────────────────────────────────────────
  respondSuccess(id, result) {
    window.dispatchEvent(new CustomEvent(AgentBridgeEvent.TOOL_RESULT, {
      detail: { jsonrpc: "2.0", id, result },
      bubbles: true
    }));
  }
  respondAIXAError(id, code, message, data) {
    window.dispatchEvent(new CustomEvent(AgentBridgeEvent.TOOL_RESULT, {
      detail: {
        jsonrpc: "2.0",
        id,
        error: { code, message, data }
      },
      bubbles: true
    }));
  }
  respondError(id, code, message) {
    window.dispatchEvent(new CustomEvent(AgentBridgeEvent.TOOL_RESULT, {
      detail: { jsonrpc: "2.0", id, error: { code, message } },
      bubbles: true
    }));
  }
  // ── Public Getters ───────────────────────────────────────────────────────
  getTools() {
    return [...this.tools];
  }
  getHITLAuditLog() {
    return [...this.hitlSession.auditLog];
  }
  getRateLimitInfo() {
    return this.globalLimiter.getInfo(this.config.rateLimit.perMinute);
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
function policyLabel(policy) {
  switch (policy) {
    case HITLPolicy.ONCE:
      return "Approve once this session";
    case HITLPolicy.DELEGATED:
      return "Agent can auto-approve";
    case HITLPolicy.CONDITIONAL:
      return "Conditional approval";
    case HITLPolicy.ALWAYS:
    default:
      return "Every invocation requires approval";
  }
}
function policyHint(policy) {
  switch (policy) {
    case HITLPolicy.ONCE:
      return "After you approve, this agent can repeat this action without asking again during this session.";
    case HITLPolicy.DELEGATED:
      return "You have delegated this action to the agent. It will auto-approve.";
    case HITLPolicy.CONDITIONAL:
      return "This action will auto-approve only if certain conditions are met.";
    case HITLPolicy.ALWAYS:
    default:
      return "This action requires explicit human approval every time it is invoked.";
  }
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
    .${prefix}-hitl-policy{padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600}
    .${prefix}-hitl-policy.once{background:#dbeafe;color:#1d4ed8}
    .${prefix}-hitl-policy.always{background:#fef3c7;color:#92400e}
    .${prefix}-hitl-policy.delegated{background:#dcfce7;color:#166534}
    .${prefix}-hitl-policy-hint{font-size:12px;color:#9ca3af;margin:4px 0 0;font-style:italic}
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
        const policy = request.policy || HITLPolicy.ALWAYS;
        const policyClass = policy;
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
              <div class="${prefix}-hitl-detail">
                <strong>Risk:</strong><span class="${prefix}-hitl-risk high_risk">HIGH RISK</span>
              </div>
              <div class="${prefix}-hitl-detail">
                <strong>Policy:</strong>
                <span class="${prefix}-hitl-policy ${policyClass}">${escapeHTML(policyLabel(policy))}</span>
              </div>
              <p class="${prefix}-hitl-policy-hint">${policyHint(policy)}</p>
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
        console.error("[@aixa/security] HITL error:", err);
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
      metadata: { registered: true, timestamp: Date.now() },
      hitlPolicy: options.hitlPolicy,
      hitlCondition: options.hitlCondition,
      requires: options.requires,
      conflicts: options.conflicts,
      ordering: options.ordering,
      workflowId: options.workflowId
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
    category: ActionCategory.SEARCH,
    hitlPolicy: options.hitlPolicy
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
  debug: false,
  inference: {
    enabled: true,
    rootSelector: "body",
    tagAllowlist: []
  },
  security: {
    hitl: {
      enabled: true,
      timeoutMs: 3e4,
      defaultPolicy: "always" /* ALWAYS */
    },
    sanitizePayloads: true
  },
  agents: {
    mode: "open"
  },
  rateLimit: {
    enabled: true,
    perMinute: 60,
    scope: "global"
  },
  session: {
    enabled: false,
    storage: "memory",
    ttlMs: 18e5
  },
  ui: {
    mirroring: true,
    cssPrefix: "aixa"
  }
};
var AgentBridgeEvent2 = /* @__PURE__ */ ((AgentBridgeEvent3) => {
  AgentBridgeEvent3["CAPABILITIES_REQUEST"] = "aixa:capabilities:request";
  AgentBridgeEvent3["CAPABILITIES_RESPONSE"] = "aixa:capabilities:response";
  AgentBridgeEvent3["TOOL_INVOKE"] = "aixa:tool:invoke";
  AgentBridgeEvent3["TOOL_RESULT"] = "aixa:tool:result";
  AgentBridgeEvent3["TOOL_CANCEL"] = "aixa:tool:cancel";
  AgentBridgeEvent3["HITL_REQUEST"] = "aixa:hitl:request";
  AgentBridgeEvent3["HITL_RESPONSE"] = "aixa:hitl:response";
  AgentBridgeEvent3["AGENT_INTRODUCE"] = "aixa:agent:introduce";
  AgentBridgeEvent3["AGENT_INTRODUCE_ACK"] = "aixa:agent:introduce:ack";
  AgentBridgeEvent3["TOOL_STREAM_START"] = "aixa:tool:stream:start";
  AgentBridgeEvent3["TOOL_STREAM_CHUNK"] = "aixa:tool:stream:chunk";
  AgentBridgeEvent3["TOOL_STREAM_END"] = "aixa:tool:stream:end";
  return AgentBridgeEvent3;
})(AgentBridgeEvent2 || {});

export { AIXA, ActionCategory2 as ActionCategory, AgentBridgeEvent2 as AgentBridgeEvent, DEFAULT_CONFIG2 as DEFAULT_CONFIG, HITLAction2 as HITLAction, RiskLevel3 as RiskLevel, VERTICAL_TEMPLATES, clearRegistry, createHITLManager, ecommercePlugin, executeTool, getRegisteredTools, inferTools, mirrorElementValue, registerAction, registerSearch, registerTool, sanitizePayload, unregisterTool };

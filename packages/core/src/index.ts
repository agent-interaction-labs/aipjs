import type {
  AIXAConfig, AgentCapability, ToolSchema, JSONRPCRequest, JSONRPCResponse,
  AgentIdentity, HITLAuditEntry, RateLimitInfo,
} from '@aixa/types';
import {
  DEFAULT_CONFIG, RiskLevel, AgentBridgeEvent, HITLPolicy, HITLAction,
  AIXAErrorCode, AIXA_PROTOCOL_VERSION,
} from '@aixa/types';
import { inferTools, type InferenceResult } from './inference.js';
import {
  registerTool, registerSearch, registerAction, unregisterTool, clearRegistry,
  getRegisteredTools, executeTool, hasRegisteredTool, getToolDependencies,
} from './registry.js';
import {
  initMirroring, onToolStart, onToolComplete, watchNavigation, mirrorElementValue,
} from './mirror.js';

export {
  registerTool, registerSearch, registerAction, unregisterTool, clearRegistry,
  getRegisteredTools, executeTool, mirrorElementValue, inferTools,
  type InferenceResult,
};

// ============================================================================
// Resolved Tiered Config (flattened for internal use)
// ============================================================================

interface ResolvedConfig {
  debug: boolean;
  inference: { enabled: boolean; rootSelector: string; tagAllowlist: string[] };
  security: {
    hitl: {
      enabled: boolean;
      timeoutMs: number;
      defaultPolicy: HITLPolicy;
      auditCallback?: (entry: HITLAuditEntry) => void;
    };
    sanitizePayloads: boolean;
  };
  agents: {
    mode: 'open' | 'filtered';
    allowlist?: AgentIdentity[];
    blocklist?: string[];
    onIntroduce?: (identity: AgentIdentity) => boolean | Promise<boolean>;
  };
  rateLimit: { enabled: boolean; perMinute: number; scope: 'global' | 'per-tool' };
  session: { enabled: boolean; storage: 'memory' | 'localStorage'; ttlMs: number };
  ui: { mirroring: boolean; cssPrefix: string };
}

function resolveConfig(partial: Partial<AIXAConfig>): ResolvedConfig {
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
      enabled: inf.enabled ?? d.inference!.enabled!,
      rootSelector: inf.rootSelector ?? d.inference!.rootSelector!,
      tagAllowlist: inf.tagAllowlist ?? d.inference!.tagAllowlist!,
    },
    security: {
      hitl: {
        enabled: secHitl.enabled ?? d.security!.hitl!.enabled!,
        timeoutMs: secHitl.timeoutMs ?? d.security!.hitl!.timeoutMs!,
        defaultPolicy: secHitl.defaultPolicy ?? d.security!.hitl!.defaultPolicy!,
        auditCallback: secHitl.auditCallback ?? d.security!.hitl!.auditCallback,
      },
      sanitizePayloads: sec.sanitizePayloads ?? d.security!.sanitizePayloads!,
    },
    agents: {
      mode: ag.mode ?? d.agents!.mode!,
      allowlist: ag.allowlist ?? d.agents!.allowlist,
      blocklist: ag.blocklist ?? d.agents!.blocklist,
      onIntroduce: ag.onIntroduce ?? d.agents!.onIntroduce,
    },
    rateLimit: {
      enabled: rl.enabled ?? d.rateLimit!.enabled!,
      perMinute: rl.perMinute ?? d.rateLimit!.perMinute!,
      scope: rl.scope ?? d.rateLimit!.scope!,
    },
    session: {
      enabled: ssn.enabled ?? d.session!.enabled!,
      storage: ssn.storage ?? d.session!.storage!,
      ttlMs: ssn.ttlMs ?? d.session!.ttlMs!,
    },
    ui: {
      mirroring: u.mirroring ?? d.ui!.mirroring!,
      cssPrefix: u.cssPrefix ?? d.ui!.cssPrefix!,
    },
  };
}

// ============================================================================
// Rate Limiter
// ============================================================================

class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private refillRate: number; // tokens per ms

  constructor(tokensPerMinute: number) {
    this.tokens = tokensPerMinute;
    this.lastRefill = Date.now();
    this.refillRate = tokensPerMinute / 60000;
  }

  tryConsume(count = 1): { allowed: boolean; retryAfterMs: number } {
    this.refill();
    // For per-tool rate limiting, always allow 1 call — token per tool per window
    this.tokens -= count;
    if (this.tokens < 0) {
      const msUntilRefill = Math.ceil(Math.abs(this.tokens) / this.refillRate);
      return { allowed: false, retryAfterMs: msUntilRefill };
    }
    return { allowed: true, retryAfterMs: 0 };
  }

  getInfo(total: number): RateLimitInfo {
    this.refill();
    return {
      limit: total,
      remaining: Math.max(0, Math.floor(this.tokens)),
      reset: this.lastRefill + 60000,
      windowMs: 60000,
      scope: 'global',
    };
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.tokens + elapsed * this.refillRate, this.refillRate * 60000);
    this.lastRefill = now;
  }
}

// ============================================================================
// HITL Session Approvals
// ============================================================================

interface HITLSessionState {
  approvedTools: Set<string>;       // ONCE policy: approved tool names
  auditLog: HITLAuditEntry[];
}

// ============================================================================
// AIXA Main Class
// ============================================================================

export class AIXA {
  readonly config: ResolvedConfig;
  private tools: ToolSchema[] = [];
  private started = false;
  private cleanupFns: Array<() => void> = [];
  private globalLimiter: TokenBucket;
  private perToolLimiters = new Map<string, TokenBucket>();
  private hitlSession: HITLSessionState = { approvedTools: new Set(), auditLog: [] };
  private toolExecutions = new Map<string, AbortController>();

  constructor(config: Partial<AIXAConfig> = {}) {
    this.config = resolveConfig(config);
    this.globalLimiter = new TokenBucket(this.config.rateLimit.perMinute);
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  start(): void {
    if (this.started) return;
    this.started = true;

    initMirroring({ cssPrefix: this.config.ui.cssPrefix, enabled: this.config.ui.mirroring });
    this.refreshTools();

    // Core event listeners
    window.addEventListener(AgentBridgeEvent.CAPABILITIES_REQUEST, this.handleCapReq as EventListener);
    window.addEventListener(AgentBridgeEvent.TOOL_INVOKE, this.handleToolInvoke as EventListener);
    window.addEventListener(AgentBridgeEvent.TOOL_CANCEL, this.handleToolCancel as EventListener);

    // Agent identity
    window.addEventListener(AgentBridgeEvent.AGENT_INTRODUCE, this.handleAgentIntroduce as EventListener);

    // Auto-inference navigation watcher
    if (this.config.inference.enabled) {
      this.cleanupFns.push(watchNavigation(() => this.refreshTools()));
    }

    this.broadcastCapabilities();

    if (this.config.debug) {
      console.log(`[aixa.js] Started — ${this.tools.length} tools, protocol v${AIXA_PROTOCOL_VERSION}`);
    }
  }

  stop(): void {
    this.started = false;
    window.removeEventListener(AgentBridgeEvent.CAPABILITIES_REQUEST, this.handleCapReq as EventListener);
    window.removeEventListener(AgentBridgeEvent.TOOL_INVOKE, this.handleToolInvoke as EventListener);
    window.removeEventListener(AgentBridgeEvent.TOOL_CANCEL, this.handleToolCancel as EventListener);
    window.removeEventListener(AgentBridgeEvent.AGENT_INTRODUCE, this.handleAgentIntroduce as EventListener);
    for (const fn of this.cleanupFns) fn();
    this.cleanupFns = [];
    // Cancel all in-flight tool executions
    for (const [name, ctrl] of this.toolExecutions) { ctrl.abort(); }
    this.toolExecutions.clear();
  }

  // ── Tool Management ──────────────────────────────────────────────────────

  refreshTools(): void {
    const tools: ToolSchema[] = [];
    // Developer-registered tools always take priority
    tools.push(...getRegisteredTools());
    // Auto-inference
    if (this.config.inference.enabled) {
      const inferred = inferTools({
        rootSelector: this.config.inference.rootSelector,
        tagAllowlist: this.config.inference.tagAllowlist,
      });
      const names = new Set(tools.map(t => t.name));
      for (const t of inferred.tools) {
        if (!names.has(t.name)) tools.push(t);
      }
    }
    this.tools = tools;
  }

  // ── Capabilities ─────────────────────────────────────────────────────────

  getCapabilities(): AgentCapability {
    return {
      tools: this.tools,
      page: {
        title: document.title,
        url: window.location.href,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || undefined,
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
          agentAuth: false, // spec-defined, no enforcement yet — agents don't identify themselves
          multiPage: this.config.session.enabled,
        },
        limits: {
          maxToolsPerPage: 500,
          maxParamsPerTool: 20,
          maxParamDepth: 3,
          hitlTimeoutMs: this.config.security.hitl.timeoutMs,
          rateLimitPerMinute: this.config.rateLimit.perMinute,
          rateLimitWindowMs: 60000,
        },
      },
    };
  }

  broadcastCapabilities(): void {
    const caps = this.getCapabilities();
    window.dispatchEvent(new CustomEvent(AgentBridgeEvent.CAPABILITIES_RESPONSE, {
      detail: caps, bubbles: true,
    }));
  }

  // ── Agent Identity ───────────────────────────────────────────────────────

  private handleAgentIntroduce = (event: Event): void => {
    const identity = (event as CustomEvent).detail as AgentIdentity;
    if (!identity?.id) return;

    let accepted = true;
    let reason: string | undefined;

    if (this.config.agents.mode === 'filtered') {
      // Check blocklist first
      if (this.config.agents.blocklist?.includes(identity.id)) {
        accepted = false;
        reason = `Agent ${identity.name} is blocked`;
      }
      // Check allowlist
      else if (this.config.agents.allowlist?.length) {
        accepted = this.config.agents.allowlist.some(a =>
          (!a.vendor || a.vendor === identity.vendor) &&
          (!a.name || a.name === identity.name)
        );
        if (!accepted) reason = `Agent ${identity.name} (${identity.vendor}) not in allowlist`;
      }
    }

    // Custom callback
    if (accepted && this.config.agents.onIntroduce) {
      const result = this.config.agents.onIntroduce(identity);
      if (result instanceof Promise) {
        result.then(r => {
          if (!r) this.sendAgentAck(identity.id, false, 'Rejected by site policy');
          else this.sendAgentAck(identity.id, true);
        });
        return;
      }
      accepted = result;
    }

    this.sendAgentAck(identity.id, accepted, reason);
  };

  private sendAgentAck(agentId: string, accepted: boolean, reason?: string): void {
    window.dispatchEvent(new CustomEvent(AgentBridgeEvent.AGENT_INTRODUCE_ACK, {
      detail: { agentId, accepted, reason, timestamp: Date.now() }, bubbles: true,
    }));
  }

  // ── Tool Execution ───────────────────────────────────────────────────────

  private handleCapReq = (): void => { this.broadcastCapabilities(); };

  private handleToolCancel = (event: Event): void => {
    const detail = (event as CustomEvent).detail as { toolName: string };
    if (!detail?.toolName) return;
    const ctrl = this.toolExecutions.get(detail.toolName);
    if (ctrl) {
      ctrl.abort();
      this.toolExecutions.delete(detail.toolName);
    }
  };

  private handleToolInvoke = async (event: Event): Promise<void> => {
    const detail = (event as CustomEvent).detail as JSONRPCRequest;
    if (!detail?.method) return;

    const tool = this.tools.find(t => t.name === detail.method);
    if (!tool) {
      this.respondAIXAError(detail.id, AIXAErrorCode.TOOL_NOT_FOUND, `Tool not found: ${detail.method}`, { toolName: detail.method });
      return;
    }

    const params = (detail.params || {}) as Record<string, unknown>;

    // ── Rate limiting ────────────────────────────────────────────────────
    if (this.config.rateLimit.enabled) {
      if (this.config.rateLimit.scope === 'per-tool') {
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
          this.respondAIXAError(detail.id, AIXAErrorCode.RATE_LIMITED_GLOBAL, 'Global rate limit reached', { retryAfterMs: check.retryAfterMs });
          return;
        }
      }
    }

    // ── Dependency check ─────────────────────────────────────────────────
    if (tool.requires?.length) {
      for (const dep of tool.requires) {
        if (!hasRegisteredTool(dep) && !this.tools.find(t => t.name === dep)) {
          this.respondAIXAError(detail.id, AIXAErrorCode.TOOL_DEPENDENCY_FAIL, `Tool "${tool.name}" requires "${dep}" to be called first`, { toolName: tool.name, requiredTools: tool.requires });
          return;
        }
      }
    }

    // ── HITL check ───────────────────────────────────────────────────────
    const shouldHITL = this.shouldRequestHITL(tool);
    if (shouldHITL) {
      const approved = await this.requestHITL(tool, params);
      if (!approved) {
        return; // requestHITL already dispatched the error response
      }
    }

    // ── Execute ──────────────────────────────────────────────────────────
    if (this.config.ui.mirroring) onToolStart(tool.name, tool, params);

    const timeout = detail.timeout ?? this.config.security.hitl.timeoutMs;
    const abortCtrl = new AbortController();
    this.toolExecutions.set(tool.name, abortCtrl);

    const timeoutId = setTimeout(() => {
      abortCtrl.abort();
    }, timeout);

    try {
      // Try auto-inferred DOM handler first, then fall back to developer-registered handler
      const autoHandler = tool.metadata?._handler as
        ((p: Record<string, unknown>, s?: AbortSignal) => Promise<unknown>) | undefined;
      const result = autoHandler
        ? await autoHandler(params, abortCtrl.signal)
        : await executeTool(tool.name, params, abortCtrl.signal);
      clearTimeout(timeoutId);
      this.toolExecutions.delete(tool.name);
      onToolComplete(tool.name);
      this.respondSuccess(detail.id, result);
    } catch (err) {
      clearTimeout(timeoutId);
      this.toolExecutions.delete(tool.name);
      onToolComplete(tool.name);

      if ((err as Error).name === 'AbortError') {
        this.respondAIXAError(detail.id, AIXAErrorCode.TOOL_TIMEOUT, `Tool "${tool.name}" timed out`, { toolName: tool.name });
      } else {
        this.respondAIXAError(detail.id, AIXAErrorCode.TOOL_RATE_LIMITED, err instanceof Error ? err.message : 'Execution failed', { toolName: tool.name });
      }
    }
  };

  // ── HITL ─────────────────────────────────────────────────────────────────

  private shouldRequestHITL(tool: ToolSchema): boolean {
    if (!this.config.security.hitl.enabled) return false;
    if (tool.riskLevel !== RiskLevel.HIGH_RISK) return false;

    const policy = tool.hitlPolicy ?? this.config.security.hitl.defaultPolicy;

    switch (policy) {
      case HITLPolicy.DELEGATED:
        return false;
      case HITLPolicy.ONCE:
        return !this.hitlSession.approvedTools.has(tool.name);
      case HITLPolicy.CONDITIONAL:
        // CONDITIONAL is handled inside the modal — always show it for now
        return true;
      case HITLPolicy.ALWAYS:
      default:
        return true;
    }
  }

  private requestHITL(tool: ToolSchema, params: Record<string, unknown>): Promise<boolean> {
    const policy = tool.hitlPolicy ?? this.config.security.hitl.defaultPolicy;

    return new Promise(resolve => {
      const reqId = `hitl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const startTime = Date.now();
      const timeout = setTimeout(() => {
        this.recordHITLAudit(tool, policy, HITLAction.TIMEOUT, undefined, Date.now() - startTime, params);
        resolve(false);
        this.dispatchHITLError(reqId);
      }, this.config.security.hitl.timeoutMs);

      const handler = (e: Event) => {
        const d = (e as CustomEvent).detail;
        if (d?.requestId !== reqId) return;
        clearTimeout(timeout);
        const duration = Date.now() - startTime;
        const action = d.action as HITLAction;

        this.recordHITLAudit(tool, policy, action, d.reason, duration, params);

        if (d.action === 'approve') {
          // Record ONCE approval for this session
          if (policy === HITLPolicy.ONCE) {
            this.hitlSession.approvedTools.add(tool.name);
          }
          resolve(true);
        } else {
          this.respondAIXAError(reqId as unknown as string | number, AIXAErrorCode.HITL_DENIED, `Human denied: ${tool.name}`, { toolName: tool.name });
          resolve(false);
        }
      };

      window.addEventListener(AgentBridgeEvent.HITL_RESPONSE, handler as EventListener, { once: false });

      window.dispatchEvent(new CustomEvent(AgentBridgeEvent.HITL_REQUEST, {
        detail: {
          id: reqId,
          toolName: tool.name,
          riskLevel: tool.riskLevel,
          payload: params,
          description: tool.description,
          timestamp: Date.now(),
          timeout: this.config.security.hitl.timeoutMs,
          policy,
        },
        bubbles: true,
      }));
    });
  }

  private recordHITLAudit(
    tool: ToolSchema, policy: HITLPolicy, action: HITLAction,
    reason: string | undefined, durationMs: number, payload: Record<string, unknown>,
  ): void {
    const entry: HITLAuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      toolName: tool.name,
      riskLevel: tool.riskLevel,
      policy,
      action,
      reason,
      payload,
      durationMs,
    };
    this.hitlSession.auditLog.push(entry);
    this.config.security.hitl.auditCallback?.(entry);
  }

  private dispatchHITLError(reqId: string): void {
    window.dispatchEvent(new CustomEvent(AgentBridgeEvent.TOOL_RESULT, {
      detail: {
        jsonrpc: '2.0',
        id: reqId,
        error: { code: AIXAErrorCode.HITL_EXPIRED, message: 'HITL approval window expired' },
      } as JSONRPCResponse,
      bubbles: true,
    }));
  }

  // ── Response Helpers ─────────────────────────────────────────────────────

  private respondSuccess(id: string | number, result: unknown): void {
    window.dispatchEvent(new CustomEvent(AgentBridgeEvent.TOOL_RESULT, {
      detail: { jsonrpc: '2.0', id, result } as JSONRPCResponse,
      bubbles: true,
    }));
  }

  private respondAIXAError(
    id: string | number, code: AIXAErrorCode, message: string,
    data?: Record<string, unknown>,
  ): void {
    window.dispatchEvent(new CustomEvent(AgentBridgeEvent.TOOL_RESULT, {
      detail: {
        jsonrpc: '2.0',
        id,
        error: { code, message, data },
      } as JSONRPCResponse,
      bubbles: true,
    }));
  }

  private respondError(id: string | number, code: number, message: string): void {
    window.dispatchEvent(new CustomEvent(AgentBridgeEvent.TOOL_RESULT, {
      detail: { jsonrpc: '2.0', id, error: { code, message } } as JSONRPCResponse,
      bubbles: true,
    }));
  }

  // ── Public Getters ───────────────────────────────────────────────────────

  getTools(): ToolSchema[] { return [...this.tools]; }
  getHITLAuditLog(): HITLAuditEntry[] { return [...this.hitlSession.auditLog]; }
  getRateLimitInfo(): RateLimitInfo { return this.globalLimiter.getInfo(this.config.rateLimit.perMinute); }
}

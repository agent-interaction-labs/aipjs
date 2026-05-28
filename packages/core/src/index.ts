import type { AgenticJSConfig, AgentCapability, ToolSchema, JSONRPCRequest, JSONRPCResponse } from '@agentic-js/types';
import { DEFAULT_CONFIG, RiskLevel, AgentBridgeEvent } from '@agentic-js/types';
import { inferTools, type InferenceResult } from './inference.js';
import { registerTool, registerSearch, registerAction, unregisterTool, clearRegistry, getRegisteredTools, executeTool } from './registry.js';
import { initMirroring, onToolStart, onToolComplete, watchNavigation, mirrorElementValue } from './mirror.js';

export { registerTool, registerSearch, registerAction, unregisterTool, clearRegistry, getRegisteredTools, executeTool, mirrorElementValue, inferTools, type InferenceResult };

export class AgenticJS {
  readonly config: Required<AgenticJSConfig>;
  private tools: ToolSchema[] = [];
  private started = false;
  private cleanupFns: Array<() => void> = [];

  constructor(config: Partial<AgenticJSConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as Required<AgenticJSConfig>;
  }

  start(): void {
    if (this.started) return;
    this.started = true;
    initMirroring({ cssPrefix: this.config.cssPrefix, enabled: this.config.uiMirroring });
    this.refreshTools();
    window.addEventListener(AgentBridgeEvent.CAPABILITIES_REQUEST, this.handleCapReq as EventListener);
    window.addEventListener(AgentBridgeEvent.TOOL_INVOKE, this.handleToolInvoke as EventListener);
    if (this.config.autoInfer) this.cleanupFns.push(watchNavigation(() => this.refreshTools()));
    this.broadcastCapabilities();
    if (this.config.debug) console.log(`[agentic-js] Started — ${this.tools.length} tools`);
  }

  stop(): void {
    this.started = false;
    window.removeEventListener(AgentBridgeEvent.CAPABILITIES_REQUEST, this.handleCapReq as EventListener);
    window.removeEventListener(AgentBridgeEvent.TOOL_INVOKE, this.handleToolInvoke as EventListener);
    for (const fn of this.cleanupFns) fn();
    this.cleanupFns = [];
  }

  refreshTools(): void {
    const tools: ToolSchema[] = [];
    if (this.config.developerOverrides) tools.push(...getRegisteredTools());
    if (this.config.autoInfer) {
      const inferred = inferTools({ rootSelector: this.config.inferenceRoot, tagAllowlist: this.config.inferenceTagAllowlist });
      const names = new Set(tools.map(t => t.name));
      for (const t of inferred.tools) { if (!names.has(t.name)) tools.push(t); }
    }
    this.tools = tools;
  }

  getCapabilities(): AgentCapability {
    return {
      tools: this.tools,
      page: {
        title: document.title, url: window.location.href,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || undefined,
      },
      protocolVersion: '0.1.0', allowsMutations: this.config.hitlEnabled, generatedAt: Date.now(),
    };
  }

  broadcastCapabilities(): void {
    const caps = this.getCapabilities();
    window.dispatchEvent(new CustomEvent(AgentBridgeEvent.CAPABILITIES_RESPONSE, { detail: caps, bubbles: true }));
  }

  private handleCapReq = (): void => { this.broadcastCapabilities(); };

  private handleToolInvoke = async (event: Event): Promise<void> => {
    const detail = (event as CustomEvent).detail as JSONRPCRequest;
    if (!detail?.method) return;
    const tool = this.tools.find(t => t.name === detail.method);
    if (!tool) { this.respondError(detail.id, -32601, `Tool not found: ${detail.method}`); return; }
    const params = (detail.params || {}) as Record<string, unknown>;

    if (this.config.hitlEnabled && tool.riskLevel === RiskLevel.HIGH_RISK) {
      const approved = await this.requestHITL(tool, params);
      if (!approved) { this.respondError(detail.id, -32000, 'Human approval required'); return; }
    }

    if (this.config.uiMirroring) onToolStart(tool.name, tool, params);
    try {
      const result = await executeTool(tool.name, params);
      onToolComplete(tool.name);
      this.respondSuccess(detail.id, result);
    } catch (err) {
      onToolComplete(tool.name);
      this.respondError(detail.id, -32000, err instanceof Error ? err.message : 'Execution failed');
    }
  };

  private requestHITL(tool: ToolSchema, params: Record<string, unknown>): Promise<boolean> {
    return new Promise(resolve => {
      const reqId = `hitl-${Date.now()}`;
      const timeout = setTimeout(() => { resolve(false); }, this.config.hitlTimeout);
      const handler = (e: Event) => {
        const d = (e as CustomEvent).detail;
        if (d?.requestId === reqId) { clearTimeout(timeout); resolve(d.action === 'approve'); }
      };
      window.addEventListener(AgentBridgeEvent.HITL_RESPONSE, handler as EventListener, { once: false });
      window.dispatchEvent(new CustomEvent(AgentBridgeEvent.HITL_REQUEST, {
        detail: { id: reqId, toolName: tool.name, riskLevel: tool.riskLevel, payload: params, description: tool.description, timestamp: Date.now(), timeout: this.config.hitlTimeout },
        bubbles: true,
      }));
    });
  }

  private respondSuccess(id: string | number, result: unknown): void {
    window.dispatchEvent(new CustomEvent(AgentBridgeEvent.TOOL_RESULT, { detail: { jsonrpc: '2.0', id, result } as JSONRPCResponse, bubbles: true }));
  }

  private respondError(id: string | number, code: number, message: string): void {
    window.dispatchEvent(new CustomEvent(AgentBridgeEvent.TOOL_RESULT, { detail: { jsonrpc: '2.0', id, error: { code, message } } as JSONRPCResponse, bubbles: true }));
  }
}

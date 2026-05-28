import type { ToolSchema, ToolParameter } from '@agentic-js/types';
import { RiskLevel, ActionCategory } from '@agentic-js/types';

interface RegisteredTool {
  schema: ToolSchema;
  handler?: (params: Record<string, unknown>) => Promise<unknown>;
  endpoint?: string;
  method?: 'GET' | 'POST';
}

const toolRegistry = new Map<string, RegisteredTool>();

export interface RegisterToolOptions {
  name: string; description: string; parameters: ToolParameter[];
  handler?: (params: Record<string, unknown>) => Promise<unknown>;
  endpoint?: string; method?: 'GET' | 'POST';
  riskLevel?: RiskLevel; category?: ActionCategory;
}

export function registerTool(options: RegisterToolOptions): void {
  toolRegistry.set(options.name, {
    schema: {
      name: options.name, description: options.description,
      riskLevel: options.riskLevel || RiskLevel.SAFE,
      category: options.category || ActionCategory.CUSTOM,
      parameters: options.parameters,
      metadata: { registered: true, timestamp: Date.now() },
    },
    handler: options.handler, endpoint: options.endpoint,
    method: options.method || 'GET',
  });
}

export interface RegisterSearchOptions {
  endpoint: string; parameters: ToolParameter[];
  method?: 'GET' | 'POST';
  handler?: (params: Record<string, unknown>) => Promise<unknown>;
}

export function registerSearch(options: RegisterSearchOptions): void {
  registerTool({
    name: 'search', description: 'Search the product/inventory catalog. Returns matching items.',
    parameters: options.parameters,
    endpoint: options.endpoint, method: options.method || 'POST',
    handler: options.handler, riskLevel: RiskLevel.SAFE, category: ActionCategory.SEARCH,
  });
}

export function registerAction(options: {
  name: string; description: string; parameters: ToolParameter[];
  handler: (params: Record<string, unknown>) => Promise<unknown>;
  requiresConfirmation?: boolean;
}): void {
  registerTool({
    ...options,
    riskLevel: options.requiresConfirmation !== false ? RiskLevel.HIGH_RISK : RiskLevel.SAFE,
    category: ActionCategory.MUTATE,
  });
}

export function unregisterTool(name: string): boolean { return toolRegistry.delete(name); }
export function clearRegistry(): void { toolRegistry.clear(); }
export function getRegisteredTools(): ToolSchema[] {
  return Array.from(toolRegistry.values()).map(r => r.schema);
}
export function hasRegisteredTool(name: string): boolean { return toolRegistry.has(name); }

export async function executeTool(name: string, params: Record<string, unknown>): Promise<unknown> {
  const registered = toolRegistry.get(name);
  if (!registered) throw new Error(`Tool "${name}" not registered`);
  if (registered.handler) return registered.handler(params);
  if (registered.endpoint) {
    const method = registered.method || 'GET';
    let url = registered.endpoint;
    if (method === 'GET') {
      const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
      url = `${url}?${qs}`;
    }
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: method !== 'GET' ? JSON.stringify(params) : undefined,
    });
    if (!res.ok) throw new Error(`Tool execution failed: ${res.status}`);
    return res.json();
  }
  throw new Error(`Tool "${name}" has no handler or endpoint`);
}

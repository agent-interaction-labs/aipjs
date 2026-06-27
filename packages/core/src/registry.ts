import type { ToolSchema, ToolParameter, HITLPolicy, HITLCondition } from '@aipjs/types';
import { RiskLevel, ActionCategory } from '@aipjs/types';

interface RegisteredTool {
  schema: ToolSchema;
  handler?: (params: Record<string, unknown>, signal?: AbortSignal) => Promise<unknown>;
  endpoint?: string;
  method?: 'GET' | 'POST';
}

const toolRegistry = new Map<string, RegisteredTool>();

export interface RegisterToolOptions {
  name: string;
  description: string;
  parameters: ToolParameter[];
  handler?: (params: Record<string, unknown>, signal?: AbortSignal) => Promise<unknown>;
  endpoint?: string;
  method?: 'GET' | 'POST';
  riskLevel?: RiskLevel;
  category?: ActionCategory;
  hitlPolicy?: HITLPolicy;
  hitlCondition?: HITLCondition;
  requires?: string[];
  conflicts?: string[];
  ordering?: number;
  workflowId?: string;
}

export function registerTool(options: RegisterToolOptions): void {
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
      workflowId: options.workflowId,
    },
    handler: options.handler,
    endpoint: options.endpoint,
    method: options.method || 'GET',
  });
}

export interface RegisterSearchOptions {
  endpoint: string;
  parameters: ToolParameter[];
  method?: 'GET' | 'POST';
  handler?: (params: Record<string, unknown>, signal?: AbortSignal) => Promise<unknown>;
  hitlPolicy?: HITLPolicy;
}

export function registerSearch(options: RegisterSearchOptions): void {
  registerTool({
    name: 'search',
    description: 'Search the product/inventory catalog. Returns matching items.',
    parameters: options.parameters,
    endpoint: options.endpoint,
    method: options.method || 'POST',
    handler: options.handler,
    riskLevel: RiskLevel.SAFE,
    category: ActionCategory.SEARCH,
    hitlPolicy: options.hitlPolicy,
  });
}

export function registerAction(options: {
  name: string;
  description: string;
  parameters: ToolParameter[];
  handler: (params: Record<string, unknown>, signal?: AbortSignal) => Promise<unknown>;
  requiresConfirmation?: boolean;
  hitlPolicy?: HITLPolicy;
  requires?: string[];
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

export function getToolDependencies(name: string): string[] | undefined {
  return toolRegistry.get(name)?.schema.requires;
}

export async function executeTool(
  name: string, params: Record<string, unknown>, signal?: AbortSignal,
): Promise<unknown> {
  const registered = toolRegistry.get(name);
  if (!registered) throw new Error(`Tool "${name}" not registered`);

  if (registered.handler) {
    // Check abort signal before starting
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    return registered.handler(params, signal);
  }

  if (registered.endpoint) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    const method = registered.method || 'GET';
    let url = registered.endpoint;

    if (method === 'GET') {
      const qs = new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString();
      url = `${url}?${qs}`;
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method !== 'GET' ? JSON.stringify(params) : undefined,
      signal,
    });

    if (!res.ok) throw new Error(`Tool execution failed: ${res.status}`);
    return res.json();
  }

  throw new Error(`Tool "${name}" has no handler or endpoint`);
}

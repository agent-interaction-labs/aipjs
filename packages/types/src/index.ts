// @aipjs/types — AEO SDK type definitions

export interface JSONRPCRequest {
  jsonrpc: '2.0'; id: string | number; method: string;
  params?: Record<string, unknown>;
}
export interface JSONRPCSuccessResponse {
  jsonrpc: '2.0'; id: string | number; result: unknown;
}
export interface JSONRPCErrorResponse {
  jsonrpc: '2.0'; id: string | number; error: { code: number; message: string };
}
export type JSONRPCResponse = JSONRPCSuccessResponse | JSONRPCErrorResponse;

export enum RiskLevel {
  SAFE = 'safe',
  HIGH_RISK = 'high_risk',
}

export enum ActionCategory {
  SEARCH = 'search', FILTER = 'filter', SORT = 'sort',
  FETCH = 'fetch', NAVIGATE = 'navigate', MUTATE = 'mutate', CUSTOM = 'custom',
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  enum?: string[];
}

export interface ToolSchema {
  name: string; description: string; riskLevel: RiskLevel;
  category: ActionCategory; parameters: ToolParameter[];
  sourceElement?: string; metadata?: Record<string, unknown>;
}

export interface SearchQuery {
  q?: string; filters?: SearchFilter[]; sort?: SortCriterion; pagination?: Pagination;
}
export interface SearchFilter {
  field: string; operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: unknown;
}
export interface SortCriterion { field: string; direction: 'asc' | 'desc'; }
export interface Pagination { page: number; pageSize: number; }
export interface SearchResult<T = unknown> {
  items: T[]; total: number; page: number; pageSize: number; totalPages: number;
}

export enum HITLAction { APPROVE = 'approve', DENY = 'deny', TIMEOUT = 'timeout' }
export interface HITLRequest {
  id: string; toolName: string; riskLevel: RiskLevel;
  payload: Record<string, unknown>; description: string;
  timestamp: number; timeout: number;
}
export interface HITLResponse {
  requestId: string; action: HITLAction; reason?: string; timestamp: number;
}

export interface AIPConfig {
  autoInfer: boolean; developerOverrides: boolean; hitlEnabled: boolean;
  hitlTimeout: number; hitlRiskLevels: RiskLevel[]; sanitizePayloads: boolean;
  uiMirroring: boolean; debug: boolean; cssPrefix: string; inferenceRoot: string;
  inferenceTagAllowlist: string[];
}

export const DEFAULT_CONFIG: AIPConfig = {
  autoInfer: true, developerOverrides: true, hitlEnabled: true,
  hitlTimeout: 30000, hitlRiskLevels: [RiskLevel.HIGH_RISK],
  sanitizePayloads: true, uiMirroring: true, debug: false, cssPrefix: 'aipjs',
  inferenceRoot: 'body', inferenceTagAllowlist: [],
};

export interface AgentCapability {
  tools: ToolSchema[];
  page: { title: string; url: string; description?: string; type?: string };
  protocolVersion: string; allowsMutations: boolean; generatedAt: number;
}

export enum AgentBridgeEvent {
  CAPABILITIES_REQUEST = 'aip:capabilities:request',
  CAPABILITIES_RESPONSE = 'aip:capabilities:response',
  TOOL_INVOKE = 'aip:tool:invoke',
  TOOL_RESULT = 'aip:tool:result',
  HITL_REQUEST = 'aip:hitl:request',
  HITL_RESPONSE = 'aip:hitl:response',
}

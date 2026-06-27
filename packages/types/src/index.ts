// @aipjs/types — Agent Interaction Protocol v1.0 type definitions
// ============================================================================
// Protocol version
// ============================================================================

export const AIP_PROTOCOL_VERSION = '1.0.0';

// ============================================================================
// JSON-RPC 2.0 Primitives
// ============================================================================

export interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
  timeout?: number;                 // agent-requested timeout in ms (v1.0)
}

export interface JSONRPCSuccessResponse {
  jsonrpc: '2.0';
  id: string | number;
  result: unknown;
}

export interface JSONRPCErrorResponse {
  jsonrpc: '2.0';
  id: string | number;
  error: { code: number; message: string; data?: unknown };
}

export type JSONRPCResponse = JSONRPCSuccessResponse | JSONRPCErrorResponse;

// ============================================================================
// Risk & Action Classification
// ============================================================================

export enum RiskLevel {
  SAFE = 'safe',
  HIGH_RISK = 'high_risk',
}

export enum ActionCategory {
  SEARCH = 'search',
  FILTER = 'filter',
  SORT = 'sort',
  FETCH = 'fetch',
  NAVIGATE = 'navigate',
  MUTATE = 'mutate',
  CUSTOM = 'custom',
}

// ============================================================================
// HITL Policies (v1.0)
// ============================================================================

export enum HITLPolicy {
  ALWAYS      = 'always',        // every invocation needs approval
  ONCE        = 'once',          // approve once per session, auto-approve thereafter
  DELEGATED   = 'delegated',     // agent can auto-approve (site trusts the agent)
  CONDITIONAL = 'conditional',   // approve only if condition matches
}

export interface HITLCondition {
  field: string;                   // e.g., "payload.total"
  operator: 'lt' | 'gt' | 'lte' | 'gte' | 'eq';
  value: number | string;
}

export enum HITLAction {
  APPROVE = 'approve',
  DENY = 'deny',
  TIMEOUT = 'timeout',
}

export interface HITLRequest {
  id: string;
  toolName: string;
  riskLevel: RiskLevel;
  payload: Record<string, unknown>;
  description: string;
  timestamp: number;
  timeout: number;
  policy?: HITLPolicy;             // the policy being applied (v1.0)
  condition?: HITLCondition;       // for CONDITIONAL policy (v1.0)
}

export interface HITLResponse {
  requestId: string;
  action: HITLAction;
  reason?: string;
  timestamp: number;
}

export interface HITLAuditEntry {
  id: string;
  timestamp: number;
  agentIdentity?: AgentIdentity;
  toolName: string;
  riskLevel: RiskLevel;
  policy: HITLPolicy;
  action: HITLAction;
  reason?: string;
  payload: Record<string, unknown>;
  result?: unknown;
  durationMs: number;              // how long the modal was open
}

// ============================================================================
// Tool Schema (v1.0 — extended)
// ============================================================================

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  enum?: string[];
  // v1.0 additions:
  properties?: ToolParameter[];      // when type = 'object': describe nested fields
  items?: ToolParameter;             // when type = 'array': describe element schema
  default?: unknown;                 // default value
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;                // regex
  };
}

export interface ToolSchema {
  name: string;
  description: string;
  riskLevel: RiskLevel;
  category: ActionCategory;
  parameters: ToolParameter[];
  sourceElement?: string;
  metadata?: Record<string, unknown>;
  // v1.0 additions:
  requires?: string[];              // tools that must be called first
  conflicts?: string[];             // tools that cannot be called after this
  ordering?: number;                // suggested order within a workflow
  workflowId?: string;              // groups tools into a workflow (e.g., "purchase")
  hitlPolicy?: HITLPolicy;          // per-tool HITL override
  hitlCondition?: HITLCondition;    // for CONDITIONAL hitlPolicy
}

// ============================================================================
// Search Primitives
// ============================================================================

export interface SearchQuery {
  q?: string;
  filters?: SearchFilter[];
  sort?: SortCriterion;
  pagination?: Pagination;
}

export interface SearchFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: unknown;
}

export interface SortCriterion {
  field: string;
  direction: 'asc' | 'desc';
}

export interface Pagination {
  page: number;
  pageSize: number;
}

export interface SearchResult<T = unknown> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  streamId?: string;               // if set, more chunks coming via streaming (v1.0)
}

// ============================================================================
// Streaming (v1.0)
// ============================================================================

export interface StreamChunk {
  toolCallId: string;
  sequence: number;
  data: unknown;
  done: boolean;
}

// ============================================================================
// Agent Identity & Policy (v1.0)
// ============================================================================

export interface AgentIdentity {
  id: string;                       // unique agent instance ID
  name: string;                     // human-readable: "Claude", "GPT-4", "Gemini"
  version?: string;                 // agent version
  vendor?: string;                  // "Anthropic", "OpenAI", "Google"
  capabilities?: string[];          // what the agent can do: ["search", "commerce"]
  userAgent?: string;               // browser User-Agent string
  sessionId?: string;               // for multi-turn conversations
}

export interface AgentPolicyConfig {
  mode?: 'open' | 'filtered';       // default: 'open' (accept all)
  allowlist?: AgentIdentity[];      // only meaningful when mode='filtered'
  blocklist?: string[];             // agent IDs to always reject
  onIntroduce?: (identity: AgentIdentity) => boolean | Promise<boolean>;
}

// ============================================================================
// Rate Limiting (v1.0)
// ============================================================================

export interface RateLimitInfo {
  limit: number;                    // max requests in window
  remaining: number;                // requests left in current window
  reset: number;                    // Unix timestamp when window resets
  windowMs: number;                 // window size in ms (default: 60000)
  scope: 'tool' | 'agent' | 'global';
}

export interface RateLimitConfig {
  enabled?: boolean;                // default: true
  perMinute?: number;              // default: 60
  scope?: 'global' | 'per-tool';   // default: 'global'
}

// ============================================================================
// AIP Error Taxonomy (v1.0)
// ============================================================================

export enum AIPErrorCode {
  // Tool errors (-32001 to -32019)
  TOOL_NOT_FOUND        = -32001,
  TOOL_DISABLED         = -32002,
  TOOL_TIMEOUT          = -32003,
  TOOL_RATE_LIMITED     = -32004,
  TOOL_DEPENDENCY_FAIL  = -32005,

  // HITL errors (-32020 to -32029)
  HITL_EXPIRED          = -32020,
  HITL_DENIED           = -32021,
  HITL_REQUIRED         = -32022,
  HITL_UNAVAILABLE      = -32023,

  // Auth errors (-32030 to -32039)
  UNAUTHORIZED_AGENT    = -32030,
  FORBIDDEN_ACTION      = -32031,
  AGENT_NOT_IDENTIFIED  = -32032,

  // Protocol errors (-32040 to -32049)
  UNSUPPORTED_VERSION   = -32040,
  FEATURE_NOT_AVAILABLE = -32041,
  MALFORMED_REQUEST     = -32042,
  VALIDATION_ERROR      = -32043,

  // Rate/limit errors (-32050 to -32059)
  RATE_LIMITED_GLOBAL   = -32050,
  QUOTA_EXCEEDED        = -32051,
}

export interface AIPError {
  code: AIPErrorCode;
  message: string;
  data?: {
    toolName?: string;
    retryAfterMs?: number;
    requiredTools?: string[];
    validationErrors?: {
      param: string;
      reason: string;
      received: unknown;
    }[];
    minVersion?: string;
  };
}

// ============================================================================
// Capabilities & Discovery (v1.0 — extended)
// ============================================================================

export interface AIPCapabilities {
  version: string;                   // protocol version: "1.0.0"
  features: {
    hitl: boolean;
    nestedParams: boolean;
    streaming: boolean;
    rateLimit: boolean;
    agentAuth: boolean;
    multiPage: boolean;
  };
  limits: {
    maxToolsPerPage: number;
    maxParamsPerTool: number;
    maxParamDepth: number;
    hitlTimeoutMs: number;
    rateLimitPerMinute: number;
    rateLimitWindowMs: number;
  };
}

export interface AgentCapability {
  tools: ToolSchema[];
  page: {
    title: string;
    url: string;
    description?: string;
    type?: string;
  };
  protocolVersion: string;
  allowsMutations: boolean;
  generatedAt: number;
  // v1.0 additions:
  capabilities?: AIPCapabilities;
  session?: SessionContext;
  navigationHints?: {
    url: string;
    title: string;
    relationship: 'next' | 'related' | 'checkout' | 'cart';
  }[];
}

// ============================================================================
// Session Context (v1.0)
// ============================================================================

export interface SessionContext {
  sessionId: string;
  origin: string;                   // starting page URL
  pages: string[];                  // pages visited in this session
  state: Record<string, unknown>;   // session-scoped state (cart items, etc.)
  startedAt: number;
  lastActivityAt: number;
}

export interface SessionConfig {
  enabled?: boolean;                // default: false (opt-in)
  storage?: 'memory' | 'localStorage';  // default: 'memory'
  ttlMs?: number;                   // default: 1800000 (30 min)
}

// ============================================================================
// Tiered Configuration (v1.0)
// ============================================================================

export interface InferenceConfig {
  enabled?: boolean;                // default: true
  rootSelector?: string;            // default: 'body'
  tagAllowlist?: string[];          // default: [] (all)
}

export interface HITLConfig {
  enabled?: boolean;                // default: true
  timeoutMs?: number;              // default: 30000
  defaultPolicy?: HITLPolicy;      // default: 'always'
  auditCallback?: (entry: HITLAuditEntry) => void;
}

export interface SecurityConfig {
  hitl?: HITLConfig;
  sanitizePayloads?: boolean;       // default: true
}

export interface UIConfig {
  mirroring?: boolean;              // default: true
  cssPrefix?: string;               // default: 'aipjs'
}

export interface AIPConfig {
  debug?: boolean;

  // ── Feature groups ──
  inference?: InferenceConfig;
  security?: SecurityConfig;
  agents?: AgentPolicyConfig;
  rateLimit?: RateLimitConfig;
  session?: SessionConfig;
  ui?: UIConfig;
}

export const DEFAULT_CONFIG: AIPConfig = {
  debug: false,
  inference: {
    enabled: true,
    rootSelector: 'body',
    tagAllowlist: [],
  },
  security: {
    hitl: {
      enabled: true,
      timeoutMs: 30000,
      defaultPolicy: HITLPolicy.ALWAYS,
    },
    sanitizePayloads: true,
  },
  agents: {
    mode: 'open',
  },
  rateLimit: {
    enabled: true,
    perMinute: 60,
    scope: 'global',
  },
  session: {
    enabled: false,
    storage: 'memory',
    ttlMs: 1800000,
  },
  ui: {
    mirroring: true,
    cssPrefix: 'aipjs',
  },
};

// ============================================================================
// Event Bus
// ============================================================================

export enum AgentBridgeEvent {
  // Discovery
  CAPABILITIES_REQUEST  = 'aip:capabilities:request',
  CAPABILITIES_RESPONSE = 'aip:capabilities:response',

  // Tool execution
  TOOL_INVOKE  = 'aip:tool:invoke',
  TOOL_RESULT  = 'aip:tool:result',
  TOOL_CANCEL  = 'aip:tool:cancel',         // v1.0: agent wants to abort running tool

  // HITL
  HITL_REQUEST  = 'aip:hitl:request',
  HITL_RESPONSE = 'aip:hitl:response',

  // Agent identity (v1.0)
  AGENT_INTRODUCE     = 'aip:agent:introduce',
  AGENT_INTRODUCE_ACK = 'aip:agent:introduce:ack',

  // Streaming (v1.0)
  TOOL_STREAM_START = 'aip:tool:stream:start',
  TOOL_STREAM_CHUNK = 'aip:tool:stream:chunk',
  TOOL_STREAM_END   = 'aip:tool:stream:end',
}

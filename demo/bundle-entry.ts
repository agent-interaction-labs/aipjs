// Bundle entry — re-exports everything for CDN/self-contained usage
export { AIXA, registerTool, registerSearch, registerAction, unregisterTool, clearRegistry, getRegisteredTools, executeTool, mirrorElementValue, inferTools } from '../packages/core/src/index.js';
export { createHITLManager, sanitizePayload } from '../packages/security/src/index.js';
export { ecommercePlugin, VERTICAL_TEMPLATES } from '../packages/plugins/ecommerce/src/index.js';
export type { AIXAConfig, ToolSchema, ToolParameter, AgentCapability, JSONRPCRequest, JSONRPCResponse, SearchQuery, SearchResult } from '../packages/types/src/index.js';
export { RiskLevel, ActionCategory, AgentBridgeEvent, DEFAULT_CONFIG, HITLAction } from '../packages/types/src/index.js';

import { describe, it, expect } from 'vitest';
import {
  RiskLevel, ActionCategory, HITLAction, AgentBridgeEvent, DEFAULT_CONFIG,
  HITLPolicy, AIXAErrorCode, AIXA_PROTOCOL_VERSION,
} from '@aixa/types';

describe('RiskLevel', () => {
  it('defines SAFE and HIGH_RISK levels', () => {
    expect(RiskLevel.SAFE).toBe('safe');
    expect(RiskLevel.HIGH_RISK).toBe('high_risk');
  });
});

describe('ActionCategory', () => {
  it('includes all expected categories', () => {
    expect(ActionCategory.SEARCH).toBe('search');
    expect(ActionCategory.MUTATE).toBe('mutate');
    expect(ActionCategory.CUSTOM).toBe('custom');
  });
});

describe('HITLAction', () => {
  it('defines approval actions', () => {
    expect(HITLAction.APPROVE).toBe('approve');
    expect(HITLAction.DENY).toBe('deny');
    expect(HITLAction.TIMEOUT).toBe('timeout');
  });
});

describe('HITLPolicy', () => {
  it('defines policy levels', () => {
    expect(HITLPolicy.ALWAYS).toBe('always');
    expect(HITLPolicy.ONCE).toBe('once');
    expect(HITLPolicy.DELEGATED).toBe('delegated');
    expect(HITLPolicy.CONDITIONAL).toBe('conditional');
  });
});

describe('AIXAErrorCode', () => {
  it('has distinct error ranges for each category', () => {
    expect(AIXAErrorCode.TOOL_NOT_FOUND).toBe(-32001);
    expect(AIXAErrorCode.HITL_EXPIRED).toBe(-32020);
    expect(AIXAErrorCode.UNAUTHORIZED_AGENT).toBe(-32030);
    expect(AIXAErrorCode.UNSUPPORTED_VERSION).toBe(-32040);
    expect(AIXAErrorCode.RATE_LIMITED_GLOBAL).toBe(-32050);
  });
});

describe('AgentBridgeEvent', () => {
  it('uses aixa namespace', () => {
    expect(AgentBridgeEvent.CAPABILITIES_REQUEST).toContain('aixa:');
    expect(AgentBridgeEvent.TOOL_INVOKE).toContain('aixa:');
    expect(AgentBridgeEvent.HITL_REQUEST).toContain('aixa:');
  });

  it('includes v1.0 events', () => {
    expect(AgentBridgeEvent.AGENT_INTRODUCE).toBe('aixa:agent:introduce');
    expect(AgentBridgeEvent.TOOL_CANCEL).toBe('aixa:tool:cancel');
    expect(AgentBridgeEvent.TOOL_STREAM_START).toBe('aixa:tool:stream:start');
  });
});

describe('AIXA_PROTOCOL_VERSION', () => {
  it('is 1.0.0', () => {
    expect(AIXA_PROTOCOL_VERSION).toBe('1.0.0');
  });
});

describe('DEFAULT_CONFIG', () => {
  it('has safe tiered defaults', () => {
    expect(DEFAULT_CONFIG.inference?.enabled).toBe(true);
    expect(DEFAULT_CONFIG.security?.hitl?.enabled).toBe(true);
    expect(DEFAULT_CONFIG.security?.hitl?.timeoutMs).toBe(30000);
    expect(DEFAULT_CONFIG.security?.hitl?.defaultPolicy).toBe(HITLPolicy.ALWAYS);
    expect(DEFAULT_CONFIG.ui?.cssPrefix).toBe('aixa');
    expect(DEFAULT_CONFIG.agents?.mode).toBe('open');
    expect(DEFAULT_CONFIG.rateLimit?.enabled).toBe(true);
    expect(DEFAULT_CONFIG.rateLimit?.perMinute).toBe(60);
  });
});

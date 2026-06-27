import { describe, it, expect } from 'vitest';
import {
  RiskLevel, ActionCategory, HITLAction, AgentBridgeEvent, DEFAULT_CONFIG,
  HITLPolicy, AIPErrorCode, AIP_PROTOCOL_VERSION,
} from '@aipjs/types';

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

describe('AIPErrorCode', () => {
  it('has distinct error ranges for each category', () => {
    expect(AIPErrorCode.TOOL_NOT_FOUND).toBe(-32001);
    expect(AIPErrorCode.HITL_EXPIRED).toBe(-32020);
    expect(AIPErrorCode.UNAUTHORIZED_AGENT).toBe(-32030);
    expect(AIPErrorCode.UNSUPPORTED_VERSION).toBe(-32040);
    expect(AIPErrorCode.RATE_LIMITED_GLOBAL).toBe(-32050);
  });
});

describe('AgentBridgeEvent', () => {
  it('uses aip namespace', () => {
    expect(AgentBridgeEvent.CAPABILITIES_REQUEST).toContain('aip:');
    expect(AgentBridgeEvent.TOOL_INVOKE).toContain('aip:');
    expect(AgentBridgeEvent.HITL_REQUEST).toContain('aip:');
  });

  it('includes v1.0 events', () => {
    expect(AgentBridgeEvent.AGENT_INTRODUCE).toBe('aip:agent:introduce');
    expect(AgentBridgeEvent.TOOL_CANCEL).toBe('aip:tool:cancel');
    expect(AgentBridgeEvent.TOOL_STREAM_START).toBe('aip:tool:stream:start');
  });
});

describe('AIP_PROTOCOL_VERSION', () => {
  it('is 1.0.0', () => {
    expect(AIP_PROTOCOL_VERSION).toBe('1.0.0');
  });
});

describe('DEFAULT_CONFIG', () => {
  it('has safe tiered defaults', () => {
    expect(DEFAULT_CONFIG.inference?.enabled).toBe(true);
    expect(DEFAULT_CONFIG.security?.hitl?.enabled).toBe(true);
    expect(DEFAULT_CONFIG.security?.hitl?.timeoutMs).toBe(30000);
    expect(DEFAULT_CONFIG.security?.hitl?.defaultPolicy).toBe(HITLPolicy.ALWAYS);
    expect(DEFAULT_CONFIG.ui?.cssPrefix).toBe('aipjs');
    expect(DEFAULT_CONFIG.agents?.mode).toBe('open');
    expect(DEFAULT_CONFIG.rateLimit?.enabled).toBe(true);
    expect(DEFAULT_CONFIG.rateLimit?.perMinute).toBe(60);
  });
});

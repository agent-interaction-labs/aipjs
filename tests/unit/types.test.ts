import { describe, it, expect } from 'vitest';
import { RiskLevel, ActionCategory, HITLAction, AgentBridgeEvent, DEFAULT_CONFIG } from '@agentic-js/types';

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

describe('AgentBridgeEvent', () => {
  it('uses agentic namespace', () => {
    expect(AgentBridgeEvent.CAPABILITIES_REQUEST).toContain('agentic:');
    expect(AgentBridgeEvent.TOOL_INVOKE).toContain('agentic:');
    expect(AgentBridgeEvent.HITL_REQUEST).toContain('agentic:');
  });
});

describe('DEFAULT_CONFIG', () => {
  it('has safe defaults', () => {
    expect(DEFAULT_CONFIG.autoInfer).toBe(true);
    expect(DEFAULT_CONFIG.hitlEnabled).toBe(true);
    expect(DEFAULT_CONFIG.hitlTimeout).toBe(30000);
    expect(DEFAULT_CONFIG.hitlRiskLevels).toContain(RiskLevel.HIGH_RISK);
    expect(DEFAULT_CONFIG.cssPrefix).toBe('agentic-js');
  });
});

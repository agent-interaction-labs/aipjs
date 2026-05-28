import { describe, it, expect, beforeEach } from 'vitest';
import { registerTool, registerSearch, registerAction, getRegisteredTools, executeTool, clearRegistry, unregisterTool } from '@agentic-js/core';
import { RiskLevel, ActionCategory } from '@agentic-js/types';

describe('Tool Registry', () => {
  beforeEach(() => {
    clearRegistry();
  });

  it('registers a simple tool', () => {
    registerTool({
      name: 'test_tool',
      description: 'A test tool',
      parameters: [{ name: 'input', type: 'string', description: 'Input', required: true }],
    });
    const tools = getRegisteredTools();
    expect(tools).toHaveLength(1);
    expect(tools[0]!.name).toBe('test_tool');
  });

  it('registerSearch creates SAFE search tool', () => {
    registerSearch({
      endpoint: '/api/search',
      parameters: [{ name: 'q', type: 'string', description: 'Query', required: true }],
    });
    const tools = getRegisteredTools();
    expect(tools).toHaveLength(1);
    expect(tools[0]!.riskLevel).toBe(RiskLevel.SAFE);
    expect(tools[0]!.category).toBe(ActionCategory.SEARCH);
  });

  it('registerAction creates HIGH_RISK mutation tool', () => {
    registerAction({
      name: 'checkout',
      description: 'Checkout cart',
      parameters: [],
      handler: async () => ({ success: true }),
    });
    const tools = getRegisteredTools();
    expect(tools[0]!.riskLevel).toBe(RiskLevel.HIGH_RISK);
  });

  it('unregisters a tool', () => {
    registerTool({
      name: 'temp',
      description: 'Temporary',
      parameters: [],
    });
    expect(getRegisteredTools()).toHaveLength(1);
    unregisterTool('temp');
    expect(getRegisteredTools()).toHaveLength(0);
  });

  it('executes a tool with custom handler', async () => {
    registerTool({
      name: 'greet',
      description: 'Greet',
      parameters: [{ name: 'name', type: 'string', description: 'Name', required: true }],
      handler: async (params) => `Hello, ${params.name}!`,
    });
    const result = await executeTool('greet', { name: 'World' });
    expect(result).toBe('Hello, World!');
  });

  it('throws on unknown tool', async () => {
    await expect(executeTool('nonexistent', {})).rejects.toThrow('not registered');
  });
});

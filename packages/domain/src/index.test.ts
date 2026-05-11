import { describe, expect, it } from 'vitest';
import {
  createDefaultAgentSpec,
  getStarterMcpServerById,
  getStarterSkillById,
  normalizeAgentSpec,
  starterMcpServers,
  starterSkillCatalog,
  validateAgentSpec
} from './index';

describe('AgentSpec validation', () => {
  it('accepts valid default spec', () => {
    const spec = createDefaultAgentSpec();
    const issues = validateAgentSpec(spec);
    expect(issues).toHaveLength(0);
  });

  it('rejects blank identity fields', () => {
    const spec = createDefaultAgentSpec();
    spec.identity.name = '   ';
    spec.identity.role = '  ';

    const issues = validateAgentSpec(spec);
    expect(issues.map((item) => item.path)).toContain('identity.name');
    expect(issues.map((item) => item.path)).toContain('identity.role');
  });

  it('rejects invalid memory bounds and missing backend', () => {
    const spec = createDefaultAgentSpec();
    spec.memoryPolicy.enabled = true;
    spec.memoryPolicy.backend = 'none';
    spec.memoryPolicy.topK = 0;

    const issues = validateAgentSpec(spec);
    expect(issues.map((item) => item.path)).toContain('memoryPolicy.backend');
    expect(issues.map((item) => item.path)).toContain('memoryPolicy.topK');
  });

  it('rejects remote-only provider in local-only mode', () => {
    const spec = createDefaultAgentSpec();
    spec.executionMode = 'local-only';
    spec.modelPolicy.preferredProvider = 'openai';

    const issues = validateAgentSpec(spec);
    expect(issues.map((item) => item.path)).toContain('modelPolicy.preferredProvider');
  });
});

describe('AgentSpec normalization', () => {
  it('trims and compacts success criteria', () => {
    const spec = createDefaultAgentSpec();
    spec.identity.name = '  ThorX Agent  ';
    spec.objective.successCriteria = ['  One  ', ' ', ' Two'];

    const normalized = normalizeAgentSpec(spec);
    expect(normalized.identity.name).toBe('ThorX Agent');
    expect(normalized.objective.successCriteria).toEqual(['One', 'Two']);
  });
});

describe('starter skill catalog', () => {
  it('exposes a stable starter skill registry', () => {
    expect(starterSkillCatalog).toHaveLength(10);
    expect(getStarterSkillById('summarization')?.name).toBe('Summarization');
  });

  it('rejects unknown skills in agent specs', () => {
    const spec = createDefaultAgentSpec();
    spec.capabilities.skills = ['summarization', 'unknown-skill'];

    const issues = validateAgentSpec(spec);
    expect(issues.map((item) => item.path)).toContain('capabilities.skills');
  });
});

describe('starter MCP catalog', () => {
  it('exposes three starter servers for Phase 3', () => {
    expect(starterMcpServers).toHaveLength(3);
    expect(getStarterMcpServerById('filesystem-bridge')?.permissionProfile).toBe('workspace-write');
  });

  it('rejects unknown MCP servers in agent specs', () => {
    const spec = createDefaultAgentSpec();
    spec.capabilities.mcpServers = ['filesystem-bridge', 'unknown-server'];

    const issues = validateAgentSpec(spec);
    expect(issues.map((item) => item.path)).toContain('capabilities.mcpServers');
  });
});

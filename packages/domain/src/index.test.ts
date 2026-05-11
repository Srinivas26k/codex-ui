import { describe, expect, it } from 'vitest';
import { createDefaultAgentSpec, normalizeAgentSpec, validateAgentSpec } from './index';

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

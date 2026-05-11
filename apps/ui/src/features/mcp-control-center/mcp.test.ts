import { describe, expect, it } from 'vitest';
import { starterMcpServers } from '@thorx/domain';
import { buildMcpServerId, deriveMcpHealthSummary } from './mcp';

describe('MCP helpers', () => {
  it('builds stable MCP server identifiers', () => {
    expect(buildMcpServerId('Docs Search')).toBe('docs-search');
    expect(buildMcpServerId('   ')).toBe('custom-mcp-server');
  });

  it('derives health summaries for local and remote endpoints', () => {
    const local = deriveMcpHealthSummary(starterMcpServers[0].endpoint, starterMcpServers[0].transport);
    const remote = deriveMcpHealthSummary('https://example.com/mcp', 'http');

    expect(local.status).toBe('healthy');
    expect(remote.status).toBe('degraded');
  });
});
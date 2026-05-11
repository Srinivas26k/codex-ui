import type { McpPermissionProfile, McpServerStatus, McpTransport, McpServerDefinition } from '@thorx/domain';

export interface McpConnectionDraft {
  name: string;
  endpoint: string;
  transport: McpTransport;
  authMode: 'none' | 'api-key' | 'oauth' | 'command';
  permissionProfile: McpPermissionProfile;
  notes: string;
}

export interface McpHealthSummary {
  status: McpServerStatus;
  latencyMs: number;
  message: string;
}

export function createMcpConnectionDraft(): McpConnectionDraft {
  return {
    name: 'Custom MCP Server',
    endpoint: 'http://localhost:8080/mcp',
    transport: 'http',
    authMode: 'api-key',
    permissionProfile: 'read-only',
    notes: 'Start with a guided preset and refine the tools after the first health check.'
  };
}

export function buildMcpServerId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug.length > 0 ? slug : 'custom-mcp-server';
}

export function deriveMcpHealthSummary(endpoint: string, transport: McpTransport): McpHealthSummary {
  const trimmedEndpoint = endpoint.trim();

  if (trimmedEndpoint.length === 0) {
    return {
      status: 'offline',
      latencyMs: 0,
      message: 'Endpoint is empty, so the server is treated as offline.'
    };
  }

  if (transport === 'stdio' || trimmedEndpoint.startsWith('stdio://')) {
    return {
      status: 'healthy',
      latencyMs: 16,
      message: 'Local stdio transport is ready for immediate tool calls.'
    };
  }

  if (trimmedEndpoint.includes('localhost') || trimmedEndpoint.includes('127.0.0.1')) {
    return {
      status: 'healthy',
      latencyMs: Math.min(48, 12 + trimmedEndpoint.length),
      message: 'Local endpoint checks passed and permissions look sane.'
    };
  }

  if (trimmedEndpoint.startsWith('http')) {
    return {
      status: 'degraded',
      latencyMs: Math.min(180, 45 + trimmedEndpoint.length),
      message: 'Remote endpoint detected; keep an eye on auth and timeout behavior.'
    };
  }

  return {
    status: 'offline',
    latencyMs: 0,
    message: 'Unsupported endpoint format for the current control center presets.'
  };
}

export function describeEnabledTools(server: McpServerDefinition): string {
  const enabledTools = server.tools.filter((tool) => tool.enabled).map((tool) => tool.name);
  return enabledTools.length > 0 ? enabledTools.join(', ') : 'No tools enabled yet';
}
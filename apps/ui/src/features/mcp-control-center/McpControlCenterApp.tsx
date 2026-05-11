import { useMemo, useState } from 'react';
import { starterMcpServers } from '@thorx/domain';
import type {
  McpAuthMode,
  McpPermissionProfile,
  McpServerDefinition,
  McpTransport
} from '@thorx/domain';
import {
  buildMcpServerId,
  createMcpConnectionDraft,
  describeEnabledTools,
  deriveMcpHealthSummary,
  McpConnectionDraft
} from './mcp';

type LogLevel = 'info' | 'success' | 'warning';

interface ControlCenterLog {
  id: string;
  level: LogLevel;
  message: string;
}

function cloneStarterServers(): McpServerDefinition[] {
  return starterMcpServers.map((server) => ({
    ...server,
    tools: server.tools.map((tool) => ({ ...tool }))
  }));
}

function createLogEntry(level: LogLevel, message: string): ControlCenterLog {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    level,
    message
  };
}

export function McpControlCenterApp() {
  const [servers, setServers] = useState(cloneStarterServers);
  const [selectedServerId, setSelectedServerId] = useState(starterMcpServers[0]?.id ?? '');
  const [draft, setDraft] = useState<McpConnectionDraft>(createMcpConnectionDraft());
  const [toolName, setToolName] = useState('list_tools');
  const [toolInput, setToolInput] = useState('health check');
  const [logs, setLogs] = useState<ControlCenterLog[]>([
    createLogEntry('info', 'Loaded three starter MCP servers for Phase 3 control-center testing.')
  ]);

  const selectedServer = useMemo(
    () => servers.find((server) => server.id === selectedServerId),
    [selectedServerId, servers]
  );

  function appendLog(level: LogLevel, message: string): void {
    setLogs((prev) => [createLogEntry(level, message), ...prev].slice(0, 8));
  }

  function patchServer(serverId: string, patch: Partial<McpServerDefinition>): void {
    setServers((prev) =>
      prev.map((server) => (server.id === serverId ? { ...server, ...patch } : server))
    );
  }

  function patchSelectedServer(patch: Partial<McpServerDefinition>): void {
    if (!selectedServer) {
      return;
    }

    patchServer(selectedServer.id, patch);
  }

  function toggleSelectedTool(toolNameToToggle: string): void {
    if (!selectedServer) {
      return;
    }

    patchServer(selectedServer.id, {
      tools: selectedServer.tools.map((tool) =>
        tool.name === toolNameToToggle ? { ...tool, enabled: !tool.enabled } : tool
      )
    });
  }

  function runDiagnostics(serverId: string): void {
    const server = servers.find((item) => item.id === serverId);
    if (!server) {
      return;
    }

    const health = deriveMcpHealthSummary(server.endpoint, server.transport);
    patchServer(server.id, {
      status: health.status,
      latencyMs: health.latencyMs
    });
    setSelectedServerId(server.id);
    appendLog('success', `${server.name} checked as ${health.status} (${health.latencyMs}ms).`);
  }

  function handleAddServer(): void {
    const draftName = draft.name.trim();
    const draftEndpoint = draft.endpoint.trim();

    if (!draftName || !draftEndpoint) {
      appendLog('warning', 'Add a name and endpoint before creating a new MCP server.');
      return;
    }

    const baseServerId = buildMcpServerId(draftName);
    let serverId = baseServerId;
    let suffix = 2;

    while (servers.some((server) => server.id === serverId)) {
      serverId = `${baseServerId}-${suffix}`;
      suffix += 1;
    }

    const health = deriveMcpHealthSummary(draftEndpoint, draft.transport);

    const newServer: McpServerDefinition = {
      id: serverId,
      name: draftName,
      endpoint: draftEndpoint,
      transport: draft.transport,
      authMode: draft.authMode,
      permissionProfile: draft.permissionProfile,
      status: health.status,
      latencyMs: health.latencyMs,
      notes: draft.notes.trim(),
      tools: [
        { name: 'list_tools', description: 'Enumerate available tools.', enabled: true },
        { name: 'run_probe', description: 'Execute a basic probe against the server.', enabled: true },
        { name: 'export_trace', description: 'Export an invocation trace for review.', enabled: false }
      ]
    };

    setServers((prev) => [...prev, newServer]);
    setSelectedServerId(serverId);
    appendLog('success', `Added ${draftName} and selected it for review.`);
  }

  function handleRunToolTest(): void {
    if (!selectedServer) {
      appendLog('warning', 'Select a server before running a tool test.');
      return;
    }

    const enabled = selectedServer.tools.find((tool) => tool.name === toolName)?.enabled ?? false;
    const resultLevel: LogLevel = enabled ? 'success' : 'warning';
    appendLog(
      resultLevel,
      `${selectedServer.name} -> ${toolName}(${toolInput}) on ${selectedServer.permissionProfile}`
    );
  }

  const healthPreview = selectedServer
    ? deriveMcpHealthSummary(selectedServer.endpoint, selectedServer.transport)
    : undefined;

  return (
    <section className="page">
      <header className="hero">
        <p className="label">PHASE 3 MCP CONTROL CENTER</p>
        <h1>ThorX MCP Control Center</h1>
        <p className="body">
          Seed, inspect, and test MCP servers with permission-aware controls before wiring them into
          agents.
        </p>
      </header>

      <section className="card">
        <div className="mcp-grid">
          <div className="mcp-stack">
            <div className="section-heading">
              <h3>Connection wizard</h3>
              <p>Start from a blank connection or clone a safe local preset.</p>
            </div>

            <div className="form-grid">
              <label>
                Server Name
                <input
                  onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                  value={draft.name}
                />
              </label>
              <label>
                Endpoint
                <input
                  onChange={(event) => setDraft((prev) => ({ ...prev, endpoint: event.target.value }))}
                  value={draft.endpoint}
                />
              </label>
              <label>
                Transport
                <select
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, transport: event.target.value as McpTransport }))
                  }
                  value={draft.transport}
                >
                  <option value="stdio">stdio</option>
                  <option value="http">http</option>
                  <option value="sse">sse</option>
                  <option value="custom">custom</option>
                </select>
              </label>
              <label>
                Auth Mode
                <select
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, authMode: event.target.value as McpAuthMode }))
                  }
                  value={draft.authMode}
                >
                  <option value="none">none</option>
                  <option value="api-key">api-key</option>
                  <option value="oauth">oauth</option>
                  <option value="command">command</option>
                </select>
              </label>
              <label>
                Permission Profile
                <select
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      permissionProfile: event.target.value as McpPermissionProfile
                    }))
                  }
                  value={draft.permissionProfile}
                >
                  <option value="read-only">read-only</option>
                  <option value="workspace-write">workspace-write</option>
                  <option value="danger-full-access">danger-full-access</option>
                </select>
              </label>
              <label>
                Notes
                <textarea
                  onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))}
                  value={draft.notes}
                />
              </label>
            </div>

            <button onClick={handleAddServer} type="button">
              Add MCP Server
            </button>

            <div className="section-heading mcp-section-spacing">
              <h3>Starter catalog</h3>
              <p>Three presets ship with the workspace so you can validate Phase 3 quickly.</p>
            </div>

            <div className="mcp-catalog">
              {servers.map((server) => {
                const selected = server.id === selectedServerId;
                return (
                  <article className={selected ? 'mcp-card selected' : 'mcp-card'} key={server.id}>
                    <div className="mcp-card-header">
                      <div>
                        <p className="mcp-card-meta">
                          {server.transport} / {server.authMode}
                        </p>
                        <h4>{server.name}</h4>
                      </div>
                      <span className={server.status === 'healthy' ? 'mcp-badge healthy' : 'mcp-badge'}>
                        {server.status}
                      </span>
                    </div>
                    <p>{server.notes}</p>
                    <dl className="mcp-details">
                      <div>
                        <dt>Endpoint</dt>
                        <dd>{server.endpoint}</dd>
                      </div>
                      <div>
                        <dt>Latency</dt>
                        <dd>{server.latencyMs} ms</dd>
                      </div>
                      <div>
                        <dt>Tools</dt>
                        <dd>{describeEnabledTools(server)}</dd>
                      </div>
                    </dl>
                    <div className="actions mcp-card-actions">
                      <button onClick={() => setSelectedServerId(server.id)} type="button">
                        Inspect
                      </button>
                      <button onClick={() => runDiagnostics(server.id)} type="button">
                        Run Diagnostics
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mcp-stack">
            <div className="section-heading">
              <h3>Selected server</h3>
              <p>Update the active server, toggle tools, and read the live diagnostics summary.</p>
            </div>

            {selectedServer ? (
              <div className="form-grid">
                <label>
                  Server Name
                  <input
                    onChange={(event) => patchSelectedServer({ name: event.target.value })}
                    value={selectedServer.name}
                  />
                </label>
                <label>
                  Endpoint
                  <input
                    onChange={(event) => patchSelectedServer({ endpoint: event.target.value })}
                    value={selectedServer.endpoint}
                  />
                </label>
                <label>
                  Transport
                  <select
                    onChange={(event) =>
                      patchSelectedServer({ transport: event.target.value as McpTransport })
                    }
                    value={selectedServer.transport}
                  >
                    <option value="stdio">stdio</option>
                    <option value="http">http</option>
                    <option value="sse">sse</option>
                    <option value="custom">custom</option>
                  </select>
                </label>
                <label>
                  Auth Mode
                  <select
                    onChange={(event) =>
                      patchSelectedServer({ authMode: event.target.value as McpAuthMode })
                    }
                    value={selectedServer.authMode}
                  >
                    <option value="none">none</option>
                    <option value="api-key">api-key</option>
                    <option value="oauth">oauth</option>
                    <option value="command">command</option>
                  </select>
                </label>
                <label>
                  Permission Profile
                  <select
                    onChange={(event) =>
                      patchSelectedServer({
                        permissionProfile: event.target.value as McpPermissionProfile
                      })
                    }
                    value={selectedServer.permissionProfile}
                  >
                    <option value="read-only">read-only</option>
                    <option value="workspace-write">workspace-write</option>
                    <option value="danger-full-access">danger-full-access</option>
                  </select>
                </label>
                <label>
                  Notes
                  <textarea
                    onChange={(event) => patchSelectedServer({ notes: event.target.value })}
                    value={selectedServer.notes}
                  />
                </label>

                <div className="checkbox-grid">
                  {selectedServer.tools.map((tool) => (
                    <label key={tool.name}>
                      <input
                        checked={tool.enabled}
                        onChange={() => toggleSelectedTool(tool.name)}
                        type="checkbox"
                      />
                      {tool.name} - {tool.description}
                    </label>
                  ))}
                </div>

                <div className="mcp-summary">
                  <p className="label">Diagnostics preview</p>
                  <p>{healthPreview?.message}</p>
                  <dl className="mcp-details">
                    <div>
                      <dt>Status</dt>
                      <dd>{healthPreview?.status}</dd>
                    </div>
                    <div>
                      <dt>Latency</dt>
                      <dd>{healthPreview?.latencyMs} ms</dd>
                    </div>
                    <div>
                      <dt>Selected tools</dt>
                      <dd>{describeEnabledTools(selectedServer)}</dd>
                    </div>
                  </dl>
                  <button onClick={() => runDiagnostics(selectedServer.id)} type="button">
                    Apply Diagnostics
                  </button>
                </div>
              </div>
            ) : (
              <p className="helper-copy">Select a server from the catalog to inspect it here.</p>
            )}

            <div className="section-heading mcp-section-spacing">
              <h3>Tool test runner</h3>
              <p>Simulate a tool call before wiring the server into an agent or workflow.</p>
            </div>

            <div className="form-grid">
              <label>
                Tool name
                <input onChange={(event) => setToolName(event.target.value)} value={toolName} />
              </label>
              <label>
                Payload
                <textarea onChange={(event) => setToolInput(event.target.value)} value={toolInput} />
              </label>
            </div>

            <button onClick={handleRunToolTest} type="button">
              Run Tool Test
            </button>

            <div className="section-heading mcp-section-spacing">
              <h3>Event log</h3>
              <p>Most recent control-center actions appear first.</p>
            </div>

            <ul className="mcp-log-list">
              {logs.map((entry) => (
                <li className={entry.level} key={entry.id}>
                  {entry.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </section>
  );
}
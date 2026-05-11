import { useState } from 'react';
import { AgentBuilderApp } from '../agent-builder/AgentBuilderApp';
import { McpControlCenterApp } from '../mcp-control-center/McpControlCenterApp';

type WorkspaceTab = 'mcp-control-center' | 'agent-builder';

const workspaceTabs: { id: WorkspaceTab; label: string; description: string }[] = [
  {
    id: 'mcp-control-center',
    label: 'MCP Control Center',
    description: 'Manage server connections, permissions, and tool tests.'
  },
  {
    id: 'agent-builder',
    label: 'Agent Builder',
    description: 'Continue shaping a form-first agent spec and capabilities.'
  }
];

export function ThorxWorkspaceApp() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('mcp-control-center');

  return (
    <main className="workspace-shell">
      <header className="workspace-hero">
        <p className="label">THORX WORKBENCH</p>
        <h1>Phase-driven local AI operations</h1>
        <p className="body">
          Move between the MCP control center and the agent builder without losing the current
          branch context.
        </p>
        <div className="workspace-tabs">
          {workspaceTabs.map((tab) => (
            <button
              aria-pressed={activeTab === tab.id}
              className={activeTab === tab.id ? 'workspace-tab active' : 'workspace-tab'}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <span>{tab.label}</span>
              <small>{tab.description}</small>
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'mcp-control-center' ? <McpControlCenterApp /> : <AgentBuilderApp />}
    </main>
  );
}
export type ExecutionMode = 'local-only' | 'mixed' | 'remote-enabled';

export interface AgentTemplate {
  name: string;
  role: string;
  primaryGoal: string;
  executionMode: ExecutionMode;
}

export function defaultAgentTemplate(): AgentTemplate {
  return {
    name: 'Operations Assistant',
    role: 'Workflow Orchestrator',
    primaryGoal: 'Coordinate local tools and summarize output for non-technical users.',
    executionMode: 'local-only'
  };
}

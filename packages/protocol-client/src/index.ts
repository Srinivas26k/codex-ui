export interface InitializeParams {
  clientInfo: {
    name: string;
    title: string;
    version: string;
  };
}

export interface StartAgentRunParams {
  agentName: string;
  executionMode: 'local-only' | 'mixed' | 'remote-enabled';
  provider: string;
  model: string;
  userPrompt: string;
}

export interface StartAgentRunResult {
  runId: string;
  summary: string;
}

export class AppServerClient {
  async initialize(params: InitializeParams): Promise<string> {
    const { name, version } = params.clientInfo;
    return `initialize prepared for ${name} (${version}).`;
  }

  async startAgentRun(params: StartAgentRunParams): Promise<StartAgentRunResult> {
    const seed = `${params.agentName}:${params.provider}:${params.model}:${Date.now()}`;
    const runId = `thorx-${hashCode(seed).toString(16)}`;

    return {
      runId,
      summary: `Prepared ${params.executionMode} run for ${params.agentName} using ${params.provider}/${params.model}.`
    };
  }
}

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

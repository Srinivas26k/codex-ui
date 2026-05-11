export type ExecutionMode = 'local-only' | 'mixed' | 'remote-enabled';
export type ApprovalMode = 'never' | 'on-request' | 'strict';
export type SandboxMode = 'read-only' | 'workspace-write' | 'danger-full-access';
export type ModelProvider = 'ollama' | 'huggingface' | 'openai' | 'custom';
export type MemoryBackend = 'none' | 'sqlite-vec' | 'qdrant' | 'chroma';

export interface AgentTemplate {
  name: string;
  role: string;
  primaryGoal: string;
  executionMode: ExecutionMode;
}

export interface AgentIdentity {
  name: string;
  role: string;
  domain: string;
}

export interface AgentObjective {
  description: string;
  successCriteria: string[];
  languageTone: string;
}

export interface AgentCapabilities {
  skills: string[];
  mcpServers: string[];
  tools: {
    shell: boolean;
    filesystem: boolean;
    webSearch: boolean;
  };
}

export interface ModelPolicy {
  preferredProvider: ModelProvider;
  preferredModel: string;
  allowRemoteFallback: boolean;
}

export interface SafetyPolicy {
  approvalMode: ApprovalMode;
  sandboxMode: SandboxMode;
}

export interface MemoryPolicy {
  enabled: boolean;
  backend: MemoryBackend;
  topK: number;
}

export interface AgentSpec {
  identity: AgentIdentity;
  objective: AgentObjective;
  capabilities: AgentCapabilities;
  modelPolicy: ModelPolicy;
  safetyPolicy: SafetyPolicy;
  memoryPolicy: MemoryPolicy;
  executionMode: ExecutionMode;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export function defaultAgentTemplate(): AgentTemplate {
  return {
    name: 'Operations Assistant',
    role: 'Workflow Orchestrator',
    primaryGoal: 'Coordinate local tools and summarize output for non-technical users.',
    executionMode: 'local-only'
  };
}

export function createDefaultAgentSpec(): AgentSpec {
  return {
    identity: {
      name: 'Operations Assistant',
      role: 'Workflow Orchestrator',
      domain: 'Operations'
    },
    objective: {
      description: 'Coordinate local tools and summarize output for non-technical users.',
      successCriteria: ['Produces concise summaries', 'Runs fully local-first by default'],
      languageTone: 'clear and friendly'
    },
    capabilities: {
      skills: ['summarization'],
      mcpServers: [],
      tools: {
        shell: false,
        filesystem: true,
        webSearch: false
      }
    },
    modelPolicy: {
      preferredProvider: 'ollama',
      preferredModel: 'qwen2.5-coder:7b',
      allowRemoteFallback: false
    },
    safetyPolicy: {
      approvalMode: 'on-request',
      sandboxMode: 'workspace-write'
    },
    memoryPolicy: {
      enabled: true,
      backend: 'sqlite-vec',
      topK: 5
    },
    executionMode: 'local-only'
  };
}

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

export function normalizeAgentSpec(spec: AgentSpec): AgentSpec {
  return {
    ...spec,
    identity: {
      ...spec.identity,
      name: spec.identity.name.trim(),
      role: spec.identity.role.trim(),
      domain: spec.identity.domain.trim()
    },
    objective: {
      ...spec.objective,
      description: spec.objective.description.trim(),
      successCriteria: spec.objective.successCriteria.map((item) => item.trim()).filter(Boolean),
      languageTone: spec.objective.languageTone.trim()
    },
    modelPolicy: {
      ...spec.modelPolicy,
      preferredModel: spec.modelPolicy.preferredModel.trim()
    }
  };
}

export function validateAgentSpec(input: AgentSpec): ValidationIssue[] {
  const spec = normalizeAgentSpec(input);
  const issues: ValidationIssue[] = [];

  if (isBlank(spec.identity.name)) {
    issues.push({ path: 'identity.name', message: 'Agent name is required.' });
  }
  if (spec.identity.name.length > 72) {
    issues.push({ path: 'identity.name', message: 'Agent name must be 72 characters or less.' });
  }
  if (isBlank(spec.identity.role)) {
    issues.push({ path: 'identity.role', message: 'Agent role is required.' });
  }
  if (isBlank(spec.objective.description)) {
    issues.push({ path: 'objective.description', message: 'Objective is required.' });
  }
  if (spec.objective.successCriteria.length === 0) {
    issues.push({ path: 'objective.successCriteria', message: 'Add at least one success criterion.' });
  }
  if (isBlank(spec.modelPolicy.preferredModel)) {
    issues.push({ path: 'modelPolicy.preferredModel', message: 'Preferred model is required.' });
  }
  if (spec.memoryPolicy.enabled && spec.memoryPolicy.backend === 'none') {
    issues.push({ path: 'memoryPolicy.backend', message: 'Choose a memory backend or disable memory.' });
  }
  if (spec.memoryPolicy.topK < 1 || spec.memoryPolicy.topK > 50) {
    issues.push({ path: 'memoryPolicy.topK', message: 'Memory topK must be between 1 and 50.' });
  }
  if (spec.executionMode === 'local-only' && spec.modelPolicy.preferredProvider === 'openai') {
    issues.push({
      path: 'modelPolicy.preferredProvider',
      message: 'Local-only mode cannot use a remote-only provider as primary.'
    });
  }

  return issues;
}

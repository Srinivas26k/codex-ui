export type ExecutionMode = 'local-only' | 'mixed' | 'remote-enabled';
export type ApprovalMode = 'never' | 'on-request' | 'strict';
export type SandboxMode = 'read-only' | 'workspace-write' | 'danger-full-access';
export type ModelProvider = 'ollama' | 'huggingface' | 'openai' | 'custom';
export type MemoryBackend = 'none' | 'sqlite-vec' | 'qdrant' | 'chroma';

export type SkillCategory =
  | 'research'
  | 'writing'
  | 'review'
  | 'operations'
  | 'automation'
  | 'memory'
  | 'custom';

export interface SkillExecutionContract {
  inputShape: string;
  outputShape: string;
  executionNotes: string;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  interfaceSummary: string;
  executionContract: SkillExecutionContract;
}

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

export const starterSkillCatalog: SkillDefinition[] = [
  {
    id: 'summarization',
    name: 'Summarization',
    description: 'Condense long outputs into concise, decision-ready summaries.',
    category: 'writing',
    interfaceSummary: 'Reads long text and returns a shorter summary with action items.',
    executionContract: {
      inputShape: 'Text, notes, or command output',
      outputShape: 'Short summary with bullets',
      executionNotes: 'Prefer when the user needs a quick handoff or report.'
    }
  },
  {
    id: 'web-research-brief',
    name: 'Web Research Brief',
    description: 'Collect and synthesize public web sources into a short brief.',
    category: 'research',
    interfaceSummary: 'Searches the web and packages findings into an evidence-backed brief.',
    executionContract: {
      inputShape: 'Research topic and constraints',
      outputShape: 'Brief with sources and key findings',
      executionNotes: 'Useful for market, product, and technical landscape checks.'
    }
  },
  {
    id: 'repo-code-review',
    name: 'Repo Code Review',
    description: 'Review repository changes and flag correctness or maintainability risks.',
    category: 'review',
    interfaceSummary: 'Analyzes diffs and returns bugs, regressions, and test gaps.',
    executionContract: {
      inputShape: 'Diff, files, or PR context',
      outputShape: 'Prioritized review findings',
      executionNotes: 'Best for pre-merge review and release safety checks.'
    }
  },
  {
    id: 'customer-email-draft',
    name: 'Customer Email Draft',
    description: 'Draft clear customer-facing emails from structured notes.',
    category: 'writing',
    interfaceSummary: 'Turns support or success notes into a polished message.',
    executionContract: {
      inputShape: 'Issue summary, tone, and key points',
      outputShape: 'Draft email with subject options',
      executionNotes: 'Keep the tone direct, warm, and non-technical.'
    }
  },
  {
    id: 'task-orchestrator',
    name: 'Task Orchestrator',
    description: 'Break goals into sequenced steps with explicit handoffs.',
    category: 'automation',
    interfaceSummary: 'Plans multi-step work and records execution order.',
    executionContract: {
      inputShape: 'Goal, deadline, and constraints',
      outputShape: 'Ordered plan with checkpoints',
      executionNotes: 'Use for phased or recurring work that needs coordination.'
    }
  },
  {
    id: 'memory-grounding',
    name: 'Memory Grounding',
    description: 'Retrieve supporting context from short-term or vector memory.',
    category: 'memory',
    interfaceSummary: 'Fetches relevant prior notes and attaches them to the response.',
    executionContract: {
      inputShape: 'Question or task context',
      outputShape: 'Grounded answer with memory references',
      executionNotes: 'Pairs well with local vector stores and recall-heavy agents.'
    }
  },
  {
    id: 'ticket-triage',
    name: 'Ticket Triage',
    description: 'Classify issues, route work, and propose next actions.',
    category: 'operations',
    interfaceSummary: 'Turns incoming requests into prioritized queues.',
    executionContract: {
      inputShape: 'Ticket text and metadata',
      outputShape: 'Priority, category, and suggested owner',
      executionNotes: 'Use for support desks, intake forms, and operations queues.'
    }
  },
  {
    id: 'file-drop-intake',
    name: 'File Drop Intake',
    description: 'Summarize files or uploaded artifacts and extract useful metadata.',
    category: 'automation',
    interfaceSummary: 'Consumes a file and returns a structured summary.',
    executionContract: {
      inputShape: 'Document, attachment, or export',
      outputShape: 'Summary plus extracted fields',
      executionNotes: 'Ideal for onboarding, reporting, and RAG seed data.'
    }
  },
  {
    id: 'schedule-monitor',
    name: 'Schedule Monitor',
    description: 'Check recurring jobs and report failures or drift.',
    category: 'operations',
    interfaceSummary: 'Observes scheduled tasks and reports status changes.',
    executionContract: {
      inputShape: 'Schedule or recurring workflow definition',
      outputShape: 'Status report with anomalies',
      executionNotes: 'Useful when workflows need oversight and escalation.'
    }
  },
  {
    id: 'custom-template',
    name: 'Custom Template',
    description: 'Start from a blank skill template and define your own contract.',
    category: 'custom',
    interfaceSummary: 'Provides an editable scaffold for new skills.',
    executionContract: {
      inputShape: 'Your custom form or trigger',
      outputShape: 'Custom structured result',
      executionNotes: 'Use when a starter skill does not match the workflow.'
    }
  }
];

export function getStarterSkillById(skillId: string): SkillDefinition | undefined {
  return starterSkillCatalog.find((skill) => skill.id === skillId);
}

export function normalizeSkillIds(skillIds: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const skillId of skillIds) {
    const trimmed = skillId.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    normalized.push(trimmed);
  }

  return normalized;
}

export function toggleSkillId(skillIds: string[], skillId: string): string[] {
  const trimmed = skillId.trim();
  if (!trimmed) {
    return normalizeSkillIds(skillIds);
  }

  if (skillIds.includes(trimmed)) {
    return skillIds.filter((item) => item !== trimmed);
  }

  return normalizeSkillIds([...skillIds, trimmed]);
}

export function listStarterSkillCategories(): SkillCategory[] {
  return ['research', 'writing', 'review', 'operations', 'automation', 'memory', 'custom'];
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
  const allowedSkills = new Set(starterSkillCatalog.map((skill) => skill.id));

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

  for (const skillId of spec.capabilities.skills) {
    if (!allowedSkills.has(skillId)) {
      issues.push({
        path: 'capabilities.skills',
        message: `Unknown skill id: ${skillId}`
      });
    }
  }

  return issues;
}

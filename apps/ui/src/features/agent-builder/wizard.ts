import {
  AgentSpec,
  createDefaultAgentSpec,
  normalizeSkillIds,
  toggleSkillId,
  validateAgentSpec
} from '@thorx/domain';

export type WizardStepId =
  | 'identity'
  | 'objective'
  | 'capabilities'
  | 'model'
  | 'safety'
  | 'memory'
  | 'review';

export const wizardSteps: { id: WizardStepId; label: string }[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'objective', label: 'Objective' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'model', label: 'Model' },
  { id: 'safety', label: 'Safety' },
  { id: 'memory', label: 'Memory' },
  { id: 'review', label: 'Review' }
];

export interface AgentBuilderState {
  currentStep: number;
  spec: AgentSpec;
}

export function createInitialState(): AgentBuilderState {
  return {
    currentStep: 0,
    spec: createDefaultAgentSpec()
  };
}

export function nextStep(state: AgentBuilderState): AgentBuilderState {
  return {
    ...state,
    currentStep: Math.min(state.currentStep + 1, wizardSteps.length - 1)
  };
}

export function prevStep(state: AgentBuilderState): AgentBuilderState {
  return {
    ...state,
    currentStep: Math.max(state.currentStep - 1, 0)
  };
}

export function updateIdentity(
  state: AgentBuilderState,
  values: Partial<AgentSpec['identity']>
): AgentBuilderState {
  return {
    ...state,
    spec: {
      ...state.spec,
      identity: {
        ...state.spec.identity,
        ...values
      }
    }
  };
}

export function updateObjective(
  state: AgentBuilderState,
  values: Partial<AgentSpec['objective']>
): AgentBuilderState {
  return {
    ...state,
    spec: {
      ...state.spec,
      objective: {
        ...state.spec.objective,
        ...values
      }
    }
  };
}

export function updateCapabilities(
  state: AgentBuilderState,
  values: Partial<Omit<AgentSpec['capabilities'], 'tools'>> & {
    tools?: Partial<AgentSpec['capabilities']['tools']>;
  }
): AgentBuilderState {
  const hasSkillsOverride = Object.prototype.hasOwnProperty.call(values, 'skills');
  return {
    ...state,
    spec: {
      ...state.spec,
      capabilities: {
        ...state.spec.capabilities,
        ...values,
        skills: hasSkillsOverride ? normalizeSkillIds(values.skills ?? []) : state.spec.capabilities.skills,
        tools: {
          ...state.spec.capabilities.tools,
          ...(values.tools ?? {})
        }
      }
    }
  };
}

export function toggleCapabilitySkill(
  state: AgentBuilderState,
  skillId: string
): AgentBuilderState {
  return {
    ...state,
    spec: {
      ...state.spec,
      capabilities: {
        ...state.spec.capabilities,
        skills: toggleSkillId(state.spec.capabilities.skills, skillId)
      }
    }
  };
}

export function replaceCapabilitySkills(
  state: AgentBuilderState,
  skillIds: string[]
): AgentBuilderState {
  return updateCapabilities(state, { skills: skillIds });
}

export function updateModel(
  state: AgentBuilderState,
  values: Partial<AgentSpec['modelPolicy']>
): AgentBuilderState {
  return {
    ...state,
    spec: {
      ...state.spec,
      modelPolicy: {
        ...state.spec.modelPolicy,
        ...values
      }
    }
  };
}

export function updateSafety(
  state: AgentBuilderState,
  values: Partial<AgentSpec['safetyPolicy']>
): AgentBuilderState {
  return {
    ...state,
    spec: {
      ...state.spec,
      safetyPolicy: {
        ...state.spec.safetyPolicy,
        ...values
      }
    }
  };
}

export function updateMemory(
  state: AgentBuilderState,
  values: Partial<AgentSpec['memoryPolicy']>
): AgentBuilderState {
  return {
    ...state,
    spec: {
      ...state.spec,
      memoryPolicy: {
        ...state.spec.memoryPolicy,
        ...values
      }
    }
  };
}

export function canSubmit(state: AgentBuilderState): boolean {
  return validateAgentSpec(state.spec).length === 0;
}

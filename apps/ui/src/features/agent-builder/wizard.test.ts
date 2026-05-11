import { describe, expect, it } from 'vitest';
import {
  canSubmit,
  createInitialState,
  nextStep,
  prevStep,
  updateCapabilities,
  updateIdentity,
  updateMemory
} from './wizard';

describe('wizard step movement', () => {
  it('does not move below first step', () => {
    const initial = createInitialState();
    expect(prevStep(initial).currentStep).toBe(0);
  });

  it('moves forward and clamps to the last step', () => {
    let state = createInitialState();
    for (let i = 0; i < 20; i += 1) {
      state = nextStep(state);
    }
    expect(state.currentStep).toBe(6);
  });
});

describe('wizard state updates', () => {
  it('updates nested capability tools safely', () => {
    const state = createInitialState();
    const updated = updateCapabilities(state, { tools: { webSearch: true } });

    expect(updated.spec.capabilities.tools.filesystem).toBe(true);
    expect(updated.spec.capabilities.tools.webSearch).toBe(true);
  });

  it('fails submission with invalid identity', () => {
    const state = updateIdentity(createInitialState(), { name: '   ' });
    expect(canSubmit(state)).toBe(false);
  });

  it('fails submission with invalid memory topK', () => {
    const state = updateMemory(createInitialState(), { topK: 999 });
    expect(canSubmit(state)).toBe(false);
  });
});

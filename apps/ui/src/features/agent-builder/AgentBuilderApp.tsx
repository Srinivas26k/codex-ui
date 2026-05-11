import { useMemo, useState } from 'react';
import { validateAgentSpec } from '@thorx/domain';
import { AppServerClient } from '@thorx/protocol-client';
import {
  canSubmit,
  createInitialState,
  nextStep,
  prevStep,
  updateCapabilities,
  updateIdentity,
  updateMemory,
  updateModel,
  updateObjective,
  updateSafety,
  wizardSteps
} from './wizard';

export function AgentBuilderApp() {
  const [state, setState] = useState(createInitialState());
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const current = wizardSteps[state.currentStep];
  const issues = useMemo(() => validateAgentSpec(state.spec), [state.spec]);

  async function handleSubmit(): Promise<void> {
    const validation = validateAgentSpec(state.spec);
    setErrors(validation.map((item) => `${item.path}: ${item.message}`));
    if (validation.length > 0) {
      setStatus('Please resolve validation issues before running.');
      return;
    }

    const client = new AppServerClient();
    await client.initialize({
      clientInfo: {
        name: 'thorx_ui',
        title: 'ThorX Desktop',
        version: '0.1.0'
      }
    });

    const result = await client.startAgentRun({
      agentName: state.spec.identity.name,
      executionMode: state.spec.executionMode,
      provider: state.spec.modelPolicy.preferredProvider,
      model: state.spec.modelPolicy.preferredModel,
      userPrompt: state.spec.objective.description
    });

    setStatus(`${result.summary} Run ID: ${result.runId}`);
  }

  return (
    <main className="page">
      <header className="hero">
        <p className="label">FORM-FIRST AGENT BUILDER</p>
        <h1>ThorX Agent Initialization</h1>
        <p className="body">
          Build production-ready agents through guided forms with local-first execution defaults.
        </p>
      </header>

      <section className="card">
        <h2>Step {state.currentStep + 1}: {current.label}</h2>
        <div className="step-chips">
          {wizardSteps.map((step, index) => (
            <span className={index === state.currentStep ? 'chip active' : 'chip'} key={step.id}>
              {index + 1}. {step.label}
            </span>
          ))}
        </div>

        {current.id === 'identity' && (
          <div className="form-grid">
            <label>
              Agent Name
              <input
                onChange={(event) => setState((prev) => updateIdentity(prev, { name: event.target.value }))}
                value={state.spec.identity.name}
              />
            </label>
            <label>
              Role
              <input
                onChange={(event) => setState((prev) => updateIdentity(prev, { role: event.target.value }))}
                value={state.spec.identity.role}
              />
            </label>
            <label>
              Domain
              <input
                onChange={(event) => setState((prev) => updateIdentity(prev, { domain: event.target.value }))}
                value={state.spec.identity.domain}
              />
            </label>
          </div>
        )}

        {current.id === 'objective' && (
          <div className="form-grid">
            <label>
              Objective
              <textarea
                onChange={(event) =>
                  setState((prev) => updateObjective(prev, { description: event.target.value }))
                }
                value={state.spec.objective.description}
              />
            </label>
            <label>
              Success Criteria (comma separated)
              <input
                onChange={(event) =>
                  setState((prev) =>
                    updateObjective(prev, {
                      successCriteria: event.target.value
                        .split(',')
                        .map((item) => item.trim())
                    })
                  )
                }
                value={state.spec.objective.successCriteria.join(', ')}
              />
            </label>
          </div>
        )}

        {current.id === 'capabilities' && (
          <div className="form-grid">
            <label>
              Skills (comma separated)
              <input
                onChange={(event) =>
                  setState((prev) =>
                    updateCapabilities(prev, {
                      skills: event.target.value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean)
                    })
                  )
                }
                value={state.spec.capabilities.skills.join(', ')}
              />
            </label>
            <div className="checkbox-grid">
              <label>
                <input
                  checked={state.spec.capabilities.tools.filesystem}
                  onChange={(event) =>
                    setState((prev) =>
                      updateCapabilities(prev, { tools: { filesystem: event.target.checked } })
                    )
                  }
                  type="checkbox"
                />
                Filesystem
              </label>
              <label>
                <input
                  checked={state.spec.capabilities.tools.shell}
                  onChange={(event) =>
                    setState((prev) => updateCapabilities(prev, { tools: { shell: event.target.checked } }))
                  }
                  type="checkbox"
                />
                Shell
              </label>
              <label>
                <input
                  checked={state.spec.capabilities.tools.webSearch}
                  onChange={(event) =>
                    setState((prev) =>
                      updateCapabilities(prev, { tools: { webSearch: event.target.checked } })
                    )
                  }
                  type="checkbox"
                />
                Web Search
              </label>
            </div>
          </div>
        )}

        {current.id === 'model' && (
          <div className="form-grid">
            <label>
              Preferred Provider
              <select
                onChange={(event) =>
                  setState((prev) =>
                    updateModel(prev, {
                      preferredProvider: event.target.value as
                        | 'ollama'
                        | 'huggingface'
                        | 'openai'
                        | 'custom'
                    })
                  )
                }
                value={state.spec.modelPolicy.preferredProvider}
              >
                <option value="ollama">Ollama</option>
                <option value="huggingface">Hugging Face</option>
                <option value="openai">OpenAI</option>
                <option value="custom">Custom</option>
              </select>
            </label>
            <label>
              Preferred Model
              <input
                onChange={(event) =>
                  setState((prev) => updateModel(prev, { preferredModel: event.target.value }))
                }
                value={state.spec.modelPolicy.preferredModel}
              />
            </label>
            <label className="single-row">
              <input
                checked={state.spec.modelPolicy.allowRemoteFallback}
                onChange={(event) =>
                  setState((prev) => updateModel(prev, { allowRemoteFallback: event.target.checked }))
                }
                type="checkbox"
              />
              Allow remote fallback
            </label>
          </div>
        )}

        {current.id === 'safety' && (
          <div className="form-grid">
            <label>
              Approval Mode
              <select
                onChange={(event) =>
                  setState((prev) =>
                    updateSafety(prev, {
                      approvalMode: event.target.value as 'never' | 'on-request' | 'strict'
                    })
                  )
                }
                value={state.spec.safetyPolicy.approvalMode}
              >
                <option value="never">Never ask</option>
                <option value="on-request">Ask when required</option>
                <option value="strict">Strict approvals</option>
              </select>
            </label>
            <label>
              Sandbox Mode
              <select
                onChange={(event) =>
                  setState((prev) =>
                    updateSafety(prev, {
                      sandboxMode: event.target.value as
                        | 'read-only'
                        | 'workspace-write'
                        | 'danger-full-access'
                    })
                  )
                }
                value={state.spec.safetyPolicy.sandboxMode}
              >
                <option value="read-only">Read-only</option>
                <option value="workspace-write">Workspace write</option>
                <option value="danger-full-access">Danger full access</option>
              </select>
            </label>
          </div>
        )}

        {current.id === 'memory' && (
          <div className="form-grid">
            <label className="single-row">
              <input
                checked={state.spec.memoryPolicy.enabled}
                onChange={(event) =>
                  setState((prev) => updateMemory(prev, { enabled: event.target.checked }))
                }
                type="checkbox"
              />
              Enable long-term memory
            </label>
            <label>
              Memory Backend
              <select
                onChange={(event) =>
                  setState((prev) =>
                    updateMemory(prev, {
                      backend: event.target.value as 'none' | 'sqlite-vec' | 'qdrant' | 'chroma'
                    })
                  )
                }
                value={state.spec.memoryPolicy.backend}
              >
                <option value="sqlite-vec">sqlite-vec</option>
                <option value="qdrant">Qdrant</option>
                <option value="chroma">Chroma</option>
                <option value="none">None</option>
              </select>
            </label>
            <label>
              Memory topK
              <input
                max={50}
                min={1}
                onChange={(event) =>
                  setState((prev) =>
                    updateMemory(prev, { topK: Number.parseInt(event.target.value || '0', 10) })
                  )
                }
                type="number"
                value={state.spec.memoryPolicy.topK}
              />
            </label>
          </div>
        )}

        {current.id === 'review' && (
          <div>
            <pre className="code-preview">{JSON.stringify(state.spec, null, 2)}</pre>
            {issues.length > 0 && (
              <ul className="errors">
                {issues.map((issue) => (
                  <li key={`${issue.path}-${issue.message}`}>{issue.path}: {issue.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="actions">
          <button onClick={() => setState((prev) => prevStep(prev))} type="button">
            Back
          </button>
          <button onClick={() => setState((prev) => nextStep(prev))} type="button">
            Next
          </button>
          <button disabled={!canSubmit(state)} onClick={handleSubmit} type="button">
            Run Agent
          </button>
        </div>

        {status && <p className="status">{status}</p>}
        {errors.length > 0 && (
          <ul className="errors">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

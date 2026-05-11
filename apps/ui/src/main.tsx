import { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { defaultAgentTemplate } from '@thorx/domain';
import { AppServerClient } from '@thorx/protocol-client';
import './styles.css';

function App() {
  const template = useMemo(() => defaultAgentTemplate(), []);

  async function probeAppServer(): Promise<void> {
    const client = new AppServerClient();
    const msg = await client.initialize({
      clientInfo: {
        name: 'thorx_ui',
        title: 'ThorX Desktop',
        version: '0.1.0'
      }
    });
    window.alert(msg);
  }

  return (
    <main className="page">
      <header className="hero">
        <p className="label">LOCAL-FIRST CONTROL PLANE</p>
        <h1>ThorX Agent Builder</h1>
        <p className="body">
          Phase 0 shell: warm, approachable UX for non-technical agent creation
          powered by Codex runtime primitives.
        </p>
      </header>

      <section className="card">
        <h2>Agent Template Preview</h2>
        <dl>
          <div>
            <dt>Name</dt>
            <dd>{template.name}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{template.role}</dd>
          </div>
          <div>
            <dt>Primary Goal</dt>
            <dd>{template.primaryGoal}</dd>
          </div>
          <div>
            <dt>Execution</dt>
            <dd>{template.executionMode}</dd>
          </div>
        </dl>
        <button onClick={probeAppServer} type="button">
          Probe App-Server Initialize
        </button>
      </section>

      <section className="card">
        <h2>Phase 0 Deliverables</h2>
        <ul>
          <li>UI shell package created</li>
          <li>Desktop package skeleton created</li>
          <li>Domain + protocol client packages created</li>
          <li>Design system wired for Warm Dark theme baseline</li>
        </ul>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);

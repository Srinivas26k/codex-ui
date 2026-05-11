import { createRoot } from 'react-dom/client';
import { AgentBuilderApp } from './features/agent-builder/AgentBuilderApp';
import './styles.css';

createRoot(document.getElementById('root')!).render(<AgentBuilderApp />);

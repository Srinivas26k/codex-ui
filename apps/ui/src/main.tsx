import { createRoot } from 'react-dom/client';
import { ThorxWorkspaceApp } from './features/workbench/ThorxWorkspaceApp';
import './styles.css';

createRoot(document.getElementById('root')!).render(<ThorxWorkspaceApp />);

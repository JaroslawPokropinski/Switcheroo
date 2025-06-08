import '@ant-design/v5-patch-for-react-19';
import './App.css';

import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

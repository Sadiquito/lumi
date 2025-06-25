
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set explicit background on html element to prevent flash
document.documentElement.style.backgroundColor = 'rgb(15, 23, 42)';
document.documentElement.style.color = 'rgb(248, 250, 252)';

createRoot(document.getElementById("root")!).render(<App />);

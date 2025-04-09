
import React from 'react' // Explicitly import React
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Use React.StrictMode to ensure proper React context
createRoot(document.getElementById("root")!).render(
  <App />
);


import React from 'react'; // Explicitly import React
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found");
} else {
  const root = createRoot(rootElement);
  
  // Render the app within React.StrictMode
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}


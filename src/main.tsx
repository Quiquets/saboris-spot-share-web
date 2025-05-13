
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create root outside of any function to optimize rendering
const rootElement = document.getElementById("root");

// Safety check to prevent errors
if (!rootElement) {
  console.error("Root element not found");
} else {
  const root = createRoot(rootElement);
  
  // Render the app with a small delay to ensure DOM is ready
  // This can help with mobile initialization issues
  setTimeout(() => {
    root.render(<App />);
  }, 0);
}

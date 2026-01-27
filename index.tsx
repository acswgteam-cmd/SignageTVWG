import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="color:red; padding:20px;">FATAL ERROR: Root element not found</div>';
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("React App Mounted Successfully");
} catch (error) {
  console.error("React Mount Error:", error);
  document.body.innerHTML = `<div style="color:red; padding:20px;"><h3>React Crash:</h3><pre>${error}</pre></div>`;
}

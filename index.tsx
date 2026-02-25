
// Forced update to trigger deployment synchronization
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";

// Fuerza a Windows y navegadores web a renderizar banderas en lugar de letras
polyfillCountryFlagEmojis();
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

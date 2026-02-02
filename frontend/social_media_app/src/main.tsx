/**
 * React Application Entry Point
 * 
 * Initializes React application and mounts to DOM.
 * Wraps app with StrictMode for development safety checks.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Mount React app to root DOM element with StrictMode enabled
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

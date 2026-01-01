import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initializeStatusBar } from "./lib/statusBar"
import { initializeAutoSync } from "./lib/autoSync"

// Initialize native status bar styling
initializeStatusBar()
initializeAutoSync()

createRoot(document.getElementById('root')!).render(

  <StrictMode>
    <App />
  </StrictMode>
)

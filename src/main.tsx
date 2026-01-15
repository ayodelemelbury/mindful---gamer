import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initializeStatusBar } from "./lib/statusBar"
import { initializeAutoSync } from "./lib/autoSync"
import { loadCommunityMappings } from "./lib/gamePackageMap"

// Initialize native status bar styling
initializeStatusBar()
initializeAutoSync()

// Load community package mappings in background (non-blocking)
loadCommunityMappings().catch((error) => {
  console.warn("[Main] Failed to load community mappings:", error)
})

createRoot(document.getElementById('root')!).render(

  <StrictMode>
    <App />
  </StrictMode>
)

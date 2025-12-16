import { Download, X } from 'lucide-react'
import { useState } from 'react'
import { usePWAInstall } from '../../hooks/usePWAInstall'

export function InstallPrompt() {
  const { canInstall, install } = usePWAInstall()
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded] = useState(false)

  if (!canInstall || dismissed) return null

  // Collapsed state - small icon button
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="fixed top-4 right-4 md:top-6 md:right-6 z-40 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-primary border border-primary-border flex items-center justify-center hover:opacity-90 transition-opacity"
        aria-label="Install App"
      >
        <Download size={18} />
      </button>
    )
  }

  // Expanded state - card with details
  return (
    <div className="fixed top-4 right-4 md:top-6 md:right-6 w-72 bg-card rounded-xl p-4 shadow-md border border-border z-40">
      <button 
        onClick={() => setDismissed(true)} 
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X size={18} />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Download size={20} className="text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-card-foreground text-sm">Install App</h3>
          <p className="text-xs text-muted-foreground mt-1">Add to your home screen for quick access</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setExpanded(false)}
              className="flex-1 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity border border-border"
            >
              Later
            </button>
            <button
              onClick={install}
              className="flex-1 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity shadow-primary border border-primary-border"
            >
              Install
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

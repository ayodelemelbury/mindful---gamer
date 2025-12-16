import { useState, useEffect, useSyncExternalStore, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Track installed state externally for useSyncExternalStore
let isInstalledState = typeof window !== 'undefined' 
  ? window.matchMedia('(display-mode: standalone)').matches 
  : false
const installedListeners = new Set<() => void>()

function subscribeInstalled(callback: () => void) {
  installedListeners.add(callback)
  
  const handler = () => {
    isInstalledState = true
    installedListeners.forEach(fn => fn())
  }
  
  window.addEventListener('appinstalled', handler)
  return () => {
    installedListeners.delete(callback)
    window.removeEventListener('appinstalled', handler)
  }
}

function getInstalledSnapshot() {
  return isInstalledState
}

function getServerSnapshot() {
  return false
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const isInstalled = useSyncExternalStore(subscribeInstalled, getInstalledSnapshot, getServerSnapshot)

  useEffect(() => {
    if (isInstalled) return

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [isInstalled])

  const install = useCallback(async () => {
    if (!installPrompt) return false
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallPrompt(null)
      isInstalledState = true
      installedListeners.forEach(fn => fn())
    }
    return outcome === 'accepted'
  }, [installPrompt])

  return { canInstall: !!installPrompt && !isInstalled, install, isInstalled }
}

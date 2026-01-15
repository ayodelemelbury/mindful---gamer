import { useState, useEffect, useRef } from 'react'
import { registerSW } from 'virtual:pwa-register'

export function usePWAUpdate() {
  const [needsRefresh, setNeedsRefresh] = useState(false)
  const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null)

  useEffect(() => {
    const updateFn = registerSW({
      onNeedRefresh() {
        setNeedsRefresh(true)
      },
      onOfflineReady() {
        console.log('PWA: App is ready to work offline')
      },
      onRegisteredSW(swUrl: string, registration: ServiceWorkerRegistration | undefined) {
        console.log('PWA: Service worker registered:', swUrl)
        // Check for updates every hour
        if (registration) {
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000)
        }
      },
      onRegisterError(error: Error) {
        console.error('PWA: Service worker registration error:', error)
      }
    })
    
    updateSWRef.current = updateFn
  }, [])

  const updateApp = async () => {
    if (updateSWRef.current) {
      await updateSWRef.current(true)
      setNeedsRefresh(false)
    }
  }

  const dismissUpdate = () => {
    setNeedsRefresh(false)
  }

  return { needsRefresh, updateApp, dismissUpdate }
}


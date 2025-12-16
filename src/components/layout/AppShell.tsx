import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'
import { PageTransition } from './PageTransition'
import { OfflineIndicator } from './OfflineIndicator'
import { InstallPrompt } from './InstallPrompt'
import { UpdatePrompt } from './UpdatePrompt'

export function AppShell() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background font-sans relative">
      {/* Matsu theme watercolor paper texture */}
      <div className="texture" />
      
      <OfflineIndicator />
      
      {/* Desktop sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <main className="pb-20 md:pb-0 md:ml-64 relative z-10">
        <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </div>
      </main>
      
      {/* Mobile bottom nav */}
      <BottomNav />
      
      {/* PWA prompts */}
      <InstallPrompt />
      <UpdatePrompt />
    </div>
  )
}


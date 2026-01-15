import { NavLink } from 'react-router-dom'
import { Home, BarChart3, Users, Settings } from 'lucide-react'
import { ActiveSessionIndicator } from "./ActiveSessionIndicator"
import { useSessionStore } from "../../store/sessionStore"

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/insights', icon: BarChart3, label: 'Insights' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
  const { activeSession } = useSessionStore()

  return (
    <>
      {/* Fixed session indicator at top for mobile - only when session is active */}
      {activeSession.isPlaying && (
        <div className="fixed top-4 left-4 right-4 flex justify-center md:hidden z-30">
          <ActiveSessionIndicator />
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 pb-[env(safe-area-inset-bottom,8px)] md:hidden z-20">
        <div className="flex justify-around max-w-sm mx-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <Icon size={20} />
              <span className="text-xs">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}

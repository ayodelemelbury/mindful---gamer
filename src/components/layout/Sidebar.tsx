import { NavLink } from 'react-router-dom'
import { Home, BarChart3, Users, Settings, Gamepad2 } from 'lucide-react'
import { useBudgetStore } from '../../store/budgetStore'
import { useSessionStore } from "../../store/sessionStore"
import { useAuth } from "../../hooks/useAuth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ActiveSessionIndicator } from "./ActiveSessionIndicator"
import { formatDuration } from "@/lib/formatDuration"

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/insights", icon: BarChart3, label: "Insights" },
  { to: "/community", icon: Users, label: "Community" },
  { to: "/settings", icon: Settings, label: "Settings" },
]

export function Sidebar() {
  const dailyBudget = useBudgetStore((s) => s.dailyBudget)
  const { activeSession } = useSessionStore()
  const { user } = useAuth()
  const percentage = Math.min(
    (dailyBudget.current / dailyBudget.limit) * 100,
    100
  )

  const initials = (user?.displayName || user?.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-card border-r border-border z-20">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-primary">
          <Gamepad2 className="text-primary-foreground" size={22} />
        </div>
        <div>
          <h1 className="font-semibold text-foreground">Mindful Gamer</h1>
          <p className="text-xs text-muted-foreground">Play balanced</p>
        </div>
      </div>

      {/* Active Session Indicator - only show when session is active */}
      {activeSession.isPlaying && (
        <div className="px-4 py-3 border-b border-border">
          <ActiveSessionIndicator />
        </div>
      )}

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary/20 text-primary border border-primary-border"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`
            }
          >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-border">
        <div className="px-4 py-3 bg-secondary rounded-lg border border-border">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-muted-foreground">Today's Progress</p>
            <p className="text-xs font-medium text-foreground">
              {formatDuration(dailyBudget.current)} / {formatDuration(dailyBudget.limit)}
            </p>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                percentage >= 100
                  ? "bg-destructive"
                  : percentage >= 80
                  ? "bg-chart-4"
                  : "bg-primary"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* User profile section */}
      {user && (
        <div className="px-4 py-4 border-t border-border">
          <NavLink
            to="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.displayName || "Gamer"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </NavLink>
        </div>
      )}
    </aside>
  )
}

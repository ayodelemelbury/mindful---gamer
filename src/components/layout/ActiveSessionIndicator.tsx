import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSessionStore } from "../../store/sessionStore"
import { Play } from "lucide-react"

export function ActiveSessionIndicator() {
  const navigate = useNavigate()
  const { activeSession, getElapsedSeconds } = useSessionStore()
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    activeSession.isPlaying ? getElapsedSeconds() : 0
  )

  useEffect(() => {
    if (!activeSession.isPlaying) {
      return
    }

    // Update display every second
    const interval = setInterval(() => {
      setElapsedSeconds(getElapsedSeconds())
    }, 1000)

    return () => clearInterval(interval)
  }, [activeSession.isPlaying, getElapsedSeconds])

  // Format elapsed time as mm:ss
  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!activeSession.isPlaying) {
    return null
  }

  return (
    <button
      onClick={() => navigate("/")}
      className="flex items-center gap-3 px-4 py-2.5 bg-card hover:bg-accent border border-primary/30 rounded-xl shadow-lg transition-all hover:shadow-xl"
      title="Click to return to session"
    >
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
        <Play size={14} className="text-primary fill-primary animate-pulse" />
      </div>
      <div className="flex flex-col items-start">
        <span className="text-sm font-semibold text-foreground">
          {formatElapsedTime(elapsedSeconds)}
        </span>
        <span className="text-xs text-muted-foreground truncate max-w-32">
          {activeSession.selectedGameName}
        </span>
      </div>
    </button>
  )
}

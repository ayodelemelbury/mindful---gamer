/**
 * UntrackedGameBanner Component
 *
 * Shows a notification banner when the user is playing a game
 * that is not in their library (and thus not being tracked).
 * Provides a quick action to add the game to the library.
 */

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { X, Gamepad2, Plus } from "lucide-react"
import type { UntrackedGame } from "@/lib/usageTracking"

interface UntrackedGameBannerProps {
  /** List of untracked games detected */
  untrackedGames: UntrackedGame[]
  /** Callback when user wants to add a game to library */
  onAddGame: (packageName: string, displayName: string) => void
  /** Callback when user dismisses the banner for a game */
  onDismiss?: (packageName: string) => void
}

export function UntrackedGameBanner({
  untrackedGames,
  onAddGame,
  onDismiss,
}: UntrackedGameBannerProps) {
  const [dismissedPackages, setDismissedPackages] = useState<Set<string>>(
    new Set()
  )

  // Find currently playing untracked game that hasn't been dismissed
  const currentlyPlayingUntracked = untrackedGames.find(
    (game) => game.isCurrentlyPlaying && !dismissedPackages.has(game.packageName)
  )

  // If no untracked game, also show recently played untracked games (not dismissed)
  const visibleUntrackedGames = untrackedGames.filter(
    (game) => !dismissedPackages.has(game.packageName)
  )

  const handleDismiss = useCallback(
    (packageName: string) => {
      setDismissedPackages((prev) => new Set(prev).add(packageName))
      onDismiss?.(packageName)
    },
    [onDismiss]
  )

  const handleAddGame = useCallback(
    (packageName: string, displayName: string) => {
      onAddGame(packageName, displayName)
      // Also dismiss after adding
      setDismissedPackages((prev) => new Set(prev).add(packageName))
    },
    [onAddGame]
  )

  // Show nothing if no untracked games
  if (visibleUntrackedGames.length === 0) {
    return null
  }

  // Prioritize currently playing game
  const gameToShow = currentlyPlayingUntracked || visibleUntrackedGames[0]

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 bg-amber-500/20 rounded-full">
          <Gamepad2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">
              {currentlyPlayingUntracked ? (
                <>
                  You're playing{" "}
                  <span className="font-semibold">{gameToShow.displayName}</span>
                </>
              ) : (
                <>
                  <span className="font-semibold">{gameToShow.displayName}</span>{" "}
                  was detected
                </>
              )}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {currentlyPlayingUntracked
              ? "This game isn't being tracked"
              : "This game isn't in your library"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="default"
            className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() =>
              handleAddGame(gameToShow.packageName, gameToShow.displayName)
            }
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => handleDismiss(gameToShow.packageName)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Show count of other untracked games if there are more */}
      {visibleUntrackedGames.length > 1 && (
        <p className="text-xs text-muted-foreground mt-2 ml-11">
          +{visibleUntrackedGames.length - 1} other untracked game
          {visibleUntrackedGames.length > 2 ? "s" : ""} detected
        </p>
      )}
    </div>
  )
}

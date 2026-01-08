/**
 * AddFromDeviceDialog Component
 *
 * Allows users to select games from installed apps on their device.
 * Shows recently used apps and lets users add them as games.
 */

import { useState, useCallback, type ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Gamepad2, Check, Plus } from "lucide-react"
import {
  queryUsageStats,
  getAppDisplayNames,
  getPackageCategories,
  looksLikeGame,
  isNativeAndroid,
} from "@/lib/usageTracking"
import { getGamePackageMap } from "@/lib/gamePackageMap"
import { useSessionStore } from "@/store/sessionStore"
import { useUserStore } from "@/store/userStore"
import { formatDuration } from "@/lib/formatDuration"

interface InstalledApp {
  packageName: string
  displayName: string
  totalTimeMs: number
  isGame: boolean
  isInLibrary: boolean
}

interface AddFromDeviceDialogProps {
  trigger: ReactNode
}

export function AddFromDeviceDialog({ trigger }: AddFromDeviceDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apps, setApps] = useState<InstalledApp[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [addedPackages, setAddedPackages] = useState<Set<string>>(new Set())

  const settings = useUserStore((s) => s.settings)
  const updateSettings = useUserStore((s) => s.updateSettings)
  const games = useSessionStore((s) => s.games)
  const addGame = useSessionStore((s) => s.addGame)

  const loadApps = useCallback(async () => {
    if (!isNativeAndroid()) return

    setIsLoading(true)
    try {
      const now = Date.now()
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000

      // Get usage stats for the last week
      const stats = await queryUsageStats(oneWeekAgo, now)

      // Get display names and categories
      const packageNames = stats.map((s) => s.packageName)
      const displayNames = await getAppDisplayNames(packageNames)
      const packageCategories = await getPackageCategories()
      const packageMap = getGamePackageMap(
        settings?.customPackageMappings || {},
        games
      )

      // Build app list
      const appList: InstalledApp[] = stats
        .filter((stat) => stat.totalTimeInForeground > 60000) // At least 1 minute
        .map((stat) => {
          const displayInfo = displayNames.get(stat.packageName)
          const displayName = displayInfo?.displayName || stat.packageName.split(".").pop() || stat.packageName
          const isCategoryGame = packageCategories.get(stat.packageName) === "game"
          const hasGameLikeName = looksLikeGame(stat.packageName)
          const isInMap = packageMap.has(stat.packageName)
          const isInLibrary = games.some((g) => g.packageName === stat.packageName)

          return {
            packageName: stat.packageName,
            displayName,
            totalTimeMs: stat.totalTimeInForeground,
            isGame: isCategoryGame || hasGameLikeName || isInMap,
            isInLibrary,
          }
        })
        .sort((a, b) => {
          // Sort: games first, then by time
          if (a.isGame !== b.isGame) return a.isGame ? -1 : 1
          return b.totalTimeMs - a.totalTimeMs
        })

      setApps(appList)
    } catch (error) {
      console.error("Failed to load apps:", error)
    } finally {
      setIsLoading(false)
    }
  }, [settings?.customPackageMappings, games])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setAddedPackages(new Set())
      setSearchQuery("")
      loadApps()
    }
  }

  const handleAddGame = (app: InstalledApp) => {
    // Add to custom mappings
    const currentMappings = settings?.customPackageMappings || {}
    updateSettings({
      customPackageMappings: {
        ...currentMappings,
        [app.packageName]: app.displayName,
      },
    })

    // Add to game library
    addGame({
      name: app.displayName,
      packageName: app.packageName,
      category: "Other",
      vibeTags: [],
    })

    // Mark as added
    setAddedPackages((prev) => new Set([...prev, app.packageName]))
  }

  const filteredApps = apps.filter((app) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      app.displayName.toLowerCase().includes(query) ||
      app.packageName.toLowerCase().includes(query)
    )
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Game from Device</DialogTitle>
          <DialogDescription>
            Select apps from your device to add as games for tracking.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* App List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Gamepad2 className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No apps match your search" : "No recent apps found"}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-2 pr-4">
              {filteredApps.map((app) => {
                const isAdded = addedPackages.has(app.packageName) || app.isInLibrary

                return (
                  <div
                    key={app.packageName}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      app.isGame ? "bg-primary/5 border-primary/20" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Gamepad2
                          className={`h-4 w-4 shrink-0 ${
                            app.isGame ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <p className="font-medium text-sm truncate">{app.displayName}</p>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                        {app.packageName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {app.isGame && (
                          <Badge variant="default" className="text-xs">
                            Game
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(Math.round(app.totalTimeMs / 60000))} this week
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={isAdded ? "secondary" : "outline"}
                      className="shrink-0 ml-2"
                      disabled={isAdded}
                      onClick={() => handleAddGame(app)}
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}

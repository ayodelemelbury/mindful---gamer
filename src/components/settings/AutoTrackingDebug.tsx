/**
 * AutoTrackingDebug Component
 *
 * Debug panel for diagnosing auto-tracking issues.
 * Shows diagnostic info about why games might not be appearing.
 */

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Bug,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  Gamepad2,
  Smartphone,
  Plus,
  Ban,
} from "lucide-react"
import {
  getDiagnosticInfo,
  type DiagnosticInfo,
} from "@/lib/usageTracking"
import { useSessionStore } from "@/store/sessionStore"
import { useUserStore } from "@/store/userStore"
import { formatDuration } from "@/lib/formatDuration"

export function AutoTrackingDebug() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null)

  const settings = useUserStore((s) => s.settings)
  const updateSettings = useUserStore((s) => s.updateSettings)
  const games = useSessionStore((s) => s.games)
  const addGame = useSessionStore((s) => s.addGame)

  const runDiagnostics = useCallback(async () => {
    setIsLoading(true)
    try {
      const info = await getDiagnosticInfo(
        settings?.customPackageMappings || {},
        games
      )
      setDiagnostics(info)
    } catch (error) {
      console.error("Diagnostics failed:", error)
    } finally {
      setIsLoading(false)
    }
  }, [settings?.customPackageMappings, games])

  const handleAddAsGame = (packageName: string, displayName: string) => {
    // Add to custom mappings
    const currentMappings = settings?.customPackageMappings || {}
    updateSettings({
      customPackageMappings: {
        ...currentMappings,
        [packageName]: displayName,
      },
    })

    // Add to game library
    addGame({
      name: displayName,
      packageName,
      category: "Other",
      vibeTags: [],
    })

    // Refresh diagnostics
    runDiagnostics()
  }

  const handleIgnoreApp = (packageName: string) => {
    // Add to ignored packages in user settings
    const currentIgnored = settings?.ignoredPackages || []
    if (!currentIgnored.includes(packageName)) {
      updateSettings({
        ignoredPackages: [...currentIgnored, packageName],
      })
    }

    // Also add to localStorage dismissed list (for GameMatchConfirmDialog persistence)
    try {
      const dismissedKey = "mindful-gamer-dismissed-packages"
      const stored = localStorage.getItem(dismissedKey)
      const dismissed = stored ? new Set(JSON.parse(stored)) : new Set()
      dismissed.add(packageName)
      localStorage.setItem(dismissedKey, JSON.stringify([...dismissed]))
    } catch {
      // Ignore localStorage errors
    }

    // Refresh diagnostics
    runDiagnostics()
  }

  return (
    <Card className="border-dashed">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Auto-Tracking Diagnostics</CardTitle>
                  <CardDescription className="text-xs">
                    Debug why games aren't being detected
                  </CardDescription>
                </div>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            <Button
              onClick={runDiagnostics}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Running Diagnostics..." : "Run Diagnostics"}
            </Button>

            {diagnostics && (
              <div className="space-y-4">
                {/* Status Summary */}
                <div className="grid grid-cols-2 gap-2">
                  <StatusItem
                    label="Platform"
                    status={diagnostics.isAndroid ? "success" : "error"}
                    value={diagnostics.isAndroid ? "Android" : "Not Android"}
                  />
                  <StatusItem
                    label="Permission"
                    status={diagnostics.permissionStatus === "granted" ? "success" : "error"}
                    value={diagnostics.permissionStatus}
                  />
                  <StatusItem
                    label="UsageEvents API"
                    status={diagnostics.usageEventsWorking ? "success" : "warning"}
                    value={diagnostics.usageEventsWorking ? "Working" : "No data"}
                  />
                  <StatusItem
                    label="Aggregated Stats"
                    status={diagnostics.aggregatedStatsWorking ? "success" : "warning"}
                    value={diagnostics.aggregatedStatsWorking ? "Working" : "No data"}
                  />
                </div>

                {/* Current Foreground App */}
                {diagnostics.currentForegroundApp && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Current Foreground App</p>
                    <p className="text-sm font-mono">{diagnostics.currentForegroundApp}</p>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Apps used: <strong>{diagnostics.totalAppsUsed}</strong>
                  </span>
                  <span className="text-muted-foreground">
                    Games detected: <strong>{diagnostics.detectedGames}</strong>
                  </span>
                </div>

                {/* Errors */}
                {diagnostics.errors.length > 0 && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <p className="text-xs font-medium text-destructive mb-2">Issues Found:</p>
                    <ul className="text-xs text-destructive/80 space-y-1">
                      {diagnostics.errors.map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recent Apps */}
                {diagnostics.recentApps.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Recent Apps (last hour)</p>
                    <ScrollArea className="h-64">
                      <div className="space-y-2 pr-4">
                        {diagnostics.recentApps.map((app) => (
                          <div
                            key={app.packageName}
                            className={`p-3 rounded-lg border ${
                              app.isGame ? "bg-primary/5 border-primary/20" : "bg-muted/50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {app.isGame ? (
                                    <Gamepad2 className="h-4 w-4 text-primary shrink-0" />
                                  ) : (
                                    <Smartphone className="h-4 w-4 text-muted-foreground shrink-0" />
                                  )}
                                  <p className="font-medium text-sm truncate">
                                    {app.displayName}
                                  </p>
                                </div>
                                <p className="text-xs text-muted-foreground font-mono truncate mt-1">
                                  {app.packageName}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant={app.isGame ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {app.isGame ? "Game" : "App"}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDuration(Math.round(app.totalTimeMs / 60000))}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {app.detectionReason}
                                </p>
                              </div>
                              <div className="flex flex-col gap-1 shrink-0 ml-2">
                                {app.isGame ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => handleIgnoreApp(app.packageName)}
                                  >
                                    <Ban className="h-3 w-3 mr-1" />
                                    Not a Game
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => handleAddAsGame(app.packageName, app.displayName)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add as Game
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

function StatusItem({
  label,
  status,
  value,
}: {
  label: string
  status: "success" | "error" | "warning"
  value: string
}) {
  const Icon = status === "success" ? CheckCircle : status === "error" ? XCircle : AlertTriangle
  const colorClass =
    status === "success"
      ? "text-green-600"
      : status === "error"
      ? "text-destructive"
      : "text-amber-500"

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
      <Icon className={`h-4 w-4 ${colorClass}`} />
      <div className="text-xs">
        <span className="text-muted-foreground">{label}:</span>{" "}
        <span className="font-medium">{value}</span>
      </div>
    </div>
  )
}

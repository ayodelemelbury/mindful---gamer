/**
 * IgnoredAppsManager Component
 *
 * Allows users to view and manage apps that have been marked as "not a game".
 * Users can remove apps from the ignored list to re-enable detection.
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Undo2, Ban, Loader2 } from "lucide-react"
import { useUserStore } from "@/store/userStore"
import { getAppDisplayNames, isNativeAndroid } from "@/lib/usageTracking"

interface IgnoredAppInfo {
  packageName: string
  displayName: string
}

export function IgnoredAppsManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [appInfos, setAppInfos] = useState<IgnoredAppInfo[]>([])

  const settings = useUserStore((s) => s.settings)
  const updateSettings = useUserStore((s) => s.updateSettings)

  const ignoredPackages = settings?.ignoredPackages || []

  // Load display names when opened
  useEffect(() => {
    if (!isOpen || !isNativeAndroid() || ignoredPackages.length === 0) {
      return
    }

    const loadDisplayNames = async () => {
      setIsLoading(true)
      try {
        const displayNames = await getAppDisplayNames(ignoredPackages)
        const infos = ignoredPackages.map((pkg) => ({
          packageName: pkg,
          displayName: displayNames.get(pkg)?.displayName || formatPackageName(pkg),
        }))
        setAppInfos(infos)
      } catch (error) {
        console.error("Failed to load app display names:", error)
        // Fallback to formatted package names
        setAppInfos(
          ignoredPackages.map((pkg) => ({
            packageName: pkg,
            displayName: formatPackageName(pkg),
          }))
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadDisplayNames()
  }, [isOpen, ignoredPackages])

  const handleRemoveFromIgnored = (packageName: string) => {
    const updated = ignoredPackages.filter((pkg) => pkg !== packageName)
    updateSettings({ ignoredPackages: updated })
    setAppInfos((prev) => prev.filter((app) => app.packageName !== packageName))

    // Also remove from localStorage dismissed list
    try {
      const dismissedKey = "mindful-gamer-dismissed-packages"
      const stored = localStorage.getItem(dismissedKey)
      if (stored) {
        const dismissed = new Set(JSON.parse(stored))
        dismissed.delete(packageName)
        localStorage.setItem(dismissedKey, JSON.stringify([...dismissed]))
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  if (!isNativeAndroid()) {
    return null
  }

  if (ignoredPackages.length === 0) {
    return null
  }

  return (
    <Card className="border-dashed">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Ignored Apps</CardTitle>
                  <CardDescription className="text-xs">
                    {ignoredPackages.length} app{ignoredPackages.length !== 1 ? "s" : ""} marked as "not a game"
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
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              These apps won't be detected as games. Remove from this list to re-enable detection.
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="max-h-60">
                <div className="space-y-2">
                  {appInfos.map((app) => (
                    <div
                      key={app.packageName}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{app.displayName}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {app.packageName}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 ml-2"
                        onClick={() => handleRemoveFromIgnored(app.packageName)}
                      >
                        <Undo2 className="h-3 w-3 mr-1" />
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

function formatPackageName(packageName: string): string {
  const parts = packageName.split(".")
  const lastPart = parts[parts.length - 1] || packageName
  return lastPart
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

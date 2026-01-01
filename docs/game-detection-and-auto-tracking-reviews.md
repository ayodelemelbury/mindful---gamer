## Game Detection and Auto-Tracking Reviews

### Antigravity


Android Auto-Tracking Comprehensive Review
Executive Summary
The current auto-tracking implementation in the Mindful Gamer app uses historical usage data from Android's UsageStatsManager API, not real-time tracking. This means the app cannot detect when a user is currently playing a game in real-time—it can only query past usage after the fact.

IMPORTANT

The app does not track games in real-time. It queries historical usage data (aggregated stats) which can have delays of up to 24 hours on some Android versions.

Current Implementation Analysis
How It Works Now
User plays games
Android records usage internally
App queries historical stats
Filter for games
Display detected sessions
Key Components
File	Purpose

usageTracking.ts
Core service - queries UsageStatsManager via Capacitor plugin

gamePackageMap.ts
Maps package names to game names (fallback list)

useUsageTracking.ts
React hook managing state and sync logic

backgroundSync.ts
Background fetch for periodic sync (every 15 min)

AutoTrackingCard.tsx
UI component displaying detected sessions
Plugin Used
The app uses @capgo/capacitor-android-usagestatsmanager which exposes these methods:

queryAndAggregateUsageStats(beginTime, endTime) - Historical aggregated stats
isUsageStatsPermissionGranted() - Permission check
openUsageStatsSettings() - Opens settings for permission grant

queryAllPackages()
 - List all installed packages with category info
Game Detection Methods
The app uses a 3-tier detection strategy:

1. Hardcoded Fallback List (10 games)
// From gamePackageMap.ts
export const DEFAULT_GAME_PACKAGES: Record<string, string> = {
  "com.mojang.minecraftpe": "Minecraft",
  "com.roblox.client": "Roblox",
  "com.supercell.clashofclans": "Clash of Clans",
  "com.supercell.brawlstars": "Brawl Stars",
  "com.king.candycrushsaga": "Candy Crush Saga",
  "com.tencent.ig": "PUBG Mobile",
  "com.miHoYo.GenshinImpact": "Genshin Impact",
  "com.innersloth.spacemafia": "Among Us",
  "com.nianticlabs.pokemongo": "Pokémon GO",
  "com.dts.freefireth": "Free Fire",
}
WARNING

This list only contains 10 games. Any game not in this list AND not flagged as CATEGORY_GAME by Android will be missed unless it matches a pattern.

2. Android CATEGORY_GAME Flag
// From usageTracking.ts (lines 175-179)
for (const pkg of result.packages || []) {
  const pkgWithCategory = pkg as { packageName: string; category?: number }
  if (pkgWithCategory.category === 0) {  // 0 = CATEGORY_GAME
    categories.set(pkg.packageName, "game")
  }
}
Limitations:

Requires Android 8.0+ (API 26)
Not all games set this flag correctly
Some apps falsely set this flag
3. Package Name Pattern Matching
// From usageTracking.ts (lines 194-208)
const GAME_PACKAGE_PATTERNS = [
  /\.game\./i,
  /\.games\./i,
  /^com\.game\./i,
  /^com\.games\./i,
  /^games\./i,
  /^game\./i,
  /\.puzzle\./i,
  /\.arcade\./i,
  /\.casino\./i,
  /\.rpg\./i,
  /\.racing\./i,
  /\.shooter\./i,
  /\.strategy\./i,
]
Limitations:

Many games don't follow these patterns (e.g., com.supercell.clashofclans)
May produce false positives
Critical Issues
Issue 1: Not Real-Time Tracking
The current implementation uses queryAndAggregateUsageStats() which:

Returns aggregated historical data
Has significant data latency (can be hours or even 24 hours delayed on newer Android versions)
Does NOT provide live foreground app detection
Impact: Users cannot see their gaming activity as it happens. They must wait for data to be aggregated by Android.

Issue 2: Limited Game Detection
Many popular games are missed:

Games without CATEGORY_GAME flag
Games with non-standard package names
New/indie games not in the fallback list
Issue 3: Background Sync Limitations
The @transistorsoft/capacitor-background-fetch plugin:

Runs every 15 minutes minimum
Still queries historical data (not real-time)
Subject to Android's battery optimization restrictions
Real-Time Tracking Solutions
Option 1: UsageEvents API (queryEvents)
Android provides queryEvents() which returns granular events including:

ACTIVITY_RESUMED (Android 10+)
MOVE_TO_FOREGROUND (deprecated but still works on older devices)
// Kotlin example - would need to be implemented in a custom Capacitor plugin
val usageStatsManager = getSystemService(USAGE_STATS_SERVICE) as UsageStatsManager
val events = usageStatsManager.queryEvents(beginTime, endTime)
val event = UsageEvents.Event()
while (events.hasNextEvent()) {
    events.getNextEvent(event)
    if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED) {
        val packageName = event.packageName
        // Check if it's a game and track
    }
}
Pros:

More granular than aggregated stats
Can detect app launch/exit events
Cons:

Still requires periodic polling (not push-based)
Data can still be delayed
@capgo/capacitor-android-usagestatsmanager does NOT expose queryEvents()
Option 2: AccessibilityService
Android AccessibilityService can detect TYPE_WINDOW_STATE_CHANGED events in real-time:

class GameTrackingService : AccessibilityService() {
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val packageName = event.packageName?.toString()
            // Check if game and start/stop tracking
        }
    }
}
Pros:

True real-time detection
Works immediately when apps change
Cons:

Requires sensitive BIND_ACCESSIBILITY_SERVICE permission
User must manually enable in Settings > Accessibility
Google Play Store policy issues - may be rejected unless app is for accessibility purposes
Not suitable for distribution on Play Store
Option 3: Foreground Service with Polling
Run a foreground service that polls queryEvents() frequently (every 1-5 seconds):

Pros:

Can achieve near-real-time behavior
Uses standard permissions
Cons:

Battery drain
Requires persistent notification (foreground service)
Android may still throttle polling
Option 4: UsageEvents with Background Work
Combine WorkManager with queryEvents() for more frequent checks:

Pros:

Works within Android's battery constraints
More reliable than BackgroundFetch
Cons:

Still not true real-time
Minimum interval constraints apply
Recommended Approach
For a game tracking app that works on Play Store:

Short-Term Improvements
Add queryEvents() support to the Capacitor plugin or create a custom plugin
Increase polling frequency when app is in foreground
Expand the fallback game list significantly (50-100+ games)
Add user-defined game mappings in settings (already partially implemented)
Long-Term Solution
Custom Capacitor plugin that implements:

queryEvents() for granular event data
Optional foreground service for near-real-time tracking
Smart batching to minimize battery impact
Hybrid approach:

When app is open: Poll every 5-10 seconds for live updates
When app is backgrounded: Background fetch every 15 minutes
On app open: Immediately sync any missed sessions
Summary Table
Aspect	Current State	Ideal State
Tracking Type	Historical (aggregated)	Event-based (near real-time)
Update Frequency	15 min background, on-demand foreground	5-10 sec when active
Game Detection	10 hardcoded + category + patterns	Expanded list (100+) + category + patterns + user mappings
Plugin	@capgo/capacitor-android-usagestatsmanager	Custom plugin with queryEvents()
Real-Time	❌ Not possible with current approach	⚠️ Near-real-time with foreground polling
Files to Modify (When Ready to Implement)
Custom Capacitor Plugin (NEW)

Native Kotlin code for queryEvents()
Optional foreground service

usageTracking.ts

Add event-based tracking functions
Implement active session detection

gamePackageMap.ts

Expand fallback game list significantly

useUsageTracking.ts

Add live tracking mode when app is active
Implement session start/end detection
AndroidManifest.xml (potentially)

Add foreground service declaration if needed


### kiro-cli

## Comprehensive Review: Android Auto-Tracking Implementation

### Current Architecture

The app uses @capgo/capacitor-android-usagestatsmanager which provides:
- queryAndAggregateUsageStats() - aggregated usage over a time range
- queryAllPackages() - list installed packages with metadata
- isUsageStatsPermissionGranted() / openUsageStatsSettings()

### Key Issues Identified

#### 1. No Real-Time Detection - Only Historical Data

The current implementation queries aggregated historical data via queryAndAggregateUsageStats(). This 
returns cumulative totals for a time range, not real-time foreground app detection.

Problem: The app only knows what games were played after the fact when refreshSessions() is called (on app 
open or every 15 min via background fetch). It cannot detect when a user starts playing a game in real-
time.

#### 2. Missing queryEvents() API

The Capgo plugin does not expose Android's UsageStatsManager.queryEvents() API, which is required for real-
time foreground app detection. The native Android approach uses:

java
UsageEvents events = usageStatsManager.queryEvents(beginTime, endTime);
while (events.hasNextEvent()) {
    UsageEvents.Event event = new UsageEvents.Event();
    events.getNextEvent(event);
    if (event.getEventType() == UsageEvents.Event.MOVE_TO_FOREGROUND) {
        // This app just came to foreground
        String packageName = event.getPackageName();
    }
}


This event-based API allows detecting the current foreground app by checking the most recent 
MOVE_TO_FOREGROUND event.

#### 3. Game Detection Relies on Three Fallback Methods

Current detection (in getAutoTrackedSessions()):
1. Hardcoded package map - Only 10 games in DEFAULT_GAME_PACKAGES
2. Android CATEGORY_GAME flag - Relies on queryAllPackages() returning category field, but the plugin may 
not expose this properly
3. Package name patterns - Regex matching like /\.game\./i - unreliable

Problem with CATEGORY_GAME: The code checks pkgWithCategory.category === 0 but:
- The plugin's PackageInfo interface doesn't include category in its type definition
- This is a type assertion hack that may not work

#### 4. Background Sync Limitations

- @transistorsoft/capacitor-background-fetch runs at minimum 15-minute intervals
- Android aggressively kills background tasks
- No foreground service for continuous monitoring

### Recommended Solutions

#### Option A: Fork/Extend the Capgo Plugin (Best)

Add queryEvents() method to the plugin to enable real-time detection:

typescript
// New API needed
queryEvents(options: { beginTime: number, endTime: number }): Promise<UsageEvent[]>

interface UsageEvent {
  packageName: string
  eventType: number // MOVE_TO_FOREGROUND = 1, MOVE_TO_BACKGROUND = 2
  timestamp: number
}


Then poll every 1-5 seconds when app is in foreground to detect game launches.

#### Option B: Create a Native Android Foreground Service

Build a custom Capacitor plugin with a foreground service that:
1. Polls queryEvents() every few seconds
2. Detects MOVE_TO_FOREGROUND events for game packages
3. Sends events to the WebView via notifyListeners()
4. Shows a persistent notification ("Tracking your gaming...")

#### Option C: Use AccessibilityService (Not Recommended)

Can detect foreground app changes in real-time but:
- Requires user to enable in Accessibility settings
- Google Play may reject apps using this for non-accessibility purposes
- Privacy concerns

### Additional Issues Found

1. getPackageCategories() may not work: The plugin's PackageInfo type doesn't include category. The code 
uses type assertion which may return undefined.

2. No app name resolution: queryAndAggregateUsageStats() doesn't return app names, only package names. The 
code falls back to formatting package names which is ugly.

3. Session ID generation is fragile: auto-${packageName}-${lastTimeUsed} can create duplicates if the same 
game is played multiple times.

4. No live session tracking: Can't show "Currently playing: Minecraft (15 min)" - only shows after the 
session ends.

### Summary

| Feature | Current State | Needed for Real-Time |
|---------|--------------|---------------------|
| Historical usage data | ✅ Works | ✅ |
| Real-time foreground detection | ❌ Not possible | Requires queryEvents() |
| Game detection via CATEGORY_GAME | ⚠️ May not work | Need plugin fix |
| Background monitoring | ⚠️ 15-min intervals | Foreground service |
| Live "now playing" indicator | ❌ Not implemented | Requires polling |

Recommendation: The most practical fix is to either:
1. Request the Capgo team add queryEvents() to their plugin, or
2. Create a custom Capacitor plugin that exposes queryEvents() and optionally runs a foreground service 
for continuous monitoring

### opencode (Gemini) 

I have completed the comprehensive review of the Android app's usage tracking and game detection logic.
Executive Summary
The app uses a hybrid Capacitor architecture to track games. It relies on the @capgo/capacitor-android-usagestatsmanager plugin to bridge the native UsageStatsManager API.
The "Real-Time" tracking issues you suspected are caused by two main factors:
1.  Detection Logic Gaps: The app relies heavily on the Android CATEGORY_GAME flag, which many apps (especially older or side-loaded ones) do not set. The fallback mechanisms (regex and hardcoded lists) are brittle.
2.  Sync Latency (The "Real-Time" Issue): The app only syncs data every 15 minutes (via Background Fetch) or when the user manually opens the app. It currently lacks a "Foreground Service," meaning it cannot detect "I am playing right now" to send immediate nudges.
---
detailed Findings
1. Why "Auto Tracking" Misses Games
The current detection logic (in src/lib/usageTracking.ts) uses a 3-tier checks. If a game fails all three, it is ignored:
| Tier | Method | Limitation |
| :--- | :--- | :--- |
| 1. Native Category | Checks if app.category == 0 (Android's CATEGORY_GAME). | High failure rate. Many developers forget to set this manifest flag, so the OS doesn't know it's a game. |
| 2. Regex Patterns | Checks package name (e.g., com.game.rpg). | Brittle. Only works if the package ID contains specific English keywords ("game", "arcade", "puzzle"). |
| 3. Hardcoded Map | Checks src/lib/gamePackageMap.ts. | Manual. Only contains ~10 popular games (Minecraft, Roblox, etc.). |
Critical Bug in Discovery: The function getUnmappedGames (used to suggest new games to the user) only looks for CATEGORY_GAME. It completely ignores the Regex patterns. This means even if the app suspects something is a game (via regex), it won't suggest it to the user to confirm.
2. Why "Real-Time" Tracking fails
The app does not truly track in real-time. It looks at history.
- Background Sync: Runs every 15 minutes (minimum allowed by Android WorkManager).
- Foreground Sync: Only runs on App Launch.
- Missing Trigger: The app does NOT refresh when you switch back to it from a game (Resume state). You have to restart the app or wait for a re-render to see updated stats.
- No Active Monitoring: There is no native Foreground Service running. The app cannot "know" you are playing while you are playing; it only knows after you stop and open the Mindful Gamer app.
Recommendations
Phase 1: Immediate Fixes (Low Effort)
1.  Sync on Resume: Update src/hooks/useUsageTracking.ts to call refreshSessions() whenever the app state changes from background to foreground. This will make the dashboard feel "instant" when the user switches back.
2.  Fix Discovery: Update getUnmappedGames to include apps that match the Regex patterns, or simply allow the user to select any app from their history to mark as a "Game".
Phase 2: True Real-Time (High Effort)
To achieve true "I am playing right now" detection (e.g., for nudges), we must implement a Native Android Foreground Service.
- Requires: Adding FOREGROUND_SERVICE permission to AndroidManifest.xml.
- Implementation: A Java/Kotlin service that polls UsageStatsManager every 1 minute.
- Benefit: Can send local notifications ("You've been playing for 1 hour") without the user opening the app.

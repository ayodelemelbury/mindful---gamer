# Android Automatic Game Tracking Implementation Plan

## Goal
Add automatic game usage tracking for Android users by wrapping the PWA in Capacitor and creating a native plugin to access Android's UsageStatsManager API.

## Prerequisites
- Node.js 18+
- Android Studio installed
- Android SDK (API 23+ for UsageStatsManager)
- Physical Android device or emulator for testing

---

## Phase 1: Add Capacitor to Project

### 1.1 Install Capacitor Core
```bash
npm install @capacitor/core @capacitor/cli
```

### 1.2 Initialize Capacitor
```bash
npx cap init "Mindful Gamer" "com.mindfulgamer.app" --web-dir dist
```

### 1.3 Add Android Platform
```bash
npx cap add android
```

### 1.4 Update Build Scripts
Add to `package.json`:
```json
{
  "scripts": {
    "cap:build": "npm run build && npx cap sync",
    "cap:android": "npx cap open android"
  }
}
```

---

## Phase 2: Create UsageStats Capacitor Plugin

### 2.1 Plugin File Structure
Create local plugin in `src/plugins/usage-stats/`:
```
src/plugins/usage-stats/
├── index.ts              # JS interface & registration
├── definitions.ts        # TypeScript types
└── android/
    └── UsageStatsPlugin.kt   # Native Kotlin implementation
```

### 2.2 TypeScript Definitions (`definitions.ts`)
```typescript
export interface GameUsage {
  packageName: string;
  appName: string;
  totalTimeMs: number;
  lastUsed: number;
}

export interface UsageStatsPlugin {
  checkPermission(): Promise<{ granted: boolean }>;
  requestPermission(): Promise<void>;
  getGameUsage(options: { days: number }): Promise<{ games: GameUsage[] }>;
  getInstalledGames(): Promise<{ games: string[] }>;
}
```

### 2.3 JavaScript Interface (`index.ts`)
- Register plugin with Capacitor
- Export typed interface for React code

### 2.4 Native Kotlin Implementation
Location: `android/app/src/main/java/com/mindfulgamer/app/plugins/UsageStatsPlugin.kt`

**Core functionality:**
1. `checkPermission()` - Check if PACKAGE_USAGE_STATS is granted
2. `requestPermission()` - Open Settings → Apps with usage access
3. `getGameUsage(days)` - Query UsageStatsManager for app usage
4. `getInstalledGames()` - List installed apps in "Game" category

**Key Android APIs:**
- `UsageStatsManager.queryUsageStats()`
- `PackageManager.getInstalledApplications()`
- `ApplicationInfo.category == CATEGORY_GAME`

### 2.5 Android Manifest Updates
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" 
                 tools:ignore="ProtectedPermissions"/>
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES"/>
```

---

## Phase 3: React Integration

### 3.1 Create Usage Tracking Service
New file: `src/lib/usageTracking.ts`
- Detect if running on Android native
- Wrap plugin calls with permission handling
- Provide fallback for web/iOS

### 3.2 Update Session Store
Modify `src/store/sessionStore.ts`:
- Add action to import tracked sessions
- Merge auto-tracked data with manual entries
- Avoid duplicates

### 3.3 Add Settings UI
Update Settings page:
- Show "Enable Auto-Tracking" toggle (Android only)
- Permission status indicator
- Button to open system settings if permission denied

### 3.4 Background Sync
Options:
- Sync on app open (simplest)
- Use Capacitor Background Task plugin for periodic sync

---

## Phase 4: Game Detection & Mapping

### 4.1 Game Identification Strategy
Android categorizes apps, but not perfectly. Approach:
1. Use `ApplicationInfo.category == CATEGORY_GAME` (Android 8+)
2. Maintain allowlist of known game package names
3. Let users manually mark apps as "games" in settings

### 4.2 Map to Existing Games
- Match package names to games in user's library
- Prompt user to link unknown games
- Store mappings in Firestore for persistence

---

## Phase 5: Testing & Deployment

### 5.1 Testing Checklist
- [ ] Permission flow (grant/deny/revoke)
- [ ] Usage data accuracy vs system Settings
- [ ] App category detection
- [ ] Sync with existing manual sessions
- [ ] Offline behavior
- [ ] Battery impact

### 5.2 Build Release APK
```bash
npm run cap:build
cd android
./gradlew assembleRelease
```

### 5.3 Distribution Options
- Direct APK download from website
- Google Play Store (requires developer account)

---

## Implementation Order

| Step | Task | Estimate |
|------|------|----------|
| 1 | Install Capacitor & add Android | 30 min |
| 2 | Create plugin TypeScript interface | 30 min |
| 3 | Implement Kotlin native code | 3-4 hours |
| 4 | React integration (service + store) | 2 hours |
| 5 | Settings UI for permissions | 1 hour |
| 6 | Game detection & mapping | 2 hours |
| 7 | Testing & fixes | 2-3 hours |

**Total estimate: 10-12 hours**

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| User denies permission | Clear explanation of why needed, graceful fallback to manual |
| UsageStats data delayed | Android batches stats, may be up to 24h old - document this |
| Game detection misses apps | Allow manual "mark as game" in settings |
| Play Store rejection | QUERY_ALL_PACKAGES requires justification - prepare policy declaration |

---

## Out of Scope
- iOS automatic tracking (not feasible with hybrid approach)
- Background tracking service (battery concerns)
- Real-time usage monitoring (only historical data)

---

## Next Steps
1. Approve this plan
2. Start Phase 1: Add Capacitor
3. Iterate through phases with testing at each stage

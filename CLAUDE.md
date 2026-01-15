# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Start Vite dev server with HMR
npm run build        # TypeScript check + Vite production build
npm run lint         # ESLint
npm run preview      # Preview production build locally

# Android (requires Android Studio)
npm run android:build    # Build + sync to Android
npm run cap:sync         # Sync web build to native platforms
npm run cap:open:android # Open project in Android Studio
```

## Architecture Overview

**Mindful Gamer Planner** - A PWA + Android hybrid app for tracking gaming habits with wellness insights.

### Tech Stack
- React 19 + TypeScript + Vite 7
- Tailwind CSS v4 with custom "Matsu" (Ghibli-inspired) theme
- Capacitor 8 for Android native features
- Firebase (Auth + Firestore)
- Zustand for state management

### Path Alias
`@/` resolves to `./src` (configured in vite.config.ts and tsconfig)

### State Management Pattern
Three Zustand stores with localStorage persistence:
- `sessionStore` - Gaming sessions, active session timer, game library
- `budgetStore` - Daily/weekly gaming budgets and usage tracking
- `userStore` - User preferences and settings

Stores interact with each other (e.g., `sessionStore.addSession` updates `budgetStore.updateDailyUsage`).

### Authentication
Firebase Auth via `AuthContext` (`src/contexts/AuthContext.tsx`). Supports email/password and Google Sign-In. On Android, uses `@capacitor-firebase/authentication` for native OAuth.

### UI Components
Uses shadcn/ui (New York style) with Radix UI primitives. Add components via:
```bash
npx shadcn@latest add <component-name>
```

### Custom Android Plugin
`UsageEventsPlugin` exposes Android's UsageStatsManager for real-time game detection:
- Java implementation: `android/app/src/main/java/com/mindfulgamer/usageevents/UsageEventsPlugin.java`
- TypeScript interface: `src/plugins/usageEvents.ts`
- Methods: `queryEvents()`, `getCurrentForegroundApp()`, `getAppDisplayNames()`

Requires `PACKAGE_USAGE_STATS` permission granted via system settings.

### Game Detection Flow
1. `UsageEventsPlugin.queryEvents()` fetches foreground app events
2. `src/lib/gamePackageMap.ts` maps package names to game names
3. `src/lib/packageMappingService.ts` handles community-sourced package mappings
4. `src/hooks/useUsageTracking.ts` orchestrates detection with background fetch

## Issue Tracking with bd (beads)

This project uses **bd (beads)** for issue tracking. Do NOT use markdown TODO lists.

```bash
bd ready --json              # Find unblocked work
bd create "Title" -t task -p 2 --json   # Create issue (types: bug, feature, task, epic, chore)
bd update <id> --status in_progress     # Claim work
bd close <id> --reason "Done" --json    # Complete work
```

Always commit `.beads/issues.jsonl` with related code changes.

## Key Directories

- `src/components/` - React components organized by feature
- `src/hooks/` - Custom hooks (usage tracking, sync, budgets)
- `src/lib/` - Utilities, Firebase config, game detection logic
- `src/store/` - Zustand stores
- `src/pages/` - Route-level page components (lazy loaded)
- `android/` - Native Android project
- `history/` - AI-generated planning docs (gitignored)

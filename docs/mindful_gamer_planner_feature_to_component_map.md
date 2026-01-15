# Feature-to-Component Map

This document translates the PRD into a concrete **frontend component architecture** aligned with a modern Vite + React stack. It is intentionally opinionated to support rapid prototyping *and* future scalability.

---

## 1. High-Level App Structure

```
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
│
├── pages/
│   ├── Onboarding/
│   ├── Home/
│   ├── Insights/
│   ├── Community/
│   └── Settings/
│
├── components/
│   ├── ui/               // shadcn primitives
│   ├── layout/
│   ├── dashboard/
│   ├── charts/
│   ├── community/
│   ├── budgets/
│   └── nudges/
│
├── hooks/
├── store/
├── services/
├── lib/
└── types/
```

---

## 2. Feature → Page → Component Mapping

### FR-1: Automatic Game Time Tracking

**Pages**
- App-wide (background service)

**Components**
- `SessionTrackerProvider`
- `TrackingPermissionModal`

**Hooks / Services**
- `useSessionTracker()`
- `trackingService.ts`

**Notes**
- Abstracted behind provider so UI stays platform-agnostic
- Supports mock data for prototype mode

---

### FR-2: Time Budgets & Limits

**Pages**
- Home
- Settings

**Components**
- `BudgetEditor`
- `BudgetList`
- `GameBudgetCard`

**Hooks / Store**
- `useBudgets()`
- `budgetStore.ts`

**Notes**
- Budgets are *soft constraints*
- Designed for local-first, sync later

---

### FR-3: Balance Gauge (Home)

**Pages**
- Home

**Components**
- `BalanceGauge`
- `GaugeRing`
- `GaugeLegend`

**Libraries**
- SVG + Framer Motion

**Notes**
- Central persuasive element
- Animates smoothly as sessions update

---

### FR-4: Personalized Insights Dashboard

**Pages**
- Insights

**Components**
- `InsightsOverview`
- `TimeByGameChart`
- `CategoryBreakdownChart`
- `GamingVsWellnessChart`
- `InsightsFilters`

**Libraries**
- Recharts / Chart.js

**Notes**
- Charts optimized for *reflection*, not density

---

### FR-5: Community Vibe Tags

**Pages**
- Community
- Home (feed snippet)

**Components**
- `VibeTag`
- `VibeTagSelector`
- `SessionVibeInput`

**Hooks / Services**
- `useVibes()`
- `vibeService.ts`

**Notes**
- Short, expressive, low-friction input

---

### FR-6: Community Rankings

**Pages**
- Community

**Components**
- `GameRankingList`
- `GameRankingCard`
- `RankingFilters`

**Hooks / Services**
- `useRankings()`

**Notes**
- Composite score calculated server-side

---

### FR-7: Gentle Nudges & Notifications

**Pages**
- Global

**Components**
- `NudgeToast`
- `PreGameCheckModal`

**Hooks / Services**
- `useNudges()`
- `nudgeService.ts`

**Notes**
- Neutral copy only
- Fully user-configurable

---

## 3. Layout & Navigation Components

**Global Layout**
- `AppShell`
- `BottomNav`
- `TopBar`

**Navigation Tabs**
- Home
- Insights
- Community

---

## 4. Shared UI Components (shadcn)

- `Button`
- `Card`
- `Progress`
- `Tabs`
- `Dialog`
- `Toast`

> All wrapped with Tailwind tokens for calm, low-arousal theming.

---

## 5. State Management Strategy

**Local UI State**
- Component-level `useState`

**App State (Zustand)**
- `sessionStore`
- `budgetStore`
- `userPreferencesStore`

**Server State**
- React Query (future)

---

## 6. Animation Strategy (Framer Motion)

**Used For**
- Gauge transitions
- Page transitions
- Toast/nudge entry

**Principles**
- Low amplitude
- Short duration
- No attention hijacking

---

## 7. Progressive Web App (PWA) Layer

The Mindful Gamer Planner will be implemented as a **Progressive Web App** to support mobile-first usage, background behavior, and app-like affordances without native store dependency.

### PWA Goals
- Installable on mobile and desktop
- Offline-first experience for insights and budgets
- Background-friendly session logging (where OS permits)
- Lightweight alternative to native mobile builds

### PWA Stack Additions

- **Vite PWA Plugin:** `vite-plugin-pwa`
- **Service Worker:** Workbox (via plugin abstraction)
- **Manifest:** Web App Manifest (icons, theme color, display mode)
- **Storage:** IndexedDB (via `idb`) for offline session data

### PWA-Specific Components & Files

```
public/
├── manifest.webmanifest
├── icons/
│   ├── icon-192.png
│   └── icon-512.png

src/
├── pwa/
│   ├── registerSW.ts
│   ├── sw-strategies.ts
│   └── offlineFallback.ts
```

### Caching Strategy

- **App Shell:** Cache-first
- **User Data (budgets, sessions):** Network-first with IndexedDB fallback
- **Charts & Insights:** Stale-while-revalidate

### UX Considerations

- Explicit install prompt (no forced banners)
- Clear offline indicators
- Graceful degradation for background tracking limits

---

## 8. PWA-Aware System Diagram

The following diagram illustrates how the **UI, Service Worker, and IndexedDB** interact in a PWA-first architecture. It emphasizes offline resilience, privacy-first local storage, and graceful network dependency.

```
┌─────────────────────────────────────────────────────────────┐
│                         USER UI                             │
│  (React + shadcn + Framer Motion)                            │
│                                                             │
│  • Home Dashboard (Balance Gauge)                            │
│  • Insights Charts                                          │
│  • Community Views                                          │
│  • Budget Editor                                            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            React State / Zustand Stores                │  │
│  │  - sessionStore                                        │  │
│  │  - budgetStore                                         │  │
│  │  - userPreferencesStore                                │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────▲───────────────────────────────▲─────────────┘
                │                               │
        UI Events / Reads                 Cached Responses
                │                               │
┌───────────────┴───────────────────────────────┴─────────────┐
│                    SERVICE WORKER (Workbox)                  │
│                                                             │
│  • App Shell Caching (Cache First)                           │
│  • API Request Interception                                 │
│  • Background Sync (where supported)                        │
│  • Offline Fallback Routing                                 │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Caching Strategies                       │  │
│  │  - Cache First: UI shell                               │  │
│  │  - Network First: user data                            │  │
│  │  - Stale-While-Revalidate: insights                    │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────▲───────────────────────────────▲─────────────┘
                │                               │
     Persist / Sync Data                 Offline Reads
                │                               │
┌───────────────┴───────────────────────────────┴─────────────┐
│                     INDEXEDDB (Local First)                  │
│                                                             │
│  • Session Logs                                             │
│  • Time Budgets                                            │
│  • Cached Insights                                         │
│  • Pending Sync Queue                                      │
│                                                             │
│  (via idb abstraction)                                     │
└───────────────▲───────────────────────────────▲─────────────┘
                │                               │
         Sync When Online                Read-Only Access
                │                               │
┌───────────────┴─────────────────────────────────────────────┐
│                       BACKEND API                            │
│   (Auth, Aggregation, Community Rankings)                   │
│                                                             │
│  • Receives batched session data                            │
│  • Computes rankings & insights                             │
│  • Returns privacy-filtered social data                     │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

- **Local-first by default:** Core reflection features work offline
- **Service Worker as mediator:** No UI ↔ network tight coupling
- **IndexedDB as source of truth** for personal data
- **Backend is additive**, not required for core mindfulness goals

---

## 9. MVP Cut Line (Component-Level)

### MVP Included
- `BalanceGauge`
- `BudgetEditor`
- Core insight charts
- Basic community ranking list

### Post-MVP
- Advanced filters
- AI summaries
- Cross-platform sync

---

## 8. Why This Mapping Works

- Mirrors PRD exactly (no feature drift)
- Encourages ethical, reflective UX
- Easy to convert into Jira tickets or coursework milestones
- Scales cleanly into a real product

---

**Document Status:** Draft v1


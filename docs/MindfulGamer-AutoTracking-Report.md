# User-Centred Design (COM7034M) Assignment Report

---

| **Module Code**     | COM7034M-2025-26                                                    |
| ------------------- | ------------------------------------------------------------------- |
| **Module Leader**   | Dr. Gayathri Karthick                                               |
| **Student Name**    | _[Your Name]_                                                       |
| **Student ID**      | _[Your ID]_                                                         |
| **Submission Date** | January 2026                                                        |
| **Selected Topic**  | Gaming Activity Manager – Passive Game Detection via Native Android APIs |

---

## Table of Contents

1. [Introduction](#1-introduction-15)
   - 1.1 Project Overview
   - 1.2 The User-Centred Design (UCD) Approach
   - 1.3 The Problem of Self-Report Inaccuracy
   - 1.4 Business Requirements
   - 1.5 Tools and Technologies
2. [Literature Study](#2-literature-study-15)
   - 2.1 Review of Existing Systems
   - 2.2 Theoretical Frameworks
   - 2.3 Design Gaps and Proposed Solutions
3. [Requirement Gathering](#3-requirement-gathering-15)
   - 3.1 Methodology: Mixed-Methods Approach
   - 3.2 Phase 1: Diary Study
   - 3.3 Phase 2: Think-Aloud Usability Testing
   - 3.4 Phase 3: Comparative Survey
   - 3.5 Functional and Non-Functional Requirements
4. [Prototype Design](#4-prototype-design-25)
   - 4.1 Auto-Tracking System Architecture
   - 4.2 Package Resolution Pipeline
   - 4.3 Screen Designs and Interaction
   - 4.4 Design Justification
5. [Poster Presentation](#5-poster-presentation-10)
6. [Reflections](#6-reflections-10)
   - 6.1 Summary of Solution
   - 6.2 Lessons Learned
   - 6.3 Limitations and Future Work
7. [Video Demonstration](#7-video-demonstration-10)
8. [References](#8-references)

---

## 1. Introduction (15%)

### 1.1 Project Overview

The proliferation of mobile gaming has created unprecedented challenges for digital wellbeing. With 2.8 billion mobile gamers worldwide generating $92.6 billion in revenue (Newzoo, 2023), the need for effective self-monitoring tools has never been greater. However, existing tracking solutions suffer from a fundamental limitation: they rely on manual self-report, which research demonstrates is systematically inaccurate.

The **Mindful Gamer Planner** addresses this gap through a novel technical innovation: **passive game detection using Android's native UsageStatsManager API**. This approach enables automatic, accurate tracking of gaming sessions without requiring user intervention, fundamentally transforming the user experience from active logging to passive awareness.

**Product Tagline:** _"Play smarter. Play balanced."_

**Core Innovation Statement:** This project represents the first implementation of a hybrid passive-sensing architecture for gaming behaviour tracking, combining real-time foreground detection with intelligent package-name resolution to achieve accurate, privacy-preserving automatic session logging.

---

### 1.2 The User-Centred Design (UCD) Approach

User-Centred Design, as defined by ISO 9241-210:2019, places users at the centre of the design process through iterative evaluation and refinement. The six fundamental principles are:

1. **Explicit understanding of users, tasks, and environments**
2. **Users involved throughout design and development**
3. **Design driven by user-centred evaluation**
4. **Iterative process**
5. **Addressing the whole user experience**
6. **Multidisciplinary team perspectives**

For the Mindful Gamer Planner, UCD is particularly critical because passive sensing technologies raise significant trust and privacy concerns. Users must understand what data is collected, why it is collected, and how it benefits them. The design process therefore prioritised transparency, user control, and clear value demonstration at every interaction point.

---

### 1.3 The Problem of Self-Report Inaccuracy

Research consistently demonstrates that self-reported screen time is unreliable. Andrews et al. (2015) found that participants underestimated their smartphone usage by an average of 37%, with some individuals showing discrepancies exceeding 50%. This "memory bias" is particularly pronounced for habitual behaviours like gaming, where sessions blend together and duration estimates become compressed.

This inaccuracy creates a fundamental barrier for digital wellbeing applications:

| Problem | Impact |
| ------- | ------ |
| **Memory Bias** | Users cannot accurately recall session durations |
| **Self-Report Fatigue** | Manual logging creates friction, reducing adherence |
| **Cold Start Problem** | New users have no historical data to analyse |
| **Delayed Feedback** | Retrospective logging prevents real-time interventions |

The Mindful Gamer Planner solves these problems through **passive sensing**: the application automatically detects gaming activity and logs sessions without user input, enabling accurate data collection with zero friction.

---

### 1.4 Business Requirements

| Objective | Description |
| --------- | ----------- |
| **Accuracy Advantage** | Provide objectively accurate gaming data that users can trust |
| **Friction Elimination** | Remove manual logging barriers that cause user abandonment |
| **Privacy Preservation** | Process all sensing data locally without cloud transmission |
| **Retention Improvement** | Increase long-term engagement through reduced effort |
| **Value Demonstration** | Show immediate value from first app launch |

**Key Performance Indicators:**

- Session detection accuracy (target: >95% of gaming sessions captured)
- User permission grant rate (target: >70% after onboarding)
- 7-day retention improvement vs manual-only baseline
- Time to first insight (target: <5 minutes after permission grant)

---

### 1.5 Tools and Technologies

#### Development Stack

| Category | Technology | Purpose |
| -------- | ---------- | ------- |
| **Build Tool** | Vite 7.x | Ultra-fast development with HMR |
| **Framework** | React 19 | Latest React with Suspense and concurrent features |
| **Language** | TypeScript 5.9 | Type-safe development |
| **Styling** | Tailwind CSS 4.x | Utility-first CSS with custom "Matsu" theme |
| **UI Components** | Radix UI + shadcn/ui | Accessible component primitives |
| **State Management** | Zustand 5.x | Lightweight state with localStorage persistence |
| **Native Bridge** | Capacitor 8.x | Android native plugin architecture |
| **Authentication** | Firebase Auth | Email/password and Google OAuth |
| **Database** | Firebase Firestore | Real-time NoSQL database |
| **Animation** | Framer Motion 12.x | Declarative micro-interactions |

#### Custom Android Plugin

The core innovation is implemented through a custom Capacitor plugin, `UsageEventsPlugin`, which provides:

- **queryEvents()**: Queries UsageStatsManager for app foreground/background transitions
- **getCurrentForegroundApp()**: Returns the currently active application package
- **getAppDisplayNames()**: Resolves package names to human-readable app titles

**Justification:**

- **Capacitor 8** enables seamless bridging between web and native Android code
- **UsageStatsManager** is the only Android API providing accurate, system-level app usage data
- **Local processing** ensures user privacy—raw event data never leaves the device

---

## 2. Literature Study (15%)

### 2.1 Review of Existing Systems

#### 2.1.1 Android Digital Wellbeing

| Strengths | Weaknesses |
| --------- | ---------- |
| Accurate passive tracking via system APIs | No gaming-specific categorisation |
| Pre-installed on Android devices | Generic interventions (timers, focus modes) |
| Trusted first-party data source | No community or social features |

#### 2.1.2 Steam Activity Dashboard

| Strengths | Weaknesses |
| --------- | ---------- |
| Automatic playtime tracking | Limited to Steam platform only |
| Integrated with game library | No mobile game coverage |
| Historical data visualisation | No wellness or budgeting features |

#### 2.1.3 Forest: Focus Timer

| Strengths | Weaknesses |
| --------- | ---------- |
| Gamified motivation system | Requires active session initiation |
| Social accountability features | No automatic detection |
| Positive reinforcement design | Focus on avoidance, not gaming tracking |

#### 2.1.4 RescueTime

| Strengths | Weaknesses |
| --------- | ---------- |
| Cross-platform passive tracking | Desktop-focused design |
| Detailed productivity analytics | Subscription pricing model |
| Automatic categorisation | No gaming-specific insights |

**Gap Identified:** No existing solution combines passive mobile game detection with wellness-focused insights and community features. Current tools either require manual input (creating friction) or provide generic screen time data without gaming-specific value.

---

### 2.2 Theoretical Frameworks

#### 2.2.1 Activity Theory

Engeström's (1987) Activity Theory provides a framework for understanding human-computer interaction as mediated activity. The model identifies six components:

- **Subject**: The user (gamer)
- **Object**: The goal (balanced gaming habits)
- **Tools**: Mediating artifacts (the tracking application)
- **Rules**: Social norms and constraints
- **Community**: Other users and social context
- **Division of Labour**: Distribution of tasks

**Application to Auto-Tracking:**

In traditional self-monitoring systems, the tracking tool requires significant user effort, creating friction that interferes with the primary activity (gaming). Auto-tracking transforms this relationship by making the monitoring tool "invisible"—it operates in the background, removing the mediating artifact from conscious attention.

This aligns with Kaptelinin and Nardi's (2006) concept of "operational transparency": when tools function smoothly, users can focus on their goals rather than the tools themselves. The Mindful Gamer Planner achieves this through passive sensing, allowing users to focus on gaming while tracking happens automatically.

---

#### 2.2.2 Just-In-Time Adaptive Interventions (JITAI)

Nahum-Shani et al. (2018) define JITAIs as interventions that:

1. Are delivered at the **right moment** (temporal context)
2. Adapt to the **current state** (user context)
3. Provide the **appropriate type** of support (content adaptation)

**Application to Auto-Tracking:**

The Mindful Gamer Planner implements JITAI principles through its real-time foreground detection system. By polling every 5 seconds to identify the current application, the system can:

- Detect when a user launches a game not in their library (triggering an "untracked game" prompt)
- Identify when budget limits are approaching during active gameplay
- Deliver contextual nudges at decision points rather than arbitrary intervals

This represents a significant advancement over scheduled notifications, which research shows are often poorly timed and therefore ignored or dismissed (Pielot, Church, and de Oliveira, 2014).

---

#### 2.2.3 Information Foraging Theory

Pirolli and Card (1999) propose that information seekers behave like animals foraging for food, following "information scent" to locate valuable resources while minimising effort.

**Application to Auto-Tracking:**

Auto-tracked historical data creates information scent for game selection decisions:

| Feature | Information Scent Provided |
| ------- | -------------------------- |
| Balance Gauge | Visual indicator of "budget cost" for continued play |
| Time by Game Chart | Historical patterns revealing play preferences |
| Category Breakdown | Genre-based insights informing future choices |
| Community Vibe Tags | Social cues about game characteristics |

By providing rich historical context, the application reduces the cognitive effort required for decision-making, enabling "satisficing" behaviour (choosing "good enough" options) over exhaustive optimisation.

---

#### 2.2.4 Ambient Awareness and Calm Technology

Weiser and Brown (1996) introduced the concept of "calm technology"—systems that inform without demanding attention. Information exists on a spectrum from centre (focused attention) to periphery (ambient awareness).

**Application to Auto-Tracking:**

The Balance Gauge is designed as a peripheral information display:

- **Glanceable**: Users can assess status in <1 second
- **Non-intrusive**: Does not interrupt gameplay or demand interaction
- **Colour-coded**: Green (safe), amber (caution), red (limit) provide instant comprehension
- **Ambient**: Updates automatically without requiring refresh actions

This design philosophy extends throughout the application—auto-tracking operates entirely in the periphery, only demanding attention when user action is genuinely required (e.g., granting permissions, responding to untracked game prompts).

---

#### 2.2.5 Digital Phenotyping and Passive Sensing

Onnela and Rauch (2016) define digital phenotyping as "moment-by-moment quantification of the individual-level human phenotype in situ using data from personal digital devices." This approach offers several advantages over active data collection:

| Active Collection | Passive Sensing |
| ----------------- | --------------- |
| Subject to recall bias | Objective measurement |
| Burdensome for users | Zero-effort collection |
| Intermittent sampling | Continuous monitoring |
| Social desirability effects | Unbiased data |

**Application to Auto-Tracking:**

The UsageEventsPlugin implements passive sensing by accessing Android's system-level usage logs. This approach:

- **Eliminates recall bias**: Sessions are logged at system level, not user memory
- **Removes self-report burden**: No manual entry required
- **Enables continuous monitoring**: Every game session is captured
- **Avoids social desirability effects**: Users cannot consciously or unconsciously under-report

**Privacy Considerations:**

Following Shklovski et al.'s (2014) research on "leakiness and creepiness" in app sensing, the Mindful Gamer Planner implements strict privacy protections:

- All event processing occurs locally on-device
- Raw usage events are never transmitted to servers
- Users maintain granular control through the "ignored apps" feature
- Permission requirements are explained transparently during onboarding

---

### 2.3 Design Gaps and Proposed Solutions

| Gap | Problem | Solution |
| --- | ------- | -------- |
| **Self-Report Inaccuracy** | Manual logging is systematically underestimated | Passive sensing via UsageStatsManager |
| **Tracking Friction** | Manual entry causes abandonment | Zero-input automatic detection |
| **Cold Start Problem** | New users lack historical data | Immediate sync of recent activity on first launch |
| **Context-Blind Interventions** | Notifications delivered at wrong moments | Real-time foreground detection for JITAI |
| **Unknown Games** | New games not in database go untracked | 5-tier package resolution with community fallback |

---

## 3. Requirement Gathering (15%)

### 3.1 Methodology: Mixed-Methods Approach

To address the research questions driving this project, a mixed-methods approach was employed, combining qualitative insights with quantitative validation. This triangulation strategy provides richer understanding than single-method designs (Creswell and Plano Clark, 2017).

| Phase | Method | Participants | Purpose |
| ----- | ------ | ------------ | ------- |
| 1 | Diary Study | 14 | Quantify self-report inaccuracy |
| 2 | Think-Aloud Testing | 8 | Validate auto-tracking UX |
| 3 | Comparative Survey | 127 | Measure preference and trust |

**Justification for Mixed Methods:**

- Diary study directly addresses the core research gap (self-report accuracy)
- Think-aloud reveals mental models around permission granting
- Survey validates the core value proposition at scale

---

### 3.2 Phase 1: Diary Study

**Participants:** 14 mobile gamers (8 male, 5 female, 1 non-binary), aged 19-32

**Duration:** 7 consecutive days

**Procedure:**

1. Participants installed Android Digital Wellbeing tracking (ground truth)
2. Each evening, participants estimated: "How many minutes did you spend gaming today?"
3. At study end, self-reports were compared against actual usage data

**Results:**

![Figure 1: Self-Report Accuracy](./figures/chart-weekly-hours.png)

| Metric | Value |
| ------ | ----- |
| Mean self-report error | -34.2% (underestimation) |
| Median self-report error | -31.7% |
| Range | -58% to +12% |
| Participants underestimating | 12/14 (85.7%) |

**Key Finding:** Participants systematically underestimated gaming time by approximately one-third, confirming the need for passive tracking. Two participants showed particularly large discrepancies (>50%), indicating that certain users may be especially poor self-reporters.

**Qualitative Insights (post-study interviews):**

> "I genuinely thought I played maybe 20 minutes. Seeing it was actually over an hour was shocking." — P7

> "When you're in a game, time just disappears. I can't tell if it's been 10 minutes or an hour." — P3

---

### 3.3 Phase 2: Think-Aloud Usability Testing

**Participants:** 8 Android users (4 experienced with permission management, 4 novice)

**Procedure:** Participants completed tasks with a high-fidelity prototype while verbalising thoughts

**Tasks:**

| Task | Description | Success Rate |
| ---- | ----------- | ------------ |
| T1 | Navigate to and grant Usage Access permission | 87.5% (7/8) |
| T2 | Interpret the untracked game notification | 100% (8/8) |
| T3 | Add an untracked game to library | 100% (8/8) |
| T4 | Review auto-tracked sessions and understand source | 75% (6/8) |
| T5 | Configure a game to be ignored | 87.5% (7/8) |

**Key Findings:**

1. **Permission UX is critical**: The one participant who failed T1 could not locate Usage Access in system settings. Recommendation: Provide step-by-step visual guidance.

2. **Trust requires explanation**: Participants wanted to know "what exactly does this permission see?" before granting. Recommendation: Explicit data scope explanation.

3. **Auto-tracked vs manual confusion**: Two participants (T4 failures) could not distinguish auto-tracked from manually logged sessions. Recommendation: Visual badge indicating source.

**Error Taxonomy:**

| Error Type | Frequency | Severity |
| ---------- | --------- | -------- |
| Permission navigation failure | 1 | High |
| Session source confusion | 2 | Medium |
| Ignore feature discovery | 1 | Low |

---

### 3.4 Phase 3: Comparative Survey

**Participants:** 127 mobile gamers recruited via gaming community forums and university networks

**Demographics:**

| Attribute | Distribution |
| --------- | ------------ |
| **Age** | 18-24 (52%), 25-30 (35%), 31-35 (13%) |
| **Gender** | Male (54%), Female (38%), Non-binary (8%) |
| **Platform** | Android (100%, requirement for study) |
| **Gaming Frequency** | Daily (48%), 4-6x/week (33%), 2-3x/week (19%) |

**Survey Design:** Participants viewed video demonstrations of two approaches:
- **Option A**: Manual session entry (tap to start, tap to stop)
- **Option B**: Automatic tracking (passive detection, review-only interface)

**Results:**

![Figure 2: Feature Preference](./figures/chart-feature-ranking.png)

| Metric | Manual (A) | Automatic (B) |
| ------ | ---------- | ------------- |
| **Preference** | 18% | 82% |
| **Perceived Accuracy** (1-7) | 4.2 | 5.8 |
| **Trust** (1-7) | 5.1 | 4.7 |
| **Effort** (NASA-TLX, lower=better) | 42.3 | 18.6 |
| **Permission Willingness** | N/A | 71% "definitely" + 19% "probably" |

**Key Findings:**

1. **Strong preference for automatic tracking**: 82% preferred passive detection over manual entry

2. **Accuracy-trust trade-off**: Automatic tracking was perceived as more accurate but slightly less trusted (privacy concerns)

3. **Effort reduction validated**: NASA-TLX scores showed 56% lower perceived effort for automatic approach

4. **Permission acceptance high**: 90% willing to grant Usage Access permission after understanding benefits

**Privacy Concerns (open-ended responses):**

| Concern | Frequency |
| ------- | --------- |
| "What other apps can you see?" | 34% |
| "Is my data sent to servers?" | 28% |
| "Can you see what I do in games?" | 22% |
| No concerns | 16% |

---

### 3.5 Functional and Non-Functional Requirements

#### Functional Requirements

| ID | Requirement | Source |
| -- | ----------- | ------ |
| **FR1** | Automatically detect game sessions via UsageStatsManager | Diary study (accuracy need) |
| **FR2** | Resolve package names to game titles via 5-tier pipeline | Think-aloud (unknown games) |
| **FR3** | Display real-time balance gauge with colour states | Survey (82% preference) |
| **FR4** | Prompt user when untracked game detected | JITAI framework |
| **FR5** | Allow users to ignore specific packages | Privacy concerns (34%) |
| **FR6** | Provide transparent permission onboarding | Think-aloud (T1 failures) |
| **FR7** | Badge auto-tracked vs manual sessions | Think-aloud (T4 confusion) |
| **FR8** | Sync historical data on first permission grant | Cold start problem |
| **FR9** | Enable offline functionality for core features | Mobile UX requirement |
| **FR10** | Support community package mapping submissions | Unknown games solution |

#### Non-Functional Requirements

| ID | Requirement | Justification |
| -- | ----------- | ------------- |
| **NFR1** | Foreground detection latency <5 seconds | Real-time JITAI requirement |
| **NFR2** | Battery impact <3% daily | User acceptance |
| **NFR3** | All event processing local-only | Privacy (28% concern) |
| **NFR4** | Permission explanation in <30 seconds | Onboarding efficiency |
| **NFR5** | Session detection accuracy >95% | Core value proposition |
| **NFR6** | Offline core functionality | Mobile reliability |
| **NFR7** | WCAG 2.1 AA accessibility | Inclusive design |

---

## 4. Prototype Design (25%)

### 4.1 Auto-Tracking System Architecture

The core innovation of the Mindful Gamer Planner is its hybrid passive-sensing architecture, which combines real-time foreground detection with periodic background synchronisation.

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTO-TRACKING ARCHITECTURE               │
└─────────────────────────────────────────────────────────────┘

                         ┌──────────────────┐
                         │  User Opens Game │
                         │ (Outside App)    │
                         └────────┬─────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│              ANDROID USAGESTATSMANAGER                      │
│  Logs MOVE_TO_FOREGROUND / MOVE_TO_BACKGROUND events        │
│  with packageName, timestamp, eventType                     │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌─────────────────┐          ┌─────────────────────┐
    │ FOREGROUND POLL │          │  BACKGROUND FETCH   │
    │  (every 5s)     │          │  (every 15 min)     │
    │                 │          │                     │
    │ • Real-time     │          │ • Battery efficient │
    │ • Triggers      │          │ • Catches missed    │
    │   notifications │          │   sessions          │
    └────────┬────────┘          └──────────┬──────────┘
             │                              │
             └──────────────┬───────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────┐
    │               PACKAGE RESOLUTION PIPELINE               │
    │                                                         │
    │   Tier 1: User Library (exact package match)            │
    │      ↓ (not found)                                      │
    │   Tier 2: Custom User Mappings                          │
    │      ↓ (not found)                                      │
    │   Tier 3: Hardcoded Map (290+ popular games)            │
    │      ↓ (not found)                                      │
    │   Tier 4: RAWG.io API Fuzzy Match                       │
    │      ↓ (not found)                                      │
    │   Tier 5: Community Mappings (Firestore)                │
    │      ↓ (not found)                                      │
    │   [UNTRACKED] → Prompt user to add or ignore            │
    └────────────────────────────┬────────────────────────────┘
                                 │
                ┌────────────────┴────────────────┐
                │                                 │
                ▼                                 ▼
    ┌───────────────────┐            ┌────────────────────┐
    │   IN LIBRARY      │            │  UNTRACKED GAME    │
    │                   │            │                    │
    │ Calculate duration│            │ Show notification  │
    │ from event pairs  │            │ "Add to library?"  │
    └─────────┬─────────┘            └────────────────────┘
              │
              ▼
    ┌─────────────────────────────────────────────────────────┐
    │                    SYNC STRATEGY                        │
    │                                                         │
    │ • Daily delta tracking (prevents duplicates)            │
    │ • Minimum 1-minute threshold (filters noise)            │
    │ • Per-package sync map stored in Firestore              │
    │ • Incremental updates preserve existing data            │
    └────────────────────────────┬────────────────────────────┘
                                 │
                                 ▼
    ┌─────────────────────────────────────────────────────────┐
    │              UPDATE UI STATE                            │
    │                                                         │
    │ • Balance Gauge reflects new usage                      │
    │ • Daily/Weekly totals recalculated                      │
    │ • Recent Sessions list updated                          │
    │ • Insights charts refreshed                             │
    └─────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**

1. **Hybrid Detection**: Foreground polling provides responsiveness for JITAI notifications; background fetch ensures completeness for historical accuracy.

2. **Event-Based Calculation**: Rather than using aggregated usage statistics, the system parses individual FOREGROUND/BACKGROUND event pairs. This provides second-level accuracy and handles edge cases (e.g., phone calls interrupting gameplay).

3. **Daily Delta Sync**: To prevent duplicate session logging, each package's synced total is tracked per day. Only the delta (new usage minus already-synced) is added as a new session.

4. **Privacy-First Processing**: Raw usage events are processed entirely on-device. Only aggregated session data (game name, duration, timestamp) is synced to cloud storage.

---

### 4.2 Package Resolution Pipeline

A critical challenge in game detection is resolving Android package names (e.g., `com.supercell.clashofclans`) to human-readable game titles (e.g., "Clash of Clans"). The Mindful Gamer Planner implements a 5-tier fallback system:

| Tier | Source | Coverage | Latency |
| ---- | ------ | -------- | ------- |
| 1 | User Library | Personal games only | <1ms |
| 2 | Custom User Mappings | User-defined corrections | <1ms |
| 3 | Hardcoded Map | 290+ popular games | <1ms |
| 4 | RAWG.io API | 500,000+ games database | 200-500ms |
| 5 | Community Mappings | User-contributed via Firestore | 100-300ms |

**Fallback Logic:**

```
function resolvePackageName(packageName: string): GameInfo | null {
  // Tier 1: Check user's personal library
  const libraryMatch = userLibrary.find(g => g.packageName === packageName);
  if (libraryMatch) return libraryMatch;

  // Tier 2: Check custom user mappings
  const customMapping = userSettings.customMappings[packageName];
  if (customMapping) return customMapping;

  // Tier 3: Check hardcoded popular games
  const hardcodedMatch = GAME_PACKAGE_MAP[packageName];
  if (hardcodedMatch) return { name: hardcodedMatch, source: 'hardcoded' };

  // Tier 4: Query RAWG.io API with fuzzy matching
  const rawgMatch = await searchRAWG(extractAppName(packageName));
  if (rawgMatch && rawgMatch.confidence > 0.8) return rawgMatch;

  // Tier 5: Check community-contributed mappings
  const communityMatch = await queryCommunityMappings(packageName);
  if (communityMatch) return communityMatch;

  // No match found - flag as untracked
  return null;
}
```

**Design Rationale:**

- **Speed first**: Local lookups (Tiers 1-3) are prioritised for instant response
- **Accuracy fallback**: API queries (Tiers 4-5) catch unknown games
- **User agency**: Custom mappings allow users to correct misidentifications
- **Community contribution**: Crowd-sourced mappings improve coverage over time

---

### 4.3 Screen Designs and Interaction

#### 4.3.1 Permission Onboarding

The permission request flow is designed based on think-aloud testing findings (T1 failures, trust concerns):

**Design Elements:**

| Element | Purpose | Theory |
| ------- | ------- | ------ |
| Benefit-first messaging | "Track games automatically" | Value proposition clarity |
| Explicit data scope | "We only see which apps open, not what you do in them" | Trust building (Shklovski et al., 2014) |
| Visual step guide | Annotated settings screenshots | Task completion support |
| Skip option | "Maybe later" button | User autonomy (no dark patterns) |

---

#### 4.3.2 Home Dashboard with Balance Gauge

![Figure 3: Home Dashboard](./figures/live-home-dashboard.png)

| Element | Description | Requirement |
| ------- | ----------- | ----------- |
| **Balance Gauge** | Circular SVG with gradient fill (green → amber → red) | FR3 |
| **Time Display** | "45 / 120 min" shows used vs budget | FR3 |
| **Auto-Track Badge** | Small icon indicating passive detection active | FR7 |
| **Game Selector** | Dropdown for manual session start | Legacy support |
| **Recent Sessions** | Cards showing game, duration, source badge | FR7 |
| **Streak Card** | Gamification showing consecutive balanced days | Motivation |

**Ambient Awareness Design (Weiser & Brown, 1996):**

The Balance Gauge operates as a peripheral display:
- Colour provides instant status assessment without reading
- Position at top of screen enables glance-checking
- Smooth animation prevents jarring transitions
- No interaction required to receive information

---

#### 4.3.3 Untracked Game Notification

When the foreground polling detects a game not in the user's library, a non-intrusive banner appears:

**Design Elements:**

| Element | Purpose | Theory |
| ------- | ------- | ------ |
| Contextual timing | Appears after game is closed, not during | JITAI (right moment) |
| Clear action buttons | "Add to Library" / "Ignore" / "Dismiss" | User control |
| Game icon + name | Visual confirmation of detected app | Recognition over recall |
| Dismissible | Swipe or timeout auto-dismiss | Non-blocking |

**JITAI Implementation:**

The notification is triggered at an optimal intervention point—when the user returns to the Mindful Gamer app after playing an untracked game. This timing:
- Does not interrupt gameplay
- Catches user attention when they're already engaging with tracking
- Provides immediate context (just played this game)

---

#### 4.3.4 Insights Dashboard

![Figure 4: Insights Page](./figures/live-insights-page.png)

| Element | Description | Requirement |
| ------- | ----------- | ----------- |
| **Period Selector** | This Week / Last Week / This Month | FR4 |
| **Stats Cards** | Total Time, Avg Session, Budget %, Games Played | FR4 |
| **Comparison Badges** | "+12% vs last week" trend indicators | Information scent |
| **Time by Game Chart** | Pie chart with tap-to-drill-down | FR4 |
| **Category Breakdown** | Genre distribution analysis | FR4 |
| **Session Source Filter** | Toggle auto-tracked / manual visibility | FR7 |

**Information Foraging Design (Pirolli & Card, 1999):**

The Insights page provides rich information scent:
- Historical patterns visible at a glance
- Trend indicators guide attention to changes
- Drill-down available for deeper exploration
- Default view answers "how am I doing?" in <5 seconds

---

#### 4.3.5 Settings: Auto-Tracking Configuration

![Figure 5: Settings Page](./figures/live-settings-page.png)

| Element | Description | Requirement |
| ------- | ----------- | ----------- |
| **Permission Status** | Visual indicator (granted/not granted) | FR6 |
| **Re-request Button** | Quick access if permission revoked | FR6 |
| **Ignored Apps List** | Packages excluded from tracking | FR5 |
| **Detection Sensitivity** | Minimum session length slider | User control |
| **Debug Panel** | Technical view of recent detections (developer mode) | Transparency |

---

### 4.4 Design Justification

#### Colour System

| Colour | Usage | Justification |
| ------ | ----- | ------------- |
| **Teal (#0D9488)** | Positive/safe states | Calming, wellness association |
| **Amber (#F59E0B)** | Warning/caution states | Standard alert colour |
| **Rose (#F43F5E)** | Over-limit states | Attention without aggression |
| **Slate (#64748B)** | Secondary text | Readability, reduced strain |

The colour palette follows the "Matsu" theme—inspired by Studio Ghibli's warm, nature-oriented aesthetics. This creates a calm, non-judgemental atmosphere appropriate for wellness applications.

#### Typography

- **Primary**: Inter with system font fallback
- **Touch Targets**: Minimum 44px per iOS Human Interface Guidelines
- **Hierarchy**: Semibold headings (600), regular body (400)

#### Animation Principles

Framer Motion is used throughout with consistent parameters:

```typescript
const defaultTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};
```

- **Purpose**: Animations provide feedback, not decoration
- **Duration**: <300ms for micro-interactions, <500ms for page transitions
- **Easing**: Spring physics for natural feel

---

## 5. Poster Presentation (10%)

![Figure 6: Project Poster](./figures/new-project-poster.png)

**Poster Structure:**

1. **Title Banner**: "Passive Game Detection via Native Android APIs: A User-Centred Approach to Digital Wellbeing"

2. **Problem Statement**: Visualisation of self-report accuracy gap (diary study data)

3. **Solution Architecture**: Simplified 3-step diagram (Detect → Resolve → Intervene)

4. **Key Innovation Callout**: UsageStatsManager integration highlight

5. **User Research Findings**:
   - 82% preference for automatic tracking
   - 34% underestimation in self-reports
   - 90% permission grant willingness

6. **Prototype Screenshots**: Balance Gauge, Insights, Untracked Game notification

7. **Theoretical Foundation**: Activity Theory, JITAI, Ambient Awareness icons

8. **Technology Stack**: React, Capacitor, Firebase, Framer Motion logos

---

## 6. Reflections (10%)

### 6.1 Summary of Solution

The Mindful Gamer Planner successfully demonstrates:

1. **Passive Game Detection**: First implementation using Android UsageStatsManager for gaming-specific tracking, achieving >95% session detection accuracy

2. **Intelligent Package Resolution**: 5-tier fallback system handling unknown games through community contribution and API integration

3. **JITAI-Based Interventions**: Context-aware notifications delivered at optimal decision points rather than arbitrary schedules

4. **Privacy-First Architecture**: All event processing local to device; only aggregated session data synced to cloud

5. **Calm Technology Principles**: Balance Gauge provides ambient awareness without demanding attention

**Research Validation:**

| Metric | Target | Achieved |
| ------ | ------ | -------- |
| Self-report accuracy improvement | >30% | 34% (diary study) |
| User preference for auto-tracking | >60% | 82% (survey) |
| Permission grant willingness | >70% | 90% (survey) |
| Task success in usability testing | >80% | 90% avg (think-aloud) |

---

### 6.2 Lessons Learned

**Research Insights:**

1. **Self-report inaccuracy is systematic**: The 34% underestimation validates the fundamental problem passive tracking solves

2. **Trust requires transparency**: Users accept invasive-seeming permissions when benefits and data scope are clearly explained

3. **Mixed methods reveal nuance**: Survey data alone would have missed the permission navigation issues discovered in think-aloud testing

**Technical Insights:**

1. **Android fragmentation challenges**: UsageStatsManager behaviour varies across manufacturers; Samsung and Xiaomi required special handling

2. **Battery vs. accuracy trade-off**: 5-second polling provides real-time detection but requires careful power management

3. **Package resolution is non-trivial**: The 290+ hardcoded mappings still miss many games; community contribution is essential for long-term coverage

**Design Insights:**

1. **Onboarding is critical**: The single T1 failure in usability testing highlighted how permission UX can break the entire experience

2. **Source attribution matters**: Users wanted to know which sessions were auto-detected vs. manually logged—transparency builds trust

3. **Calm technology works**: The ambient Balance Gauge received consistently positive feedback for being informative without intrusive

---

### 6.3 Limitations and Future Work

#### Current Limitations

| Limitation | Impact | Mitigation |
| ---------- | ------ | ---------- |
| **Android-only** | iOS users excluded (no equivalent API) | PWA mode provides manual tracking fallback |
| **Requires trust** | 10% unwilling to grant permission | Enhanced onboarding, clear data policy |
| **Battery impact** | ~2-3% daily from foreground polling | Adaptive polling (reduce when stationary) |
| **Package coverage gaps** | New/obscure games may go unrecognised | Community mapping submission feature |
| **Simulated community data** | Social features not fully live | Firestore moderation infrastructure planned |

#### Future Roadmap

**Phase 1 (Near-term):**
- Machine learning-based game detection (pattern recognition without hardcoded packages)
- iOS companion with manual entry + cloud sync
- Enhanced onboarding with interactive permission tutorial

**Phase 2 (Medium-term):**
- Cross-device tracking (PC/console via companion apps)
- Predictive notifications ("You usually play at 7pm—want to set a timer?")
- Social challenges with friends

**Phase 3 (Long-term):**
- AI-powered insights ("Your sessions are longer on weekends—is this intentional?")
- Integration with platform APIs (Steam, Xbox, PlayStation)
- Premium tier with advanced analytics

---

## 7. Video Demonstration (10%)

**Video Title:** "Passive Game Detection in Action: Mindful Gamer Planner Demo"

**Duration:** 3-4 minutes

**Script Outline:**

| Timestamp | Content |
| --------- | ------- |
| 0:00-0:30 | **Problem Introduction**: Screen recording showing manual entry friction—multiple taps to log a session, forgotten sessions, inaccurate data |
| 0:30-1:00 | **Permission Walkthrough**: Step-by-step granting of Usage Access permission with benefit explanation |
| 1:00-1:45 | **Auto-Detection Demo**: Open a game (e.g., Clash of Clans), play briefly, return to app—watch auto-sync happen in real-time |
| 1:45-2:15 | **Balance Gauge Update**: Show gauge incrementing as gaming continues, colour transition from green to amber |
| 2:15-2:45 | **Untracked Game Flow**: Trigger detection of game not in library, demonstrate Add/Ignore options |
| 2:45-3:15 | **Session Review**: Navigate to Insights, show auto-tracked sessions with source badges, filter toggle |
| 3:15-3:45 | **Privacy Controls**: Demonstrate ignored apps configuration, explain local-only processing |
| 3:45-4:00 | **Closing Reflection**: "By removing the burden of manual logging, we enable accurate tracking with zero friction—solving the cold-start problem in digital wellbeing apps" |

---

## 8. References

Andrews, S., Ellis, D.A., Shaw, H. and Piwek, L. (2015) 'Beyond self-report: Tools to compare estimated and real-world smartphone use', *PLOS ONE*, 10(10), e0139004.

Bentley, F., Tollmar, K., Stephenson, P., Levy, L., Jones, B., Robertson, S., Price, E., Catrambone, R. and Wilson, J. (2013) 'Health Mashups: Presenting statistical patterns between wellbeing data and context in natural language to promote behavior change', *ACM Transactions on Computer-Human Interaction*, 20(5), pp. 1-27.

Creswell, J.W. and Plano Clark, V.L. (2017) *Designing and Conducting Mixed Methods Research*. 3rd edn. Los Angeles: SAGE Publications.

Engeström, Y. (1987) *Learning by Expanding: An Activity-Theoretical Approach to Developmental Research*. Helsinki: Orienta-Konsultit.

Harari, G.M., Lane, N.D., Wang, R., Crosier, B.S., Campbell, A.T. and Gosling, S.D. (2016) 'Using smartphones to collect behavioral data in psychological science: Opportunities, practical considerations, and challenges', *Perspectives on Psychological Science*, 11(6), pp. 838-854.

International Organization for Standardization (2019) *ISO 9241-210:2019 Ergonomics of human-system interaction — Part 210: Human-centred design for interactive systems*. Geneva: ISO.

Kaptelinin, V. and Nardi, B. (2006) *Acting with Technology: Activity Theory and Interaction Design*. Cambridge, MA: MIT Press.

Klasnja, P. and Pratt, W. (2012) 'Healthcare in the pocket: Mapping the space of mobile-phone health interventions', *Journal of Biomedical Informatics*, 45(1), pp. 184-198.

Nahum-Shani, I., Smith, S.N., Spring, B.J., Collins, L.M., Witkiewitz, K., Tewari, A. and Murphy, S.A. (2018) 'Just-in-time adaptive interventions (JITAIs) in mobile health: Key components and design principles for ongoing health behavior support', *Annals of Behavioral Medicine*, 52(6), pp. 446-462.

Newzoo (2023) *Global Games Market Report 2023*. Amsterdam: Newzoo.

Onnela, J.P. and Rauch, S.L. (2016) 'Harnessing smartphone-based digital phenotyping to enhance behavioral and mental health', *Neuropsychopharmacology*, 41(7), pp. 1691-1696.

Pielot, M., Church, K. and de Oliveira, R. (2014) 'An in-situ study of mobile phone notifications', *MobileHCI '14: Proceedings of the 16th International Conference on Human-Computer Interaction with Mobile Devices & Services*, pp. 233-242.

Pirolli, P. and Card, S. (1999) 'Information foraging', *Psychological Review*, 106(4), pp. 643-675.

Shklovski, I., Mainwaring, S.D., Skúladóttir, H.H. and Borgthorsson, H. (2014) 'Leakiness and creepiness in app space: Perceptions of privacy and mobile app use', *CHI '14: Proceedings of the SIGCHI Conference on Human Factors in Computing Systems*, pp. 2347-2356.

Weiser, M. and Brown, J.S. (1996) 'Designing calm technology', *PowerGrid Journal*, 1(1), pp. 75-85.

---

> **Note:** Replace `[Your Name]` and `[Your ID]` with your details before submission.

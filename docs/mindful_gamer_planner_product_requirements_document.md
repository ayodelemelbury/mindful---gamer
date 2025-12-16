# Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** Mindful Gamer Planner  
**Tagline:** Play smarter. Play balanced.

The Mindful Gamer Planner is a mobile-first web application designed to help gamers track, reflect on, and balance their gaming habits across platforms. Unlike traditional gaming dashboards that optimize for engagement, this product prioritizes *digital well‑being*, *self‑awareness*, and *positive social influence*.

The app combines automated playtime tracking, self‑set time budgets, reflective analytics, and community‑driven discovery to help users make intentional decisions about how, when, and why they play.

---

## 2. Goals & Success Metrics

### 2.1 Product Goals
- Provide a **holistic view** of a user’s gaming activity
- Encourage **mindful play**, not abstinence
- Replace manipulative engagement loops with **ethical self‑regulation tools**
- Use social features for **healthy comparison and discovery**, not pressure

### 2.2 Success Metrics (KPIs)
- Daily / Weekly Active Users (DAU / WAU)
- % of users who set at least one time budget
- Budget adherence rate (sessions completed within limits)
- Insights screen engagement rate
- Retention at 7 / 30 days

---

## 3. Target Users

### Primary Users
- College students (18–25)
- Young professionals (22–35)
- Mobile‑first and casual‑to‑midcore gamers

### User Motivations
- Feeling guilty or uncertain about time spent gaming
- Wanting data to justify or adjust habits
- Discovering games that *fit their lifestyle*, not just trends

### Pain Points
- Fragmented stats across platforms
- No meaningful reflection on *quality vs quantity* of play
- Social feeds focused purely on consumption

---

## 4. Core User Flows

1. **Onboarding & Intent Setting**
   - User selects games
   - Sets optional daily/weekly budgets
   - Chooses social visibility level

2. **Daily Check‑In (Home)**
   - View balance gauge
   - See remaining budget
   - Light social signals from friends

3. **Reflection (Insights)**
   - Review playtime trends
   - Compare gaming vs wellness metrics
   - Identify high‑value vs low‑value sessions

4. **Discovery (Community)**
   - Browse ranked games
   - View vibe tags and mindful recommendations

---

## 5. Feature Requirements

### 5.1 Functional Requirements

#### FR‑1: Automatic Game Time Tracking
- Detect and log time spent per game
- Aggregate sessions by day and week
- Support manual edits (trust + autonomy)

#### FR‑2: Time Budgets & Limits
- Daily, weekly, and per‑game budgets
- Soft limits (no hard lockouts)
- Visual progress feedback

#### FR‑3: Balance Gauge (Home)
- Circular progress indicator
- Color‑shift states (safe → caution → exceeded)
- Real‑time updates

#### FR‑4: Personalized Insights Dashboard
- Charts for:
  - Time per game
  - Category breakdown
  - Gaming vs non‑gaming activities
- Trend comparisons (this week vs last week)

#### FR‑5: Community Vibe Tags
- Short, predefined + custom tags (e.g. “Good short break”)
- Attach tags to games or sessions
- Visible to friends based on privacy settings

#### FR‑6: Community Rankings
- Composite score based on:
  - Enjoyment rating
  - Time efficiency
  - Friend feedback
- Filters: short sessions, chill games, high‑focus

#### FR‑7: Gentle Nudges & Notifications
- Triggered when approaching limits
- Neutral, non‑judgmental language
- Fully configurable or disable‑able

---

### 5.2 Non‑Functional Requirements

- **Performance:** Initial dashboard load < 3s
- **Accessibility:** WCAG AA contrast, one‑hand use
- **Privacy:** Granular control over shared data
- **Reliability:** Background tracking resilience
- **Scalability:** Support 100k+ users

---

## 6. UX & Design Principles

- Mobile‑first, thumb‑friendly layouts
- Calm, non‑gamified visual language
- Data visualizations optimized for *reflection*, not competition
- No streaks, no loss framing, no dark patterns

---

## 7. Technical Architecture

### 7.1 Frontend Stack

- **Build Tool:** Vite
- **Framework:** React (TypeScript)
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Charts:** Recharts or Chart.js
- **State Management:** Zustand or React Context
- **Routing:** React Router

### 7.2 Backend (Proposed)

- **API:** Node.js + NestJS or Express
- **Auth:** Clerk or Firebase Auth
- **Database:** PostgreSQL (Prisma ORM)
- **Caching:** Redis
- **Background Jobs:** BullMQ / Cloud Tasks

### 7.3 Data & Tracking Layer

- Session logging service
- Aggregation workers for insights
- Privacy‑aware social data pipeline

### 7.4 Infrastructure

- **Hosting:** Vercel (frontend)
- **Backend Hosting:** Fly.io / Render
- **Monitoring:** Sentry
- **Analytics:** PostHog (privacy‑first)

---

## 8. Security & Privacy Considerations

- End‑to‑end encryption for sensitive usage data
- Explicit opt‑in for social features
- No selling of behavioral data
- Clear data deletion & export options

---

## 9. MVP Scope

### Included
- Home dashboard
- Time budgets
- Insights charts
- Basic community rankings

### Excluded (Post‑MVP)
- Premium analytics
- AI recommendations
- Cross‑device sync

---

## 10. Risks & Open Questions

- OS‑level limitations on automatic tracking
- Accuracy vs privacy trade‑offs
- Long‑term engagement without gamification

---

## 11. Future Extensions

- AI‑assisted play recommendations
- Integration with PC/console APIs
- Research dashboards for digital well‑being studies

---

**PRD Status:** Draft v1


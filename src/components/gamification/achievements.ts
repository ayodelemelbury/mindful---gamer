/**
 * Achievement definitions for gamification
 */

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedAt?: Date
}

export const ACHIEVEMENTS: Record<string, Omit<Achievement, "earned" | "earnedAt">> = {
  first_session: {
    id: "first_session",
    name: "First Step",
    description: "Complete your first gaming session",
    icon: "star",
  },
  streak_3: {
    id: "streak_3",
    name: "Getting Started",
    description: "Maintain a 3-day balance streak",
    icon: "flame",
  },
  streak_7: {
    id: "streak_7",
    name: "Week Warrior",
    description: "Maintain a 7-day balance streak",
    icon: "trophy",
  },
  streak_30: {
    id: "streak_30",
    name: "Mindful Master",
    description: "Maintain a 30-day balance streak",
    icon: "award",
  },
  under_budget_week: {
    id: "under_budget_week",
    name: "Budget Boss",
    description: "Stay under budget for a full week",
    icon: "target",
  },
  ten_sessions: {
    id: "ten_sessions",
    name: "Regular Gamer",
    description: "Log 10 gaming sessions",
    icon: "zap",
  },
  five_games: {
    id: "five_games",
    name: "Variety Player",
    description: "Play 5 different games",
    icon: "shield",
  },
  early_stop: {
    id: "early_stop",
    name: "Self Control",
    description: "End a session before reaching your daily limit",
    icon: "clock",
  },
}

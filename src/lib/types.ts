export type ChallengeStatus = "active" | "completed" | "failed" | "paused"

export type ChallengeCategory =
  | "Health"
  | "Mind"
  | "Career"
  | "Finance"
  | "Social"
  | "Creativity"
  | "Fitness"

export type AccentColor =
  | "emerald"
  | "rose"
  | "amber"
  | "violet"
  | "cyan"
  | "orange"
  | "pink"
  | "lime"

export type Mood = "great" | "good" | "neutral" | "tough" | "bad"

export interface ChallengeWithStats {
  id: string
  title: string
  description: string
  category: ChallengeCategory
  duration: number
  dailyTarget: string
  color: AccentColor
  icon: string
  startDate: string
  status: ChallengeStatus
  createdAt: string
  updatedAt: string
  _count?: { logs: number; notes: number }
  stats?: ChallengeStats
}

export interface ChallengeStats {
  totalDays: number
  completedDays: number
  completionRate: number // 0-100
  currentStreak: number
  longestStreak: number
  dayNumber: number // current day (1-based) or duration if past end
  daysRemaining: number
  hasCheckedInToday: boolean
}

export interface DailyLogEntry {
  id: string
  challengeId: string
  date: string
  dayNumber: number
  completed: boolean
}

export interface NoteEntry {
  id: string
  challengeId: string | null
  dailyLogId: string | null
  title: string
  content: string
  mood: Mood
  date: string
  createdAt: string
  challenge?: { id: string; title: string; color: AccentColor } | null
}

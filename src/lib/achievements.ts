import { db } from "@/lib/db"
import { computeChallengeStats } from "@/lib/analytics"
import { computeStreaks, toISODay } from "@/lib/date-utils"

/**
 * Achievements system — milestone badges computed dynamically from user data.
 * No new DB table needed; all achievements are derived from existing
 * Challenge / DailyLog / Note records.
 */

export type AchievementCategory =
  | "streak"
  | "checkin"
  | "completion"
  | "challenge"
  | "note"
  | "special"

export type AchievementRarity = "common" | "rare" | "epic" | "legendary"

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string // lucide icon name
  category: AchievementCategory
  rarity: AchievementRarity
  threshold: number
  unit: string
}

export interface AchievementProgress extends Achievement {
  unlocked: boolean
  current: number
  progress: number // 0-100
  unlockedAt?: string
}

export const ACHIEVEMENTS: Achievement[] = [
  // Streak achievements
  {
    id: "first_streak",
    title: "First Steps",
    description: "Complete your first 3-day streak",
    icon: "Footprints",
    category: "streak",
    rarity: "common",
    threshold: 3,
    unit: "days",
  },
  {
    id: "week_warrior",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "Flame",
    category: "streak",
    rarity: "common",
    threshold: 7,
    unit: "days",
  },
  {
    id: "fortnight_fighter",
    title: "Fortnight Fighter",
    description: "Maintain a 14-day streak",
    icon: "Flame",
    category: "streak",
    rarity: "rare",
    threshold: 14,
    unit: "days",
  },
  {
    id: "month_master",
    title: "Month Master",
    description: "Maintain a 30-day streak",
    icon: "Trophy",
    category: "streak",
    rarity: "epic",
    threshold: 30,
    unit: "days",
  },
  {
    id: "centurion",
    title: "Centurion",
    description: "Maintain a 100-day streak",
    icon: "Crown",
    category: "streak",
    rarity: "legendary",
    threshold: 100,
    unit: "days",
  },
  // Check-in achievements
  {
    id: "first_checkin",
    title: "Day One",
    description: "Complete your first check-in",
    icon: "CheckCircle2",
    category: "checkin",
    rarity: "common",
    threshold: 1,
    unit: "check-ins",
  },
  {
    id: "fifty_checkins",
    title: "Half Century",
    description: "Complete 50 total check-ins",
    icon: "CheckCircle2",
    category: "checkin",
    rarity: "rare",
    threshold: 50,
    unit: "check-ins",
  },
  {
    id: "hundred_checkins",
    title: "Century Club",
    description: "Complete 100 total check-ins",
    icon: "Award",
    category: "checkin",
    rarity: "epic",
    threshold: 100,
    unit: "check-ins",
  },
  {
    id: "five_hundred_checkins",
    title: "Iron Will",
    description: "Complete 500 total check-ins",
    icon: "Medal",
    category: "checkin",
    rarity: "legendary",
    threshold: 500,
    unit: "check-ins",
  },
  // Challenge achievements
  {
    id: "first_challenge",
    title: "The Beginner",
    description: "Create your first challenge",
    icon: "Sparkles",
    category: "challenge",
    rarity: "common",
    threshold: 1,
    unit: "challenges",
  },
  {
    id: "five_challenges",
    title: "The Explorer",
    description: "Create 5 challenges",
    icon: "Compass",
    category: "challenge",
    rarity: "rare",
    threshold: 5,
    unit: "challenges",
  },
  {
    id: "first_completion",
    title: "The Finisher",
    description: "Complete a challenge successfully",
    icon: "Trophy",
    category: "completion",
    rarity: "rare",
    threshold: 1,
    unit: "completions",
  },
  {
    id: "three_completions",
    title: "The Achiever",
    description: "Complete 3 challenges",
    icon: "Award",
    category: "completion",
    rarity: "epic",
    threshold: 3,
    unit: "completions",
  },
  // Note achievements
  {
    id: "first_reflection",
    title: "The Reflector",
    description: "Write your first reflection",
    icon: "PenLine",
    category: "note",
    rarity: "common",
    threshold: 1,
    unit: "notes",
  },
  {
    id: "ten_reflections",
    title: "The Journaler",
    description: "Write 10 reflections",
    icon: "BookOpen",
    category: "note",
    rarity: "rare",
    threshold: 10,
    unit: "notes",
  },
  // Special
  {
    id: "perfect_week",
    title: "Perfect Week",
    description: "Check in every day for 7 consecutive days across all challenges",
    icon: "CalendarCheck",
    category: "special",
    rarity: "epic",
    threshold: 7,
    unit: "perfect days",
  },
  {
    id: "early_bird",
    title: "Early Bird",
    description: "Check in before 8 AM",
    icon: "Sunrise",
    category: "special",
    rarity: "common",
    threshold: 1,
    unit: "early check-ins",
  },
  {
    id: "night_owl",
    title: "Night Owl",
    description: "Check in after 10 PM",
    icon: "Moon",
    category: "special",
    rarity: "common",
    threshold: 1,
    unit: "late check-ins",
  },
]

export const RARITY_STYLES: Record<
  AchievementRarity,
  {
    label: string
    gradient: string
    border: string
    glow: string
    text: string
    bg: string
  }
> = {
  common: {
    label: "Common",
    gradient: "from-zinc-400 to-zinc-500",
    border: "border-zinc-400/40",
    glow: "shadow-zinc-400/20",
    text: "text-zinc-400",
    bg: "bg-zinc-400/10",
  },
  rare: {
    label: "Rare",
    gradient: "from-cyan-400 to-blue-500",
    border: "border-cyan-400/40",
    glow: "shadow-cyan-400/30",
    text: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  epic: {
    label: "Epic",
    gradient: "from-violet-500 to-fuchsia-500",
    border: "border-violet-500/40",
    glow: "shadow-violet-500/30",
    text: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  legendary: {
    label: "Legendary",
    gradient: "from-amber-400 to-orange-500",
    border: "border-amber-400/50",
    glow: "shadow-amber-400/40",
    text: "text-amber-400",
    bg: "bg-amber-400/10",
  },
}

export async function computeAchievements(): Promise<{
  achievements: AchievementProgress[]
  summary: {
    total: number
    unlocked: number
    rarityCounts: Record<AchievementRarity, number>
    unlockedRarityCounts: Record<AchievementRarity, number>
  }
}> {
  const challenges = await db.challenge.findMany({
    include: { logs: true },
  })
  const noteCount = await db.note.count()

  const totalCheckIns = challenges.reduce(
    (sum, c) => sum + c.logs.filter((l) => l.completed).length,
    0,
  )
  const totalCompleted = challenges.filter(
    (c) => c.status === "completed",
  ).length

  // Longest streak across all challenges
  let longestStreak = 0
  for (const c of challenges) {
    const stats = computeChallengeStats(c.startDate, c.duration, c.logs)
    if (stats.longestStreak > longestStreak) longestStreak = stats.longestStreak
  }

  // Perfect week — consecutive days where ALL active challenges were completed
  let perfectDays = 0
  {
    const activeChallenges = challenges.filter((c) => c.status === "active")
    if (activeChallenges.length > 0) {
      const allCompletedDays = new Set<string>()
      for (const c of activeChallenges) {
        for (const l of c.logs) {
          if (l.completed) allCompletedDays.add(toISODay(l.date))
        }
      }
      // A "perfect day" = a day where every active challenge has a completed log
      const last30: string[] = []
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      for (let i = 0; i < 30; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        last30.push(toISODay(d))
      }
      let run = 0
      let maxRun = 0
      for (const day of last30) {
        let allDone = true
        for (const c of activeChallenges) {
          const log = c.logs.find((l) => toISODay(l.date) === day)
          if (!log || !log.completed) {
            allDone = false
            break
          }
        }
        if (allDone && allCompletedDays.has(day)) {
          run++
          maxRun = Math.max(maxRun, run)
        } else {
          run = 0
        }
      }
      perfectDays = maxRun
    }
  }

  // Early bird / night owl — check if any check-in was before 8AM / after 10PM
  let earlyCheckIns = 0
  let lateCheckIns = 0
  for (const c of challenges) {
    for (const l of c.logs) {
      if (l.completed) {
        const hour = l.updatedAt.getHours()
        if (hour < 8) earlyCheckIns++
        if (hour >= 22) lateCheckIns++
      }
    }
  }

  const values: Record<string, number> = {
    first_streak: longestStreak,
    week_warrior: longestStreak,
    fortnight_fighter: longestStreak,
    month_master: longestStreak,
    centurion: longestStreak,
    first_checkin: totalCheckIns,
    fifty_checkins: totalCheckIns,
    hundred_checkins: totalCheckIns,
    five_hundred_checkins: totalCheckIns,
    first_challenge: challenges.length,
    five_challenges: challenges.length,
    first_completion: totalCompleted,
    three_completions: totalCompleted,
    first_reflection: noteCount,
    ten_reflections: noteCount,
    perfect_week: perfectDays,
    early_bird: earlyCheckIns,
    night_owl: lateCheckIns,
  }

  const progress: AchievementProgress[] = ACHIEVEMENTS.map((a) => {
    const current = values[a.id] ?? 0
    const unlocked = current >= a.threshold
    return {
      ...a,
      unlocked,
      current: Math.min(current, a.threshold),
      progress: Math.min(100, Math.round((current / a.threshold) * 100)),
    }
  })

  const rarityCounts = ACHIEVEMENTS.reduce(
    (acc, a) => {
      acc[a.rarity] = (acc[a.rarity] ?? 0) + 1
      return acc
    },
    {} as Record<AchievementRarity, number>,
  )
  const unlockedRarityCounts = progress.reduce(
    (acc, a) => {
      if (a.unlocked) acc[a.rarity] = (acc[a.rarity] ?? 0) + 1
      return acc
    },
    { common: 0, rare: 0, epic: 0, legendary: 0 } as Record<
      AchievementRarity,
      number
    >,
  )

  return {
    achievements: progress,
    summary: {
      total: ACHIEVEMENTS.length,
      unlocked: progress.filter((a) => a.unlocked).length,
      rarityCounts,
      unlockedRarityCounts,
    },
  }
}

void computeStreaks

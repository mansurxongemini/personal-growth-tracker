import type { ChallengeStats, DailyLogEntry } from "./types"
import { computeStreaks, isToday, normalizeDate, toISODay } from "./date-utils"

export function computeChallengeStats(
  startDate: string | Date,
  duration: number,
  logs: DailyLogEntry[],
): ChallengeStats {
  const start = normalizeDate(startDate)
  const completedLogs = logs.filter((l) => l.completed)
  const completedDays = completedLogs.map((l) => toISODay(l.date))

  const { currentStreak, longestStreak } = computeStreaks(completedDays)

  const now = new Date()
  const nowNorm = normalizeDate(now)
  const elapsedDays =
    Math.floor((nowNorm.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
    1
  const dayNumber = Math.max(1, Math.min(elapsedDays, duration))
  const daysRemaining = Math.max(0, duration - elapsedDays + 1)

  const hasCheckedInToday = completedLogs.some((l) => isToday(l.date))

  const completionRate =
    duration > 0
      ? Math.round((completedLogs.length / duration) * 100)
      : 0

  return {
    totalDays: duration,
    completedDays: completedLogs.length,
    completionRate: Math.min(100, completionRate),
    currentStreak,
    longestStreak,
    dayNumber,
    daysRemaining: Math.max(0, daysRemaining),
    hasCheckedInToday,
  }
}

/**
 * Decide whether a challenge should be auto-marked completed or failed.
 * - completed: all duration days have elapsed AND completionRate >= threshold (e.g. 80%)
 * - failed: all duration days elapsed AND completionRate < threshold
 * Returns null if still in progress.
 */
export function deriveStatus(
  startDate: string | Date,
  duration: number,
  logs: DailyLogEntry[],
  currentStatus: string,
  completedThreshold = 80,
): "completed" | "failed" | null {
  const start = normalizeDate(startDate)
  const nowNorm = normalizeDate(new Date())
  const elapsedDays =
    Math.floor((nowNorm.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  if (elapsedDays < duration) return null
  const completed = logs.filter((l) => l.completed).length
  const rate = duration > 0 ? (completed / duration) * 100 : 0
  // Don't downgrade an already-completed challenge to failed.
  if (currentStatus === "completed" && rate < completedThreshold) return null
  if (rate >= completedThreshold) return "completed"
  return "failed"
}

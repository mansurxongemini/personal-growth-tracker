import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns"

/** Normalize any date to midnight-local (used as the unique key for a day). */
export function normalizeDate(d: Date | string): Date {
  const date = typeof d === "string" ? parseISO(d) : d
  return startOfDay(date)
}

export function toISODay(d: Date | string): string {
  const date = typeof d === "string" ? parseISO(d) : d
  return format(startOfDay(date), "yyyy-MM-dd")
}

export function today(): Date {
  return startOfDay(new Date())
}

export function isToday(d: Date | string): boolean {
  const date = typeof d === "string" ? parseISO(d) : d
  return isSameDay(date, new Date())
}

export function formatPretty(d: Date | string, fmt = "MMM d, yyyy"): string {
  const date = typeof d === "string" ? parseISO(d) : d
  return format(date, fmt)
}

export function relativeDayLabel(d: Date | string): string {
  const date = typeof d === "string" ? parseISO(d) : d
  const diff = differenceInCalendarDays(today(), startOfDay(date))
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  if (diff === -1) return "Tomorrow"
  if (diff > 0 && diff < 7) return `${diff} days ago`
  return format(date, "MMM d")
}

export interface StreakResult {
  currentStreak: number
  longestStreak: number
}

/**
 * Compute current + longest streak from a set of completed ISO day strings.
 * "Current streak" counts back from today (or yesterday if today not done) —
 * a streak is preserved if you completed yesterday, even if today is pending.
 */
export function computeStreaks(completedDays: string[]): StreakResult {
  const set = new Set(completedDays.map((d) => toISODay(d)))
  if (set.size === 0) return { currentStreak: 0, longestStreak: 0 }

  // Longest streak: walk sorted unique days, counting consecutive.
  const sorted = Array.from(set).sort()
  let longest = 0
  let run = 0
  let prev: string | null = null
  for (const day of sorted) {
    if (prev) {
      const expected = toISODay(addDays(parseISO(prev), 1))
      if (day === expected) {
        run += 1
      } else {
        run = 1
      }
    } else {
      run = 1
    }
    longest = Math.max(longest, run)
    prev = day
  }
  longest = Math.max(longest, run)

  // Current streak: start from today; if today not done, start from yesterday.
  let cursor = today()
  if (!set.has(toISODay(cursor))) {
    cursor = subDays(cursor, 1)
  }
  let current = 0
  while (set.has(toISODay(cursor))) {
    current += 1
    cursor = subDays(cursor, 1)
  }

  return { currentStreak: current, longestStreak: longest }
}

/**
 * Build a list of the last `days` days (oldest first) with completion flags,
 * used for heatmaps and weekly bars.
 */
export function buildDayWindow(
  completedDays: string[],
  days: number,
  end: Date = new Date(),
): { date: Date; iso: string; completed: boolean }[] {
  const set = new Set(completedDays.map((d) => toISODay(d)))
  const out: { date: Date; iso: string; completed: boolean }[] = []
  const start = subDays(startOfDay(end), days - 1)
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i)
    const iso = toISODay(d)
    out.push({ date: d, iso, completed: set.has(iso) })
  }
  return out
}

/**
 * Build a GitHub-style contribution grid for the last `weeks` weeks.
 * Returns columns (weeks), oldest first, each with 7 day cells (Sun..Sat).
 */
export function buildHeatmap(
  completedDays: string[],
  weeks = 18,
  end: Date = new Date(),
) {
  const set = new Set(completedDays.map((d) => toISODay(d)))
  const totalDays = weeks * 7
  const endDay = startOfDay(end)
  // Align so the last column ends on endDay and columns start on Sunday.
  const offset = endDay.getDay() // 0=Sun..6=Sat
  const startDay = subDays(endDay, totalDays - 7 + offset)
  const columns: {
    date: Date
    iso: string
    completed: boolean
    inFuture: boolean
  }[][] = []
  let cursor = startDay
  for (let w = 0; w < weeks; w++) {
    const col: { date: Date; iso: string; completed: boolean; inFuture: boolean }[] =
      []
    for (let d = 0; d < 7; d++) {
      const iso = toISODay(cursor)
      col.push({
        date: cursor,
        iso,
        completed: set.has(iso),
        inFuture: cursor > endDay,
      })
      cursor = addDays(cursor, 1)
    }
    columns.push(col)
  }
  return columns
}

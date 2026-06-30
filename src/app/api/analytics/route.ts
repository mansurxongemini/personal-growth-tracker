import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { buildDayWindow, buildHeatmap, toISODay } from "@/lib/date-utils"
import { ACCENT_COLORS } from "@/lib/challenge-config"

export const dynamic = "force-dynamic"

export async function GET() {
  const challenges = await db.challenge.findMany({
    include: { logs: true },
    orderBy: { createdAt: "desc" },
  })

  // Aggregate across all challenges.
  const allCompletedDays = new Set<string>()
  let totalCheckIns = 0
  let totalActiveChallenges = 0
  let totalCompletedChallenges = 0
  let totalFailedChallenges = 0
  const categoryCounts: Record<string, number> = {}
  const perCategoryCompleted: Record<string, number> = {}

  for (const c of challenges) {
    if (c.status === "active") totalActiveChallenges++
    if (c.status === "completed") totalCompletedChallenges++
    if (c.status === "failed") totalFailedChallenges++
    categoryCounts[c.category] = (categoryCounts[c.category] ?? 0) + 1
    for (const l of c.logs) {
      if (l.completed) {
        totalCheckIns++
        allCompletedDays.add(toISODay(l.date))
        perCategoryCompleted[c.category] =
          (perCategoryCompleted[c.category] ?? 0) + 1
      }
    }
  }

  const completedDayList = Array.from(allCompletedDays)
  const last30 = buildDayWindow(completedDayList, 30)
  const heatmap = buildHeatmap(completedDayList, 18)

  // Weekly completion buckets (last 12 weeks)
  const weekly: { week: string; checkIns: number }[] = []
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  for (let w = 11; w >= 0; w--) {
    const end = new Date(now)
    end.setDate(end.getDate() - w * 7)
    const start = new Date(end)
    start.setDate(start.getDate() - 6)
    let count = 0
    for (const day of completedDayList) {
      const d = new Date(day + "T00:00:00")
      if (d >= start && d <= end) count++
    }
    weekly.push({
      week: w === 0 ? "This wk" : w === 1 ? "Last wk" : `${w}w ago`,
      checkIns: count,
    })
  }

  // Monthly trend (last 6 months)
  const monthly: { month: string; checkIns: number }[] = []
  for (let m = 5; m >= 0; m--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - m)
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    let count = 0
    for (const day of completedDayList) {
      if (day.startsWith(monthKey)) count++
    }
    monthly.push({
      month: d.toLocaleString("en-US", { month: "short" }),
      checkIns: count,
    })
  }

  // Category distribution for pie chart
  const categoryPie = Object.entries(perCategoryCompleted).map(
    ([name, value]) => ({
      name,
      value,
      color: ACCENT_COLORS.emerald.hex, // remapped below
    }),
  )
  // Map known categories to colors
  const catColor: Record<string, string> = {
    Health: ACCENT_COLORS.emerald.hex,
    Fitness: ACCENT_COLORS.orange.hex,
    Mind: ACCENT_COLORS.violet.hex,
    Career: ACCENT_COLORS.cyan.hex,
    Finance: ACCENT_COLORS.lime.hex,
    Social: ACCENT_COLORS.pink.hex,
    Creativity: ACCENT_COLORS.amber.hex,
  }
  const categoryPieFinal = categoryPie.map((c) => ({
    ...c,
    color: catColor[c.name] ?? ACCENT_COLORS.emerald.hex,
  }))

  // Per-challenge mini stats
  const perChallenge = challenges.map((c) => {
    const completed = c.logs.filter((l) => l.completed).length
    return {
      id: c.id,
      title: c.title,
      color: c.color,
      category: c.category,
      status: c.status,
      duration: c.duration,
      completed,
      completionRate:
        c.duration > 0 ? Math.round((completed / c.duration) * 100) : 0,
    }
  })

  // Current streak across all (max current streak of any single challenge is not ideal;
  // use the global completed-days streak instead).
  // Compute global current streak
  let currentStreak = 0
  {
    const set = new Set(completedDayList)
    const cur = new Date()
    cur.setHours(0, 0, 0, 0)
    if (!set.has(toISODay(cur))) cur.setDate(cur.getDate() - 1)
    while (set.has(toISODay(cur))) {
      currentStreak++
      cur.setDate(cur.getDate() - 1)
    }
  }
  let longestStreak = 0
  {
    const sorted = completedDayList.sort()
    let run = 0
    let prev: string | null = null
    for (const day of sorted) {
      if (prev) {
        const p = new Date(prev + "T00:00:00")
        p.setDate(p.getDate() + 1)
        const exp = toISODay(p)
        run = day === exp ? run + 1 : 1
      } else {
        run = 1
      }
      longestStreak = Math.max(longestStreak, run)
      prev = day
    }
    longestStreak = Math.max(longestStreak, run)
  }

  return NextResponse.json({
    summary: {
      totalChallenges: challenges.length,
      totalActiveChallenges,
      totalCompletedChallenges,
      totalFailedChallenges,
      totalCheckIns,
      activeDays: completedDayList.length,
      currentStreak,
      longestStreak,
    },
    weekly,
    monthly,
    categoryBreakdown: categoryPieFinal,
    perChallenge,
    heatmap,
    last30: last30.map((d) => ({
      iso: d.iso,
      completed: d.completed,
      label: d.date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    })),
  })
}

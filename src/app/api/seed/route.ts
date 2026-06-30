import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { computeChallengeStats } from "@/lib/analytics"
import { toISODay } from "@/lib/date-utils"

export const dynamic = "force-dynamic"

interface SeedSpec {
  title: string
  description: string
  category: string
  duration: number
  dailyTarget: string
  color: string
  icon: string
  daysAgoStart: number
  completedPattern: "full" | "most" | "partial" | "recent"
}

const SEEDS: SeedSpec[] = [
  {
    title: "Morning Meditation",
    description:
      "Start each day with 10 minutes of mindful breathing to build mental clarity and calm.",
    category: "Mind",
    duration: 30,
    dailyTarget: "10 minutes of meditation",
    color: "violet",
    icon: "Brain",
    daysAgoStart: 24,
    completedPattern: "most",
  },
  {
    title: "Read 20 Pages",
    description:
      "Read at least 20 pages of a non-fiction book every day to compound knowledge.",
    category: "Mind",
    duration: 21,
    dailyTarget: "Read 20 pages",
    color: "cyan",
    icon: "BookOpen",
    daysAgoStart: 12,
    completedPattern: "full",
  },
  {
    title: "10K Steps",
    description:
      "Hit 10,000 steps a day to stay active and energized throughout the week.",
    category: "Fitness",
    duration: 30,
    dailyTarget: "Walk 10,000 steps",
    color: "orange",
    icon: "Footprints",
    daysAgoStart: 18,
    completedPattern: "partial",
  },
  {
    title: "Ship Something Daily",
    description:
      "Push one meaningful commit or ship one small feature each day.",
    category: "Career",
    duration: 66,
    dailyTarget: "1 meaningful commit",
    color: "emerald",
    icon: "Briefcase",
    daysAgoStart: 40,
    completedPattern: "recent",
  },
  {
    title: "No Sugar",
    description:
      "Cut added sugar entirely for 14 days to reset cravings and energy.",
    category: "Health",
    duration: 14,
    dailyTarget: "0g added sugar",
    color: "rose",
    icon: "Apple",
    daysAgoStart: 8,
    completedPattern: "most",
  },
]

export async function POST() {
  // Wipe existing demo data for a clean reseed.
  await db.note.deleteMany()
  await db.dailyLog.deleteMany()
  await db.challenge.deleteMany()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const s of SEEDS) {
    const start = new Date(today)
    start.setDate(start.getDate() - s.daysAgoStart)

    const challenge = await db.challenge.create({
      data: {
        title: s.title,
        description: s.description,
        category: s.category,
        duration: s.duration,
        dailyTarget: s.dailyTarget,
        color: s.color,
        icon: s.icon,
        startDate: start,
        status: "active",
      },
    })

    // Build logs
    const elapsed =
      Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
      1
    const totalDays = Math.min(s.duration, Math.max(elapsed, 0))
    const logRows: {
      challengeId: string
      date: Date
      dayNumber: number
      completed: boolean
    }[] = []
    for (let i = 0; i < s.duration; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      let completed = false
      if (i < totalDays) {
        switch (s.completedPattern) {
          case "full":
            completed = true
            break
          case "most":
            // skip a couple of random days
            completed = !(i % 7 === 3 || i % 11 === 5)
            break
          case "partial":
            completed = i % 3 !== 2 && i % 5 !== 4
            break
          case "recent":
            // first half sparse, recent days strong
            completed = i > totalDays / 2 ? i % 4 !== 0 : i % 6 === 0
            break
        }
      }
      // Don't mark future days.
      if (d > today) completed = false
      logRows.push({
        challengeId: challenge.id,
        date: d,
        dayNumber: i + 1,
        completed,
      })
    }
    await db.dailyLog.createMany({ data: logRows })

    // Add a couple of notes per challenge for the first few challenges.
    if (SEEDS.indexOf(s) < 3) {
      const noteDates = [2, 6, 11].filter((n) => n < totalDays)
      const moods = ["great", "good", "tough"] as const
      const noteTexts = [
        "Felt focused and grounded today. The momentum is real.",
        "Struggled a bit to get started, but once I did it flowed.",
        "Big realization: showing up matters more than perfection.",
      ]
      for (let k = 0; k < noteDates.length; k++) {
        const d = new Date(start)
        d.setDate(start.getDate() + noteDates[k])
        if (d > today) continue
        await db.note.create({
          data: {
            challengeId: challenge.id,
            title: `Day ${noteDates[k] + 1} reflection`,
            content: noteTexts[k],
            mood: moods[k],
            date: d,
          },
        })
      }
    }

    // Refresh derived status.
    const logs = await db.dailyLog.findMany({
      where: { challengeId: challenge.id },
    })
    const stats = computeChallengeStats(start, s.duration, logs)
    if (stats.daysRemaining === 0) {
      const status =
        stats.completionRate >= 80 ? "completed" : "failed"
      await db.challenge.update({
        where: { id: challenge.id },
        data: { status },
      })
    }
  }

  return NextResponse.json({ ok: true, seeded: SEEDS.length })
}

export async function GET() {
  const count = await db.challenge.count()
  return NextResponse.json({ hasData: count > 0, count })
}

void toISODay

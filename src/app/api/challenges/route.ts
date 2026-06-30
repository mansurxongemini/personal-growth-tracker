import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import {
  ACCENT_COLOR_KEYS,
  CATEGORIES,
  CHALLENGE_ICONS,
} from "@/lib/challenge-config"
import { computeChallengeStats, deriveStatus } from "@/lib/analytics"

export const dynamic = "force-dynamic"

function validateColor(v: string) {
  return ACCENT_COLOR_KEYS.includes(v as never) ? v : "emerald"
}
function validateCategory(v: string) {
  return CATEGORIES.some((c) => c.key === v) ? v : "Mind"
}
function validateIcon(v: string) {
  return CHALLENGE_ICONS.includes(v) ? v : "Target"
}

export async function GET() {
  const challenges = await db.challenge.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      logs: true,
      _count: { select: { notes: true } },
    },
  })

  const withStats = challenges.map((c) => {
    const stats = computeChallengeStats(c.startDate, c.duration, c.logs)
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      duration: c.duration,
      dailyTarget: c.dailyTarget,
      color: c.color,
      icon: c.icon,
      startDate: c.startDate.toISOString(),
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      _count: { logs: c.logs.length, notes: c._count.notes },
      stats,
    }
  })

  return NextResponse.json({ challenges: withStats })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const title = String(body.title ?? "").trim()
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 },
      )
    }
    const description = String(body.description ?? "").trim()
    const category = validateCategory(String(body.category ?? "Mind"))
    const duration = Math.max(1, Math.min(365, Number(body.duration) || 21))
    const dailyTarget = String(body.dailyTarget ?? "").trim()
    const color = validateColor(String(body.color ?? "emerald"))
    const icon = validateIcon(String(body.icon ?? "Target"))
    const startDateRaw = body.startDate
      ? new Date(body.startDate)
      : new Date()
    if (Number.isNaN(startDateRaw.getTime())) {
      return NextResponse.json({ error: "Invalid start date" }, { status: 400 })
    }

    const challenge = await db.challenge.create({
      data: {
        title,
        description,
        category,
        duration,
        dailyTarget,
        color,
        icon,
        startDate: startDateRaw,
        status: "active",
      },
    })

    // Pre-seed DailyLog rows for every day of the challenge (so the
    // calendar/log view is dense and easy to render). Mark all as not done.
    const start = new Date(startDateRaw)
    start.setHours(0, 0, 0, 0)
    const logRows: {
      challengeId: string
      date: Date
      dayNumber: number
      completed: boolean
    }[] = []
    for (let i = 0; i < duration; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      logRows.push({
        challengeId: challenge.id,
        date: d,
        dayNumber: i + 1,
        completed: false,
      })
    }
    if (logRows.length) {
      await db.dailyLog.createMany({ data: logRows })
    }

    const created = await db.challenge.findUnique({
      where: { id: challenge.id },
      include: { logs: true },
    })

    return NextResponse.json({
      challenge: {
        id: created!.id,
        title: created!.title,
        description: created!.description,
        category: created!.category,
        duration: created!.duration,
        dailyTarget: created!.dailyTarget,
        color: created!.color,
        icon: created!.icon,
        startDate: created!.startDate.toISOString(),
        status: created!.status,
        createdAt: created!.createdAt.toISOString(),
        updatedAt: created!.updatedAt.toISOString(),
        _count: { logs: created!.logs.length, notes: 0 },
        stats: computeChallengeStats(
          created!.startDate,
          created!.duration,
          created!.logs,
        ),
      },
    })
  } catch (e) {
    console.error("[POST /api/challenges]", e)
    return NextResponse.json(
      { error: "Failed to create challenge" },
      { status: 500 },
    )
  }
}

// Helper used elsewhere to lazily update a challenge's status.
export async function refreshChallengeStatus(challengeId: string) {
  const c = await db.challenge.findUnique({
    where: { id: challengeId },
    include: { logs: true },
  })
  if (!c) return
  const next = deriveStatus(c.startDate, c.duration, c.logs, c.status)
  if (next && next !== c.status) {
    await db.challenge.update({
      where: { id: challengeId },
      data: { status: next },
    })
  }
}

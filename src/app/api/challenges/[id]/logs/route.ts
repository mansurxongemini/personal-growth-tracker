import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { computeChallengeStats, deriveStatus } from "@/lib/analytics"
import { normalizeDate, toISODay } from "@/lib/date-utils"

export const dynamic = "force-dynamic"

/**
 * GET /api/challenges/[id]/logs
 * Returns the logs for a challenge.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const logs = await db.dailyLog.findMany({
    where: { challengeId: id },
    orderBy: { dayNumber: "asc" },
  })
  return NextResponse.json({
    logs: logs.map((l) => ({
      id: l.id,
      challengeId: l.challengeId,
      date: l.date.toISOString(),
      dayNumber: l.dayNumber,
      completed: l.completed,
    })),
  })
}

/**
 * POST /api/challenges/[id]/logs
 * Toggle (or set) the check-in for a given day. Body:
 *   { date?: ISO string (defaults to today), completed?: boolean (toggles if omitted) }
 * Returns the updated log + refreshed stats.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const challenge = await db.challenge.findUnique({ where: { id } })
  if (!challenge)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  const targetDate = body.date ? new Date(body.date) : new Date()
  if (Number.isNaN(targetDate.getTime()))
    return NextResponse.json({ error: "Invalid date" }, { status: 400 })

  const dayNorm = normalizeDate(targetDate)
  const iso = toISODay(dayNorm)
  const startNorm = normalizeDate(challenge.startDate)
  const dayNumber =
    Math.floor(
      (dayNorm.getTime() - startNorm.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1

  // Only allow toggling within the challenge window.
  if (dayNumber < 1 || dayNumber > challenge.duration) {
    return NextResponse.json(
      {
        error: `That day is outside the challenge window (day ${dayNumber}).`,
      },
      { status: 400 },
    )
  }

  const existing = await db.dailyLog.findUnique({
    where: {
      challengeId_date: { challengeId: id, date: dayNorm },
    },
  })

  let completed: boolean
  if (existing) {
    completed =
      typeof body.completed === "boolean" ? body.completed : !existing.completed
    await db.dailyLog.update({
      where: { id: existing.id },
      data: { completed, dayNumber },
    })
  } else {
    completed = typeof body.completed === "boolean" ? body.completed : true
    await db.dailyLog.create({
      data: {
        challengeId: id,
        date: dayNorm,
        dayNumber,
        completed,
      },
    })
  }

  // Refresh status + stats.
  const logs = await db.dailyLog.findMany({ where: { challengeId: id } })
  const next = deriveStatus(
    challenge.startDate,
    challenge.duration,
    logs,
    challenge.status,
  )
  if (next && next !== challenge.status) {
    await db.challenge.update({ where: { id }, data: { status: next } })
  }
  const stats = computeChallengeStats(
    challenge.startDate,
    challenge.duration,
    logs,
  )

  return NextResponse.json({
    date: iso,
    dayNumber,
    completed,
    stats,
    status: next ?? challenge.status,
  })
}

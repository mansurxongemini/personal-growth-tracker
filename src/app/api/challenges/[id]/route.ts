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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const c = await db.challenge.findUnique({
    where: { id },
    include: {
      logs: { orderBy: { dayNumber: "asc" } },
      notes: { orderBy: { date: "desc" } },
    },
  })
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({
    challenge: {
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
      logs: c.logs.map((l) => ({
        id: l.id,
        challengeId: l.challengeId,
        date: l.date.toISOString(),
        dayNumber: l.dayNumber,
        completed: l.completed,
      })),
      notes: c.notes.map((n) => ({
        id: n.id,
        challengeId: n.challengeId,
        dailyLogId: n.dailyLogId,
        title: n.title,
        content: n.content,
        mood: n.mood,
        date: n.date.toISOString(),
        createdAt: n.createdAt.toISOString(),
      })),
      stats: computeChallengeStats(c.startDate, c.duration, c.logs),
    },
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await req.json()
  const existing = await db.challenge.findUnique({ where: { id } })
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  const data: Record<string, unknown> = {}
  if (typeof body.title === "string" && body.title.trim())
    data.title = body.title.trim()
  if (typeof body.description === "string") data.description = body.description
  if (typeof body.category === "string")
    data.category = validateCategory(body.category)
  if (body.duration != null)
    data.duration = Math.max(1, Math.min(365, Number(body.duration) || 21))
  if (typeof body.dailyTarget === "string")
    data.dailyTarget = body.dailyTarget
  if (typeof body.color === "string") data.color = validateColor(body.color)
  if (typeof body.icon === "string") data.icon = validateIcon(body.icon)
  if (typeof body.status === "string")
    data.status = ["active", "completed", "failed", "paused"].includes(
      body.status,
    )
      ? body.status
      : existing.status
  if (body.startDate) {
    const d = new Date(body.startDate)
    if (!Number.isNaN(d.getTime())) data.startDate = d
  }

  const updated = await db.challenge.update({
    where: { id },
    data,
    include: { logs: true },
  })
  const next = deriveStatus(
    updated.startDate,
    updated.duration,
    updated.logs,
    updated.status,
  )
  if (next && next !== updated.status) {
    await db.challenge.update({ where: { id }, data: { status: next } })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  await db.challenge.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

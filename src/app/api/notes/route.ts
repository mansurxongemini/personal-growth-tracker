import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { MOOD_KEYS } from "@/lib/challenge-config"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const url = req.nextUrl
  const challengeId = url.searchParams.get("challengeId")
  const where = challengeId ? { challengeId } : {}
  const notes = await db.note.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      challenge: {
        select: { id: true, title: true, color: true },
      },
    },
  })
  return NextResponse.json({
    notes: notes.map((n) => ({
      id: n.id,
      challengeId: n.challengeId,
      dailyLogId: n.dailyLogId,
      title: n.title,
      content: n.content,
      mood: n.mood,
      date: n.date.toISOString(),
      createdAt: n.createdAt.toISOString(),
      challenge: n.challenge
        ? {
            id: n.challenge.id,
            title: n.challenge.title,
            color: n.challenge.color,
          }
        : null,
    })),
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const content = String(body.content ?? "").trim()
  if (!content) {
    return NextResponse.json({ error: "Content required" }, { status: 400 })
  }
  const title = String(body.title ?? "").trim()
  const mood = MOOD_KEYS.includes(body.mood) ? body.mood : "neutral"
  const challengeId =
    typeof body.challengeId === "string" && body.challengeId
      ? body.challengeId
      : null
  const dailyLogId =
    typeof body.dailyLogId === "string" && body.dailyLogId
      ? body.dailyLogId
      : null
  const date = body.date ? new Date(body.date) : new Date()

  const note = await db.note.create({
    data: { title, content, mood, challengeId, dailyLogId, date },
    include: {
      challenge: {
        select: { id: true, title: true, color: true },
      },
    },
  })
  return NextResponse.json({
    note: {
      id: note.id,
      challengeId: note.challengeId,
      dailyLogId: note.dailyLogId,
      title: note.title,
      content: note.content,
      mood: note.mood,
      date: note.date.toISOString(),
      createdAt: note.createdAt.toISOString(),
      challenge: note.challenge
        ? {
            id: note.challenge.id,
            title: note.challenge.title,
            color: note.challenge.color,
          }
        : null,
    },
  })
}

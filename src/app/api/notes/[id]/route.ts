import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { MOOD_KEYS } from "@/lib/challenge-config"

export const dynamic = "force-dynamic"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await req.json()
  const existing = await db.note.findUnique({ where: { id } })
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  const data: Record<string, unknown> = {}
  if (typeof body.title === "string") data.title = body.title
  if (typeof body.content === "string") data.content = body.content
  if (body.mood && MOOD_KEYS.includes(body.mood)) data.mood = body.mood
  if (body.challengeId !== undefined)
    data.challengeId = body.challengeId || null
  if (body.dailyLogId !== undefined) data.dailyLogId = body.dailyLogId || null

  await db.note.update({ where: { id }, data })
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  await db.note.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

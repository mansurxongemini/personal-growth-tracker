import { NextResponse } from "next/server"
import { computeAchievements } from "@/lib/achievements"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const data = await computeAchievements()
    return NextResponse.json(data)
  } catch (e) {
    console.error("[GET /api/achievements]", e)
    return NextResponse.json(
      { error: "Failed to compute achievements" },
      { status: 500 },
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { buildSystemPrompt, buildUserContext } from "@/lib/ai-context"
import { runChat, type ChatMessage, getProvider } from "@/lib/ai-provider"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * GET /api/ai  → recent conversation history (last 30 messages)
 */
export async function GET() {
  const messages = await db.aiMessage.findMany({
    orderBy: { createdAt: "asc" },
    take: 30,
  })
  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  })
}

/**
 * POST /api/ai  → context-aware chat completion
 * Body: { message: string }
 *
 * Architecture (per guide):
 *   1. Load AiSetting (singleton, scope=global)
 *   2. Gather all user data → buildUserContext()
 *   3. Build system prompt with injected context
 *   4. Load recent conversation history
 *   5. Run chat through the universal provider adapter (z-ai SDK)
 *   6. Persist user + assistant messages
 *   7. Return assistant reply + lightweight usage info
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message = String(body?.message ?? "").trim()
    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 })
    }
    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message too long (max 2000 chars)" },
        { status: 400 },
      )
    }

    // 1. Load AI settings (singleton global)
    let settings = await db.aiSetting.findUnique({
      where: { scope_userId: { scope: "global", userId: "" } },
    })
    if (!settings) {
      settings = await db.aiSetting.create({
        data: { scope: "global", userId: "" },
      })
    }
    if (!settings.enabled) {
      return NextResponse.json(
        { error: "AI yordamchi o'chirilgan. Sozlamalardan yoqing." },
        { status: 403 },
      )
    }

    // 2. Gather context
    const context = await buildUserContext()

    // 3. Build system prompt
    const systemPrompt = buildSystemPrompt(
      context.text,
      settings.systemPrompt || undefined,
    )

    // 4. Load recent history (last 12 messages, excluding system)
    const recent = await db.aiMessage.findMany({
      orderBy: { createdAt: "asc" },
      take: 12,
    })

    const historyMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...recent
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: message },
    ]

    // 5. Run through the universal adapter
    const providerCfg = getProvider(settings.provider)
    const result = await runChat(historyMessages, {
      provider: settings.provider,
      model: settings.model || providerCfg.models[0],
      apiKey: settings.apiKey,
      temperature: settings.temperature,
    })

    if (!result.content.trim()) {
      return NextResponse.json(
        { error: "AI bo'sh javob qaytardi. Qayta urinib ko'ring." },
        { status: 502 },
      )
    }

    // 6. Persist messages (with a compact context snapshot for audit)
    const contextSnapshot = `Challenges: ${context.stats.totalChallenges} | Active: ${context.stats.activeChallenges} | Check-ins: ${context.stats.totalCheckIns} | Streak: ${context.stats.currentStreak}`
    await db.aiMessage.createMany({
      data: [
        {
          role: "user",
          content: message,
          context: contextSnapshot,
        },
        {
          role: "assistant",
          content: result.content,
          context: `model=${result.model} provider=${result.provider}`,
        },
      ],
    })

    // 7. Return
    return NextResponse.json({
      reply: result.content,
      model: result.model,
      provider: result.provider,
      usage: result.usage,
      contextStats: context.stats,
    })
  } catch (e) {
    console.error("[POST /api/ai]", e)
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? `AI xatosi: ${e.message}`
            : "AI so'rovida noma'lum xato",
      },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/ai  → clear conversation history
 */
export async function DELETE() {
  await db.aiMessage.deleteMany({})
  return NextResponse.json({ ok: true })
}

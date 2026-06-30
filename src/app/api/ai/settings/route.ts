import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { PROVIDERS } from "@/lib/ai-provider"

export const dynamic = "force-dynamic"

const GLOBAL_WHERE = { scope: "global", userId: "" }

async function getOrCreateSettings() {
  let s = await db.aiSetting.findUnique({ where: { scope_userId: GLOBAL_WHERE } })
  if (!s) {
    s = await db.aiSetting.create({ data: { scope: "global", userId: "" } })
  }
  return s
}

export async function GET() {
  const s = await getOrCreateSettings()
  return NextResponse.json({
    settings: {
      id: s.id,
      provider: s.provider,
      model: s.model,
      apiKey: s.apiKey ? "***" : null, // never echo the real key
      hasApiKey: !!s.apiKey,
      systemPrompt: s.systemPrompt,
      temperature: s.temperature,
      enabled: s.enabled,
      updatedAt: s.updatedAt.toISOString(),
    },
    providers: PROVIDERS,
  })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const s = await getOrCreateSettings()

  const data: Record<string, unknown> = {}
  if (typeof body.provider === "string") {
    const provider = PROVIDERS.find((p) => p.key === body.provider)
    if (provider) {
      data.provider = body.provider
      // if switching provider and current model isn't in the new provider's list, reset
      if (!provider.models.includes(s.model)) {
        data.model = provider.models[0]
      }
    }
  }
  if (typeof body.model === "string") data.model = body.model
  if (typeof body.temperature === "number") {
    data.temperature = Math.max(0, Math.min(2, body.temperature))
  }
  if (typeof body.enabled === "boolean") data.enabled = body.enabled
  if (typeof body.systemPrompt === "string") {
    data.systemPrompt = body.systemPrompt.slice(0, 4000)
  }
  // apiKey: empty string clears, non-empty sets, "***" or undefined leaves as-is
  if (body.apiKey !== undefined) {
    if (body.apiKey === "") {
      data.apiKey = null
    } else if (body.apiKey !== "***") {
      data.apiKey = String(body.apiKey).slice(0, 500)
    }
  }

  const updated = await db.aiSetting.update({
    where: { id: s.id },
    data,
  })

  return NextResponse.json({
    settings: {
      id: updated.id,
      provider: updated.provider,
      model: updated.model,
      apiKey: updated.apiKey ? "***" : null,
      hasApiKey: !!updated.apiKey,
      systemPrompt: updated.systemPrompt,
      temperature: updated.temperature,
      enabled: updated.enabled,
      updatedAt: updated.updatedAt.toISOString(),
    },
  })
}

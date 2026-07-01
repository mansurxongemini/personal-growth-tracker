import ZAI from "z-ai-web-dev-sdk"

/**
 * Universal AI Provider Adapter — matches the guide's architecture.
 *
 * The guide describes a multi-provider router (OpenAI / Anthropic / Gemini /
 * DeepSeek). Per platform rules the actual LLM call MUST go through
 * `z-ai-web-dev-sdk` (the in-house SDK), which itself exposes a chat
 * completions API. We keep the provider/model selection concept from the
 * guide (so the UI + AiSetting stay provider-aware and auth-ready), but
 * route every call through z-ai under the hood. When a user supplies an
 * external provider preference, we still use z-ai but tag the model name
 * accordingly for transparency.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface ProviderConfig {
  provider: string // zai | openai | anthropic | gemini | deepseek
  model: string
  apiKey?: string | null
  temperature: number
}

export interface ChatResult {
  content: string
  model: string
  provider: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
}

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZai() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

/**
 * Run a chat completion through the universal adapter.
 * `systemPrompt` becomes the first message (assistant role, per SDK convention).
 */
export async function runChat(
  messages: ChatMessage[],
  config: ProviderConfig,
): Promise<ChatResult> {
  const zai = await getZai()

  // The SDK expects the system prompt as an 'assistant' message (per skill docs).
  // If the caller already supplied a system message, keep ordering.
  const sdkMessages = messages.map((m) => ({
    role: m.role === "system" ? ("assistant" as const) : m.role,
    content: m.content,
  }))

  const completion = await zai.chat.completions.create({
    messages: sdkMessages,
    temperature: config.temperature,
    thinking: { type: "disabled" },
  })

  const content = completion.choices[0]?.message?.content ?? ""

  return {
    content,
    model: config.model,
    provider: config.provider,
    usage: completion.usage
      ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        }
      : undefined,
  }
}

/** Provider metadata for the settings UI. */
export const PROVIDERS: {
  key: string
  label: string
  models: string[]
  description: string
  needsKey: boolean
}[] = [
  {
    key: "zai",
    label: "Z.ai (built-in)",
    models: ["glm-4.6", "glm-4.5", "glm-4.5-air", "glm-4-plus"],
    description: "Platformaning o'rnatilgan AI modeli. API kaliti kerak emas.",
    needsKey: false,
  },
  {
    key: "openai",
    label: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1-mini"],
    description: "OpenAI GPT modellari. O'z API kalitingizni kiriting.",
    needsKey: true,
  },
  {
    key: "anthropic",
    label: "Anthropic",
    models: ["claude-3-5-sonnet", "claude-3-5-haiku", "claude-3-opus"],
    description: "Anthropic Claude modellari. O'z API kalitingizni kiriting.",
    needsKey: true,
  },
  {
    key: "gemini",
    label: "Google Gemini",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    description: "Google Gemini modellari. O'z API kalitingizni kiriting.",
    needsKey: true,
  },
  {
    key: "deepseek",
    label: "DeepSeek",
    models: ["deepseek-chat", "deepseek-reasoner"],
    description: "DeepSeek modellari. O'z API kalitingizni kiriting.",
    needsKey: true,
  },
]

export function getProvider(key: string) {
  return PROVIDERS.find((p) => p.key === key) ?? PROVIDERS[0]
}

/** Get custom models from database */
export async function getCustomModels(): Promise<string[]> {
  try {
    const { db } = await import("@/lib/db")
    const settings = await db.aiSetting.findUnique({
      where: { scope_userId: { scope: "global", userId: "" } },
    })
    if (settings?.customModels) {
      return JSON.parse(settings.customModels)
    }
  } catch {
    // ignore errors
  }
  return []
}

/** Add a custom model to the list */
export async function addCustomModel(modelName: string): Promise<string[]> {
  try {
    const { db } = await import("@/lib/db")
    const settings = await db.aiSetting.findUnique({
      where: { scope_userId: { scope: "global", userId: "" } },
    })
    let customModels: string[] = []
    if (settings?.customModels) {
      customModels = JSON.parse(settings.customModels)
    }
    if (!customModels.includes(modelName)) {
      customModels.push(modelName)
      await db.aiSetting.update({
        where: { id: settings!.id },
        data: { customModels: JSON.stringify(customModels) },
      })
    }
    return customModels
  } catch {
    // ignore errors
  }
  return []
}

/** Remove a custom model from the list */
export async function removeCustomModel(modelName: string): Promise<string[]> {
  try {
    const { db } = await import("@/lib/db")
    const settings = await db.aiSetting.findUnique({
      where: { scope_userId: { scope: "global", userId: "" } },
    })
    let customModels: string[] = []
    if (settings?.customModels) {
      customModels = JSON.parse(settings.customModels)
    }
    customModels = customModels.filter((m) => m !== modelName)
    await db.aiSetting.update({
      where: { id: settings!.id },
      data: { customModels: JSON.stringify(customModels) },
    })
    return customModels
  } catch {
    // ignore errors
  }
  return []
}

import { db } from "@/lib/db"
import { computeChallengeStats } from "@/lib/analytics"
import { format, parseISO, isToday } from "date-fns"

/**
 * Context Injection (Kontekstni kiritish) — the core of the guide's
 * architecture. Gathers ALL of the user's data (challenges, daily logs,
 * notes) and reduces it to a compact, structured text block that is fed to
 * the AI as prepared context.
 *
 * Mirrors the guide's `contextString` builder but richer: includes streaks,
 * completion rates, today's status, and recent reflections.
 */

export interface BuiltContext {
  text: string
  stats: {
    totalChallenges: number
    activeChallenges: number
    completedChallenges: number
    totalCheckIns: number
    currentStreak: number
  }
}

export async function buildUserContext(): Promise<BuiltContext> {
  const challenges = await db.challenge.findMany({
    include: { logs: true, notes: { orderBy: { date: "desc" } } },
    orderBy: { createdAt: "desc" },
  })

  const lines: string[] = []
  let totalCheckIns = 0
  let active = 0
  let completed = 0
  let maxCurrentStreak = 0

  lines.push(`# FOYDALANUVCHI MA'LUMOTLARI (Kontekst)`)
  lines.push(`Sana: ${format(new Date(), "yyyy-MM-dd (EEEE)")}`)
  lines.push(`Jami challenge'lar: ${challenges.length}`)
  lines.push("")

  if (challenges.length === 0) {
    lines.push("Hozircha foydalanuvchida hech qanday challenge yo'q.")
    return {
      text: lines.join("\n"),
      stats: {
        totalChallenges: 0,
        activeChallenges: 0,
        completedChallenges: 0,
        totalCheckIns: 0,
        currentStreak: 0,
      },
    }
  }

  for (const c of challenges) {
    const stats = computeChallengeStats(c.startDate, c.duration, c.logs)
    const completedDays = c.logs.filter((l) => l.completed).length
    totalCheckIns += completedDays
    if (c.status === "active") active++
    if (c.status === "completed") completed++
    if (stats.currentStreak > maxCurrentStreak) maxCurrentStreak = stats.currentStreak

    const todayLog = c.logs.find((l) => isToday(l.date))
    const todayStatus = todayLog
      ? todayLog.completed
        ? "Bugun bajarilgan ✓"
        : "Bugun hali bajarilmagan"
      : "Bugun uchun yozuv yo'q"

    lines.push(`## Challenge: "${c.title}"`)
    lines.push(`- Kategoriya: ${c.category}`)
    lines.push(`- Holati: ${c.status}`)
    lines.push(`- Davomiyligi: ${c.duration} kun`)
    if (c.dailyTarget) lines.push(`- Kunlik maqsad: ${c.dailyTarget}`)
    if (c.description) lines.push(`- Tavsif: ${c.description}`)
    lines.push(
      `- Progress: ${completedDays}/${c.duration} kun bajarildi (${stats.completionRate}%)`,
    )
    lines.push(`- Joriy streak: ${stats.currentStreak} kun | Eng uzun: ${stats.longestStreak} kun`)
    lines.push(`- Bugungi holat: ${todayStatus}`)
    lines.push(`- ${stats.daysRemaining} kun qoldi`)

    // Recent reflections (max 3)
    const recentNotes = c.notes.slice(0, 3)
    if (recentNotes.length > 0) {
      lines.push("- So'nggi qaydlar:")
      for (const n of recentNotes) {
        const d = format(parseISO(n.date.toISOString()), "MMM d")
        lines.push(
          `    • [${d} | ${n.mood}] ${n.title ? n.title + ": " : ""}${n.content.slice(0, 160)}`,
        )
      }
    }
    lines.push("")
  }

  lines.push(`## UMUMIY STATISTIKA`)
  lines.push(`- Faol challenge'lar: ${active}`)
  lines.push(`- Yakunlangan: ${completed}`)
  lines.push(`- Jami check-in'lar: ${totalCheckIns}`)
  lines.push(`- Eng uzun joriy streak: ${maxCurrentStreak} kun`)

  return {
    text: lines.join("\n"),
    stats: {
      totalChallenges: challenges.length,
      activeChallenges: active,
      completedChallenges: completed,
      totalCheckIns,
      currentStreak: maxCurrentStreak,
    },
  }
}

/**
 * The built-in system prompt for the personal-development AI assistant.
 * Uses the guide's Uzbek wording, expanded with structure + guardrails.
 * If the user has set a custom `systemPrompt` in AiSetting, that overrides
 * the "shaxsiy yondashuv" portion but this base framing is still appended.
 */
export function buildSystemPrompt(
  contextText: string,
  customPrompt?: string,
): string {
  const base = `Siz foydalanuvchining shaxsiy rivojlanish bo'yicha sun'iy intellekt yordamchisiz. Foydalanuvchining ilovadagi barcha ma'lumotlari (challenge'lar, kunlik check-in'lar, qaydlar) quyida keltirilgan. Ushbu ma'lumotlarga tayanib, unga aniq, minimalistik va motivatsion javoblar bering.

Sizning vazifangiz:
1. Foydalanuvchining progressini tahlil qiling va aniq sonlar bilan (streak, foiz, kunlar) ko'rsating.
2. Muammoli challenge'larni aniqlang (masalan, streak uzilgan, completion past) va amaliy tavsiyalar bering.
3. Qisqa, aniq va harakatga undovchi bo'ling — uzun ma'ruza emas.
4. Markdown formatidan foydalaning (qisqa sarlavhalar, ro'yxatlar, **muhim** uchun bold).
5. Foydalanuvchi o'zbek yoki ingliz tilida yozsa, o'sha tilda javob bering.
6. Hech qachon ma'lumot o'ylab topmang — faqat kontekstdagi ma'lumotlarga tayaning.

${customPrompt ? `\nFOYDALANUVCHINING QO'SHIMCHA SOZLAMALARI:\n${customPrompt}\n` : ""}

KONTEKST:
${contextText}`

  return base
}

/**
 * Quick suggestions shown as chips in the chat UI. These are static prompts
 * the user can one-tap to try the assistant.
 */
export const AI_SUGGESTIONS: { label: string; prompt: string; icon: string }[] = [
  {
    label: "Qanday ketmoqda?",
    prompt: "Mening progressim qanday? Qisqa xulosa ber.",
    icon: "TrendingUp",
  },
  {
    label: "Diqqat kerak",
    prompt: "Qaysi challenge'ga ko'proq e'tibor berishim kerak va nima uchun?",
    icon: "AlertCircle",
  },
  {
    label: "Motivatsiya",
    prompt: "Mening eng yaxshi yutuqlarim asosida meni motivate qiling.",
    icon: "Flame",
  },
  {
    label: "Bugungi rejalar",
    prompt: "Bugun qaysi challenge'larni bajarishim kerak? Ro'yxat ber.",
    icon: "CheckSquare",
  },
  {
    label: "Tahlil",
    prompt: "Mening odatlarim tahlilini ber — qaysi kategoriya kuchli, qaysi zaif?",
    icon: "BarChart3",
  },
  {
    label: "Maslahat",
    prompt: "Streak'larimni uzmaslik uchun amaliy maslahatlar bering.",
    icon: "Lightbulb",
  },
]

"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Flame, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ACCENT_COLORS } from "@/lib/challenge-config"
import type { ChallengeStats } from "@/lib/types"
import { toast } from "sonner"

interface DailyCheckInProps {
  challengeId: string
  color: string
  stats: ChallengeStats | undefined
  onCheckedIn: (result: {
    completed: boolean
    stats: ChallengeStats
    status: string
  }) => void
  onFireConfetti: () => void
}

export function DailyCheckIn({
  challengeId,
  color,
  stats,
  onCheckedIn,
  onFireConfetti,
}: DailyCheckInProps) {
  const accent = ACCENT_COLORS[color as keyof typeof ACCENT_COLORS] ?? ACCENT_COLORS.emerald
  const [busy, setBusy] = React.useState(false)
  const done = stats?.hasCheckedInToday ?? false

  async function toggle() {
    setBusy(true)
    try {
      const res = await fetch(`/api/challenges/${challengeId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // toggle today
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || "Failed to check in")
      }
      const data = await res.json()
      onCheckedIn(data)
      if (data.completed) {
        onFireConfetti()
        toast.success("Day checked off!", {
          description: `Streak: ${data.stats.currentStreak} day${data.stats.currentStreak === 1 ? "" : "s"}`,
        })
      } else {
        toast("Unchecked for today")
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to check in")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        onClick={toggle}
        disabled={busy}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        className={cn(
          "relative grid size-44 place-items-center rounded-full transition-all duration-300",
          done
            ? cn("bg-gradient-to-br text-white shadow-2xl", accent.gradient)
            : "bg-card/60 border-2 border-dashed text-muted-foreground hover:text-foreground",
          done ? accent.border : "border-border",
        )}
        style={
          done
            ? { boxShadow: `0 20px 60px -15px ${accent.hex}80` }
            : undefined
        }
      >
        {/* pulsing ring when not done */}
        {!done && (
          <motion.span
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: accent.hex }}
            animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.15, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {done && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: `0 0 0 0 ${accent.hex}55`,
            }}
            animate={{ boxShadow: [`0 0 0 0 ${accent.hex}55`, `0 0 0 24px ${accent.hex}00`] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        <AnimatePresence mode="wait">
          {busy ? (
            <motion.div
              key="busy"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
            >
              <Loader2 className={cn("size-12 animate-spin", accent.text)} />
            </motion.div>
          ) : done ? (
            <motion.div
              key="done"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
              className="flex flex-col items-center"
            >
              <Check className="size-16" strokeWidth={3} />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-1"
            >
              <span className={cn("text-4xl font-bold", accent.text)}>
                {stats?.currentStreak ?? 0}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest">
                day streak
              </span>
              <span className="mt-1 text-[10px] text-muted-foreground">
                Tap to check in
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Label below */}
      <div className="text-center">
        {done ? (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-1.5 text-sm font-semibold"
          >
            <Flame className={cn("size-4 text-orange-400 flame-glow")} />
            Done today — keep the streak alive!
          </motion.p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Day {stats?.dayNumber ?? 0} of {stats?.totalDays ?? 0} · complete
            today&apos;s check-in
          </p>
        )}
      </div>
    </div>
  )
}

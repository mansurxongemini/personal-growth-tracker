"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Flame,
  CheckCircle2,
  CalendarCheck,
  ArrowRight,
  Sparkles,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Confetti } from "@/components/confetti"
import { useAppStore } from "@/lib/store"
import { ACCENT_COLORS, CATEGORY_MAP } from "@/lib/challenge-config"
import { ChallengeIcon } from "@/components/challenge-icon"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function TodayFocus() {
  const challenges = useAppStore((s) => s.challenges)
  const openChallenge = useAppStore((s) => s.openChallenge)
  const setCreateOpen = useAppStore((s) => s.setCreateOpen)
  const patchChallengeStats = useAppStore((s) => s.patchChallengeStats)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [confettiSignal, setConfettiSignal] = React.useState(0)

  const active = challenges.filter((c) => c.status === "active")
  const doneToday = active.filter((c) => c.stats?.hasCheckedInToday)
  const pendingToday = active.filter((c) => !c.stats?.hasCheckedInToday)

  const totalStreak = challenges.reduce(
    (s, c) => s + (c.stats?.currentStreak ?? 0),
    0,
  )
  const longestStreak = challenges.reduce(
    (s, c) => s + (c.stats?.longestStreak ?? 0),
    0,
  )

  async function quickCheckIn(challengeId: string) {
    setBusyId(challengeId)
    try {
      const res = await fetch(`/api/challenges/${challengeId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || "Failed")
      }
      const data = await res.json()
      patchChallengeStats(challengeId, data.stats)
      if (data.completed) {
        setConfettiSignal((s) => s + 1)
        toast.success("Checked in!", {
          description: `Streak now ${data.stats.currentStreak} day${
            data.stats.currentStreak === 1 ? "" : "s"
          } 🔥`,
        })
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to check in")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-6 overflow-hidden rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-md sm:p-8"
    >
      {/* Glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 size-64 rounded-full bg-gradient-to-br from-violet-500/15 to-fuchsia-500/5 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: greeting + stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border/60 bg-background/40 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Today&apos;s focus
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <CalendarCheck className="size-3 text-emerald-400" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {doneToday.length === active.length && active.length > 0 ? (
              <span className="text-gradient">All caught up for today.</span>
            ) : pendingToday.length > 0 ? (
              <>
                {pendingToday.length} challenge
                {pendingToday.length === 1 ? "" : "s"} to check in
              </>
            ) : (
              <>Ready to start a new challenge?</>
            )}
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <Stat
              icon={<Flame className="size-3.5 text-orange-400 flame-glow" />}
              value={totalStreak}
              label="total streak"
            />
            <Stat
              icon={<Sparkles className="size-3.5 text-amber-400" />}
              value={longestStreak}
              label="best streak"
            />
            <Stat
              icon={<CheckCircle2 className="size-3.5 text-emerald-400" />}
              value={doneToday.length}
              label={`/ ${active.length} done today`}
            />
          </div>
        </div>

        {/* Right: quick check-in list */}
        {pendingToday.length > 0 ? (
          <div className="w-full max-w-md space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Quick check-in
            </p>
            <div className="max-h-56 space-y-2 overflow-y-auto scrollbar-thin pr-1">
              {pendingToday.map((c) => {
                const accent =
                  ACCENT_COLORS[c.color as never] ?? ACCENT_COLORS.emerald
                const cat = CATEGORY_MAP[c.category as never]
                const isBusy = busyId === c.id
                return (
                  <motion.div
                    key={c.id}
                    layout
                    whileHover={{ x: 2 }}
                    className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-2.5 backdrop-blur-md transition-colors hover:border-border"
                  >
                    <div
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white",
                        accent.gradient,
                      )}
                    >
                      <ChallengeIcon name={c.icon} className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.title}</p>
                      <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                        <span>{cat?.emoji}</span>
                        Day {c.stats?.dayNumber ?? 0}/{c.stats?.totalDays ?? c.duration}
                        <span>·</span>
                        <Flame className="size-2.5 text-orange-400" />
                        {c.stats?.currentStreak ?? 0}d
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openChallenge(c.id)}
                      className="size-8 rounded-full p-0 text-muted-foreground hover:bg-accent"
                    >
                      <ArrowRight className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => quickCheckIn(c.id)}
                      disabled={isBusy}
                      className={cn(
                        "gap-1 rounded-full text-white shadow-md transition-all hover:brightness-110",
                        "bg-gradient-to-r",
                        accent.gradient,
                      )}
                    >
                      {isBusy ? (
                        <span className="size-3 animate-pulse rounded-full bg-white/80" />
                      ) : (
                        <CheckCircle2 className="size-3.5" />
                      )}
                      <span className="hidden sm:inline">Done</span>
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ) : active.length > 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center"
          >
            <CheckCircle2 className="size-10 text-emerald-400" />
            <p className="text-sm font-semibold text-emerald-500">
              Every active challenge is done!
            </p>
            <p className="text-xs text-muted-foreground">
              Enjoy the win. See you tomorrow.
            </p>
          </motion.div>
        ) : (
          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:brightness-110"
          >
            <Plus className="size-4" /> Create a challenge
          </Button>
        )}
      </div>

      {/* Tiny confetti on quick check-in */}
      <QuickConfetti fire={confettiSignal} />
    </motion.section>
  )
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number
  label: string
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-xs backdrop-blur-md">
      {icon}
      <span className="font-semibold tabular-nums">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}

// Local confetti that doesn't need a full-screen overlay import
function QuickConfetti({ fire }: { fire: number }) {
  return <Confetti fire={fire} duration={1800} />
}

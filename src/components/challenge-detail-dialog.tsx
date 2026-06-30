"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Flame,
  Trophy,
  Target,
  CalendarDays,
  TrendingUp,
  X,
  PenLine,
  ChevronLeft,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ACCENT_COLORS, CATEGORY_MAP } from "@/lib/challenge-config"
import type {
  ChallengeStats,
  ChallengeWithStats,
  DailyLogEntry,
  NoteEntry,
} from "@/lib/types"
import { ChallengeIcon } from "@/components/challenge-icon"
import { DailyCheckIn } from "@/components/daily-check-in"
import { DayGrid } from "@/components/day-grid"
import { RingProgress } from "@/components/ring-progress"
import { Button } from "@/components/ui/button"
import { Confetti } from "@/components/confetti"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import { format, parseISO } from "date-fns"
import { MOOD_CONFIG } from "@/lib/challenge-config"

interface ChallengeDetail {
  id: string
  title: string
  description: string
  category: string
  duration: number
  dailyTarget: string
  color: string
  icon: string
  startDate: string
  status: string
  createdAt: string
  updatedAt: string
  logs: DailyLogEntry[]
  notes: NoteEntry[]
  stats: ChallengeStats
}

export function ChallengeDetailDialog() {
  const selectedId = useAppStore((s) => s.selectedChallengeId)
  const closeChallenge = useAppStore((s) => s.closeChallenge)
  const patchChallengeStats = useAppStore((s) => s.patchChallengeStats)
  const updateChallengeStatus = useAppStore((s) => s.updateChallengeStatus)
  const openNoteComposer = useAppStore((s) => s.openNoteComposer)
  const open = !!selectedId

  const [detail, setDetail] = React.useState<ChallengeDetail | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [confettiFire, setConfettiFire] = React.useState(0)

  // Load detail when opened
  React.useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      return
    }
    let cancelled = false
    setLoading(true)
    fetch(`/api/challenges/${selectedId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.challenge) setDetail(d.challenge)
      })
      .catch(() => toast.error("Failed to load challenge"))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [selectedId])

  const accent = detail
    ? ACCENT_COLORS[detail.color as keyof typeof ACCENT_COLORS] ?? ACCENT_COLORS.emerald
    : ACCENT_COLORS.emerald

  async function handleToggleDay(dateISO: string) {
    if (!detail) return
    try {
      const res = await fetch(`/api/challenges/${detail.id}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateISO }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || "Failed to toggle")
      }
      const data = await res.json()
      // refresh detail
      const refreshed = await fetch(`/api/challenges/${detail.id}`).then((r) =>
        r.json(),
      )
      if (refreshed.challenge) setDetail(refreshed.challenge)
      patchChallengeStats(detail.id, data.stats)
      if (data.status && data.status !== detail.status) {
        updateChallengeStatus(detail.id, data.status)
      }
      if (data.completed) {
        setConfettiFire((f) => f + 1)
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to toggle")
    }
  }

  function handleCheckIn(result: {
    completed: boolean
    stats: ChallengeStats
    status: string
  }) {
    if (!detail) return
    setDetail((prev) =>
      prev
        ? {
            ...prev,
            stats: result.stats,
            logs: prev.logs.map((l) =>
              format(parseISO(l.date), "yyyy-MM-dd") ===
              format(new Date(), "yyyy-MM-dd")
                ? { ...l, completed: result.completed }
                : l,
            ),
          }
        : prev,
    )
    patchChallengeStats(detail.id, result.stats)
    if (result.status && result.status !== detail.status) {
      updateChallengeStatus(detail.id, result.status)
    }
  }

  return (
    <>
      <ConfettiLayer fireKey={confettiFire} />
      <Dialog open={open} onOpenChange={(o) => !o && closeChallenge()}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[94vh] gap-0 overflow-hidden border-border/60 bg-card/95 p-0 backdrop-blur-2xl sm:max-w-4xl"
        >
          <DialogTitle className="sr-only">
            {detail?.title ?? "Challenge detail"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            View challenge details, check in for today, and review your daily
            log and reflections.
          </DialogDescription>

          {/* Top banner */}
          <div
            className={cn(
              "relative h-28 bg-gradient-to-br",
              accent.gradient,
            )}
          >
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-card/95 to-transparent" />
            <Button
              variant="ghost"
              size="icon"
              onClick={closeChallenge}
              className="absolute right-3 top-3 size-8 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="relative -mt-16 max-h-[calc(94vh-7rem)] overflow-y-auto scrollbar-thin px-6 pb-8">
            {loading || !detail ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-xl ring-4 ring-card",
                      accent.gradient,
                    )}
                  >
                    <ChallengeIcon name={detail.icon} className="size-7" />
                  </div>
                  <div className="min-w-0 flex-1 pt-7">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-border/60 bg-card/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {CATEGORY_MAP[detail.category as never]?.emoji}{" "}
                        {detail.category}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                          detail.status === "active"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                            : detail.status === "completed"
                              ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                              : "border-rose-500/20 bg-rose-500/10 text-rose-500",
                        )}
                      >
                        {detail.status}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold leading-tight">
                      {detail.title}
                    </h2>
                    {detail.dailyTarget && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm">
                        <Target className={cn("size-3.5", accent.text)} />
                        {detail.dailyTarget}
                      </p>
                    )}
                  </div>
                </div>

                {detail.description && (
                  <p className="text-sm text-muted-foreground">
                    {detail.description}
                  </p>
                )}

                {/* Check-in + stats */}
                <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center rounded-2xl border p-6",
                      accent.border,
                      accent.bgSoft,
                    )}
                  >
                    <DailyCheckIn
                      challengeId={detail.id}
                      color={detail.color}
                      stats={detail.stats}
                      onCheckedIn={handleCheckIn}
                      onFireConfetti={() => setConfettiFire((f) => f + 1)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                    <StatTile
                      icon={<Flame className="size-4 text-orange-400" />}
                      label="Current streak"
                      value={detail.stats.currentStreak}
                      suffix="days"
                    />
                    <StatTile
                      icon={<Trophy className="size-4 text-amber-400" />}
                      label="Longest streak"
                      value={detail.stats.longestStreak}
                      suffix="days"
                    />
                    <StatTile
                      icon={<CalendarDays className={cn("size-4", accent.text)} />}
                      label="Day"
                      value={detail.stats.dayNumber}
                      suffix={`/ ${detail.stats.totalDays}`}
                    />
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/40 p-4">
                      <RingProgress
                        value={detail.stats.completionRate}
                        size={64}
                        strokeWidth={6}
                        gradientFrom={accent.hex}
                        gradientTo={accent.hex}
                      >
                        <div className="text-center text-xs font-bold tabular-nums">
                          {detail.stats.completionRate}%
                        </div>
                      </RingProgress>
                      <span className="mt-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        Completion
                      </span>
                    </div>
                  </div>
                </div>

                {/* Day grid */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                      <TrendingUp className="size-4" />
                      Daily log
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {detail.logs.filter((l) => l.completed).length}/
                      {detail.duration} days completed
                    </span>
                  </div>
                  <DayGrid
                    logs={detail.logs}
                    color={detail.color}
                    totalDays={detail.duration}
                    onToggleDay={handleToggleDay}
                  />
                </div>

                {/* Notes for this challenge */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                      <PenLine className="size-4" />
                      Reflections
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 rounded-full"
                      onClick={() => openNoteComposer(detail.id)}
                    >
                      <PenLine className="size-3.5" /> Add note
                    </Button>
                  </div>
                  {detail.notes.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-6 text-center text-sm text-muted-foreground">
                      No reflections yet. Capture how today went.
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <AnimatePresence>
                        {detail.notes.map((n) => (
                          <motion.div
                            key={n.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="rounded-xl border border-border/60 bg-card/40 p-3"
                          >
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs font-medium text-muted-foreground">
                                {format(parseISO(n.date), "MMM d")}
                              </span>
                              <span className="text-base">
                                {MOOD_CONFIG[n.mood as never]?.emoji}
                              </span>
                            </div>
                            {n.title && (
                              <p className="text-sm font-semibold">{n.title}</p>
                            )}
                            <p className="line-clamp-3 text-xs text-muted-foreground">
                              {n.content}
                            </p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function StatTile({
  icon,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode
  label: string
  value: number
  suffix?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/40 p-4 text-center">
      <div className="mb-1">{icon}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        {suffix && (
          <span className="text-xs text-muted-foreground">{suffix}</span>
        )}
      </div>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

// Local wrapper around the shared Confetti component.
function ConfettiLayer({ fireKey }: { fireKey: number }) {
  return <Confetti fire={fireKey} />
}

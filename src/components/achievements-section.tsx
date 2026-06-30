"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Lock,
  Sparkles,
  Trophy,
  Flame,
  CheckCircle2,
  Award,
  Medal,
  Crown,
  Footprints,
  PenLine,
  BookOpen,
  Compass,
  CalendarCheck,
  Sunrise,
  Moon,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { RARITY_STYLES, type AchievementProgress } from "@/lib/achievements"
import { AnimatedCounterInView } from "@/components/animated-counter"

const ICONS: Record<string, LucideIcon> = {
  Footprints,
  Flame,
  Trophy,
  Crown,
  CheckCircle2,
  Award,
  Medal,
  Sparkles,
  Compass,
  PenLine,
  BookOpen,
  CalendarCheck,
  Sunrise,
  Moon,
}

interface AchievementsSectionProps {
  achievements: AchievementProgress[]
  summary: {
    total: number
    unlocked: number
    rarityCounts: Record<string, number>
    unlockedRarityCounts: Record<string, number>
  } | null
}

export function AchievementsSection({
  achievements,
  summary,
}: AchievementsSectionProps) {
  const [filter, setFilter] = React.useState<"all" | "unlocked" | "locked">(
    "all",
  )

  const filtered = React.useMemo(() => {
    if (filter === "unlocked") return achievements.filter((a) => a.unlocked)
    if (filter === "locked") return achievements.filter((a) => !a.unlocked)
    return achievements
  }, [achievements, filter])

  if (!summary) return null

  const unlockPct = Math.round((summary.unlocked / summary.total) * 100)

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-md"
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-gradient-to-br from-amber-500/15 to-violet-500/10 blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30">
              <Trophy className="size-5" />
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold">
                Achievements
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-500">
                  {summary.unlocked}/{summary.total}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Milestone badges earned through dedication
              </p>
            </div>
          </div>

          {/* Progress ring */}
          <div className="hidden items-center gap-2 sm:flex">
            <div className="relative grid size-12 place-items-center">
              <svg className="-rotate-90" width={48} height={48} viewBox="0 0 48 48">
                <circle cx={24} cy={24} r={20} fill="none" strokeWidth={4} className="stroke-border/60" />
                <motion.circle
                  cx={24}
                  cy={24}
                  r={20}
                  fill="none"
                  strokeWidth={4}
                  strokeLinecap="round"
                  stroke="url(#ach-grad)"
                  strokeDasharray={2 * Math.PI * 20}
                  initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                  animate={{
                    strokeDashoffset: 2 * Math.PI * 20 * (1 - unlockPct / 100),
                  }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="ach-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute text-xs font-bold tabular-nums">
                {unlockPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Rarity summary bars */}
        <div className="mb-5 grid grid-cols-4 gap-2">
          {(["common", "rare", "epic", "legendary"] as const).map((rarity) => {
            const style = RARITY_STYLES[rarity]
            const unlocked = summary.unlockedRarityCounts[rarity] ?? 0
            const total = summary.rarityCounts[rarity] ?? 0
            return (
              <div
                key={rarity}
                className={cn(
                  "rounded-xl border p-2.5 text-center",
                  style.border,
                  style.bg,
                )}
              >
                <div className={cn("text-lg font-bold tabular-nums", style.text)}>
                  <AnimatedCounterInView value={unlocked} suffix={`/${total}`} />
                </div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {style.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Filter pills */}
        <div className="mb-4 flex gap-1.5">
          {(["all", "unlocked", "locked"] as const).map((f) => {
            const active = filter === f
            const count =
              f === "all"
                ? achievements.length
                : f === "unlocked"
                  ? summary.unlocked
                  : summary.total - summary.unlocked
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-foreground text-background"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {f === "all" ? "All" : f === "unlocked" ? "Unlocked" : "Locked"}
                <span className="ml-1 opacity-60">{count}</span>
              </button>
            )
          })}
        </div>

        {/* Achievement grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((a, i) => (
              <AchievementBadge key={a.id} achievement={a} index={i} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  )
}

function AchievementBadge({
  achievement,
  index,
}: {
  achievement: AchievementProgress
  index: number
}) {
  const Icon = ICONS[achievement.icon] ?? Sparkles
  const style = RARITY_STYLES[achievement.rarity]
  const { unlocked, progress, current, threshold } = achievement

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: Math.min(index * 0.03, 0.4) }}
      whileHover={{ y: -3, scale: 1.02 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-3 transition-all",
        unlocked
          ? cn(style.border, style.bg, "shadow-lg", style.glow)
          : "border-border/50 bg-muted/20",
      )}
    >
      {/* Shine effect for unlocked */}
      {unlocked && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
      )}

      <div className="relative flex flex-col items-center text-center">
        {/* Icon */}
        <div
          className={cn(
            "mb-2 grid size-10 place-items-center rounded-xl transition-transform group-hover:scale-110",
            unlocked
              ? cn("bg-gradient-to-br text-white", style.gradient)
              : "bg-muted/40 text-muted-foreground/50",
          )}
        >
          {unlocked ? (
            <Icon className="size-5" />
          ) : (
            <Lock className="size-4" />
          )}
        </div>

        {/* Title */}
        <p
          className={cn(
            "text-xs font-semibold leading-tight",
            unlocked ? "text-foreground" : "text-muted-foreground/70",
          )}
        >
          {achievement.title}
        </p>

        {/* Description */}
        <p className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">
          {achievement.description}
        </p>

        {/* Progress bar (for locked) or threshold (for unlocked) */}
        {unlocked ? (
          <div className={cn("mt-2 text-[10px] font-medium", style.text)}>
            {threshold} {achievement.unit} ✓
          </div>
        ) : (
          <div className="mt-2 w-full">
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className={cn("h-full rounded-full bg-gradient-to-r", style.gradient)}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, delay: index * 0.03 }}
              />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {current}/{threshold} {achievement.unit}
            </p>
          </div>
        )}

        {/* Rarity badge */}
        <span
          className={cn(
            "absolute right-1 top-1 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase",
            unlocked
              ? cn("bg-gradient-to-r text-white", style.gradient)
              : "bg-muted/40 text-muted-foreground/50",
          )}
        >
          {style.label}
        </span>
      </div>
    </motion.div>
  )
}

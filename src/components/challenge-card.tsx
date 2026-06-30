"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Flame,
  MoreVertical,
  Trash2,
  Pencil,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  CalendarDays,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ACCENT_COLORS, CATEGORY_MAP } from "@/lib/challenge-config"
import type { ChallengeWithStats } from "@/lib/types"
import { ChallengeIcon } from "@/components/challenge-icon"
import { RingProgress } from "@/components/ring-progress"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const STATUS_META: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  active: {
    label: "Active",
    className:
      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Completed",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    dot: "bg-amber-500",
  },
  failed: {
    label: "Ended",
    className: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    dot: "bg-rose-500",
  },
  paused: {
    label: "Paused",
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    dot: "bg-zinc-500",
  },
}

export function ChallengeCard({
  challenge,
  index = 0,
}: {
  challenge: ChallengeWithStats
  index?: number
}) {
  const accent = ACCENT_COLORS[challenge.color] ?? ACCENT_COLORS.emerald
  const stats = challenge.stats
  const openChallenge = useAppStore((s) => s.openChallenge)
  const removeChallenge = useAppStore((s) => s.removeChallenge)
  const updateChallengeStatus = useAppStore((s) => s.updateChallengeStatus)
  const [busy, setBusy] = React.useState(false)

  const statusMeta = STATUS_META[challenge.status] ?? STATUS_META.active
  const categoryCfg = CATEGORY_MAP[challenge.category]

  async function handleStatusChange(status: string) {
    setBusy(true)
    try {
      const res = await fetch(`/api/challenges/${challenge.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed to update")
      updateChallengeStatus(challenge.id, status)
      toast.success(`Marked as ${status}`)
    } catch {
      toast.error("Failed to update status")
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    try {
      const res = await fetch(`/api/challenges/${challenge.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete")
      removeChallenge(challenge.id)
      toast.success("Challenge deleted")
    } catch {
      toast.error("Failed to delete")
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
      whileHover={{ y: -4 }}
      onClick={() => openChallenge(challenge.id)}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-md transition-all",
        "hover:border-border hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30",
        "before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r",
        accent.gradient,
        "before:opacity-80",
      )}
    >
      {/* glow on hover */}
      <div
        className={cn(
          "pointer-events-none absolute -right-12 -top-12 size-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30",
          accent.bg,
        )}
      />

      {/* Header row */}
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg",
              accent.gradient,
            )}
          >
            <ChallengeIcon name={challenge.icon} className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{categoryCfg?.emoji}</span>
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {challenge.category}
              </span>
            </div>
            <h3 className="truncate text-base font-semibold leading-tight">
              {challenge.title}
            </h3>
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-muted-foreground hover:bg-accent"
                disabled={busy}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {challenge.status !== "active" && (
                <DropdownMenuItem onClick={() => handleStatusChange("active")}>
                  <Play className="size-4" /> Resume
                </DropdownMenuItem>
              )}
              {challenge.status === "active" && (
                <DropdownMenuItem onClick={() => handleStatusChange("paused")}>
                  <Pause className="size-4" /> Pause
                </DropdownMenuItem>
              )}
              {challenge.status !== "completed" && (
                <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                  <CheckCircle2 className="size-4" /> Mark completed
                </DropdownMenuItem>
              )}
              {challenge.status !== "failed" && (
                <DropdownMenuItem onClick={() => handleStatusChange("failed")}>
                  <XCircle className="size-4" /> Mark ended
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-rose-500 focus:text-rose-500"
                  >
                    <Trash2 className="size-4" /> Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete challenge?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently removes “{challenge.title}” and all its
                      daily logs. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-rose-500 text-white hover:bg-rose-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Description / target */}
      <div className="relative mt-4 space-y-1">
        {challenge.dailyTarget && (
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <span className={cn("size-1.5 rounded-full", accent.dot)} />
            {challenge.dailyTarget}
          </p>
        )}
        {challenge.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {challenge.description}
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="relative mt-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <RingProgress
            value={stats?.completionRate ?? 0}
            size={56}
            strokeWidth={5}
            gradientFrom={accent.hex}
            gradientTo={accent.hex}
          >
            <div className="text-center leading-none">
              <div className="text-sm font-bold tabular-nums">
                {stats?.completionRate ?? 0}%
              </div>
            </div>
          </RingProgress>

          <div className="space-y-1.5">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Flame
                      className={cn(
                        "size-3.5",
                        stats?.currentStreak
                          ? "text-orange-400 flame-glow"
                          : "text-muted-foreground",
                      )}
                    />
                    <span className="font-semibold tabular-nums">
                      {stats?.currentStreak ?? 0}
                    </span>
                    <span className="text-muted-foreground">day streak</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Best: {stats?.longestStreak ?? 0} days
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-1.5 text-xs">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              <span className="font-semibold tabular-nums">
                {stats?.completedDays ?? 0}/{stats?.totalDays ?? challenge.duration}
              </span>
              <span className="text-muted-foreground">done</span>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide",
            statusMeta.className,
          )}
        >
          <span className={cn("size-1.5 rounded-full", statusMeta.dot, challenge.status === "active" && "heat-pulse")} />
          {statusMeta.label}
        </div>
      </div>

      {/* Day progress bar */}
      <div className="relative mt-4">
        <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>
            Day {stats?.dayNumber ?? 0} of {stats?.totalDays ?? challenge.duration}
          </span>
          <span>
            {stats?.daysRemaining
              ? `${stats.daysRemaining} days left`
              : challenge.status === "completed"
                ? "Completed"
                : "Finished"}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/50">
          <motion.div
            className={cn("h-full rounded-full bg-gradient-to-r", accent.gradient)}
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(
                100,
                ((stats?.dayNumber ?? 0) /
                  (stats?.totalDays ?? challenge.duration)) *
                  100,
              )}%`,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Footer dates */}
      <div className="relative mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Started {format(new Date(challenge.startDate), "MMM d")}</span>
        {stats?.hasCheckedInToday && (
          <span className={cn("flex items-center gap-1 font-medium", accent.text)}>
            <CheckCircle2 className="size-3" /> Done today
          </span>
        )}
      </div>
    </motion.article>
  )
}

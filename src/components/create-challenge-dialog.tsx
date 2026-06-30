"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Check, Loader2, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  ACCENT_COLORS,
  ACCENT_COLOR_KEYS,
  CATEGORIES,
  CHALLENGE_ICONS,
  DURATION_PRESETS,
} from "@/lib/challenge-config"
import type {
  AccentColor,
  ChallengeCategory,
} from "@/lib/types"
import { ChallengeIcon } from "@/components/challenge-icon"
import { useAppStore } from "@/lib/store"
import { CATEGORY_MAP } from "@/lib/challenge-config"

export function CreateChallengeDialog() {
  const open = useAppStore((s) => s.createOpen)
  const setOpen = useAppStore((s) => s.setCreateOpen)
  const upsertChallenge = useAppStore((s) => s.upsertChallenge)

  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [dailyTarget, setDailyTarget] = React.useState("")
  const [category, setCategory] = React.useState<ChallengeCategory>("Mind")
  const [duration, setDuration] = React.useState(21)
  const [color, setColor] = React.useState<AccentColor>("violet")
  const [icon, setIcon] = React.useState("Brain")
  const [startDate, setStartDate] = React.useState<Date>(new Date())
  const [submitting, setSubmitting] = React.useState(false)

  // Reset on close
  React.useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setTitle("")
        setDescription("")
        setDailyTarget("")
        setCategory("Mind")
        setDuration(21)
        setColor("violet")
        setIcon("Brain")
        setStartDate(new Date())
      }, 250)
      return () => clearTimeout(t)
    }
  }, [open])

  // When category changes, suggest a default color+icon.
  React.useEffect(() => {
    const cfg = CATEGORY_MAP[category]
    if (cfg) {
      setColor(cfg.defaultColor)
      // pick a sensible icon
      const iconByCat: Record<ChallengeCategory, string> = {
        Health: "HeartPulse",
        Fitness: "Dumbbell",
        Mind: "Brain",
        Career: "Briefcase",
        Finance: "DollarSign",
        Social: "Sparkles",
        Creativity: "Palette",
      }
      setIcon(iconByCat[category])
    }
  }, [category])

  const accent = ACCENT_COLORS[color]

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("Give your challenge a title")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          dailyTarget: dailyTarget.trim(),
          category,
          duration,
          color,
          icon,
          startDate: startDate.toISOString(),
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || "Failed to create challenge")
      }
      const { challenge } = await res.json()
      upsertChallenge(challenge)
      toast.success("Challenge created!", {
        description: `"${challenge.title}" — Day 1 starts now.`,
      })
      setOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92vh] overflow-y-auto scrollbar-thin gap-0 border-border/60 bg-card/95 p-0 backdrop-blur-2xl sm:max-w-2xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-violet-500/10 to-transparent" />
        <DialogHeader className="relative px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
              <Sparkles className="size-4" />
            </span>
            New Challenge
          </DialogTitle>
          <DialogDescription>
            Define a daily commitment. Small steps, compounded daily.
          </DialogDescription>
        </DialogHeader>

        <div className="relative space-y-5 px-6 pb-6">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Challenge title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning Meditation"
              className="h-11 border-border/60 bg-background/60 text-base"
              maxLength={80}
            />
          </div>

          {/* Daily target */}
          <div className="space-y-1.5">
            <Label htmlFor="target" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Daily target
            </Label>
            <Input
              id="target"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(e.target.value)}
              placeholder="e.g. 10 minutes of meditation"
              className="h-11 border-border/60 bg-background/60"
              maxLength={120}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="desc" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Description <span className="text-muted-foreground/60">(optional)</span>
            </Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why does this matter to you?"
              className="min-h-[72px] resize-none border-border/60 bg-background/60"
              maxLength={400}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Category
            </Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CATEGORIES.map((c) => {
                const active = category === c.key
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategory(c.key)}
                    className={cn(
                      "group relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all",
                      active
                        ? "border-transparent ring-2 ring-offset-2 ring-offset-background " +
                            ACCENT_COLORS[c.defaultColor].ring +
                            " " +
                            ACCENT_COLORS[c.defaultColor].bgSoft
                        : "border-border/60 bg-background/40 hover:border-border hover:bg-accent/40",
                    )}
                  >
                    <span className="text-lg">{c.emoji}</span>
                    <span className="text-xs font-semibold">{c.label}</span>
                    {active && (
                      <motion.span
                        layoutId="cat-check"
                        className={cn(
                          "absolute right-2 top-2 grid size-4 place-items-center rounded-full text-white",
                          ACCENT_COLORS[c.defaultColor].bg,
                        )}
                      >
                        <Check className="size-2.5" />
                      </motion.span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Duration
            </Label>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((d) => {
                const active = duration === d.value
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDuration(d.value)}
                    className={cn(
                      "relative rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                      active
                        ? cn("border-transparent text-white", accent.bg)
                        : "border-border/60 bg-background/40 text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                    )}
                  >
                    {d.label}
                  </button>
                )
              })}
              <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/40 px-2">
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={duration}
                  onChange={(e) =>
                    setDuration(
                      Math.max(1, Math.min(365, Number(e.target.value) || 1)),
                    )
                  }
                  className="h-7 w-14 border-0 bg-transparent px-1 text-xs tabular-nums focus-visible:ring-0"
                />
                <span className="text-xs text-muted-foreground">days</span>
              </div>
            </div>
          </div>

          {/* Start date */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Start date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-[200px] justify-start border-border/60 bg-background/60 font-normal"
                  >
                    <CalendarIcon className="size-4 text-muted-foreground" />
                    {startDate ? format(startDate, "MMM d, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(d) => d && setStartDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Quick toggle to today */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStartDate(new Date())}
              className="text-xs"
            >
              Today
            </Button>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Accent color
            </Label>
            <div className="flex flex-wrap gap-2">
              {ACCENT_COLOR_KEYS.map((c) => {
                const a = ACCENT_COLORS[c]
                const active = color === c
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "relative grid size-9 place-items-center rounded-full transition-transform hover:scale-110",
                      a.bg,
                    )}
                    title={a.label}
                  >
                    {active && (
                      <motion.span
                        layoutId="color-check"
                        className="absolute inset-0 grid place-items-center rounded-full ring-2 ring-offset-2 ring-offset-background"
                        style={{ boxShadow: `0 0 0 2px ${a.hex}` }}
                      >
                        <Check className="size-4 text-white drop-shadow" />
                      </motion.span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Icon
            </Label>
            <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
              {CHALLENGE_ICONS.map((ic) => {
                const active = icon === ic
                return (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={cn(
                      "grid aspect-square place-items-center rounded-lg border transition-all",
                      active
                        ? cn("border-transparent text-white", accent.bg)
                        : "border-border/60 bg-background/40 text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                    )}
                  >
                    <ChallengeIcon name={ic} className="size-4" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Preview
            </p>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "grid size-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg",
                  accent.gradient,
                )}
              >
                <ChallengeIcon name={icon} className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {title.trim() || "Your challenge title"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {dailyTarget.trim() || "Daily target"} · {duration} days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-border/60 bg-card/80 px-6 py-4 backdrop-blur-xl">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !title.trim()}
            className={cn(
              "min-w-[140px] bg-gradient-to-r text-white shadow-lg transition-all hover:brightness-110",
              accent.gradient,
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Start Challenge
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

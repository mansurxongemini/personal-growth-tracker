"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { LayoutGrid, Check, Loader2, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ACCENT_COLORS,
  CATEGORIES,
} from "@/lib/challenge-config"
import {
  TEMPLATES,
  DIFFICULTY_STYLES,
  type ChallengeTemplate,
} from "@/lib/templates"
import type { ChallengeCategory } from "@/lib/types"
import { ChallengeIcon } from "@/components/challenge-icon"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function TemplatesDialog() {
  const open = useAppStore((s) => s.templatesOpen)
  const setOpen = useAppStore((s) => s.setTemplatesOpen)
  const upsertChallenge = useAppStore((s) => s.upsertChallenge)

  const [search, setSearch] = React.useState("")
  const [filterCat, setFilterCat] = React.useState<ChallengeCategory | "all">(
    "all",
  )
  const [starting, setStarting] = React.useState<string | null>(null)

  const filtered = React.useMemo(() => {
    return TEMPLATES.filter((t) => {
      if (filterCat !== "all" && t.category !== filterCat) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.description.toLowerCase().includes(q) &&
          !t.tags.some((tag) => tag.includes(q))
        )
          return false
      }
      return true
    })
  }, [search, filterCat])

  async function startTemplate(t: ChallengeTemplate) {
    setStarting(t.id)
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: t.title,
          description: t.description,
          dailyTarget: t.dailyTarget,
          category: t.category,
          duration: t.duration,
          color: t.color,
          icon: t.icon,
          startDate: new Date().toISOString(),
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || "Failed")
      }
      const { challenge } = await res.json()
      upsertChallenge(challenge)
      toast.success("Challenge started!", {
        description: `"${t.title}" — Day 1 starts now.`,
      })
      setOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start")
    } finally {
      setStarting(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92vh] overflow-hidden border-border/60 bg-card/95 p-0 backdrop-blur-2xl sm:max-w-3xl">
        <DialogHeader className="border-b border-border/40 px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
              <LayoutGrid className="size-4" />
            </span>
            Challenge Templates
          </DialogTitle>
          <DialogDescription>
            Start instantly from a curated library of proven challenges
          </DialogDescription>
        </DialogHeader>

        {/* Search + filters */}
        <div className="space-y-3 border-b border-border/40 px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="h-10 rounded-full border-border/60 bg-background/60 pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterCat("all")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filterCat === "all"
                  ? "bg-foreground text-background"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground",
              )}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setFilterCat(c.key)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  filterCat === c.key
                    ? "bg-foreground text-background"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates grid */}
        <div className="scrollbar-thin max-h-[calc(92vh-16rem)] overflow-y-auto px-6 py-4">
          {filtered.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              No templates found
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filtered.map((t, i) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  index={i}
                  starting={starting === t.id}
                  onStart={() => startTemplate(t)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TemplateCard({
  template: t,
  index,
  starting,
  onStart,
}: {
  template: ChallengeTemplate
  index: number
  starting: boolean
  onStart: () => void
}) {
  const accent = ACCENT_COLORS[t.color]
  const diff = DIFFICULTY_STYLES[t.difficulty]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ y: -3 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-background/40 p-4 transition-all hover:border-border",
      )}
    >
      {/* Accent strip */}
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", accent.gradient)} />

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg",
            accent.gradient,
          )}
        >
          <span className="text-lg">{t.emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight">{t.title}</h3>
            <div className="flex shrink-0 gap-0.5">
              {[1, 2, 3, 4].map((n) => (
                <span
                  key={n}
                  className={cn(
                    "size-1 rounded-full",
                    n <= diff.dots ? diff.color.replace("text", "bg") : "bg-muted",
                  )}
                />
              ))}
            </div>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {t.duration} days · {t.category}
          </p>
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
        {t.description}
      </p>

      <div className="mt-3 flex flex-wrap gap-1">
        {t.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground"
          >
            #{tag}
          </span>
        ))}
      </div>

      <Button
        onClick={onStart}
        disabled={starting}
        className={cn(
          "mt-3 w-full gap-1.5 rounded-xl bg-gradient-to-r text-white shadow-md transition-all hover:brightness-110",
          accent.gradient,
        )}
        size="sm"
      >
        {starting ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Starting...
          </>
        ) : (
          <>
            <Check className="size-3.5" />
            Start Challenge
          </>
        )}
      </Button>
    </motion.div>
  )
}

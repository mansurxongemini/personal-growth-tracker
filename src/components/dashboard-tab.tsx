"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { LayoutGrid, Plus, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChallengeCard } from "@/components/challenge-card"
import { useAppStore, type DashboardFilter } from "@/lib/store"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const FILTERS: { key: DashboardFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Ended" },
]

export function DashboardTab() {
  const challenges = useAppStore((s) => s.challenges)
  const filter = useAppStore((s) => s.filter)
  const setFilter = useAppStore((s) => s.setFilter)
  const setCreateOpen = useAppStore((s) => s.setCreateOpen)
  const setChallenges = useAppStore((s) => s.setChallenges)
  const loading = useAppStore((s) => s.loading)
  const setLoading = useAppStore((s) => s.setLoading)

  const fetchChallenges = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/challenges")
      if (!res.ok) throw new Error("Failed to load")
      const { challenges } = await res.json()
      setChallenges(challenges)
    } catch {
      toast.error("Failed to load challenges")
    } finally {
      setLoading(false)
    }
  }, [setChallenges, setLoading])

  React.useEffect(() => {
    fetchChallenges()
  }, [fetchChallenges])

  const counts = React.useMemo(
    () => ({
      all: challenges.length,
      active: challenges.filter((c) => c.status === "active").length,
      completed: challenges.filter((c) => c.status === "completed").length,
      failed: challenges.filter((c) => c.status === "failed").length,
    }),
    [challenges],
  )

  const filtered = React.useMemo(() => {
    if (filter === "all") return challenges
    return challenges.filter((c) => c.status === filter)
  }, [challenges, filter])

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 p-1 backdrop-blur-md">
          {FILTERS.map((f) => {
            const active = filter === f.key
            const count = counts[f.key]
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {f.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px] tabular-nums",
                      active
                        ? "bg-foreground/10 text-foreground"
                        : "bg-muted-foreground/10 text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchChallenges}
          disabled={loading}
          className="gap-1.5 rounded-full border-border/60 bg-card/40 backdrop-blur-md"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <LayoutGrid className="size-3.5" />
          )}
          Refresh
        </Button>
      </div>

      {/* Grid */}
      {loading && challenges.length === 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl border border-border/40 bg-card/30"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onCreate={() => setCreateOpen(true)} />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((c, i) => (
              <ChallengeCard key={c.id} challenge={c} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/30 px-6 py-16 text-center backdrop-blur-md"
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-2xl" />
        <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/30">
          <Sparkles className="size-7" />
        </div>
      </div>
      <h3 className="text-xl font-bold">Start your first challenge</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Whether it&apos;s 10 minutes of meditation or 20 pages of reading —
        define a daily commitment and watch the streaks build.
      </p>
      <Button
        onClick={onCreate}
        className="mt-5 gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:brightness-110"
      >
        <Plus className="size-4" /> Create a challenge
      </Button>
    </motion.div>
  )
}

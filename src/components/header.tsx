"use client"

import { motion } from "framer-motion"
import { Plus, Sparkles, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAppStore } from "@/lib/store"

export function Header() {
  const setCreateOpen = useAppStore((s) => s.setCreateOpen)
  const challenges = useAppStore((s) => s.challenges)

  const activeCount = challenges.filter((c) => c.status === "active").length
  const totalStreak = challenges.reduce(
    (sum, c) => sum + (c.stats?.currentStreak ?? 0),
    0,
  )

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass-strong border-b border-border/40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo + brand */}
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -10, scale: 0.8, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative grid size-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-lg shadow-emerald-500/30"
            >
              <Sparkles className="size-5 text-white" />
              <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-amber-400 ring-2 ring-background" />
            </motion.div>
            <div className="leading-tight">
              <h1 className="text-lg font-bold tracking-tight">
                Ascent
              </h1>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                Personal Development Challenges
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="hidden items-center gap-2 md:flex">
            <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-card/40 px-3 py-1.5 text-xs backdrop-blur-md">
              <Flame className="size-3.5 text-orange-400" />
              <span className="font-semibold tabular-nums">{totalStreak}</span>
              <span className="text-muted-foreground">streak</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-card/40 px-3 py-1.5 text-xs backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-emerald-500 heat-pulse" />
              <span className="font-semibold tabular-nums">{activeCount}</span>
              <span className="text-muted-foreground">active</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              onClick={() => setCreateOpen(true)}
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:brightness-110"
            >
              <Plus className="size-4 transition-transform group-hover:rotate-90" />
              <span className="hidden sm:inline">New Challenge</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

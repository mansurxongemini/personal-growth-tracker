"use client"

import { motion } from "framer-motion"
import { LayoutGrid, BarChart3, NotebookPen } from "lucide-react"
import { useAppStore, type TabKey } from "@/lib/store"
import { cn } from "@/lib/utils"

const TABS: { key: TabKey; label: string; icon: typeof LayoutGrid }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "notes", label: "Notes", icon: NotebookPen },
]

export function TabNav() {
  const activeTab = useAppStore((s) => s.activeTab)
  const setActiveTab = useAppStore((s) => s.setActiveTab)

  return (
    <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-border/40 bg-background/60 px-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center gap-1">
        {TABS.map((t) => {
          const active = activeTab === t.key
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{t.label}</span>
              {active && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

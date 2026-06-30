"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Header } from "@/components/header"
import { TabNav } from "@/components/tab-nav"
import { DashboardTab } from "@/components/dashboard-tab"
import { AnalyticsTab } from "@/components/analytics-tab"
import { NotesTab } from "@/components/notes-tab"
import { CreateChallengeDialog } from "@/components/create-challenge-dialog"
import { ChallengeDetailDialog } from "@/components/challenge-detail-dialog"
import { NoteComposerDialog } from "@/components/note-composer-dialog"
import { TodayFocus } from "@/components/today-focus"
import { useAppStore } from "@/lib/store"
import { Sparkles, Github, Heart } from "lucide-react"

export default function Home() {
  const activeTab = useAppStore((s) => s.activeTab)
  const [bootstrapped, setBootstrapped] = React.useState(false)

  // Auto-seed demo data on first visit so the app feels alive.
  React.useEffect(() => {
    async function ensureSeed() {
      try {
        const check = await fetch("/api/seed")
        const { hasData } = await check.json()
        if (!hasData) {
          await fetch("/api/seed", { method: "POST" })
        }
      } catch {
        // ignore — app still works empty
      } finally {
        setBootstrapped(true)
      }
    }
    ensureSeed()
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col bg-deep-space dark:bg-deep-space">
      {/* Grid overlay */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-40" />

      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 sm:px-6 lg:px-8">
        {bootstrapped ? (
          <>
            {activeTab === "dashboard" && <TodayFocus />}
            <TabNav />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === "dashboard" && <DashboardTab />}
                {activeTab === "analytics" && <AnalyticsTab />}
                {activeTab === "notes" && <NotesTab />}
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <BootSkeleton />
        )}
      </main>

      <Footer />

      {/* Global dialogs */}
      <CreateChallengeDialog />
      <ChallengeDetailDialog />
      <NoteComposerDialog />
    </div>
  )
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-background/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-emerald-400" />
          <span className="font-medium text-foreground">Ascent</span>
          <span>·</span>
          <span>Personal Development Challenges</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            Built with <Heart className="size-3 fill-rose-500 text-rose-500" /> for daily growth
          </span>
          <a
            href="#"
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <Github className="size-3.5" />
          </a>
        </div>
      </div>
    </footer>
  )
}

function BootSkeleton() {
  return (
    <div className="space-y-6 py-8">
      <div className="h-32 w-full animate-pulse rounded-3xl border border-border/40 bg-card/30" />
      <div className="h-12 w-full animate-pulse rounded-full border border-border/40 bg-card/30" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-2xl border border-border/40 bg-card/30"
          />
        ))}
      </div>
    </div>
  )
}

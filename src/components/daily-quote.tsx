"use client"

import { motion } from "framer-motion"
import { Quote as QuoteIcon, Sparkles } from "lucide-react"
import { getDailyQuote } from "@/lib/quotes"
import { cn } from "@/lib/utils"

const CATEGORY_GRADIENTS: Record<string, string> = {
  discipline: "from-amber-500/15 to-orange-500/5",
  growth: "from-emerald-500/15 to-teal-500/5",
  courage: "from-rose-500/15 to-pink-500/5",
  consistency: "from-violet-500/15 to-fuchsia-500/5",
  mindset: "from-cyan-500/15 to-blue-500/5",
  systems: "from-violet-500/15 to-fuchsia-500/5",
}

export function DailyQuote() {
  const quote = getDailyQuote()
  const gradient =
    CATEGORY_GRADIENTS[quote.category] ?? CATEGORY_GRADIENTS.discipline

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/60 p-6 backdrop-blur-md",
        "bg-gradient-to-br",
        gradient,
      )}
    >
      {/* Decorative quote mark */}
      <QuoteIcon className="absolute -right-4 -top-4 size-24 opacity-5" />

      <div className="relative">
        <div className="mb-3 flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-foreground/5 backdrop-blur-sm">
            <Sparkles className="size-4 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Daily Inspiration
            </p>
          </div>
        </div>

        <blockquote className="relative">
          <p className="text-lg font-medium leading-snug tracking-tight sm:text-xl">
            &ldquo;{quote.text}&rdquo;
          </p>
          <footer className="mt-3 flex items-center gap-2">
            <span className="h-px w-8 bg-gradient-to-r from-foreground/30 to-transparent" />
            <cite className="text-sm font-medium not-italic text-muted-foreground">
              {quote.author}
            </cite>
          </footer>
        </blockquote>
      </div>
    </motion.div>
  )
}

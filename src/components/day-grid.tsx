"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { ACCENT_COLORS } from "@/lib/challenge-config"
import type { DailyLogEntry } from "@/lib/types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { format, isToday, isFuture, parseISO } from "date-fns"

interface DayGridProps {
  logs: DailyLogEntry[]
  color: string
  totalDays: number
  onToggleDay: (date: string) => void
}

export function DayGrid({ logs, color, totalDays, onToggleDay }: DayGridProps) {
  const accent = ACCENT_COLORS[color as keyof typeof ACCENT_COLORS] ?? ACCENT_COLORS.emerald
  const logMap = React.useMemo(() => {
    const m = new Map<string, DailyLogEntry>()
    for (const l of logs) {
      m.set(format(parseISO(l.date), "yyyy-MM-dd"), l)
    }
    return m
  }, [logs])

  const days = Array.from({ length: totalDays }, (_, i) => i + 1)

  return (
    <TooltipProvider delayDuration={120}>
      <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-14">
        {days.map((dayNum) => {
          const log = logs.find((l) => l.dayNumber === dayNum)
          const date = log ? parseISO(log.date) : null
          const completed = log?.completed ?? false
          const isFutureDay = date ? isFuture(date) : false
          const todayFlag = date ? isToday(date) : false

          return (
            <Tooltip key={dayNum}>
              <TooltipTrigger asChild>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(dayNum * 0.008, 0.4) }}
                  whileHover={{ scale: date && !isFutureDay ? 1.12 : 1 }}
                  whileTap={{ scale: date && !isFutureDay ? 0.92 : 1 }}
                  disabled={!date || isFutureDay}
                  onClick={() => date && !isFutureDay && onToggleDay(format(date, "yyyy-MM-dd"))}
                  className={cn(
                    "relative grid aspect-square place-items-center rounded-lg border text-[11px] font-medium transition-colors",
                    completed
                      ? cn("border-transparent text-white", accent.bg)
                      : isFutureDay
                        ? "border-border/30 bg-transparent text-muted-foreground/30"
                        : todayFlag
                          ? cn("border-2 border-dashed bg-card/40", accent.text, accent.border)
                          : "border-border/50 bg-card/30 text-muted-foreground hover:bg-accent/40",
                  )}
                >
                  {completed ? (
                    <Check className="size-3" strokeWidth={3} />
                  ) : isFutureDay ? (
                    <Lock className="size-2.5 opacity-50" />
                  ) : (
                    <span className="tabular-nums">{dayNum}</span>
                  )}
                  {todayFlag && !completed && (
                    <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-amber-400 heat-pulse" />
                  )}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {date ? (
                  <div className="text-center">
                    <div className="font-semibold">Day {dayNum}</div>
                    <div className="text-muted-foreground">
                      {format(date, "MMM d, yyyy")}
                    </div>
                    <div
                      className={cn(
                        "mt-0.5 font-medium",
                        completed
                          ? accent.text
                          : isFutureDay
                            ? "text-muted-foreground"
                            : "text-amber-500",
                      )}
                    >
                      {completed
                        ? "Completed"
                        : isFutureDay
                          ? "Upcoming"
                          : "Not done"}
                    </div>
                  </div>
                ) : (
                  <div>Day {dayNum}</div>
                )}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}

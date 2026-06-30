"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { format, parseISO } from "date-fns"

interface HeatCell {
  iso: string
  completed: boolean
  inFuture: boolean
}

interface HeatmapCalendarProps {
  columns: HeatCell[][] // weeks, each 7 cells (Sun..Sat)
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function HeatmapCalendar({ columns }: HeatmapCalendarProps) {
  const monthLabels = React.useMemo(() => {
    let prevMonth = -1
    const labels: string[] = []
    for (const col of columns) {
      const first = col[0]
      const m = first ? new Date(first.iso + "T00:00:00").getMonth() : -1
      const show = m !== prevMonth
      prevMonth = m
      labels.push(show && first ? format(new Date(first.iso + "T00:00:00"), "MMM") : "")
    }
    return labels
  }, [columns])

  return (
    <TooltipProvider delayDuration={120}>
      <div className="w-full overflow-x-auto scrollbar-thin">
        <div className="min-w-[640px]">
          {/* Month labels */}
          <div className="mb-1 flex gap-[3px] pl-7 text-[10px] font-medium text-muted-foreground">
            {monthLabels.map((m, i) => (
              <div key={i} className="flex-1">
                {m}
              </div>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {/* Weekday labels */}
            <div className="grid grid-rows-7 gap-[3px] pr-1 text-[9px] text-muted-foreground">
              {WEEKDAYS.map((d, i) => (
                <div
                  key={d}
                  className={cn(
                    "flex h-[13px] items-center",
                    i % 2 === 1 ? "opacity-100" : "opacity-0",
                  )}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex flex-1 gap-[3px]">
              {columns.map((col, ci) => (
                <div key={ci} className="grid grid-rows-7 gap-[3px]">
                  {col.map((cell, ri) => (
                    <Tooltip key={`${ci}-${ri}`}>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: Math.min(ci * 0.01 + ri * 0.002, 0.5) }}
                          whileHover={{ scale: 1.3 }}
                          className={cn(
                            "size-[13px] rounded-[3px] transition-colors",
                            cell.inFuture
                              ? "bg-transparent"
                              : cell.completed
                                ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/30"
                                : "bg-border/50 hover:bg-border",
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <div className="text-center">
                          <div className="font-semibold">
                            {format(parseISO(cell.iso), "MMM d, yyyy")}
                          </div>
                          <div
                            className={cn(
                              "font-medium",
                              cell.completed
                                ? "text-emerald-400"
                                : cell.inFuture
                                  ? "text-muted-foreground"
                                  : "text-amber-400",
                            )}
                          >
                            {cell.completed
                              ? "Completed"
                              : cell.inFuture
                                ? "Upcoming"
                                : "No check-in"}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
            <span>Less</span>
            <div className="size-[11px] rounded-[3px] bg-border/50" />
            <div className="size-[11px] rounded-[3px] bg-emerald-500/30" />
            <div className="size-[11px] rounded-[3px] bg-emerald-500/60" />
            <div className="size-[11px] rounded-[3px] bg-emerald-500" />
            <span>More</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

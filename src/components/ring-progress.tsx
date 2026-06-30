"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface RingProgressProps {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  className?: string
  gradientFrom?: string
  gradientTo?: string
  trackClassName?: string
  children?: React.ReactNode
  animate?: boolean
}

export function RingProgress({
  value,
  size = 64,
  strokeWidth = 6,
  className,
  gradientFrom = "#10b981",
  gradientTo = "#06b6d4",
  trackClassName = "text-border/60",
  children,
  animate = true,
}: RingProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const offset = circumference - (clamped / 100) * circumference
  const gid = `ring-grad-${gradientFrom}-${gradientTo}`.replace(/[^a-z0-9-]/gi, "")

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackClassName}
          stroke="currentColor"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke={`url(#${gid})`}
          strokeDasharray={circumference}
          initial={animate ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 grid place-items-center">{children}</div>
      )}
    </div>
  )
}

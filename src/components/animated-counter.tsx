"use client"

import * as React from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"

/**
 * Animated number counter — smoothly tweens from previous value to next.
 * Used for stats cards, KPI numbers, streak counts, etc.
 */
export function AnimatedCounter({
  value,
  duration = 1.2,
  className,
  format,
}: {
  value: number
  duration?: number
  className?: string
  format?: (n: number) => string
}) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => {
    const n = Math.round(latest)
    return format ? format(n) : String(n)
  })
  const [display, setDisplay] = React.useState(
    format ? format(0) : "0",
  )

  React.useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: "easeOut",
    })
    const unsubscribe = rounded.on("change", (v) => setDisplay(v))
    return () => {
      controls.stop()
      unsubscribe()
    }
  }, [value, duration, count, rounded])

  return <span className={className}>{display}</span>
}

/**
 * Animated counter that counts up when scrolled into view.
 */
export function AnimatedCounterInView({
  value,
  duration = 1.2,
  className,
  format,
  suffix,
  prefix,
}: {
  value: number
  duration?: number
  className?: string
  format?: (n: number) => string
  suffix?: string
  prefix?: string
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [started, setStarted] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {started ? (
        <AnimatedCounter value={value} duration={duration} format={format} />
      ) : (
        <span>0</span>
      )}
      {suffix}
    </span>
  )
}

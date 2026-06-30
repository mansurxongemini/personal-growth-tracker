"use client"

import * as React from "react"
import ReactConfetti from "react-confetti"
import { useWindowSize } from "@/hooks/use-window-size"

export function Confetti({
  fire,
  duration = 2600,
}: {
  fire: number // change this number to trigger
  duration?: number
}) {
  const { width, height } = useWindowSize()
  const [active, setActive] = React.useState(false)
  const [recycle, setRecycle] = React.useState(true)

  React.useEffect(() => {
    if (!fire) return
    setActive(true)
    setRecycle(true)
    const t1 = setTimeout(() => setRecycle(false), Math.max(400, duration * 0.6))
    const t2 = setTimeout(() => setActive(false), duration)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [fire, duration])

  if (!active) return null

  return (
    <div className="confetti-layer" aria-hidden>
      <ReactConfetti
        width={width}
        height={height}
        recycle={recycle}
        numberOfPieces={recycle ? 300 : 0}
        gravity={0.3}
        colors={[
          "#10b981",
          "#06b6d4",
          "#f59e0b",
          "#ec4899",
          "#8b5cf6",
          "#f43f5e",
          "#84cc16",
        ]}
      />
    </div>
  )
}

"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const isDark = theme === "dark"

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative overflow-hidden rounded-full border-border/60 bg-card/40 backdrop-blur-md"
            aria-label="Toggle theme"
          >
            {mounted ? (
              isDark ? (
                <Moon className="size-4 text-violet-300" />
              ) : (
                <Sun className="size-4 text-amber-500" />
              )
            ) : (
              <div className="size-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isDark ? "Light mode" : "Dark mode"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

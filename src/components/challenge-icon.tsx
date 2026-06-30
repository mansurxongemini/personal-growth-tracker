"use client"

import {
  Target,
  Flame,
  BookOpen,
  Dumbbell,
  Brain,
  HeartPulse,
  DollarSign,
  Briefcase,
  Palette,
  Music,
  Code,
  PenLine,
  Coffee,
  Sunrise,
  Moon,
  Footprints,
  Apple,
  Sparkles,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react"

export const ICON_MAP: Record<string, LucideIcon> = {
  Target,
  Flame,
  BookOpen,
  Dumbbell,
  Brain,
  HeartPulse,
  DollarSign,
  Briefcase,
  Palette,
  Music,
  Code,
  PenLine,
  Coffee,
  Sunrise,
  Moon,
  Footprints,
  Apple,
  Sparkles,
  Trophy,
  Zap,
}

export function ChallengeIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Icon = ICON_MAP[name] ?? Target
  return <Icon className={className} />
}

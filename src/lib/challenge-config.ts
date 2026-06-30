import type {
  AccentColor,
  ChallengeCategory,
  Mood,
} from "./types"

/**
 * Accent color configuration. Tailwind-safe class strings so the JIT
 * compiler can statically pick them up.
 */
export const ACCENT_COLORS: Record<
  AccentColor,
  {
    key: AccentColor
    label: string
    // solid / text / ring / bg-soft / gradient / border
    text: string
    bg: string
    bgSoft: string
    border: string
    ring: string
    gradient: string
    dot: string
    hex: string
    chartStroke: string
  }
> = {
  emerald: {
    key: "emerald",
    label: "Emerald",
    text: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500",
    bgSoft: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    ring: "ring-emerald-500/40",
    gradient: "from-emerald-500 to-teal-500",
    dot: "bg-emerald-500",
    hex: "#10b981",
    chartStroke: "#10b981",
  },
  rose: {
    key: "rose",
    label: "Rose",
    text: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-500",
    bgSoft: "bg-rose-500/10",
    border: "border-rose-500/30",
    ring: "ring-rose-500/40",
    gradient: "from-rose-500 to-pink-500",
    dot: "bg-rose-500",
    hex: "#f43f5e",
    chartStroke: "#f43f5e",
  },
  amber: {
    key: "amber",
    label: "Amber",
    text: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500",
    bgSoft: "bg-amber-500/10",
    border: "border-amber-500/30",
    ring: "ring-amber-500/40",
    gradient: "from-amber-500 to-orange-500",
    dot: "bg-amber-500",
    hex: "#f59e0b",
    chartStroke: "#f59e0b",
  },
  violet: {
    key: "violet",
    label: "Violet",
    text: "text-violet-500 dark:text-violet-400",
    bg: "bg-violet-500",
    bgSoft: "bg-violet-500/10",
    border: "border-violet-500/30",
    ring: "ring-violet-500/40",
    gradient: "from-violet-500 to-purple-500",
    dot: "bg-violet-500",
    hex: "#8b5cf6",
    chartStroke: "#8b5cf6",
  },
  cyan: {
    key: "cyan",
    label: "Cyan",
    text: "text-cyan-500 dark:text-cyan-400",
    bg: "bg-cyan-500",
    bgSoft: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    ring: "ring-cyan-500/40",
    gradient: "from-cyan-500 to-sky-500",
    dot: "bg-cyan-500",
    hex: "#06b6d4",
    chartStroke: "#06b6d4",
  },
  orange: {
    key: "orange",
    label: "Orange",
    text: "text-orange-500 dark:text-orange-400",
    bg: "bg-orange-500",
    bgSoft: "bg-orange-500/10",
    border: "border-orange-500/30",
    ring: "ring-orange-500/40",
    gradient: "from-orange-500 to-red-500",
    dot: "bg-orange-500",
    hex: "#f97316",
    chartStroke: "#f97316",
  },
  pink: {
    key: "pink",
    label: "Pink",
    text: "text-pink-500 dark:text-pink-400",
    bg: "bg-pink-500",
    bgSoft: "bg-pink-500/10",
    border: "border-pink-500/30",
    ring: "ring-pink-500/40",
    gradient: "from-pink-500 to-fuchsia-500",
    dot: "bg-pink-500",
    hex: "#ec4899",
    chartStroke: "#ec4899",
  },
  lime: {
    key: "lime",
    label: "Lime",
    text: "text-lime-500 dark:text-lime-400",
    bg: "bg-lime-500",
    bgSoft: "bg-lime-500/10",
    border: "border-lime-500/30",
    ring: "ring-lime-500/40",
    gradient: "from-lime-500 to-green-500",
    dot: "bg-lime-500",
    hex: "#84cc16",
    chartStroke: "#84cc16",
  },
}

export const ACCENT_COLOR_KEYS = Object.keys(ACCENT_COLORS) as AccentColor[]

export interface CategoryConfig {
  key: ChallengeCategory
  label: string
  emoji: string
  description: string
  defaultColor: AccentColor
}

export const CATEGORIES: CategoryConfig[] = [
  {
    key: "Health",
    label: "Health",
    emoji: "🫀",
    description: "Sleep, nutrition, hydration, wellbeing",
    defaultColor: "emerald",
  },
  {
    key: "Fitness",
    label: "Fitness",
    emoji: "💪",
    description: "Movement, strength, endurance",
    defaultColor: "orange",
  },
  {
    key: "Mind",
    label: "Mind",
    emoji: "🧠",
    description: "Meditation, reading, learning",
    defaultColor: "violet",
  },
  {
    key: "Career",
    label: "Career",
    emoji: "🚀",
    description: "Skills, projects, networking",
    defaultColor: "cyan",
  },
  {
    key: "Finance",
    label: "Finance",
    emoji: "💰",
    description: "Saving, budgeting, investing",
    defaultColor: "lime",
  },
  {
    key: "Social",
    label: "Social",
    emoji: "🤝",
    description: "Relationships, community, outreach",
    defaultColor: "pink",
  },
  {
    key: "Creativity",
    label: "Creativity",
    emoji: "🎨",
    description: "Art, writing, music, making",
    defaultColor: "amber",
  },
]

export const CATEGORY_MAP: Record<ChallengeCategory, CategoryConfig> =
  CATEGORIES.reduce(
    (acc, c) => {
      acc[c.key] = c
      return acc
    },
    {} as Record<ChallengeCategory, CategoryConfig>,
  )

export const DURATION_PRESETS: { label: string; value: number; hint: string }[] =
  [
    { label: "7 days", value: 7, hint: "Quick win" },
    { label: "14 days", value: 14, hint: "Two weeks" },
    { label: "21 days", value: 21, hint: "Habit builder" },
    { label: "30 days", value: 30, hint: "Monthly" },
    { label: "66 days", value: 66, hint: "Deep habit" },
    { label: "100 days", value: 100, hint: "Transformation" },
  ]

export const MOOD_CONFIG: Record<
  Mood,
  { label: string; emoji: string; color: string }
> = {
  great: { label: "Great", emoji: "🤩", color: "text-emerald-500" },
  good: { label: "Good", emoji: "🙂", color: "text-lime-500" },
  neutral: { label: "Neutral", emoji: "😐", color: "text-amber-500" },
  tough: { label: "Tough", emoji: "😣", color: "text-orange-500" },
  bad: { label: "Hard", emoji: "😖", color: "text-rose-500" },
}

export const MOOD_KEYS = Object.keys(MOOD_CONFIG) as Mood[]

/** Icon names available in the icon picker (Lucide). Keep in sync with the picker. */
export const CHALLENGE_ICONS = [
  "Target",
  "Flame",
  "BookOpen",
  "Dumbbell",
  "Brain",
  "HeartPulse",
  "DollarSign",
  "Briefcase",
  "Palette",
  "Music",
  "Code",
  "PenLine",
  "Coffee",
  "Sunrise",
  "Moon",
  "Footprints",
  "Apple",
  "Sparkles",
  "Trophy",
  "Zap",
]

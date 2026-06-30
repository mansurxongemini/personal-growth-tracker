import type { AccentColor, ChallengeCategory } from "./types"

export interface ChallengeTemplate {
  id: string
  title: string
  description: string
  category: ChallengeCategory
  duration: number
  dailyTarget: string
  color: AccentColor
  icon: string
  difficulty: "easy" | "medium" | "hard" | "extreme"
  tags: string[]
  emoji: string
}

export const TEMPLATES: ChallengeTemplate[] = [
  // Health
  {
    id: "tpl_water",
    title: "Drink 2L Water",
    description:
      "Stay hydrated every day. Proper hydration boosts energy, skin health, and cognitive function.",
    category: "Health",
    duration: 30,
    dailyTarget: "Drink 2 liters of water",
    color: "cyan",
    icon: "Apple",
    difficulty: "easy",
    tags: ["hydration", "energy", "skin"],
    emoji: "💧",
  },
  {
    id: "tpl_no_sugar",
    title: "No Added Sugar",
    description:
      "Cut all added sugar to reset your palate, stabilize energy, and reduce cravings.",
    category: "Health",
    duration: 14,
    dailyTarget: "0g added sugar",
    color: "rose",
    icon: "Apple",
    difficulty: "hard",
    tags: ["diet", "energy", "cravings"],
    emoji: "🚫",
  },
  {
    id: "tpl_sleep",
    title: "8 Hours of Sleep",
    description:
      "Prioritize 8 hours of quality sleep each night for optimal recovery and mental clarity.",
    category: "Health",
    duration: 21,
    dailyTarget: "Sleep 8 hours",
    color: "violet",
    icon: "Moon",
    difficulty: "medium",
    tags: ["recovery", "energy", "clarity"],
    emoji: "😴",
  },
  // Fitness
  {
    id: "tpl_10k_steps",
    title: "10K Steps Daily",
    description:
      "Walk 10,000 steps every day to stay active, boost mood, and improve cardiovascular health.",
    category: "Fitness",
    duration: 30,
    dailyTarget: "Walk 10,000 steps",
    color: "orange",
    icon: "Footprints",
    difficulty: "medium",
    tags: ["walking", "cardio", "mood"],
    emoji: "🚶",
  },
  {
    id: "tpl_pushups",
    title: "50 Push-ups",
    description:
      "Build upper body strength with 50 push-ups daily. Break into sets if needed.",
    category: "Fitness",
    duration: 21,
    dailyTarget: "50 push-ups",
    color: "orange",
    icon: "Dumbbell",
    difficulty: "medium",
    tags: ["strength", "upper-body"],
    emoji: "💪",
  },
  {
    id: "tpl_morning_run",
    title: "Morning Run",
    description:
      "Start your day with a 20-minute morning run to energize your body and clear your mind.",
    category: "Fitness",
    duration: 30,
    dailyTarget: "Run for 20 minutes",
    color: "emerald",
    icon: "Footprints",
    difficulty: "hard",
    tags: ["cardio", "morning", "energy"],
    emoji: "🏃",
  },
  // Mind
  {
    id: "tpl_meditation",
    title: "Morning Meditation",
    description:
      "Start each day with 10 minutes of mindful breathing to build mental clarity and calm.",
    category: "Mind",
    duration: 21,
    dailyTarget: "10 minutes of meditation",
    color: "violet",
    icon: "Brain",
    difficulty: "easy",
    tags: ["mindfulness", "calm", "focus"],
    emoji: "🧘",
  },
  {
    id: "tpl_read",
    title: "Read 20 Pages",
    description:
      "Read at least 20 pages of a non-fiction book every day to compound knowledge.",
    category: "Mind",
    duration: 30,
    dailyTarget: "Read 20 pages",
    color: "cyan",
    icon: "BookOpen",
    difficulty: "easy",
    tags: ["learning", "knowledge", "focus"],
    emoji: "📚",
  },
  {
    id: "tpl_journal",
    title: "Daily Journaling",
    description:
      "Write 3 things you're grateful for each day to rewire your brain for positivity.",
    category: "Mind",
    duration: 30,
    dailyTarget: "Write 3 gratitudes",
    color: "violet",
    icon: "PenLine",
    difficulty: "easy",
    tags: ["gratitude", "positivity", "reflection"],
    emoji: "✍️",
  },
  // Career
  {
    id: "tpl_code",
    title: "30 Days of Code",
    description:
      "Code for at least 1 hour every day. Build projects, learn new technologies, level up.",
    category: "Career",
    duration: 30,
    dailyTarget: "Code for 1 hour",
    color: "cyan",
    icon: "Code",
    difficulty: "medium",
    tags: ["coding", "skills", "projects"],
    emoji: "💻",
  },
  {
    id: "tpl_ship",
    title: "Ship Something Daily",
    description:
      "Push one meaningful commit or ship one small feature each day. Momentum compounds.",
    category: "Career",
    duration: 66,
    dailyTarget: "1 meaningful commit",
    color: "emerald",
    icon: "Briefcase",
    difficulty: "hard",
    tags: ["shipping", "momentum", "career"],
    emoji: "🚀",
  },
  {
    id: "tpl_network",
    title: "Daily Connection",
    description:
      "Reach out to one person in your network each day. Build relationships intentionally.",
    category: "Career",
    duration: 21,
    dailyTarget: "Connect with 1 person",
    color: "cyan",
    icon: "Sparkles",
    difficulty: "medium",
    tags: ["networking", "relationships"],
    emoji: "🤝",
  },
  // Finance
  {
    id: "tpl_no_spend",
    title: "No-Spend Challenge",
    description:
      "Spend money only on essentials for 30 days. Build financial awareness and discipline.",
    category: "Finance",
    duration: 30,
    dailyTarget: "No non-essential spending",
    color: "lime",
    icon: "DollarSign",
    difficulty: "hard",
    tags: ["saving", "discipline", "budget"],
    emoji: "💰",
  },
  {
    id: "tpl_track_expenses",
    title: "Track Every Expense",
    description:
      "Record every single expense daily to build financial awareness and control.",
    category: "Finance",
    duration: 21,
    dailyTarget: "Track all expenses",
    color: "lime",
    icon: "DollarSign",
    difficulty: "easy",
    tags: ["budget", "awareness", "tracking"],
    emoji: "📊",
  },
  // Creativity
  {
    id: "tpl_daily_photo",
    title: "Daily Photo",
    description:
      "Take one intentional photo every day. Train your eye for beauty and composition.",
    category: "Creativity",
    duration: 30,
    dailyTarget: "Take 1 intentional photo",
    color: "amber",
    icon: "Palette",
    difficulty: "easy",
    tags: ["photography", "creativity", "mindfulness"],
    emoji: "📸",
  },
  {
    id: "tpl_write",
    title: "Write 500 Words",
    description:
      "Write 500 words daily — journal, blog, or fiction. Build the writing habit.",
    category: "Creativity",
    duration: 30,
    dailyTarget: "Write 500 words",
    color: "amber",
    icon: "PenLine",
    difficulty: "medium",
    tags: ["writing", "creativity", "expression"],
    emoji: "📝",
  },
  {
    id: "tpl_draw",
    title: "Daily Sketch",
    description:
      "Draw one sketch every day for 30 days. Build your artistic skills through repetition.",
    category: "Creativity",
    duration: 30,
    dailyTarget: "1 sketch",
    color: "pink",
    icon: "Palette",
    difficulty: "medium",
    tags: ["drawing", "art", "practice"],
    emoji: "🎨",
  },
  // Social
  {
    id: "tpl_compliment",
    title: "Daily Compliment",
    description:
      "Give one genuine compliment each day. Spread positivity and strengthen connections.",
    category: "Social",
    duration: 21,
    dailyTarget: "Give 1 genuine compliment",
    color: "pink",
    icon: "HeartPulse",
    difficulty: "easy",
    tags: ["kindness", "connection", "positivity"],
    emoji: "💛",
  },
  {
    id: "tpl_family_call",
    title: "Call Family",
    description:
      "Call a family member every day. Maintain bonds that matter most.",
    category: "Social",
    duration: 21,
    dailyTarget: "Call 1 family member",
    color: "pink",
    icon: "HeartPulse",
    difficulty: "easy",
    tags: ["family", "connection", "relationships"],
    emoji: "📞",
  },
]

export const DIFFICULTY_STYLES: Record<
  ChallengeTemplate["difficulty"],
  { label: string; color: string; dots: number }
> = {
  easy: { label: "Easy", color: "text-emerald-400", dots: 1 },
  medium: { label: "Medium", color: "text-amber-400", dots: 2 },
  hard: { label: "Hard", color: "text-orange-400", dots: 3 },
  extreme: { label: "Extreme", color: "text-rose-400", dots: 4 },
}

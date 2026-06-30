/**
 * Daily motivational quotes — rotated by day-of-year so every user sees
 * the same quote on the same day. Curated for personal development themes.
 */
export interface Quote {
  text: string
  author: string
  category: "discipline" | "growth" | "courage" | "consistency" | "mindset"
}

export const QUOTES: Quote[] = [
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
    category: "consistency",
  },
  {
    text: "Discipline is the bridge between goals and accomplishment.",
    author: "Jim Rohn",
    category: "discipline",
  },
  {
    text: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.",
    author: "John C. Maxwell",
    category: "consistency",
  },
  {
    text: "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear",
    category: "systems",
  },
  {
    text: "The mind is everything. What you think you become.",
    author: "Buddha",
    category: "mindset",
  },
  {
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
    category: "consistency",
  },
  {
    text: "Motivation gets you going, but discipline keeps you growing.",
    author: "John C. Maxwell",
    category: "discipline",
  },
  {
    text: "Do something today that your future self will thank you for.",
    author: "Sean Patrick Flanery",
    category: "growth",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "mindset",
  },
  {
    text: "Courage is not the absence of fear, but the triumph over it.",
    author: "Nelson Mandela",
    category: "courage",
  },
  {
    text: "What you get by achieving your goals is not as important as what you become by achieving them.",
    author: "Zig Ziglar",
    category: "growth",
  },
  {
    text: "The journey of a thousand miles begins with a single step.",
    author: "Lao Tzu",
    category: "courage",
  },
  {
    text: "Habits are the compound interest of self-improvement.",
    author: "James Clear",
    category: "consistency",
  },
  {
    text: "Fall seven times, stand up eight.",
    author: "Japanese Proverb",
    category: "courage",
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
    category: "growth",
  },
  {
    text: "You'll never change your life until you change something you do daily.",
    author: "Mike Murdock",
    category: "consistency",
  },
  {
    text: "The secret of your future is hidden in your daily routine.",
    author: "Mike Murdock",
    category: "discipline",
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    category: "consistency",
  },
  {
    text: "Quality is not an act, it is a habit.",
    author: "Aristotle",
    category: "discipline",
  },
  {
    text: "The pain you feel today is the strength you feel tomorrow.",
    author: "Unknown",
    category: "growth",
  },
  {
    text: "Every action you take is a vote for the type of person you wish to become.",
    author: "James Clear",
    category: "mindset",
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    category: "consistency",
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    category: "mindset",
  },
  {
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
    category: "growth",
  },
  {
    text: "We must be willing to let go of the life we planned so as to have the life that is waiting for us.",
    author: "Joseph Campbell",
    category: "courage",
  },
  {
    text: "Start where you are. Use what you have. Do what you can.",
    author: "Arthur Ashe",
    category: "courage",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "courage",
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi",
    category: "growth",
  },
  {
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis",
    category: "growth",
  },
  {
    text: "Consistency is what transforms average into excellence.",
    author: "Unknown",
    category: "consistency",
  },
]

/**
 * Get today's quote based on day-of-year.
 */
export function getDailyQuote(): Quote {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return QUOTES[dayOfYear % QUOTES.length]
}

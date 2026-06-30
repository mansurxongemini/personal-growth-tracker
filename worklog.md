# Ascent — Personal Development Challenge App

## Project Status (Phase 1 — Complete)

A premium, full-stack Personal Development Challenge application built with
Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui, Prisma (SQLite),
Framer Motion, Recharts, and react-confetti.

The app is **fully functional and browser-verified**. All core user flows work
end-to-end with no runtime errors.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router), TypeScript 5, Turbopack dev server
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York), custom glassmorphism +
  deep-space dark theme (default) / crisp light theme via next-themes
- **Database**: Prisma ORM + SQLite (`db/custom.db`)
- **State**: Zustand (client) — single `useAppStore`
- **Animation**: Framer Motion (card hovers, tab transitions, layout animations)
- **Charts**: Recharts (area, bar, pie) + custom SVG ring progress + custom
  GitHub-style heatmap
- **Confetti**: react-confetti (fires on successful daily check-in)
- **Icons**: lucide-react

---

## Architecture

### Database (Prisma schema)
- `Challenge` — title, description, category, duration, dailyTarget, color,
  icon, startDate, status (active/completed/failed/paused)
- `DailyLog` — challengeId, date (unique per challenge), dayNumber, completed
  (pre-seeded for every day of a challenge on creation)
- `Note` — challengeId (optional), dailyLogId (optional), title, content, mood
  (great/good/neutral/tough/bad), date

### API Routes (App Router, all `force-dynamic`)
- `GET/POST /api/challenges` — list + create (pre-seeds DailyLog rows)
- `GET/PATCH/DELETE /api/challenges/[id]` — detail / update / delete
- `POST /api/challenges/[id]/logs` — toggle check-in for a day, returns
  refreshed stats + derived status
- `GET/POST /api/notes` — list (filterable by challengeId) + create
- `PATCH/DELETE /api/notes/[id]`
- `GET/POST /api/seed` — auto-seeds 5 demo challenges + reflections on first
  visit (GET checks `hasData`, POST wipes + reseeds)
- `GET /api/analytics` — aggregated KPIs, 12-week trend, 6-month trend,
  category breakdown, per-challenge progress, 18-week heatmap, global streaks

### Lib
- `lib/types.ts` — shared TS interfaces
- `lib/challenge-config.ts` — 7 categories, 8 accent colors, 6 duration
  presets, 5 moods, 20 challenge icons
- `lib/date-utils.ts` — date normalization, streak computation, heatmap/window
  builders
- `lib/analytics.ts` — `computeChallengeStats` + `deriveStatus`
- `lib/store.ts` — Zustand store (tabs, challenges, notes, dialogs, filters)
- `lib/db.ts` — Prisma client singleton

### Components
- `theme-provider`, `theme-toggle`, `header`, `tab-nav`
- `today-focus` — dashboard hero with quick check-in list + live stats
- `challenge-card` — grid card with ring progress, streak, status, day bar
- `create-challenge-dialog` — rich form (category grid, duration pills, color
  picker, icon picker, date picker, live preview)
- `challenge-detail-dialog` — big check-in circle, stats tiles, day grid,
  reflections list, confetti on check-in
- `daily-check-in` — giant animated circular button with pulsing rings
- `day-grid` — clickable history of all days (7–14 cols responsive)
- `ring-progress` — reusable SVG ring with gradient + animated stroke
- `heatmap-calendar` — GitHub-style 18-week contribution grid with tooltips
- `analytics-tab` — KPI cards, heatmap, weekly area chart, category pie,
  monthly bar chart, completion ring, per-challenge bars
- `notes-tab` — search + filter (challenge/mood), date-grouped reflection cards
- `note-composer-dialog` — mood picker, challenge link, title, content
- `confetti` — react-confetti wrapper triggered by a changing `fire` prop

### Page (`/` — the only route)
Single-page app with 3 tabs (Dashboard / Analytics / Notes) + 3 global dialogs
(Create Challenge, Challenge Detail, Note Composer). Auto-seeds demo data on
first load. Sticky header + sticky tab nav + sticky footer.

---

## Verification Results (agent-browser + VLM)

Tested end-to-end with agent-browser and z-ai vision (VLM):

1. **Dashboard renders** — Today's Focus hero (live streak/best/done-today
   stats + quick check-in list), filter pills, 5-seeded + 1-created challenge
   cards. VLM: "polished and modern, no rendering issues, excellent
   readability."
2. **Challenge detail dialog** — big check-in circle (done state with checkmark),
   4 stat tiles, day grid, reflections. VLM confirmed all elements render.
3. **Analytics tab** — KPI cards, heatmap with colored cells, all Recharts
   (area/pie/bar/ring), per-challenge progress bars. VLM: "all components
   display correctly, no visual errors."
4. **Notes tab** — search, 2 filter dropdowns, date-grouped reflection cards
   with mood emojis + challenge links. VLM confirmed.
5. **Create challenge** — filled title + daily target, selected category,
   submitted → "Drink 2L Water" appeared at top of dashboard. ✅
6. **Daily check-in + confetti** — clicked Done in quick check-in → state
   updated (streak 0→1, done-today count incremented), confetti canvas fired
   with colorful pieces (verified via VLM on rapid-capture frames). ✅
7. **No console errors / no runtime errors** after fixing the DialogContent
   aria warning (added sr-only DialogDescription).
8. **Lint clean** (`bun run lint` passes).

---

## Current Goals / Completed Modifications

- ✅ Challenge management (create with full form, dashboard grid with filters,
  status changes, delete with confirm)
- ✅ Daily tracking (giant check-in button, day grid history, per-day toggle)
- ✅ Visual statistics (streak counter with fire glow, GitHub heatmap, weekly
  area chart, monthly bar chart, category pie, completion ring, per-challenge
  bars)
- ✅ Daily notes/journaling (composer with mood + challenge link, searchable +
  filterable notes tab, date grouping)
- ✅ Beautiful dark/light theme with glassmorphism + deep-space gradients
- ✅ Framer Motion animations (card hover, tab switching, layout transitions)
- ✅ Confetti on successful check-in
- ✅ Auto-seeding of demo data
- ✅ Responsive (mobile-first, tested at 1440px; grid collapses to 1 col)

---

## Unresolved Issues / Risks / Next-Phase Priorities

### Known minor items
- Confetti timing is brief (~1.6s visible window). Could extend duration or add
  a second burst for longer celebrations.
- The `last30` analytics field is computed but not yet visualized in a
  dedicated widget (currently covered by the heatmap).
- No persistence of theme beyond next-themes default (system/localStorage) —
  works but could add an explicit settings panel.

### Recommended next-phase features
1. **Authentication** — NextAuth.js is available; wire up single-user or
   multi-user accounts so challenges are scoped per user.
2. **Reminders/notifications** — daily check-in reminders (could use the cron
   tool or a mini-service).
3. **Challenge templates** — pre-built challenge library (e.g. "30 Days of
   Code", "Morning Routine") users can one-click start.
4. **Export/share** — export stats as image or PDF; shareable public challenge
   pages.
5. **Achievements/badges** — milestone rewards (7-day streak, first completion,
   100 check-ins).
6. **Notes rich text** — upgrade composer to markdown or rich text.
7. **Mobile gesture** — swipe between tabs, pull-to-refresh.
8. **Heatmap zoom** — allow toggling 6/12/18/52 week views.

### Priority recommendation
Stabilize confetti duration + add a "celebration" toast variant, then move to
authentication so the app is multi-user ready.

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

---

# Phase 2 — Context-Aware Multi-Provider AI Integration

## Project Status (Phase 2 — Complete)

Implemented the **Context-Aware Multi-Provider AI Architecture** from the
uploaded guide (`ai_integration_guide.pdf`, written in Uzbek). The app now has
a context-injecting AI assistant that reads ALL of the user's data
(challenges, daily logs, notes) and answers personalized questions, plus a
full settings UI for provider/model/temperature/system-prompt configuration.

The AI integration is **fully functional and browser-verified**.

---

## What the Guide Required (Uzbek → English summary)

1. **Context Injection model** — gather user's data from DB, feed to AI as
   prepared context (not a generic chatbot).
2. **Auth & Security** — NextAuth.js JWT login; AI requests scoped to userId.
3. **Dynamic Provider Routing** — switchable providers (OpenAI, Anthropic,
   Gemini, DeepSeek); API keys stored in DB.
4. **AiSetting model** in Prisma — provider, apiKey, customModel.
5. **Universal AI Provider Adapter** — `/api/ai/route.ts` with a dynamic
   router.
6. **Ultra-minimalistic UI** — monochrome, fine borders, frameless inputs.

### Adaptation note
Per platform rules, the actual LLM call MUST go through `z-ai-web-dev-sdk`
(not raw OpenAI/Anthropic fetches). I preserved the guide's architecture
(context injection, provider/model selection concept, AiSetting model,
settings UI) but route every call through z-ai under the hood. Auth
(NextAuth) was deferred because the system constraint limits the app to a
single `/` route (no /login page) — AiSetting is stored as a singleton
(`scope="global"`) and is auth-ready (swap `scope="user"` + `userId` when
auth lands).

---

## New Files

### Lib
- `src/lib/ai-context.ts` — `buildUserContext()` (gathers all challenges +
  logs + notes → structured context string with per-challenge progress,
  streaks, today's status, recent reflections) + `buildSystemPrompt()` +
  `AI_SUGGESTIONS` (6 quick-prompt chips).
- `src/lib/ai-provider.ts` — universal adapter (`runChat()`) wrapping
  `z-ai-web-dev-sdk`; `PROVIDERS` metadata (zai/openai/anthropic/gemini/
  deepseek with models + needsKey flags).

### API Routes
- `src/app/api/ai/route.ts` — `GET` (history, last 30), `POST` (context-aware
  chat: load settings → build context → build system prompt → load history →
  runChat → persist user+assistant messages → return reply + usage +
  contextStats), `DELETE` (clear history).
- `src/app/api/ai/settings/route.ts` — `GET` (settings + providers list,
  apiKey masked as `***`), `PATCH` (provider/model/temperature/enabled/
  systemPrompt/apiKey; auto-resets model when provider changes).

### Components
- `src/components/ai/ai-assistant-panel.tsx` — right-side slide-over Sheet
  (minimalist monochrome per guide): welcome state with 6 suggestion chips,
  message bubbles (user=dark, AI=white with markdown rendering via
  react-markdown), typing dots, quick-suggestion strip after messages,
  frameless textarea input (`bg-zinc-100 dark:bg-zinc-900 focus:ring-1`),
  clear-history + settings gear + close buttons.
- `src/components/ai/ai-settings-dialog.tsx` — minimalist settings dialog:
  enable Switch, provider Select, model Select, API-key Input (only for
  external providers), temperature Slider (0–2 with tooltips), system-prompt
  Textarea (4000 char cap), context-injection explainer card, Save button.

### Schema (Prisma)
- `AiSetting` — id, scope (global|user), userId, provider, model, apiKey,
  systemPrompt, temperature, enabled. `@@unique([scope, userId])`.
- `AiMessage` — id, role, content, context (audit snapshot), createdAt.

### Store (Zustand)
- Added: `aiPanelOpen`, `aiMessages`, `appendAiMessage`,
  `updateLastAiMessage`, `clearAiMessages`, `aiThinking`, `aiSettingsOpen`,
  `aiSettings`, `aiProviders`.

### Header
- Added AI assistant button (Bot icon, violet pulse dot, tooltip "AI
  Yordamchi") between theme toggle and New Challenge.

---

## Verification Results (curl + agent-browser + VLM)

1. **`GET /api/ai/settings`** → returns `{ settings, providers }` with 5
   providers, default `zai/glm-4.6/0.7/enabled`. ✅
2. **`PATCH /api/ai/settings`** → temperature 0.7→0.9 + custom system prompt
   saved; reset back works. ✅
3. **`POST /api/ai`** → context-aware chat. AI response (Uzbek, markdown):
   > "### Progress Xulosasi
   > - **Jami progress:** 52% o'rtacha (6 ta challenge...)
   > - **Eng yuqori streak:** 13 kun ("Read 20 Pages")
   > - **Bugun:** Barcha challenge'lar bajarildi ✓
   > ### Tavsiyalar
   > - **"No Sugar"** challenge 6 kun qoldi..."
   
   Referenced specific challenges ("No Sugar", "Read 20 Pages", "10K Steps"),
   streak (13 days), check-in count (72), completion %. Returned usage
   (1396 prompt + 166 completion tokens). ✅
4. **`DELETE /api/ai`** → clears history (200). ✅
5. **Browser**: AI panel opens from header button; welcome state shows 6
   suggestion chips; clicking "Motivatsiya" sends prompt → AI responds with
   rich markdown (headings "🚀 Sizning Yutuqlaringiz", "💡 Keyingi Qadam"
   + lists). VLM confirmed: "user message and AI response visible, markdown
   bold/bullets, mentions specific challenges, minimalist design." ✅
6. **Lint clean** (`bun run lint` passes). ✅
7. **No runtime errors** in dev log during AI requests.

---

## Current Goals / Completed Modifications (Phase 2)

- ✅ Context Injection architecture — AI reads all user data per request
- ✅ Universal provider adapter (z-ai SDK under the hood, provider-aware UI)
- ✅ AiSetting model (singleton global, auth-ready)
- ✅ AiMessage persistence (chat history survives reloads)
- ✅ AI assistant slide-over panel (minimalist monochrome, markdown rendering)
- ✅ 6 quick-suggestion chips (Uzbek: progress, attention, motivation, today,
  analysis, advice)
- ✅ AI settings dialog (enable, provider, model, API key, temperature,
  custom system prompt)
- ✅ Header AI button with pulse indicator
- ✅ Conversation history (last 12 messages sent as context)
- ✅ Context audit snapshot stored on each AiMessage

---

## Unresolved Issues / Risks / Next-Phase Priorities

### Known items
- **Auth not implemented** — guide specified NextAuth.js JWT login. Deferred
  because the app is constrained to a single `/` route. AiSetting is a
  singleton global; swap to `scope="user"` + `userId` when auth lands.
- **External providers** (OpenAI/Anthropic/Gemini/DeepSeek) currently route
  through z-ai SDK regardless of selection (platform rule). The provider
  field is stored + shown in UI for transparency and future wiring. To truly
  support external providers, add a server-side fetch path in `runChat()`
  guarded by the stored apiKey.
- **API key storage** is plaintext in SQLite (guide noted "should be
  encrypted"). Add AES encryption before production.
- **No streaming** — responses are returned whole. Could add SSE streaming
  for a typewriter effect.
- **Dev server stability in sandbox** — background processes started in a
  Bash tool invocation are reaped when that invocation ends; all
  cross-invocation testing had to be done in single combined commands.

### Recommended next-phase features
1. **NextAuth.js** — add Credentials provider + a `/login` route (requires
   relaxing the single-route constraint) and scope AiSetting/AiMessage per
   user.
2. **Streaming responses** — SSE or ReadableStream for token-by-token output.
3. **Per-challenge AI** — a "ask about this challenge" button inside the
   detail dialog that scopes context to just that challenge.
4. **AI-generated insights** — a daily auto-generated insight card on the
   dashboard (cron → AI analyzes today's data → cached insight).
5. **Voice input** — ASR skill for voice-to-chat.
6. **Encrypt API keys** at rest.
7. **Rate limiting** on `/api/ai`.

### Priority recommendation
Wire NextAuth + per-user scoping next (highest architectural value), then
add streaming responses for UX polish.

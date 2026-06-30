"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  Flame,
  Trophy,
  CheckCircle2,
  Target,
  Activity,
  TrendingUp,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { RingProgress } from "@/components/ring-progress"
import { HeatmapCalendar } from "@/components/heatmap-calendar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

interface AnalyticsData {
  summary: {
    totalChallenges: number
    totalActiveChallenges: number
    totalCompletedChallenges: number
    totalFailedChallenges: number
    totalCheckIns: number
    activeDays: number
    currentStreak: number
    longestStreak: number
  }
  weekly: { week: string; checkIns: number }[]
  monthly: { month: string; checkIns: number }[]
  categoryBreakdown: { name: string; value: number; color: string }[]
  perChallenge: {
    id: string
    title: string
    color: string
    category: string
    status: string
    duration: number
    completed: number
    completionRate: number
  }[]
  heatmap: { date: Date; iso: string; completed: boolean; inFuture: boolean }[][]
  last30: { iso: string; completed: boolean; label: string }[]
}

export function AnalyticsTab() {
  const [data, setData] = React.useState<AnalyticsData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  const s = data.summary
  const completionRate =
    s.totalChallenges > 0
      ? Math.round((s.totalCompletedChallenges / s.totalChallenges) * 100)
      : 0

  return (
    <div className="space-y-6">
      {/* Top KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={<Flame className="size-5 text-orange-400 flame-glow" />}
          label="Current streak"
          value={s.currentStreak}
          suffix="days"
          gradient="from-orange-500/20 to-amber-500/10"
          accent="text-orange-400"
        />
        <KpiCard
          icon={<Trophy className="size-5 text-amber-400" />}
          label="Longest streak"
          value={s.longestStreak}
          suffix="days"
          gradient="from-amber-500/20 to-yellow-500/10"
          accent="text-amber-400"
        />
        <KpiCard
          icon={<CheckCircle2 className="size-5 text-emerald-400" />}
          label="Total check-ins"
          value={s.totalCheckIns}
          suffix=""
          gradient="from-emerald-500/20 to-teal-500/10"
          accent="text-emerald-400"
        />
        <KpiCard
          icon={<Target className="size-5 text-violet-400" />}
          label="Challenges"
          value={s.totalChallenges}
          suffix=""
          subline={`${s.totalActiveChallenges} active · ${s.totalCompletedChallenges} done`}
          gradient="from-violet-500/20 to-fuchsia-500/10"
          accent="text-violet-400"
        />
      </div>

      {/* Heatmap */}
      <Card className="overflow-hidden border-border/60 bg-card/50 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="size-4 text-emerald-400" />
            Activity Heatmap
          </CardTitle>
          <CardDescription>
            Daily check-ins across all challenges · last 18 weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HeatmapCalendar columns={data.heatmap as never} />
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Weekly trend */}
        <Card className="border-border/60 bg-card/50 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-cyan-400" />
              Weekly check-ins
            </CardTitle>
            <CardDescription>Last 12 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weekly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 10, fill: "currentColor" }}
                    className="text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "currentColor" }}
                    className="text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "var(--foreground)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="checkIns"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fill="url(#weekGrad)"
                    dot={{ r: 3, fill: "#06b6d4", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card className="border-border/60 bg-card/50 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4 text-violet-400" />
              By category
            </CardTitle>
            <CardDescription>Check-ins distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {data.categoryBreakdown.length === 0 ? (
              <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                No data yet
              </div>
            ) : (
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryBreakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {data.categoryBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly + completion rate */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/50 backdrop-blur-md lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-emerald-400" />
              Monthly trend
            </CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    className="text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "currentColor" }}
                    className="text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "var(--accent)", opacity: 0.3 }}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="checkIns"
                    fill="url(#barGrad)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-border/60 bg-card/50 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="size-4 text-emerald-400" />
              Completion rate
            </CardTitle>
            <CardDescription>Challenges finished</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col items-center justify-center">
            <RingProgress
              value={completionRate}
              size={140}
              strokeWidth={12}
              gradientFrom="#10b981"
              gradientTo="#06b6d4"
            >
              <div className="text-center">
                <div className="text-3xl font-bold tabular-nums">
                  {completionRate}%
                </div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  completed
                </div>
              </div>
            </RingProgress>
            <div className="mt-4 flex gap-4 text-center text-xs">
              <div>
                <div className="text-lg font-bold text-amber-400">
                  {s.totalCompletedChallenges}
                </div>
                <div className="text-muted-foreground">Completed</div>
              </div>
              <div className="w-px bg-border" />
              <div>
                <div className="text-lg font-bold text-rose-400">
                  {s.totalFailedChallenges}
                </div>
                <div className="text-muted-foreground">Ended</div>
              </div>
              <div className="w-px bg-border" />
              <div>
                <div className="text-lg font-bold text-emerald-400">
                  {s.totalActiveChallenges}
                </div>
                <div className="text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per challenge bars */}
      <Card className="border-border/60 bg-card/50 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4 text-violet-400" />
            Per-challenge progress
          </CardTitle>
          <CardDescription>Completion rate by challenge</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {data.perChallenge.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No challenges yet
            </div>
          ) : (
            data.perChallenge.map((c, i) => {
              const colorMap: Record<string, string> = {
                emerald: "#10b981",
                rose: "#f43f5e",
                amber: "#f59e0b",
                violet: "#8b5cf6",
                cyan: "#06b6d4",
                orange: "#f97316",
                pink: "#ec4899",
                lime: "#84cc16",
              }
              const hex = colorMap[c.color] ?? "#10b981"
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.4) }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium">
                      <span
                        className="size-2 rounded-full"
                        style={{ background: hex }}
                      />
                      {c.title}
                      <span className="text-muted-foreground">
                        ({c.completed}/{c.duration})
                      </span>
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {c.completionRate}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-border/50">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: hex }}
                      initial={{ width: 0 }}
                      animate={{ width: `${c.completionRate}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.04 }}
                    />
                  </div>
                </motion.div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  suffix,
  subline,
  gradient,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: number
  suffix?: string
  subline?: string
  gradient: string
  accent?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur-md",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-gradient-to-br opacity-60 blur-2xl",
          gradient,
        )}
      />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          {icon}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tabular-nums">{value}</span>
          {suffix && (
            <span className="text-xs text-muted-foreground">{suffix}</span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
        {subline && (
          <p className={cn("mt-1 text-[10px]", accent)}>{subline}</p>
        )}
      </div>
    </motion.div>
  )
}

"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PenLine,
  Plus,
  Search,
  Trash2,
  Pencil,
  NotebookPen,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAppStore } from "@/lib/store"
import { ACCENT_COLORS, MOOD_CONFIG, MOOD_KEYS } from "@/lib/challenge-config"
import type { Mood, NoteEntry } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { toast } from "sonner"

export function NotesTab() {
  const notes = useAppStore((s) => s.notes)
  const setNotes = useAppStore((s) => s.setNotes)
  const challenges = useAppStore((s) => s.challenges)
  const openNoteComposer = useAppStore((s) => s.openNoteComposer)
  const setEditingNote = useAppStore((s) => s.setEditingNote)
  const removeNote = useAppStore((s) => s.removeNote)

  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [filterChallenge, setFilterChallenge] = React.useState<string>("all")
  const [filterMood, setFilterMood] = React.useState<string>("all")

  React.useEffect(() => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then((d) => setNotes(d.notes ?? []))
      .catch(() => toast.error("Failed to load notes"))
      .finally(() => setLoading(false))
  }, [setNotes])

  const filtered = React.useMemo(() => {
    return notes.filter((n) => {
      if (filterChallenge !== "all" && n.challengeId !== filterChallenge)
        return false
      if (filterMood !== "all" && n.mood !== filterMood) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !n.title.toLowerCase().includes(q) &&
          !n.content.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [notes, search, filterChallenge, filterMood])

  // Group by date
  const grouped = React.useMemo(() => {
    const map = new Map<string, NoteEntry[]>()
    for (const n of filtered) {
      const key = format(parseISO(n.date), "yyyy-MM-dd")
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(n)
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[0] < b[0] ? 1 : -1,
    )
  }, [filtered])

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      removeNote(id)
      toast.success("Note deleted")
    } catch {
      toast.error("Failed to delete note")
    }
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reflections..."
            className="h-10 rounded-full border-border/60 bg-card/40 pl-9 backdrop-blur-md"
          />
        </div>
        <Select value={filterChallenge} onValueChange={setFilterChallenge}>
          <SelectTrigger className="h-10 w-[180px] rounded-full border-border/60 bg-card/40 backdrop-blur-md">
            <SelectValue placeholder="All challenges" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All challenges</SelectItem>
            {challenges.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterMood} onValueChange={setFilterMood}>
          <SelectTrigger className="h-10 w-[140px] rounded-full border-border/60 bg-card/40 backdrop-blur-md">
            <SelectValue placeholder="All moods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All moods</SelectItem>
            {MOOD_KEYS.map((m) => (
              <SelectItem key={m} value={m}>
                {MOOD_CONFIG[m].emoji} {MOOD_CONFIG[m].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => openNoteComposer(null)}
          className="gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:brightness-110"
        >
          <Plus className="size-4" /> New note
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : grouped.length === 0 ? (
        <EmptyNotes onCreate={() => openNoteComposer(null)} />
      ) : (
        <div className="space-y-6">
          {grouped.map(([dateKey, items]) => (
            <div key={dateKey} className="space-y-3">
              <div className="sticky top-0 z-10 flex items-center gap-2 bg-background/60 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground backdrop-blur-sm">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {format(parseISO(dateKey + "T00:00:00"), "EEEE, MMM d")}
                <span className="text-muted-foreground/60">·</span>
                <span>
                  {items.length} reflection{items.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {items.map((n) => (
                    <NoteCard
                      key={n.id}
                      note={n}
                      onEdit={() => setEditingNote(n)}
                      onDelete={() => handleDelete(n.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: NoteEntry
  onEdit: () => void
  onDelete: () => void
}) {
  const accent = note.challenge
    ? ACCENT_COLORS[note.challenge.color as never] ?? ACCENT_COLORS.emerald
    : ACCENT_COLORS.emerald
  const mood = MOOD_CONFIG[note.mood as Mood] ?? MOOD_CONFIG.neutral

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur-md transition-all hover:border-border",
      )}
    >
      {/* Accent strip */}
      <div className={cn("absolute inset-y-0 left-0 w-1", accent.bg)} />

      <div className="flex items-start justify-between gap-2 pl-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{mood.emoji}</span>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {format(parseISO(note.date), "MMM d")}
            </p>
            {note.challenge && (
              <p className={cn("text-xs font-medium", accent.text)}>
                {note.challenge.title}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-full text-muted-foreground hover:bg-accent"
            onClick={onEdit}
          >
            <Pencil className="size-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-full text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
              >
                <Trash2 className="size-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                <AlertDialogDescription>
                  This reflection will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-rose-500 text-white hover:bg-rose-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {note.title && (
        <h3 className="mt-2 pl-2 font-semibold leading-tight">{note.title}</h3>
      )}
      <p className="mt-1 line-clamp-5 whitespace-pre-wrap pl-2 text-sm text-muted-foreground">
        {note.content}
      </p>
    </motion.article>
  )
}

function EmptyNotes({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/30 px-6 py-16 text-center backdrop-blur-md"
    >
      <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-xl shadow-violet-500/30">
        <NotebookPen className="size-7" />
      </div>
      <h3 className="mt-5 text-xl font-bold">No reflections yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Capture a quick thought about how your day went. Reflections compound
        into self-awareness.
      </p>
      <Button
        onClick={onCreate}
        className="mt-5 gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:brightness-110"
      >
        <PenLine className="size-4" /> Write a note
      </Button>
    </motion.div>
  )
}

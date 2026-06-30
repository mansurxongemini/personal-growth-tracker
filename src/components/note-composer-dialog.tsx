"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { PenLine, Loader2, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppStore } from "@/lib/store"
import { MOOD_CONFIG, MOOD_KEYS } from "@/lib/challenge-config"
import type { Mood } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function NoteComposerDialog() {
  const open = useAppStore((s) => s.noteComposerOpen)
  const close = useAppStore((s) => s.closeNoteComposer)
  const defaultChallengeId = useAppStore((s) => s.noteComposerChallengeId)
  const editing = useAppStore((s) => s.editingNote)
  const challenges = useAppStore((s) => s.challenges)
  const upsertNote = useAppStore((s) => s.upsertNote)

  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [mood, setMood] = React.useState<Mood>("good")
  const [challengeId, setChallengeId] = React.useState<string>("none")
  const [saving, setSaving] = React.useState(false)

  // Hydrate when opening
  React.useEffect(() => {
    if (open) {
      if (editing) {
        setTitle(editing.title)
        setContent(editing.content)
        setMood(editing.mood as Mood)
        setChallengeId(editing.challengeId ?? "none")
      } else {
        setTitle("")
        setContent("")
        setMood("good")
        setChallengeId(defaultChallengeId ?? "none")
      }
    }
  }, [open, editing, defaultChallengeId])

  async function handleSave() {
    if (!content.trim()) {
      toast.error("Write something first")
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        mood,
        challengeId: challengeId === "none" ? null : challengeId,
      }
      if (editing) {
        const res = await fetch(`/api/notes/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error("Failed")
        const refreshed = await fetch("/api/notes").then((r) => r.json())
        upsertNote(
          (refreshed.notes as never[]).find(
            (n: never) => (n as { id: string }).id === editing.id,
          ) as never,
        )
        toast.success("Note updated")
      } else {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error("Failed")
        const { note } = await res.json()
        upsertNote(note)
        toast.success("Reflection saved", {
          description: `${MOOD_CONFIG[mood].emoji} ${MOOD_CONFIG[mood].label}`,
        })
      }
      close()
    } catch {
      toast.error("Failed to save note")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin border-border/60 bg-card/95 backdrop-blur-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
              <PenLine className="size-4" />
            </span>
            {editing ? "Edit reflection" : "New reflection"}
          </DialogTitle>
          <DialogDescription>
            A few words about how today went.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mood */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Mood
            </Label>
            <div className="flex flex-wrap gap-2">
              {MOOD_KEYS.map((m) => {
                const cfg = MOOD_CONFIG[m]
                const active = mood === m
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                      active
                        ? "border-transparent bg-foreground text-background"
                        : "border-border/60 bg-background/40 text-muted-foreground hover:bg-accent/40",
                    )}
                  >
                    <span className="text-sm">{cfg.emoji}</span>
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Challenge */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Linked challenge
            </Label>
            <Select value={challengeId} onValueChange={setChallengeId}>
              <SelectTrigger className="h-11 border-border/60 bg-background/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (general)</SelectItem>
                {challenges.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label
              htmlFor="note-title"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Title <span className="text-muted-foreground/60">(optional)</span>
            </Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A short headline"
              maxLength={100}
              className="h-11 border-border/60 bg-background/60"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <Label
              htmlFor="note-content"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Reflection
            </Label>
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What happened today? What did you learn? How did it feel?"
              className="min-h-[140px] resize-none border-border/60 bg-background/60"
              maxLength={2000}
            />
            <p className="text-right text-[10px] text-muted-foreground">
              {content.length}/2000
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="gap-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:brightness-110"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {editing ? "Save changes" : "Save reflection"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

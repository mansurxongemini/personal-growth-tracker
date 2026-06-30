"use client"

import { create } from "zustand"
import type { ChallengeWithStats, NoteEntry } from "./types"

export type DashboardFilter = "all" | "active" | "completed" | "failed"
export type TabKey = "dashboard" | "analytics" | "notes"

interface AppState {
  // navigation
  activeTab: TabKey
  setActiveTab: (t: TabKey) => void

  // data
  challenges: ChallengeWithStats[]
  setChallenges: (c: ChallengeWithStats[]) => void
  upsertChallenge: (c: ChallengeWithStats) => void
  removeChallenge: (id: string) => void
  updateChallengeStatus: (id: string, status: string) => void
  patchChallengeStats: (id: string, stats: ChallengeWithStats["stats"]) => void

  notes: NoteEntry[]
  setNotes: (n: NoteEntry[]) => void
  upsertNote: (n: NoteEntry) => void
  removeNote: (id: string) => void

  // selection
  selectedChallengeId: string | null
  openChallenge: (id: string) => void
  closeChallenge: () => void

  // dashboard filter
  filter: DashboardFilter
  setFilter: (f: DashboardFilter) => void

  // create dialog
  createOpen: boolean
  setCreateOpen: (v: boolean) => void

  // note composer
  noteComposerOpen: boolean
  noteComposerChallengeId: string | null
  openNoteComposer: (challengeId?: string | null) => void
  closeNoteComposer: () => void

  // editing note
  editingNote: NoteEntry | null
  setEditingNote: (n: NoteEntry | null) => void

  // loading flags
  loading: boolean
  setLoading: (v: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: "dashboard",
  setActiveTab: (t) => set({ activeTab: t }),

  challenges: [],
  setChallenges: (c) => set({ challenges: c }),
  upsertChallenge: (c) =>
    set((s) => {
      const idx = s.challenges.findIndex((x) => x.id === c.id)
      const next = [...s.challenges]
      if (idx >= 0) next[idx] = c
      else next.unshift(c)
      return { challenges: next }
    }),
  removeChallenge: (id) =>
    set((s) => ({ challenges: s.challenges.filter((c) => c.id !== id) })),
  updateChallengeStatus: (id, status) =>
    set((s) => ({
      challenges: s.challenges.map((c) =>
        c.id === id ? { ...c, status: status as ChallengeWithStats["status"] } : c,
      ),
    })),
  patchChallengeStats: (id, stats) =>
    set((s) => ({
      challenges: s.challenges.map((c) =>
        c.id === id ? { ...c, stats } : c,
      ),
    })),

  notes: [],
  setNotes: (n) => set({ notes: n }),
  upsertNote: (n) =>
    set((s) => {
      const idx = s.notes.findIndex((x) => x.id === n.id)
      const next = [...s.notes]
      if (idx >= 0) next[idx] = n
      else next.unshift(n)
      return { notes: next }
    }),
  removeNote: (id) =>
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

  selectedChallengeId: null,
  openChallenge: (id) => set({ selectedChallengeId: id }),
  closeChallenge: () => set({ selectedChallengeId: null }),

  filter: "all",
  setFilter: (f) => set({ filter: f }),

  createOpen: false,
  setCreateOpen: (v) => set({ createOpen: v }),

  noteComposerOpen: false,
  noteComposerChallengeId: null,
  openNoteComposer: (challengeId) =>
    set({
      noteComposerOpen: true,
      noteComposerChallengeId: challengeId ?? null,
      editingNote: null,
    }),
  closeNoteComposer: () =>
    set({
      noteComposerOpen: false,
      noteComposerChallengeId: null,
      editingNote: null,
    }),

  editingNote: null,
  setEditingNote: (n) => set({ editingNote: n }),

  loading: false,
  setLoading: (v) => set({ loading: v }),
}))

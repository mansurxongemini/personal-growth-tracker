"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Sparkles,
  Send,
  Trash2,
  Settings2,
  X,
  AlertTriangle,
  Loader2,
  Bot,
  User,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore, type AiMessage } from "@/lib/store"
import { AI_SUGGESTIONS } from "@/lib/ai-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"

const ICON_MAP: Record<string, typeof Sparkles> = {
  TrendingUp: Sparkles,
  AlertCircle: AlertTriangle,
  Flame: Sparkles,
  CheckSquare: Sparkles,
  BarChart3: Sparkles,
  Lightbulb: Sparkles,
}

export function AiAssistantPanel() {
  const open = useAppStore((s) => s.aiPanelOpen)
  const setOpen = useAppStore((s) => s.setAiPanelOpen)
  const messages = useAppStore((s) => s.aiMessages)
  const setMessages = useAppStore((s) => s.setAiMessages)
  const appendMessage = useAppStore((s) => s.appendAiMessage)
  const updateLast = useAppStore((s) => s.updateLastAiMessage)
  const clearMessages = useAppStore((s) => s.clearAiMessages)
  const thinking = useAppStore((s) => s.aiThinking)
  const setThinking = useAppStore((s) => s.setAiThinking)
  const setSettingsOpen = useAppStore((s) => s.setAiSettingsOpen)
  const settings = useAppStore((s) => s.aiSettings)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [input, setInput] = React.useState("")

  // Load history on first open
  const loadedRef = React.useRef(false)
  React.useEffect(() => {
    if (open && !loadedRef.current) {
      loadedRef.current = true
      fetch("/api/ai")
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d.messages)) {
            setMessages(
              d.messages.map((m: AiMessage) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                createdAt: m.createdAt,
              })),
            )
          }
        })
        .catch(() => {})
    }
  }, [open, setMessages])

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, thinking])

  async function send(messageText: string) {
    const text = messageText.trim()
    if (!text || thinking) return
    if (settings && !settings.enabled) {
      toast.error("AI yordamchi o'chirilgan", {
        description: "Sozlamalardan yoqing.",
        action: { label: "Sozlamalar", onClick: () => setSettingsOpen(true) },
      })
      return
    }

    setInput("")
    appendMessage({ role: "user", content: text })
    appendMessage({ role: "assistant", content: "", pending: true })
    setThinking(true)

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "So'rov bajarilmadi")
      }
      updateLast({
        content: data.reply,
        pending: false,
      })
    } catch (e) {
      updateLast({
        content:
          e instanceof Error ? e.message : "Noma'lum xato yuz berdi.",
        pending: false,
        error: true,
      })
      toast.error("AI javob bera olmadi")
    } finally {
      setThinking(false)
    }
  }

  async function handleClear() {
    try {
      await fetch("/api/ai", { method: "DELETE" })
      clearMessages()
      toast.success("Tarix tozalandi")
    } catch {
      toast.error("Tozalash amalga oshmadi")
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-zinc-200 bg-zinc-50 p-0 dark:border-zinc-800 dark:bg-zinc-950 sm:max-w-[440px] [&>button[data-slot=dialog-close]]:hidden [&>button]:hidden"
      >
        {/* Header — minimalist */}
        <SheetHeader className="flex flex-row items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
              <Sparkles className="size-4" />
            </div>
            <div>
              <SheetTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                AI Yordamchi
              </SheetTitle>
              <SheetDescription className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {settings?.enabled === false
                  ? "O'chirilgan"
                  : thinking
                    ? "O'ylayapti..."
                    : "Kontekstli shaxsiy yordamchi"}
              </SheetDescription>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              onClick={() => setSettingsOpen(true)}
              title="AI sozlamalari"
            >
              <Settings2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              onClick={handleClear}
              disabled={messages.length === 0}
              title="Tarixni tozalash"
            >
              <Trash2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              onClick={() => setOpen(false)}
              title="Yopish"
            >
              <X className="size-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Messages */}
        <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col gap-4 px-4 py-4">
            {messages.length === 0 ? (
              <EmptyState onPick={(p) => send(p)} />
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <MessageBubble key={i} message={m} />
                ))}
              </AnimatePresence>
            )}
            {thinking && (
              <div className="flex items-center gap-2 px-1 text-xs text-zinc-400">
                <Loader2 className="size-3 animate-spin" />
                <span>Kontekst yig'ilmoqda...</span>
              </div>
            )}
          </div>
        </div>

        {/* Suggestions when there are messages */}
        {messages.length > 0 && !thinking && (
          <div className="flex gap-1.5 overflow-x-auto border-t border-zinc-200 px-4 py-2 dark:border-zinc-800">
            {AI_SUGGESTIONS.slice(0, 4).map((s) => (
              <button
                key={s.label}
                onClick={() => send(s.prompt)}
                className="shrink-0 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Input — frameless, per guide */}
        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-end gap-2"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  send(input)
                }
              }}
              placeholder="AI ga savol yozing..."
              rows={1}
              className="max-h-32 min-h-[40px] resize-none rounded-xl border-0 bg-zinc-100 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              disabled={thinking}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || thinking}
              className="size-10 shrink-0 rounded-xl bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Send className="size-4" />
            </Button>
          </form>
          <p className="mt-1.5 px-1 text-[10px] text-zinc-400">
            AI sizning barcha challenge ma'lumotlaringiz asosida javob beradi.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-2 py-8 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-4 grid size-14 place-items-center rounded-2xl bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        <Bot className="size-7" />
      </motion.div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Salom! Men sizning AI yordamchingizman
      </h3>
      <p className="mt-1.5 max-w-[300px] text-sm text-zinc-500 dark:text-zinc-400">
        Sizning challenge'lar, kunlik check-in'lar va qaydlaringizni o'qib,
        shaxsiy tahlil va motivatsiya beraman.
      </p>
      <div className="mt-5 grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2">
        {AI_SUGGESTIONS.map((s) => {
          const Icon = ICON_MAP[s.icon] ?? Sparkles
          return (
            <button
              key={s.label}
              onClick={() => onPick(s.prompt)}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left text-xs font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60"
            >
              <Icon className="size-3.5 shrink-0 text-zinc-400" />
              {s.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: AiMessage }) {
  const isUser = message.role === "user"
  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="flex max-w-[85%] items-start gap-2">
          <div className="rounded-2xl rounded-tr-sm bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <div className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <User className="size-3.5" />
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="flex max-w-[85%] items-start gap-2">
        <div
          className={cn(
            "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full",
            message.error
              ? "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
              : "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900",
          )}
        >
          {message.error ? (
            <AlertTriangle className="size-3.5" />
          ) : (
            <Bot className="size-3.5" />
          )}
        </div>
        <div
          className={cn(
            "rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm",
            message.error
              ? "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300"
              : "border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
          )}
        >
          {message.pending && !message.content ? (
            <div className="flex items-center gap-1.5 py-0.5">
              <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-zinc-400" />
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px] dark:[&_code]:bg-zinc-800 [&_strong]:font-semibold [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

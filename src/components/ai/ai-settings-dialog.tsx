"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Loader2, Settings2, Info, Check, KeyRound } from "lucide-react"
import { useAppStore, type AiSettings } from "@/lib/store"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ProviderOption {
  key: string
  label: string
  models: string[]
  description: string
  needsKey: boolean
}

export function AiSettingsDialog() {
  const open = useAppStore((s) => s.aiSettingsOpen)
  const setOpen = useAppStore((s) => s.setAiSettingsOpen)
  const settings = useAppStore((s) => s.aiSettings)
  const setSettings = useAppStore((s) => s.setAiSettings)
  const providers = useAppStore((s) => s.aiProviders)

  const [form, setForm] = React.useState<AiSettings | null>(null)
  const [apiKeyInput, setApiKeyInput] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  // Load settings on open
  React.useEffect(() => {
    if (open) {
      fetch("/api/ai/settings")
        .then((r) => r.json())
        .then((d) => {
          if (d.settings) {
            setSettings(d.settings)
            setForm(d.settings)
            setApiKeyInput("")
          }
          if (d.providers) {
            useAppStore.getState().setAiProviders(d.providers)
          }
        })
        .catch(() => toast.error("Sozlamalarni yuklab bo'lmadi"))
    }
  }, [open, setSettings])

  if (!form) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const currentProvider: ProviderOption =
    providers.find((p) => p.key === form.provider) ?? providers[0]

  async function save() {
    if (!form) return
    setSaving(true)
    try {
      const res = await fetch("/api/ai/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: form.provider,
          model: form.model,
          temperature: form.temperature,
          enabled: form.enabled,
          systemPrompt: form.systemPrompt,
          apiKey: apiKeyInput || undefined,
        }),
      })
      if (!res.ok) throw new Error("Saqlash amalga oshmadi")
      const { settings: updated } = await res.json()
      setSettings(updated)
      setForm(updated)
      setApiKeyInput("")
      toast.success("AI sozlamalari saqlandi")
    } catch {
      toast.error("Saqlash amalga oshmadi")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92vh] overflow-y-auto scrollbar-thin gap-0 border-zinc-200 bg-zinc-50 p-0 dark:border-zinc-800 dark:bg-zinc-950 sm:max-w-lg">
        <DialogHeader className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
          <DialogTitle className="flex items-center gap-2 text-lg text-zinc-900 dark:text-zinc-50">
            <span className="grid size-7 place-items-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
              <Settings2 className="size-4" />
            </span>
            AI Sozlamalari
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400">
            Kontekstli AI yordamchini sozlang. Provider, model va xatti-harakat
            parametrlarini boshqaring.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-6">
          {/* Enable toggle */}
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                AI yordamchi
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Yoqilgan bo'lsa, chat paneli ishlaydi
              </p>
            </div>
            <Switch
              checked={form.enabled}
              onCheckedChange={(v) => setForm({ ...form, enabled: v })}
            />
          </div>

          {/* Provider */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Provayder
            </Label>
            <Select
              value={form.provider}
              onValueChange={(v) => {
                const p = providers.find((x) => x.key === v)
                setForm({
                  ...form,
                  provider: v,
                  model: p?.models[0] ?? form.model,
                })
              }}
            >
              <SelectTrigger className="h-11 border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {providers.map((p) => (
                  <SelectItem key={p.key} value={p.key}>
                    {p.label}
                    {p.needsKey && (
                      <span className="ml-1 text-[10px] text-zinc-400">
                        (kalit kerak)
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentProvider && (
              <p className="flex items-start gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <Info className="mt-0.5 size-3 shrink-0" />
                {currentProvider.description}
              </p>
            )}
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Model
            </Label>
            <Select
              value={form.model}
              onValueChange={(v) => setForm({ ...form, model: v })}
            >
              <SelectTrigger className="h-11 border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(currentProvider?.models ?? []).map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* API Key (only for external providers) */}
          {currentProvider?.needsKey && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <KeyRound className="size-3" />
                API kalit
              </Label>
              <Input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={
                  form.hasApiKey ? "•••••••• (saqlangan)" : "sk-..."
                }
                className="h-11 border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {form.hasApiKey
                  ? "Kalit saqlangan. Bo'sh qoldirsangiz o'chiriladi."
                  : "Tashqi provayder uchun API kalit kerak."}
              </p>
            </div>
          )}

          {/* Temperature */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Ijodkorlik (temperature)
              </Label>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="tabular-nums text-xs font-medium text-zinc-900 dark:text-zinc-50">
                      {form.temperature.toFixed(2)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Past = aniq/fokuslangan, Yuqori = ijodiy/xilma-xil
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Slider
              value={[form.temperature]}
              min={0}
              max={2}
              step={0.05}
              onValueChange={(v) =>
                setForm({ ...form, temperature: v[0] ?? 0.7 })
              }
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>Aniq</span>
              <span>Balanslangan</span>
              <span>Ijodiy</span>
            </div>
          </div>

          {/* System prompt override */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Qo'shimcha yo'riqnoma
              <span className="text-[10px] font-normal text-zinc-400">
                (ixtiyoriy)
              </span>
            </Label>
            <Textarea
              value={form.systemPrompt}
              onChange={(e) =>
                setForm({ ...form, systemPrompt: e.target.value })
              }
              placeholder="Masalan: 'Javoblaringni qisqa va harakatga undovchi qiling. Foydalanuvchini ismi bilan murojaat qil.'"
              className="min-h-[80px] resize-none border-zinc-200 bg-white text-sm dark:border-zinc-800 dark:bg-zinc-900"
              maxLength={4000}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Bu matn asosiy system promptga qo'shib yuboriladi. Bo'sh
              qoldirsangiz, standart shaxsiy rivojlanish yordamchisi ishlaydi.
            </p>
          </div>

          {/* Context info */}
          <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <Info className="size-3.5 text-zinc-400" />
              Kontekst injektsiyasi haqida
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Har bir so'rovda sizning barcha challenge'lar, kunlik check-in'lar
              va qaydlar AI ga kontekst sifatida yuboriladi. AI faqat sizning
              ma'lumotlaringizga tayanadi.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-zinc-200 bg-zinc-50/80 px-6 py-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Bekor qilish
          </Button>
          <Button
            onClick={save}
            disabled={saving}
            className="gap-1.5 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Saqlash
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

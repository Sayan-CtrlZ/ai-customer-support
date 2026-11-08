import { AlertTriangle, CheckCircle2, Clock, MinusCircle, XCircle } from "lucide-react"

export function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase().trim()

  if (s === "processed" || s === "answered") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20 whitespace-nowrap shrink-0">
        <CheckCircle2 className="size-3 shrink-0" />
        {status}
      </span>
    )
  }

  if (s === "skipped") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400 ring-1 ring-inset ring-slate-500/20 whitespace-nowrap shrink-0">
        <MinusCircle className="size-3 shrink-0" />
        {status}
      </span>
    )
  }

  if (s === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-500/20 whitespace-nowrap shrink-0">
        <XCircle className="size-3 shrink-0" />
        {status}
      </span>
    )
  }

  if (s === "escalated") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/20 whitespace-nowrap shrink-0">
        <AlertTriangle className="size-3 shrink-0" />
        {status}
      </span>
    )
  }

  if (s === "processing" || s === "open") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-600 dark:text-sky-400 ring-1 ring-inset ring-sky-500/20 whitespace-nowrap shrink-0">
        <Clock className="size-3 shrink-0 animate-spin" />
        {status}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border whitespace-nowrap shrink-0">
      {status}
    </span>
  )
}

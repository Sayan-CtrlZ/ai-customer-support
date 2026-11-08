import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Inbox,
  Loader2,
  MinusCircle,
  RotateCw,
  Search,
  XCircle,
} from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/lib/api"
import { formatDate, formatTicketNumber, type SupportEvent } from "@/lib/types"

export function EventsPage() {
  const [events, setEvents] = useState<SupportEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const load = () => {
    setLoading(true)
    return api<SupportEvent[]>("/events")
      .then((data) => {
        setEvents(Array.isArray(data) ? data : [])
        setError(null)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    load()
  }, [])

  async function checkInbox() {
    setChecking(true)
    setError(null)
    setNotice("Polling Gmail and processing unread messages...")
    try {
      const result = await api<{ messages?: number }>("/poll", { method: "POST" })
      const count = result?.messages ?? 0
      setNotice(
        count > 0
          ? `Checked inbox: processed ${count} new email${count === 1 ? "" : "s"}.`
          : "Checked inbox: no new unprocessed emails found."
      )
      await load()
    } catch (err) {
      setNotice(null)
      setError(err instanceof Error ? err.message : "Failed to poll Gmail inbox")
    } finally {
      setChecking(false)
    }
  }

  // Summary statistics
  const stats = useMemo(() => {
    const total = events.length
    const processed = events.filter((e) => e.status === "processed").length
    const skipped = events.filter((e) => e.status === "skipped").length
    const failed = events.filter((e) => e.status === "failed").length
    return { total, processed, skipped, failed }
  }, [events])

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Status filter
      if (statusFilter !== "all" && event.status !== statusFilter) {
        return false
      }

      // Search query filter
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()

      const matchId = String(event.id).includes(q)
      const matchStatus = event.status.toLowerCase().includes(q)
      const matchError = event.error ? event.error.toLowerCase().includes(q) : false
      const matchResult = event.result
        ? JSON.stringify(event.result).toLowerCase().includes(q)
        : false
      const ticketNum = (event.ticket_number || (event.ticket_id ? formatTicketNumber(event.ticket_id) : "")).toLowerCase()
      const matchTicket = ticketNum.includes(q)
      const matchSubject = event.ticket_subject ? event.ticket_subject.toLowerCase().includes(q) : false

      return matchId || matchStatus || matchError || matchResult || matchTicket || matchSubject
    })
  }, [events, statusFilter, searchQuery])

  function getDetailPreview(event: SupportEvent): string {
    if (event.error) {
      return event.error
    }
    if (event.result) {
      if (event.result.reason) {
        return event.result.reason
      }
      if (event.result.action) {
        const action = event.result.action
        const section = event.result.section ? ` (${event.result.section})` : ""
        return `Action: ${action}${section}`
      }
      return JSON.stringify(event.result)
    }
    return "-"
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Metric Stat Cards spanning full width */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 w-full">
        <Card className="p-4 sm:p-5 border-border/60 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Events</span>
            <Activity className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">{stats.total}</div>
        </Card>

        <Card className="p-4 sm:p-5 border-border/60 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Processed</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {stats.processed}
          </div>
        </Card>

        <Card className="p-4 sm:p-5 border-border/60 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Skipped</span>
            <MinusCircle className="size-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-600 dark:text-slate-400">
            {stats.skipped}
          </div>
        </Card>

        <Card className="p-4 sm:p-5 border-border/60 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Failed</span>
            <XCircle className="size-4 text-red-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">
            {stats.failed}
          </div>
        </Card>
      </div>

      {/* Action and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={checkInbox}
            disabled={checking}
            size="sm"
            className="gap-2 text-xs font-medium shadow-sm"
          >
            {checking ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Checking inbox...
              </>
            ) : (
              <>
                <Inbox className="size-3.5" />
                Check inbox now
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => load()}
            disabled={loading}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Refresh events from server"
          >
            <RotateCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter buttons */}
          <div className="inline-flex items-center rounded-lg border border-border p-0.5 bg-muted/40 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("processed")}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                statusFilter === "processed"
                  ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Processed
            </button>
            <button
              onClick={() => setStatusFilter("skipped")}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                statusFilter === "skipped"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Skipped
            </button>
            <button
              onClick={() => setStatusFilter("failed")}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                statusFilter === "failed"
                  ? "bg-background text-destructive shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Failed
            </button>
          </div>

          {/* Search box with wider responsive span */}
          <div className="relative w-full sm:w-72 lg:w-96">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by ID, status, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs w-full"
            />
          </div>
        </div>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in-50">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {notice && !error && (
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 p-3 text-xs text-foreground animate-in fade-in-50">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          <div className="flex-1">{notice}</div>
        </div>
      )}

      {/* Events Table Container Card spanning full width */}
      <Card className="border-border/60 shadow-sm overflow-hidden w-full">
        <CardHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Event Pipeline Log</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Showing {filteredEvents.length} of {events.length} recorded events
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16 px-6 font-semibold text-xs">ID</TableHead>
                <TableHead className="w-32 font-semibold text-xs">Ticket #</TableHead>
                <TableHead className="w-32 font-semibold text-xs">Status</TableHead>
                <TableHead className="font-semibold text-xs">Action / Details</TableHead>
                <TableHead className="w-20 text-center font-semibold text-xs">Attempts</TableHead>
                <TableHead className="w-44 text-right px-6 font-semibold text-xs">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                    <Loader2 className="size-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading event history...
                  </TableCell>
                </TableRow>
              ) : filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                    {searchQuery || statusFilter !== "all"
                      ? "No events match your search or filter."
                      : "No events recorded yet. Click 'Check inbox now' to poll your inbox."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => {
                  const detail = getDetailPreview(event)
                  const isSkipped = event.status === "skipped"
                  const isFailed = event.status === "failed"
                  const ticketNumber = event.ticket_number || (event.ticket_id ? formatTicketNumber(event.ticket_id) : null)

                  return (
                    <TableRow key={event.id} className="transition-colors hover:bg-muted/40 text-xs">
                      <TableCell className="px-6 font-mono font-medium text-muted-foreground">
                        #{event.id}
                      </TableCell>
                      <TableCell>
                        {ticketNumber ? (
                          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary ring-1 ring-primary/20">
                            {ticketNumber}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50 font-mono">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={event.status} />
                      </TableCell>
                      <TableCell>
                        <span
                          className={`line-clamp-2 max-w-2xl xl:max-w-4xl ${
                            isFailed
                              ? "text-destructive font-medium"
                              : isSkipped
                                ? "text-muted-foreground"
                                : "text-foreground"
                          }`}
                          title={detail}
                        >
                          {detail}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-mono text-muted-foreground">
                        {event.attempts}
                      </TableCell>
                      <TableCell className="text-right px-6 text-muted-foreground font-mono whitespace-nowrap">
                        {formatDate(event.created_at)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

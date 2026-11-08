import { useEffect, useState } from "react"
import { AlertCircle, ArrowDownLeft, ArrowUpRight, Mail, MessageSquare, Ticket as TicketIcon } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/api"
import { formatDate, formatTicketNumber, type Message, type Ticket } from "@/lib/types"

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<Ticket[]>("/tickets")
      .then((data) => {
        setTickets(Array.isArray(data) ? data : [])
        setError(null)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err))
      })
  }, [])

  async function open(ticket: Ticket) {
    setSelected(ticket)
    setLoadingMessages(true)
    try {
      const data = await api<Message[]>(`/tickets/${ticket.id}/messages`)
      setMessages(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages")
    } finally {
      setLoadingMessages(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in-50">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12 items-start w-full">
        {/* Left Column: Tickets Table Card */}
        <Card className="lg:col-span-8 border-border/60 shadow-sm overflow-hidden w-full">
          <CardHeader className="px-6 py-4 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TicketIcon className="size-4 text-primary" />
                  Support Tickets
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {tickets.length} total customer conversation threads
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="table-fixed w-full" containerClassName="overflow-hidden">
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[15%] font-semibold text-xs px-4 sm:px-6">Ticket #</TableHead>
                  <TableHead className="w-[35%] font-semibold text-xs px-2">Subject</TableHead>
                  <TableHead className="w-[24%] font-semibold text-xs px-2">Customer</TableHead>
                  <TableHead className="w-[10%] font-semibold text-xs px-2">Category</TableHead>
                  <TableHead className="w-[16%] font-semibold text-xs text-right pr-4 sm:pr-6 pl-1">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-xs text-muted-foreground">
                      No customer tickets recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => {
                    const isSelected = ticket.id === selected?.id
                    const ticketNum = ticket.ticket_number || formatTicketNumber(ticket.id)
                    return (
                      <TableRow
                        key={ticket.id}
                        onClick={() => open(ticket)}
                        className={`cursor-pointer transition-colors text-xs ${
                          isSelected
                            ? "bg-muted/80 font-medium"
                            : "hover:bg-muted/40"
                        }`}
                      >
                        <TableCell className="px-4 sm:px-6 font-mono font-medium text-primary">
                          <span className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold ring-1 ring-primary/20">
                            {ticketNum}
                          </span>
                        </TableCell>
                        <TableCell
                          className="px-2 font-medium truncate"
                          title={ticket.subject || "(no subject)"}
                        >
                          {ticket.subject || "(no subject)"}
                        </TableCell>
                        <TableCell
                          className="px-2 text-muted-foreground truncate"
                          title={ticket.customer_email}
                        >
                          {ticket.customer_email}
                        </TableCell>
                        <TableCell className="px-2 text-muted-foreground truncate">
                          {ticket.category ? (
                            <span
                              className="inline-flex rounded bg-muted px-2 py-0.5 text-[11px] font-mono truncate max-w-full"
                              title={ticket.category}
                            >
                              {ticket.category}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-4 sm:pr-6 pl-1">
                          <StatusBadge status={ticket.status} />
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right Column: Selected Thread Message Viewer Card */}
        <Card className="lg:col-span-4 border-border/60 shadow-sm flex flex-col min-h-[500px] w-full">
          <CardHeader className="px-6 py-4 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" />
                Conversation Thread
              </CardTitle>
              {selected && (
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary ring-1 ring-primary/20">
                  {selected.ticket_number || formatTicketNumber(selected.id)}
                </span>
              )}
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              {selected
                ? `Viewing ticket ${selected.ticket_number || formatTicketNumber(selected.id)}`
                : "Select a ticket from the left to inspect"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            {selected ? (
              <div className="flex flex-col gap-4">
                <div className="pb-3 border-b border-border/40">
                  <h3 className="font-semibold text-sm leading-snug">
                    {selected.subject || "(no subject)"}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{selected.customer_email}</span>
                    <span>•</span>
                    <StatusBadge status={selected.status} />
                  </div>
                  {selected.proposed_action && (
                    <div className="mt-3 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                      <span className="font-semibold">Next step: </span>
                      {selected.proposed_action}
                    </div>
                  )}
                </div>

                {loadingMessages ? (
                  <div className="py-16 text-center text-xs text-muted-foreground">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center text-xs text-muted-foreground">
                    No messages stored for this thread.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[560px] overflow-y-auto pr-1">
                    {messages.map((message) => {
                      const isOut = message.direction === "out"
                      return (
                        <div
                          key={message.id}
                          className={`rounded-lg p-3.5 text-xs leading-relaxed ${
                            isOut
                              ? "ml-8 bg-primary text-primary-foreground border border-primary/20 shadow-xs"
                              : "mr-8 bg-muted/60 border border-border/50 text-foreground"
                          }`}
                        >
                          <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] opacity-75">
                            <span className="flex items-center gap-1 font-medium">
                              {isOut ? (
                                <>
                                  <ArrowUpRight className="size-3" />
                                  Neem &amp; Teak support
                                </>
                              ) : (
                                <>
                                  <ArrowDownLeft className="size-3" />
                                  {message.from_address}
                                </>
                              )}
                            </span>
                            <span className="font-mono">{formatDate(message.created_at)}</span>
                          </div>
                          <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{message.body}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-28 text-center text-muted-foreground">
                <Mail className="size-8 stroke-[1.5] mb-2 opacity-40" />
                <p className="text-xs">Select any ticket from the list to view the full email conversation.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

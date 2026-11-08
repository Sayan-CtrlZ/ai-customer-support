export type SupportEvent = {
  id: number
  gmail_message_id: string
  status: string
  attempts: number
  error: string | null
  result: Record<string, any> | null
  ticket_id?: number | null
  ticket_number?: string | null
  ticket_subject?: string | null
  created_at: string
  processed_at?: string | null
}

export type Ticket = {
  id: number
  ticket_number?: string | null
  gmail_thread_id?: string
  subject: string
  customer_email: string
  category: string | null
  status: string
  proposed_action: string | null
  created_at?: string
  updated_at: string
}

export function formatTicketNumber(ticketId: number | string | null | undefined): string {
  if (ticketId == null) return ""
  const num = typeof ticketId === "number" ? ticketId : parseInt(ticketId, 10)
  if (isNaN(num)) return String(ticketId)
  return `NT-${10000 + num}`
}

export type Message = {
  id: number
  ticket_id?: number
  direction: "in" | "out"
  from_address: string
  body: string
  created_at: string
}

export type Entry = {
  id: number
  section: string
  title: string
  content: string
  updated_at?: string
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "-"
  try {
    const d = new Date(value)
    if (isNaN(d.getTime())) return "-"
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return String(value)
  }
}

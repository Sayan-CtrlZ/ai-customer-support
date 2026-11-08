import { useEffect, useState } from "react"
import { Activity, BookOpen, LogOut, ShieldCheck, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { isLoggedIn, logout } from "@/lib/api"
import { EventsPage } from "@/pages/events"
import { KnowledgeBasePage } from "@/pages/knowledge-base"
import { LoginPage } from "@/pages/login"
import { TicketsPage } from "@/pages/tickets"

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn())

  useEffect(() => {
    function handleUnauthorized() {
      setLoggedIn(false)
    }
    window.addEventListener("auth-unauthorized", handleUnauthorized)
    return () => window.removeEventListener("auth-unauthorized", handleUnauthorized)
  }, [])

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />
  }

  function logOut() {
    logout()
    setLoggedIn(false)
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 min-h-svh flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight">
                Neem &amp; Teak support
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Simple help for everyday home and kitchen needs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={logOut} className="gap-1.5 text-xs">
            <LogOut data-icon="inline-start" />
            <span>Log out</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full">
        <Tabs defaultValue="events" className="w-full">
          <div className="mb-6 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="events">
                <Activity data-icon="inline-start" />
                <span>Events</span>
              </TabsTrigger>
              <TabsTrigger value="tickets">
                <Ticket data-icon="inline-start" />
                <span>Tickets</span>
              </TabsTrigger>
              <TabsTrigger value="knowledge-base">
                <BookOpen data-icon="inline-start" />
                <span>Knowledge base</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="events" className="outline-none w-full">
            <EventsPage />
          </TabsContent>
          <TabsContent value="tickets" className="outline-none w-full">
            <TicketsPage />
          </TabsContent>
          <TabsContent value="knowledge-base" className="outline-none w-full">
            <KnowledgeBasePage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

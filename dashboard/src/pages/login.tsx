import { useEffect, useState } from "react"
import { AlertCircle, Eye, EyeOff, Loader2, Lock, ShieldCheck, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { api, logout, saveLogin } from "@/lib/api"

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ensure fields start clean and browser autofill is cleared
  useEffect(() => {
    setUsername("")
    setPassword("")
  }, [])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const trimmedUser = username.trim()
    saveLogin(trimmedUser, password)

    try {
      await api("/login")
      onLogin()
    } catch {
      logout()
      setError("Invalid username or password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      >
        <div className="h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-50 dark:opacity-20" />
      </div>

      {/* Top bar controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <Card className="border-border/60 shadow-xl backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <ShieldCheck className="size-6" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight">
              Neem &amp; Teak support
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Simple help for everyday home and kitchen needs
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={submit} autoComplete="off" className="flex flex-col gap-4">
              {/* Invisible decoy inputs to divert browser password managers */}
              <input
                type="text"
                name="decoy_user"
                aria-hidden="true"
                tabIndex={-1}
                autoComplete="off"
                className="sr-only pointer-events-none absolute -left-[9999px]"
              />
              <input
                type="password"
                name="decoy_pass"
                aria-hidden="true"
                tabIndex={-1}
                autoComplete="new-password"
                className="sr-only pointer-events-none absolute -left-[9999px]"
              />

              {error && (
                <div className="flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in-50">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{error}</div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="admin-username" className="text-xs font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="admin-username"
                    name="admin_username"
                    type="text"
                    autoComplete="off"
                    required
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-password" className="text-xs font-medium">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="admin-password"
                    name="admin_password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-8 pr-9 h-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-9 mt-1 font-medium">
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign in to dashboard"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

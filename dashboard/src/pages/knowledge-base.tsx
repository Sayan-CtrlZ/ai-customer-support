import { useEffect, useState } from "react"
import { AlertCircle, BookOpen, Check, FileEdit, FileText, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import type { Entry } from "@/lib/types"

export function KnowledgeBasePage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<Entry[]>("/knowledge-base")
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setEntries(list)
        setError(null)
        if (list.length > 0 && selectedId === null) {
          select(list[0])
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err))
      })
  }, [])

  const sections = [...new Set(entries.map((entry) => entry.section))]
  const selectedEntry = entries.find((e) => e.id === selectedId)

  function select(entry: Entry) {
    setSelectedId(entry.id)
    setTitle(entry.title)
    setContent(entry.content)
    setSaved(false)
    setError(null)
  }

  async function save() {
    if (selectedId === null) return
    setSaving(true)
    setError(null)
    try {
      const updated = await api<Entry>(`/knowledge-base/${selectedId}`, {
        method: "PUT",
        body: JSON.stringify({ title, content }),
      })
      setEntries(entries.map((entry) => (entry.id === updated.id ? updated : entry)))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry")
    } finally {
      setSaving(false)
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
        {/* Left: Article Navigator Card */}
        <Card className="lg:col-span-4 xl:col-span-3 border-border/60 shadow-sm overflow-hidden w-full">
          <CardHeader className="px-5 py-4 border-b border-border/40">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              Articles &amp; Topics
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              {entries.length} knowledge base entries in {sections.length} sections
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 max-h-[680px] overflow-y-auto">
            {sections.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No knowledge base entries found.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {sections.map((section) => (
                  <div key={section} className="flex flex-col gap-1">
                    <span className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {section}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      {entries
                        .filter((entry) => entry.section === section)
                        .map((entry) => {
                          const isSelected = entry.id === selectedId
                          return (
                            <button
                              key={entry.id}
                              onClick={() => select(entry)}
                              className={`flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                                isSelected
                                  ? "bg-primary text-primary-foreground font-medium shadow-xs"
                                  : "text-foreground hover:bg-muted"
                              }`}
                            >
                              <FileText className="size-3.5 shrink-0 opacity-70" />
                              <span className="truncate">{entry.title}</span>
                            </button>
                          )
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Article Editor Card spanning 9 columns on XL */}
        <Card className="lg:col-span-8 xl:col-span-9 border-border/60 shadow-sm flex flex-col min-h-[520px] w-full">
          <CardHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileEdit className="size-4 text-primary" />
                Article Editor
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {selectedEntry ? (
                  <span>
                    Editing section:{" "}
                    <code className="font-mono text-foreground font-semibold">
                      {selectedEntry.section}
                    </code>
                  </span>
                ) : (
                  "Select an entry from the list"
                )}
              </CardDescription>
            </div>

            {selectedId !== null && (
              <Button
                onClick={save}
                disabled={saving}
                size="sm"
                className="gap-1.5 text-xs font-medium shadow-xs"
              >
                {saving ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <Check className="size-3.5 text-emerald-400" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    Save changes
                  </>
                )}
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col gap-4">
            {selectedId === null ? (
              <div className="flex flex-col items-center justify-center py-28 text-center text-muted-foreground">
                <BookOpen className="size-8 stroke-[1.5] mb-2 opacity-40" />
                <p className="text-xs">Select any knowledge base article on the left to edit its title and content.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 flex-1">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="entry-title" className="text-xs font-medium">
                    Article Title
                  </Label>
                  <Input
                    id="entry-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="font-medium text-xs h-9"
                    placeholder="Article title"
                  />
                </div>

                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="entry-content" className="text-xs font-medium">
                      Markdown Content (used by AI agent)
                    </Label>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {content.length} chars • {content.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <Textarea
                    id="entry-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[440px] font-mono text-xs leading-relaxed resize-y"
                    placeholder="Article content in plain markdown format..."
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Loader2, CheckCircle2, Calendar, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { CopyButton } from "@/components/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { summarizeMeeting } from "@/lib/ai.functions";

export const Route = createFileRoute("/summarizer")({
  head: () => ({ meta: [{ title: "Meeting Summarizer — WorkAI" }] }),
  component: SummarizerPage,
});

type Result = Awaited<ReturnType<typeof summarizeMeeting>>;

function SummarizerPage() {
  const fn = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function onRun() {
    if (notes.trim().length < 10) return;
    setLoading(true);
    try {
      const r = await fn({ data: { notes } });
      setResult(r);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  const exportText = result
    ? `SUMMARY\n${result.summary}\n\nACTION ITEMS\n${result.action_items.map((a) => `- ${a.task}${a.owner ? ` (@${a.owner})` : ""}`).join("\n")}\n\nDECISIONS\n${result.decisions.map((d) => `- ${d}`).join("\n")}\n\nDEADLINES\n${result.deadlines.map((d) => `- ${d.item}: ${d.date}`).join("\n")}`
    : "";

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader icon={FileText} title="Meeting Notes Summarizer" description="Paste raw notes and get a clean summary, action items, decisions, and deadlines." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Meeting notes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea rows={16} placeholder="Paste meeting notes, transcript, or bullet points..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button onClick={onRun} disabled={loading || notes.trim().length < 10} className="bg-gradient-brand text-primary-foreground border-0">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyzing…</> : "Summarize"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!result && !loading && (
            <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Summary, action items, decisions, and deadlines will appear here.</CardContent></Card>
          )}
          {loading && <Card><CardContent className="py-12 flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Working…</CardContent></Card>}
          {result && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" />Summary</CardTitle>
                  <CopyButton text={exportText} label="Copy all" />
                </CardHeader>
                <CardContent><p className="text-sm leading-relaxed">{result.summary}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />Action items</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {result.action_items.map((a, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gradient-brand" />
                        <span>{a.task}{a.owner && <span className="text-muted-foreground"> — @{a.owner}</span>}</span>
                      </li>
                    ))}
                    {result.action_items.length === 0 && <li className="text-muted-foreground">None identified.</li>}
                  </ul>
                </CardContent>
              </Card>
              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Decisions</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {result.decisions.map((d, i) => <li key={i}>• {d}</li>)}
                      {result.decisions.length === 0 && <li className="text-muted-foreground">None.</li>}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" />Deadlines</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {result.deadlines.map((d, i) => <li key={i}><span className="font-medium">{d.date}</span> — {d.item}</li>)}
                      {result.deadlines.length === 0 && <li className="text-muted-foreground">None.</li>}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

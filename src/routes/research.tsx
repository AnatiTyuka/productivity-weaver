import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2, BookOpen, Lightbulb, Target } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { CopyButton } from "@/components/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { researchTopic } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [{ title: "AI Research — WorkAI" }] }),
  component: ResearchPage,
});

type Result = Awaited<ReturnType<typeof researchTopic>>;

function ResearchPage() {
  const fn = useServerFn(researchTopic);
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function onRun() {
    if (topic.trim().length < 2) return;
    setLoading(true);
    try {
      setResult(await fn({ data: { topic } }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  const exportText = result
    ? `${topic}\n\nOVERVIEW\n${result.overview}\n\nINSIGHTS\n${result.key_insights.map((i) => `- ${i}`).join("\n")}\n\nRECOMMENDATIONS\n${result.recommendations.map((i) => `- ${i}`).join("\n")}`
    : "";

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader icon={Sparkles} title="AI Research Assistant" description="Get a clean briefing on any topic — overview, insights, and recommendations." />

      <Card className="mb-6">
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-3">
          <Input placeholder="e.g. Best practices for async standups in remote teams" value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onRun()} />
          <Button onClick={onRun} disabled={loading || topic.trim().length < 2} className="bg-gradient-brand text-primary-foreground border-0">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Researching…</> : "Research"}
          </Button>
        </CardContent>
      </Card>

      {!result && !loading && (
        <p className="text-center text-sm text-muted-foreground py-12">Results will appear in clean cards below.</p>
      )}

      {result && (
        <div className="grid gap-4 md:grid-cols-2 animate-fade-in">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" />Overview</CardTitle>
              <CopyButton text={exportText} label="Copy all" />
            </CardHeader>
            <CardContent><p className="text-sm leading-relaxed">{result.overview}</p></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" />Key insights</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {result.key_insights.map((i, idx) => (
                  <li key={idx} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gradient-brand shrink-0" />{i}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Recommendations</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {result.recommendations.map((i, idx) => (
                  <li key={idx} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gradient-brand shrink-0" />{i}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {result.further_reading.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base">Further reading</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {result.further_reading.map((f, i) => <li key={i}>• {f}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

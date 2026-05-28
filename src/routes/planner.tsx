import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarCheck2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { CopyButton } from "@/components/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { planTasks } from "@/lib/ai.functions";

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [{ title: "Task Planner — WorkAI" }] }),
  component: PlannerPage,
});

type Result = Awaited<ReturnType<typeof planTasks>>;

const priorityColor = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-primary/15 text-primary border-primary/30",
  low: "bg-muted text-muted-foreground border-border",
} as const;

function PlannerPage() {
  const fn = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState<"daily" | "weekly">("daily");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function onRun() {
    if (tasks.trim().length < 5) return;
    setLoading(true);
    try {
      setResult(await fn({ data: { tasks, horizon } }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  const exportText = result?.schedule.map((s) => `[${s.priority.toUpperCase()}] ${s.slot} — ${s.task}\n   ${s.rationale}`).join("\n\n") ?? "";

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader icon={CalendarCheck2} title="AI Task Planner" description="List your tasks and deadlines; get a prioritized schedule." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader><CardTitle>Your tasks</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={horizon} onValueChange={(v) => setHorizon(v as typeof horizon)}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
              </TabsList>
            </Tabs>
            <Textarea rows={14} placeholder="One task per line, with deadlines if known.&#10;e.g. Finish Q3 report — Fri&#10;Review PR #482&#10;Prep for Monday client call" value={tasks} onChange={(e) => setTasks(e.target.value)} />
            <Button onClick={onRun} disabled={loading || tasks.trim().length < 5} className="bg-gradient-brand text-primary-foreground border-0 w-full">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Planning…</> : "Generate schedule"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!result && !loading && (
            <Card><CardContent className="py-16 text-center text-sm text-muted-foreground">Your prioritized {horizon} schedule will appear here.</CardContent></Card>
          )}
          {loading && <Card><CardContent className="py-16 flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Building schedule…</CardContent></Card>}
          {result && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="capitalize">{horizon} schedule</CardTitle>
                  <CopyButton text={exportText} label="Copy" />
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {result.schedule.map((s, i) => (
                      <li key={i} className="rounded-lg border bg-card p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">{s.slot}</span>
                          <Badge variant="outline" className={priorityColor[s.priority]}>{s.priority}</Badge>
                        </div>
                        <p className="mt-1 text-sm">{s.task}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{s.rationale}</p>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
              {result.tips.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Tips</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {result.tips.map((t, i) => <li key={i}>• {t}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

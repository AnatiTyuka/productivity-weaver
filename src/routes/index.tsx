import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  CalendarCheck2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — WorkAI Suite" },
      { name: "description", content: "Your AI workplace productivity command center." },
    ],
  }),
  component: Dashboard,
});

const modules = [
  { to: "/email", icon: Mail, title: "Smart Email Generator", desc: "Draft polished workplace emails in any tone." },
  { to: "/summarizer", icon: FileText, title: "Meeting Notes Summarizer", desc: "Turn raw notes into action items, decisions, deadlines." },
  { to: "/planner", icon: CalendarCheck2, title: "AI Task Planner", desc: "Prioritize and schedule your day or week automatically." },
] as const;

function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <section className="mb-10 rounded-2xl bg-gradient-brand p-8 md:p-12 shadow-glow text-primary-foreground">
        <p className="text-xs uppercase tracking-widest opacity-80">Welcome back</p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold leading-tight max-w-2xl">
          Work smarter with your AI productivity suite.
        </h1>
        <p className="mt-3 max-w-xl opacity-90">
          Three purpose-built modules to draft, summarize, and plan — all in one
          modern workspace.
        </p>
      </section>

      <h2 className="text-lg font-semibold mb-4">Modules</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <Link key={m.to} to={m.to} className="group">
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-soft border-border/60">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-glow">
                  <m.icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-3 flex items-center justify-between">
                  <span>{m.title}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </CardTitle>
                <CardDescription>{m.desc}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

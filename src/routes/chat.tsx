import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { MessageSquare, Send, Loader2, Trash2, Bot, User } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "AI Chat — WorkAI" }] }),
  component: ChatPage,
});

const STORAGE_KEY = "workai_chat_messages";

function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UIMessage[]) : [];
  } catch {
    return [];
  }
}

function ChatPage() {
  const [initial] = useState<UIMessage[]>(() => loadMessages());
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, setMessages, stop } = useChat({
    id: "workai-chat",
    messages: initial,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (e) => toast.error(e.message),
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch { /* noop */ }
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { if (status === "ready") inputRef.current?.focus(); }, [status]);

  const isLoading = status === "submitted" || status === "streaming";

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage({ text });
  }

  function onClear() {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-start justify-between gap-4 mb-4">
        <PageHeader icon={MessageSquare} title="AI Chatbot" description="Your conversational workplace assistant." />
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
            <Trash2 className="h-4 w-4 mr-1" />Clear
          </Button>
        )}
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="h-14 w-14 rounded-2xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-glow mb-4">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">How can I help you today?</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Ask about workflows, draft messages, brainstorm ideas, or get quick answers.
              </p>
            </div>
          )}

          {messages.map((m) => {
            const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={cn("flex gap-3 animate-fade-in", isUser && "flex-row-reverse")}>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                  isUser ? "bg-gradient-brand text-primary-foreground" : "bg-muted text-foreground"
                )}>
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={cn("max-w-[80%]", isUser && "text-right")}>
                  {isUser ? (
                    <div className="inline-block rounded-2xl px-4 py-2.5 bg-primary text-primary-foreground text-sm whitespace-pre-wrap">
                      {text}
                    </div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground prose-p:my-2 prose-pre:bg-muted prose-pre:text-foreground">
                      <ReactMarkdown>{text || "…"}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {status === "submitted" && (
            <div className="flex gap-3 animate-fade-in">
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-muted">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />Thinking…
              </div>
            </div>
          )}
        </div>

        <CardContent className="border-t p-3">
          <form onSubmit={onSubmit} className="flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); }
              }}
              placeholder="Ask anything…"
              rows={1}
              className="resize-none min-h-[44px] max-h-40"
              disabled={isLoading}
            />
            {isLoading ? (
              <Button type="button" variant="outline" size="icon" onClick={() => stop()}>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            ) : (
              <Button type="submit" size="icon" disabled={!input.trim()} className="bg-gradient-brand text-primary-foreground border-0">
                <Send className="h-4 w-4" />
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

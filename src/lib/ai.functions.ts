import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai-gateway.server";

function handleError(e: unknown): never {
  const msg = e instanceof Error ? e.message : "AI request failed";
  throw new Error(msg);
}

// Email generator
const EmailInput = z.object({
  topic: z.string().min(1).max(2000),
  tone: z.enum(["formal", "friendly", "persuasive"]),
  recipient: z.string().max(200).optional(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const { text } = await generateText({
        model: getModel(),
        system: `You write workplace emails. Tone: ${data.tone}. Output ONLY the email (subject line on first line as "Subject: ...", then body). No preamble.`,
        prompt: `Recipient: ${data.recipient || "colleague"}\n\nWrite an email about:\n${data.topic}`,
      });
      return { email: text };
    } catch (e) {
      handleError(e);
    }
  });

// Meeting summarizer
const SummaryInput = z.object({ notes: z.string().min(10).max(20000) });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SummaryInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const { output } = await generateText({
        model: getModel(),
        output: Output.object({
          schema: z.object({
            summary: z.string(),
            action_items: z.array(z.object({ task: z.string(), owner: z.string().optional() })),
            decisions: z.array(z.string()),
            deadlines: z.array(z.object({ item: z.string(), date: z.string() })),
          }),
        }),
        prompt: `Analyze these meeting notes and extract a concise summary, action items, decisions, and deadlines:\n\n${data.notes}`,
      });
      return output;
    } catch (e) {
      handleError(e);
    }
  });

// Task planner
const PlannerInput = z.object({
  tasks: z.string().min(5).max(5000),
  horizon: z.enum(["daily", "weekly"]),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlannerInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const { output } = await generateText({
        model: getModel(),
        output: Output.object({
          schema: z.object({
            schedule: z.array(
              z.object({
                slot: z.string().describe("Time block or day label"),
                task: z.string(),
                priority: z.enum(["high", "medium", "low"]),
                rationale: z.string(),
              }),
            ),
            tips: z.array(z.string()),
          }),
        }),
        prompt: `Create a prioritized ${data.horizon} schedule from these tasks and deadlines. Order by urgency/importance.\n\nTasks:\n${data.tasks}`,
      });
      return output;
    } catch (e) {
      handleError(e);
    }
  });


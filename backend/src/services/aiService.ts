import Anthropic from "@anthropic-ai/sdk";
import { IParticipant } from "../models/Meeting";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface MomResult {
  title: string;
  summary: string;
  decisions: string[];
  actionItems: Array<{
    task: string;
    assignee: string;
    assigneeEmail: string;
    dueDate?: string | null;
  }>;
  tags: string[];
}

function safeDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? undefined
    : parsed.toISOString().split("T")[0];
}

function findEmailForName(name: string, participants: IParticipant[]): string {
  const normalized = name.trim().toLowerCase();
  const match = participants.find(
    (participant) => participant.name.trim().toLowerCase() === normalized,
  );
  return match?.email ?? "";
}

export async function generateMOM(
  transcript: string,
  participants: IParticipant[],
): Promise<MomResult> {
  const participantList = participants
    .map((p) => `${p.name} <${p.email}>`)
    .join(", ");

  const prompt = `You are a professional meeting secretary. Analyse this meeting transcript and return a JSON object only — no markdown, no explanation.\n\nParticipants: ${participantList}\n\nTranscript:\n${transcript}\n\nReturn exactly this JSON shape:\n{\n  "title": "short meeting title",\n  "summary": "3-5 sentence executive summary",\n  "decisions": ["decision 1", "decision 2"],\n  "actionItems": [\n    {\n      "task": "what needs to be done",\n      "assignee": "Person Name",\n      "assigneeEmail": "email@example.com",\n      "dueDate": "YYYY-MM-DD or null"\n    }\n  ],\n  "tags": ["tag1", "tag2"]\n}`;

  const response = await client.completions.create({
    model: "claude-2",
    max_tokens_to_sample: 2048,
    prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
    stop_sequences: ["\n\nHuman:"],
  });

  const raw = response.completion.trim();
  let result: MomResult;
  try {
    result = JSON.parse(raw) as MomResult;
  } catch (error) {
    throw new Error(
      "Unable to parse AI response. Please verify transcript content and try again.",
    );
  }

  return {
    title: result.title || "Team meeting summary",
    summary: result.summary || "No summary was generated.",
    decisions: Array.isArray(result.decisions) ? result.decisions : [],
    tags: Array.isArray(result.tags) ? result.tags : [],
    actionItems: Array.isArray(result.actionItems)
      ? result.actionItems.map((item) => ({
          task: item.task || "Update task description",
          assignee: item.assignee || "Unassigned",
          assigneeEmail:
            item.assigneeEmail || findEmailForName(item.assignee, participants),
          dueDate: safeDate(item.dueDate) ?? null,
        }))
      : [],
  };
}

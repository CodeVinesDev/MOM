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
    dueDate?: string;
  }>;
  tags: string[];
}

export async function generateMOM(
  transcript: string,
  participants: IParticipant[],
): Promise<MomResult> {
  const participantList = participants
    .map((p) => `${p.name} <${p.email}>`)
    .join(", ");

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a professional meeting secretary. Analyse this meeting transcript and return a JSON object only — no markdown, no explanation.

Participants: ${participantList}

Transcript:
${transcript}

Return exactly this JSON shape:
{
  "title": "short meeting title",
  "summary": "3-5 sentence executive summary",
  "decisions": ["decision 1", "decision 2"],
  "actionItems": [
    {
      "task": "what needs to be done",
      "assignee": "Person Name",
      "assigneeEmail": "email@example.com",
      "dueDate": "YYYY-MM-DD or null"
    }
  ],
  "tags": ["tag1", "tag2"]
}`,
      },
    ],
  });

  const raw = (message.content[0] as { text: string }).text.trim();
  return JSON.parse(raw) as MomResult;
}

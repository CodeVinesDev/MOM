import { GoogleGenerativeAI } from "@google/generative-ai";
import { IParticipant } from "../models/Meeting";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

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
  console.log(process.env.GEMINI_API_KEY);
  const participantList = participants
    .map((p) => `${p.name} <${p.email}>`)
    .join(", ");

  const prompt = `
You are a professional meeting secretary.

Analyse this meeting transcript and return ONLY valid JSON.

Do not return markdown.
Do not use triple backticks.
Do not add explanation text.

Participants:
${participantList}

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
}
`;

  try {
    const result = await model.generateContent(prompt);

    const response = result.response.text().trim();

    // remove markdown if Gemini returns it
    const cleaned = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed: MomResult;

    try {
      parsed = JSON.parse(cleaned);
    } catch (error) {
      console.error("JSON Parse Error:", cleaned);

      throw new Error("Unable to parse AI response. Please try again.");
    }

    return {
      title: parsed.title || "Team meeting summary",

      summary: parsed.summary || "No summary was generated.",

      decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],

      tags: Array.isArray(parsed.tags) ? parsed.tags : [],

      actionItems: Array.isArray(parsed.actionItems)
        ? parsed.actionItems.map((item) => ({
            task: item.task || "Update task description",

            assignee: item.assignee || "Unassigned",

            assigneeEmail:
              item.assigneeEmail ||
              findEmailForName(item.assignee, participants),

            dueDate: safeDate(item.dueDate) ?? null,
          }))
        : [],
    };
  } catch (error) {
    console.error("Gemini Error:", error);

    throw new Error("Failed to generate meeting summary");
  }
}

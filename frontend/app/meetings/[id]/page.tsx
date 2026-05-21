"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface ActionItem {
  _id: string;
  task: string;
  assignee: string;
  assigneeEmail: string;
  dueDate?: string;
  status: string;
}
interface Meeting {
  _id: string;
  title: string;
  date: string;
  summary: string;
  decisions: string[];
  participants: { name: string; email: string }[];
  emailStatus: string;
  momSentAt?: string;
  actionItems: ActionItem[];
}

export default function MeetingPage() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meetings/${id}`)
      .then((r) => r.json())
      .then(setMeeting);
  }, [id]);

  async function sendEmail() {
    setSending(true);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/email/send/${id}`, {
      method: "POST",
    });
    setSending(false);
    setSent(true);
    setMeeting((m) => (m ? { ...m, emailStatus: "sent" } : m));
  }

  async function updateActionStatus(actionId: string, status: string) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/actions/${actionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setMeeting((m) =>
      m
        ? {
            ...m,
            actionItems: m.actionItems.map((a) =>
              a._id === actionId ? { ...a, status } : a,
            ),
          }
        : m,
    );
  }

  if (!meeting) return <p style={{ padding: 40 }}>Loading…</p>;

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 600 }}>{meeting.title}</h1>
      <p style={{ color: "#888", marginBottom: 24 }}>
        {new Date(meeting.date).toLocaleDateString()} ·{" "}
        {meeting.participants.map((p) => p.name).join(", ")}
      </p>

      <section style={card}>
        <h2 style={sectionHead}>Summary</h2>
        <p style={{ lineHeight: 1.7 }}>{meeting.summary}</p>
      </section>

      <section style={card}>
        <h2 style={sectionHead}>Key decisions</h2>
        <ul style={{ paddingLeft: 20 }}>
          {meeting.decisions.map((d, i) => (
            <li key={i} style={{ marginBottom: 6 }}>
              {d}
            </li>
          ))}
        </ul>
      </section>

      <section style={card}>
        <h2 style={sectionHead}>Action items</h2>
        {meeting.actionItems.map((a) => (
          <div
            key={a._id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 500 }}>{a.task}</p>
              <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
                {a.assignee}{" "}
                {a.dueDate
                  ? `· Due ${new Date(a.dueDate).toLocaleDateString()}`
                  : ""}
              </p>
            </div>
            <select
              value={a.status}
              onChange={(e) => updateActionStatus(a._id, e.target.value)}
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                border: "1px solid #ddd",
                fontSize: 13,
              }}
            >
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        ))}
      </section>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: 24,
        }}
      >
        <button
          onClick={sendEmail}
          disabled={sending || meeting.emailStatus === "sent"}
          style={{
            padding: "12px 28px",
            borderRadius: 8,
            border: "none",
            background: meeting.emailStatus === "sent" ? "#22c55e" : "#0066cc",
            color: "#fff",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          {meeting.emailStatus === "sent"
            ? "✓ MOM sent"
            : sending
              ? "Sending…"
              : "Send MOM to all participants"}
        </button>
        {meeting.momSentAt && (
          <span style={{ fontSize: 13, color: "#888" }}>
            Sent {new Date(meeting.momSentAt).toLocaleString()}
          </span>
        )}
      </div>
    </main>
  );
}

const card: React.CSSProperties = {
  background: "#fafafa",
  borderRadius: 12,
  padding: "20px 24px",
  marginBottom: 20,
  border: "1px solid #eee",
};
const sectionHead: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 12,
};

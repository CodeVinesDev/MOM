"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Participant {
  name: string;
  email: string;
}

export default function HomePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([
    { name: "", email: "" },
  ]);
  const [transcript, setTranscript] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addParticipant() {
    setParticipants((prev) => [...prev, { name: "", email: "" }]);
  }

  function updateParticipant(
    i: number,
    field: keyof Participant,
    value: string,
  ) {
    setParticipants((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("date", date);
      fd.append("participants", JSON.stringify(participants));
      if (file) fd.append("transcript", file);
      else fd.append("transcript", transcript);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/meetings`,
        {
          method: "POST",
          body: fd,
        },
      );
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      router.push(`/meetings/${data.meeting._id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
        AI Meeting MOM Generator
      </h1>
      <p style={{ color: "#666", marginBottom: 32 }}>
        Paste or upload a transcript — get a formatted MOM + auto-email in
        seconds.
      </p>

      <form onSubmit={handleSubmit}>
        <label>Meeting title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={inputStyle}
        />

        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={inputStyle}
        />

        <label>Participants</label>
        {participants.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              placeholder="Name"
              value={p.name}
              onChange={(e) => updateParticipant(i, "name", e.target.value)}
              style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
            />
            <input
              placeholder="email@example.com"
              value={p.email}
              onChange={(e) => updateParticipant(i, "email", e.target.value)}
              style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
            />
          </div>
        ))}
        <button type="button" onClick={addParticipant} style={secondaryBtn}>
          + Add participant
        </button>

        <label style={{ marginTop: 20, display: "block" }}>Transcript</label>
        <textarea
          placeholder="Paste transcript here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={8}
          style={{ ...inputStyle, fontFamily: "monospace", fontSize: 13 }}
        />
        <p style={{ fontSize: 13, color: "#888", margin: "-8px 0 16px" }}>
          or upload a .txt file
        </p>
        <input
          type="file"
          accept=".txt"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}

        <button type="submit" disabled={loading} style={primaryBtn}>
          {loading ? "Generating MOM..." : "Generate MOM →"}
        </button>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: 8,
  marginBottom: 16,
  fontSize: 15,
};
const primaryBtn: React.CSSProperties = {
  marginTop: 24,
  padding: "12px 28px",
  background: "#0066cc",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 16,
  cursor: "pointer",
};
const secondaryBtn: React.CSSProperties = {
  padding: "7px 14px",
  background: "transparent",
  border: "1px solid #ddd",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 14,
};

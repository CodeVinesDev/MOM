"use client";
import { useEffect, useState } from "react";

interface Stats {
  total: number;
  open: number;
  inProgress: number;
  done: number;
  byAssignee: Record<string, number>;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/actions/stats`)
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <p style={{ padding: 40 }}>Loading…</p>;

  const pct = (n: number) =>
    stats.total ? Math.round((n / stats.total) * 100) : 0;

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 32 }}>
        Action item analytics
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          { label: "Open", value: stats.open, color: "#f59e0b" },
          { label: "In progress", value: stats.inProgress, color: "#3b82f6" },
          { label: "Done", value: stats.done, color: "#22c55e" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#fafafa",
              border: "1px solid #eee",
              borderRadius: 12,
              padding: "20px 16px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: s.color,
                margin: 0,
              }}
            >
              {s.value}
            </p>
            <p style={{ fontSize: 14, color: "#888", margin: "4px 0 0" }}>
              {s.label} · {pct(s.value)}%
            </p>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
        By assignee
      </h2>
      {Object.entries(stats.byAssignee).map(([name, count]) => (
        <div
          key={name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <span style={{ width: 140, fontSize: 14 }}>{name}</span>
          <div
            style={{ flex: 1, background: "#eee", borderRadius: 4, height: 8 }}
          >
            <div
              style={{
                width: `${pct(count)}%`,
                height: "100%",
                background: "#0066cc",
                borderRadius: 4,
                transition: "width .4s",
              }}
            />
          </div>
          <span style={{ fontSize: 14, color: "#888", width: 24 }}>
            {count}
          </span>
        </div>
      ))}
    </main>
  );
}

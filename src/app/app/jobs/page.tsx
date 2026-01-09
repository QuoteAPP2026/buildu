"use client";

import React, { useEffect, useMemo, useState } from "react";
import { db, Job, JobStage } from "@/lib/db";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<JobStage | "all">("all");

  useEffect(() => {
    let alive = true;

    async function load() {
      const all = await db.jobs.orderBy("createdAt").reverse().toArray();
      if (!alive) return;
      setJobs(all);
    }

    load();
    const t = setInterval(load, 800);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return jobs.filter((j) => {
      const matchesStage = stage === "all" ? true : j.stage === stage;
      const blob = `${j.customerName} ${j.address ?? ""} ${j.notes ?? ""}`.toLowerCase();
      const matchesQ = query ? blob.includes(query) : true;
      return matchesStage && matchesQ;
    });
  }, [jobs, q, stage]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: -0.4 }}>Jobs</div>
          <div style={{ opacity: 0.75, marginTop: 4 }}>Active work, tracked properly.</div>
        </div>

        <a href="/app/jobs/new" style={primaryBtn}>
          + New job
        </a>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search customer, address…"
          style={input}
        />
        <select value={stage} onChange={(e) => setStage(e.target.value as any)} style={select}>
          <option value="all">All stages</option>
          <option value="booked">Booked</option>
          <option value="on_site">On site</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="invoiced">Invoiced</option>
        </select>
      </div>

      <div style={table}>
        <div style={thead}>
          <div>Customer</div>
          <div>Stage</div>
          <div>Scheduled</div>
          <div>Updated</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 14, opacity: 0.75 }}>
            No jobs yet. Create one or convert an accepted quote.
          </div>
        ) : (
          filtered.map((j) => (
            <a key={j.id} href={`/app/jobs/${j.id}`} style={row}>
              <div style={{ fontWeight: 900 }}>{j.customerName}</div>
              <div><StagePill stage={j.stage} /></div>
              <div style={{ opacity: 0.82 }}>{j.scheduledFor ? formatDate(j.scheduledFor) : "—"}</div>
              <div style={{ opacity: 0.75, fontSize: 12.5 }}>{formatDate(j.updatedAt)}</div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}

function StagePill({ stage }: { stage: JobStage }) {
  const label =
    stage === "booked" ? "Booked" :
    stage === "on_site" ? "On site" :
    stage === "in_progress" ? "In progress" :
    stage === "completed" ? "Completed" : "Invoiced";

  const bg =
    stage === "booked" ? "rgba(255,255,255,0.10)" :
    stage === "on_site" ? "rgba(200,210,230,0.14)" :
    stage === "in_progress" ? "rgba(255,168,76,0.20)" :
    stage === "completed" ? "rgba(90,255,160,0.16)" :
    "rgba(160,190,255,0.16)";

  return <span style={{ ...pill, background: bg }}>{label}</span>;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

const table: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  overflow: "hidden",
};

const thead: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.7fr 1fr 1fr",
  gap: 10,
  padding: "12px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  fontSize: 12.5,
  opacity: 0.8,
  fontWeight: 850,
};

const row: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.7fr 1fr 1fr",
  gap: 10,
  padding: "12px 14px",
  textDecoration: "none",
  color: "rgba(234,240,255,0.94)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const pill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 10px",
  borderRadius: 999,
  fontWeight: 900,
  fontSize: 12,
  border: "1px solid rgba(255,255,255,0.10)",
};

const input: React.CSSProperties = {
  flex: "1 1 260px",
  padding: "10px 12px",
  borderRadius: 14,
  background: "rgba(0,0,0,0.20)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "rgba(234,240,255,0.92)",
  outline: "none",
};

const select: React.CSSProperties = {
  flex: "0 0 200px",
  padding: "10px 12px",
  borderRadius: 14,
  background: "rgba(0,0,0,0.20)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "rgba(234,240,255,0.92)",
  outline: "none",
};

const primaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  borderRadius: 14,
  fontWeight: 950,
  textDecoration: "none",
  color: "#0B0F1D",
  background: "linear-gradient(135deg, rgba(255,168,76,1), rgba(255,214,170,1))",
  border: "1px solid rgba(255,255,255,0.16)",
};

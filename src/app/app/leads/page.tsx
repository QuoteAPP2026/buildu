"use client";

import React, { useEffect, useMemo, useState } from "react";
import { db, Lead, LeadStatus } from "@/lib/db";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");

  useEffect(() => {
    let alive = true;

    async function load() {
      const all = await db.leads.orderBy("createdAt").reverse().toArray();
      if (!alive) return;
      setLeads(all);
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
    return leads.filter((l) => {
      const matchesStatus = status === "all" ? true : l.status === status;
      const blob = `${l.name} ${l.phone ?? ""} ${l.jobType ?? ""} ${l.address ?? ""}`.toLowerCase();
      const matchesQ = query ? blob.includes(query) : true;
      return matchesStatus && matchesQ;
    });
  }, [leads, q, status]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: -0.4 }}>Leads</div>
          <div style={{ opacity: 0.75, marginTop: 4 }}>Your pipeline starts here.</div>
        </div>

        <a href="/app/leads/new" style={primaryBtn}>
          + New lead
        </a>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, phone, job type…"
          style={input}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} style={select}>
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="quoted">Quoted</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      <div style={table}>
        <div style={thead}>
          <div>Name</div>
          <div>Status</div>
          <div>Job type</div>
          <div>Phone</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 14, opacity: 0.75 }}>
            No leads yet. Add your first one.
          </div>
        ) : (
          filtered.map((l) => (
            <a key={l.id} href={`/app/leads/${l.id}`} style={row}>
              <div style={{ fontWeight: 900 }}>{l.name}</div>
              <div><StatusPill status={l.status} /></div>
              <div style={{ opacity: 0.82 }}>{l.jobType ?? "—"}</div>
              <div style={{ opacity: 0.82 }}>{l.phone ?? "—"}</div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: LeadStatus }) {
  const label =
    status === "new" ? "New" :
    status === "contacted" ? "Contacted" :
    status === "quoted" ? "Quoted" :
    status === "won" ? "Won" : "Lost";

  const bg =
    status === "new" ? "rgba(255,255,255,0.10)" :
    status === "contacted" ? "rgba(200,210,230,0.14)" :
    status === "quoted" ? "rgba(255,168,76,0.20)" :
    status === "won" ? "rgba(90,255,160,0.16)" :
    "rgba(255,90,90,0.14)";

  return <span style={{ ...pill, background: bg }}>{label}</span>;
}

const table: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  overflow: "hidden",
};

const thead: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.6fr 1fr 0.9fr",
  gap: 10,
  padding: "12px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  fontSize: 12.5,
  opacity: 0.8,
  fontWeight: 850,
};

const row: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.6fr 1fr 0.9fr",
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

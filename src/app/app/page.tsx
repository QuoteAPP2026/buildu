"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/db";

export default function Dashboard() {
  const [counts, setCounts] = useState({ leads: 0, newLeads: 0, quoted: 0, won: 0 });

  useEffect(() => {
    let alive = true;

    async function load() {
      const leads = await db.leads.count();
      const newLeads = await db.leads.where("status").equals("new").count();
      const quoted = await db.leads.where("status").equals("quoted").count();
      const won = await db.leads.where("status").equals("won").count();
      if (!alive) return;
      setCounts({ leads, newLeads, quoted, won });
    }

    load();
    const t = setInterval(load, 1200);

    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: -0.4 }}>Dashboard</div>
          <div style={{ opacity: 0.75, marginTop: 4 }}>
            Offline-first v1 (data saved on this device).
          </div>
        </div>

        <a href="/app/leads/new" style={primaryBtn}>
          + New lead
        </a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10 }}>
        <Card title="Total leads" value={String(counts.leads)} />
        <Card title="New" value={String(counts.newLeads)} />
        <Card title="Quoted" value={String(counts.quoted)} />
        <Card title="Won" value={String(counts.won)} />
      </div>

      <div style={panel}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Next</div>
        <div style={{ opacity: 0.75, lineHeight: 1.55 }}>
          We’ll build <b>Leads</b> first (list + add + view). Then Quotes → Jobs → Follow-ups.
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div style={{ opacity: 0.75, fontSize: 12.5 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 980, marginTop: 4 }}>{value}</div>
    </div>
  );
}

const panel: React.CSSProperties = {
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.18)",
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

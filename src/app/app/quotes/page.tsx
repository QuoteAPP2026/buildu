"use client";

import React, { useEffect, useMemo, useState } from "react";
import { db, Quote, QuoteStatus } from "@/lib/db";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<QuoteStatus | "all">("all");

  useEffect(() => {
    let alive = true;

    async function load() {
      const all = await db.quotes.orderBy("createdAt").reverse().toArray();
      if (!alive) return;
      setQuotes(all);
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
    return quotes.filter((qt) => {
      const matchesStatus = status === "all" ? true : qt.status === status;
      const blob = `${qt.customerName} ${qt.address ?? ""} ${qt.notes ?? ""}`.toLowerCase();
      const matchesQ = query ? blob.includes(query) : true;
      return matchesStatus && matchesQ;
    });
  }, [quotes, q, status]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: -0.4 }}>Quotes</div>
          <div style={{ opacity: 0.75, marginTop: 4 }}>Draft, send, win.</div>
        </div>

        <a href="/app/quotes/new" style={primaryBtn}>
          + New quote
        </a>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search customer, address…"
          style={input}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} style={select}>
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      <div style={table}>
        <div style={thead}>
          <div>Customer</div>
          <div>Status</div>
          <div>Total</div>
          <div>Updated</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 14, opacity: 0.75 }}>
            No quotes yet. Create your first one.
          </div>
        ) : (
          filtered.map((qt) => (
            <a key={qt.id} href={`/app/quotes/${qt.id}`} style={row}>
              <div style={{ fontWeight: 900 }}>{qt.customerName}</div>
              <div><StatusPill status={qt.status} /></div>
              <div style={{ opacity: 0.9, fontWeight: 900 }}>£{formatMoney(total(qt))}</div>
              <div style={{ opacity: 0.75, fontSize: 12.5 }}>{formatDate(qt.updatedAt)}</div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}

function total(q: Quote) {
  return (q.lines ?? []).reduce((sum, l) => sum + (Number(l.qty) || 0) * (Number(l.unitPrice) || 0), 0);
}

function formatMoney(n: number) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function StatusPill({ status }: { status: QuoteStatus }) {
  const label =
    status === "draft" ? "Draft" :
    status === "sent" ? "Sent" :
    status === "accepted" ? "Accepted" : "Declined";

  const bg =
    status === "draft" ? "rgba(255,255,255,0.10)" :
    status === "sent" ? "rgba(200,210,230,0.14)" :
    status === "accepted" ? "rgba(90,255,160,0.16)" :
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
  gridTemplateColumns: "1.2fr 0.7fr 0.7fr 1fr",
  gap: 10,
  padding: "12px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  fontSize: 12.5,
  opacity: 0.8,
  fontWeight: 850,
};

const row: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.7fr 0.7fr 1fr",
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

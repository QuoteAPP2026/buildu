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
    const t = setInterval(load, 900);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return quotes.filter((qt) => {
      const matchesStatus = status === "all" ? true : qt.status === status;
      const blob = `${qt.customerName} ${(qt as any).address ?? ""} ${(qt as any).notes ?? ""}`.toLowerCase();
      const matchesQ = query ? blob.includes(query) : true;
      return matchesStatus && matchesQ;
    });
  }, [quotes, q, status]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <style>{`
        .top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          align-items: flex-end;
        }
        .h1 { font-size: 22px; font-weight: 950; letter-spacing: -0.4px; }
        .sub { opacity: 0.75; margin-top: 4px; }

        .btnPrimary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 14px;
          border-radius: 16px;
          font-weight: 950;
          text-decoration: none;
          color: #0B0F1D;
          background: linear-gradient(135deg, rgba(255,168,76,1), rgba(255,214,170,1));
          border: 1px solid rgba(255,255,255,0.16);
          min-width: 160px;
        }

        .filters { display: flex; gap: 10px; flex-wrap: wrap; }
        .input, .select {
          padding: 12px 12px;
          border-radius: 16px;
          background: rgba(0,0,0,0.22);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(234,240,255,0.92);
          outline: none;
        }
        .input { flex: 1 1 260px; }
        .select { flex: 1 1 180px; }

        .panel {
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.03);
          overflow: hidden;
        }

        /* Desktop table */
        .tableHead, .tableRow {
          display: grid;
          grid-template-columns: 1.2fr 0.7fr 0.7fr 1fr;
          gap: 10px;
          padding: 12px 14px;
        }
        .tableHead {
          border-bottom: 1px solid rgba(255,255,255,0.08);
          font-size: 12.5px;
          opacity: 0.8;
          font-weight: 850;
        }
        .tableRow {
          text-decoration: none;
          color: rgba(234,240,255,0.94);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        /* Mobile cards */
        .cards { display: none; padding: 12px; gap: 10px; }
        .cardRow {
          display: grid;
          gap: 8px;
          padding: 12px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.18);
          text-decoration: none;
          color: rgba(234,240,255,0.94);
        }
        .rowTop {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
        }
        .name { font-weight: 950; letter-spacing: -0.2px; }
        .meta {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 12.5px;
          opacity: 0.82;
        }

        @media (max-width: 860px){
          .btnPrimary { width: 100%; }
          .filters { display: grid; grid-template-columns: 1fr; }
          .input, .select { width: 100%; }

          .tableHead, .tableRow { display: none; }
          .cards { display: grid; }
        }
      `}</style>

      <div className="top">
        <div>
          <div className="h1">Quotes</div>
          <div className="sub">Draft, send, win.</div>
        </div>

        <a href="/app/quotes/new" className="btnPrimary">+ New quote</a>
      </div>

      <div className="filters">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search customer, address…"
          className="input"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="select">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      <div className="panel">
        {/* Desktop table */}
        <div className="tableHead">
          <div>Customer</div><div>Status</div><div>Total</div><div>Updated</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 14, opacity: 0.75 }}>No quotes yet. Create your first one.</div>
        ) : (
          <>
            {filtered.map((qt) => (
              <a key={qt.id} href={`/app/quotes/${qt.id}`} className="tableRow">
                <div style={{ fontWeight: 900 }}>{qt.customerName}</div>
                <div><StatusPill status={qt.status} /></div>
                <div style={{ opacity: 0.9, fontWeight: 900 }}>£{money(total(qt))}</div>
                <div style={{ opacity: 0.75, fontSize: 12.5 }}>{fmtDate(qt.updatedAt)}</div>
              </a>
            ))}

            {/* Mobile cards */}
            <div className="cards">
              {filtered.map((qt) => (
                <a key={qt.id} href={`/app/quotes/${qt.id}`} className="cardRow">
                  <div className="rowTop">
                    <div className="name">{qt.customerName}</div>
                    <StatusPill status={qt.status} />
                  </div>
                  <div className="meta">
                    <div style={{ fontWeight: 900 }}>£{money(total(qt))}</div>
                    <div>{fmtDate(qt.updatedAt)}</div>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function total(q: Quote) {
  return ((q as any).lines ?? []).reduce(
    (sum: number, l: any) => sum + (Number(l.qty) || 0) * (Number(l.unitPrice) || 0),
    0
  );
}

function money(n: number) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function fmtDate(iso?: string) {
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

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "6px 10px",
      borderRadius: 999,
      fontWeight: 900,
      fontSize: 12,
      border: "1px solid rgba(255,255,255,0.10)",
      background: bg
    }}>
      {label}
    </span>
  );
}

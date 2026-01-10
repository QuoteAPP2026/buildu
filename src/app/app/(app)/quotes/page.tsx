"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { db, Quote } from "@/lib/db";
import { getCurrentUserId } from "@/lib/authUser";

function fmtDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function QuotesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setErr(null);
      setLoading(true);

      const uid = await getCurrentUserId().catch(() => null);
      setUserId(uid ?? null);

      // Load ALL quotes first (so we never “lose” newly created quotes)
      const all = await db.quotes.toArray();

      // Sort newest first using updatedAt/createdAt
      const sorted = all.sort((a: any, b: any) => {
        const da = new Date((a as any).updatedAt ?? (a as any).createdAt ?? 0).getTime();
        const dbb = new Date((b as any).updatedAt ?? (b as any).createdAt ?? 0).getTime();
        return dbb - da;
      });

      // If you want “my quotes only”, keep this filter BUT allow missing userId so nothing disappears
      const visible = uid ? sorted.filter((q: any) => !q.userId || q.userId === uid) : sorted;

      setQuotes(visible);
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Failed to load quotes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const countLabel = useMemo(() => {
    if (loading) return "Loading…";
    return `${quotes.length} quote${quotes.length === 1 ? "" : "s"}`;
  }, [quotes.length, loading]);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>Quotes</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            {countLabel} {userId ? `• user: ${userId.slice(0, 6)}…` : ""}
          </div>
          {err ? <div style={{ fontSize: 12, color: "rgba(255,160,160,0.95)" }}>{err}</div> : null}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => load()} style={btn("secondary")}>Refresh</button>
          <button onClick={() => router.push("/app/quotes/new")} style={btn("primary")}>+ New quote</button>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {loading ? (
          <div style={{ opacity: 0.8 }}>Loading…</div>
        ) : quotes.length === 0 ? (
          <div style={{ opacity: 0.8 }}>No quotes yet.</div>
        ) : (
          quotes.map((q: any) => (
            <button
              key={q.id}
              onClick={() => router.push(`/app/quotes/${q.id}`)}
              style={rowBtn()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "grid", gap: 4, textAlign: "left" }}>
                  <div style={{ fontWeight: 900 }}>
                    {q.customerName || "Customer"} <span style={{ opacity: 0.7 }}>• #{q.id}</span>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    {q.status || "draft"} • {fmtDate((q as any).updatedAt ?? (q as any).createdAt)}
                  </div>
                </div>

                <div style={{ fontSize: 12, opacity: 0.6, alignSelf: "center" }}>
                  {(q as any).userId ? "👤" : "—"}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function btn(kind: "primary" | "secondary") {
  const base: React.CSSProperties = {
    borderRadius: 12,
    padding: "10px 12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(234,240,255,0.96)",
    fontWeight: 900,
    cursor: "pointer",
  };
  if (kind === "primary") return { ...base, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(90,140,255,0.22)" };
  return base;
}

function rowBtn(): React.CSSProperties {
  return {
    width: "100%",
    textAlign: "left",
    borderRadius: 16,
    padding: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(234,240,255,0.96)",
    cursor: "pointer",
  };
}

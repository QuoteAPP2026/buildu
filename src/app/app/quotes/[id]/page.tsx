"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, Quote, QuoteStatus, Settings } from "@/lib/db";

type Line = {
  id?: string;
  desc?: string;
  qty?: number | string;
  unitPrice?: number | string;
};

export default function QuoteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const quoteId = Number(params?.id);

  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<QuoteStatus>("draft");
  const [transcript, setTranscript] = useState("");
  const [lines, setLines] = useState<Line[]>([]);

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    db.settings.get("default").then((s) => {
      if (!alive) return;
      setSettings(s ?? null);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setErr(null);

        if (!Number.isFinite(quoteId)) {
          setErr("Invalid quote ID.");
          setLoading(false);
          return;
        }

        const q = await db.quotes.get(quoteId);
        if (!alive) return;

        if (!q) {
          setQuote(null);
          setLoading(false);
          return;
        }

        setQuote(q);
        setCustomerName(q.customerName ?? "");
        setAddress((q as any).address ?? "");
        setNotes((q as any).notes ?? "");
        setStatus(q.status ?? "draft");
        setTranscript((q as any).transcript ?? "");

        const existing = ((((q as any).lines ?? []) as Line[]) || []).map((l, i) => ({
          id: l.id ?? String(i),
          desc: l.desc ?? "",
          qty: l.qty ?? 1,
          unitPrice: l.unitPrice ?? 0,
        }));
        setLines(existing);

        setLoading(false);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load quote.");
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [quoteId]);

  const total = useMemo(() => {
    return (lines ?? []).reduce((sum, l) => {
      const qty = Number(l.qty) || 0;
      const unit = Number(l.unitPrice) || 0;
      return sum + qty * unit;
    }, 0);
  }, [lines]);

  const quoteMessage = useMemo(() => {
    const bizLines = [
      settings?.businessName?.trim() || "",
      settings?.phone?.trim() || "",
      settings?.email?.trim() || "",
      settings?.address?.trim() || "",
    ].filter(Boolean);

    const bizBlock = bizLines.length ? bizLines.join("\n") + "\n\n" : "";

    const lineText =
      lines.length === 0
        ? "—"
        : lines
            .map((l) => {
              const qty = Number(l.qty) || 0;
              const unit = Number(l.unitPrice) || 0;
              const row = qty * unit;
              return `${l.desc ?? ""} — ${qty} × £${money(unit)} = £${money(row)}`;
            })
            .join("\n");

    const termsBlock = settings?.terms?.trim()
      ? `\n\nTerms:\n${settings.terms.trim()}`
      : "";

    return `${bizBlock}Quote for ${customerName || "Customer"}

Address: ${address || "—"}

Items:
${lineText}

Total: £${money(total)}

Notes:
${notes || "—"}

Transcript:
${transcript || "—"}${termsBlock}`.trim();
  }, [settings, customerName, address, notes, transcript, lines, total]);

  async function save(nextStatus?: QuoteStatus) {
    if (!quote) return;

    try {
      setSaving(true);
      setErr(null);
      setSavedMsg(null);

      const updatedStatus = nextStatus ?? status;

      const updated: Quote = {
        ...quote,
        customerName: customerName.trim() || "Customer",
        status: updatedStatus,
        updatedAt: new Date().toISOString(),
      } as Quote;

      (updated as any).address = address;
      (updated as any).notes = notes;
      (updated as any).transcript = transcript;
      (updated as any).lines = lines.map((l, i) => ({
        id: l.id ?? String(i),
        desc: l.desc ?? "",
        qty: Number(l.qty) || 0,
        unitPrice: Number(l.unitPrice) || 0,
      }));

      await db.quotes.put(updated);
      setQuote(updated);
      setStatus(updatedStatus);

      setSavedMsg("Saved ✓");
      setTimeout(() => setSavedMsg(null), 1200);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function markSent() {
    if (status === "accepted" || status === "declined") return;
    if (status !== "sent") await save("sent");
    else await save("sent");
  }

  function addLine() {
    setLines((prev) => [...prev, { id: String(Date.now()), desc: "", qty: 1, unitPrice: 0 }]);
  }

  function removeLine(id?: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  async function delQuote() {
    if (!quote?.id) return;
    if (!confirm("Delete this quote?")) return;
    await db.quotes.delete(quote.id as any);
    router.push("/app/quotes");
  }

  async function openWhatsApp() {
    await markSent();
    window.open(`https://wa.me/?text=${encodeURIComponent(quoteMessage)}`, "_blank");
  }

  async function openSMS() {
    await markSent();
    window.location.href = `sms:?&body=${encodeURIComponent(quoteMessage)}`;
  }

  async function openGmail() {
    await markSent();
    const subject = encodeURIComponent(`Quote - ${customerName || "Customer"}`);
    const body = encodeURIComponent(quoteMessage);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, "_blank");
  }

  async function copyText() {
    await markSent();
    await navigator.clipboard.writeText(quoteMessage);
    alert("Copied");
  }

  if (loading) return <div style={{ opacity: 0.8 }}>Loading…</div>;

  if (err) {
    return (
      <div style={card}>
        <div style={{ fontWeight: 950, marginBottom: 8 }}>Error</div>
        <div style={{ opacity: 0.85 }}>{err}</div>
        <div style={{ marginTop: 12 }}>
          <a href="/app/quotes" style={linkBtn}>← Back to Quotes</a>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div style={card}>
        <div style={{ fontWeight: 950, marginBottom: 8 }}>Quote not found</div>
        <a href="/app/quotes" style={linkBtn}>← Back to Quotes</a>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <a href="/app/quotes" style={{ ...linkBtn, padding: 0, border: "none" }}>← Back</a>
          <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: -0.4, marginTop: 8 }}>Quote</div>
          <div style={{ opacity: 0.75, marginTop: 4 }}>Edit, save, then send.</div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {savedMsg ? <div style={{ fontWeight: 950, opacity: 0.85 }}>{savedMsg}</div> : null}
          <button type="button" onClick={() => save()} style={primaryBtn} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={delQuote} style={dangerBtn}>Delete</button>
        </div>
      </div>

      <div style={card}>
        <div style={grid2}>
          <div>
            <div style={label}>Customer name</div>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={input} />
          </div>
          <div>
            <div style={label}>Status</div>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} style={select}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={label}>Address</div>
          <input value={address} onChange={(e) => setAddress(e.target.value)} style={input} />
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={label}>Notes</div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={textarea} />
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ fontWeight: 950 }}>Line items</div>
          <button type="button" onClick={addLine} style={secondaryBtn}>+ Add line</button>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {lines.length === 0 ? (
            <div style={{ opacity: 0.75 }}>No line items yet.</div>
          ) : (
            lines.map((l) => (
              <div key={l.id} style={lineRow}>
                <input
                  value={l.desc ?? ""}
                  onChange={(e) =>
                    setLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, desc: e.target.value } : x)))
                  }
                  placeholder="Description"
                  style={{ ...input, flex: "1 1 auto" }}
                />

                <input
                  value={String(l.qty ?? "")}
                  onChange={(e) =>
                    setLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, qty: e.target.value } : x)))
                  }
                  placeholder="Qty"
                  inputMode="decimal"
                  style={{ ...input, width: 90 }}
                />

                <input
                  value={String(l.unitPrice ?? "")}
                  onChange={(e) =>
                    setLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, unitPrice: e.target.value } : x)))
                  }
                  placeholder="Unit £"
                  inputMode="decimal"
                  style={{ ...input, width: 110 }}
                />

                <div style={{ width: 110, textAlign: "right", fontWeight: 900, opacity: 0.92 }}>
                  £{money((Number(l.qty) || 0) * (Number(l.unitPrice) || 0))}
                </div>

                <button type="button" onClick={() => removeLine(l.id)} style={ghostBtn}>Remove</button>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <div style={totalBox}>Total: £{money(total)}</div>
        </div>
      </div>

      <div style={card}>
        <div style={{ fontWeight: 950, marginBottom: 10 }}>Transcript (editable)</div>
        <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} style={textareaTall} />
      </div>

      <div style={card}>
        <div style={{ fontWeight: 950, marginBottom: 8 }}>Send</div>
        <div style={{ opacity: 0.75, marginBottom: 12 }}>Sending marks this quote as <b>Sent</b>.</div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={openWhatsApp} style={primaryBlueBtn}>WhatsApp</button>
          <button type="button" onClick={openGmail} style={secondaryBtn}>Gmail</button>
          <button type="button" onClick={openSMS} style={secondaryBtn}>SMS</button>
          <button type="button" onClick={copyText} style={ghostBtn}>Copy</button>
        </div>
      </div>
    </div>
  );
}

function money(n: number) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

const card: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  padding: 14,
};

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.8fr",
  gap: 12,
};

const label: React.CSSProperties = {
  fontSize: 12.5,
  opacity: 0.78,
  fontWeight: 850,
  marginBottom: 6,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 14,
  background: "rgba(0,0,0,0.20)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "rgba(234,240,255,0.92)",
  outline: "none",
};

const select: React.CSSProperties = { ...input };

const textarea: React.CSSProperties = {
  ...input,
  minHeight: 90,
  resize: "vertical",
};

const textareaTall: React.CSSProperties = {
  ...input,
  minHeight: 160,
  resize: "vertical",
};

const lineRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  flexWrap: "wrap",
  padding: 10,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(0,0,0,0.16)",
};

const totalBox: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.18)",
  fontWeight: 950,
};

const linkBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  color: "rgba(234,240,255,0.94)",
};

const primaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  borderRadius: 14,
  fontWeight: 950,
  color: "#0B0F1D",
  background: "linear-gradient(135deg, rgba(255,168,76,1), rgba(255,214,170,1))",
  border: "1px solid rgba(255,255,255,0.16)",
  cursor: "pointer",
};

const primaryBlueBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  borderRadius: 14,
  fontWeight: 950,
  color: "#fff",
  background: "linear-gradient(135deg, rgba(31,122,236,1), rgba(140,190,255,1))",
  border: "1px solid rgba(255,255,255,0.12)",
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  borderRadius: 14,
  fontWeight: 950,
  color: "rgba(234,240,255,0.92)",
  background: "rgba(0,0,0,0.18)",
  border: "1px solid rgba(255,255,255,0.12)",
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  borderRadius: 14,
  fontWeight: 950,
  color: "rgba(234,240,255,0.92)",
  background: "transparent",
  border: "1px dashed rgba(255,255,255,0.18)",
  cursor: "pointer",
};

const dangerBtn: React.CSSProperties = {
  ...secondaryBtn,
  border: "1px solid rgba(255,120,120,0.28)",
  background: "rgba(255,90,90,0.10)",
  color: "rgba(255,210,210,0.95)",
};

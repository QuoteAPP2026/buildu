"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, Quote, QuoteStatus, Settings } from "@/lib/db";

type Line = {
  id?: string;
  description?: string;
  qty?: number | string;
  unitPrice?: number | string;
};

function money(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return x.toFixed(2);
}

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

        // Backwards compatible: support old saved lines using "desc"
        const existing = ((((q as any).lines ?? []) as any[]) || []).map((l, i) => ({
          id: (l?.id ?? String(i)) as string,
          description: (l?.description ?? l?.desc ?? "") as string,
          qty: l?.qty ?? 1,
          unitPrice: l?.unitPrice ?? 0,
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
              return `${l.description ?? ""} — ${qty} × £${money(unit)} = £${money(row)}`;
            })
            .join("\n");

    const termsBlock = settings?.terms?.trim() ? `\n\nTerms:\n${settings.terms.trim()}` : "";

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

      // Save using "description" (canonical)
      (updated as any).lines = lines.map((l, i) => ({
        id: l.id ?? String(i),
        description: l.description ?? "",
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
    await save("sent");
  }

  function addLine() {
    setLines((prev) => [...prev, { id: String(Date.now()), description: "", qty: 1, unitPrice: 0 }]);
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

  const statusPill = useMemo(() => {
    const s = status ?? "draft";
    const map: Record<string, string> = {
      draft: "Draft",
      sent: "Sent",
      accepted: "Accepted",
      declined: "Declined",
    };
    return map[s] ?? s;
  }, [status]);

  if (loading) {
    return (
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 18 }}>
        <div style={{ opacity: 0.8 }}>Loading quote…</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 18 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => router.push("/app/quotes")}
            style={btn("secondary")}
          >
            ← Quotes
          </button>
        </div>
        <div style={{ marginTop: 14, opacity: 0.9 }}>Quote not found.</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => router.push("/app/quotes")} style={btn("secondary")}>
            ← Quotes
          </button>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Quote #{quoteId}</div>
          <div style={pill()}>{statusPill}</div>
          {savedMsg ? <div style={{ opacity: 0.9 }}>{savedMsg}</div> : null}
          {err ? <div style={{ color: "rgba(255,160,160,0.95)" }}>{err}</div> : null}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button disabled={saving} onClick={() => save()} style={btn("primary")}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button disabled={saving} onClick={() => save("draft")} style={btn("secondary")}>
            Draft
          </button>
          <button disabled={saving || status === "accepted" || status === "declined"} onClick={() => save("sent")} style={btn("secondary")}>
            Mark sent
          </button>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        <Card title="Customer">
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
            <Field label="Customer name">
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={input()}
                placeholder="Customer"
              />
            </Field>
            <Field label="Address">
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={textarea()}
                placeholder="Address"
                rows={2}
              />
            </Field>
          </div>
        </Card>

        <Card title="Items">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ opacity: 0.85 }}>Add your line items below.</div>
            <button onClick={addLine} style={btn("secondary")}>+ Add item</button>
          </div>

          <div style={{ marginTop: 10, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={th()}>Description</th>
                  <th style={th({ width: 110 })}>Qty</th>
                  <th style={th({ width: 140 })}>Unit (£)</th>
                  <th style={th({ width: 140 })}>Row (£)</th>
                  <th style={th({ width: 90 })}></th>
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 14, opacity: 0.75 }}>
                      No items yet.
                    </td>
                  </tr>
                ) : (
                  lines.map((l) => {
                    const qty = Number(l.qty) || 0;
                    const unit = Number(l.unitPrice) || 0;
                    const row = qty * unit;

                    return (
                      <tr key={l.id}>
                        <td style={td()}>
                          <input
                            value={l.description ?? ""}
                            onChange={(e) =>
                              setLines((prev) =>
                                prev.map((x) => (x.id === l.id ? { ...x, description: e.target.value } : x))
                              )
                            }
                            style={input()}
                            placeholder="e.g. Kitchen fit-out"
                          />
                        </td>
                        <td style={td()}>
                          <input
                            value={String(l.qty ?? "")}
                            onChange={(e) =>
                              setLines((prev) =>
                                prev.map((x) => (x.id === l.id ? { ...x, qty: e.target.value } : x))
                              )
                            }
                            style={input()}
                            inputMode="decimal"
                            placeholder="1"
                          />
                        </td>
                        <td style={td()}>
                          <input
                            value={String(l.unitPrice ?? "")}
                            onChange={(e) =>
                              setLines((prev) =>
                                prev.map((x) => (x.id === l.id ? { ...x, unitPrice: e.target.value } : x))
                              )
                            }
                            style={input()}
                            inputMode="decimal"
                            placeholder="0.00"
                          />
                        </td>
                        <td style={{ ...td(), fontWeight: 700, opacity: 0.95 }}>£{money(row)}</td>
                        <td style={td({ textAlign: "right" })}>
                          <button onClick={() => removeLine(l.id)} style={btn("danger")}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>
              Total: £{money(total)}
            </div>
          </div>
        </Card>

        <Card title="Notes">
          <Field label="Notes (shown on message)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={textarea()}
              placeholder="Notes"
              rows={3}
            />
          </Field>
        </Card>

        <Card title="Transcript">
          <Field label="Transcript (optional)">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              style={textarea()}
              placeholder="Transcript"
              rows={4}
            />
          </Field>
        </Card>

        <Card title="Send">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={openWhatsApp} style={btn("primary")}>WhatsApp</button>
            <button onClick={openSMS} style={btn("secondary")}>SMS</button>
            <button onClick={openGmail} style={btn("secondary")}>Gmail</button>
            <button onClick={() => navigator.clipboard.writeText(quoteMessage)} style={btn("secondary")}>
              Copy message
            </button>
          </div>

          <div style={{ marginTop: 10 }}>
            <details>
              <summary style={{ cursor: "pointer", opacity: 0.9 }}>Preview message</summary>
              <pre style={preview()}>{quoteMessage}</pre>
            </details>
          </div>
        </Card>

        <Card title="Danger zone">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ opacity: 0.85 }}>Delete this quote permanently.</div>
            <button onClick={delQuote} style={btn("danger")}>Delete quote</button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        borderRadius: 16,
        padding: 14,
        boxShadow: "0 18px 55px rgba(0,0,0,0.25)",
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{label}</div>
      {children}
    </label>
  );
}

function btn(kind: "primary" | "secondary" | "danger") {
  const base: React.CSSProperties = {
    borderRadius: 12,
    padding: "10px 12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(234,240,255,0.96)",
    fontWeight: 700,
    cursor: "pointer",
  };

  if (kind === "primary") {
    return {
      ...base,
      border: "1px solid rgba(255,255,255,0.18)",
      background: "rgba(90,140,255,0.22)",
    };
  }

  if (kind === "danger") {
    return {
      ...base,
      border: "1px solid rgba(255,140,140,0.25)",
      background: "rgba(255,90,90,0.12)",
    };
  }

  return base;
}

function input(): React.CSSProperties {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.25)",
    color: "rgba(234,240,255,0.96)",
    outline: "none",
  };
}

function textarea(): React.CSSProperties {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.25)",
    color: "rgba(234,240,255,0.96)",
    outline: "none",
    resize: "vertical",
  };
}

function th(extra?: React.CSSProperties): React.CSSProperties {
  return {
    textAlign: "left",
    fontSize: 12,
    padding: "10px 10px",
    opacity: 0.8,
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    ...(extra ?? {}),
  };
}

function td(extra?: React.CSSProperties): React.CSSProperties {
  return {
    padding: "10px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    verticalAlign: "top",
    ...(extra ?? {}),
  };
}

function pill(): React.CSSProperties {
  return {
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    opacity: 0.95,
  };
}

function preview(): React.CSSProperties {
  return {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.28)",
    color: "rgba(234,240,255,0.92)",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  };
}

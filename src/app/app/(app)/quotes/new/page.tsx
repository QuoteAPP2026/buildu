"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { db, Quote, QuoteStatus, Settings } from "@/lib/db";
import { getCurrentUserId } from "@/lib/authUser";
import { getCurrentUserId } from "@/lib/authUser";

type Line = {
  id?: string;
  description?: string;
  qty?: number | string;
  unitPrice?: number | string; // Value per unit
};

type SpeechRec = any;

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function money(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return x.toFixed(2);
}

export default function NewQuotePage() {
  const router = useRouter();

  const [settings, setSettings] = useState<Settings | null>(null);

  const [status, setStatus] = useState<QuoteStatus>("draft");

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");

  // Speech / transcript (NOW ABOVE ITEMS)
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);

  const [lines, setLines] = useState<Line[]>([
    { id: uid(), description: "", qty: 1, unitPrice: 0 },
  ]);

  // VAT off by default
  const [vatEnabled, setVatEnabled] = useState(false);
  const [vatRate, setVatRate] = useState<string>("0.20");
  const [totalOverride, setTotalOverride] = useState<string>("");

  const [notes, setNotes] = useState("");

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

  function startMic() {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition isn’t available in this browser. Try Chrome.");
      return;
    }

    try {
      const rec: SpeechRec = new SR();
      rec.lang = "en-GB";
      rec.interimResults = true;
      rec.continuous = true;

      rec.onresult = (event: any) => {
        let finalText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0]?.transcript ?? "";
          if (event.results[i].isFinal) finalText += text;
        }
        if (finalText.trim()) {
          setTranscript((prev) => (prev ? prev + " " : "") + finalText.trim());
        }
      };

      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);

      recRef.current = rec;
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
    }
  }

  function stopMic() {
    try {
      recRef.current?.stop?.();
    } catch {}
    setListening(false);
  }

  useEffect(() => {
    return () => {
      try {
        recRef.current?.stop?.();
      } catch {}
    };
  }, []);

  function addLine() {
    setLines((prev) => [...prev, { id: uid(), description: "", qty: 1, unitPrice: 0 }]);
  }

  function removeLine(id?: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  const subtotal = useMemo(() => {
    return (lines ?? []).reduce((sum, l) => {
      const qty = Number(l.qty) || 0;
      const unit = Number(l.unitPrice) || 0;
      return sum + qty * unit;
    }, 0);
  }, [lines]);

  const vatRateNum = useMemo(() => {
    const v = Number(vatRate);
    return Number.isFinite(v) ? v : 0;
  }, [vatRate]);

  const vatAmount = useMemo(
    () => (vatEnabled ? subtotal * vatRateNum : 0),
    [subtotal, vatEnabled, vatRateNum]
  );

  const computedTotal = useMemo(() => subtotal + vatAmount, [subtotal, vatAmount]);

  const effectiveTotal = useMemo(() => {
    const o = Number(totalOverride);
    return totalOverride.trim() && Number.isFinite(o) ? o : computedTotal;
  }, [totalOverride, computedTotal]);

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

    const vatBlock = vatEnabled ? `\nVAT (${Math.round(vatRateNum * 100)}%): £${money(vatAmount)}` : "";
    const overrideNote = totalOverride.trim() ? `\n(Manual total used)` : "";

    const termsBlock = settings?.terms?.trim() ? `\n\nTerms:\n${settings.terms.trim()}` : "";

    return `${bizBlock}Quote for ${customerName || "Customer"}

Address: ${address || "—"}

Items:
${lineText}

Subtotal: £${money(subtotal)}${vatBlock}

Total: £${money(effectiveTotal)}${overrideNote}

Notes:
${notes || "—"}

Transcript:
${transcript || "—"}${termsBlock}`.trim();
  }, [
    settings,
    customerName,
    address,
    lines,
    subtotal,
    vatEnabled,
    vatRateNum,
    vatAmount,
    effectiveTotal,
    totalOverride,
    notes,
    transcript,
  ]);

  async function saveQuote() {
    try {
      setSaving(true);
      setErr(null);
      setSavedMsg(null);

      const now = new Date().toISOString();

      const q: Quote = {
        customerName: customerName.trim() || "Customer",
        status,
        createdAt: now,
        updatedAt: now,
      } as Quote;

      (q as any).address = address;
      (q as any).notes = notes;
      (q as any).transcript = transcript;

      (q as any).vatEnabled = vatEnabled;
      (q as any).vatRate = vatRateNum;
      (q as any).totalOverride = totalOverride.trim();

      (q as any).lines = (lines ?? []).map((l, i) => ({
        id: l.id ?? String(i),
        description: l.description ?? "",
        qty: Number(l.qty) || 0,
        unitPrice: Number(l.unitPrice) || 0,
      }));

      const id = (const __uid = await getCurrentUserId();
      (quote as any).userId = __uid;
      await db.quotes.add()q as any);

      setSavedMsg("Saved ✓");
      setTimeout(() => setSavedMsg(null), 1400);

      router.replace("/app/quotes");
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save quote.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16, paddingBottom: 110 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 2 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => router.push("/app/quotes")} style={btn("secondary")}>← Quotes</button>
            <div style={{ fontSize: 18, fontWeight: 900 }}>New Quote</div>
          </div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            {settings?.businessName?.trim() ? settings.businessName.trim() : "—"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <select value={status} onChange={(e) => setStatus(e.target.value as QuoteStatus)} style={select()}>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
          </select>

          <button disabled={saving} onClick={saveQuote} style={btn("save")}>
            {saving ? "Saving…" : "Save"}
          </button>

          {savedMsg ? <div style={{ fontWeight: 900, opacity: 0.9 }}>{savedMsg}</div> : null}
        </div>
      </div>

      {err ? <div style={{ marginTop: 10, color: "rgba(255,160,160,0.95)" }}>{err}</div> : null}

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        <Card title="Customer">
          <div style={{ display: "grid", gap: 10 }}>
            <Field label="Customer name">
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={input()} placeholder="Customer" />
            </Field>
            <Field label="Address">
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} style={textarea()} placeholder="Address" rows={2} />
            </Field>
          </div>
        </Card>

        <Card title="Speech → Transcript">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "grid", gap: 2 }}>
              <div style={{ fontWeight: 900 }}>Speak or type here</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {listening ? "Listening…" : "Tap the green mic and speak — it appends here."}
              </div>
            </div>

            {!listening ? (
              <button onClick={startMic} style={btn("mic")}>🎙 Mic</button>
            ) : (
              <button onClick={stopMic} style={btn("danger")}>■ Stop</button>
            )}
          </div>

          <div style={{ marginTop: 10 }}>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              style={textarea()}
              placeholder="Speak or type here…"
              rows={4}
            />
          </div>
        </Card>

        <Card title="Items">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ opacity: 0.8, fontSize: 12 }}>Description + Qty + Value</div>
            <button onClick={addLine} style={btn("secondary")}>+ Add item</button>
          </div>

          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {lines.map((l) => {
              const qty = Number(l.qty) || 0;
              const unit = Number(l.unitPrice) || 0;
              const row = qty * unit;

              return (
                <div key={l.id} style={itemCard()}>
                  <div style={{ display: "grid", gap: 8 }}>
                    <input
                      value={l.description ?? ""}
                      onChange={(e) => setLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, description: e.target.value } : x)))}
                      style={input()}
                      placeholder="Description"
                    />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div style={{ display: "grid", gap: 6 }}>
                        <div style={miniLabel()}>Qty</div>
                        <input
                          value={String(l.qty ?? "")}
                          onChange={(e) => setLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, qty: e.target.value } : x)))}
                          style={input()}
                          inputMode="decimal"
                          placeholder="1"
                        />
                      </div>

                      <div style={{ display: "grid", gap: 6 }}>
                        <div style={miniLabel()}>Value (£)</div>
                        <input
                          value={String(l.unitPrice ?? "")}
                          onChange={(e) => setLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, unitPrice: e.target.value } : x)))}
                          style={input()}
                          inputMode="decimal"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <div style={{ fontWeight: 900, opacity: 0.95 }}>Row: £{money(row)}</div>
                      <button onClick={() => removeLine(l.id)} style={btn("danger")}>Remove</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <MiniStat label="Subtotal" value={`£${money(subtotal)}`} />
              <MiniStat label={vatEnabled ? `VAT (${Math.round(vatRateNum * 100)}%)` : "VAT"} value={`£${money(vatAmount)}`} />
              <MiniStat label={totalOverride.trim() ? "Total (manual)" : "Total"} value={`£${money(effectiveTotal)}`} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label style={toggleRow()}>
                <input type="checkbox" checked={vatEnabled} onChange={(e) => setVatEnabled(e.target.checked)} />
                <span>VAT</span>
              </label>

              <Field label="VAT rate">
                <input value={vatRate} onChange={(e) => setVatRate(e.target.value)} style={input()} inputMode="decimal" />
              </Field>
            </div>

            <Field label="Override total (optional)">
              <input
                value={totalOverride}
                onChange={(e) => setTotalOverride(e.target.value)}
                style={input()}
                inputMode="decimal"
                placeholder={money(computedTotal)}
              />
            </Field>

            {/* SECOND SAVE BUTTON (UNDER ITEMS) */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {savedMsg ? <div style={{ fontWeight: 900, opacity: 0.9 }}>{savedMsg}</div> : null}
              <button disabled={saving} onClick={saveQuote} style={btn("save")}>
                {saving ? "Saving…" : "Save quote"}
              </button>
            </div>
          </div>
        </Card>

        <Card title="Notes">
          <Field label="Notes (shown on message)">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={textarea()} placeholder="Notes" rows={3} />
          </Field>
        </Card>

        <Card title="Preview">
          <details>
            <summary style={{ cursor: "pointer", fontWeight: 900, opacity: 0.9 }}>Show message preview</summary>
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => navigator.clipboard.writeText(quoteMessage)} style={btn("secondary")}>Copy message</button>
            </div>
            <pre style={preview()}>{quoteMessage}</pre>
          </details>
        </Card>
      </div>

      {/* Sticky bottom bar (third save option) */}
      <div style={stickyBar()}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
          <div style={{ display: "grid" }}>
            <div style={{ fontWeight: 900 }}>Total: £{money(effectiveTotal)}</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>{savedMsg ? savedMsg : "Save to create the quote"}</div>
          </div>
          <button disabled={saving} onClick={saveQuote} style={btn("save")}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 14, boxShadow: "0 18px 55px rgba(0,0,0,0.25)" }}>
      <div style={{ fontWeight: 900, marginBottom: 10 }}>{title}</div>
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: 14, padding: 10, background: "rgba(0,0,0,0.22)" }}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function btn(kind: "primary" | "secondary" | "danger" | "mic" | "save") {
  const base: React.CSSProperties = {
    borderRadius: 12,
    padding: "10px 12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(234,240,255,0.96)",
    fontWeight: 900,
    cursor: "pointer",
  };

  if (kind === "danger") return { ...base, border: "1px solid rgba(255,140,140,0.25)", background: "rgba(255,90,90,0.12)" };

  // Green buttons (Mic + Save)
  if (kind === "mic") return { ...base, border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.18)" };
  if (kind === "save") return { ...base, border: "1px solid rgba(34,197,94,0.40)", background: "rgba(34,197,94,0.22)" };

  if (kind === "primary") return { ...base, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(90,140,255,0.22)" };
  return base;
}

function input(): React.CSSProperties {
  return { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.25)", color: "rgba(234,240,255,0.96)", outline: "none" };
}

function textarea(): React.CSSProperties {
  return { ...input(), resize: "vertical" };
}

function select(): React.CSSProperties {
  return { ...input(), padding: "10px 10px" };
}

function preview(): React.CSSProperties {
  return { marginTop: 10, padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.28)", color: "rgba(234,240,255,0.92)", whiteSpace: "pre-wrap", overflowWrap: "anywhere" };
}

function toggleRow(): React.CSSProperties {
  return { display: "flex", gap: 10, alignItems: "center", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 12px", background: "rgba(0,0,0,0.18)", fontWeight: 900 };
}

function itemCard(): React.CSSProperties {
  return { border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, padding: 12, background: "rgba(0,0,0,0.18)" };
}

function miniLabel(): React.CSSProperties {
  return { fontSize: 12, opacity: 0.75, fontWeight: 800 };
}

function stickyBar(): React.CSSProperties {
  return { position: "fixed", left: 0, right: 0, bottom: 0, padding: 12, background: "rgba(7,11,20,0.92)", backdropFilter: "blur(10px)", borderTop: "1px solid rgba(255,255,255,0.10)" };
}

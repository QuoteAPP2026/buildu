"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, Quote, QuoteStatus, Settings } from "@/lib/db";
import { getCurrentUserId } from "@/lib/authUser";
import UpgradeModal from "@/components/UpgradeModal";
import { buildQuoteMessage, calcTotals, money } from "@/lib/quoteMessage";
import { getRemainingSends, hasSentQuote, FREE_QUOTE_LIMIT } from "@/lib/usage";
import { sendQuoteAndLog, getActivities, SendChannel } from "@/lib/quoteActions";

type Line = {
  id?: string;
  description?: string;
  qty?: number | string;
  unitPrice?: number | string;
};

type SpeechRec = any;

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

export default function QuoteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const quoteId = Number(params?.id);

  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<any>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<QuoteStatus>("draft");

  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);

  const [lines, setLines] = useState<Line[]>([{ id: uid(), description: "", qty: 1, unitPrice: 0 }]);

  const [vatEnabled, setVatEnabled] = useState(false);
  const [vatRate, setVatRate] = useState<string>("0.20");
  const [totalOverride, setTotalOverride] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [userId, setUserId] = useState<string>("");
  const [remaining, setRemaining] = useState<number>(FREE_QUOTE_LIMIT);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [sending, setSending] = useState<SendChannel | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const uid = await getCurrentUserId();
      if (!alive) return;
      setUserId(uid);
      setRemaining(getRemainingSends(uid));
      const s = await db.settings.get("default");
      if (!alive) return;
      setSettings(s ?? null);
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function refreshQuote() {
    const q = await db.quotes.get(quoteId);
    if (!q) {
      setQuote(null);
      setLoading(false);
      return;
    }

    const anyQ: any = q;

    setQuote(anyQ);
    setCustomerName(anyQ.customerName ?? "");
    setAddress(anyQ.address ?? "");
    setNotes(anyQ.notes ?? "");
    setStatus(anyQ.status ?? "draft");
    setTranscript(anyQ.transcript ?? "");

    setVatEnabled(Boolean(anyQ.vatEnabled ?? false));
    setVatRate(String(anyQ.vatRate ?? "0.20"));
    setTotalOverride(String(anyQ.totalOverride ?? ""));

    const existing = (Array.isArray(anyQ.lines) ? anyQ.lines : []).map((l: any, i: number) => ({
      id: String(l?.id ?? i),
      description: String(l?.description ?? l?.desc ?? ""),
      qty: l?.qty ?? 1,
      unitPrice: l?.unitPrice ?? 0,
    }));

    setLines(existing.length ? existing : [{ id: uid(), description: "", qty: 1, unitPrice: 0 }]);
    setLoading(false);
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr(null);
        if (!Number.isFinite(quoteId)) {
          setErr("Invalid quote ID.");
          setLoading(false);
          return;
        }
        await refreshQuote();
        if (!alive) return;
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load quote.");
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [quoteId]);

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
        if (finalText.trim()) setTranscript((prev) => (prev ? prev + " " : "") + finalText.trim());
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

  const totals = useMemo(() => {
    const q = { customerName, address, notes, transcript, lines, vatEnabled, vatRate, totalOverride };
    return calcTotals(q);
  }, [customerName, address, notes, transcript, lines, vatEnabled, vatRate, totalOverride]);

  const message = useMemo(() => {
    const q = { customerName, address, notes, transcript, lines, vatEnabled, vatRate: Number(vatRate), totalOverride };
    return buildQuoteMessage(settings, q);
  }, [settings, customerName, address, notes, transcript, lines, vatEnabled, vatRate, totalOverride]);

  const alreadySent = useMemo(() => (userId ? hasSentQuote(userId, quoteId) : false), [userId, quoteId]);
  const canSend = alreadySent || remaining > 0;

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

      const anyU: any = updated;
      anyU.userId = anyU.userId ?? userId;

      anyU.address = address;
      anyU.notes = notes;
      anyU.transcript = transcript;

      anyU.vatEnabled = vatEnabled;
      anyU.vatRate = Number(vatRate) || 0;
      anyU.totalOverride = String(totalOverride ?? "").trim();

      anyU.lines = (lines ?? []).map((l, i) => ({
        id: l.id ?? String(i),
        description: l.description ?? "",
        qty: Number(l.qty) || 0,
        unitPrice: Number(l.unitPrice) || 0,
      }));

      const acts = getActivities(anyU);
      acts.unshift({ id: uid(), type: "saved", at: new Date().toISOString(), meta: {} } as any);
      anyU.activities = acts;

      await db.quotes.put(anyU);
      setQuote(anyU);
      setStatus(updatedStatus);

      setSavedMsg("Saved ✓");
      setTimeout(() => setSavedMsg(null), 1200);
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function doSend(channel: SendChannel) {
    if (!userId) return;

    if (!canSend) {
      setShowUpgrade(true);
      return;
    }

    try {
      setSending(channel);
      const res = await sendQuoteAndLog({ quoteId, userId, channel });
      if (!res.ok) {
        setShowUpgrade(true);
        return;
      }

      setRemaining(res.remaining);
      await refreshQuote();

      if (channel === "copy") {
        await navigator.clipboard.writeText(res.message);
        setSavedMsg("Copied ✓");
        setTimeout(() => setSavedMsg(null), 1200);
        return;
      }

      if (channel === "whatsapp") {
        window.open(res.targets.whatsappUrl, "_blank");
        return;
      }

      if (channel === "email") {
        window.open(res.targets.gmailUrl, "_blank");
        return;
      }
    } finally {
      setSending(null);
    }
  }

  async function delQuote() {
    if (!quote?.id) return;
    if (!confirm("Delete this quote?")) return;
    await db.quotes.delete(quote.id as any);
    router.push("/app/quotes");
  }

  const activities = useMemo(() => getActivities(quote), [quote]);

  if (loading) return <div style={{ padding: 16, opacity: 0.8 }}>Loading…</div>;

  if (!quote) {
    return (
      <div style={{ padding: 16 }}>
        <button onClick={() => router.push("/app/quotes")} style={btn("secondary")}>← Quotes</button>
        <div style={{ marginTop: 12, opacity: 0.85 }}>Quote not found.</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16, paddingBottom: 110 }}>
      {showUpgrade ? <UpgradeModal isOpen={true} onClose={() => setShowUpgrade(false)} /> : null}

      <div style={topBar()}>
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => router.push("/app/quotes")} style={btn("secondary")}>← Quotes</button>
            <div style={{ fontSize: 16, fontWeight: 950 }}>Quote #{quoteId}</div>
            <span style={pill()}>{status}</span>
            {alreadySent ? <span style={pillGood()}>Sent ✓</span> : null}
          </div>

          <div style={{ fontSize: 12, opacity: 0.78, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span>{settings?.businessName?.trim() ? settings.businessName.trim() : "—"}</span>
            <span style={{ opacity: 0.55 }}>•</span>
            <span>Free sends left: <b>{remaining}</b>/<span style={{ opacity: 0.85 }}>{FREE_QUOTE_LIMIT}</span></span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button disabled={saving} onClick={() => save()} style={btn("save")}>{saving ? "Saving…" : "Save"}</button>
          {savedMsg ? <div style={{ fontWeight: 900, opacity: 0.92 }}>{savedMsg}</div> : null}
        </div>
      </div>

      {err ? <div style={{ marginTop: 10, color: "rgba(255,160,160,0.95)" }}>{err}</div> : null}

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        <Card title="Send">
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ display: "grid", gap: 4 }}>
                <div style={{ fontWeight: 950 }}>Send this quote</div>
                <div style={{ fontSize: 12, opacity: 0.78, lineHeight: 1.35 }}>
                  {alreadySent
                    ? "This quote has already been sent. Re-sends won’t use any more free quota."
                    : "First send uses 1 free send. Re-sends of this same quote are free."}
                </div>
              </div>

              {!canSend ? (
                <span style={pillWarn()}>Limit reached</span>
              ) : (
                <span style={pillSoft()}>{alreadySent ? "Re-send" : "First send"}</span>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <button
                onClick={() => doSend("whatsapp")}
                disabled={!canSend || sending !== null}
                style={actionBtn("whatsapp", sending === "whatsapp")}
              >
                <div style={{ fontWeight: 950 }}>WhatsApp</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>{sending === "whatsapp" ? "Opening…" : "Fast send"}</div>
              </button>

              <button
                onClick={() => doSend("email")}
                disabled={!canSend || sending !== null}
                style={actionBtn("email", sending === "email")}
              >
                <div style={{ fontWeight: 950 }}>Email</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>{sending === "email" ? "Opening…" : "Gmail compose"}</div>
              </button>

              <button
                onClick={() => doSend("copy")}
                disabled={!canSend || sending !== null}
                style={actionBtn("copy", sending === "copy")}
              >
                <div style={{ fontWeight: 950 }}>Copy</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>{sending === "copy" ? "Copying…" : "Clipboard"}</div>
              </button>
            </div>

            {!canSend ? (
              <button onClick={() => setShowUpgrade(true)} style={btn("primary")}>
                Upgrade to send more
              </button>
            ) : null}
          </div>
        </Card>

        <Card title="Customer">
          <div style={{ display: "grid", gap: 10 }}>
            <Field label="Customer name">
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={input()} />
            </Field>
            <Field label="Address">
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} style={textarea()} rows={2} />
            </Field>
          </div>
        </Card>

        <Card title="Speech → Transcript">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "grid", gap: 2 }}>
              <div style={{ fontWeight: 950 }}>Speak or type here</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>{listening ? "Listening…" : "Tap the mic and speak — it appends here."}</div>
            </div>

            {!listening ? (
              <button onClick={startMic} style={btn("mic")}>🎙 Mic</button>
            ) : (
              <button onClick={stopMic} style={btn("danger")}>■ Stop</button>
            )}
          </div>

          <div style={{ marginTop: 10 }}>
            <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} style={textarea()} placeholder="Speak or type here…" rows={4} />
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
                      <div style={{ fontWeight: 950, opacity: 0.95 }}>Row: £{money(row)}</div>
                      <button onClick={() => removeLine(l.id)} style={btn("danger")}>Remove</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <MiniStat label="Subtotal" value={`£${money(totals.subtotal)}`} />
              <MiniStat label={vatEnabled ? `VAT (${Math.round(totals.vatRateNum * 100)}%)` : "VAT"} value={`£${money(totals.vatAmount)}`} />
              <MiniStat label={String(totalOverride || "").trim() ? "Total (manual)" : "Total"} value={`£${money(totals.effectiveTotal)}`} />
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
              <input value={totalOverride} onChange={(e) => setTotalOverride(e.target.value)} style={input()} inputMode="decimal" placeholder={money(totals.computedTotal)} />
            </Field>
          </div>
        </Card>

        <Card title="Notes">
          <Field label="Notes">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={textarea()} rows={3} />
          </Field>
        </Card>

        <Card title="Preview">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => navigator.clipboard.writeText(message)} style={btn("secondary")}>Copy preview text</button>
          </div>
          <pre style={preview()}>{message}</pre>
        </Card>

        <Card title="Activity">
          {activities.length === 0 ? (
            <div style={{ opacity: 0.8, fontSize: 13 }}>No activity yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {activities.slice(0, 20).map((a: any) => (
                <div key={a.id} style={activityRow()}>
                  <div style={{ fontWeight: 950 }}>
                    {a.type}
                    {a.channel ? <span style={{ opacity: 0.85 }}> • {a.channel}</span> : null}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>{new Date(a.at).toLocaleString("en-GB")}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Danger zone">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ opacity: 0.85 }}>Delete this quote permanently.</div>
            <button onClick={delQuote} style={btn("danger")}>Delete quote</button>
          </div>
        </Card>
      </div>

      <div style={stickyBar()}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
          <div style={{ display: "grid" }}>
            <div style={{ fontWeight: 950 }}>Total: £{money(totals.effectiveTotal)}</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              {alreadySent ? "Sent ✓ (re-sends don’t use quota)" : `Free sends left: ${remaining}/${FREE_QUOTE_LIMIT}`}
            </div>
          </div>
          <button disabled={saving} onClick={() => save()} style={btn("save")}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* UI bits */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={card()}>
      <div style={{ fontWeight: 950, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 12, opacity: 0.82 }}>{label}</div>
      {children}
    </label>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={miniStat()}>
      <div style={{ fontSize: 12, opacity: 0.82 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 950 }}>{value}</div>
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
    fontWeight: 950,
    cursor: "pointer",
    transition: "transform 120ms ease, background 120ms ease, border 120ms ease",
  };

  if (kind === "danger") return { ...base, border: "1px solid rgba(255,140,140,0.25)", background: "rgba(255,90,90,0.12)" };
  if (kind === "mic") return { ...base, border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.18)" };
  if (kind === "save") return { ...base, border: "1px solid rgba(34,197,94,0.40)", background: "rgba(34,197,94,0.22)" };
  if (kind === "primary") return { ...base, border: "1px solid rgba(90,140,255,0.35)", background: "rgba(90,140,255,0.18)" };
  return base;
}

function actionBtn(kind: "whatsapp" | "email" | "copy", busy: boolean) {
  const base: React.CSSProperties = {
    width: "100%",
    textAlign: "left",
    borderRadius: 14,
    padding: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(234,240,255,0.96)",
    cursor: "pointer",
    display: "grid",
    gap: 6,
    opacity: busy ? 0.9 : 1,
    transition: "transform 120ms ease, background 120ms ease, border 120ms ease",
  };

  if (kind === "whatsapp") return { ...base, border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.14)" };
  if (kind === "email") return { ...base, border: "1px solid rgba(90,140,255,0.35)", background: "rgba(90,140,255,0.14)" };
  return { ...base, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.06)" };
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
  return { ...input(), resize: "vertical" };
}

function topBar(): React.CSSProperties {
  return {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.25)",
  };
}

function card(): React.CSSProperties {
  return {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 18px 55px rgba(0,0,0,0.25)",
  };
}

function miniStat(): React.CSSProperties {
  return {
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 14,
    padding: 10,
    background: "rgba(0,0,0,0.22)",
  };
}

function pill(): React.CSSProperties {
  return {
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 950,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    opacity: 0.95,
  };
}

function pillSoft(): React.CSSProperties {
  return {
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 950,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.22)",
    opacity: 0.95,
  };
}

function pillGood(): React.CSSProperties {
  return {
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 950,
    border: "1px solid rgba(34,197,94,0.35)",
    background: "rgba(34,197,94,0.14)",
  };
}

function pillWarn(): React.CSSProperties {
  return {
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 950,
    border: "1px solid rgba(255,180,80,0.35)",
    background: "rgba(255,180,80,0.12)",
  };
}

function toggleRow(): React.CSSProperties {
  return {
    display: "flex",
    gap: 10,
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: "10px 12px",
    background: "rgba(0,0,0,0.18)",
    fontWeight: 950,
  };
}

function itemCard(): React.CSSProperties {
  return {
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 12,
    background: "rgba(0,0,0,0.18)",
  };
}

function miniLabel(): React.CSSProperties {
  return { fontSize: 12, opacity: 0.75, fontWeight: 850 };
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

function activityRow(): React.CSSProperties {
  return { padding: 10, borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.18)" };
}

function stickyBar(): React.CSSProperties {
  return {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    background: "rgba(7,11,20,0.92)",
    backdropFilter: "blur(10px)",
    borderTop: "1px solid rgba(255,255,255,0.10)",
  };
}

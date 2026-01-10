"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { db, QuoteLine, QuoteStatus } from "@/lib/db";
import { getCurrentUserId } from "@/lib/authUser";
import { getQuotesCreated, incrementQuotesCreated } from "@/lib/usage";
import UpgradeModal from "@/components/UpgradeModal";

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

type SpeechRec = any;

const FREE_QUOTE_LIMIT = 10;

export default function NewQuotePage() {
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<QuoteStatus>("draft");

  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const transcript = useMemo(
    () => `${finalTranscript} ${interimTranscript}`.replace(/\s+/g, " ").trim(),
    [finalTranscript, interimTranscript]
  );

  const [lines, setLines] = useState<QuoteLine[]>([
    { id: uid(), description: "Labour", qty: 1, unitPrice: 0 },
  ]);

  const [listening, setListening] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const recRef = useRef<SpeechRec | null>(null);

  // Paywall state (does NOT decrease when deleting quotes)
  const [userId, setUserId] = useState<string>("anon");
  const [quotesUsed, setQuotesUsed] = useState<number>(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const limitReached = quotesUsed >= FREE_QUOTE_LIMIT;

  useEffect(() => {
    let alive = true;

    async function init() {
      const uid = await getCurrentUserId();
      if (!alive) return;
      setUserId(uid);

      const used = await getQuotesCreated(uid);
      if (!alive) return;
      setQuotesUsed(used);
    }

    init();
    return () => {
      alive = false;
    };
  }, []);

  const canSave = useMemo(() => {
    if (saving) return false;
    if (limitReached) return false;
    if (!customerName.trim()) return false;
    const hasLine = lines.some((l) => (l.description ?? "").trim().length > 0);
    return hasLine;
  }, [saving, customerName, lines, limitReached]);

  function startMic() {
    setErr(null);
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setErr("Voice input not supported in this browser.");
        return;
      }
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-GB";

      rec.onresult = (e: any) => {
        let finalText = "";
        let interimText = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          const txt = r[0]?.transcript ?? "";
          if (r.isFinal) finalText += txt + " ";
          else interimText += txt + " ";
        }
        if (finalText.trim()) setFinalTranscript((prev) => `${prev} ${finalText}`.replace(/\s+/g, " ").trim());
        setInterimTranscript(interimText.replace(/\s+/g, " ").trim());
      };

      rec.onerror = () => setListening(false);

      rec.onend = () => {
        setListening(false);
        setInterimTranscript("");
      };

      recRef.current = rec;
      setListening(true);
      rec.start();
    } catch {
      setErr("Could not start microphone.");
      setListening(false);
    }
  }

  function stopMic() {
    try {
      recRef.current?.stop?.();
    } catch {}
    setListening(false);
    setInterimTranscript("");
  }

  useEffect(() => {
    return () => {
      try {
        recRef.current?.stop?.();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setErr(null);
    if (!canSave) return;

    try {
      setSaving(true);

      // Defensive paywall re-check (usage counter)
      const usedNow = await getQuotesCreated(userId);
      if (usedNow >= FREE_QUOTE_LIMIT) {
        setQuotesUsed(usedNow);
        setErr("You’ve reached your free limit. Upgrade to keep creating quotes.");
        setSaving(false);
        return;
      }

      const now = new Date().toISOString();

      const id = await db.quotes.add({
        userId,
        createdAt: now,
        updatedAt: now,
        customerName: customerName.trim(),
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
        status,
        lines: lines.map((l) => ({
          ...l,
          description: (l.description ?? "").trim(),
          qty: Number(l.qty) || 0,
          unitPrice: Number(l.unitPrice) || 0,
        })),
        transcript: transcript.trim() || undefined,
        source: transcript.trim() ? "voice" : "manual",
      });

      // increment usage after creation (does not decrease on delete)
      const nextUsed = await incrementQuotesCreated(userId);
      setQuotesUsed(nextUsed);

      window.location.href = `/app/quotes/${id}`;
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save quote.");
      setSaving(false);
    }
  }

  // Polished paywall screen
  if (limitReached) {
    return (
      <div style={{ display: "grid", gap: 12, maxWidth: 980 }}>
        <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} quotesUsed={quotesUsed} limit={FREE_QUOTE_LIMIT} />
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: -0.4 }}>
              Upgrade to Unlimited Quotes
            </div>
            <div style={{ opacity: 0.8, marginTop: 4 }}>
              You’ve reached your free limit.
            </div>
          </div>
          <a href="/app/quotes" style={ghostBtn}>← Back to Quotes</a>
        </div>

        <div style={upgradeCard}>
          <div style={{ fontWeight: 950, fontSize: 16 }}>Free plan used</div>
          <div style={{ opacity: 0.9, marginTop: 6, lineHeight: 1.55 }}>
            You’ve created <b>{FREE_QUOTE_LIMIT}</b> free quotes.
            Upgrade to keep creating and sending quotes without limits.
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <button type="button" style={upgradeBtn} onClick={() => setShowUpgrade(true)}>Upgrade to Unlimited</button>
            <a href="/app/quotes" style={softBtn}>View my quotes</a>
          </div>

          <div style={{ marginTop: 10, fontSize: 12.5, opacity: 0.7 }}>
            Usage: <b>{quotesUsed}</b> / <b>{FREE_QUOTE_LIMIT}</b>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 980 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: -0.4 }}>New quote</div>
          <div style={{ opacity: 0.75, marginTop: 4 }}>Voice → review → send.</div>
        </div>
        <a href="/app/quotes" style={ghostBtn}>← Back</a>
      </div>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 950 }}>Voice input (V1)</div>
            <div style={{ opacity: 0.75, marginTop: 4, fontSize: 13.5 }}>
              Tap mic, speak your quote, then edit the transcript if needed.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {!listening ? (
              <button onClick={startMic} style={primaryBtn}>🎤 Start mic</button>
            ) : (
              <button onClick={stopMic} style={dangerBtn}>■ Stop</button>
            )}
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ opacity: 0.75, fontSize: 12.5, marginBottom: 6 }}>Transcript</div>
          <textarea
            value={transcript}
            onChange={(e) => setFinalTranscript(e.target.value)}
            placeholder="Speak or type…"
            style={textarea}
            rows={4}
          />
        </div>
      </div>

      <div style={grid2}>
        <div style={card}>
          <div style={{ fontWeight: 950, marginBottom: 8 }}>Customer</div>
          <input style={input} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" />
          <input style={{ ...input, marginTop: 8 }} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address (optional)" />
          <textarea style={{ ...textarea, marginTop: 8 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={3} />
        </div>

        <div style={card}>
          <div style={{ fontWeight: 950, marginBottom: 8 }}>Status</div>
          <select style={input} value={status} onChange={(e) => setStatus(e.target.value as QuoteStatus)}>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
          </select>

          <div style={{ marginTop: 10, fontSize: 12.5, opacity: 0.75 }}>
            Free remaining: <b>{Math.max(0, FREE_QUOTE_LIMIT - quotesUsed)}</b> ({quotesUsed}/{FREE_QUOTE_LIMIT} used)
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontWeight: 950 }}>Line items</div>
          <button
            type="button"
            onClick={() => setLines((prev) => [...prev, { id: uid(), description: "", qty: 1, unitPrice: 0 }])}
            style={ghostSmallBtn}
          >
            + Add line
          </button>
        </div>

        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          {lines.map((l) => (
            <div key={l.id} style={lineRow}>
              <input
                style={{ ...input, flex: 1 }}
                value={l.description}
                onChange={(e) => setLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, description: e.target.value } : x)))}
                placeholder="Description"
              />
              <input
                style={{ ...input, width: 90 }}
                value={String(l.qty)}
                onChange={(e) => setLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, qty: Number(e.target.value) || 0 } : x)))}
                placeholder="Qty"
                inputMode="numeric"
              />
              <input
                style={{ ...input, width: 120 }}
                value={String(l.unitPrice)}
                onChange={(e) => setLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, unitPrice: Number(e.target.value) || 0 } : x)))}
                placeholder="£"
                inputMode="decimal"
              />
              <button
                type="button"
                onClick={() => setLines((prev) => prev.filter((x) => x.id !== l.id))}
                style={iconBtn}
                aria-label="Remove line"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {err && <div style={errBox}>{err}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
        <a href="/app/quotes" style={ghostBtn}>Cancel</a>
        <button onClick={save} style={{ ...primaryBtn, ...(canSave ? {} : disabledBtn) }} disabled={!canSave}>
          {saving ? "Saving…" : "Save quote"}
        </button>
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
};

const upgradeCard: React.CSSProperties = {
  padding: 16,
  borderRadius: 16,
  border: "1px solid rgba(255,168,76,0.35)",
  background: "linear-gradient(135deg, rgba(255,168,76,0.16), rgba(255,214,170,0.08))",
};

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.8fr",
  gap: 10,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  background: "rgba(0,0,0,0.22)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "rgba(234,240,255,0.92)",
  outline: "none",
};

const textarea: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  background: "rgba(0,0,0,0.22)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "rgba(234,240,255,0.92)",
  outline: "none",
  resize: "vertical",
};

const lineRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  flexWrap: "wrap",
};

const errBox: React.CSSProperties = {
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(248,113,113,0.35)",
  background: "rgba(248,113,113,0.12)",
  color: "rgba(254,226,226,0.95)",
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
  cursor: "pointer",
};

const disabledBtn: React.CSSProperties = {
  opacity: 0.45,
  cursor: "not-allowed",
};

const ghostBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  borderRadius: 14,
  fontWeight: 850,
  textDecoration: "none",
  color: "rgba(234,240,255,0.90)",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const ghostSmallBtn: React.CSSProperties = {
  ...ghostBtn,
  padding: "8px 10px",
  borderRadius: 12,
  fontSize: 12.5,
};

const iconBtn: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "rgba(234,240,255,0.92)",
  cursor: "pointer",
  fontSize: 18,
  lineHeight: "40px",
};

const dangerBtn: React.CSSProperties = {
  ...primaryBtn,
  color: "rgba(234,240,255,0.94)",
  background: "rgba(255,90,90,0.16)",
  border: "1px solid rgba(255,90,90,0.25)",
};

const upgradeBtn: React.CSSProperties = {
  ...primaryBtn,
};

const softBtn: React.CSSProperties = {
  ...ghostBtn,
  background: "rgba(0,0,0,0.18)",
};

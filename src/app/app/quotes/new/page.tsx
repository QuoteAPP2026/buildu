"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { db, QuoteLine, QuoteStatus } from "@/lib/db";

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

type SpeechRec = any;

export default function NewQuotePage() {
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<QuoteStatus>("draft");

  // Voice (fixed: final vs interim)
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const transcript = useMemo(
    () => `${finalTranscript} ${interimTranscript}`.replace(/\s+/g, " ").trim(),
    [finalTranscript, interimTranscript]
  );

  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recRef = useRef<SpeechRec | null>(null);

  const [lines, setLines] = useState<QuoteLine[]>([
    { id: uid(), description: "Labour", qty: 1, unitPrice: 0 },
  ]);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const total = useMemo(() => {
    return lines.reduce((sum, l) => sum + (Number(l.qty) || 0) * (Number(l.unitPrice) || 0), 0);
  }, [lines]);

  const canSave = useMemo(() => customerName.trim().length >= 2 && !saving, [customerName, saving]);

  function updateLine(id: string, patch: Partial<QuoteLine>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, { id: uid(), description: "", qty: 1, unitPrice: 0 }]);
  }

  function removeLine(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  function supportsSpeech() {
    const w = window as any;
    return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
  }

  function clearTranscript() {
    setFinalTranscript("");
    setInterimTranscript("");
  }

  function startMic() {
    setVoiceError(null);

    if (!supportsSpeech()) {
      setVoiceError("Voice input not supported in this browser. Use Chrome on Android/desktop.");
      return;
    }

    try {
      const w = window as any;
      const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;

      const rec = new SpeechRecognition();
      recRef.current = rec;

      rec.lang = "en-GB";
      rec.interimResults = true;
      rec.continuous = true;

      rec.onresult = (event: any) => {
        let final = "";
        let interim = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const text = (res[0]?.transcript ?? "").trim();
          if (!text) continue;
          if (res.isFinal) final += text + " ";
          else interim += text + " ";
        }

        if (final) setFinalTranscript((p) => (p + " " + final).replace(/\s+/g, " ").trim());
        setInterimTranscript(interim.trim());
      };

      rec.onerror = (e: any) => {
        setVoiceError(e?.error ? `Voice error: ${e.error}` : "Voice error.");
        setListening(false);
      };

      rec.onend = () => {
        setFinalTranscript((p) => `${p} ${interimTranscript}`.replace(/\s+/g, " ").trim());
        setInterimTranscript("");
        setListening(false);
      };

      rec.start();
      setListening(true);
    } catch (e: any) {
      setVoiceError(e?.message ?? "Could not start voice input.");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setErr(null);
    if (!canSave) return;

    try {
      setSaving(true);
      const now = new Date().toISOString();

      const id = await db.quotes.add({
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

      window.location.href = `/app/quotes/${id}`;
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save quote.");
      setSaving(false);
    }
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

      {/* Voice card */}
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
              <button onClick={stopMic} style={dangerBtn}>⏹ Stop mic</button>
            )}
            <button onClick={clearTranscript} style={secondaryBtn}>Clear</button>
          </div>
        </div>

        {voiceError ? <div style={errorBox}>{voiceError}</div> : null}

        <label style={{ display: "grid", gap: 6, marginTop: 10 }}>
          <div style={{ fontSize: 12.5, opacity: 0.78, fontWeight: 850 }}>Transcript (editable)</div>
          <textarea
            value={transcript}
            onChange={(e) => {
              setFinalTranscript(e.target.value);
              setInterimTranscript("");
            }}
            style={textarea}
            placeholder="Your voice transcript will appear here…"
          />
        </label>
      </div>

      {/* Quote details card */}
      <div style={card}>
        <div style={grid2}>
          <Field label="Customer name *">
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={input} />
          </Field>

          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} style={select}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
            </select>
          </Field>

          <Field label="Address">
            <input value={address} onChange={(e) => setAddress(e.target.value)} style={input} />
          </Field>

          <Field label="Notes">
            <input value={notes} onChange={(e) => setNotes(e.target.value)} style={input} placeholder="Optional" />
          </Field>
        </div>

        <div style={{ marginTop: 6, fontWeight: 950 }}>Line items</div>

        <div style={linesWrap}>
          <div style={linesHead}>
            <div>Description</div>
            <div>Qty</div>
            <div>Unit (£)</div>
            <div>Total (£)</div>
            <div></div>
          </div>

          {lines.map((l) => {
            const lineTotal = (Number(l.qty) || 0) * (Number(l.unitPrice) || 0);
            return (
              <div key={l.id} style={lineRow}>
                <input
                  value={l.description}
                  onChange={(e) => updateLine(l.id, { description: e.target.value })}
                  style={input}
                  placeholder="e.g. Materials, Labour, Skip hire…"
                />
                <input
                  value={String(l.qty)}
                  onChange={(e) => updateLine(l.id, { qty: Number(e.target.value) })}
                  style={input}
                  inputMode="numeric"
                />
                <input
                  value={String(l.unitPrice)}
                  onChange={(e) => updateLine(l.id, { unitPrice: Number(e.target.value) })}
                  style={input}
                  inputMode="decimal"
                />
                <div style={{ fontWeight: 950, opacity: 0.92 }}>£{formatMoney(lineTotal)}</div>
                <button
                  onClick={() => removeLine(l.id)}
                  disabled={lines.length <= 1}
                  style={{ ...smallBtn, opacity: lines.length <= 1 ? 0.5 : 1 }}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <button onClick={addLine} style={secondaryBtn}>+ Add line</button>
          <div style={{ fontWeight: 980, fontSize: 18 }}>Total: £{formatMoney(total)}</div>
        </div>

        {err ? <div style={errorBox}>{err}</div> : null}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <button onClick={save} disabled={!canSave} style={{ ...primaryBtn, opacity: canSave ? 1 : 0.55 }}>
            {saving ? "Saving…" : "Save quote"}
          </button>
          <a href="/app/quotes" style={ghostBtn}>Cancel</a>
        </div>
      </div>
    </div>
  );
}

function formatMoney(n: number) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 12.5, opacity: 0.78, fontWeight: 850 }}>{label}</div>
      {children}
    </label>
  );
}

const card: React.CSSProperties = {
  padding: 14,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  display: "grid",
  gap: 12,
};

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const input: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 14,
  background: "rgba(0,0,0,0.20)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "rgba(234,240,255,0.92)",
  outline: "none",
};

const select: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 14,
  background: "rgba(0,0,0,0.20)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "rgba(234,240,255,0.92)",
  outline: "none",
};

const textarea: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 14,
  minHeight: 120,
  resize: "vertical",
  background: "rgba(0,0,0,0.20)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "rgba(234,240,255,0.92)",
  outline: "none",
};

const linesWrap: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.12)",
  overflow: "hidden",
};

const linesHead: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.4fr 0.5fr 0.7fr 0.7fr 0.6fr",
  gap: 10,
  padding: "10px 12px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  fontSize: 12.5,
  opacity: 0.8,
  fontWeight: 850,
};

const lineRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.4fr 0.5fr 0.7fr 0.7fr 0.6fr",
  gap: 10,
  padding: "10px 12px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  alignItems: "center",
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

const secondaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  borderRadius: 14,
  fontWeight: 900,
  color: "rgba(234,240,255,0.90)",
  background: "rgba(0,0,0,0.18)",
  border: "1px solid rgba(255,255,255,0.12)",
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  textDecoration: "none",
  color: "rgba(234,240,255,0.82)",
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.12)",
  fontWeight: 900,
};

const smallBtn: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.16)",
  color: "rgba(234,240,255,0.88)",
  fontWeight: 850,
  cursor: "pointer",
};

const dangerBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,90,90,0.22)",
  background: "rgba(255,90,90,0.10)",
  color: "rgba(234,240,255,0.92)",
  fontWeight: 950,
  cursor: "pointer",
};

const errorBox: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 14,
  background: "rgba(255,90,90,0.12)",
  border: "1px solid rgba(255,90,90,0.22)",
};

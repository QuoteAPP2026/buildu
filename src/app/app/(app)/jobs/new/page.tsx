"use client";

import React, { useMemo, useState } from "react";
import { db, JobStage } from "@/lib/db";

export default function NewJobPage() {
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [stage, setStage] = useState<JobStage>("booked");
  const [scheduledFor, setScheduledFor] = useState(""); // datetime-local

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSave = useMemo(() => customerName.trim().length >= 2 && !saving, [customerName, saving]);

  async function save() {
    setErr(null);
    if (!canSave) return;

    try {
      setSaving(true);
      const now = new Date().toISOString();

      const schedIso = scheduledFor ? new Date(scheduledFor).toISOString() : undefined;

      const id = await db.jobs.add({
        createdAt: now,
        updatedAt: now,
        customerName: customerName.trim(),
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
        stage,
        scheduledFor: schedIso,
      });

      window.location.href = `/app/jobs/${id}`;
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save job.");
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 820 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: -0.4 }}>New job</div>
          <div style={{ opacity: 0.75, marginTop: 4 }}>Create a job and track it end-to-end.</div>
        </div>
        <a href="/app/jobs" style={ghostBtn}>← Back</a>
      </div>

      <div style={card}>
        <div style={grid2}>
          <Field label="Customer name *">
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={input} />
          </Field>

          <Field label="Stage">
            <select value={stage} onChange={(e) => setStage(e.target.value as any)} style={select}>
              <option value="booked">Booked</option>
              <option value="on_site">On site</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="invoiced">Invoiced</option>
            </select>
          </Field>

          <Field label="Scheduled for">
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              style={input}
            />
          </Field>

          <Field label="Address">
            <input value={address} onChange={(e) => setAddress(e.target.value)} style={input} />
          </Field>
        </div>

        <Field label="Notes">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={textarea} />
        </Field>

        {err ? <div style={errorBox}>{err}</div> : null}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <button onClick={save} disabled={!canSave} style={{ ...primaryBtn, opacity: canSave ? 1 : 0.55 }}>
            {saving ? "Saving…" : "Save job"}
          </button>
          <a href="/app/jobs" style={secondaryBtn}>Cancel</a>
        </div>
      </div>
    </div>
  );
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
  minHeight: 110,
  resize: "vertical",
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
  textDecoration: "none",
  color: "rgba(234,240,255,0.90)",
  background: "rgba(0,0,0,0.18)",
  border: "1px solid rgba(255,255,255,0.12)",
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

const errorBox: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 14,
  background: "rgba(255,90,90,0.12)",
  border: "1px solid rgba(255,90,90,0.22)",
};

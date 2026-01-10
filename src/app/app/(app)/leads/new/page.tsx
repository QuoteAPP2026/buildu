"use client";

import React, { useMemo, useState } from "react";
import { db, LeadStatus } from "@/lib/db";

export default function NewLeadPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [jobType, setJobType] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSave = useMemo(() => name.trim().length >= 2 && !saving, [name, saving]);

  async function save() {
    setErr(null);
    if (!canSave) return;

    try {
      setSaving(true);
      const now = new Date().toISOString();
      const id = await db.leads.add({
        createdAt: now,
        updatedAt: now,
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        jobType: jobType.trim() || undefined,
        notes: notes.trim() || undefined,
        status,
      });

      window.location.href = `/app/leads/${id}`;
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save lead.");
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: -0.4 }}>New lead</div>
          <div style={{ opacity: 0.75, marginTop: 4 }}>Capture it fast. You can tidy later.</div>
        </div>
        <a href="/app/leads" style={ghostBtn}>← Back</a>
      </div>

      <div style={card}>
        <div style={grid2}>
          <Field label="Name *">
            <input value={name} onChange={(e) => setName(e.target.value)} style={input} placeholder="Customer name" />
          </Field>

          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)} style={select}>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="quoted">Quoted</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </Field>

          <Field label="Phone">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} style={input} placeholder="07..." />
          </Field>

          <Field label="Email">
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={input} placeholder="name@email.com" />
          </Field>

          <Field label="Job type">
            <input value={jobType} onChange={(e) => setJobType(e.target.value)} style={input} placeholder="e.g. Extension, Boiler, Rewire" />
          </Field>

          <Field label="Address">
            <input value={address} onChange={(e) => setAddress(e.target.value)} style={input} placeholder="Site address" />
          </Field>
        </div>

        <Field label="Notes">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={textarea} placeholder="What do they want? Any details…" />
        </Field>

        {err ? (
          <div style={{ padding: "10px 12px", borderRadius: 14, background: "rgba(255,90,90,0.12)", border: "1px solid rgba(255,90,90,0.22)" }}>
            {err}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <button onClick={save} disabled={!canSave} style={{ ...primaryBtn, opacity: canSave ? 1 : 0.55 }}>
            {saving ? "Saving…" : "Save lead"}
          </button>
          <a href="/app/leads" style={secondaryBtn}>Cancel</a>
        </div>

        <div style={{ marginTop: 10, opacity: 0.7, fontSize: 13.5 }}>
          Tip: works offline — saved on this device.
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
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
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
  textDecoration: "none",
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

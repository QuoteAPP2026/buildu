"use client";

import React, { useEffect, useMemo, useState } from "react";
import { db, Settings } from "@/lib/db";

export default function SettingsPage() {
  const [loaded, setLoaded] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [terms, setTerms] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      const s = await db.settings.get("default");
      if (!alive) return;

      setBusinessName(s?.businessName ?? "");
      setPhone(s?.phone ?? "");
      setEmail(s?.email ?? "");
      setAddress(s?.address ?? "");
      setTerms(s?.terms ?? defaultTerms);

      setLoaded(true);
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const canSave = useMemo(() => loaded && !saving, [loaded, saving]);

  async function save() {
    if (!canSave) return;
    setSaving(true);
    setMsg(null);

    const now = new Date().toISOString();
    const payload: Settings = {
      id: "default",
      businessName: businessName.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      terms: terms.trim() || undefined,
      updatedAt: now,
    };

    await db.settings.put(payload);
    setSaving(false);
    setMsg("Saved ✓");
    setTimeout(() => setMsg(null), 1200);
  }

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: -0.4 }}>Settings</div>
          <div style={{ opacity: 0.75, marginTop: 4 }}>Quote template defaults (V1).</div>
        </div>
        <a href="/app" style={ghostBtn}>← Back</a>
      </div>

      <div style={card}>
        <div style={grid2}>
          <Field label="Business name">
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} style={input} placeholder="e.g. BuildU Roofing" />
          </Field>

          <Field label="Phone">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} style={input} placeholder="e.g. 07..." />
          </Field>

          <Field label="Email">
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={input} placeholder="e.g. hello@..." />
          </Field>

          <Field label="Business address">
            <input value={address} onChange={(e) => setAddress(e.target.value)} style={input} placeholder="Optional" />
          </Field>
        </div>

        <Field label="Default terms (shown in messages / later on PDF)">
          <textarea value={terms} onChange={(e) => setTerms(e.target.value)} style={textarea} />
        </Field>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={save} disabled={!canSave} style={{ ...primaryBtn, opacity: canSave ? 1 : 0.55 }}>
            {saving ? "Saving…" : "Save settings"}
          </button>
          {msg ? <div style={{ opacity: 0.85, fontWeight: 900 }}>{msg}</div> : null}
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

const defaultTerms =
  "• Quote valid for 14 days.\n" +
  "• Payment due on completion unless agreed otherwise.\n" +
  "• Any additional work will be quoted before proceeding.\n" +
  "• Materials subject to availability.";

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

const textarea: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 14,
  minHeight: 140,
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

const ghostBtn: React.CSSProperties = {
  textDecoration: "none",
  color: "rgba(234,240,255,0.82)",
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.12)",
  fontWeight: 900,
};

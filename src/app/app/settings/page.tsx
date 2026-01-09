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
    return () => { alive = false; };
  }, []);

  const canSave = useMemo(() => loaded && !saving, [loaded, saving]);

  async function save() {
    if (!canSave) return;
    setSaving(true);
    setMsg(null);

    const payload: Settings = {
      id: "default",
      businessName: businessName.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      terms: terms.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    await db.settings.put(payload);
    setSaving(false);
    setMsg("Saved ✓");
    setTimeout(() => setMsg(null), 1200);
  }

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <style>{`
        .top{ display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; align-items:flex-end; }
        .h1{ font-size:22px; font-weight:950; letter-spacing:-0.4px; }
        .sub{ opacity:0.75; margin-top:4px; }
        .card{ padding:14px; border-radius:18px; border:1px solid rgba(255,255,255,0.10); background:rgba(255,255,255,0.03); display:grid; gap:12px; }
        .grid{
          display:grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap:12px;
        }
        @media (max-width: 860px){
          .grid{ grid-template-columns: 1fr; }
        }
        .label{ font-size:12.5px; opacity:0.78; font-weight:850; margin-bottom:6px; }
        .input, .textarea{
          width:100%;
          padding:12px 12px;
          border-radius:16px;
          background:rgba(0,0,0,0.22);
          border:1px solid rgba(255,255,255,0.12);
          color:rgba(234,240,255,0.92);
          outline:none;
        }
        .textarea{ min-height:140px; resize:vertical; }
        .btnPrimary{
          display:inline-flex; align-items:center; justify-content:center;
          padding:12px 14px; border-radius:16px; font-weight:950;
          color:#0B0F1D;
          background:linear-gradient(135deg, rgba(255,168,76,1), rgba(255,214,170,1));
          border:1px solid rgba(255,255,255,0.16);
          cursor:pointer;
          width: fit-content;
        }
        @media (max-width: 860px){ .btnPrimary{ width: 100%; } }
      `}</style>

      <div className="top">
        <div>
          <div className="h1">Settings</div>
          <div className="sub">Quote template defaults (V1).</div>
        </div>
      </div>

      <div className="card">
        <div className="grid">
          <Field label="Business name">
            <input className="input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. BuildU Roofing" />
          </Field>

          <Field label="Phone">
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 07…" />
          </Field>

          <Field label="Email">
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. hello@…" />
          </Field>

          <Field label="Business address">
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Optional" />
          </Field>
        </div>

        <Field label="Default terms (shown in messages / later on PDF)">
          <textarea className="textarea" value={terms} onChange={(e) => setTerms(e.target.value)} />
        </Field>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" onClick={save} disabled={!canSave} className="btnPrimary" style={{ opacity: canSave ? 1 : 0.55 }}>
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

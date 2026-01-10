"use client";

import React, { useEffect, useMemo, useState } from "react";
import { db, Lead, LeadStatus } from "@/lib/db";

export default function LeadDetailPage(props: any) {
  // Fallback-proof ID:
  // 1) try Next params
  // 2) fallback to window.location pathname
  const idFromParams = props?.params?.id;
  const [id, setId] = useState<number | null>(() => {
    const n = Number(idFromParams);
    return Number.isFinite(n) ? n : null;
  });

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [jobType, setJobType] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<LeadStatus>("new");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // If params didn't give us an ID, parse from the URL:
    if (id !== null) return;

    const path = window.location.pathname; // e.g. /app/leads/12
    const last = path.split("/").filter(Boolean).pop(); // "12"
    const n = Number(last);

    if (last === "new") {
      window.location.href = "/app/leads/new";
      return;
    }

    setId(Number.isFinite(n) ? n : null);
  }, [id]);

  useEffect(() => {
    let alive = true;

    async function load(leadId: number) {
      setLoading(true);
      const found = await db.leads.get(leadId);
      if (!alive) return;

      setLead(found ?? null);
      if (found) {
        setName(found.name ?? "");
        setPhone(found.phone ?? "");
        setEmail(found.email ?? "");
        setAddress(found.address ?? "");
        setJobType(found.jobType ?? "");
        setNotes(found.notes ?? "");
        setStatus(found.status ?? "new");
      }
      setLoading(false);
    }

    if (id !== null) load(id);
    else setLoading(false);

    return () => {
      alive = false;
    };
  }, [id]);

  const canSave = useMemo(() => {
    if (!lead) return false;
    if (saving) return false;
    return name.trim().length >= 2;
  }, [lead, saving, name]);

  async function save() {
    if (!lead || id === null) return;
    setErr(null);
    if (!canSave) return;

    try {
      setSaving(true);
      const now = new Date().toISOString();

      await db.leads.update(id, {
        updatedAt: now,
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        jobType: jobType.trim() || undefined,
        notes: notes.trim() || undefined,
        status,
      });

      const refreshed = await db.leads.get(id);
      setLead(refreshed ?? null);
      setSaving(false);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save changes.");
      setSaving(false);
    }
  }

  async function remove() {
    if (!lead || id === null) return;
    const ok = window.confirm("Delete this lead? This cannot be undone.");
    if (!ok) return;

    await db.leads.delete(id);
    window.location.href = "/app/leads";
  }

  if (id === null) {
    return (
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ fontSize: 18, fontWeight: 900 }}>Invalid lead ID.</div>
        <div style={{ opacity: 0.75 }}>Go back to your leads list.</div>
        <a href="/app/leads" style={ghostBtn}>← Back to Leads</a>
      </div>
    );
  }

  if (loading) return <div style={{ opacity: 0.75 }}>Loading…</div>;

  if (!lead) {
    return (
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 950 }}>Lead not found</div>
        <div style={{ opacity: 0.75 }}>It may have been deleted.</div>
        <a href="/app/leads" style={ghostBtn}>← Back to Leads</a>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 820 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: -0.4 }}>{lead.name}</div>
          <div style={{ opacity: 0.75, marginTop: 4 }}>
            Created: {formatDate(lead.createdAt)} • Updated: {formatDate(lead.updatedAt)}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="/app/leads" style={ghostBtn}>← Back</a>
          <button onClick={remove} style={dangerBtn}>Delete</button>
        </div>
      </div>

      <div style={card}>
        <div style={grid2}>
          <Field label="Name *">
            <input value={name} onChange={(e) => setName(e.target.value)} style={input} />
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
            <input value={phone} onChange={(e) => setPhone(e.target.value)} style={input} />
          </Field>

          <Field label="Email">
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={input} />
          </Field>

          <Field label="Job type">
            <input value={jobType} onChange={(e) => setJobType(e.target.value)} style={input} />
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
            {saving ? "Saving…" : "Save changes"}
          </button>

          <button
            onClick={async () => {
              if (id === null) return;
              const now = new Date().toISOString();
              const quoteId = await db.quotes.add({
                createdAt: now,
                updatedAt: now,
                leadId: id,
                customerName: (name || lead.name || "").trim() || "Customer",
                address: (address || lead.address || "").trim() || undefined,
                notes: undefined,
                status: "draft",
                lines: [
                  {
                    id: Math.random().toString(16).slice(2) + "-" + Date.now().toString(16),
                    description: "Labour",
                    qty: 1,
                    unitPrice: 0,
                  },
                ],
              });
              await db.leads.update(id, { status: "quoted", updatedAt: now });
              window.location.href = `/app/quotes/`;
            }}
            style={secondaryBtn}
          >
            Convert to quote (next)
          </button>
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

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
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

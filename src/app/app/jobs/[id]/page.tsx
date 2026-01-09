"use client";

import React, { useEffect, useMemo, useState } from "react";
import { db, Job, JobStage } from "@/lib/db";

export default function JobDetailPage(props: any) {
  const idFromParams = props?.params?.id;
  const [id, setId] = useState<number | null>(() => {
    const n = Number(idFromParams);
    return Number.isFinite(n) ? n : null;
  });

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [stage, setStage] = useState<JobStage>("booked");
  const [scheduledFor, setScheduledFor] = useState(""); // datetime-local

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (id !== null) return;

    const path = window.location.pathname; // /app/jobs/12
    const last = path.split("/").filter(Boolean).pop();
    const n = Number(last);

    if (last === "new") {
      window.location.href = "/app/jobs/new";
      return;
    }

    setId(Number.isFinite(n) ? n : null);
  }, [id]);

  useEffect(() => {
    let alive = true;

    async function load(jid: number) {
      setLoading(true);
      const found = await db.jobs.get(jid);
      if (!alive) return;

      setJob(found ?? null);
      if (found) {
        setCustomerName(found.customerName ?? "");
        setAddress(found.address ?? "");
        setNotes(found.notes ?? "");
        setStage(found.stage ?? "booked");

        // convert ISO -> datetime-local
        if (found.scheduledFor) {
          const d = new Date(found.scheduledFor);
          if (!Number.isNaN(d.getTime())) {
            const pad = (x: number) => String(x).padStart(2, "0");
            const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            setScheduledFor(local);
          }
        } else {
          setScheduledFor("");
        }
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
    if (!job) return false;
    if (saving) return false;
    return customerName.trim().length >= 2;
  }, [job, saving, customerName]);

  async function save() {
    if (!job || id === null) return;
    setErr(null);
    if (!canSave) return;

    try {
      setSaving(true);
      const now = new Date().toISOString();
      const schedIso = scheduledFor ? new Date(scheduledFor).toISOString() : undefined;

      await db.jobs.update(id, {
        updatedAt: now,
        customerName: customerName.trim(),
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
        stage,
        scheduledFor: schedIso,
      });

      const refreshed = await db.jobs.get(id);
      setJob(refreshed ?? null);
      setSaving(false);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save job.");
      setSaving(false);
    }
  }

  async function remove() {
    if (!job || id === null) return;
    const ok = window.confirm("Delete this job? This cannot be undone.");
    if (!ok) return;

    await db.jobs.delete(id);
    window.location.href = "/app/jobs";
  }

  if (id === null) {
    return (
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ fontSize: 18, fontWeight: 900 }}>Invalid job ID.</div>
        <a href="/app/jobs" style={ghostBtn}>← Back to Jobs</a>
      </div>
    );
  }

  if (loading) return <div style={{ opacity: 0.75 }}>Loading…</div>;

  if (!job) {
    return (
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 950 }}>Job not found</div>
        <div style={{ opacity: 0.75 }}>It may have been deleted.</div>
        <a href="/app/jobs" style={ghostBtn}>← Back to Jobs</a>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 880 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: -0.4 }}>
            Job • {job.customerName}
          </div>
          <div style={{ opacity: 0.75, marginTop: 4 }}>
            Created: {formatDate(job.createdAt)} • Updated: {formatDate(job.updatedAt)}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="/app/jobs" style={ghostBtn}>← Back</a>
          <button onClick={remove} style={dangerBtn}>Delete</button>
        </div>
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
            {saving ? "Saving…" : "Save changes"}
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

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getCurrentUserId } from "@/lib/authUser";
import { getQuotesCreated } from "@/lib/usage";

const FREE_QUOTE_LIMIT = 10;
const LS_KEY = "buildu:businessProfile";

type BusinessProfile = {
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  footerNote: string;
};

const emptyProfile: BusinessProfile = {
  businessName: "",
  contactName: "",
  phone: "",
  email: "",
  address: "",
  footerNote: "",
};

export default function SettingsPage() {
  const [quotesUsed, setQuotesUsed] = useState(0);
  const [userLabel, setUserLabel] = useState("—");

  const [profile, setProfile] = useState<BusinessProfile>(emptyProfile);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const remaining = Math.max(0, FREE_QUOTE_LIMIT - quotesUsed);
  const limitReached = quotesUsed >= FREE_QUOTE_LIMIT;

  const completeness = useMemo(() => {
    // lightweight “is it filled in” signal
    const keys: (keyof BusinessProfile)[] = ["businessName", "phone", "email"];
    const filled = keys.filter((k) => (profile[k] || "").trim().length > 0).length;
    return { filled, total: keys.length };
  }, [profile]);

  useEffect(() => {
    // Load business profile from localStorage (no backend changes)
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<BusinessProfile>;
        setProfile({ ...emptyProfile, ...parsed });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadUsage() {
      const uid = await getCurrentUserId();
      if (!alive) return;

      setUserLabel(uid === "anon" ? "Not signed in" : "Signed in");

      const used = await getQuotesCreated(uid);
      if (!alive) return;
      setQuotesUsed(used);
    }

    loadUsage();
    const t = setInterval(loadUsage, 2500);

    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  function saveProfile() {
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(profile));
      setSavedToast("Saved");
      window.setTimeout(() => setSavedToast(null), 1200);
    } catch {
      setSavedToast("Couldn’t save");
      window.setTimeout(() => setSavedToast(null), 1400);
    }
  }

  function resetProfile() {
    setProfile(emptyProfile);
    try {
      window.localStorage.removeItem(LS_KEY);
    } catch {
      // ignore
    }
    setSavedToast("Reset");
    window.setTimeout(() => setSavedToast(null), 1200);
  }

  return (
    <div style={{ display: "grid", gap: 14, maxWidth: 980 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: -0.4 }}>Settings</div>
        <div style={{ opacity: 0.75, marginTop: 4 }}>
          Business details for your quotes, plus your plan status.
        </div>
      </div>

      {/* Business profile */}
      <section style={card}>
        <div style={sectionHeadRow}>
          <div>
            <div style={sectionTitle}>Business details</div>
            <div style={sectionSub}>
              These details are used on your quotes. Fill in the basics so every quote looks professional.
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <div style={pill}>
              Profile: <b>{completeness.filled}</b> / <b>{completeness.total}</b> essentials
            </div>
            {savedToast ? <div style={toast}>{savedToast}</div> : null}
          </div>
        </div>

        <div style={grid2}>
          <Field
            label="Business name"
            placeholder="e.g. Evans Plumbing Ltd"
            value={profile.businessName}
            onChange={(v) => setProfile((p) => ({ ...p, businessName: v }))}
          />
          <Field
            label="Contact name"
            placeholder="e.g. Jamie Evans"
            value={profile.contactName}
            onChange={(v) => setProfile((p) => ({ ...p, contactName: v }))}
          />
          <Field
            label="Phone"
            placeholder="e.g. 07xxx xxxxxx"
            value={profile.phone}
            onChange={(v) => setProfile((p) => ({ ...p, phone: v }))}
          />
          <Field
            label="Email"
            placeholder="e.g. quotes@yourbusiness.co.uk"
            value={profile.email}
            onChange={(v) => setProfile((p) => ({ ...p, email: v }))}
          />
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          <TextArea
            label="Address"
            placeholder={"e.g.\n1 High Street\nCarmarthen\nSA31 ..."}
            value={profile.address}
            onChange={(v) => setProfile((p) => ({ ...p, address: v }))}
          />
          <TextArea
            label="Footer note (optional)"
            placeholder="e.g. Thank you for your business. Payment due within 7 days."
            value={profile.footerNote}
            onChange={(v) => setProfile((p) => ({ ...p, footerNote: v }))}
          />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <button style={primaryBtn} type="button" onClick={saveProfile}>
            Save details
          </button>
          <button style={ghostBtnButton} type="button" onClick={resetProfile}>
            Reset
          </button>
        </div>

        <div style={{ marginTop: 10, fontSize: 12.5, opacity: 0.65 }}>
          Tip: even if you’re at the free limit, you can still update your details here.
        </div>
      </section>

      {/* Plan */}
      <section style={card}>
        <div style={sectionHeadRow}>
          <div>
            <div style={sectionTitle}>Plan</div>
            <div style={sectionSub}>Usage and upgrade status.</div>
          </div>
          <div style={pill}>
            Status: <b>{userLabel}</b>
          </div>
        </div>

        {!limitReached ? (
          <div style={{ opacity: 0.88, lineHeight: 1.55, marginTop: 6 }}>
            <b>Free</b> — {FREE_QUOTE_LIMIT} quotes included.
            <div style={{ marginTop: 6 }}>
              Used: <b>{quotesUsed}</b> • Remaining: <b>{remaining}</b>
            </div>
          </div>
        ) : (
          <div style={{ opacity: 0.88, lineHeight: 1.55, marginTop: 6 }}>
            <b>Free limit reached</b> — you’ve used <b>{quotesUsed}</b> / <b>{FREE_QUOTE_LIMIT}</b>.
            <div style={{ marginTop: 6 }}>Upgrade to unlock unlimited quotes.</div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <button
            style={primaryBtn}
            type="button"
            onClick={() => alert("Stripe coming next — this is the upgrade placeholder.")}
          >
            Upgrade (coming)
          </button>
          <a style={ghostLink} href="/app/quotes">
            View quotes
          </a>
        </div>
      </section>
    </div>
  );
}

function Field(props: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={label}>{props.label}</div>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        style={input}
        inputMode="text"
        autoComplete="off"
      />
    </label>
  );
}

function TextArea(props: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={label}>{props.label}</div>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        style={textarea}
        rows={3}
      />
    </label>
  );
}

const card: React.CSSProperties = {
  padding: 14,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
};

const sectionHeadRow: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const sectionTitle: React.CSSProperties = {
  fontWeight: 950,
  letterSpacing: -0.25,
  fontSize: 14.5,
};

const sectionSub: React.CSSProperties = {
  opacity: 0.72,
  fontSize: 12.5,
  marginTop: 4,
  lineHeight: 1.35,
  maxWidth: 620,
};

const pill: React.CSSProperties = {
  fontSize: 12.5,
  padding: "7px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.18)",
  color: "rgba(234,240,255,0.86)",
};

const toast: React.CSSProperties = {
  fontSize: 12.5,
  padding: "7px 10px",
  borderRadius: 999,
  border: "1px solid rgba(59,130,246,0.30)",
  background: "rgba(59,130,246,0.12)",
  color: "rgba(234,240,255,0.92)",
  fontWeight: 900,
};

const grid2: React.CSSProperties = {
  display: "grid",
  gap: 10,
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  marginTop: 10,
};

const label: React.CSSProperties = {
  fontSize: 12.5,
  opacity: 0.8,
  fontWeight: 800,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.20)",
  color: "rgba(234,240,255,0.92)",
  outline: "none",
};

const textarea: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.20)",
  color: "rgba(234,240,255,0.92)",
  outline: "none",
  resize: "vertical",
};

const primaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  borderRadius: 14,
  fontWeight: 950,
  textDecoration: "none",
  color: "rgba(238,245,255,0.95)",
  background: "linear-gradient(135deg, rgba(59,130,246,0.85), rgba(20,184,166,0.60))",
  border: "1px solid rgba(255,255,255,0.16)",
  cursor: "pointer",
};

const ghostLink: React.CSSProperties = {
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

const ghostBtnButton: React.CSSProperties = {
  ...ghostLink,
  cursor: "pointer",
};

const mediaFix = `
@media (max-width: 760px) {
  .grid2 { grid-template-columns: 1fr; }
}
`;

// Inject a tiny responsive fix without touching global CSS
if (typeof document !== "undefined") {
  const id = "settings-grid2-fix";
  if (!document.getElementById(id)) {
    const s = document.createElement("style");
    s.id = id;
    s.textContent = mediaFix;
    document.head.appendChild(s);
  }
}

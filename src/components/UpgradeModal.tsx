"use client";

import React from "react";

export default function UpgradeModal({
  open,
  onClose,
  quotesUsed,
  limit,
}: {
  open: boolean;
  onClose: () => void;
  quotesUsed?: number;
  limit?: number;
}) {
  if (!open) return null;

  return (
    <div style={backdrop}>
      <div style={sheet}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={title}>Upgrade to Unlimited</div>
            <div style={sub}>
              You’ve reached your free quote limit.
            </div>
          </div>
          <button onClick={onClose} style={closeBtn}>×</button>
        </div>

        <div style={card}>
          <ul style={{ lineHeight: 1.8 }}>
            <li>Unlimited quotes</li>
            <li>No usage limits</li>
            <li>Built for busy trades</li>
          </ul>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button style={primaryBtn} onClick={onClose}>
            Upgrade now
          </button>
          <button style={ghostBtn} onClick={onClose}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

const backdrop: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.65)",
  display: "grid",
  placeItems: "center",
  zIndex: 9999,
};

const sheet: React.CSSProperties = {
  maxWidth: 480,
  width: "100%",
  background: "#070b14",
  borderRadius: 18,
  padding: 16,
  border: "1px solid rgba(255,255,255,0.12)",
};

const title = { fontSize: 18, fontWeight: 950 };
const sub = { opacity: 0.8, marginTop: 4 };
const card = {
  marginTop: 12,
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.1)",
};
const closeBtn = {
  background: "transparent",
  color: "#fff",
  fontSize: 22,
  border: "none",
  cursor: "pointer",
};
const primaryBtn = {
  padding: "10px",
  borderRadius: 12,
  fontWeight: 900,
  background: "linear-gradient(135deg,#ffa84c,#ffd6aa)",
  color: "#000",
  border: "none",
};
const ghostBtn = {
  padding: "10px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.15)",
};

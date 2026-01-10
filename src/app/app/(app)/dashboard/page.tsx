"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/authUser";
import { getQuotesCreated } from "@/lib/usage";
import UpgradeModal from "@/components/UpgradeModal";

const FREE_QUOTE_LIMIT = 10;

export default function Dashboard() {
  const [stats, setStats] = useState({
    quotesUsed: 0,
    totalQuotes: 0,
  });
  const [userId, setUserId] = useState<string>("anon");
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    let alive = true;

    async function initUser() {
      const uid = await getCurrentUserId();
      if (!alive) return;
      setUserId(uid);
    }

    initUser();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function load() {
      const totalQuotes = await db.quotes.where("userId").equals(userId).count();
      const quotesUsed = await getQuotesCreated(userId);

      if (!alive) return;
      setStats({ totalQuotes, quotesUsed });
    }

    if (!userId) return;

    load();
    const t = setInterval(load, 1200);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [userId]);

  const remaining = Math.max(0, FREE_QUOTE_LIMIT - stats.quotesUsed);
  const limitReached = stats.quotesUsed >= FREE_QUOTE_LIMIT;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        quotesUsed={stats.quotesUsed}
        limit={FREE_QUOTE_LIMIT}
      />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: -0.4 }}>Dashboard</div>
          <div style={{ opacity: 0.75, marginTop: 4 }}>
            Your workspace overview (scoped to this account).
          </div>
        </div>

        <a href="/app/quotes/new" style={{ ...primaryBtn, ...(limitReached ? disabledBtn : {}) }}>
          + New quote
        </a>
      </div>

      {limitReached ? (
        <div style={upgradeBanner}>
          <div style={{ fontWeight: 950 }}>Upgrade to Unlimited Quotes</div>
          <div style={{ opacity: 0.88, marginTop: 4, lineHeight: 1.45 }}>
            You’ve reached your free limit. Upgrade to keep creating and sending quotes without limits.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <button style={upgradeBtn} type="button" onClick={() => setShowUpgrade(true)}>
              Upgrade to Unlimited
            </button>
            <a href="/app/quotes" style={softBtn}>View quotes</a>
          </div>
        </div>
      ) : (
        <div style={quotaBanner}>
          <div style={{ fontWeight: 950 }}>Free plan</div>
          <div style={{ opacity: 0.85, marginTop: 4, lineHeight: 1.45 }}>
            <b>{remaining}</b> free quotes remaining ({stats.quotesUsed}/{FREE_QUOTE_LIMIT} used).
            When you hit 10, we’ll prompt you to upgrade.
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10 }}>
        <Card title="Quotes used" value={`${stats.quotesUsed}`} />
        <Card title="Free remaining" value={`${remaining}`} />
        <Card title="Total quotes" value={`${stats.totalQuotes}`} />
      </div>

      <div style={panel}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Next</div>
        <div style={{ opacity: 0.75, lineHeight: 1.55 }}>
          Keep it simple: Quotes first. When the upgrade prompt converts, we add payments.
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div style={{ opacity: 0.75, fontSize: 12.5 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 980, marginTop: 4 }}>{value}</div>
    </div>
  );
}

const panel: React.CSSProperties = {
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.18)",
};

const quotaBanner: React.CSSProperties = {
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "linear-gradient(135deg, rgba(34,211,238,0.10), rgba(99,102,241,0.10))",
};

const upgradeBanner: React.CSSProperties = {
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(255,168,76,0.35)",
  background: "linear-gradient(135deg, rgba(255,168,76,0.16), rgba(255,214,170,0.08))",
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
};

const disabledBtn: React.CSSProperties = {
  pointerEvents: "none",
  opacity: 0.45,
  filter: "grayscale(0.4)",
};

const upgradeBtn: React.CSSProperties = {
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

const softBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  borderRadius: 14,
  fontWeight: 850,
  textDecoration: "none",
  color: "rgba(234,240,255,0.90)",
  background: "rgba(0,0,0,0.18)",
  border: "1px solid rgba(255,255,255,0.12)",
};

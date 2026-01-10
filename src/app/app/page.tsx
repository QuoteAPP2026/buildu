"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function AppEntryPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!alive) return;
      if (data?.session?.user) window.location.href = "/app/dashboard";
    })();

    return () => {
      alive = false;
    };
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail || !password) {
        setMsg("Please enter your email and password.");
        return;
      }

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email: cleanEmail, password });
        if (error) throw error;
      }

      window.location.href = "/app/dashboard";
    } catch (err: any) {
      setMsg(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={bg}>
      <div style={wrap}>
        <div style={card}>
          <div style={brandRow}>
            <div style={mark} aria-hidden="true" />
            <div>
              <div style={title}>BuildU</div>
              <div style={sub}>Voice → Quote → Send</div>
            </div>
          </div>

          <div style={hero}>
            <div style={heroTitle}>
              {mode === "signin" ? "Sign in to your workspace" : "Create your workspace"}
            </div>
            <div style={heroBody}>
              Create quotes fast, edit in seconds, then send by WhatsApp, SMS or email.
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <label style={label}>
              Email
              <input
                style={input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                autoComplete="email"
                placeholder="name@company.co.uk"
              />
            </label>

            <label style={label}>
              Password
              <input
                style={input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder="Minimum 6 characters"
              />
            </label>

            {msg ? <div style={msgBox}>{msg}</div> : null}

            <button style={primaryBtn} type="submit" disabled={loading}>
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>

            <button
              type="button"
              style={ghostBtn}
              onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
              disabled={loading}
            >
              {mode === "signin" ? "Create account" : "I already have an account"}
            </button>
          </form>

          <div style={bullets}>
            <div style={bullet}><span style={dot} />Mobile-first. Built for one-handed use on site.</div>
            <div style={bullet}><span style={dot} />Voice → Quote → Edit → Send. No clutter.</div>
            <div style={bullet}><span style={dot} />Install later from Safari/Chrome for fastest access.</div>
          </div>
        </div>

        <div style={foot}>© {new Date().getFullYear()} BuildU</div>
      </div>
    </main>
  );
}

const bg: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(1100px 600px at 10% -20%, rgba(59,130,246,0.40), transparent 55%)," +
    "radial-gradient(900px 520px at 92% 0%, rgba(20,184,166,0.22), transparent 52%)," +
    "linear-gradient(180deg, rgba(255,255,255,0.05), transparent 24%)," +
    "#050912",
  color: "rgba(238,245,255,0.93)",
  display: "grid",
  placeItems: "center",
  padding: "18px 12px",
};

const wrap: React.CSSProperties = { width: "100%", maxWidth: 520 };

const card: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.11)",
  background: "rgba(255,255,255,0.055)",
  borderRadius: 22,
  backdropFilter: "blur(16px)",
  boxShadow: "0 22px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)",
  padding: 16,
};

const brandRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12 };

const mark: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 14,
  background:
    "radial-gradient(14px 14px at 30% 30%, rgba(255,255,255,0.55), rgba(255,255,255,0.0))," +
    "linear-gradient(135deg, rgba(59,130,246,0.95), rgba(20,184,166,0.75))",
  border: "1px solid rgba(255,255,255,0.16)",
  boxShadow: "0 16px 40px rgba(59,130,246,0.20), 0 14px 34px rgba(20,184,166,0.14)",
};

const title: React.CSSProperties = { fontWeight: 980, letterSpacing: -0.5, fontSize: 18, lineHeight: 1.05 };
const sub: React.CSSProperties = { opacity: 0.74, fontSize: 12.75, marginTop: 3 };

const hero: React.CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(20,184,166,0.10)), rgba(0,0,0,0.14)",
};

const heroTitle: React.CSSProperties = { fontWeight: 980, letterSpacing: -0.35, fontSize: 16 };
const heroBody: React.CSSProperties = { opacity: 0.82, fontSize: 13, lineHeight: 1.45, marginTop: 6 };

const label: React.CSSProperties = { display: "grid", gap: 6, fontSize: 12.75, opacity: 0.9 };

const input: React.CSSProperties = {
  width: "100%",
  borderRadius: 16,
  padding: "12px 12px",
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.20)",
  color: "rgba(238,245,255,0.95)",
  outline: "none",
  fontSize: 15,
};

const primaryBtn: React.CSSProperties = {
  width: "100%",
  borderRadius: 18,
  padding: "12px 14px",
  fontWeight: 980,
  letterSpacing: -0.25,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "linear-gradient(135deg, rgba(59,130,246,0.85), rgba(20,184,166,0.60))",
  color: "rgba(238,245,255,0.95)",
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  width: "100%",
  borderRadius: 18,
  padding: "12px 14px",
  fontWeight: 950,
  letterSpacing: -0.2,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.18)",
  color: "rgba(238,245,255,0.92)",
  cursor: "pointer",
};

const msgBox: React.CSSProperties = {
  padding: 10,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  fontSize: 12.75,
  opacity: 0.9,
  lineHeight: 1.35,
};

const bullets: React.CSSProperties = {
  marginTop: 14,
  paddingTop: 12,
  borderTop: "1px solid rgba(255,255,255,0.10)",
  display: "grid",
  gap: 8,
  opacity: 0.78,
  fontSize: 13,
  lineHeight: 1.35,
};

const bullet: React.CSSProperties = { display: "flex", gap: 10, alignItems: "flex-start" };
const dot: React.CSSProperties = {
  marginTop: 6,
  width: 9,
  height: 9,
  borderRadius: 99,
  background: "rgba(34,211,238,0.95)",
  boxShadow: "0 10px 24px rgba(34,211,238,0.18)",
  flex: "0 0 auto",
};

const foot: React.CSSProperties = { marginTop: 12, textAlign: "center", opacity: 0.55, fontSize: 12.5 };

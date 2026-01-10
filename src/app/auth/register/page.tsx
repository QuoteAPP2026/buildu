"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);

    if (!supabase) {
      setError("Supabase isn’t configured yet. Add keys to .env.local and restart.");
      return;
    }

    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      // If email confirmation is enabled, session will be null until confirmed
      if (data.user && !data.session) {
        setOk("Account created. Check your email to confirm, then log in.");
        return;
      }

      // Session exists, create org row
      await fetch("/api/ensure-org", { method: "POST" });

      setOk("Account created. Redirecting…");
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 16, padding: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Register</h1>
        <p style={{ marginTop: 6, opacity: 0.8 }}>Create an account (admin access is allow-listed).</p>

        {!supabase && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: "rgba(255,165,0,0.12)" }}>
            <strong>Setup needed:</strong> add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>, then restart.
          </div>
        )}

        <form onSubmit={onSubmit} style={{ marginTop: 14, display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, opacity: 0.8 }}>Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
              style={{ padding: 10, borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, opacity: 0.8 }}>Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
              style={{ padding: 10, borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)" }}
            />
          </label>

          {error && (
            <div style={{ padding: 10, borderRadius: 12, background: "rgba(220,0,0,0.10)" }}>
              {error}
            </div>
          )}

          {ok && (
            <div style={{ padding: 10, borderRadius: 12, background: "rgba(0,160,0,0.10)" }}>
              {ok}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.18)",
              fontWeight: 700,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>

        <p style={{ marginTop: 12, fontSize: 13, opacity: 0.8 }}>
          Already have an account? Go to <a href="/auth/login">Login</a>.
        </p>
      </div>
    </main>
  );
}

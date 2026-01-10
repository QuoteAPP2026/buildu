"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const userEmail = data?.session?.user?.email ?? null;
      setEmail(userEmail);
      setChecking(false);

      // Hard gate: if not signed in, app area is not accessible.
      if (!userEmail) {
        window.location.href = "/app";
      }
    }

    boot();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      const userEmail = session?.user?.email ?? null;
      setEmail(userEmail);

      // If they sign out anywhere, kick them back to /app immediately
      if (!userEmail) {
        window.location.href = "/app";
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/app";
  }

  // Prevent dashboard flash before redirect
  if (checking) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background:
            "radial-gradient(1100px 600px at 10% -20%, rgba(59,130,246,0.40), transparent 55%)," +
            "radial-gradient(900px 520px at 92% 0%, rgba(20,184,166,0.22), transparent 52%)," +
            "linear-gradient(180deg, rgba(255,255,255,0.05), transparent 24%)," +
            "#050912",
          color: "rgba(238,245,255,0.92)",
          padding: 18,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 22,
            border: "1px solid rgba(255,255,255,0.11)",
            background: "rgba(255,255,255,0.055)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 22px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)",
            padding: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              aria-hidden="true"
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background:
                  "radial-gradient(14px 14px at 30% 30%, rgba(255,255,255,0.55), rgba(255,255,255,0.0))," +
                  "linear-gradient(135deg, rgba(59,130,246,0.95), rgba(20,184,166,0.75))",
                border: "1px solid rgba(255,255,255,0.16)",
                boxShadow: "0 16px 40px rgba(59,130,246,0.20), 0 14px 34px rgba(20,184,166,0.14)",
              }}
            />
            <div>
              <div style={{ fontWeight: 980, letterSpacing: -0.5, fontSize: 18, lineHeight: 1.05 }}>BuildU</div>
              <div style={{ opacity: 0.74, fontSize: 12.75, marginTop: 3 }}>Loading your workspace…</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <style>{`
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }

        .bg {
          min-height: 100vh;
          background:
            radial-gradient(900px 520px at 15% -10%, rgba(60,120,255,0.18), transparent 55%),
            radial-gradient(900px 520px at 85% 0%, rgba(20,184,166,0.14), transparent 55%),
            #070b14;
          color: rgba(234,240,255,0.94);
        }

        .shell {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 16px;
          padding: 16px;
        }

        .card {
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.03);
          border-radius: 18px;
        }

        .side {
          position: sticky;
          top: 12px;
          height: fit-content;
          padding: 14px;
        }

        .brand { font-weight: 950; letter-spacing: -0.2px; }
        .nav { display: grid; gap: 8px; margin-top: 12px; }
        .link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 14px;
          text-decoration: none;
          color: rgba(234,240,255,0.92);
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.18);
        }
        .link:hover { background: rgba(255,255,255,0.05); }

        .authRow { margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.08); }
        .muted { opacity: 0.78; font-size: 12.5px; line-height: 1.4; }
        .btnRow { display: grid; gap: 8px; margin-top: 10px; }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 12px;
          border-radius: 14px;
          font-weight: 900;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: rgba(234,240,255,0.92);
          cursor: pointer;
          text-decoration: none;
        }
        .btn:hover { background: rgba(255,255,255,0.07); }

        .mobileHeader { display: none; }
        .mobileNav { display: none; }

        .main { min-height: calc(100vh - 32px); padding: 12px 6px 16px 6px; }

        @media (max-width: 860px){
          .shell { grid-template-columns: 1fr; padding: 0; }
          .side { display: none; }

          .mobileHeader {
            display: block;
            padding: 12px;
            position: sticky;
            top: 0;
            background: rgba(7,11,20,0.78);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255,255,255,0.08);
            z-index: 50;
          }
          .mobileHeaderRow { display: flex; justify-content: space-between; gap: 10px; align-items: center; }
          .mobileTitle { font-weight: 950; letter-spacing: -0.2px; }
          .mobileSub { opacity: 0.7; font-size: 12.5px; margin-top: 2px; }
          .mobileHeaderActions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
          .btn.mini { padding: 8px 10px; border-radius: 12px; font-size: 12.5px; }

          .mobileNav {
            display: block;
            position: fixed;
            left: 0; right: 0; bottom: 0;
            padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
            background: rgba(7,11,20,0.86);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(255,255,255,0.08);
          }
          .mobileNavInner {
            max-width: 980px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
          }
          .mobileTab {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 10px;
            border-radius: 16px;
            text-decoration: none;
            font-weight: 900;
            color: rgba(234,240,255,0.92);
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.10);
          }

          .main { padding: 12px; padding-bottom: calc(12px + 82px + env(safe-area-inset-bottom)); }
        }
      `}</style>

      <div className="bg">
        {/* Mobile header */}
        <header className="mobileHeader">
          <div className="mobileHeaderRow">
            <div>
              <div className="mobileTitle">BuildU</div>
              <div className="mobileSub">Voice → Quote → Send</div>
            </div>

            <div className="mobileHeaderActions">
              {email ? (
                <button className="btn mini" onClick={logout} type="button">
                  Logout
                </button>
              ) : null}
            </div>
          </div>
        </header>

        <div className="shell">
          {/* Desktop sidebar */}
          <aside className="side card">
            <div className="brand">BuildU</div>
            <nav className="nav">
              <a className="link" href="/app/dashboard">Dashboard</a>
              <a className="link" href="/app/quotes">Quotes</a>
              <a className="link" href="/app/settings">Settings</a>
            </nav>

            <div className="authRow">
              <div className="muted">
                Signed in as <strong>{email}</strong>
              </div>

              <div className="btnRow">
                <button className="btn" onClick={logout} type="button">Logout</button>
              </div>
            </div>
          </aside>

          <main className="main">{children}</main>
        </div>

        {/* Mobile bottom nav */}
        <nav className="mobileNav">
          <div className="mobileNavInner">
            <a className="mobileTab" href="/app/dashboard">Home</a>
            <a className="mobileTab" href="/app/quotes">Quotes</a>
            <a className="mobileTab" href="/app/settings">Settings</a>
          </div>
        </nav>
      </div>
    </>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";

type InstallState = {
  isStandalone: boolean;
  isIOS: boolean;
  isAndroidLike: boolean;
  canPrompt: boolean;
};

export default function AppEntryPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installState, setInstallState] = useState<InstallState>({
    isStandalone: false,
    isIOS: false,
    isAndroidLike: false,
    canPrompt: false,
  });

  const [allowContinue, setAllowContinue] = useState(false);

  const nextHref = useMemo(() => "/auth/register", []);
  const loginHref = useMemo(() => "/auth/login", []);

  useEffect(() => {
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      // @ts-expect-error iOS Safari legacy
      window.navigator.standalone === true;

    const ua = navigator.userAgent || "";
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroidLike = /Android/i.test(ua);

    setInstallState((s) => ({ ...s, isStandalone, isIOS, isAndroidLike }));

    // If already installed, go straight to auth.
    if (isStandalone) {
      window.location.href = nextHref;
      return;
    }

    const onBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallState((s) => ({ ...s, canPrompt: true }));
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, [nextHref]);

  async function handleInstall() {
    // Android/Chrome: trigger native prompt
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      } catch {
        // ignore
      } finally {
        setDeferredPrompt(null);
        setInstallState((s) => ({ ...s, canPrompt: false }));
      }
      return;
    }

    // iOS: can't trigger install — show instructions only
    setAllowContinue(true);
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
            <div style={heroTitle}>Install the app first</div>
            <div style={heroBody}>
              BuildU works best from your Home Screen — faster, cleaner, and feels like a real app.
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <button style={primaryBtn} type="button" onClick={handleInstall}>
              Install BuildU
            </button>

            {!installState.isIOS ? (
              <div style={hint}>
                {installState.canPrompt
                  ? "Tap “Install BuildU” to open the install prompt."
                  : "If you don’t see an install prompt, open this page in Chrome and try again."}
              </div>
            ) : (
              <div style={iosBox}>
                <div style={{ fontWeight: 950, marginBottom: 6 }}>On iPhone (Safari)</div>
                <ol style={ol}>
                  <li>Tap the <b>Share</b> icon</li>
                  <li>Select <b>Add to Home Screen</b></li>
                  <li>Open BuildU from your Home Screen</li>
                </ol>
                <div style={hint}>Apple doesn’t allow websites to auto-install — users must do it once.</div>
              </div>
            )}
          </div>

          <div style={divider} />

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 950, letterSpacing: -0.2 }}>Already installed?</div>
            <div style={hint}>
              Open BuildU from your Home Screen icon. If you’re seeing this page again, you’re still in the browser.
            </div>
          </div>

          {/* Optional escape hatch */}
          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <button style={ghostBtn} type="button" onClick={() => setAllowContinue(true)}>
              Continue in browser
            </button>

            {allowContinue ? (
              <div style={authCard}>
                <div style={{ fontWeight: 950, marginBottom: 6 }}>Continue</div>
                <div style={hint}>You can still use BuildU in the browser, but install is recommended.</div>

                <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                  <a style={linkBtnPrimary} href={nextHref}>
                    Create account
                  </a>
                  <a style={linkBtnGhost} href={loginHref}>
                    Sign in
                  </a>
                </div>
              </div>
            ) : null}
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

const wrap: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
};

const card: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.11)",
  background: "rgba(255,255,255,0.055)",
  borderRadius: 22,
  backdropFilter: "blur(16px)",
  boxShadow: "0 22px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)",
  padding: 16,
};

const brandRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

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

const title: React.CSSProperties = {
  fontWeight: 980,
  letterSpacing: -0.5,
  fontSize: 18,
  lineHeight: 1.05,
};

const sub: React.CSSProperties = {
  opacity: 0.74,
  fontSize: 12.75,
  marginTop: 3,
};

const hero: React.CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.10)",
  background:
    "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(20,184,166,0.10)), rgba(0,0,0,0.14)",
};

const heroTitle: React.CSSProperties = {
  fontWeight: 980,
  letterSpacing: -0.35,
  fontSize: 16,
};

const heroBody: React.CSSProperties = {
  opacity: 0.82,
  fontSize: 13,
  lineHeight: 1.45,
  marginTop: 6,
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

const hint: React.CSSProperties = {
  opacity: 0.75,
  fontSize: 12.75,
  lineHeight: 1.35,
};

const iosBox: React.CSSProperties = {
  marginTop: 4,
  padding: 12,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.16)",
};

const ol: React.CSSProperties = {
  margin: "8px 0 0 18px",
  padding: 0,
  display: "grid",
  gap: 6,
  opacity: 0.9,
  fontSize: 13,
  lineHeight: 1.35,
};

const divider: React.CSSProperties = {
  height: 1,
  margin: "16px 0",
  background: "rgba(255,255,255,0.10)",
};

const authCard: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.045)",
  borderRadius: 18,
  padding: 12,
};

const linkBtnPrimary: React.CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  borderRadius: 18,
  padding: "12px 14px",
  fontWeight: 980,
  letterSpacing: -0.25,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "linear-gradient(135deg, rgba(59,130,246,0.85), rgba(20,184,166,0.60))",
  color: "rgba(238,245,255,0.95)",
  textDecoration: "none",
};

const linkBtnGhost: React.CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  borderRadius: 18,
  padding: "12px 14px",
  fontWeight: 950,
  letterSpacing: -0.2,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.18)",
  color: "rgba(238,245,255,0.92)",
  textDecoration: "none",
};

const foot: React.CSSProperties = {
  marginTop: 12,
  textAlign: "center",
  opacity: 0.55,
  fontSize: 12.5,
};

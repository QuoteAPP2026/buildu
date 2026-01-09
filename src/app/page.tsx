"use client";

import { useEffect, useMemo, useState } from "react";

type InstallStatus = "idle" | "ready" | "prompting" | "installed";

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installStatus, setInstallStatus] = useState<InstallStatus>("idle");
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      (window.navigator as any).standalone;

    if (standalone) {
      setIsStandalone(true);
      setInstallStatus("installed");
    }

    function onBeforeInstallPrompt(e: any) {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallStatus("ready");
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  const canInstall = useMemo(() => !!deferredPrompt && !isStandalone, [deferredPrompt, isStandalone]);

  async function handleInstall() {
    if (!deferredPrompt) return;
    try {
      setInstallStatus("prompting");
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstallStatus("installed");
      else setInstallStatus("ready");
    } catch {
      setInstallStatus("ready");
    } finally {
      setDeferredPrompt(null);
    }
  }

  return (
    <main className="bg">
      <style>{`
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }

        .bg{
          min-height: 100vh;
          background:
            radial-gradient(1000px 520px at 15% -10%, rgba(60,120,255,0.22), transparent 55%),
            radial-gradient(1000px 520px at 85% 0%, rgba(255,168,76,0.16), transparent 55%),
            #070b14;
          color: rgba(234,240,255,0.94);
        }

        .wrap{
          max-width: 1080px;
          margin: 0 auto;
          padding: 18px 14px 28px;
        }

        .topbar{
          position: sticky;
          top: 0;
          z-index: 20;
          padding: 12px 0;
          background: rgba(7,11,20,0.55);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .topRow{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
        }

        .logo{
          display:flex;
          align-items:center;
          gap: 10px;
          font-weight: 950;
          letter-spacing: -0.4px;
        }

        .dot{
          width: 10px; height: 10px; border-radius: 999px;
          background: linear-gradient(135deg, rgba(255,168,76,1), rgba(255,214,170,1));
          box-shadow: 0 0 24px rgba(255,168,76,0.35);
        }

        .topActions{
          display:flex; gap: 10px; align-items:center; flex-wrap: wrap;
        }

        .btn{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding: 12px 14px;
          border-radius: 16px;
          font-weight: 950;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.18);
          color: rgba(234,240,255,0.92);
          cursor: pointer;
        }

        .btnPrimary{
          color: #0B0F1D;
          background: linear-gradient(135deg, rgba(255,168,76,1), rgba(255,214,170,1));
          border: 1px solid rgba(255,255,255,0.16);
        }

        .hero{
          padding: 26px 0 18px;
          display:grid;
          gap: 14px;
        }

        .headline{
          font-size: 40px;
          line-height: 1.05;
          font-weight: 980;
          letter-spacing: -0.9px;
          margin: 0;
        }

        .sub{
          margin: 0;
          font-size: 16px;
          line-height: 1.5;
          opacity: 0.82;
          max-width: 62ch;
        }

        .heroCtas{
          display:flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 6px;
        }

        .panel{
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.03);
          padding: 14px;
        }

        .grid3{
          display:grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 14px;
        }

        .card{
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.18);
          padding: 14px;
          display:grid;
          gap: 8px;
        }

        .kicker{
          font-size: 12.5px;
          opacity: 0.75;
          font-weight: 850;
          letter-spacing: 0.2px;
          text-transform: uppercase;
        }

        .cardTitle{
          font-size: 15px;
          font-weight: 950;
          letter-spacing: -0.2px;
        }

        .cardText{
          font-size: 13.5px;
          line-height: 1.45;
          opacity: 0.82;
        }

        .how{
          margin-top: 14px;
          display:grid;
          gap: 10px;
        }

        .step{
          display:flex;
          gap: 10px;
          align-items:flex-start;
          padding: 12px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.16);
        }

        .num{
          width: 28px; height: 28px;
          border-radius: 999px;
          display:grid;
          place-items:center;
          font-weight: 950;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.10);
          flex: 0 0 auto;
          margin-top: 1px;
        }

        .stepTitle{ font-weight: 950; margin: 0; }
        .stepText{ margin: 3px 0 0; opacity: 0.82; font-size: 13.5px; line-height: 1.45; }

        .footer{
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.08);
          opacity: 0.70;
          font-size: 12.5px;
          display:flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        /* Mobile-first tuning */
        @media (max-width: 860px){
          .headline{ font-size: 34px; }
          .grid3{ grid-template-columns: 1fr; }
          .btn{ width: 100%; }
          .topActions{ width: 100%; }
          .topRow{ flex-wrap: wrap; }
          .topActions a, .topActions button { flex: 1 1 160px; }
        }
      `}</style>

      <div className="wrap">
        <div className="topbar">
          <div className="topRow">
            <div className="logo">
              <span className="dot" />
              <span>BuildU</span>
            </div>

            <div className="topActions">
              <a className="btn" href="/app/quotes">Open app</a>

              <button
                type="button"
                className="btn btnPrimary"
                onClick={handleInstall}
                disabled={!canInstall || installStatus === "prompting" || installStatus === "installed"}
                style={{
                  opacity: !canInstall || installStatus === "prompting" || installStatus === "installed" ? 0.60 : 1
                }}
              >
                {installStatus === "installed"
                  ? "Installed ✓"
                  : installStatus === "prompting"
                    ? "Installing…"
                    : canInstall
                      ? "Install app"
                      : "Install (not available yet)"}
              </button>
            </div>
          </div>
        </div>

        <section className="hero">
          <p className="kicker">V1 • Offline-first quoting</p>
          <h1 className="headline">Voice → Quote → Send.</h1>
          <p className="sub">
            BuildU lets you speak a quote on-site, tidy it up, and send it instantly via WhatsApp, SMS, or Gmail.
            Built for trades — fast, simple, and works even with bad signal.
          </p>

          <div className="heroCtas">
            <a className="btn btnPrimary" href="/app/quotes/new">Create a quote</a>
            <a className="btn" href="/app/settings">Set your business details</a>
          </div>

          <div className="grid3">
            <div className="card">
              <div className="cardTitle">Fast on-site quoting</div>
              <div className="cardText">Start from voice, then edit transcript and line items in seconds.</div>
            </div>
            <div className="card">
              <div className="cardTitle">Send in one tap</div>
              <div className="cardText">WhatsApp / SMS / Gmail Web + copy fallback. Marks quote as Sent.</div>
            </div>
            <div className="card">
              <div className="cardTitle">Branding built-in</div>
              <div className="cardText">Business name, phone, email, address + terms added automatically.</div>
            </div>
          </div>

          <div className="panel how">
            <div className="kicker">How it works</div>

            <div className="step">
              <div className="num">1</div>
              <div>
                <p className="stepTitle">Speak the job</p>
                <p className="stepText">Tap mic, dictate your quote, then quickly tidy the transcript.</p>
              </div>
            </div>

            <div className="step">
              <div className="num">2</div>
              <div>
                <p className="stepTitle">Review and edit</p>
                <p className="stepText">Add line items, quantities and prices. Total updates automatically.</p>
              </div>
            </div>

            <div className="step">
              <div className="num">3</div>
              <div>
                <p className="stepTitle">Send and win</p>
                <p className="stepText">Send via WhatsApp/SMS/Gmail and keep your quotes organised by status.</p>
              </div>
            </div>
          </div>

          <div className="footer">
            <div>Works offline • Saved on this device • V1 shipping build</div>
            <div>
              <a className="btn" href="/app/quotes" style={{ padding: "8px 10px", borderRadius: 12 }}>
                Go to app →
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

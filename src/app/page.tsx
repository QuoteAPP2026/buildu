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
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  const canInstall = useMemo(() => !!deferredPrompt && !isStandalone, [deferredPrompt, isStandalone]);

  async function handleInstall() {
    if (!deferredPrompt) return;
    try {
      setInstallStatus("prompting");
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setInstallStatus(outcome === "accepted" ? "installed" : "ready");
    } catch {
      setInstallStatus("ready");
    } finally {
      setDeferredPrompt(null);
    }
  }

  const installLabel =
    installStatus === "installed"
      ? "Installed ✓"
      : installStatus === "prompting"
        ? "Installing…"
        : canInstall
          ? "Install app"
          : "Install";

  const installDisabled = !canInstall || installStatus === "prompting" || installStatus === "installed";

  return (
    <main className="lp">
      <style>{`
        :root { color-scheme: light; }
        * { box-sizing: border-box; }
        a { color: inherit; }

        .lp{
          min-height: 100vh;
          background:
            radial-gradient(900px 520px at 15% 10%, rgba(124,92,255,0.30), transparent 55%),
            radial-gradient(900px 520px at 85% 10%, rgba(255,175,92,0.32), transparent 55%),
            radial-gradient(900px 520px at 60% 90%, rgba(255,105,180,0.14), transparent 60%),
            linear-gradient(135deg, #f4efff 0%, #fff3ea 55%, #f5f0ff 100%);
          color: #111126;
          overflow-x: hidden;
        }

        .wrap{
          max-width: 1120px;
          margin: 0 auto;
          padding: 18px 14px 48px;
        }

        .top{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
          padding: 6px 0 14px;
        }

        .brand{
          display:flex;
          align-items:center;
          gap: 10px;
          font-weight: 950;
          letter-spacing: -0.4px;
        }

        .mark{
          width: 36px; height: 36px;
          border-radius: 14px;
          background: radial-gradient(12px 12px at 35% 30%, rgba(255,255,255,0.75), transparent 55%),
                      linear-gradient(135deg, rgba(124,92,255,1), rgba(255,175,92,1));
          box-shadow: 0 18px 34px rgba(124,92,255,0.18);
        }

        .nav{
          display:flex;
          gap: 10px;
          align-items:center;
          flex-wrap: wrap;
          justify-content:flex-end;
        }

        .btn{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding: 12px 14px;
          border-radius: 999px;
          font-weight: 950;
          text-decoration: none;
          border: 1px solid rgba(17,17,38,0.12);
          background: rgba(255,255,255,0.55);
          box-shadow: 0 14px 28px rgba(17,17,38,0.08);
          cursor: pointer;
          white-space: nowrap;
        }

        .btnDark{
          background: #111126;
          color: #fff;
          border: 1px solid rgba(17,17,38,0.20);
          box-shadow: 0 18px 34px rgba(17,17,38,0.18);
        }

        .btnSoft{
          background: rgba(255,255,255,0.35);
        }

        .hero{
          display:grid;
          grid-template-columns: 1.08fr 0.92fr;
          gap: 18px;
          align-items: center;
          padding: 18px 0 10px;
        }

        .h1{
          margin: 0;
          font-size: 54px;
          line-height: 1.02;
          font-weight: 980;
          letter-spacing: -1.2px;
        }

        .sub{
          margin: 12px 0 0;
          font-size: 16.5px;
          line-height: 1.6;
          opacity: 0.78;
          max-width: 62ch;
        }

        .cta{
          margin-top: 16px;
          display:flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items:center;
        }

        .hint{
          margin-top: 10px;
          font-size: 12.5px;
          opacity: 0.70;
          font-weight: 750;
        }

        .blobA, .blobB{
          position:absolute;
          border-radius: 999px;
          filter: blur(0px);
          opacity: 0.95;
          z-index: 0;
          pointer-events:none;
        }

        .scene{
          position: relative;
          min-height: 460px;
        }

        .blobA{
          width: 190px; height: 190px;
          left: -10px; top:  -10px;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.45), transparent 55%),
                      linear-gradient(135deg, rgba(124,92,255,1), rgba(124,92,255,0.55));
          box-shadow: 0 30px 70px rgba(124,92,255,0.22);
        }

        .blobB{
          width: 210px; height: 210px;
          right: -10px; top: 30px;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.45), transparent 55%),
                      linear-gradient(135deg, rgba(255,175,92,1), rgba(255,105,180,0.55));
          box-shadow: 0 30px 70px rgba(255,175,92,0.22);
        }

        .phoneWrap{
          position:absolute;
          left: 50%;
          top: 50%;
          transform: translate(-40%, -45%) rotate(-14deg);
          width: 360px;
          max-width: 86%;
          z-index: 2;
        }

        .phone{
          border-radius: 42px;
          background: #101424;
          border: 1px solid rgba(255,255,255,0.16);
          box-shadow: 0 40px 90px rgba(17,17,38,0.35);
          overflow:hidden;
        }

        .phoneTop{
          padding: 12px 14px;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.04);
          color: rgba(234,240,255,0.92);
          font-weight: 950;
          font-size: 12.5px;
        }

        .dot{
          width: 8px; height: 8px;
          border-radius: 999px;
          background: rgba(255,175,92,1);
          box-shadow: 0 0 18px rgba(255,175,92,0.55);
        }

        .grid{
          padding: 14px;
          display:grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap: 10px;
        }

        .tile{
          border-radius: 18px;
          padding: 12px;
          min-height: 76px;
          display:flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 8px;
          color: rgba(17,17,38,0.96);
          font-weight: 950;
          border: 1px solid rgba(255,255,255,0.14);
        }

        .tile small{
          font-weight: 850;
          opacity: 0.82;
          color: rgba(17,17,38,0.75);
        }

        .t1{ background: linear-gradient(135deg, #a59bff, #7c5cff); }
        .t2{ background: linear-gradient(135deg, #ffd1a4, #ffaf5c); }
        .t3{ background: linear-gradient(135deg, #7bffca, #42d98f); }
        .t4{ background: linear-gradient(135deg, #ffd0ef, #ff7ac8); }

        .tile span{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          width: 34px; height: 34px;
          border-radius: 14px;
          background: rgba(255,255,255,0.26);
          border: 1px solid rgba(255,255,255,0.20);
          font-weight: 980;
        }

        .features{
          margin-top: 18px;
          display:grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 12px;
        }

        .f{
          border-radius: 24px;
          padding: 16px;
          box-shadow: 0 18px 40px rgba(17,17,38,0.10);
          border: 1px solid rgba(17,17,38,0.10);
          display:grid;
          gap: 8px;
          min-height: 150px;
        }

        .f h3{
          margin: 0;
          font-size: 16px;
          font-weight: 980;
          letter-spacing: -0.2px;
        }

        .f p{
          margin: 0;
          font-size: 13.5px;
          line-height: 1.5;
          opacity: 0.78;
          font-weight: 650;
        }

        .fp{ background: linear-gradient(180deg, rgba(124,92,255,0.18), rgba(255,255,255,0.55)); }
        .fo{ background: linear-gradient(180deg, rgba(255,175,92,0.24), rgba(255,255,255,0.55)); }
        .fp2{ background: linear-gradient(180deg, rgba(124,92,255,0.18), rgba(255,255,255,0.55)); }

        .footerBand{
          margin-top: 18px;
          border-radius: 28px;
          padding: 16px;
          background: #111126;
          color: rgba(255,255,255,0.92);
          border: 1px solid rgba(255,255,255,0.10);
          display:flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .footerBand .title{
          font-weight: 980;
          letter-spacing: -0.3px;
        }

        .footerBand .sub{
          margin: 4px 0 0;
          opacity: 0.82;
          font-size: 13.5px;
          max-width: 70ch;
        }

        .tiny{
          margin-top: 12px;
          opacity: 0.65;
          font-size: 12.5px;
          display:flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        @media (max-width: 980px){
          .hero{ grid-template-columns: 1fr; }
          .h1{ font-size: 42px; }
          .scene{ min-height: 420px; }
          .phoneWrap{ transform: translate(-50%, -45%) rotate(-12deg); }
        }

        @media (max-width: 860px){
          .btn{ width: 100%; }
          .nav{ width: 100%; }
          .cta{ display:grid; grid-template-columns: 1fr; }
          .features{ grid-template-columns: 1fr; }
          .scene{ min-height: 460px; }
          .phoneWrap{ left: 50%; transform: translate(-50%, -46%) rotate(-10deg); }
        }
      `}</style>

      <div className="wrap">
        <header className="top">
          <div className="brand">
            <div className="mark" />
            <div>BuildU</div>
          </div>

          <nav className="nav">
            <a className="btn btnSoft" href="/app/quotes">Open app</a>
            <button className="btn btnDark" type="button" onClick={handleInstall} disabled={installDisabled} style={{ opacity: installDisabled ? 0.60 : 1 }}>
              {installLabel}
            </button>
          </nav>
        </header>

        <section className="hero">
          <div>
            <h1 className="h1">Fast quoting for real work.</h1>
            <p className="sub">
              Voice → Quote → Send. Speak the job, edit the transcript, add line items, and send instantly via WhatsApp, SMS, or Gmail.
              Offline-first and saved on-device.
            </p>

            <div className="cta">
              <a className="btn btnDark" href="/app/quotes/new">Create a quote</a>
              <a className="btn btnSoft" href="/app/settings">Business details</a>
            </div>

            <div className="hint">
              iPhone: Share → Add to Home Screen. Android: “Install app”.
            </div>
          </div>

          <div className="scene">
            <div className="blobA" />
            <div className="blobB" />

            <div className="phoneWrap">
              <div className="phone">
                <div className="phoneTop">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="dot" />
                    <span>BuildU</span>
                  </div>
                  <div style={{ opacity: 0.78 }}>Quote</div>
                </div>

                <div className="grid">
                  <div className="tile t1">
                    <span>🎤</span>
                    <div>Voice input<br /><small>Capture fast</small></div>
                  </div>
                  <div className="tile t2">
                    <span>£</span>
                    <div>Line items<br /><small>Total auto</small></div>
                  </div>
                  <div className="tile t3">
                    <span>✅</span>
                    <div>Status<br /><small>Draft → Sent</small></div>
                  </div>
                  <div className="tile t4">
                    <span>💬</span>
                    <div>Send<br /><small>WhatsApp/SMS</small></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="f fp">
            <h3>Security</h3>
            <p>Offline-first storage on the device. No login needed for V1 — fast and private on-site.</p>
          </div>

          <div className="f fo">
            <h3>Ease of use</h3>
            <p>Designed for one hand on a phone. Big actions, minimal admin, quick repeat quotes.</p>
          </div>

          <div className="f fp2">
            <h3>Integrations</h3>
            <p>Send instantly via WhatsApp, SMS or Gmail. Copy message fallback always available.</p>
          </div>
        </section>

        <section className="footerBand">
          <div>
            <div className="title">Download and start today</div>
            <div className="sub">
              Create a quote in seconds and send it while you’re still on-site.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="btn" href="/app/quotes">Open app</a>
            <a className="btn btnDark" href="/app/quotes/new">New quote</a>
          </div>
        </section>

        <div className="tiny">
          <div>BuildU • Voice → Quote → Send</div>
          <div>V1: saved per device (offline-first)</div>
        </div>
      </div>
    </main>
  );
}

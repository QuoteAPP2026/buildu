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
          : "Install (not available yet)";

  return (
    <main className="lp">
      <style>{`
        :root { color-scheme: light; }
        * { box-sizing: border-box; }
        a { color: inherit; }

        /* --- palette inspired by your reference --- */
        .lp{
          min-height: 100vh;
          background: #f2eddc; /* warm beige */
          color: #141126;
        }

        .wrap{
          max-width: 1120px;
          margin: 0 auto;
          padding: 18px 14px 40px;
        }

        .topbar{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
          padding: 12px 0 18px;
        }

        .brand{
          display:flex;
          align-items:center;
          gap: 10px;
          font-weight: 950;
          letter-spacing: -0.4px;
        }

        .mark{
          width: 34px; height: 34px;
          border-radius: 12px;
          background: radial-gradient(12px 12px at 30% 30%, rgba(255,255,255,0.55), transparent 55%),
                      linear-gradient(135deg, #5b3df5, #2b1c92);
          box-shadow: 0 14px 28px rgba(43,28,146,0.18);
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
          border-radius: 16px;
          font-weight: 950;
          text-decoration: none;
          border: 1px solid rgba(20,17,38,0.12);
          background: rgba(255,255,255,0.55);
          box-shadow: 0 12px 26px rgba(20,17,38,0.08);
          cursor: pointer;
          white-space: nowrap;
        }

        .btnPrimary{
          background: linear-gradient(135deg, #ffb15c, #ffd9b0);
          border: 1px solid rgba(255,177,92,0.55);
          box-shadow: 0 18px 34px rgba(255,177,92,0.22);
        }

        .btnInk{
          background: linear-gradient(135deg, #2b1c92, #5b3df5);
          border: 1px solid rgba(43,28,146,0.30);
          color: #fff;
          box-shadow: 0 18px 34px rgba(43,28,146,0.22);
        }

        .hero{
          display:grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 18px;
          align-items: center;
          padding: 18px 0 10px;
        }

        .kicker{
          font-size: 12.5px;
          font-weight: 950;
          opacity: 0.75;
          letter-spacing: 0.25px;
          text-transform: uppercase;
        }

        .h1{
          margin: 10px 0 0;
          font-size: 52px;
          line-height: 1.02;
          font-weight: 980;
          letter-spacing: -1.1px;
        }

        .sub{
          margin: 12px 0 0;
          font-size: 16.5px;
          line-height: 1.6;
          opacity: 0.80;
          max-width: 64ch;
        }

        .ctaRow{
          margin-top: 16px;
          display:flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .trust{
          margin-top: 14px;
          display:flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pill{
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(20,17,38,0.12);
          background: rgba(255,255,255,0.55);
          font-weight: 900;
          font-size: 12.5px;
          opacity: 0.9;
        }

        /* --- right-side mock --- */
        .stage{
          position: relative;
          border-radius: 26px;
          border: 1px solid rgba(20,17,38,0.10);
          background: rgba(255,255,255,0.40);
          box-shadow: 0 22px 44px rgba(20,17,38,0.12);
          padding: 14px;
          overflow: hidden;
          min-height: 420px;
        }

        .bubble{
          position:absolute;
          border-radius: 18px;
          padding: 10px 12px;
          font-weight: 950;
          border: 2px solid rgba(20,17,38,0.12);
          box-shadow: 0 18px 30px rgba(20,17,38,0.10);
          max-width: 210px;
        }

        .b1{ left: 14px; top: 18px; background: #ffcc00; }
        .b2{ right: 14px; top: 62px; background: #51ff9f; }
        .b3{ left: 36px; bottom: 22px; background: #ff7ac8; }

        .bubble small{
          display:block;
          font-weight: 850;
          opacity: 0.78;
          margin-top: 4px;
        }

        .phone{
          position:absolute;
          right: 18px;
          bottom: 18px;
          width: 270px;
          max-width: 78%;
          border-radius: 34px;
          background: #0b1020;
          border: 1px solid rgba(255,255,255,0.16);
          box-shadow: 0 28px 60px rgba(0,0,0,0.35);
          overflow:hidden;
        }

        .phoneTop{
          padding: 10px 12px;
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

        .chip{
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.06);
          font-weight: 900;
        }

        .phoneBody{
          padding: 12px;
          color: rgba(234,240,255,0.92);
          display:grid;
          gap: 10px;
        }

        .mini{
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.04);
          border-radius: 18px;
          padding: 10px;
          display:grid;
          gap: 8px;
        }

        .row{
          display:flex; justify-content:space-between; gap: 10px; align-items:center;
          font-size: 12.5px;
        }

        .label{ opacity: 0.72; font-weight: 850; }
        .val{ font-weight: 950; }

        .grid3{
          margin-top: 18px;
          display:grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .card{
          border-radius: 22px;
          border: 1px solid rgba(20,17,38,0.10);
          background: rgba(255,255,255,0.55);
          box-shadow: 0 16px 30px rgba(20,17,38,0.08);
          padding: 14px;
          display:grid;
          gap: 8px;
        }

        .cardTitle{
          font-weight: 980;
          letter-spacing: -0.2px;
          font-size: 15px;
        }

        .cardText{
          opacity: 0.78;
          font-size: 13.5px;
          line-height: 1.45;
        }

        .section{
          margin-top: 18px;
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .panel{
          border-radius: 26px;
          border: 1px solid rgba(20,17,38,0.10);
          background: rgba(255,255,255,0.55);
          box-shadow: 0 16px 30px rgba(20,17,38,0.08);
          padding: 14px;
          display:grid;
          gap: 10px;
        }

        .step{
          display:flex; gap: 10px; align-items:flex-start;
          padding: 12px;
          border-radius: 18px;
          border: 1px solid rgba(20,17,38,0.10);
          background: rgba(255,255,255,0.45);
        }

        .num{
          width: 30px; height: 30px;
          border-radius: 12px;
          display:grid;
          place-items:center;
          font-weight: 950;
          background: rgba(91,61,245,0.12);
          border: 1px solid rgba(91,61,245,0.22);
        }

        /* --- dark footer band like the reference --- */
        .band{
          margin-top: 18px;
          border-radius: 28px;
          padding: 16px;
          background: radial-gradient(600px 320px at 20% 0%, rgba(255,177,92,0.20), transparent 60%),
                      radial-gradient(600px 320px at 80% 10%, rgba(91,61,245,0.22), transparent 60%),
                      linear-gradient(135deg, #120a2b, #2b1c92);
          color: rgba(255,255,255,0.92);
          border: 1px solid rgba(255,255,255,0.10);
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .bandTitle{
          font-weight: 980;
          letter-spacing: -0.3px;
        }
        .bandSub{
          opacity: 0.82;
          font-size: 13.5px;
          margin-top: 4px;
          line-height: 1.45;
          max-width: 64ch;
        }

        .footer{
          margin-top: 14px;
          opacity: 0.62;
          font-size: 12.5px;
          display:flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          padding-bottom: 8px;
        }

        @media (max-width: 980px){
          .hero{ grid-template-columns: 1fr; }
          .h1{ font-size: 42px; }
          .stage{ min-height: 380px; }
        }

        @media (max-width: 860px){
          .btn{ width: 100%; }
          .nav{ width: 100%; }
          .ctaRow{ display:grid; grid-template-columns: 1fr; }
          .grid3{ grid-template-columns: 1fr; }
          .section{ grid-template-columns: 1fr; }
          .stage{ min-height: 420px; }
          .phone{ width: 280px; right: 12px; }
        }
      `}</style>

      <div className="wrap">
        <header className="topbar">
          <div className="brand">
            <div className="mark" />
            <div>BuildU</div>
          </div>

          <div className="nav">
            <a className="btn" href="/app/quotes">Open app</a>
            <button
              className="btn btnPrimary"
              onClick={handleInstall}
              disabled={!canInstall || installStatus === "prompting" || installStatus === "installed"}
              style={{ opacity: !canInstall || installStatus === "prompting" || installStatus === "installed" ? 0.72 : 1 }}
              type="button"
            >
              {installLabel}
            </button>
            <a className="btn btnInk" href="/app/quotes/new">Create a quote</a>
          </div>
        </header>

        <section className="hero">
          <div>
            <div className="kicker">Voice → Quote → Send</div>
            <h1 className="h1">Quotes that move at site speed.</h1>
            <p className="sub">
              Speak the job, tidy the transcript, add line items, and send instantly via WhatsApp, SMS, or Gmail.
              Built for trades — fast, simple, and offline-first.
            </p>

            <div className="ctaRow">
              <a className="btn btnInk" href="/app/quotes/new">Start a new quote</a>
              <a className="btn" href="/app/settings">Set business details</a>
            </div>

            <div className="trust">
              <span className="pill">Offline-first</span>
              <span className="pill">Installable app</span>
              <span className="pill">WhatsApp sending</span>
              <span className="pill">Status tracking</span>
            </div>
          </div>

          <div className="stage" aria-label="Preview">
            <div className="bubble b1">
              “Quote for Mrs Jones?”
              <small>BuildU formats it instantly.</small>
            </div>
            <div className="bubble b2">
              “Looks good — send it.”
              <small>WhatsApp/SMS/Gmail.</small>
            </div>
            <div className="bubble b3">
              “Nice. Saved + tracked.”
              <small>Draft → Sent → Accepted.</small>
            </div>

            <div className="phone">
              <div className="phoneTop">
                <div>BuildU</div>
                <div className="chip">Draft</div>
              </div>

              <div className="phoneBody">
                <div className="mini">
                  <div className="row"><span className="label">Customer</span><span className="val">Mrs Jones</span></div>
                  <div className="row"><span className="label">Total</span><span className="val">£350.00</span></div>
                </div>

                <div className="mini">
                  <div className="label" style={{ fontSize: 12, fontWeight: 900 }}>Price trend</div>
                  <svg viewBox="0 0 260 70" width="100%" height="70" aria-hidden="true">
                    <path d="M0,54 C30,48 44,58 72,44 C94,33 120,42 142,30 C165,17 192,30 210,18 C230,5 248,16 260,10"
                          fill="none" stroke="rgba(255,177,92,0.95)" strokeWidth="3.5" strokeLinecap="round"/>
                    <path d="M0,54 C30,48 44,58 72,44 C94,33 120,42 142,30 C165,17 192,30 210,18 C230,5 248,16 260,10 L260,70 L0,70 Z"
                          fill="rgba(255,177,92,0.12)"/>
                  </svg>
                </div>

                <div className="mini">
                  <div className="row"><span className="label">Send</span><span className="val">WhatsApp</span></div>
                  <div className="row" style={{ opacity: 0.74 }}>
                    <span>Labour £200 • Materials £150</span>
                    <span><b>Total £350</b></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid3">
          <div className="card">
            <div className="cardTitle">Voice input that actually helps</div>
            <div className="cardText">Tap mic, speak naturally, then edit transcript if needed. No fuss.</div>
          </div>
          <div className="card">
            <div className="cardTitle">Professional send in one tap</div>
            <div className="cardText">WhatsApp, SMS, Gmail Web + copy fallback. Marks the quote as Sent.</div>
          </div>
          <div className="card">
            <div className="cardTitle">Branding + terms included</div>
            <div className="cardText">Business details and terms auto-append so every quote looks consistent.</div>
          </div>
        </section>

        <section className="section">
          <div className="panel">
            <div className="kicker">How it works</div>
            <div className="step">
              <div className="num">1</div>
              <div>
                <div style={{ fontWeight: 980, letterSpacing: -0.2 }}>Speak the job</div>
                <div style={{ opacity: 0.78, marginTop: 3, fontSize: 13.5, lineHeight: 1.45 }}>
                  Dictate the work and rough pricing. BuildU captures the transcript.
                </div>
              </div>
            </div>
            <div className="step">
              <div className="num">2</div>
              <div>
                <div style={{ fontWeight: 980, letterSpacing: -0.2 }}>Edit line items</div>
                <div style={{ opacity: 0.78, marginTop: 3, fontSize: 13.5, lineHeight: 1.45 }}>
                  Add labour/materials, quantities and unit prices. Totals update automatically.
                </div>
              </div>
            </div>
            <div className="step">
              <div className="num">3</div>
              <div>
                <div style={{ fontWeight: 980, letterSpacing: -0.2 }}>Send instantly</div>
                <div style={{ opacity: 0.78, marginTop: 3, fontSize: 13.5, lineHeight: 1.45 }}>
                  One tap to send via WhatsApp/SMS/Gmail and keep it tracked by status.
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="kicker">Why it’s better</div>
            <div className="cardText">
              BuildU is built for the moment you’re on-site: quick capture, quick tidy, quick send — even with poor signal.
              Everything is saved on-device and ready to reuse.
            </div>
            <div className="trust" style={{ marginTop: 10 }}>
              <span className="pill">Works offline</span>
              <span className="pill">Saved on this device</span>
              <span className="pill">Fast repeat quoting</span>
              <span className="pill">Minimal admin</span>
            </div>
            <div className="ctaRow" style={{ marginTop: 12 }}>
              <a className="btn btnInk" href="/app/quotes">Open quotes</a>
              <button
                className="btn btnPrimary"
                onClick={handleInstall}
                disabled={!canInstall || installStatus === "prompting" || installStatus === "installed"}
                style={{ opacity: !canInstall || installStatus === "prompting" || installStatus === "installed" ? 0.72 : 1 }}
                type="button"
              >
                {installLabel}
              </button>
            </div>
          </div>
        </section>

        <section className="band">
          <div>
            <div className="bandTitle">Download and start today</div>
            <div className="bandSub">
              Open the app, create a quote, then install for one-tap access. iPhone: Share → Add to Home Screen.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="btn btnPrimary" href="/app/quotes/new">Create a quote</a>
            <a className="btn" href="/app/settings">Business details</a>
          </div>
        </section>

        <div className="footer">
          <div>BuildU • V1</div>
          <div>Tip: your data is saved per device (offline-first)</div>
        </div>
      </div>
    </main>
  );
}

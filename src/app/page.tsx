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
        /* Landing page is intentionally LIGHT.
           App (/app/*) remains dark via its own layout. */
        :root { color-scheme: light; }
        * { box-sizing: border-box; }

        .lp{
          min-height: 100vh;
          background:
            radial-gradient(900px 520px at 15% -10%, rgba(56,120,255,0.20), transparent 55%),
            radial-gradient(900px 520px at 85% 0%, rgba(255,160,64,0.18), transparent 55%),
            linear-gradient(180deg, #ffffff 0%, #f6f8ff 60%, #ffffff 100%);
          color: #0b1220;
        }

        .wrap{
          max-width: 1100px;
          margin: 0 auto;
          padding: 18px 14px 42px;
        }

        .topbar{
          position: sticky;
          top: 0;
          z-index: 30;
          padding: 12px 0;
          background: rgba(255,255,255,0.68);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(15,23,42,0.08);
        }

        .topRow{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
          flex-wrap: wrap;
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
          background: linear-gradient(135deg, #1f7aec, #8cbcff);
          box-shadow: 0 10px 24px rgba(31,122,236,0.18);
          position: relative;
        }
        .mark:after{
          content:"";
          position:absolute;
          inset: 9px;
          border-radius: 9px;
          background: linear-gradient(135deg, #ff9b3f, #ffd7aa);
        }

        .actions{
          display:flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items:center;
        }

        .btn{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding: 12px 14px;
          border-radius: 16px;
          font-weight: 950;
          text-decoration: none;
          border: 1px solid rgba(15,23,42,0.12);
          background: rgba(255,255,255,0.75);
          color: #0b1220;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(15,23,42,0.06);
        }

        .btnPrimary{
          border: 1px solid rgba(31,122,236,0.22);
          background: linear-gradient(135deg, #1f7aec, #8cbcff);
          color: white;
          box-shadow: 0 14px 26px rgba(31,122,236,0.18);
        }

        .btnWarm{
          border: 1px solid rgba(255,155,63,0.28);
          background: linear-gradient(135deg, #ff9b3f, #ffd7aa);
          color: #0b1220;
          box-shadow: 0 14px 26px rgba(255,155,63,0.16);
        }

        .hero{
          padding: 28px 0 10px;
          display:grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 18px;
          align-items: start;
        }

        .kicker{
          font-size: 12.5px;
          font-weight: 900;
          letter-spacing: 0.22px;
          text-transform: uppercase;
          color: rgba(15,23,42,0.62);
        }

        .h1{
          margin: 8px 0 0;
          font-size: 46px;
          line-height: 1.03;
          font-weight: 980;
          letter-spacing: -1.0px;
        }

        .sub{
          margin: 10px 0 0;
          font-size: 16.5px;
          line-height: 1.55;
          color: rgba(15,23,42,0.78);
          max-width: 62ch;
        }

        .ctaRow{
          display:flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        .trustRow{
          display:flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 14px;
          color: rgba(15,23,42,0.70);
          font-size: 13px;
          font-weight: 750;
        }

        .pill{
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(15,23,42,0.10);
          background: rgba(255,255,255,0.75);
          box-shadow: 0 10px 18px rgba(15,23,42,0.05);
        }

        .demo{
          border-radius: 22px;
          border: 1px solid rgba(15,23,42,0.10);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 18px 40px rgba(15,23,42,0.10);
          overflow: hidden;
        }

        .demoTop{
          padding: 12px 12px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
          border-bottom: 1px solid rgba(15,23,42,0.08);
          background: rgba(246,248,255,0.75);
        }

        .demoTitle{
          font-weight: 950;
          letter-spacing: -0.3px;
        }

        .demoBody{
          padding: 12px;
          display:grid;
          gap: 10px;
        }

        .miniCard{
          border-radius: 18px;
          border: 1px solid rgba(15,23,42,0.10);
          background: rgba(255,255,255,0.75);
          padding: 12px;
          display:grid;
          gap: 8px;
        }

        .miniRow{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
        }

        .miniLabel{
          font-size: 12px;
          font-weight: 900;
          color: rgba(15,23,42,0.62);
          text-transform: uppercase;
          letter-spacing: 0.2px;
        }

        .miniValue{
          font-weight: 950;
          letter-spacing: -0.2px;
        }

        .grid3{
          margin-top: 18px;
          display:grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .feature{
          border-radius: 22px;
          border: 1px solid rgba(15,23,42,0.10);
          background: rgba(255,255,255,0.78);
          padding: 14px;
          box-shadow: 0 14px 28px rgba(15,23,42,0.08);
          display:grid;
          gap: 8px;
        }

        .ftTitle{
          font-weight: 980;
          letter-spacing: -0.25px;
          font-size: 15px;
        }

        .ftText{
          color: rgba(15,23,42,0.72);
          font-size: 13.5px;
          line-height: 1.45;
        }

        .how{
          margin-top: 18px;
          border-radius: 22px;
          border: 1px solid rgba(15,23,42,0.10);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 14px 28px rgba(15,23,42,0.08);
          padding: 14px;
        }

        .steps{
          display:grid;
          gap: 10px;
          margin-top: 10px;
        }

        .step{
          display:flex;
          gap: 10px;
          align-items:flex-start;
          padding: 12px;
          border-radius: 18px;
          border: 1px solid rgba(15,23,42,0.10);
          background: rgba(246,248,255,0.65);
        }

        .num{
          width: 30px; height: 30px;
          border-radius: 12px;
          display:grid;
          place-items:center;
          font-weight: 950;
          background: rgba(31,122,236,0.10);
          border: 1px solid rgba(31,122,236,0.18);
          color: rgba(15,23,42,0.88);
          flex: 0 0 auto;
          margin-top: 1px;
        }

        .stTitle{ margin: 0; font-weight: 980; letter-spacing: -0.2px; }
        .stText{ margin: 3px 0 0; color: rgba(15,23,42,0.72); font-size: 13.5px; line-height: 1.45; }

        .bottomCta{
          margin-top: 18px;
          padding: 16px;
          border-radius: 24px;
          border: 1px solid rgba(15,23,42,0.10);
          background: linear-gradient(135deg, rgba(31,122,236,0.10), rgba(255,155,63,0.12));
          display:flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .bottomText{
          display:grid;
          gap: 2px;
        }

        .bottomTitle{
          font-weight: 980;
          letter-spacing: -0.3px;
        }

        .bottomSub{
          color: rgba(15,23,42,0.72);
          font-size: 13.5px;
        }

        .footer{
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid rgba(15,23,42,0.10);
          color: rgba(15,23,42,0.55);
          font-size: 12.5px;
          display:flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        @media (max-width: 920px){
          .hero{ grid-template-columns: 1fr; }
          .h1{ font-size: 38px; }
          .grid3{ grid-template-columns: 1fr; }
        }

        @media (max-width: 860px){
          .btn{ width: 100%; }
          .actions{ width: 100%; }
          .ctaRow{ display:grid; grid-template-columns: 1fr; }
          .trustRow{ gap: 8px; }
          .pill{ width: fit-content; }
        }
      `}</style>

      <div className="wrap">
        <div className="topbar">
          <div className="topRow">
            <div className="brand">
              <span className="mark" />
              <span>BuildU</span>
            </div>

            <div className="actions">
              <a className="btn" href="/app/quotes">Open app</a>

              <button
                type="button"
                className="btn btnWarm"
                onClick={handleInstall}
                disabled={!canInstall || installStatus === "prompting" || installStatus === "installed"}
                style={{ opacity: !canInstall || installStatus === "prompting" || installStatus === "installed" ? 0.70 : 1 }}
              >
                {installLabel}
              </button>

              <a className="btn btnPrimary" href="/app/quotes/new">Create a quote</a>
            </div>
          </div>
        </div>

        <section className="hero">
          <div>
            <div className="kicker">Mobile-first quoting • V1</div>
            <h1 className="h1">Speak it. Price it. Send it.</h1>
            <p className="sub">
              BuildU turns a quick voice note into a professional quote you can edit and send instantly.
              Works offline, saves on-device, and sends via WhatsApp, SMS or Gmail.
            </p>

            <div className="ctaRow">
              <a className="btn btnPrimary" href="/app/quotes/new">Start a new quote</a>
              <a className="btn" href="/app/settings">Add business details</a>
            </div>

            <div className="trustRow">
              <span className="pill">Offline-first</span>
              <span className="pill">No login needed</span>
              <span className="pill">1-tap WhatsApp send</span>
              <span className="pill">Installable app</span>
            </div>
          </div>

          <div className="demo" aria-label="BuildU preview">
            <div className="demoTop">
              <div className="demoTitle">Preview</div>
              <div style={{ fontSize: 12.5, color: "rgba(15,23,42,0.62)", fontWeight: 850 }}>
                Quotes • Send • Win
              </div>
            </div>

            <div className="demoBody">
              <div className="miniCard">
                <div className="miniRow">
                  <div className="miniLabel">Customer</div>
                  <div className="miniValue">Mrs Jones</div>
                </div>
                <div className="miniRow">
                  <div className="miniLabel">Total</div>
                  <div className="miniValue">£350.00</div>
                </div>
                <div className="miniRow">
                  <div className="miniLabel">Status</div>
                  <div className="pill" style={{ padding: "6px 10px" }}>Draft</div>
                </div>
              </div>

              <div className="miniCard">
                <div className="miniLabel">Message format</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.4, color: "rgba(15,23,42,0.74)" }}>
                  Quote for Mrs Jones<br />
                  Labour: £200<br />
                  Materials: £150<br />
                  <b>Total: £350</b><br />
                  Terms included automatically.
                </div>
              </div>

              <div className="miniCard" style={{ display: "grid", gap: 8 }}>
                <div className="miniLabel">Send options</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div className="btn btnWarm" style={{ padding: "10px 10px", borderRadius: 14 }}>WhatsApp</div>
                  <div className="btn" style={{ padding: "10px 10px", borderRadius: 14 }}>SMS</div>
                  <div className="btn" style={{ padding: "10px 10px", borderRadius: 14 }}>Gmail</div>
                  <div className="btn" style={{ padding: "10px 10px", borderRadius: 14 }}>Copy</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid3">
          <div className="feature">
            <div className="ftTitle">Voice → quote in seconds</div>
            <div className="ftText">Dictate on-site, then tidy the transcript and line items without friction.</div>
          </div>
          <div className="feature">
            <div className="ftTitle">Professional sending</div>
            <div className="ftText">Send by WhatsApp/SMS/Gmail. BuildU marks the quote as Sent automatically.</div>
          </div>
          <div className="feature">
            <div className="ftTitle">Branding included</div>
            <div className="ftText">Business name, phone, email, address and terms are appended every time.</div>
          </div>
        </section>

        <section className="how">
          <div className="kicker">How it works</div>
          <div className="steps">
            <div className="step">
              <div className="num">1</div>
              <div>
                <p className="stTitle">Speak the job</p>
                <p className="stText">Tap mic, talk through the work and pricing. BuildU captures the transcript.</p>
              </div>
            </div>
            <div className="step">
              <div className="num">2</div>
              <div>
                <p className="stTitle">Edit and total</p>
                <p className="stText">Add line items, quantities and unit prices. Totals update automatically.</p>
              </div>
            </div>
            <div className="step">
              <div className="num">3</div>
              <div>
                <p className="stTitle">Send instantly</p>
                <p className="stText">One tap to send via WhatsApp/SMS/Gmail. Keep status tracked in-app.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bottomCta">
          <div className="bottomText">
            <div className="bottomTitle">Ready to try it on your phone?</div>
            <div className="bottomSub">Open the app, create a quote, then install for one-tap access.</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="btn btnPrimary" href="/app/quotes">Open BuildU</a>
            <button
              type="button"
              className="btn btnWarm"
              onClick={handleInstall}
              disabled={!canInstall || installStatus === "prompting" || installStatus === "installed"}
              style={{ opacity: !canInstall || installStatus === "prompting" || installStatus === "installed" ? 0.70 : 1 }}
            >
              {installLabel}
            </button>
          </div>
        </section>

        <div className="footer">
          <div>BuildU • Offline-first • Saved on-device</div>
          <div>Tip: iPhone → Share → Add to Home Screen</div>
        </div>
      </div>
    </main>
  );
}

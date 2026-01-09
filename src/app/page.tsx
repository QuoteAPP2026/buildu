"use client";

import { useEffect, useMemo, useState } from "react";

type InstallStatus = "idle" | "ready" | "prompting" | "installed";

function Icon({ name }: { name: "mic" | "bolt" | "shield" | "send" | "check" | "spark" | "offline" | "quote" }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none" as const, xmlns: "http://www.w3.org/2000/svg" };
  const stroke = "currentColor";
  const sw = 2;

  switch (name) {
    case "mic":
      return (
        <svg {...common}>
          <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M19 11a7 7 0 0 1-14 0" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M12 18v3" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M8 21h8" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 2 20 6v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "send":
      return (
        <svg {...common}>
          <path d="M22 2 11 13" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M22 2 15 22l-4-9-9-4 20-7Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M20 6 9 17l-5-5" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 2l1.2 4.2L17 7.5l-3.8 1.3L12 13l-1.2-4.2L7 7.5l3.8-1.3L12 2Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M19 13l.7 2.4L22 16l-2.3.6L19 19l-.7-2.4L16 16l2.3-.6L19 13Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        </svg>
      );
    case "offline":
      return (
        <svg {...common}>
          <path d="M2 8c6-5.3 14-5.3 20 0" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M5 11c4.5-4 9.5-4 14 0" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M8 14c2.8-2.5 5.2-2.5 8 0" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M12 18h0" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M4 4 20 20" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "quote":
    default:
      return (
        <svg {...common}>
          <path d="M7 17h4V7H5v6h2v4Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M17 17h4V7h-6v6h2v4Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        </svg>
      );
  }
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="badge">{children}</span>;
}

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
            radial-gradient(920px 520px at 15% 8%, rgba(124,92,255,0.33), transparent 58%),
            radial-gradient(920px 520px at 85% 12%, rgba(255,175,92,0.35), transparent 58%),
            radial-gradient(900px 520px at 60% 95%, rgba(255,105,180,0.14), transparent 62%),
            linear-gradient(135deg, #f4efff 0%, #fff3ea 55%, #f5f0ff 100%);
          color: #111126;
          overflow-x: hidden;
        }

        .wrap{
          max-width: 1120px;
          margin: 0 auto;
          padding: 18px 14px 60px;
        }

        .top{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
          padding: 8px 0 18px;
        }

        .brand{
          display:flex;
          align-items:center;
          gap: 10px;
          font-weight: 950;
          letter-spacing: -0.4px;
        }

        .mark{
          width: 38px; height: 38px;
          border-radius: 16px;
          background: radial-gradient(12px 12px at 35% 30%, rgba(255,255,255,0.78), transparent 55%),
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
          gap: 8px;
        }

        .btnDark{
          background: #111126;
          color: #fff;
          border: 1px solid rgba(17,17,38,0.18);
          box-shadow: 0 18px 34px rgba(17,17,38,0.18);
        }

        .btnSoft{
          background: rgba(255,255,255,0.35);
        }

        .btn:active{
          transform: translateY(1px);
        }

        .hero{
          display:grid;
          grid-template-columns: 1.08fr 0.92fr;
          gap: 18px;
          align-items: center;
          padding: 10px 0 10px;
        }

        .badges{
          display:flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }

        .badge{
          display:inline-flex;
          align-items:center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(17,17,38,0.12);
          background: rgba(255,255,255,0.52);
          font-weight: 900;
          font-size: 12.5px;
          box-shadow: 0 12px 26px rgba(17,17,38,0.06);
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
          opacity: 0.80;
          max-width: 62ch;
        }

        .cta{
          margin-top: 16px;
          display:flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items:center;
        }

        .installHint{
          margin-top: 10px;
          font-size: 12.5px;
          opacity: 0.72;
          font-weight: 750;
        }

        .scene{
          position: relative;
          min-height: 500px;
        }

        .blob{
          position:absolute;
          border-radius: 999px;
          pointer-events:none;
          z-index: 0;
          opacity: 0.95;
        }

        .blobA{
          width: 210px; height: 210px;
          left: -14px; top: 18px;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.55), transparent 55%),
                      linear-gradient(135deg, rgba(124,92,255,1), rgba(124,92,255,0.55));
          box-shadow: 0 34px 76px rgba(124,92,255,0.20);
        }

        .blobB{
          width: 240px; height: 240px;
          right: -18px; top: 30px;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.55), transparent 55%),
                      linear-gradient(135deg, rgba(255,175,92,1), rgba(255,105,180,0.55));
          box-shadow: 0 34px 76px rgba(255,175,92,0.20);
        }

        .floatTag{
          position:absolute;
          z-index: 2;
          padding: 10px 12px;
          border-radius: 18px;
          border: 1px solid rgba(17,17,38,0.12);
          background: rgba(255,255,255,0.62);
          box-shadow: 0 18px 34px rgba(17,17,38,0.10);
          font-weight: 950;
          max-width: 220px;
        }

        .t1{ left: 12px; top: 10px; }
        .t2{ right: 10px; top: 84px; }
        .t3{ left: 28px; bottom: 14px; }

        .floatTag small{
          display:block;
          margin-top: 4px;
          opacity: 0.72;
          font-weight: 850;
        }

        .phoneWrap{
          position:absolute;
          left: 50%;
          top: 48%;
          transform: translate(-42%, -44%) rotate(-14deg);
          width: 380px;
          max-width: 92%;
          z-index: 1;
        }

        .phone{
          border-radius: 44px;
          background: #0f1426;
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 44px 100px rgba(17,17,38,0.35);
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
          color: rgba(234,240,255,0.94);
          font-weight: 950;
          font-size: 12.5px;
        }

        .phoneDot{
          width: 8px; height: 8px;
          border-radius: 999px;
          background: rgba(255,175,92,1);
          box-shadow: 0 0 18px rgba(255,175,92,0.55);
        }

        .pillRow{
          display:flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .chip{
          display:inline-flex;
          align-items:center;
          gap: 6px;
          padding: 7px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: rgba(234,240,255,0.90);
          font-weight: 900;
          font-size: 12px;
        }

        .grid{
          padding: 14px;
          display:grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap: 10px;
        }

        .tile{
          border-radius: 20px;
          padding: 12px;
          min-height: 84px;
          display:flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 8px;
          color: rgba(17,17,38,0.96);
          font-weight: 980;
          border: 1px solid rgba(255,255,255,0.16);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
        }

        .tile small{
          font-weight: 850;
          opacity: 0.78;
          color: rgba(17,17,38,0.72);
        }

        .tileIcon{
          width: 36px; height: 36px;
          border-radius: 16px;
          display:grid;
          place-items:center;
          background: rgba(255,255,255,0.26);
          border: 1px solid rgba(255,255,255,0.22);
        }

        .tA{ background: linear-gradient(135deg, #a59bff, #7c5cff); }
        .tB{ background: linear-gradient(135deg, #ffd1a4, #ffaf5c); }
        .tC{ background: linear-gradient(135deg, #7bffca, #42d98f); }
        .tD{ background: linear-gradient(135deg, #ffd0ef, #ff7ac8); }

        .section{
          margin-top: 18px;
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .panel{
          border-radius: 26px;
          padding: 16px;
          border: 1px solid rgba(17,17,38,0.10);
          background: rgba(255,255,255,0.55);
          box-shadow: 0 18px 40px rgba(17,17,38,0.10);
        }

        .titleSm{
          font-weight: 980;
          letter-spacing: -0.3px;
          font-size: 16px;
          margin: 0;
        }

        .muted{
          margin: 8px 0 0;
          opacity: 0.78;
          line-height: 1.55;
          font-size: 13.5px;
        }

        .steps{
          margin-top: 12px;
          display:grid;
          gap: 10px;
        }

        .step{
          display:flex;
          gap: 10px;
          align-items:flex-start;
          padding: 12px;
          border-radius: 20px;
          border: 1px solid rgba(17,17,38,0.10);
          background: rgba(255,255,255,0.42);
        }

        .num{
          width: 32px; height: 32px;
          border-radius: 14px;
          display:grid;
          place-items:center;
          font-weight: 980;
          background: rgba(124,92,255,0.14);
          border: 1px solid rgba(124,92,255,0.22);
        }

        .stepTitle{
          font-weight: 980;
          margin: 0;
          letter-spacing: -0.2px;
        }
        .stepText{
          margin: 4px 0 0;
          opacity: 0.76;
          font-size: 13.5px;
          line-height: 1.45;
        }

        .featureGrid{
          margin-top: 12px;
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .feat{
          border-radius: 22px;
          padding: 12px;
          border: 1px solid rgba(17,17,38,0.10);
          background: rgba(255,255,255,0.40);
          display:grid;
          gap: 8px;
        }

        .featRow{
          display:flex;
          gap: 10px;
          align-items:flex-start;
        }

        .featIcon{
          width: 38px; height: 38px;
          border-radius: 16px;
          display:grid;
          place-items:center;
          background: rgba(17,17,38,0.06);
          border: 1px solid rgba(17,17,38,0.10);
        }

        .featTitle{
          font-weight: 980;
          margin: 0;
          letter-spacing: -0.2px;
          font-size: 14px;
        }

        .featText{
          margin: 3px 0 0;
          opacity: 0.78;
          font-size: 13px;
          line-height: 1.45;
        }

        .faq{
          margin-top: 12px;
          display:grid;
          gap: 10px;
        }

        details{
          border: 1px solid rgba(17,17,38,0.10);
          background: rgba(255,255,255,0.42);
          border-radius: 20px;
          padding: 12px;
        }

        summary{
          cursor: pointer;
          font-weight: 980;
          letter-spacing: -0.2px;
          list-style: none;
        }

        summary::-webkit-details-marker{ display:none; }

        .answer{
          margin-top: 8px;
          opacity: 0.78;
          font-size: 13.5px;
          line-height: 1.55;
        }

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

        .footerBand .sub2{
          margin-top: 4px;
          opacity: 0.82;
          font-size: 13.5px;
          max-width: 70ch;
          line-height: 1.45;
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
          .h1{ font-size: 44px; }
          .scene{ min-height: 520px; }
          .phoneWrap{ transform: translate(-50%, -44%) rotate(-12deg); }
        }

        @media (max-width: 860px){
          .btn{ width: 100%; }
          .nav{ width: 100%; }
          .cta{ display:grid; grid-template-columns: 1fr; }
          .scene{ min-height: 560px; }
          .phoneWrap{ left: 50%; transform: translate(-50%, -46%) rotate(-10deg); }
          .section{ grid-template-columns: 1fr; }
          .featureGrid{ grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="wrap">
        <header className="top">
          <div className="brand">
            <div className="mark" />
            <div>BuildU</div>
          </div>

          <nav className="nav">
            <a className="btn btnSoft" href="/app/quotes">
              <Icon name="quote" /> Open app
            </a>

            <button
              className="btn btnDark"
              type="button"
              onClick={handleInstall}
              disabled={installDisabled}
              style={{ opacity: installDisabled ? 0.60 : 1 }}
            >
              <Icon name="spark" /> {installLabel}
            </button>
          </nav>
        </header>

        <section className="hero">
          <div>
            <div className="badges">
              <Badge><Icon name="bolt" /> Built for trades</Badge>
              <Badge><Icon name="offline" /> Works offline</Badge>
              <Badge><Icon name="send" /> WhatsApp sending</Badge>
            </div>

            <h1 className="h1">Quote on-site. Send in seconds.</h1>
            <p className="sub">
              BuildU turns a quick voice note into a clean, professional quote you can edit and send instantly.
              No laptop. No paperwork. No messing.
            </p>

            <div className="cta">
              <a className="btn btnDark" href="/app/quotes/new">
                <Icon name="mic" /> Start with voice
              </a>
              <a className="btn btnSoft" href="/app/settings">
                <Icon name="shield" /> Business details
              </a>
            </div>

            <div className="installHint">
              iPhone: Share → Add to Home Screen. Android: tap “Install app”.
            </div>
          </div>

          <div className="scene">
            <div className="blob blobA" />
            <div className="blob blobB" />

            <div className="floatTag t1">
              Speak the job
              <small>Transcript saved & editable</small>
            </div>
            <div className="floatTag t2">
              Send instantly
              <small>WhatsApp • SMS • Gmail</small>
            </div>
            <div className="floatTag t3">
              Stay organised
              <small>Draft → Sent → Accepted</small>
            </div>

            <div className="phoneWrap">
              <div className="phone">
                <div className="phoneTop">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="phoneDot" />
                    <span>BuildU</span>
                  </div>
                  <div className="pillRow">
                    <span className="chip"><Icon name="check" /> Draft</span>
                    <span className="chip"><Icon name="send" /> WhatsApp</span>
                  </div>
                </div>

                <div className="grid">
                  <div className="tile tA">
                    <div className="tileIcon"><Icon name="mic" /></div>
                    <div>Voice input<br /><small>Capture fast</small></div>
                  </div>

                  <div className="tile tB">
                    <div className="tileIcon"><Icon name="quote" /></div>
                    <div>Line items<br /><small>Total auto</small></div>
                  </div>

                  <div className="tile tC">
                    <div className="tileIcon"><Icon name="check" /></div>
                    <div>Status<br /><small>Draft → Sent</small></div>
                  </div>

                  <div className="tile tD">
                    <div className="tileIcon"><Icon name="send" /></div>
                    <div>Send<br /><small>WhatsApp/SMS</small></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="panel">
            <h2 className="titleSm">How it works</h2>
            <p className="muted">
              A simple workflow designed for the moment you’re on-site.
            </p>

            <div className="steps">
              <div className="step">
                <div className="num">1</div>
                <div>
                  <p className="stepTitle">Talk through the job</p>
                  <p className="stepText">Hit mic, speak naturally. BuildU captures your transcript so you don’t forget details.</p>
                </div>
              </div>

              <div className="step">
                <div className="num">2</div>
                <div>
                  <p className="stepTitle">Tidy + price</p>
                  <p className="stepText">Edit transcript, add line items, quantities and prices. Totals update instantly.</p>
                </div>
              </div>

              <div className="step">
                <div className="num">3</div>
                <div>
                  <p className="stepTitle">Send and track</p>
                  <p className="stepText">Send via WhatsApp/SMS/Gmail. Quote status stays organised in your list.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <h2 className="titleSm">Built for real-world quoting</h2>
            <p className="muted">
              No fluff. Just the features that save you time and help you win jobs.
            </p>

            <div className="featureGrid">
              <div className="feat">
                <div className="featRow">
                  <div className="featIcon"><Icon name="offline" /></div>
                  <div>
                    <p className="featTitle">Offline-first</p>
                    <p className="featText">Works with bad signal. Quotes save on-device and keep syncing locally.</p>
                  </div>
                </div>
              </div>

              <div className="feat">
                <div className="featRow">
                  <div className="featIcon"><Icon name="send" /></div>
                  <div>
                    <p className="featTitle">One-tap sending</p>
                    <p className="featText">WhatsApp, SMS, Gmail Web — plus copy fallback for anything else.</p>
                  </div>
                </div>
              </div>

              <div className="feat">
                <div className="featRow">
                  <div className="featIcon"><Icon name="shield" /></div>
                  <div>
                    <p className="featTitle">Branding + terms</p>
                    <p className="featText">Business name, phone, email and terms appended automatically.</p>
                  </div>
                </div>
              </div>

              <div className="feat">
                <div className="featRow">
                  <div className="featIcon"><Icon name="bolt" /></div>
                  <div>
                    <p className="featTitle">Fast repeat quotes</p>
                    <p className="featText">Same layout every time. Less admin, more jobs sent out.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="cta" style={{ marginTop: 14 }}>
              <a className="btn btnDark" href="/app/quotes/new"><Icon name="spark" /> Create a quote</a>
              <a className="btn btnSoft" href="/app/quotes"><Icon name="quote" /> View quotes</a>
            </div>
          </div>
        </section>

        <section className="panel" style={{ marginTop: 18 }}>
          <h2 className="titleSm">FAQ</h2>
          <div className="faq">
            <details>
              <summary>How do I install it on iPhone?</summary>
              <div className="answer">
                Open the site in Safari → tap Share → <b>Add to Home Screen</b>. That gives you an app icon and full-screen mode.
              </div>
            </details>

            <details>
              <summary>Where is my data saved?</summary>
              <div className="answer">
                V1 is offline-first — quotes are stored on the device you’re using. (Later we can add accounts + cloud sync.)
              </div>
            </details>

            <details>
              <summary>What does “Send” support?</summary>
              <div className="answer">
                WhatsApp, SMS and Gmail Web are built-in. There’s also “Copy message” so you can paste into anything.
              </div>
            </details>
          </div>
        </section>

        <section className="footerBand">
          <div>
            <div className="title">Ready to send your next quote faster?</div>
            <div className="sub2">Create one now, then install it for one-tap access on-site.</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="btn" href="/app/quotes">Open app</a>
            <button className="btn btnDark" type="button" onClick={handleInstall} disabled={installDisabled} style={{ opacity: installDisabled ? 0.60 : 1 }}>
              <Icon name="spark" /> {installLabel}
            </button>
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

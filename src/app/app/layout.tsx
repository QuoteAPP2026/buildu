"use client";

import React from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }

        .bg {
          min-height: 100vh;
          background:
            radial-gradient(900px 520px at 15% -10%, rgba(60,120,255,0.18), transparent 55%),
            radial-gradient(900px 520px at 85% 0%, rgba(255,168,76,0.14), transparent 55%),
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

        .brand {
          font-weight: 950;
          letter-spacing: -0.4px;
          font-size: 16px;
          margin-bottom: 10px;
          opacity: 0.95;
        }

        .nav {
          display: grid;
          gap: 10px;
        }

        .link {
          text-decoration: none;
          color: rgba(234,240,255,0.9);
          font-weight: 900;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.12);
        }

        .link:hover {
          background: rgba(0,0,0,0.18);
          border-color: rgba(255,255,255,0.14);
        }

        .main {
          min-width: 0;
        }

        /* ===== MOBILE FIRST EXPERIENCE ===== */
        .mobileHeader {
          display: none;
          position: sticky;
          top: 0;
          z-index: 20;
          padding: 10px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          background: rgba(7,11,20,0.72);
          backdrop-filter: blur(10px);
        }

        .mobileHeaderRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          max-width: 980px;
          margin: 0 auto;
        }

        .mobileTitle {
          font-weight: 950;
          letter-spacing: -0.3px;
        }

        .mobileSub {
          font-size: 12.5px;
          opacity: 0.70;
          font-weight: 750;
          margin-top: 2px;
        }

        .mobileNav {
          display: none;
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 30;
          padding: 10px 12px max(10px, env(safe-area-inset-bottom));
          background: rgba(7,11,20,0.78);
          border-top: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
        }

        .mobileNavInner {
          max-width: 980px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .mobileTab {
          text-decoration: none;
          color: rgba(234,240,255,0.92);
          font-weight: 950;
          text-align: center;
          padding: 12px 12px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.18);
        }

        .contentPad {
          padding-bottom: 0;
        }

        @media (max-width: 860px) {
          /* Kill sidebar layout on mobile */
          .shell {
            grid-template-columns: 1fr;
            padding: 0;
            gap: 0;
            max-width: 980px;
          }

          .side { display: none; }
          .mobileHeader { display: block; }
          .mobileNav { display: block; }

          /* Full-width content with proper gutters */
          .main {
            padding: 12px;
            padding-bottom: calc(12px + 82px + env(safe-area-inset-bottom));
          }
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
            <a className="link" href="/app/quotes" style={{ padding: "8px 10px", borderRadius: 12 }}>
              Open
            </a>
          </div>
        </header>

        <div className="shell">
          {/* Desktop sidebar */}
          <aside className="side card">
            <div className="brand">BuildU</div>
            <nav className="nav">
              <a className="link" href="/app/quotes">Quotes</a>
              <a className="link" href="/app/settings">Settings</a>
            </nav>
          </aside>

          <main className="main">{children}</main>
        </div>

        {/* Mobile bottom nav */}
        <nav className="mobileNav">
          <div className="mobileNavInner">
            <a className="mobileTab" href="/app/quotes">Quotes</a>
            <a className="mobileTab" href="/app/settings">Settings</a>
          </div>
        </nav>
      </div>
    </>
  );
}

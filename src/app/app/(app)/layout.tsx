"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type NavItem = {
  key: string;
  label: string;
  href: string;
  short: string;
  icon: React.ReactNode;
};

function IconHome({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        opacity={active ? "1" : "0.85"}
        strokeLinejoin="round"
      />
      <path
        d="M9.5 22v-7a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v7"
        stroke="currentColor"
        strokeWidth="2"
        opacity={active ? "1" : "0.85"}
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconDoc({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="2"
        opacity={active ? "1" : "0.85"}
        strokeLinejoin="round"
      />
      <path
        d="M14 3v4a2 2 0 0 0 2 2h4"
        stroke="currentColor"
        strokeWidth="2"
        opacity={active ? "1" : "0.85"}
        strokeLinejoin="round"
      />
      <path
        d="M8 12h8M8 16h6"
        stroke="currentColor"
        strokeWidth="2"
        opacity={active ? "1" : "0.85"}
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCog({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
        stroke="currentColor"
        strokeWidth="2"
        opacity={active ? "1" : "0.85"}
      />
      <path
        d="M19.4 15a8.3 8.3 0 0 0 .1-1l2-1.2-2-3.4-2.2.7a7.6 7.6 0 0 0-1.7-1l-.3-2.3H8.7l-.3 2.3c-.6.3-1.2.6-1.7 1l-2.2-.7-2 3.4 2 1.2a8.3 8.3 0 0 0 .1 1c0 .3 0 .7.1 1l-2 1.2 2 3.4 2.2-.7c.5.4 1.1.7 1.7 1l.3 2.3h6.6l.3-2.3c.6-.3 1.2-.6 1.7-1l2.2.7 2-3.4-2-1.2c.1-.3.1-.7.1-1z"
        stroke="currentColor"
        strokeWidth="2"
        opacity={active ? "1" : "0.85"}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [email, setEmail] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setEmail(data?.session?.user?.email ?? null);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setEmail(session?.user?.email ?? null);
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

  function isActive(href: string) {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const nav: NavItem[] = useMemo(
    () => [
      { key: "dashboard", label: "Dashboard", short: "Home", href: "/app/dashboard", icon: <IconHome /> },
      { key: "quotes", label: "Quotes", short: "Quotes", href: "/app/quotes", icon: <IconDoc /> },
      { key: "settings", label: "Settings", short: "Settings", href: "/app/settings", icon: <IconCog /> },
    ],
    []
  );

  return (
    <>
      <style>{`
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        a { -webkit-tap-highlight-color: transparent; }

        .bg {
          min-height: 100vh;
          color: rgba(238,245,255,0.93);
          background:
            radial-gradient(1100px 600px at 10% -20%, rgba(59,130,246,0.40), transparent 55%),
            radial-gradient(900px 520px at 92% 0%, rgba(20,184,166,0.22), transparent 52%),
            radial-gradient(800px 520px at 65% 110%, rgba(245,158,11,0.10), transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,0.05), transparent 24%),
            #050912;
        }

        .noise {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.08;
          background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E");
          mix-blend-mode: overlay;
        }

        .shell {
          max-width: 1240px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 290px 1fr;
          gap: 16px;
          padding: 16px;
        }

        .glass {
          border: 1px solid rgba(255,255,255,0.11);
          background: rgba(255,255,255,0.055);
          border-radius: 22px;
          backdrop-filter: blur(16px);
          box-shadow:
            0 22px 70px rgba(0,0,0,0.55),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .side {
          position: sticky;
          top: 14px;
          height: fit-content;
          padding: 14px;
        }

        .brandCard {
          padding: 14px 14px 12px 14px;
          border-radius: 18px;
          background:
            linear-gradient(135deg, rgba(59,130,246,0.22), rgba(20,184,166,0.10)),
            rgba(0,0,0,0.18);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.07);
          display: grid;
          gap: 8px;
        }

        .brandTop { display:flex; align-items:center; justify-content:space-between; gap: 10px; }
        .logo {
          display:flex; align-items:center; gap: 10px;
          font-weight: 980;
          letter-spacing: -0.45px;
          font-size: 16.5px;
          line-height: 1.1;
        }

        .mark {
          width: 36px; height: 36px;
          border-radius: 12px;
          background:
            radial-gradient(14px 14px at 30% 30%, rgba(255,255,255,0.55), rgba(255,255,255,0.0)),
            linear-gradient(135deg, rgba(59,130,246,0.95), rgba(20,184,166,0.75));
          box-shadow:
            0 16px 40px rgba(59,130,246,0.20),
            0 14px 34px rgba(20,184,166,0.14);
          border: 1px solid rgba(255,255,255,0.16);
        }

        .pill {
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 12px;
          letter-spacing: -0.15px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.18);
          color: rgba(238,245,255,0.86);
          white-space: nowrap;
        }

        .tagline {
          opacity: 0.84;
          font-size: 12.75px;
          line-height: 1.35;
        }

        .nav { margin-top: 12px; display: grid; gap: 8px; }

        .navItem {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 12px;
          border-radius: 16px;
          text-decoration: none;
          color: rgba(238,245,255,0.90);
          border: 1px solid rgba(255,255,255,0.11);
          background: rgba(0,0,0,0.18);
          transition: transform 120ms ease, background 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
        }

        .navLeft { display:flex; align-items:center; gap: 10px; min-width: 0; }
        .navIcon {
          width: 36px;
          height: 36px;
          border-radius: 14px;
          display:flex; align-items:center; justify-content:center;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.04);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
          flex: 0 0 auto;
        }
        .navLabel {
          font-weight: 950;
          letter-spacing: -0.25px;
          font-size: 13.75px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .navHint { opacity: 0.55; font-size: 12px; }

        .navItem:hover { background: rgba(255,255,255,0.06); transform: translateY(-0.5px); }

        .navItem.active {
          background:
            linear-gradient(135deg, rgba(59,130,246,0.22), rgba(20,184,166,0.12)),
            rgba(0,0,0,0.16);
          border-color: rgba(59,130,246,0.38);
          box-shadow:
            0 18px 60px rgba(59,130,246,0.12),
            0 14px 52px rgba(20,184,166,0.08),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .navItem.active .navIcon {
          background: linear-gradient(135deg, rgba(59,130,246,0.55), rgba(20,184,166,0.30));
          border-color: rgba(255,255,255,0.16);
        }

        .authRow { margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.09); }
        .muted { opacity: 0.78; font-size: 12.5px; line-height: 1.35; word-break: break-word; }
        .btnRow { display:grid; gap: 8px; margin-top: 10px; }

        .btn {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap: 8px;
          padding: 11px 12px;
          border-radius: 16px;
          font-weight: 950;
          letter-spacing: -0.2px;
          border: 1px solid rgba(255,255,255,0.13);
          background: rgba(255,255,255,0.05);
          color: rgba(238,245,255,0.92);
          cursor: pointer;
          text-decoration: none;
          transition: transform 120ms ease, background 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
        }
        .btn:hover { background: rgba(255,255,255,0.08); transform: translateY(-0.5px); }
        .btn:active { transform: translateY(0px); }

        .btn.primary {
          background: linear-gradient(135deg, rgba(59,130,246,0.80), rgba(20,184,166,0.55));
          border-color: rgba(255,255,255,0.16);
          box-shadow:
            0 18px 56px rgba(59,130,246,0.16),
            0 14px 46px rgba(20,184,166,0.10);
        }

        .btn.ghost { background: rgba(0,0,0,0.20); border-color: rgba(255,255,255,0.11); }

        .main { min-height: calc(100vh - 32px); padding: 6px 6px 16px 6px; }
        .contentWrap { padding: 12px; }

        .mobileHeader { display:none; }
        .mobileNav { display:none; }

        @media (max-width: 900px){
          .shell { grid-template-columns: 1fr; padding: 0; gap: 0; }
          .side { display:none; }

          .mobileHeader {
            display: block;
            position: sticky;
            top: 0;
            z-index: 60;
            background: rgba(5,9,18,0.72);
            backdrop-filter: blur(18px);
            border-bottom: 1px solid rgba(255,255,255,0.09);
          }
          .mobileHeaderInner {
            max-width: 980px;
            margin: 0 auto;
            padding: 12px 12px 10px 12px;
            display: grid;
            gap: 10px;
          }
          .mobileTopRow { display:flex; align-items:center; justify-content:space-between; gap: 10px; }
          .mobileBrand { display:flex; align-items:center; gap: 10px; min-width: 0; }
          .mobileTitleWrap { display:grid; gap: 2px; min-width: 0; }
          .mobileTitle { font-weight: 980; letter-spacing: -0.5px; font-size: 16px; line-height: 1.05; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .mobileSub { opacity: 0.70; font-size: 12.5px; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .mobileActions { display:flex; align-items:center; gap: 8px; justify-content:flex-end; flex: 0 0 auto; }

          .btn.mini { padding: 9px 10px; border-radius: 14px; font-size: 12.5px; font-weight: 950; }

          .statusCard {
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap: 10px;
            padding: 10px 12px;
            border-radius: 18px;
            border: 1px solid rgba(255,255,255,0.10);
            background: rgba(255,255,255,0.045);
          }
          .statusText {
            opacity: 0.82;
            font-size: 12.5px;
            line-height: 1.25;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            max-width: 72%;
          }

          .mobileNav {
            display:block;
            position: fixed;
            left: 0; right: 0; bottom: 0;
            z-index: 70;
            padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
            background: rgba(5,9,18,0.76);
            backdrop-filter: blur(18px);
            border-top: 1px solid rgba(255,255,255,0.10);
          }

          .mobileNavInner {
            max-width: 980px;
            margin: 0 auto;
            display:grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
          }

          .tab {
            text-decoration:none;
            color: rgba(238,245,255,0.88);
            border: 1px solid rgba(255,255,255,0.11);
            background: rgba(255,255,255,0.04);
            border-radius: 18px;
            padding: 10px 10px 9px 10px;
            display:grid;
            gap: 6px;
            justify-items:center;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
            transition: transform 120ms ease, background 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
          }

          .tabIcon {
            width: 36px; height: 36px;
            border-radius: 14px;
            display:flex; align-items:center; justify-content:center;
            border: 1px solid rgba(255,255,255,0.10);
            background: rgba(0,0,0,0.18);
          }

          .tabLabel { font-weight: 950; letter-spacing: -0.2px; font-size: 12px; opacity: 0.92; }

          .tab.active {
            background: linear-gradient(135deg, rgba(59,130,246,0.22), rgba(20,184,166,0.12));
            border-color: rgba(59,130,246,0.38);
            box-shadow:
              0 18px 60px rgba(59,130,246,0.12),
              0 14px 52px rgba(20,184,166,0.08),
              inset 0 1px 0 rgba(255,255,255,0.08);
          }
          .tab.active .tabIcon {
            background: linear-gradient(135deg, rgba(59,130,246,0.55), rgba(20,184,166,0.30));
            border-color: rgba(255,255,255,0.16);
          }

          .main { padding: 12px; padding-bottom: calc(12px + 104px + env(safe-area-inset-bottom)); }
          .contentWrap { padding: 10px; }
        }
      `}</style>

      <div className="bg">
        <div className="noise" />

        {/* Mobile header */}
        <header className="mobileHeader">
          <div className="mobileHeaderInner">
            <div className="mobileTopRow">
              <div className="mobileBrand">
                <div className="mark" aria-hidden="true" />
                <div className="mobileTitleWrap">
                  <div className="mobileTitle">BuildU</div>
                  <div className="mobileSub">Voice → Quote → Send</div>
                </div>
              </div>

              <div className="mobileActions">
                {email ? (
                  <button className="btn mini ghost" onClick={logout} type="button">
                    Logout
                  </button>
                ) : (
                  <a className="btn mini primary" href="/app">Sign in</a>
                )}
              </div>
            </div>

            <div className="statusCard">
              <div className="statusText">
                {email ? (
                  <>
                    Signed in as <strong>{email}</strong>
                  </>
                ) : (
                  <>Not signed in</>
                )}
              </div>

              {email ? (
                <a className="btn mini ghost" href="/app/settings">Account</a>
              ) : (
                <a className="btn mini ghost" href="/app">Create account</a>
              )}
            </div>
          </div>
        </header>

        <div className="shell">
          {/* Desktop sidebar */}
          <aside className="side glass">
            <div className="brandCard">
              <div className="brandTop">
                <div className="logo">
                  <span className="mark" aria-hidden="true" />
                  <span>BuildU</span>
                </div>
                <span className="pill">Trade quotes</span>
              </div>
              <div className="tagline">Speak the quote. Send it in seconds. Look professional.</div>
            </div>

            <nav className="nav" aria-label="Primary">
              {nav.map((item) => {
                const active = isActive(item.href);
                return (
                  <a
                    key={item.key}
                    className={`navItem${active ? " active" : ""}`}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                  >
                    <div className="navLeft">
                      <div className="navIcon" aria-hidden="true" style={{ color: "rgba(238,245,255,0.95)" }}>
                        {React.cloneElement(item.icon as any, { active })}
                      </div>
                      <div className="navLabel">{item.label}</div>
                    </div>
                    <div className="navHint">›</div>
                  </a>
                );
              })}
            </nav>

            <div className="authRow">
              <div className="muted">
                {email ? (
                  <>
                    Signed in as <strong>{email}</strong>
                  </>
                ) : (
                  <>Not signed in</>
                )}
              </div>

              {email ? (
                <div className="btnRow">
                  <button className="btn ghost" onClick={logout} type="button">Logout</button>
                </div>
              ) : (
                <div className="btnRow">
                  <a className="btn primary" href="/app">Sign in</a>
                  <a className="btn ghost" href="/app">Create account</a>
                </div>
              )}
            </div>
          </aside>

          <main className="main">
            <div className="glass contentWrap">{children}</div>
          </main>
        </div>

        {/* Mobile bottom nav */}
        <nav className="mobileNav" aria-label="Bottom navigation">
          <div className="mobileNavInner">
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <a
                  key={item.key}
                  className={`tab${active ? " active" : ""}`}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                >
                  <div className="tabIcon" aria-hidden="true" style={{ color: "rgba(238,245,255,0.95)" }}>
                    {React.cloneElement(item.icon as any, { active })}
                  </div>
                  <div className="tabLabel">{item.short}</div>
                </a>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}

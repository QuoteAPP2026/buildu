export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#070b14", color: "#eaf0ff" }}>
      <header style={{ position: "sticky", top: 0, backdropFilter: "blur(10px)", background: "rgba(7,11,20,0.75)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#ff7a18", fontWeight: 900 }}>
              BU
            </div>
            <div>
              <div style={{ fontWeight: 950, fontSize: 18, letterSpacing: 0.2 }}>Build<span style={{ color: "#ff7a18" }}>U</span></div>
              <div style={{ fontSize: 12, color: "rgba(234,240,255,0.75)" }}>Quotes done on site</div>
            </div>
          </div>

          <nav style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <a href="#how" style={{ color: "rgba(234,240,255,0.82)", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>How it works</a>
            <a href="#pricing" style={{ color: "rgba(234,240,255,0.82)", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>Pricing</a>
            <a href="/app" style={{ padding: "10px 12px", borderRadius: 999, background: "rgba(31,191,117,0.18)", border: "1px solid rgba(31,191,117,0.35)", color: "#d9ffed", fontWeight: 900, fontSize: 13, textDecoration: "none" }}>
              Open app
            </a>
          </nav>
        </div>
      </header>

      <section style={{
        maxWidth: 1100, margin: "0 auto", padding: "28px 18px 10px",
        display: "grid", gap: 18, alignItems: "center",
        gridTemplateColumns: "1fr"
      }}>
        <style>{`
          @media (min-width: 860px) {
            .heroGrid { grid-template-columns: 1.15fr 0.85fr !important; }
          }
        `}</style>

        <div className="heroGrid" style={{ display: "grid", gap: 18, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", padding: "6px 10px", borderRadius: 999, background: "rgba(255,122,24,0.15)", border: "1px solid rgba(255,122,24,0.35)", color: "#ffd3b3", fontWeight: 900, fontSize: 12 }}>
              Voice-first quoting for trades
            </div>

            <h1 style={{ fontSize: 48, lineHeight: 1.05, margin: "14px 0 10px", letterSpacing: -0.5 }}>
              Speak the job. Add photos. Send the quote.
            </h1>

            <p style={{ fontSize: 17, lineHeight: 1.6, color: "rgba(234,240,255,0.75)", margin: "0 0 14px" }}>
              BuildU turns on-site voice notes and pictures into a clean, professional quote in under a minute.
              No typing. No spreadsheets. No admin at night.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              <a href="/app" style={{ padding: "12px 16px", borderRadius: 14, background: "#1fbf75", color: "#052014", fontWeight: 950, textDecoration: "none" }}>
                Try the app
              </a>
              <a href="#how" style={{ padding: "12px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.18)", color: "#eaf0ff", fontWeight: 950, textDecoration: "none" }}>
                How it works
              </a>
            </div>

            <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
              <div style={{ fontSize: 13, color: "rgba(234,240,255,0.78)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", padding: "10px 12px", borderRadius: 14 }}>
                <strong style={{ color: "#fff" }}>Built for:</strong> Builders • Plumbers • Electricians • Joiners
              </div>
              <div style={{ fontSize: 13, color: "rgba(234,240,255,0.78)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", padding: "10px 12px", borderRadius: 14 }}>
                <strong style={{ color: "#fff" }}>Send via:</strong> Email • WhatsApp • PDF
              </div>
              <div style={{ fontSize: 13, color: "rgba(234,240,255,0.78)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", padding: "10px 12px", borderRadius: 14 }}>
                <strong style={{ color: "#fff" }}>Outcome:</strong> Faster quotes → more jobs
              </div>
            </div>
          </div>

          <div style={{
            width: "100%",
            maxWidth: 420,
            margin: "10px auto 0",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 26,
            overflow: "hidden",
            boxShadow: "0 20px 70px rgba(0,0,0,0.45)"
          }}>
            <div style={{ display: "flex", gap: 6, padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.18)" }}>
              <div style={{ width: 10, height: 10, borderRadius: 999, background: "rgba(255,255,255,0.18)" }} />
              <div style={{ width: 10, height: 10, borderRadius: 999, background: "rgba(255,255,255,0.18)" }} />
              <div style={{ width: 10, height: 10, borderRadius: 999, background: "rgba(255,255,255,0.18)" }} />
            </div>

            <div style={{ padding: 14, display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontWeight: 950 }}>Build<span style={{ color: "#ff7a18" }}>U</span></div>
                <div style={{ fontSize: 12, color: "rgba(234,240,255,0.75)" }}>New quote</div>
              </div>

              {[
                ["🎙️", "Dictate job details", "Talk like you normally would"],
                ["📷", "Add site photos", "Snap 3–6 pictures"],
                ["📋", "Preview & send", "Email or WhatsApp in one tap"],
              ].map(([ico, t, d]) => (
                <div key={t as string} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.22)", fontSize: 20 }}>
                    {ico}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
                    <div style={{ fontWeight: 950 }}>{t}</div>
                    <div style={{ fontSize: 12, color: "rgba(234,240,255,0.75)" }}>{d}</div>
                  </div>
                  <div style={{ fontSize: 26, opacity: 0.75 }}>›</div>
                </div>
              ))}

              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 18, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                  <div>
                    <div style={{ fontWeight: 950 }}>Kitchen refit quote</div>
                    <div style={{ fontSize: 12, color: "rgba(234,240,255,0.75)", marginTop: 3 }}>Ready to send</div>
                  </div>
                  <div style={{ fontWeight: 950, color: "#ffcfb0" }}>£3,850</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  {["✉️ Email", "💬 WhatsApp", "📎 PDF"].map((c) => (
                    <div key={c} style={{ fontSize: 12, fontWeight: 900, padding: "8px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.18)" }}>
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: 12, color: "rgba(234,240,255,0.72)" }}>
                Demo UI — the MVP app flow lives at <a href="/app" style={{ color: "#d9ffed", fontWeight: 900 }}> /app</a>.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" style={{ maxWidth: 1100, margin: "0 auto", padding: "34px 18px 0" }}>
        <div style={{ maxWidth: 680, marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 28 }}>How it works</h2>
          <p style={{ margin: "6px 0 0", color: "rgba(234,240,255,0.75)", lineHeight: 1.5 }}>Three steps. Built for site life.</p>
        </div>

        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr" }}>
          <style>{`
            @media (min-width: 860px) {
              .howGrid { grid-template-columns: repeat(3, 1fr) !important; }
            }
          `}</style>

          <div className="howGrid" style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr" }}>
            {[
              ["1", "Dictate", "Talk into your phone on site. BuildU turns your voice into a clean job scope."],
              ["2", "Add photos", "Snap pictures of the job. Photos are added into the quote automatically."],
              ["3", "Send", "One tap to send via Email or WhatsApp. Quote looks professional every time."],
            ].map(([n, t, d]) => (
              <div key={n as string} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: 16 }}>
                <div style={{ width: 34, height: 34, borderRadius: 12, display: "grid", placeItems: "center", fontWeight: 950, background: "rgba(255,122,24,0.14)", border: "1px solid rgba(255,122,24,0.35)", color: "#ffd3b3" }}>
                  {n}
                </div>
                <h3 style={{ margin: "10px 0 6px" }}>{t}</h3>
                <p style={{ margin: 0, color: "rgba(234,240,255,0.75)", lineHeight: 1.55 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" style={{ maxWidth: 1100, margin: "0 auto", padding: "34px 18px 60px" }}>
        <div style={{ maxWidth: 680, marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 28 }}>Simple pricing</h2>
          <p style={{ margin: "6px 0 0", color: "rgba(234,240,255,0.75)", lineHeight: 1.5 }}>Cheaper than one lost job.</p>
        </div>

        <div className="priceGrid" style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr" }}>
          <style>{`
            @media (min-width: 860px) {
              .priceGrid { grid-template-columns: repeat(3, 1fr) !important; }
            }
          `}</style>

          {[
            ["Starter", "£19/mo", "For solo trades", ["Voice → quote", "Photo quotes", "Email + WhatsApp share"]],
            ["Pro", "£39/mo", "Most popular", ["Unlimited quotes", "Brand templates", "Quote history"]],
            ["Team", "£79/mo", "For small crews", ["Multi-user (later)", "Shared templates", "Admin controls"]],
          ].map(([plan, price, sub, bullets], idx) => (
            <div key={plan as string} style={{
              background: "rgba(255,255,255,0.06)",
              border: idx === 1 ? "1px solid rgba(31,191,117,0.40)" : "1px solid rgba(255,255,255,0.12)",
              boxShadow: idx === 1 ? "0 18px 60px rgba(31,191,117,0.14)" : "none",
              borderRadius: 18,
              padding: 16,
              display: "grid",
              gap: 10
            }}>
              <div style={{ fontWeight: 950 }}>{plan}</div>
              <div style={{ fontSize: 34, fontWeight: 950 }}>{price}</div>
              <div style={{ fontSize: 13, color: "rgba(234,240,255,0.75)" }}>{sub}</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: "rgba(234,240,255,0.9)" }}>
                {(bullets as string[]).map((b) => <li key={b} style={{ margin: "6px 0" }}>{b}</li>)}
              </ul>
              <a href="/app" style={{
                marginTop: 6,
                padding: "12px 16px",
                borderRadius: 14,
                background: idx === 1 ? "#1fbf75" : "transparent",
                border: idx === 1 ? "none" : "1px solid rgba(255,255,255,0.18)",
                color: idx === 1 ? "#052014" : "#eaf0ff",
                fontWeight: 950,
                textDecoration: "none",
                textAlign: "center"
              }}>
                {idx === 1 ? "Try the app" : "Open app"}
              </a>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.10)" }}>
          <div>
            <div style={{ fontWeight: 950 }}>Build<span style={{ color: "#ff7a18" }}>U</span></div>
            <div style={{ fontSize: 12, color: "rgba(234,240,255,0.72)" }}>© {new Date().getFullYear()} BuildU. All rights reserved.</div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#how" style={{ fontSize: 13, color: "rgba(234,240,255,0.78)", fontWeight: 800, textDecoration: "none" }}>How it works</a>
            <a href="#pricing" style={{ fontSize: 13, color: "rgba(234,240,255,0.78)", fontWeight: 800, textDecoration: "none" }}>Pricing</a>
            <a href="/app" style={{ fontSize: 13, color: "rgba(234,240,255,0.78)", fontWeight: 800, textDecoration: "none" }}>Open app</a>
          </div>
        </div>
      </section>
    </main>
  );
}

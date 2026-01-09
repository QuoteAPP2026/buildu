"use client";

import { useMemo, useState } from "react";

type Settings = {
  businessName: string;
  yourName: string;
  labourRate: number;
  markupPct: number;
  vatRate: number; // 0 or 0.2
};

type Quote = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  title: string;
  notes: string;
  hours: number;
  materials: number;
  callout: number;
  discount: number;
};

const currency = "£";
const money = (n: number) => `${currency}${Math.round(n).toLocaleString("en-GB")}`;

export default function AppPage() {
  const [settings, setSettings] = useState<Settings>({
    businessName: "BuildU Demo Ltd",
    yourName: "Dave",
    labourRate: 45,
    markupPct: 20,
    vatRate: 0,
  });

  const [quote, setQuote] = useState<Quote>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    title: "",
    notes: "",
    hours: 8,
    materials: 350,
    callout: 0,
    discount: 0,
  });

  const totals = useMemo(() => {
    const labour = (quote.hours || 0) * (settings.labourRate || 0);
    const base = labour + (quote.materials || 0) + (quote.callout || 0);
    const markup = base * ((settings.markupPct || 0) / 100);
    const subtotal = Math.max(0, base + markup - (quote.discount || 0));
    const vat = subtotal * (settings.vatRate || 0);
    const total = subtotal + vat;
    return { labour, markup, subtotal, vat, total };
  }, [quote, settings]);

  const canSend = quote.title.trim().length > 0 && quote.notes.trim().length > 0 && totals.total > 0;

  const setQ = <K extends keyof Quote>(k: K, v: Quote[K]) => setQuote((p) => ({ ...p, [k]: v }));
  const setS = <K extends keyof Settings>(k: K, v: Settings[K]) => setSettings((p) => ({ ...p, [k]: v }));

  const simulateDictation = () => {
    setQ("notes", "Supply and fit new boiler. Remove old unit, flush system, fit magnetic filter. Includes commissioning and disposal. Access is good. Estimated 1 day labour.");
    if (!quote.title) setQ("title", "New boiler installation");
  };

  const mailto = () => {
    const subject = encodeURIComponent(`Quote: ${quote.title} — ${settings.businessName}`);
    const body = encodeURIComponent(
      `Hi ${quote.customerName || ""},\n\n` +
      `Here’s your quote for: ${quote.title}\n` +
      `Total: ${money(totals.total)}\n\n` +
      `Notes:\n${quote.notes}\n\n` +
      `Thanks,\n${settings.yourName}\n${settings.businessName}\n`
    );
    const to = encodeURIComponent(quote.customerEmail || "");
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  const whatsapp = () => {
    const msg = encodeURIComponent(
      `Hi ${quote.customerName || ""} — quote for ${quote.title}. Total ${money(totals.total)}.\n\n${quote.notes}\n\n— ${settings.yourName} (${settings.businessName})`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <main style={{ minHeight: "100vh", background: "#070b14", color: "#eaf0ff" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(10px)", background: "rgba(7,11,20,0.75)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <a href="/" style={{ textDecoration: "none", color: "#eaf0ff", fontWeight: 950 }}>
              Build<span style={{ color: "#ff7a18" }}>U</span>
            </a>
            <span style={{ fontSize: 12, color: "rgba(234,240,255,0.7)" }}>MVP</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={simulateDictation} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.18)", background: "transparent", color: "#eaf0ff", fontWeight: 900, cursor: "pointer" }}>
              Demo dictation
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: 18, display: "grid", gap: 14 }}>
        <section style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: 14 }}>
          <div style={{ fontWeight: 950, marginBottom: 10 }}>Business settings</div>

          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr" }}>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
              <Field label="Business name">
                <input className="in" value={settings.businessName} onChange={(e) => setS("businessName", e.target.value)} />
              </Field>
              <Field label="Your name">
                <input className="in" value={settings.yourName} onChange={(e) => setS("yourName", e.target.value)} />
              </Field>
            </div>

            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr 1fr" }}>
              <Field label="Labour (£/hour)">
                <input className="in" type="number" value={settings.labourRate} onChange={(e) => setS("labourRate", Number(e.target.value || 0))} />
              </Field>
              <Field label="Markup (%)">
                <input className="in" type="number" value={settings.markupPct} onChange={(e) => setS("markupPct", Number(e.target.value || 0))} />
              </Field>
              <Field label="VAT">
                <select className="in" value={settings.vatRate} onChange={(e) => setS("vatRate", Number(e.target.value))}>
                  <option value={0}>No VAT</option>
                  <option value={0.2}>Add VAT (20%)</option>
                </select>
              </Field>
            </div>
          </div>
        </section>

        <section style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: 14 }}>
          <div style={{ fontWeight: 950, marginBottom: 10 }}>Quote details</div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
              <Field label="Customer name">
                <input className="in" value={quote.customerName} onChange={(e) => setQ("customerName", e.target.value)} />
              </Field>
              <Field label="Job title">
                <input className="in" value={quote.title} onChange={(e) => setQ("title", e.target.value)} placeholder="e.g. Kitchen refit" />
              </Field>
            </div>

            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
              <Field label="Customer email">
                <input className="in" value={quote.customerEmail} onChange={(e) => setQ("customerEmail", e.target.value)} placeholder="optional" />
              </Field>
              <Field label="Customer phone (WhatsApp)">
                <input className="in" value={quote.customerPhone} onChange={(e) => setQ("customerPhone", e.target.value)} placeholder="optional" />
              </Field>
            </div>

            <Field label="Job notes (dictation)">
              <textarea className="in" rows={4} value={quote.notes} onChange={(e) => setQ("notes", e.target.value)} placeholder="Describe the work..." />
            </Field>

            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
              <Field label="Hours">
                <input className="in" type="number" value={quote.hours} onChange={(e) => setQ("hours", Number(e.target.value || 0))} />
              </Field>
              <Field label="Materials (£)">
                <input className="in" type="number" value={quote.materials} onChange={(e) => setQ("materials", Number(e.target.value || 0))} />
              </Field>
              <Field label="Call-out (£)">
                <input className="in" type="number" value={quote.callout} onChange={(e) => setQ("callout", Number(e.target.value || 0))} />
              </Field>
              <Field label="Discount (£)">
                <input className="in" type="number" value={quote.discount} onChange={(e) => setQ("discount", Number(e.target.value || 0))} />
              </Field>
            </div>
          </div>
        </section>

        <section style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 950 }}>Total</div>
              <div style={{ fontSize: 12, color: "rgba(234,240,255,0.72)" }}>Labour + materials + markup {settings.vatRate ? "+ VAT" : ""}</div>
            </div>
            <div style={{ fontWeight: 950, fontSize: 20, color: "#ffcfb0" }}>{money(totals.total)}</div>
          </div>

          <div style={{ display: "grid", gap: 8, marginTop: 12, fontSize: 13, color: "rgba(234,240,255,0.8)" }}>
            <Row label="Labour" value={money(totals.labour)} />
            <Row label="Materials" value={money(quote.materials)} />
            <Row label="Call-out" value={money(quote.callout)} />
            <Row label="Markup" value={money(totals.markup)} />
            <Row label="Discount" value={`- ${money(quote.discount)}`} />
            <Row label="Subtotal" value={money(totals.subtotal)} />
            {settings.vatRate ? <Row label="VAT" value={money(totals.vat)} /> : null}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button
              disabled={!canSend}
              onClick={mailto}
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                border: 0,
                background: canSend ? "#1fbf75" : "rgba(31,191,117,0.25)",
                color: canSend ? "#052014" : "rgba(6,32,20,0.7)",
                fontWeight: 950,
                cursor: canSend ? "pointer" : "not-allowed",
                flex: 1,
                minWidth: 220
              }}
            >
              ✉️ Send via Email
            </button>

            <button
              disabled={!canSend}
              onClick={whatsapp}
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "transparent",
                color: canSend ? "#eaf0ff" : "rgba(234,240,255,0.55)",
                fontWeight: 950,
                cursor: canSend ? "pointer" : "not-allowed",
                flex: 1,
                minWidth: 220
              }}
            >
              💬 Send via WhatsApp
            </button>
          </div>

          <p style={{ marginTop: 10, fontSize: 12, color: "rgba(234,240,255,0.72)" }}>
            MVP note: photos + PDF are next. This screen proves the “quote in minutes” loop.
          </p>
        </section>

        <style>{`
          .in {
            width: 100%;
            padding: 12px 12px;
            border-radius: 14px;
            border: 1px solid rgba(255,255,255,0.16);
            background: rgba(0,0,0,0.24);
            color: #eaf0ff;
            outline: none;
          }
          .in:focus {
            border-color: rgba(31,191,117,0.65);
          }
          @media (max-width: 760px) {
            .grid2 { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "rgba(234,240,255,0.72)", fontWeight: 800, margin: "6px 0" }}>{label}</div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
      <div>{label}</div>
      <div style={{ fontWeight: 900 }}>{value}</div>
    </div>
  );
}

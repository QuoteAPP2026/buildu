import type { Settings } from "@/lib/db";

type AnyQuote = any;

export function normaliseLines(rawLines: any[]): Array<{ id: string; description: string; qty: number; unitPrice: number }> {
  const lines = Array.isArray(rawLines) ? rawLines : [];
  return lines.map((l, i) => ({
    id: String(l?.id ?? i),
    description: String(l?.description ?? l?.desc ?? ""),
    qty: Number(l?.qty ?? 1) || 0,
    unitPrice: Number(l?.unitPrice ?? 0) || 0,
  }));
}

export function calcTotals(quote: AnyQuote) {
  const lines = normaliseLines(quote?.lines ?? []);
  const subtotal = lines.reduce((sum, l) => sum + (Number(l.qty) || 0) * (Number(l.unitPrice) || 0), 0);

  const vatEnabled = Boolean(quote?.vatEnabled ?? false);
  const vatRate = Number(quote?.vatRate ?? 0.2);
  const vatRateNum = Number.isFinite(vatRate) ? vatRate : 0.2;
  const vatAmount = vatEnabled ? subtotal * vatRateNum : 0;

  const computedTotal = subtotal + vatAmount;

  const overrideStr = String(quote?.totalOverride ?? "").trim();
  const overrideNum = Number(overrideStr);
  const effectiveTotal = overrideStr && Number.isFinite(overrideNum) ? overrideNum : computedTotal;

  return { lines, subtotal, vatEnabled, vatRateNum, vatAmount, computedTotal, effectiveTotal, overrideStr };
}

export function money(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return x.toFixed(2);
}

export function buildQuoteMessage(settings: Settings | null, quote: AnyQuote) {
  const bizLines = [
    settings?.businessName?.trim() || "",
    settings?.phone?.trim() || "",
    settings?.email?.trim() || "",
    settings?.address?.trim() || "",
  ].filter(Boolean);

  const bizBlock = bizLines.length ? bizLines.join("\n") + "\n\n" : "";

  const customerName = String(quote?.customerName ?? "Customer");
  const address = String(quote?.address ?? "—");
  const notes = String(quote?.notes ?? "—");
  const transcript = String(quote?.transcript ?? "—");

  const { lines, subtotal, vatEnabled, vatRateNum, vatAmount, effectiveTotal, overrideStr } = calcTotals(quote);

  const lineText =
    lines.length === 0
      ? "—"
      : lines
          .map((l) => {
            const row = (Number(l.qty) || 0) * (Number(l.unitPrice) || 0);
            return `${l.description || "Item"} — ${l.qty} × £${money(l.unitPrice)} = £${money(row)}`;
          })
          .join("\n");

  const vatBlock = vatEnabled ? `\nVAT (${Math.round(vatRateNum * 100)}%): £${money(vatAmount)}` : "";
  const overrideNote = overrideStr ? `\n(Manual total used)` : "";

  const termsBlock = settings?.terms?.trim() ? `\n\nTerms:\n${settings.terms.trim()}` : "";

  return `${bizBlock}Quote for ${customerName}

Address: ${address}

Items:
${lineText}

Subtotal: £${money(subtotal)}${vatBlock}

Total: £${money(effectiveTotal)}${overrideNote}

Notes:
${notes}

Transcript:
${transcript}${termsBlock}`.trim();
}

export function buildSendTargets(message: string, customerName: string) {
  const subject = encodeURIComponent(`Quote - ${customerName || "Customer"}`);
  const body = encodeURIComponent(message);

  return {
    whatsappUrl: `https://wa.me/?text=${encodeURIComponent(message)}`,
    gmailUrl: `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`,
    mailtoUrl: `mailto:?subject=${subject}&body=${body}`,
    smsUrl: `sms:?&body=${encodeURIComponent(message)}`,
  };
}

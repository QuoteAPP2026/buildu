import { db } from "@/lib/db";
import { buildQuoteMessage, buildSendTargets } from "@/lib/quoteMessage";
import { recordQuoteSent, getRemainingSends } from "@/lib/usage";

export type SendChannel = "whatsapp" | "email" | "copy";

export type QuoteActivity = {
  id: string;
  type: "created" | "saved" | "sent";
  channel?: SendChannel;
  at: string; // ISO
  meta?: Record<string, any>;
};

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

export function getActivities(quote: any): QuoteActivity[] {
  const a = quote?.activities;
  if (!Array.isArray(a)) return [];
  return a
    .map((x) => ({
      id: String(x?.id ?? uid()),
      type: x?.type,
      channel: x?.channel,
      at: String(x?.at ?? new Date().toISOString()),
      meta: x?.meta,
    }))
    .filter((x) => x.type && x.at);
}

export async function appendActivity(
  quoteId: number,
  activity: Omit<QuoteActivity, "id" | "at"> & { at?: string }
) {
  const q = await db.quotes.get(quoteId);
  if (!q) throw new Error("Quote not found");

  const next = { ...q } as any;
  const list = getActivities(next);

  list.unshift({
    id: uid(),
    type: activity.type,
    channel: activity.channel,
    at: activity.at ?? new Date().toISOString(),
    meta: activity.meta ?? {},
  });

  next.activities = list;
  next.updatedAt = new Date().toISOString();

  await db.quotes.put(next);
  return next;
}

export async function sendQuoteAndLog(opts: {
  quoteId: number;
  userId: string;
  channel: SendChannel;
}) {
  const q = await db.quotes.get(opts.quoteId);
  if (!q) throw new Error("Quote not found");

  const next = { ...q } as any;
  next.userId = next.userId ?? opts.userId;

  // Mark sent status if currently draft
  if ((next.status ?? "draft") === "draft") next.status = "sent";

  // Add activity
  const list = getActivities(next);
  list.unshift({
    id: uid(),
    type: "sent",
    channel: opts.channel,
    at: new Date().toISOString(),
    meta: {},
  });
  next.activities = list;
  next.updatedAt = new Date().toISOString();

  await db.quotes.put(next);

  // Track "sent" for UI badges/analytics (NOT quota)
  recordQuoteSent(opts.userId, opts.quoteId);

  const settings = await db.settings.get("default");
  const message = buildQuoteMessage(settings ?? null, next);
  const targets = buildSendTargets(message, String(next.customerName ?? "Customer"));

  // remaining is now "remaining free quotes"
  const remaining = getRemainingSends(opts.userId);

  return { ok: true as const, remaining, message, targets, quote: next };
}

export const FREE_QUOTE_LIMIT = 10;

type UsageV2 = {
  createdQuoteIds: string[]; // unique quotes that have been created/saved (counts towards quota)
  sentQuoteIds: string[];    // optional: track sent quotes for badges/analytics
  createdAt: string;
};

function key(userId: string) {
  return `buildu_usage_v2_${userId}`;
}

function safeParse(json: string | null): UsageV2 | null {
  if (!json) return null;
  try {
    const v = JSON.parse(json);
    if (!v || typeof v !== "object") return null;
    const createdQuoteIds = Array.isArray(v.createdQuoteIds) ? v.createdQuoteIds.map(String) : [];
    const sentQuoteIds = Array.isArray(v.sentQuoteIds) ? v.sentQuoteIds.map(String) : [];
    const createdAt = typeof v.createdAt === "string" ? v.createdAt : new Date().toISOString();
    return { createdQuoteIds, sentQuoteIds, createdAt };
  } catch {
    return null;
  }
}

export function getUsage(userId: string): UsageV2 {
  if (typeof window === "undefined") {
    return { createdQuoteIds: [], sentQuoteIds: [], createdAt: new Date().toISOString() };
  }
  const existing = safeParse(window.localStorage.getItem(key(userId)));
  if (existing) return existing;
  const fresh: UsageV2 = { createdQuoteIds: [], sentQuoteIds: [], createdAt: new Date().toISOString() };
  window.localStorage.setItem(key(userId), JSON.stringify(fresh));
  return fresh;
}

/** QUOTE QUOTA (counts down on create/save) */
export function getQuotesUsed(userId: string): number {
  return getUsage(userId).createdQuoteIds.length;
}

export function getRemainingSends(userId: string): number {
  // kept name for compatibility with existing UI; meaning is "remaining free quotes"
  return Math.max(0, FREE_QUOTE_LIMIT - getQuotesUsed(userId));
}

export function hasCreatedQuote(userId: string, quoteId: string | number): boolean {
  const id = String(quoteId);
  return getUsage(userId).createdQuoteIds.includes(id);
}

export function canCreateQuote(userId: string, quoteId?: string | number): boolean {
  // if quote already counted, allow
  if (quoteId != null && hasCreatedQuote(userId, quoteId)) return true;
  return getQuotesUsed(userId) < FREE_QUOTE_LIMIT;
}

export function recordQuoteCreated(userId: string, quoteId: string | number): { used: number; remaining: number } {
  if (typeof window === "undefined") return { used: 0, remaining: FREE_QUOTE_LIMIT };

  const id = String(quoteId);
  const u = getUsage(userId);

  if (!u.createdQuoteIds.includes(id)) {
    u.createdQuoteIds = [...u.createdQuoteIds, id];
    window.localStorage.setItem(key(userId), JSON.stringify(u));
  }

  const used = u.createdQuoteIds.length;
  return { used, remaining: Math.max(0, FREE_QUOTE_LIMIT - used) };
}

/** SEND TRACKING (does NOT affect quota now) */
export function hasSentQuote(userId: string, quoteId: string | number): boolean {
  const id = String(quoteId);
  return getUsage(userId).sentQuoteIds.includes(id);
}

export function recordQuoteSent(userId: string, quoteId: string | number) {
  if (typeof window === "undefined") return;

  const id = String(quoteId);
  const u = getUsage(userId);

  if (!u.sentQuoteIds.includes(id)) {
    u.sentQuoteIds = [...u.sentQuoteIds, id];
    window.localStorage.setItem(key(userId), JSON.stringify(u));
  }
}

/** Back-compat for any older imports */
export async function getQuotesCreated(userId: string): Promise<number> {
  return getQuotesUsed(userId);
}

export async function incrementQuotesCreated(userId: string, quoteId?: string | number): Promise<number> {
  if (quoteId == null) return getQuotesUsed(userId);
  return recordQuoteCreated(userId, quoteId).used;
}

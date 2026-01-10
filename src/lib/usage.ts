export const FREE_QUOTE_LIMIT = 10;

type UsageV2 = {
  sentQuoteIds: string[]; // unique quote IDs that have been sent (any channel)
  createdAt: string; // first time usage object created
};

function key(userId: string) {
  return `buildu_usage_v2_${userId}`;
}

function safeParse(json: string | null): UsageV2 | null {
  if (!json) return null;
  try {
    const v = JSON.parse(json);
    if (!v || typeof v !== "object") return null;
    const ids = Array.isArray(v.sentQuoteIds) ? v.sentQuoteIds.map(String) : [];
    const createdAt = typeof v.createdAt === "string" ? v.createdAt : new Date().toISOString();
    return { sentQuoteIds: ids, createdAt };
  } catch {
    return null;
  }
}

export function getUsage(userId: string): UsageV2 {
  if (typeof window === "undefined") return { sentQuoteIds: [], createdAt: new Date().toISOString() };
  const existing = safeParse(window.localStorage.getItem(key(userId)));
  if (existing) return existing;
  const fresh: UsageV2 = { sentQuoteIds: [], createdAt: new Date().toISOString() };
  window.localStorage.setItem(key(userId), JSON.stringify(fresh));
  return fresh;
}

export function getSentCount(userId: string): number {
  return getUsage(userId).sentQuoteIds.length;
}

export function getRemainingSends(userId: string): number {
  return Math.max(0, FREE_QUOTE_LIMIT - getSentCount(userId));
}

export function hasSentQuote(userId: string, quoteId: string | number): boolean {
  const id = String(quoteId);
  return getUsage(userId).sentQuoteIds.includes(id);
}

export function canSendQuote(userId: string, quoteId: string | number): boolean {
  // If it was already sent before, allow re-send without consuming quota
  if (hasSentQuote(userId, quoteId)) return true;
  return getSentCount(userId) < FREE_QUOTE_LIMIT;
}

export function recordQuoteSent(userId: string, quoteId: string | number): { sentCount: number; remaining: number } {
  if (typeof window === "undefined") return { sentCount: 0, remaining: FREE_QUOTE_LIMIT };

  const id = String(quoteId);
  const u = getUsage(userId);

  if (!u.sentQuoteIds.includes(id)) {
    u.sentQuoteIds = [...u.sentQuoteIds, id];
    window.localStorage.setItem(key(userId), JSON.stringify(u));
  }

  const sentCount = u.sentQuoteIds.length;
  return { sentCount, remaining: Math.max(0, FREE_QUOTE_LIMIT - sentCount) };
}

/**
 * Back-compat for earlier code paths (if any still import these).
 * We treat "quotes created" as "quotes sent" in V2, because that's the real business event.
 */
export async function getQuotesCreated(userId: string): Promise<number> {
  return getSentCount(userId);
}

export async function incrementQuotesCreated(userId: string, quoteId?: string | number): Promise<number> {
  if (quoteId == null) return getSentCount(userId);
  return recordQuoteSent(userId, quoteId).sentCount;
}

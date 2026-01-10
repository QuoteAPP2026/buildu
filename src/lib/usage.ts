import { db } from "@/lib/db";

function usageId(userId: string) {
  return `${userId}:usage`;
}

export async function getQuotesCreated(userId: string): Promise<number> {
  const row = await db.usage.get(usageId(userId));
  return row?.quotesCreated ?? 0;
}

export async function incrementQuotesCreated(userId: string): Promise<number> {
  const id = usageId(userId);
  const now = new Date().toISOString();

  // atomic-ish update for Dexie
  return db.transaction("rw", db.usage, async () => {
    const existing = await db.usage.get(id);
    const next = (existing?.quotesCreated ?? 0) + 1;
    await db.usage.put({ id, userId, quotesCreated: next, updatedAt: now });
    return next;
  });
}

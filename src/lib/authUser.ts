import { getSupabaseBrowserClient } from "./supabaseClient";

let cachedUserId: string | null = null;
let inflight: Promise<string> | null = null;

export async function getCurrentUserId(): Promise<string> {
  // Return cached user immediately
  if (cachedUserId) return cachedUserId;

  // Reuse inflight request if one exists
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;

      cachedUserId = data?.user?.id || "anon";
      return cachedUserId;
    } catch {
      cachedUserId = "anon";
      return cachedUserId;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

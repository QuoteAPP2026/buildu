import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { isPlatformAdmin } from "@/lib/isPlatformAdmin";

export default async function AdminHome() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email ?? null;

  if (!email) redirect("/app");
  if (!isPlatformAdmin(email)) redirect("/app");

  return (
    <main style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Platform Admin</h1>
          <p style={{ marginTop: 6, opacity: 0.8 }}>
            Signed in as <strong>{email}</strong>
          </p>
        </div>
        <a
          href="/app"
          style={{
            textDecoration: "none",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.14)",
            fontWeight: 800,
          }}
        >
          Back to app
        </a>
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <a
          href="/admin/users"
          style={{
            textDecoration: "none",
            padding: 14,
            borderRadius: 16,
            border: "1px solid rgba(0,0,0,0.12)",
            fontWeight: 900,
            display: "block",
          }}
        >
          Users →
          <div style={{ marginTop: 6, fontWeight: 700, opacity: 0.75 }}>
            View registered users (email, created, last sign-in)
          </div>
        </a>

        <div
          style={{
            padding: 14,
            borderRadius: 16,
            border: "1px solid rgba(0,0,0,0.12)",
            opacity: 0.75,
          }}
        >
          Coming next: Organisations → Billing → Suspensions
        </div>
      </div>
    </main>
  );
}

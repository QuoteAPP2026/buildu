import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isPlatformAdmin } from "@/lib/isPlatformAdmin";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email ?? null;

  if (!email) redirect("/app");
  if (!isPlatformAdmin(email)) redirect("/app");

  const admin = supabaseAdmin();
  const { data: usersData, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (error) {
    return (
      <main style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Admin · Users</h1>
        <p style={{ marginTop: 10, opacity: 0.85 }}>
          Error loading users: <code>{error.message}</code>
        </p>
      </main>
    );
  }

  const needle = (q ?? "").trim().toLowerCase();
  const users = (usersData?.users ?? []).filter((u) => {
    if (!needle) return true;
    const em = (u.email ?? "").toLowerCase();
    return em.includes(needle);
  });

  return (
    <main style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Admin · Users</h1>
          <p style={{ marginTop: 6, opacity: 0.8 }}>
            Signed in as <strong>{email}</strong>
          </p>
        </div>

        <a
          href="/admin"
          style={{
            textDecoration: "none",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.14)",
            fontWeight: 800,
          }}
        >
          ← Back
        </a>
      </div>

      <form style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by email…"
          style={{
            flex: "1 1 320px",
            padding: 10,
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.18)",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.18)",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      <div style={{ marginTop: 12, opacity: 0.8, fontSize: 13.5 }}>
        Showing <strong>{users.length}</strong> of <strong>{usersData?.users?.length ?? 0}</strong> users (max 200 loaded).
      </div>

      <div style={{ marginTop: 12, overflowX: "auto", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
          <thead>
            <tr style={{ textAlign: "left", background: "rgba(0,0,0,0.04)" }}>
              <th style={{ padding: 12, borderBottom: "1px solid rgba(0,0,0,0.10)" }}>Email</th>
              <th style={{ padding: 12, borderBottom: "1px solid rgba(0,0,0,0.10)" }}>User ID</th>
              <th style={{ padding: 12, borderBottom: "1px solid rgba(0,0,0,0.10)" }}>Created</th>
              <th style={{ padding: 12, borderBottom: "1px solid rgba(0,0,0,0.10)" }}>Last sign-in</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ padding: 12, borderBottom: "1px solid rgba(0,0,0,0.08)", fontWeight: 700 }}>
                  {u.email ?? "—"}
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid rgba(0,0,0,0.08)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12.5 }}>
                  {u.id}
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                  {fmtDate(u.created_at)}
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                  {fmtDate(u.last_sign_in_at)}
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 14, opacity: 0.8 }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

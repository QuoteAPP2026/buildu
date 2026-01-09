import Link from "next/link";
import type { ReactNode } from "react";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#070b14",
        color: "#eaf0ff",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          padding: 16,
          borderRight: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(7,11,20,0.9)",
        }}
      >
        <div
          style={{
            fontWeight: 600,
            marginBottom: 24,
            fontSize: 18,
          }}
        >
          BuildU
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <Link href="/app/quotes">Quotes</Link>
          <Link href="/app/settings">Settings</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          padding: 24,
        }}
      >
        {children}
      </main>
    </div>
  );
}



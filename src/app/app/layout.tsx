import React from "react";

// /app parent layout.
// Keep this layout minimal so we don't duplicate navigation/headers.
// The authenticated app shell lives in /app/(app)/layout.tsx.

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        html, body { height: 100%; }
        body { margin: 0; }

        .appRoot {
          min-height: 100vh;
          background:
            radial-gradient(900px 520px at 15% -10%, rgba(60,120,255,0.18), transparent 55%),
            radial-gradient(900px 520px at 85% 0%, rgba(20,184,166,0.12), transparent 55%),
            #070b14;
          color: rgba(234,240,255,0.94);
        }
      `}</style>

      <div className="appRoot">{children}</div>
    </>
  );
}

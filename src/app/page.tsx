"use client";

import { useEffect, useState } from "react";

type InstallStatus = "ready" | "prompting" | "installed";

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installStatus, setInstallStatus] = useState<InstallStatus>("ready");
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone
    ) {
      setIsStandalone(true);
      setInstallStatus("installed");
    }

    function beforeInstall(e: any) {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallStatus("ready");
    }

    window.addEventListener("beforeinstallprompt", beforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstall);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;

    setInstallStatus("prompting");
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallStatus("installed");
    } else {
      setInstallStatus("ready");
    }

    setDeferredPrompt(null);
  }

  const canInstall = !!deferredPrompt && !isStandalone;

  return (
    <main style={{ minHeight: "100vh", padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 900 }}>BuildU</h1>
      <p style={{ opacity: 0.75, marginBottom: 24 }}>
        Voice → Quote → Send
      </p>

      <button
        type="button"
        onClick={handleInstall}
        disabled={!canInstall || isStandalone || installStatus === "prompting"}
        style={{
          padding: "14px 18px",
          borderRadius: 14,
          fontWeight: 900,
          border: "none",
          cursor: canInstall ? "pointer" : "default",
          opacity:
            !canInstall || isStandalone || installStatus === "prompting"
              ? 0.55
              : 1,
        }}
      >
        {installStatus === "installed"
          ? "Installed ✓"
          : installStatus === "prompting"
          ? "Installing…"
          : "Install app"}
      </button>
    </main>
  );
}

"use client";

import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    // Never register service worker in development (avoids cached JS/UI issues)
    if (process.env.NODE_ENV !== "production") return;

    if ("serviceWorker" in navigator) {
      const onLoad = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch(() => {});
      };

      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  return null;
}

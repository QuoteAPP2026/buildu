import "./globals.css";
import SwRegister from "./sw-register";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#070b14" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* PWA / iOS home screen icon */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
      </head>
      <body>
        <SwRegister />
        {children}
      </body>
    </html>
  );
}

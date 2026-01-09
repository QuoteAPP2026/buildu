import "./globals.css";
import SwRegister from "./sw-register";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#070b14" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <SwRegister />
        {children}
      </body>
    </html>
  );
}

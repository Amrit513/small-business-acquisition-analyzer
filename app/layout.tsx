import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./workbench.css";

export const metadata: Metadata = {
  title: "Acquisition Lens | Small Business Deal Analyzer",
  description:
    "A private, educational workspace to trace the economics and evidence of a small business acquisition.",
  applicationName: "Acquisition Lens",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Acquisition Lens" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-180.png" },
};

export const viewport: Viewport = { themeColor: "#0b5142", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-emerald-200 selection:text-emerald-950">
        {children}
      </body>
    </html>
  );
}

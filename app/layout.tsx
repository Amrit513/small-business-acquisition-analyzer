import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acquisition Lens | Small Business Deal Analyzer",
  description:
    "Evaluate whether buying a small business is a good investment — valuation, financing, DSCR, ROI, and scenario modeling.",
  applicationName: "Acquisition Lens",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Acquisition Lens" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-180.png" },
};

export const viewport: Viewport = { themeColor: "#0a5c4f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-emerald-200 selection:text-emerald-950">
        {children}
      </body>
    </html>
  );
}

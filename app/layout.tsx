import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LifeOSProvider } from "@/context/LifeOSContext";
import BottomNav from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "LifeOS — Nero",
  description: "Personal health & finance dashboard for Nero",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0c0e1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <LifeOSProvider>
          <div id="app-frame">
            <main
              style={{
                paddingTop: 0,
                paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
                minHeight: "100dvh",
              }}
            >
              {children}
            </main>
            <BottomNav />
          </div>
        </LifeOSProvider>
      </body>
    </html>
  );
}

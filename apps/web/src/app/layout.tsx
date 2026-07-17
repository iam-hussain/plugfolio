import type { Metadata, Viewport } from "next";
import { brand } from "@plugfolio/tokens";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Plugfolio",
    template: "%s · Plugfolio",
  },
  description: "Shoppable creator pages. No login to buy.",
};

// Mobile-first: the brand is violet-tinted dark (§7).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: brand.surfaceDark,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}

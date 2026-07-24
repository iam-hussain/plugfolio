import type { Metadata, Viewport } from "next";
import { Inter, Sora, Space_Mono } from "next/font/google";
import { brand } from "@plugfolio/tokens";
import { Toaster } from "@plugfolio/ui";
import { cookies } from "next/headers";
import "./globals.css";

// Same brand type system as apps/web (Brand Guidelines v1.1 §06) — the tokens
// read these CSS variables into --font-*.
const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Plugfolio Admin",
    template: "%s · Plugfolio Admin",
  },
  description: "Plugfolio operations console — members, content, marketplace, settings.",
  applicationName: "Plugfolio Admin",
  // Internal ops surface — never indexed.
  robots: { index: false, follow: false },
};

// Same brand chrome as the web app (light default). Icons ride the file
// conventions (icon.svg + apple-icon.tsx) but use the dark-surface variant —
// lime mark on Ink — so the admin tab is tellable from the violet web tab.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: brand.surfaceLight,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get("admin-theme")?.value === "dark" ? "dark" : "light";
  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${sora.variable} ${inter.variable} ${spaceMono.variable}`}
    >
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

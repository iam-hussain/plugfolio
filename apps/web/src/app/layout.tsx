import type { Metadata, Viewport } from "next";
import { Inter, Sora, Space_Mono } from "next/font/google";
import { brand } from "@plugfolio/tokens";
import { Providers } from "./providers";
import "./globals.css";

// Brand type system (Brand Guidelines v1.1 §06): Sora for display/wordmark/
// headlines, Inter for UI + body, Space Mono for micro labels. Each is exposed
// as a CSS variable the tokens (@plugfolio/tokens) read into --font-*.
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
    <html
      lang="en"
      data-theme="dark"
      className={`${sora.variable} ${inter.variable} ${spaceMono.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

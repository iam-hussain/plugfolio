import type { Metadata, Viewport } from "next";
import { Inter, Sora, Space_Mono } from "next/font/google";
import { brand } from "@plugfolio/tokens";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "shoppable creator pages",
    "creator storefront",
    "link in bio shop",
    "shop creator posts",
    "creator commerce",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Light is the shipped default (design-out prototype default; handoff §10
// resolved); dark stays fully supported via tokens.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: brand.surfaceLight,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${sora.variable} ${inter.variable} ${spaceMono.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

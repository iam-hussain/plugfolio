import type { Metadata } from "next";
import { LandingPage } from "@/features/marketing";

// The business side of the Scroll V3 Dual landing (ADR-0027) — the same scroll
// story as `/`, opened on the business view. Every door lands on
// /join?as=business. Public and session-free.
export const metadata: Metadata = {
  title: "For business",
  description:
    "Creators sell it better than ads. Post what you need, hear from creators whose audience fits, and agree terms in one thread — payment settles off-platform, and Plugfolio never holds your money.",
  alternates: { canonical: "/for-business" },
  openGraph: { url: "/for-business" },
};

export default function Page() {
  return <LandingPage defaultRole="business" />;
}

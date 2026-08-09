import type { Metadata } from "next";
import { LandingPage } from "@/features/marketing";

// The creator side of the Scroll V3 Dual landing (ADR-0027) — the same scroll
// story as `/`, opened on the creator view. Every door lands on
// /join?as=creator. Public and session-free.
export const metadata: Metadata = {
  title: "For creators",
  description:
    "You post. Your page sells. Tag your things once and every reel becomes a shop window — one link in your bio, live in five minutes, and Plugfolio never handles your money.",
  alternates: { canonical: "/for-creators" },
  openGraph: { url: "/for-creators" },
};

export default function Page() {
  return <LandingPage defaultRole="creator" />;
}

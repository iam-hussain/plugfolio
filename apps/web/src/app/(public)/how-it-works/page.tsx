import type { Metadata } from "next";
import { HowItWorksPage } from "@/features/marketing";

// Shopper-facing marketing (DESIGN how-it-works.html). Public and account-free
// — it answers "is this safe?" by showing the loop, so it needs no session.
export const metadata: Metadata = {
  title: "How it works",
  description:
    "A creator tags what's in their post, you tap the tag, you land on the retailer. No account, no cart, no checkout — and we never see your card.",
};

export default function Page() {
  return <HowItWorksPage />;
}

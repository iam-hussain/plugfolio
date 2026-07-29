import type { Metadata } from "next";
import { ForCreatorsPage } from "@/features/marketing";

// Creator pitch (DESIGN for-creators.html) for someone without an account yet —
// every door lands on /join?as=creator. Public and session-free.
export const metadata: Metadata = {
  title: "For creators",
  description:
    "Tag the products in what you already post, pin your own links, and see which post drove the taps. Free to start — and Plugfolio never handles your money.",
};

export default function Page() {
  return <ForCreatorsPage />;
}

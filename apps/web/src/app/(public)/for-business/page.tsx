import type { Metadata } from "next";
import { ForBusinessPage } from "@/features/marketing";

// Business pitch (DESIGN for-business.html) — a pitch, not the product. Every
// door lands on /join?as=business. Public and session-free.
export const metadata: Metadata = {
  title: "For business",
  description:
    "Post a brief or approach a creator directly, then agree terms in one thread. Plugfolio handles no money and takes no cut — payment settles off-platform.",
};

export default function Page() {
  return <ForBusinessPage />;
}

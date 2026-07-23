import type { Metadata } from "next";
import { VerifyScreen } from "@/features/account-auth";

// The landing of the one registration email link (brief 04, ADR-0012).
export const metadata: Metadata = { title: "Verify your email" };

type SearchParams = { token?: string };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { token } = await searchParams;
  return <VerifyScreen token={token} />;
}

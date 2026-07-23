import type { Metadata } from "next";
import { ResetScreen } from "@/features/account-auth";

// Set a new password from an email link — also the invited Manager's first
// password (brief 04, ADR-0012).
export const metadata: Metadata = { title: "Set a new password" };

type SearchParams = { token?: string };

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { token } = await searchParams;
  return <ResetScreen token={token} />;
}

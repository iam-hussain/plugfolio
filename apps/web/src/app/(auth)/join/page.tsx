import type { Metadata } from "next";
import { JoinScreen, isAuthRole } from "@/features/account-auth";

// Register (brief 04, ADR-0012): email + password → one verification link.
export const metadata: Metadata = { title: "Create your account" };

type SearchParams = { as?: string };

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { as } = await searchParams;
  return <JoinScreen initialRole={isAuthRole(as) ? as : undefined} />;
}

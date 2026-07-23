import type { Metadata } from "next";
import { SignInScreen, isAuthRole } from "@/features/account-auth";

// Login (brief 04, ADR-0012): email + password, one step, no email round-trip.
export const metadata: Metadata = { title: "Sign in" };

type SearchParams = { callbackUrl?: string; as?: string };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { callbackUrl, as } = await searchParams;
  return <SignInScreen callbackUrl={callbackUrl} initialRole={isAuthRole(as) ? as : undefined} />;
}

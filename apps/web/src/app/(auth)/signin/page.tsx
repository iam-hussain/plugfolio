import type { Metadata } from "next";
import { LoginForm } from "@/features/account-auth";

// Login (brief 04, ADR-0012): email + password, one step, no email round-trip.
export const metadata: Metadata = { title: "Sign in" };

type SearchParams = { callbackUrl?: string };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { callbackUrl } = await searchParams;
  return (
    <>
      <h1 className="pb-4 text-lg font-medium">Welcome back</h1>
      <LoginForm callbackUrl={callbackUrl} />
    </>
  );
}

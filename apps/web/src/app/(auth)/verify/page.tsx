import type { Metadata } from "next";
import { VerifyEmail } from "@/features/account-auth";

// The landing of the one registration email link (brief 04, ADR-0012).
export const metadata: Metadata = { title: "Verify your email" };

type SearchParams = { token?: string };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { token } = await searchParams;
  return (
    <>
      <h1 className="pb-4 text-lg font-medium">Verify your email</h1>
      {token ? (
        <VerifyEmail token={token} />
      ) : (
        <p className="text-muted-foreground text-sm">This link is incomplete — use the one from your email.</p>
      )}
    </>
  );
}

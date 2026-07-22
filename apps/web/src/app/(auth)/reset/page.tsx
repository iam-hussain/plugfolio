import type { Metadata } from "next";
import { ResetForm } from "@/features/account-auth";

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
  return (
    <>
      <h1 className="pb-4 text-lg font-medium">Set a new password</h1>
      {token ? (
        <ResetForm token={token} />
      ) : (
        <p className="text-muted-foreground text-sm">This link is incomplete — use the one from your email.</p>
      )}
    </>
  );
}

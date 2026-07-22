import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMemberHandle } from "@plugfolio/core";
import { HandleForm } from "@/features/shopper-account";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// Account settings (ADR-0009): the one small surface for the member handle.
// Every account type has one; it's public identity for follow/comment only.
export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const handle = await getMemberHandle({ users: repositories.users }, session.user.id);

  return (
    <main className="mx-auto max-w-md px-4 pb-8">
      <header className="py-8">
        <h1 className="font-display text-2xl font-semibold">Account</h1>
        <p className="text-muted-foreground text-sm">{session.user.email}</p>
      </header>
      <HandleForm currentHandle={handle} />
    </main>
  );
}

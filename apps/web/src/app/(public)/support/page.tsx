import type { Metadata } from "next";
import { getMemberHandle } from "@plugfolio/core";
import { SupportForm } from "@/features/support";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// The one support door for all three roles (docs/implementation/support.md).
// Public and account-free on purpose: the top issue is "I can't get into my
// email/account", which means no sign-in. A session only prefills the reply
// address and signs the ticket with the member's @handle.
export const metadata: Metadata = {
  title: "Support",
  description: "Contact Plugfolio support — account trouble, lost email, merges, and anything else.",
};

type SearchParams = { category?: string };

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category } = await searchParams;
  const session = await auth();
  // The account email prefills the reply field but stays editable — for
  // lost-email cases it's exactly the address that doesn't work.
  const email = session?.user?.email ?? "";
  const handle = session?.user
    ? await getMemberHandle({ users: repositories.users }, session.user.id)
    : null;

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-14">
      <header className="py-8">
        <p className="font-mono tracking-eyebrow text-muted-foreground pb-1 text-[11px] uppercase">
          {handle ? `Signed in as @${handle}` : "No account needed"}
        </p>
        <h1 className="font-display tracking-display text-2xl font-semibold">
          What can we help with?
        </h1>
        <p className="text-muted-foreground pt-1 text-sm">
          Pick the closest issue — a person reads every ticket and replies by email.
        </p>
      </header>
      <SupportForm initialCategory={category} initialEmail={email} />
    </main>
  );
}

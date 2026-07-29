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
    <main className="mx-auto w-full max-w-[680px] px-5 pt-[clamp(22px,4vw,40px)] pb-[clamp(48px,7vw,88px)]">
      <p className="text-muted-foreground font-mono tracking-eyebrow text-[11px] font-semibold uppercase">
        Help
      </p>
      <h1 className="font-display mt-2.5 text-[clamp(1.875rem,4vw,2.75rem)] font-extrabold tracking-[-0.035em]">
        What can we help with?
      </h1>
      <p className="text-muted-foreground mt-3 max-w-[50ch] text-[0.9375rem] leading-[1.5]">
        Pick the closest issue — a person reads every ticket and replies by email.
      </p>
      <SupportForm handle={handle} initialCategory={category} initialEmail={email} />
    </main>
  );
}

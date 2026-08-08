import type { Metadata } from "next";
import { getMemberHandle } from "@plugfolio/core";
import { cn, measure } from "@plugfolio/ui";
import { SupportForm } from "@/features/support";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// The one support door for all three roles (docs/implementation/support.md).
// Public and account-free on purpose: the top issue is "I can't get into my
// email/account", which means no sign-in. A session only prefills the reply
// address and signs the ticket with the member's @handle.
export const metadata: Metadata = {
  title: "Support",
  description:
    "Contact Plugfolio support — account trouble, lost email, merges, and anything else.",
  alternates: { canonical: "/support" },
  openGraph: { url: "/support" },
};

type SearchParams = { category?: string };

/** The v2 companion card: what happens after Send, stated up front. */
const NEXT: readonly { lead: string | null; copy: string }[] = [
  {
    lead: null,
    copy: "A person reads it — there is no bot on this queue. You get a reply at the address you gave, usually inside one working day.",
  },
  {
    lead: "Account deletion",
    copy: "is handled here on purpose, so nothing irreversible happens by mis-tap.",
  },
  {
    lead: "Username disputes",
    copy: "go to whoever verified the handle first. Send the connected account and we will check.",
  },
  {
    lead: null,
    copy: "Shopping is never affected while a request is open — every creator page and every Buy keeps working.",
  },
];

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
    <main className={cn(measure(), "pb-[clamp(48px,7vw,88px)] pt-[clamp(22px,4vw,40px)]")}>
      <h1 className="font-display text-display-sm font-bold tracking-[-0.04em]">
        Support &amp; feedback
      </h1>
      <p className="text-muted-foreground text-copy mt-2 max-w-[62ch] leading-[1.6]">
        No account needed — if you&apos;re locked out you can still reach us here. Lost verification
        mails, username disputes, merges, deletions — or tell us what&apos;s annoying you and what
        you&apos;d like built.
      </p>

      {/* v2: the form beside the "what happens next" card, so the promise sits
          in view while someone writes. */}
      <div className="mt-[18px] grid items-start gap-3 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="border-border bg-card rounded-tile border p-[18px]">
          <SupportForm handle={handle} initialCategory={category} initialEmail={email} />
        </div>
        <aside className="border-border bg-card rounded-tile border p-[18px]">
          <h2 className="text-faint text-pico tracking-eyebrow font-mono font-bold uppercase">
            What happens next
          </h2>
          <ul className="mt-3 flex flex-col">
            {NEXT.map((item, index) => (
              <li
                key={item.copy}
                className={cn(
                  "text-muted-foreground text-label leading-[1.6]",
                  index > 0 && "border-border mt-3 border-t pt-3",
                )}
              >
                {item.lead ? <b className="text-foreground font-semibold">{item.lead}</b> : null}
                {item.lead ? " " : null}
                {item.copy}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}

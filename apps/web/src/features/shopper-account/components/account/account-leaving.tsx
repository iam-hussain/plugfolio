import { Button } from "@plugfolio/ui";
import Link from "next/link";

/**
 * "Leaving" — signing out, and asking to be deleted.
 *
 * Deletion is deliberately not a button. It routes through support so a person
 * confirms it's really you and tells you exactly what goes
 * (docs/implementation/support.md) — an irreversible destructive action behind
 * one tap is how accounts get lost to a shared phone.
 */
export function AccountLeaving() {
  return (
    <>
      <div className="border-border bg-card rounded-tile flex flex-wrap items-center gap-3 border px-5 py-5">
        <p className="text-muted-foreground text-copy m-0 flex-1 basis-[320px] leading-[1.55]">
          Signing out ends this session on this device. Nothing is removed.
        </p>
        <Button variant="secondary" asChild>
          <Link href="/api/auth/signout">Sign out</Link>
        </Button>
      </div>
      <div className="border-border bg-card rounded-tile mt-3 flex flex-wrap items-center gap-3 border px-5 py-5">
        <p className="text-muted-foreground text-copy m-0 flex-1 basis-[320px] leading-[1.55]">
          Deleting your account and its data is handled by a person, not a button — so we can
          confirm it&apos;s really you and tell you exactly what goes.
        </p>
        <Button variant="secondary" asChild>
          <Link href={{ pathname: "/support", query: { category: "delete_account" } }}>
            Request deletion
          </Link>
        </Button>
      </div>
    </>
  );
}

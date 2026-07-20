import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getFollowedProfiles } from "@plugfolio/core";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// The shopper-account payoff (lean journey): the simple followed-creators
// list. The rich aggregated feed stays deferred. Gated — following is an
// "act as yourself" action; shopping never routes through here (§2.2).
export const metadata: Metadata = { title: "Following" };

export default async function FollowingPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const profiles = await getFollowedProfiles({ follows: repositories.follows }, session.user.id);

  return (
    <main className="mx-auto max-w-md px-4 pb-8">
      <header className="py-8">
        <h1 className="font-display text-2xl font-semibold">Following</h1>
      </header>
      {profiles.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          You aren&apos;t following anyone yet. Tap Follow on a creator&apos;s page.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {profiles.map((profile) => (
            <li key={profile.id}>
              <Link href={`/${profile.username}`} className="font-medium">
                @{profile.username}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

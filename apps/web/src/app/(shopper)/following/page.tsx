import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getFollowedProfiles } from "@plugfolio/core";
import {
  Avatar,
  AvatarFallback,
  Button,
  Card,
  CardContent,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@plugfolio/ui";
import { FollowButton } from "@/features/shopper-account";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// The shopper-account payoff (lean journey): the simple followed-creators
// list. The rich aggregated feed stays deferred. Gated — following is an
// "act as yourself" action; shopping never routes through here (§2.2).
export const metadata: Metadata = { title: "Following" };

export default async function FollowingPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const profiles = await getFollowedProfiles({ follows: repositories.follows }, session.user.id);

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-8">
      <header className="py-8">
        <p className="font-mono tracking-eyebrow text-muted-foreground pb-1 text-[11px] uppercase">
          Your creators
        </p>
        <h1 className="font-display tracking-display text-2xl font-semibold">Following</h1>
      </header>
      {profiles.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No one yet</EmptyTitle>
            <EmptyDescription>
              Tap Follow on a creator&apos;s page and they&apos;ll show up here.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/explore">Explore creators</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {profiles.map((profile) => (
            <li key={profile.id}>
              <Card>
                <CardContent className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-muted text-foreground">
                      {profile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Link href={`/${profile.username}`} className="min-w-0 flex-1">
                    <p className="truncate font-medium">@{profile.username}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      plugfolio.com/{profile.username}
                    </p>
                  </Link>
                  <FollowButton
                    profileId={profile.id}
                    isAuthenticated
                    initiallyFollowing
                  />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

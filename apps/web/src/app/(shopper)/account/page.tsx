import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMemberHandle, getMyBusiness, getMyProfiles } from "@plugfolio/core";
import {
  Avatar,
  AvatarFallback,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@plugfolio/ui";
import { ArrowRight, LogOut } from "lucide-react";
import { HandleForm } from "@/features/shopper-account";
import { auth } from "@/server/auth";
import { businessCollabDeps, repositories } from "@/server/container";

// Account settings (ADR-0009): the member handle plus doors to whatever
// roles this email holds (brief 04: one email can hold any mix). Public
// identity for follow/comment only — never a login.
export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const [handle, profiles, business] = await Promise.all([
    getMemberHandle({ users: repositories.users }, session.user.id),
    getMyProfiles({ profiles: repositories.profiles }, session.user.id),
    getMyBusiness(businessCollabDeps, session.user.id),
  ]);
  const initial = (handle || session.user.email || "?").trim().charAt(0).toUpperCase();

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-8">
      <header className="flex items-center gap-3 py-8">
        <Avatar className="size-12">
          <AvatarFallback className="bg-muted text-foreground">{initial}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="font-display tracking-display text-2xl font-semibold">Account</h1>
          <p className="text-muted-foreground truncate text-sm">{session.user.email}</p>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your handle</CardTitle>
            <CardDescription>
              How you appear when you follow or comment. Not a login — you still sign in by
              email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HandleForm currentHandle={handle} />
          </CardContent>
        </Card>

        {profiles.length > 0 || business ? (
          <Card>
            <CardHeader>
              <CardTitle>Your other hats</CardTitle>
              <CardDescription>One email can hold any mix of roles.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {profiles.length > 0 ? (
                <Button variant="outline" asChild className="justify-between">
                  <Link href="/dashboard">
                    Creator dashboard
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : null}
              {business ? (
                <Button variant="outline" asChild className="justify-between">
                  <Link href="/collabs">
                    {business.name} — collabs
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <div>
          <Button variant="ghost" asChild>
            <Link href="/api/auth/signout">
              <LogOut className="size-4" />
              Sign out
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

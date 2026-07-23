import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyBusiness, listMyBusinessCollabs, listMyRequirements } from "@plugfolio/core";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@plugfolio/ui";
import { ArrowRight, LogOut } from "lucide-react";
import { Logo } from "@/components/brand";
import { BusinessForm, CollabList, RequirementForm } from "@/features/business-collab";
import { auth } from "@/server/auth";
import { businessCollabDeps } from "@/server/container";

// The business home (briefs 11–12): one focused surface — the business
// identity, the threads, the two doors to meet a creator (post a
// requirement / browse creators). No campaign suites.
export const metadata: Metadata = { title: "Collabs" };

const dateFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });

export default async function BusinessCollabsPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const business = await getMyBusiness(businessCollabDeps, session.user.id);

  if (!business) {
    return (
      <BusinessChrome>
        <header className="py-8">
          <p className="font-mono tracking-eyebrow text-muted-foreground pb-1 text-[11px] uppercase">
            Business
          </p>
          <h1 className="font-display tracking-display text-2xl font-semibold">
            Create your business
          </h1>
          <p className="text-muted-foreground pt-1 text-sm">
            A name and what you sell — that&apos;s the whole sign-up.
          </p>
        </header>
        <Card>
          <CardContent>
            <BusinessForm />
          </CardContent>
        </Card>
      </BusinessChrome>
    );
  }

  const [requirements, collabs] = await Promise.all([
    listMyRequirements(businessCollabDeps, session.user.id),
    listMyBusinessCollabs(businessCollabDeps, session.user.id),
  ]);

  return (
    <BusinessChrome>
      <header className="flex items-center gap-3 py-8">
        <Avatar className="size-12">
          <AvatarFallback className="bg-muted text-foreground">
            {business.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-mono tracking-eyebrow text-muted-foreground text-[11px] uppercase">
            Business
          </p>
          <h1 className="font-display tracking-display truncate text-2xl font-semibold">
            {business.name}
          </h1>
          <p className="text-muted-foreground truncate text-sm">{business.description}</p>
        </div>
      </header>

      <div className="flex flex-col gap-8">
        <section aria-label="Collab threads">
          <h2 className="pb-3 font-medium">Threads</h2>
          {collabs.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyTitle>No threads yet</EmptyTitle>
                <EmptyDescription>
                  Post a requirement below and creators will approach you — or browse creator
                  pages and reach out first.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" asChild>
                  <Link href="/explore">
                    Browse creators
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <CollabList collabs={collabs} show="creator" />
          )}
        </section>

        <section aria-label="Your requirements">
          <h2 className="pb-3 font-medium">Your open requirements</h2>
          {requirements.length === 0 ? (
            <p className="text-muted-foreground pb-3 text-sm">
              Nothing posted yet — creators who fit can approach the moment you post one.
            </p>
          ) : (
            <ul className="flex flex-col gap-3 pb-4">
              {requirements.map((requirement) => (
                <li key={requirement.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{requirement.title}</CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-2">
                        {requirement.budget ? <Badge variant="outline">{requirement.budget}</Badge> : null}
                        {requirement.deadline ? (
                          <span>by {dateFormat.format(requirement.deadline)}</span>
                        ) : null}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{requirement.brief}</p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Post a requirement</CardTitle>
              <CardDescription>
                It lists on the open board — creators who fit approach you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RequirementForm />
            </CardContent>
          </Card>
        </section>

        <section aria-label="Find creators">
          <Card>
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">Find creators</p>
                <p className="text-muted-foreground text-sm">
                  Browse public creator pages and reach out from there.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/explore">
                  Explore
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </BusinessChrome>
  );
}

/** Light business chrome (brief 11: same tokens, a touch more utilitarian). */
function BusinessChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-3 px-4">
          <Link href="/" aria-label="Plugfolio home" className="flex items-center">
            <Logo layout="horizontal" tone="auto" />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/api/auth/signout">
              <LogOut className="size-4" />
              Sign out
            </Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl px-4 pb-16">{children}</main>
    </div>
  );
}

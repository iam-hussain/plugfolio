import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyBusiness, listMyBusinessCollabs, listMyRequirements } from "@plugfolio/core";
import {
  ApproachCount,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  BoardCount,
  BoardHeading,
  BoardSection,
  BoardTitle,
  BusinessIdentity,
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
  RequirementBrief,
  RequirementCard,
  RequirementHeader,
  RequirementMeta,
  RequirementTitle,
} from "@plugfolio/ui";
import { ArrowRight, LifeBuoy, LogOut } from "lucide-react";
import { Logo } from "@/components/brand";
import {
  BusinessForm,
  CloseRequirementButton,
  CollabList,
  RequirementForm,
} from "@/features/business-collab";
import { auth } from "@/server/auth";
import { businessCollabDeps } from "@/server/container";

/**
 * The business home (briefs 11–12, §5.24).
 *
 * A brand arrives to do one of three things: sign up, see who is waiting on
 * them, or post a brief. Everything else stands down.
 *
 * v1 HANDLES NO MONEY, and this is the surface where that is easiest to
 * imply by accident. Budget is free text and never a validated currency
 * field — the thread's job ends at agreed terms and payment settles off
 * Plugfolio. Nothing here suggests an escrow, because there is none.
 *
 * Light chrome, not the creator dashboard's: a business has no profiles, no
 * shelves and no posts, so a section tab row would be six links to places
 * it cannot go.
 */
export const metadata: Metadata = { title: "Collabs" };

const dateFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });

export default async function BusinessCollabsPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const business = await getMyBusiness(businessCollabDeps, session.user.id);

  /* ── No business yet ──────────────────────────────────────
     Two required fields and one optional. A brand should be able to post a
     brief in the sitting they arrived in, so sign-up asks for the two
     things a creator needs to judge them by and nothing more. */
  if (!business) {
    return (
      <BusinessChrome>
        <header className="py-8">
          <p className="tracking-eyebrow text-muted-foreground text-micro pb-1 font-mono uppercase">
            Business
          </p>
          <h1 className="font-display tracking-display text-name font-bold">
            Create your business
          </h1>
          <p className="text-muted-foreground text-copy pt-1.5">
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

  const openCount = requirements.filter((requirement) => requirement.closedAt === null).length;
  const closedCount = requirements.length - openCount;
  const agreedCount = collabs.filter((collab) => collab.agreed).length;

  return (
    <BusinessChrome>
      <header className="py-8">
        <p className="tracking-eyebrow text-muted-foreground text-micro pb-1 font-mono uppercase">
          Business
        </p>
        <h1 className="font-display tracking-display text-name font-bold">Collabs</h1>
      </header>

      <div className="flex flex-col gap-7">
        <BusinessIdentity>
          <Avatar className="rounded-image size-14 shrink-0">
            {business.logoUrl ? <AvatarImage src={business.logoUrl} alt="" /> : null}
            <AvatarFallback className="bg-muted text-foreground font-display rounded-image text-title font-bold">
              {business.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-display tracking-display text-title truncate font-bold">
              {business.name}
            </p>
            <p className="text-muted-foreground text-copy truncate pt-0.5">
              {business.description}
            </p>
          </div>
        </BusinessIdentity>

        {/* ── Threads ── */}
        <BoardSection aria-label="Collab threads">
          <BoardHeading>
            <BoardTitle>Threads</BoardTitle>
            {collabs.length > 0 ? (
              <BoardCount>
                {collabs.length}
                {agreedCount > 0 ? ` · ${agreedCount} agreed` : null}
              </BoardCount>
            ) : null}
          </BoardHeading>

          {collabs.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyTitle>No threads yet</EmptyTitle>
                <EmptyDescription>
                  Post a requirement below and creators will approach you — or browse creator pages
                  and reach out first.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" asChild>
                  <Link href="/explore">
                    Browse creators
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <CollabList collabs={collabs} show="creator" />
          )}
        </BoardSection>

        {/* ── Requirements ── */}
        <BoardSection aria-label="Your requirements">
          <BoardHeading>
            <BoardTitle>Your requirements</BoardTitle>
            {requirements.length > 0 ? (
              <BoardCount>
                {openCount} open
                {closedCount > 0 ? ` · ${closedCount} closed` : null}
              </BoardCount>
            ) : null}
          </BoardHeading>

          {requirements.length === 0 ? (
            <p className="text-muted-foreground text-copy pb-4">
              Nothing posted yet — creators who fit can approach the moment you post one.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5 pb-5">
              {requirements.map((requirement) => {
                const closed = requirement.closedAt !== null;
                return (
                  <li key={requirement.id}>
                    <RequirementCard state={closed ? "closed" : "open"}>
                      <RequirementHeader>
                        <RequirementTitle state={closed ? "closed" : "open"}>
                          {requirement.title}
                        </RequirementTitle>
                        {closed ? (
                          <Badge variant="secondary">Closed</Badge>
                        ) : (
                          <CloseRequirementButton requirementId={requirement.id} />
                        )}
                      </RequirementHeader>

                      <RequirementMeta>
                        {/* Free text, deliberately — never a formatted amount. */}
                        {requirement.budget ? <span>Budget {requirement.budget}</span> : null}
                        {requirement.deadline ? (
                          <span>By {dateFormat.format(requirement.deadline)}</span>
                        ) : null}
                        {/* "no approaches yet", not "0" — a zero beside a brief
                            posted an hour ago reads as failure. */}
                        <ApproachCount tone={requirement.approachCount === 0 ? "none" : "some"}>
                          {requirement.approachCount === 0
                            ? "no approaches yet"
                            : `${requirement.approachCount} approached`}
                        </ApproachCount>
                        {closed ? <span>Existing threads continue</span> : null}
                      </RequirementMeta>

                      <RequirementBrief state={closed ? "closed" : "open"}>
                        {requirement.brief}
                      </RequirementBrief>
                    </RequirementCard>
                  </li>
                );
              })}
            </ul>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Post a requirement</CardTitle>
              <CardDescription>
                It goes on the open board where creators can find and approach it. You can close it
                any time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RequirementForm />
            </CardContent>
          </Card>
        </BoardSection>

        {/* ── Find creators ──
            There is no bespoke browse screen and there should not be:
            vetting a creator means reading their public page, which is the
            same page a shopper reads. A brand-only view of a creator would
            be a second version of the truth. */}
        <BoardSection aria-label="Find creators">
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-3.5">
              <div className="min-w-0 flex-1">
                <p className="text-label font-bold">Find creators</p>
                <p className="text-muted-foreground text-copy pt-1">
                  Vetting a creator means reading their page — the same one their shoppers read.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/explore">
                  Explore
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </BoardSection>
      </div>
    </BusinessChrome>
  );
}

/** Light business chrome (brief 11: same tokens, a touch more utilitarian). */
function BusinessChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
        <div className="max-w-reading mx-auto flex h-14 w-full items-center justify-between gap-3 px-5">
          <Link href="/" aria-label="Plugfolio home" className="flex items-center">
            <Logo layout="horizontal" tone="auto" />
          </Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/support">
                <LifeBuoy className="size-4" aria-hidden="true" />
                Support
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/api/auth/signout">
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-reading mx-auto w-full px-5 pb-16">{children}</main>
    </div>
  );
}

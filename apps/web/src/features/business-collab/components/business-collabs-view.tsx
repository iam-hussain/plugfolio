import type { Business, CollabSummary, RequirementView } from "@plugfolio/core";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
} from "@plugfolio/ui";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { BusinessChrome, BusinessPageHeader } from "./business-chrome";
import { CollabList } from "./collab-list";
import { RequirementForm } from "./requirement-form";
import { RequirementRow } from "./requirement-row";

/**
 * The business home (briefs 11–12, §5.24) once a business exists.
 *
 * A brand arrives to do one of three things: see who is waiting on them, post a
 * brief, or go find creators. Everything else stands down.
 *
 * v1 HANDLES NO MONEY, and this is the surface where that is easiest to imply
 * by accident. The thread's job ends at agreed terms and payment settles off
 * Plugfolio. Nothing here suggests an escrow, because there is none (§2.3).
 */
export type BusinessCollabsViewProps = {
  business: Business;
  requirements: readonly RequirementView[];
  collabs: readonly CollabSummary[];
};

export function BusinessCollabsView({ business, requirements, collabs }: BusinessCollabsViewProps) {
  const openCount = requirements.filter((requirement) => requirement.closedAt === null).length;
  const closedCount = requirements.length - openCount;
  const agreedCount = collabs.filter((collab) => collab.agreed).length;

  return (
    <BusinessChrome>
      <BusinessPageHeader title="Collabs">
        Two doors. Post a brief and let creators come to you, or go find one and ask. Either way
        it ends in one thread — and the money settles off-platform.
      </BusinessPageHeader>

      {/* The two doors (v2, ADR-0026): the only decisions this screen asks. */}
      <div className="mb-7 grid gap-3 lg:grid-cols-2">
        <a
          href="#post-a-requirement"
          className="border-primary bg-card rounded-tile block border p-[18px] transition-transform duration-150 hover:-translate-y-0.5"
        >
          <p className="text-primary text-pico tracking-eyebrow font-mono uppercase">Door one</p>
          <p className="font-display text-body mt-2 font-bold tracking-[-0.03em]">
            Post a requirement
          </p>
          <p className="text-muted-foreground text-label mt-1.5 leading-[1.55]">
            Product, kind of content, budget, deadline. It lists on the open board.
          </p>
        </a>
        <Link
          href="/explore"
          className="border-border bg-card rounded-tile hover:border-primary block border p-[18px] transition-[transform,border-color] duration-150 hover:-translate-y-0.5"
        >
          <p className="text-faint text-pico tracking-eyebrow font-mono uppercase">Door two</p>
          <p className="font-display text-body mt-2 font-bold tracking-[-0.03em]">
            Approach a creator
          </p>
          <p className="text-muted-foreground text-label mt-1.5 leading-[1.55]">
            Browse pages; the request button sits on the creator&apos;s own page.
          </p>
        </Link>
      </div>

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
              {requirements.map((requirement) => (
                <li key={requirement.id}>
                  <RequirementRow requirement={requirement} />
                </li>
              ))}
            </ul>
          )}

          <Card id="post-a-requirement" className="scroll-mt-24">
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

        {/* Door two lives at the top; there is deliberately no bespoke browse
            screen — vetting a creator means reading their public page, the
            same one a shopper reads. */}
      </div>
    </BusinessChrome>
  );
}

/**
 * The other half of the business home: no business yet.
 *
 * Two required fields and one optional. A brand should be able to post a brief
 * in the sitting they arrived in, so sign-up asks for the two things a creator
 * needs to judge them by and nothing more.
 */
export function BusinessSignUpScreen({ form }: { form: React.ReactNode }) {
  return (
    <BusinessChrome>
      <BusinessPageHeader title="Create your business">
        A name and what you sell — that&apos;s the whole sign-up.
      </BusinessPageHeader>
      <Card>
        <CardContent>{form}</CardContent>
      </Card>
    </BusinessChrome>
  );
}

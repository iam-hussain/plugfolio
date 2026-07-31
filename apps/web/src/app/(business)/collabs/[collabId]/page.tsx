import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { NotFoundError, getCollabThread } from "@plugfolio/core";
import {
  AgreedBanner,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  MessageBubble,
  TermsCard,
  TermsHeader,
  TermsLabel,
  TermsLine,
  TermsSubtitle,
  TermsTitle,
  ThreadEvent,
} from "@plugfolio/ui";
import { ArrowLeft, Check } from "lucide-react";
import { ProposeTermsForm, ThreadActions } from "@/features/business-collab";
import { auth } from "@/server/auth";
import { businessCollabDeps } from "@/server/container";

/**
 * One collab thread — where the bargain actually happens (§5.24, brief 12).
 *
 * ONE SCREEN, TWO ROLES. The viewer's side comes back from the service and
 * drives the back link, the attribution and which bubbles sit right.
 * Building a business version and a creator version would be two screens
 * that have to agree about one conversation forever.
 *
 * THE PIN IS THE POINT. A negotiation held only in messages leaves both
 * sides scrolling to find what was agreed and disagreeing later, so the
 * live terms sit pinned at the top and a new proposal clears BOTH
 * acceptances. "Agreed" can then only mean agreed to the terms shown.
 *
 * v1 handles no money: price is free text, the thread's job ends at agreed
 * terms, and the banner says payment settles off Plugfolio rather than
 * implying an escrow that does not exist.
 *
 * Non-participants get notFound(), never a permission error — confirming a
 * thread exists is itself the leak.
 */
type Params = { collabId: string };

export const metadata: Metadata = { title: "Collab" };

const timeFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const termsDateFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });

export default async function CollabThreadPage({ params }: { params: Promise<Params> }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const { collabId } = await params;
  let result: Awaited<ReturnType<typeof getCollabThread>>;
  try {
    result = await getCollabThread(businessCollabDeps, session.user.id, collabId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  const { thread, side } = result;

  const agreed = thread.businessAgreedAt !== null && thread.creatorAgreedAt !== null;
  const mine = side === "business" ? thread.businessAgreedAt : thread.creatorAgreedAt;
  const theirs = side === "business" ? thread.creatorAgreedAt : thread.businessAgreedAt;

  const terms = thread.termsContent
    ? [
        thread.termsContent,
        thread.termsPrice,
        thread.termsDeadline ? `by ${termsDateFormat.format(thread.termsDeadline)}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return (
    <main className="max-w-reading mx-auto w-full px-5 pb-14">
      {/* Back goes where the viewer came from. Sending a creator to /collabs
          would land them on a business surface they cannot use. */}
      <nav className="py-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={side === "business" ? "/collabs" : "/dashboard/collabs"}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            All collabs
          </Link>
        </Button>
      </nav>

      <TermsCard status={agreed ? "agreed" : "negotiating"}>
        <TermsHeader>
          <div className="min-w-0 flex-1">
            <TermsTitle>
              {thread.businessName} × @{thread.username}
            </TermsTitle>
            <TermsSubtitle>{thread.requirementTitle ?? "Direct collab"}</TermsSubtitle>
          </div>
          <Badge variant={agreed ? "default" : "outline"}>
            {agreed ? "Agreed" : "Negotiating"}
          </Badge>
        </TermsHeader>

        {terms ? (
          <TermsLine>
            <TermsLabel>The terms ·</TermsLabel>
            {terms}
          </TermsLine>
        ) : (
          <TermsLine pending>
            No terms proposed yet — pin what gets made, the price, and the deadline below.
          </TermsLine>
        )}

        {agreed ? (
          <AgreedBanner>
            <Check className="size-4 shrink-0" aria-hidden="true" />
            Both sides accepted — payment settles off Plugfolio.
          </AgreedBanner>
        ) : null}
      </TermsCard>

      {/* Oldest first, and aligned by whose they are. A thread that has to be
          read top-down to make sense should not also be read bottom-up. */}
      <section aria-label="Messages" className="pb-7 pt-6">
        <ul className="flex flex-col gap-3.5">
          {thread.messages.map((message) => {
            const isMine = message.fromBusiness === (side === "business");
            const author = message.fromBusiness ? thread.businessName : `@${thread.username}`;
            return (
              <li
                key={message.id}
                className={isMine ? "flex flex-col items-end" : "flex flex-col items-start"}
              >
                <p className="text-muted-foreground text-micro flex items-center gap-2 pb-1.5">
                  <Avatar className="size-5">
                    <AvatarFallback className="bg-muted text-foreground text-micro">
                      {author.replace("@", "").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground font-bold">{author}</span>
                  <time dateTime={message.createdAt.toISOString()}>
                    {timeFormat.format(message.createdAt)}
                  </time>
                </p>
                <MessageBubble tone={isMine ? "mine" : "theirs"}>{message.body}</MessageBubble>
              </li>
            );
          })}

          {/* The live proposal reads as an event, not as something someone
              said — it changed what both sides are agreeing to. */}
          {terms ? <ThreadEvent>Terms currently on the table</ThreadEvent> : null}
        </ul>
      </section>

      <div className="flex flex-col gap-3">
        <ThreadActions
          collabId={thread.id}
          hasAgreed={mine !== null}
          otherSideAgreed={theirs !== null}
        />
        <ProposeTermsForm collabId={thread.id} />
        <p className="text-muted-foreground text-micro pt-2 text-center">
          The thread&rsquo;s job ends at agreed terms. Plugfolio handles no money and takes no cut —
          payment settles between you.
        </p>
      </div>
    </main>
  );
}

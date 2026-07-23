import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { NotFoundError, getCollabThread } from "@plugfolio/core";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@plugfolio/ui";
import { ArrowLeft } from "lucide-react";
import { ThreadActions } from "@/features/business-collab";
import { auth } from "@/server/auth";
import { businessCollabDeps } from "@/server/container";

// One collab thread — the bargain happens here (brief 12): terms pinned on
// top, a simple exchange, Accept from both sides. Participants only;
// outsiders get a 404, not a hint it exists.
type Params = { collabId: string };

export const metadata: Metadata = { title: "Collab" };

const timeFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

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

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-8">
      <nav className="py-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={side === "business" ? "/collabs" : "/dashboard/collabs"}>
            <ArrowLeft className="size-4" />
            Collabs
          </Link>
        </Button>
      </nav>

      {/* The terms, always visible at the top (brief 12). */}
      <Card className="mb-6">
        <CardContent className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="font-display truncate text-lg font-semibold">
              {thread.businessName} × @{thread.username}
            </h1>
            <p className="text-muted-foreground truncate text-sm">
              {thread.requirementTitle ?? "Direct collab"}
            </p>
          </div>
          <Badge variant={agreed ? "default" : "outline"}>
            {agreed ? "Agreed" : "Negotiating"}
          </Badge>
        </CardContent>
      </Card>
      {agreed ? (
        <p className="text-muted-foreground pb-6 text-center text-xs">
          Both sides accepted — payment settles off-platform.
        </p>
      ) : null}

      <section aria-label="Messages" className="pb-6">
        <ul className="flex flex-col gap-4">
          {thread.messages.map((message) => {
            const isMine = message.fromBusiness === (side === "business");
            const author = message.fromBusiness ? thread.businessName : `@${thread.username}`;
            return (
              <li key={message.id}>
                <Message align={isMine ? "end" : "start"}>
                  <MessageAvatar>
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-muted text-foreground text-xs">
                        {author.replace("@", "").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </MessageAvatar>
                  <MessageContent>
                    <MessageHeader>
                      {author} · {timeFormat.format(message.createdAt)}
                    </MessageHeader>
                    <div
                      className={
                        isMine
                          ? "bg-primary text-primary-foreground w-fit rounded-lg px-3 py-2 text-sm"
                          : "bg-muted text-foreground w-fit rounded-lg px-3 py-2 text-sm"
                      }
                    >
                      {message.body}
                    </div>
                  </MessageContent>
                </Message>
              </li>
            );
          })}
        </ul>
      </section>

      <ThreadActions
        collabId={thread.id}
        hasAgreed={mine !== null}
        otherSideAgreed={theirs !== null}
      />
    </main>
  );
}

import { getAdminCollabThread, NotFoundError } from "@plugfolio/core";
import { Badge, Button, cn, ConfirmDialog, MessageBubble } from "@plugfolio/ui";
import { ArrowLeft, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Panel } from "@/components/panel";
import { CollabStateBadge } from "@/components/status-badges";
import { requireAdmin } from "@/server/auth";
import { repositories } from "@/server/container";
import { deleteCollabMessageAction } from "./actions";

export const metadata: Metadata = { title: "Collab thread" };
export const dynamic = "force-dynamic";

export default async function CollabThreadPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) notFound();
  let thread;
  try {
    thread = await getAdminCollabThread({ collabs: repositories.collabs }, id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  return (
    <div className="max-w-reading mx-auto">
      <Link
        href="/collabs"
        className="text-muted-foreground text-micro mb-3.5 inline-flex items-center gap-[7px] font-mono"
      >
        <ArrowLeft aria-hidden className="size-4" /> Collabs
      </Link>

      <Panel className="mb-4 px-5 py-[18px]">
        <h1 className="font-display text-body font-bold tracking-[-0.01em]">
          {thread.businessName} <span className="text-faint">↔</span>{" "}
          <span className="font-mono">/{thread.profileUsername}</span>
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2.5">
          <span className="text-muted-foreground text-micro">
            Source: {thread.requirementTitle ?? "Direct reach-out"}
          </span>
          <CollabStateBadge
            businessAgreedAt={thread.businessAgreedAt}
            creatorAgreedAt={thread.creatorAgreedAt}
          />
        </div>
      </Panel>

      {thread.messages.map((message) => {
        const creatorSide = message.role === "creator";
        return (
          <div
            key={message.id}
            className={cn("mb-3.5 flex", creatorSide ? "justify-end" : "justify-start")}
          >
            <div className="max-w-[78%]">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-micro font-semibold">{message.senderName}</span>
                <Badge shape="square" variant="outline-muted" className="text-pico px-1.5 py-px">
                  {creatorSide ? "Creator" : "Business"}
                </Badge>
                <span className="text-faint text-pico font-mono tabular-nums">
                  {message.createdAt.toISOString().replace("T", " ").slice(0, 16)}
                </span>
              </div>
              <MessageBubble className="max-w-none" tone={creatorSide ? "creator" : "business"}>
                {message.body}
                <ConfirmDialog
                  trigger={
                    <Button
                      size="icon-2xs"
                      variant="ghost-muted"
                      className="ml-1 size-5 align-middle"
                      aria-label="Delete message"
                    >
                      <Trash2 aria-hidden className="size-[13px]" />
                    </Button>
                  }
                  title="Delete this message?"
                  body="The message is removed from the thread. This cannot be undone. Recorded in the audit log."
                  confirmLabel="Delete message"
                  action={deleteCollabMessageAction}
                  hiddenFields={{ messageId: message.id }}
                  successToast="Message deleted"
                />
              </MessageBubble>
            </div>
          </div>
        );
      })}
      {thread.messages.length === 0 ? (
        <p className="text-faint text-label py-8 text-center">No messages yet.</p>
      ) : null}

      <p className="text-faint text-nano pb-1 pt-2 text-center font-mono">
        Read-only oversight — admins never write into threads.
      </p>
    </div>
  );
}

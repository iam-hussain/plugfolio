import { getAdminCollabThread, NotFoundError } from "@plugfolio/core";
import { Badge, Button, ConfirmDialog, cn } from "@plugfolio/ui";
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

export default async function CollabThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
    <div className="mx-auto max-w-[760px]">
      <Link
        href="/collabs"
        className="font-mono text-muted-foreground mb-3.5 inline-flex items-center gap-[7px] text-xs"
      >
        <ArrowLeft aria-hidden className="size-4" /> Collabs
      </Link>

      <Panel className="mb-4 px-5 py-[18px]">
        <h1 className="font-display text-lg font-bold tracking-[-0.01em]">
          {thread.businessName} <span className="text-faint">↔</span>{" "}
          <span className="font-mono">/{thread.profileUsername}</span>
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2.5">
          <span className="text-muted-foreground text-[12.5px]">
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
                <span className="text-xs font-semibold">{message.senderName}</span>
                <Badge
                  shape="square"
                  variant="outline-muted"
                  className="px-1.5 py-px text-[9px]"
                >
                  {creatorSide ? "Creator" : "Business"}
                </Badge>
                <span className="font-mono text-faint text-[10px] tabular-nums">
                  {message.createdAt.toISOString().replace("T", " ").slice(0, 16)}
                </span>
              </div>
              <div
                className={cn(
                  "border-border rounded-md border px-3.5 py-[11px] text-[13.5px] leading-normal",
                  creatorSide ? "bg-active" : "bg-background",
                )}
              >
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
              </div>
            </div>
          </div>
        );
      })}
      {thread.messages.length === 0 ? (
        <p className="text-faint py-8 text-center text-[13px]">No messages yet.</p>
      ) : null}

      <p className="font-mono text-faint pb-1 pt-2 text-center text-[11px]">
        Read-only oversight — admins never write into threads.
      </p>
    </div>
  );
}

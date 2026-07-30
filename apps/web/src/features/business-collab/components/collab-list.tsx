import type { CollabSummary } from "@plugfolio/core";
import { Avatar, AvatarFallback, Badge } from "@plugfolio/ui";
import Link from "next/link";

/**
 * The thread list, either side's view.
 *
 * It answers one question — which of these needs me — so it carries the
 * counterparty and the state and nothing else. The thread itself answers
 * the rest, and a preview line here would only be a worse version of it.
 */
export type CollabListProps = {
  collabs: readonly CollabSummary[];
  /** Which counterparty to show — the business sees creators, and vice versa. */
  show: "creator" | "business";
};

export function CollabList({ collabs, show }: CollabListProps) {
  if (collabs.length === 0) {
    return <p className="text-muted-foreground text-copy">No collabs yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {collabs.map((collab) => {
        const counterparty = show === "creator" ? `@${collab.username}` : collab.businessName;
        return (
          <li key={collab.id}>
            <Link
              href={`/collabs/${collab.id}`}
              className="border-border bg-card hover:border-primary rounded-tile flex items-center gap-3.5 border px-4 py-3.5 transition-colors"
            >
              <Avatar className="size-10 shrink-0">
                <AvatarFallback className="bg-muted text-foreground">
                  {counterparty.replace("@", "").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-label truncate font-bold">{counterparty}</p>
                <p className="text-muted-foreground text-micro truncate pt-0.5">
                  {collab.requirementTitle ?? "Direct collab"}
                </p>
              </div>
              <Badge variant={collab.agreed ? "default" : "outline"}>
                {collab.agreed ? "Agreed" : "Negotiating"}
              </Badge>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

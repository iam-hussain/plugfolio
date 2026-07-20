import type { CollabSummary } from "@plugfolio/core";
import Link from "next/link";

/** Server-rendered list of collab threads (either side's view). */
export type CollabListProps = {
  collabs: readonly CollabSummary[];
  /** Which counterparty to show — the business sees creators, and vice versa. */
  show: "creator" | "business";
};

export function CollabList({ collabs, show }: CollabListProps) {
  if (collabs.length === 0) {
    return <p className="text-muted-foreground text-sm">No collabs yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {collabs.map((collab) => (
        <li key={collab.id}>
          <Link href={`/collabs/${collab.id}`} className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-medium">
              {show === "creator" ? `@${collab.username}` : collab.businessName}
              {collab.requirementTitle ? (
                <span className="text-muted-foreground font-normal">
                  {" "}
                  · {collab.requirementTitle}
                </span>
              ) : null}
            </span>
            <span className="text-muted-foreground shrink-0 text-xs">
              {collab.agreed ? "Agreed" : "Negotiating"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

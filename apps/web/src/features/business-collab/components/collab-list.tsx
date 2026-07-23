import type { CollabSummary } from "@plugfolio/core";
import { Avatar, AvatarFallback, Badge, Card, CardContent } from "@plugfolio/ui";
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
    <ul className="flex flex-col gap-3">
      {collabs.map((collab) => {
        const counterparty = show === "creator" ? `@${collab.username}` : collab.businessName;
        return (
          <li key={collab.id}>
            <Card>
              <CardContent className="p-0">
                <Link href={`/collabs/${collab.id}`} className="flex items-center gap-3 p-4">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-muted text-foreground">
                      {counterparty.replace("@", "").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{counterparty}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {collab.requirementTitle ?? "Direct collab"}
                    </p>
                  </div>
                  <Badge variant={collab.agreed ? "default" : "outline"}>
                    {collab.agreed ? "Agreed" : "Negotiating"}
                  </Badge>
                </Link>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

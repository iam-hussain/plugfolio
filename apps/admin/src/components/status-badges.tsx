import { Badge } from "@plugfolio/ui";

/** Shared status chips (design badge vocabulary). */
export function ProfileStatusBadge({
  suspendedAt,
  ownerSuspendedAt,
}: {
  suspendedAt: Date | null;
  ownerSuspendedAt: Date | null;
}) {
  if (suspendedAt) return <Badge shape="square" variant="soft-destructive">Suspended</Badge>;
  if (ownerSuspendedAt)
    return <Badge shape="square" variant="soft-destructive">Owner suspended</Badge>;
  return <Badge shape="square" variant="outline-muted">Live</Badge>;
}

export function CollabStateBadge({
  businessAgreedAt,
  creatorAgreedAt,
}: {
  businessAgreedAt: Date | null;
  creatorAgreedAt: Date | null;
}) {
  if (businessAgreedAt && creatorAgreedAt)
    return <Badge shape="square" variant="soft-primary">Agreed</Badge>;
  if (businessAgreedAt || creatorAgreedAt)
    return <Badge shape="square" variant="outline-muted">One side agreed</Badge>;
  return <Badge shape="square" variant="outline-muted">Negotiating</Badge>;
}

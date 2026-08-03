import { COMMENTS_PAGE_SIZE } from "@plugfolio/core";
import type { CommentPage, CommentSort, CreateReportInput } from "@plugfolio/core";
import { Button, CommentSection } from "@plugfolio/ui";
import Link from "next/link";
import { ReportButton } from "@/features/reporting";
import { CommentClaim } from "./comment-claim";
import { CommentForm, type CommentIdentityOption } from "./comment-form";
import { CommentList } from "./comment-list";
import { CommentSortChips } from "./comment-sort";

/**
 * The whole comment surface — heading, count, report, sort, composer, threads,
 * load-more — as one thing.
 *
 * It was written out twice, sixty near-identical lines each, on the creator
 * page and the product page, and neither copy used `CommentSection` from the
 * design system: both re-typed its heading row by hand. The only real
 * differences were which id the thread hangs off, what Report flags, and which
 * query params survive a page turn.
 *
 * Server Component: reading comments never needs an account (§2.2), so the
 * threads render on the server and only the composer, sort and reactions are
 * client islands.
 */
export type CommentsSectionProps = {
  /** The profile the thread hangs off — always present (ADR-0013). */
  profileId: string;
  /** Set when the thread belongs to a product rather than the page itself. */
  productId?: string;
  /** What the Report control flags, and what its copy calls it. */
  report: {
    targetType: CreateReportInput["targetType"];
    targetId: string;
    targetLabel: string;
  };
  comments: CommentPage;
  sort: CommentSort;
  /** 1-based; the page currently rendered. */
  page: number;
  /** The admin switch — off hides the composer, never the threads. */
  enabled: boolean;
  viewer: {
    signedIn: boolean;
    /** The viewer's @member-handle (ADR-0009); empty when signed out. */
    ownHandle: string;
    identities: readonly CommentIdentityOption[];
    defaultAsProfileId: string | null;
  };
  /** Where "load more" points. */
  basePath: string;
  /** Query the host page needs kept across a page turn (a shelf filter, say). */
  preservedQuery?: Record<string, string>;
};

export function CommentsSection({
  profileId,
  productId,
  report,
  comments,
  sort,
  page,
  enabled,
  viewer,
  basePath,
  preservedQuery,
}: CommentsSectionProps) {
  // One context object for the composer and for every reply box under a thread.
  const composerContext = {
    profileId,
    ...(productId ? { productId } : {}),
    ownHandle: viewer.ownHandle,
    identities: viewer.identities,
    defaultAsProfileId: viewer.defaultAsProfileId,
  };
  const hasMore = comments.total > page * COMMENTS_PAGE_SIZE;

  return (
    <CommentSection
      id="comments"
      // v2: named for what a page's comments mostly are — questions about the
      // goods ("does this ship to Pune?", "is the code still live?").
      title={productId ? "Questions about this thing" : "Questions on this page"}
      count={comments.total}
      report={<ReportButton {...report} />}
      className="scroll-mt-20"
    >
      {comments.total > 1 ? <CommentSortChips sort={sort} /> : null}
      <div className="pb-5 pt-4">
        {!enabled ? (
          <p className="text-muted-foreground text-copy">Comments are switched off right now.</p>
        ) : viewer.signedIn ? (
          <CommentForm {...composerContext} />
        ) : (
          <CommentClaim />
        )}
      </div>
      <CommentList
        comments={comments.threads}
        signedIn={viewer.signedIn}
        replyContext={viewer.signedIn && enabled ? composerContext : null}
      />
      {hasMore ? (
        <div className="pt-5">
          <Button variant="secondary" asChild>
            <Link
              href={{
                pathname: basePath,
                query: {
                  ...preservedQuery,
                  // "recent" is the default, so it stays out of the URL.
                  ...(sort === "recent" ? {} : { sort }),
                  cpage: page + 1,
                },
                hash: "comments",
              }}
            >
              Load more comments
            </Link>
          </Button>
        </div>
      ) : null}
    </CommentSection>
  );
}

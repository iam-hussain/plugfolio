import type { EarningsSummary } from "@plugfolio/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@plugfolio/ui";

/**
 * The Earnings tab's read view: outbound taps tied to the post that drove them
 * ("this reel drove 312 taps"). Every figure is TRACKED — a measured tap;
 * estimated conversion figures join only when a network reports back (§6.6).
 */
export type EarningsSummaryViewProps = {
  summary: EarningsSummary;
};

export function EarningsSummaryView({ summary }: EarningsSummaryViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{summary.totalTaps}</CardTitle>
          <CardDescription>outbound taps · tracked</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{summary.totalCodeCopies}</CardTitle>
          <CardDescription>code copies · redemption not tracked</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>By post</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.byPost.length === 0 ? (
            <p className="text-muted-foreground text-sm">No post-driven taps yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {summary.byPost.map((post) => (
                <li key={post.postId} className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm">{post.caption ?? "Untitled post"}</span>
                  <span className="text-muted-foreground shrink-0 text-sm">{post.taps} taps</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>By product</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.byProduct.length === 0 ? (
            <p className="text-muted-foreground text-sm">No taps yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {summary.byProduct.map((product) => (
                <li key={product.productId} className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm">{product.title}</span>
                  <span className="text-muted-foreground shrink-0 text-sm">
                    {product.taps} taps
                    {product.codeCopies > 0 ? ` · ${product.codeCopies} copies` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

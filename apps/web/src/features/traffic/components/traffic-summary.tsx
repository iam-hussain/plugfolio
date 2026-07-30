import { tapThroughRate, type TrafficSummary } from "@plugfolio/core";
import {
  Button,
  DashCardHead,
  DashCardTitle,
  Hint,
  Provenance,
  RankKey,
  RankList,
  RankRow,
  Stat,
  StatDerivation,
  Stats,
  StatUnit,
  TrafficColumns,
} from "@plugfolio/ui";
import Link from "next/link";

/**
 * The Traffic read view (DESIGN dashboard.html §Traffic).
 *
 * Views and taps sit side by side because either alone misleads: 1,284 taps
 * sounds enormous until you see 20,410 views, and 20,410 views sounds like
 * reach until you see how few moved. The rate between them is the number a
 * creator can act on, so it gets equal billing.
 *
 * Every figure is TRACKED — a measured event. There is no "estimated" column
 * because v1 has no conversion source to estimate from, and a plausible number
 * here would be the one dishonest thing in the whole product.
 */
export type TrafficSummaryViewProps = {
  summary: TrafficSummary;
  /** Where to send a creator whose numbers are all zero. */
  pageHref: string;
};

const number = new Intl.NumberFormat("en");

export function TrafficSummaryView({ summary, pageHref }: TrafficSummaryViewProps) {
  const rate = tapThroughRate(summary);

  // Nothing measured yet: two zeroes and a way to change that, rather than
  // three empty panels and two empty tables.
  if (summary.totalViews === 0 && summary.totalTaps === 0) {
    return (
      <>
        <Stats className="md:grid-cols-2">
          <Stat label="Views" value="0" provenance={<Provenance kind="tracked">Tracked</Provenance>} />
          <Stat label="Taps" value="0" provenance={<Provenance kind="tracked">Tracked</Provenance>} />
        </Stats>
        <Hint className="mt-4 mb-0">
          Share your link and both numbers start moving. Views count the moment someone opens your
          page; taps count when they leave for a shop.
        </Hint>
        <Button className="mt-3.5" asChild>
          <Link href={pageHref}>View your page</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <Stats>
        <Stat
          label="Views"
          value={number.format(summary.totalViews)}
          provenance={<Provenance kind="tracked">Tracked</Provenance>}
        >
          Your page, posts and product pages opening.
        </Stat>
        <Stat
          label="Taps"
          value={number.format(summary.totalTaps)}
          provenance={<Provenance kind="tracked">Tracked</Provenance>}
        >
          Someone leaving for a retailer.
        </Stat>
        <Stat
          label="Tap-through"
          value={
            rate === null ? (
              "—"
            ) : (
              <>
                {rate}
                <StatUnit>%</StatUnit>
              </>
            )
          }
          provenance={<StatDerivation>taps ÷ views</StatDerivation>}
        >
          Of everyone who looked, this many went to buy.
        </Stat>
      </Stats>

      <Hint className="mt-4 mb-0">
        Both counts are measured directly. Nothing on this page is estimated, and none of it is
        money — Plugfolio never sees a sale, so it never guesses at one.
      </Hint>

      <TrafficColumns>
        <div>
          <DashCardHead className="mb-0">
            <DashCardTitle className="text-label">By post</DashCardTitle>
            <RankKey>views · taps</RankKey>
          </DashCardHead>
          {summary.byPost.length === 0 ? (
            <Hint className="mt-2.5 mb-0">No post has been opened yet.</Hint>
          ) : (
            <RankList>
              {summary.byPost.slice(0, 5).map((post) => (
                <RankRow
                  key={post.postId}
                  title={post.caption ?? "Untitled post"}
                  gone={!post.caption}
                  secondary={number.format(post.views)}
                  value={number.format(post.taps)}
                />
              ))}
            </RankList>
          )}
        </div>
        <div>
          <DashCardHead className="mb-0">
            <DashCardTitle className="text-label">By product</DashCardTitle>
            <RankKey>views · taps</RankKey>
          </DashCardHead>
          {summary.byProduct.length === 0 ? (
            <Hint className="mt-2.5 mb-0">No product has been opened yet.</Hint>
          ) : (
            <RankList>
              {summary.byProduct.slice(0, 5).map((product) => (
                <RankRow
                  key={product.productId}
                  title={product.title}
                  secondary={number.format(product.views)}
                  value={number.format(product.taps)}
                />
              ))}
            </RankList>
          )}
        </div>
      </TrafficColumns>

      {summary.totalCodeCopies > 0 ? (
        <div className="mt-[22px]">
          <Stat
            label="Code copies"
            value={number.format(summary.totalCodeCopies)}
            provenance={<Provenance kind="untracked">Redemption not tracked</Provenance>}
          >
            Copies are counted here. Whether a code was used at a checkout or a counter happens on
            the retailer&rsquo;s side, where Plugfolio cannot see it — so this page never claims it
            did.
          </Stat>
          <RankList className="mt-3">
            {summary.byCode.map((code) => (
              <RankRow
                key={code.productId}
                title={
                  <>
                    {code.couponCode} · {code.title}
                    {code.inStoreOnly ? (
                      <em className="text-faint text-micro not-italic"> in-store only</em>
                    ) : null}
                  </>
                }
                value={number.format(code.copies)}
              />
            ))}
          </RankList>
        </div>
      ) : null}
    </>
  );
}

import {
  tapThroughRate,
  TRAFFIC_RANGES,
  type TrafficRange,
  type TrafficSummary,
} from "@plugfolio/core";
import {
  Button,
  DashCard,
  DashCardHead,
  DashCardTitle,
  Hint,
  Progress,
  Provenance,
  RankKey,
  RankList,
  RankRow,
  Stat,
  StatUnit,
  TrafficChart,
} from "@plugfolio/ui";
import { cva } from "class-variance-authority";
import type { Route } from "next";
import Link from "next/link";
import { formatNumber } from "@/lib/format-number";

/**
 * The Traffic screen (v2, `Plugfolio v2.dc.html` §Traffic) — range chips, the
 * four counted figures, the views-vs-taps chart, what was opened, and where
 * the views came from. Every number is a measured event; the copy says so
 * where a reader could otherwise assume more (§7.2: no estimates, no money).
 *
 * Server-rendered: the range chips are links, so the whole screen works with
 * scripting off; only the chart itself is a client island.
 */
const rangeChip = cva(
  "rounded-md text-label inline-flex min-h-10 items-center whitespace-nowrap border px-[13px] font-semibold transition-colors",
  {
    variants: {
      active: {
        true: "bg-primary text-primary-foreground border-transparent",
        false: "border-border-strong text-foreground/80 hover:border-primary hover:text-primary",
      },
    },
    defaultVariants: { active: false },
  },
);


export function TrafficScreen({
  summary,
  range,
  profileId,
  pageHref,
}: {
  summary: TrafficSummary;
  range: TrafficRange;
  profileId: string;
  pageHref: Route;
}) {
  const rate = tapThroughRate(summary);
  const maxSourceViews = summary.sources[0]?.views ?? 0;
  const surface = summary.viewsBySurface;
  const empty = summary.totalViews === 0 && summary.totalTaps === 0;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3.5">
        <Hint className="mb-0 max-w-[520px]">
          Every figure is a counted event. Nothing is estimated, and we never see a sale — so
          there is no earnings number here.
        </Hint>
        <nav aria-label="Range" className="flex gap-1.5 overflow-x-auto">
          {TRAFFIC_RANGES.map((option) => (
            <Link
              key={option.key}
              href={
                `/dashboard/traffic?profile=${profileId}${option.key === "month" ? "" : `&range=${option.key}`}` as Route
              }
              aria-current={option.key === range ? "true" : undefined}
              className={rangeChip({ active: option.key === range })}
            >
              {option.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Views" value={formatNumber(summary.totalViews)}>
          A page, post or thing opening.
        </Stat>
        <Stat
          label="Taps out"
          value={<span className="text-primary">{formatNumber(summary.totalTaps)}</span>}
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
        >
          Taps ÷ views, for this range.
        </Stat>
        <Stat
          label="Code copies"
          value={formatNumber(summary.totalCodeCopies)}
          provenance={<Provenance kind="untracked">Redemption not tracked</Provenance>}
        >
          It happens where we cannot see.
        </Stat>
      </div>

      {empty ? (
        <DashCard className="mt-3.5">
          <Hint className="mb-3">
            Nothing measured in this range. Share your link and both numbers start moving — views
            count the moment someone opens your page; taps count when they leave for a shop.
          </Hint>
          <Button asChild>
            <Link href={pageHref}>View your page</Link>
          </Button>
        </DashCard>
      ) : (
        <>
          <DashCard className="mt-3.5">
            <DashCardHead className="mb-2">
              <DashCardTitle className="text-body">Views and taps</DashCardTitle>
              <span className="ml-auto flex items-center gap-3.5">
                <span className="text-faint text-pico tracking-eyebrow flex items-center gap-1.5 font-mono uppercase">
                  <span aria-hidden className="bg-border-strong size-[9px] rounded-[3px]" />
                  Views
                </span>
                <span className="text-faint text-pico tracking-eyebrow flex items-center gap-1.5 font-mono uppercase">
                  <span aria-hidden className="bg-primary size-[9px] rounded-[3px]" />
                  Taps
                </span>
              </span>
            </DashCardHead>
            <TrafficChart series={summary.series} />
            <p className="text-faint text-micro mt-3">
              Each bar pair is one slice of counted events. Repeat fires from in-app browsers are
              de-duplicated.
            </p>
          </DashCard>

          <div className="mt-3.5 grid items-start gap-3.5 lg:grid-cols-[1.35fr_0.65fr]">
            <DashCard className="mt-0">
              <DashCardHead className="mb-1">
                <DashCardTitle className="text-body">What was opened</DashCardTitle>
                <RankKey>views · taps</RankKey>
              </DashCardHead>
              <RankList>
                <RankRow
                  title="Your page"
                  secondary={formatNumber(surface.profile)}
                  value={formatNumber(surface.profile)}
                />
              </RankList>
              {summary.byPost.length > 0 ? (
                <>
                  <p className="text-faint text-pico tracking-eyebrow mt-4 font-mono font-bold uppercase">
                    Posts
                  </p>
                  <RankList className="mt-1.5">
                    {summary.byPost.slice(0, 5).map((post) => (
                      <RankRow
                        key={post.postId}
                        title={post.caption ?? "Untitled post"}
                        gone={!post.caption}
                        secondary={formatNumber(post.views)}
                        value={formatNumber(post.taps)}
                      />
                    ))}
                  </RankList>
                </>
              ) : null}
              {summary.byProduct.length > 0 ? (
                <>
                  <p className="text-faint text-pico tracking-eyebrow mt-4 font-mono font-bold uppercase">
                    Things
                  </p>
                  <RankList className="mt-1.5">
                    {summary.byProduct.slice(0, 5).map((product) => (
                      <RankRow
                        key={product.productId}
                        title={product.title}
                        secondary={formatNumber(product.views)}
                        value={formatNumber(product.taps)}
                      />
                    ))}
                  </RankList>
                </>
              ) : null}
              <p className="text-faint text-micro mt-3.5">
                Views and taps are never shown apart — a big view count with few taps is the thing
                worth knowing.
              </p>
            </DashCard>

            <DashCard className="mt-0">
              <DashCardTitle className="text-body">Where it came from</DashCardTitle>
              <Hint className="mb-0 mt-1.5 text-label">
                The link that brought each view, as the browser reported it.
              </Hint>
              <ul className="mt-3.5 flex flex-col gap-3">
                {summary.sources.map((source) => (
                  <li key={source.source}>
                    <span className="flex items-baseline justify-between gap-2.5">
                      <span className="text-label font-semibold">{source.source}</span>
                      <span className="text-muted-foreground text-nano font-mono tabular-nums">
                        {formatNumber(source.views)} ·{" "}
                        {summary.totalViews > 0
                          ? Math.round((source.views / summary.totalViews) * 100)
                          : 0}
                        %
                      </span>
                    </span>
                    <Progress
                      aria-hidden
                      className="mt-1.5 h-[7px]"
                      value={maxSourceViews > 0 ? (source.views / maxSourceViews) * 100 : 0}
                    />
                  </li>
                ))}
              </ul>
              <p className="border-border text-faint text-micro mt-3.5 border-t pt-3 leading-[1.55]">
                Some browsers send no referrer at all — those land in{" "}
                <b className="text-foreground">Typed or unknown</b> rather than being guessed at.
              </p>
            </DashCard>
          </div>
        </>
      )}
    </>
  );
}

import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { getMyProfiles, getTraffic, parseTrafficRange } from "@plugfolio/core";
import { DashBody, EmptyState } from "@plugfolio/ui";
import { DashboardPageHeader } from "@/features/product-tagging";
import { TrafficScreen } from "@/features/traffic";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { clock, repositories } from "@/server/container";

// The Traffic section (v2, ADR-0026 / §7.2): four counted figures, the
// views-vs-taps chart, what was opened and where the views came from — over a
// range the creator picks. Every number is tracked; nothing is estimated.
export const metadata: Metadata = { title: "Traffic" };

type SearchParams = { profile?: string; range?: string };

export default async function TrafficRoute({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const params = await searchParams;
  const profiles = await getMyProfiles({ profiles: repositories.profiles }, session.user.id);
  const active = pickActiveProfile(profiles, params.profile);
  const range = parseTrafficRange(params.range);
  const summary = active
    ? await getTraffic({ traffic: repositories.traffic, now: clock.now }, active.id, range)
    : null;

  return (
    <>
      <DashboardPageHeader title="Traffic" eyebrow={active ? `@${active.username}` : undefined} />
      <DashBody>
        {active && summary ? (
          <TrafficScreen
            summary={summary}
            range={range}
            profileId={active.id}
            pageHref={`/${active.username}` as Route}
          />
        ) : (
          <EmptyState title="No profile yet">
            Create a profile and its numbers start counting from the first open.
          </EmptyState>
        )}
      </DashBody>
    </>
  );
}

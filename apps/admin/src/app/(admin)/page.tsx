import { Card, CardDescription, CardHeader, CardTitle } from "@plugfolio/ui";
import { clock, repositories } from "@/server/container";

export const dynamic = "force-dynamic";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default async function DashboardPage() {
  const overview = await repositories.overview.overview(new Date(clock.now().getTime() - WEEK_MS));

  const tiles = [
    { label: "Members", value: overview.members },
    { label: "Profiles", value: overview.profiles },
    { label: "Businesses", value: overview.businesses },
    { label: "Posts", value: overview.posts },
    { label: "Products", value: overview.products },
    { label: "Taps · 7d", value: overview.taps7d },
    { label: "Code copies · 7d", value: overview.codeCopies7d },
    { label: "Comments · 7d", value: overview.comments7d },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardHeader>
              <CardDescription className="font-mono tracking-eyebrow text-[11px] uppercase">
                {tile.label}
              </CardDescription>
              <CardTitle className="text-3xl tabular-nums">{tile.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

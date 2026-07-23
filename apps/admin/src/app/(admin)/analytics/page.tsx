import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plugfolio/ui";
import type { Metadata } from "next";
import { clock, repositories } from "@/server/container";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;
const TOP_LIMIT = 10;

// ponytail: tiles + leader tables; a time-series chart lands when operators
// actually ask for trend lines.
export default async function AnalyticsPage() {
  const now = clock.now().getTime();
  const analytics = await repositories.analytics.analytics(
    new Date(now - 7 * DAY_MS),
    new Date(now - 30 * DAY_MS),
    TOP_LIMIT,
  );

  const tiles = [
    { label: "Taps · 7d", value: analytics.taps7d },
    { label: "Taps · 30d", value: analytics.taps30d },
    { label: "Code copies · 7d", value: analytics.codeCopies7d },
    { label: "Code copies · 30d", value: analytics.codeCopies30d },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Projections over the append-only tap and code-copy events — the same truth Earnings reads.
        </p>
      </div>

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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top profiles · 30d</CardTitle>
            <CardDescription>Pages driving the most outbound taps.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile</TableHead>
                  <TableHead className="text-right">Taps</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topProfiles.map((row) => (
                  <TableRow key={row.username}>
                    <TableCell className="font-mono text-xs">/{row.username}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.taps}</TableCell>
                  </TableRow>
                ))}
                {analytics.topProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground text-center">
                      No taps yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top products · 30d</CardTitle>
            <CardDescription>The things shoppers actually tapped out for.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Taps</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topProducts.map((row, index) => (
                  <TableRow key={`${row.title}-${index}`}>
                    <TableCell>
                      <p className="text-sm">{row.title}</p>
                      <p className="text-muted-foreground font-mono text-xs">/{row.username}</p>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.taps}</TableCell>
                  </TableRow>
                ))}
                {analytics.topProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground text-center">
                      No taps yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Tap sources · 30d</CardTitle>
          <CardDescription>Which surface the tap came from.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {analytics.sourceSplit.map((row) => (
                <TableRow key={row.source}>
                  <TableCell className="font-mono text-xs">{row.source}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.taps}</TableCell>
                </TableRow>
              ))}
              {analytics.sourceSplit.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-muted-foreground text-center">
                    No taps yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

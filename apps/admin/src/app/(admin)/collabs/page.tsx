import { listCollabs } from "@plugfolio/core";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plugfolio/ui";
import type { Metadata } from "next";
import { SearchHeader } from "@/components/search-header";
import { repositories } from "@/server/container";

export const metadata: Metadata = { title: "Collabs" };
export const dynamic = "force-dynamic";

function agreementState(businessAgreedAt: Date | null, creatorAgreedAt: Date | null): string {
  if (businessAgreedAt && creatorAgreedAt) return "Agreed";
  if (businessAgreedAt || creatorAgreedAt) return "One side agreed";
  return "Negotiating";
}

export default async function CollabsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const collabs = await listCollabs({ collabs: repositories.collabs }, q);

  return (
    <div className="flex flex-col gap-6">
      <SearchHeader title="Collabs" query={q} placeholder="Search business, profile…" />
      <p className="text-muted-foreground text-sm">
        Read-only oversight — a bad actor in a thread is handled by suspending the member.
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Business ↔ Creator</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Messages</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Started</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collabs.map((collab) => {
            const state = agreementState(collab.businessAgreedAt, collab.creatorAgreedAt);
            return (
              <TableRow key={collab.id}>
                <TableCell className="text-sm">
                  {collab.businessName}{" "}
                  <span className="text-muted-foreground">↔</span>{" "}
                  <span className="font-mono text-xs">/{collab.profileUsername}</span>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-60 truncate text-xs">
                  {collab.requirementTitle ?? "Direct reach-out"}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs tabular-nums">
                  {collab.messageCount}
                </TableCell>
                <TableCell>
                  <Badge variant={state === "Agreed" ? "secondary" : "outline"}>{state}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs tabular-nums">
                  {collab.createdAt.toISOString().slice(0, 10)}
                </TableCell>
              </TableRow>
            );
          })}
          {collabs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground text-center">
                No collabs match.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}

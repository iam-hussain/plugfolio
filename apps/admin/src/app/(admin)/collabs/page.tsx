import { listCollabs } from "@plugfolio/core";
import {
  Button,
  PageHeader,
  Pager,
  SearchField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plugfolio/ui";
import { Download } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Panel } from "@/components/panel";
import { CollabStateBadge } from "@/components/status-badges";
import { pagedHref, pageQuery, type ListParams } from "@/lib/list-params";
import { repositories } from "@/server/container";

export const metadata: Metadata = { title: "Collabs" };
export const dynamic = "force-dynamic";

export default async function CollabsPage({
  searchParams,
}: {
  searchParams: Promise<ListParams>;
}) {
  const params = await searchParams;
  const page = pageQuery(params);
  const { rows, total } = await listCollabs({ collabs: repositories.collabs }, params.q, page);

  return (
    <>
      <PageHeader
        title="Collabs"
        subtitle="Read-only oversight — a bad actor in a thread is handled by suspending the member."
      >
        <form className="flex flex-wrap items-center gap-2">
          <SearchField
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search business / profile"
            className="w-[280px]"
          />
          <Button type="submit" size="xs" variant="outline-strong">
            Search
          </Button>
          <Button asChild size="xs" variant="ghost-muted">
            <a href={`/collabs/export${params.q ? `?q=${encodeURIComponent(params.q)}` : ""}`}>
              <Download aria-hidden className="size-[15px]" /> Export CSV
            </a>
          </Button>
        </form>
      </PageHeader>

      <Panel className="overflow-hidden">
        <Table variant="dense">
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
            {rows.map((collab) => (
              <TableRow key={collab.id}>
                <TableCell>
                  <Link href={`/collabs/${collab.id}`} className="block">
                    <span className="font-medium">{collab.businessName}</span>{" "}
                    <span className="text-faint">↔</span>{" "}
                    <span className="font-mono text-muted-foreground text-xs">
                      /{collab.profileUsername}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground text-[13px]">
                  {collab.requirementTitle ?? "Direct reach-out"}
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {collab.messageCount}
                </TableCell>
                <TableCell>
                  <CollabStateBadge
                    businessAgreedAt={collab.businessAgreedAt}
                    creatorAgreedAt={collab.creatorAgreedAt}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {collab.createdAt.toISOString().slice(0, 10)}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-faint py-8 text-center">
                  No collabs match.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Panel>
      <Pager page={page.page} pageSize={page.pageSize} total={total} hrefFor={pagedHref("/collabs", params)} />
    </>
  );
}

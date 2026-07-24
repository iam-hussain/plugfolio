import {
  Button,
  PageHeader,
  Pager,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plugfolio/ui";
import { Download } from "lucide-react";
import type { Metadata } from "next";
import { FilterSelect } from "@/components/filter-select";
import { Panel } from "@/components/panel";
import { PAGE_SIZE } from "@/lib/list-params";
import { repositories } from "@/server/container";

export const metadata: Metadata = { title: "Audit log" };
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGES: Record<string, number | undefined> = {
  "7d": 7,
  "30d": 30,
  today: 1,
  all: undefined,
};
const ACTION_PREFIXES = ["member.", "profile.", "post.", "product.", "comment.", "business.", "requirement.", "collab.", "report.", "settings.", "admin."];

type AuditParams = { admin?: string; action?: string; range?: string; page?: string };

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<AuditParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const rangeDays = RANGES[params.range ?? "30d"];
  const filter = {
    adminEmail: params.admin || undefined,
    actionPrefix: ACTION_PREFIXES.includes(params.action ?? "") ? params.action : undefined,
    since: rangeDays ? new Date(Date.now() - rangeDays * DAY_MS) : undefined,
  };
  const [{ rows, total }, adminEmails] = await Promise.all([
    repositories.audit.search(filter, { page, pageSize: PAGE_SIZE }),
    repositories.audit.admins(),
  ]);

  const hrefFor = (p: number) => {
    const search = new URLSearchParams();
    if (params.admin) search.set("admin", params.admin);
    if (params.action) search.set("action", params.action);
    if (params.range) search.set("range", params.range);
    if (p > 1) search.set("page", String(p));
    const qs = search.toString();
    return qs ? `/audit?${qs}` : "/audit";
  };

  return (
    <>
      <PageHeader title="Audit log">
        <form className="flex flex-wrap items-center gap-2">
          <FilterSelect
            name="admin"
            defaultValue={params.admin}
            label="Filter by admin"
            options={[["", "All admins"], ...adminEmails.map((e) => [e, e] as const)]}
          />
          <FilterSelect
            name="action"
            defaultValue={params.action}
            label="Filter by action"
            options={[["", "All actions"], ...ACTION_PREFIXES.map((p) => [p, `${p}*`] as const)]}
          />
          <FilterSelect
            name="range"
            defaultValue={params.range ?? "30d"}
            label="Filter by date range"
            options={[["30d", "Last 30 days"], ["7d", "Last 7 days"], ["today", "Today"], ["all", "All time"]]}
          />
          <Button type="submit" size="xs" variant="outline-strong">
            Apply
          </Button>
          <Button asChild size="xs" variant="ghost-muted">
            <a href="/audit/export">
              <Download aria-hidden className="size-[15px]" /> Export CSV
            </a>
          </Button>
        </form>
      </PageHeader>

      <Panel className="overflow-hidden">
        <Table variant="dense">
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-mono text-faint whitespace-nowrap text-xs tabular-nums">
                  {entry.createdAt.toISOString().replace("T", " ").slice(0, 16)}
                </TableCell>
                <TableCell className="text-muted-foreground text-[12.5px]">
                  {entry.adminEmail}
                </TableCell>
                <TableCell className="font-mono text-primary text-xs">{entry.action}</TableCell>
                <TableCell className="font-mono text-muted-foreground text-xs">
                  {entry.targetType ? `${entry.targetType}:${entry.targetId ?? ""}` : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[280px] truncate text-[12.5px]">
                  {entry.detail ?? "—"}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-faint py-8 text-center">
                  Nothing yet — admin mutations land here.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Panel>
      <Pager page={page} pageSize={PAGE_SIZE} total={total} hrefFor={hrefFor} />
    </>
  );
}

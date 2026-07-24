import { listReports, type ReportStatus, type ReportTargetType } from "@plugfolio/core";
import {
  ActionForm,
  Badge,
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
import { Download, Image as ImageIcon, MessageSquare, ShoppingBag, UserSquare } from "lucide-react";
import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { FilterSelect } from "@/components/filter-select";
import { Panel } from "@/components/panel";
import { PAGE_SIZE } from "@/lib/list-params";
import { clock, repositories } from "@/server/container";
import { dismissReportAction, resolveReportAction } from "./actions";

export const metadata: Metadata = { title: "Reports" };
export const dynamic = "force-dynamic";

const TARGET_META: Record<ReportTargetType, { label: string; icon: React.ComponentType<{ className?: string }>; href: Route }> = {
  comment: { label: "Comment", icon: MessageSquare, href: "/comments" },
  product: { label: "Product", icon: ShoppingBag, href: "/products" },
  profile: { label: "Profile", icon: UserSquare, href: "/profiles" },
  post: { label: "Post", icon: ImageIcon, href: "/posts" },
};

const CATEGORY_LABEL: Record<string, string> = {
  spam: "Spam",
  scam: "Scam",
  offensive: "Offensive",
  impersonation: "Impersonation",
  other: "Other",
};

function age(from: Date, now: Date): string {
  const hours = Math.max(0, Math.floor((now.getTime() - from.getTime()) / 3_600_000));
  if (hours < 1) return "now";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const statuses: readonly (ReportStatus | "all")[] = ["open", "resolved", "dismissed", "all"];
  const status = statuses.includes(params.status as ReportStatus | "all")
    ? ((params.status ?? "open") as ReportStatus | "all")
    : "open";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const { rows, total } = await listReports({ reports: repositories.reports }, status, {
    page,
    pageSize: PAGE_SIZE,
  });
  const now = clock.now();

  const hrefFor = (p: number) => {
    const search = new URLSearchParams();
    if (status !== "open") search.set("status", status);
    if (p > 1) search.set("page", String(p));
    const qs = search.toString();
    return qs ? `/reports?${qs}` : "/reports";
  };

  return (
    <>
      <PageHeader title="Reports" subtitle="Triage queue — oldest open first.">
        <form className="flex flex-wrap items-center gap-2">
          <FilterSelect
            name="status"
            defaultValue={status}
            label="Filter by status"
            options={[["open", "Open"], ["resolved", "Resolved"], ["dismissed", "Dismissed"], ["all", "All"]]}
          />
          <Button type="submit" size="xs" variant="outline-strong">
            Apply
          </Button>
          <Button asChild size="xs" variant="ghost-muted">
            <a href="/reports/export">
              <Download aria-hidden className="size-[15px]" /> Export CSV
            </a>
          </Button>
        </form>
      </PageHeader>

      <Panel className="overflow-hidden">
        <Table variant="dense">
          <TableHeader>
            <TableRow>
              <TableHead>Reported</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((report) => {
              const meta = TARGET_META[report.targetType];
              return (
                <TableRow key={report.id}>
                  <TableCell className="max-w-[360px]">
                    <span className="flex items-start gap-[9px]">
                      <meta.icon aria-hidden className="text-muted-foreground mt-px size-4 shrink-0" />
                      <span className="min-w-0">
                        <span className="font-mono text-faint block text-[10px] font-bold uppercase tracking-[0.09em]">
                          {meta.label}
                        </span>
                        <span className="mt-0.5 block truncate text-[13px]">{report.snippet}</span>
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge shape="square" variant="outline-muted">
                      {CATEGORY_LABEL[report.category] ?? report.category}
                    </Badge>
                    {report.note ? (
                      <span className="text-muted-foreground mt-0.5 block text-xs">
                        {report.note}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground text-[11.5px]">
                    {report.reporterLabel}
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {age(report.createdAt, now)}
                  </TableCell>
                  <TableCell>
                    {report.status === "open" ? (
                      <Badge shape="square" variant="soft-primary">Open</Badge>
                    ) : (
                      <Badge shape="square" variant="outline-muted">
                        {report.status === "resolved" ? "Resolved" : "Dismissed"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <span className="flex justify-end gap-1.5">
                      <Button asChild size="xs" variant="ghost-muted">
                        <Link href={meta.href}>View target</Link>
                      </Button>
                      {report.status === "open" ? (
                        <>
                          <ActionForm
                            action={resolveReportAction}
                            hiddenFields={{ reportId: report.id }}
                            successToast="Report resolved · recorded in the audit log"
                          >
                            <Button type="submit" size="xs" variant="outline-strong">
                              Resolve
                            </Button>
                          </ActionForm>
                          <ActionForm
                            action={dismissReportAction}
                            hiddenFields={{ reportId: report.id }}
                            successToast="Report dismissed"
                          >
                            <Button type="submit" size="xs" variant="ghost-muted">
                              Dismiss
                            </Button>
                          </ActionForm>
                        </>
                      ) : null}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-faint py-8 text-center">
                  No open reports — nothing in the queue.
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

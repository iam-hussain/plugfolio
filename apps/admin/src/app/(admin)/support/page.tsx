import {
  listSupportTickets,
  type SupportCategory,
  type SupportTicketStatus,
} from "@plugfolio/core";
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
import type { Metadata } from "next";
import { FilterSelect } from "@/components/filter-select";
import { Panel } from "@/components/panel";
import { PAGE_SIZE } from "@/lib/list-params";
import { clock, repositories } from "@/server/container";
import { dismissSupportTicketAction, resolveSupportTicketAction } from "./actions";

export const metadata: Metadata = { title: "Support" };
export const dynamic = "force-dynamic";

// Known issues read as plain English; `other` carries the unknown ones.
const CATEGORY_LABEL: Record<SupportCategory, string> = {
  lost_email_access: "Lost email access",
  change_email: "Change email",
  merge_accounts: "Merge accounts",
  password_trouble: "Password / sign-in",
  username_conflict: "Username / impersonation",
  connection_trouble: "Connection trouble",
  collab_dispute: "Collab dispute",
  delete_account: "Delete account",
  other: "Something else",
};

function age(from: Date, now: Date): string {
  const hours = Math.max(0, Math.floor((now.getTime() - from.getTime()) / 3_600_000));
  if (hours < 1) return "now";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const statuses: readonly (SupportTicketStatus | "all")[] = [
    "open",
    "resolved",
    "dismissed",
    "all",
  ];
  const status = statuses.includes(params.status as SupportTicketStatus | "all")
    ? ((params.status ?? "open") as SupportTicketStatus | "all")
    : "open";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const { rows, total } = await listSupportTickets({ support: repositories.support }, status, {
    page,
    pageSize: PAGE_SIZE,
  });
  const now = clock.now();

  const hrefFor = (p: number) => {
    const search = new URLSearchParams();
    if (status !== "open") search.set("status", status);
    if (p > 1) search.set("page", String(p));
    const qs = search.toString();
    return qs ? `/support?${qs}` : "/support";
  };

  return (
    <>
      <PageHeader
        title="Support"
        subtitle="Requests from users — oldest open first. Reply by email."
      >
        <form className="flex flex-wrap items-center gap-2">
          <FilterSelect
            name="status"
            defaultValue={status}
            label="Filter by status"
            options={[
              ["open", "Open"],
              ["resolved", "Resolved"],
              ["dismissed", "Dismissed"],
              ["all", "All"],
            ]}
          />
          <Button type="submit" size="xs" variant="outline-strong">
            Apply
          </Button>
        </form>
      </PageHeader>

      <Panel className="overflow-hidden">
        <Table variant="dense">
          <TableHeader>
            <TableRow>
              <TableHead>Issue</TableHead>
              <TableHead>Reply to</TableHead>
              <TableHead>From</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="max-w-[420px]">
                  <Badge shape="square" variant="outline-muted">
                    {CATEGORY_LABEL[ticket.category] ?? ticket.category}
                  </Badge>
                  <span className="text-label mt-1 block whitespace-pre-wrap">
                    {ticket.message}
                  </span>
                </TableCell>
                <TableCell>
                  <a
                    href={`mailto:${ticket.contactEmail}`}
                    className="text-primary text-nano font-mono hover:underline"
                  >
                    {ticket.contactEmail}
                  </a>
                </TableCell>
                <TableCell className="text-muted-foreground text-nano font-mono">
                  {ticket.requesterLabel}
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {age(ticket.createdAt, now)}
                </TableCell>
                <TableCell>
                  {ticket.status === "open" ? (
                    <Badge shape="square" variant="soft-primary">
                      Open
                    </Badge>
                  ) : (
                    <Badge shape="square" variant="outline-muted">
                      {ticket.status === "resolved" ? "Resolved" : "Dismissed"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  {ticket.status === "open" ? (
                    <span className="flex justify-end gap-1.5">
                      <ActionForm
                        action={resolveSupportTicketAction}
                        hiddenFields={{ ticketId: ticket.id }}
                        successToast="Ticket resolved · recorded in the audit log"
                      >
                        <Button type="submit" size="xs" variant="outline-strong">
                          Resolve
                        </Button>
                      </ActionForm>
                      <ActionForm
                        action={dismissSupportTicketAction}
                        hiddenFields={{ ticketId: ticket.id }}
                        successToast="Ticket dismissed"
                      >
                        <Button type="submit" size="xs" variant="ghost-muted">
                          Dismiss
                        </Button>
                      </ActionForm>
                    </span>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-faint py-8 text-center">
                  No open tickets — nothing in the queue.
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

import { searchMembers, type MemberStatusFilter } from "@plugfolio/core";
import {
  Badge,
  Button,
  ConfirmDialog,
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
import { BulkAllCheckbox, BulkBar, BulkCheckbox, BulkSelect } from "@/components/bulk-select";
import { FilterSelect } from "@/components/filter-select";
import { Panel } from "@/components/panel";
import { pagedHref, pageQuery, statusFilter, type ListParams } from "@/lib/list-params";
import { repositories } from "@/server/container";
import {
  bulkSuspendMembersAction,
  suspendMemberAction,
  unsuspendMemberAction,
} from "./actions";

export const metadata: Metadata = { title: "Members" };
export const dynamic = "force-dynamic";

const STATUSES = ["active", "unverified", "suspended"] as const;

function statusBadge(member: { suspendedAt: Date | null; emailVerified: Date | null }) {
  if (member.suspendedAt) return <Badge shape="square" variant="soft-destructive">Suspended</Badge>;
  if (!member.emailVerified) return <Badge shape="square" variant="outline-muted">Unverified</Badge>;
  return <Badge shape="square" variant="outline-muted">Active</Badge>;
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<ListParams>;
}) {
  const params = await searchParams;
  const status = statusFilter<MemberStatusFilter>(params.status, STATUSES);
  const page = pageQuery(params);
  const { rows, total } = await searchMembers(
    { members: repositories.members },
    params.q,
    status,
    page,
  );

  return (
    <BulkSelect>
      <PageHeader title="Members">
        <form className="flex flex-wrap items-center gap-2">
          <FilterSelect
            name="status"
            defaultValue={params.status}
            label="Filter by status"
            options={[["", "All statuses"], ["active", "Active"], ["unverified", "Unverified"], ["suspended", "Suspended"]]}
          />
          <SearchField
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search email / @handle / name"
            className="w-60"
          />
          <Button type="submit" size="xs" variant="outline-strong">
            Search
          </Button>
          <Button asChild size="xs" variant="ghost-muted">
            <a href={`/members/export${params.q ? `?q=${encodeURIComponent(params.q)}` : ""}`}>
              <Download aria-hidden className="size-[15px]" /> Export CSV
            </a>
          </Button>
        </form>
      </PageHeader>

      <BulkBar
        verb="Suspend"
        pastVerb="Suspended"
        noun="members"
        body="The action applies to every selected row. Reversible — nothing is deleted. Recorded in the audit log."
        action={bulkSuspendMembersAction}
        requireReason
      />

      <Panel className="overflow-hidden">
        <Table variant="dense">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[34px]">
                <BulkAllCheckbox ids={rows.map((r) => r.id)} />
              </TableHead>
              <TableHead>Member</TableHead>
              <TableHead>@handle</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="w-[34px]">
                  <BulkCheckbox id={member.id} label={`Select ${member.email}`} />
                </TableCell>
                <TableCell>
                  <Link href={`/members/${member.id}`} className="block">
                    <span className="block font-semibold">{member.email}</span>
                    {member.name ? (
                      <span className="text-muted-foreground mt-0.5 block text-xs">
                        {member.name}
                      </span>
                    ) : null}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-muted-foreground text-xs">
                  {member.username ? `@${member.username}` : "—"}
                </TableCell>
                <TableCell>
                  <span className="flex gap-1">
                    {member.profileCount > 0 ? (
                      <Badge shape="square" variant="soft-primary">
                        Creator · {member.profileCount}
                      </Badge>
                    ) : null}
                    {member.hasBusiness ? (
                      <Badge shape="square" variant="soft-primary">
                        Business
                      </Badge>
                    ) : null}
                  </span>
                </TableCell>
                <TableCell>{statusBadge(member)}</TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {member.createdAt.toISOString().slice(0, 10)}
                </TableCell>
                <TableCell className="text-right">
                  {member.suspendedAt ? (
                    <ConfirmDialog
                      trigger={<Button size="xs" variant="outline-strong">Unsuspend</Button>}
                      title="Unsuspend this member?"
                      body="They regain access and their profiles return to shoppers. Recorded in the audit log."
                      confirmLabel="Unsuspend"
                      tone="primary"
                      action={unsuspendMemberAction}
                      hiddenFields={{ userId: member.id }}
                      successToast="Unsuspended"
                    />
                  ) : (
                    <ConfirmDialog
                      trigger={<Button size="xs" variant="destructive-outline">Suspend</Button>}
                      title="Suspend member"
                      body="They will be blocked from signing in and every profile they own is hidden from shoppers. Reversible — nothing is deleted. Recorded in the audit log."
                      confirmLabel="Suspend"
                      action={suspendMemberAction}
                      hiddenFields={{ userId: member.id }}
                      requireReason={{}}
                      successToast="Suspended"
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-faint py-8 text-center">
                  No members match.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Panel>
      <Pager page={page.page} pageSize={page.pageSize} total={total} hrefFor={pagedHref("/members", params)} />
    </BulkSelect>
  );
}

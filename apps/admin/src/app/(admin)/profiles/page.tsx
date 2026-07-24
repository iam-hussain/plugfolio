import { generateProfileUsername, searchProfiles, type ProfileStatusFilter } from "@plugfolio/core";
import {
  Button,
  ConfirmDialog,
  PageHeader,
  Pager,
  PromptDialog,
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
import { FilterSelect } from "@/components/filter-select";
import { ProfileStatusBadge } from "@/components/status-badges";
import { Panel } from "@/components/panel";
import { pagedHref, pageQuery, statusFilter, type ListParams } from "@/lib/list-params";
import { repositories } from "@/server/container";
import {
  releaseUsernameAction,
  suspendProfileAction,
  unsuspendProfileAction,
} from "./actions";

export const metadata: Metadata = { title: "Profiles" };
export const dynamic = "force-dynamic";

const STATUSES = ["live", "suspended", "owner-suspended"] as const;

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<ListParams>;
}) {
  const params = await searchParams;
  const status = statusFilter<ProfileStatusFilter>(params.status, STATUSES);
  const page = pageQuery(params);
  const { rows, total } = await searchProfiles(
    { profiles: repositories.profiles },
    params.q,
    status,
    page,
  );

  return (
    <>
      <PageHeader title="Profiles">
        <form className="flex flex-wrap items-center gap-2">
          <FilterSelect
            name="status"
            defaultValue={params.status}
            label="Filter by status"
            options={[["", "All statuses"], ["live", "Live"], ["suspended", "Suspended"], ["owner-suspended", "Owner suspended"]]}
          />
          <SearchField
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search username / owner email"
            className="w-[230px]"
          />
          <Button type="submit" size="xs" variant="outline-strong">
            Search
          </Button>
          <Button asChild size="xs" variant="ghost-muted">
            <a href={`/profiles/export${params.q ? `?q=${encodeURIComponent(params.q)}` : ""}`}>
              <Download aria-hidden className="size-[15px]" /> Export CSV
            </a>
          </Button>
        </form>
      </PageHeader>

      <Panel className="overflow-hidden">
        <Table variant="dense">
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((profile) => {
              const suggested = generateProfileUsername();
              return (
                <TableRow key={profile.id}>
                  <TableCell className="font-mono text-[13px] font-bold">
                    <Link href={`/profiles/${profile.id}`}>/{profile.username}</Link>
                  </TableCell>
                  <TableCell>
                    <span className="block">{profile.ownerEmail}</span>
                    {profile.managerCount > 0 ? (
                      <span className="text-muted-foreground mt-0.5 block text-xs">
                        +{profile.managerCount} manager{profile.managerCount > 1 ? "s" : ""}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {profile.postCount} posts · {profile.productCount} products ·{" "}
                    {profile.followerCount.toLocaleString()} followers
                  </TableCell>
                  <TableCell><ProfileStatusBadge suspendedAt={profile.suspendedAt} ownerSuspendedAt={profile.ownerSuspendedAt} /></TableCell>
                  <TableCell className="text-right">
                    <span className="flex justify-end gap-1.5">
                      <PromptDialog
                        trigger={
                          <Button size="xs" variant="ghost-muted">
                            Release username
                          </Button>
                        }
                        title="Release username"
                        description={`Frees /${profile.username} for its rightful owner — the lever for impersonation, squatting, and handle disputes. The page stays live at the new address; nothing is deleted; the freed name is claimable immediately. Recorded in the audit log.`}
                        current={`/${profile.username}`}
                        becomes={`/${suggested}`}
                        label="New username for this page"
                        name="username"
                        defaultValue={suggested}
                        pattern="[a-z0-9][a-z0-9._-]{2,29}"
                        patternHint="3–30 characters: lowercase letters, numbers, dots, dashes. Keep the suggestion or type your own."
                        hiddenFields={{ profileId: profile.id }}
                        confirmLabel="Release & rename"
                        action={releaseUsernameAction}
                        successToast="Username released"
                      />
                      {profile.suspendedAt ? (
                        <ConfirmDialog
                          trigger={<Button size="xs" variant="outline-strong">Unsuspend</Button>}
                          title="Unsuspend this page?"
                          body="The page returns to shoppers at its current address. Recorded in the audit log."
                          confirmLabel="Unsuspend"
                          tone="primary"
                          action={unsuspendProfileAction}
                          hiddenFields={{ profileId: profile.id }}
                          successToast="Unsuspended"
                        />
                      ) : (
                        <ConfirmDialog
                          trigger={<Button size="xs" variant="destructive-outline">Suspend</Button>}
                          title="Suspend profile"
                          body="Only this creator page goes dark for shoppers. The owner can still sign in and manage other pages. Reversible — nothing is deleted. Recorded in the audit log."
                          confirmLabel="Suspend"
                          action={suspendProfileAction}
                          hiddenFields={{ profileId: profile.id }}
                          requireReason={{}}
                          successToast="Suspended"
                        />
                      )}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-faint py-8 text-center">
                  No profiles match.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Panel>
      <Pager page={page.page} pageSize={page.pageSize} total={total} hrefFor={pagedHref("/profiles", params)} />
    </>
  );
}

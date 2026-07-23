import { searchMembers } from "@plugfolio/core";
import {
  Badge,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plugfolio/ui";
import type { Metadata } from "next";
import { repositories } from "@/server/container";
import { suspendMemberAction, unsuspendMemberAction } from "./actions";

export const metadata: Metadata = { title: "Members" };
export const dynamic = "force-dynamic";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const members = await searchMembers({ members: repositories.members }, q);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Members</h1>
        <form className="flex gap-2">
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search email, @handle, name…"
            className="w-64"
            aria-label="Search members"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>@handle</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <p className="font-medium">{member.email}</p>
                {member.name ? <p className="text-muted-foreground text-xs">{member.name}</p> : null}
              </TableCell>
              <TableCell className="font-mono text-xs">@{member.username}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {member.profileCount > 0 ? (
                    <Badge variant="secondary">Creator · {member.profileCount}</Badge>
                  ) : null}
                  {member.hasBusiness ? <Badge variant="secondary">Business</Badge> : null}
                </div>
              </TableCell>
              <TableCell>
                {member.suspendedAt ? (
                  <Badge variant="destructive">Suspended</Badge>
                ) : member.emailVerified ? (
                  <Badge variant="outline">Active</Badge>
                ) : (
                  <Badge variant="outline">Unverified</Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs tabular-nums">
                {member.createdAt.toISOString().slice(0, 10)}
              </TableCell>
              <TableCell className="text-right">
                <form action={member.suspendedAt ? unsuspendMemberAction : suspendMemberAction}>
                  <input type="hidden" name="userId" value={member.id} />
                  <Button
                    type="submit"
                    size="sm"
                    variant={member.suspendedAt ? "secondary" : "destructive"}
                  >
                    {member.suspendedAt ? "Unsuspend" : "Suspend"}
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground text-center">
                No members match.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}

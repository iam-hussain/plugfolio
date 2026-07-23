import { searchProfiles } from "@plugfolio/core";
import {
  ConfirmButton,
  Badge,
  Button,
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
import {
  releaseUsernameAction,
  suspendProfileAction,
  unsuspendProfileAction,
} from "./actions";

export const metadata: Metadata = { title: "Profiles" };
export const dynamic = "force-dynamic";

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const profiles = await searchProfiles({ profiles: repositories.profiles }, q);

  return (
    <div className="flex flex-col gap-6">
      <SearchHeader title="Profiles" query={q} placeholder="Search username, owner email…" />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell className="font-mono text-xs">/{profile.username}</TableCell>
              <TableCell>
                <p className="text-xs">{profile.ownerEmail}</p>
                {profile.managerCount > 0 ? (
                  <p className="text-muted-foreground text-xs">
                    +{profile.managerCount} manager{profile.managerCount > 1 ? "s" : ""}
                  </p>
                ) : null}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs tabular-nums">
                {profile.postCount} posts · {profile.productCount} products ·{" "}
                {profile.followerCount} followers
              </TableCell>
              <TableCell>
                {profile.suspendedAt ? (
                  <Badge variant="destructive">Suspended</Badge>
                ) : profile.ownerSuspendedAt ? (
                  <Badge variant="destructive">Owner suspended</Badge>
                ) : (
                  <Badge variant="outline">Live</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <form action={releaseUsernameAction}>
                    <input type="hidden" name="profileId" value={profile.id} />
                    <ConfirmButton
                      size="sm"
                      variant="ghost"
                      message={`Release /${profile.username}? The page drops to a random username and this one becomes claimable.`}
                    >
                      Release username
                    </ConfirmButton>
                  </form>
                  <form action={profile.suspendedAt ? unsuspendProfileAction : suspendProfileAction}>
                    <input type="hidden" name="profileId" value={profile.id} />
                    <Button
                      type="submit"
                      size="sm"
                      variant={profile.suspendedAt ? "secondary" : "destructive"}
                    >
                      {profile.suspendedAt ? "Unsuspend" : "Suspend"}
                    </Button>
                  </form>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {profiles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground text-center">
                No profiles match.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}

import { generateProfileUsername, searchProfiles } from "@plugfolio/core";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  PromptDialog,
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
  searchParams: Promise<{ q?: string; error?: string }>;
}) {
  const { q, error } = await searchParams;
  const profiles = await searchProfiles({ profiles: repositories.profiles }, q);

  return (
    <div className="flex flex-col gap-6">
      <SearchHeader title="Profiles" query={q} placeholder="Search username, owner email…" />

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Username not released</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

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
          {profiles.map((profile) => {
            // Fresh suggestion per row per render; the admin can overtype it.
            const suggested = generateProfileUsername();
            return (
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
                    <PromptDialog
                      trigger={
                        <Button size="sm" variant="ghost">
                          Release username
                        </Button>
                      }
                      title="Release username"
                      description={
                        <>
                          Frees <span className="font-mono">/{profile.username}</span> for its
                          rightful owner — the lever for impersonation, squatting, and handle
                          disputes (first verified owner keeps the name). The page stays live at
                          the new address and nothing is deleted; the freed name becomes claimable
                          the moment you confirm. Recorded in the audit log.
                        </>
                      }
                      label="New username for this page"
                      name="username"
                      defaultValue={suggested}
                      pattern="[a-z0-9][a-z0-9._-]{2,29}"
                      patternHint="3–30 characters: lowercase letters, numbers, dots, dashes. Keep the suggestion or type your own."
                      hiddenFields={{ profileId: profile.id }}
                      confirmLabel="Release & rename"
                      confirmVariant="destructive"
                      action={releaseUsernameAction}
                    >
                      <div className="bg-muted rounded-md p-3 text-sm">
                        <p className="text-muted-foreground text-xs">Current</p>
                        <p className="font-mono">/{profile.username}</p>
                        <p className="text-muted-foreground mt-2 text-xs">Becomes</p>
                        <p className="font-mono">/{suggested} — or the name you enter below</p>
                      </div>
                    </PromptDialog>
                    <form
                      action={profile.suspendedAt ? unsuspendProfileAction : suspendProfileAction}
                    >
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
            );
          })}
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

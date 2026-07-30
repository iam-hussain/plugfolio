"use client";

import type { ProfileIdentity } from "@plugfolio/core";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DashField,
  DashFieldPair,
  Input,
  Textarea,
} from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateProfileIdentity } from "../api";

/**
 * Public-identity form (brief 10): the Admin edits name, picture and bio; a
 * Manager gets ONLY the picture — the other controls stay visible but
 * disabled with an "Admin only" hint, never silently greyed.
 */
export type ProfileIdentityFormProps = {
  profileId: string;
  username: string;
  identity: ProfileIdentity;
  role: "admin" | "manager";
};

export function ProfileIdentityForm({
  profileId,
  username,
  identity,
  role,
}: ProfileIdentityFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(identity.displayName ?? "");
  const [avatarUrl, setAvatarUrl] = useState(identity.avatarUrl ?? "");
  const [bio, setBio] = useState(identity.bio ?? "");
  const isAdmin = role === "admin";

  const save = useMutation({
    mutationFn: () =>
      updateProfileIdentity(profileId, {
        avatarUrl: avatarUrl.trim() || null,
        // A Manager's payload carries only the picture (the server enforces it).
        ...(isAdmin ? { displayName: displayName.trim() || null, bio: bio.trim() || null } : {}),
      }),
    onSuccess: () => router.refresh(),
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate();
      }}
    >
      {/* Picture URL beside its preview — the field changes the thing next
          to it, so they belong in one row. Paired, neither runs the card's
          full 1200px measure. */}
      <DashFieldPair>
        <DashField
          label="Picture URL"
          htmlFor="identity-avatar"
          note="Paste an image URL. Uploads are not in v1."
        >
          <Input
            id="identity-avatar"
            type="url"
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="https://…/you.jpg"
          />
        </DashField>
        <div className="flex items-center gap-3.5 pt-1">
          <Avatar className="size-14 shrink-0">
            {avatarUrl.trim() ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback className="bg-muted text-foreground">
              {(displayName || username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-faint text-micro font-bold uppercase tracking-[0.06em]">
            Preview
          </span>
        </div>
      </DashFieldPair>

      {/* The Admin/Manager boundary is SHOWN, never hidden: a Manager sees
          the field, sees it labelled Admin-only, and sees it disabled. */}
      <DashField label="Name" hint={isAdmin ? undefined : "· Admin only"} htmlFor="identity-name">
        <Input
          id="identity-name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={80}
          placeholder={`@${username}`}
          disabled={!isAdmin}
        />
      </DashField>

      {/* Capped to a reading measure. A bio is prose, and prose set 1150px
          wide loses the line it is on — the eye cannot find the next one. */}
      <DashField
        label="Bio"
        hint={isAdmin ? "· optional" : "· Admin only"}
        htmlFor="identity-bio"
        className="max-w-[68ch]"
      >
        <Textarea
          id="identity-bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={280}
          rows={3}
          disabled={!isAdmin}
        />
      </DashField>

      {save.isError ? (
        <p role="alert" className="text-destructive text-micro">
          {save.error.message}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-micro">
          {save.isSuccess ? "Saved — live on your page." : "Shown on your public page."}
        </p>
        <Button type="submit" size="sm" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}

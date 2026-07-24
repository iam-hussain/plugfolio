"use client";

import type { ProfileIdentity } from "@plugfolio/core";
import { Avatar, AvatarFallback, AvatarImage, Button, Input, Label, Textarea } from "@plugfolio/ui";
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
        ...(isAdmin
          ? { displayName: displayName.trim() || null, bio: bio.trim() || null }
          : {}),
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
      <div className="flex items-center gap-3">
        <Avatar className="size-14">
          {avatarUrl.trim() ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-muted text-foreground">
            {(displayName || username).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <Label htmlFor="identity-avatar">Picture URL</Label>
          <Input
            id="identity-avatar"
            type="url"
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="https://…/you.jpg"
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="identity-name">
          Name{isAdmin ? "" : " · Admin only"}
        </Label>
        <Input
          id="identity-name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={80}
          placeholder={`@${username}`}
          disabled={!isAdmin}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="identity-bio">
          Bio{isAdmin ? " (optional)" : " · Admin only"}
        </Label>
        <Textarea
          id="identity-bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={280}
          rows={2}
          disabled={!isAdmin}
        />
      </div>

      {save.isError ? (
        <p role="alert" className="text-destructive text-xs">
          {save.error.message}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          {save.isSuccess ? "Saved — live on your page." : "Shown on your public page."}
        </p>
        <Button type="submit" size="sm" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}

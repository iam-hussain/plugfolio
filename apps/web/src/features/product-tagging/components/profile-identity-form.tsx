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
import { ImageCropUpload } from "./image-crop-upload";

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
  const [coverUrl, setCoverUrl] = useState(identity.coverUrl ?? "");
  const [bio, setBio] = useState(identity.bio ?? "");
  const [greeting, setGreeting] = useState(identity.greeting ?? "");
  const isAdmin = role === "admin";

  const save = useMutation({
    mutationFn: () =>
      updateProfileIdentity(profileId, {
        avatarUrl: avatarUrl.trim() || null,
        // A Manager's payload carries only the picture (the server enforces it).
        ...(isAdmin
          ? {
              displayName: displayName.trim() || null,
              bio: bio.trim() || null,
              greeting: greeting.trim() || null,
              coverUrl: coverUrl.trim() || null,
            }
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
      {/* Picture URL beside its preview — the field changes the thing next
          to it, so they belong in one row. Paired, neither runs the card's
          full 1200px measure. */}
      <DashFieldPair>
        <DashField
          label="Picture"
          htmlFor="identity-avatar"
          note="Upload a photo — you frame it, we store it."
        >
          <div className="flex flex-wrap items-center gap-2">
            <ImageCropUpload kind="avatar" onUploaded={setAvatarUrl} label="Upload photo" />
            {avatarUrl.trim() ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setAvatarUrl("")}>
                Remove
              </Button>
            ) : null}
          </div>
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

      {/* The page cover (v2) — framed in the crop dialog like every upload.
          Admin-only, like the rest of how the page looks. */}
      <DashField
        label="Cover picture"
        hint={isAdmin ? "· optional" : "· Admin only"}
        htmlFor="identity-cover"
        note="Wide and shallow (2.5:1) — you frame it when you upload. Clear it for the accent fallback."
      >
        <div className="flex flex-col gap-2">
          {isAdmin ? (
            <div className="flex flex-wrap items-center gap-2">
              <ImageCropUpload kind="cover" onUploaded={setCoverUrl} label="Upload cover" />
              {coverUrl.trim() ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => setCoverUrl("")}>
                  Remove cover
                </Button>
              ) : null}
            </div>
          ) : null}
          {coverUrl.trim() ? (
            <span className="border-border block aspect-[2.5/1] w-full max-w-[420px] overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element -- ponytail: unoptimized until image domains are pinned */}
              <img src={coverUrl} alt="Cover preview" className="size-full object-cover" />
            </span>
          ) : (
            <span className="text-faint text-micro">No cover — the accent gradient shows.</span>
          )}
        </div>
      </DashField>

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

      <DashField
        label="Greeting line"
        hint={isAdmin ? "· optional" : "· Admin only"}
        htmlFor="identity-greeting"
        note="One line above your name — leave it empty for none."
      >
        <Input
          id="identity-greeting"
          value={greeting}
          onChange={(event) => setGreeting(event.target.value)}
          maxLength={80}
          placeholder="Everything I wear, linked."
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

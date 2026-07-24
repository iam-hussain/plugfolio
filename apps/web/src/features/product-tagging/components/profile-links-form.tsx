"use client";

import type { ProfileLinkView, SocialPlatform } from "@plugfolio/core";
import { Button, Input, Label } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveProfileLinks } from "../api";

/**
 * Settings → "Your links" (design-out): one URL per platform feeds the
 * socials row on the public page. Paste-only for now — connected-social
 * auto-fill and drag-to-reorder land with the social APIs (the row renders
 * in a fixed canonical order until then).
 */
const PLATFORMS: readonly { key: SocialPlatform; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/you" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@you" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@you" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/you" },
  { key: "website", label: "Website", placeholder: "https://your-site.com" },
];

export type ProfileLinksFormProps = {
  profileId: string;
  links: readonly ProfileLinkView[];
};

export function ProfileLinksForm({ profileId, links }: ProfileLinksFormProps) {
  const router = useRouter();
  const initial = Object.fromEntries(links.map((link) => [link.platform, link.url]));
  const [urls, setUrls] = useState<Record<SocialPlatform, string>>({
    instagram: initial.instagram ?? "",
    youtube: initial.youtube ?? "",
    tiktok: initial.tiktok ?? "",
    facebook: initial.facebook ?? "",
    website: initial.website ?? "",
  });

  const save = useMutation({
    mutationFn: () =>
      saveProfileLinks(profileId, {
        links: PLATFORMS.filter(({ key }) => urls[key].trim()).map(({ key }) => ({
          platform: key,
          url: urls[key].trim(),
        })),
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
      {PLATFORMS.map(({ key, label, placeholder }) => (
        <div key={key} className="flex flex-col gap-1.5">
          <Label htmlFor={`link-${key}`}>{label}</Label>
          <Input
            id={`link-${key}`}
            type="url"
            value={urls[key]}
            onChange={(event) => setUrls((prev) => ({ ...prev, [key]: event.target.value }))}
            placeholder={placeholder}
          />
        </div>
      ))}
      {save.isError ? (
        <p role="alert" className="text-destructive text-xs">
          {save.error.message}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          {save.isSuccess ? "Saved — live on your page." : "Empty fields are removed on save."}
        </p>
        <Button type="submit" size="sm" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save links"}
        </Button>
      </div>
    </form>
  );
}

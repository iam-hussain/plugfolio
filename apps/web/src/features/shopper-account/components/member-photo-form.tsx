"use client";

import { Avatar, AvatarFallback, AvatarImage, Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
// The leaf, not the product-tagging barrel — the barrel drags the dashboard
// shell (and through core, node:crypto) into this client bundle.
import { ImageCropUpload } from "@/features/product-tagging/components/image-crop-upload";
import { updateMemberImage } from "../api";

/**
 * The member's own picture (shown in the top bar and beside comments):
 * pick → frame in the crop dialog → the avatar-kind upload stores it →
 * saving it onto the account is one PATCH. Sessions are database-backed, so
 * the top bar shows the new face on the refresh.
 */
export function MemberPhotoForm({
  image,
  handle,
}: {
  image: string | null;
  handle: string;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(image);
  const save = useMutation({
    mutationFn: (imageUrl: string | null) => updateMemberImage({ imageUrl }),
    onSuccess: (_data, imageUrl) => {
      setCurrent(imageUrl);
      router.refresh();
    },
  });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar className="size-11">
        {current ? <AvatarImage src={current} alt="" /> : null}
        <AvatarFallback className="text-foreground text-micro">
          {handle.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <ImageCropUpload
        kind="avatar"
        onUploaded={(url) => save.mutate(url)}
        label="Upload photo"
      />
      {current ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={save.isPending}
          onClick={() => save.mutate(null)}
        >
          Remove
        </Button>
      ) : null}
      {save.isError ? (
        <p role="alert" className="text-destructive text-micro">
          {save.error.message}
        </p>
      ) : null}
    </div>
  );
}

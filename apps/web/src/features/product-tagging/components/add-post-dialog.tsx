"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@plugfolio/ui";
import { Plus } from "lucide-react";
import { useState } from "react";
import { NewPostForm } from "./new-post-form";

/** "Add post" as a focused dialog so the posts grid stays a grid (brief 07). */
export function AddPostDialog({ profileId }: { profileId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" />
          Add post
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a post</DialogTitle>
          <DialogDescription>
            Paste the media URL of a reel or photo. Auto-import from your socials lands with the
            social APIs.
          </DialogDescription>
        </DialogHeader>
        <NewPostForm profileId={profileId} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

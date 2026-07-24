"use client";

import { Button } from "@plugfolio/ui";
import { Check, Share2 } from "lucide-react";
import { useState } from "react";

/**
 * The owner's Share action (design-out §00: the share action uses the native
 * share sheet on mobile — Web Share API — never a custom modal). Desktop and
 * unsupported browsers fall back to copying the page URL.
 */
export function ShareButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-pill px-5"
      onClick={async () => {
        const url = `${window.location.origin}${path}`;
        if (navigator.share) {
          await navigator.share({ url }).catch(() => {});
          return;
        }
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
      {copied ? "Copied" : "Share"}
    </Button>
  );
}

"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { recordCodeCopy } from "../api";

/**
 * The code chip (brief 13): tap → clipboard → inline "Copied ✓". The copy
 * event is recorded for Earnings but never blocks the copy itself — same
 * never-block-the-shopper rule as taps.
 */
export type CopyCodeButtonProps = {
  productId: string;
  code: string;
  /** The post the copy happened on, for per-post attribution parity with taps. */
  postId?: string;
};

export function CopyCodeButton({ productId, code, postId }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);
  const record = useMutation({ mutationFn: recordCodeCopy });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Clipboard can be denied in odd in-app browsers — the visible code is
      // still there to read; don't error the card.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    record.mutate({ productId, postId, idempotencyKey: crypto.randomUUID() });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy code ${code}`}
      className="border-accent text-foreground inline-flex min-h-9 items-center gap-2 rounded-md border border-dashed px-3 py-1 font-mono text-sm"
    >
      {code}
      <span aria-live="polite" className="text-muted-foreground text-xs">
        {copied ? "Copied ✓" : "Copy"}
      </span>
    </button>
  );
}

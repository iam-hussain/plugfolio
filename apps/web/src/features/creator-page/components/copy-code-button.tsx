"use client";

import { CodeButton } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { recordCodeCopy } from "../api";

/**
 * The code chip, wired (ADR-0011, DESIGN §.code): tap → clipboard → the chip
 * says "Copied" in place (no toast). The copy is recorded for the traffic
 * tracker but never blocks the copy itself — same never-block-the-shopper
 * rule as taps.
 *
 * The chip is `CodeButton` from the design system. This drew its own lime
 * pill, which was the tile's offer *flag* borrowed onto a control the design
 * keeps outlined: lime marks a coupon in the grid, it is not a button fill.
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

  return <CodeButton code={code} copied={copied} onClick={handleCopy} />;
}

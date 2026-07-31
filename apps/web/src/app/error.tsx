"use client";

import { Button, cn, measure, SystemMark, SystemScreen } from "@plugfolio/ui";
import { Check, Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/brand";
// Deep import, not the chrome barrel: the barrel re-exports AppTopBar, which
// pulls @/server/auth (node:crypto) into this client bundle and fails the build.
import { SiteFooter } from "@/components/chrome/site-footer";

/**
 * Route error boundary (DESIGN error.html, design-handoff §5.25). Must be a
 * Client Component. The sibling of the 404, deliberately the same screen
 * wearing different words — a product where "not found" and "went wrong" look
 * like different companies has told you something about how it was built.
 *
 * Three rules shape the copy:
 *   1. Take the blame — "That's on us, not you." A visitor who thinks they
 *      broke it stops trying, and they almost never did.
 *   2. Try again FIRST — a refresh clears most of these, so support is second.
 *   3. Never let the machine talk — no stack trace, no exception name, no "500".
 *      A reference code the operator can search and the visitor can read aloud.
 */

/** A short, human-readable code — never a stack trace or a class name. */
function stableHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) hash = (hash * 31 + input.charCodeAt(i)) | 0;
  return (hash >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 8);
}
function formatReference(digest: string | undefined, message: string): string {
  const source = (digest ?? "").replace(/[^a-z0-9]/gi, "").toUpperCase();
  const code = (source.length >= 8 ? source : stableHash(digest || message || "error")).slice(0, 8);
  return `${code.slice(0, 4)}-${code.slice(4, 8)}`;
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const reference = useMemo(() => formatReference(error.digest, error.message), [error]);

  useEffect(() => {
    // Surface for observability; the digest correlates with the server log.
    console.error(error);
  }, [error]);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // A clipboard the browser refuses is not worth an error of its own.
    }
  }

  return (
    <div className="bg-background text-foreground flex min-h-dvh flex-col">
      <header className={cn(measure(), "flex items-center py-4")}>
        <Link href="/" aria-label="Plugfolio home" className="flex items-center">
          <Logo layout="horizontal" tone="auto" />
        </Link>
      </header>

      <main className={cn(measure(), "flex-1")}>
        <SystemScreen
          mark={<SystemMark state="cracked" title="A plug with a split body" />}
          title="Something went wrong."
          lede="That’s on us, not you. Trying again usually clears it — if it doesn’t, send us the reference below and we’ll go and look."
          actions={
            <>
              <Button variant="primary" onClick={reset}>
                Try again
              </Button>
              <Button asChild variant="ghost">
                <Link href="/support">Get help</Link>
              </Button>
            </>
          }
        >
          <div className="mt-6 flex justify-center">
            <span className="bg-card shadow-rest rounded-pill text-micro text-faint inline-flex items-center gap-2.5 px-[15px] py-2 font-semibold">
              Reference{" "}
              <b className="text-muted-foreground font-bold tabular-nums tracking-[0.08em]">
                {reference}
              </b>
              <button
                type="button"
                onClick={copyReference}
                aria-label={copied ? "Reference copied" : "Copy the reference"}
                className="hover:bg-active hover:text-primary rounded-pill grid size-6 place-items-center transition-colors"
              >
                {copied ? (
                  <Check className="text-primary size-4" aria-hidden />
                ) : (
                  <Copy className="size-4" aria-hidden />
                )}
              </button>
            </span>
          </div>

          {/* One broken surface is not a broken product. Saying what still
              works stops someone concluding Plugfolio is down and leaving. */}
          <div className="mx-auto mt-[26px] grid max-w-[46ch] gap-2.5 text-left">
            <Reassurance title="Creator pages are unaffected.">
              Anything you already have a link to still opens, and every Buy button on it still
              works.
            </Reassurance>
            <Reassurance title="Nothing was lost.">
              If you were part-way through saving something, it didn’t go through — so nothing was
              half-written.
            </Reassurance>
          </div>
        </SystemScreen>
      </main>

      <SiteFooter />
    </div>
  );
}

function Reassurance({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <p className="bg-card shadow-rest rounded-tile text-copy text-muted-foreground flex items-start gap-[11px] px-[15px] py-[13px] leading-[1.55]">
      <Check
        className="text-brand-violet-deep mt-[3px] size-4 shrink-0"
        strokeWidth={2.4}
        aria-hidden
      />
      <span>
        <b className="text-foreground font-bold">{title}</b> {children}
      </span>
    </p>
  );
}

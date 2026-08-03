"use client";

import type {
  PageAccent,
  PageCoverStyle,
  PageGridStyle,
  PageHeaderStyle,
  PageLinkMode,
} from "@plugfolio/core";
import Link from "next/link";
import { useState } from "react";
import { LookPanel } from "./look-panel";

/**
 * The owner band (v2, `Plugfolio v2.dc.html` §creator bandOwner) — the dashed
 * accent card only the page's own people see: what this is, the way into the
 * back room, and — for the Admin — "Change the look", which unfolds the live
 * look panel right here, over the real page. A Manager gets the band and the
 * Dashboard door; the look stays with the Admin, said plainly rather than
 * hidden (§3.2).
 */
export function OwnerBand({
  profileId,
  role,
  appearance,
}: {
  profileId: string;
  role: "admin" | "manager";
  appearance: {
    accent: PageAccent;
    headerStyle: PageHeaderStyle;
    gridStyle: PageGridStyle;
    coverStyle: PageCoverStyle;
    linkMode: PageLinkMode;
  };
}) {
  const [open, setOpen] = useState(false);
  const admin = role === "admin";

  return (
    <div className="border-primary bg-card rounded-row mt-4 border border-dashed px-4 py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-primary text-pico tracking-eyebrow font-mono font-bold uppercase">
            {admin ? "This is your page" : "You manage this page"}
          </p>
          <p className="text-muted-foreground text-label mt-1 leading-normal">
            {admin
              ? "Visitors see it without these controls."
              : "You can post, tag and curate. Settings and connections stay with the Admin."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={{ pathname: "/dashboard", query: { profile: profileId } }}
            className="border-border-strong text-label rounded-pill flex h-10 items-center whitespace-nowrap border px-4 font-semibold transition-transform hover:-translate-y-px"
          >
            Dashboard
          </Link>
          {admin ? (
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className="bg-primary text-primary-foreground text-label rounded-pill flex h-10 items-center whitespace-nowrap px-4 font-semibold transition-transform hover:-translate-y-px"
            >
              Change the look
            </button>
          ) : null}
        </div>
      </div>
      {admin && open ? (
        <LookPanel profileId={profileId} appearance={appearance} />
      ) : null}
    </div>
  );
}

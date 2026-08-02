"use client";

import { AccountNavItem, AccountNavTrack, AccountPanelHead } from "@plugfolio/ui";
import { useState } from "react";

/**
 * The account, one destination at a time.
 *
 * The page used to be five sections stacked into a single scroll: on a phone
 * you travelled past everything you weren't there for, and "Leaving" was four
 * screens of settings away from the top. It is now a **nav** naming every
 * destination — with the value each currently holds — and the **panel** you
 * chose.
 *
 * One tree, two shapes, no duplicated markup:
 *  · phone — the nav is a scrolling row of chips directly above the panel. It
 *    never leaves the screen, so moving between destinations is one tap rather
 *    than back-out-and-in-again.
 *  · from 900px — the same nav is a sticky rail beside the panel, wide enough
 *    to carry each destination's value on a second line.
 *
 * Selection is local state, not the URL. Switching is instant — no round-trip,
 * which was the whole complaint about the old page — and it costs nothing but a
 * deep link. `ponytail: put the section in ?s= the day someone needs to link
 * one.`
 *
 * Panels arrive already rendered from the server (one carries a server action
 * and all carry server-read data); this component only decides what is on
 * screen.
 */
export type AccountDestination = {
  id: string;
  /** The nav chip's name, and the panel's heading. */
  label: string;
  /** The one line of why, under the panel heading. */
  lead?: string;
  /** The live fact shown on the rail — what this destination currently is. */
  value?: string;
  panel: React.ReactNode;
};

export function AccountShell({ destinations }: { destinations: readonly AccountDestination[] }) {
  const [openId, setOpenId] = useState(destinations[0]?.id);
  const open = destinations.find((item) => item.id === openId) ?? destinations[0];
  if (!open) return null;

  return (
    <div className="mt-6 grid items-start gap-x-[clamp(28px,4vw,56px)] gap-y-4 min-[900px]:grid-cols-[minmax(0,232px)_minmax(0,1fr)]">
      <AccountNavTrack label="Account sections">
        {destinations.map((item) => (
          <AccountNavItem
            key={item.id}
            label={item.label}
            value={item.value}
            active={item.id === open.id}
            aria-current={item.id === open.id ? "page" : undefined}
            onClick={() => setOpenId(item.id)}
          />
        ))}
      </AccountNavTrack>

      <div>
        <AccountPanelHead title={open.label} lead={open.lead} />
        {/* ponytail: no entrance animation — this repo ships no keyframes and a
            settings panel is a state change, not a reveal. */}
        {open.panel}
      </div>
    </div>
  );
}

"use client";

import { AccountIndexRow, AccountPanelHead, BackLink, type AccountTone } from "@plugfolio/ui";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

/**
 * The account, one destination at a time.
 *
 * The page used to be five sections stacked into a single scroll: on a phone
 * you travelled past everything you weren't there for, and "Leaving" was four
 * screens of settings away from the top. It is now an **index** — every
 * destination with the value it currently holds — and the **panel** you chose.
 *
 * One tree, two shapes, no duplicated markup:
 *  · phone — the index and the panel take turns; opening one replaces the
 *    other, and a back control returns. That is the settings pattern every
 *    phone already taught its owner.
 *  · from 900px — both at once: the index is a sticky rail and the panel sits
 *    beside it, so a mouse never pays for the extra step a thumb wanted.
 *
 * Selection is local state, not the URL. Switching destinations is instant —
 * no round-trip, which is the whole complaint about the old page — and it
 * costs nothing but a deep link. `ponytail: put the section in ?s= the day
 * someone needs to link one.`
 *
 * Panels arrive already rendered from the server (they carry a server action
 * and server-read data); this component only decides which one is on screen.
 */
export type AccountDestination = {
  id: string;
  /** The index row's name, and the panel's heading. */
  label: string;
  /** The one line of why, under the panel heading. */
  lead?: string;
  /** The live fact shown in the index — what this destination currently is. */
  value?: string;
  tone: AccountTone;
  panel: React.ReactNode;
};

export function AccountShell({ destinations }: { destinations: readonly AccountDestination[] }) {
  // Null = the phone's index. Desktop always shows a panel, so it reads the
  // first destination rather than an empty column.
  const [openId, setOpenId] = useState<string | null>(null);
  const open = destinations.find((item) => item.id === openId) ?? destinations[0];
  if (!open) return null;

  return (
    <div className="mt-6 grid items-start gap-x-[clamp(28px,4vw,56px)] min-[900px]:grid-cols-[minmax(0,264px)_minmax(0,1fr)]">
      <nav
        aria-label="Account sections"
        data-open={openId ? "panel" : "index"}
        className="border-border bg-card rounded-card divide-border divide-y overflow-hidden border p-1.5 data-[open=panel]:max-[899px]:hidden min-[900px]:sticky min-[900px]:top-[78px] min-[900px]:divide-y-0 min-[900px]:border-0 min-[900px]:bg-transparent min-[900px]:p-0"
      >
        {destinations.map((item) => (
          <AccountIndexRow
            key={item.id}
            tone={item.tone}
            label={item.label}
            value={item.value}
            active={item.id === open.id}
            aria-current={item.id === open.id ? "page" : undefined}
            onClick={() => setOpenId(item.id)}
          />
        ))}
      </nav>

      <div data-open={openId ? "panel" : "index"} className="data-[open=index]:max-[899px]:hidden">
        <AccountPanelHead
          tone={open.tone}
          title={open.label}
          lead={open.lead}
          back={
            <BackLink asChild>
              <button type="button" onClick={() => setOpenId(null)}>
                <ChevronLeft className="size-[15px]" aria-hidden />
                All settings
              </button>
            </BackLink>
          }
        />
        {/* ponytail: no entrance animation — this repo ships no keyframes and a
            settings panel is a state change, not a reveal. The only motion here
            is the rows' colour transition, which is feedback. */}
        {open.panel}
      </div>
    </div>
  );
}

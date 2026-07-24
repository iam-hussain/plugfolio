"use client";

import * as React from "react";
import { Button, ConfirmDialog, type ActionResult } from "@plugfolio/ui";
import { X } from "lucide-react";

/**
 * Bulk selection (design §4 sel-bar): a provider holds the checked row ids,
 * BulkCheckbox marks rows, BulkBar floats the count + the screen's bulk verb
 * which confirms through the standard ConfirmDialog. Rows stay
 * server-rendered — only the checkboxes and the bar are client islands.
 */
type BulkContext = {
  selected: ReadonlySet<string>;
  toggle: (id: string) => void;
  setAll: (ids: readonly string[], on: boolean) => void;
  clear: () => void;
};

const Ctx = React.createContext<BulkContext | null>(null);

function useBulk(): BulkContext {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("Bulk* components need a <BulkSelect> ancestor");
  return ctx;
}

export function BulkSelect({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = React.useState<ReadonlySet<string>>(new Set());
  const value = React.useMemo<BulkContext>(
    () => ({
      selected,
      toggle: (id) =>
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }),
      setAll: (ids, on) =>
        setSelected((prev) => {
          const next = new Set(prev);
          for (const id of ids) {
            if (on) next.add(id);
            else next.delete(id);
          }
          return next;
        }),
      clear: () => setSelected(new Set()),
    }),
    [selected],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const checkboxClass = "accent-primary size-[15px] cursor-pointer align-middle";

export function BulkCheckbox({ id, label }: { id: string; label: string }) {
  const { selected, toggle } = useBulk();
  return (
    <input
      type="checkbox"
      className={checkboxClass}
      checked={selected.has(id)}
      onChange={() => toggle(id)}
      aria-label={label}
    />
  );
}

/** Header checkbox — selects/deselects every row on the current page. */
export function BulkAllCheckbox({ ids }: { ids: readonly string[] }) {
  const { selected, setAll } = useBulk();
  const allOn = ids.length > 0 && ids.every((id) => selected.has(id));
  return (
    <input
      type="checkbox"
      className={checkboxClass}
      checked={allOn}
      onChange={() => setAll(ids, !allOn)}
      aria-label="Select all rows on this page"
    />
  );
}

export function BulkBar({
  verb,
  title,
  body,
  confirmLabel,
  action,
  requireReason,
  successToast,
}: {
  verb: string;
  /** Receives the live count, e.g. (n) => `Delete ${n} comments?` */
  title: (count: number) => string;
  body: string;
  confirmLabel: (count: number) => string;
  action: (formData: FormData) => Promise<ActionResult>;
  requireReason?: boolean;
  successToast: (count: number) => string;
}) {
  const { selected, clear } = useBulk();
  const count = selected.size;
  if (count === 0) return null;

  return (
    <div className="bg-active border-border-strong sticky top-0 z-[15] mb-4 flex items-center justify-between gap-4 rounded-[10px] border px-3 py-[9px]">
      <div className="flex items-center gap-2.5">
        <Button
          type="button"
          variant="ghost-muted"
          size="icon-2xs"
          onClick={clear}
          aria-label="Clear selection"
        >
          <X aria-hidden className="size-[15px]" />
        </Button>
        <span className="text-[13.5px] font-bold tabular-nums">{count} selected</span>
      </div>
      <ConfirmDialog
        trigger={
          <Button type="button" size="xs" variant="destructive">
            {verb} {count}
          </Button>
        }
        title={title(count)}
        body={body}
        confirmLabel={confirmLabel(count)}
        action={action}
        hiddenFields={{ ids: [...selected].join(",") }}
        requireReason={requireReason ? {} : undefined}
        successToast={successToast(count)}
        onDone={(ok) => {
          if (ok) clear();
        }}
      />
    </div>
  );
}

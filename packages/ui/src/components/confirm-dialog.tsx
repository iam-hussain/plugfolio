"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { cn } from "../lib/cn";

/**
 * ConfirmDialog — the Admin-design confirmation modal: tinted icon box,
 * Sora title, consequence body, optional required-reason textarea or
 * type-to-confirm input, Cancel + tone-colored confirm.
 *
 * `action` is a server action returning `{ ok: true } | { ok: false, error }`;
 * the dialog closes and fires the success/error toast itself, so screens
 * declare copy only.
 */
export type ActionResult = { ok: true } | { ok: false; error: string };

const iconBoxVariants = cva(
  "flex size-[38px] shrink-0 items-center justify-center rounded-[9px]",
  {
    variants: {
      tone: {
        danger: "bg-destructive/10 text-destructive",
        primary: "bg-active text-primary",
      },
    },
    defaultVariants: { tone: "danger" },
  },
);

export type ConfirmDialogProps = VariantProps<typeof iconBoxVariants> & {
  trigger: React.ReactNode;
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  icon?: React.ReactNode;
  action?: (formData: FormData) => Promise<ActionResult>;
  hiddenFields?: Record<string, string>;
  /** Required free-text reason, recorded in the audit log. */
  requireReason?: { name?: string; placeholder?: string };
  /** Type-to-confirm guard: the input must match `value` exactly. */
  requireMatch?: { value: string; note?: React.ReactNode };
  successToast?: string;
  /** Called after the action settles (true = success). */
  onDone?: (ok: boolean) => void;
  /** Extra fields/content rendered inside the form, above the footer. */
  children?: React.ReactNode;
};

export function ConfirmDialog({
  trigger,
  title,
  body,
  confirmLabel,
  icon,
  tone = "danger",
  action,
  hiddenFields,
  requireReason,
  requireMatch,
  successToast,
  onDone,
  children,
}: ConfirmDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [typed, setTyped] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const reasonId = React.useId();
  const matchId = React.useId();

  const blocked =
    (requireReason && reason.trim().length === 0) ||
    (requireMatch && typed !== requireMatch.value);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (blocked || !action) {
      if (!action) setOpen(false);
      return;
    }
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      setOpen(false);
      setReason("");
      setTyped("");
      if (result.ok) {
        if (successToast) toast.success(`${successToast} · recorded in the audit log`);
      } else {
        toast.error(result.error);
      }
      onDone?.(result.ok);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-panel max-w-[440px] p-6">
        <form onSubmit={submit}>
          <div className="flex items-start gap-3.5">
            <div className={iconBoxVariants({ tone })}>
              {icon ?? <AlertTriangle aria-hidden className="size-[18px]" />}
            </div>
            <div className="min-w-0 flex-1">
              <DialogHeader className="space-y-0 text-left">
                <DialogTitle className="font-display text-[17px] font-bold tracking-[-0.01em]">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1.5 text-[13.5px] leading-[1.55]">
                  {body}
                </DialogDescription>
              </DialogHeader>

              {Object.entries(hiddenFields ?? {}).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))}

              {requireReason ? (
                <div className="mt-3.5">
                  <label
                    htmlFor={reasonId}
                    className="font-mono text-muted-foreground mb-1.5 block text-[10px] uppercase tracking-[0.08em]"
                  >
                    Reason (required — recorded in the audit log)
                  </label>
                  <Textarea
                    id={reasonId}
                    name={requireReason.name ?? "reason"}
                    rows={3}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder={
                      requireReason.placeholder ??
                      "Impersonation report #… / spam sweep / policy violation"
                    }
                    className="text-[13.5px]"
                  />
                </div>
              ) : null}

              {requireMatch ? (
                <div className="mt-3">
                  {requireMatch.note ? (
                    <p className="text-muted-foreground text-[12.5px] leading-[1.6]">
                      {requireMatch.note}
                    </p>
                  ) : null}
                  <label
                    htmlFor={matchId}
                    className="font-mono text-muted-foreground mb-1.5 mt-3.5 block text-[10px] uppercase tracking-[0.08em]"
                  >
                    Type <span className="text-destructive">{requireMatch.value}</span> to confirm
                  </label>
                  <Input
                    id={matchId}
                    value={typed}
                    onChange={(event) => setTyped(event.target.value)}
                    placeholder={requireMatch.value}
                    autoComplete="off"
                    spellCheck={false}
                    className="font-mono"
                  />
                </div>
              ) : null}

              {children}
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost-muted" size="xs">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="xs"
              variant={tone === "danger" ? "destructive" : "primary"}
              disabled={Boolean(blocked) || pending}
              className={cn(blocked && "pointer-events-none opacity-40")}
            >
              {confirmLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { ActionResult } from "./confirm-dialog";
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

/**
 * PromptDialog — the Admin-design modal asking for ONE value before an action
 * fires: tinted icon box, explanation, a mono current → becomes panel, and a
 * prefilled editable input. The server action returns `{ ok } | { error }`;
 * the dialog fires the success/error toast itself.
 */
export type PromptDialogProps = {
  trigger: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  /** The mono context panel: what it is now / what it becomes. */
  current?: string;
  becomes?: string;
  label: string;
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  pattern?: string;
  patternHint?: string;
  hiddenFields?: Record<string, string>;
  confirmLabel?: string;
  action?: (formData: FormData) => Promise<ActionResult>;
  successToast?: string;
};

export function PromptDialog({
  trigger,
  title,
  description,
  current,
  becomes,
  label,
  name = "value",
  defaultValue,
  placeholder,
  pattern,
  patternHint,
  hiddenFields,
  confirmLabel = "Confirm",
  action,
  successToast,
}: PromptDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const inputId = React.useId();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!action) {
      setOpen(false);
      return;
    }
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      setOpen(false);
      if (result.ok) {
        if (successToast) toast.success(`${successToast} · recorded in the audit log`);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-panel max-w-[440px] p-6">
        <form onSubmit={submit}>
          <div className="flex items-start gap-3.5">
            <div className="bg-destructive/10 text-destructive flex size-[38px] shrink-0 items-center justify-center rounded-[9px]">
              <AlertTriangle aria-hidden className="size-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogHeader className="space-y-0 text-left">
                <DialogTitle className="font-display text-[17px] font-bold tracking-[-0.01em]">
                  {title}
                </DialogTitle>
                {description ? (
                  <DialogDescription className="text-muted-foreground mt-1.5 text-[13.5px] leading-[1.55]">
                    {description}
                  </DialogDescription>
                ) : null}
              </DialogHeader>

              {Object.entries(hiddenFields ?? {}).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))}

              {current || becomes ? (
                <div className="bg-muted border-border font-mono mt-3.5 rounded-[9px] border p-3 text-xs leading-normal">
                  {current ? (
                    <p className="text-faint">
                      Current — <span className="text-foreground">{current}</span>
                    </p>
                  ) : null}
                  {becomes ? (
                    <p className="text-faint mt-1.5">
                      Becomes — <span className="text-foreground">{becomes}</span> — or the name
                      you enter below
                    </p>
                  ) : null}
                </div>
              ) : null}

              <label
                htmlFor={inputId}
                className="font-mono text-muted-foreground mb-1.5 mt-3.5 block text-[10px] uppercase tracking-[0.08em]"
              >
                {label}
              </label>
              <Input
                id={inputId}
                name={name}
                defaultValue={defaultValue}
                placeholder={placeholder}
                pattern={pattern}
                title={patternHint}
                required
                autoComplete="off"
                spellCheck={false}
                className="font-mono"
              />
              {patternHint ? (
                <p className="text-faint mt-[7px] text-[11.5px] leading-normal">{patternHint}</p>
              ) : null}
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost-muted" size="xs">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size="xs" variant="destructive" disabled={pending}>
              {confirmLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

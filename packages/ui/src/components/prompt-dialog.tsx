"use client";

import * as React from "react";
import { Button, type ButtonProps } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "./input";
import { Label } from "./label";

/**
 * PromptDialog — a modal form asking for ONE value before an action fires:
 * title + explanation, optional context block, a labeled input (prefilled
 * with a suggested value the user can accept or replace), cancel/confirm.
 * Submits `action` like a plain form, so it works with server actions;
 * `hiddenFields` carry the ids the action needs.
 */
export type PromptDialogProps = {
  /** The element that opens the dialog (rendered via DialogTrigger asChild). */
  trigger: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  /** Optional context above the input — e.g. a current → next preview. */
  children?: React.ReactNode;
  label: string;
  /** Input name the action reads; defaults to "value". */
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  /** Constrain the value at the boundary the user can see. */
  pattern?: string;
  patternHint?: string;
  hiddenFields?: Record<string, string>;
  confirmLabel?: string;
  confirmVariant?: ButtonProps["variant"];
  action?: (formData: FormData) => void | Promise<void>;
};

export function PromptDialog({
  trigger,
  title,
  description,
  children,
  label,
  name = "value",
  defaultValue,
  placeholder,
  pattern,
  patternHint,
  hiddenFields,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  action,
}: PromptDialogProps) {
  const [open, setOpen] = React.useState(false);
  const inputId = React.useId();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children}
        <form
          action={action}
          // The action redirects/revalidates server-side; close optimistically.
          onSubmit={() => setOpen(false)}
          className="flex flex-col gap-4"
        >
          {Object.entries(hiddenFields ?? {}).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
          <div className="flex flex-col gap-2">
            <Label htmlFor={inputId}>{label}</Label>
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
            />
            {patternHint ? (
              <p className="text-muted-foreground text-xs">{patternHint}</p>
            ) : null}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant={confirmVariant}>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

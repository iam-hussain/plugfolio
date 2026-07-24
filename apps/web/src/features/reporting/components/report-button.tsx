"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import type { CreateReportInput } from "@plugfolio/core";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Textarea,
  cn,
} from "@plugfolio/ui";
import { Flag } from "lucide-react";
import { submitReport } from "../api";

/**
 * The quiet report affordance (admin queue inflow): flag icon → category +
 * optional note → sent. No account needed — the device cookie is identity
 * enough, mirroring the no-login shopping rule (§2.2).
 */
const CATEGORIES: readonly { value: CreateReportInput["category"]; label: string }[] = [
  { value: "spam", label: "Spam" },
  { value: "scam", label: "Scam" },
  { value: "offensive", label: "Offensive" },
  { value: "impersonation", label: "Impersonation" },
  { value: "other", label: "Other" },
];

export type ReportButtonProps = {
  targetType: CreateReportInput["targetType"];
  targetId: string;
  /** What the confirm copy calls the thing ("this comment", "this page"). */
  targetLabel: string;
  /** Icon-only renders the smallest possible trigger (per-comment rows). */
  iconOnly?: boolean;
};

export function ReportButton({ targetType, targetId, targetLabel, iconOnly }: ReportButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [category, setCategory] = React.useState<CreateReportInput["category"]>("spam");
  const [note, setNote] = React.useState("");

  const send = useMutation({
    mutationFn: () =>
      submitReport({ targetType, targetId, category, note: note.trim() || undefined }),
  });

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      send.reset();
      setNote("");
      setCategory("spam");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={iconOnly ? "icon-xs" : "sm"}
          className="text-muted-foreground"
          aria-label={`Report ${targetLabel}`}
          title={`Report ${targetLabel}`}
        >
          <Flag aria-hidden className="size-3.5" />
          {iconOnly ? null : <span className="text-xs">Report</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold">
            Report {targetLabel}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-[13px]">
            No account needed. Reports go straight to the Plugfolio team.
          </DialogDescription>
        </DialogHeader>

        {send.isSuccess ? (
          <p className="text-sm font-medium">Thanks — the team will take a look.</p>
        ) : (
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              send.mutate();
            }}
          >
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Reason">
              {CATEGORIES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={category === option.value}
                  onClick={() => setCategory(option.value)}
                  className={cn(
                    "rounded-pill border px-3 py-1.5 text-xs font-medium",
                    category === option.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Anything that helps us judge it (optional)"
              aria-label="Details (optional)"
              className="text-sm"
            />
            {send.isError ? (
              <p role="alert" className="text-destructive text-xs">
                {send.error instanceof Error ? send.error.message : "Could not send the report"}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="ghost" size="sm">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" size="sm" disabled={send.isPending}>
                Send report
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

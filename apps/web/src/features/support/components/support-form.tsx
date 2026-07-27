"use client";

import type { SupportCategory } from "@plugfolio/core";
import {
  Button,
  Input,
  Label,
  NativeSelect,
  NativeSelectOption,
  Textarea,
} from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { submitSupportTicket } from "../api";

/**
 * The support form (docs/implementation/support.md): known issues as a
 * picker, "Something else" for the unknown ones. Works signed-out — the top
 * category is "I lost access to my email". Each category swaps in one hint
 * line so tickets arrive actionable; replies go to the contact email.
 */
const CATEGORIES: readonly { key: SupportCategory; label: string; hint: string }[] = [
  {
    key: "lost_email_access",
    label: "I can't access my account email",
    hint: "Give the email you can still reach — we reply there — plus the account email you lost.",
  },
  {
    key: "change_email",
    label: "Change my account email",
    hint: "Tell us the current account email and the new one.",
  },
  {
    key: "merge_accounts",
    label: "Merge my accounts",
    hint: "Registered twice? Tell us both emails and which one should survive.",
  },
  {
    key: "password_trouble",
    label: "Password or sign-in trouble",
    hint: "Tried the reset link on the sign-in page? Tell us what happens when you try.",
  },
  {
    key: "username_conflict",
    label: "Username or impersonation issue",
    hint: "Which page (plugfolio.com/…) and why it's yours.",
  },
  {
    key: "connection_trouble",
    label: "Google / Meta connection trouble",
    hint: "Which platform, and what the connect screen shows.",
  },
  {
    key: "collab_dispute",
    label: "Collab dispute",
    hint: "Link or describe the thread — we can see both sides of it.",
  },
  {
    key: "delete_account",
    label: "Delete my account and data",
    hint: "Tell us the account email; we'll confirm before anything is removed.",
  },
  { key: "other", label: "Something else", hint: "Describe it — a human reads every ticket." },
];

export type SupportFormProps = {
  /** Preselect via /support?category=… (e.g. the sign-in page's lost-email door). */
  initialCategory?: string;
  /** Prefilled for signed-in members; editable — it may be exactly what's broken. */
  initialEmail?: string;
};

export function SupportForm({ initialCategory, initialEmail = "" }: SupportFormProps) {
  // Validated against the local list — importing the Zod enum would pull the
  // whole core package (node:crypto and all) into the client bundle.
  const preselected = CATEGORIES.find((option) => option.key === initialCategory)?.key;
  const [category, setCategory] = useState<SupportCategory>(preselected ?? "other");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState(initialEmail);

  const submit = useMutation({
    mutationFn: () => submitSupportTicket({ category, message, contactEmail }),
  });

  if (submit.isSuccess) {
    return (
      <div className="border-border rounded-lg border border-dashed p-6 text-center">
        <p className="font-medium">Got it — we&apos;re on it.</p>
        <p className="text-muted-foreground pt-1 text-sm">
          We&apos;ll reply to <span className="text-foreground">{contactEmail}</span>. No ticket
          numbers, no bots — a person reads it.
        </p>
      </div>
    );
  }

  const hint = CATEGORIES.find((option) => option.key === category)?.hint;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (message.trim() && contactEmail.trim()) submit.mutate();
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="support-category">What&apos;s it about?</Label>
        <NativeSelect
          id="support-category"
          value={category}
          onChange={(event) => setCategory(event.target.value as SupportCategory)}
          className="w-full"
        >
          {CATEGORIES.map((option) => (
            <NativeSelectOption key={option.key} value={option.key}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="support-message">What happened?</Label>
        <Textarea
          id="support-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={2000}
          rows={5}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="support-email">Where do we reply?</Label>
        <Input
          id="support-email"
          type="email"
          value={contactEmail}
          onChange={(event) => setContactEmail(event.target.value)}
          required
          placeholder="an inbox you can open today"
        />
      </div>

      {submit.isError ? (
        <p role="alert" className="text-destructive text-xs">
          {submit.error.message}
        </p>
      ) : null}
      <Button type="submit" disabled={submit.isPending || !message.trim() || !contactEmail.trim()}>
        {submit.isPending ? "Sending…" : "Send to support"}
      </Button>
    </form>
  );
}

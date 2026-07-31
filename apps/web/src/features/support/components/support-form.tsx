"use client";

import type { SupportCategory } from "@plugfolio/core";
import {
  Button,
  Input,
  SupportCategory as CategoryCard,
  SupportCategories,
  SupportHint,
  SupportNext,
  SupportStep,
  Textarea,
} from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { Check, CircleAlert, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { submitSupportTicket } from "../api";

/**
 * The support form (docs/implementation/support.md, DESIGN support.html): known
 * issues as radio CARDS — the whole set visible at once, one tap, no native
 * picker wheel for someone reading unfamiliar labels while locked out. Each
 * category swaps in one hint so tickets arrive answerable on the first reply.
 * Works signed-out — the top category is "I can't access my account email" —
 * and the reply address is always editable, since it may be exactly what broke.
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

const NEXT_STEPS: readonly { title: string; body: string }[] = [
  { title: "A person reads it.", body: "Not a bot, and not a queue that closes itself." },
  { title: "We reply to the inbox you gave.", body: "Usually within one working day." },
  {
    title: "That's the whole channel.",
    body: "Plugfolio has no in-app support threads, so there's nothing here to come back to.",
  },
];

export type SupportFormProps = {
  /** Signs the "who" chip when present; the form still works fully signed-out. */
  handle?: string | null;
  /** Preselect via /support?category=… (e.g. the sign-in page's lost-email door). */
  initialCategory?: string;
  /** Prefilled for signed-in members; editable — it may be exactly what's broken. */
  initialEmail?: string;
};

/** A field label + one-line sublabel (DESIGN: Sora title over a muted line). */
function FieldHead({ title, sub }: { title: string; sub: string }) {
  return (
    <>
      <span className="font-display block text-lg font-bold tracking-[-0.02em]">{title}</span>
      <span className="text-muted-foreground mt-1 mb-3 block text-copy">{sub}</span>
    </>
  );
}

export function SupportForm({ handle, initialCategory, initialEmail = "" }: SupportFormProps) {
  // Validated against the local list — importing the Zod enum would pull the
  // whole core package (node:crypto and all) into the client bundle.
  const preselected = CATEGORIES.find((option) => option.key === initialCategory)?.key;
  const [category, setCategory] = useState<SupportCategory>(preselected ?? "lost_email_access");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState(initialEmail);

  const submit = useMutation({
    mutationFn: () => submitSupportTicket({ category, message, contactEmail }),
  });

  if (submit.isSuccess) {
    return (
      <div className="py-[clamp(24px,5vw,48px)] text-center">
        <span className="bg-active text-brand-violet-deep mx-auto mb-5 grid size-16 place-items-center rounded-pill [&_svg]:size-7">
          <Check aria-hidden />
        </span>
        <h2 className="font-display text-display-lg font-extrabold tracking-[-0.035em]">
          Got it — we&apos;re on it.
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-[42ch] text-copy leading-[1.5]">
          We&apos;ll reply to <b className="text-foreground">{contactEmail}</b>. A person reads every
          ticket, so it may take a working day. Nothing to wait on here.
        </p>
        <Button variant="secondary" asChild className="mt-6">
          <Link href="/explore">Back to shopping</Link>
        </Button>
      </div>
    );
  }

  const hint = CATEGORIES.find((option) => option.key === category)?.hint;

  return (
    <div>
      {/* Who's asking — a reassurance, not a gate. Hidden once the ticket sends. */}
      <p className="bg-active text-brand-violet-deep tracking-eyebrow mt-[18px] inline-flex items-center gap-2 rounded-pill px-4 py-2 font-mono text-nano font-bold uppercase [&_svg]:size-[15px]">
        {handle ? (
          <>
            <UserRound aria-hidden /> Signed in as @{handle}
          </>
        ) : (
          <>
            <Check aria-hidden /> No account needed
          </>
        )}
      </p>

      {submit.isError ? (
        <div
          role="alert"
          className="bg-brand-coral/15 border-brand-coral/50 rounded-image mt-[22px] flex items-start gap-3 border p-4 text-copy leading-[1.5] [&_svg]:mt-0.5 [&_svg]:size-[18px] [&_svg]:shrink-0"
        >
          <CircleAlert aria-hidden />
          <span>
            <b className="block font-semibold">That didn&apos;t send.</b>
            {submit.error.message} — if it keeps failing, email help@plugfolio.com directly.
          </span>
        </div>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (message.trim() && contactEmail.trim()) submit.mutate();
        }}
      >
        <fieldset className="mt-[clamp(26px,3.5vw,36px)] border-0 p-0">
          <legend className="font-display p-0 text-lg font-bold tracking-[-0.02em]">
            What&apos;s it about?
          </legend>
          <span className="text-muted-foreground mt-1 mb-3 block text-copy">
            Closest is close enough — we&apos;ll work it out.
          </span>
          <SupportCategories>
            {CATEGORIES.map((option) => (
              <CategoryCard
                key={option.key}
                name="category"
                value={option.key}
                checked={category === option.key}
                onChange={() => setCategory(option.key)}
              >
                {option.label}
              </CategoryCard>
            ))}
          </SupportCategories>
          {hint ? (
            <div aria-live="polite">
              <SupportHint>{hint}</SupportHint>
            </div>
          ) : null}
        </fieldset>

        <label className="mt-[clamp(26px,3.5vw,36px)] block">
          <FieldHead title="What happened?" sub="What you tried, and what happened instead." />
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={2000}
            rows={6}
            required
            className="min-h-[150px]"
          />
        </label>

        <label className="mt-[clamp(26px,3.5vw,36px)] block">
          <FieldHead
            title="Where do we reply?"
            sub="An inbox you can open today — it doesn't have to be your account email."
          />
          <Input
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            required
            autoComplete="email"
            placeholder="you@email.com"
          />
        </label>

        <Button
          type="submit"
          disabled={submit.isPending || !message.trim() || !contactEmail.trim()}
          className="mt-[clamp(26px,3.5vw,34px)] w-full"
        >
          {submit.isPending ? "Sending…" : "Send to support"}
        </Button>
      </form>

      <SupportNext>
        {NEXT_STEPS.map((step, index) => (
          <SupportStep key={step.title} n={index + 1}>
            <b className="text-foreground block font-bold">{step.title}</b>
            {step.body}
          </SupportStep>
        ))}
      </SupportNext>
    </div>
  );
}

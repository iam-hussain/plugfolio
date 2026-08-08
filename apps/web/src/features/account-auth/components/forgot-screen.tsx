"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "../api";
import { AuthShell } from "./auth-shell";
import { AuthStatus } from "./auth-status";
import { FieldLabel, TextField } from "./auth-field";

/**
 * Forgot password (brief 04): email in, one reset link out. "If an account
 * exists" is load-bearing — the same words, screen, and timing for a real
 * address and a made-up one, so the page never becomes an existence oracle.
 */
export function ForgotScreen() {
  const [email, setEmail] = useState("");
  const submit = useMutation({ mutationFn: () => requestPasswordReset({ email }) });

  if (submit.isSuccess) {
    return (
      <AuthShell role="generic">
        <AuthStatus icon={<Mail aria-hidden />} title="Check your email">
          <p className="text-muted-foreground text-copy max-w-[38ch] leading-[1.5]">
            If an account exists for <b className="text-foreground">{email}</b>, a reset link is on
            its way.
          </p>
          <Button variant="secondary" asChild>
            <Link href="/signin">Back to sign in</Link>
          </Button>
        </AuthStatus>
      </AuthShell>
    );
  }

  return (
    <AuthShell role="generic">
      <h1 className="font-display text-name font-bold leading-[1.15] tracking-[-0.035em]">
        Forgot your password
      </h1>
      <p className="text-muted-foreground text-copy mt-2 text-pretty leading-[1.6]">
        Tell us the email and we&apos;ll send a reset link. We won&apos;t say whether an account
        exists.
      </p>
      <form
        className="mt-[18px] flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          if (email.trim()) submit.mutate();
        }}
      >
        <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
        <TextField
          id="forgot-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Button
          type="submit"
          variant="action"
          disabled={submit.isPending}
          className="font-display mt-[18px] h-[50px] w-full rounded-lg"
        >
          {submit.isPending ? "Sending…" : "Send the reset link"}
        </Button>
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
        <Link href="/signin" className="text-foreground text-label font-semibold">
          Back to sign in
        </Link>
        <Link href="/join" className="text-faint text-label">
          Make an account
        </Link>
      </div>
    </AuthShell>
  );
}

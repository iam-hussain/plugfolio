"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "../api";
import { RoleArtefact } from "./auth-artefact";
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

  const artefact = <RoleArtefact role="creator" />;

  if (submit.isSuccess) {
    return (
      <AuthShell role="generic" artefact={artefact}>
        <AuthStatus icon={<Mail aria-hidden />} title="Check your email">
          <p className="text-muted-foreground max-w-[38ch] text-[0.9375rem] leading-[1.5]">
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
    <AuthShell role="generic" artefact={artefact}>
      <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.035em]">
        Reset your password
      </h1>
      <p className="text-muted-foreground mt-2.5 text-[0.9375rem] leading-[1.5]">
        Enter your email and we&apos;ll send one reset link.
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
          placeholder="you@email.com"
        />
        <Button type="submit" disabled={submit.isPending} className="mt-[22px] w-full">
          {submit.isPending ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <div className="border-border mt-[22px] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t pt-5 text-center text-[13px]">
        <Link href="/signin" className="text-muted-foreground hover:text-primary font-semibold">
          Back to sign in
        </Link>
        <Link href="/join" className="text-brand-violet-deep font-bold">
          Create an account
        </Link>
      </div>
    </AuthShell>
  );
}

"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "../api";
import { CHECK_EMAIL_PANEL, RESET_PANEL } from "./auth-copy";
import { FieldLabel, TextField } from "./auth-field";
import { AuthNotice } from "./auth-notice";
import { AuthShell } from "./auth-shell";

/**
 * Forgot password (brief 04): email in, always "check your email" out — the
 * response never reveals whether the account exists.
 */
export function ForgotScreen() {
  const [email, setEmail] = useState("");
  const submit = useMutation({ mutationFn: () => requestPasswordReset({ email }) });

  if (submit.isSuccess) {
    return (
      <AuthShell panel={CHECK_EMAIL_PANEL}>
        <AuthNotice title="Check your email">
          <p className="text-muted-foreground mt-2.5 text-sm leading-[1.55]">
            If an account exists for <span className="text-foreground font-semibold">{email}</span>
            , a reset link is on its way. It expires in 24 hours.
          </p>
          <button
            type="button"
            onClick={() => submit.reset()}
            className="text-muted-foreground hover:text-foreground mt-[18px] text-[12.5px]"
          >
            ← Use a different email
          </button>
        </AuthNotice>
      </AuthShell>
    );
  }

  return (
    <AuthShell panel={RESET_PANEL}>
      <h1 className="font-display text-[28px] font-extrabold tracking-[-0.03em]">
        Forgot your password?
      </h1>
      <p className="text-muted-foreground mt-2 text-[13.5px] leading-[1.5]">
        We&apos;ll email you one secure link to set a new one.
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
        {submit.isError ? (
          <p role="alert" className="text-brand-coral mt-2.5 text-[12.5px]">
            {submit.error.message}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={submit.isPending}
          className="font-display mt-4 h-auto w-full rounded-[9px] py-[13px] text-[15px] font-semibold"
        >
          {submit.isPending ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="text-muted-foreground mt-5 text-center text-[13px]">
        Remembered it?{" "}
        <Link href="/signin" className="text-primary font-semibold">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

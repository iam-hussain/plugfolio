"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { resetPassword } from "../api";
import { RESET_PANEL } from "./auth-copy";
import { AuthNotice } from "./auth-notice";
import { AuthShell } from "./auth-shell";
import { FieldLabel } from "./auth-field";
import { PasswordInput } from "./password-input";

/**
 * Set a new password from an email link (brief 04). Doubles as the invited
 * Manager's FIRST password — the link proved the inbox, so it verifies too.
 */
export type ResetScreenProps = {
  token?: string;
};

export function ResetScreen({ token }: ResetScreenProps) {
  const [password, setPassword] = useState("");
  const submit = useMutation({ mutationFn: () => resetPassword({ token: token ?? "", password }) });

  if (submit.isSuccess) {
    return (
      <AuthShell panel={RESET_PANEL}>
        <AuthNotice title="Password set">
          <p className="text-muted-foreground mt-2.5 text-sm leading-[1.55]">
            You&apos;re all set — sign in with your new password.
          </p>
          <Button
            asChild
            className="font-display mt-[22px] h-auto w-full max-w-[300px] rounded-[9px] py-[13px] text-[15px] font-semibold"
          >
            <Link href="/signin">Sign in →</Link>
          </Button>
        </AuthNotice>
      </AuthShell>
    );
  }

  return (
    <AuthShell panel={RESET_PANEL}>
      <h1 className="font-display text-[28px] font-extrabold tracking-[-0.03em]">
        Set a new password
      </h1>
      <p className="text-muted-foreground mt-2 text-[13.5px] leading-[1.5]">
        {token
          ? "Pick a new password for your account."
          : "This link is incomplete — use the one from your email."}
      </p>

      {token ? (
        <form
          className="mt-[18px] flex flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            if (password) submit.mutate();
          }}
        >
          <FieldLabel htmlFor="reset-password">New password · at least 8 characters</FieldLabel>
          <PasswordInput
            id="reset-password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />
          {submit.isError ? (
            <p role="alert" className="text-brand-coral mt-2.5 text-[12.5px]">
              {submit.error.message} —{" "}
              <Link href="/forgot" className="text-primary font-semibold">
                request a new link
              </Link>
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={submit.isPending}
            className="font-display mt-4 h-auto w-full rounded-[9px] py-[13px] text-[15px] font-semibold"
          >
            {submit.isPending ? "Saving…" : "Set password"}
          </Button>
        </form>
      ) : (
        <p className="text-muted-foreground mt-5 text-[13px]">
          <Link href="/forgot" className="text-primary font-semibold">
            Request a fresh link
          </Link>
        </p>
      )}
    </AuthShell>
  );
}

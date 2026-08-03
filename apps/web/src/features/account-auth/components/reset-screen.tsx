"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { resetPassword } from "../api";
import { AuthShell } from "./auth-shell";
import { AuthStatus } from "./auth-status";
import { FieldLabel } from "./auth-field";
import { PasswordInput } from "./password-input";

/**
 * Set a new password from an email link (brief 04). Doubles as the invited
 * Manager's FIRST password — the link proved the inbox, so saving verifies the
 * email and signs them in. A confirm field guards a typo; the link owns identity.
 */
export type ResetScreenProps = {
  token?: string;
};

export function ResetScreen({ token }: ResetScreenProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const mismatch = confirm.length > 0 && confirm !== password;
  const submit = useMutation({ mutationFn: () => resetPassword({ token: token ?? "", password }) });

  if (submit.isSuccess) {
    return (
      <AuthShell role="generic">
        <AuthStatus icon={<Check aria-hidden />} title="Password set">
          <p className="text-muted-foreground text-copy max-w-[38ch] leading-[1.5]">
            You&apos;re all set — sign in with your new password.
          </p>
          <Button asChild>
            <Link href="/signin">Sign in →</Link>
          </Button>
        </AuthStatus>
      </AuthShell>
    );
  }

  return (
    <AuthShell role="generic">
      <h1 className="font-display text-name font-bold leading-[1.15] tracking-[-0.035em]">
        Set a new password
      </h1>
      {token ? (
        <p className="text-muted-foreground text-copy mt-2 text-pretty leading-[1.6]">
          Pick something you have not used elsewhere. Setting it verifies your email and signs
          you in.
        </p>
      ) : (
        <p className="text-muted-foreground text-copy mt-2.5 leading-[1.5]">
          This link is incomplete — use the one from your email, or{" "}
          <Link href="/forgot" className="text-brand-violet-deep font-bold">
            request a fresh link
          </Link>
          .
        </p>
      )}

      {token ? (
        <form
          className="mt-[18px] flex flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            if (password && !mismatch) submit.mutate();
          }}
        >
          <FieldLabel htmlFor="reset-password">New password</FieldLabel>
          <PasswordInput
            id="reset-password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            placeholder="At least 10 characters"
          />
          <div className="mb-3.5 mt-3.5" />
          <FieldLabel htmlFor="reset-confirm">Repeat it</FieldLabel>
          <PasswordInput
            id="reset-confirm"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
          />
          {mismatch ? (
            <p role="alert" className="text-brand-coral text-micro mt-2.5">
              Those don&apos;t match yet.
            </p>
          ) : null}
          {submit.isError ? (
            <p role="alert" className="text-brand-coral text-micro mt-2.5">
              {submit.error.message} —{" "}
              <Link href="/forgot" className="text-brand-violet-deep font-bold">
                request a new link
              </Link>
            </p>
          ) : null}
          <Button
            type="submit"
            variant="action"
            disabled={submit.isPending || mismatch || !password}
            className="font-display rounded-lg mt-[18px] h-[50px] w-full"
          >
            {submit.isPending ? "Saving…" : "Save and sign in"}
          </Button>
          <p className="text-muted-foreground text-micro mt-3 text-center">
            You&apos;ll be signed in straight away.
          </p>
        </form>
      ) : null}
    </AuthShell>
  );
}

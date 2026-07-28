"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { Check, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { resetPassword } from "../api";
import { RoleArtefact } from "./auth-artefact";
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

  const artefact = <RoleArtefact role="creator" />;

  if (submit.isSuccess) {
    return (
      <AuthShell role="generic" artefact={artefact}>
        <AuthStatus icon={<Check aria-hidden />} title="Password set">
          <p className="text-muted-foreground max-w-[38ch] text-[0.9375rem] leading-[1.5]">
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
    <AuthShell role="generic" artefact={artefact}>
      <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.035em]">
        Set a new password
      </h1>
      {token ? (
        <div className="bg-active rounded-image mt-5 flex items-start gap-3 p-4 text-[0.9375rem] leading-[1.5]">
          <UserRound aria-hidden className="mt-0.5 size-[18px] shrink-0" />
          <span>Setting a password verifies your email and signs you in.</span>
        </div>
      ) : (
        <p className="text-muted-foreground mt-2.5 text-[0.9375rem] leading-[1.5]">
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
          />
          <p className="text-muted-foreground mt-[7px] mb-3.5 text-xs">At least 8 characters.</p>
          <FieldLabel htmlFor="reset-confirm">Confirm password</FieldLabel>
          <PasswordInput
            id="reset-confirm"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
          />
          {mismatch ? (
            <p role="alert" className="text-brand-coral mt-2.5 text-[12.5px]">
              Those don&apos;t match yet.
            </p>
          ) : null}
          {submit.isError ? (
            <p role="alert" className="text-brand-coral mt-2.5 text-[12.5px]">
              {submit.error.message} —{" "}
              <Link href="/forgot" className="text-brand-violet-deep font-bold">
                request a new link
              </Link>
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={submit.isPending || mismatch || !password}
            className="mt-[22px] w-full"
          >
            {submit.isPending ? "Saving…" : "Save password"}
          </Button>
          <p className="text-muted-foreground mt-3 text-center text-xs">
            You&apos;ll be signed in straight away.
          </p>
        </form>
      ) : null}
    </AuthShell>
  );
}

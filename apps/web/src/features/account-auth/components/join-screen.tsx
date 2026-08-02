"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { registerAccount, resendVerification } from "../api";
import { RoleArtefact, RoleDeck } from "./auth-artefact";
import { ROLE_COPY, type AuthRole } from "./auth-copy";
import { AuthShell } from "./auth-shell";
import { AuthStatus } from "./auth-status";
import { FieldLabel, TextField } from "./auth-field";
import { PasswordInput } from "./password-input";
import { DEFAULT_ROLE, readStoredRole, writeStoredRole } from "./role-store";

/**
 * Registration (brief 04, ADR-0012): email + password → one verification link.
 * The role deck lives here and ONLY here — it's the one screen where the answer
 * changes what happens next (where verification lands). The form is
 * role-agnostic; every account created here is the same account. After submit,
 * the pane keeps the role but the screen becomes "check your email".
 */
export type JoinScreenProps = {
  initialRole?: AuthRole;
};

export function JoinScreen({ initialRole }: JoinScreenProps) {
  // Priority: an explicit ?as= wins; otherwise the last-used role from the
  // browser cache; otherwise shopper (the common case). The cache read happens
  // after mount to keep SSR and first paint stable (both start on the default).
  const [role, setRole] = useState<AuthRole>(initialRole ?? DEFAULT_ROLE);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const copy = ROLE_COPY[role];

  useEffect(() => {
    if (!initialRole) setRole(readStoredRole());
  }, [initialRole]);

  const submit = useMutation({
    mutationFn: () => registerAccount({ email, password }),
    onSuccess: () => writeStoredRole(role),
  });
  const resend = useMutation({ mutationFn: () => resendVerification({ identifier: email }) });

  if (submit.isSuccess) {
    return (
      <AuthShell role={role} artefact={<RoleArtefact role={role} />}>
        <AuthStatus icon={<Mail aria-hidden />} title="Check your email">
          <p className="text-muted-foreground text-copy max-w-[38ch] leading-[1.5]">
            We sent a verification link to <b className="text-foreground">{email}</b>, and a
            six-digit code with it. Either one takes you to picking your username.
          </p>
          {/* The code path exists for exactly this moment: leaving an in-app
              browser for the mail app often loses the tab you came from. */}
          <Button asChild variant="secondary">
            <Link href="/verify">Enter the code instead →</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resend.mutate()}
            disabled={resend.isPending}
          >
            {resend.isPending ? "Sending…" : resend.isSuccess ? "Sent again ✓" : "Resend email"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => submit.reset()}>
            Change email
          </Button>
        </AuthStatus>
      </AuthShell>
    );
  }

  return (
    <AuthShell role={role} artefact={<RoleDeck role={role} onRoleChange={setRole} />}>
      <h1 className="font-display text-display-lg font-extrabold tracking-[-0.035em]">
        {copy.joinHeadline}
      </h1>
      <p className="text-muted-foreground text-copy mt-2.5 leading-[1.5]">{copy.joinCopy}</p>

      <form
        className="mt-[18px] flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          if (email.trim() && password) submit.mutate();
        }}
      >
        <FieldLabel htmlFor="join-email">Email</FieldLabel>
        <TextField
          id="join-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          placeholder="you@email.com"
          className="mb-3.5"
        />
        <FieldLabel htmlFor="join-password">Password</FieldLabel>
        <PasswordInput
          id="join-password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <p className="text-muted-foreground text-micro mt-[7px]">At least 8 characters.</p>
        {submit.isError ? (
          <p role="alert" className="text-brand-coral text-micro mt-2.5">
            {submit.error.message}
          </p>
        ) : null}
        <Button type="submit" disabled={submit.isPending} className="mt-[22px] w-full">
          {submit.isPending ? "Creating…" : copy.joinPrimary}
        </Button>
      </form>
      <p className="text-muted-foreground text-micro mt-3 text-center">
        We&apos;ll send one verification email.
      </p>

      <div className="border-border text-label mt-[22px] flex items-center justify-center gap-2 border-t pt-5 text-center">
        <span className="text-muted-foreground">Already have an account?</span>
        <Link href={`/signin?as=${role}`} className="text-brand-violet-deep font-bold">
          Sign in
        </Link>
      </div>
    </AuthShell>
  );
}

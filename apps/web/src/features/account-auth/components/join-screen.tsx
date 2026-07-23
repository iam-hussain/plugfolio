"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { registerAccount, resendVerification } from "../api";
import { CHECK_EMAIL_PANEL, ROLE_COPY, type AuthRole } from "./auth-copy";
import { FieldLabel, TextField } from "./auth-field";
import { AuthNotice } from "./auth-notice";
import { AuthShell } from "./auth-shell";
import { PasswordInput } from "./password-input";
import { RoleTabs } from "./role-tabs";

/**
 * Registration (brief 04, ADR-0012): email + password → one verification link.
 * After submit the "check your email" state owns the screen (design-out
 * checkemail layout) with resend + change-email. Role tabs set the copy only —
 * no username, no business fields here (those come after verification).
 */
export type JoinScreenProps = {
  initialRole?: AuthRole;
};

export function JoinScreen({ initialRole = "creator" }: JoinScreenProps) {
  const [role, setRole] = useState<AuthRole>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const copy = ROLE_COPY[role];

  const submit = useMutation({ mutationFn: () => registerAccount({ email, password }) });
  const resend = useMutation({ mutationFn: () => resendVerification({ email }) });

  if (submit.isSuccess) {
    return (
      <AuthShell panel={CHECK_EMAIL_PANEL}>
        <AuthNotice title="Check your email">
          <p className="text-muted-foreground mt-2.5 text-sm leading-[1.55]">
            We sent one verification link to{" "}
            <span className="text-foreground font-semibold">{email}</span>. Click it, then sign in
            with your password. It expires in 24 hours.
          </p>
          <Button
            onClick={() => resend.mutate()}
            disabled={resend.isPending}
            variant="outline"
            className="mt-[22px] h-auto w-full max-w-[300px] rounded-[9px] py-[13px] text-[14px] font-semibold"
          >
            {resend.isPending ? "Sending…" : resend.isSuccess ? "Sent again ✓" : "Resend the link"}
          </Button>
          <button
            type="button"
            onClick={() => submit.reset()}
            className="text-muted-foreground hover:text-foreground mt-[18px] text-[12.5px]"
          >
            ← Use a different email
          </button>
          <p className="text-muted-foreground/70 mt-3.5 max-w-[320px] text-[11.5px] leading-[1.5]">
            You don&apos;t need an account to shop — this is only to follow, comment, or manage a
            page.
          </p>
        </AuthNotice>
      </AuthShell>
    );
  }

  return (
    <AuthShell panel={copy.panel}>
      <RoleTabs role={role} onChange={setRole} />
      <p className="bg-muted border-border text-muted-foreground mb-[18px] rounded-[10px] border px-3.5 py-3 text-[13px] leading-[1.55] lg:hidden">
        {copy.desc}
      </p>
      <h1 className="font-display text-[28px] font-extrabold tracking-[-0.03em]">
        {copy.regTitle}
      </h1>
      <p className="text-muted-foreground mt-2 text-[13.5px] leading-[1.5]">{copy.subRegister}</p>

      <form
        className="mt-[18px] flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          if (email.trim() && password) submit.mutate();
        }}
      >
        <FieldLabel htmlFor="register-email">Email</FieldLabel>
        <TextField
          id="register-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          placeholder="you@email.com"
          className="mb-3.5"
        />
        <FieldLabel htmlFor="register-password">Password · at least 8 characters</FieldLabel>
        <PasswordInput
          id="register-password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
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
          {submit.isPending ? "Creating…" : copy.regPrimary}
        </Button>
      </form>

      <p className="text-muted-foreground mt-5 text-center text-[13px]">
        Already have an account?{" "}
        <Link href={`/signin?as=${role}`} className="text-primary font-semibold">
          Sign in
        </Link>
      </p>
      <p className="text-muted-foreground/70 mt-3.5 text-center text-[11.5px] leading-[1.55]">
        We&apos;ll send one link to verify your email — after that, you sign in with your password.
      </p>
    </AuthShell>
  );
}

"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { registerAccount, resendVerification } from "../api";
import { type AuthRole } from "./auth-copy";
import { AuthShell } from "./auth-shell";
import { AuthStatus } from "./auth-status";
import { FieldLabel, TextField } from "./auth-field";
import { PasswordInput } from "./password-input";
import { DEFAULT_ROLE, readStoredRole, writeStoredRole } from "./role-store";
import { RoleSockets } from "./role-sockets";

/**
 * Registration (v2, `Plugfolio v2.dc.html` §join; ADR-0012): one title for
 * everyone — the socket, not the headline, carries the role. The socket is a
 * genuine fork in the promise line, the CTA and where verification lands; the
 * form itself is role-agnostic and every account created here is the same
 * account. After submit the screen becomes "check your email".
 */
export type JoinScreenProps = {
  initialRole?: AuthRole;
};

/** The per-socket lines the design writes (§join). */
const SOCKET_COPY: Record<AuthRole, { promise: string; cta: string; after: string }> = {
  shopper: {
    promise:
      "An account is only for following and commenting. Buying never asks for one — it never will.",
    cta: "Create the account",
    after: "You go back to browsing after verifying",
  },
  creator: {
    promise:
      "Your posts become a shop. Connect a social, they import themselves, you tag the things.",
    cta: "Create my creator account",
    after: "You land on your dashboard after verifying",
  },
  business: {
    promise:
      "Brief it once and hear from creators. Payment settles off-platform — we never sit in it.",
    cta: "Create my business account",
    after: "You set up the business name after verifying",
  },
};

export function JoinScreen({ initialRole }: JoinScreenProps) {
  // Priority: an explicit ?as= wins; otherwise the last-used role from the
  // browser cache; otherwise shopper (the common case). The cache read happens
  // after mount to keep SSR and first paint stable.
  const [role, setRole] = useState<AuthRole>(initialRole ?? DEFAULT_ROLE);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const copy = SOCKET_COPY[role];

  useEffect(() => {
    if (!initialRole) setRole(readStoredRole());
  }, [initialRole]);

  const submit = useMutation({
    mutationFn: () => {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();
      return registerAccount({ email, password, ...(name ? { name } : {}) });
    },
    onSuccess: () => writeStoredRole(role),
  });
  const resend = useMutation({ mutationFn: () => resendVerification({ identifier: email }) });

  if (submit.isSuccess) {
    return (
      <AuthShell role={role}>
        <AuthStatus icon={<Mail aria-hidden />} title="Check your email">
          <p className="text-muted-foreground text-copy max-w-[38ch] leading-[1.6]">
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
    <AuthShell role={role}>
      <h1 className="font-display text-name font-bold leading-[1.15] tracking-[-0.035em]">
        Make an account
      </h1>
      <p className="text-muted-foreground text-copy mt-2 text-pretty leading-[1.6]">
        Email and a password — that is the whole thing. Your @handle is generated for you. Remember:
        you never need this to buy.
      </p>

      {/* The role fork — the socket picker, with its promise directly under. */}
      <div className="mt-[18px]">
        <RoleSockets role={role} onRoleChange={setRole} />
        <p className="text-muted-foreground text-label mt-3 leading-[1.6]">{copy.promise}</p>
      </div>

      <form
        className="mt-4 flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          if (email.trim() && password) submit.mutate();
        }}
      >
        <div className="mb-3.5 flex flex-wrap gap-2.5 [&>*]:min-w-[130px] [&>*]:flex-1">
          <div>
            <FieldLabel htmlFor="join-first-name">First name</FieldLabel>
            <TextField
              id="join-first-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              autoComplete="given-name"
              placeholder="Maya"
            />
          </div>
          <div>
            <FieldLabel htmlFor="join-last-name">Last name</FieldLabel>
            <TextField
              id="join-last-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              autoComplete="family-name"
              placeholder="Rao"
            />
          </div>
        </div>
        <FieldLabel htmlFor="join-email">Email</FieldLabel>
        <TextField
          id="join-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="mb-3.5"
        />
        <FieldLabel htmlFor="join-password">Password</FieldLabel>
        <PasswordInput
          id="join-password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          placeholder="At least 10 characters"
        />
        <p className="text-faint text-micro mt-[7px]">One password, every role, forever.</p>
        {submit.isError ? (
          <p
            role="alert"
            className="border-destructive text-muted-foreground text-label rounded-panel mt-3 border p-3 leading-[1.55]"
          >
            {submit.error.message}
          </p>
        ) : null}
        <Button
          type="submit"
          variant="action"
          disabled={submit.isPending}
          className="font-display mt-[18px] h-[50px] w-full rounded-lg"
        >
          {submit.isPending ? "Creating…" : copy.cta}
        </Button>
      </form>

      <div className="mt-3.5 flex flex-col gap-1.5">
        <p className="text-foreground tracking-eyebrow text-pico font-mono uppercase">
          {copy.after}
        </p>
        <p className="text-faint text-micro leading-[1.5]">
          Same form, whichever socket. One account holds all three — switch later from Account.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
        <Link href={`/signin?as=${role}`} className="text-foreground text-label font-semibold">
          Already have one? Sign in
        </Link>
        <Link href="/forgot" className="text-faint text-label">
          Forgot password
        </Link>
      </div>
    </AuthShell>
  );
}

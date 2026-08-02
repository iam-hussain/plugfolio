"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { Check, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyEmail } from "../api";
import { RoleArtefact } from "./auth-artefact";
import { FieldLabel, TextField } from "./auth-field";
import { AuthShell } from "./auth-shell";
import { AuthStatus } from "./auth-status";

/**
 * Where the account gets its name (ADR-0024). The registration email carries
 * two proofs of the same inbox — a link and a six-digit code — and this screen
 * takes either, because an in-app browser often loses the session on the way to
 * the mail app and back. Arriving with ?token= hides the code fields; arriving
 * bare shows them. Nothing is verified until the username is submitted, so the
 * proof survives a taken handle.
 */
export type VerifyScreenProps = {
  token?: string;
};

export function VerifyScreen({ token }: VerifyScreenProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");

  const verify = useMutation({
    mutationFn: () => verifyEmail(token ? { token, username } : { email, code, username }),
  });
  const { isSuccess } = verify;

  useEffect(() => {
    if (!isSuccess) return;
    const forward = setTimeout(() => router.push("/signin"), 1800);
    return () => clearTimeout(forward);
  }, [isSuccess, router]);

  if (isSuccess) {
    return (
      <AuthShell role="generic" artefact={<RoleArtefact role="creator" />}>
        <AuthStatus icon={<Check aria-hidden />} title={`You're @${username}`}>
          <p className="text-muted-foreground text-copy leading-[1.5]">
            Email verified. Taking you to sign-in…
          </p>
          <Button asChild>
            <Link href="/signin">Continue to sign in →</Link>
          </Button>
        </AuthStatus>
      </AuthShell>
    );
  }

  return (
    <AuthShell role="generic" artefact={<RoleArtefact role="creator" />}>
      <h1 className="font-display text-display-lg font-extrabold tracking-[-0.035em]">
        Pick your username
      </h1>
      <p className="text-muted-foreground text-copy mt-2.5 leading-[1.5]">
        {token
          ? "Your email checks out. This is the name on your comments — and you can sign in with it."
          : "Enter the six-digit code from your email, then choose your name."}
      </p>

      <form
        className="mt-[18px] flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          verify.mutate();
        }}
      >
        {!token ? (
          <>
            <FieldLabel htmlFor="verify-email">Email</FieldLabel>
            <TextField
              id="verify-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="you@email.com"
              className="mb-3.5"
            />
            <FieldLabel htmlFor="verify-code">Six-digit code</FieldLabel>
            <TextField
              id="verify-code"
              // Numeric keypad on a phone, and browsers offer the code straight
              // from the SMS/email autofill hint.
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              required
              autoComplete="one-time-code"
              placeholder="123456"
              className="mb-3.5 font-mono tracking-[0.3em]"
            />
          </>
        ) : null}

        <FieldLabel htmlFor="verify-username">Username</FieldLabel>
        <TextField
          id="verify-username"
          value={username}
          onChange={(event) => setUsername(event.target.value.toLowerCase())}
          required
          autoComplete="username"
          placeholder="mayamakes"
        />
        <p className="text-muted-foreground text-micro mt-[7px]">
          3–30 characters: letters, numbers, dots, dashes. Shown on your comments.
        </p>
        {verify.isError ? (
          <p role="alert" className="text-brand-coral text-micro mt-2.5">
            {verify.error.message}
          </p>
        ) : null}
        <Button type="submit" disabled={verify.isPending} className="mt-[22px] w-full">
          {verify.isPending ? "Verifying…" : "Verify and claim it"}
        </Button>
      </form>

      <div className="border-border text-label mt-[22px] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t pt-5 text-center">
        <span className="text-muted-foreground">{token ? "Code instead?" : "Have the link?"}</span>
        <Link href={token ? "/verify" : "/signin"} className="text-brand-violet-deep font-bold">
          {token ? "Type the six digits" : "Use it, or get a fresh email"}
        </Link>
      </div>

      <p className="text-muted-foreground text-micro mt-3 flex items-center justify-center gap-1.5 text-center">
        <Mail aria-hidden className="size-3.5" />
        Links last 24 hours, codes 15 minutes.
      </p>
    </AuthShell>
  );
}

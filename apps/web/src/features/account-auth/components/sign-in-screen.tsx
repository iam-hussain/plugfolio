"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { CircleAlert, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { resendVerification } from "../api";
import { RoleArtefact } from "./auth-artefact";
import { type AuthRole } from "./auth-copy";
import { FieldLabel, TextField } from "./auth-field";
import { AuthShell } from "./auth-shell";
import { PasswordInput } from "./password-input";
import { DEFAULT_ROLE, readStoredRole, writeStoredRole } from "./role-store";
import { cva } from "class-variance-authority";

/** Coral for a problem, violet wash for a notice. Never lime — nothing is on
    offer on an auth screen (§7 lime-means-offer). */
const authBanner = cva(
  "rounded-image text-foreground mt-5 flex items-start gap-3 border p-4 text-copy leading-[1.5]",
  {
    variants: {
      tone: {
        bad: "bg-brand-coral/15 border-brand-coral/50",
        info: "bg-active border-transparent",
      },
    },
    defaultVariants: { tone: "info" },
  },
);

/**
 * Login (brief 04, ADR-0012/ADR-0024): email OR username + password, one step,
 * no email round-trip. ONE generic banner for a wrong identifier OR password
 * (never a ring on one field — that's an existence oracle); a distinct
 * unverified state carrying resend.
 * No role picker — the account already holds whatever roles it holds; the pane
 * only reflects the role the visitor arrived as.
 */
export type SignInScreenProps = {
  callbackUrl?: string;
  initialRole?: AuthRole;
};

type LoginState = "idle" | "invalid" | "unverified" | "suspended";

export function SignInScreen({ callbackUrl = "/explore", initialRole }: SignInScreenProps) {
  const router = useRouter();
  // The pane's artefact reflects the arriving role: an explicit ?as= wins, else
  // the last-used role from the cache, else shopper. No picker here — login is
  // role-agnostic; this only decides which artefact the pane shows.
  const [role, setRole] = useState<AuthRole>(initialRole ?? DEFAULT_ROLE);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<LoginState>("idle");

  useEffect(() => {
    if (!initialRole) setRole(readStoredRole());
  }, [initialRole]);

  const submit = useMutation({
    mutationFn: async () => {
      const result = await signIn("credentials", { identifier, password, redirect: false });
      if (result?.error) {
        setState(
          result.code === "unverified" || result.code === "suspended" ? result.code : "invalid",
        );
        return;
      }
      setState("idle");
      writeStoredRole(role);
      router.push(callbackUrl as Parameters<typeof router.push>[0]);
      router.refresh();
    },
  });
  const resend = useMutation({ mutationFn: () => resendVerification({ identifier }) });

  return (
    <AuthShell role="generic" artefact={<RoleArtefact role={role} />}>
      <h1 className="font-display text-display-lg font-extrabold tracking-[-0.035em]">
        Welcome back
      </h1>
      <p className="text-muted-foreground text-copy mt-2.5 leading-[1.5]">
        Email or username, and your password. That&apos;s the whole thing.
      </p>

      {state === "invalid" ? (
        <AuthBanner tone="bad">
          <b className="block font-semibold">Those details don&apos;t match an account.</b>
          Check both and try again.
        </AuthBanner>
      ) : null}
      {state === "suspended" ? (
        <AuthBanner tone="bad">
          <b className="block font-semibold">This account is suspended.</b>
          <Link href="/support" className="underline underline-offset-2">
            Contact support
          </Link>{" "}
          to sort it out.
        </AuthBanner>
      ) : null}
      {state === "unverified" ? (
        <AuthBanner tone="info">
          <b className="block font-semibold">Verify your email to sign in.</b>
          We sent a link when you registered.
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => resend.mutate()}
            disabled={resend.isPending}
          >
            {resend.isSuccess ? "Link sent ✓" : "Resend verification email"}
          </Button>
        </AuthBanner>
      ) : null}

      <form
        className="mt-[18px] flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          if (identifier.trim() && password) submit.mutate();
        }}
      >
        <FieldLabel htmlFor="login-identifier">Email or username</FieldLabel>
        <TextField
          id="login-identifier"
          type="text"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          required
          autoComplete="username"
          placeholder="you@email.com or mayamakes"
          className="mb-3.5"
        />
        <FieldLabel htmlFor="login-password">Password</FieldLabel>
        <PasswordInput
          id="login-password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <Button type="submit" disabled={submit.isPending} className="mt-[22px] w-full">
          {submit.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="border-border text-label mt-[22px] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t pt-5 text-center">
        <Link href="/forgot" className="text-muted-foreground hover:text-primary font-semibold">
          Forgot password?
        </Link>
        {/* The lost-email door (brief 04 edge): a reset link is no use when the
            inbox itself is gone — support can move the account email. */}
        <Link
          href="/support?category=lost_email_access"
          className="text-muted-foreground hover:text-primary font-semibold"
        >
          Can&apos;t access your email?
        </Link>
        <Link href={`/join?as=${role}`} className="text-brand-violet-deep font-bold">
          Create an account
        </Link>
      </div>
    </AuthShell>
  );
}

function AuthBanner({ tone, children }: { tone: "bad" | "info"; children: React.ReactNode }) {
  const Icon = tone === "bad" ? CircleAlert : Mail;
  return (
    <div role="alert" className={authBanner({ tone })}>
      <Icon aria-hidden className="mt-0.5 size-[18px] shrink-0" />
      <span>{children}</span>
    </div>
  );
}

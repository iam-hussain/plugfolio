"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { resendVerification } from "../api";
import { ROLE_COPY, type AuthRole } from "./auth-copy";
import { FieldLabel, TextField } from "./auth-field";
import { AuthShell } from "./auth-shell";
import { PasswordInput } from "./password-input";
import { RoleTabs } from "./role-tabs";

/**
 * Login (brief 04, ADR-0012): email + password, one step, no email round-trip.
 * One generic failure for wrong email OR password; a DISTINCT state for an
 * unverified email, with resend. The role tabs only recolor the copy — the
 * form itself is role-agnostic.
 */
export type SignInScreenProps = {
  callbackUrl?: string;
  initialRole?: AuthRole;
};

type LoginState = "idle" | "invalid" | "unverified" | "suspended";

export function SignInScreen({ callbackUrl = "/", initialRole = "creator" }: SignInScreenProps) {
  const router = useRouter();
  const [role, setRole] = useState<AuthRole>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<LoginState>("idle");
  const copy = ROLE_COPY[role];

  const submit = useMutation({
    mutationFn: async () => {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setState(
          result.code === "unverified" || result.code === "suspended"
            ? result.code
            : "invalid",
        );
        return;
      }
      setState("idle");
      router.push(callbackUrl as Parameters<typeof router.push>[0]);
      router.refresh();
    },
  });

  const resend = useMutation({ mutationFn: () => resendVerification({ email }) });

  return (
    <AuthShell panel={copy.panel}>
      <RoleTabs role={role} onChange={setRole} />
      <p className="bg-muted border-border text-muted-foreground mb-[18px] rounded-[10px] border px-3.5 py-3 text-[13px] leading-[1.55] lg:hidden">
        {copy.desc}
      </p>
      <h1 className="font-display text-[28px] font-extrabold tracking-[-0.03em]">Welcome back</h1>
      <p className="text-muted-foreground mt-2 text-[13.5px] leading-[1.5]">{copy.subSignin}</p>

      <form
        className="mt-[18px] flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          if (email.trim() && password) submit.mutate();
        }}
      >
        <FieldLabel htmlFor="login-email">Email</FieldLabel>
        <TextField
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          placeholder="you@email.com"
          className="mb-3.5"
        />
        <FieldLabel htmlFor="login-password">Password</FieldLabel>
        <PasswordInput
          id="login-password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        {state === "invalid" ? (
          <p role="alert" className="text-brand-coral mt-2.5 text-[12.5px]">
            Wrong email or password.
          </p>
        ) : null}
        {state === "suspended" ? (
          <p role="alert" className="text-brand-coral mt-2.5 text-[12.5px]">
            This account is suspended. Contact support.
          </p>
        ) : null}
        {state === "unverified" ? (
          <p role="alert" className="text-muted-foreground mt-2.5 text-[12.5px]">
            Verify your email first.{" "}
            <button
              type="button"
              onClick={() => resend.mutate()}
              disabled={resend.isPending}
              className="text-primary font-semibold"
            >
              {resend.isSuccess ? "Link sent ✓" : "Resend link"}
            </button>
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={submit.isPending}
          className="font-display mt-4 h-auto w-full rounded-[9px] py-[13px] text-[15px] font-semibold"
        >
          {submit.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-muted-foreground mt-5 text-center text-[13px]">
        <Link href="/forgot" className="hover:text-foreground">
          Forgot password?
        </Link>
      </p>
      <p className="text-muted-foreground mt-2.5 text-center text-[13px]">
        New to Plugfolio?{" "}
        <Link href={`/join?as=${role}`} className="text-primary font-semibold">
          Create an account
        </Link>
      </p>
      <p className="text-muted-foreground/70 mt-3.5 text-center text-[11.5px] leading-[1.55]">
        {copy.reassure}
      </p>
    </AuthShell>
  );
}

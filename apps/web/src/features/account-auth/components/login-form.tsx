"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { resendVerification } from "../api";
import { PasswordInput } from "./password-input";

/**
 * Login (brief 04): email + password, one step, no email round-trip. One
 * generic failure for wrong email OR password; a DISTINCT state for an
 * unverified email, with resend.
 */
export type LoginFormProps = {
  callbackUrl?: string;
};

type LoginState = "idle" | "invalid" | "unverified";

export function LoginForm({ callbackUrl = "/" }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<LoginState>("idle");

  const submit = useMutation({
    mutationFn: async () => {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setState(result.code === "unverified" ? "unverified" : "invalid");
        return;
      }
      setState("idle");
      router.push(callbackUrl as Parameters<typeof router.push>[0]);
      router.refresh();
    },
  });

  const resend = useMutation({ mutationFn: () => resendVerification({ email }) });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (email.trim() && password) submit.mutate();
      }}
    >
      <label className="flex flex-col gap-1 text-sm" htmlFor="login-email">
        Email
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          className="border-border bg-background rounded-md border p-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm" htmlFor="login-password">
        Password
      </label>
      <PasswordInput
        id="login-password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
      />
      {state === "invalid" ? (
        <p role="alert" className="text-muted-foreground text-xs">
          Wrong email or password.
        </p>
      ) : null}
      {state === "unverified" ? (
        <div role="alert" className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Verify your email first.</span>
          <button
            type="button"
            onClick={() => resend.mutate()}
            disabled={resend.isPending}
            className="underline"
          >
            {resend.isSuccess ? "Link sent" : "Resend link"}
          </button>
        </div>
      ) : null}
      <Button type="submit" disabled={submit.isPending}>
        {submit.isPending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-muted-foreground text-xs">
        <Link href="/forgot" className="underline">
          Forgot password?
        </Link>{" "}
        ·{" "}
        <Link href="/join" className="underline">
          Create account
        </Link>
      </p>
    </form>
  );
}

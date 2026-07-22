"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { registerAccount, resendVerification } from "../api";
import { PasswordInput } from "./password-input";

/**
 * Registration (brief 04): email + password → one verification link. The
 * "check your email" state owns the screen afterward — resend included.
 */
export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = useMutation({ mutationFn: () => registerAccount({ email, password }) });
  const resend = useMutation({ mutationFn: () => resendVerification({ email }) });

  if (submit.isSuccess) {
    return (
      <div aria-live="polite" className="flex flex-col gap-2 text-sm">
        <p className="font-medium">Check your email</p>
        <p className="text-muted-foreground">
          We sent one verification link to <span className="font-medium">{email}</span>. Click it,
          then sign in — that&apos;s the only time email is involved.
        </p>
        <div>
          <Button variant="outline" size="sm" onClick={() => resend.mutate()} disabled={resend.isPending}>
            {resend.isPending ? "Sending…" : resend.isSuccess ? "Sent again" : "Resend link"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (email.trim() && password) submit.mutate();
      }}
    >
      <label className="flex flex-col gap-1 text-sm" htmlFor="register-email">
        Email
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          className="border-border bg-background rounded-md border p-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm" htmlFor="register-password">
        Password <span className="text-muted-foreground text-xs">(at least 8 characters)</span>
      </label>
      <PasswordInput
        id="register-password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
      />
      {submit.isError ? (
        <p role="alert" className="text-muted-foreground text-xs">
          {submit.error.message}
        </p>
      ) : null}
      <Button type="submit" disabled={submit.isPending}>
        {submit.isPending ? "Creating…" : "Create account"}
      </Button>
      <p className="text-muted-foreground text-xs">
        We&apos;ll send one link to verify your email — after that, you sign in with your password.
      </p>
    </form>
  );
}

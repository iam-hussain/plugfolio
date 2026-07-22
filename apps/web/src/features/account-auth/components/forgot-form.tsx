"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { requestPasswordReset } from "../api";

/** Forgot password (brief 04): always "check your email" — never an oracle. */
export function ForgotForm() {
  const [email, setEmail] = useState("");
  const submit = useMutation({ mutationFn: () => requestPasswordReset({ email }) });

  if (submit.isSuccess) {
    return (
      <p aria-live="polite" className="text-muted-foreground text-sm">
        If an account exists for <span className="font-medium">{email}</span>, a reset link is on
        its way. Check your email.
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (email.trim()) submit.mutate();
      }}
    >
      <label className="flex flex-col gap-1 text-sm" htmlFor="forgot-email">
        Email
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          className="border-border bg-background rounded-md border p-2 text-sm"
        />
      </label>
      {submit.isError ? (
        <p role="alert" className="text-muted-foreground text-xs">
          {submit.error.message}
        </p>
      ) : null}
      <Button type="submit" disabled={submit.isPending}>
        {submit.isPending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

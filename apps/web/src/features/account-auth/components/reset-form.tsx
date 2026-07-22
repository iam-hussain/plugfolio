"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { resetPassword } from "../api";
import { PasswordInput } from "./password-input";

/**
 * Set a new password from an email link (brief 04). Doubles as the invited
 * Manager's FIRST password — the link proved the inbox, so it verifies too.
 */
export type ResetFormProps = {
  token: string;
};

export function ResetForm({ token }: ResetFormProps) {
  const [password, setPassword] = useState("");
  const submit = useMutation({ mutationFn: () => resetPassword({ token, password }) });

  if (submit.isSuccess) {
    return (
      <p aria-live="polite" className="text-sm">
        Password set.{" "}
        <Link href="/signin" className="underline">
          Sign in
        </Link>
        .
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (password) submit.mutate();
      }}
    >
      <label className="flex flex-col gap-1 text-sm" htmlFor="reset-password">
        New password <span className="text-muted-foreground text-xs">(at least 8 characters)</span>
      </label>
      <PasswordInput
        id="reset-password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
      />
      {submit.isError ? (
        <p role="alert" className="text-muted-foreground text-xs">
          {submit.error.message} —{" "}
          <Link href="/forgot" className="underline">
            request a new link
          </Link>
        </p>
      ) : null}
      <Button type="submit" disabled={submit.isPending}>
        {submit.isPending ? "Saving…" : "Set password"}
      </Button>
    </form>
  );
}

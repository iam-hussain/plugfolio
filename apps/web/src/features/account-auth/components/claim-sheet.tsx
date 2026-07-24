"use client";

import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { registerAccount, resendVerification } from "../api";
import { FieldLabel, TextField } from "./auth-field";
import { PasswordInput } from "./password-input";

/**
 * The inline shopper claim (brief 04): Follow/Comment for an anonymous
 * visitor opens this register sheet OVER the page they're on — no
 * navigation away, no wall on shopping. It is the register form, nothing
 * more; after submit the "check your email" state owns the sheet, and the
 * action completes once they've verified and signed in.
 */
export type ClaimSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** What they were trying to do — sets the heading. */
  action: "follow" | "comment";
};

export function ClaimSheet({ open, onOpenChange, action }: ClaimSheetProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = useMutation({ mutationFn: () => registerAccount({ email, password }) });
  const resend = useMutation({ mutationFn: () => resendVerification({ email }) });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-lg">
        {submit.isSuccess ? (
          <>
            <SheetHeader>
              <SheetTitle>Check your email</SheetTitle>
              <SheetDescription>
                We sent one verification link to{" "}
                <span className="text-foreground font-semibold">{email}</span>. Click it, sign in
                with your password, and your {action} completes.
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-3 px-4 pb-6">
              <Button
                variant="outline"
                onClick={() => resend.mutate()}
                disabled={resend.isPending}
              >
                {resend.isPending
                  ? "Sending…"
                  : resend.isSuccess
                    ? "Sent again ✓"
                    : "Resend the link"}
              </Button>
              <button
                type="button"
                onClick={() => submit.reset()}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ← Use a different email
              </button>
            </div>
          </>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>
                {action === "follow" ? "Follow with a free account" : "Comment with a free account"}
              </SheetTitle>
              <SheetDescription>
                One email link to verify, then you sign in with your password. Shopping never
                needs an account.
              </SheetDescription>
            </SheetHeader>
            <form
              className="flex flex-col gap-4 px-4 pb-6"
              onSubmit={(event) => {
                event.preventDefault();
                submit.mutate();
              }}
            >
              <div>
                <FieldLabel htmlFor="claim-email">Email</FieldLabel>
                <TextField
                  id="claim-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <FieldLabel htmlFor="claim-password">Password (min 8 characters)</FieldLabel>
                <PasswordInput
                  id="claim-password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                />
              </div>
              {submit.isError ? (
                <p role="alert" className="text-destructive text-xs">
                  {submit.error.message}
                </p>
              ) : null}
              <Button type="submit" disabled={submit.isPending}>
                {submit.isPending ? "Creating…" : "Create account"}
              </Button>
              <p className="text-muted-foreground text-center text-xs">
                Already have one?{" "}
                <Link href="/signin" className="text-primary font-semibold">
                  Sign in
                </Link>
              </p>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

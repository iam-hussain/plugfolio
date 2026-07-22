"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect } from "react";
import { verifyEmail } from "../api";

/** Consumes the verification token on load (brief 04: auto, then forward). */
export type VerifyEmailProps = {
  token: string;
};

export function VerifyEmail({ token }: VerifyEmailProps) {
  const verify = useMutation({ mutationFn: () => verifyEmail({ token }) });
  const { mutate } = verify;

  useEffect(() => {
    mutate();
  }, [mutate]);

  if (verify.isPending || verify.isIdle) {
    return <p className="text-muted-foreground text-sm">Verifying…</p>;
  }
  if (verify.isError) {
    return (
      <p role="alert" className="text-sm">
        {verify.error.message}{" "}
        <span className="text-muted-foreground">
          — sign in to request a fresh one, or{" "}
          <Link href="/signin" className="underline">
            go to sign-in
          </Link>
          .
        </span>
      </p>
    );
  }
  return (
    <p aria-live="polite" className="text-sm">
      Email verified ✓{" "}
      <Link href="/signin" className="underline">
        Sign in
      </Link>
      .
    </p>
  );
}

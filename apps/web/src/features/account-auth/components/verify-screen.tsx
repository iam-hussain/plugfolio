"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { verifyEmail } from "../api";
import { VERIFY_PANEL } from "./auth-copy";
import { AuthNotice } from "./auth-notice";
import { AuthShell } from "./auth-shell";

/**
 * Landing of the one registration email link (brief 04, ADR-0012): consumes
 * the token on load, confirms, and forwards to sign-in. An expired/used link
 * points back to sign-in, where resend lives (the unverified login state).
 */
export type VerifyScreenProps = {
  token?: string;
};

export function VerifyScreen({ token }: VerifyScreenProps) {
  const router = useRouter();
  const verify = useMutation({ mutationFn: () => verifyEmail({ token: token ?? "" }) });
  const { mutate, isSuccess } = verify;

  useEffect(() => {
    if (token) mutate();
  }, [token, mutate]);

  useEffect(() => {
    if (!isSuccess) return;
    const forward = setTimeout(() => router.push("/signin"), 1800);
    return () => clearTimeout(forward);
  }, [isSuccess, router]);

  return (
    <AuthShell panel={VERIFY_PANEL}>
      <AuthNotice title="Verify your email">
        {!token ? (
          <p className="text-muted-foreground mt-2.5 text-sm leading-[1.55]">
            This link is incomplete — use the one from your email.
          </p>
        ) : verify.isSuccess ? (
          <>
            <p className="mt-2.5 text-sm leading-[1.55]">
              <span className="font-semibold">Email verified ✓</span>{" "}
              <span className="text-muted-foreground">Taking you to sign-in…</span>
            </p>
            <Button
              asChild
              className="font-display mt-[22px] h-auto w-full max-w-[300px] rounded-[9px] py-[13px] text-[15px] font-semibold"
            >
              <Link href="/signin">Continue to sign in →</Link>
            </Button>
          </>
        ) : verify.isError ? (
          <>
            <p role="alert" className="text-muted-foreground mt-2.5 text-sm leading-[1.55]">
              {verify.error.message}
            </p>
            <Button
              asChild
              className="font-display mt-[22px] h-auto w-full max-w-[300px] rounded-[9px] py-[13px] text-[15px] font-semibold"
            >
              <Link href="/signin">Go to sign-in →</Link>
            </Button>
            <p className="text-muted-foreground/70 mt-3.5 max-w-[320px] text-[11.5px] leading-[1.5]">
              Signing in with an unverified email offers a fresh link.
            </p>
          </>
        ) : (
          <p className="text-muted-foreground mt-2.5 text-sm leading-[1.55]">Verifying…</p>
        )}
      </AuthNotice>
    </AuthShell>
  );
}

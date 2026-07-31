"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { Check, Clock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { verifyEmail } from "../api";
import { RoleArtefact } from "./auth-artefact";
import { AuthShell } from "./auth-shell";
import { AuthStatus } from "./auth-status";

/**
 * Landing of the one registration email link (brief 04, ADR-0012): consumes
 * the token on load, confirms, and forwards to sign-in. An expired/used link
 * is never a dead end — it points back to sign-in, where the unverified state
 * carries resend.
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

  const artefact = <RoleArtefact role="creator" />;

  return (
    <AuthShell role="generic" artefact={artefact}>
      {!token ? (
        <AuthStatus icon={<Mail aria-hidden />} title="Incomplete link">
          <p className="text-muted-foreground text-copy max-w-[38ch] leading-[1.5]">
            Use the verification link from your email.
          </p>
          <Button asChild>
            <Link href="/signin">Go to sign in →</Link>
          </Button>
        </AuthStatus>
      ) : verify.isSuccess ? (
        <AuthStatus icon={<Check aria-hidden />} title="Email verified">
          <p className="text-muted-foreground text-copy leading-[1.5]">Taking you to sign-in…</p>
          <Button asChild>
            <Link href="/signin">Continue to sign in →</Link>
          </Button>
        </AuthStatus>
      ) : verify.isError ? (
        <AuthStatus icon={<Clock aria-hidden />} title="This link has expired">
          <p className="text-muted-foreground text-copy max-w-[38ch] leading-[1.5]">
            Links work once and last 24 hours. Sign in with your email — an unverified account
            offers a fresh link.
          </p>
          <Button asChild>
            <Link href="/signin">Go to sign in →</Link>
          </Button>
        </AuthStatus>
      ) : (
        <AuthStatus icon={<Mail aria-hidden />} title="Verifying…">
          <p className="text-muted-foreground text-copy leading-[1.5]">One moment.</p>
        </AuthStatus>
      )}
    </AuthShell>
  );
}

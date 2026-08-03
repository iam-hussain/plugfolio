"use client";

import { Button, InputOTP, InputOTPGroup, InputOTPSlot } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyEmail } from "../api";
import { FieldLabel, TextField } from "./auth-field";
import { AuthShell } from "./auth-shell";
import { AuthStatus } from "./auth-status";

/**
 * Verify (v2, `Plugfolio v2.dc.html` §verify; ADR-0024) — where the account
 * gets its name. The registration email carries two proofs of the same inbox
 * — a link and a six-digit code — and this screen takes either, because an
 * in-app browser often loses the tab on the way to the mail app and back.
 * Arriving with ?token= hides the code panel; arriving bare shows it. Nothing
 * is verified until the username is submitted, so the proof survives a taken
 * handle.
 */
export type VerifyScreenProps = {
  token?: string;
};

export function VerifyScreen({ token }: VerifyScreenProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");

  const verify = useMutation({
    mutationFn: () => verifyEmail(token ? { token, username } : { email, code, username }),
  });
  const { isSuccess } = verify;

  useEffect(() => {
    if (!isSuccess) return;
    const forward = setTimeout(() => router.push("/signin"), 1800);
    return () => clearTimeout(forward);
  }, [isSuccess, router]);

  if (isSuccess) {
    return (
      <AuthShell role="generic">
        <AuthStatus icon={<Check aria-hidden />} title={`You're @${username}`}>
          <p className="text-muted-foreground text-copy leading-[1.6]">
            Email verified. Taking you to sign-in…
          </p>
          <Button variant="action" asChild className="font-display rounded-lg h-[50px]">
            <Link href="/signin">Continue to sign in →</Link>
          </Button>
        </AuthStatus>
      </AuthShell>
    );
  }

  return (
    <AuthShell role="generic">
      <h1 className="font-display text-name font-bold leading-[1.15] tracking-[-0.035em]">
        Check your email
      </h1>
      <p className="text-muted-foreground text-copy mt-2 text-pretty leading-[1.6]">
        {token
          ? "Your email checks out. Now pick the @handle you will sign in with."
          : "We sent one mail with a link and a code. Either proves it is you. Then pick the @handle you will sign in with."}
      </p>

      <form
        className="mt-4 flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          verify.mutate();
        }}
      >
        {!token ? (
          // The code panel (v2): the accent-edged box the mail's six digits
          // land in. The email names which account the code belongs to.
          <div className="border-primary rounded-lg border p-3.5">
            <p className="text-foreground tracking-eyebrow text-pico font-mono font-bold uppercase">
              Type the six-digit code
            </p>
            <div className="mt-2.5">
              <FieldLabel htmlFor="verify-email">Email</FieldLabel>
              <TextField
                id="verify-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="mb-2.5"
              />
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                containerClassName="justify-between gap-[7px]"
              >
                <InputOTPGroup className="w-full gap-[7px] [&>div]:flex-1">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="border-border-strong bg-active rounded-md h-[52px] w-full border font-mono text-body font-bold"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <p className="text-muted-foreground text-micro mt-2.5 leading-[1.55]">
              In-app browsers lose the tab when you leave for your mail app — the code is the way
              back. The link in that mail works too.
            </p>
          </div>
        ) : null}

        <div className={token ? "" : "mt-3.5"}>
          <FieldLabel htmlFor="verify-username">Pick your @handle</FieldLabel>
          <div className="bg-active border-border focus-within:border-ring rounded-panel flex h-12 items-center border px-[13px]">
            <span className="text-faint text-copy font-semibold">@</span>
            <TextField
              id="verify-username"
              value={username}
              onChange={(event) => setUsername(event.target.value.toLowerCase())}
              required
              autoComplete="username"
              placeholder="mayarao"
              className="h-auto border-0 bg-transparent px-1 font-semibold"
            />
          </div>
          <div className="border-border text-muted-foreground text-micro rounded-md mt-2.5 border p-3 leading-[1.55]">
            <b className="text-foreground font-semibold">This is a login name, not a page.</b> It
            is how you sign in and how you appear when you follow or comment. It gives you no
            public page — a shoppable page gets its own address later, from a social handle you
            connect.
          </div>
          <p className="text-faint text-micro mt-[7px]">
            3–30 characters: letters, numbers, dots, dashes.
          </p>
        </div>

        {verify.isError ? (
          <p
            role="alert"
            className="border-destructive text-muted-foreground text-label mt-3 rounded-panel border p-3 leading-[1.55]"
          >
            {verify.error.message}
          </p>
        ) : null}
        <Button
          type="submit"
          variant="action"
          disabled={verify.isPending}
          className="font-display rounded-lg mt-[18px] h-[50px] w-full"
        >
          {verify.isPending ? "Verifying…" : "Verify and continue"}
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
        <Link href={token ? "/verify" : "/signin"} className="text-foreground text-label font-semibold">
          {token ? "Type the six digits instead" : "Have the link? Use it"}
        </Link>
        <span className="text-faint text-micro">Links last 24 hours, codes 15 minutes.</span>
      </div>
    </AuthShell>
  );
}

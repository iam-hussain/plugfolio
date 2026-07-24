import { NotFoundError, setOperatorPasswordWithToken } from "@plugfolio/core";
import { Button, Input, Logo } from "@plugfolio/ui";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Panel } from "@/components/panel";
import { repositories } from "@/server/container";

export const metadata: Metadata = { title: "Set password" };

const monoLabel =
  "font-mono text-muted-foreground mb-[7px] block text-[10px] uppercase tracking-[0.08em]";

async function setPassword(formData: FormData) {
  "use server";
  const parsed = z
    .object({ token: z.string().min(1), password: z.string().min(10) })
    .safeParse({ token: formData.get("token"), password: formData.get("password") });
  if (!parsed.success) redirect("/set-password?error=short");
  try {
    await setOperatorPasswordWithToken(
      { admins: repositories.admins, tokens: repositories.tokens },
      parsed.data,
    );
  } catch (error) {
    if (error instanceof NotFoundError) redirect("/set-password?error=expired");
    throw error;
  }
  redirect("/signin");
}

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  return (
    <main className="bg-muted flex min-h-dvh items-center justify-center p-6">
      <Panel className="w-full max-w-sm px-7 py-8">
        <div className="mb-[22px]">
          <Logo tone="auto" markSize="sm" />
        </div>
        <h1 className="font-display text-[26px] font-bold tracking-[-0.02em]">Set your password</h1>
        <p className="text-muted-foreground mt-2 text-[13.5px] leading-[1.55]">
          This link proves your inbox — pick an operator password (10+ characters) and sign in.
        </p>
        {error ? (
          <p role="alert" className="text-destructive mt-4 text-[13px] font-medium">
            {error === "expired"
              ? "That link has expired or was already used — ask an operator for a fresh one."
              : "Password must be at least 10 characters."}
          </p>
        ) : null}
        <form action={setPassword}>
          <input type="hidden" name="token" value={token ?? ""} />
          <div className="mt-[22px]">
            <label htmlFor="password" className={monoLabel}>
              New password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••••"
              className="px-[13px] py-3 text-[13.5px]"
            />
          </div>
          <Button type="submit" className="font-display mt-5 w-full p-3 text-[15px]">
            Set password
          </Button>
        </form>
      </Panel>
    </main>
  );
}

import { AlertTriangle } from "lucide-react";
import { Button, Input, Logo } from "@plugfolio/ui";
import type { Metadata } from "next";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { Panel } from "@/components/panel";
import { auth, signIn } from "@/server/auth";

export const metadata: Metadata = { title: "Sign in" };

async function login(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    // signIn's success is a NEXT_REDIRECT throw — only auth failures land here.
    if (error instanceof AuthError) redirect("/signin?error=1");
    throw error;
  }
}

const monoLabel =
  "font-mono text-muted-foreground mb-[7px] block text-[10px] uppercase tracking-[0.08em]";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if ((await auth())?.user) redirect("/");
  const { error } = await searchParams;

  return (
    <main className="bg-muted flex min-h-dvh items-center justify-center p-6">
      <Panel className="w-full max-w-sm px-7 py-8">
        <div className="mb-[22px]">
          <Logo tone="auto" markSize="sm" />
        </div>
        <p className="font-mono text-primary text-[10px] font-bold uppercase tracking-[0.1em]">
          Plugfolio
        </p>
        <h1 className="font-display mt-1 text-[26px] font-bold tracking-[-0.02em]">Admin</h1>
        <p className="text-muted-foreground mt-2 text-[13.5px] leading-[1.55]">
          Operators only. Sign in with your admin credentials.
        </p>

        {error ? (
          <div
            role="alert"
            className="bg-destructive/10 border-destructive/30 mt-[18px] flex items-start gap-[11px] rounded-[10px] border px-3.5 py-3"
          >
            <AlertTriangle aria-hidden className="text-destructive mt-px size-[18px] shrink-0" />
            <p className="text-[13px] font-medium">Wrong email or password.</p>
          </div>
        ) : null}

        <form action={login}>
          <div className="mt-[22px]">
            <label htmlFor="email" className={monoLabel}>
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@plugfolio.com"
              className="px-[13px] py-3 text-[13.5px]"
            />
          </div>
          <div className="mt-3.5">
            <label htmlFor="password" className={monoLabel}>
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••"
              className="px-[13px] py-3 text-[13.5px]"
            />
          </div>
          <Button type="submit" className="font-display mt-5 w-full p-3 text-[15px]">
            Sign in
          </Button>
        </form>
        <p className="text-faint mt-4 text-center text-[11.5px] leading-normal">
          Accounts are provisioned by an existing operator.
        </p>
      </Panel>
    </main>
  );
}

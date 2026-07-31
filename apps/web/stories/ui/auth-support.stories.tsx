import type { Meta, StoryObj } from "@storybook/react";
import {
  AuthAlternatives,
  AuthConsequence,
  AuthField,
  AuthForm,
  AuthInput,
  AuthNotice,
  AuthReveal,
  AuthStatus,
  Button,
  SupportCategories,
  SupportCategory,
  SupportField,
  SupportHint,
  SupportNext,
  SupportStep,
  SupportWho,
  Textarea,
} from "@plugfolio/ui";
import { Clock, MailCheck, UserRound } from "lucide-react";

/**
 * The account and help screens (DESIGN auth.html / support.html) — the two
 * places someone arrives already stuck, so both say more than they have to.
 */
const meta: Meta = { title: "Auth & Support/Forms", parameters: { layout: "padded" } };
export default meta;
type Story = StoryObj;

/**
 * One narrow column: label, field, rule, one full-width action, one
 * consequence. The narrowness is the point — a sign-in that spans the measure
 * reads as a form to fill in rather than a door to walk through.
 */
export const SignIn: Story = {
  render: () => (
    <AuthForm>
      <AuthField label="Email" htmlFor="e">
        <AuthInput id="e" type="email" placeholder="you@email.com" />
      </AuthField>
      <AuthField label="Password" htmlFor="p" rule="At least 8 characters.">
        <AuthInput id="p" type="password" placeholder="••••••••" />
        <AuthReveal>Show</AuthReveal>
      </AuthField>
      <Button className="mt-[22px] w-full">Sign in</Button>
      <AuthConsequence>No link to wait for — one email, one password, one step.</AuthConsequence>
      <AuthAlternatives>
        <a href="#" className="text-primary min-h-11 font-bold">
          Forgot password
        </a>
        <span>New here?</span>
        <a href="#" className="text-primary min-h-11 font-bold">
          Create an account
        </a>
      </AuthAlternatives>
    </AuthForm>
  ),
};

/** The two notices a screen carries: something's wrong, or something's worth knowing. */
export const Notices: Story = {
  render: () => (
    <div className="mx-auto max-w-[380px]">
      <AuthNotice tone="bad" title="That email or password didn't match">
        Check the address first — it&apos;s the one people get wrong.
      </AuthNotice>
      <AuthNotice
        title="Verify your email to finish"
        action={<Button size="sm">Resend the link</Button>}
      >
        We sent it when you registered. It expires after an hour.
      </AuthNotice>
    </div>
  ),
};

/** One status object, one action. Check your email · verified · expired. */
export const Statuses: Story = {
  render: () => (
    <div className="grid gap-14">
      <AuthStatus
        icon={<MailCheck />}
        title="Check your email"
        actions={<Button variant="secondary">Resend the link</Button>}
      >
        We sent a link to you@email.com. Open it on this device and you&apos;re in.
      </AuthStatus>
      <AuthStatus
        icon={<Clock />}
        title="That link has expired"
        actions={<Button>Send a fresh one</Button>}
      >
        Links last an hour, so an old one in your inbox never works twice.
      </AuthStatus>
    </div>
  ),
};

/**
 * The support picker is radio **cards**, not a select: nine options behind a
 * dropdown means someone already stuck has to open a menu and read nine lines
 * to find out whether their problem is even listed.
 */
export const Support: Story = {
  render: () => (
    <div className="mx-auto max-w-[680px]">
      <SupportWho>
        <UserRound aria-hidden />
        Signed in as @niaeveryday
      </SupportWho>
      <SupportField label="What's it about?" hint="Closest is close enough — we'll work it out.">
        <SupportCategories>
          <SupportCategory name="c" defaultChecked>
            I can&apos;t access my account email
          </SupportCategory>
          <SupportCategory name="c">Change my email</SupportCategory>
          <SupportCategory name="c">Merge two accounts</SupportCategory>
          <SupportCategory name="c">Something else</SupportCategory>
        </SupportCategories>
        <SupportHint>
          Give the email you can still reach — we reply there — plus the account email you lost.
        </SupportHint>
      </SupportField>
      <SupportField label="What happened?" hint="What you tried, and what happened instead.">
        <Textarea rows={6} className="min-h-[150px]" />
      </SupportField>
      <Button className="mt-[clamp(26px,3.5vw,34px)] w-full">Send to support</Button>
      <SupportNext>
        <SupportStep n={1}>
          <b className="text-foreground block font-bold">A person reads it</b>
          Every ticket, not a bot triage queue.
        </SupportStep>
        <SupportStep n={2}>
          <b className="text-foreground block font-bold">We reply by email</b>
          To the address you gave above, usually within a working day.
        </SupportStep>
        <SupportStep n={3}>
          <b className="text-foreground block font-bold">There is no phone line</b>
          Saying so up front beats letting you look for one.
        </SupportStep>
      </SupportNext>
    </div>
  ),
};

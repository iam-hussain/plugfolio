import type { Meta, StoryObj } from "@storybook/react";
import { Check, Clock, Mail } from "lucide-react";
import { Button } from "@plugfolio/ui";
import { RoleArtefact } from "@/features/account-auth/components/auth-artefact";
import { AuthShell } from "@/features/account-auth/components/auth-shell";
import { AuthStatus } from "@/features/account-auth/components/auth-status";

/**
 * The message states of auth (DESIGN auth.html §status): the flows that end in
 * a stamp rather than a form — check-email, verified, expired, password-set.
 * Composed here from the same `AuthShell` + `AuthStatus` the screens use, so
 * the gallery shows every scenario the live flow can reach.
 */
const meta: Meta = {
  title: "Auth/Status",
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="-m-8">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj;

/** Registration sent one verification email. */
export const CheckEmail: Story = {
  render: () => (
    <AuthShell role="creator" artefact={<RoleArtefact role="creator" />}>
      <AuthStatus icon={<Mail aria-hidden />} title="Check your email">
        <p className="text-muted-foreground max-w-[38ch] text-[0.9375rem] leading-[1.5]">
          We sent a verification link to <b className="text-foreground">ana@studio.com</b>. Open it
          to finish setting up.
        </p>
        <Button variant="secondary">Resend email</Button>
      </AuthStatus>
    </AuthShell>
  ),
};

/** The link was good — email verified, forwarding to sign-in. */
export const Verified: Story = {
  render: () => (
    <AuthShell role="generic" artefact={<RoleArtefact role="creator" />}>
      <AuthStatus icon={<Check aria-hidden />} title="Email verified">
        <p className="text-muted-foreground text-[0.9375rem] leading-[1.5]">
          Taking you to sign-in…
        </p>
        <Button>Continue to sign in →</Button>
      </AuthStatus>
    </AuthShell>
  ),
};

/** A used or aged-out link — never a dead end, it points back to sign-in. */
export const Expired: Story = {
  render: () => (
    <AuthShell role="generic" artefact={<RoleArtefact role="creator" />}>
      <AuthStatus icon={<Clock aria-hidden />} title="This link has expired">
        <p className="text-muted-foreground max-w-[38ch] text-[0.9375rem] leading-[1.5]">
          Links work once and last 24 hours. Sign in with your email — an unverified account offers
          a fresh link.
        </p>
        <Button>Go to sign in →</Button>
      </AuthStatus>
    </AuthShell>
  ),
};

/** New password saved (also the invited Manager's first password). */
export const PasswordSet: Story = {
  render: () => (
    <AuthShell role="generic" artefact={<RoleArtefact role="creator" />}>
      <AuthStatus icon={<Check aria-hidden />} title="Password set">
        <p className="text-muted-foreground max-w-[38ch] text-[0.9375rem] leading-[1.5]">
          You&apos;re all set — sign in with your new password.
        </p>
        <Button>Sign in →</Button>
      </AuthStatus>
    </AuthShell>
  ),
};

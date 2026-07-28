import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ForgotScreen,
  JoinScreen,
  ResetScreen,
  SignInScreen,
  VerifyScreen,
} from "@/features/account-auth";

/**
 * Auth shell ("The Tagged Feed" auth, DESIGN auth.html) — the two-pane world
 * every account screen wears: the role-gradient *artefact* pane beside the
 * light form pane. These stories render the real screens in their entry state
 * (the role deck lives on /join and is interactive here — pick a card). The
 * transient message states (check-email, verified, expired, …) live in the
 * `Auth/Status` stories.
 */
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const meta: Meta = {
  title: "Auth/Shell",
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <QueryClientProvider client={client}>
        {/* Cancel the preview's global p-8 so the shell renders full-bleed. */}
        <div className="-m-8">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj;

/** Registration — the one screen with the dealt-deck role picker (click to swap). */
export const Join: Story = { render: () => <JoinScreen /> };

/** Login — single artefact card, no role picker. */
export const SignIn: Story = { render: () => <SignInScreen /> };

/** The shopper world — gradient and copy swap with the role. */
export const JoinAsShopper: Story = { render: () => <JoinScreen initialRole="shopper" /> };

/** The business world. */
export const JoinAsBusiness: Story = { render: () => <JoinScreen initialRole="business" /> };

/** Forgot password — email in, one reset link out. */
export const Forgot: Story = { render: () => <ForgotScreen /> };

/** Set a new password (also the invited Manager's first password). */
export const Reset: Story = { render: () => <ResetScreen token="demo-token" /> };

/** A verification link with no token — the incomplete-link dead-end recovery. */
export const VerifyIncomplete: Story = { render: () => <VerifyScreen /> };

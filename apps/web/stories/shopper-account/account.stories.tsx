import type { Meta, StoryObj } from "@storybook/react";
import type { AccessibleProfile, YouTubeConnectionView } from "@plugfolio/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AccountPage } from "@/features/shopper-account";

/**
 * /account (DESIGN account.html) — the one settings page every role shares.
 * The sections are identical for everyone; what changes is which role blocks
 * have content and which offer a way in. These stories are the four states
 * that reshape the page: shopper-only, creator, business, and no connection.
 *
 * The top and bottom chrome come from `ShopperShell` in the route, so the
 * stories render the page body alone.
 */
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const PROFILES: readonly AccessibleProfile[] = [
  { id: "p1", username: "mayamoves", role: "admin" },
  { id: "p2", username: "rheamakes", role: "manager" },
];

const CONNECTED: YouTubeConnectionView = {
  connected: true,
  channels: [
    {
      id: "c1",
      title: "Maya Moves",
      handle: "@mayamoves",
      thumbnailUrl: null,
      subscriberCount: 24_100,
    },
  ],
};

const meta: Meta<typeof AccountPage> = {
  title: "Shopper/Account",
  component: AccountPage,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <QueryClientProvider client={client}>
        {/* Cancel the preview's global padding — the page owns its own gutter. */}
        <div className="-m-8">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {
    email: "nia@email.com",
    name: "Nia Okafor",
    image: null,
    handle: "niaeveryday",
    profiles: [],
    maxProfiles: 5,
    business: null,
    youtube: { connected: false },
    connectAction: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof AccountPage>;

/** A shopper: no profiles, no business, nothing connected — both roles invite. */
export const ShopperOnly: Story = {};

/** No social connected: the creator block states the prerequisite, not an error. */
export const NeedsAConnection: Story = {
  args: { youtube: { connected: false } },
};

/** A creator: two profiles (one managed), Google connected, 4 of 5 slots left. */
export const Creator: Story = {
  args: { profiles: PROFILES, youtube: CONNECTED },
};

/** Every hat at once — the page keeps the same shape, block for block. */
export const AllThreeRoles: Story = {
  args: { profiles: PROFILES, business: { name: "Acme" }, youtube: CONNECTED },
};

/** Google connect isn't configured on this server — the row says so. */
export const ConnectNotConfigured: Story = {
  args: { youtube: null },
};

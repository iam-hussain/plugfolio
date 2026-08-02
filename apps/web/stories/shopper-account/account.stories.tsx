import type { Meta, StoryObj } from "@storybook/react";
import type { AccessibleProfile, YouTubeConnectionView } from "@plugfolio/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AccountPage } from "@/features/shopper-account";

/**
 * /account — the one settings page every role shares, as a hero, an index of
 * destinations, and the one you opened.
 *
 * Two shapes from one tree: on a phone the index and the panel take turns
 * (open one, the header and index step aside; "All settings" brings them
 * back); from 900px the index is a rail beside the panel. Resize the preview
 * across 900px — that is the state that reshapes this page most.
 *
 * The rest of the stories are the role combinations, because what changes per
 * account is which index rows carry what value and which role blocks have
 * content: shopper-only, creator, all three, and no connection.
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

/** The phone: the hero, then the index — every destination with its value. Tap
 *  one and it takes the whole screen. */
export const Phone: Story = {
  parameters: { viewport: { defaultViewport: "mobile2" } },
};

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

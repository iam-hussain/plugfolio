import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  CreatorCover,
  CreatorHeader,
  ShareWays,
  ShareWay,
  SocialsRow,
} from "@plugfolio/ui";
import { Link2, QrCode } from "lucide-react";

/**
 * Creator page header (DESIGN creator.html §.ch) — the avatar overlapping the
 * cover band, identity, socials, and the two named share ways.
 *
 * The cover is its own component and sits OUTSIDE the measure, which is what
 * the decorator here reproduces: edge to edge, then everything under it inside
 * 1200px. The header pulls up over it. Rendering the two together put a
 * page-wide band inside a padded container, where it read as a card.
 *
 * The three treatments are the creator's choice (ADR-0017). Compare them here:
 * none of them drops anything, they change how much room identity gets before
 * the goods.
 */
const SOCIALS = [
  { platform: "instagram" as const, href: "https://instagram.com/maya", label: "Instagram" },
  { platform: "youtube" as const, href: "https://youtube.com/@maya", label: "YouTube" },
  { platform: "tiktok" as const, href: "https://tiktok.com/@maya", label: "TikTok" },
  { platform: "website" as const, href: "https://mayarao.co", label: "mayarao.co" },
];

const share = (
  <ShareWays>
    <ShareWay icon={<Link2 />}>Link</ShareWay>
    <ShareWay icon={<QrCode />}>QR</ShareWay>
  </ShareWays>
);

const meta: Meta<typeof CreatorHeader> = {
  title: "Creator page/Header",
  component: CreatorHeader,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story, ctx) => (
      <div className="-m-8">
        <CreatorCover style={ctx.args.style} />
        <div className="max-w-inner mx-auto px-5 lg:px-10">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    handle: "mayamoves",
    displayName: "Maya Rao",
    bio: "Everyday things that actually work — desk, gym, skin, home. Everything in my posts is tagged, so you can just tap it.",
    followers: "48.2K",
    socials: <SocialsRow links={SOCIALS} />,
    share,
    action: <Button>Follow</Button>,
  },
};
export default meta;
type Story = StoryObj<typeof CreatorHeader>;

/** The default: identity, then shelves, then posts. */
export const Balanced: Story = {};

/** Goods first. Everything tightens; nothing is dropped. */
export const Compact: Story = { args: { style: "compact" } };

/** Big avatar, centred. Reads as a profile. */
export const Centred: Story = { args: { style: "centred" } };

/** With the greeting line the creator can set (ADR-0017). */
export const WithGreeting: Story = {
  args: { greeting: "Hey — glad you found me." },
};

/**
 * The owner's view: their two tools where a visitor gets Follow.
 *
 * There used to be a band under this captioned "This is your page — visitors
 * see exactly this", with a second Dashboard button in it. A whole strip of
 * chrome to say what the presence of the tools already says.
 */
export const OwnerView: Story = {
  args: {
    action: (
      <>
        <Button variant="outline">Dashboard</Button>
        <Button>Customise</Button>
      </>
    ),
  },
};

/** No display name, no bio, no socials — a page on its first day. */
export const Bare: Story = {
  args: { displayName: null, bio: null, socials: null, followers: "0" },
};

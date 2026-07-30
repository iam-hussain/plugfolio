import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  CreatorHeader,
  PageBand,
  PageBandText,
  ShareWays,
  ShareWay,
  SocialsRow,
} from "@plugfolio/ui";
import { Link2, QrCode } from "lucide-react";

/**
 * Creator page header (DESIGN creator.html §.ch) — the cover band, the avatar
 * overlapping it, identity, socials, and the two named share ways.
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
  decorators: [(Story) => <div className="-m-8 max-w-inner mx-auto px-5 lg:px-10"><Story /></div>],
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

/** The owner's view: their tools where a visitor gets Follow, plus the band. */
export const OwnerView: Story = {
  args: {
    action: (
      <>
        <Button variant="secondary">Customise</Button>
        <Button>Dashboard</Button>
      </>
    ),
    children: (
      <PageBand>
        <PageBandText title="This is your page">Visitors see exactly this.</PageBandText>
        <Button variant="secondary" size="sm">
          Dashboard
        </Button>
      </PageBand>
    ),
  },
};

/** No display name, no bio, no socials — a page on its first day. */
export const Bare: Story = {
  args: { displayName: null, bio: null, socials: null, followers: "0" },
};

import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  CreatorCover,
  CreatorHeader,
  defaultCoverTreatment,
  SocialsRow,
} from "@plugfolio/ui";

/**
 * Creator page header (v2, ADR-0026) — the square avatar pulled up over the
 * cover, the Sora name with the mono accent greeting under it, bio, the mono
 * handle line, the label-pill links row, and the three counts over a hairline.
 *
 * The cover is its own component: `band` runs edge to edge, `tile` sits inside
 * the measure, `none` is the accent strip compact defaults to. The decorator
 * reproduces each pairing so the pull-up is judged against the real cover.
 */
const SOCIALS = [
  { platform: "instagram" as const, href: "https://instagram.com/maya", label: "Instagram" },
  { platform: "youtube" as const, href: "https://youtube.com/@maya", label: "YouTube" },
  { platform: "website" as const, href: "https://mayarao.co", label: "mayarao.co" },
];

const share = (
  <button
    type="button"
    className="bg-primary text-primary-foreground text-pico tracking-eyebrow rounded-pill inline-flex h-[34px] items-center gap-[7px] px-3.5 font-mono font-bold uppercase"
  >
    Share · QR
  </button>
);

const meta: Meta<typeof CreatorHeader> = {
  title: "Creator page/Header",
  component: CreatorHeader,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story, ctx) => {
      const style = ctx.args.style ?? "balanced";
      const cover = ctx.args.cover ?? defaultCoverTreatment(style);
      return (
        <div className="-m-8 pb-8">
          {cover === "tile" ? (
            <div className="max-w-inner mx-auto px-5 pt-3 lg:px-10">
              <CreatorCover
                treatment="tile"
                tall={style === "centred"}
                badge="126 things live"
              />
            </div>
          ) : (
            <CreatorCover treatment={cover} tall={style === "centred"} greeting="Everything I wear, linked." />
          )}
          <div className="max-w-inner mx-auto px-5 lg:px-10">
            <Story />
          </div>
        </div>
      );
    },
  ],
  args: {
    handle: "mayarao",
    displayName: "Maya Rao",
    bio: "Thrift-first outfits, one honest link per thing. Bengaluru.",
    greeting: "Everything I wear, linked.",
    location: "Bengaluru, IN",
    followers: "82.4k",
    counts: { posts: "48", things: "126" },
    socials: <SocialsRow links={SOCIALS} />,
    share,
  },
};
export default meta;
type Story = StoryObj<typeof CreatorHeader>;

/** The default: identity, then shelves, then posts — over the tile cover. */
export const Balanced: Story = {};

/** Goods first: dense row, counts as one mono line, the accent strip cover. */
export const Compact: Story = { args: { style: "compact" } };

/** Big avatar, centred; reads as a profile. Taller cover. */
export const Centred: Story = { args: { style: "centred" } };

/** The edge-to-edge band cover with its accent baseline. */
export const BandCover: Story = { args: { cover: "band" } };

/** The split cover: the accent "shop window" panel beside the imagery. */
export const SplitCover: Story = { args: { cover: "split" } };

/** The owner's tools where a visitor gets nothing (Follow lives in the nav). */
export const OwnerView: Story = {
  args: {
    action: (
      <>
        <Button variant="secondary">Dashboard</Button>
        <Button>Change the look</Button>
      </>
    ),
  },
};

/** No display name, no bio, no socials — a page on its first day. */
export const Bare: Story = {
  args: {
    displayName: null,
    bio: null,
    greeting: null,
    location: null,
    socials: null,
    share: null,
    followers: "0",
    counts: { posts: "0", things: "0" },
  },
};

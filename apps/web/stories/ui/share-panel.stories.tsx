import type { Meta, StoryObj } from "@storybook/react";
import {
  Panel,
  PanelBody,
  PanelHeader,
  SharePanel,
  ShareCard,
  ShareCopy,
  ShareMode,
  ShareModes,
  SharePlate,
  ShareQr,
  ShareWayTile,
  ShareWaysGrid,
  SocialGlyph,
} from "@plugfolio/ui";
import { Link2, MessageCircle, Share2 } from "lucide-react";

/**
 * The share panel (DESIGN creator.html §.sh) — what a creator sees when they
 * hand their page to someone.
 *
 * Instagram is first on purpose: the bio link is the one that matters, and it's
 * the one that needs the URL on the clipboard first. The unfurl card is built
 * from the page's own avatar, name and counts, so it can't drift from what
 * actually renders when the link is pasted.
 *
 * Share is a modal rather than a drawer: a drawer stands *beside* the page
 * because you're still working on it. Sharing is an errand you finish and
 * leave, so it takes the middle and gives the page back.
 */
const meta = {
  title: "UI Kit/Share panel",
  component: SharePanel,
  parameters: { layout: "centered" },
} satisfies Meta<typeof SharePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const Avatar = () => (
  <span className="bg-active text-primary font-display rounded-pill grid size-8 flex-none place-items-center font-extrabold">
    M
  </span>
);

/** A 21×21 stand-in so the story needs no QR encoder. */
const QrStandIn = () => (
  <svg viewBox="0 0 21 21" className="block w-full" role="img" aria-label="QR code">
    {Array.from({ length: 21 * 21 }, (_, i) => {
      const x = i % 21;
      const y = Math.floor(i / 21);
      const finder = (fx: number, fy: number) =>
        x >= fx &&
        x < fx + 7 &&
        y >= fy &&
        y < fy + 7 &&
        (x === fx ||
          x === fx + 6 ||
          y === fy ||
          y === fy + 6 ||
          (x > fx + 1 && x < fx + 5 && y > fy + 1 && y < fy + 5));
      const on = finder(0, 0) || finder(14, 0) || finder(0, 14) || (x * y) % 5 === 1;
      return on ? <rect key={i} x={x} y={y} width="1" height="1" fill="#12101C" /> : null;
    })}
  </svg>
);

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="border-border bg-card rounded-card w-[380px] max-w-[92vw] overflow-hidden border">
    <Panel>
      <PanelHeader title="Share" />
      <PanelBody>{children}</PanelBody>
    </Panel>
  </div>
);

/** The default: the link, an unfurl preview, and where it can go. */
export const Link: Story = {
  args: { children: null },
  render: () => (
    <Frame>
      <SharePanel>
        <ShareModes>
          <ShareMode selected>Link</ShareMode>
          <ShareMode>QR</ShareMode>
        </ShareModes>
        <SharePlate
          prefix="plugfolio.com/"
          handle="mayamoves"
          action={<ShareCopy>Copy</ShareCopy>}
        />
        <ShareCard avatar={<Avatar />} name="Maya Moves" meta="24 posts · 41 things tagged" />
        <ShareWaysGrid>
          <ShareWayTile icon={<SocialGlyph platform="instagram" />} label="Instagram bio" />
          <ShareWayTile icon={<MessageCircle aria-hidden />} label="Message" />
          <ShareWayTile icon={<Link2 aria-hidden />} label="Copy link" />
          <ShareWayTile icon={<Share2 aria-hidden />} label="More…" full />
        </ShareWaysGrid>
      </SharePanel>
    </Frame>
  ),
};

/** Copied. Lime, because a real thing just happened (§7 lime-means-offer's
 *  sibling rule: lime is a fill under ink, never type). */
export const Copied: Story = {
  args: { children: null },
  render: () => (
    <Frame>
      <SharePanel>
        <ShareModes>
          <ShareMode selected>Link</ShareMode>
          <ShareMode>QR</ShareMode>
        </ShareModes>
        <SharePlate
          prefix="plugfolio.com/"
          handle="mayamoves"
          action={<ShareCopy done>Copied</ShareCopy>}
        />
      </SharePanel>
    </Frame>
  ),
};

/** The code — for a phone held up at a stall, or filmed into a story. The one
 *  share that needs no clipboard at all. */
export const Qr: Story = {
  args: { children: null },
  render: () => (
    <Frame>
      <SharePanel>
        <ShareModes>
          <ShareMode>Link</ShareMode>
          <ShareMode selected>QR</ShareMode>
        </ShareModes>
        <ShareQr note="Point a camera at it — it opens the page.">
          <QrStandIn />
        </ShareQr>
      </SharePanel>
    </Frame>
  ),
};

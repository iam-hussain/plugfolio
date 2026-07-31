import type { Meta, StoryObj } from "@storybook/react";
import {
  BackLink,
  BylineAvatar,
  Button,
  CodeButton,
  CouponBlock,
  CreatorByline,
  DetailSectionHeading,
  MediaSlot,
  OffPlatformNote,
  OwnBadge,
  PostCaption,
  ProductCard,
  ProductList,
} from "@plugfolio/ui";

/**
 * The post view (DESIGN post.html) — the media slot, the compact byline, and
 * the tagged-product cards.
 *
 * The video kinds load as a **facade** (ADR-0019): poster, play control,
 * provider name, and nothing sent to YouTube/Instagram/TikTok until the shopper
 * presses play. Press one here — the iframe only mounts on that press.
 */
const swatch = (hue: string) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><rect width='320' height='320' fill='${hue}'/></svg>`,
  );

const meta: Meta = {
  title: "Post view/Media",
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-[720px]">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj;

/** A photo post — the original case. */
export const Still: Story = {
  render: () => (
    <figure className="m-0">
      <MediaSlot kind="still" poster={swatch("#FFD84D")} alt="A desk flat-lay" />
      <figcaption>
        <PostCaption>
          The desk reset, finally finished. The lamp is the thing that changed the room.
        </PostCaption>
      </figcaption>
    </figure>
  ),
};

/** 16:9 — the aspect is the provider's, not ours. */
export const YouTube: Story = {
  render: () => (
    <MediaSlot
      kind="youtube"
      poster={swatch("#A9D8FF")}
      alt="The desk reset video"
      embedUrl="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
      sourceUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    />
  ),
};

/** 9:16, capped at 420px and centred — a reel left-aligned strands the column. */
export const Reel: Story = {
  render: () => (
    <figure className="m-0">
      <MediaSlot
        kind="instagram"
        poster={swatch("#C9B6FF")}
        alt="The desk reset reel"
        embedUrl="https://www.instagram.com/reel/CxAmPl3/embed/"
        sourceUrl="https://www.instagram.com/reel/CxAmPl3/"
      />
      <figcaption>
        <PostCaption portrait>The caption follows the column, not the measure.</PostCaption>
      </figcaption>
    </figure>
  ),
};

/** No embed URL falls back to the still rather than a broken frame. */
export const VideoWithoutEmbed: Story = {
  render: () => <MediaSlot kind="tiktok" poster={swatch("#96E6BC")} alt="Poster only" />,
};

/** The byline: whose post this is, not the profile. */
export const Byline: Story = {
  render: () => (
    <>
      <BackLink href="#">All of @mayamoves</BackLink>
      <CreatorByline
        avatar={<BylineAvatar initial="M" />}
        name="Maya Rao"
        handle="@mayamoves"
        action={<Button>Follow</Button>}
      />
    </>
  ),
};

/**
 * The four faces of a tagged product (ADR-0011). Note the cards stretch: a
 * card with a coupon is much taller, and the Buy buttons still line up.
 */
export const TaggedProducts: Story = {
  render: () => (
    <>
      <DetailSectionHeading title="In this post" meta="4 products tagged" />
      <ProductList>
        <ProductCard
          image={<img src={swatch("#FFC9DE")} alt="" className="size-full object-cover" />}
          title={<a href="#">Keychron K3 Pro low-profile keyboard</a>}
          price="₹8,499"
          where="affiliate pick · opens Amazon"
          action={<Button variant="action">Buy</Button>}
          note={
            <OffPlatformNote>Payment settles off-platform · opens the retailer</OffPlatformNote>
          }
        />
        <ProductCard
          image={<img src={swatch("#A9D8FF")} alt="" className="size-full object-cover" />}
          title={<a href="#">Everyday white trainers</a>}
          price="₹4,299"
          where="affiliate pick · opens Myntra"
          coupon={
            <CouponBlock channel="Online code" expires="Valid till 31 Aug 2026">
              <CodeButton code="MAYA10" />
              <span className="text-muted-foreground text-micro">10% off</span>
            </CouponBlock>
          }
          action={<Button variant="action">Buy</Button>}
          note={
            <OffPlatformNote>Payment settles off-platform · opens the retailer</OffPlatformNote>
          }
        />
        <ProductCard
          image={<img src={swatch("#96E6BC")} alt="" className="size-full object-cover" />}
          badge={<OwnBadge />}
          title={<a href="#">Maya&apos;s Night Serum</a>}
          price="₹1,250"
          where="their own product · opens mayarao.co"
          action={<Button variant="action">Shop their store</Button>}
          note={<OffPlatformNote>Payment settles off-platform · opens their store</OffPlatformNote>}
        />
        <ProductCard
          image={<img src={swatch("#FFD84D")} alt="" className="size-full object-cover" />}
          title={<a href="#">Steel bottle</a>}
          where="in-store offer · no link to open"
          coupon={
            <CouponBlock
              channel="In-store code"
              note="Show the code at the counter. In-store redemption is not tracked."
            >
              <CodeButton code="COUNTER10" />
            </CouponBlock>
          }
          note={
            <OffPlatformNote>Payment settles off-platform · show the code in store</OffPlatformNote>
          }
        />
      </ProductList>
    </>
  ),
};

import type { Meta, StoryObj } from "@storybook/react";
import type { ShopperPost, ShopperProduct } from "@plugfolio/core";
import { PostGrid } from "@/features/creator-page";

/**
 * Creator page · Shop wall (DESIGN creator.html §.grid) — one grid holding two
 * kinds of tile. A **post** shows how many products are tagged inside it; a
 * **product** the creator shelves directly shows its price. Both answer "what
 * do I get if I tap this", which is the only question a tile is asked.
 *
 * The commercial flags only appear on real data, so they're easy to believe
 * missing. This story is where you check them.
 */
const PHOTO = (hue: string) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='128' height='128' fill='${hue}'/></svg>`,
  );

function product(over: Partial<ShopperProduct> & { id: string; title: string }): ShopperProduct {
  return {
    imageUrl: PHOTO("#C9B6FF"),
    priceCents: 4800,
    currency: "USD",
    kind: "affiliate",
    affiliateUrl: "https://example.com",
    couponCode: null,
    offerEndsAt: null,
    inStoreNote: null,
    categoryId: null,
    ...over,
  };
}

function post(id: string, hue: string, tagged: number): ShopperPost {
  return {
    id,
    mediaUrl: PHOTO(hue),
    mediaKind: "still" as const,
    embedUrl: null,
    sourceUrl: null,
    caption: "A tagged post",
    categoryId: null,
    hiddenAt: null,
    products: Array.from({ length: tagged }, (_unused, index) =>
      product({ id: `${id}-p${index}`, title: `Tagged ${index}` }),
    ),
  };
}

const meta: Meta<typeof PostGrid> = {
  title: "Creator page/Shop grid",
  component: PostGrid,
  parameters: { layout: "padded" },
  args: { handle: "mayamoves" },
};
export default meta;
type Story = StoryObj<typeof PostGrid>;

/** The mixed wall: posts with tag counts beside directly-shelved products. */
export const Mixed: Story = {
  args: {
    posts: [post("1", "#FFD84D", 4), post("2", "#A9D8FF", 3), post("3", "#96E6BC", 6)],
    products: [
      product({ id: "a", title: "Desk lamp" }),
      product({ id: "b", title: "Brightening serum", priceCents: 129900, currency: "INR" }),
    ],
  },
};

/**
 * Every commercial flag at once (§.tile-flag). `own` stacks with an offer —
 * a creator's own product can carry a code too; in-store, live offer and
 * ended are mutually exclusive.
 */
export const ProductFlags: Story = {
  args: {
    posts: [],
    products: [
      product({ id: "plain", title: "No flags — affiliate, price only" }),
      product({
        id: "offer",
        title: "Live coupon",
        couponCode: "SAVE30",
        offerEndsAt: new Date("2099-01-01"),
      }),
      product({ id: "own", title: "Their own", kind: "own" }),
      product({
        id: "own-offer",
        title: "Their own + a code",
        kind: "own",
        couponCode: "MAYA15",
        offerEndsAt: null,
      }),
      product({
        id: "store",
        title: "In-store only — no link to open",
        affiliateUrl: null,
        couponCode: "COUNTER10",
        inStoreNote: "Show the code at the counter. In-store redemption is not tracked.",
      }),
      product({
        id: "ended",
        title: "Offer ended — goes quiet, product stays",
        couponCode: "WINTER20",
        offerEndsAt: new Date("2020-01-01"),
      }),
      product({ id: "nofprice", title: "Unknown price — no chip, never a zero", priceCents: null }),
    ],
  },
};

/**
 * The creator's three layouts (ADR-0017). `grid` is the default tight wall;
 * `cards` and `list` are the ones with room for the title and the action word,
 * which is why that copy lives in the component rather than on the tile.
 */
const MIXED = {
  posts: [post("1", "#FFD84D", 4), post("2", "#A9D8FF", 3)],
  products: [
    product({ id: "a", title: "Desk lamp" }),
    product({
      id: "b",
      title: "Brightening serum",
      couponCode: "SAVE30",
      offerEndsAt: new Date("2099-01-01"),
    }),
    product({
      id: "c",
      title: "Steel bottle",
      affiliateUrl: null,
      couponCode: "COUNTER10",
      inStoreNote: "Show the code at the counter. In-store redemption is not tracked.",
    }),
  ],
};

export const LayoutCards: Story = { args: { ...MIXED, layout: "cards" } };
export const LayoutList: Story = { args: { ...MIXED, layout: "list" } };

/** Nothing shelved yet. */
export const Empty: Story = { args: { posts: [], products: [] } };

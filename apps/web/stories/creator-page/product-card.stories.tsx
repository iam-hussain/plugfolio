import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ShopperProduct } from "@plugfolio/core";
import { TaggedProductCard } from "@/features/creator-page";

/**
 * Creator page · Product card — the three faces (ADR-0011): affiliate (Buy),
 * the creator's own product (Shop their store), and either with a coupon
 * riding along. Every card is outbound; never a cart or checkout.
 */
// A violet placeholder swatch (data URI — no network needed in the gallery).
const PHOTO =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='128' height='128' fill='#7C3AED'/></svg>",
  );

const base: ShopperProduct = {
  id: "p1",
  title: "Merino knit throw",
  imageUrl: PHOTO,
  priceCents: 320000,
  currency: "INR",
  kind: "affiliate",
  affiliateUrl: "https://store.example.com/knit-throw",
  couponCode: null,
  offerEndsAt: null,
  inStoreNote: null,
  categoryId: null,
};

function product(overrides: Partial<ShopperProduct>): ShopperProduct {
  return { ...base, ...overrides };
}

const client = new QueryClient();

const meta: Meta<typeof TaggedProductCard> = {
  title: "Creator page/Product card",
  component: TaggedProductCard,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <QueryClientProvider client={client}>
        <div className="w-[360px] max-w-full">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof TaggedProductCard>;

export const Affiliate: Story = {
  args: { handle: "ana", postId: "post1", product: base },
};

export const OwnProduct: Story = {
  args: {
    handle: "ana",
    postId: "post1",
    product: product({ title: "Studio tote — sand", priceCents: 190000, kind: "own" }),
  },
};

export const WithCoupon: Story = {
  args: {
    handle: "ana",
    postId: "post1",
    product: product({
      title: "Ceramic mug set",
      priceCents: 145000,
      couponCode: "ANA15",
      offerEndsAt: new Date("2099-08-03"),
    }),
  },
};

export const InStoreCouponOnly: Story = {
  args: {
    handle: "ana",
    postId: "post1",
    product: product({
      title: "Filter coffee kit",
      affiliateUrl: null,
      couponCode: "SHOP10",
      inStoreNote: "Show this at the counter — Indiranagar store",
    }),
  },
};

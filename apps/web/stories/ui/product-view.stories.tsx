import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  CodeButton,
  CouponBlock,
  OffPlatformNote,
  OwnBadge,
  ProductBuy,
  ProductDetail,
  ProductGone,
  ProductInStoreNote,
  ProductMedia,
  ProductPrice,
  ProductSource,
  ProductTitle,
  ProductWhere,
} from "@plugfolio/ui";

/**
 * The product view (DESIGN product.html) — one thing, in detail, with a way
 * back. ADR-0011's three faces plus the two that aren't a "kind" at all: a
 * product with no image, and a product that has gone.
 */
const swatch = (hue: string) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='600' height='600' fill='${hue}'/></svg>`,
  );

const photo = (hue: string) => (
  <img src={swatch(hue)} alt="" className="block aspect-square w-full object-cover" />
);

const meta: Meta = {
  title: "Product view/Detail",
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="max-w-inner mx-auto"><Story /></div>],
};
export default meta;
type Story = StoryObj;

/** Affiliate, no coupon — the plain case. */
export const Affiliate: Story = {
  render: () => (
    <ProductDetail>
      <ProductMedia>{photo("#A9D8FF")}</ProductMedia>
      <div>
        <ProductTitle>Keychron K3 Pro low-profile keyboard</ProductTitle>
        <ProductPrice>₹8,499</ProductPrice>
        <ProductWhere>
          <b>Affiliate pick</b> · opens Amazon
        </ProductWhere>
        <ProductBuy>
          <Button variant="action">Buy</Button>
        </ProductBuy>
        <OffPlatformNote>Payment settles off-platform · opens the retailer</OffPlatformNote>
        <ProductSource href="#" title="Open the post" thumb={photo("#FFD84D")} />
      </div>
    </ProductDetail>
  ),
};

/** The creator's own product — marked, and the action word changes with it. */
export const TheirOwn: Story = {
  render: () => (
    <ProductDetail>
      <ProductMedia>{photo("#96E6BC")}</ProductMedia>
      <div>
        <OwnBadge>Their own product</OwnBadge>
        <ProductTitle>Maya&apos;s Night Serum</ProductTitle>
        <ProductPrice>₹1,250</ProductPrice>
        <ProductWhere>
          <b>Their own product</b> · opens mayarao.co
        </ProductWhere>
        <CouponBlock channel="Online code" expires="Valid till 31 Aug 2026">
          <CodeButton code="MAYA30" />
          <span className="text-muted-foreground text-micro">30% off, applied at checkout</span>
        </CouponBlock>
        <ProductBuy>
          <Button variant="action">Shop their store</Button>
        </ProductBuy>
        <OffPlatformNote>Payment settles off-platform · opens their store</OffPlatformNote>
      </div>
    </ProductDetail>
  ),
};

/** In-store only: no link, so no button. The code IS the action, and it says so. */
export const InStoreOnly: Story = {
  render: () => (
    <ProductDetail>
      <ProductMedia>{photo("#FFC9DE")}</ProductMedia>
      <div>
        <ProductTitle>Steel bottle</ProductTitle>
        <ProductPrice>₹890</ProductPrice>
        <ProductWhere>
          <b>In-store offer</b> · no link, use the code
        </ProductWhere>
        <CouponBlock
          channel="In-store code"
          note="Show the code at the counter. In-store redemption is not tracked."
        >
          <CodeButton code="COUNTER10" />
        </CouponBlock>
        <ProductInStoreNote>
          Show the code at the counter. We can&apos;t track in-store redemption, so this one is on
          trust.
        </ProductInStoreNote>
        <OffPlatformNote>Payment settles off-platform · show the code in store</OffPlatformNote>
      </div>
    </ProductDetail>
  ),
};

/**
 * No image, and no price. A product with neither is **not broken** — plenty of
 * retailers give neither — so the page still hands over everything it has.
 */
export const NoImageNoPrice: Story = {
  render: () => (
    <ProductDetail>
      <ProductMedia />
      <div>
        <ProductTitle>Brass task lamp</ProductTitle>
        <ProductPrice>{null}</ProductPrice>
        <ProductWhere>
          <b>Affiliate pick</b> · opens the retailer
        </ProductWhere>
        <ProductBuy>
          <Button variant="action">Buy</Button>
        </ProductBuy>
        <OffPlatformNote>
          Price swings a lot on this one, so check it before you tap.
        </OffPlatformNote>
      </div>
    </ProductDetail>
  ),
};

/**
 * Gone. Not a generic 404 — the shopper arrived from a real post or a shared
 * link, so the page says what happened and hands them back to the creator.
 */
export const Gone: Story = {
  render: () => (
    <ProductGone action={<Button variant="secondary">See everything @mayamoves tagged</Button>}>
      The creator removed it, or the retailer pulled the listing. Their other picks are all still
      here.
    </ProductGone>
  ),
};

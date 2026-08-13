import { ImageResponse } from "next/og";
import { getShopperProduct } from "@plugfolio/core";
import { brand } from "@plugfolio/tokens";
import { formatPrice } from "@/lib/format-price";
import { ogFonts, ogGround, ogImageData, OgChip, OgLockup, OG_SIZE } from "@/lib/og";
import { repositories } from "@/server/container";

/**
 * A product's share card (og:image, 1200×630): the product image on the left,
 * title, price and the tagging creator on the right. The one claim the card
 * makes is the one the page keeps: the buy happens at the retailer.
 */
export const alt = "A product tagged on Plugfolio — buy it straight at the retailer.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ handle: string; productId: string }>;
}) {
  const { handle, productId } = await params;
  const product = await getShopperProduct(
    { creatorPages: repositories.creatorPages },
    handle,
    productId,
  );
  const fonts = await ogFonts();
  const image = await ogImageData(product?.imageUrl);
  const price = product ? formatPrice(product.priceCents, product.currency) : null;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: ogGround,
        fontFamily: "Inter",
      }}
    >
      {image ? (
        <div style={{ display: "flex", padding: 44 }}>
          <img
            alt=""
            src={image}
            width={472}
            height={542}
            style={{ objectFit: "cover", borderRadius: 26, background: "#FFFFFF" }}
          />
        </div>
      ) : (
        <div style={{ display: "flex", padding: 44 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 472,
              height: 542,
              borderRadius: 26,
              background: brand.violetWash,
              color: brand.violet,
              fontFamily: "Sora",
              fontSize: 140,
            }}
          >
            {(product?.title ?? "?").slice(0, 1).toUpperCase()}
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          padding: "52px 56px 52px 12px",
        }}
      >
        <OgLockup mark={40} word={30} />

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontFamily: "Sora",
              fontSize: 50,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              maxHeight: 220,
              overflow: "hidden",
            }}
          >
            {product?.title ?? "A tagged product"}
          </div>
          {price ? (
            <div style={{ display: "flex", fontFamily: "Sora", fontSize: 44, color: brand.lime }}>
              {price}
            </div>
          ) : null}
          <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,0.72)" }}>
            {`tagged by @${handle}`}
          </div>
        </div>

        <OgChip>BUY AT THE RETAILER — NO ACCOUNT NEEDED</OgChip>
      </div>
    </div>,
    { ...size, fonts: [...fonts] },
  );
}

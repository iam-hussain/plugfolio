import { ImageResponse } from "next/og";
import { getShopperPost } from "@plugfolio/core";
import { brand } from "@plugfolio/tokens";
import { ogFonts, ogGround, ogImageData, OgChip, OgLockup, OG_SIZE } from "@/lib/og";
import { repositories } from "@/server/container";

/**
 * A post's share card (og:image, 1200×630): the post media on the left, the
 * caption, byline and tagged-product count on the right. The media leads —
 * the post IS the picture — with the branded frame carrying the promise.
 */
export const alt = "A shoppable creator post on Plugfolio — tap any tag to buy at the retailer.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ handle: string; postId: string }>;
}) {
  const { handle, postId } = await params;
  const post = await getShopperPost({ creatorPages: repositories.creatorPages }, handle, postId);
  const fonts = await ogFonts();
  const media = await ogImageData(post?.mediaUrl);
  const count = post?.products.length ?? 0;

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
      {media ? (
        <img alt="" src={media} width={560} height={630} style={{ objectFit: "cover" }} />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 560,
            height: 630,
            background: brand.violet,
            color: "#FFFFFF",
            fontFamily: "Sora",
            fontSize: 120,
          }}
        >
          @
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          padding: "52px 56px",
        }}
      >
        <OgLockup mark={40} word={30} />

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontFamily: "Sora",
              fontSize: 46,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
              lineHeight: 1.12,
              maxHeight: 210,
              overflow: "hidden",
            }}
          >
            {post?.caption ?? "A shoppable post"}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: brand.lime }}>{`@${handle}`}</div>
          {count > 0 ? (
            <div style={{ display: "flex", fontSize: 24, color: "rgba(255,255,255,0.72)" }}>
              {`${count} product${count === 1 ? "" : "s"} tagged in this post`}
            </div>
          ) : null}
        </div>

        <OgChip>TAP A TAG · BUY AT THE RETAILER</OgChip>
      </div>
    </div>,
    { ...size, fonts: [...fonts] },
  );
}

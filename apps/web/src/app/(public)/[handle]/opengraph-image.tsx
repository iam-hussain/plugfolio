import { ImageResponse } from "next/og";
import { getCreatorPage } from "@plugfolio/core";
import { brand } from "@plugfolio/tokens";
import { ogFonts, ogGround, ogImageData, OgChip, OgLockup, OG_SIZE } from "@/lib/og";
import { SITE_URL } from "@/lib/site";
import { repositories } from "@/server/container";

/**
 * The creator page's share card (og:image, 1200×630): avatar, public name,
 * @handle, the post/product counts, and the no-account promise. Identity beats
 * a random post still when a profile link is shared, so this is generated —
 * the post/product routes carry their own media-led cards.
 */
export const alt = "Shop this creator's posts on Plugfolio — no account needed.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const page = await getCreatorPage({ creatorPages: repositories.creatorPages }, handle);
  const fonts = await ogFonts();
  const avatar = await ogImageData(page?.avatarUrl);
  const name = page ? (page.displayName ?? `@${page.username}`) : `@${handle}`;
  const username = page?.username ?? handle;
  const host = SITE_URL.replace(/^https?:\/\//, "");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 72px",
        background: ogGround,
        fontFamily: "Inter",
      }}
    >
      <OgLockup />

      <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
        {avatar ? (
          <img
            alt=""
            src={avatar}
            width={220}
            height={220}
            style={{
              borderRadius: 999,
              objectFit: "cover",
              borderWidth: 6,
              borderStyle: "solid",
              borderColor: brand.violet,
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 220,
              height: 220,
              borderRadius: 999,
              background: brand.violet,
              color: "#FFFFFF",
              fontFamily: "Sora",
              fontSize: 96,
            }}
          >
            {username.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 760 }}>
          <div
            style={{
              fontFamily: "Sora",
              fontSize: 72,
              color: "#FFFFFF",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
            }}
          >
            {name}
          </div>
          <div style={{ display: "flex", fontSize: 32, color: brand.lime }}>
            {`${host}/${username}`}
          </div>
          {page ? (
            <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,0.72)" }}>
              {`${page.posts.length} shoppable post${page.posts.length === 1 ? "" : "s"} · ${page.followerCount} follower${page.followerCount === 1 ? "" : "s"}`}
            </div>
          ) : null}
        </div>
      </div>

      <OgChip>SHOP THEIR POSTS — NO ACCOUNT NEEDED</OgChip>
    </div>,
    { ...size, fonts: [...fonts] },
  );
}

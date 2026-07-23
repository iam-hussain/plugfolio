import { hashPassword } from "@plugfolio/core";
import { PrismaClient } from "@prisma/client";

/**
 * Dev seed — a minimal working graph so `pnpm dev` shows a real creator page
 * with a tappable product. Idempotent via upserts so it can be re-run. Uses
 * fixed UUIDs so links are stable across reseeds.
 *
 * v1 handles no money (§2.3): the product points at the creator's own affiliate
 * URL; nothing here charges anyone.
 */
const prisma = new PrismaClient();

const ACCOUNT_ID = "00000000-0000-0000-0000-0000000000a1";
const PROFILE_ID = "00000000-0000-0000-0000-0000000000b1";
const PRODUCT_ID = "00000000-0000-0000-0000-0000000000c1";
const POST_TAGGED_ID = "00000000-0000-0000-0000-0000000000d1";
const POST_UNTAGGED_ID = "00000000-0000-0000-0000-0000000000d2";
const CATEGORY_ID = "00000000-0000-0000-0000-0000000000c9";

async function main() {
  // Verified + password so `creator@example.com` / `password123` logs in for dev.
  const creatorAuth = { passwordHash: hashPassword("password123"), emailVerified: new Date() };
  await prisma.user.upsert({
    where: { id: ACCOUNT_ID },
    update: creatorAuth,
    create: { id: ACCOUNT_ID, email: "creator@example.com", username: "maya", ...creatorAuth },
  });

  // A connected social (Auth.js Account row) — profile creation requires one
  // (ADR-0004); real Google/Meta rows appear via OAuth once apps are configured.
  await prisma.account.upsert({
    where: {
      provider_providerAccountId: { provider: "google", providerAccountId: "seed-google-lena" },
    },
    update: {},
    create: {
      userId: ACCOUNT_ID,
      type: "oauth",
      provider: "google",
      providerAccountId: "seed-google-lena",
    },
  });

  await prisma.profile.upsert({
    where: { id: PROFILE_ID },
    update: {},
    create: { id: PROFILE_ID, username: "lena", userId: ACCOUNT_ID },
  });

  // One shelf (ADR-0010) so the public page shows a chips row in dev.
  await prisma.category.upsert({
    where: { id: CATEGORY_ID },
    update: {},
    create: {
      id: CATEGORY_ID,
      profileId: PROFILE_ID,
      title: "Everyday carry",
      description: "The bag and the bits that live in it.",
    },
  });

  await prisma.product.upsert({
    where: { id: PRODUCT_ID },
    update: { categoryId: CATEGORY_ID, imageUrl: "/images/products-sample/product-00001.jpg" },
    create: {
      id: PRODUCT_ID,
      profileId: PROFILE_ID,
      categoryId: CATEGORY_ID,
      title: "Everyday Tote",
      affiliateUrl: "https://example.com/affiliate/everyday-tote",
      imageUrl: "/images/products-sample/product-00001.jpg",
      priceCents: 4900,
      currency: "usd",
    },
  });

  // An own-product with a both-channel coupon (ADR-0011) so the card variants
  // render in dev: "Their own product" tag + code chip + in-store line.
  const OWN_PRODUCT_ID = "00000000-0000-0000-0000-0000000000c2";
  await prisma.product.upsert({
    where: { id: OWN_PRODUCT_ID },
    update: { imageUrl: "/images/products-sample/product-00002.jpg" },
    create: {
      id: OWN_PRODUCT_ID,
      profileId: PROFILE_ID,
      kind: "own",
      title: "Lena's Desk Mat",
      imageUrl: "/images/products-sample/product-00002.jpg",
      affiliateUrl: "https://lena.example.com/shop/desk-mat",
      couponCode: "LENA15",
      inStoreNote: "Show this code at the Indiranagar studio store",
      priceCents: 2400,
      currency: "usd",
    },
  });

  // One post with the product tagged (the shoppable path) and one without
  // (grid must render untagged posts too).
  await prisma.post.upsert({
    where: { id: POST_TAGGED_ID },
    update: {
      products: { connect: [{ id: PRODUCT_ID }, { id: OWN_PRODUCT_ID }] },
      categoryId: CATEGORY_ID,
      mediaUrl: "/images/products-sample/product-00005.jpg",
    },
    create: {
      id: POST_TAGGED_ID,
      profileId: PROFILE_ID,
      categoryId: CATEGORY_ID,
      mediaUrl: "/images/products-sample/product-00005.jpg",
      caption: "Morning routine",
      products: { connect: [{ id: PRODUCT_ID }, { id: OWN_PRODUCT_ID }] },
    },
  });

  await prisma.post.upsert({
    where: { id: POST_UNTAGGED_ID },
    update: { mediaUrl: "/images/products-sample/product-00006.jpg" },
    create: {
      id: POST_UNTAGGED_ID,
      profileId: PROFILE_ID,
      mediaUrl: "/images/products-sample/product-00006.jpg",
      caption: "Beach day",
    },
  });

  const BIZ_USER_ID = "00000000-0000-0000-0000-0000000000e1";
  const BUSINESS_ID = "00000000-0000-0000-0000-0000000000f1";
  const REQUIREMENT_ID = "00000000-0000-0000-0000-0000000000f2";

  await prisma.user.upsert({
    where: { id: BIZ_USER_ID },
    update: {},
    create: { id: BIZ_USER_ID, email: "business@example.com", username: "verve-gear" },
  });

  await prisma.business.upsert({
    where: { id: BUSINESS_ID },
    update: {},
    create: {
      id: BUSINESS_ID,
      userId: BIZ_USER_ID,
      name: "Verve Gear",
      description: "Everyday carry goods",
    },
  });

  await prisma.requirement.upsert({
    where: { id: REQUIREMENT_ID },
    update: {},
    create: {
      id: REQUIREMENT_ID,
      businessId: BUSINESS_ID,
      title: "30s reel featuring our tote",
      brief: "One short-form reel showing the tote in a daily routine. We ship the product.",
      budget: "$150–300",
    },
  });

  console.log(
    "Seeded: @lena (2 posts, 1 tagged product) + Verve Gear with 1 open requirement. Visit /lena",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

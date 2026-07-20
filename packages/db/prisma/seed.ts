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

async function main() {
  await prisma.user.upsert({
    where: { id: ACCOUNT_ID },
    update: {},
    create: { id: ACCOUNT_ID, email: "creator@example.com" },
  });

  await prisma.profile.upsert({
    where: { id: PROFILE_ID },
    update: {},
    create: { id: PROFILE_ID, username: "lena", userId: ACCOUNT_ID },
  });

  await prisma.product.upsert({
    where: { id: PRODUCT_ID },
    update: {},
    create: {
      id: PRODUCT_ID,
      profileId: PROFILE_ID,
      title: "Everyday Tote",
      affiliateUrl: "https://example.com/affiliate/everyday-tote",
      imageUrl: "https://example.com/images/everyday-tote.jpg",
      priceCents: 4900,
      currency: "usd",
    },
  });

  // One post with the product tagged (the shoppable path) and one without
  // (grid must render untagged posts too).
  await prisma.post.upsert({
    where: { id: POST_TAGGED_ID },
    update: { products: { connect: { id: PRODUCT_ID } } },
    create: {
      id: POST_TAGGED_ID,
      profileId: PROFILE_ID,
      mediaUrl: "https://example.com/media/morning-routine.jpg",
      caption: "Morning routine",
      products: { connect: { id: PRODUCT_ID } },
    },
  });

  await prisma.post.upsert({
    where: { id: POST_UNTAGGED_ID },
    update: {},
    create: {
      id: POST_UNTAGGED_ID,
      profileId: PROFILE_ID,
      mediaUrl: "https://example.com/media/beach-day.jpg",
      caption: "Beach day",
    },
  });

  const BIZ_USER_ID = "00000000-0000-0000-0000-0000000000e1";
  const BUSINESS_ID = "00000000-0000-0000-0000-0000000000f1";
  const REQUIREMENT_ID = "00000000-0000-0000-0000-0000000000f2";

  await prisma.user.upsert({
    where: { id: BIZ_USER_ID },
    update: {},
    create: { id: BIZ_USER_ID, email: "business@example.com" },
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

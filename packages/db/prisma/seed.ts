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
  await prisma.account.upsert({
    where: { id: ACCOUNT_ID },
    update: {},
    create: { id: ACCOUNT_ID, email: "creator@example.com" },
  });

  await prisma.profile.upsert({
    where: { id: PROFILE_ID },
    update: {},
    create: { id: PROFILE_ID, username: "lena", accountId: ACCOUNT_ID },
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

  console.log("Seeded: @lena with 2 posts, 1 tagged product. Visit /lena");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

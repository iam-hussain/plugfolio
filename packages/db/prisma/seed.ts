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
    },
  });

  console.log("Seeded: @lena with 1 product. Visit /lena");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

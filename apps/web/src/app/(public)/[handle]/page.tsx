import type { Metadata } from "next";
import { CreatorHeader } from "@/features/creator-page";

// The no-login shopper surface (ADR-0002). Server Component for fast, indexable
// pages that behave inside in-app browsers (§5, ADR-0001).
type Params = { handle: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { handle } = await params;
  return { title: `@${handle}` };
}

export default async function CreatorPage({ params }: { params: Promise<Params> }) {
  const { handle } = await params;

  return (
    <main className="mx-auto max-w-md px-4">
      <CreatorHeader handle={handle} />
      <p className="text-muted-foreground py-12 text-center text-sm">
        Tagged posts and products render here — no account needed to shop.
      </p>
    </main>
  );
}

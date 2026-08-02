import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getWatchlist } from "@plugfolio/core";
import { WatchlistPage } from "@/features/shopper-account";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";

// The shopper's own shelf: the posts and products they saved, each still
// carrying the creator who tagged it. Gated like /following — saving is an
// "act as yourself" action; shopping never routes here (§2.2).
export const metadata: Metadata = { title: "Saved" };

export default async function WatchlistRoute() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const items = await getWatchlist({ watchlist: repositories.watchlist }, session.user.id);

  return <WatchlistPage items={items} />;
}

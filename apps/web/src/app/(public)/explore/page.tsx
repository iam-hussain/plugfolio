import type { Metadata } from "next";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@plugfolio/ui";
import { GridIcon } from "@/components/chrome/icons";

// A static `explore` segment takes precedence over the `[handle]` route.
// Discovery search is [LATER] (Dev Spec §06); this is the framed placeholder
// that keeps the SHOP tab and top-bar search live — and never walls shopping.
export const metadata: Metadata = { title: "Explore" };

export default function ExplorePage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <p className="text-primary tracking-eyebrow font-mono text-[11px] uppercase">Explore</p>
      <h1 className="font-display tracking-display mt-2 text-2xl font-semibold">Find creators</h1>
      <Empty className="mt-8">
        <EmptyHeader>
          <div className="bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-lg">
            <GridIcon className="h-6 w-6" />
          </div>
          <EmptyTitle>Search is coming soon</EmptyTitle>
          <EmptyDescription>
            For now, open a creator&rsquo;s link to shop their posts — no account needed.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </main>
  );
}

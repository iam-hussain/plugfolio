"use client";

import type { PageAccent, PageGridStyle, PageHeaderStyle } from "@plugfolio/core";
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@plugfolio/ui";
import { Sliders } from "lucide-react";
// The leaf, not the product-tagging barrel — the barrel also pulls in
// DashboardShell → @plugfolio/core, which drags node:crypto into this client
// bundle and fails the build on every page that renders the drawer.
import { PageAppearanceForm } from "@/features/product-tagging/components/page-appearance-form";

/**
 * The owner's in-page customiser (DESIGN creator.html #czSheet; ADR-0017): a
 * side drawer that opens OVER the live page, so the creator sees each change
 * land exactly where their visitors will — the page IS the preview. The
 * controls are the closed appearance set (accent, header, grid, greeting);
 * nothing here can pick a value that breaks the buy path. Admin-only, and the
 * page only mounts it for the owner.
 */
export type CustomiseDrawerProps = {
  profileId: string;
  appearance: {
    accent: PageAccent;
    headerStyle: PageHeaderStyle;
    gridStyle: PageGridStyle;
    greeting: string | null;
  };
  role: "admin" | "manager";
};

export function CustomiseDrawer({ profileId, appearance, role }: CustomiseDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" className="rounded-pill px-6">
          <Sliders className="size-4" aria-hidden />
          Customise
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-[420px]">
        <SheetHeader className="border-border border-b">
          <SheetTitle className="font-display text-lg font-bold tracking-[-0.02em]">
            Customise
          </SheetTitle>
          <SheetDescription>
            Every change lands live on the page behind this — the way visitors see it.
          </SheetDescription>
        </SheetHeader>
        {/* The form drives the save + router.refresh(), so the page updates in
            place while the drawer stays open. */}
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          <PageAppearanceForm profileId={profileId} appearance={appearance} role={role} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

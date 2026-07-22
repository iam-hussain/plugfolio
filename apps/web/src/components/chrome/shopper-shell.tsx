import * as React from "react";
import { AppTopBar } from "./app-top-bar";
import { ShopperTabBar } from "./shopper-tab-bar";

/**
 * The frame every public shopper screen sits inside (Dev Spec §03): the app top
 * bar above, the shopper bottom tab bar below, content between. Presets and
 * mockups inherit this chrome — screens never invent their own header/footer.
 */
export function ShopperShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppTopBar />
      <div className="flex-1">{children}</div>
      <ShopperTabBar />
    </div>
  );
}

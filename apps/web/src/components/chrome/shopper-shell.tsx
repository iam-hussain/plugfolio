import * as React from "react";
import { AppTopBar } from "./app-top-bar";
import { PillNav, PillNavProvider } from "./pill-nav";

/**
 * The frame every public shopper screen sits inside (v2, ADR-0026): the app
 * top bar above, the floating morphing pill nav below, content between. The
 * bottom padding is the pill's flight path — content must never end underneath
 * it. The site footer is no longer part of the shell: v2 carries it only on
 * the marketing landing, which renders it directly.
 */
export function ShopperShell({ children }: { children: React.ReactNode }) {
  return (
    <PillNavProvider>
      <div className="flex min-h-dvh flex-col">
        <AppTopBar />
        <div className="flex-1 pb-28">{children}</div>
        <PillNav />
      </div>
    </PillNavProvider>
  );
}

/**
 * Persistent chrome (v2, ADR-0026) — the top bar, the morphing pill nav and
 * the landing footer that wrap every screen. Product-agnostic, so it lives in
 * components/.
 */
export { AppTopBar } from "./app-top-bar";
export { PAGE_CONTEXT_SLOT } from "./page-context-slot";
export {
  PillNav,
  PillNavDivider,
  PillNavOverride,
  PillNavProvider,
  pillNavAction,
  pillNavActionQuiet,
  pillNavCircle,
} from "./pill-nav";
export { ShopperShell } from "./shopper-shell";
export { SiteFooter, type SiteFooterProps } from "./site-footer";

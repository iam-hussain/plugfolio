/** Public surface of the shared UI kit — every shadcn component + cn + brand. */
export { cn } from "./lib/cn";
// Brand mark & lockups (Brand Guidelines v1.1) — never redrawn, always reused.
export { PlugMark, type PlugMarkProps } from "./brand/plug-mark";
export { Wordmark, type WordmarkProps } from "./brand/wordmark";
export { Logo, type LogoProps } from "./brand/logo";
export { SystemMark, type SystemMarkProps } from "./brand/system-mark";
export * from "./components/accordion";
export * from "./components/alert-dialog";
export * from "./components/alert";
export * from "./components/aspect-ratio";
export * from "./components/attachment";
export * from "./components/avatar";
export * from "./components/badge";
export * from "./components/breadcrumb";
export * from "./components/bubble";
export * from "./components/button-group";
export * from "./components/button";
export * from "./components/calendar";
export * from "./components/card";
export * from "./components/carousel";
export * from "./components/chart";
export * from "./components/action-form";
export * from "./components/checkbox";
export * from "./components/confirm-button";
export * from "./components/confirm-dialog";
export * from "./components/page-header";
export * from "./components/pager";
export * from "./components/search-field";
export * from "./components/theme-toggle";
export * from "./components/collapsible";
export * from "./components/combobox";
export * from "./components/command";
export * from "./components/context-menu";
export * from "./components/dialog";
export * from "./components/direction";
export * from "./components/drawer";
export * from "./components/dropdown-menu";
export * from "./components/empty";
export * from "./components/field";
export * from "./components/form";
export * from "./components/hover-card";
export * from "./components/input-group";
export * from "./components/input-otp";
export * from "./components/input";
export * from "./components/item";
export * from "./components/kbd";
export * from "./components/label";
export * from "./components/marker";
export * from "./components/menubar";
export * from "./components/message-scroller";
export * from "./components/message";
export * from "./components/native-select";
export * from "./components/navigation-menu";
export * from "./components/pagination";
export * from "./components/popover";
export * from "./components/progress";
export * from "./components/prompt-dialog";
export * from "./components/radio-group";
export * from "./components/resizable";
export * from "./components/scroll-area";
export * from "./components/select";
export * from "./components/separator";
export * from "./components/sheet";
export * from "./components/sidebar";
export * from "./components/collab-thread";
export * from "./components/skeleton";
export * from "./components/system-screen";
export * from "./components/slider";
export * from "./components/sonner";
export * from "./components/spinner";
export * from "./components/product-tag";
export * from "./components/stat-tile";
export * from "./components/tile";
export * from "./components/switch";
export * from "./components/table";
export * from "./components/tabs";
export * from "./components/textarea";
export * from "./components/toggle-group";
export * from "./components/toggle";
export * from "./components/tooltip";

// ── The design system (ADR-0018) ───────────────────────────────────────────
// Shared visual components lifted out of the design workspace, page by page.
// They know shapes, never sources: data arrives as props, interactivity as
// slots, so a Server Component can render them.
export * from "./components/creator-header";
export * from "./components/socials-row";
export * from "./components/share-ways";
export * from "./components/shelf-chips";
export * from "./components/page-band";
export * from "./components/empty-state";
export * from "./components/comment";
// Post + product views (DESIGN post.html / product.html) — the five components
// the two detail pages share, plus the media slot and the product card.
export * from "./components/media-slot";
export * from "./components/detail-page";
export * from "./components/coupon";
export * from "./components/product-card";
export * from "./components/product-detail";
// Explore (DESIGN explore.html) — the fan, the wall, the things grid.
export * from "./components/explore";
export * from "./components/ad-slot";
// Account settings (DESIGN account.html) — the one page every role shares.
export * from "./components/account";
// Following (DESIGN following.html) — the list, never a feed.
export * from "./components/following";
// Auth (DESIGN auth.html) — one narrow column, one action, one consequence.
export * from "./components/auth-form";
// Support (DESIGN support.html) — make the wait legible.
export * from "./components/support-form";
// Marketing (DESIGN how-it-works / for-creators / for-business).
export * from "./components/marketing";
// Panels + share (DESIGN creator.html §.pn / §.sh) — what goes inside a Sheet.
export * from "./components/panel";
export * from "./components/share-panel";

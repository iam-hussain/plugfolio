import { ShopperShell } from "@/components/chrome";

/**
 * Shopper-account surfaces (/following, /account) share the same persistent
 * chrome as the public creator pages (Dev Spec §03).
 */
export default function ShopperLayout({ children }: { children: React.ReactNode }) {
  return <ShopperShell>{children}</ShopperShell>;
}

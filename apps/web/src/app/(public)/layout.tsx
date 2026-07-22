import { ShopperShell } from "@/components/chrome";

/**
 * Public shopper surfaces (creator page, post, product) always carry the
 * persistent chrome (Dev Spec §03) — top bar + bottom tab bar. The buy path is
 * never walled here.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <ShopperShell>{children}</ShopperShell>;
}

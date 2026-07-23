import type { Metadata } from "next";
import type { ReactNode } from "react";

// Auth screens render their own AuthShell; this layout only keeps the utility
// pages out of search indexes (they're doors, not destinations).
export const metadata: Metadata = { robots: { index: false } };

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}

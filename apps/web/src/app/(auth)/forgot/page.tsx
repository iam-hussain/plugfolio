import type { Metadata } from "next";
import { ForgotScreen } from "@/features/account-auth";

// Forgot password (brief 04, ADR-0012) — the only other email moment.
export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPage() {
  return <ForgotScreen />;
}

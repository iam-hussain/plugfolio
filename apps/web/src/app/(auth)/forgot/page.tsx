import type { Metadata } from "next";
import { ForgotForm } from "@/features/account-auth";

// Forgot password (brief 04, ADR-0012) — the only other email moment.
export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPage() {
  return (
    <>
      <h1 className="pb-4 text-lg font-medium">Forgot your password?</h1>
      <ForgotForm />
    </>
  );
}

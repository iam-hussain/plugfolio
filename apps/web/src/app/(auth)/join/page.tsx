import type { Metadata } from "next";
import { RegisterForm } from "@/features/account-auth";

// Register (brief 04, ADR-0012): email + password → one verification link.
export const metadata: Metadata = { title: "Create your account" };

export default function JoinPage() {
  return (
    <>
      <h1 className="pb-4 text-lg font-medium">Create your account</h1>
      <RegisterForm />
    </>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";

// Shared shell for the auth screens (brief 04): calm, minimal, centered —
// never on a shopping path.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-8">
      <p className="font-display pb-6 text-center text-xl font-semibold">
        <Link href="/">plugfolio</Link>
      </p>
      {children}
    </main>
  );
}

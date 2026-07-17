import Link from "next/link";
import { Button } from "@plugfolio/ui";

// Rendered for unmatched routes and explicit notFound() calls.
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-accent text-sm font-medium uppercase tracking-widest">404</p>
      <h1 className="font-display text-2xl font-bold">This page isn&apos;t here</h1>
      <p className="text-muted-foreground">The link may be broken or the page may have moved.</p>
      <Button asChild variant="outline">
        <Link href="/">Go home</Link>
      </Button>
    </main>
  );
}

"use client";

import { useEffect } from "react";
import { Button } from "@plugfolio/ui";

/**
 * Route error boundary (must be a Client Component). Catches render/data errors
 * in this segment and offers a recovery action instead of a blank screen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for observability; the digest correlates with the server log.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground">An unexpected error occurred. Please try again.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}

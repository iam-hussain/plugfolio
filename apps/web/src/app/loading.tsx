import { Skeleton } from "@plugfolio/ui";

// Route-level loading UI (Suspense fallback) while a Server Component streams.
export default function Loading() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-16">
      <Skeleton className="h-20 w-20 rounded-full" />
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-24" />
    </main>
  );
}

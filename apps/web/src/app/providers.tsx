"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/**
 * Client boundary that provides TanStack Query to the client islands (§5:
 * server-first; client state only where it earns its place). Server Components
 * render *through* this provider but don't use it — they fetch on the server.
 *
 * The QueryClient is created once per browser session via useState (never at
 * module scope), so each request gets its own client and state doesn't leak
 * between users during SSR.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

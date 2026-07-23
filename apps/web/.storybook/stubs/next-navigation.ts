// Storybook stub for next/navigation. `usePathname` reads a global the story
// decorator sets, so the tab bar can show different active tabs per story.
declare global {
  // eslint-disable-next-line no-var
  var __SB_PATHNAME__: string | undefined;
}

export function usePathname(): string {
  if (typeof globalThis !== "undefined" && globalThis.__SB_PATHNAME__) {
    return globalThis.__SB_PATHNAME__;
  }
  return "/";
}

export function useRouter() {
  const noop = () => {};
  return { push: noop, replace: noop, refresh: noop, back: noop, forward: noop, prefetch: noop };
}

export function useSearchParams(): URLSearchParams {
  return new URLSearchParams();
}

export function useParams(): Record<string, string> {
  return {};
}

export const redirect = (): void => {};
export const notFound = (): void => {};

/**
 * Storybook stub for `node:crypto`.
 *
 * `@plugfolio/core` is one barrel, and part of it (`auth/device-token`, the
 * signed no-login shopper token — ADR-0002) imports `node:crypto`. Any story
 * whose component takes a *value* import from core — a constant like
 * `COMMENTS_PAGE_SIZE`, say — pulls that module into the browser bundle and
 * the whole preview fails to build with an opaque "createHmac is not exported
 * by __vite-browser-external".
 *
 * Stubbing it here fixes the class rather than the instance: components stay
 * free to import core constants (they're server components in the real app,
 * where node:crypto is fine), and no story has to know why.
 *
 * These are never called in a story. If one ever is, throwing beats returning
 * a fake token that looks real — nothing in Storybook should be able to mint
 * something that passes for a signed identity.
 */
const unavailable = (name: string) => () => {
  throw new Error(`node:crypto.${name} is not available in Storybook`);
};

export const createHmac = unavailable("createHmac");
export const createHash = unavailable("createHash");
export const timingSafeEqual = unavailable("timingSafeEqual");
export const randomBytes = unavailable("randomBytes");
export const scryptSync = unavailable("scryptSync");

/** The one that's safe to answer honestly — the browser has it natively. */
export function randomUUID(): string {
  return globalThis.crypto.randomUUID();
}

export default {
  createHmac,
  createHash,
  timingSafeEqual,
  randomBytes,
  scryptSync,
  randomUUID,
};

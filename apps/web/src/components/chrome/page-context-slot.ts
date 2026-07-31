/**
 * The id of the one element a page may own inside the shared top bar (DESIGN
 * chrome.js §data-chrome-slot).
 *
 * Its own module on purpose: the client component that portals into the slot
 * needs this string, and importing it from `app-top-bar` — or from the chrome
 * barrel — would drag a Server Component and everything it reads (`@plugfolio/
 * core`, and through it `node:crypto`) into the browser bundle.
 */
export const PAGE_CONTEXT_SLOT = "page-context-slot";

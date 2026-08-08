/**
 * The vocabulary of /account — a settings page every role shares.
 *
 * The page is **one destination at a time**, not one long scroll: a card that
 * states the account, a nav of destinations each carrying its own current
 * value, and the panel you chose. The nav is a scrolling row of chips above the
 * panel on a phone and a rail beside it from 900px — either way it stays on
 * screen, so switching destinations is one tap from anywhere and never a trip
 * back to an index.
 *
 * Why the nav shows values: a settings list whose rows are only nouns makes you
 * open all five to learn anything. "Connections · Google connected" answers the
 * question without the tap.
 *
 * Deliberately colourless. A settings page is somewhere you go to change one
 * thing and leave; a hue per section and a tinted header made five decorated
 * places out of one quiet list, and decoration is not orientation. Colour on
 * this page is the selected chip and nothing else.
 *
 * All colour, radius and type come from tokens; every state that varies is a
 * named variant, never a string built at render time.
 *
 * This module is a thin aggregator — the concerns live in sibling files
 * (`./account-hero`, `./account-nav`, `./account-panel`, `./account-roles`,
 * `./account-connections`). Import any of them from the barrel `@plugfolio/ui`,
 * never from a deep path.
 */
export * from "./account-hero";
export * from "./account-nav";
export * from "./account-panel";
export * from "./account-roles";
export * from "./account-connections";

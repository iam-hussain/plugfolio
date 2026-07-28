/**
 * Copy for the auth screens (DESIGN auth.html). The role a visitor declares on
 * /join IS the surface — it colours the artefact pane's gradient, its deck
 * card, and the one-line promise, and it decides where verification lands. The
 * form itself is role-agnostic and identical for all three.
 */
export type AuthRole = "creator" | "shopper" | "business";

export type RoleCopy = {
  /** Deck card face (Sora title + a one-line em under it). */
  deckLabel: string;
  deckBlurb: string;
  /** The card's artefact photo + the pin it carries. */
  deckPhoto: string;
  deckPin: string;
  deckPinTone: "affiliate" | "offer" | "own";
  /** The role note below the deck. */
  noteTitle: string;
  noteBody: string;
  noteFoot: string;
  /** The one white line on the pane (role screens). */
  artLine: string;
  /** /join form. */
  joinHeadline: string;
  joinCopy: string;
  joinPrimary: string;
  /** /verify next step, by role. */
  verifyCopy: string;
  verifyCta: string;
  verifyHref: string;
};

export const ROLE_COPY: Record<AuthRole, RoleCopy> = {
  creator: {
    deckLabel: "Creator",
    deckBlurb: "Make what you post shoppable",
    deckPhoto: "skincare",
    deckPin: "₹1,299",
    deckPinTone: "offer",
    noteTitle: "Your posts become a shop.",
    noteBody:
      "Tag the products in what you already post, pin your own links, and see which post drove the taps.",
    noteFoot: "Free to start — no card needed",
    artLine: "Tag it once. Sell it everywhere.",
    joinHeadline: "Create your account",
    joinCopy: "Then connect a social and claim your handle.",
    joinPrimary: "Create account",
    verifyCopy: "Next: connect a social so your handle can't be claimed by anyone else.",
    verifyCta: "Connect a social",
    verifyHref: "/dashboard/settings",
  },
  shopper: {
    deckLabel: "Shopper",
    deckBlurb: "Follow people — shopping needs no account",
    deckPhoto: "gym",
    deckPin: "Following",
    deckPinTone: "affiliate",
    noteTitle: "Follow the people you buy from.",
    noteBody:
      "An account is only for following creators and leaving comments. Buying never asks for one.",
    noteFoot: "Shopping never needs an account",
    artLine: "You never need an account to shop.",
    joinHeadline: "Follow your favourites",
    joinCopy: "An account only to follow and comment — never to buy.",
    joinPrimary: "Create account",
    verifyCopy: "Taking you back to what you were doing.",
    verifyCta: "Keep shopping",
    verifyHref: "/explore",
  },
  business: {
    deckLabel: "Business",
    deckBlurb: "Find creators to work with",
    deckPhoto: "beauty",
    deckPin: "Open brief",
    deckPinTone: "own",
    noteTitle: "Brief it once, hear from creators.",
    noteBody:
      "Post to the open board or approach a creator directly, then agree terms in one thread.",
    noteFoot: "Payment settles off-platform",
    artLine: "Post a brief. Hear from creators.",
    joinHeadline: "Create your business",
    joinCopy: "A name and what you sell — that's the whole sign-up.",
    joinPrimary: "Create business",
    verifyCopy: "Next: your business name and what you sell.",
    verifyCta: "Set up your business",
    verifyHref: "/collabs",
  },
};

/** The line the mail screens (check/verify/sent/expired) show on the pane. */
export const MAIL_ART_LINE = "One link, then your password is all you need.";

export const AUTH_ROLES: { id: AuthRole; label: string }[] = [
  { id: "creator", label: "Creator" },
  { id: "shopper", label: "Shopper" },
  { id: "business", label: "Business" },
];

export function isAuthRole(value: string | undefined): value is AuthRole {
  return value === "creator" || value === "shopper" || value === "business";
}

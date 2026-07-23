/**
 * Copy for the auth screens — role tabs + left-panel content, lifted from the
 * design-out prototype (Plugfolio UI.dc.html, auth config) and reconciled with
 * brief 04 / ADR-0012: password sign-in, so no magic-link or OAuth lines.
 */
export type AuthRole = "creator" | "shopper" | "business";

export type PanelCopy = {
  h1: string;
  /** Second headline line — rendered in lime on the violet panel. */
  h2: string;
  desc: string;
  bullets: [string, string, string];
  foot: string;
};

export const ROLE_COPY: Record<
  AuthRole,
  {
    regTitle: string;
    regPrimary: string;
    subSignin: string;
    subRegister: string;
    reassure: string;
    /** Mobile-only role blurb (the desktop panel's desc). */
    desc: string;
    panel: PanelCopy;
  }
> = {
  creator: {
    regTitle: "Create your account",
    regPrimary: "Create account",
    subSignin: "Sign in to manage your shoppable page.",
    subRegister: "One link, everything shoppable.",
    reassure: "One email link to verify — then you sign in with your password. Free to start.",
    desc: "Creators turn their content into a shoppable page — tag the products in your posts and earn from what you already recommend.",
    panel: {
      h1: "Your content,",
      h2: "now shoppable.",
      desc: "Creators turn their content into a shoppable page — tag the products in your posts and earn from what you already recommend.",
      bullets: [
        "Set up in under two minutes",
        "Claim your @handle before someone else",
        "Free to start — no card needed",
      ],
      foot: "plugfolio.com · turn your content into commerce",
    },
  },
  shopper: {
    regTitle: "Follow your favorites",
    regPrimary: "Create account",
    subSignin: "Sign in to see who you follow.",
    subRegister: "An account only to follow & comment — never to buy.",
    reassure: "You never need an account to shop — this is only to follow & comment.",
    desc: "Shoppers browse creator pages and buy in a tap. An account is optional — only for following creators and leaving comments, never to shop.",
    panel: {
      h1: "Shop everything",
      h2: "your favorites post.",
      desc: "Shoppers browse creator pages and buy in a tap. An account is optional — only for following creators and leaving comments, never to shop.",
      bullets: [
        "You never need an account to shop",
        "Follow creators & catch their new drops",
        "One tap to comment and ask questions",
      ],
      foot: "plugfolio.com · shopping never needs an account",
    },
  },
  business: {
    regTitle: "Create your business",
    regPrimary: "Create business",
    subSignin: "Sign in to your business account.",
    subRegister: "A name and what you sell — that’s the whole sign-up.",
    reassure: "v1 handles no money — agreed terms settle off-platform.",
    desc: "Businesses post what they need and collaborate with creators in one thread. Plugfolio handles no money — agreed terms settle off-platform.",
    panel: {
      h1: "Find creators",
      h2: "to work with.",
      desc: "Businesses post what they need and collaborate with creators in one thread. Plugfolio handles no money — agreed terms settle off-platform.",
      bullets: [
        "Post a brief and hear from creators",
        "Run the whole collab in one thread",
        "Agreed terms settle off-platform",
      ],
      foot: "plugfolio.com · find creators to work with",
    },
  },
};

export const CHECK_EMAIL_PANEL: PanelCopy = {
  h1: "Check your",
  h2: "inbox.",
  desc: "We emailed you one secure link. Open it on any device to keep going — after that, your password is all you need.",
  bullets: ["The link works for 24 hours", "Open it on any device", "Shopping never needs an account"],
  foot: "plugfolio.com · one link, everything shoppable",
};

export const VERIFY_PANEL: PanelCopy = {
  h1: "One last",
  h2: "step.",
  desc: "Open the link we emailed you to confirm it’s you — then every sign-in is just email + password.",
  bullets: ["Links expire after 24 hours", "Works on any device", "Then your page is ready"],
  foot: "plugfolio.com · one link, everything shoppable",
};

export const RESET_PANEL: PanelCopy = {
  h1: "Reset your",
  h2: "password.",
  desc: "Tell us your email and we’ll send one secure reset link — the only other time email is ever involved.",
  bullets: ["The link works for 24 hours", "Open it on any device", "Shopping never needs an account"],
  foot: "plugfolio.com · one link, everything shoppable",
};

export const AUTH_ROLES: { id: AuthRole; label: string }[] = [
  { id: "creator", label: "Creator" },
  { id: "shopper", label: "Shopper" },
  { id: "business", label: "Business" },
];

export function isAuthRole(value: string | undefined): value is AuthRole {
  return value === "creator" || value === "shopper" || value === "business";
}

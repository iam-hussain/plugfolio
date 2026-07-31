"use client";

import { ProductTag } from "@plugfolio/ui";
import Image from "next/image";
import { AUTH_ROLES, ROLE_COPY, type AuthRole } from "./auth-copy";

/**
 * The artefact pane's content (DESIGN auth.html). The left pane shows the
 * *thing you're about to make*, not a pitch:
 *   - `/join` shows the role as a dealt deck — three tilted white cards, the
 *     chosen one dealt to the front and straightened (a real radiogroup) — with
 *     a note that swaps with the pick.
 *   - every other screen shows the chosen role's real artefact — a tagged post
 *     (creator), a fan of people (shopper), a brief on paper (business) — plus
 *     one white line.
 * Each card is a light object (white tile) on the role gradient; its type stays
 * ink-on-white so it's readable against the saturated field.
 */

// ── the role deck (/join) ───────────────────────────────────────────────────
// Deck geometry mirrors DESIGN auth.html: the selected card is front-and-straight
// at full scale; the other two fan wide and scaled down so each keeps a
// readable, tappable sliver (a tight offset lets the front card eat their
// labels and the deck stops reading as three choices).
const POS = {
  front: "z-30 opacity-100 [transform:translate(-50%,0)_rotate(0deg)_scale(1)]",
  left: "z-10 opacity-[0.74] hover:opacity-90 [transform:translate(calc(-50%_-_96px),26px)_rotate(-10deg)_scale(0.8)] lg:[transform:translate(calc(-50%_-_112px),32px)_rotate(-10deg)_scale(0.82)]",
  right:
    "z-20 opacity-[0.74] hover:opacity-90 [transform:translate(calc(-50%_+_96px),26px)_rotate(10deg)_scale(0.8)] lg:[transform:translate(calc(-50%_+_112px),32px)_rotate(10deg)_scale(0.82)]",
} as const;

/** One deck card: photo + pinned pill, then the role label + blurb on white. */
function DeckCard({ role, front }: { role: AuthRole; front: boolean }) {
  const copy = ROLE_COPY[role];
  return (
    <span
      className={`bg-card rounded-card block w-full overflow-hidden p-2 text-left lg:p-2.5 ${
        front ? "shadow-lift" : "shadow-rest"
      }`}
    >
      <span className="bg-muted rounded-image relative block aspect-[4/5] overflow-hidden">
        <Image
          src={`/landing/posts/${copy.deckPhoto}.jpg`}
          alt=""
          fill
          priority
          sizes="220px"
          className="object-cover"
        />
        <ProductTag
          tone={copy.deckPinTone}
          name=""
          price={copy.deckPin}
          className="absolute bottom-1.5 left-1.5 scale-90"
        />
      </span>
      <span className="mt-2 block px-0.5">
        <span className="font-display text-foreground text-label block font-bold tracking-[-0.01em]">
          {copy.deckLabel}
        </span>
        {/* The blurb stands down on a phone (DESIGN hides the em under 960px) —
            the peeking slivers can't fit two lines, so the label carries it. */}
        <span className="text-muted-foreground text-nano mt-0.5 hidden leading-[1.35] lg:block">
          {copy.deckBlurb}
        </span>
      </span>
    </span>
  );
}

/**
 * The note under the artefact (DESIGN auth.html §rolenote): one promise title,
 * one plain line, and the honesty chip that role turns on. Shared by the /join
 * deck and the single-artefact screens so every auth pane carries the same
 * block, in white on the gradient.
 */
function RoleNote({ role }: { role: AuthRole }) {
  const copy = ROLE_COPY[role];
  return (
    <div className="grid max-w-[340px] justify-items-center gap-1.5 text-center text-white lg:max-w-[380px]">
      <p className="font-display text-body font-bold tracking-[-0.02em]">{copy.noteTitle}</p>
      <p className="text-copy leading-[1.5]">{copy.noteBody}</p>
      <p className="rounded-pill text-nano mt-1 inline-flex items-center gap-2 border border-white/40 px-3 py-1.5 font-mono font-semibold tracking-[0.01em] text-white">
        <span className="bg-accent rounded-pill size-[7px] shrink-0" aria-hidden />
        {copy.noteFoot}
      </p>
    </div>
  );
}

/**
 * The mono eyebrow above the deck / artefact. `/join` picks a role ("I'm a…");
 * the returning-user screens greet instead ("I'm back").
 */
function RoleEyebrow({ label }: { label: string }) {
  return (
    <p className="text-nano font-mono font-semibold uppercase tracking-[0.14em] text-white">
      {label}
    </p>
  );
}

export function RoleDeck({
  role,
  onRoleChange,
}: {
  role: AuthRole;
  onRoleChange: (role: AuthRole) => void;
}) {
  const rest = AUTH_ROLES.filter((r) => r.id !== role);
  const posOf = (id: AuthRole): keyof typeof POS =>
    id === role ? "front" : rest[0]?.id === id ? "left" : "right";

  const onKey = (event: React.KeyboardEvent, index: number) => {
    const step = ["ArrowRight", "ArrowDown"].includes(event.key)
      ? 1
      : ["ArrowLeft", "ArrowUp"].includes(event.key)
        ? -1
        : 0;
    if (!step) return;
    event.preventDefault();
    onRoleChange(AUTH_ROLES[(index + step + AUTH_ROLES.length) % AUTH_ROLES.length]!.id);
  };

  return (
    <div className="grid w-full justify-items-center gap-3">
      <RoleEyebrow label="I'm a…" />
      <div role="radiogroup" aria-label="I'm a…" className="relative h-[268px] w-full lg:h-[366px]">
        {AUTH_ROLES.map((r, i) => (
          <button
            key={r.id}
            type="button"
            role="radio"
            aria-checked={r.id === role}
            tabIndex={r.id === role ? 0 : -1}
            onClick={() => onRoleChange(r.id)}
            onKeyDown={(event) => onKey(event, i)}
            className={`rounded-card absolute left-1/2 top-0 w-[156px] origin-[50%_92%] cursor-pointer text-left transition-[transform,opacity] duration-[420ms] ease-out focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-transparent lg:w-[214px] ${POS[posOf(r.id)]}`}
          >
            <DeckCard role={r.id} front={r.id === role} />
          </button>
        ))}
      </div>
      <RoleNote role={role} />
    </div>
  );
}

// ── the per-role artefacts (every screen except /join) ───────────────────────

/** Creator: the page they're about to make — a real tagged post. */
function CreatorCard() {
  return (
    <div className="bg-card shadow-rest rounded-card rotate-[-1.8deg] p-2.5">
      <div className="relative">
        <div className="rounded-image overflow-hidden">
          <Image
            src="/landing/posts/skincare.jpg"
            alt="A creator's post with two products tagged on it"
            width={900}
            height={1125}
            priority
            sizes="320px"
            className="block aspect-[4/5] w-full object-cover"
          />
        </div>
        <ProductTag
          tone="offer"
          name="Serum"
          price="₹1,299"
          className="absolute left-[8%] top-[24%]"
        />
        <ProductTag
          tone="affiliate"
          name="Balm"
          price="₹640"
          className="absolute left-[34%] top-[64%]"
        />
      </div>
      <div className="mt-2 flex items-center justify-between px-1 pb-0.5">
        <Image
          src="/landing/avatars/maya.jpg"
          alt=""
          width={60}
          height={60}
          className="rounded-pill size-7 object-cover"
        />
        <span className="bg-active text-brand-violet-deep rounded-pill text-nano px-2.5 py-1 font-mono font-semibold">
          2 things
        </span>
      </div>
    </div>
  );
}

const FAN = [
  { photo: "desk", handle: "@arjunbuilds", rotate: "-rotate-[7deg]", z: "" },
  { photo: "skincare", handle: "@mayamoves", rotate: "rotate-0", z: "z-10" },
  { photo: "gym", handle: "@niaeveryday", rotate: "rotate-[7deg]", z: "" },
] as const;

/** Shopper: the people they're about to follow — a fan of person cards. */
function ShopperFan() {
  return (
    <div className="flex justify-center">
      {FAN.map((f) => (
        <span
          key={f.handle}
          className={`bg-card shadow-rest rounded-card -mr-4 w-[44%] max-w-[132px] flex-none p-1.5 ${f.rotate} ${f.z}`}
        >
          <Image
            src={`/landing/posts/${f.photo}.jpg`}
            alt=""
            width={300}
            height={300}
            sizes="132px"
            className="rounded-image block aspect-square w-full object-cover"
          />
          <span className="text-foreground text-nano block truncate px-0.5 pb-0.5 pt-2 text-center font-bold">
            {f.handle}
          </span>
        </span>
      ))}
    </div>
  );
}

/** Business: the brief they're about to post — cut on paper stock. */
function BusinessBrief() {
  return (
    <div className="bg-card shadow-rest text-foreground rounded-paper rotate-[1.4deg] p-[18px]">
      <p className="text-muted-foreground text-nano tracking-eyebrow font-mono uppercase">
        Open requirement
      </p>
      <p className="font-display text-body mt-1.5 font-bold leading-tight tracking-[-0.02em]">
        Looking for skincare creators for a spring launch.
      </p>
      <p className="text-muted-foreground text-copy mt-2 leading-[1.5]">
        Two posts, one story. Budget discussed in the thread.
      </p>
      <div className="border-border mt-3.5 flex items-center border-t pt-3">
        <div className="flex">
          {["maya", "nia", "rhea"].map((a) => (
            <Image
              key={a}
              src={`/landing/avatars/${a}.jpg`}
              alt=""
              width={60}
              height={60}
              className="ring-card rounded-pill -mr-2.5 size-6 object-cover ring-2"
            />
          ))}
        </div>
        <span className="text-muted-foreground text-nano ml-3.5 font-mono">3 creators replied</span>
      </div>
    </div>
  );
}

/**
 * The role's real artefact plus the same eyebrow + note the deck carries — so
 * every screen that isn't /join wears a consistent pane. The card is
 * non-interactive, so it stands down on a phone (only /join's deck earns the
 * space there); the eyebrow and note stay for a consistent arrangement.
 */
export function RoleArtefact({ role }: { role: AuthRole }) {
  const Art = role === "shopper" ? ShopperFan : role === "business" ? BusinessBrief : CreatorCard;
  return (
    <div className="grid w-full justify-items-center gap-5">
      <div className="hidden lg:block lg:w-[min(80%,320px)]">
        <Art />
      </div>
      <RoleNote role={role} />
    </div>
  );
}

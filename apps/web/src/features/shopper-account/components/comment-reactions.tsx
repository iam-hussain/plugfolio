"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { ReactionValue } from "@plugfolio/core";
import { reactToComment } from "../api";

/**
 * Helpful / not helpful on a comment (lean journey). A creator page's comments
 * are mostly questions about the goods, and the useful answer needs to float
 * without a moderator sorting it — so this scores an *answer*, never a product
 * and never a creator.
 *
 * Signed out, the counts still render: reading is account-free (§2.2). The
 * buttons become a door to sign-in rather than disappearing, so the affordance
 * doesn't move around depending on who is looking.
 */
export type CommentReactionsProps = {
  commentId: string;
  helpfulCount: number;
  unhelpfulCount: number;
  mine: ReactionValue | null;
  /** Signed out: the pair links to sign-in instead of writing. */
  signedIn: boolean;
};

export function CommentReactions({
  commentId,
  helpfulCount,
  unhelpfulCount,
  mine,
  signedIn,
}: CommentReactionsProps) {
  const [picked, setPicked] = useState<ReactionValue | null>(mine);
  const [counts, setCounts] = useState({ helpful: helpfulCount, unhelpful: unhelpfulCount });

  const react = useMutation({
    mutationFn: (value: ReactionValue | null) => reactToComment({ commentId, value }),
    onMutate: (value) => {
      const before = picked;
      setPicked(value);
      setCounts((current) => ({
        helpful:
          current.helpful + (value === "helpful" ? 1 : 0) - (before === "helpful" ? 1 : 0),
        unhelpful:
          current.unhelpful + (value === "unhelpful" ? 1 : 0) - (before === "unhelpful" ? 1 : 0),
      }));
      return { before, counts };
    },
    onError: (_error, _value, context) => {
      // Put the count back rather than leaving a number that never happened.
      if (context) {
        setPicked(context.before);
        setCounts(context.counts);
      }
    },
  });

  // Tapping the one you already picked clears it — sent as null so the toggle
  // stays the server's contract rather than the client's guess.
  const toggle = (value: ReactionValue) => react.mutate(picked === value ? null : value);

  return (
    <div className="-ml-2.5 flex items-center gap-1">
      <Reaction
        label="Helpful"
        icon={<ThumbsUp className="size-[15px]" aria-hidden />}
        count={counts.helpful}
        pressed={picked === "helpful"}
        signedIn={signedIn}
        onClick={() => toggle("helpful")}
      />
      <Reaction
        label="Not helpful"
        icon={<ThumbsDown className="size-[15px]" aria-hidden />}
        count={counts.unhelpful}
        pressed={picked === "unhelpful"}
        signedIn={signedIn}
        onClick={() => toggle("unhelpful")}
        hideZero
      />
    </div>
  );
}

function Reaction({
  label,
  icon,
  count,
  pressed,
  signedIn,
  onClick,
  hideZero,
}: {
  label: string;
  icon: React.ReactNode;
  count: number;
  pressed: boolean;
  signedIn: boolean;
  onClick: () => void;
  /** "Not helpful" at zero is noise — the count appears once someone means it. */
  hideZero?: boolean;
}) {
  const shared =
    "rounded-pill hover:bg-active hover:text-primary inline-flex min-h-9 items-center gap-1.5 px-2.5 py-[7px] text-xs font-bold tabular-nums transition-colors";
  const body = (
    <>
      {icon}
      {hideZero && count === 0 ? null : count}
    </>
  );

  if (!signedIn) {
    return (
      <Link
        href="/signin"
        className={`text-muted-foreground ${shared}`}
        aria-label={`${label} — sign in to react`}
      >
        {body}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      aria-label={label}
      className={`${pressed ? "text-primary" : "text-muted-foreground"} ${shared}`}
    >
      {body}
    </button>
  );
}

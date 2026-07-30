import { CouponBlock as CouponPanel } from "@plugfolio/ui";
import { CopyCodeButton } from "./copy-code-button";

/**
 * A product's coupon, wired (ADR-0011, DESIGN §.coupon). The panel and the code
 * chip are the design system's; this is the feature's job — deciding which
 * channel it is, whether the offer is still live, and recording the copy.
 *
 * An ended offer never takes the product down with it: it goes quiet and the
 * card reverts to its no-coupon self.
 */
export type CouponBlockProps = {
  productId: string;
  postId?: string;
  couponCode: string;
  offerEndsAt: Date | null;
  inStoreNote: string | null;
  /** The product has an outbound link — decides the channel label. */
  hasLink?: boolean;
  /** `chip` drops the panel and shows the code alone, for a tight row. */
  variant?: "full" | "chip";
};

const endsFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function CouponBlock({
  productId,
  postId,
  couponCode,
  offerEndsAt,
  inStoreNote,
  hasLink = true,
  variant = "full",
}: CouponBlockProps) {
  const ended = offerEndsAt !== null && offerEndsAt.getTime() < Date.now();

  if (ended) {
    if (variant === "chip") return <p className="text-faint text-micro mt-2">Offer ended</p>;
    return (
      <CouponPanel channel="Offer ended" live={false}>
        <p className="text-muted-foreground text-micro m-0">
          The product is still here — only the code has expired.
        </p>
      </CouponPanel>
    );
  }

  const code = <CopyCodeButton productId={productId} postId={postId} code={couponCode} />;
  if (variant === "chip") return <div className="mt-2.5">{code}</div>;

  return (
    <CouponPanel
      channel={
        hasLink && inStoreNote
          ? "Online & in-store code"
          : inStoreNote
            ? "In-store code"
            : "Online code"
      }
      note={inStoreNote}
      expires={offerEndsAt ? `Valid till ${endsFormat.format(offerEndsAt)}` : null}
    >
      {code}
    </CouponPanel>
  );
}

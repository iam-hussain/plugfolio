import { CopyCodeButton } from "./copy-code-button";

/**
 * The coupon attachment on a product (ADR-0011, brief 13, design-out product
 * detail). `variant="full"` is the product page's dashed panel: channel label,
 * code chip, in-store note, expiry. `variant="chip"` is the compact code chip
 * for tagged-product rows. Expired offers collapse to one muted line — the
 * product survives its deal.
 */
export type CouponBlockProps = {
  productId: string;
  postId?: string;
  couponCode: string;
  offerEndsAt: Date | null;
  inStoreNote: string | null;
  /** The product has an outbound link — decides the channel label. */
  hasLink?: boolean;
  variant?: "full" | "chip";
};

const endsFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });

export function CouponBlock({
  productId,
  postId,
  couponCode,
  offerEndsAt,
  inStoreNote,
  hasLink = true,
  variant = "full",
}: CouponBlockProps) {
  if (offerEndsAt && offerEndsAt.getTime() < Date.now()) {
    if (variant === "chip") {
      return <p className="text-muted-foreground font-mono text-xs">Offer ended</p>;
    }
    return (
      <div className="border-border bg-muted text-muted-foreground rounded-[14px] border px-3.5 py-3 font-mono text-xs">
        Offer ended · the product is still available below.
      </div>
    );
  }

  if (variant === "chip") {
    return (
      <div className="flex flex-wrap items-center gap-2.5">
        <CopyCodeButton productId={productId} postId={postId} code={couponCode} />
        {offerEndsAt ? (
          <span className="text-muted-foreground font-mono text-[11px]">
            Valid till {endsFormat.format(offerEndsAt)}
          </span>
        ) : null}
      </div>
    );
  }

  const channelLabel =
    hasLink && inStoreNote ? "Online & in-store code" : inStoreNote ? "In-store code" : "Online code";

  return (
    <div className="border-primary bg-primary/10 rounded-[14px] border border-dashed p-3.5">
      <p className="text-primary font-mono text-[10px] font-bold uppercase tracking-[0.08em]">
        {channelLabel}
      </p>
      <div className="mt-2">
        <CopyCodeButton productId={productId} postId={postId} code={couponCode} />
      </div>
      {inStoreNote ? (
        <p className="text-foreground mt-2.5 text-[13px] leading-[1.5]">{inStoreNote}</p>
      ) : null}
      {offerEndsAt ? (
        <p className="text-muted-foreground mt-2 font-mono text-[11px]">
          Valid till {endsFormat.format(offerEndsAt)}
        </p>
      ) : null}
    </div>
  );
}

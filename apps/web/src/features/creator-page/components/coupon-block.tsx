import { CopyCodeButton } from "./copy-code-button";

/**
 * The coupon attachment on a product card (ADR-0011, brief 13): code chip +
 * optional expiry + optional in-store instruction. Expired offers collapse to
 * one muted line — the product survives its deal.
 */
export type CouponBlockProps = {
  productId: string;
  postId?: string;
  couponCode: string;
  offerEndsAt: Date | null;
  inStoreNote: string | null;
};

const endsFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });

export function CouponBlock({
  productId,
  postId,
  couponCode,
  offerEndsAt,
  inStoreNote,
}: CouponBlockProps) {
  if (offerEndsAt && offerEndsAt.getTime() < Date.now()) {
    return <p className="text-muted-foreground text-xs">Offer ended</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <CopyCodeButton productId={productId} postId={postId} code={couponCode} />
        {offerEndsAt ? (
          <span className="text-muted-foreground text-xs">
            Valid till {endsFormat.format(offerEndsAt)}
          </span>
        ) : null}
      </div>
      {inStoreNote ? <p className="text-muted-foreground text-xs">{inStoreNote}</p> : null}
    </div>
  );
}

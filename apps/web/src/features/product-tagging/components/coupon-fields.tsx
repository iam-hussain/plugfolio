"use client";

import { DashField, DashFieldPair, Fold, Input } from "@plugfolio/ui";
import type { ProductEditorFields } from "../hooks/use-product-editor";

/**
 * The offer, folded.
 *
 * It's part of the product, not a second subject — it had its own card once,
 * which made one optional field look like a separate thing to manage. Most
 * products have no coupon, so it stays folded: an always-open block makes the
 * common case look unfinished.
 */
export function CouponFields({ fields }: { fields: ProductEditorFields }) {
  return (
    <Fold
      className="mt-1"
      open={fields.couponOpen}
      onToggle={() => fields.setCouponOpen((was) => !was)}
      title="Coupon"
    >
      <DashField label="Code" htmlFor="coupon-code" note="Clearing the code removes the whole offer.">
        <Input
          id="coupon-code"
          value={fields.couponCode}
          onChange={(event) => fields.setCouponCode(event.target.value)}
          maxLength={40}
          placeholder="SAVE30"
        />
      </DashField>
      <DashFieldPair>
        <DashField label="Valid till" hint="· optional" htmlFor="offer-ends">
          <Input
            id="offer-ends"
            type="date"
            value={fields.offerEnds}
            onChange={(event) => fields.setOfferEnds(event.target.value)}
          />
        </DashField>
        <DashField label="In-store note" hint="· optional" htmlFor="in-store-note">
          <Input
            id="in-store-note"
            value={fields.inStoreNote}
            onChange={(event) => fields.setInStoreNote(event.target.value)}
            maxLength={200}
            placeholder="Show at the counter"
          />
        </DashField>
      </DashFieldPair>
      <p className="text-faint text-micro">
        An in-store note makes this an in-store offer: copies are counted, redemption is not. A
        product with a note and no link has no Buy button at all — the code is the whole action.
      </p>
    </Fold>
  );
}

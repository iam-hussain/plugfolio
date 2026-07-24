/** Public surface of the creator-page feature (§5: import from here only). */
export { CreatorHeader, type CreatorHeaderProps } from "./components/creator-header";
export {
  SocialsRow,
  SocialGlyph,
  type SocialsRowProps,
  type SocialLink,
  type SocialPlatform,
} from "./components/socials-row";
export { PostGrid, type PostGridProps } from "./components/post-grid";
export { ShareButton } from "./components/share-button";
export { CategoryChips, type CategoryChipsProps } from "./components/category-chips";
export { TaggedProductCard, type TaggedProductCardProps } from "./components/tagged-product-card";
export { ProductTapButton, type ProductTapButtonProps } from "./components/product-tap-button";
export { CouponBlock, type CouponBlockProps } from "./components/coupon-block";
export { CopyCodeButton, type CopyCodeButtonProps } from "./components/copy-code-button";
export { useRecordTap } from "./hooks/use-record-tap";
export { recordTap, type RecordedTap } from "./api";

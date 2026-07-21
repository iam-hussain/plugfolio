/** Public surface of the creator-page feature (§5: import from here only). */
export { CreatorHeader, type CreatorHeaderProps } from "./components/creator-header";
export { PostGrid, type PostGridProps } from "./components/post-grid";
export { CategoryChips, type CategoryChipsProps } from "./components/category-chips";
export { TaggedProductCard, type TaggedProductCardProps } from "./components/tagged-product-card";
export { ProductTapButton, type ProductTapButtonProps } from "./components/product-tap-button";
export { useRecordTap } from "./hooks/use-record-tap";
export { recordTap, type RecordedTap } from "./api";

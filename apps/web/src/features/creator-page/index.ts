/** Public surface of the creator-page feature (§5: import from here only). */
export { PostGrid, type PostGridProps } from "./components/post-grid";
export { SharePanel, type SharePanelProps } from "./components/share-panel";
export { PageShare, type PageShareProps } from "./components/page-share";
export { ShareButton, type ShareButtonProps } from "./components/share-button";
export { CreatorContextBar, type CreatorContextBarProps } from "./components/creator-context-bar";
export { CategoryChips, type CategoryChipsProps } from "./components/category-chips";
export { TaggedProductCard, type TaggedProductCardProps } from "./components/tagged-product-card";
export { ProductTapButton, type ProductTapButtonProps } from "./components/product-tap-button";
export { CouponBlock, type CouponBlockProps } from "./components/coupon-block";
export { CopyCodeButton, type CopyCodeButtonProps } from "./components/copy-code-button";
export { ViewBeacon, type ViewBeaconProps } from "./components/view-beacon";
export { useRecordTap } from "./hooks/use-record-tap";
export { recordTap, type RecordedTap } from "./api";
export { CreatorPageView, type CreatorPageViewProps } from "./components/creator-page-view";
export { ProductPageView, type ProductPageViewProps } from "./components/product-page-view";
export { PostPageView, type PostPageViewProps } from "./components/post-page-view";
export { toSocials, type SocialLink } from "./to-socials";

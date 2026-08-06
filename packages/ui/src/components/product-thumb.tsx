import { cva, type VariantProps } from "class-variance-authority";
import { ImageOff } from "lucide-react";
import { cn } from "../lib/cn";

/**
 * The small square product/post still used in dense dashboard rows: a rounded,
 * tinted box holding a cover image, or an `ImageOff` placeholder when there
 * isn't one. Images are shown unoptimized (the source is off-platform), so a
 * plain `<img>` keeps this framework-agnostic for the shared kit.
 */
const thumb = cva("bg-active rounded-image relative flex-none overflow-hidden", {
  variants: {
    size: {
      sm: "size-10",
      md: "size-[52px]",
    },
  },
  defaultVariants: { size: "md" },
});

const iconSize = { sm: "size-4", md: "size-5" } as const;

export type ProductThumbProps = VariantProps<typeof thumb> & {
  /** Cover image URL; absent shows the placeholder. */
  src?: string | null;
  alt?: string;
};

export function ProductThumb({ src, alt = "", size = "md" }: ProductThumbProps) {
  return (
    <span className={thumb({ size })}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="text-faint grid size-full place-items-center">
          <ImageOff className={cn(iconSize[size ?? "md"])} aria-hidden />
        </span>
      )}
    </span>
  );
}

import * as React from "react";

// Storybook stub for next/image — a plain <img>. `fill` maps to the same
// absolute-cover classes the real component relies on (no inline styles).
type ImageProps = {
  src: string | { src: string };
  alt?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  unoptimized?: boolean;
  className?: string;
};

export default function Image({ src, alt = "", fill, className = "" }: ImageProps) {
  const url = typeof src === "string" ? src : (src?.src ?? "");
  const fillClasses = fill ? "absolute inset-0 h-full w-full object-cover" : "";
  return <img src={url} alt={alt} className={`${className} ${fillClasses}`.trim()} />;
}

/**
 * Machine-readable brand constants — for places CSS variables can't reach
 * (e.g. `<meta name="theme-color">`, OG image generation, chart palettes).
 * Keep these in sync with tokens.css.
 */
export const brand = {
  primary: "#7C3AED", // Charged Violet
  accent: "#C6FF3D", // Electric Lime
  surfaceDark: "#110D1A",
} as const;

export type BrandColor = keyof typeof brand;

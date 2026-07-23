import type { Meta, StoryObj } from "@storybook/react";

/**
 * Foundations · Color — the "Charged Violet" palette (Brand Guidelines v1.1 §05)
 * as the app consumes it: semantic tokens plus the raw brand values. Every
 * swatch is a token utility class — no hardcoded hex anywhere in the app.
 */
type Swatch = { name: string; className: string; note?: string; text?: string };

const semantic: Swatch[] = [
  { name: "primary", className: "bg-primary", text: "text-primary-foreground" },
  { name: "accent (lime — fill only)", className: "bg-accent", text: "text-accent-foreground" },
  {
    name: "background (page)",
    className: "bg-background border border-border",
    text: "text-foreground",
  },
  {
    name: "card / muted (raised)",
    className: "bg-card border border-border",
    text: "text-foreground",
  },
  { name: "muted-foreground", className: "bg-muted-foreground", text: "text-background" },
  { name: "border", className: "bg-border", text: "text-foreground" },
  { name: "destructive", className: "bg-destructive", text: "text-destructive-foreground" },
];

const brand: Swatch[] = [
  { name: "brand-violet", className: "bg-brand-violet", text: "text-white" },
  { name: "brand-violet-deep", className: "bg-brand-violet-deep", text: "text-white" },
  { name: "brand-violet-tint", className: "bg-brand-violet-tint", text: "text-brand-ink" },
  { name: "brand-ink", className: "bg-brand-ink", text: "text-white" },
  { name: "brand-lime", className: "bg-brand-lime", text: "text-brand-ink" },
  { name: "brand-coral", className: "bg-brand-coral", text: "text-brand-ink" },
  { name: "brand-violet-wash", className: "bg-brand-violet-wash", text: "text-brand-ink" },
  { name: "brand-canvas", className: "bg-brand-canvas", text: "text-brand-ink" },
];

function SwatchGrid({ title, items }: { title: string; items: Swatch[] }) {
  return (
    <section className="mb-8">
      <h3 className="font-display tracking-eyebrow text-muted-foreground mb-3 text-sm font-semibold uppercase">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((s) => (
          <div
            key={s.name}
            className={`flex h-24 flex-col justify-end rounded-lg p-3 ${s.className} ${s.text ?? ""}`}
          >
            <span className="font-mono text-xs">{s.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Palette() {
  return (
    <div className="w-[640px] max-w-full">
      <SwatchGrid title="Semantic tokens" items={semantic} />
      <SwatchGrid title="Raw brand palette" items={brand} />
    </div>
  );
}

const meta: Meta<typeof Palette> = {
  title: "Foundations/Color",
  component: Palette,
  parameters: { layout: "padded" },
};
export default meta;

export const Palette_: StoryObj<typeof Palette> = { name: "Palette" };

import type { Meta, StoryObj } from "@storybook/react";

/**
 * Foundations · Type — Sora (display), Inter (body), Space Mono (micro labels),
 * Brand Guidelines v1.1 §06. Loaded via next/font in the app + Storybook preview.
 */
function TypeScale() {
  return (
    <div className="w-[640px] max-w-full space-y-8">
      <div>
        <p className="tracking-eyebrow text-muted-foreground mb-2 font-mono text-xs uppercase">
          Sora · display
        </p>
        <p className="font-display tracking-display text-5xl font-extrabold">Plug in. Sell more.</p>
        <h1 className="font-display tracking-display mt-3 text-3xl font-bold">
          One link, everything shoppable
        </h1>
        <h2 className="font-display tracking-display mt-2 text-xl font-semibold">
          Map every post to a product
        </h2>
      </div>

      <div>
        <p className="tracking-eyebrow text-muted-foreground mb-2 font-mono text-xs uppercase">
          Inter · body
        </p>
        <p className="max-w-prose text-base leading-relaxed">
          Connect your content, tag the products inside it, and share one profile link — followers
          tap any post and shop everything in it.
        </p>
        <p className="text-muted-foreground mt-2 text-sm">Muted body · @handle · price</p>
      </div>

      <div>
        <p className="tracking-eyebrow text-muted-foreground mb-2 font-mono text-xs uppercase">
          Space Mono · micro
        </p>
        <p className="tracking-eyebrow text-primary font-mono text-xs uppercase">
          Tracking clicks · revenue · roi
        </p>
      </div>
    </div>
  );
}

const meta: Meta<typeof TypeScale> = {
  title: "Foundations/Type",
  component: TypeScale,
  parameters: { layout: "padded" },
};
export default meta;

export const Scale: StoryObj<typeof TypeScale> = {};

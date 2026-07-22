import type { Route } from "next";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@plugfolio/ui";

/**
 * One door of the landing role router (Dev Spec §06 Landing): Creator, Business,
 * or Shopper. Presentational; the whole card is a link. Accent driven by variant
 * through tokens — never a hardcoded color.
 */
const roleCardVariants = cva(
  "group focus-visible:ring-ring block rounded-lg border p-5 transition-colors focus-visible:outline-none focus-visible:ring-2",
  {
    variants: {
      accent: {
        primary: "border-border bg-card hover:border-primary/60",
        accent: "border-border bg-card hover:border-accent/70",
      },
    },
    defaultVariants: { accent: "primary" },
  },
);

const kickerVariants = cva("font-mono text-[11px] uppercase tracking-eyebrow", {
  variants: {
    accent: {
      primary: "text-primary",
      accent: "text-muted-foreground",
    },
  },
  defaultVariants: { accent: "primary" },
});

export type RoleCardProps = VariantProps<typeof roleCardVariants> & {
  kicker: string;
  title: string;
  description: string;
  cta: string;
  href: Route;
};

export function RoleCard({ kicker, title, description, cta, href, accent }: RoleCardProps) {
  return (
    <Link href={href} className={roleCardVariants({ accent })}>
      <p className={kickerVariants({ accent })}>{kicker}</p>
      <h3 className="font-display tracking-display mt-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{description}</p>
      <span
        className={cn(
          "mt-4 inline-flex items-center gap-1 text-sm font-medium",
          accent === "accent" ? "text-foreground" : "text-primary",
        )}
      >
        {cta}
        <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}

import * as React from "react";
import { ChevronRight, ImageOff } from "lucide-react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cn } from "../lib/cn";

/**
 * The product view (DESIGN product.html §.pr) — one thing, in detail, with a
 * way back. The media takes 46% from 860px and the detail column the rest.
 */
export function ProductDetail({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-[clamp(20px,3vw,34px)] pt-2 min-[860px]:grid-cols-[minmax(0,46%)_minmax(0,1fr)] min-[860px]:items-start min-[860px]:gap-[clamp(28px,4vw,52px)]">
      {children}
    </div>
  );
}

/**
 * The product photo. A product with no image is **not broken** — plenty of
 * retailers give none — so the empty case is a deliberate placeholder rather
 * than a collapsed box or a broken-image icon.
 */
export function ProductMedia({ children }: { children?: React.ReactNode }) {
  return (
    <div className="shadow-rest border-border rounded-bay bg-active overflow-hidden border">
      {children ?? (
        <div className="text-faint bg-card grid aspect-square place-items-center">
          <ImageOff className="size-[46px]" strokeWidth={1.5} aria-hidden />
        </div>
      )}
    </div>
  );
}

export function ProductTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-display text-name m-0 font-extrabold leading-[1.15] tracking-[-0.03em]">
      {children}
    </h1>
  );
}

/**
 * The price is the largest thing on the page after the title — it is the
 * number the whole screen exists to hand over. Hidden when unknown; never
 * "$0". The channel line below carries on regardless, so the block never
 * collapses to nothing.
 */
export function ProductPrice({ children }: { children?: string | null }) {
  if (!children) return null;
  return (
    <p className="font-display text-name-lg m-0 mt-3.5 font-extrabold tabular-nums leading-none tracking-[-0.035em]">
      {children}
    </p>
  );
}

/** "**Affiliate pick** · opens Nykaa" — what tapping does, in words. */
export function ProductWhere({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground text-copy [&_b]:text-foreground m-0 mt-2.5 font-semibold [&_b]:font-bold">
      {children}
    </p>
  );
}

/** The one outbound action, full width — the page's whole point. */
export function ProductBuy({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-[22px] [&>*]:w-full [&>*]:justify-center [&>*]:py-[17px]">{children}</div>
  );
}

/**
 * In-store-only: there is no link, so there is no button. The screen must not
 * read as broken — the code above IS the action, and this says so.
 */
export function ProductInStoreNote({
  title = "This one is in-store only",
  children,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-active border-primary rounded-tile mt-5 border px-[17px] py-[15px]">
      <b className="text-label block font-bold">{title}</b>
      <p className="text-muted-foreground text-copy m-0 mt-[5px]">{children}</p>
    </div>
  );
}

/**
 * Where it came from — the source post, when it is known. A product tagged
 * straight onto a shelf has none, and the block simply is not there.
 */
export function ProductSource({
  label = "From this post",
  title,
  thumb,
  asChild,
  className,
  children,
  ...props
}: React.ComponentProps<"a"> & {
  label?: string;
  title: React.ReactNode;
  thumb?: React.ReactNode;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      className={cn(
        "border-border rounded-tile bg-card hover:border-primary mt-[26px] flex items-center gap-3.5 border p-3 text-inherit no-underline transition-colors",
        className,
      )}
      {...props}
    >
      <Slottable>{children}</Slottable>
      {thumb ? (
        <span className="rounded-image bg-active size-[58px] flex-none overflow-hidden">
          {thumb}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="text-faint text-micro block font-bold uppercase tracking-[0.06em]">
          {label}
        </span>
        <b className="text-label mt-[3px] block truncate font-bold">{title}</b>
      </span>
      <ChevronRight className="text-faint size-[18px] flex-none" aria-hidden />
    </Comp>
  );
}

/**
 * A product that has gone (DESIGN §.gone404). Not a generic 404: the shopper
 * arrived from a real post or a shared link, so the page says what happened
 * and hands them back to the creator rather than to the site root.
 */
export function ProductGone({
  title = "This product isn't here any more",
  children,
  action,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-6 py-[clamp(48px,9vw,110px)] text-center">
      <b className="font-display text-name block font-extrabold tracking-[-0.03em]">{title}</b>
      <p className="text-muted-foreground text-copy mx-auto mt-2.5 max-w-[42ch]">{children}</p>
      {action ? <div className="mt-[22px]">{action}</div> : null}
    </div>
  );
}

"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@plugfolio/ui/lib/cn"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        // Admin design chips (pair with shape="square"):
        // soft violet-wash chip — roles, live coupons, "speaks as brand".
        "soft-primary": "bg-active text-primary",
        // soft danger chip — Suspended / Expired / owner-suspended.
        "soft-destructive": "bg-destructive/10 text-destructive",
        // quiet outline chip — Active / Live / kinds / categories.
        "outline-muted": "border-border-strong text-muted-foreground",
      },
      shape: {
        pill: "",
        // Admin design: 6px-radius chips at 11px/600.
        square: "rounded-[6px] px-2 py-0.5 text-[11px] font-semibold leading-normal",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "pill",
    },
  }
)

function Badge({
  className,
  variant = "default",
  shape = "pill",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, shape }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

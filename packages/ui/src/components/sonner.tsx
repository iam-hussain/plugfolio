"use client"

import * as React from "react"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * Toaster — sonner themed on our tokens (Admin design: bottom-right card,
 * strong hairline, 11px radius, overlay shadow). Theme follows the page's
 * `data-theme`; sonner's className API is its documented theming seam.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = React.useState<ToasterProps["theme"]>("light")

  React.useEffect(() => {
    setTheme(
      (document.documentElement.dataset.theme as ToasterProps["theme"]) ?? "light",
    )
  }, [])

  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="text-primary size-[18px]" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="text-destructive size-[18px]" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "!bg-background !text-foreground !border-border-strong !shadow-overlay !rounded-[11px] !text-[13px]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

import * as React from "react";

// Storybook stub for next/link — renders a plain anchor so link-based
// components (RoleCard, chrome) render outside a Next runtime.
type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string | { pathname?: string };
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
};

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, prefetch, replace, scroll, children, ...rest },
  ref,
) {
  const url = typeof href === "string" ? href : (href?.pathname ?? "#");
  return (
    <a ref={ref} href={url} {...rest}>
      {children}
    </a>
  );
});

export default Link;

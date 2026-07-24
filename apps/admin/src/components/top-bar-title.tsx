"use client";

import { usePathname } from "next/navigation";
import { NAV } from "./admin-sidebar";

const DETAIL_TITLES: readonly { prefix: string; title: string }[] = [
  { prefix: "/members/", title: "Member" },
  { prefix: "/profiles/", title: "Profile" },
  { prefix: "/collabs/", title: "Collab thread" },
];

/** The design's top-bar page title (Sora 14.5/600), derived from the route. */
export function TopBarTitle() {
  const pathname = usePathname();
  const detail = DETAIL_TITLES.find((d) => pathname.startsWith(d.prefix));
  const nav = NAV.flatMap((g) => g.items).find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
  );
  return (
    <span className="font-display text-[14.5px] font-semibold tracking-[-0.01em]">
      {detail?.title ?? nav?.title ?? ""}
    </span>
  );
}

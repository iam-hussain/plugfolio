"use client";

import { cn } from "@plugfolio/ui";
import { cva } from "class-variance-authority";
import { PlugMark } from "@/components/brand";
import type { AuthRole } from "./auth-copy";

/**
 * The v2 role picker — "pick your socket" (ADR-0026, `Plugfolio v2.dc.html`
 * §join). Three two-slot sockets; the PlugMark plug slides over the chosen
 * one. A genuine fork in the copy and the landing spot, never a permission
 * boundary (§4.2) — the same form submits whichever socket is picked.
 */
const SOCKETS: readonly { role: AuthRole; label: string; left: string }[] = [
  { role: "shopper", label: "Shop", left: "left-[16.67%]" },
  { role: "creator", label: "Create", left: "left-1/2" },
  { role: "business", label: "Business", left: "left-[83.33%]" },
];

const socket = cva("rounded-lg min-w-0 flex-1 border px-2 py-3 text-center transition-colors", {
  variants: {
    on: { true: "border-primary bg-primary/15", false: "border-border bg-active" },
  },
  defaultVariants: { on: false },
});
const slot = cva("block h-[15px] w-[5px] rounded-[2px]", {
  variants: { on: { true: "bg-foreground", false: "bg-border-strong" } },
  defaultVariants: { on: false },
});
const socketLabel = cva("text-pico mt-2 block font-mono uppercase tracking-[0.12em]", {
  variants: { on: { true: "text-foreground", false: "text-faint" } },
  defaultVariants: { on: false },
});

export function RoleSockets({
  role,
  onRoleChange,
}: {
  role: AuthRole;
  onRoleChange: (role: AuthRole) => void;
}) {
  const active = SOCKETS.find((socket) => socket.role === role) ?? SOCKETS[0]!;
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="text-faint text-pico tracking-eyebrow font-mono uppercase">
        Pick your socket
      </legend>
      {/* The plug — slides to the chosen socket; reduced-motion kills it. */}
      <div className="relative h-11">
        <div
          className={cn(
            "ease-design absolute bottom-0 flex -translate-x-1/2 flex-col items-center transition-[left] duration-300 motion-reduce:transition-none",
            active.left,
          )}
          aria-hidden
        >
          <PlugMark tone="auto" className="size-[26px]" />
          <span className="bg-border-strong h-[11px] w-0.5" />
        </div>
      </div>
      <div className="flex gap-2" role="radiogroup" aria-label="I'm here to">
        {SOCKETS.map((item) => {
          const on = item.role === role;
          return (
            <button
              key={item.role}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onRoleChange(item.role)}
              className={socket({ on })}
            >
              <span className="flex justify-center gap-[5px]" aria-hidden>
                <span className={slot({ on })} />
                <span className={slot({ on })} />
              </span>
              <span className={socketLabel({ on })}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

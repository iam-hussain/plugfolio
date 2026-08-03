"use client";

import { cn } from "@plugfolio/ui";
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
          <PlugMark className="size-[26px]" />
          <span className="bg-border-strong h-[11px] w-0.5" />
        </div>
      </div>
      <div className="flex gap-2" role="radiogroup" aria-label="I'm here to">
        {SOCKETS.map((socket) => {
          const on = socket.role === role;
          return (
            <button
              key={socket.role}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onRoleChange(socket.role)}
              className={cn(
                "rounded-lg min-w-0 flex-1 border px-2 py-3 text-center transition-colors",
                on ? "border-primary bg-primary/15" : "border-border bg-active",
              )}
            >
              <span className="flex justify-center gap-[5px]" aria-hidden>
                <span
                  className={cn(
                    "block h-[15px] w-[5px] rounded-[2px]",
                    on ? "bg-foreground" : "bg-border-strong",
                  )}
                />
                <span
                  className={cn(
                    "block h-[15px] w-[5px] rounded-[2px]",
                    on ? "bg-foreground" : "bg-border-strong",
                  )}
                />
              </span>
              <span
                className={cn(
                  "text-pico mt-2 block font-mono uppercase tracking-[0.12em]",
                  on ? "text-foreground" : "text-faint",
                )}
              >
                {socket.label}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

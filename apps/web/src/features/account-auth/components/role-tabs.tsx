"use client";

import { AUTH_ROLES, type AuthRole } from "./auth-copy";

/**
 * "I'm a…" role selector from the design-out auth card: three flex-1 mono
 * pills; the active one fills with the primary violet.
 */
export function RoleTabs({ role, onChange }: { role: AuthRole; onChange: (role: AuthRole) => void }) {
  return (
    <>
      <p className="text-muted-foreground mb-[9px] font-mono text-[10px] uppercase tracking-[0.1em]">
        I&apos;m a…
      </p>
      <div role="radiogroup" aria-label="I'm a…" className="mb-4 flex gap-2">
        {AUTH_ROLES.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={role === option.id}
            onClick={() => onChange(option.id)}
            className={`rounded-pill flex-1 border py-[9px] font-mono text-[11px] font-bold tracking-[0.03em] transition-colors ${
              role === option.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground bg-transparent"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
}

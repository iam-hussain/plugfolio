import Link from "next/link";
import { Logo, PlugMark } from "@/components/brand";
import type { AuthRole } from "./auth-copy";

/**
 * Auth shell ("The Tagged Feed" auth, DESIGN auth.html): two panes on desktop
 * — the role-gradient *artefact* pane (the thing you're about to make, on a
 * committed saturated field) beside the light form pane — plus a 5px top rail
 * in the role's solid tint. Auth is a dead end by design: no nav, no tab bar;
 * the mark is the only way out.
 *
 * `role` scopes the gradient tokens (`bg-role-gradient` / `bg-role-solid`).
 * `"generic"` is the neutral field the account screens (sign-in, forgot, reset,
 * verify) wear — they declare no role, so they wear the brand itself.
 *
 * ONE layout for every screen, mobile and desktop, for consistency: the
 * artefact pane up top (logo + artefact + line), the form riding up over it on
 * a rounded sheet. Only /join's artefact (the role deck) is interactive on a
 * phone; the other screens hide their non-interactive *card* on mobile (see
 * RoleArtefact) but keep the same pane, logo and line.
 */
export function AuthShell({
  role,
  artefact,
  children,
}: {
  role: AuthRole | "generic";
  /** Left-pane content — the role deck (/join) or a single artefact + line. */
  artefact: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      data-role={role}
      className="relative min-h-dvh lg:grid lg:grid-cols-[46fr_54fr] lg:items-stretch"
    >
      {/* ── the top rail — a signal in the role's solid tint ── */}
      <span aria-hidden className="bg-role-solid fixed inset-x-0 top-0 z-50 h-[5px]" />

      {/* ── pane one — the artefact ── */}
      <aside className="bg-role-gradient relative grid content-center justify-items-center gap-4 overflow-hidden px-5 pb-16 pt-6 text-white lg:min-h-dvh lg:gap-7 lg:px-9 lg:pb-24 lg:pt-10">
        <PlugMark
          tone="flat"
          aria-hidden
          className="pointer-events-none absolute -bottom-[30%] -left-[14%] w-[76%] text-white/10 lg:-bottom-[19%] lg:-left-[7%] lg:w-[62%]"
        />
        <Link
          href="/"
          aria-label="Plugfolio home"
          className="relative z-10 justify-self-start lg:absolute lg:left-[34px] lg:top-[30px]"
        >
          <Logo layout="reversed" />
        </Link>
        <div className="relative z-10 grid justify-items-center gap-4 lg:gap-6">{artefact}</div>
      </aside>

      {/* ── pane two — the form (rides up over the pane on a sheet) ── */}
      <main className="bg-background rounded-t-bay relative z-[2] -mt-8 grid content-center px-5 pb-14 pt-8 shadow-[0_-22px_44px_-24px_hsl(var(--brand-ink)/0.3)] lg:mt-0 lg:rounded-none lg:p-10 lg:shadow-none">
        <span
          aria-hidden
          className="bg-border rounded-pill mx-auto -mt-2 mb-8 h-1 w-10 lg:hidden"
        />
        <div className="mx-auto w-full max-w-[380px]">{children}</div>
      </main>
    </div>
  );
}

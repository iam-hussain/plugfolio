import { PlugMark, Wordmark } from "@/components/brand";
import { RoleCard } from "./role-card";

/**
 * Landing (`/`) — explains Plugfolio in one scroll and routes three roles
 * (Dev Spec §06). Carries the explicit "no login to shop" promise and NO
 * sign-in wall. Richer than the shop hot path is fine — this isn't on it.
 */
export function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-16 pt-10">
      {/* Brand + hero */}
      <div className="flex items-center gap-2">
        <PlugMark tone="onDark" size="sm" />
        <Wordmark tone="onDark" />
      </div>

      <section className="pt-14">
        <p className="text-primary tracking-eyebrow font-mono text-[11px] uppercase">
          Shoppable creator pages
        </p>
        <h1 className="font-display tracking-display mt-3 text-4xl font-extrabold leading-[1.05]">
          Turn your content
          <br />
          into commerce.
        </h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed">
          Every post becomes tappable, every product trackable, every profile one link. Followers
          tap any post and shop everything in it.
        </p>

        {/* The honesty promise — a sanctioned lime moment (fill + dark text). */}
        <div className="bg-accent text-accent-foreground rounded-pill mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <span aria-hidden>●</span>
          Shopping never needs an account.
        </div>
      </section>

      {/* Role router — three doors */}
      <section aria-label="Choose your path" className="mt-12 flex flex-col gap-3">
        <RoleCard
          accent="primary"
          kicker="Creators"
          title="Make your posts shoppable"
          description="Connect your content, tag the products inside it, share one link. Tap once, sell everywhere."
          cta="Start selling"
          href="/signin"
        />
        <RoleCard
          accent="primary"
          kicker="Businesses"
          title="Find creators to work with"
          description="Post a requirement or reach out from a creator's page. Terms settle off-platform."
          cta="Open collabs"
          href="/collabs"
        />
        <RoleCard
          accent="accent"
          kicker="Shoppers"
          title="Browse a creator's shop"
          description="No login, no friction — tap a post, see the product, buy from the retailer in three taps."
          cta="Explore creators"
          href="/explore"
        />
      </section>

      {/* Footer */}
      <footer className="text-muted-foreground mt-auto pt-16 text-center text-xs">
        <div className="flex items-center justify-center">
          <Wordmark tone="onDark" className="text-base" />
        </div>
        <p className="mt-2">One link, everything shoppable · payment settles off-platform</p>
      </footer>
    </main>
  );
}

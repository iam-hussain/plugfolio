import { Button } from "@plugfolio/ui";

// Server Component by default (§5 server-first). Placeholder home surface —
// the real explore/landing experience lands with its feature slice.
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-accent text-sm font-medium uppercase tracking-widest">Plugfolio</p>
      <h1 className="font-display text-4xl font-bold leading-tight">
        Shoppable creator pages.
        <br />
        No login to buy.
      </h1>
      <p className="text-muted-foreground">
        Monorepo scaffold is live. Feature slices land next — creator page, product tagging,
        earnings.
      </p>
      <Button variant="accent" size="lg">
        Get started
      </Button>
    </main>
  );
}

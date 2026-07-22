import { LandingPage } from "@/features/landing";

// Server Component (§5 server-first). The landing composes the landing feature;
// no business logic lives here (app/ stays thin, §5).
export default function HomePage() {
  return <LandingPage />;
}

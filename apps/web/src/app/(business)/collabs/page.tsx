import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyBusiness, listMyBusinessCollabs, listMyRequirements } from "@plugfolio/core";
import { BusinessForm, CollabList, RequirementForm } from "@/features/business-collab";
import { auth } from "@/server/auth";
import { businessCollabDeps } from "@/server/container";

// The business surface (lean journey): one focused page — create the business,
// post requirements, follow the threads. No campaign suites.
export const metadata: Metadata = { title: "Collabs" };

export default async function BusinessCollabsPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const business = await getMyBusiness(businessCollabDeps, session.user.id);

  if (!business) {
    return (
      <main className="mx-auto max-w-md px-4 pb-8">
        <header className="py-8">
          <h1 className="font-display text-2xl font-semibold">Create your business</h1>
          <p className="text-muted-foreground text-sm">
            A name and what you sell — that&apos;s the whole sign-up.
          </p>
        </header>
        <BusinessForm />
      </main>
    );
  }

  const [requirements, collabs] = await Promise.all([
    listMyRequirements(businessCollabDeps, session.user.id),
    listMyBusinessCollabs(businessCollabDeps, session.user.id),
  ]);

  return (
    <main className="mx-auto max-w-md px-4 pb-8">
      <header className="py-8">
        <h1 className="font-display text-2xl font-semibold">{business.name}</h1>
        <p className="text-muted-foreground text-sm">{business.description}</p>
      </header>
      <section aria-label="Collab threads" className="pb-8">
        <h2 className="pb-3 font-medium">Threads</h2>
        <CollabList collabs={collabs} show="creator" />
      </section>
      <section aria-label="Your requirements" className="pb-8">
        <h2 className="pb-3 font-medium">Your open requirements</h2>
        {requirements.length === 0 ? (
          <p className="text-muted-foreground pb-3 text-sm">Nothing posted yet.</p>
        ) : (
          <ul className="flex flex-col gap-1 pb-3">
            {requirements.map((requirement) => (
              <li key={requirement.id} className="text-sm">
                {requirement.title}
                {requirement.budget ? (
                  <span className="text-muted-foreground"> · {requirement.budget}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <RequirementForm />
      </section>
    </main>
  );
}

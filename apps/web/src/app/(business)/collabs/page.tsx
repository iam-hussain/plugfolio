import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyBusiness, listMyBusinessCollabs, listMyRequirements } from "@plugfolio/core";
import {
  BusinessCollabsView,
  BusinessForm,
  BusinessSignUpScreen,
} from "@/features/business-collab";
import { auth } from "@/server/auth";
import { businessCollabDeps } from "@/server/container";

/**
 * The business home (briefs 11–12, §5.24) — load, then hand to the feature.
 * Two screens hang off one question: does this account have a business yet?
 */
export const metadata: Metadata = { title: "Collabs" };

export default async function BusinessCollabsPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const business = await getMyBusiness(businessCollabDeps, session.user.id);
  if (!business) return <BusinessSignUpScreen form={<BusinessForm />} />;

  const [requirements, collabs] = await Promise.all([
    listMyRequirements(businessCollabDeps, session.user.id),
    listMyBusinessCollabs(businessCollabDeps, session.user.id),
  ]);

  return (
    <BusinessCollabsView business={business} requirements={requirements} collabs={collabs} />
  );
}

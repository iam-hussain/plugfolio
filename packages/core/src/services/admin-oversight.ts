import { NotFoundError } from "../errors";
import type {
  AdminAuditRepository,
  AdminBusinessRepository,
  AdminBusinessRow,
  AdminCollabRepository,
  AdminCollabRow,
  AdminRequirementRepository,
  AdminRequirementRow,
} from "../ports/admin-repository";

/**
 * Marketplace oversight (docs/implementation/admin-app.md): the two mutations
 * the collab side needs — strip an inappropriate business logo and pull a
 * scam brief off the open board. Threads themselves are read-only oversight;
 * a bad actor is handled by member suspension.
 */

export type AdminOversightDeps = {
  businesses: AdminBusinessRepository;
  requirements: AdminRequirementRepository;
  audit: AdminAuditRepository;
};

const SEARCH_LIMIT = 50;

export async function searchBusinesses(
  deps: Pick<AdminOversightDeps, "businesses">,
  query?: string,
): Promise<readonly AdminBusinessRow[]> {
  return deps.businesses.search(query?.trim() || undefined, SEARCH_LIMIT);
}

export async function searchRequirements(
  deps: Pick<AdminOversightDeps, "requirements">,
  query?: string,
): Promise<readonly AdminRequirementRow[]> {
  return deps.requirements.search(query?.trim() || undefined, SEARCH_LIMIT);
}

export async function listCollabs(
  deps: { collabs: AdminCollabRepository },
  query?: string,
): Promise<readonly AdminCollabRow[]> {
  return deps.collabs.list(query?.trim() || undefined, SEARCH_LIMIT);
}

export async function clearBusinessLogo(
  deps: AdminOversightDeps,
  adminId: string,
  businessId: string,
): Promise<void> {
  if ((await deps.businesses.clearLogo(businessId)) === "not_found") {
    throw new NotFoundError("No such business");
  }
  await deps.audit.record({
    adminId,
    action: "business.clearLogo",
    targetType: "business",
    targetId: businessId,
  });
}

export async function removeRequirement(
  deps: AdminOversightDeps,
  adminId: string,
  requirementId: string,
): Promise<void> {
  const deleted = await deps.requirements.delete(requirementId);
  if (deleted === "not_found") throw new NotFoundError("No such requirement");
  await deps.audit.record({
    adminId,
    action: "requirement.delete",
    targetType: "requirement",
    targetId: requirementId,
    detail: deleted.title,
  });
}

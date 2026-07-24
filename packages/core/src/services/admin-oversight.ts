import { NotFoundError } from "../errors";
import type {
  AdminAuditRepository,
  AdminBusinessRepository,
  AdminBusinessRow,
  AdminCollabRepository,
  AdminCollabRow,
  AdminCollabThread,
  AdminRequirementRepository,
  AdminRequirementRow,
  Page,
  PageQuery,
} from "../ports/admin-repository";

/**
 * Marketplace oversight (docs/implementation/admin-app.md): strip an
 * inappropriate business logo, pull a scam brief off the open board, read a
 * reported thread, and remove a single abusive message. Admins never write
 * into threads; a bad actor is handled by member suspension.
 */

export type AdminOversightDeps = {
  businesses: AdminBusinessRepository;
  requirements: AdminRequirementRepository;
  audit: AdminAuditRepository;
};

export type AdminCollabsDeps = {
  collabs: AdminCollabRepository;
  audit: AdminAuditRepository;
};

const DETAIL_SNIPPET_LENGTH = 80;

export async function searchBusinesses(
  deps: Pick<AdminOversightDeps, "businesses">,
  query: string | undefined,
  page: PageQuery,
): Promise<Page<AdminBusinessRow>> {
  return deps.businesses.search(query?.trim() || undefined, page);
}

export async function searchRequirements(
  deps: Pick<AdminOversightDeps, "requirements">,
  query: string | undefined,
  page: PageQuery,
): Promise<Page<AdminRequirementRow>> {
  return deps.requirements.search(query?.trim() || undefined, page);
}

export async function listCollabs(
  deps: Pick<AdminCollabsDeps, "collabs">,
  query: string | undefined,
  page: PageQuery,
): Promise<Page<AdminCollabRow>> {
  return deps.collabs.list(query?.trim() || undefined, page);
}

export async function getAdminCollabThread(
  deps: Pick<AdminCollabsDeps, "collabs">,
  collabId: string,
): Promise<AdminCollabThread> {
  const thread = await deps.collabs.thread(collabId);
  if (!thread) throw new NotFoundError("No such collab");
  return thread;
}

export async function deleteCollabMessage(
  deps: AdminCollabsDeps,
  adminId: string,
  messageId: string,
): Promise<void> {
  const deleted = await deps.collabs.deleteMessage(messageId);
  if (deleted === "not_found") throw new NotFoundError("No such message");
  const body =
    deleted.body.length > DETAIL_SNIPPET_LENGTH
      ? `${deleted.body.slice(0, DETAIL_SNIPPET_LENGTH)}…`
      : deleted.body;
  await deps.audit.record({
    adminId,
    action: "collab.deleteMessage",
    targetType: "collabMessage",
    targetId: messageId,
    detail: body,
  });
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

import { ConflictError, ForbiddenError, NotFoundError } from "../errors";
import type {
  Business,
  BusinessRepository,
  CollabRepository,
  CollabSummary,
  CollabThread,
  RequirementRepository,
  RequirementView,
} from "../ports/business-collab-repository";
import type { ProfileRepository } from "../ports/profile-repository";
import type {
  ApproachRequirementInput,
  CollabMessageInput,
  CreateBusinessInput,
  PostRequirementInput,
  ProposeTermsInput,
  RequestCollabInput,
} from "../schemas/business-collab";

/**
 * Business-side use-cases (lean journey): create the business, post a
 * requirement (door one), reach out to a creator (door two), bargain in a
 * thread, agree. Money stays off-platform (§2.3) — "agreed" is a handshake,
 * not a payment. Callers pass the session-verified userId only.
 */
export type BusinessCollabDeps = {
  businesses: BusinessRepository;
  requirements: RequirementRepository;
  collabs: CollabRepository;
  profiles: ProfileRepository;
  now: () => Date;
};

const BOARD_PAGE_SIZE = 50;

/** Which side of a thread this user is on, or null for outsiders. */
async function resolveSide(
  deps: BusinessCollabDeps,
  userId: string,
  collabId: string,
): Promise<{ side: "business" | "creator" } | null> {
  const participants = await deps.collabs.findParticipants(collabId);
  if (!participants) return null;

  const business = await deps.businesses.findByUser(userId);
  if (business && business.id === participants.businessId) return { side: "business" };

  const profiles = await deps.profiles.listAccessibleByUser(userId);
  if (profiles.some((profile) => profile.id === participants.profileId)) {
    return { side: "creator" };
  }
  return null;
}

export async function createBusiness(
  deps: BusinessCollabDeps,
  userId: string,
  input: CreateBusinessInput,
): Promise<Business> {
  if (await deps.businesses.findByUser(userId)) {
    throw new ConflictError("You already have a business");
  }
  return deps.businesses.create({
    userId,
    name: input.name,
    description: input.description,
    logoUrl: input.logoUrl ?? null,
  });
}

export async function getMyBusiness(
  deps: Pick<BusinessCollabDeps, "businesses">,
  userId: string,
): Promise<Business | null> {
  return deps.businesses.findByUser(userId);
}

export async function postRequirement(
  deps: BusinessCollabDeps,
  userId: string,
  input: PostRequirementInput,
): Promise<RequirementView> {
  const business = await deps.businesses.findByUser(userId);
  if (!business) throw new ForbiddenError("Create a business first");

  return deps.requirements.create({
    businessId: business.id,
    title: input.title,
    brief: input.brief,
    budget: input.budget ?? null,
    deadline: input.deadline ?? null,
  });
}

export async function listOpenRequirements(
  deps: Pick<BusinessCollabDeps, "requirements">,
): Promise<readonly RequirementView[]> {
  return deps.requirements.listOpen(BOARD_PAGE_SIZE);
}

export async function listMyRequirements(
  deps: Pick<BusinessCollabDeps, "businesses" | "requirements">,
  userId: string,
): Promise<readonly RequirementView[]> {
  const business = await deps.businesses.findByUser(userId);
  if (!business) return [];
  return deps.requirements.listByBusiness(business.id);
}

/** Door one: a creator approaches a posted requirement. */
export async function approachRequirement(
  deps: BusinessCollabDeps,
  userId: string,
  input: ApproachRequirementInput,
): Promise<string> {
  const profiles = await deps.profiles.listAccessibleByUser(userId);
  if (!profiles.some((profile) => profile.id === input.profileId)) {
    throw new ForbiddenError("You can only approach with your own profile");
  }
  const target = await deps.requirements.findApproachTarget(input.requirementId);
  if (!target) throw new NotFoundError("Requirement not found");
  // Brief 12 edge: approaching a just-closed requirement fails honestly.
  if (target.closed) throw new ConflictError("This requirement has closed");
  const businessId = target.businessId;

  // One thread per (business, profile, requirement) — a double-fired approach
  // lands in the existing thread instead of opening a duplicate.
  const existing = await deps.collabs.findMatch(businessId, input.profileId, input.requirementId);
  if (existing) {
    await deps.collabs.addMessage(existing, userId, input.message);
    return existing;
  }
  return deps.collabs.create({
    businessId,
    profileId: input.profileId,
    requirementId: input.requirementId,
    firstMessage: { senderUserId: userId, body: input.message },
  });
}

/** Door two: a business reaches out to a creator directly. */
export async function requestCollab(
  deps: BusinessCollabDeps,
  userId: string,
  input: RequestCollabInput,
): Promise<string> {
  const business = await deps.businesses.findByUser(userId);
  if (!business) throw new ForbiddenError("Create a business first");
  if (!(await deps.profiles.exists(input.profileId))) {
    throw new NotFoundError("Profile not found");
  }

  const existing = await deps.collabs.findMatch(business.id, input.profileId, null);
  if (existing) {
    await deps.collabs.addMessage(existing, userId, input.message);
    return existing;
  }
  return deps.collabs.create({
    businessId: business.id,
    profileId: input.profileId,
    requirementId: null,
    firstMessage: { senderUserId: userId, body: input.message },
  });
}

export async function sendCollabMessage(
  deps: BusinessCollabDeps,
  userId: string,
  collabId: string,
  input: CollabMessageInput,
): Promise<void> {
  // Non-participants get NotFound, not Forbidden — don't reveal the thread exists.
  if (!(await resolveSide(deps, userId, collabId))) {
    throw new NotFoundError("Collab not found");
  }
  await deps.collabs.addMessage(collabId, userId, input.body);
}

/** Propose terms (brief 12): either side; the latest proposal is the live
 * one and RESETS both agreements — Agreed always means agreed to these. */
export async function proposeCollabTerms(
  deps: BusinessCollabDeps,
  userId: string,
  collabId: string,
  input: ProposeTermsInput,
): Promise<void> {
  if (!(await resolveSide(deps, userId, collabId))) {
    throw new NotFoundError("Collab not found");
  }
  await deps.collabs.setTerms(collabId, {
    content: input.content,
    price: input.price ?? null,
    deadline: input.deadline ?? null,
  });
}

/** Close a requirement (brief 11): off the board; threads persist. */
export async function closeRequirement(
  deps: Pick<BusinessCollabDeps, "businesses" | "requirements">,
  userId: string,
  requirementId: string,
): Promise<void> {
  const business = await deps.businesses.findByUser(userId);
  if (!business) throw new ForbiddenError("Create a business first");
  const target = await deps.requirements.findApproachTarget(requirementId);
  if (!target || target.businessId !== business.id) {
    throw new NotFoundError("Requirement not found");
  }
  await deps.requirements.close(requirementId);
}

/** Accept the terms for the caller's side; agreed once both sides have. */
export async function agreeCollab(
  deps: BusinessCollabDeps,
  userId: string,
  collabId: string,
): Promise<void> {
  const access = await resolveSide(deps, userId, collabId);
  if (!access) throw new NotFoundError("Collab not found");
  await deps.collabs.setAgreed(collabId, access.side, deps.now());
}

export async function getCollabThread(
  deps: BusinessCollabDeps,
  userId: string,
  collabId: string,
): Promise<{ thread: CollabThread; side: "business" | "creator" }> {
  const access = await resolveSide(deps, userId, collabId);
  if (!access) throw new NotFoundError("Collab not found");
  const thread = await deps.collabs.findThread(collabId);
  if (!thread) throw new NotFoundError("Collab not found");
  return { thread, side: access.side };
}

export async function listMyBusinessCollabs(
  deps: Pick<BusinessCollabDeps, "businesses" | "collabs">,
  userId: string,
): Promise<readonly CollabSummary[]> {
  const business = await deps.businesses.findByUser(userId);
  if (!business) return [];
  return deps.collabs.listByBusiness(business.id);
}

export async function listMyCreatorCollabs(
  deps: Pick<BusinessCollabDeps, "profiles" | "collabs">,
  userId: string,
): Promise<readonly CollabSummary[]> {
  const profiles = await deps.profiles.listAccessibleByUser(userId);
  if (profiles.length === 0) return [];
  return deps.collabs.listByProfiles(profiles.map((profile) => profile.id));
}

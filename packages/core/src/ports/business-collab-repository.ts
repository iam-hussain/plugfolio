/**
 * Ports for the business side (lean journey): a business, its posted
 * requirements, and collab threads. Prisma implementations in `@plugfolio/db`.
 */

export type Business = {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly description: string;
  readonly logoUrl: string | null;
};

export type BusinessRepository = {
  create(business: {
    userId: string;
    name: string;
    description: string;
    logoUrl: string | null;
  }): Promise<Business>;
  findByUser(userId: string): Promise<Business | null>;
};

export type RequirementView = {
  readonly id: string;
  readonly businessName: string;
  readonly title: string;
  readonly brief: string;
  readonly budget: string | null;
  readonly deadline: Date | null;
  readonly createdAt: Date;
};

export type RequirementRepository = {
  create(requirement: {
    businessId: string;
    title: string;
    brief: string;
    budget: string | null;
    deadline: Date | null;
  }): Promise<RequirementView>;
  /** The open board, newest first. */
  listOpen(limit: number): Promise<readonly RequirementView[]>;
  listByBusiness(businessId: string): Promise<readonly RequirementView[]>;
  findBusinessId(requirementId: string): Promise<string | null>;
};

export type CollabSummary = {
  readonly id: string;
  readonly businessName: string;
  readonly username: string;
  readonly requirementTitle: string | null;
  readonly agreed: boolean;
  readonly createdAt: Date;
};

export type CollabMessageView = {
  readonly id: string;
  readonly body: string;
  readonly fromBusiness: boolean;
  readonly createdAt: Date;
};

export type CollabThread = {
  readonly id: string;
  readonly businessId: string;
  readonly profileId: string;
  readonly businessName: string;
  readonly username: string;
  readonly requirementTitle: string | null;
  readonly businessAgreedAt: Date | null;
  readonly creatorAgreedAt: Date | null;
  readonly messages: readonly CollabMessageView[];
};

export type CollabRepository = {
  create(collab: {
    businessId: string;
    profileId: string;
    requirementId: string | null;
    firstMessage: { senderUserId: string; body: string };
  }): Promise<string>;
  /** An existing thread for the same business/profile/requirement, if any. */
  findMatch(
    businessId: string,
    profileId: string,
    requirementId: string | null,
  ): Promise<string | null>;
  findParticipants(collabId: string): Promise<{ businessId: string; profileId: string } | null>;
  findThread(collabId: string): Promise<CollabThread | null>;
  listByBusiness(businessId: string): Promise<readonly CollabSummary[]>;
  listByProfiles(profileIds: readonly string[]): Promise<readonly CollabSummary[]>;
  addMessage(collabId: string, senderUserId: string, body: string): Promise<void>;
  /** Sets the side's agreement timestamp; keeps the first one on retries. */
  setAgreed(collabId: string, side: "business" | "creator", at: Date): Promise<void>;
};

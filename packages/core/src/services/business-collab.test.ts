import { describe, expect, it } from "vitest";
import { ConflictError, ForbiddenError, NotFoundError } from "../errors";
import type {
  Business,
  BusinessRepository,
  CollabRepository,
  CollabThread,
  RequirementRepository,
  RequirementView,
} from "../ports/business-collab-repository";
import type { ProfileRepository } from "../ports/profile-repository";
import {
  agreeCollab,
  approachRequirement,
  closeRequirement,
  createBusiness,
  getCollabThread,
  postRequirement,
  proposeCollabTerms,
  requestCollab,
  sendCollabMessage,
} from "./business-collab";

const BIZ_USER = "10000000-0000-0000-0000-000000000001";
const CREATOR_USER = "10000000-0000-0000-0000-000000000002";
const OUTSIDER = "10000000-0000-0000-0000-000000000003";
const BUSINESS_ID = "20000000-0000-0000-0000-000000000001";
const PROFILE_ID = "30000000-0000-0000-0000-000000000001";
const REQUIREMENT_ID = "40000000-0000-0000-0000-000000000001";

type CollabRow = {
  id: string;
  businessId: string;
  profileId: string;
  requirementId: string | null;
  termsContent: string | null;
  termsPrice: string | null;
  termsDeadline: Date | null;
  businessAgreedAt: Date | null;
  creatorAgreedAt: Date | null;
  messages: { senderUserId: string; body: string }[];
};

function makeDeps(
  options: { withBusiness?: boolean; requirementClosed?: boolean } = { withBusiness: true },
) {
  const business: Business = {
    id: BUSINESS_ID,
    userId: BIZ_USER,
    name: "Verve",
    description: "Bags",
    logoUrl: null,
  };
  const collabRows: CollabRow[] = [];
  let nextId = 1;

  const businesses: BusinessRepository = {
    async create(input) {
      return { ...business, ...input, logoUrl: input.logoUrl };
    },
    async findByUser(userId) {
      return options.withBusiness && userId === BIZ_USER ? business : null;
    },
  };

  let requirementClosed = options.requirementClosed ?? false;
  const requirements: RequirementRepository = {
    async create(input) {
      return {
        id: REQUIREMENT_ID,
        businessName: "Verve",
        title: input.title,
        brief: input.brief,
        budget: input.budget,
        deadline: input.deadline,
        closedAt: null,
        approachCount: 0,
        createdAt: new Date(0),
      } satisfies RequirementView;
    },
    async listOpen() {
      return [];
    },
    async listByBusiness() {
      return [];
    },
    async findApproachTarget(requirementId: string) {
      return requirementId === REQUIREMENT_ID
        ? { businessId: BUSINESS_ID, closed: requirementClosed }
        : null;
    },
    async close() {
      requirementClosed = true;
    },
  };

  const collabs: CollabRepository = {
    async create(input) {
      const id = `collab-${nextId++}`;
      collabRows.push({
        id,
        businessId: input.businessId,
        profileId: input.profileId,
        requirementId: input.requirementId,
        termsContent: null,
        termsPrice: null,
        termsDeadline: null,
        businessAgreedAt: null,
        creatorAgreedAt: null,
        messages: [
          { senderUserId: input.firstMessage.senderUserId, body: input.firstMessage.body },
        ],
      });
      return id;
    },
    async findMatch(businessId, profileId, requirementId) {
      return (
        collabRows.find(
          (row) =>
            row.businessId === businessId &&
            row.profileId === profileId &&
            row.requirementId === requirementId,
        )?.id ?? null
      );
    },
    async findParticipants(collabId) {
      const row = collabRows.find((r) => r.id === collabId);
      return row ? { businessId: row.businessId, profileId: row.profileId } : null;
    },
    async findThread(collabId) {
      const row = collabRows.find((r) => r.id === collabId);
      if (!row) return null;
      return {
        id: row.id,
        businessId: row.businessId,
        profileId: row.profileId,
        businessName: "Verve",
        username: "lena",
        requirementTitle: null,
        termsContent: row.termsContent,
        termsPrice: row.termsPrice,
        termsDeadline: row.termsDeadline,
        businessAgreedAt: row.businessAgreedAt,
        creatorAgreedAt: row.creatorAgreedAt,
        messages: row.messages.map((message, index) => ({
          id: `m-${index}`,
          body: message.body,
          fromBusiness: message.senderUserId === BIZ_USER,
          createdAt: new Date(0),
        })),
      } satisfies CollabThread;
    },
    async listByBusiness() {
      return [];
    },
    async listByProfiles() {
      return [];
    },
    async addMessage(collabId, senderUserId, body) {
      collabRows.find((r) => r.id === collabId)?.messages.push({ senderUserId, body });
    },
    async setAgreed(collabId, side, at) {
      const row = collabRows.find((r) => r.id === collabId);
      if (!row) return;
      if (side === "business") row.businessAgreedAt ??= at;
      else row.creatorAgreedAt ??= at;
    },
    async setTerms(collabId, terms) {
      const row = collabRows.find((r) => r.id === collabId);
      if (!row) return;
      row.termsContent = terms.content;
      row.termsPrice = terms.price;
      row.termsDeadline = terms.deadline;
      row.businessAgreedAt = null;
      row.creatorAgreedAt = null;
    },
  };

  const profiles: ProfileRepository = {
    async listByUser(userId) {
      return userId === CREATOR_USER ? [{ id: PROFILE_ID, username: "lena", displayName: null, avatarUrl: null }] : [];
    },
    async listAccessibleByUser(userId) {
      return userId === CREATOR_USER
        ? [{ id: PROFILE_ID, username: "lena", displayName: null, avatarUrl: null, role: "admin" as const }]
        : [];
    },
    async exists(profileId) {
      return profileId === PROFILE_ID;
    },
    async countByUser() {
      return 1;
    },
    async create() {
      throw new Error("not used");
    },
  };

  return {
    deps: { businesses, requirements, collabs, profiles, now: () => new Date("2026-07-20") },
    collabRows,
  };
}

describe("createBusiness / postRequirement", () => {
  it("rejects a second business for the same user", async () => {
    const { deps } = makeDeps();
    await expect(
      createBusiness(deps, BIZ_USER, { name: "Another", description: "x" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("rejects posting a requirement without a business", async () => {
    const { deps } = makeDeps({ withBusiness: false });
    await expect(
      postRequirement(deps, OUTSIDER, { title: "Reel", brief: "30s reel" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});

describe("the two doors", () => {
  it("door one: a creator approaches a requirement and a thread opens", async () => {
    const { deps, collabRows } = makeDeps();
    const id = await approachRequirement(deps, CREATOR_USER, {
      requirementId: REQUIREMENT_ID,
      profileId: PROFILE_ID,
      message: "I'd love to make this",
    });

    expect(collabRows).toHaveLength(1);
    expect(collabRows[0]!.requirementId).toBe(REQUIREMENT_ID);
    expect(id).toBe(collabRows[0]!.id);
  });

  it("door one: approaching twice lands in the same thread", async () => {
    const { deps, collabRows } = makeDeps();
    const input = { requirementId: REQUIREMENT_ID, profileId: PROFILE_ID, message: "hi" };
    const first = await approachRequirement(deps, CREATOR_USER, input);
    const second = await approachRequirement(deps, CREATOR_USER, input);

    expect(second).toBe(first);
    expect(collabRows).toHaveLength(1);
    expect(collabRows[0]!.messages).toHaveLength(2);
  });

  it("door one: cannot approach with someone else's profile", async () => {
    const { deps } = makeDeps();
    await expect(
      approachRequirement(deps, OUTSIDER, {
        requirementId: REQUIREMENT_ID,
        profileId: PROFILE_ID,
        message: "hi",
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("door two: a business reaches out to a creator", async () => {
    const { deps, collabRows } = makeDeps();
    await requestCollab(deps, BIZ_USER, { profileId: PROFILE_ID, message: "Want to collab?" });

    expect(collabRows).toHaveLength(1);
    expect(collabRows[0]!.requirementId).toBeNull();
  });
});

describe("thread access and agreement", () => {
  async function openThread(deps: ReturnType<typeof makeDeps>["deps"]) {
    return requestCollab(deps, BIZ_USER, { profileId: PROFILE_ID, message: "Want to collab?" });
  }

  it("outsiders get NotFound, not Forbidden — the thread stays invisible", async () => {
    const { deps } = makeDeps();
    const id = await openThread(deps);
    await expect(
      sendCollabMessage(deps, OUTSIDER, id, { body: "let me in" }),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(getCollabThread(deps, OUTSIDER, id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("both participants can message; sides resolve correctly", async () => {
    const { deps } = makeDeps();
    const id = await openThread(deps);
    await sendCollabMessage(deps, CREATOR_USER, id, { body: "Sure — $200 for one reel" });

    const business = await getCollabThread(deps, BIZ_USER, id);
    const creator = await getCollabThread(deps, CREATOR_USER, id);
    expect(business.side).toBe("business");
    expect(creator.side).toBe("creator");
    expect(business.thread.messages).toHaveLength(2);
    expect(business.thread.messages[1]!.fromBusiness).toBe(false);
  });

  it("agreed only when BOTH sides accept; re-agreeing keeps the first timestamp", async () => {
    const { deps, collabRows } = makeDeps();
    const id = await openThread(deps);

    await agreeCollab(deps, BIZ_USER, id);
    expect(collabRows[0]!.businessAgreedAt).not.toBeNull();
    expect(collabRows[0]!.creatorAgreedAt).toBeNull();

    const firstStamp = collabRows[0]!.businessAgreedAt;
    await agreeCollab(deps, BIZ_USER, id);
    expect(collabRows[0]!.businessAgreedAt).toBe(firstStamp);

    await agreeCollab(deps, CREATOR_USER, id);
    expect(collabRows[0]!.creatorAgreedAt).not.toBeNull();
  });
});

describe("terms and requirement close (briefs 11–12)", () => {
  async function openThread(deps: ReturnType<typeof makeDeps>["deps"]) {
    return approachRequirement(deps, CREATOR_USER, {
      requirementId: REQUIREMENT_ID,
      profileId: PROFILE_ID,
      message: "hi",
    });
  }

  it("a new proposal resets BOTH agreements", async () => {
    const { deps, collabRows } = makeDeps();
    const id = await openThread(deps);
    await agreeCollab(deps, BIZ_USER, id);
    await proposeCollabTerms(deps, CREATOR_USER, id, {
      content: "One 30s reel",
      price: "$200",
      deadline: null,
    });
    expect(collabRows[0]!.termsContent).toBe("One 30s reel");
    expect(collabRows[0]!.businessAgreedAt).toBeNull();
    expect(collabRows[0]!.creatorAgreedAt).toBeNull();
  });

  it("outsiders cannot propose — NotFound, not Forbidden", async () => {
    const { deps } = makeDeps();
    const id = await openThread(deps);
    await expect(proposeCollabTerms(deps, OUTSIDER, id, { content: "x" })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("approaching a closed requirement fails honestly", async () => {
    const { deps } = makeDeps({ withBusiness: true, requirementClosed: true });
    await expect(openThread(deps)).rejects.toBeInstanceOf(ConflictError);
  });

  it("only the owning business can close its requirement", async () => {
    const { deps } = makeDeps();
    await expect(closeRequirement(deps, CREATOR_USER, REQUIREMENT_ID)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    await closeRequirement(deps, BIZ_USER, REQUIREMENT_ID);
    await expect(openThread(deps)).rejects.toBeInstanceOf(ConflictError);
  });
});

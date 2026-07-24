import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors";
import type {
  AdminBusinessRepository,
  AdminCollabRepository,
  AdminRequirementRepository,
} from "../ports/admin-repository";
import { fakeAudit } from "../test/fakes";
import { clearBusinessLogo, deleteCollabMessage, removeRequirement } from "./admin-oversight";

function makeDeps() {
  const logos = new Map<string, string | null>([["business-1", "https://cdn/logo.png"]]);
  const requirements = new Map<string, string>([["req-1", "UGC reels for a desk lamp"]]);
  const messages = new Map<string, string>([["msg-1", "Send us your bank details"]]);
  const { audit, recorded } = fakeAudit();
  const businesses: AdminBusinessRepository = {
    async search() {
      return { rows: [], total: 0 };
    },
    async clearLogo(id) {
      if (!logos.has(id)) return "not_found";
      logos.set(id, null);
      return "ok";
    },
  };
  const requirementRepo: AdminRequirementRepository = {
    async search() {
      return { rows: [], total: 0 };
    },
    async delete(id) {
      const title = requirements.get(id);
      if (title === undefined) return "not_found";
      requirements.delete(id);
      return { title };
    },
  };
  const collabs: AdminCollabRepository = {
    async list() {
      return { rows: [], total: 0 };
    },
    async thread() {
      return null;
    },
    async deleteMessage(id) {
      const body = messages.get(id);
      if (body === undefined) return "not_found";
      messages.delete(id);
      return { body };
    },
  };
  return {
    deps: { businesses, requirements: requirementRepo, audit },
    collabDeps: { collabs, audit },
    logos,
    requirements,
    messages,
    recorded,
  };
}

describe("marketplace oversight", () => {
  it("clears a logo and removes a requirement — each audited", async () => {
    const { deps, logos, requirements, recorded } = makeDeps();
    await clearBusinessLogo(deps, "admin-1", "business-1");
    expect(logos.get("business-1")).toBeNull();
    await removeRequirement(deps, "admin-1", "req-1");
    expect(requirements.size).toBe(0);
    expect(recorded.map((r) => r.action)).toEqual(["business.clearLogo", "requirement.delete"]);
    expect(recorded[1]!.detail).toBe("UGC reels for a desk lamp");
  });

  it("deletes one abusive thread message with the body in the audit", async () => {
    const { collabDeps, messages, recorded } = makeDeps();
    await deleteCollabMessage(collabDeps, "admin-1", "msg-1");
    expect(messages.size).toBe(0);
    expect(recorded[0]).toMatchObject({
      action: "collab.deleteMessage",
      detail: "Send us your bank details",
    });
  });

  it("unknown targets are typed NotFoundErrors and record nothing", async () => {
    const { deps, collabDeps, recorded } = makeDeps();
    await expect(clearBusinessLogo(deps, "admin-1", "ghost")).rejects.toBeInstanceOf(NotFoundError);
    await expect(removeRequirement(deps, "admin-1", "ghost")).rejects.toBeInstanceOf(NotFoundError);
    await expect(deleteCollabMessage(collabDeps, "admin-1", "ghost")).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(recorded).toHaveLength(0);
  });
});

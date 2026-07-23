import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors";
import type {
  AdminAuditEntry,
  AdminAuditRepository,
  AdminBusinessRepository,
  AdminRequirementRepository,
} from "../ports/admin-repository";
import { clearBusinessLogo, removeRequirement } from "./admin-oversight";

function makeDeps() {
  const logos = new Map<string, string | null>([["business-1", "https://cdn/logo.png"]]);
  const requirements = new Map<string, string>([["req-1", "UGC reels for a desk lamp"]]);
  const recorded: AdminAuditEntry[] = [];
  const businesses: AdminBusinessRepository = {
    async search() {
      return [];
    },
    async clearLogo(id) {
      if (!logos.has(id)) return "not_found";
      logos.set(id, null);
      return "ok";
    },
  };
  const requirementRepo: AdminRequirementRepository = {
    async search() {
      return [];
    },
    async delete(id) {
      const title = requirements.get(id);
      if (title === undefined) return "not_found";
      requirements.delete(id);
      return { title };
    },
  };
  const audit: AdminAuditRepository = {
    async record(entry) {
      recorded.push(entry);
    },
    async listRecent() {
      return [];
    },
  };
  return {
    deps: { businesses, requirements: requirementRepo, audit },
    logos,
    requirements,
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

  it("unknown targets are typed NotFoundErrors and record nothing", async () => {
    const { deps, recorded } = makeDeps();
    await expect(clearBusinessLogo(deps, "admin-1", "ghost")).rejects.toBeInstanceOf(NotFoundError);
    await expect(removeRequirement(deps, "admin-1", "ghost")).rejects.toBeInstanceOf(NotFoundError);
    expect(recorded).toHaveLength(0);
  });
});

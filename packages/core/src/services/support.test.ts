import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors";
import type { AdminAuditEntry, AdminAuditRepository } from "../ports/admin-repository";
import type {
  AdminSupportRepository,
  NewSupportTicket,
  SupportTicketWriteRepository,
} from "../ports/support-repository";
import {
  createSupportTicket,
  dismissSupportTicket,
  resolveSupportTicket,
} from "./support";

function makeInflowDeps() {
  const created: NewSupportTicket[] = [];
  const support: SupportTicketWriteRepository = {
    async create(ticket) {
      created.push(ticket);
    },
  };
  return { deps: { support }, created };
}

function makeAdminDeps(known = true) {
  const audit: AdminAuditEntry[] = [];
  const statusChanges: string[] = [];
  const support = {
    list: async () => ({ rows: [], total: 0 }),
    setStatus: async (_id: string, status: string) => {
      if (!known) return "not_found" as const;
      statusChanges.push(status);
      return { contactEmail: "reach@example.com", category: "merge_accounts" as const };
    },
  } as unknown as AdminSupportRepository;
  const auditRepo = {
    record: async (entry: AdminAuditEntry) => {
      audit.push(entry);
    },
    listRecent: async () => [],
  } as unknown as AdminAuditRepository;
  return {
    deps: { support, audit: auditRepo, now: () => new Date("2026-07-24") },
    audit,
    statusChanges,
  };
}

describe("support tickets", () => {
  it("labels a signed-in requester by handle, anonymous otherwise", async () => {
    const { deps, created } = makeInflowDeps();
    const input = {
      category: "lost_email_access" as const,
      message: "My old inbox is gone.",
      contactEmail: "new@example.com",
    };
    await createSupportTicket(deps, input, { handle: "maya" });
    await createSupportTicket(deps, input, { handle: null });
    expect(created.map((t) => t.requesterLabel)).toEqual(["@maya", "Anonymous visitor"]);
    expect(created[0]!.contactEmail).toBe("new@example.com");
  });

  it("resolve/dismiss set the status and land in the audit log", async () => {
    const { deps, audit, statusChanges } = makeAdminDeps();
    await resolveSupportTicket(deps, "admin-1", "t-1");
    await dismissSupportTicket(deps, "admin-1", "t-2");
    expect(statusChanges).toEqual(["resolved", "dismissed"]);
    expect(audit.map((entry) => entry.action)).toEqual(["support.resolve", "support.dismiss"]);
    expect(audit[0]!.detail).toContain("merge_accounts");
  });

  it("closing an unknown ticket is a 404, not an audit entry", async () => {
    const { deps, audit } = makeAdminDeps(false);
    await expect(resolveSupportTicket(deps, "admin-1", "nope")).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(audit).toEqual([]);
  });
});

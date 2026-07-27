import { NotFoundError } from "../errors";
import type { AdminAuditRepository } from "../ports/admin-repository";
import type { Page, PageQuery } from "../ports/admin-repository";
import type {
  AdminSupportRepository,
  AdminSupportTicketRow,
  SupportTicketStatus,
  SupportTicketWriteRepository,
} from "../ports/support-repository";
import type { CreateSupportTicketInput } from "../schemas/support";

/**
 * Support requests: the inflow (account-free, like reports — the top issue is
 * "I can't get into my email/account") and the operator queue. Replies go by
 * email to the ticket's contact address; there are no in-app threads in v1.
 */

export type CreateSupportTicketDeps = {
  support: SupportTicketWriteRepository;
};

export async function createSupportTicket(
  deps: CreateSupportTicketDeps,
  input: CreateSupportTicketInput,
  requester: { handle?: string | null },
): Promise<void> {
  await deps.support.create({
    category: input.category,
    message: input.message,
    contactEmail: input.contactEmail,
    requesterLabel: requester.handle ? `@${requester.handle}` : "Anonymous visitor",
  });
}

export type AdminSupportDeps = {
  support: AdminSupportRepository;
  audit: AdminAuditRepository;
  now: () => Date;
};

export async function listSupportTickets(
  deps: Pick<AdminSupportDeps, "support">,
  status: SupportTicketStatus | "all",
  page: PageQuery,
): Promise<Page<AdminSupportTicketRow>> {
  return deps.support.list(status, page);
}

async function closeTicket(
  deps: AdminSupportDeps,
  adminId: string,
  ticketId: string,
  status: "resolved" | "dismissed",
): Promise<void> {
  const closed = await deps.support.setStatus(ticketId, status, deps.now());
  if (closed === "not_found") throw new NotFoundError("No such support ticket");
  await deps.audit.record({
    adminId,
    action: status === "resolved" ? "support.resolve" : "support.dismiss",
    targetType: "support_ticket",
    targetId: ticketId,
    detail: `${closed.category} · ${closed.contactEmail}`,
  });
}

export async function resolveSupportTicket(
  deps: AdminSupportDeps,
  adminId: string,
  ticketId: string,
): Promise<void> {
  await closeTicket(deps, adminId, ticketId, "resolved");
}

export async function dismissSupportTicket(
  deps: AdminSupportDeps,
  adminId: string,
  ticketId: string,
): Promise<void> {
  await closeTicket(deps, adminId, ticketId, "dismissed");
}

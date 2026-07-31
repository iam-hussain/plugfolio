import type { Page, PageQuery } from "./admin-repository";
import type { SupportCategory } from "../schemas/support";

/** Ports for support tickets: the public write half and the admin queue. */

export type SupportTicketStatus = "open" | "resolved" | "dismissed";

export type NewSupportTicket = {
  readonly category: SupportCategory;
  readonly message: string;
  readonly contactEmail: string;
  readonly requesterLabel: string;
};

export type SupportTicketWriteRepository = {
  create(ticket: NewSupportTicket): Promise<void>;
};

export type AdminSupportTicketRow = NewSupportTicket & {
  readonly id: string;
  readonly status: SupportTicketStatus;
  readonly createdAt: Date;
};

export type AdminSupportRepository = {
  /** Open queue is oldest-first (triage order); others newest-first. */
  list(status: SupportTicketStatus | "all", page: PageQuery): Promise<Page<AdminSupportTicketRow>>;
  setStatus(
    ticketId: string,
    status: SupportTicketStatus,
    at: Date,
  ): Promise<{ contactEmail: string; category: SupportCategory } | "not_found">;
};

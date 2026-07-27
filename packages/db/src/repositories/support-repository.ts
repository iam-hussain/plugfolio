import type {
  AdminSupportRepository,
  AdminSupportTicketRow,
  NewSupportTicket,
  Page,
  PageQuery,
  SupportCategory,
  SupportTicketStatus,
  SupportTicketWriteRepository,
} from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/** Support tickets: the public write half and the admin queue (Prisma impls). */

export function createSupportTicketWriteRepository(
  db: PrismaClient = prisma,
): SupportTicketWriteRepository {
  return {
    async create(ticket: NewSupportTicket): Promise<void> {
      await db.supportTicket.create({ data: ticket });
    },
  };
}

const rowSelect = {
  id: true,
  category: true,
  message: true,
  contactEmail: true,
  requesterLabel: true,
  status: true,
  createdAt: true,
} as const;

export function createAdminSupportRepository(db: PrismaClient = prisma): AdminSupportRepository {
  return {
    async list(
      status: SupportTicketStatus | "all",
      page: PageQuery,
    ): Promise<Page<AdminSupportTicketRow>> {
      const where = status === "all" ? {} : { status };
      const [rows, total] = await Promise.all([
        db.supportTicket.findMany({
          where,
          // Open queue is oldest-first (triage order); others newest-first.
          orderBy: { createdAt: status === "open" ? "asc" : "desc" },
          skip: (page.page - 1) * page.pageSize,
          take: page.pageSize,
          select: rowSelect,
        }),
        db.supportTicket.count({ where }),
      ]);
      return {
        rows: rows.map((row) => ({
          ...row,
          category: row.category as SupportCategory,
          status: row.status as SupportTicketStatus,
        })),
        total,
      };
    },

    async setStatus(ticketId: string, status: SupportTicketStatus, at: Date) {
      const updated = await db.supportTicket.updateMany({
        where: { id: ticketId },
        data: { status, resolvedAt: status === "open" ? null : at },
      });
      if (updated.count === 0) return "not_found";
      const row = await db.supportTicket.findUnique({
        where: { id: ticketId },
        select: { contactEmail: true, category: true },
      });
      return row
        ? { contactEmail: row.contactEmail, category: row.category as SupportCategory }
        : "not_found";
    },
  };
}

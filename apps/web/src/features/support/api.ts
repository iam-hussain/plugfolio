import type { CreateSupportTicketInput } from "@plugfolio/core";
import { apiPost } from "@/lib/api-client";

/** Client call for the support inflow (§5) — same Zod contract as the API. */
export const submitSupportTicket = (input: CreateSupportTicketInput): Promise<void> =>
  apiPost("/api/support", input);

import type { CreateSupportTicketInput } from "@plugfolio/core";

/** Client call for the support inflow (§5) — same Zod contract as the API. */
export async function submitSupportTicket(input: CreateSupportTicketInput): Promise<void> {
  const response = await fetch("/api/support", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    credentials: "same-origin",
  });
  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(problem?.error?.message ?? "Request failed");
  }
}

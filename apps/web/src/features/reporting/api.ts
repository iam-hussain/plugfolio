import type { CreateReportInput } from "@plugfolio/core";

/** Client call for the report inflow — account-free, same as shopping. */
export async function submitReport(input: CreateReportInput): Promise<void> {
  const response = await fetch("/api/reports", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    credentials: "same-origin",
  });
  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(problem?.error?.message ?? "Could not send the report");
  }
}

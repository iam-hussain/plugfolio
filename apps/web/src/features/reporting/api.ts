import type { CreateReportInput } from "@plugfolio/core";
import { apiPost } from "@/lib/api-client";

/** Client call for the report inflow — account-free, same as shopping. */
export const submitReport = (input: CreateReportInput): Promise<void> =>
  apiPost("/api/reports", input, { fallbackMessage: "Could not send the report" });

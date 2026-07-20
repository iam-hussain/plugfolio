import type {
  ApproachRequirementInput,
  CollabMessageInput,
  CreateBusinessInput,
  PostRequirementInput,
  RequestCollabInput,
} from "@plugfolio/core";

/**
 * Client calls for the business-collab feature (§5). Contracts are the same
 * Zod-inferred types the routes validate, so client and server can't drift.
 */

async function post(path: string, body?: unknown): Promise<void> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  });
  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(problem?.error?.message ?? "Request failed");
  }
}

export const createBusiness = (input: CreateBusinessInput) => post("/api/businesses", input);
export const postRequirement = (input: PostRequirementInput) => post("/api/requirements", input);
export const approachRequirement = (input: ApproachRequirementInput) =>
  post("/api/collabs/approach", input);
export const requestCollab = (input: RequestCollabInput) => post("/api/collabs/request", input);
export const sendCollabMessage = (collabId: string, input: CollabMessageInput) =>
  post(`/api/collabs/${collabId}/messages`, input);
export const agreeCollab = (collabId: string) => post(`/api/collabs/${collabId}/agree`);

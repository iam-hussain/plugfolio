import { z } from "zod";

/**
 * The /following query boundary — search, sort and page arrive as URL params,
 * so they're parsed like any other untrusted input (§6.4). Every field has a
 * default, which makes a bare /following valid without a special case.
 */
export const followSort = z.enum(["new", "recent", "oldest", "az"]);
export type FollowSort = z.infer<typeof followSort>;

export const followingQuery = z.object({
  /** Searches only the people you already follow — never everyone. */
  q: z.string().trim().max(80).optional(),
  sort: followSort.catch("new").default("new"),
  page: z.coerce.number().int().min(1).catch(1).default(1),
});

export type FollowingQuery = z.infer<typeof followingQuery>;
